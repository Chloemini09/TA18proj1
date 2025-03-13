<template>
    <div class="map-view-container">
      <div id="map" class="map"></div>
    </div>
  </template>
  
  <script setup>
  import { onMounted, ref } from 'vue'
  import mapboxgl from 'mapbox-gl'
  import axios from 'axios'
  import { useRoute } from 'vue-router'
  
  const route = useRoute()
  const startCoords = route.params.startCoords // 获取起点坐标
  const endCoords = route.params.endCoords     // 获取终点坐标
  const map = ref(null)
  
  const setupMap = () => {
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
    const apiUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${startCoords.join(',')};${endCoords.join(',')}?access_token=pk.eyJ1IjoiY2hsb2V5dWUiLCJhIjoiY20xejJpb3BhMDJndTJrcHpwaG9ocHE0NyJ9.jHaWplmk0Y_XWTLCtuAm4A`;
  
    try {
      const response = await axios.get(apiUrl);
      const route = response.data.routes[0];
      const routeCoordinates = route.geometry.coordinates;
  
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
      alert(`Estimated time: ${route.duration} seconds, Distance: ${route.distance / 1000} km`);
    } catch (error) {
      console.error('Error fetching route:', error);
    }
  }
  
  onMounted(() => {
    setupMap();
  })
  </script>
  
  <style scoped>
  .map-view-container {
    height: 100vh;
  }
  
  #map {
    width: 100%;
    height: 100%;
  }
  </style>
  