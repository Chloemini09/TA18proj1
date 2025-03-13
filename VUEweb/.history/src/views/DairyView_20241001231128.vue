<template>
  <div class="dairy-container">
    <!-- 固定格式的头部 -->
    <header class="header">
      <img src="@/assets/logo.png" alt="Health Test Logo" class="logo" />
      <div class="header-text">
        <h1>心理日记</h1>
        <p>{{ currentDate }}</p>
      </div>
    </header>

    <!-- 心理测试模块 -->
    <section class="test-section">
      <h2>心理测试</h2>
      <button @click="goToHealthTest" class="test-btn">开始心理测试</button>
    </section>

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

      <!-- 心理评分和建议 -->
      <div class="average-score">
        <h3>心理评分均值: {{ averageScore.toFixed(2) }}</h3>
        <p>{{ recommendation }}</p>
      </div>
    </section>

    <!-- 新建日记 -->
    <section class="diary-section">
      <h2>新建日记</h2>
      <textarea v-model="newDiaryEntry" placeholder="写下你的日记..."></textarea>
      <button @click="saveDiary">保存日记</button>

      <!-- 查看日记 -->
      <h2>查看以往日记</h2>
      <div class="filters">
        <label>开始日期: <input type="date" v-model="startDateDiary" /></label>
        <label>结束日期: <input type="date" v-model="endDateDiary" /></label>
      </div>
      <div class="diary-grid">
        <div class="diary-item" v-for="diary in paginatedDiaries" :key="diary.date">
          <p><strong>日期:</strong> {{ diary.date }}</p>
          <p>{{ diary.entry }}</p>
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination">
        <button @click="prevPageDiary" :disabled="currentPageDiary === 1">上一页</button>
        <span>第 {{ currentPageDiary }} 页</span>
        <button @click="nextPageDiary" :disabled="currentPageDiary === totalDiaryPages">下一页</button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getFirestore, collection, query, where, getDocs, addDoc } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

// 初始化 Firebase 和路由
const db = getFirestore()
const auth = getAuth()
const user = auth.currentUser
const router = useRouter()

// 当前日期
const currentDate = new Date().toLocaleDateString()

// 心理测试模块跳转
const goToHealthTest = () => {
  router.push('/healthtest')
}

// 1. 心理测试记录
const testRecords = ref([])
const startDate = ref('')
const endDate = ref('')
const currentPage = ref(1)
const itemsPerPage = 10

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

// 2. 心理评分和建议
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

// 3. 新建日记及查看日记
const newDiaryEntry = ref('')
const diaries = ref([])
const startDateDiary = ref('')
const endDateDiary = ref('')
const currentPageDiary = ref(1)

const saveDiary = async () => {
  if (newDiaryEntry.value.trim() === '') return
  await addDoc(collection(db, 'diaryEntries'), {
    email: user.email,
    entry: newDiaryEntry.value,
    date: new Date().toLocaleString(),
  })
  newDiaryEntry.value = '' // 清空文本框
  getDiaries() // 重新加载日记
}

// 获取用户日记
const getDiaries = async () => {
  const q = query(collection(db, 'diaryEntries'), where('email', '==', user.email))
  const querySnapshot = await getDocs(q)
  diaries.value = querySnapshot.docs.map(doc => doc.data())
}
getDiaries()

// 分页与过滤日记
const filteredDiaries = computed(() => {
  return diaries.value.filter(diary => {
    return (!startDateDiary.value || diary.date >= startDateDiary.value) &&
           (!endDateDiary.value || diary.date <= endDateDiary.value)
  })
})

const paginatedDiaries = computed(() => {
  const start = (currentPageDiary.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredDiaries.value.slice(start, end)
})

const totalDiaryPages = computed(() => Math.ceil(filteredDiaries.value.length / itemsPerPage))

const nextPageDiary = () => {
  if (currentPageDiary.value < totalDiaryPages.value) currentPageDiary.value++
}

const prevPageDiary = () => {
  if (currentPageDiary.value > 1) currentPageDiary.value--
}
</script>

<style scoped>
.dairy-container {
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
.records-grid, .diary-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}
.record-item, .diary-item {
  border: 1px solid #ddd;
  padding: 10px;
}
.pagination {
  margin-top: 10px;
  text-align: center;
}
</style>
