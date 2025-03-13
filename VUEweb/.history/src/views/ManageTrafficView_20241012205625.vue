<template>
    <div class="admin-dashboard">
      <h2>User Login Statistics</h2>
      <canvas id="trafficChart"></canvas>
  
      <h2>User Registration Statistics</h2>
      <canvas id="registrationChart"></canvas>
  
      <h2>Daily Posts Count</h2>
      <canvas id="postsChart"></canvas>
  
      <h2>Daily Bookings Count</h2>
      <canvas id="bookingsChart"></canvas>
  
      <h2>Daily Feedback Count</h2>
      <canvas id="feedbackChart"></canvas>
  
      <h2>Daily Health Tests Count</h2>
      <canvas id="healthTestsChart"></canvas>
    </div>
  </template>
  
  <script>
  import { onMounted, ref } from 'vue';
  import { getFirestore, collection, getDocs } from 'firebase/firestore';
  import { Chart } from 'chart.js';
  
  export default {
    name: 'AdminDashboardTrafficChart',
    setup() {
      const db = getFirestore();
      const trafficData = ref([]);
      const registrationData = ref([]);
      const postsData = ref([]);
      const bookingsData = ref([]);
      const feedbackData = ref([]);
      const healthTestsData = ref([]);
      const labels = ref([]);
      const dataPoints = ref([]);
      const registrationLabels = ref([]);
      const registrationPoints = ref([]);
      const postsLabels = ref([]);
      const postsPoints = ref([]);
      const bookingsLabels = ref([]);
      const bookingsPoints = ref([]);
      const feedbackLabels = ref([]);
      const feedbackPoints = ref([]);
      const healthTestsLabels = ref([]);
      const healthTestsPoints = ref([]);
  
      const getTrafficData = async () => {
        try {
          const querySnapshot = await getDocs(collection(db, 'traffic'));
          trafficData.value = querySnapshot.docs.map(doc => ({
            date: doc.id,
            views: doc.data().views,
          }));
  
          labels.value = trafficData.value.map(entry => entry.date);
          dataPoints.value = trafficData.value.map(entry => entry.views);
        } catch (error) {
          console.error('Error getting traffic data:', error);
        }
      };
  
      const getRegistrationData = async () => {
        try {
          const querySnapshot = await getDocs(collection(db, 'registrations'));
          registrationData.value = querySnapshot.docs.map(doc => ({
            date: doc.id,
            count: doc.data().count,
          }));
  
          registrationLabels.value = registrationData.value.map(entry => entry.date);
          registrationPoints.value = registrationData.value.map(entry => entry.count);
        } catch (error) {
          console.error('Error getting registration data:', error);
        }
      };
  
      const getPostsData = async () => {
        try {
          const querySnapshot = await getDocs(collection(db, 'posts'));
          postsData.value = querySnapshot.docs.map(doc => ({
            date: doc.id,
            count: doc.data().count,
          }));
  
          postsLabels.value = postsData.value.map(entry => entry.date);
          postsPoints.value = postsData.value.map(entry => entry.count);
        } catch (error) {
          console.error('Error getting posts data:', error);
        }
      };
  
      const getBookingsData = async () => {
        try {
          const querySnapshot = await getDocs(collection(db, 'consultations'));
          bookingsData.value = querySnapshot.docs.map(doc => ({
            date: doc.id,
            count: doc.data().count,
          }));
  
          bookingsLabels.value = bookingsData.value.map(entry => entry.date);
          bookingsPoints.value = bookingsData.value.map(entry => entry.count);
        } catch (error) {
          console.error('Error getting bookings data:', error);
        }
      };
  
      const getFeedbackData = async () => {
        try {
          const querySnapshot = await getDocs(collection(db, 'feedback'));
          feedbackData.value = querySnapshot.docs.map(doc => ({
            date: doc.id,
            count: doc.data().count,
          }));
  
          feedbackLabels.value = feedbackData.value.map(entry => entry.date);
          feedbackPoints.value = feedbackData.value.map(entry => entry.count);
        } catch (error) {
          console.error('Error getting feedback data:', error);
        }
      };
  
      const getHealthTestsData = async () => {
        try {
          const querySnapshot = await getDocs(collection(db, 'healthTestResults'));
          healthTestsData.value = querySnapshot.docs.map(doc => ({
            date: doc.id,
            count: doc.data().count,
          }));
  
          healthTestsLabels.value = healthTestsData.value.map(entry => entry.date);
          healthTestsPoints.value = healthTestsData.value.map(entry => entry.count);
        } catch (error) {
          console.error('Error getting health tests data:', error);
        }
      };
  
      const createChart = (ctx, labels, data, label, type, borderColor, backgroundColor) => {
        new Chart(ctx, {
          type: type,
          data: {
            labels: labels,
            datasets: [{
              label: label,
              data: data,
              borderColor: borderColor,
              backgroundColor: backgroundColor,
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
                  text: 'Count',
                },
                beginAtZero: true,
              }
            }
          }
        });
      };
  
      onMounted(async () => {
        await getTrafficData();
        await getRegistrationData();
        await getPostsData();
        await getBookingsData();
        await getFeedbackData();
        await getHealthTestsData();
  
        createChart(document.getElementById('trafficChart').getContext('2d'), labels.value, dataPoints.value, 'User Login Count', 'line', 'rgba(75, 192, 192, 1)', 'rgba(75, 192, 192, 0.2)');
        createChart(document.getElementById('registrationChart').getContext('2d'), registrationLabels.value, registrationPoints.value, 'User Registration Count', 'bar', 'rgba(54, 162, 235, 1)', 'rgba(54, 162, 235, 0.2)');
        createChart(document.getElementById('postsChart').getContext('2d'), postsLabels.value, postsPoints.value, 'Daily Posts Count', 'bar', 'rgba(255, 99, 132, 1)', 'rgba(255, 99, 132, 0.2)');
        createChart(document.getElementById('bookingsChart').getContext('2d'), bookingsLabels.value, bookingsPoints.value, 'Daily Bookings Count', 'bar', 'rgba(255, 206, 86, 1)', 'rgba(255, 206, 86, 0.2)');
        createChart(document.getElementById('feedbackChart').getContext('2d'), feedbackLabels.value, feedbackPoints.value, 'Daily Feedback Count', 'bar', 'rgba(75, 192, 192, 1)', 'rgba(75, 192, 192, 0.2)');
        createChart(document.getElementById('healthTestsChart').getContext('2d'), healthTestsLabels.value, healthTestsPoints.value, 'Daily Health Tests Count', 'bar', 'rgba(153, 102, 255, 1)', 'rgba(153, 102, 255, 0.2)');
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
    margin-bottom: 30px;
  }
  </style>