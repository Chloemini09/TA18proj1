<template>
    <div class="admin-email">
      <h1>群发邮件</h1>
      <div>
        <label for="subject">邮件主题:</label>
        <input type="text" v-model="subject" id="subject" />
      </div>
      <div>
        <label for="text">邮件内容 (文本):</label>
        <textarea v-model="text" id="text"></textarea>
      </div>
      <div>
        <label for="html">邮件内容 (HTML):</label>
        <textarea v-model="html" id="html"></textarea>
      </div>
      <button @click="sendMassEmail">发送邮件</button>
    </div>
  </template>
  
  <script>
  import { getFirestore, collection, getDocs } from 'firebase/firestore';
  import axios from 'axios';
  
  export default {
    data() {
      return {
        subject: '',
        text: '',
        html: '',
      };
    },
    methods: {
      async sendMassEmail() {
        try {
          // 获取 Firebase 中所有用户的 email 和 username
          const db = getFirestore();
          const usersSnapshot = await getDocs(collection(db, 'users'));
          const emails = [];
  
          usersSnapshot.forEach((doc) => {
            const userData = doc.data();
            if (userData.email && userData.username) {
              emails.push({
                email: userData.email,
                username: userData.username,
              });
            }
          });
  
          // 循环发送每个用户的邮件
          for (const user of emails) {
            const emailData = {
              email: user.email,
              subject: this.subject,
              text: this.text.replace(/\{username\}/g, user.username),
              html: this.html.replace(/\{username\}/g, user.username),
            };
  
            await axios.post('https://us-central1-your-project-id.cloudfunctions.net/sendEmail', emailData);
          }
  
          alert('邮件已成功发送给所有用户！');
        } catch (error) {
          console.error('发送邮件时出错:', error);
          alert('邮件发送失败，请稍后重试。');
        }
      },
    },
  };
  </script>
  
  <style scoped>
  .admin-email {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 8px;
  }
  .admin-email h1 {
    text-align: center;
  }
  .admin-email label {
    display: block;
    margin-top: 10px;
  }
  .admin-email input,
  .admin-email textarea {
    width: 100%;
    padding: 8px;
    margin-top: 5px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  .admin-email button {
    display: block;
    width: 100%;
    padding: 10px;
    margin-top: 20px;
    background-color: #4caf50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  .admin-email button:hover {
    background-color: #45a049;
  }
  </style>