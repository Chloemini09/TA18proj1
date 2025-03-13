const functions = require("firebase-functions");
const sgMail = require("@sendgrid/mail");
const cors = require("cors")({origin: true});

// 设置 SendGrid API 密钥
const apiKey =
  "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";
sgMail.setApiKey(apiKey);


exports.sendWelcomeEmail = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    const {email, username} = req.body;

    const msg = {
      to: email,
      from: "minichloe99@gmail.com",
      subject: "Welcome to Mindwell!",
      text: `Hi ${username}, Welcome to Mindwell1!`,
      html: `<strong>Hi ${username}, Welcome to Mindwell!</strong>`,
    };

    sgMail
        .send(msg)
        .then(() => {
          return res.status(200).send({message: "Email successfully"});
        })
        .catch((error) => {
          console.error("Error sending email:", error);
          return res.status(500).send({error: "email failed"});
        });
  });
});
