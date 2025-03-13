<template>
  <div class="clinic-view-container">
    <header class="header">
      <h1>Hi, {{ username }}</h1>
      <p>{{ currentDate }}</p>
    </header>
    <div class="search-container">
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Search nearby GP..."
        class="search-input"
        @input="onSearchInput"
      />
      <button @click="searchGP" class="search-btn">Search</button>
    </div>
    <div ref="mapContainer" class="map-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import mapboxgl from 'mapbox-gl';
import axios from 'axios';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const mapContainer = ref(null);
const searchQuery = ref('');
const map = ref(null);
const username = ref('');
const currentDate = new Date().toLocaleDateString();

// Firebase setup
const db = getFirestore();
const auth = getAuth();
const user = auth.currentUser;

const getUserData = async () => {
  if (user) {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      username.value = userDoc.data().username;
    }
  }
};

// Initialize Mapbox map
const initializeMap = (lng, lat) => {
  map.value = new mapboxgl.Map({
    container: mapContainer.value,
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [lng, lat],
    zoom: 14,
  });
};

// Search nearby clinics using Mapbox API
const searchNearbyClinics = async (coords) => {
  const [lng, lat] = coords;

  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/clinic.json?proximity=${lng},${lat}&access_token=${mapboxgl.accessToken}&limit=10`;

  try {
    const response = await axios.get(url);
    if (response.data.features.length > 0) {
      return response.data.features; // 返回诊所列表
    } else {
      console.log('No clinics found nearby.');
      return [];
    }
  } catch (error) {
    console.error('Error searching nearby clinics:', error);
    return [];
  }
};

// Mark clinics on the map
const markClinicsOnMap = (clinics) => {
  clinics.forEach((clinic) => {
    const [lng, lat] = clinic.geometry.coordinates;

    // 添加📌标记
    const popup = new mapboxgl.Popup({ offset: 25 }).setText(clinic.place_name);

    const el = document.createElement('div');
    el.className = 'marker';
    el.innerHTML = '📌';

    new mapboxgl.Marker(el)
      .setLngLat([lng, lat])
      .setPopup(popup)
      .addTo(map.value);
  });
};

// Search GP and show clinics on the map
const searchGP = async () => {
  if (!searchQuery.value) {
    console.log('Please enter a location.');
    return;
  }

  try {
    const coords = map.value.getCenter().toArray(); // 获取地图中心的坐标
    const clinics = await searchNearbyClinics(coords);

    // 清除旧的诊所标记
    document.querySelectorAll('.marker').forEach((marker) => marker.remove());

    if (clinics.length > 0) {
      markClinicsOnMap(clinics); // 显示诊所标记
    } else {
      console.log('No clinics found');
    }
  } catch (error) {
    console.error('Error fetching GP data:', error);
  }
};

// Handle search input changes
const onSearchInput = () => {
  // Optional: 可添加地址自动完成下拉框提示功能
};

onMounted(async () => {
  mapboxgl.accessToken = 'pk.eyJ1IjoiY2hsb2V5dWUiLCJhIjoiY20xejJpb3BhMDJndTJrcHpwaG9ocHE0NyJ9.jHaWplmk0Y_XWTLCtuAm4A';
  await getUserData();

  // 初始化地图
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { longitude, latitude } = position.coords;
      initializeMap(longitude, latitude);
    },
    () => {
      // 如果获取地理位置失败，使用默认位置
      initializeMap(145.1357, -37.911); // 例如：墨尔本的经纬度
    }
  );
});
</script>

<style scoped>
.clinic-view-container {
  width: 100%;
  height: 100vh;
}

.header {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  background-color: #f5f5f5;
  font-size: 18px;
}

.search-container {
  display: flex;
  justify-content: center;
  margin: 20px;
}

.search-input {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
}

.search-btn {
  margin-left: 10px;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.search-btn:hover {
  background-color: #0056b3;
}

.map-container {
  height: 80vh;
}

.marker {
  font-size: 24px;
}
</style>
