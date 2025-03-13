<template>
  <div class="consultation-booking">
    <header class="header">
      <img src="@/assets/logo.png" alt="Health Test Logo" class="logo" />
      <div class="header-text">
        <h1>Book a Consultation</h1>
        <p>{{ formattedDate }}</p>
      </div>
    </header>

    <section class="calendar-section">
      <h2>Select a Date</h2>
      <input type="date" v-model="selectedDate" @change="fetchAvailableDoctors" />
    </section>

    <section class="doctor-search">
      <h2>Search Available Doctors</h2>
      <input type="text" v-model="searchTerm" placeholder="Search by name or specialization" />
      <button @click="filterDoctors" class="green-button">Search</button>
      <button @click="clearSearch" class="green-button">Clear</button>
    </section>

    <section class="doctor-list">
      <h2>Available Doctors</h2>
      <div v-if="filteredDoctors.length === 0">No doctors found for the selected date.</div>
      <div class="doctor-grid" v-else>
        <div class="doctor-card" v-for="doctor in filteredDoctors" :key="doctor.id">
          <h3>{{ doctor.name }}</h3>
          <p><strong>Specialization:</strong> {{ doctor.specialization }}</p>
          <p><strong>Working Days:</strong> {{ doctor.workingDays.join(', ') }}</p>
          <button @click="bookConsultation(doctor)" class="green-button">Book</button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { getFirestore, collection, getDocs, query, where, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const db = getFirestore();
const auth = getAuth();
const doctors = ref([]);
const filteredDoctors = ref([]);
const searchTerm = ref('');
const selectedDate = ref('');
const formattedDate = new Date().toLocaleDateString();

const fetchAvailableDoctors = async () => {
  if (!selectedDate.value) return;
  const selectedDay = new Date(selectedDate.value).toLocaleString('en-us', { weekday: 'long' });

  const q = query(collection(db, 'doctors'), where('workingDays', 'array-contains', selectedDay));
  const querySnapshot = await getDocs(q);
  doctors.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  filteredDoctors.value = doctors.value;
};

const filterDoctors = () => {
  filteredDoctors.value = doctors.value.filter(doc => {
    const term = searchTerm.value.toLowerCase();
    return (
      doc.name.toLowerCase().includes(term) ||
      doc.specialization.toLowerCase().includes(term)
    );
  });
};

const clearSearch = () => {
  searchTerm.value = '';
  filteredDoctors.value = doctors.value;
};

const bookConsultation = async (doctor) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      alert('You must be logged in to book a consultation.');
      return;
    }
    const booking = {
      doctorId: doctor.id,
      doctorName: doctor.name,
      date: selectedDate.value,
      userId: user.uid,
      userName: user.displayName || 'Anonymous',
      userEmail: user.email,
      timestamp: new Date().toISOString()
    };
    await addDoc(collection(db, 'consultations'), booking);
    alert(`Successfully booked a consultation with Dr. ${doctor.name}`);

    // Send welcome email using Firebase Cloud Function
    sendWelcomeEmail(user.email, user.displayName || 'Anonymous', doctor.name, selectedDate.value);
  } catch (error) {
    console.error('Error booking consultation or sending email:', error);
    alert('Failed to book consultation or send email. Please try again.');
  }
};

const sendWelcomeEmail = (email, username, doctorName, date) => {
  fetch('https://us-central1-mindwell-f5a26.cloudfunctions.net/sendWelcomeEmail', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email,
      username,
      subject: 'Mindwell Consultation Booking Confirmation',
      text: `Hi ${username},

Thank you for booking a consultation with Mindwell. Here are your booking details:
Date: ${date}
Doctor: Dr. ${doctorName}.

We look forward to supporting you.`,
      html: `<strong>Hi ${username},</strong><br/><br/>Thank you for booking a consultation with Mindwell. Here are your booking details:<br/>Date: ${date}<br/>Doctor: Dr. ${doctorName}.<br/><br/>We look forward to supporting you.`
    })
  })
  .then(response => response.json())
  .then(data => {
    console.log('Email sent successfully:', data);
  })
  .catch((error) => {
    console.error('Error sending email:', error);
  });
};

onMounted(fetchAvailableDoctors);
</script>

<style scoped>
.consultation-booking {
  max-width: 800px;
  margin: auto;
  padding: 20px;
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
.logo {
  width: 60px;
  height: auto;
}
.header-text {
  flex-grow: 1;
  text-align: right;
}
.calendar-section, .doctor-search, .doctor-list {
  margin-bottom: 30px;
}
.doctor-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}
.doctor-card {
  border: 1px solid #ddd;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}
button {
  margin-top: 10px;
  padding: 8px 16px;
  border: none;
  background-color: #4caf50;
  color: white;
  cursor: pointer;
  border-radius: 4px;
}
button:hover {
  background-color: #45a049;
}
input[type="text"], input[type="date"] {
  margin-bottom: 10px;
  padding: 8px;
  width: calc(100% - 16px);
}
</style>