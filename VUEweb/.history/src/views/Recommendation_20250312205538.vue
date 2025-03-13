<template>
    <div class="uv-advice-container">
      <div class="banner-section" :style="{ backgroundImage: `url(${backgroundImage})` }">
        <div class="banner-text">
          <h1>Protect your skin today for a healthier tomorrow-because the sun never forgets.</h1>
        </div>
      </div>
      
      <!-- 天气信息部分 -->
      <main class="weather-info-section" v-if="weatherData">
        <div class="weather-container">
          <h2 class="weather-location">
            {{ weatherData.name }}, {{ weatherData.sys.country }}
          </h2>
          <div class="weather-display">
            <img :src="iconUrl" alt="Weather Icon" class="weather-icon" />
            <p class="weather-temp">{{ temperature }} °C</p>
          </div>
          <span class="weather-desc">{{ weatherData.weather[0].description }}</span>
        </div>
      </main>
  
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
                <div class="uv-gauge-needle" :style="{ transform: `rotate(${(uvIndex * 12) - 90}deg)` }"></div>
                <div class="uv-gauge-center"></div>
                <div class="uv-level-display">
                  <div class="uv-level">{{ uvIndex }}</div>
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
  import { ref, reactive, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import axios from 'axios';
  import recommendpageImg from '@/assets/recommendpage.png';
  
  export default {
    name: 'UVAdvice',
    setup() {
      const router = useRouter();
      const uvIndex = ref(0);
      const isLoading = ref(true);
      const error = ref(null);
      const userInfo = ref({});
      const recommendedItems = ref([]);
      const backgroundImage = recommendpageImg;
      
      // API key - 请确保这是有效的 API 密钥
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
      
      // 计算属性：温度
      const temperature = computed(() => {
        return weatherData.value ? weatherData.value.main.temp : null;
      });
      
      // 计算属性：天气图标URL
      const iconUrl = computed(() => {
        return weatherData.value
          ? `https://openweathermap.org/img/w/${weatherData.value.weather[0].icon}.png`
          : null;
      });
      
      // 获取用户当前地点的天气数据
      async function fetchWeatherData() {
        isLoading.value = true;
        error.value = null;
        
        try {
          console.log('===== WEATHER DATA FETCH STARTED =====');
          
          // 从localStorage获取用户位置信息
          const storedUserInfo = localStorage.getItem('uvUserInfo');
          console.log('Retrieved user info from localStorage:', storedUserInfo);
          
          if (!storedUserInfo) {
            error.value = 'No user information found. Please complete your profile first.';
            console.error('No user information found in localStorage');
            router.push('/');
            return;
          }
          
          userInfo.value = JSON.parse(storedUserInfo);
          const location = userInfo.value.location;
          console.log('Location retrieved:', location);
          
          // 直接使用城市名称调用 OpenWeather API
          const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)},AU&appid=${API_KEY}&units=metric`;
          console.log('调用天气 API:', weatherUrl);
          
          const response = await axios.get(weatherUrl);
          console.log('天气 API 响应:', response.data);
          
          // 保存天气数据
          weatherData.value = response.data;
          console.log('天气数据已保存:', weatherData.value);
          
          // 设置 UV 指数（默认值或估算值）
          // 这里可以保留简单版本的 UV 估算
          uvIndex.value = estimateUVFromWeather(weatherData.value);
          console.log('估算的 UV 指数:', uvIndex.value);
          
          // 更新推荐项目
          updateRecommendedItems();
          
          console.log('===== WEATHER DATA FETCH COMPLETED =====');
          
        } catch (err) {
          console.error('获取天气数据时发生错误:', err);
          error.value = 'Error fetching weather data. Please try again later.';
          
          // 使用默认值
          uvIndex.value = 5;
          console.log('使用默认 UV 指数值:', uvIndex.value);
          updateRecommendedItems();
        } finally {
          isLoading.value = false;
        }
      }
      
      // 从天气数据估算 UV 指数
      function estimateUVFromWeather(weather) {
        if (!weather) return 5;
        
        const clouds = weather.clouds ? weather.clouds.all : 0; // 云层覆盖百分比
        const weatherCondition = weather.weather && weather.weather.length > 0 ? 
                        weather.weather[0].main : '';
        
        // 获取当前小时
        const currentHour = new Date().getHours();
        
        // 判断是否是白天 (6am - 6pm)
        const isDaytime = currentHour >= 6 && currentHour <= 18;
        
        // 基于天气状况估算 UV 指数
        if (!isDaytime) return 0; // 晚上 UV 指数为 0
        
        if (weatherCondition === 'Rain' || weatherCondition === 'Drizzle' || weatherCondition === 'Snow') {
          return 2; // 下雨/雪时 UV 较低
        }
        
        if (weatherCondition === 'Thunderstorm' || weatherCondition === 'Mist' || 
            weatherCondition === 'Smoke' || weatherCondition === 'Haze' || 
            weatherCondition === 'Dust' || weatherCondition === 'Fog') {
          return 3; // 这些天气条件下 UV 较低但仍然存在
        }
        
        // 基于云层覆盖估算
        if (clouds > 80) return 3; // 高云层覆盖
        if (clouds > 50) return 5; // 中等云层覆盖
        if (clouds > 20) return 7; // 低云层覆盖
        
        // 晴天，基于时间估算
        if (currentHour >= 10 && currentHour <= 14) return 9; // 中午时间段 UV 最高
        if (currentHour >= 8 && currentHour <= 16) return 7; // 上午和下午 UV 较高
        return 5; // 早上和傍晚 UV 中等
      }
      
      // 如果无法直接从 API 获取 UV 指数，根据天气状况估算
      function getEstimatedUVIndex(weatherData) {
        if (!weatherData) return 5; // 默认中等 UV 值
        
        const clouds = weatherData.clouds ? weatherData.clouds.all : 0; // 云层覆盖百分比
        const weather = weatherData.weather && weatherData.weather.length > 0 ? 
                        weatherData.weather[0].main : '';
        
        // 获取当前位置的小时
        const timestamp = weatherData.dt * 1000; // 转换为毫秒
        const date = new Date(timestamp);
        const hour = date.getHours();
        
        // 判断是否是白天 (6am - 6pm)
        const isDaytime = hour >= 6 && hour <= 18;
        
        // 基于天气状况估算 UV 指数
        if (!isDaytime) return 0; // 晚上 UV 指数为 0
        
        if (weather === 'Rain' || weather === 'Drizzle' || weather === 'Snow') {
          return 2; // 下雨/雪时 UV 较低
        }
        
        if (weather === 'Thunderstorm' || weather === 'Mist' || 
            weather === 'Smoke' || weather === 'Haze' || 
            weather === 'Dust' || weather === 'Fog') {
          return 3; // 这些天气条件下 UV 较低但仍然存在
        }
        
        // 基于云层覆盖估算
        if (clouds > 80) return 3; // 高云层覆盖
        if (clouds > 50) return 5; // 中等云层覆盖
        if (clouds > 20) return 7; // 低云层覆盖
        
        // 晴天，基于时间估算
        if (hour >= 10 && hour <= 14) return 10; // 中午时间段 UV 最高
        if (hour >= 8 && hour <= 16) return 8; // 上午和下午 UV 较高
        return 5; // 早上和傍晚 UV 中等
      }
      
      // Navigate to more detailed page
      function goToMoreInfo() {
        router.push('/visualisation');
      }
      
      onMounted(() => {
        fetchWeatherData();
      });
      
      return {
        uvIndex,
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
        // 新增的天气数据属性
        weatherData,
        temperature,
        iconUrl
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
  
  /* 天气信息样式 */
  .weather-info-section {
    padding: 1rem 2rem;
    margin-bottom: 1rem;
  }
  
  .weather-container {
    background-color: rgba(166, 124, 82, 0.1);
    border-radius: 8px;
    padding: 1.5rem;
    text-align: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .weather-location {
    font-size: 1.5rem;
    color: #333;
    margin-bottom: 1rem;
  }
  
  .weather-display {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 0.5rem;
  }
  
  .weather-icon {
    width: 64px;
    height: 64px;
  }
  
  .weather-temp {
    font-size: 2rem;
    font-weight: bold;
    color: #a67c52;
    margin: 0;
  }
  
  .weather-desc {
    font-size: 1.2rem;
    color: #666;
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
  }
  </style>