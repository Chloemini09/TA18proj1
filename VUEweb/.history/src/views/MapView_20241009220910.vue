<template>
    <div class="map-view-container">
      <header class="header">
        <h1>Navigation</h1>
        <div class="route-inputs">
          <input 
            type="text" 
            v-model="startLocation" 
            placeholder="Enter start location" 
            class="route-input"
            @input="getPlaceSuggestionsStart"
          />
          <input 
            type="text" 
            v-model="endLocation" 
            placeholder="Enter end location" 
            class="route-input"
            @input="getPlaceSuggestionsEnd"
          />
          <button @click="getRoute" class="route-btn">Get Route</button>
        </div>
      </header>
  
      <div id="map" class="map"></div>
  
      <div class="transport-options">
        <label for="transportMode">Select Transport Mode:</label>
        <select v-model="transportMode" id="transportMode">
          <option value="driving">Driving</option>
          <option value="walking">Walking</option>
          <option value="transit">Transit</option>
        </select>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import mapboxgl from 'mapbox-gl'
  import axios from 'axios'
  import { useRoute } from 'vue-router'
  
  const route = useRoute()
  const startCoords = route.params.startCoords // 从 `ClinicView` 传入的起点坐标
  const endCoords = route.params.endCoords     // 从 `ClinicView` 传入的终点坐标
  const map = ref(null)
  
  const startLocation = ref('')
  const endLocation = ref('')
  const transportMode = ref('driving') // 交通方式默认选择为开车
  
  const setupMap = () => {
    if (!startCoords || !endCoords) {
      console.error('Start or end coordinates are not defined');
      return;
    }
    
    mapboxgl.accessToken = 'pk.eyJ1IjoiY2hsb2V5dWUiLCJhIjoiY20xejJpb3BhMDJndTJrcHpwaG9ocHE0NyJ9.jHaWplmk0Y_XWTLCtuAm4A'; // 替换为实际令牌
    map.value = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: startCoords, // 设置初始中心为起点
      zoom: 12
    });
  
    getRoute(); // 获取路线
  }
  
  // 获取导航路线
  const getRoute = async () => {
    const apiUrl = `https://api.mapbox.com/directions/v5/mapbox/${transportMode.value}/${startCoords.join(',')};${endCoords.join(',')}?access_token=pk.eyJ1IjoiY2hsb2V5dWUiLCJhIjoiY20xejJpb3BhMDJndTJrcHpwaG9ocHE0NyJ9.jHaWplmk0Y_XWTLCtuAm4A`;
  
    try {
      const response = await axios.get(apiUrl);
      const routeData = response.data.routes[0];
      if (!routeData) {
        console.error('No route found');
        return;
      }
      const routeCoordinates = routeData.geometry.coordinates;
  
      // 在地图上添加路线
      if (map.value) {
        map.value.addSource('route', {
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
          id: 'route',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#888',
            'line-width': 8
          }
        });
      }
  
      // 显示预计时间和距离
      alert(`Estimated time: ${routeData.duration} seconds, Distance: ${routeData.distance / 1000} km`);
    } catch (error) {
      console.error('Error fetching route:', error);
    }
  }
  
  // 获取起点和终点的地址提示
  const getPlaceSuggestionsStart = async () => {
    // 添加地址提示的逻辑
  }
  
  const getPlaceSuggestionsEnd = async () => {
    // 添加地址提示的逻辑
  }
  
  onMounted(() => {
    setupMap();
  })
  </script>
  
  <style scoped>
  .map-view-container {
    height: 100vh;
    padding: 20px;
  }
  
  .header {
    display: flex;
    flex-direction: column;
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
  
  .map {
    width: 100%;
    height: 100%;
    margin-top: 20px;
  }
  
  .transport-options {
    margin-top: 20px;
  }
  </style>
  