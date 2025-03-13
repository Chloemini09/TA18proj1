<template>
  <div class="test-history-container">
    <!-- 固定格式的头部 -->
    <header class="header">
      <img src="@/assets/logo.png" alt="Health Test Logo" class="logo" />
      <div class="header-text">
        <h1>心理测试历史记录</h1>
        <p>{{ currentDate }}</p>
      </div>
    </header>

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

// 分页与过滤
const filteredTestRecords = computed(() => {
  return testRecords.value.filter(record => {
    return (!startDate.value || record.date >= startDate.value) &&
           (!endDate.value || record.date <= endDate.value);
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
  margin-top: 10px;
  text-align: center;
}
.average-score {
  margin-top: 20px;
}
</style>
