<template>
  <div class="clinic-view-container">
    <!-- 保持头部不变 -->
    <header class="header">
      <img src="@/assets/logo.png" alt="Health Test Logo" class="logo" />
      <h1>Hi, {{ username }}</h1>
      <p>{{ currentDate }}</p>
    </header>

    <!-- 搜索框保持不变 -->
    <div class="search-container">
      <!-- ... 搜索框代码 ... -->
    </div>

    <!-- 移除导航输入框，因为我们现在直接从诊所列表导航 -->

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
            <div class="transport-buttons">
              <button @click="getRoutes(clinic.coordinates, 'walking')" class="transport-btn walking">步行</button>
              <button @click="getRoutes(clinic.coordinates, 'driving')" class="transport-btn driving">驾车</button>
              <button @click="getRoutes(clinic.coordinates, 'transit')" class="transport-btn transit">公交</button>
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

// ... 保持其他变量和函数不变 ...

const getRoutes = async (clinicCoordinates, mode) => {
  clearRoutes(); // 清除之前的路线

  const startCoords = map.value.getCenter().toArray();

  if (!startCoords || !clinicCoordinates) {
    console.error('Invalid coordinates');
    return;
  }

  displayRoute(startCoords, clinicCoordinates, mode);
}

const clearRoutes = () => {
  ['walking', 'driving', 'transit'].forEach(mode => {
    if (map.value.getLayer(`route-${mode}`)) {
      map.value.removeLayer(`route-${mode}`);
    }
    if (map.value.getSource(`route-${mode}`)) {
      map.value.removeSource(`route-${mode}`);
    }
  });
}

const displayRoute = async (startCoords, endCoords, mode) => {
  const apiUrl = `https://api.mapbox.com/directions/v5/mapbox/${mode}/${startCoords.join(',')};${endCoords.join(',')}?geometries=geojson&access_token=${mapboxgl.accessToken}`;

  try {
    const response = await axios.get(apiUrl);
    const route = response.data.routes[0];
    if (route) {
      const routeCoordinates = route.geometry.coordinates;

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

        // 调整地图视图以包含整个路线
        const bounds = new mapboxgl.LngLatBounds();
        routeCoordinates.forEach(coord => bounds.extend(coord));
        map.value.fitBounds(bounds, { padding: 50 });
      }
    }
  } catch (error) {
    console.error(`Error fetching route for ${mode}:`, error);
  }
}

// ... 保持其他函数不变 ...

onMounted(() => {
  getUserInfo()
  setupMap()
})
</script>

<style scoped>
/* ... 保持之前的样式 ... */

.transport-buttons {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.transport-btn {
  padding: 5px 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9rem;
  color: white;
}

.walking {
  background-color: #00FF00;
}

.driving {
  background-color: #FF0000;
}

.transit {
  background-color: #0000FF;
}
</style>