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
            <button @click="getRoutes(clinic.coordinates)">GO</button>
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
  mapboxgl.accessToken = 'pk.eyJ1IjoiY2hsb2V5dWUiLCJhIjoiY20xejJpb3BhMDJndTJrcHpwaG9ocHE0NyJ9.jHaWplmk0Y_XWTLCtuAm4A';
  map.value = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [145.045837, -37.876823],
    zoom: 12
  });
}

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

    if (map.value) {
      map.value.eachLayer(layer => {
        if (layer instanceof mapboxgl.Marker) {
          layer.remove();
        }
      });
    }

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

const getRoutes = async (clinicCoordinates) => {
  let startCoords;
  
  if (startLocation.value) {
    startCoords = await getCoordinatesFromAddress(startLocation.value);
  } else {
    startCoords = map.value.getCenter().toArray();
  }

  if (!startCoords) {
    console.error('Invalid start coordinates');
    return;
  }

  let endCoords = clinicCoordinates;
  if (!endCoords && endLocation.value) {
    endCoords = await getCoordinatesFromAddress(endLocation.value);
  }

  if (!endCoords) {
    console.error('Invalid end coordinates');
    return;
  }

  // 调用 displayRoutes 函数来显示不同交通方式的路线
  await displayRoutes(startCoords, endCoords);
};

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

const displayRoutes = async (startCoords, endCoords) => {
  const transportModes = ['driving', 'walking', 'transit'];
  
  // 先清除之前的路线图层和源
  transportModes.forEach(mode => {
    if (map.value.getSource(`route-${mode}`)) {
      map.value.removeLayer(`route-${mode}`);
      map.value.removeSource(`route-${mode}`);
    }
  });

  // 为每种交通方式请求路线并显示在地图上
  transportModes.forEach(async mode => {
    const apiUrl = `https://api.mapbox.com/directions/v5/mapbox/${mode}/${startCoords.join(',')};${endCoords.join(',')}?geometries=geojson&access_token=${mapboxgl.accessToken}`;

    try {
      const response = await axios.get(apiUrl);
      const route = response.data.routes[0];
      if (route) {
        const routeCoordinates = route.geometry.coordinates;

        // 确保路线添加到地图中
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
              'line-color': mode === 'driving' ? '#FF0000' : mode === 'walking' ? '#00FF00' : '#0000FF',
              'line-width': 5
            }
          });
        }
      }
    } catch (error) {
      console.error(`Error fetching route for ${mode}:`, error);
    }
  });
};

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