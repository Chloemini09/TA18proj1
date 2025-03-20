<template>
  <div class="page-container">
    <!-- 背景图片与标题部分 -->
    <header class="header-section">
      <div class="background-images">
        <img src="@/assets/image2.png" alt="Sun Protection" />
        <img src="@/assets/image1.jpg" alt="Sunbathing" />
        <img src="@/assets/image3.png" alt="Healthy Skin" />
      </div>
      <div class="title-overlay">
        <h1>BRIGHTER DAYS, BIGGER RISKS - STAY PROTECTED</h1>
      </div>
    </header>

    <!-- 改为上下布局的图表部分 -->
    <main class="charts-section">
      <!-- 第一个图表部分 -->
      <div class="chart-row">
        <div class="chart-section">
          <h2>Incidence of skin cancer</h2>
          <div class="data-button">
            <button @click="fetchData1" :disabled="loading1">
              {{ loading1 ? 'Loading...' : 'Click to REFRESH' }}
            </button>
          </div>
          <div v-if="loading1" class="loading">Loading...</div>
          <div v-else-if="error1" class="error">{{ error1 }}</div>
          <div v-if="cancerData1" class="chart-wrapper">
            <canvas ref="cancerChart1" :id="'cancerChart1Canvas'"></canvas>
          </div>
        </div>
        
        <!-- 第一个图表右侧的悬浮信息卡片 -->
        <div class="info-card">
          <h2>Melanoma Cases Rising, Death Rates Stable</h2>
          <ul>
            <li>Since the 1990s, melanoma cases have increased, but deaths remain steady.</li>
            <li>Early detection and better treatments are saving lives.</li>
          </ul>
          
          <h3>Why the Rise?</h3>
          <ul>
            <li>More sun exposure from outdoor activities.</li>
            <li>Ozone depletion increasing UV radiation.</li>
            <li>Better detection through screenings and awareness.</li>
          </ul>
        </div>
      </div>

      <!-- 第二个图表部分 -->
      <div class="chart-row">
        <div class="chart-section">
          <h2>Mortality from skin cancer</h2>
          <div class="data-button">
            <button @click="fetchData2" :disabled="loading2">
              {{ loading2 ? 'Loading...' : 'Click to REFRESH' }}
            </button>
          </div>
          <div v-if="loading2" class="loading">Loading...</div>
          <div v-else-if="error2" class="error">{{ error2 }}</div>
          <div v-if="cancerData2" class="chart-wrapper">
            <canvas ref="cancerChart2" :id="'cancerChart2Canvas'"></canvas>
          </div>
        </div>
        
        <!-- 第二个图表右侧的悬浮信息卡片 -->
        <div class="info-card">
          <h2>Melanoma & Skin Cancer Trends</h2>
          <ul>
            <li>The graph tracks skin cancer death rates in Australia over decades.</li>
            <li>Melanoma (yellow line) is more fatal than non-melanoma skin cancers (NMSC).</li>
            <li>Melanoma deaths remained stable for years but are now declining due to early detection, better treatment, and sun safety awareness.</li>
          </ul>
          
          <h3>What It Means for You</h3>
          <ul>
            <li>Melanoma is the deadliest skin cancer, but prevention and early detection save lives.</li>
            <li>Falling death rates show progress, but staying vigilant is key.</li>
          </ul>
        </div>
      </div>
    </main>

    <!-- 页脚信息 -->
    <footer class="footer-section">
      <h2>STAY SAFE KEEP ENJOYING</h2>
    </footer>
  </div>
</template>

<script>
import Chart from 'chart.js/auto';
import { apiService } from '@/services/apiService';
import { nextTick } from 'vue';

