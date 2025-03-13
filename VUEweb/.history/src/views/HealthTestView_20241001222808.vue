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
  
  <script>
  import { db } from "@/firebase/init" // Assuming you have set up Firebase in the project
  import questions from '../assets/Questions.js'; // Importing the questions
  
  export default {
    data() {
      return {
        questions: questions,  // Questions loaded from assets
        answers: Array(questions.length).fill(null),  // Storing user's answers
        currentDate: new Date().toLocaleDateString(),
        userInfo: {
          username: 'russell', // Sample data, should be dynamically fetched from Firebase
          email: 'russellzhou624@gmail.com', // Sample data, should be dynamically fetched from Firebase
        },
      };
    },
    methods: {
      calculateScore() {
        return this.answers.reduce((total, score) => total + (score ? parseInt(score) : 0), 0);
      },
      async submitTest() {
        const score = this.calculateScore();
        
        try {
          await db.collection('healthTestResults').add({
            username: this.userInfo.username,
            email: this.userInfo.email,
            date: this.currentDate,
            score: score,
          });
          alert('Test submitted successfully!');
        } catch (error) {
          console.error('Error submitting the test:', error);
        }
      },
    },
  };
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
  