<template>
  <div class="container">
    <div class="search-box">
      <input v-model="address" @keyup.enter="searchLocation" placeholder="输入地址" />
      <button @click="searchLocation">搜索</button>
    </div>
    <div class="map-container">
      <div id="map" ref="mapContainer"></div>
    </div>
    <div class="clinic-list">
      <h3>3公里内的诊所</h3>
      <ul>
        <li v-for="clinic in nearbyClinics" :key="clinic.id">
          {{ clinic.name }}
          <button @click="showRoute(clinic)">GO</button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

export default {
  data() {
    return {
      map: null,
      address: '',
      nearbyClinics: [],
      mapboxToken: 'pk.eyJ1IjoiY2hsb2V5dWUiLCJhIjoiY20xejJpb3BhMDJndTJrcHpwaG9ocHE0NyJ9.jHaWplmk0Y_XWTLCtuAm4A' // 请替换为您的Mapbox token
    };
  },
  mounted() {
    this.initializeMap();
  },
  methods: {
    initializeMap() {
      mapboxgl.accessToken = this.mapboxToken;
      this.map = new mapboxgl.Map({
        container: this.$refs.mapContainer,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [116.4074, 39.9042], // 北京的经纬度
        zoom: 12
      });

      this.map.addControl(new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl
      }));
    },
    searchLocation() {
      // 使用Mapbox Geocoding API来搜索地址
      fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(this.address)}.json?access_token=${this.mapboxToken}`)
        .then(response => response.json())
        .then(data => {
          if (data.features && data.features.length > 0) {
            const [lng, lat] = data.features[0].center;
            this.map.flyTo({ center: [lng, lat], zoom: 14 });
            this.findNearbyClinics(lng, lat);
          }
        });
    },
    findNearbyClinics(lng, lat) {
      // 这里应该调用您的后端API来获取附近的诊所
      // 为了演示，我们使用模拟数据
      this.nearbyClinics = [
        { id: 1, name: '心理诊所A', coordinates: [lng + 0.01, lat + 0.01] },
        { id: 2, name: '心理诊所B', coordinates: [lng - 0.01, lat - 0.01] },
        { id: 3, name: '心理诊所C', coordinates: [lng + 0.02, lat - 0.02] },
      ];

      // 在地图上添加诊所标记
      this.nearbyClinics.forEach(clinic => {
        new mapboxgl.Marker()
          .setLngLat(clinic.coordinates)
          .addTo(this.map);
      });
    },
    showRoute(clinic) {
      const start = this.map.getCenter();
      const end = clinic.coordinates;

      // 使用Mapbox Directions API来获取路线
      fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${start.lng},${start.lat};${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${this.mapboxToken}`)
        .then(response => response.json())
        .then(data => {
          const route = data.routes[0].geometry;

          if (this.map.getSource('route')) {
            this.map.getSource('route').setData(route);
          } else {
            this.map.addLayer({
              id: 'route',
              type: 'line',
              source: {
                type: 'geojson',
                data: route
              },
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
        });
    }
  }
}
</script>

<style scoped>
.container {
  display: flex;
  height: 100vh;
}
.search-box {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 1;
}
.map-container {
  flex: 2;
  height: 100%;
}
#map {
  width: 100%;
  height: 100%;
}
.clinic-list {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}
</style>