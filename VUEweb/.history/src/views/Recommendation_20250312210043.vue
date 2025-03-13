<template>
    <div class="uv-advice-container">
      <div class="banner-section" :style="{ backgroundImage: `url(${backgroundImage})` }">
        <div class="banner-text">
          <h1>Protect your skin today for a healthier tomorrow-because the sun never forgets.</h1>
        </div>
      </div>
      
      <!-- 简化的天气显示部分 -->
      <div class="weather-display-simple" v-if="city">
        <h2>Current Weather in {{ city }}</h2>
        <div class="weather-details">
          <p>{{ weatherDescription }}</p>
          <p>{{ currentTemp }}°C</p>
        </div>
      </div>
  
      <div class="advice-section">
        <div class="advice-column">
          <h2 class="section-title">UV NOW</h2>
          <div class="uv-info">
            <div class="uv-meter">
              <div class="uv-gauge">
                <div class="uv-gauge-scale">
                  <div v-for="i in 15" :key="i" 
                       :class="['uv-gauge-marker', getMarkerClass(i)]"
                       :style="{ transform: `rotate(${(i-1) * 12 - 90}deg)` }">
                    <div class="uv-gauge-tick"></div>
                    <div class="uv-gauge-label">{{ i-1 }}</div>
                  </div>
                </div>
                <div class="uv-gauge-needle" :style="{ transform: `rotate(${(currentUvIndex * 12) - 90}deg)` }"></div>
                <div class="uv-gauge-center"></div>
                <div class="uv-level-display">
                  <div class="uv-level">{{ currentUvIndex }}</div>
                  <div class="uv-description">{{ getUVLevelDescription() }}</div>
                </div>
              </div>
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
  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import axios from 'axios';
  import recommendpageImg from '@/assets/recommendpage.png';
  
  export default {
    name: 'UVAdvice',
    setup() {
      const router = useRouter();
      const currentUvIndex = ref(5); // 默认UV值为5
      const isLoading = ref(true);
      const error = ref(null);
      const userInfo = ref({});
      const recommendedItems = ref([]);
      const backgroundImage = recommendpageImg;
      
      // 新增变量
      const city = ref("");
      const weatherDescription = ref("");
      const currentTemp = ref(0);
      
      // API key
      const API_KEY = '407151980e40b39d81a056ff2d59ec23';
      
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
        const index = currentUvIndex.value;
        
        if (index <= 2) return 'LOW';
        if (index <= 4) return 'MODERATE';
        if (index <= 6) return 'HIGH';
        if (index <= 9) return 'VERY HIGH';
        return 'EXTREMELY HIGH';
      }
      
      // Get class for UV gauge marker
      function getMarkerClass(i) {
        const value = i - 1; // Adjust to 0-14 scale
        
        if (value <= 2) return 'uv-low';
        if (value <= 4) return 'uv-moderate';
        if (value <= 6) return 'uv-high';
        if (value <= 9) return 'uv-very-high';
        return 'uv-extreme';
      }
      
      // Get SPF recommendation based on UV index
      function getSPFLevel() {
        const index = currentUvIndex.value;
        
        if (index <= 2) return 'No protection needed';
        if (index <= 4) return 'SPF 15++';
        if (index <= 6) return 'SPF 30++';
        return 'SPF 50++';
      }
      
      // Get reapplication time recommendation
      function getReapplicationTime() {
        const index = currentUvIndex.value;
        
        if (index <= 2) return '';
        if (index <= 4) return 'EVERY SIX HOURS';
        if (index <= 6) return 'EVERY FOUR HOURS';
        return 'EVERY TWO HOURS';
      }
      
      // Update recommended items based on UV index
      function updateRecommendedItems() {
        const index = currentUvIndex.value;
        const items = [];
        
        // 即使 UV 指数低也提供一些基础推荐
        items.push(clothingItems.sunglass);
        
        if (index >= 3) {
          items.push(clothingItems.hat);
        }
        
        if (index >= 5) {
          items.push(clothingItems.umbrella);
        }
        
        if (index >= 8) {
          items.push(clothingItems.sunproof);
          items.push(clothingItems.mask);
        }
        
        recommendedItems.value = items;
      }
      
      // Navigate to more detailed page
      function goToMoreInfo() {
        router.push('/visualisation');
      }
      
      // 简化的获取天气数据函数
      async function fetchWeatherData() {
        try {
          // 从localStorage获取用户位置信息
          const storedUserInfo = localStorage.getItem('uvUserInfo');
          console.log('Retrieved user info:', storedUserInfo);
          
          if (!storedUserInfo) {
            router.push('/');
            return;
          }
          
          userInfo.value = JSON.parse(storedUserInfo);
          const location = userInfo.value.location;
          city.value = location;
          
          // 调用天气API
          console.log(`Fetching weather for ${location}`);
          const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)},AU&appid=${API_KEY}&units=metric`;
          
          const response = await axios.get(weatherUrl);
          console.log('Weather data:', response.data);
          
          if (response.data) {
            weatherDescription.value = response.data.weather[0].description;
            currentTemp.value = Math.round(response.data.main.temp);
            
            // 基于天气状况估算UV指数
            const currentHour = new Date().getHours();
            const clouds = response.data.clouds ? response.data.clouds.all : 0;
            const weatherMain = response.data.weather[0].main;
            
            // 基于时间和天气设置UV值
            if (currentHour < 7 || currentHour > 18) {
              currentUvIndex.value = 0; // 夜间
            } else if (weatherMain === 'Rain' || weatherMain === 'Snow') {
              currentUvIndex.value = 2; // 下雨雪时
            } else if (clouds > 80) {
              currentUvIndex.value = 3; // 大量云层
            } else if (clouds > 40) {
              currentUvIndex.value = 5; // 中等云层
            } else if (currentHour >= 11 && currentHour <= 15) {
              currentUvIndex.value = 8; // 晴天中午
            } else {
              currentUvIndex.value = 6; // 默认白天
            }
            
            // 保存数据供其他页面使用
            localStorage.setItem('uvData', JSON.stringify({
              index: currentUvIndex.value,
              location: location,
              timestamp: new Date().getTime()
            }));
          }
        } catch (err) {
          console.error('Error fetching weather:', err);
          // 使用默认值
          currentUvIndex.value = 5;
          weatherDescription.value = "Weather data unavailable";
          currentTemp.value = 25;
          
          // 存储默认数据
          localStorage.setItem('uvData', JSON.stringify({
            index: currentUvIndex.value,
            location: city.value || "Unknown location",
            timestamp: new Date().getTime()
          }));
        } finally {
          // 无论成功与否，都更新推荐项目
          updateRecommendedItems();
          isLoading.value = false;
        }
      }
      
      onMounted(() => {
        fetchWeatherData();
      });
      
      return {
        currentUvIndex,
        isLoading,
        error,
        userInfo,
        recommendedItems,
        backgroundImage,
        getUVLevelDescription,
        getSPFLevel,
        getReapplicationTime,
        goToMoreInfo,
        getMarkerClass,
        // 新增返回属性
        city,
        weatherDescription,
        currentTemp
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
    background-repeat: no-repeat;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    margin-bottom: 2rem;
  }
  
  /* 简化的天气显示样式 */
  .weather-display-simple {
    background-color: rgba(166, 124, 82, 0.1);
    margin: 0 2rem 2rem;
    padding: 1.5rem;
    border-radius: 8px;
    text-align: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .weather-display-simple h2 {
    margin-top: 0;
    color: #a67c52;
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }
  
  .weather-details {
    display: flex;
    justify-content: center;
    gap: 2rem;
  }
  
  .weather-details p {
    margin: 0;
    font-size: 1.2rem;
    color: #333;
    text-transform: capitalize;
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
    padding: 0 2rem 3rem;
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
    width: 100%;
    display: flex;
    justify-content: center;
    margin-bottom: 1rem;
  }
  
  .uv-gauge {
    position: relative;
    width: 220px;
    height: 120px;
    overflow: visible;
    margin-bottom: 40px;
  }
  
  .uv-gauge-scale {
    position: absolute;
    width: 220px;
    height: 220px;
    top: 0;
    left: 0;
  }
  
  .uv-gauge-marker {
    position: absolute;
    width: 200px;
    height: 2px;
    left: 10px;
    top: 110px;
    transform-origin: left center;
  }
  
  .uv-gauge-tick {
    position: absolute;
    right: 0;
    top: 0;
    width: 12px;
    height: 2px;
  }
  
  .uv-gauge-label {
    position: absolute;
    right: -10px;
    top: -8px;
    font-size: 10px;
    color: #666;
  }
  
  .uv-gauge-needle {
    position: absolute;
    width: 100px;
    height: 4px;
    top: 108px;
    left: 110px;
    background-color: #333;
    transform-origin: left center;
    transition: transform 1s ease-out;
    z-index: 10;
    border-radius: 4px;
  }
  
  .uv-gauge-center {
    position: absolute;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background-color: #333;
    top: 100px;
    left: 100px;
    z-index: 11;
  }
  
  .uv-level-display {
    position: absolute;
    width: 100%;
    text-align: center;
    top: 130px;
    left: 0;
  }
  
  .uv-level {
    font-size: 2.5rem;
    font-weight: bold;
    color: #333;
  }
  
  .uv-description {
    font-size: 1.2rem;
    color: #666;
  }
  
  /* UV Index color coding */
  .uv-low .uv-gauge-tick {
    background-color: #4CAF50; /* Green */
  }
  
  .uv-moderate .uv-gauge-tick {
    background-color: #FFEB3B; /* Yellow */
  }
  
  .uv-high .uv-gauge-tick {
    background-color: #FF9800; /* Orange */
  }
  
  .uv-very-high .uv-gauge-tick {
    background-color: #F44336; /* Red */
  }
  
  .uv-extreme .uv-gauge-tick {
    background-color: #9C27B0; /* Purple */
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
    
    .weather-details {
      flex-direction: column;
      gap: 0.5rem;
    }
  }
  </style>