<template>
  <div class="test-history-container">
    <header class="header">
      <img src="@/assets/logo.png" alt="Health Test Logo" class="logo" />
      <div class="header-text">
        <h1>Past Mental Health Test Records</h1>
        <p>{{ currentDate }}</p>
      </div>
    </header>

    <section class="filters">
      <label>Start Date: <input type="date" v-model="startDate" /></label>
      <label>End Date: <input type="date" v-model="endDate" /></label>

      <!-- 日期排序下拉框 -->
      <label>
        Sort by Date: 
        <select v-model="dateSortOrder" @change="sortByDate">
          <option value="recent">Most Recent</option>
          <option value="oldest">Oldest First</option>
        </select>
      </label>

      <!-- 分数排序下拉框 -->
      <label>
        Sort by Score: 
        <select v-model="scoreSortOrder" @change="sortByScore">
          <option value="asc">Less to More</option>
          <option value="desc">More to Less</option>
        </select>
      </label>
    </section>

    <section v-if="filteredTestRecords.length > 0" class="records">
      <div class="record-item" v-for="record in paginatedRecords" :key="record.date">
        <p><strong>Date:</strong> {{ formatDate(record.date) }}</p>
        <p><strong>Score:</strong> {{ record.score }}</p>
      </div>
      <div class="pagination">
        <button @click="prevPage" :disabled="currentPage === 1">Previous</button>
        <span>Page {{ currentPage }} of {{ totalPages }}</span>
        <button @click="nextPage" :disabled="currentPage === totalPages">Next</button>
      </div>
    </section>

    <section v-else>
      <p>No test records found.</p>
    </section>

    <!-- 新增跳转到 AverageScoreView 的按钮 -->
    <section class="average-score-navigation">
      <button @click="goToAverageScore" class="export-btn">Go to Average Score</button>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getFirestore, collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { useRouter } from 'vue-router'

const db = getFirestore()
const auth = getAuth()
const user = auth.currentUser
const router = useRouter()

// 初始化状态
const testRecords = ref([])
const startDate = ref('')
const endDate = ref('')
const currentPage = ref(1)
const itemsPerPage = 10

// 排序方式的状态
const dateSortOrder = ref('recent') // 默认按最近排序
const scoreSortOrder = ref('asc')   // 默认按分数升序排序

// 获取当前日期
const currentDate = new Date().toLocaleDateString()

// 获取用户测试记录
const getTestRecords = async () => {
  if (!user) {
    console.error('No user logged in!')
    return
  }

  let q = query(collection(db, 'healthTestResults'), where('email', '==', user.email))

  if (startDate.value && endDate.value) {
    const startTimestamp = Timestamp.fromDate(new Date(new Date(startDate.value).setHours(0, 0, 0, 0)))
    const endTimestamp = Timestamp.fromDate(new Date(new Date(endDate.value).setHours(23, 59, 59, 999)))

    q = query(
      collection(db, 'healthTestResults'),
      where('email', '==', user.email),
      where('date', '>=', startTimestamp),
      where('date', '<=', endTimestamp)
    )
  }

  try {
    const querySnapshot = await getDocs(q)
    testRecords.value = querySnapshot.docs.map(doc => doc.data())
    sortByDate()
  } catch (error) {
    console.error('Error fetching test records:', error)
  }
}

getTestRecords()

const sortByDate = () => {
  if (dateSortOrder.value === 'recent') {
    testRecords.value.sort((a, b) => new Date(b.date.seconds * 1000) - new Date(a.date.seconds * 1000))
  } else {
    testRecords.value.sort((a, b) => new Date(a.date.seconds * 1000) - new Date(b.date.seconds * 1000))
  }
}

const sortByScore = () => {
  if (scoreSortOrder.value === 'asc') {
    testRecords.value.sort((a, b) => a.score - b.score)
  } else {
    testRecords.value.sort((a, b) => b.score - a.score)
  }
}

const filteredTestRecords = computed(() => {
  return testRecords.value.filter(record => {
    return (!startDate.value || record.date.toDate() >= new Date(startDate.value)) &&
           (!endDate.value || record.date.toDate() <= new Date(endDate.value))
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

// 跳转到 AverageScoreView
const goToAverageScore = () => {
  router.push('/average-score')
}
</script>

<style scoped>
.test-history-container {
  max-width: 800px;
  margin: auto;
  padding: 20px;
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
.records {
  margin-top: 20px;
}
.record-item {
  padding: 10px;
  border-bottom: 1px solid #ddd;
}
.pagination {
  margin-top: 10px;
  text-align: center;
}
.filters {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
}
.filters label {
  display: flex;
  align-items: center;
  gap: 10px;
}
.average-score-navigation {
  margin-top: 20px;
  text-align: center;
}

.export-btn {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  font-size: 1rem;
  border-radius: 5px;
  margin-top: 20px;
}

.export-btn:hover {
  background-color: #45a049;
}
</style>
