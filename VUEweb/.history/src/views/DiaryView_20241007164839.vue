<template>
  <div class="diary-container">
    <!-- 固定格式的头部 -->
    <header class="header">
      <img src="@/assets/logo.png" alt="Health Test Logo" class="logo" />
      <div class="header-text">
        <h1>心理日记</h1>
        <p>{{ currentDate }}</p>
      </div>
    </header>

    <!-- 日期过滤和排序功能 -->
    <section class="filters">
      <label>开始日期: <input type="date" v-model="startDateDiary" /></label>
      <label>结束日期: <input type="date" v-model="endDateDiary" /></label>

      <!-- 日期排序下拉框 -->
      <label>
        按日期排序: 
        <select v-model="dateSortOrderDiary" @change="sortByDateDiary">
          <option value="recent">最近优先</option>
          <option value="oldest">最早优先</option>
        </select>
      </label>
    </section>

    <!-- 日记卡片显示 -->
    <div class="diary-grid">
      <div class="diary-item" v-for="diary in paginatedDiaries" :key="diary.date">
        <p><strong>日期:</strong> {{ formatDate(new Date(diary.date)) }}</p>
        <p>{{ diary.entry }}</p>
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination">
      <button @click="prevPageDiary" :disabled="currentPageDiary === 1">上一页</button>
      <span>第 {{ currentPageDiary }} 页</span>
      <button @click="nextPageDiary" :disabled="currentPageDiary === totalDiaryPages">下一页</button>
    </div>

    <!-- 新建日记按钮 -->
    <div class="new-diary-button" @click="goToNewDiary">
      <span class="plus-icon">+</span>
      <p>Create new diary</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

// 初始化 Firebase 和路由
const db = getFirestore()
const auth = getAuth()
const user = auth.currentUser
const router = useRouter()

// 跳转到新日记页面
const goToNewDiary = () => {
  router.push('/newdiary')
}

// 当前日期
const currentDate = new Date().toLocaleDateString()

// 获取日记记录
const diaries = ref([])
const startDateDiary = ref('')
const endDateDiary = ref('')
const currentPageDiary = ref(1)
const itemsPerPage = 4
const dateSortOrderDiary = ref('recent') // 默认按最新排序

const getDiaries = async () => {
  const q = query(collection(db, 'diaryEntries'), where('email', '==', user.email))
  const querySnapshot = await getDocs(q)
  diaries.value = querySnapshot.docs.map(doc => doc.data())
}
getDiaries()

// 根据日期范围过滤日记
const filteredDiaries = computed(() => {
  return diaries.value.filter(diary => {
    const diaryDate = new Date(diary.date)
    return (!startDateDiary.value || diaryDate >= new Date(startDateDiary.value)) &&
           (!endDateDiary.value || diaryDate <= new Date(endDateDiary.value))
  })
})

// 根据日期排序日记
const sortByDateDiary = () => {
  if (dateSortOrderDiary.value === 'recent') {
    diaries.value.sort((a, b) => new Date(b.date) - new Date(a.date))
  } else {
    diaries.value.sort((a, b) => new Date(a.date) - new Date(b.date))
  }
}

// 分页日记
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

// 格式化日期
const formatDate = (date) => {
  return date.toLocaleDateString()
}
</script>

<style scoped>
.diary-container {
  max-width: 800px;
  margin: auto;
  padding: 20px;
  position: relative;
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
.filters {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
}
.diary-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}
.diary-item {
  border-radius: 10px;
  background-color: white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  min-height: 100px;
}
.pagination {
  margin-top: 10px;
  text-align: center;
}
.new-diary-button {
  position: fixed;
  bottom: 30px;
  right: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  text-align: center;
}
.plus-icon {
  font-size: 40px;
  background-color: #007bff;
  color: white;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.new-diary-button p {
  margin-top: 10px;
  color: #007bff;
  font-size: 16px;
}
</style>
