<template>
  <div class="test-history-container">
    <header class="header">
      <img src="@/assets/logo.png" alt="Test History Logo" class="logo" />
      <div class="header-text">
        <h1>Test History</h1>
        <p>{{ currentDate }}</p>
      </div>
    </header>

    <!-- 心理测试记录 -->
    <section class="history-section">
      <h2>以往心理测试记录</h2>
      <div class="filters">
        <label>开始日期: <input type="date" v-model="startDate" /></label>
        <label>结束日期: <input type="date" v-model="endDate" /></label>
        <button @click="sortByDate">按日期排序</button>
        <button @click="sortByScore">按分数排序</button>
      </div>

      <!-- 两列表格显示 -->
      <div class="records-grid">
        <div class="record-item" v-for="record in paginatedRecords" :key="record.date">
          <p><strong>日期:</strong> {{ record.date }}</p>
          <p><strong>分数:</strong> {{ record.score }}</p>
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination">
        <button @click="prevPage" :disabled="currentPage === 1">上一页</button>
        <span>第 {{ currentPage }} 页</span>
        <button @click="nextPage" :disabled="currentPage === totalPages">下一页</button>
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
