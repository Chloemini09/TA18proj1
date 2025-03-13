<template>
  <div class="clinic-container">
    <header class="header">
      <img src="@/assets/logo.png" alt="Logo" class="logo" />
      <div class="header-text">
        <h1>附近的GP</h1>
        <p>{{ currentDate }}</p>
      </div>
    </header>
    <button class="back-btn" @click="goBack">← 返回</button>
    
    <!-- 搜索栏 -->
    <div class="search-container">
      <input
        type="text"
        v-model="searchQuery"
        placeholder="搜索附近的GP..."
        @keypress.enter="searchNearbyGPs"
      />
      <button @click="searchNearbyGPs" class="search-btn">搜索</button>
    </div>

    <!-- 地图显示 -->
    <div id="map" class="map-container"></div>

    <!-- GP 列表显示 -->
    <section v-if="gps.length > 0" class="gp-list">
      <h3>附近可用的GP:</h3>
      <ul>
        <li v-for="(gp, index) in gps" :key="index" @click="navigateToGP(gp)">
          {{ gp.place_name }}
        </li>
      </ul>
    </section>

    <section v-else>
      <p>没有找到附近的GP，请尝试不同的地点或搜索条件。</p>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import mapboxgl from 'mapbox-gl';

// Mapbox token（替换为你自己的Mapbox密钥）
mapboxgl.accessToken = 'pk.eyJ1IjoiY2hsb2V5dWUiLCJhIjoiY20xejJpb3BhMDJndTJrcHpwaG9ocHE0NyJ9.jHaWplmk0Y_XWTLCtuAm4A';

const searchQuery = ref('');
const gps = ref([]);
const currentDate = new Date().toLocaleDateString();

let map;
let userLocation = [0, 0]; // 用户的地理位置占位符

// 初始化地图
onMounted(() => {
  navigator.geolocation.getCurrentPosition(successLocation, errorLocation, {
    enableHighAccuracy: true
  });

  function successLocation(position) {
    userLocation = [position.coords.longitude, position.coords.latitude];
    setupMap(userLocation);
  }

  function errorLocation() {
    setupMap([0, 0]); // 如果获取地理位置失败，则默认显示[0, 0]
  }

  function setupMap(center) {
    map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: center,
      zoom: 12
    });

    new mapboxgl.Marker().setLngLat(center).addTo(map);
  }
});

// 使用 Mapbox Geocoding API 搜索附近的GP
async function searchNearbyGPs() {
  const response = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/gp.json?proximity=${userLocation[0]},${userLocation[1]}&access_token=${mapboxgl.accessToken}`
  );
  const data = await response.json();
  gps.value = data.features;

  // 在地图上添加GP的位置标记
  gps.value.forEach((gp) => {
    new mapboxgl.Marker().setLngLat(gp.center).addTo(map);
  });
}

// 导航到选中的GP
function navigateToGP(gp) {
  map.flyTo({
    center: gp.center,
    essential: true,
    zoom: 15
  });
}

// 返回上一个页面
const router = useRouter();
function goBack() {
  router.push('/home');
}
</script>

<style scoped>
.clinic-container {
  max-width: 800px;
  margin: auto;
  padding: 20px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid #ddd;
}
.logo {
  width: 60px;
  height: auto;
}
.header-text {
  flex-grow: 1;
  text-align: right;
}
.back-btn {
  background-color: transparent;
  border: none;
  font-size: 1.2rem;
  color: #4caf50;
  cursor: pointer;
  margin-top: 20px;
}
.back-btn:hover {
  text-decoration: underline;
}

.search-container {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}

.search-btn {
  background-color: #4caf50;
  color: white;
  padding: 10px 15px;
  border: none;
  cursor: pointer;
  border-radius: 5px;
}
.search-btn:hover {
  background-color: #45a049;
}

.map-container {
  margin-top: 20px;
  width: 100%;
  height: 400px;
}

.gp-list {
  margin-top: 20px;
}
.gp-list ul {
  list-style-type: none;
  padding: 0;
}
.gp-list li {
  padding: 10px;
  background-color: #f9f9f9;
  margin-bottom: 10px;
  cursor: pointer;
  border-radius: 5px;
  transition: background-color 0.2s ease;
}
.gp-list li:hover {
  background-color: #e0e0e0;
}
</style>
