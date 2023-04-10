import twilio from "twilio";
import config from "config";

const { TWILIO_SID, TWILIO_TOKEN, TWILIO_NUMBER } = config.get("SEND_SMS");

const accountSid = TWILIO_SID;
const authToken = TWILIO_TOKEN;

const client = new twilio(accountSid, authToken);
export default async function sendSMS(smsData) {
  try {
    await client.messages.create({
      body: smsData.body,
      to: smsData.phone,
      from: TWILIO_NUMBER,
    });
  } catch (err) {
    console.error(err);
  }
}

