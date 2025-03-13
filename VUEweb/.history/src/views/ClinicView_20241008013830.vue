<template>
  <div class="clinic-view-container">
    <header class="header">
      <h1>Hi, {{ username }}</h1>
      <p>{{ currentDate }}</p>
    </header>

    <!-- 搜索框 -->
    <div class="search-container">
      <div class="search-box">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Search nearby GP..." 
          class="search-input"
          @input="getPlaceSuggestions"
        />
        <!-- 下拉框提示 -->
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

    <div class="content-container">
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
const suggestions = ref([])
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

// 地图初始化
const setupMap = () => {
  mapboxgl.accessToken = 'your-mapbox-access-token'
  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [145.045837, -37.876823],
    zoom: 12
  })
}

// 获取地址提示
const getPlaceSuggestions = async () => {
  if (!searchQuery.value) {
    suggestions.value = []
    return
  }

  const apiUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery.value)}.json?access_token=your-mapbox-access-token&autocomplete=true`
  try {
    const response = await axios.get(apiUrl)
    suggestions.value = response.data.features
  } catch (error) {
    console.error('Error fetching place suggestions:', error)
  }
}

// 选择地址建议
const selectSuggestion = (suggestion) => {
  searchQuery.value = suggestion.place_name
  suggestions.value = []
}

// 搜索附近的诊所
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

.content-container {
  display: flex;
}

.map-container {
  flex: 1;
  height: 400px;
  margin-right: 20px;
  border-radius: 10px;
  overflow: hidden;
}

#map {
  width: 100%;
  height: 100%;
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
