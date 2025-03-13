<template>
    <div class="counselling-container">
      <header class="counselling-header">
        <div class="header-left">
          <img src="@/assets/logo.png" alt="Logo" class="logo" />
          <h1>Counselling</h1>
        </div>
        <div class="header-right">
          <p class="date">{{ currentDate }}</p>
        </div>
      </header>
  
      <div class="welcome-message">
        <h2>Hi, {{ username }}</h2>
        <p>Welcome to our online counselling service. You can book an appointment for a session below.</p>
      </div>
  
      <div class="counselling-services">
        <h3>Available Counselling Services</h3>
        <ul>
          <li v-for="service in services" :key="service.id" class="service-item">
            {{ service.name }}
          </li>
        </ul>
      </div>
  
      <div class="appointment-section">
        <h3>Book an Appointment</h3>
        <label for="date">Select Date:</label>
        <input type="date" id="date" v-model="appointmentDate" required />
        
        <label for="time">Select Time:</label>
        <input type="time" id="time" v-model="appointmentTime" required />
        
        <button @click="bookAppointment" class="appointment-button">Book Appointment</button>
  
        <p v-if="confirmationMessage" class="confirmation-message">{{ confirmationMessage }}</p>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  
  const username = ref(localStorage.getItem('currentUser') || 'User');
  const currentDate = ref('');
  const appointmentDate = ref('');
  const appointmentTime = ref('');
  const confirmationMessage = ref('');
  
  function formatDate(date) {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }
  
  // 模拟的咨询服务数据
  const services = ref([
    { id: 1, name: 'General Mental Health Counselling' },
    { id: 2, name: 'Stress Management' },
    { id: 3, name: 'Family Therapy' },
    { id: 4, name: 'Career Counselling' },
  ]);
  
  function bookAppointment() {
    if (appointmentDate.value && appointmentTime.value) {
      confirmationMessage.value = `Appointment booked for ${appointmentDate.value} at ${appointmentTime.value}.`;
    } else {
      confirmationMessage.value = 'Please select both date and time.';
    }
  }
  
  onMounted(() => {
    const today = new Date();
    currentDate.value = formatDate(today);
  });
  </script>
  
  <style scoped>
  .counselling-container {
    padding: 2rem;
    font-family: 'Arial', sans-serif;
  }
  
  .counselling-header {
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
  
  .counselling-header h1 {
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
  
  .counselling-services {
    margin: 2rem 0;
  }
  
  .counselling-services h3 {
    font-size: 1.5rem;
    color: #4caf50;
  }
  
  .service-item {
    font-size: 1.2rem;
    margin: 0.5rem 0;
  }
  
  .appointment-section {
    margin-top: 2rem;
  }
  
  .appointment-section h3 {
    font-size: 1.5rem;
    color: #4caf50;
  }
  
  .appointment-section label {
    display: block;
    margin: 0.5rem 0;
    font-size: 1.1rem;
  }
  
  .appointment-button {
    background-color: #4caf50;
    color: white;
    padding: 1rem 2rem;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1.2rem;
    margin-top: 1rem;
  }
  
  .appointment-button:hover {
    background-color: #388e3c;
  }
  
  .confirmation-message {
    margin-top: 1rem;
    font-size: 1.2rem;
    color: #4caf50;
  }
  </style>
  