<script setup>
import { ref, computed, onMounted } from 'vue'
import { getFirestore, collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const db = getFirestore()
const auth = getAuth()
const user = auth.currentUser

// 定义变量
const testRecords = ref([])
const startDate = ref('')
const endDate = ref('')
const currentPage = ref(1)
const itemsPerPage = 10

const sortByDate = ref('Most Recent')  // 添加排序选项的初始值
const sortByScore = ref('Less to More')

// 获取测试记录
const getTestRecords = async () => {
  if (!user) {
    console.error('No user logged in!')
    return
  }

  let q = query(collection(db, 'healthTestResults'), where('email', '==', user.email))

  // 检查日期范围
  if (startDate.value && endDate.value) {
    const startTimestamp = Timestamp.fromDate(new Date(new Date(startDate.value).setHours(0, 0, 0, 0))) // 当天 00:00:00
    const endTimestamp = Timestamp.fromDate(new Date(new Date(endDate.value).setHours(23, 59, 59, 999))) // 当天 23:59:59
    q = query(
      collection(db, 'healthTestResults'),
      where('email', '==', user.email),
      where('date', '>=', startTimestamp),
      where('date', '<=', endTimestamp)
    )
  }

  // 根据用户选择的排序方式进行排序
  if (sortByDate.value === 'Most Recent') {
    q = query(q, orderBy('date', 'desc')) // 按日期从新到旧排序
  } else if (sortByDate.value === 'Oldest First') {
    q = query(q, orderBy('date', 'asc')) // 按日期从旧到新排序
  }

  if (sortByScore.value === 'More to Less') {
    q = query(q, orderBy('score', 'desc')) // 按分数从高到低排序
  } else if (sortByScore.value === 'Less to More') {
    q = query(q, orderBy('score', 'asc')) // 按分数从低到高排序
  }

  try {
    const querySnapshot = await getDocs(q)
    testRecords.value = querySnapshot.docs.map(doc => doc.data())
  } catch (error) {
    console.error('Error fetching test records:', error)
  }
}

// 初始调用
onMounted(() => {
  getTestRecords()
})

// 分页与过滤
const filteredTestRecords = computed(() => {
  return testRecords.value.slice(
    (currentPage.value - 1) * itemsPerPage,
    currentPage.value * itemsPerPage
  )
})

const totalPages = computed(() => Math.ceil(testRecords.value.length / itemsPerPage))

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--
}

// 计算平均分
const averageScore = computed(() => {
  if (testRecords.value.length === 0) return 0
  const total = testRecords.value.reduce((sum, record) => sum + record.score, 0)
  return total / testRecords.value.length
})

// 生成建议
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

<template>
  <div class="test-history-container">
    <header>
      <img src="@/assets/logo.png" alt="Health Test Logo" class="logo" />
      <h1>Past Mental Health Test Records</h1>
      <p>{{ new Date().toLocaleDateString() }}</p>
    </header>

    <div class="filters">
      <label>Start Date: <input type="date" v-model="startDate" /></label>
      <label>End Date: <input type="date" v-model="endDate" /></label>
      <label>Sort by Date: 
        <select v-model="sortByDate">
          <option>Most Recent</option>
          <option>Oldest First</option>
        </select>
      </label>
      <label>Sort by Score: 
        <select v-model="sortByScore">
          <option>Less to More</option>
          <option>More to Less</option>
        </select>
      </label>
      <button @click="getTestRecords">Filter</button>
    </div>

    <div v-if="testRecords.length === 0">
      <p>No test records found.</p>
    </div>

    <div v-else>
      <div class="record" v-for="record in filteredTestRecords" :key="record.id">
        <p><strong>Date:</strong> {{ record.date.toDate().toLocaleDateString() }}</p>
        <p><strong>Score:</strong> {{ record.score }}</p>
      </div>

      <div class="pagination">
        <button @click="prevPage" :disabled="currentPage === 1">Previous</button>
        <span>{{ currentPage }} of {{ totalPages }}</span>
        <button @click="nextPage" :disabled="currentPage === totalPages">Next</button>
      </div>
    </div>

    <div class="average-score">
      <p>Average Score: {{ averageScore.toFixed(2) }}</p>
      <p>{{ recommendation }}</p>
    </div>
  </div>
</template>

<style scoped>
.test-history-container {
  max-width: 800px;
  margin: 0 auto;
}

.filters {
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  background-color: #f8f8f8;
}

.record {
  border: 1px solid #ddd;
  padding: 1rem;
  margin: 1rem 0;
}

.pagination {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
}

.average-score {
  margin-top: 2rem;
}
</style>
