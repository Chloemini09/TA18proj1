<template>
  <div class="cancer-data-container">
    <h1>How many people get sick due to Sun?</h1>
    
    <div class="chart-section">
      <h2> Trends in cancer incidence rates</h2>
      <div class="data1-button">
      <button @click="fetchData1" :disabled="loading1">
        {{ loading1 ? 'Loading...' : 'Click to SEE' }}
      </button></div>
      <div v-if="loading1" class="loading">Loading...</div>
      <div v-else-if="error1" class="error">{{ error1 }}</div>
      <div v-if="cancerData1" class="chart-wrapper">
        <canvas 
          ref="cancerChart1"
          :id="'cancerChart1Canvas'"
        ></canvas>
      </div>
    </div>
    
    <div class="chart-section">
      <h2>Cancer Mortality Rate Trend (per 100k people)</h2>
      <div class="data2-button">
        <button @click="fetchData2" :disabled="loading2">
          {{ loading2 ? 'Loading...' : 'Click to SEE' }}
        </button>
      </div>
      <div v-if="loading2" class="loading">Loading...</div>
      <div v-else-if="error2" class="error">{{ error2 }}</div>
      <div v-if="cancerData2" class="chart-wrapper">
        <canvas 
          ref="cancerChart2"
          :id="'cancerChart2Canvas'"
        ></canvas>
      </div>
    </div>
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
        this.cancerData1 = rawData.map(item => ({...item}));
        
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
        
        this.cancerData2 = uniqueData.map(item => ({...item}));
        
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
/* 样式保持不变 */
.cancer-data-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
}

.chart-section {
  margin-bottom: 30px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.chart-wrapper {
  width: 100%;
  height: 400px;
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

.data1-button {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  object-position:right;
}
.data2-button {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  object-position:right;
}

button {
  margin: 0 auto;
  padding: 10px 15px;
  background-color: #5A4132;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  object-position:right;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

button:hover:not(:disabled) {
  background-color: #808080;
}
</style>