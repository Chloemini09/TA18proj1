<template>
  <div class="consultation-booking">
    <header class="header">
      <img src="@/assets/logo.png" alt="Health Test Logo" class="logo" />
      <div class="header-text">
        <h1>Book a Consultation</h1>
        <p>{{ formattedDate }}</p>
      </div>
    </header>

    <button class="back-btn" @click="goBack">← Back</button>

    <section class="calendar-section">
      <h2>Consultation Calendar</h2>
      <vue-cal
        v-model="selectedDate"
        :events="events"
        @cell-click="handleDateClick"
        :disable-views="['years', 'year', 'week']"
        default-view="month"
        :disable-date="disablePastDates"
        :time="false"
        :show-week-numbers="true"
        class="enhanced-calendar"
      />
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getFirestore, collection, getDocs, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useRouter } from 'vue-router';
import VueCal from 'vue-cal';
import 'vue-cal/dist/vuecal.css';

const db = getFirestore();
const auth = getAuth();
const router = useRouter();

const formattedDate = new Date().toLocaleDateString();
const selectedDate = ref(null);
const events = ref([]);

const goBack = () => {
  router.push('/home');
};

const fetchBookings = async () => {
  const querySnapshot = await getDocs(collection(db, 'consultations'));
  return querySnapshot.docs.map(doc => doc.data());
};

const initializeEvents = async () => {
  const bookings = await fetchBookings();
  events.value = bookings.map(booking => ({
    start: booking.date,
    title: `Dr. ${booking.doctorName} - ${booking.timeSlot}`,
    extendedProps: { doctorId: booking.doctorId, userId: booking.userId },
  }));
};

const handleDateClick = async (day) => {
  const user = auth.currentUser;
  if (!user) {
    alert('You must be logged in to book a consultation.');
    return;
  }

  const doctorName = prompt('Enter Doctor Name:');
  const timeSlot = prompt('Enter Time Slot (e.g., 10:00 - 11:00):');
  if (doctorName && timeSlot) {
    const booking = {
      doctorName,
      date: day.date,
      timeSlot,
      userId: user.uid,
      userName: user.displayName || 'Anonymous',
      userEmail: user.email,
      timestamp: new Date().toISOString(),
    };
    await addDoc(collection(db, 'consultations'), booking);
    alert(`Successfully booked a consultation with Dr. ${doctorName} at ${timeSlot}`);
    events.value.push({
      start: day.date,
      title: `Dr. ${doctorName} - ${timeSlot}`,
    });
  }
};

const disablePastDates = (date) => {
  return date < new Date();
};

onMounted(initializeEvents);
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
.calendar-section {
  margin-top: 30px;
}
.back-btn {
  background-color: transparent;
  border: none;
  font-size: 1.2rem;
  color: #4caf50;
  cursor: pointer;
  margin-top: 20px;
  margin-bottom: 20px;
}
.back-btn:hover {
  text-decoration: underline;
}
.enhanced-calendar {
  --vuecal-primary: #4caf50;
  --vuecal-bg: #f9f9f9;
  --vuecal-border: #ddd;
  --vuecal-text: #333;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 10px;
}
</style>