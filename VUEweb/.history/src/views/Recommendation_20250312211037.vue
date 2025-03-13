<template>
    <div class="uv-advice-container">
      <div class="banner-section" :style="{ backgroundImage: `url(${backgroundImage})` }">
        <div class="banner-text">
          <h1>Protect your skin today for a healthier tomorrow-because the sun never forgets.</h1>
        </div>
      </div>
      
      <!-- 天气信息展示 -->
      <div class="weather-display-section" v-if="city">
        <h2>{{ city }}, {{ weather.country }}</h2>
        <div class="weather-display">
          <img :src="weather.iconUrl" alt="Weather Icon" class="weather-icon" />
          <p class="weather-temp">{{ weather.temp }}°C</p>
        </div>
        <span class="weather-desc">{{ weather.description }}</span>
      </div>
  
      <div class="advice-section">
        <div class="advice-column">
          <h2 class="section-title">UV NOW</h2>
          <div class="uv-info">
            <!-- 简化的 Bar 形式 UV 显示 -->
            <div class="uv-bar-container">
              <div class="uv-value">{{ currentUvIndex }}</div>
              <div class="uv-level-name">{{ getUVLevelDescription() }}</div>
              <div class="uv-bar">
                <div v-for="i in 5" :key="i" :class="['uv-segment', `uv-level-${i}`, {'active': isLevelActive(i)}]">
                  <span class="uv-segment-text">{{ getUvRangeText(i) }}</span>
                </div>
              </div>
              <div class="uv-labels">
                <span>Low</span>
                <span>Medium</span>
                <span>High</span>
                <span>Very High</span>
                <span>Extreme</span>
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
      const currentUvIndex = ref(5); // 默认UV值为5
      const isLoading = ref(true);
      const error = ref(null);
      const userInfo = ref({});
      const recommendedItems = ref([]);
      const backgroundImage = recommendpageImg;
      
      // 城市和天气信息
      const city = ref("");
      const weather = reactive({
        temp: 0,
        description: "",
        iconUrl: "",
        country: "AU"
      });
      
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
      
      // 判断特定UV等级是否激活
      function isLevelActive(level) {
        const uv = currentUvIndex.value;
        
        switch(level) {
          case 1: return uv >= 0 && uv <= 2;  // Low
          case 2: return uv >= 3 && uv <= 5;  // Medium
          case 3: return uv >= 6 && uv <= 7;  // High
          case 4: return uv >= 8 && uv <= 10; // Very High
          case 5: return uv >= 11;            // Extreme
          default: return false;
        }
      }
      
      // 获取UV等级范围文本
      function getUvRangeText(level) {
        switch(level) {
          case 1: return "1-2";
          case 2: return "3-5";
          case 3: return "6-7";
          case 4: return "8-10";
          case 5: return "11+";
          default: return "";
        }
      }
      
      // 根据UV指数获取等级描述 - 基于提供的参考图片
      function getUVLevelDescription() {
        const index = currentUvIndex.value;
        
        if (index <= 2) return 'LOW';         // 1-2
        if (index <= 5) return 'MEDIUM';      // 3-5 
        if (index <= 7) return 'HIGH';        // 6-7
        if (index <= 10) return 'VERY HIGH';  // 8-10
        return 'EXTREMELY HIGH';              // 11+
      }
      
      // 根据UV指数获取SPF推荐
      function getSPFLevel() {
        const index = currentUvIndex.value;
        
        if (index <= 2) return 'No protection needed';
        if (index <= 4) return 'SPF 15++';
        if (index <= 6) return 'SPF 30++';
        return 'SPF 50++';
      }
      
      // 获取防晒霜重新涂抹时间建议
      function getReapplicationTime() {
        const index = currentUvIndex.value;
        
        if (index <= 2) return '';
        if (index <= 4) return 'EVERY SIX HOURS';
        if (index <= 6) return 'EVERY FOUR HOURS';
        return 'EVERY TWO HOURS';
      }
      
      // 更新推荐装备 - 严格按照提供的标准
      function updateRecommendedItems() {
        const index = currentUvIndex.value;
        const items = [];
        
        // 1级 (0-2): 最弱，不需要防护措施
        if (index <= 2) {
          // 不添加任何装备
        }
        // 2级 (3-4): 弱，需要SPF 15++，6小时补涂一次
        else if (index <= 4) {
          // 不添加任何装备，只需要防晒霜
        }
        // 3级 (5-6): 中等，需要太阳镜
        else if (index <= 6) {
          items.push(clothingItems.sunglass);
        }
        // 4级 (7-9): 强，需要遮阳伞、太阳镜
        else if (index <= 9) {
          items.push(clothingItems.umbrella);
          items.push(clothingItems.sunglass);
        }
        // 5级 (≥10): 很强，需要全面防护
        else {
          items.push(clothingItems.umbrella);
          items.push(clothingItems.sunproof);
          items.push(clothingItems.mask);
          items.push(clothingItems.hat);
          items.push(clothingItems.sunglass);
        }
        
        recommendedItems.value = items;
        
        // 测试输出
        console.log('当前UV指数:', index);
        console.log('推荐装备:', items.map(item => item.name));
      }
      
      // 导航到详细信息页面
      function goToMoreInfo() {
        router.push('/visualisation');
      }
      
      // 获取用户天气数据
      async function fetchWeatherData() {
        try {
          console.log('开始获取天气数据');
          
          // 从localStorage获取用户信息
          const storedUserInfo = localStorage.getItem('uvUserInfo');
          console.log('从localStorage获取用户信息:', storedUserInfo);
          
          if (!storedUserInfo) {
            console.error('未找到用户信息，返回首页');
            router.push('/');
            return;
          }
          
          // 解析用户信息
          userInfo.value = JSON.parse(storedUserInfo);
          const location = userInfo.value.location;
          city.value = location;
          console.log('用户位置:', location);
          
          // 调用天气API
          console.log(`获取${location}的天气数据`);
          const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)},AU&appid=${API_KEY}&units=metric`;
          
          const response = await axios.get(weatherUrl);
          console.log('天气API响应:', response.data);
          
          if (response.data) {
            // 更新天气信息
            weather.description = response.data.weather[0].description;
            weather.temp = Math.round(response.data.main.temp);
            weather.iconUrl = `https://openweathermap.org/img/w/${response.data.weather[0].icon}.png`;
            weather.country = response.data.sys.country;
            
            console.log('天气数据已更新:', weather);
            
            // 计算UV指数
            calculateUVIndex(response.data);
          }
        } catch (err) {
          console.error('获取天气数据失败:', err);
          
          // 设置默认值
          weather.description = "Weather data unavailable";
          weather.temp = 25;
          weather.country = "AU";
          
          // 强制设置UV指数为5进行测试
          currentUvIndex.value = 5;
          console.log('测试用UV指数设为:', currentUvIndex.value);
        } finally {
          // 无论成功与否，都更新推荐项目
          updateRecommendedItems();
          isLoading.value = false;
          
          // 保存UV数据到localStorage
          localStorage.setItem('uvData', JSON.stringify({
            index: currentUvIndex.value,
            location: city.value || "Unknown",
            timestamp: new Date().getTime()
          }));
          
          console.log('UV数据已保存到localStorage');
        }
      }
      
      // 根据天气数据计算UV指数
      function calculateUVIndex(weatherData) {
        // 获取当前小时
        const currentHour = new Date().getHours();
        console.log('当前时间:', currentHour);
        
        // 如果是夜间，UV指数为0
        if (currentHour < 6 || currentHour > 19) {
          currentUvIndex.value = 0;
          console.log('夜间UV指数设为0');
          return;
        }
        
        // 从天气数据中获取参数
        const clouds = weatherData.clouds ? weatherData.clouds.all : 0; // 云层覆盖百分比
        const weatherMain = weatherData.weather[0].main; // 主要天气状况
        const temp = weatherData.main.temp; // 温度
        
        console.log(`天气状况: ${weatherMain}, 云层覆盖: ${clouds}%, 温度: ${temp}°C`);
        
        // 基于天气状况和时间计算UV指数
        let baseUV = 0;
        
        // 基于时间的基础UV值
        if (currentHour >= 11 && currentHour <= 14) {
          baseUV = 12; // 正午时段最高UV
        } else if (currentHour >= 9 && currentHour <= 16) {
          baseUV = 10; // 上午到下午高UV
        } else {
          baseUV = 7; // 早晨和傍晚中等UV
        }
        
        console.log('基于时间的基础UV值:', baseUV);
        
        // 基于天气状况调整UV
        if (weatherMain === 'Clear') {
          // 晴天不变
        } else if (weatherMain === 'Clouds') {
          // 根据云层程度降低UV
          if (clouds > 80) {
            baseUV = Math.max(baseUV * 0.3, 2); // 大量云层
          } else if (clouds > 50) {
            baseUV = baseUV * 0.6; // 中等云层
          } else {
            baseUV = baseUV * 0.8; // 少量云层
          }
        } else if (['Rain', 'Drizzle', 'Snow'].includes(weatherMain)) {
          baseUV = Math.min(baseUV * 0.2, 3); // 雨雪天气大幅降低UV
        } else if (['Thunderstorm', 'Mist', 'Smoke', 'Haze', 'Dust', 'Fog'].includes(weatherMain)) {
          baseUV = Math.min(baseUV * 0.3, 4); // 这些天气条件也显著降低UV
        }
        
        // 四舍五入并设置值
        currentUvIndex.value = Math.round(baseUV);
        console.log('计算得出的UV指数:', currentUvIndex.value);
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
        isLevelActive,
        getUvRangeText,
        city,
        weather
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
  
  /* 天气信息部分样式 */
  .weather-display-section {
    margin: 0 2rem 2rem;
    padding: 1.5rem;
    background-color: rgba(166, 124, 82, 0.1);
    border-radius: 8px;
    text-align: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .weather-display-section h2 {
    color: #333;
    margin-top: 0;
    margin-bottom: 1rem;
    font-size: 1.5rem;
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
  
  /* 新的 Bar 形式 UV 显示 */
  .uv-bar-container {
    width: 100%;
    max-width: 300px;
    margin: 0 auto;
  }
  
  .uv-value {
    font-size: 3.5rem;
    font-weight: bold;
    color: #333;
    margin-bottom: 0.5rem;
    line-height: 1;
  }
  
  .uv-level-name {
    font-size: 1.5rem;
    color: #666;
    margin-bottom: 1.5rem;
  }
  
  .uv-bar {
    height: 30px;
    width: 100%;
    display: flex;
    border-radius: 15px;
    overflow: hidden;
    margin-bottom: 8px;
  }
  
  .uv-segment {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: transparent;
    transition: color 0.3s;
    position: relative;
  }
  
  .uv-segment-text {
    font-size: 0.75rem;
    position: absolute;
    top: -20px;
    font-weight: bold;
    color: #666;
  }
  
  .uv-segment.active {
    color: white;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.3) inset;
  }
  
  .uv-level-1 {
    background-color: #8BC34A; /* Low */
  }
  
  .uv-level-2 {
    background-color: #FDD835; /* Medium */
  }
  
  .uv-level-3 {
    background-color: #FB8C00; /* High */
  }
  
  .uv-level-4 {
    background-color: #D32F2F; /* Very High */
  }
  
  .uv-level-5 {
    background-color: #7B1FA2; /* Extreme */
  }
  
  .uv-labels {
    width: 100%;
    display: flex;
    justify-content: space-between;
    font-size: 0.7rem;
    color: #666;
  }
  
  .uv-labels span {
    flex: 1;
    text-align: center;
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