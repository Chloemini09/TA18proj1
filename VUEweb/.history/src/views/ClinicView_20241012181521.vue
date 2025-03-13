<template>
  <div class="clinic-view">
    <div class="sidebar">
      <div class="search-container">
        <input
          v-model="searchQuery"
          @input="searchAddress"
          placeholder="Enter Melbourne address"
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
      <div v-if="nearbyClinics.length" class="clinic-list">
        <h3>Nearby Clinics</h3>
        <ul>
          <li
            v-for="clinic in paginatedClinics"
            :key="clinic.id"
            @click="showRoute(clinic)"
            class="clinic-item"
          >
            {{ clinic.text }}
          </li>
        </ul>
        <div class="pagination">
          <button @click="prevPage" :disabled="currentPage === 1">&lt;</button>
          <span>{{ currentPage }} / {{ totalPages }}</span>
          <button @click="nextPage" :disabled="currentPage === totalPages">&gt;</button>
        </div>
      </div>
      <div v-if="selectedClinic" class="route-info">
        <h3>Route Information</h3>
        <div class="route-options">
          <button @click="getRoute('driving')" class="route-button">Driving</button>
          <button @click="getRoute('walking')" class="route-button">Walking</button>
          <button @click="getRoute('cycling')" class="route-button">Cycling</button>
        </div>
        <div v-if="routeInfo" class="route-summary">
          <p><strong>{{ routeInfo.mode }}</strong>: {{ routeInfo.distance }} km, {{ routeInfo.duration }} min</p>
        </div>
        <div v-if="routeSteps.length" class="route-steps">
          <h4>Directions:</h4>
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
      routeInfo: null,
      currentPage: 1,
      itemsPerPage: 5,
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.nearbyClinics.length / this.itemsPerPage);
    },
    paginatedClinics() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.nearbyClinics.slice(start, end);
    }
  },
  mounted() {
    this.initializeMap();
  },
  methods: {
    initializeMap() {
      this.map = new mapboxgl.Map({
        container: this.$refs.mapContainer,
        style: 'mapbox://styles/mapbox/light-v10',
        center: [144.9631, -37.8136],
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
            access_token: mapboxgl.accessToken,
            country: 'AU'
          }
        });
        this.nearbyClinics = response.data.features;
        this.nearbyClinics.forEach(clinic => {
          this.addMarker(clinic.center, 'clinic');
        });
        this.currentPage = 1;
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
        this.routeInfo = {
          mode: mode.charAt(0).toUpperCase() + mode.slice(1),
          distance: (data.routes[0].distance / 1000).toFixed(2),
          duration: Math.round(data.routes[0].duration / 60)
        };

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
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    }
  }
};
</script>

<style scoped>
.clinic-view {
  display: flex;
  height: 100vh;
  font-family: 'Arial', sans-serif;
}

.sidebar {
  width: 350px;
  padding: 20px;
  background-color: #f8f9fa;
  overflow-y: auto;
  box-shadow: 2px 0 5px rgba(0,0,0,0.1);
}

.map-container {
  flex-grow: 1;
}

.search-input {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
}

.suggestions {
  list-style-type: none;
  padding: 0;
  margin: 0;
  background: white;
  border: 1px solid #ced4da;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.suggestion-item {
  padding: 10px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.suggestion-item:hover {
  background-color: #e9ecef;
}

.clinic-item {
  padding: 10px;
  cursor: pointer;
  border-bottom: 1px solid #dee2e6;
  transition: background-color 0.2s;
}

.clinic-item:hover {
  background-color: #e9ecef;
}

.route-button {
  margin-right: 10px;
  padding: 8px 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.route-button:hover {
  background-color: #0056b3;
}

.route-step {
  margin-bottom: 10px;
  font-size: 14px;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}

.pagination button {
  padding: 5px 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.pagination button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

h3 {
  color: #343a40;
  margin-bottom: 15px;
}

.route-summary {
  background-color: #e9ecef;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 15px;
}

.route-summary p {
  margin: 0;
  font-size: 14px;
}
</style>