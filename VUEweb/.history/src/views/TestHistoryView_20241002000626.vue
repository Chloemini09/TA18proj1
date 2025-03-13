<template>
  <div class="test-history-container">
    <header class="header">
      <img src="@/assets/logo.png" alt="Health Test Logo" class="logo" />
      <div class="header-text">
        <h1>Past Mental Health Test Records</h1>
        <p>{{ currentDate }}</p>
      </div>
    </header>

    <!-- 日期过滤 -->
    <section class="filter-section">
      <h2>Filter Test Records</h2>
      <div class="filter-controls">
        <label>
          Start Date:
          <input type="date" v-model="startDate" placeholder="dd/mm/yyyy" />
        </label>
        <label>
          End Date:
          <input type="date" v-model="endDate" placeholder="dd/mm/yyyy" />
        </label>
        <button @click="filterByDate" class="filter-btn">Filter by Date</button>
        <button @click="sortByScore" class="filter-btn">Sort by Score</button>
      </div>
    </section>

    <!-- 分页显示记录 -->
    <section class="records-section">
      <div v-if="paginatedRecords.length > 0">
        <div v-for="(record, index) in paginatedRecords" :key="index" class="record-item">
          <p><strong>Date:</strong> {{ record.date.toLocaleDateString() }}</p>
          <p><strong>Score:</strong> {{ record.score }}</p>
        </div>
        <div class="pagination">
          <button @click="prevPage" :disabled="currentPage === 1">Previous</button>
          <span>Page {{ currentPage }} of {{ totalPages }}</span>
          <button @click="nextPage" :disabled="currentPage === totalPages">Next</button>
        </div>
      </div>
      <div v-else>
        <p>No test records found.</p>
      </div>
    </section>

    <!-- 心理评分均值和建议 -->
    <section class="average-score-section">
      <h3>Average Mental Health Score: {{ averageScore.toFixed(2) }}</h3>
      <p>{{ recommendation }}</p>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getFirestore, collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const db = getFirestore()
const auth = getAuth()
const user = auth.currentUser

const testRecords = ref([])
const startDate = ref('')
const endDate = ref('')
const currentPage = ref(1)
const itemsPerPage = 10
const currentDate = new Date().toLocaleDateString()

// 获取测试记录
const getTestRecords = async () => {
  if (!user) {
    console.error('No user logged in!')
    return
  }

  const q = query(
    collection(db, 'healthTestResults'),
    where('email', '==', user.email),
    orderBy('date', 'desc')
  )
  const querySnapshot = await getDocs(q)
  testRecords.value = querySnapshot.docs.map(doc => {
    const data = doc.data()
    data.date = data.date.toDate()  // 将 Timestamp 转换为 Date
    return data
  })
}
getTestRecords()

// 日期过滤函数，使用 Timestamp
const filterByDate = () => {
  if (startDate.value && endDate.value) {
    const startTimestamp = Timestamp.fromDate(new Date(startDate.value))
    const endTimestamp = Timestamp.fromDate(new Date(endDate.value))

    // 过滤测试记录
    testRecords.value = testRecords.value.filter(record => {
      return record.date >= startTimestamp.toDate() && record.date <= endTimestamp.toDate()
    })
  }
  currentPage.value = 1 // 重置分页
}

// 分页与排序
const paginatedRecords = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return testRecords.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(testRecords.value.length / itemsPerPage))

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--
}

const sortByScore = () => {
  testRecords.value.sort((a, b) => a.score - b.score)
}

// 心理评分均值与建议
const averageScore = computed(() => {
  if (testRecords.value.length === 0) return 0
  const total = testRecords.value.reduce((sum, record) => sum + record.score, 0)
  return total / testRecords.value.length
})

const recommendation = computed(() => {
  if (averageScore.value <= 20) {
    return "Your mental health seems to be in a great state. Keep it up!"
  } else if (averageScore.value <= 40) {
    return "It seems like you might be facing some challenges. Consider talking to a friend or professional."
  } else {
    return "We recommend that you seek support from a mental health professional."
  }
})
</script>

<style scoped>
.test-history-container {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.logo {
  width: 50px;
  height: auto;
}

.header-text {
  flex-grow: 1;
  text-align: right;
}

.filter-section {
  margin-bottom: 20px;
}

.filter-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.filter-btn {
  background-color: #4caf50;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  margin-left: 10px;
}

.filter-btn:hover {
  background-color: #388e3c;
}

.records-section {
  margin-bottom: 20px;
}

.record-item {
  padding: 10px;
  border: 1px solid #ddd;
  margin-bottom: 10px;
  border-radius: 5px;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}

.average-score-section {
  margin-top: 30px;
}

.average-score-section h3 {
  font-size: 1.5rem;
  margin-bottom: 10px;
}

.pagination button {
  background-color: #4caf50;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.pagination button:disabled {
  background-color: #ddd;
  cursor: not-allowed;
}
</style>
