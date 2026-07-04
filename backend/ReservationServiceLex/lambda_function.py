import json
import boto3
from datetime import datetime, timedelta

dynamodb = boto3.resource(
    'dynamodb',
    region_name='ap-south-1'
)

config_table = dynamodb.Table('RestaurantConfig')
reservations_table = dynamodb.Table('Reservations')
tables_table = dynamodb.Table('Tables')
sequence_table = dynamodb.Table('BookingSequence')


def lambda_handler(event, context):

    try:

        # -------- Lex --------

        if "sessionState" in event:
            return handle_lex_request(event)

        # -------- API Gateway --------

        if "body" in event:

            if isinstance(event["body"], str):
                body = json.loads(event["body"])
            else:
                body = event["body"]

        else:

            body = event

        action = body.get("action")

        if not action:
            return response(400, "Action is required")

        config = get_restaurant_config()

        if not config["isOpen"] and action == "BOOK":

            return response(
                200,
                "Restaurant is closed today. No reservations are being accepted."
            )

        if action == "BOOK":
            return book_reservation(body)

        elif action == "CANCEL":
            return cancel_reservation(body)

        elif action == "RESCHEDULE":
            return reschedule_reservation(body)

        elif action == "GET_STATUS":

            return response(
                200,
                {
                    "restaurantOpen": config["isOpen"]
                }
            )

        return response(400, "Invalid action")

    except Exception as e:

        print(str(e))

        return response(
            500,
            str(e)
        )


def get_restaurant_config():

    result = config_table.get_item(
        Key={
            "restaurantId": "ABC"
        }
    )

    return result["Item"]


def handle_lex_request(event):

    intent_name = event["sessionState"]["intent"]["name"]

    if intent_name == "BookReservationIntent":
        return lex_book_reservation(event)

    elif intent_name == "CancelReservationIntent":
        return lex_cancel_reservation(event)

    elif intent_name == "RescheduleReservationIntent":
        return lex_reschedule_reservation(event)

    elif intent_name == "RestaurantStatusIntent":
        return lex_restaurant_status(event)

    elif intent_name == "WelcomeIntent":
        return lex_welcome(event)

    elif intent_name == "GoodbyeIntent":
        return lex_goodbye(event)

    return close_lex(
        intent_name,
        "Failed",
        """Sorry, I didn't understand that.

        You can:
        - Book a table
        - Cancel a reservation
        - Reschedule a reservation
        - Check today's availability"""
    )


def close_lex(intent_name, state, message):

    return {
        "sessionState": {
            "dialogAction": {
                "type": "Close"
            },
            "intent": {
                "name": intent_name,
                "state": state
            }
        },
        "messages": [
            {
                "contentType": "PlainText",
                "content": message
            }
        ]
    }


def elicit_slot(intent_name, slots, slot_name, message):

    return {
        "sessionState": {
            "dialogAction": {
                "type": "ElicitSlot",
                "slotToElicit": slot_name
            },
            "intent": {
                "name": intent_name,
                "slots": slots,
                "state": "InProgress"
            }
        },
        "messages": [
            {
                "contentType": "PlainText",
                "content": message
            }
        ]
    }


def lex_book_reservation(event):

    try:

        slots = event["sessionState"]["intent"]["slots"]

        booking_event = {
            "action": "BOOK",
            "slot": slots["ReservationTime"]["value"]["interpretedValue"],
            "persons": slots["persons"]["value"]["interpretedValue"],
            "customerName": slots["customerName"]["value"]["interpretedValue"],
            "mobile": slots["mobileNumber"]["value"]["interpretedValue"]
        }

        result = book_reservation(booking_event)

        body = json.loads(result["body"])

        if result["statusCode"] != 200:

            return elicit_slot(
                "BookReservationIntent",
                slots,
                "ReservationTime",
                str(body)
            )

        return close_lex(
            "BookReservationIntent",
            "Fulfilled",
            f"""Reservation confirmed.

            Booking ID: {body['bookingId']}

            Reservation Time: {body['slot']}

            Table(s): {', '.join(body['tablesAllocated'])}

            Thank you for choosing ABC Pizzeria.

            Anything else I can help you with?"""
        )

    except Exception as e:

        return close_lex(
            "BookReservationIntent",
            "Failed",
            str(e)
        )


def lex_cancel_reservation(event):
    try:
        slots = event["sessionState"]["intent"]["slots"]

        last3 = str(
            slots["last3Digits"]["value"]["interpretedValue"]
        ).zfill(3)

        cancel_event = {
            "action": "CANCEL",
            "last3": last3
        }

        result = cancel_reservation(cancel_event)

        body = json.loads(result["body"])

        if result["statusCode"] != 200:
            return close_lex(
                "CancelReservationIntent",
                "Failed",
                str(body)
            )

        return close_lex(
            "CancelReservationIntent",
            "Fulfilled",
            f"Your Reservation with booking ID {body['bookingId']} has been cancelled successfully. Anything else I can help you with?"
        )
    
    except Exception as e:

        return close_lex(
            "CancelReservationIntent",
            "Failed",
            "Sorry, something went wrong while cancelling your reservation."
        )


