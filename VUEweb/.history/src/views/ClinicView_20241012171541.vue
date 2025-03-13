<template>
  <div class="map-container">
    <h1>Find Nearby Clinics</h1>
    <div>
      <label for="address">Enter Address:</label>
      <input type="text" v-model="address" id="address" @input="fetchAddressSuggestions" />
      <ul v-if="addressSuggestions.length" class="suggestions">
        <li v-for="suggestion in addressSuggestions" :key="suggestion.id" @click="selectSuggestion(suggestion)">
          {{ suggestion.place_name }}
        </li>
      </ul>
      <button @click="searchLocation">Search</button>
    </div>
    <div class="main-content">
      <div class="clinic-list">
        <h2>Clinics within 3km:</h2>
        <ul>
          <li v-for="clinic in clinics" :key="clinic.id">
            {{ clinic.name }} - {{ clinic.distance.toFixed(2) }} km
            <button @click="selectClinic(clinic)">Go</button>
          </li>
        </ul>
      </div>
      <div class="route-list" v-if="selectedClinic">
        <h2>Routes to {{ selectedClinic.name }}:</h2>
        <ul>
          <li v-for="(route, index) in routes" :key="index">
            Route {{ index + 1 }}: {{ route.distance.toFixed(2) }} km, {{ route.duration.toFixed(0) }} mins
            <button @click="displayRoute(route)">Show on Map</button>
          </li>
        </ul>
      </div>
    </div>
    <div class="map-view" ref="map"></div>
  </div>
</template>

<script>
import mapboxgl from 'mapbox-gl';
import axios from 'axios';

mapboxgl.accessToken = 
'pk.eyJ1IjoiY2hsb2V5dWUiLCJhIjoiY20xejJpb3BhMDJndTJrcHpwaG9ocHE0NyJ9.jHaWplmk0Y_XWTLCtuAm4A';

export default {
  data() {
    return {
      map: null,
      address: '',
      addressSuggestions: [],
      clinics: [],
      userCoordinates: null,
      selectedClinic: null,
      routes: [],
    };
  },
  methods: {
    async fetchAddressSuggestions() {
      if (this.address.length > 2) {
        const response = await axios.get(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(this.address)}.json?access_token=${mapboxgl.accessToken}`
        );
        this.addressSuggestions = response.data.features;
      } else {
        this.addressSuggestions = [];
      }
    },
    selectSuggestion(suggestion) {
      this.address = suggestion.place_name;
      this.userCoordinates = suggestion.center;
      this.addressSuggestions = [];
    },
    async searchLocation() {
      if (!this.userCoordinates) {
        await this.fetchAddressSuggestions();
        if (this.addressSuggestions.length > 0) {
          this.selectSuggestion(this.addressSuggestions[0]);
        }
      }
      if (this.userCoordinates) {
        const [lng, lat] = this.userCoordinates;
        // Set map view to the searched location
        this.map.setCenter(this.userCoordinates);
        this.map.setZoom(14);

        // Add a marker for the user location
        new mapboxgl.Marker().setLngLat(this.userCoordinates).addTo(this.map);

        // Fetch nearby clinics (dummy data for demonstration purposes)
        this.fetchNearbyClinics(lat, lng);
      } else {
        alert('Address not found. Please enter a valid address.');
      }
    },
    fetchNearbyClinics(lat, lng) {
      // Dummy data: Replace with real API call to fetch clinics
      const dummyClinics = [
        { id: 1, name: 'Health Clinic A', coordinates: [lng + 0.01, lat + 0.01] },
        { id: 2, name: 'Wellness Center B', coordinates: [lng - 0.02, lat - 0.01] },
        { id: 3, name: 'Medical Clinic C', coordinates: [lng + 0.015, lat - 0.015] },
      ];

      this.clinics = dummyClinics
        .map(clinic => {
          const distance = this.calculateDistance(lat, lng, clinic.coordinates[1], clinic.coordinates[0]);
          return { ...clinic, distance };
        })
        .filter(clinic => clinic.distance <= 3);

      this.clinics.forEach(clinic => {
        new mapboxgl.Marker({ color: 'red' })
          .setLngLat(clinic.coordinates)
          .setPopup(new mapboxgl.Popup().setHTML(`<h3>${clinic.name}</h3>`))
          .addTo(this.map);
      });
    },
    calculateDistance(lat1, lon1, lat2, lon2) {
      const R = 6371; // Radius of the earth in km
      const dLat = this.deg2rad(lat2 - lat1);
      const dLon = this.deg2rad(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(this.deg2rad(lat1)) *
          Math.cos(this.deg2rad(lat2)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c; // Distance in km
    },
    deg2rad(deg) {
      return deg * (Math.PI / 180);
    },
    async selectClinic(clinic) {
      this.selectedClinic = clinic;
      if (this.userCoordinates) {
        const [lng, lat] = this.userCoordinates;
        const clinicCoordinates = clinic.coordinates;
        try {
          const response = await axios.get(
            `https://api.mapbox.com/directions/v5/mapbox/driving/${lng},${lat};${clinicCoordinates[0]},${clinicCoordinates[1]}?geometries=geojson&alternatives=true&access_token=${mapboxgl.accessToken}`
          );
          this.routes = response.data.routes.map(route => ({
            distance: route.distance / 1000, // Convert meters to kilometers
            duration: route.duration / 60, // Convert seconds to minutes
            geometry: route.geometry,
          }));
        } catch (error) {
          console.error('Error fetching routes:', error);
        }
      }
    },
    displayRoute(route) {
      if (this.map.getSource('route')) {
        this.map.getSource('route').setData(route.geometry);
      } else {
        this.map.addLayer({
          id: 'route',
          type: 'line',
          source: {
            type: 'geojson',
            data: route.geometry,
          },
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#3887be',
            'line-width': 5,
          },
        });
      }
    },
  },
  mounted() {
    this.map = new mapboxgl.Map({
      container: this.$refs.map,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [0, 0],
      zoom: 2,
    });
  },
};
</script>

<style scoped>
.map-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 20px;
}
.main-content {
  display: flex;
  width: 100%;
  margin-top: 20px;
}
.map-view {
  width: 100%;
  height: 300px;
  margin-top: 20px;
}
.clinic-list {
  width: 50%;
  margin-right: 20px;
}
.route-list {
  width: 50%;
}
.clinic-list ul,
.route-list ul {
  list-style: none;
  padding: 0;
}
.clinic-list li,
.route-list li {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.suggestions {
  list-style: none;
  padding: 0;
  margin-top: 5px;
  border: 1px solid #ccc;
  max-height: 150px;
  overflow-y: auto;
  width: 100%;
  background-color: #fff;
  z-index: 10;
  position: absolute;
}
.suggestions li {
  padding: 10px;
  cursor: pointer;
}
.suggestions li:hover {
  background-color: #f0f0f0;
}
</style>