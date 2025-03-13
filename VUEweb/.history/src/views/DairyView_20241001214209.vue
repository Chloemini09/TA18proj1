<template>
    <div class="diary-container">
      <header class="diary-header">
        <div class="header-left">
          <img src="@/assets/logo.png" alt="Logo" class="logo" />
          <h1>My Diary</h1>
        </div>
        <div class="header-right">
          <p class="date">{{ currentDate }}</p>
        </div>
      </header>
  
      <div class="welcome-message">
        <h2>Hi, {{ username }}</h2>
        <p>Here you can review your diary entries and add new ones.</p>
      </div>
  
      <div class="diary-entries">
        <h3>Your Diary Entries</h3>
        <ul>
          <li v-for="(entry, index) in diaryEntries" :key="index" class="entry-item">
            <h4>{{ entry.date }}</h4>
            <p>{{ entry.content }}</p>
          </li>
        </ul>
      </div>
  
      <div class="new-entry-section">
        <h3>Add New Entry</h3>
        <textarea v-model="newEntryContent" placeholder="Write your thoughts here..." rows="5"></textarea>
        <button @click="addNewEntry" class="entry-button">Add Entry</button>
        <p v-if="confirmationMessage" class="confirmation-message">{{ confirmationMessage }}</p>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  
  const username = ref(localStorage.getItem('currentUser') || 'User');
  const currentDate = ref('');
  const newEntryContent = ref('');
  const diaryEntries = ref([]);
  const confirmationMessage = ref('');
  
  function formatDate(date) {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }
  
  function loadDiaryEntries() {
    const storedEntries = JSON.parse(localStorage.getItem('diaryEntries')) || [];
    diaryEntries.value = storedEntries;
  }
  
  function addNewEntry() {
    if (newEntryContent.value.trim()) {
      const newEntry = {
        date: currentDate.value,
        content: newEntryContent.value.trim(),
      };
      diaryEntries.value.push(newEntry);
      localStorage.setItem('diaryEntries', JSON.stringify(diaryEntries.value));
      newEntryContent.value = '';
      confirmationMessage.value = 'New diary entry added!';
      setTimeout(() => {
        confirmationMessage.value = '';
      }, 3000);
    } else {
      confirmationMessage.value = 'Please write something before adding!';
      setTimeout(() => {
        confirmationMessage.value = '';
      }, 3000);
    }
  }
  
  onMounted(() => {
    const today = new Date();
    currentDate.value = formatDate(today);
    loadDiaryEntries();
  });
  </script>
  
  <style scoped>
  .diary-container {
    padding: 2rem;
    font-family: 'Arial', sans-serif;
  }
  
  .diary-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 1rem;
    border-bottom: 2px solid #e0e0e0;
  }
  
  .header-left {
    display: flex;
    align-items: center;
  }
  
  .logo {
    width: 50px;
    height: 50px;
    margin-right: 10px;
  }
  
  .diary-header h1 {
    font-size: 2rem;
    color: #333;
  }
  
  .header-right {
    font-size: 1rem;
    color: #666;
  }
  
  .welcome-message {
    margin: 2rem 0;
  }
  
  .welcome-message h2 {
    font-size: 1.8rem;
    color: #333;
  }
  
  .welcome-message p {
    font-size: 1.2rem;
    color: #666;
  }
  
  .diary-entries {
    margin: 2rem 0;
  }
  
  .diary-entries h3 {
    font-size: 1.5rem;
    color: #4caf50;
  }
  
  .entry-item {
    background-color: #f9f9f9;
    padding: 1rem;
    border-radius: 5px;
    margin-bottom: 1rem;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  .entry-item h4 {
    font-size: 1.3rem;
    margin-bottom: 0.5rem;
  }
  
  .entry-item p {
    font-size: 1rem;
    color: #666;
  }
  
  .new-entry-section {
    margin-top: 2rem;
  }
  
  .new-entry-section h3 {
    font-size: 1.5rem;
    color: #4caf50;
  }
  
  .new-entry-section textarea {
    width: 100%;
    padding: 1rem;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 1rem;
    margin-bottom: 1rem;
  }
  
  .entry-button {
    background-color: #4caf50;
    color: white;
    padding: 1rem 2rem;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1.2rem;
  }
  
  .entry-button:hover {
    background-color: #388e3c;
  }
  
  .confirmation-message {
    margin-top: 1rem;
    font-size: 1.2rem;
    color: #4caf50;
  }
  </style>
  