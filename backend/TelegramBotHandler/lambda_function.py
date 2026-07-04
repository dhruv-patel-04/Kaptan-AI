import json
import os
import boto3
import urllib.request
import urllib.parse

TELEGRAM_TOKEN = os.environ["TELEGRAM_TOKEN"]
BOT_ID = os.environ["LEX_BOT_ID"]
BOT_ALIAS_ID = os.environ["LEX_ALIAS_ID"]
LOCALE_ID = os.environ["LEX_LOCALE_ID"]

lex_client = boto3.client(
    "lexv2-runtime",
    region_name="ap-southeast-1"
)


def send_message(chat_id, text):

    url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage"

    data = urllib.parse.urlencode({
        "chat_id": chat_id,
        "text": text
    }).encode()

    req = urllib.request.Request(url, data=data)

    urllib.request.urlopen(req)


def lambda_handler(event, context):

    try:

        body = json.loads(event["body"])

        if "message" not in body:
            return {
                "statusCode": 200,
                "body": "OK"
            }

        message = body["message"].get("text")

        if not message:
            return {
                "statusCode": 200,
                "body": "OK"
            }

        chat_id = body["message"]["chat"]["id"]

        response = lex_client.recognize_text(
            botId=BOT_ID,
            botAliasId=BOT_ALIAS_ID,
            localeId=LOCALE_ID,
            sessionId=str(chat_id),
            text=message
        )

        state = response["sessionState"]["intent"]["state"]

        if "messages" in response:
            reply = response["messages"][-1]["content"]
        else:
            reply = "Sorry, I didn't understand that."

        send_message(chat_id, reply)

        if state in ["Fulfilled", "Failed"]:

            lex_client.delete_session(
                botId=BOT_ID,
                botAliasId=BOT_ALIAS_ID,
                localeId=LOCALE_ID,
                sessionId=str(chat_id)
            )

        return {
            "statusCode": 200,
            "body": "OK"
        }

    except Exception as e:

        print(str(e))

        return {
            "statusCode": 500,
            "body": str(e)
        }