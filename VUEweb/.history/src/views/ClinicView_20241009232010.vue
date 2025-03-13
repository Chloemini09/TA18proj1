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
              <span v-if="bestRouteMode && selectedClinic.id === clinic.id" class="best-route">
                推荐的交通方式是: {{ bestRouteMode }}
              </span>
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
const bestRouteMode = ref(null);

// 获取用户信息
const getUserInfo = async () => {
  if (user) {
    const docRef = doc(db, 'users', user.uid)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      username.value = docSnap.data().username
    }
  }
}

// 初始化地图
const setupMap = () => {
  mapboxgl.accessToken = 'pk.eyJ1IjoiY2hsb2V5dWUiLCJhIjoiY20xejJpb3BhMDJndTJrcHpwaG9ocHE0NyJ9.jHaWplmk0Y_XWTLCtuAm4A'; // 请替换为您的Mapbox access token
  map.value = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [145.045837, -37.876823],
    zoom: 12
  });
}

// 搜索框的地址推荐
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

// 获取起点的地址推荐
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

// 获取终点的地址推荐
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
  showRecommendedRoute(clinic);
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

  // 在显示新路线之前，清除之前的路线
  clearPreviousRoutes();

  // 调用 Mapbox Directions API 获取路线
  await fetchRoutesFromAPI(startCoords, endCoords, mode);
};

const clearPreviousRoutes = () => {
  const transportModes = ['driving', 'walking', 'cycling'];
  
  transportModes.forEach((mode) => {
    if (map.value.getSource(`route-${mode}`)) {
      map.value.removeLayer(`route-${mode}`);
      map.value.removeSource(`route-${mode}`);
    }
  });
};

// 获取路线并显示在地图上
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
const recommendBestMode = async (startCoords, endCoords) => {
  const transportModes = ['driving', 'walking', 'cycling'];
  let bestMode = null;
  let shortestDuration = Infinity;

  for (const mode of transportModes) {
    const apiUrl = `https://api.mapbox.com/directions/v5/mapbox/${mode}/${startCoords.join(',')};${endCoords.join(',')}?geometries=geojson&access_token=${mapboxgl.accessToken}`;

    try {
      const response = await axios.get(apiUrl);
      const route = response.data.routes[0];

      if (route && route.duration < shortestDuration) {
        shortestDuration = route.duration;
        bestMode = mode;
      }
    } catch (error) {
      console.error(`Error fetching ${mode} route:`, error);
    }
  }

  return bestMode;
};

// 使用推荐的交通方式显示路线
const showRecommendedRoute = async (clinic) => {
  let startCoords;
  
  if (startLocation.value) {
    startCoords = await getCoordinatesFromAddress(startLocation.value);
  } else {
    startCoords = map.value.getCenter().toArray(); // 默认使用当前地图中心作为起点
  }

  const endCoords = clinic.coordinates;

  if (!startCoords || !endCoords) {
    console.error('Invalid start or end coordinates');
    return;
  }

  // 清除之前的路线
  clearPreviousRoutes();

  // 获取推荐的交通方式
  bestRouteMode.value = await recommendBestMode(startCoords, endCoords);

  if (bestRouteMode.value) {
    // 显示推荐路线
    await fetchRoutesFromAPI(startCoords, endCoords, bestRouteMode.value);
  } else {
    console.error('无法获取推荐的交通方式');
  }
};

// 根据地址获取经纬度
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

// 搜索附近诊所
const searchGP = () => {
  if (map.value) {
    const center = map.value.getCenter();
    fetchNearbyClinics([center.lng, center.lat]);
  }
}

// 获取附近诊所
const fetchNearbyClinics = async (coordinates) => {
  const apiUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/doctor.json?proximity=${coordinates[0]},${coordinates[1]}&access_token=${mapboxgl.accessToken}`;
  try {
    const response = await axios.get(apiUrl);
    nearbyClinics.value = response.data.features.map(feature => ({
      id: feature.id,
      name: feature.text,
      address: feature.place_name,
      coordinates: feature.geometry.coordinates,
    }));

    // 清除地图上的所有标记
    map.value.eachLayer(layer => {
      if (layer instanceof mapboxgl.Marker) {
        layer.remove();
      }
    });

    // 在地图上添加诊所标记
    nearbyClinics.value.forEach(clinic => {
      const marker = new mapboxgl.Marker({ color: 'red' })
        .setLngLat(clinic.coordinates)
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setText(`${clinic.name}\n${clinic.address}`))
        .addTo(map.value);
    });
  } catch (error) {
    console.error('Error fetching nearby clinics:', error);
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
