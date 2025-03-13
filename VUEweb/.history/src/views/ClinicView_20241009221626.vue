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
        <button @click="getRoutes" class="route-btn">GO</button>
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
            <button @click="getRoutes(clinic.coordinates)">GO</button> <!-- 新增GO按钮 -->
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
const nearbyClinics = ref([])
const startLocation = ref('')
const endLocation = ref('')
const map = ref(null)

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
  mapboxgl.accessToken = 'pk.eyJ1IjoiY2hsb2V5dWUiLCJhIjoiY20xejJpb3BhMDJndTJrcHpwaG9ocHE0NyJ9.jHaWplmk0Y_XWTLCtuAm4A'; // 替换为实际令牌
  map.value = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [145.045837, -37.876823], // 初始中心位置
    zoom: 12
  });
}

// 获取搜索建议
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

// 选择地址建议
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

// 获取附近诊所
const fetchNearbyClinics = async (coordinates) => {
  const apiUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/doctor.json?proximity=${coordinates[0]},${coordinates[1]}&access_token=pk.eyJ1IjoiY2hsb2V5dWUiLCJhIjoiY20xejJpb3BhMDJndTJrcHpwaG9ocHE0NyJ9.jHaWplmk0Y_XWTLCtuAm4A`;
  try {
    const response = await axios.get(apiUrl);
    nearbyClinics.value = response.data.features.map(feature => ({
      id: feature.id,
      name: feature.text,
      address: feature.place_name,
      coordinates: feature.geometry.coordinates,
    }));

    // 清空之前的标记
    if (map.value) {
      map.value.eachLayer(layer => {
        if (layer instanceof mapboxgl.Marker) {
          layer.remove();
        }
      });
    }

    // 添加新标记
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

// 获取三条推荐路线
const getRoutes = async (clinicCoordinates) => {
  const startCoords = await getCoordinatesFromAddress(startLocation.value); // 获取起点坐标
  if (!startCoords) {
    console.error('Invalid start coordinates');
    return;
  }

  displayRoutes(startCoords, clinicCoordinates); // 显示路线
}

// 地址转坐标
const getCoordinatesFromAddress = async (address) => {
  const apiUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=pk.eyJ1IjoiY2hsb2V5dWUiLCJhIjoiY20xejJpb3BhMDJndTJrcHpwaG9ocHE0NyJ9.jHaWplmk0Y_XWTLCtuAm4A`;
  try {
    const response = await axios.get(apiUrl);
    if (response.data.features.length > 0) {
      return response.data.features[0].geometry.coordinates; // 返回坐标
    }
    return null; // 返回null以指示无效
  } catch (error) {
    console.error('Error getting coordinates:', error);
  }
}

// 显示三条推荐路线
const displayRoutes = async (startCoords, endCoords) => {
  const transportModes = ['driving', 'walking', 'transit']; // 三种交通方式
  transportModes.forEach(async mode => {
    const apiUrl = `https://api.mapbox.com/directions/v5/mapbox/${mode}/${startCoords.join(',')};${endCoords.join(',')}?access_token=pk.eyJ1IjoiY2hsb2V5dWUiLCJhIjoiY20xejJpb3BhMDJndTJrcHpwaG9ocHE0NyJ9.jHaWplmk0Y_XWTLCtuAm4A`;

    try {
      const response = await axios.get(apiUrl);
      const route = response.data.routes[0];
      if (route) {
        const routeCoordinates = route.geometry.coordinates;

        // 在地图上添加路线
        if (map.value) {
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
              'line-color': mode === 'driving' ? '#FF0000' : mode === 'walking' ? '#00FF00' : '#0000FF', // 根据交通方式设置不同颜色
              'line-width': 5
            }
          });
        }
      }
    } catch (error) {
      console.error(`Error fetching route for ${mode}:`, error);
    }
  });
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
