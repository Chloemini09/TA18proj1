<template>
  <div class="rating-container">
    <h2>Rate Your Experience</h2>
    <div v-for="(question, index) in questions" :key="index" class="question-container">
      <p>{{ question.text }}</p>
      <div class="rating-options">
        <label v-for="rating in ratings" :key="rating">
          <input type="radio" :name="'question' + index" :value="rating" v-model="question.rating" />
          {{ rating }}
        </label>
      </div>
    </div>
    <button @click="submitRatings">Submit</button>
    <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
    <button @click="goBack" class="btn-back">Back to Home</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const questions = ref([
  { text: 'How do you rate the usability of the interface?', rating: null },
  { text: 'How satisfied are you with the features?', rating: null },
  { text: 'How was the overall performance?', rating: null },
  { text: 'Did we help you?', rating: null }
]);

const ratings = [1, 2, 3, 4, 5];
const successMessage = ref('');

function goBack() {
  router.push('/home');
}

function submitRatings() {
  const ratingsData = questions.value.map((question, index) => ({
    question: question.text,
    rating: question.rating,
  }));

  // Save the ratings data to localStorage as a JSON string
  localStorage.setItem('userRatings', JSON.stringify(ratingsData));

  successMessage.value = 'Thank you for your feedback!';
}
</script>

<style scoped>
.rating-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  text-align: center;
}

.question-container {
  margin-bottom: 20px;
}

.rating-options {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 10px;
}

label {
  cursor: pointer;
}

input[type="radio"] {
  margin-right: 5px;
}

button {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}

.success-message {
  margin-top: 20px;
  color: green;
  font-weight: bold;
}
</style>
