<template>
  <div class="clinic-view-container">
    <header class="header">
      <h1>Hi, {{ username }}</h1>
      <p>{{ currentDate }}</p>
    </header>

    <!-- 搜索框 -->
    <div class="search-container">
      <input 
        type="text" 
        v-model="searchQuery" 
        placeholder="Search nearby GP..." 
        class="search-input" 
      />
      <button @click="searchGP" class="search-btn">Search</button>
    </div>

    <!-- 地图部分 -->
    <div class="map-container">
      <div id="map" class="map"></div>
    </div>

    <!-- 打印医疗机构列表 -->
    <div class="clinic-list">
      <h2>Nearby Clinics</h2>
      <ul>
        <li v-for="clinic in nearbyClinics" :key="clinic.id">{{ clinic.name }} - {{ clinic.address }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import mapboxgl from 'mapbox-gl'
import axios from 'axios'
import { getAuth } from 'firebase/auth'
import { getFirestore, getDoc, doc } from 'firebase/firestore'

const auth = getAuth()
const db = getFirestore()
const user = auth.currentUser

const username = ref('')
const currentDate = new Date().toLocaleDateString()
const searchQuery = ref('')
const nearbyClinics = ref([])

const getUserInfo = async () => {
  if (user) {
    const docRef = doc(db, 'users', user.uid)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      username.value = docSnap.data().username
    }
  }
}

const setupMap = () => {
  mapboxgl.accessToken = 'pk.eyJ1IjoiY2hsb2V5dWUiLCJhIjoiY20xejJpb3BhMDJndTJrcHpwaG9ocHE0NyJ9.jHaWplmk0Y_XWTLCtuAm4A'
  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [145.045837, -37.876823],
    zoom: 12
  })
}

const searchGP = async () => {
  // 搜索附近的诊所逻辑 (模拟数据)
  nearbyClinics.value = [
    { id: 1, name: 'Clayton GP', address: '123 Clayton St' },
    { id: 2, name: 'Monash Medical Centre', address: '246 Monash Rd' },
    { id: 3, name: 'Nearby GP Clinic', address: '456 Wellington St' },
  ]
}

onMounted(() => {
  getUserInfo()
  setupMap()
})
</script>

<style scoped>
.clinic-view-container {
  max-width: 1200px;
  margin: auto;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-container {
  display: flex;
  justify-content: space-between;
  margin: 20px 0;
}

.search-input {
  flex: 1;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ddd;
  font-size: 1.1rem;
  margin-right: 10px;
}

.search-btn {
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1.1rem;
}

.map-container {
  height: 400px;
  margin-bottom: 20px;
  border-radius: 10px;
  overflow: hidden;
}

#map {
  width: 100%;
  height: 100%;
}

.clinic-list {
  margin-top: 20px;
}

.clinic-list h2 {
  color: #4CAF50;
}

.clinic-list ul {
  list-style-type: none;
  padding: 0;
}

.clinic-list li {
  padding: 10px;
  border-bottom: 1px solid #ddd;
}
</style>
