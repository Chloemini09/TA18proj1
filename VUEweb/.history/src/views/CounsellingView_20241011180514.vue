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

    <section v-if="availableDoctors.length > 0" class="doctor-list">
      <h2>Available Doctors for {{ formattedSelectedDate }}</h2>
      <div class="doctor-card" v-for="doctor in availableDoctors" :key="doctor.id">
        <h3>{{ doctor.name }}</h3>
        <p><strong>Specialization:</strong> {{ doctor.specialization }}</p>
        <div class="time-slots">
          <div v-for="slot in doctor.timeSlots" :key="slot.time" class="time-slot">
            <p>{{ slot.time }}: <span :class="{ available: !slot.booked, booked: slot.booked }">{{ slot.booked ? 'Booked' : 'Available' }}</span></p>
            <button v-if="!slot.booked" @click="bookConsultation(doctor, slot)" class="green-button">Book</button>
          </div>
        </div>
      </div>
    </section>
    <section v-else class="no-doctors">
      <p v-if="selectedDate">No doctors available for the selected date. Please choose another date.</p>
      <p v-else>Please select a date to see available doctors.</p>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
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
const availableDoctors = ref([]);

const formattedSelectedDate = computed(() => {
  return selectedDate.value ? new Date(selectedDate.value).toLocaleDateString() : '';
});

const goBack = () => {
  router.push('/home');
};

const fetchBookings = async () => {
  const querySnapshot = await getDocs(collection(db, 'consultations'));
  return querySnapshot.docs.map(doc => doc.data());
};

const fetchAvailableDoctors = async (selectedDay) => {
  const querySnapshot = await getDocs(collection(db, 'doctors'));
  const allDoctors = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), timeSlots: [
    { time: '10:00 - 11:00', booked: false },
    { time: '11:00 - 12:00', booked: false },
    { time: '13:00 - 14:00', booked: false },
    { time: '14:00 - 15:00', booked: false },
    { time: '16:00 - 17:00', booked: false }
  ] }));

  // Filter doctors based on the selected day
  availableDoctors.value = allDoctors.filter(doctor => doctor.workingDays.includes(selectedDay));

  if (availableDoctors.value.length === 0) {
    return;
  }

  // Fetch bookings for the selected date
  const bookingsSnapshot = await getDocs(collection(db, 'consultations'));
  const bookings = bookingsSnapshot.docs.map(doc => doc.data()).filter(booking => booking.date === selectedDate.value);

  // Mark booked time slots
  availableDoctors.value.forEach(doctor => {
    bookings.forEach(booking => {
      if (booking.doctorId === doctor.id) {
        const slot = doctor.timeSlots.find(slot => slot.time === booking.timeSlot);
        if (slot) {
          slot.booked = true;
        }
      }
    });
  });
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
  selectedDate.value = day.date;
  const selectedDay = new Date(selectedDate.value).toLocaleString('en-us', { weekday: 'long' });
  await fetchAvailableDoctors(selectedDay);
};

const bookConsultation = async (doctor, slot) => {
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
      timeSlot: slot.time,
      userId: user.uid,
      userName: user.displayName || 'Anonymous',
      userEmail: user.email,
      timestamp: new Date().toISOString(),
    };
    await addDoc(collection(db, 'consultations'), booking);
    alert(`Successfully booked a consultation with Dr. ${doctor.name} at ${slot.time}`);

    // Update the time slot to booked
    slot.booked = true;

    // Add event to the calendar
    events.value.push({
      start: selectedDate.value,
      title: `Dr. ${doctor.name} - ${slot.time}`,
    });
  } catch (error) {
    console.error('Error booking consultation:', error);
    alert('Failed to book consultation. Please try again.');
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
.doctor-list {
  margin-top: 30px;
}
.doctor-card {
  border: 1px solid #ddd;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}
.time-slots {
  margin-top: 10px;
}
.time-slot {
  margin-bottom: 5px;
}
.available {
  color: green;
}
.booked {
  color: red;
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