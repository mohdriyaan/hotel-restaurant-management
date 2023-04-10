import config from "config";
import nodemailer from "nodemailer";
export default async function sendEmail(emailData) {
  try {
    // Who is sending reciving input from mail server and there protocol and port
    // Input Detail of SMTP Server Auth Detail like
    // Host , Port , Auth Details , Secure or Not

    const { HOST, AUTH, PORT } = config.get("EMAIL_SMTP");
    let sender = nodemailer.createTransport({
      host: HOST,
      port: PORT,
      secure: true,
      auth: {
        user: AUTH["USER"],
        pass: AUTH["PASS"],
      },
    });

    // Now After getting Input Details From Server
    // Now To Whom Sending Details
    // By Using sendMail Function
    let sending = await sender.sendMail({
      from: `${AUTH["USER"]}`,
      to: emailData.to,
      subject: emailData.subject,
      text: emailData.text,
      html: emailData.html,
    });
    // Making Sure that Mail Has Sent or Not
  } catch (error) {
    console.error(error);
  }
}


