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

    <!-- Calendar Section -->
    <section class="calendar-section">
      <h2>Select a Date and Time</h2>
      <FullCalendar
        :plugins="[dayGridPlugin, timeGridPlugin, interactionPlugin]"
        initialView="timeGridWeek"
        :events="calendarEvents"
        @dateClick="handleDateClick"
        @eventClick="handleEventClick"
      />
    </section>

    <section class="doctor-list">
      <h2>Selected Slot Details</h2>
      <div v-if="selectedSlot">
        <p><strong>Date:</strong> {{ selectedSlot.date }}</p>
        <p><strong>Time:</strong> {{ selectedSlot.time }}</p>
        <p><strong>Doctor:</strong> {{ selectedSlot.doctorName }}</p>
        <button @click="bookConsultation(selectedSlot)" class="green-button">Confirm Booking</button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { getFirestore, collection, getDocs, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useRouter } from 'vue-router';

const db = getFirestore();
const auth = getAuth();
const router = useRouter();

const formattedDate = new Date().toLocaleDateString();
const calendarEvents = ref([]);
const selectedSlot = ref(null);

const goBack = () => {
  router.push('/home');
};

// Fetch doctors and prepare calendar events
const fetchAvailableDoctors = async () => {
  const querySnapshot = await getDocs(collection(db, 'doctors'));
  const doctors = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  // Prepare calendar events from doctor availability
  doctors.forEach(doctor => {
    doctor.workingDays.forEach(day => {
      const slots = ['10:00 - 11:00', '11:00 - 12:00', '13:00 - 14:00', '14:00 - 15:00', '16:00 - 17:00'];
      slots.forEach(slot => {
        calendarEvents.value.push({
          title: `Dr. ${doctor.name} - ${doctor.specialization}`,
          start: generateDate(day, slot),
          end: generateEndTime(day, slot),
          extendedProps: {
            doctorId: doctor.id,
            doctorName: doctor.name,
            timeSlot: slot,
          },
        });
      });
    });
  });
};

// Generate a date for the event (just a placeholder, adjust as needed)
const generateDate = (day, timeSlot) => {
  // Generate the proper datetime based on day and time slot
  return new Date(); // Placeholder: Replace with real date generation logic
};

const generateEndTime = (day, timeSlot) => {
  // Generate the end time based on start time
  return new Date(); // Placeholder: Replace with real end time generation logic
};

const handleDateClick = (info) => {
  alert('Clicked on: ' + info.dateStr);
};

const handleEventClick = (info) => {
  selectedSlot.value = {
    doctorId: info.event.extendedProps.doctorId,
    doctorName: info.event.extendedProps.doctorName,
    date: info.event.start,
    time: info.event.extendedProps.timeSlot,
  };
};

const bookConsultation = async (slot) => {
  const user = auth.currentUser;
  if (!user) {
    alert('You must be logged in to book a consultation.');
    return;
  }

  const booking = {
    doctorId: slot.doctorId,
    doctorName: slot.doctorName,
    date: slot.date.toISOString(),
    timeSlot: slot.time,
    userId: user.uid,
    userName: user.displayName || 'Anonymous',
    userEmail: user.email,
    timestamp: new Date().toISOString()
  };
  try {
    await addDoc(collection(db, 'consultations'), booking);
    alert(`Successfully booked a consultation with Dr. ${slot.doctorName}`);
    // Update UI to reflect booking
  } catch (error) {
    console.error('Error booking consultation:', error);
  }
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

.calendar-section, .doctor-list {
  margin-bottom: 30px;
}

.green-button {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  border-radius: 5px;
}

.green-button:hover {
  background-color: #45a049;
}
</style>
