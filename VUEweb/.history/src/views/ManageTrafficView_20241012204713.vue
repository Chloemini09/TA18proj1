<template>
    <div class="admin-dashboard">
      <h2>User Login Statistics</h2>
      <canvas id="trafficChart"></canvas>
    </div>
</template>
  
<script>
import { onMounted, ref } from 'vue';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import Chart from 'chart.js/auto';

export default {
  name: 'AdminDashboardTrafficChart',
  setup() {
    const db = getFirestore();
    const trafficData = ref([]);
    const labels = ref([]);
    const dataPoints = ref([]);

    const getTrafficData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'traffic'));
        trafficData.value = querySnapshot.docs.map(doc => ({
          date: doc.id,
          views: doc.data().views,
        }));

        // Populate labels and dataPoints for chart
        labels.value = trafficData.value.map(entry => entry.date);
        dataPoints.value = trafficData.value.map(entry => entry.views);
      } catch (error) {
        console.error('Error getting traffic data:', error);
      }
    };

    const createChart = () => {
      const ctx = document.getElementById('trafficChart').getContext('2d');
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels.value,
          datasets: [{
            label: 'User Login Count',
            data: dataPoints.value,
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderWidth: 2,
          }]
        },
        options: {
          responsive: true,
          scales: {
            x: {
              title: {
                display: true,
                text: 'Date',
              }
            },
            y: {
              title: {
                display: true,
                text: 'Login Count',
              },
              beginAtZero: true,
            }
          }
        }
      });
    };

    onMounted(async () => {
      await getTrafficData();
      createChart();
    });

    return {};
  }
};
</script>

  
<style scoped>
    .admin-dashboard {
    padding: 20px;
    }

    canvas {
    max-width: 100%;
    height: 400px;
    }
</style>