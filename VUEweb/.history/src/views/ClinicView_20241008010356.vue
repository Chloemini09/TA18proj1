<template>
  <div class="clinic-container">
    <!-- 顶部显示用户和日期 -->
    <header class="header">
      <h1>Hi, {{ userName }}</h1>
      <p>{{ currentDate }}</p>
    </header>

    <!-- 搜索GP -->
    <div class="search-container">
      <input
        v-model="searchQuery"
        placeholder="Search nearby GP..."
        @keyup.enter="searchGP"
        class="search-input"
      />
      <button @click="searchGP" class="search-btn">Search</button>
    </div>

    <!-- Mapbox 容器 -->
    <div id="map" class="map-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import mapboxgl from 'mapbox-gl';
import axios from 'axios';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebase 实例
const db = getFirestore();
const auth = getAuth();

// 初始化地图 token 和用户信息
const mapboxToken = 'pk.eyJ1IjoiY2hsb2V5dWUiLCJhIjoiY20xejJpb3BhMDJndTJrcHpwaG9ocHE0NyJ9.jHaWplmk0Y_XWTLCtuAm4A';
const userName = ref(''); // 将从 Firestore 中获取的 username 放入此处
const currentDate = new Date().toLocaleDateString();

// 地图和搜索相关数据
const searchQuery = ref('');
let map;
let currentLocationMarker;

// 获取用户的 Firestore 数据
const getUserInfo = async () => {
  const user = auth.currentUser;
  if (user) {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      userName.value = userData.username; // 从 Firestore 中获取 username
    } else {
      console.error('No such user data!');
    }
  } else {
    console.error('No user is currently logged in!');
  }
};

// 在地图初始化之前获取用户地理位置
const successLocation = (position) => {
  const { longitude, latitude } = position.coords;
  setupMap([longitude, latitude]); // 初始化地图
};

const errorLocation = () => {
  // 如果无法获取位置，使用默认位置
  const defaultLocation = [144.9631, -37.8136]; // 墨尔本坐标
  setupMap(defaultLocation);
};

const setupMap = (center) => {
  // 设置地图 token
  mapboxgl.accessToken = mapboxToken;

  // 创建地图实例
  map = new mapboxgl.Map({
    container: 'map', // 绑定地图的 DOM 容器
    style: 'mapbox://styles/mapbox/streets-v11',
    center: center, // 初始化地图中心
    zoom: 13, // 初始化缩放级别
  });

  // 添加当前位置标记
  currentLocationMarker = new mapboxgl.Marker().setLngLat(center).addTo(map);

  // 添加缩放控件
  map.addControl(new mapboxgl.NavigationControl());

  // 添加点击事件
  map.on('click', (event) => {
    const lngLat = event.lngLat;
    console.log('Clicked location:', lngLat);
  });
};

// 搜索GP功能
const searchGP = async () => {
  const query = searchQuery.value;

  if (!query) {
    alert('Please enter a search term.');
    return;
  }

  // 使用Mapbox的Geocoding API进行搜索
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?proximity=${map.getCenter().lng},${map.getCenter().lat}&access_token=${mapboxToken}`;

  try {
    const response = await axios.get(url);
    const results = response.data.features;

    if (results.length === 0) {
      alert('No GP found nearby.');
      return;
    }

    // 清除现有标记
    map.eachLayer((layer) => {
      if (layer.id.startsWith('poi-marker-')) {
        map.removeLayer(layer.id);
        map.removeSource(layer.id);
      }
    });

    // 在地图上显示结果
    results.forEach((place, index) => {
      const coordinates = place.geometry.coordinates;
      const description = place.place_name;

      new mapboxgl.Marker({ color: 'red' })
        .setLngLat(coordinates)
        .setPopup(new mapboxgl.Popup().setHTML(`<p>${description}</p>`)) // 点击时显示地点名称
        .addTo(map);

      map.flyTo({ center: coordinates });
    });
  } catch (error) {
    console.error('Error fetching GP data:', error);
  }
};

// 当组件挂载时获取用户位置并初始化地图
onMounted(async () => {
  // 获取当前用户的 username
  await getUserInfo();

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(successLocation, errorLocation, {
      enableHighAccuracy: true,
    });
  } else {
    errorLocation(); // 如果浏览器不支持地理位置
  }
});
</script>

<style scoped>
.clinic-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
}

.search-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.search-input {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  width: 300px;
  margin-right: 10px;
}

.search-btn {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.map-container {
  width: 100%;
  height: 500px;
  border-radius: 10px;
  overflow: hidden;
}

.search-btn:hover {
  background-color: #0056b3;
}
</style>
