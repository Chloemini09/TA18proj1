<template>
  <div class="dairy-container">
    <h1>心理日记</h1>

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

      <table>
        <thead>
          <tr>
            <th>日期</th>
            <th>分数</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="record in filteredTestRecords" :key="record.date">
            <td>{{ record.date }}</td>
            <td>{{ record.score }}</td>
          </tr>
        </tbody>
      </table>

      <!-- 心理评分和建议 -->
      <div class="average-score">
        <h3>心理评分均值: {{ averageScore }}</h3>
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
      <ul>
        <li v-for="diary in filteredDiaries" :key="diary.date">
          <p>{{ diary.date }}</p>
          <p>{{ diary.entry }}</p>
        </li>
      </ul>
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

// 心理测试模块跳转
const goToHealthTest = () => {
  router.push('/healthtest')
}

// 1. 心理测试记录
const testRecords = ref([])
const startDate = ref('')
const endDate = ref('')
const getTestRecords = async () => {
  const q = query(collection(db, 'healthTestResults'), where('email', '==', user.email))
  const querySnapshot = await getDocs(q)
  testRecords.value = querySnapshot.docs.map(doc => doc.data())
}
getTestRecords()

// 根据日期范围过滤
const filteredTestRecords = computed(() => {
  return testRecords.value.filter(record => {
    return (!startDate.value || record.date >= startDate.value) &&
           (!endDate.value || record.date <= endDate.value)
  })
})

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

// 根据日期范围过滤日记
const filteredDiaries = computed(() => {
  return diaries.value.filter(diary => {
    return (!startDateDiary.value || diary.date >= startDateDiary.value) &&
           (!endDateDiary.value || diary.date <= endDateDiary.value)
  })
})
</script>

<style scoped>
.dairy-container {
  max-width: 800px;
  margin: auto;
  padding: 20px;
}
.test-section, .history-section, .diary-section {
  margin-bottom: 40px;
}
.filters label {
  margin-right: 10px;
}
.test-btn, .save-btn {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 10px 20px;
  margin-top: 10px;
  cursor: pointer;
}
textarea {
  width: 100%;
  height: 100px;
  margin-top: 10px;
}
table {
  width: 100%;
  margin-top: 10px;
  border-collapse: collapse;
}
table, th, td {
  border: 1px solid #ddd;
  text-align: left;
}
th, td {
  padding: 8px;
}
</style>
