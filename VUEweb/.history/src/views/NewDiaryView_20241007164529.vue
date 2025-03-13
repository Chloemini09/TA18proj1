<template>
    <div class="new-diary-container">
      <h2>Write a new diary</h2>
      <textarea v-model="newDiaryEntry" placeholder="Write your diary here..."></textarea>
      <button @click="saveDiary">Save Diary</button>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { getFirestore, collection, addDoc } from 'firebase/firestore'
  import { getAuth } from 'firebase/auth'
  import { useRouter } from 'vue-router'
  
  // 初始化 Firebase 和路由
  const db = getFirestore()
  const auth = getAuth()
  const user = auth.currentUser
  const router = useRouter()
  
  // 新建日记
  const newDiaryEntry = ref('')
  
  const saveDiary = async () => {
    if (newDiaryEntry.value.trim() === '') return
  
    // 保存到 Firebase
    await addDoc(collection(db, 'diaryEntries'), {
      email: user.email,
      entry: newDiaryEntry.value,
      date: new Date().toLocaleString(),
    })
  
    newDiaryEntry.value = '' // 清空文本框
    router.push('/') // 保存成功后返回到主页面
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
  button {
    margin-top: 20px;
    background-color: #4caf50;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
  }
  button:hover {
    background-color: #4caf50;
  }
  </style>
  