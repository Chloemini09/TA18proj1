<template>
    <div class="consultation-management">
      <h1>Consultation Management</h1>
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
    </div>
  </template>
  
  <script>
  import { db } from "@/firebaseConfig";
  import { collection, addDoc } from "firebase/firestore";
  
  export default {
    name: "ConsultationManagementView",
    data() {
      return {
        doctorName: "",
        doctorID: "",
        workingDays: "",
        specialty: "",
        feedback: ""
      };
    },
    methods: {
      async addDoctor() {
        try {
          await addDoc(collection(db, "doctors"), {
            name: this.doctorName,
            id: this.doctorID,
            workingDays: this.workingDays,
            specialty: this.specialty
          });
          this.feedback = "Doctor added successfully!";
          this.doctorName = "";
          this.doctorID = "";
          this.workingDays = "";
          this.specialty = "";
        } catch (error) {
          console.error("Error adding doctor: ", error);
          this.feedback = "Failed to add doctor. Please try again.";
        }
      }
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
  </style>