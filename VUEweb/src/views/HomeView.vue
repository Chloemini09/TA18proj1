<template>
  <div class="container">
    <div class="banner-container">
      <div class="banner-image">
        <img src="@/assets/homepage.png" alt="Sunscreen recommendation banner" class="full-width-banner" />
        <div class="banner-text-overlay">
          <h1>SHIELD YOUR SKIN, OWN THE SUN ☀️</h1>
          <p>BLOCK THE UV RAYS, SAVE YOUR DAYS !!</p>
          <p>Stay Protected with our Personalised UV rays Protection System</p>
        </div>
      </div>
    </div>

    <!-- 优化后的位置查询区域 -->
    <div class="location-area">
      <h3 class="section-title">Please Enter your Location to check UV Index for Today:</h3>
      <div class="search-container">
        <div class="mapbox-search">
          <div class="search-input-group">
            <input 
              type="text" 
              v-model="address" 
              @input="fetchSuggestions" 
              @keydown.enter="selectSuggestion(0)" 
              placeholder="Where are you?" 
              class="input-box"
            />
            <button @click="getUV" class="search-button" :disabled="loading">
              <i class="search-icon">🔍</i>
              <span>{{ loading ? "..." : "Get UV" }}</span>
            </button>
          </div>
          <div v-if="suggestions.length > 0" class="suggestions-dropdown">
            <div 
              v-for="(suggestion, index) in suggestions" 
              :key="index" 
              class="suggestion-item"
              @click="selectSuggestion(index)"
            >
              {{ suggestion.display_name }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- UV 结果展示 - 简化版本 -->
    <div class="result-area">
      <!-- 简化的结果显示 -->
      <div v-if="result" class="simplified-result">
        <p class="location-name">{{ result.address }}</p>
        <p class="uv-result">UV Index: <span class="uv-value">{{ result.uv_index }}</span></p>
      </div>
      
      <!-- 始终显示UV仪表盘 -->
      <div class="uv-meter-container">
        <img src="@/assets/Indexlevel.png" alt="UV Index Meter" class="uv-meter" />
        <!-- 指针仅在有数据时显示 -->
        <div v-if="result" class="uv-pointer" :style="{ transform: `rotate(${calculateRotation(result.uv_index)}deg)` }"></div>
      </div>
    </div>

    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

    <!-- 推荐按钮 -->
    <div class="recommendation-button-container">
      <button class="recommendation-button" @click="goToRecommendation">
        Wanna Go Custom ?
      </button>
      <p class="recommendation-hint">Please Click on above button for Personalised Recommended UV-Shield</p>
    </div>
      <!-- 信息卡片区域 -->
    <div class="info-cards-container">
      <div class="info-card">
        <div class="card-icon">🧴</div>
        <div class="card-content">
          <h3>Sunscreen with SPF 30+ OR Higher</h3>
          <ul>
            <li>Apply broad spectrum sunscreen at least SPF 30 to protect against both UVA and UVB rays.</li>
            <li>Reapply every 2 hours, or more often if swimming or sweating.</li>
          </ul>
        </div>
      </div>
      
      <div class="info-card">
        <div class="card-icon">👕</div>
        <div class="card-content">
          <h3>Protective Clothing</h3>
          <ul>
            <li>Long-sleeved shirts, wide-brimmed hats, and UV-blocking sunglasses provide an extra layer of defense.</li>
            <li>Clothing with a UPF (Ultraviolet Protection Factor) rating offers additional sun protection.</li>
          </ul>
        </div>
      </div>
      
      <div class="info-card">
        <div class="card-icon">💧</div>
        <div class="card-content">
          <h3>Stay Hydrated</h3>
          <ul>
            <li>Sun exposure can lead to dehydration, so drink plenty of water to keep your skin hydrated and healthy.</li>
            <li>Drinking water flushes out toxins and keeps your skin hydrated and radiant.</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from 'vue-router';

const router = useRouter();

const API_URL = "https://gsk9rppx5i.execute-api.us-east-1.amazonaws.com/prod/getuvindex"; 

const address = ref("");
const suggestions = ref([]);
const result = ref(null);
const errorMessage = ref("");
const loading = ref(false);
const selectedLocation = ref(null);

// 计算UV指针旋转角度的方法
const calculateRotation = (uvIndex) => {
  const uvValue = parseFloat(uvIndex);
  
  if (uvValue < 0) {
    return -90; // 负值默认为0度
  }
  else if (uvValue < 1) {
    return -90; // UV 0-1 固定为0度
  }
  else if (uvValue < 2) {
    return -90 + ((uvValue - 1) / 1) * 15;
  }
  else if (uvValue < 3) {
    return -75 + ((uvValue - 2) / 1) * 15;
  }
  else if (uvValue < 4) {
    return -60 + ((uvValue - 3) / 1) * 15;
  }
  else if (uvValue < 5) {
    return -45 + ((uvValue - 4) / 1) * 15;
  }
  else if (uvValue < 6) {
    return -30 + ((uvValue - 5) / 1) * 15;
  }
  else if (uvValue < 7) {
    return -15 + ((uvValue - 6) / 1) * 15;
  }
  else if (uvValue < 8) {
    return 0 + ((uvValue - 7) / 1) * 15;
  }
  else if (uvValue < 9) {
    return 15 + ((uvValue - 8) / 1) * 15;
  }
  else if (uvValue < 10) {
    return 30 + ((uvValue - 9) / 1) * 15;
  }
  else if (uvValue < 11) {
    return 45 + ((uvValue - 10) / 1) * 15;
  }
  else {
    const maxRotation = 90;
    const remainingRotation = maxRotation - 60;
    return 60 + Math.min(((uvValue - 11) / 5) * remainingRotation, remainingRotation);
  }
};

// 地址自动补全 API
const fetchSuggestions = async () => {
  if (address.value.trim().length < 2) {
    suggestions.value = [];
    return;
  }

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: address.value }),
    });

    const data = await response.json();
    
    if (data.suggestions && data.suggestions.length > 0) {
      suggestions.value = data.suggestions;
    } else {
      // 如果没有建议，可以使用备用API
      try {
        const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address.value)}&limit=5`;
        const nominatimResponse = await fetch(nominatimUrl);
        const nominatimData = await nominatimResponse.json();
        
        suggestions.value = nominatimData.map(item => ({
          display_name: item.display_name,
          center: [parseFloat(item.lon), parseFloat(item.lat)]
        }));
      } catch (err) {
        console.error("备用API请求失败:", err);
      }
    }
  } catch (error) {
    console.error("地址自动补全请求失败:", error);
  }
};

// 选择建议
const selectSuggestion = async (index) => {
  if (suggestions.value.length <= index) return;

  const selected = suggestions.value[index];
  address.value = selected.display_name;
  
  // 更新位置坐标
  if (selected.center) {
    selectedLocation.value = {
      lng: selected.center[0],
      lat: selected.center[1]
    };
  } else if (selected.lon && selected.lat) {
    selectedLocation.value = {
      lng: parseFloat(selected.lon),
      lat: parseFloat(selected.lat)
    };
  }
  
  suggestions.value = []; // 清空建议列表
};

// 发送 UV API 请求
const getUV = async () => {
  if (!address.value.trim()) {
    errorMessage.value = "Please enter a valid address!";
    return;
  }

  loading.value = true;
  errorMessage.value = "";
  result.value = null;

  try {
    // 如果已选择位置，使用坐标查询
    const requestBody = selectedLocation.value 
      ? { 
          address: address.value,
          latitude: selectedLocation.value.lat,
          longitude: selectedLocation.value.lng
        }
      : { address: address.value };

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    if (data.uv_index !== undefined) {
      result.value = data;
      const searchData = {
        location: data.address,
        coordinates: selectedLocation.value || null,
        lastUpdated: new Date().toLocaleString('en-US'),
        skinColorType: null,
        skinType: null,
        source: "API",
        timestamp: Date.now(),
        uvIndex: parseFloat(data.uv_index)
      };
      
      // 保存到localStorage
      localStorage.setItem('uvSearchData', JSON.stringify(searchData));
    } else {
      errorMessage.value = "Query failed, please check if the address is valid!";
    }
  } catch (error) {
    errorMessage.value = "Request error, please try again later!";
    console.error("API error:", error);
  } finally {
    loading.value = false;
  }
};
const goToRecommendation = () => {
  router.push('/recommendation');  // 导航到推荐界面
};
</script>

<style scoped>
.container {
  max-width: 1600px;
  margin: auto;
  padding: 20px;
  font-family: 'Roboto', Arial, sans-serif;
  color: #333;
}

/* Banner容器样式 - 保持原样 */
.banner-container {
  position: relative;
  width: 100%;
  height: auto;
  overflow: hidden;
}

.banner-image {
  position: relative;
  width: 100%;
  height: 500px;
}

.full-width-banner {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.banner-text-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 85%;
  padding: 30px 20px;
  box-sizing: border-box;
  background-color: rgba(255, 255, 255, 0.7);
  text-align: center;
  border-radius: 8px;
}

.banner-text-overlay h1 {
  color: #333;
  font-size: 2.2rem;
  font-weight: bold;
  margin: 0 0 15px 0;
  line-height: 1.3;
}

.banner-text-overlay p {
  color: #555;
  font-size: 1.2rem;
  margin: 0 0 8px 0;
}

/* 查询区域 */
.location-area {
  margin: 30px 0;
  text-align: center;
}

.section-title {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 15px;
  color: #555;
  text-align: center;
}

.search-container {
  display: flex;
  justify-content: center;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.mapbox-search {
  position: relative;
  width: 100%;
}

.search-input-group {
  display: flex;
  align-items: center;
  width: 100%;
}

.input-box {
  flex: 1;
  padding: 15px 20px;
  border: 2px solid #ddd;
  border-radius: 30px 0 0 30px;
  font-size: 17px;
  box-sizing: border-box;
  transition: all 0.3s;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
}

.input-box:focus {
  outline: none;
  border-color: #b0906a;
  box-shadow: 0 3px 15px rgba(0, 123, 255, 0.2);
}

.search-button {
  background-color: #b0906a;
  color: white;
  border: none;
  border-radius: 0 30px 30px 0;
  padding: 16px 25px;
  height: 100%;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  white-space: nowrap;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
}

.search-button:hover {
  background-color: #b0906a;
}

.search-button:disabled {
  background-color: #aaa;
  cursor: not-allowed;
}

.search-icon {
  margin-right: 5px;
  font-size: 16px;
}

/* 下拉菜单样式优化 */
.suggestions-dropdown {
  position: absolute;
  top: 100%;
  width: 100%;
  max-height: 250px;
  overflow-y: auto;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-top: 8px;
}

.suggestion-item {
  padding: 12px 20px;
  cursor: pointer;
  border-bottom: 1px solid #eee;
  text-align: left;
  transition: background-color 0.2s;
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-item:hover {
  background-color: #f0f7ff;
}

/* 结果展示区样式优化 */
.result-area {
  margin: 10px auto;
  max-width: 700px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.simplified-result {
  text-align: center;
  margin-bottom: 10px;
  padding: 15px 25px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 10px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
}

.location-name {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 5px;
  color: #444;
}

.uv-result {
  font-size: 22px;
  font-weight: 600;
  margin: 5px 0;
  color: #333;
}

.uv-value {
  color: #e67e22;
  font-size: 28px;
  font-weight: bold;
}

/* UV仪表盘和指针样式 */
.uv-meter-container {
  position: relative;
  width: 100%;
  max-width: 400px;
  display: flex;
  justify-content: center;
  margin-top: 0px;
}

.uv-meter {
  width: 100%;
  height: auto;
  opacity: 0.9;
}

.uv-pointer {
  position: absolute;
  bottom: 10%;
  left: 50%;
  height: 90px;
  width: 5px; 
  background-color: #A2845E;
  transform-origin: bottom center;
  z-index: 5;
  border-radius: 2px;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
  &:after {
    content: '';
    position: absolute;
    top: -5px;
    left: -3.5px;
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-bottom: 12px solid #A2845E;
  }
}

/* 推荐按钮样式 */
.recommendation-button-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 25px 0 20px;
}

.recommendation-button {
  background-color: #b0906a;
  color: white;
  font-size: 22px;
  font-weight: 600;
  padding: 16px 40px;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 5px 15px rgba(176, 144, 106, 0.4);
}

.recommendation-button:hover {
  background-color: #9a7b58;
  transform: translateY(-3px);
  box-shadow: 0 7px 20px rgba(176, 144, 106, 0.5);
}

.recommendation-hint {
  color: #888;
  margin-top: 15px;
  font-size: 16px;
  text-align: center;
}

.error-message {
  color: #e74c3c;
  margin: 15px 0;
  font-weight: bold;
  text-align: center;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .banner-text-overlay {
    width: 90%;
    padding: 20px 15px;
  }
  
  .banner-text-overlay h1 {
    font-size: 1.8rem;
  }
  
  .banner-text-overlay p {
    font-size: 1rem;
  }
  
  .section-title {
    font-size: 18px;
  }
  
  .recommendation-button {
    font-size: 18px;
    padding: 14px 30px;
  }
}

@media (max-width: 480px) {
  .banner-image {
    height: 400px;
  }
  
  .banner-text-overlay {
    width: 95%;
    padding: 15px 10px;
  }
  
  .banner-text-overlay h1 {
    font-size: 1.5rem;
  }
  
  .banner-text-overlay p {
    font-size: 0.9rem;
  }
  
  .input-box {
    padding: 12px 15px;
  }
  
  .uv-pointer {
    height: 60px;
  }
}
.info-cards-container {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 20px;
  margin: 30px 0;
}

.info-card {
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 25px;
  width: calc(33.333% - 20px);
  border: 1px solid #e0e0e0;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

/* 鼠标悬停时的放大效果 */
.info-card:hover {
  transform: scale(1.03);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.card-icon {
  font-size: 36px;
  margin-bottom: 15px;
  color: #b0906a;
}

.card-content h3 {
  font-size: 20px;
  color: #555;
  margin-bottom: 15px;
  font-weight: 600;
}

.card-content ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.card-content li {
  position: relative;
  padding-left: 20px;
  margin-bottom: 10px;
  color: #666;
  line-height: 1.5;
}

.card-content li:before {
  content: "•";
  color: #b0906a;
  font-weight: bold;
  position: absolute;
  left: 0;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .info-card {
    width: calc(50% - 15px);
  }
}

@media (max-width: 480px) {
  .info-card {
    width: 100%;
  }
}
</style>