def lex_reschedule_reservation(event):

    try:

        slots = event["sessionState"]["intent"]["slots"]

        last3 = str(
            slots["last3Digits"]["value"]["interpretedValue"]
        ).zfill(3)

        new_time = slots["newTime"]["value"]["interpretedValue"]

        result = reschedule_reservation(
            {
                "action": "RESCHEDULE",
                "last3": last3,
                "newSlot": new_time
            }
        )

        body = json.loads(result["body"])

        if result["statusCode"] != 200:

            return elicit_slot(
                "RescheduleReservationIntent",
                slots,
                "newTime",
                str(body)
            )

        return close_lex(
            "RescheduleReservationIntent",
            "Fulfilled",
            f"""Reservation rescheduled successfully.
                
                Booking ID: {body['bookingId']}

                New reservation time: {body['newSlot']}

                Allocated Table(s): {', '.join(body['tablesAllocated'])}

                Anything else I can help you with?"""
        )

    except Exception as e:

        print("RESCHEDULE ERROR")
        print(str(e))

        return close_lex(
            "RescheduleReservationIntent",
            "Failed",
            "Sorry, something went wrong while rescheduling your reservation."
        )


def lex_restaurant_status(event):
    try:
        config = get_restaurant_config()

        if config["isOpen"]:

            msg = (
                "Yes, ABC Pizzeria is accepting reservations today.\n\n"
                "Our timings are 6 PM to 11 PM.\n\n"
                "Anything else I can help you with?"
            )

        else:

            msg = (
                "Sorry, ABC Pizzeria is closed today and we are not accepting reservations."
            )

        return close_lex(
            "RestaurantStatusIntent",
            "Fulfilled",
            msg
        )

    except Exception as e:
        return close_lex(
           "RestaurantStatusIntent",
            "Failed",
            "Sorry, I couldn't fetch restaurant status right now."
        )


def lex_welcome(event):

    return close_lex(
        "WelcomeIntent",
        "Fulfilled",
        """Welcome to ABC Pizzeria 🍕

        I can help you with:

        - Book a table
        - Cancel a reservation
        - Reschedule a reservation
        - Check restaurant availability

        How may I assist you today?"""
    )


def lex_goodbye(event):

    return close_lex(
        "GoodbyeIntent",
        "Fulfilled",
        "Thank you for choosing ABC Pizzeria. Have a great day!"
    )


def generate_booking_id():

    config = get_restaurant_config()

    restaurant_id = config["restaurantId"]

    today = datetime.now().strftime("%Y%m%d")

    result = sequence_table.get_item(
        Key={
            "sequenceDate": today
        }
    )

    if "Item" not in result:

        sequence_table.put_item(
            Item={
                "sequenceDate": today,
                "counter": 1
            }
        )

        current_counter = 1

    else:

        current_counter = int(result["Item"]["counter"]) + 1

        sequence_table.update_item(
            Key={
                "sequenceDate": today
            },
            UpdateExpression="SET #ctr = :c",
            ExpressionAttributeNames={
                "#ctr": "counter"
            },
            ExpressionAttributeValues={
                ":c": current_counter
            }
        )

    return f"{restaurant_id}{today}{current_counter:03d}"


def get_today_date():

    return datetime.now().strftime("%Y-%m-%d")


def find_booking_by_last3(last3):

    reservation_date = get_today_date()

    result = reservations_table.scan()

    for booking in result["Items"]:

        if booking["reservationDate"] != reservation_date:
            continue

        booking_id = booking["bookingId"]

        if booking_id[-3:] == last3:
            return booking

    return None


def get_end_time(slot):

    slot_time = datetime.strptime(slot, "%H:%M")

    end_time = slot_time + timedelta(minutes=60)

    return end_time.strftime("%H:%M")


def time_to_minutes(time_str):

    t = datetime.strptime(time_str, "%H:%M")

    return t.hour * 60 + t.minute


def validate_reservation_time(slot):

    config = get_restaurant_config()

    booking_time = time_to_minutes(slot)

    opening_time = time_to_minutes(config["openingTime"])

    closing_time = time_to_minutes(config["closingTime"])

    # Reservation lasts 60 minutes
    if booking_time < opening_time:
        return False, (
            f"Sorry, we open at {config['openingTime']}. "
            "Please choose a later time."
        )

    if booking_time + 60 > closing_time:
        return False, (
            "Sorry, reservations cannot extend beyond closing time. "
            f"Our last reservation can start at "
            f"{(datetime.strptime(config['closingTime'], '%H:%M') - timedelta(hours=1)).strftime('%H:%M')}."
        )

    return True, ""


