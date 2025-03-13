<template>
  <div class="user-my-view">
    <header class="header">
      <img src="@/assets/logo.png" alt="User Profile Logo" class="logo" />
      <div class="header-text">
        <h1>My Profile</h1>
        <p>{{ formattedDate }}</p>
      </div>
    </header>

    <section class="user-info">
      <h2>User Information</h2>
      <div>
        <label for="username">User Name:</label>
        <input type="text" v-model="userData.username" id="username" />
      </div>
      <div>
        <label for="gender">Gender:</label>
        <input type="text" v-model="userData.gender" id="gender" />
      </div>
      <div>
        <label for="country">Country:</label>
        <input type="text" v-model="userData.country" id="country" />
      </div>
      <div>
        <label for="introduction">Self Introduction:</label>
        <textarea v-model="userData.introduction" id="introduction"></textarea>
      </div>
      <button @click="updateUserInfo" class="green-button">Save Changes</button>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const db = getFirestore();
const auth = getAuth();
const userData = ref({
  username: '',
  gender: '',
  country: '',
  introduction: '',
});
const formattedDate = new Date().toLocaleDateString();

const fetchUserInfo = async () => {
  const user = auth.currentUser;
  if (user) {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      userData.value = userDoc.data();
    }
  }
};

const updateUserInfo = async () => {
  const user = auth.currentUser;
  if (user) {
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        username: userData.value.username,
        gender: userData.value.gender,
        country: userData.value.country,
        introduction: userData.value.introduction,
      });
      alert('User information updated successfully!');
    } catch (error) {
      console.error('Error updating user information:', error);
      alert('Failed to update user information. Please try again.');
    }
  }
};

onMounted(fetchUserInfo);
</script>

<style scoped>
.user-my-view {
  max-width: 600px;
  margin: auto;
  padding: 20px;
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
.logo {
  width: 60px;
  height: auto;
}
.header-text {
  flex-grow: 1;
  text-align: right;
}
.user-info {
  margin-bottom: 30px;
}
.user-info label {
  display: block;
  margin-top: 10px;
}
.user-info input[type="text"], .user-info textarea {
  width: 100%;
  padding: 8px;
  margin-top: 5px;
}
textarea {
  resize: vertical;
  height: 100px;
}
.green-button {
  margin-top: 20px;
  padding: 10px 20px;
  border: none;
  background-color: #4caf50;
  color: white;
  cursor: pointer;
  border-radius: 4px;
}
.green-button:hover {
  background-color: #45a049;
}
</style>