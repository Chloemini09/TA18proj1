<template>
    <div class="consultation-management">
      <h1>Consultation Management</h1>
      <p v-if="username">Welcome, {{ username }}! Current Date: {{ currentDate }}</p>
      
      <form @submit.prevent="addDoctor">
        <label for="doctorName">Doctor's Name:</label>
        <input type="text" id="doctorName" v-model="doctorName" required />
  
        <label for="doctorID">Doctor's ID:</label>
        <input type="text" id="doctorID" v-model="doctorID" required />
  
        <label for="workingDays">Working Days:</label>
        <input type="text" id="workingDays" v-model="workingDays" placeholder="e.g., Monday, Wednesday" required />
  
        <label for="specialty">Specialty:</label>
        <input type="text" id="specialty" v-model="specialty" required />
  
        <button type="submit">Add Doctor</button>
      </form>
  
      <div v-if="feedback" class="feedback">{{ feedback }}</div>
  
      <div class="doctor-list">
        <h2>Doctors List</h2>
        <ul>
          <li v-for="doctor in doctors" :key="doctor.id">
            <p>Name: {{ doctor.name }}</p>
            <p>ID: {{ doctor.id }}</p>
            <p>Working Days: {{ doctor.workingDays }}</p>
            <p>Specialty: {{ doctor.specialty }}</p>
            <button @click="editDoctor(doctor)">Edit</button>
            <button @click="deleteDoctor(doctor.id)">Delete</button>
          </li>
        </ul>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from 'vue';
  import { db } from "@/firebaseConfig";
  import { collection, addDoc, deleteDoc, doc, updateDoc, getDocs } from "firebase/firestore";
  import { getAuth, onAuthStateChanged } from "firebase/auth";
  
  export default {
    name: "ConsultationManagementView",
    setup() {
      const doctorName = ref("");
      const doctorID = ref("");
      const workingDays = ref("");
      const specialty = ref("");
      const feedback = ref("");
      const doctors = ref([]);
      const username = ref("");
      const currentDate = new Date().toLocaleDateString();
  
      const auth = getAuth();
      onAuthStateChanged(auth, (user) => {
        if (user) {
          username.value = user.displayName || "User";
        }
      });
  
      const fetchDoctors = async () => {
        try {
          const querySnapshot = await getDocs(collection(db, "doctors"));
          doctors.value = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
          console.error("Error fetching doctors: ", error);
        }
      };
  
      const addDoctor = async () => {
        try {
          await addDoc(collection(db, "doctors"), {
            name: doctorName.value,
            id: doctorID.value,
            workingDays: workingDays.value,
            specialty: specialty.value
          });
          feedback.value = "Doctor added successfully!";
          doctorName.value = "";
          doctorID.value = "";
          workingDays.value = "";
          specialty.value = "";
          fetchDoctors();
        } catch (error) {
          console.error("Error adding doctor: ", error);
          feedback.value = "Failed to add doctor. Please try again.";
        }
      };
  
      const deleteDoctor = async (id) => {
        try {
          await deleteDoc(doc(db, "doctors", id));
          feedback.value = "Doctor deleted successfully!";
          fetchDoctors();
        } catch (error) {
          console.error("Error deleting doctor: ", error);
          feedback.value = "Failed to delete doctor. Please try again.";
        }
      };
  
      const editDoctor = (doctor) => {
        doctorName.value = doctor.name;
        doctorID.value = doctor.id;
        workingDays.value = doctor.workingDays;
        specialty.value = doctor.specialty;
      };
  
      const updateDoctor = async () => {
        try {
          const doctorRef = doc(db, "doctors", doctorID.value);
          await updateDoc(doctorRef, {
            name: doctorName.value,
            workingDays: workingDays.value,
            specialty: specialty.value
          });
          feedback.value = "Doctor updated successfully!";
          doctorName.value = "";
          doctorID.value = "";
          workingDays.value = "";
          specialty.value = "";
          fetchDoctors();
        } catch (error) {
          console.error("Error updating doctor: ", error);
          feedback.value = "Failed to update doctor. Please try again.";
        }
      };
  
      onMounted(() => {
        fetchDoctors();
      });
  
      return {
        doctorName,
        doctorID,
        workingDays,
        specialty,
        feedback,
        doctors,
        username,
        currentDate,
        addDoctor,
        deleteDoctor,
        editDoctor,
        updateDoctor
      };
    }
  };
  </script>
  
  <style scoped>
  .consultation-management {
    max-width: 500px;
    margin: 0 auto;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  }
  
  h1 {
    text-align: center;
  }
  
  form {
    display: flex;
    flex-direction: column;
  }
  
  label {
    margin-top: 10px;
  }
  
  input {
    padding: 8px;
    margin-top: 5px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  
  button {
    margin-top: 20px;
    padding: 10px;
    background-color: #28a745;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  button:hover {
    background-color: #218838;
  }
  
  .feedback {
    margin-top: 20px;
    text-align: center;
    font-weight: bold;
  }
  
  .doctor-list {
    margin-top: 20px;
  }
  
  .doctor-list ul {
    list-style-type: none;
    padding: 0;
  }
  
  .doctor-list li {
    margin-bottom: 15px;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  </style>