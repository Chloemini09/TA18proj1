<template>
    <div class="admin-email">
      <h1>Mass Email</h1>
      <div>
        <label for="subject">Email Subject:</label>
        <input type="text" v-model="subject" id="subject" />
      </div>
      <div>
        <label for="html">Email Content (HTML):</label>
        <textarea v-model="html" id="html"></textarea>
      </div>
      <div>
        <label for="image">Upload Image:</label>
        <input type="file" @change="handleImageUpload" />
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
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default {
  data() {
    return {
      subject: '',
      html: '',
      users: [],
      selectedRecipients: [],
      selectAll: false,
      uploadedImageUrl: '',
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
    async handleImageUpload(event) {
      const file = event.target.files[0];
      if (file) {
        try {
          const storage = getStorage();
          const storageRef = ref(storage, `images/${file.name}`);
          await uploadBytes(storageRef, file);
          const downloadURL = await getDownloadURL(storageRef);
          this.uploadedImageUrl = downloadURL;
          console.log('Image uploaded successfully:', downloadURL);
        } catch (error) {
          console.error('Error uploading image:', error);
        }
      }
    },
    async sendMassEmail() {
      try {
        const recipients = this.selectAll ? this.users : this.selectedRecipients;

        for (const user of recipients) {
          await this.sendEmail(user.email);
        }

        alert('Emails sent successfully!');
      } catch (error) {
        console.error('Error sending emails:', error);
        alert('Failed to send emails, please try again later.');
      }
    },
    sendEmail(email) {
      const emailData = {
        email,
        subject: this.subject,
        html: this.uploadedImageUrl ? this.html + `<br/><img src="${this.uploadedImageUrl}" alt="Uploaded Image" />` : this.html,
      };

      return fetch('https://us-central1-mindwell-f5a26.cloudfunctions.net/sendEmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to send email');
          }
        })
        .catch(error => {
          console.error('Error sending email:', error);
          throw error;
        });
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