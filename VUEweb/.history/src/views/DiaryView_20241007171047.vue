<template>
  <div class="diary-container">
    <!-- Header -->
    <header class="header">
      <img src="@/assets/logo.png" alt="Logo" class="logo" />
      <div class="header-text">
        <h1>Diary Entries</h1>
        <p>{{ currentDateFormatted }}</p>
      </div>
    </header>

    <!-- 返回按钮 -->
    <button class="back-btn" @click="goBack">← Back</button>

    <!-- Filter and Sorting Section -->
    <div class="filters">
      <label for="sortOrder">Sort by Date:</label>
      <select v-model="dateSortOrder" @change="sortByDate">
        <option value="recent">Most Recent</option>
        <option value="oldest">Oldest First</option>
      </select>
    </div>

    <!-- Diary Entries -->
    <div class="diary-grid">
      <div class="diary-item" v-for="diary in paginatedDiaries" :key="diary.date">
        <p><strong>Title:</strong> {{ diary.title }}</p>
        <p><strong>Date:</strong> {{ formatDate(diary.date) }}</p>
        <p>{{ diary.content }}</p>
      </div>
    </div>

    <!-- Pagination -->
    <div class="pagination">
      <button @click="prevPage" :disabled="currentPage === 1">Previous</button>
      <span>Page {{ currentPage }} of {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage === totalPages">Next</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { useRouter } from 'vue-router'

const db = getFirestore()
const auth = getAuth()
const user = auth.currentUser
const router = useRouter()

// Initialize state
const diaries = ref([])
const currentPage = ref(1)
const itemsPerPage = 10
const dateSortOrder = ref('recent') // Default sorting: most recent

// Get current date for header display
const currentDateFormatted = new Date().toLocaleDateString()

// Fetch diary entries from Firebase
const getDiaries = async () => {
  const q = query(collection(db, 'diaryEntries'), where('email', '==', user.email))
  const querySnapshot = await getDocs(q)
  diaries.value = querySnapshot.docs.map(doc => doc.data())
}

getDiaries()

// Sort diaries by date based on user's selection
const sortByDate = () => {
  if (dateSortOrder.value === 'recent') {
    diaries.value.sort((a, b) => new Date(b.date) - new Date(a.date))
  } else {
    diaries.value.sort((a, b) => new Date(a.date) - new Date(b.date))
  }
}

// Format date for display
const formatDate = (date) => {
  return new Date(date).toLocaleDateString()
}

// Filtered diaries with pagination
const paginatedDiaries = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return diaries.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(diaries.value.length / itemsPerPage))

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--
}

// 返回上一个界面
const goBack = () => {
  router.go(-1)
}
</script>

<style scoped>
.diary-container {
  max-width: 800px;
  margin: auto;
  padding: 20px;
}

.header {
  display: flex;
  align-items: center;
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

/* 返回按钮 */
.back-btn {
  background-color: transparent;
  border: none;
  font-size: 1.2rem;
  color: #4caf50;
  cursor: pointer;
  margin-top: 20px;
  margin-bottom: 20px;
}

.back-btn:hover {
  text-decoration: underline;
}

.filters {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
}

.filters label {
  margin-right: 10px;
}

.diary-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-top: 20px;
}

.diary-item {
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 10px;
}

.pagination {
  margin-top: 20px;
  text-align: center;
}

button {
  padding: 10px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:disabled {
  background-color: #ccc;
}
</style>
