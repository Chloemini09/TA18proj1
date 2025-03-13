<template>
  <div class="test-history-container">
    <header class="header">
      <img src="@/assets/logo.png" alt="Test History Logo" class="logo" />
      <div class="header-text">
        <h1>Test History</h1>
        <p>{{ currentDate }}</p>
      </div>
    </header>

    <div class="filter-section">
      <h2>Filter Test Records</h2>
      <label for="startDate">Start Date:</label>
      <input type="date" id="startDate" v-model="startDate">
      
      <label for="endDate">End Date:</label>
      <input type="date" id="endDate" v-model="endDate">

      <button @click="filterByDateRange">Filter by Date</button>

      <label for="sortOrder">Sort by Score:</label>
      <select id="sortOrder" v-model="sortOrder" @change="sortByScore">
        <option value="asc">Ascending</option>
        <option value="desc">Descending</option>
      </select>
    </div>

    <div v-if="filteredTests.length === 0">
      <p>No test records found.</p>
    </div>

    <table v-else>
      <thead>
        <tr>
          <th>Date</th>
          <th>Score</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="test in paginatedTests" :key="test.date">
          <td>{{ test.date }}</td>
          <td>{{ test.score }}</td>
        </tr>
      </tbody>
    </table>

    <div class="pagination">
      <button @click="prevPage" :disabled="currentPage === 1">Previous</button>
      <span>Page {{ currentPage }} of {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage === totalPages">Next</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getFirestore, collection, query, where, getDocs, addDoc } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const db = getFirestore()
const auth = getAuth()
const user = auth.currentUser
const router = useRouter()
// 1. 心理测试记录
const testRecords = ref([])
const startDate = ref('')
const endDate = ref('')
const currentPage = ref(1)
const itemsPerPage = 10

const currentDate = new Date().toLocaleDateString()

const getTestRecords = async () => {
  const q = query(collection(db, 'healthTestResults'), where('email', '==', user.email))
  const querySnapshot = await getDocs(q)
  testRecords.value = querySnapshot.docs.map(doc => doc.data())
}
getTestRecords()

// 分页与过滤
const filteredTestRecords = computed(() => {
  return testRecords.value.filter(record => {
    return (!startDate.value || record.date >= startDate.value) &&
           (!endDate.value || record.date <= endDate.value)
  })
})

const paginatedRecords = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredTestRecords.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(filteredTestRecords.value.length / itemsPerPage))

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--
}

// 心理测试记录的排序功能
const sortByDate = () => {
  testRecords.value.sort((a, b) => new Date(a.date) - new Date(b.date))
}

const sortByScore = () => {
  testRecords.value.sort((a, b) => a.score - b.score)
}
</script>

<style scoped>
.test-history-container {
  padding: 2rem;
  background-color: #fff;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.logo {
  height: 50px;
}

.header-text h1 {
  margin: 0;
  font-size: 2rem;
  color: #333;
}

.header-text p {
  margin: 0;
  color: #666;
}

.filter-section {
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin-bottom: 2rem;
}

.filter-section label {
  margin-right: 0.5rem;
}

.filter-section input,
.filter-section select {
  margin-right: 1rem;
}

button {
  background-color: #4caf50;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:disabled {
  background-color: #cccccc;
}

table {
  width: 100%;
  border-collapse: collapse;
}

table th, table td {
  padding: 1rem;
  border: 1px solid #ddd;
  text-align: center;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 2rem;
}

.pagination button {
  margin: 0 1rem;
}
</style>
