<template>
    <div class="health-test">
      <header class="header">
        <img src="@/assets/logo.png" alt="Health Test Logo" class="logo" />
        <div class="header-text">
          <h1>Health Test</h1>
          <p>{{ currentDate }}</p>
        </div>
      </header>
      
      <form @submit.prevent="submitTest">
        <div v-for="(question, index) in questionList" :key="index" class="question-block">
          <h2>{{ index + 1 }}. {{ question.text }}</h2>
          <div class="options">
            <label v-for="(option, idx) in question.options" :key="idx">
              <input type="radio" :name="'question-' + index" :value="option.score" v-model="answers[index]" />
              {{ option.text }}
            </label>
          </div>
        </div>
        
        <button type="submit" class="submit-btn">Submit</button>
      </form>
  
      <!-- 返回按钮 -->
      <button @click="goHome" class="back-btn">Return to Home</button>
  
      <!-- 未完成提示 -->
      <div v-if="showWarning" class="warning-modal">
        <div class="warning-content">
          <h2>Try harder! Believe yourself!</h2>
          <p>unfinished questions:</p>
          <ul>
            <li v-for="(q, idx) in incompleteQuestions" :key="idx">Question {{ q + 1 }}</li>
          </ul>
          <button @click="closeWarning" class="close-btn">Close</button>
        </div>
      </div>
  
      <!-- 弹窗显示测试结果 -->
      <div v-if="showModal" class="modal">
        <div class="modal-content">
          <h2>Your Test Score: {{ score }}/100</h2>
          <p>{{ recommendation }}</p>
          <button @click="closeModal" class="close-btn">Close</button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore'
  import questions from '@/assets/Questions.js'
  import { useRouter } from 'vue-router'
  import { getAuth } from 'firebase/auth'
  
  const db = getFirestore()
  const auth = getAuth()
  const user = auth.currentUser
  const router = useRouter()
  
  const questionList = ref(questions)
  const answers = ref(Array(questionList.value.length).fill(null))
  const score = ref(0)
  const showModal = ref(false)  // 控制弹窗显示
  const showWarning = ref(false)  // 控制警告提示显示
  const incompleteQuestions = ref([])  // 存储未完成的题目
  const recommendation = ref("")  // 存储建议
  const currentDate = new Date().toLocaleDateString()
  
  // 计算得分
  const calculateScore = () => {
    return answers.value.reduce((total, score) => total + (score ? parseInt(score) : 0), 0)
  }
  
  // 根据得分生成建议
  const generateRecommendation = (score) => {
    if (score <= 20) {
      return "Your mental health seems to be in a great state. Keep it up!"
    } else if (score <= 40) {
      return "It seems like you might be facing some challenges. Consider talking to a friend or professional."
    } else {
      return "We recommend that you seek support from a mental health professional."
    }
  }
  
  // 检查是否所有问题都完成
  const checkCompletion = () => {
    incompleteQuestions.value = answers.value.map((answer, index) => answer === null ? index + 1 : null).filter(index => index !== null)  // 改为显示题号
    return incompleteQuestions.value.length === 0
  }
  
  // 提交测试并显示弹窗
  const submitTest = async () => {
    if (!checkCompletion()) {
      showWarning.value = true
      return
    }
  
    score.value = calculateScore()
  
    if (!user) {
      console.error('No user logged in!')
      return
    }
  
    try {
      // 保存测试结果到 Firestore, 使用 Timestamp 代替字符串的日期
      await addDoc(collection(db, 'healthTestResults'), {
        username: user.displayName || 'Anonymous',
        email: user.email,
        score: score.value,
        date: Timestamp.now()  // 使用 Timestamp 存储时间
      })
      
      // 生成个性化建议
      recommendation.value = generateRecommendation(score.value)
      
      // 显示弹窗
      showModal.value = true
  
    } catch (error) {
      console.error('Error submitting the test:', error)
    }
  }
  
  // 关闭弹窗
  const closeModal = () => {
    showModal.value = false,
    router.push('/home')
  }
  
  // 关闭未完成提示
  const closeWarning = () => {
    showWarning.value = false
  }
  
  // 返回主页
  const goHome = () => {
    router.push('/home')
  }
  </script>
  
  
  <style scoped>
  .health-test {
    max-width: 600px;
    margin: auto;
    text-align: center;
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
  .question-block {
    margin-bottom: 20px;
  }
  .options label {
    display: block;
    margin: 5px 0;
  }
  .submit-btn {
    background-color: #4CAF50;
    color: white;
    border: none;
    padding: 10px 20px;
    font-size: 16px;
    cursor: pointer;
  }
  .back-btn {
    background-color: #FF5733;
    color: white;
    border: none;
    padding: 10px 20px;
    font-size: 16px;
    cursor: pointer;
    margin-top: 20px;
  }
  
  .modal, .warning-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .modal-content, .warning-content {
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    text-align: center;
  }
  
  .close-btn {
    background-color: #4CAF50;
    color: white;
    border: none;
    padding: 10px 20px;
    font-size: 16px;
    cursor: pointer;
  }
  </style>
  