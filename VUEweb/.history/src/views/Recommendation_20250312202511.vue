<template>
    <div class="uv-advice-container">
      <div class="banner-section" :style="{ backgroundImage: 'url(@/assets/recommendpage.png)' }">
        <div class="banner-text">
          <h1>Protect your skin today for a healthier tomorrow-because the sun never forgets.</h1>
        </div>
      </div>
  
      <div class="advice-section">
        <div class="advice-column">
          <h2 class="section-title">UV NOW</h2>
          <div class="uv-info">
            <div class="uv-meter">
              <img src="@/assets/uvindex.png" alt="UV Index Meter" class="uv-meter-img" />
            </div>
            <div class="uv-value">
              <h3>UV INDEX</h3>
              <div class="uv-level">{{ uvIndex }}</div>
              <div class="uv-description">{{ getUVLevelDescription() }}</div>
            </div>
          </div>
        </div>
  
        <div class="advice-column">
          <h2 class="section-title">SUN CREAM</h2>
          <div class="sun-cream-advice">
            <div class="sun-cream-image">
              <img src="@/assets/suncream.png" alt="Sun Cream" />
            </div>
            <div class="sun-cream-text">
              <h3>{{ getSPFLevel() }}</h3>
              <p>{{ getReapplicationTime() }}</p>
            </div>
          </div>
        </div>
  
        <div class="advice-column">
          <h2 class="section-title">CLOTHINGS</h2>
          <div class="clothing-items">
            <div v-for="item in recommendedItems" :key="item.name" class="clothing-item">
              <img :src="require(`@/assets/${item.image}`)" :alt="item.name" />
            </div>
          </div>
        </div>
      </div>
  
      <div class="more-section">
        <button class="more-button" @click="goToMoreInfo">WANNA SEE MORE?</button>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, reactive, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import axios from 'axios';
  
  export default {
    name: 'UVAdvice',
    setup() {
      const router = useRouter();
      const uvIndex = ref(0);
      const isLoading = ref(true);
      const error = ref(null);
      const userInfo = ref({});
      const recommendedItems = ref([]);
      
      // API key
      const API_KEY = 'aad7b3c3f2d7c2d41b66d5ab5edd20f8';
      
      // Clothing items mapping
      const clothingItems = {
        'sunglass': { name: 'Sunglasses', image: 'sunglass.png' },
        'mask': { name: 'Face Mask', image: 'mask.png' },
        'umbrella': { name: 'Umbrella', image: 'umbrella.png' },
        'sunproof': { name: 'Sun Protective Clothing', image: 'sunproof.png' },
        'hat': { name: 'Hat', image: 'hat.png' }
      };
      
      // Get UV level description based on index
      function getUVLevelDescription() {
        const index = uvIndex.value;
        
        if (index <= 2) return 'LOW';
        if (index <= 4) return 'MODERATE';
        if (index <= 6) return 'HIGH';
        if (index <= 9) return 'VERY HIGH';
        return 'EXTREMELY HIGH';
      }
      
      // Get SPF recommendation based on UV index
      function getSPFLevel() {
        const index = uvIndex.value;
        
        if (index <= 2) return 'No protection needed';
        if (index <= 4) return 'SPF 15++';
        if (index <= 6) return 'SPF 30++';
        return 'SPF 50++';
      }
      
      // Get reapplication time recommendation
      function getReapplicationTime() {
        const index = uvIndex.value;
        
        if (index <= 2) return '';
        if (index <= 4) return 'EVERY SIX HOURS';
        if (index <= 6) return 'EVERY FOUR HOURS';
        return 'EVERY TWO HOURS';
      }
      
      // Update recommended items based on UV index
      function updateRecommendedItems() {
        const index = uvIndex.value;
        const items = [];
        
        if (index >= 5) {
          items.push(clothingItems.sunglass);
        }
        
        if (index >= 7) {
          items.push(clothingItems.umbrella);
        }
        
        if (index >= 10) {
          items.push(clothingItems.sunproof);
          items.push(clothingItems.mask);
          items.push(clothingItems.hat);
        }
        
        recommendedItems.value = items;
      }
      
      // Fetch UV data from OpenWeather API
      async function fetchUVData() {
        isLoading.value = true;
        error.value = null;
        
        try {
          // Get user location from localStorage
          const storedUserInfo = localStorage.getItem('uvUserInfo');
          
          if (!storedUserInfo) {
            error.value = 'No user information found. Please complete your profile first.';
            router.push('/');
            return;
          }
          
          userInfo.value = JSON.parse(storedUserInfo);
          const location = userInfo.value.location;
          
          // First, get coordinates for the location
          const geoResponse = await axios.get(`https://api.openweathermap.org/geo/1.0/direct?q=${location},AU&limit=1&appid=${API_KEY}`);
          
          if (geoResponse.data.length === 0) {
            error.value = 'Location not found';
            return;
          }
          
          const { lat, lon } = geoResponse.data[0];
          
          // Then, get UV index using coordinates
          const weatherResponse = await axios.get(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,daily,alerts&appid=${API_KEY}&units=metric`);
          
          // OpenWeather API returns UV index in the 'uvi' field
          uvIndex.value = Math.round(weatherResponse.data.current.uvi);
          
          // Update recommended items based on UV index
          updateRecommendedItems();
          
          // Store UV data for other pages
          localStorage.setItem('uvData', JSON.stringify({
            index: uvIndex.value,
            location: location,
            timestamp: new Date().getTime()
          }));
          
        } catch (err) {
          console.error('Error fetching UV data:', err);
          error.value = 'Error fetching UV data. Please try again later.';
          // Fallback to a default UV index for testing
          uvIndex.value = 7;
          updateRecommendedItems();
        } finally {
          isLoading.value = false;
        }
      }
      
      // Navigate to more detailed page
      function goToMoreInfo() {
        router.push('/uv-details');
      }
      
      onMounted(() => {
        fetchUVData();
      });
      
      return {
        uvIndex,
        isLoading,
        error,
        userInfo,
        recommendedItems,
        getUVLevelDescription,
        getSPFLevel,
        getReapplicationTime,
        goToMoreInfo
      };
    }
  }
  </script>
  
  <style scoped>
  .uv-advice-container {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background-color: #ffffff;
    font-family: Arial, sans-serif;
  }
  
  .banner-section {
    height: 400px;
    background-size: cover;
    background-position: center;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }
  
  .banner-text {
    background-color: rgba(255, 255, 255, 0.8);
    padding: 2rem;
    text-align: center;
    max-width: 70%;
  }
  
  .banner-text h1 {
    font-size: 2rem;
    color: #333;
    margin: 0;
    line-height: 1.4;
  }
  
  .advice-section {
    display: flex;
    justify-content: space-between;
    padding: 3rem 2rem;
  }
  
  .advice-column {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 0 1rem;
  }
  
  .section-title {
    color: #a67c52;
    font-size: 1.5rem;
    margin-bottom: 2rem;
  }
  
  .uv-info {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .uv-meter {
    margin-bottom: 1rem;
  }
  
  .uv-meter-img {
    max-width: 100%;
    height: auto;
  }
  
  .uv-level {
    font-size: 3rem;
    font-weight: bold;
    color: #333;
  }
  
  .uv-description {
    font-size: 1.2rem;
    color: #666;
    margin-top: 0.5rem;
  }
  
  .sun-cream-advice {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .sun-cream-image img {
    max-width: 100px;
    height: auto;
    margin-bottom: 1rem;
  }
  
  .sun-cream-text h3 {
    font-size: 1.2rem;
    color: #a67c52;
    margin-bottom: 0.5rem;
  }
  
  .clothing-items {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 1rem;
  }
  
  .clothing-item img {
    width: 70px;
    height: 70px;
    object-fit: contain;
  }
  
  .more-section {
    display: flex;
    justify-content: flex-end;
    padding: 2rem;
  }
  
  .more-button {
    background-color: #a67c52;
    color: white;
    padding: 1rem 2rem;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .more-button:hover {
    background-color: #8b6b43;
  }
  
  @media (max-width: 768px) {
    .advice-section {
      flex-direction: column;
    }
    
    .advice-column {
      margin-bottom: 2rem;
    }
    
    .banner-text {
      max-width: 90%;
    }
  }
  </style>