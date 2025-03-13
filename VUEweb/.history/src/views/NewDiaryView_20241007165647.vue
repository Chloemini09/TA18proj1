<template>
    <div class="new-diary-container">
      <h2>Create a New Diary Entry</h2>
      <textarea v-model="newDiaryEntry" placeholder="Write your diary here..."></textarea>
      <button @click="saveDiary" class="save-btn">Save Entry</button>
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
  
  const newDiaryEntry = ref('')
  
  const saveDiary = async () => {
    if (newDiaryEntry.value.trim() === '') return
    await addDoc(collection(db, 'diaryEntries'), {
      email: user.email,
      entry: newDiaryEntry.value,
      date: new Date().toLocaleString(),
    })
    newDiaryEntry.value = '' // Clear input
    router.push('/') // Redirect to diary list
  }
  </script>
  
  <style scoped>
  .new-diary-container {
    max-width: 600px;
    margin: 40px auto;
    padding: 20px;
    background-color: white;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  textarea {
    width: 100%;
    min-height: 200px;
    padding: 10px;
    margin-top: 20px;
    border-radius: 5px;
    border: 1px solid #ccc;
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
  