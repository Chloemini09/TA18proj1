<template>
    <div class="admin-container">
      <header class="admin-header">
        <h1>Admin Dashboard</h1>
        <button @click="logout" class="btn-logout">Logout</button>
      </header>
      <div class="admin-grid">
        <button @click="checkUserList" class="admin-button green">conment</button>
        <button @click="checkUserComment" class="admin-button yellow">conment</button>
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
  