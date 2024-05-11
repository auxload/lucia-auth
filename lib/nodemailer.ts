import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: "gd69435@gmail.com",
    pass: process.env.GOOGLE,
  },
});

// async..await is not allowed in global scope, must use a wrapper
export async function sendEmail(data:string,email:string) {
  // send mail with defined transport object
  await transporter.sendMail({
    from: '"Lucia Auth Template 👻"', // sender address
    to: email, // list of receivers
    subject: "Verification code", // Subject line
    text: data, // plain text body
    html: `<b>${data}</b>`, // html body
  });
}
