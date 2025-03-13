const functions = require('firebase-functions');
const sgMail = require('@sendgrid/mail');
const cors = require('cors')({ origin: true });

// 设置 SendGrid API 密钥
sgMail.setApiKey('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');

exports.sendWelcomeEmail = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    const { email, username } = req.body;

    const msg = {
      to: email,
      from: 'xjin0033@student.monash.edu', // 替换为你的认证邮箱
      subject: 'Welcome to Mindwell!',
      text: `Hi ${username}, Welcome to Mindwell1!`,
      html: `<strong>Hi ${username}, Welcome to Mindwell!</strong>`,
    };

    sgMail
      .send(msg)
      .then(() => {
        return res.status(200).send({ message: 'Email successfully' });
      })
      .catch((error) => {
        console.error('Error email:', error);
        return res.status(500).send({ error: 'email failed' });
      });
  });
});
