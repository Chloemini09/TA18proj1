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
      <div v-for="(question, index) in questions" :key="index" class="question-block">
        <h2>{{ question.text }}</h2>
        <div class="options">
          <label v-for="(option, idx) in question.options" :key="idx">
            <input type="radio" :name="'question-' + index" :value="option.score" v-model="answers[index]" />
            {{ option.text }}
          </label>
        </div>
      </div>
      
      <button type="submit" class="submit-btn">Submit</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { getFirestore, doc, setDoc, collection, addDoc } from 'firebase/firestore'
import { useRouter } from 'vue-router'
import questions from '@/assets/Questions.js'
import { getAuth } from 'firebase/auth'

const db = getFirestore()  // Firebase Firestore的初始化
const router = useRouter()

const questionList = ref(questions)
const answers = ref(Array(questionList.value.length).fill(null))  // 存储用户答案
const currentDate = new Date().toLocaleDateString()

const auth = getAuth()
const user = auth.currentUser  // 获取当前登录用户的信息

// 计算分数
const calculateScore = () => {
  return answers.value.reduce((total, score) => total + (score ? parseInt(score) : 0), 0)
}

// 提交测试结果并保存到Firestore
const submitTest = async () => {
  const score = calculateScore()
  if (!user) {
    console.error('No user logged in!')
    return
  }

  try {
    // 在`healthTestResults` collection中创建新文档
    await addDoc(collection(db, 'healthTestResults'), {
      username: user.displayName || 'Anonymous',  // 用户名
      email: user.email,  // 邮箱
      score: score,  // 测试分数
      date: new Date().toLocaleString()  // 当前时间
    })
    alert('Test submitted successfully!')
    router.push('/home')  // 提交成功后跳转
  } catch (error) {
    console.error('Error submitting the test:', error)
  }
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
</style>
