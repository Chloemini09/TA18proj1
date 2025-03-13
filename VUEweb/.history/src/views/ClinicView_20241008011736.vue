<template>
  <div class="clinic-container">
    <header class="header">
      <h1>Hi, {{ username }}</h1>
      <p>{{ currentDate }}</p>
    </header>
    
    <div class="search-container">
      <input type="text" v-model="searchAddress" @input="fetchSuggestions" placeholder="Search nearby GP..." />
      <ul v-if="suggestions.length" class="suggestions-list">
        <li v-for="suggestion in suggestions" :key="suggestion.id" @click="selectSuggestion(suggestion)">
          {{ suggestion.place_name }}
        </li>
      </ul>
      <button @click="searchGP">Search</button>
    </div>
    
    <div id="map" class="map-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import mapboxgl from 'mapbox-gl'
import axios from 'axios'
import { getFirestore, doc, getDoc } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

// 设置 Mapbox Token
mapboxgl.accessToken = 'pk.eyJ1IjoiY2hsb2V5dWUiLCJhIjoiY20xejJpb3BhMDJndTJrcHpwaG9ocHE0NyJ9.jHaWplmk0Y_XWTLCtuAm4A'

// 状态声明
const map = ref(null)
const searchAddress = ref('')
const suggestions = ref([]) // 用于保存地址自动补全的结果
const currentDate = new Date().toLocaleDateString()
const username = ref('User')

// 获取 Firestore 中的用户信息
const getUsername = async () => {
  const auth = getAuth()
  const user = auth.currentUser
  if (user) {
    const userRef = doc(db, 'users', user.uid)
    const userDoc = await getDoc(userRef)
    if (userDoc.exists()) {
      username.value = userDoc.data().username
    } else {
      console.error('No such document!')
    }
  }
}

// 使用 Geocoding API 将地址转换为坐标
const geocodeAddress = (address) => {
  const geocodingUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${mapboxgl.accessToken}`

  return axios.get(geocodingUrl)
    .then(response => {
      if (response.data.features.length > 0) {
        const coords = response.data.features[0].center
        return coords
      } else {
        throw new Error('Address not found')
      }
    })
    .catch(error => {
      console.error('Error geocoding address:', error)
      return null
    })
}

// 搜索诊所并显示在地图上
const searchGP = () => {
  const address = searchAddress.value

  geocodeAddress(address)
    .then(coords => {
      if (coords) {
        return searchNearbyClinics(coords)
      } else {
        throw new Error('Invalid address')
      }
    })
    .then(clinics => {
      const markers = document.getElementsByClassName('mapboxgl-marker')
      while (markers.length > 0) {
        markers[0].remove() // 移除所有的标记
      }

      addMarkersToMap(map.value, clinics)
    })
    .catch(error => {
      console.error('Error fetching GP data:', error)
    })
}

// 在地图上标记诊所位置
const addMarkersToMap = (map, clinics) => {
  clinics.forEach(clinic => {
    const [lng, lat] = clinic.geometry.coordinates
    new mapboxgl.Marker()
      .setLngLat([lng, lat])
      .setPopup(new mapboxgl.Popup({ offset: 25 }).setText(clinic.text)) // 弹出窗口显示诊所名称
      .addTo(map)
  })
}

// 获取自动补全的地址建议
const fetchSuggestions = () => {
  const address = searchAddress.value
  if (address.length > 2) {
    const geocodingUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${mapboxgl.accessToken}&autocomplete=true&limit=5`

    axios.get(geocodingUrl)
      .then(response => {
        suggestions.value = response.data.features
      })
      .catch(error => {
        console.error('Error fetching suggestions:', error)
      })
  } else {
    suggestions.value = []
  }
}

// 用户点击某个建议时选择该地址
const selectSuggestion = (suggestion) => {
  searchAddress.value = suggestion.place_name
  suggestions.value = [] // 选中后清空建议列表
}

// 初始化地图
const setupMap = () => {
  map.value = new mapboxgl.Map({
    container: 'map', // 指定 HTML 元素 ID
    style: 'mapbox://styles/mapbox/streets-v11', // 地图样式
    center: [144.9631, -37.8136], // 初始地图中心位置 (墨尔本)
    zoom: 12 // 地图缩放级别
  })

  navigator.geolocation.getCurrentPosition(
    (position) => {
      map.value.setCenter([position.coords.longitude, position.coords.latitude])
    },
    () => {
      console.error('Unable to retrieve your location')
    }
  )
}

onMounted(() => {
  setupMap()
  getUsername()
})
</script>

<style scoped>
.clinic-container {
  padding: 20px;
  max-width: 1000px;
  margin: auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-container {
  display: flex;
  gap: 10px;
  margin: 20px 0;
  position: relative;
}

#map {
  width: 100%;
  height: 500px;
  border-radius: 8px;
}

.suggestions-list {
  position: absolute;
  top: 40px;
  left: 0;
  width: 100%;
  background-color: white;
  border: 1px solid #ddd;
  z-index: 100;
}

.suggestions-list li {
  padding: 10px;
  cursor: pointer;
}

.suggestions-list li:hover {
  background-color: #f0f0f0;
}
</style>
