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

exports.sendCSVReport = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    // 解构请求体中的 email 和 csvContent
    const {email, csvContent} = req.body;

    // 日志输出，检查收到的 CSV 内容
    console.log("Received email:", email);
    console.log("Received CSV content:", csvContent);

    if (!csvContent) {
      console.error("CSV content is missing");
      return res.status(400).send({error: "CSV content is missing"});
    }

    try {
      // 清理 csvContent 中的不可见字符或多余换行符
      const cleanedCsvContent = csvContent.replace(/\r?\n|\r/g, "\n");

      // 创建 Buffer，并指定编码格式（如 utf-8）
      const bufferContent = Buffer.from(
          cleanedCsvContent, "utf-8").toString("base64");

      // 日志输出，确认 Buffer 内容
      console.log("Buffer content (base64):", bufferContent);

      // 构造邮件内容
      const msg = {
        to: email,
        from: "minichloe99@gmail.com",
        subject: "Your Test History Report",
        text: "Please find attached your test history report.",
        attachments: [
          {
            content: bufferContent,
            filename: "test_history.csv",
            type: "text/csv",
            disposition: "attachment",
          },
        ],
      };

      // 尝试发送邮件
      await sgMail.send(msg);
      console.log("Email sent successfully");
      return res.status(200).send({message: "Report sent successfully"});
    } catch (error) {
      // 捕获并记录错误
      console.error("Error sending report:", error);
      return res.status(500).send({error: "Failed to send report"});
    }
  });
});
