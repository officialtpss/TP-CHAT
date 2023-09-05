const nodemailer = require("nodemailer");
const mailTemplate = require("./emailTemplate");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../constant");

const transporter = nodemailer.createTransport({
  host: "mail2.techpss.com",
  port: 25,
  auth: {
    user: "notifications",
    pass: "JxP4j2fdsOTG1WS13Ly6",
  },
});

const sendEmail = async (mailContent) => {
  try {
    const { email } = mailContent;
    const mailOptions = {
      from: "notifications@techpss.com",
      to: `${email}`,
      subject: "Welcome to Tp-chat",
      html: mailTemplate.sendMail(mailContent),
    };

    transporter.sendMail(mailOptions, (error, info) => {     
      if (error) {
        return console.log(error.message); 
      }        
      console.log("Message sent: %s", info.messageId);
    });
  } catch (err) {
    return console.log(err.message);
  }
};

const sendTokenToMail = async (mailContent) => {
  try {
    const { email, _id, password} = mailContent;

    const secret = JWT_SECRET;

    const token = jwt.sign(
      { email: email, id: _id, password: password },
      secret,
      {
        expiresIn: "5m",
      }
    );

    mailContent.token = token;

    const mailOptions = {
      from: "notifications@techpss.com",
      to: `${email}`,
      subject: "Reset Password",
      html: mailTemplate.sendTokenToMail(mailContent),
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error.message);
      }
      console.log("Message sent: %s", info.messageId);
    });
  } catch (err) {
    return console.log(err.message);
  }
};

module.exports = {
  sendTokenToMail,
  sendEmail,
};
