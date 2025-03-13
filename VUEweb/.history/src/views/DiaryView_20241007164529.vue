<template>
  <div class="diary-container">
    <!-- 日记卡片显示 -->
    <div class="diary-grid">
      <div class="diary-item" v-for="diary in paginatedDiaries" :key="diary.date">
        <p><strong>日期:</strong> {{ formatDate(new Date(diary.date)) }}</p>
        <p>{{ diary.entry }}</p>
      </div>
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

// 获取日记记录
const diaries = ref([])
const currentPageDiary = ref(1)
const itemsPerPage = 4

const getDiaries = async () => {
  const q = query(collection(db, 'diaryEntries'), where('email', '==', user.email))
  const querySnapshot = await getDocs(q)
  diaries.value = querySnapshot.docs.map(doc => doc.data())
}
getDiaries()

// 分页日记
const paginatedDiaries = computed(() => {
  const start = (currentPageDiary.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return diaries.value.slice(start, end)
})

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
  background-color: #4caf50;
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
  color: #4caf50;
  font-size: 16px;
}
</style>
