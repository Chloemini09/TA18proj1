<template>
  <!-- 模板部分保持不变 -->
</template>

<script>
import mapboxgl from 'mapbox-gl';
import axios from 'axios';

mapboxgl.accessToken = 'pk.eyJ1IjoiY2hsb2V5dWUiLCJhIjoiY20xejJpb3BhMDJndTJrcHpwaG9ocHE0NyJ9.jHaWplmk0Y_XWTLCtuAm4A';

export default {
  name: 'ClinicView',
  data() {
    return {
      map: null,
      searchQuery: '',
      suggestions: [],
      nearbyClinics: [],
      selectedClinic: null,
      routeSteps: [],
      userLocation: null,
      routeInfo: null,
      currentPage: 1,
      itemsPerPage: 5,
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.nearbyClinics.length / this.itemsPerPage);
    },
    paginatedClinics() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.nearbyClinics.slice(start, end);
    }
  },
  mounted() {
    this.initializeMap();
  },
  methods: {
    initializeMap() {
      this.map = new mapboxgl.Map({
        container: this.$refs.mapContainer,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [144.9631, -37.8136],
        zoom: 12
      });

      this.map.addControl(new mapboxgl.NavigationControl());
    },
    async searchAddress() {
      // 地址搜索方法保持不变
    },
    selectAddress(address) {
      this.searchQuery = address.place_name;
      this.suggestions = [];
      this.userLocation = address.center;
      this.map.flyTo({
        center: address.center,
        zoom: 14
      });
      this.findNearbyClinics(address.center);
    },
    async findNearbyClinics(center) {
      try {
        // 使用 Mapbox Tilequery API 来查找附近的医疗机构
        const response = await axios.get(`https://api.mapbox.com/v4/mapbox.mapbox-streets-v8/tilequery/${center[0]},${center[1]}.json`, {
          params: {
            radius: 3000, // 3km 半径
            limit: 50, // 增加结果数量
            access_token: mapboxgl.accessToken,
            layers: 'poi_label', // 兴趣点图层
            geometry: 'point',
          }
        });

        // 过滤结果，只保留医疗机构（如医院、诊所等）
        this.nearbyClinics = response.data.features.filter(feature => 
          ['hospital', 'clinic', 'doctors', 'dentist'].includes(feature.properties.type)
        ).map(feature => ({
          id: feature.id,
          text: feature.properties.name,
          center: feature.geometry.coordinates,
          distance: feature.properties.tilequery.distance // 距离（米）
        }));

        // 按距离排序
        this.nearbyClinics.sort((a, b) => a.distance - b.distance);

        this.currentPage = 1;

        // 在地图上添加标记
        this.addClinicMarkers();
      } catch (error) {
        console.error('Error finding nearby clinics:', error);
      }
    },
    addClinicMarkers() {
      // 清除现有的标记
      if (this.map.getLayer('clinics')) {
        this.map.removeLayer('clinics');
      }
      if (this.map.getSource('clinics')) {
        this.map.removeSource('clinics');
      }

      // 添加新的标记
      this.map.addSource('clinics', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: this.nearbyClinics.map(clinic => ({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: clinic.center
            },
            properties: {
              title: clinic.text,
              description: `${(clinic.distance / 1000).toFixed(2)} km`
            }
          }))
        }
      });

      this.map.addLayer({
        id: 'clinics',
        type: 'circle',
        source: 'clinics',
        paint: {
          'circle-color': '#11b4da',
          'circle-radius': 6,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#fff'
        }
      });

      // 添加弹出窗口
      this.map.on('click', 'clinics', (e) => {
        const coordinates = e.features[0].geometry.coordinates.slice();
        const { title, description } = e.features[0].properties;

        new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML(`<h3>${title}</h3><p>${description}</p>`)
          .addTo(this.map);
      });

      // 改变鼠标样式
      this.map.on('mouseenter', 'clinics', () => {
        this.map.getCanvas().style.cursor = 'pointer';
      });
      this.map.on('mouseleave', 'clinics', () => {
        this.map.getCanvas().style.cursor = '';
      });
    },
    showRoute(clinic) {
      this.selectedClinic = clinic;
      this.getRoute('driving');
    },
    async getRoute(mode) {
      // 路线获取方法保持不变
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    }
  }
};
</script>

<style scoped>
/* 样式保持不变 */
</style>