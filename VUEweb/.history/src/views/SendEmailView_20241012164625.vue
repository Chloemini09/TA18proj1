<template>
    <div class="admin-email">
      <h1>Mass Email</h1>
      <div>
        <label for="subject">Email Subject:</label>
        <input type="text" v-model="subject" id="subject" />
      </div>
      <div>
        <label for="text">Email Content (Text):</label>
        <textarea v-model="text" id="text"></textarea>
      </div>
      <div>
        <label for="html">Email Content (HTML):</label>
        <textarea v-model="html" id="html"></textarea>
      </div>
      <div>
        <label for="recipients">Select Recipients:</label>
        <div v-for="user in users" :key="user.email" class="recipient-option">
          <input type="checkbox" :value="user" v-model="selectedRecipients" />
          <label>{{ user.username }} ({{ user.email }})</label>
        </div>
        <div>
          <input type="checkbox" value="ALL" v-model="selectAll" @change="toggleSelectAll" />
          <label>Select All Users</label>
        </div>
      </div>
      <button @click="sendMassEmail">Send Email</button>
    </div>
  </template>
  
  <script>
  import { getFirestore, collection, getDocs } from 'firebase/firestore';
  import { getFunctions, httpsCallable } from 'firebase/functions';
  
  export default {
    data() {
      return {
        subject: '',
        text: '',
        html: '',
        users: [],
        selectedRecipients: [],
        selectAll: false,
      };
    },
    async created() {
      try {
        const db = getFirestore();
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const users = [];
  
        usersSnapshot.forEach((doc) => {
          const userData = doc.data();
          if (userData.email && userData.username && userData.role === 'user') {
            users.push({
              email: userData.email,
              username: userData.username,
            });
          }
        });
  
        this.users = users;
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    },
    methods: {
      toggleSelectAll() {
        if (this.selectAll) {
          this.selectedRecipients = [...this.users];
        } else {
          this.selectedRecipients = [];
        }
      },
      async sendMassEmail() {
        try {
          const functions = getFunctions();
          const sendEmail = httpsCallable(functions, 'sendEmail');
          const recipients = this.selectAll ? this.users : this.selectedRecipients;
  
          for (const user of recipients) {
            const emailData = {
              email: user.email,
              subject: this.subject,
              text: this.text.replace(/\{username\}/g, user.username),
              html: this.html.replace(/\{username\}/g, user.username),
            };
  
            await sendEmail(emailData);
          }
  
          alert('Emails sent successfully!');
        } catch (error) {
          console.error('Error sending emails:', error);
          alert('Failed to send emails, please try again later.');
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
  .recipient-option {
    display: flex;
    align-items: center;
    margin-top: 5px;
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