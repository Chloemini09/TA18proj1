<template>
    <div class="test-container">
      <header class="test-header">
        <div class="header-left">
          <img src="@/assets/logo.png" alt="Logo" class="logo" />
          <h1>Health Test</h1>
        </div>
        <div class="header-right">
          <p class="date">{{ currentDate }}</p>
        </div>
      </header>
  
      <div class="welcome-message">
        <h2>Hi, {{ username }}</h2>
        <p>Complete the following test to get your health score.</p>
      </div>
  
      <div class="test-questions">
        <h3>Health Test Questions</h3>
        <ul>
          <li v-for="(question, index) in questions" :key="index" class="question-item">
            <h4>{{ question.text }}</h4>
            <div v-for="(option, i) in question.options" :key="i">
              <input 
                type="radio" 
                :name="'question' + index" 
                :value="option.score" 
                @change="selectOption(index, option.score)" 
              />
              {{ option.text }}
            </div>
          </li>
        </ul>
      </div>
  
      <div class="test-result">
        <button @click="submitTest" class="submit-button">Submit Test</button>
        <p v-if="testResultMessage" class="result-message">{{ testResultMessage }}</p>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  
  const username = ref(localStorage.getItem('currentUser') || 'User');
  const currentDate = ref('');
  const selectedAnswers = ref([]);
  const testResultMessage = ref('');
  const totalScore = ref(0);
  
  // 定义问题和选项
  const questions = ref([
    {
      text: "Are you confident about the future?",
      options: [
        { text: "I have enough confidence in the future.", score: 1 },
        { text: "I am not confident about the future.", score: 2 },
        { text: "I feel there is nothing to expect from the future.", score: 3 },
        { text: "I feel the future is hopeless, and there is no chance for improvement.", score: 4 }
      ]
    },
    // 继续添加其他问题...
  ]);
  
  // 格式化当前日期
  function formatDate(date) {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }
  
  // 选择答案
  function selectOption(index, score) {
    selectedAnswers.value[index] = score;
  }
  
  // 提交测试并计算分数
  function submitTest() {
    if (selectedAnswers.value.length === questions.value.length) {
      totalScore.value = selectedAnswers.value.reduce((acc, score) => acc + score, 0);
      testResultMessage.value = `Your health test score is: ${totalScore.value}`;
    } else {
      testResultMessage.value = 'Please complete all questions before submitting.';
    }
  }
  
  // 页面加载时设置当前日期
  onMounted(() => {
    const today = new Date();
    currentDate.value = formatDate(today);
  });
  </script>
  
  <style scoped>
  .test-container {
    padding: 2rem;
    font-family: 'Arial', sans-serif;
  }
  
  .test-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 1rem;
    border-bottom: 2px solid #e0e0e0;
  }
  
  .header-left {
    display: flex;
    align-items: center;
  }
  
  .logo {
    width: 50px;
    height: 50px;
    margin-right: 10px;
  }
  
  .test-header h1 {
    font-size: 2rem;
    color: #333;
  }
  
  .header-right {
    font-size: 1rem;
    color: #666;
  }
  
  .welcome-message {
    margin: 2rem 0;
  }
  
  .welcome-message h2 {
    font-size: 1.8rem;
    color: #333;
  }
  
  .welcome-message p {
    font-size: 1.2rem;
    color: #666;
  }
  
  .test-questions {
    margin: 2rem 0;
  }
  
  .test-questions h3 {
    font-size: 1.5rem;
    color: #4caf50;
  }
  
  .question-item {
    background-color: #f9f9f9;
    padding: 1rem;
    border-radius: 5px;
    margin-bottom: 1rem;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  .question-item h4 {
    font-size: 1.3rem;
    margin-bottom: 0.5rem;
  }
  
  .question-item div {
    font-size: 1rem;
    color: #666;
    margin-bottom: 0.5rem;
  }
  
  .test-result {
    margin-top: 2rem;
  }
  
  .submit-button {
    background-color: #4caf50;
    color: white;
    padding: 1rem 2rem;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1.2rem;
  }
  
  .submit-button:hover {
    background-color: #388e3c;
  }
  
  .result-message {
    margin-top: 1rem;
    font-size: 1.2rem;
    color: #4caf50;
  }
  </style>