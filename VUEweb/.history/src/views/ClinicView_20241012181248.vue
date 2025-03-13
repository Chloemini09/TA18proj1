<template>
  <!-- Template remains mostly the same -->
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
      nearbyFacilities: [],
      selectedFacility: null,
      routeSteps: [],
      userLocation: null,
      routeInfo: null,
      currentPage: 1,
      itemsPerPage: 5,
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.nearbyFacilities.length / this.itemsPerPage);
    },
    paginatedFacilities() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.nearbyFacilities.slice(start, end);
    }
  },
  mounted() {
    this.initializeMap();
  },
  methods: {
    initializeMap() {
      this.map = new mapboxgl.Map({
        container: this.$refs.mapContainer,
        style: 'mapbox://styles/mapbox/streets-v11', // Colorful street style
        center: [144.9631, -37.8136],
        zoom: 12
      });

      this.map.addControl(new mapboxgl.NavigationControl());
    },
    async searchAddress() {
      // This method remains the same
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
      this.findNearbyFacilities(address.center);
    },
    addMarker(coordinates, type) {
      if (type === 'user') {
        new mapboxgl.Marker({
          color: '#FF0000'
        })
          .setLngLat(coordinates)
          .addTo(this.map);
      }
    },
    async findNearbyFacilities(center) {
      try {
        const response = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/clinic%2Cgp%2Chospital.json`, {
          params: {
            proximity: `${center[0]},${center[1]}`,
            access_token: mapboxgl.accessToken,
            country: 'AU',
            limit: 50 // Increase the limit to get more results
          }
        });
        this.nearbyFacilities = response.data.features;
        this.currentPage = 1;
      } catch (error) {
        console.error('Error finding nearby medical facilities:', error);
      }
    },
    showRoute(facility) {
      this.selectedFacility = facility;
      this.getRoute('driving');
    },
    async getRoute(mode) {
      // This method remains the same
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