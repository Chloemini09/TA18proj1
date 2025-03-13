<template>
  <div class="assess-container">
    <h2>Rate Your Experience</h2>

    <!-- 遍历问题并渲染 -->
    <div v-for="(question, index) in questions" :key="index" class="question-container">
      <p>{{ question.text }}</p>
      <div class="rating-options">
        <label v-for="rating in ratings" :key="rating">
          <input
            type="radio"
            :name="'question' + index"
            :value="rating"
            v-model="question.rating"
            required
          />
          {{ rating }}
        </label>
      </div>
      <p v-if="validationErrors[index]" class="error">{{ validationErrors[index] }}</p>
    </div>

    <!-- 添加可选的建议输入框 -->
    <div class="advice-container">
      <p>Give Us Advice (Optional):</p>
      <textarea v-model="advice" placeholder="Your advice here..."></textarea>
    </div>

    <button @click="submitRatings">Submit</button>
    <p v-if="successMessage" class="success-message">{{ successMessage }}</p>

    <!-- 返回按钮 -->
    <button @click="goBack" class="btn-back">Back to Home</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const questions = ref([
  { text: 'How do you rate the usability of the interface?', rating: null },
  { text: 'How satisfied are you with the features?', rating: null },
  { text: 'How was the overall performance?', rating: null },
]);

const ratings = [1, 2, 3, 4, 5];
const successMessage = ref('');
const validationErrors = ref([]);
const advice = ref(''); // 可选的建议

function validateForm() {
  validationErrors.value = [];
  let isValid = true;

  questions.value.forEach((question, index) => {
    if (question.rating === null) {
      validationErrors.value[index] = 'This question is required.';
      isValid = false;
    }
  });

  return isValid;
}

function submitRatings() {
  if (!validateForm()) {
    return;
  }

  // 从localStorage中获取现有的userRatings数组
  let userRatings = JSON.parse(localStorage.getItem('userRatings')) || [];

  // 创建一个新的评价对象
  const newRating = {
    username: localStorage.getItem('currentUser'),
    ratings: questions.value.map((question) => ({
      question: question.text,
      rating: question.rating,
    })),
    advice: advice.value || 'No advice provided',
  };

  // 将新的评价对象添加到数组中
  userRatings.push(newRating);

  // 将更新后的数组保存回localStorage
  localStorage.setItem('userRatings', JSON.stringify(userRatings));

  // 提交成功后显示成功提示
  successMessage.value = 'Thank you for your feedback!';

  // 清空表单
  questions.value.forEach(question => question.rating = null);
  advice.value = '';
}


function goBack() {
  router.push('/home'); // 返回 HomeView
}
</script>

<style scoped>
.assess-container {
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

.advice-container {
  margin-top: 20px;
  text-align: left;
}

textarea {
  width: 100%;
  height: 100px;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
  margin-top: 10px;
}

button {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 20px;
}

button:hover {
  background-color: #0056b3;
}

.btn-back {
  background-color: #4caf50;
  margin-top: 10px;
}

.btn-back:hover {
  background-color: #388e3c;
}

.error {
  color: red;
  font-size: 0.9rem;
}

.success-message {
  margin-top: 20px;
  color: green;
  font-weight: bold;
}
</style>

