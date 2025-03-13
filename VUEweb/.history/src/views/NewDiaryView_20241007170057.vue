<template>
    <div class="new-diary-container">
      <header class="header">
        <img src="@/assets/logo.png" alt="Logo" class="logo" />
        <div class="header-text">
          <h1>New Diary Entry</h1>
          <p>{{ currentDate }}</p>
        </div>
      </header>
  
      <!-- New diary entry form -->
      <div class="diary-form">
        <label for="title">Title:</label>
        <input type="text" v-model="title" id="title" placeholder="Enter title" />
  
        <label for="date">Date:</label>
        <input type="date" v-model="date" id="date" :max="currentDate" />
  
        <label for="content">Content:</label>
        <textarea v-model="content" id="content" placeholder="Write your diary content..."></textarea>
  
        <button @click="saveDiary" class="save-btn">Save Entry</button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { getFirestore, collection, addDoc } from 'firebase/firestore'
  import { getAuth } from 'firebase/auth'
  import { useRouter } from 'vue-router'
  
  const db = getFirestore()
  const auth = getAuth()
  const user = auth.currentUser
  const router = useRouter()
  
  // New diary data
  const title = ref('')
  const date = ref('')
  const content = ref('')
  const currentDate = new Date().toISOString().split('T')[0] // Today's date in YYYY-MM-DD format
  
  // Save new diary entry
  const saveDiary = async () => {
    if (title.value.trim() === '' || content.value.trim() === '') {
      alert('Please enter both title and content.')
      return
    }
  
    await addDoc(collection(db, 'diaryEntries'), {
      email: user.email,
      title: title.value,
      date: date.value || new Date().toLocaleString(), // Use the current date if not selected
      content: content.value,
    })
  
    // Clear the input fields after saving
    title.value = ''
    date.value = ''
    content.value = ''
  
    // Redirect to diary list view
    router.push('/')
  }
  </script>
  
  <style scoped>
  .new-diary-container {
    max-width: 600px;
    margin: auto;
    padding: 20px;
    background-color: white;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px;
    border-bottom: 1px solid #ddd;
  }
  
  .logo {
    width: 60px;
    height: auto;
  }
  
  .header-text {
    flex-grow: 1;
    text-align: right;
  }
  
  .diary-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin-top: 20px;
  }
  
  label {
    font-weight: bold;
  }
  
  input[type="text"], input[type="date"], textarea {
    width: 100%;
    padding: 10px;
    border-radius: 5px;
    border: 1px solid #ccc;
    font-size: 16px;
  }
  
  textarea {
    min-height: 150px;
  }
  
  .save-btn {
    margin-top: 20px;
    background-color: #4CAF50; /* Green button */
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
  }
  
  .save-btn:hover {
    background-color: #45A049;
  }
  </style>
  