<template>
  <div class="map-container">
    <h1>Find Nearby Clinics</h1>
    <div class="search-section">
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
      <div class="map-view" ref="map"></div>
      <div class="info-section">
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
              <button @click="displayRoute(route, index)">Show on Map</button>
            </li>
          </ul>
        </div>
        <div class="directions-list" v-if="selectedRoute">
          <h2>Directions:</h2>
          <ul>
            <li v-for="(step, index) in selectedRoute.legs[0].steps" :key="index">
              {{ step.maneuver.instruction }} ({{ (step.distance / 1000).toFixed(2) }} km)
            </li>
          </ul>
        </div>
      </div>
    </div>
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
      selectedRoute: null,
      userMarker: null,
      clinicMarker: null,
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

        // Add or update a marker for the user location
        if (this.userMarker) {
          this.userMarker.setLngLat(this.userCoordinates);
        } else {
          this.userMarker = new mapboxgl.Marker({ color: 'blue' })
            .setLngLat(this.userCoordinates)
            .setPopup(new mapboxgl.Popup().setHTML('<h3>Your Location</h3>'))
            .addTo(this.map);
        }

        // Fetch nearby clinics using Mapbox Places API
        this.fetchNearbyClinics(lat, lng);
      } else {
        alert('Address not found. Please enter a valid address.');
      }
    },
    async fetchNearbyClinics(lat, lng) {
      try {
        const response = await axios.get(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/clinic.json?proximity=${lng},${lat}&types=poi&limit=10&access_token=${mapboxgl.accessToken}`
        );
        this.clinics = response.data.features.map(feature => {
          const [clinicLng, clinicLat] = feature.center;
          const distance = this.calculateDistance(lat, lng, clinicLat, clinicLng);
          return {
            id: feature.id,
            name: feature.text,
            coordinates: feature.center,
            distance,
          };
        }).filter(clinic => clinic.distance <= 3);
      } catch (error) {
        console.error('Error fetching nearby clinics:', error);
      }
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
            `https://api.mapbox.com/directions/v5/mapbox/driving/${lng},${lat};${clinicCoordinates[0]},${clinicCoordinates[1]}?geometries=geojson&alternatives=true&steps=true&access_token=${mapboxgl.accessToken}`
          );
          this.routes = response.data.routes.map(route => ({
            distance: route.distance / 1000, // Convert meters to kilometers
            duration: route.duration / 60, // Convert seconds to minutes
            geometry: route.geometry,
            legs: route.legs,
          }));

          // Add or update a marker for the selected clinic location
          if (this.clinicMarker) {
            this.clinicMarker.setLngLat(clinicCoordinates);
          } else {
            this.clinicMarker = new mapboxgl.Marker({ color: 'red' })
              .setLngLat(clinicCoordinates)
              .setPopup(new mapboxgl.Popup().setHTML(`<h3>${clinic.name}</h3>`))
              .addTo(this.map);
          }

          // Add markers for the route start and end points
          if (this.userMarker) {
            this.userMarker.setLngLat(this.userCoordinates);
          } else {
            this.userMarker = new mapboxgl.Marker({ color: 'blue' })
              .setLngLat(this.userCoordinates)
              .setPopup(new mapboxgl.Popup().setHTML('<h3>Your Location</h3>'))
              .addTo(this.map);
          }

          // Move the map to fit both the user and clinic markers
          const bounds = new mapboxgl.LngLatBounds();
          bounds.extend(this.userCoordinates);
          bounds.extend(clinicCoordinates);
          this.map.fitBounds(bounds, { padding: 50 });
        } catch (error) {
          console.error('Error fetching routes:', error);
        }
      }
    },
    displayRoute(route, index) {
      this.selectedRoute = route;

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
.search-section {
  width: 100%;
  max-width: 600px;
  margin-bottom: 20px;
}
.main-content {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 500px;
}
.map-view {
  flex: 2;
  height: 100%;
  margin-right: 20px;
}
.info-section {
  flex: 1;
  overflow-y: auto;
}
.clinic-list ul,
.route-list ul,
.directions-list ul {
  list-style: none;
  padding: 0;
}
.clinic-list li,
.route-list li,
.directions-list li {
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