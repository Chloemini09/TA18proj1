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
      <label>Start Date: <input type="date" v-model="startDate" @change="getTestRecords" /></label>
      <label>End Date: <input type="date" v-model="endDate" @change="getTestRecords" :min="startDate" /></label>

      <label>
        Sort by Date: 
        <select v-model="dateSortOrder" @change="sortByDate">
          <option value="recent">Most Recent</option>
          <option value="oldest">Oldest First</option>
        </select>
      </label>

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

    <section class="average-score">
      <h3>Average Score: {{ averageScore.toFixed(2) }}</h3>
      <p>{{ recommendation }}</p>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { getFirestore, collection, query, where, getDocs, orderBy, Timestamp, addDoc } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const db = getFirestore()
const auth = getAuth()
const user = auth.currentUser

// 初始化状态
const testRecords = ref([])
const startDate = ref('')
const endDate = ref('')
const currentPage = ref(1)
const itemsPerPage = 10

// 排序方式的状态
const dateSortOrder = ref('recent')
const scoreSortOrder = ref('asc')

// 获取当前日期
const currentDate = new Date().toLocaleDateString()

// 创建 UTC+10 的日期对象
const createUTC10Date = (dateString) => {
  const date = new Date(dateString)
  return new Date(Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    -14, // 10小时的差值，考虑到日期变更线
    0,
    0
  ))
}

// 获取用户测试记录
const getTestRecords = async () => {
  if (!user) {
    console.error('No user logged in!')
    return
  }

  let q = query(collection(db, 'healthTestResults'), where('email', '==', user.email))

  if (startDate.value && endDate.value) {
    const startTimestamp = Timestamp.fromDate(createUTC10Date(startDate.value))
    // 结束日期设置为下一天的 UTC+10 00:00
    const endTimestamp = Timestamp.fromDate(
      new Date(createUTC10Date(endDate.value).getTime() + 24 * 60 * 60 * 1000)
    )

    q = query(
      collection(db, 'healthTestResults'),
      where('email', '==', user.email),
      where('date', '>=', startTimestamp),
      where('date', '<', endTimestamp)
    )

    console.log('查询参数 (UTC+10):', { 
      startDate: startTimestamp.toDate(), 
      endDate: endTimestamp.toDate() 
    })
  }

  try {
    const querySnapshot = await getDocs(q)
    testRecords.value = querySnapshot.docs.map(doc => doc.data())
    console.log('获取的记录:', testRecords.value)
    sortByDate()
  } catch (error) {
    console.error('Error fetching test records:', error)
  }
}

// 监听日期变化
watch([startDate, endDate], () => {
  getTestRecords()
})

// 根据用户选择的日期排序方式
const sortByDate = () => {
  testRecords.value.sort((a, b) => {
    const dateA = a.date.toDate()
    const dateB = b.date.toDate()
    return dateSortOrder.value === 'recent' ? dateB - dateA : dateA - dateB
  })
}

// 根据用户选择的分数排序方式
const sortByScore = () => {
  testRecords.value.sort((a, b) => 
    scoreSortOrder.value === 'asc' ? a.score - b.score : b.score - a.score
  )
}

// 分页与过滤
const filteredTestRecords = computed(() => {
  return testRecords.value.filter(record => {
    const recordDate = record.date.toDate()
    const startDateTime = startDate.value ? createUTC10Date(startDate.value) : null
    const endDateTime = endDate.value ? 
      new Date(createUTC10Date(endDate.value).getTime() + 24 * 60 * 60 * 1000) : null

    return (!startDateTime || recordDate >= startDateTime) &&
           (!endDateTime || recordDate < endDateTime)
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

// 计算平均分
const averageScore = computed(() => {
  if (filteredTestRecords.value.length === 0) return 0
  const total = filteredTestRecords.value.reduce((sum, record) => sum + record.score, 0)
  return total / filteredTestRecords.value.length
})

// 根据平均分生成建议
const recommendation = computed(() => {
  if (averageScore.value <= 20) {
    return "Your mental health seems to be in a great state. Keep it up!"
  } else if (averageScore.value <= 40) {
    return "It seems like you might be facing some challenges. Consider talking to a friend or professional."
  } else {
    return "We recommend that you seek support from a mental health professional."
  }
})

// 格式化日期
const formatDate = (timestamp) => {
  const date = timestamp.toDate()
  const utc10Date = new Date(date.getTime() + (10 * 60 * 60 * 1000))
  return utc10Date.toLocaleDateString('en-AU', { timeZone: 'Australia/Sydney' })
}

// 存储新记录
const saveTestRecord = async (testData) => {
  try {
    const now = new Date()
    const utc10Now = new Date(now.getTime() + (10 * 60 * 60 * 1000))
    await addDoc(collection(db, 'healthTestResults'), {
      ...testData,
      date: Timestamp.fromDate(utc10Now),
      email: user.email
    })
  } catch (error) {
    console.error('Error saving test record:', error)
  }
}

// 初始加载
onMounted(() => {
  getTestRecords()
})
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
.filters button {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  font-size: 1rem;
  border-radius: 5px;
}
.filters button:hover {
  background-color: #45a049;
}
.average-score {
  margin-top: 20px;
  text-align: center;
}
</style>