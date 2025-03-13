<template>
  <div class="admin-feedback-view">
    <header class="header">
      <img src="@/assets/logo.png" alt="Health Test Logo" class="logo" />
      <div class="header-text">
        <h1>Manage User Feedback</h1>
        <p>{{ formattedDate }}</p>
      </div>
    </header>

    <section class="feedback-search">
      <h2>Search Feedback</h2>
      <div class="search-filters">
        <label for="filterType">Select Filter:</label>
        <select v-model="selectedFilter" id="filterType">
          <option value="username">User Name</option>
          <option value="userEmail">Email</option>
          <option value="date">Date</option>
        </select>
      </div>
      <input type="text" v-model="searchTerm" :placeholder="`Search by ${selectedFilter}`" />
      <button @click="filterFeedbacks" class="green-button">Search</button>
      <button @click="clearSearch" class="green-button">Clear</button>
    </section>

    <section class="feedback-list">
      <h2>User Feedback</h2>
      <div v-if="filteredFeedbacks.length === 0">No feedback found.</div>
      <div v-else>
        <table class="feedback-table">
          <thead>
            <tr>
              <th>User Name</th>
              <th>Email</th>
              <th>Date</th>
              <th>Advice</th>
              <th>Average Rating</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="feedback in filteredFeedbacks" :key="feedback.id">
              <td>{{ feedback.username }}</td>
              <td>{{ feedback.userEmail }}</td>
              <td>{{ feedback.date }}</td>
              <td>{{ feedback.advice }}</td>
              <td>{{ calculateAverageRating(feedback.ratings).toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const db = getFirestore();
const feedbacks = ref([]);
const filteredFeedbacks = ref([]);
const searchTerm = ref('');
const formattedDate = new Date().toLocaleDateString();
const selectedFilter = ref('username');

const fetchFeedbacks = async () => {
  const querySnapshot = await getDocs(collection(db, 'feedback'));
  feedbacks.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  filteredFeedbacks.value = feedbacks.value;
};

const filterFeedbacks = () => {
  const term = searchTerm.value.toLowerCase();
  filteredFeedbacks.value = feedbacks.value.filter(feedback => {
    return feedback[selectedFilter.value].toLowerCase().includes(term);
  });
};

const clearSearch = () => {
  searchTerm.value = '';
  filteredFeedbacks.value = feedbacks.value;
};

const calculateAverageRating = (ratings) => {
  if (!ratings || ratings.length === 0) return 0;
  const total = ratings.reduce((sum, rating) => sum + rating.rating, 0);
  return total / ratings.length;
};

onMounted(fetchFeedbacks);
</script>

<style scoped>
.admin-feedback-view {
  max-width: 1000px;
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
.feedback-search, .feedback-list {
  margin-bottom: 30px;
}
.search-filters {
  margin-bottom: 10px;
}
.feedback-table {
  width: 100%;
  border-collapse: collapse;
}
.feedback-table th, .feedback-table td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: left;
}
.feedback-table th {
  background-color: #f4f4f4;
}
.green-button {
  margin-top: 10px;
  padding: 8px 16px;
  border: none;
  background-color: #4caf50;
  color: white;
  cursor: pointer;
  border-radius: 4px;
}
.green-button:hover {
  background-color: #45a049;
}
input[type="text"] {
  margin-bottom: 10px;
  padding: 8px;
  width: calc(100% - 16px);
}
</style>