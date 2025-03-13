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

    <section class="average-score">
      <h3>Average Score: {{ averageScore.toFixed(2) }}</h3>
      <p>{{ recommendation }}</p>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { getFirestore, collection, query, where, getDocs, Timestamp } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const db = getFirestore()
const auth = getAuth()
const user = auth.currentUser

const testRecords = ref([])
const startDate = ref('')
const endDate = ref('')
const currentPage = ref(1)
const itemsPerPage = 10
const dateSortOrder = ref('recent')
const scoreSortOrder = ref('asc')

const currentDate = new Date().toLocaleDateString()

const getTestRecords = async () => {
  if (!user) {
    console.error('No user logged in!')
    return
  }

  let q = query(collection(db, 'healthTestResults'), where('email', '==', user.email))

  if (startDate.value && endDate.value) {
    const startTimestamp = Timestamp.fromDate(new Date(startDate.value))
    const endDateObj = new Date(endDate.value)
    endDateObj.setHours(23, 59, 59, 999)
    const endTimestamp = Timestamp.fromDate(endDateObj)
    
    q = query(
      collection(db, 'healthTestResults'),
      where('email', '==', user.email),
      where('date', '>=', startTimestamp),
      where('date', '<=', endTimestamp)
    )
  }

  const querySnapshot = await getDocs(q)
  testRecords.value = querySnapshot.docs.map(doc => ({
    ...doc.data(),
    date: doc.data().date.toDate() // Convert Timestamp to Date
  }))

  sortRecords()
}

onMounted(getTestRecords)
watch([startDate, endDate], getTestRecords)

const sortRecords = () => {
  testRecords.value.sort((a, b) => {
    if (dateSortOrder.value === 'recent') {
      return b.date - a.date
    } else {
      return a.date - b.date
    }
  })

  if (scoreSortOrder.value !== 'none') {
    testRecords.value.sort((a, b) => {
      return scoreSortOrder.value === 'asc' ? a.score - b.score : b.score - a.score
    })
  }
}

const filteredTestRecords = computed(() => {
  return testRecords.value.filter(record => {
    return (!startDate.value || record.date >= new Date(startDate.value)) &&
           (!endDate.value || record.date <= new Date(endDate.value))
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

const formatDate = (date) => {
  return date.toLocaleDateString()
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