export default {
  name: 'Visualisation',
  data() {
    return {
      cancerData1: null,
      cancerData2: null,
      loading1: false,
      loading2: false,
      error1: null,
      error2: null,
      chart1: null,
      chart2: null
    }
  },
  methods: {
    async fetchData1() {
      this.loading1 = true;
      this.error1 = null;
      try {
        // 转换 Proxy 对象为普通数组
        const rawData = await apiService.getCancerData1();
        this.cancerData1 = rawData.map(item => ({ ...item }));

        // 使用 nextTick 确保 DOM 更新
        await nextTick();

        this.renderChart1();
      } catch (error) {
        this.error1 = 'Failed 1';
        console.error('Fetch data 1 error:', error);
      } finally {
        this.loading1 = false;
      }
    },
    async fetchData2() {
      this.loading2 = true;
      this.error2 = null;
      try {
        // 转换 Proxy 对象为普通数组
        const rawData = await apiService.getCancerData2();

        // 处理可能的重复年份问题（例如两个2023年的数据）
        const uniqueData = rawData.reduce((acc, current) => {
          const x = acc.find(item => item.year === current.year);
          if (!x) {
            return acc.concat([current]);
          } else {
            return acc;
          }
        }, []);

        this.cancerData2 = uniqueData.map(item => ({ ...item }));

        // 使用 nextTick 确保 DOM 更新
        await nextTick();

        this.renderChart2();
      } catch (error) {
        this.error2 = 'Failed 2';
        console.error('Fetch data 2 error:', error);
      } finally {
        this.loading2 = false;
      }
    },
    renderChart1() {
      // 多重引用检查方法
      let canvasRef = this.$refs.cancerChart1;

      // 如果 ref 不存在，尝试通过 ID 获取
      if (!canvasRef) {
        canvasRef = document.getElementById('cancerChart1Canvas');
      }

      console.log('Canvas ref for chart 1:', canvasRef);

      if (!canvasRef) {
        console.error('Canvas reference for chart 1 is null or undefined');
        return;
      }

      // 销毁已存在的图表
      if (this.chart1) {
        this.chart1.destroy();
      }

      try {
        const ctx = canvasRef.getContext('2d');
        if (!ctx) {
          console.error('Could not get 2D context for chart 1');
          return;
        }

        this.chart1 = new Chart(ctx, {
          type: 'line',
          data: {
            labels: this.cancerData1.map(item => item.year),
            datasets: [{
              label: 'Cancer incidence rate',
              data: this.cancerData1.map(item => item.cancerrate),
              borderColor: 'rgb(75, 192, 192)',
              tension: 0.1,
              fill: false
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: 'Trends in cancer incidence rates'
              },
              tooltip: {
                mode: 'index',
                intersect: false
              }
            },
            scales: {
              y: {
                title: {
                  display: true,
                  text: 'Incidence rate'
                }
              }
            }
          }
        });
      } catch (error) {
        console.error('Error rendering chart 1:', error);
      }
    },
    renderChart2() {
      // 多重引用检查方法
      let canvasRef = this.$refs.cancerChart2;

      // 如果 ref 不存在，尝试通过 ID 获取
      if (!canvasRef) {
        canvasRef = document.getElementById('cancerChart2Canvas');
      }

      console.log('Canvas ref for chart 2:', canvasRef);

      if (!canvasRef) {
        console.error('Canvas reference for chart 2 is null or undefined');
        return;
      }

      // 销毁已存在的图表
      if (this.chart2) {
        this.chart2.destroy();
      }

      try {
        const ctx = canvasRef.getContext('2d');
        if (!ctx) {
          console.error('Could not get 2D context for chart 2');
          return;
        }

        this.chart2 = new Chart(ctx, {
          type: 'line',
          data: {
            labels: this.cancerData2.map(item => item.year),
            datasets: [{
              label: 'Cancer Mortality Rate Trend (per 100k people)',
              data: this.cancerData2.map(item => item.cancer_mortality_rate),
              borderColor: 'rgb(192, 75, 192)',
              tension: 0.1,
              fill: false
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: 'Cancer Mortality Rate Trend (per 100k people)'
              },
              tooltip: {
                mode: 'index',
                intersect: false
              }
            },
            scales: {
              y: {
                title: {
                  display: true,
                  text: 'Mortality Rate(per 100k people)'
                }
              }
            }
          }
        });
      } catch (error) {
        console.error('Error rendering chart 2:', error);
      }
    }
  },
  mounted() {
    // 自动加载数据
    this.fetchData1();
    this.fetchData2();
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Tomorrow:wght@400;700&display=swap');

.page-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: 0 auto;
  align-items: center;
  text-align: center;
  min-height: 100vh;
  max-width: 1400px;
  padding: 0 20px;
}

/* 背景图片和标题 */
.header-section {
  position: relative;
  width: 100%;
  margin-bottom: 40px;
  align-items: center; 
}

.background-images {
  display: flex;
  justify-content: center;
  width: 100%;
  position: absolute;
  top: 0;
  z-index: -1;
  gap: 20px;
  left: 50%;
  transform: translateX(-50%);
}

.background-images img {
  width: 30%;
  height: auto;
}

.title-overlay h1,
.footer-section h2 {
  font-family: 'Tomorrow', sans-serif;
}

.title-overlay {
  margin-top: 250px;
  position: relative;
  background-color: rgba(255, 255, 255, 0.5);
  padding: 40px;
  border-radius: 10px;
  font-size: 1.5rem;
  font-weight: bold;
  display: inline-block;
  max-width: 80%;
  width: fit-content;
  text-align: center;
}

/* 改为垂直排列的图表部分 */
.charts-section {
  margin-top: 100px;
  position: relative;
  width: 90%;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 50px; /* 图表行之间的间距 */
}

.chart-row {
  display: flex;
  width: 100%;
  gap: 20px;
}

.chart-section {
  width: 60%; /* 让图表占据较大部分 */
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
}

/* 信息卡片样式 */
.info-card {
  width: 35%; /* 让信息卡片占据剩余部分 */
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.15);
  text-align: left; /* 文本左对齐 */
  border: 1px solid #e0d3c0; /* 浅棕色边框 */
  height: fit-content; /* 适应内容高度 */
  align-self: center; /* 垂直居中 */
}

.info-card h2 {
  color: #8b6b43; /* 棕色标题 */
  font-family: 'Tomorrow', sans-serif;
  font-size: 1.5rem;
  margin-bottom: 15px;
  border-bottom: 2px solid #e0d3c0;
  padding-bottom: 8px;
}

.info-card h3 {
  color: #8b6b43; /* 棕色标题 */
  font-family: 'Tomorrow', sans-serif;
  font-size: 1.3rem;
  margin-top: 20px;
  margin-bottom: 10px;
}

.info-card ul {
  padding-left: 20px;
  margin-bottom: 15px;
}

.info-card li {
  margin-bottom: 8px;
  font-size: 1rem;
  line-height: 1.4;
  color: #333;
}

/* 页脚部分样式 */
.footer-section {
  background-color: rgba(255, 255, 255, 0.5);
  padding: 20px;
  border-radius: 10px;
  font-size: 1.5rem;
  font-weight: bold;
  margin: 40px 0;
  text-align: center;
  width: fit-content;
}

.chart-wrapper {
  width: 100%;
  height: 350px; /* 图表高度 */
}

.loading {
  color: #666;
  text-align: center;
  padding: 20px;
}

.error {
  color: red;
  text-align: center;
  padding: 20px;
}

.data-button {
  margin-bottom: 15px;
}

button {
  padding: 10px 15px;
  background-color: #5A4132;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

button:hover:not(:disabled) {
  background-color: #808080;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .chart-row {
    flex-direction: column;
  }
  
  .chart-section, .info-card {
    width: 100%;
  }
  
  .info-card {
    margin-top: 20px;
  }
}
</style>