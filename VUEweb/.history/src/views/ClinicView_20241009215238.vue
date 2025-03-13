<template>
  <div class="clinic-view-container">
    <header class="header">
      <img src="@/assets/logo.png" alt="Health Test Logo" class="logo" />
      <h1>Hi, {{ username }}</h1>
      <p>{{ currentDate }}</p>
    </header>

    <div class="search-container">
      <div class="search-box">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Search nearby GP..." 
          class="search-input"
          @input="getPlaceSuggestions"
        />
        <ul v-if="suggestions.length" class="suggestions-list">
          <li 
            v-for="(suggestion, index) in suggestions" 
            :key="index" 
            @click="selectSuggestion(suggestion)"
          >
            {{ suggestion.place_name }}
          </li>
        </ul>
      </div>
      <button @click="searchGP" class="search-btn">Search</button>
    </div>

    <div class="navigation-container">
      <div class="route-inputs">
        <input 
          type="text" 
          v-model="startLocation" 
          placeholder="Enter start location" 
          class="route-input"
        />
        <input 
          type="text" 
          v-model="endLocation" 
          placeholder="Enter end location" 
          class="route-input"
        />
        <button @click="goToMap" class="route-btn">GO</button>
      </div>
    </div>

    <div class="content-container">
      <div class="clinic-list">
        <h2>Nearby Clinics</h2>
        <ul>
          <li v-for="clinic in nearbyClinics" :key="clinic.id">
            <strong>{{ clinic.name }}</strong><br>
            {{ clinic.address }}<br>
            <small>电话信息不可用</small>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import mapboxgl from 'mapbox-gl'
import axios from 'axios'
import { getAuth } from 'firebase/auth'
import { getFirestore, getDoc, doc } from 'firebase/firestore'
import { useRouter } from 'vue-router'

const auth = getAuth()
const db = getFirestore()
const user = auth.currentUser
const router = useRouter()

const username = ref('')
const currentDate = new Date().toLocaleDateString()
const searchQuery = ref('')
const suggestions = ref([])
const nearbyClinics = ref([])
const startLocation = ref('')
const endLocation = ref('')

const getUserInfo = async () => {
  if (user) {
    const docRef = doc(db, 'users', user.uid)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      username.value = docSnap.data().username
    }
  }
}

const getPlaceSuggestions = async () => {
  if (!searchQuery.value) {
    suggestions.value = []
    return
  }

  const apiUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery.value)}.json?access_token=pk.eyJ1IjoiY2hsb2V5dWUiLCJhIjoiY20xejJpb3BhMDJndTJrcHpwaG9ocHE0NyJ9.jHaWplmk0Y_XWTLCtuAm4A&autocomplete=true`;
  try {
    const response = await axios.get(apiUrl)
    suggestions.value = response.data.features
  } catch (error) {
    console.error('Error fetching place suggestions:', error)
  }
}

const selectSuggestion = (suggestion) => {
  searchQuery.value = suggestion.place_name
  suggestions.value = []
  const coordinates = suggestion.geometry.coordinates
  map.value.flyTo({
    center: coordinates,
    zoom: 14
  })
  fetchNearbyClinics(coordinates)
}

const goToMap = async () => {
  const startCoords = await getCoordinatesFromAddress(startLocation.value); // 获取起点坐标
  const endCoords = await getCoordinatesFromAddress(endLocation.value); // 获取终点坐标

  router.push({ name: 'MapView', params: { startCoords, endCoords } });
}

const getCoordinatesFromAddress = async (address) => {
  const apiUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=pk.eyJ1IjoiY2hsb2V5dWUiLCJhIjoiY20xejJpb3BhMDJndTJrcHpwaG9ocHE0NyJ9.jHaWplmk0Y_XWTLCtuAm4A`;
  try {
    const response = await axios.get(apiUrl);
    return response.data.features[0].geometry.coordinates; // 返回坐标
  } catch (error) {
    console.error('Error getting coordinates:', error);
  }
}

onMounted(() => {
  getUserInfo()
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
  align-items: center;
}

.logo {
  width: 100px; /* 根据需要调整宽度 */
  height: auto; /* 保持纵横比 */
  margin-right: 20px; /* 与文本之间的间距 */
}

.search-container {
  display: flex;
  justify-content: space-between;
  margin: 20px 0;
}

.search-box {
  position: relative;
  width: 100%;
}

.search-input {
  width: 80%;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ddd;
  font-size: 1.1rem;
}

.suggestions-list {
  position: absolute;
  width: 80%;
  background: white;
  border: 1px solid #ddd;
  max-height: 200px;
  overflow-y: auto;
  list-style: none;
  padding: 0;
  margin-top: 5px;
  z-index: 10;
}

.suggestions-list li {
  padding: 10px;
  cursor: pointer;
}

.suggestions-list li:hover {
  background-color: #f0f0f0;
}

.search-btn {
  width: 15%;
  padding: 10px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1.1rem;
}

.navigation-container {
  margin: 20px 0;
}

.route-inputs {
  display: flex;
  gap: 10px;
}

.route-input {
  flex: 1;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ddd;
}

.route-btn {
  padding: 10px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.content-container {
  display: flex;
}

.clinic-list {
  flex: 1;
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