import { onRequest } from "firebase-functions/v2/https"; // ESM 导入
import sgMail from '@sendgrid/mail';
import * as functions from "firebase-functions";
import { logger } from "firebase-functions";

// 设置 SendGrid API 密钥
sgMail.setApiKey(functions.config().sendgrid.key);

// 创建 Cloud Function 处理发送邮件请求
export const sendWelcomeEmail = onRequest((req, res) => {
  const { email, username } = req.body; // 获取请求中的 email 和 username

  const msg = {
    to: email,
    from: 'your-verified-email@example.com', // SendGrid中验证的发件人邮箱
    subject: 'Welcome to Our Platform!',
    text: `Hi ${username}, welcome to our platform!`,
    html: `<strong>Hi ${username},</strong><br><p>Welcome to our platform. We're glad to have you here!</p>`
  };

  sgMail
    .send(msg)
    .then(() => {
      logger.info('Email sent successfully!');
      res.status(200).send('Email sent successfully!');
    })
    .catch((error) => {
      logger.error('Error sending email:', error);
      res.status(500).send('Failed to send email: ' + error.message);
    });
});
