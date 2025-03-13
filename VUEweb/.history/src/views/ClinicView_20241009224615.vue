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
        <div class="route-box">
          <input 
            type="text" 
            v-model="startLocation" 
            placeholder="Enter start location" 
            class="route-input"
            @input="getStartLocationSuggestions"
          />
          <ul v-if="startSuggestions.length" class="suggestions-list">
            <li 
              v-for="(suggestion, index) in startSuggestions" 
              :key="index" 
              @click="selectStartLocation(suggestion)"
            >
              {{ suggestion.place_name }}
            </li>
          </ul>
        </div>

        <div class="route-box">
          <input 
            type="text" 
            v-model="endLocation" 
            placeholder="Enter end location" 
            class="route-input"
            @input="getEndLocationSuggestions"
          />
          <ul v-if="endSuggestions.length" class="suggestions-list">
            <li 
              v-for="(suggestion, index) in endSuggestions" 
              :key="index" 
              @click="selectEndLocation(suggestion)"
            >
              {{ suggestion.place_name }}
            </li>
          </ul>
        </div>

        <button @click="getRoutes()" class="route-btn">GO</button>
      </div>
    </div>

    <div class="content-container">
      <div class="map-container">
        <div id="map" class="map"></div>
      </div>

      <div class="clinic-list">
        <h2>Nearby Clinics</h2>
        <ul>
          <li v-for="clinic in nearbyClinics" :key="clinic.id">
            <strong>{{ clinic.name }}</strong><br>
            {{ clinic.address }}<br>
            <small>电话信息不可用</small>
            <button @click="showTransportOptions(clinic)">GO</button>

            <!-- 显示交通方式选择框 -->
            <div v-if="selectedClinic && selectedClinic.id === clinic.id" class="transport-options">
              <p>选择交通方式：</p>
              <button @click="showRouteForMode('driving', clinic)">驾车</button>
              <button @click="showRouteForMode('walking', clinic)">步行</button>
              <button @click="showRouteForMode('cycling', clinic)">骑行</button>
            </div>
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

const auth = getAuth()
const db = getFirestore()
const user = auth.currentUser

const username = ref('')
const currentDate = new Date().toLocaleDateString()
const searchQuery = ref('')
const suggestions = ref([])
const startSuggestions = ref([])
const endSuggestions = ref([])
const nearbyClinics = ref([])
const startLocation = ref('')
const endLocation = ref('')
const map = ref(null)
const selectedClinic = ref(null) // 用于存储选中的诊所

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
  mapboxgl.accessToken = 'pk.eyJ1IjoiY2hsb2V5dWUiLCJhIjoiY20xejJpb3BhMDJndTJrcHpwaG9ocHE0NyJ9.jHaWplmk0Y_XWTLCtuAm4A'; // 请替换为您的Mapbox access token
  map.value = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [145.045837, -37.876823],
    zoom: 12
  });
}

// 地址推荐功能 - 搜索框
const getPlaceSuggestions = async () => {
  if (!searchQuery.value) {
    suggestions.value = []
    return
  }

  const apiUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery.value)}.json?access_token=${mapboxgl.accessToken}&autocomplete=true`;
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

// 地址推荐功能 - 起始位置
const getStartLocationSuggestions = async () => {
  if (!startLocation.value) {
    startSuggestions.value = []
    return
  }

  const apiUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(startLocation.value)}.json?access_token=${mapboxgl.accessToken}&autocomplete=true`;
  try {
    const response = await axios.get(apiUrl)
    startSuggestions.value = response.data.features
  } catch (error) {
    console.error('Error fetching start location suggestions:', error)
  }
}

const selectStartLocation = (suggestion) => {
  startLocation.value = suggestion.place_name
  startSuggestions.value = []
}

// 地址推荐功能 - 结束位置
const getEndLocationSuggestions = async () => {
  if (!endLocation.value) {
    endSuggestions.value = []
    return
  }

  const apiUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(endLocation.value)}.json?access_token=${mapboxgl.accessToken}&autocomplete=true`;
  try {
    const response = await axios.get(apiUrl)
    endSuggestions.value = response.data.features
  } catch (error) {
    console.error('Error fetching end location suggestions:', error)
  }
}

const selectEndLocation = (suggestion) => {
  endLocation.value = suggestion.place_name
  endSuggestions.value = []
}

// 显示交通方式选择框
const showTransportOptions = (clinic) => {
  selectedClinic.value = clinic; // 存储当前选中的诊所
}

// 根据选择的交通方式显示路线
const showRouteForMode = async (mode, clinic) => {
  let startCoords;
  
  if (startLocation.value) {
    startCoords = await getCoordinatesFromAddress(startLocation.value);
  } else {
    startCoords = map.value.getCenter().toArray(); // 默认使用当前地图中心作为起点
  }

  if (!startCoords) {
    console.error('Invalid start coordinates');
    return;
  }

  const endCoords = clinic.coordinates;
  if (!endCoords) {
    console.error('Invalid end coordinates');
    return;
  }

  // 调用 Mapbox Directions API 获取路线
  await fetchRoutesFromAPI(startCoords, endCoords, mode);
};

const fetchRoutesFromAPI = async (startCoords, endCoords, mode) => {
  const apiUrl = `https://api.mapbox.com/directions/v5/mapbox/${mode}/${startCoords.join(',')};${endCoords.join(',')}?geometries=geojson&access_token=${mapboxgl.accessToken}`;

  try {
    const response = await axios.get(apiUrl);
    const route = response.data.routes[0]; // 获取第一条路线
    if (route) {
      const routeCoordinates = route.geometry.coordinates;

      // 在地图上添加路线
      map.value.addSource(`route-${mode}`, {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: routeCoordinates
          }
        }
      });

      map.value.addLayer({
        id: `route-${mode}`,
        type: 'line',
        source: `route-${mode}`,
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': mode === 'driving' ? '#FF0000' : mode === 'walking' ? '#00FF00' : '#0000FF',
          'line-width': 5
        }
      });
    }
  } catch (error) {
    console.error(`Error fetching ${mode} route:`, error);
  }
}

const getCoordinatesFromAddress = async (address) => {
  const apiUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${mapboxgl.accessToken}`;
  try {
    const response = await axios.get(apiUrl);
    if (response.data.features.length > 0) {
      return response.data.features[0].geometry.coordinates;
    }
    return null;
  } catch (error) {
    console.error('Error getting coordinates:', error);
    return null;
  }
}

const searchGP = () => {
  if (map.value) {
    const center = map.value.getCenter();
    fetchNearbyClinics([center.lng, center.lat]);
  }
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
  align-items: center;
}

.logo {
  width: 100px;
  height: auto;
  margin-right: 20px;
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

.route-box {
  position: relative;
  width: 100%;
}

.route-input {
  width: 100%;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ddd;
  margin-bottom: 10px;
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

.transport-options {
  margin-top: 10px;
}

.transport-options button {
  margin-right: 10px;
  padding: 5px 10px;
  border: 1px solid #ccc;
  background-color: #fff;
  cursor: pointer;
}

.transport-options button:hover {
  background-color: #f0f0f0;
}
</style>
