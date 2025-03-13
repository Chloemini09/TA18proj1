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
      from: 'your-email@example.com', // 替换为你的认证邮箱
      subject: '欢迎加入我们的平台！',
      text: `Hi ${username}, 欢迎加入我们！我们很高兴你成为我们的用户。`,
      html: `<strong>Hi ${username}, 欢迎加入我们！我们很高兴你成为我们的用户。</strong>`,
    };

    sgMail
      .send(msg)
      .then(() => {
        return res.status(200).send({ message: '邮件发送成功！' });
      })
      .catch((error) => {
        console.error('发送邮件时出错:', error);
        return res.status(500).send({ error: '邮件发送失败' });
      });
  });
});
