// Node Packages //
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");

// Validation
const { check, validationResult, body } = require("express-validator/check");

var path = require("path");
require("dotenv").config();

const PORT = process.env.PORT;

// Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Set Up View Engine for Views folder and Pug //
// app.set("views", "./views");
app.set("views", path.join(__dirname, "/views"));
app.set("view engine", "pug");

// Static Folder Setup //
app.use(express.static(path.join(__dirname, "/public")));

// Primary Routes //
app.get("/", (req, res) => {
  res.render("index");
});

// Contact Form Route
app.post(
  "/contact",
  [
    check("name", "Please include your name")
      .not()
      .isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    body("message")
      .not()
      .isEmpty()
      .trim()
      .escape()
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      let errormessages = errors.array().map(error => error.msg);
      console.log(errormessages);
      return res.render("index", { errors: errormessages });
    }
    const output = `
    <p>You have a new message</p>
    <h3>Contact Details</h3>
    <ul>
      <li>Name: ${req.body.name}</li>
      <li>Email: ${req.body.email}</li>
    </ul>
    <h3>Message</h3>
    <p>${req.body.message}</p>
  `;
    console.log(process.env.USERNAME, process.env.PASSWORD);
    let transporter = nodemailer.createTransport({
      host: "smtp.mail.yahoo.com",
      port: 587,
      secure: false, // upgrade later with STARTTLS
      auth: {
        user: process.env.USERNAME,
        pass: process.env.PASSWORD
      }
    });

    let mailOptions = {
      from: `Ben Rugman <idleistdesign@yahoo.com>`, // sender address
      to: "idleistdesign@yahoo.com", // list of receivers
      subject: "Message from Portfolio Website", // Subject line
      text: "Hello", // plain text body
      html: output // html body
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log("Message %s sent: %s", info.messageId, info.response);
      res.redirect("/");
    });
  }
);

// Initialise Server //
app.listen(PORT, () => {
  console.log(`app started on port ${PORT}`);
});
