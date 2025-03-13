<template>
    <div class="admin-booking-view">
      <header class="header">
        <img src="@/assets/logo.png" alt="Health Test Logo" class="logo" />
        <div class="header-text">
          <h1>Manage Bookings</h1>
          <p>{{ formattedDate }}</p>
        </div>
      </header>
  
      <section class="booking-search">
        <h2>Search Bookings</h2>
        <div class="search-filters">
          <label for="filterType">Select Filter:</label>
          <select v-model="selectedFilter" id="filterType">
            <option value="userName">User Name</option>
            <option value="userEmail">Email</option>
            <option value="doctorName">Doctor</option>
            <option value="date">Date</option>
          </select>
        </div>
        <input type="text" v-model="searchTerm" :placeholder="`Search by ${selectedFilter}`" />
        <button @click="filterBookings" class="green-button">Search</button>
        <button @click="clearSearch" class="green-button">Clear</button>
      </section>
  
      <section class="booking-list">
        <h2>User Bookings</h2>
        <div v-if="filteredBookings.length === 0">No bookings found.</div>
        <div v-else>
          <table class="booking-table">
            <thead>
              <tr>
                <th>User Name</th>
                <th>Email</th>
                <th>Doctor</th>
                <th>Date</th>
                <th>Time Slot</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="booking in filteredBookings" :key="booking.id">
                <td>{{ booking.userName }}</td>
                <td>{{ booking.userEmail }}</td>
                <td>{{ booking.doctorName }}</td>
                <td>{{ booking.date }}</td>
                <td>{{ booking.timeSlot }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { getFirestore, collection, getDocs, query } from 'firebase/firestore';
  
  const db = getFirestore();
  const bookings = ref([]);
  const filteredBookings = ref([]);
  const searchTerm = ref('');
  const formattedDate = new Date().toLocaleDateString();
  const selectedFilter = ref('userName');
  
  const fetchBookings = async () => {
    const querySnapshot = await getDocs(collection(db, 'consultations'));
    bookings.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    filteredBookings.value = bookings.value;
  };
  
  const filterBookings = () => {
    const term = searchTerm.value.toLowerCase();
    filteredBookings.value = bookings.value.filter(booking => {
      return booking[selectedFilter.value].toLowerCase().includes(term);
    });
  };
  
  const clearSearch = () => {
    searchTerm.value = '';
    filteredBookings.value = bookings.value;
  };
  
  onMounted(fetchBookings);
  </script>
  
  <style scoped>
  .admin-booking-view {
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
  .booking-search, .booking-list {
    margin-bottom: 30px;
  }
  .search-filters {
    margin-bottom: 10px;
  }
  .booking-table {
    width: 100%;
    border-collapse: collapse;
  }
  .booking-table th, .booking-table td {
    border: 1px solid #ddd;
    padding: 10px;
    text-align: left;
  }
  .booking-table th {
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