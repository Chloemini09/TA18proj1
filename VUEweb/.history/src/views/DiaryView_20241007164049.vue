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

    <!-- 新建日记 -->
    <section class="diary-section">
      <h2>新建日记</h2>
      <textarea v-model="newDiaryEntry" placeholder="写下你的日记..."></textarea>
      <button @click="saveDiary">保存日记</button>
    </section>

    <!-- 查看日记 -->
    <section class="diary-section">
      <h2>查看以往日记</h2>
      <div class="filters">
        <label>开始日期: <input type="date" v-model="startDateDiary" /></label>
        <label>结束日期: <input type="date" v-model="endDateDiary" /></label>

        <!-- 日期排序下拉框 -->
        <label>
          Sort by Date: 
          <select v-model="dateSortOrderDiary" @change="sortByDateDiary">
            <option value="recent">Most Recent</option>
            <option value="oldest">Oldest First</option>
          </select>
        </label>
      </div>

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
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getFirestore, collection, query, where, getDocs, addDoc } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

// 初始化 Firebase
const db = getFirestore()
const auth = getAuth()
const user = auth.currentUser

// 当前日期
const currentDate = new Date().toLocaleDateString()

// 新建日记
const newDiaryEntry = ref('')

// 保存日记到 Firebase
const saveDiary = async () => {
  if (newDiaryEntry.value.trim() === '') return
  await addDoc(collection(db, 'diaryEntries'), {
    email: user.email,
    entry: newDiaryEntry.value,
    date: new Date().toLocaleString(), // 日期为字符串格式
  })
  newDiaryEntry.value = '' // 清空文本框
  getDiaries() // 重新加载日记
}

// 获取日记记录
const diaries = ref([])
const startDateDiary = ref('')
const endDateDiary = ref('')
const currentPageDiary = ref(1)
const itemsPerPage = 10
const dateSortOrderDiary = ref('recent') // 默认按最新排序

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

// 分页计算
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
.diary-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}
.diary-item {
  border: 1px solid #ddd;
  padding: 10px;
}
.pagination {
  margin-top: 10px;
  text-align: center;
}
</style>
