<template>
    <div class="consultation-management">
      <header>
        <h1>Consultation Management</h1>
      </header>
  
      <section class="doctor-form">
        <h2>{{ isEditing ? 'Edit Doctor' : 'Add New Doctor' }}</h2>
        <form @submit.prevent="isEditing ? updateDoctor() : addDoctor()">
          <label>Name:</label>
          <input type="text" v-model="doctor.name" required />
  
          <label>ID:</label>
          <input type="text" v-model="doctor.id" required />
  
          <label>Working Days:</label>
          <input type="text" v-model="doctor.workingDays" placeholder="e.g., Mon-Fri" required />
  
          <label>Specialization:</label>
          <input type="text" v-model="doctor.specialization" required />
  
          <button type="submit">{{ isEditing ? 'Update' : 'Add' }}</button>
          <button v-if="isEditing" @click="cancelEdit">Cancel</button>
        </form>
      </section>
  
      <section class="doctor-list">
        <h2>Doctor List</h2>
        <div v-if="doctors.length === 0">No doctors found.</div>
        <table v-else>
          <thead>
            <tr>
              <th>Name</th>
              <th>ID</th>
              <th>Working Days</th>
              <th>Specialization</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="doctor in doctors" :key="doctor.id">
              <td>{{ doctor.name }}</td>
              <td>{{ doctor.id }}</td>
              <td>{{ doctor.workingDays }}</td>
              <td>{{ doctor.specialization }}</td>
              <td>
                <button @click="editDoctor(doctor)">Edit</button>
                <button @click="deleteDoctor(doctor.id)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
  
  const db = getFirestore();
  const doctors = ref([]);
  const doctor = ref({ name: '', id: '', workingDays: '', specialization: '' });
  const isEditing = ref(false);
  let editingDocRef = null;
  
  const fetchDoctors = async () => {
    const querySnapshot = await getDocs(collection(db, 'doctors'));
    doctors.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  };
  
  const addDoctor = async () => {
    try {
      await addDoc(collection(db, 'doctors'), { ...doctor.value });
      await fetchDoctors();
      clearForm();
    } catch (error) {
      console.error('Error adding doctor:', error);
    }
  };
  
  const editDoctor = (doc) => {
    doctor.value = { ...doc };
    isEditing.value = true;
    editingDocRef = doc.id;
  };
  
  const updateDoctor = async () => {
    try {
      const docRef = doc(db, 'doctors', editingDocRef);
      await updateDoc(docRef, { ...doctor.value });
      await fetchDoctors();
      clearForm();
    } catch (error) {
      console.error('Error updating doctor:', error);
    }
  };
  
  const deleteDoctor = async (id) => {
    try {
      await deleteDoc(doc(db, 'doctors', id));
      await fetchDoctors();
    } catch (error) {
      console.error('Error deleting doctor:', error);
    }
  };
  
  const cancelEdit = () => {
    clearForm();
  };
  
  const clearForm = () => {
    doctor.value = { name: '', id: '', workingDays: '', specialization: '' };
    isEditing.value = false;
    editingDocRef = null;
  };
  
  onMounted(fetchDoctors);
  </script>
  
  <style scoped>
  .consultation-management {
    max-width: 800px;
    margin: auto;
    padding: 20px;
  }
  header {
    text-align: center;
    margin-bottom: 20px;
  }
  .doctor-form, .doctor-list {
    margin-bottom: 30px;
  }
  table {
    width: 100%;
    border-collapse: collapse;
  }
  th, td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
  }
  th {
    background-color: #f2f2f2;
  }
  button {
    margin-right: 5px;
  }
  </style>