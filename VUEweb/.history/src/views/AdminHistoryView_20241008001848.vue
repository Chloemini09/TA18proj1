<template>
    <div class="admin-container">
      <header class="admin-header">
        <h1>Admin Dashboard</h1>
        <button @click="logout" class="btn-logout">Logout</button>
      </header>
      <div class="admin-grid">
        <button @click="checkUserList" class="admin-button green">history</button>
        <button @click="checkUserComment" class="admin-button yellow">history</button>
        <router-link to="/history" class="admin-button yellow">HISTORY</router-link>
        <router-link to="/other" class="admin-button green">history</router-link>
      </div>
  
      <!-- show user's list -->
      <div v-if="showUserList" class="modal">
        <div class="modal-content">
          <span @click="closeModal" class="close">&times;</span>
          <h2>User List</h2>
          <ul>
            <li v-for="(user, index) in users" :key="index">
              <strong>{{ user.username }}</strong> - {{ user.gender }}
            </li>
          </ul>
        </div>
      </div>
  
      <!-- show user's comments -->
      <div v-if="showUserComments" class="modal">
        <div class="modal-content">
          <span @click="closeModal" class="close">&times;</span>
          <h2>User Comments</h2>
          <div v-if="feedback.length">
            <div v-for="(rating, index) in feedback" :key="index" class="user-feedback">
              <h3>User: {{ rating.username }}</h3>
              <ul>
                <li v-for="(q, idx) in rating.ratings" :key="idx">
                  <strong>{{ q.question }}</strong>: {{ q.rating }}/5
                </li>
              </ul>
              <h3>Advice:</h3>
              <p>{{ rating.advice }}</p>
              <hr />
            </div>
          </div>
          <div v-else>
            <p>No feedback available.</p>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  
  const router = useRouter();
  const showUserList = ref(false);
  const showUserComments = ref(false);
  const users = ref([]);
  const feedback = ref([]);
  
  // get and show all the user info
  function checkUserList() {
    const allKeys = Object.keys(localStorage);
    users.value = allKeys
      .filter(key => key !== 'isAuthenticated' && key !== 'userRole' && key !== 'userRatings')
      .map(key => JSON.parse(localStorage.getItem(key)))
      .map(user => ({
        username: user.username,
        gender: user.gender,
      }));
    showUserList.value = true;
  }
  
  // get and display all the comments from user
  function checkUserComment() {
    const storedFeedback = JSON.parse(localStorage.getItem('userRatings'));
  
    if (storedFeedback && !Array.isArray(storedFeedback)) {
      feedback.value = [storedFeedback];
    } else if (storedFeedback) {
      feedback.value = storedFeedback;
    } else {
      feedback.value = []; // it's for empty comments
    }
  
    showUserComments.value = true;
  }
  
  
  // log out and return to welcome 
  function logout() {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('currentUser');  // clear info
    router.push('/login');  // back to login
  }
  
  function closeModal() {
    showUserList.value = false;
    showUserComments.value = false;
  }
  </script>
  
  <style scoped>
  .admin-container {
    padding: 2rem;
    text-align: center;
  }
  
  .admin-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }
  
  .admin-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }
  
  .admin-button {
    padding: 2rem;
    border: none;
    color: white;
    font-size: 1.2rem;
    cursor: pointer;
    border-radius: 5px;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.3);
    transition: transform 0.2s, box-shadow 0.2s;
    height: 150px;
  }
  
  .admin-button:hover {
    transform: translateY(-5px);
    box-shadow: 0px 6px 15px rgba(0, 0, 0, 0.5);
  }
  
  .green {
    background-color: #4caf50;
  }
  
  .yellow {
    background-color: #fbc02d;
  }
  
  .btn-logout {
    background-color: #d9534f;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1rem;
  }
  
  .btn-logout:hover {
    background-color: #c9302c;
  }
  
  .modal {
    display: block;
    position: fixed;
    z-index: 1;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: rgba(0, 0, 0, 0.4);
  }
  
  .modal-content {
    background-color: #fff;
    margin: 15% auto;
    padding: 20px;
    border: 1px solid #888;
    width: 80%;
    max-width: 600px;
  }
  
  .close {
    color: #aaa;
    float: right;
    font-size: 28px;
    font-weight: bold;
    cursor: pointer;
  }
  
  .close:hover,
  .close:focus {
    color: black;
    text-decoration: none;
    cursor: pointer;
  }
  
  .user-feedback {
    margin-bottom: 1rem;
  }
  </style>
  