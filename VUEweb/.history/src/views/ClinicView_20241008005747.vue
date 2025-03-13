<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router'; // 正确引入 useRouter
import mapboxgl from 'mapbox-gl';

// Mapbox token（替换为你自己的Mapbox密钥）
mapboxgl.accessToken = 'pk.eyJ1IjoiY2hsb2V5dWUiLCJhIjoiY20xejJpb3BhMDJndTJrcHpwaG9ocHE0NyJ9.jHaWplmk0Y_XWTLCtuAm4A';

const searchQuery = ref('');
const gps = ref([]);
const currentDate = new Date().toLocaleDateString();

let map;
let userLocation = [0, 0]; // 用户的地理位置占位符

const router = useRouter(); // 使用 useRouter

// 初始化地图
onMounted(() => {
  navigator.geolocation.getCurrentPosition(successLocation, errorLocation, {
    enableHighAccuracy: true
  });

  function successLocation(position) {
    userLocation = [position.coords.longitude, position.coords.latitude];
    setupMap(userLocation);
  }

  function errorLocation() {
    setupMap([0, 0]); // 如果获取地理位置失败，则默认显示[0, 0]
  }

  function setupMap(center) {
    map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: center,
      zoom: 12
    });

    new mapboxgl.Marker().setLngLat(center).addTo(map);
  }
});

// 使用 Mapbox Geocoding API 搜索附近的GP
async function searchNearbyGPs() {
  const response = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/gp.json?proximity=${userLocation[0]},${userLocation[1]}&access_token=${mapboxgl.accessToken}`
  );
  const data = await response.json();
  gps.value = data.features;

  // 在地图上添加GP的位置标记
  gps.value.forEach((gp) => {
    new mapboxgl.Marker().setLngLat(gp.center).addTo(map);
  });
}

// 导航到选中的GP
function navigateToGP(gp) {
  map.flyTo({
    center: gp.center,
    essential: true,
    zoom: 15
  });
}

// 返回上一个页面
function goBack() {
  router.push('/home');
}
</script>
