import json
import boto3

dynamodb = boto3.resource(
    "dynamodb",
    region_name="ap-south-1"
)

config_table = dynamodb.Table("RestaurantConfig")
reservation_table = dynamodb.Table("Reservations")
table_table = dynamodb.Table("Tables")


def lambda_handler(event, context):

    try:

        if "body" in event:
            body = json.loads(event["body"])
        else:
            body = event

        action = body.get("action")

        print("ACTION:", action)

        if action == "GET_DASHBOARD":
            return get_dashboard()

        elif action == "GET_TABLES":
            return get_tables()

        elif action == "GET_RESERVATIONS":
            return get_reservations()

        elif action == "GET_SETTINGS":
            return get_settings()

        elif action == "UPDATE_RESTAURANT_STATUS":
            return update_restaurant_status(body)
        
        return response(
            400,
            {
                "message": "Invalid action"
            }
        )

    except Exception as e:

        print(str(e))

        return response(
            500,
            {
                "message": "Internal Server Error",
                "error": str(e)
            }
        )


def get_dashboard():

    today = get_today()

    # Restaurant Configuration

    config = config_table.get_item(
        Key={
            "restaurantId": "ABC"
        }
    )["Item"]

    # Today's Reservations

    reservations = reservation_table.scan()["Items"]

    today_bookings = []

    occupied_tables = set()

    next_booking = None

    current_time = datetime.now().strftime("%H:%M")

    for booking in reservations:

        if booking["reservationDate"] != today:
            continue

        if booking["status"] != "CONFIRMED":
            continue

        today_bookings.append(booking)

        occupied_tables.update(
            booking["tablesAllocated"]
        )

        if booking["slot"] >= current_time:

            if (
                next_booking is None
                or
                booking["slot"] < next_booking["slot"]
            ):
                next_booking = booking

    all_tables = table_table.scan()["Items"]

    total_tables = len(all_tables)

    return response(
        200,
        {
            "restaurant": {
                "isOpen": config["isOpen"],
                "openingTime": config["openingTime"],
                "closingTime": config["closingTime"]
            },

            "summary": {

                "todayReservations":
                    len(today_bookings),

                "occupiedTables":
                    len(occupied_tables),

                "availableTables":
                    total_tables - len(occupied_tables)
            },

            "nextReservation":
                None if next_booking is None else {

                    "bookingId": next_booking["bookingId"],

                    "customerName": next_booking["customerName"],

                    "mobile": next_booking["mobile"],

                    "slot": next_booking["slot"],

                    "endSlot": next_booking["endSlot"],

                    "persons": int(next_booking["persons"]),

                    "tablesAllocated": next_booking["tablesAllocated"]

                }
        }
    )


def get_tables():

    today = get_today()

    config = config_table.get_item(
        Key={
            "restaurantId": "ABC"
        }
    )["Item"]

    opening = config["openingTime"]
    closing = config["closingTime"]

    tables = table_table.scan()["Items"]

    reservations = reservation_table.scan()["Items"]

    result = []

    for table in sorted(
        tables,
        key=lambda x: x["tableId"]
    ):

        table_reservations = []

        for booking in reservations:

            if booking["reservationDate"] != today:
                continue

            if booking["status"] != "CONFIRMED":
                continue

            if table["tableId"] not in booking["tablesAllocated"]:
                continue

            table_reservations.append({

                "start": booking["slot"],

                "end": booking["endSlot"],

                "customerName": booking["customerName"],

                "bookingId": booking["bookingId"][-3:]
            })

        table_reservations.sort(
            key=lambda x: x["start"]
        )

        timeline = []

        current = opening

        for booking in table_reservations:

            if current < booking["start"]:

                timeline.append({

                    "start": current,

                    "end": booking["start"],

                    "status": "AVAILABLE"

                })

            timeline.append({

                "start": booking["start"],

                "end": booking["end"],

                "status": "RESERVED",

                "customerName": booking["customerName"],

                "bookingId": booking["bookingId"]
            })

            current = booking["end"]

        if current < closing:

            timeline.append({

                "start": current,

                "end": closing,

                "status": "AVAILABLE"

            })

        result.append({

            "tableId": table["tableId"],

            "tableType": table["tableType"],

            "capacity": int(table["capacity"]),

            "idealFor": int(table["idealFor"]),

            "timeline": timeline

        })

    return response(
        200,
        result
    )

def get_reservations():

    today = get_today()

    reservations = reservation_table.scan()["Items"]

    result = []

    for booking in reservations:

        if booking["reservationDate"] != today:
            continue

        reservation = {

            "bookingId": booking["bookingId"],

            "customerName": booking["customerName"],

            "mobile": booking["mobile"],

            "reservationDate": booking["reservationDate"],

            "slot": booking["slot"],

            "endSlot": booking["endSlot"],

            "persons": int(booking["persons"]),

            "tablesAllocated": booking["tablesAllocated"],

            "status": booking["status"]

        }

        result.append(reservation)

    result.sort(
        key=lambda x: x["slot"]
    )

    return response(
        200,
        result
    )


def get_settings():

    config = config_table.get_item(
        Key={
            "restaurantId": "ABC"
        }
    )["Item"]

    tables = table_table.scan()["Items"]

    table_summary = {}

    for table in tables:

        table_type = table["tableType"]

        if table_type not in table_summary:

            table_summary[table_type] = {
                "count": 0,
                "capacity": int(table["capacity"]),
                "idealFor": int(table["idealFor"])
            }

        table_summary[table_type]["count"] += 1

    return response(
        200,
        {
            "restaurant": {

                "restaurantId": config["restaurantId"],

                "cityCode": config["cityCode"],

                "isOpen": config["isOpen"],

                "openingTime": config["openingTime"],

                "closingTime": config["closingTime"],

                "slotDuration": int(config["slotDuration"])
            },

            "tableConfiguration": table_summary
        }
    )


def update_restaurant_status(body):

    config_table.update_item(

        Key={
            "restaurantId": "ABC"
        },

        UpdateExpression="""
            SET isOpen = :o
        """,

        ExpressionAttributeValues={

            ":o": body["isOpen"]

        }

    )

    return response(
        200,
        {
            "message": "Restaurant status updated."
        }
    )


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


from datetime import datetime

def get_today():

    return datetime.now().strftime("%Y-%m-%d")