<template>
  <div class="test-history-container">
    <!-- 固定格式的头部 -->
    <header class="header">
      <img src="@/assets/logo.png" alt="Health Test Logo" class="logo" />
      <div class="header-text">
        <h1>Test History</h1>
        <p>{{ currentDate }}</p>
      </div>
    </header>

    <!-- 心理测试记录 -->
    <section class="history-section">
      <h2>Past Mental Health Test Records</h2>
      <div class="filters">
        <label>Start Date: <input type="date" v-model="startDate" /></label>
        <label>End Date: <input type="date" v-model="endDate" /></label>
        <button @click="sortByDate" class="btn-filter">Sort by Date</button>
        <button @click="sortByScore" class="btn-filter">Sort by Score</button>
      </div>

      <!-- 分页与显示 -->
      <div v-if="paginatedRecords.length === 0" class="no-records">
        <p>No test records found for the selected date range.</p>
      </div>
      
      <div v-else class="records-grid">
        <div class="record-item" v-for="record in paginatedRecords" :key="record.date">
          <p><strong>Date:</strong> {{ formatDate(record.date) }}</p>
          <p><strong>Score:</strong> {{ record.score }}</p>
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination">
        <button @click="prevPage" :disabled="currentPage === 1" class="btn-nav">Previous</button>
        <span>Page {{ currentPage }} of {{ totalPages }}</span>
        <button @click="nextPage" :disabled="currentPage === totalPages" class="btn-nav">Next</button>
      </div>

      <!-- 心理评分和建议 -->
      <div class="average-score">
        <h3>Average Score: {{ averageScore.toFixed(2) }}</h3>
        <p>{{ recommendation }}</p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// 初始化 Firebase
const db = getFirestore();
const auth = getAuth();
const user = auth.currentUser;

// 当前日期
const currentDate = new Date().toLocaleDateString();

// 心理测试记录
const testRecords = ref([]);
const startDate = ref('');
const endDate = ref('');
const currentPage = ref(1);
const itemsPerPage = 10;

// 获取心理测试记录
const getTestRecords = async () => {
  if (user) {
    const q = query(collection(db, 'healthTestResults'), where('email', '==', user.email));
    const querySnapshot = await getDocs(q);
    testRecords.value = querySnapshot.docs.map(doc => doc.data());
  }
};
getTestRecords();

// 格式化日期
const formatDate = (date) => {
  return new Date(date).toISOString().split('T')[0]; // 返回 YYYY-MM-DD 格式
};

// 分页与过滤
const filteredTestRecords = computed(() => {
  return testRecords.value.filter(record => {
    const recordDate = formatDate(record.date);
    return (!startDate.value || recordDate >= startDate.value) &&
           (!endDate.value || recordDate <= endDate.value);
  });
});

const paginatedRecords = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredTestRecords.value.slice(start, end);
});

const totalPages = computed(() => Math.ceil(filteredTestRecords.value.length / itemsPerPage));

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++;
};

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--;
};

// 心理测试记录的排序功能
const sortByDate = () => {
  testRecords.value.sort((a, b) => new Date(a.date) - new Date(b.date));
};

const sortByScore = () => {
  testRecords.value.sort((a, b) => a.score - b.score);
};

// 心理评分和建议
const averageScore = computed(() => {
  if (testRecords.value.length === 0) return 0;
  const total = testRecords.value.reduce((sum, record) => sum + record.score, 0);
  return total / testRecords.value.length;
});

const recommendation = computed(() => {
  if (averageScore.value <= 20) {
    return "Your mental health seems to be in a great state. Keep it up!";
  } else if (averageScore.value <= 40) {
    return "It seems like you might be facing some challenges. Consider talking to a friend or professional.";
  } else {
    return "We recommend that you seek support from a mental health professional.";
  }
});
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
.filters {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}
.filters label {
  margin-right: 10px;
}
.records-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}
.record-item {
  border: 1px solid #ddd;
  padding: 10px;
}
.pagination {
  margin-top: 20px;
  text-align: center;
}
.btn-nav, .btn-filter {
  background-color: #4caf50;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin: 0 10px;
}
.btn-nav:disabled, .btn-filter:disabled {
  background-color: #ccc;
}
.btn-nav:hover, .btn-filter:hover {
  background-color: #388e3c;
}
.average-score {
  margin-top: 30px;
}
</style>