def get_occupied_tables(slot, ignore_booking_id=None):

    reservation_date = get_today_date()

    requested_start = time_to_minutes(slot)

    requested_end = requested_start + 60

    occupied_tables = []

    result = reservations_table.scan()

    bookings = result.get("Items", [])

    for booking in bookings:
        if booking["bookingId"] == ignore_booking_id:
            continue

        if booking["status"] != "CONFIRMED":
            continue

        if booking["reservationDate"] != reservation_date:
            continue

        existing_start = time_to_minutes(
            booking["slot"]
        )

        existing_end = time_to_minutes(
            booking["endSlot"]
        )

        overlap = (
            requested_start < existing_end
            and
            requested_end > existing_start
        )

        if overlap:

            occupied_tables.extend(
                booking["tablesAllocated"]
            )

    return list(set(occupied_tables))


def get_available_tables(slot, ignore_booking_id=None):

    occupied = get_occupied_tables(
        slot,
        ignore_booking_id
    )

    all_tables = tables_table.scan()["Items"]

    free_tables = []

    for table in all_tables:

        if table["tableId"] not in occupied:
            free_tables.append(table)

    return free_tables
    

def allocate_tables(persons, free_tables):

    t2_tables = []
    t4_tables = []

    for table in free_tables:

        if table["tableType"] == "T2":
            t2_tables.append(table["tableId"])

        elif table["tableType"] == "T4":
            t4_tables.append(table["tableId"])

    t2_tables.sort()
    t4_tables.sort()

    allocated = []

    remaining = persons

    while remaining > 0:

        if remaining <= 3:

            if len(t2_tables) > 0:
                allocated.append(t2_tables.pop(0))
                remaining -= 3

            elif len(t4_tables) > 0:
                allocated.append(t4_tables.pop(0))
                remaining -= 6

            else:
                return None

        else:

            if len(t4_tables) > 0:
                allocated.append(t4_tables.pop(0))
                remaining -= 6

            elif len(t2_tables) > 0:
                allocated.append(t2_tables.pop(0))
                remaining -= 3

            else:
                return None

    return allocated


def book_reservation(event):

    slot = event.get("slot")

    valid, message = validate_reservation_time(slot)

    if not valid:
        return response(400, message)

    persons = int(event.get("persons", 0))
    customer_name = event.get("customerName")
    mobile = event.get("mobile")

    if not slot:
        return response(400, "Slot required")

    if persons <= 0:
        return response(400, "Invalid persons")

    free_tables = get_available_tables(slot)

    allocated_tables = allocate_tables(
        persons,
        free_tables
    )

    if not allocated_tables:

        return response(
            200,
            "No tables available for requested slot"
        )

    booking_id = generate_booking_id()

    reservation_date = get_today_date()

    end_time = get_end_time(slot)

    reservation_item = {
        "bookingId": booking_id,
        "reservationDate": reservation_date,
        "slot": slot,
        "endSlot": end_time,
        "persons": persons,
        "customerName": customer_name,
        "mobile": mobile,
        "tablesAllocated": allocated_tables,
        "status": "CONFIRMED"
    }

    reservations_table.put_item(
        Item=reservation_item
    )

    return response(
        200,
        {
            "bookingId": booking_id,
            "reservationDate": reservation_date,
            "slot": slot,
            "endSlot": end_time,
            "tablesAllocated": allocated_tables,
            "message": "Reservation Confirmed"
        }
    )


def cancel_reservation(event):

    last3 = event.get("last3")

    if not last3:
        return response(
            400,
            "Booking ID last 3 digits required"
        )

    booking = find_booking_by_last3(last3)

    if not booking:

        return response(
            404,
            "Booking not found"
        )

    reservations_table.update_item(
        Key={
            "bookingId": booking["bookingId"]
        },
        UpdateExpression="SET #s = :v",
        ExpressionAttributeNames={
            "#s": "status"
        },
        ExpressionAttributeValues={
            ":v": "CANCELLED"
        }
    )

    return response(
        200,
        {
            "bookingId": booking["bookingId"],
            "message": "Reservation Cancelled"
        }
    )


def reschedule_reservation(event):

    last3 = event.get("last3")

    new_slot = event.get("newSlot")

    valid, message = validate_reservation_time(new_slot)

    if not valid:
        return response(400, message)

    if not last3:
        return response(400, "Last 3 digits required")

    if not new_slot:
        return response(400, "New slot required")

    booking = find_booking_by_last3(last3)

    if not booking:

        return response(
            404,
            "Booking not found"
        )

    free_tables = get_available_tables(new_slot, booking["bookingId"])

    allocated_tables = allocate_tables(
        booking["persons"],
        free_tables
    )

    if not allocated_tables:

        return response(
            200,
            "No availability at requested time"
        )

    end_time = get_end_time(new_slot)

    reservations_table.update_item(
        Key={
            "bookingId": booking["bookingId"]
        },
        UpdateExpression=
            "SET slot=:s, endSlot=:e, tablesAllocated=:t",
        ExpressionAttributeValues={
            ":s": new_slot,
            ":e": end_time,
            ":t": allocated_tables
        }
    )

    return response(
        200,
        {
            "bookingId": booking["bookingId"],
            "newSlot": new_slot,
            "tablesAllocated": allocated_tables,
            "message": "Reservation Rescheduled"
        }
    )


import json

def response(status, body):

    return {
        "statusCode": status,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Methods": "*"
        },
        "body": json.dumps(body)
    }