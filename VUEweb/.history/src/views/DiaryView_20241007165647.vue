<template>
  <div class="diary-container">
    <header class="header">
      <img src="@/assets/logo.png" alt="Logo" class="logo" />
      <div class="header-text">
        <h1>Diary Entries</h1>
        <p>{{ currentDate }}</p>
      </div>
    </header>

    <!-- Filters for date and sorting -->
    <section class="filters">
      <label>Start Date: <input type="date" v-model="startDate" /></label>
      <label>End Date: <input type="date" v-model="endDate" /></label>
      <label>
        Sort by Date: 
        <select v-model="dateSortOrder" @change="sortByDate">
          <option value="recent">Most Recent</option>
          <option value="oldest">Oldest First</option>
        </select>
      </label>
    </section>

    <!-- Diary entries grid -->
    <div class="diary-grid">
      <div class="diary-item" v-for="diary in paginatedDiaries" :key="diary.date">
        <p><strong>Date:</strong> {{ formatDate(new Date(diary.date)) }}</p>
        <p>{{ diary.entry }}</p>
      </div>
    </div>

    <!-- Pagination -->
    <div class="pagination">
      <button @click="prevPage" :disabled="currentPage === 1" class="pagination-btn">Previous</button>
      <span>Page {{ currentPage }} of {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage === totalPages" class="pagination-btn">Next</button>
    </div>

    <!-- Create new diary entry button -->
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

const db = getFirestore()
const auth = getAuth()
const user = auth.currentUser
const router = useRouter()

// Redirect to new diary entry page
const goToNewDiary = () => {
  router.push('/newdiary')
}

const currentDate = new Date().toLocaleDateString()

// Diary entry data
const diaries = ref([])
const startDate = ref('')
const endDate = ref('')
const currentPage = ref(1)
const itemsPerPage = 4
const dateSortOrder = ref('recent')

const getDiaries = async () => {
  const q = query(collection(db, 'diaryEntries'), where('email', '==', user.email))
  const querySnapshot = await getDocs(q)
  diaries.value = querySnapshot.docs.map(doc => doc.data())
}
getDiaries()

// Filter diaries by date range
const filteredDiaries = computed(() => {
  return diaries.value.filter(diary => {
    const diaryDate = new Date(diary.date)
    return (!startDate.value || diaryDate >= new Date(startDate.value)) &&
           (!endDate.value || diaryDate <= new Date(endDate.value))
  })
})

// Sort diaries by date
const sortByDate = () => {
  if (dateSortOrder.value === 'recent') {
    diaries.value.sort((a, b) => new Date(b.date) - new Date(a.date))
  } else {
    diaries.value.sort((a, b) => new Date(a.date) - new Date(b.date))
  }
}

// Paginate the diary entries
const paginatedDiaries = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredDiaries.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(filteredDiaries.value.length / itemsPerPage))

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--
}

// Format date
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
.pagination-btn {
  background-color: #4CAF50; /* Keep the green color as requested */
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
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
  background-color: #4CAF50; /* Keep the green color */
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
  color: #4CAF50;
  font-size: 16px;
}
</style>
