<template>
  <div class="clinic-container">
    <header class="header">
      <h1>Hi, {{ username }}</h1>
      <p>{{ currentDate }}</p>
    </header>
    
    <div class="search-container">
      <input type="text" v-model="searchAddress" placeholder="Search nearby GP..." />
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

// 引入必要的库
const db = getFirestore()
const auth = getAuth()
const user = auth.currentUser

// 状态声明
const map = ref(null)
const searchAddress = ref('')
const currentDate = new Date().toLocaleDateString()
const username = ref('User')

// 获取 Firestore 中的用户信息
const getUsername = async () => {
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

// 在地图上标记诊所位置
const addMarkersToMap = (map, clinics) => {
  clinics.forEach(clinic => {
    const [lng, lat] = clinic.geometry.coordinates

    // 在地图上添加标记
    new mapboxgl.Marker()
      .setLngLat([lng, lat])
      .setPopup(new mapboxgl.Popup({ offset: 25 }).setText(clinic.text)) // 弹出窗口显示诊所名称
      .addTo(map)
  })
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

// 使用 Places API 搜索附近诊所
const searchNearbyClinics = (coords) => {
  const [lng, lat] = coords
  const placesUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/clinic,hospital,doctor.json?proximity=${lng},${lat}&types=poi&access_token=${mapboxgl.accessToken}`

  return axios.get(placesUrl)
    .then(response => {
      return response.data.features
    })
    .catch(error => {
      console.error('Error searching for clinics:', error)
      return []
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
      // 清除现有标记
      map.value.eachLayer(layer => {
        if (layer.type === 'symbol') {
          map.value.removeLayer(layer.id)
        }
      })

      // 在地图上添加新的诊所标记
      addMarkersToMap(map.value, clinics)
    })
    .catch(error => {
      console.error('Error fetching GP data:', error)
    })
}

// 初始化地图
const setupMap = () => {
  map.value = new mapboxgl.Map({
    container: 'map', // 指定 HTML 元素 ID
    style: 'mapbox://styles/mapbox/streets-v11', // 地图样式
    center: [144.9631, -37.8136], // 初始地图中心位置 (墨尔本)
    zoom: 12 // 地图缩放级别
  })

  // 在用户当前位置设置地图中心
  navigator.geolocation.getCurrentPosition(
    (position) => {
      map.value.setCenter([position.coords.longitude, position.coords.latitude])
    },
    () => {
      console.error('Unable to retrieve your location')
    }
  )
}

// 页面加载时调用
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
}

#map {
  width: 100%;
  height: 500px;
  border-radius: 8px;
}
</style>
