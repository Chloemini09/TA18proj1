<template>
  <div class="clinic-view">
    <div class="sidebar">
      <div class="search-container">
        <input
          v-model="searchQuery"
          @input="searchAddress"
          placeholder="输入墨尔本地址"
          class="search-input"
        />
        <ul v-if="suggestions.length" class="suggestions">
          <li
            v-for="suggestion in suggestions"
            :key="suggestion.id"
            @click="selectAddress(suggestion)"
            class="suggestion-item"
          >
            {{ suggestion.place_name }}
          </li>
        </ul>
      </div>
      <div class="clinic-list">
        <h3>附近的诊所</h3>
        <ul>
          <li
            v-for="clinic in nearbyClinics"
            :key="clinic.id"
            @click="showRoute(clinic)"
            class="clinic-item"
          >
            {{ clinic.text }}
          </li>
        </ul>
      </div>
      <div v-if="selectedClinic" class="route-info">
        <h3>路线信息</h3>
        <div class="route-options">
          <button @click="getRoute('driving')" class="route-button">开车</button>
          <button @click="getRoute('walking')" class="route-button">步行</button>
          <button @click="getRoute('cycling')" class="route-button">骑行</button>
        </div>
        <div v-if="routeSteps.length" class="route-steps">
          <h4>行进方向:</h4>
          <ol>
            <li v-for="(step, index) in routeSteps" :key="index" class="route-step">
              {{ step.maneuver.instruction }}
            </li>
          </ol>
        </div>
      </div>
    </div>
    <div id="map" ref="mapContainer" class="map-container"></div>
  </div>
</template>

<script>
import mapboxgl from 'mapbox-gl';
import axios from 'axios';

mapboxgl.accessToken = 'pk.eyJ1IjoiY2hsb2V5dWUiLCJhIjoiY20xejJpb3BhMDJndTJrcHpwaG9ocHE0NyJ9.jHaWplmk0Y_XWTLCtuAm4A';

export default {
  name: 'ClinicView',
  data() {
    return {
      map: null,
      searchQuery: '',
      suggestions: [],
      nearbyClinics: [],
      selectedClinic: null,
      routeSteps: [],
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
        center: [144.9631, -37.8136], // 墨尔本的经纬度
        zoom: 12
      });

      this.map.addControl(new mapboxgl.NavigationControl());
    },
    async searchAddress() {
      if (this.searchQuery.length > 2) {
        try {
          const response = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(this.searchQuery)}.json`, {
            params: {
              access_token: mapboxgl.accessToken,
              country: 'AU',
              proximity: '144.9631,-37.8136'
            }
          });
          this.suggestions = response.data.features;
        } catch (error) {
          console.error('Error searching for address:', error);
        }
      } else {
        this.suggestions = [];
      }
    },
    selectAddress(address) {
      this.searchQuery = address.place_name;
      this.suggestions = [];
      this.userLocation = address.center;
      this.map.flyTo({
        center: address.center,
        zoom: 14
      });
      this.addMarker(address.center, 'user');
      this.findNearbyClinics(address.center);
    },
    addMarker(coordinates, type) {
      new mapboxgl.Marker({
        color: type === 'user' ? '#FF0000' : '#0000FF'
      })
        .setLngLat(coordinates)
        .addTo(this.map);
    },
    async findNearbyClinics(center) {
      try {
        const response = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/clinic.json`, {
          params: {
            proximity: `${center[0]},${center[1]}`,
            radius: 5000,
            access_token: mapboxgl.accessToken,
            country: 'AU'
          }
        });
        this.nearbyClinics = response.data.features;
        this.nearbyClinics.forEach(clinic => {
          this.addMarker(clinic.center, 'clinic');
        });
      } catch (error) {
        console.error('Error finding nearby clinics:', error);
      }
    },
    showRoute(clinic) {
      this.selectedClinic = clinic;
      this.getRoute('driving');
    },
    async getRoute(mode) {
      const start = this.userLocation.join(',');
      const end = this.selectedClinic.center.join(',');
      try {
        const response = await axios.get(`https://api.mapbox.com/directions/v5/mapbox/${mode}/${start};${end}`, {
          params: {
            steps: true,
            geometries: 'geojson',
            access_token: mapboxgl.accessToken
          }
        });
        const data = response.data;
        this.routeSteps = data.routes[0].legs[0].steps;

        if (this.map.getSource('route')) {
          this.map.removeLayer('route');
          this.map.removeSource('route');
        }

        this.map.addLayer({
          id: 'route',
          type: 'line',
          source: {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: data.routes[0].geometry
            }
          },
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#3887be',
            'line-width': 5,
            'line-opacity': 0.75
          }
        });
      } catch (error) {
        console.error('Error getting route:', error);
      }
    }
  }
};
</script>

<style scoped>
.clinic-view {
  display: flex;
  height: 100vh;
  font-family: Arial, sans-serif;
}

.sidebar {
  width: 300px;
  padding: 20px;
  background-color: #f0f0f0;
  overflow-y: auto;
}

.map-container {
  flex-grow: 1;
}

.search-input {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.suggestions {
  list-style-type: none;
  padding: 0;
  margin: 0;
  background: white;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.suggestion-item {
  padding: 10px;
  cursor: pointer;
}

.suggestion-item:hover {
  background: #f0f0f0;
}

.clinic-item {
  padding: 10px;
  cursor: pointer;
  border-bottom: 1px solid #ccc;
}

.clinic-item:hover {
  background: #e0e0e0;
}

.route-button {
  margin-right: 10px;
  padding: 5px 10px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.route-button:hover {
  background-color: #45a049;
}

.route-step {
  margin-bottom: 10px;
}
</style>