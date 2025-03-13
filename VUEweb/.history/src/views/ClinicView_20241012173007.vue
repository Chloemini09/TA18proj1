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
      <h3>附近的医疗机构</h3>
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
import axios from 'axios';

mapboxgl.accessToken = 'pk.eyJ1IjoiY2hsb2V5dWUiLCJhIjoiY20xejJpb3BhMDJndTJrcHpwaG9ocHE0NyJ9.jHaWplmk0Y_XWTLCtuAm4A';

export default {
  data() {
    return {
      map: null,
      address: '',
      nearbyClinics: [],
      userLocation: null,
    };
  },
  mounted() {
    this.initializeMap();
  },
  methods: {
    initializeMap() {
      this.map = new mapboxgl.Map({
        container: this.$refs.mapContainer,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [116.4074, 39.9042], // 北京的经纬度
        zoom: 12
      });

      this.map.addControl(new mapboxgl.NavigationControl());
      this.map.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true
          },
          trackUserLocation: true,
          showUserHeading: true
        })
      );
    },
    searchLocation() {
      axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(this.address)}.json`, {
        params: {
          access_token: mapboxgl.accessToken,
          limit: 1
        }
      })
      .then(response => {
        if (response.data.features && response.data.features.length > 0) {
          const [lng, lat] = response.data.features[0].center;
          this.userLocation = [lng, lat];
          this.map.flyTo({ center: [lng, lat], zoom: 14 });
          this.findNearbyClinics(lng, lat);
        }
      })
      .catch(error => {
        console.error('Error searching for location:', error);
      });
    },
    findNearbyClinics(lng, lat) {
      axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/hospital.json`, {
        params: {
          access_token: mapboxgl.accessToken,
          proximity: `${lng},${lat}`,
          limit: 5
        }
      })
      .then(response => {
        this.nearbyClinics = response.data.features.map(feature => ({
          id: feature.id,
          name: feature.text,
          coordinates: feature.center
        }));

        // 清除之前的标记
        const markers = document.getElementsByClassName('mapboxgl-marker');
        while(markers[0]) {
          markers[0].parentNode.removeChild(markers[0]);
        }

        // 添加新的标记
        this.nearbyClinics.forEach(clinic => {
          new mapboxgl.Marker()
            .setLngLat(clinic.coordinates)
            .addTo(this.map);
        });
      })
      .catch(error => {
        console.error('Error finding nearby clinics:', error);
      });
    },
    showRoute(clinic) {
      if (!this.userLocation) {
        alert('请先搜索您的位置');
        return;
      }

      const start = this.userLocation.join(',');
      const end = clinic.coordinates.join(',');

      axios.get(`https://api.mapbox.com/directions/v5/mapbox/driving/${start};${end}`, {
        params: {
          steps: true,
          geometries: 'geojson',
          access_token: mapboxgl.accessToken
        }
      })
      .then(response => {
        const route = response.data.routes[0].geometry;

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
      })
      .catch(error => {
        console.error('Error fetching route:', error);
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