<template>
    <div class="admin-dashboard">
      <!-- Month Selector -->
      <div class="month-selector">
        <label for="month-select">Select Month:</label>
        <select id="month-select" v-model="selectedMonth" @change="fetchDataForSelectedMonth">
          <option value="">All Months</option>
          <option v-for="month in months" :key="month" :value="month">{{ month }}</option>
        </select>
      </div>
  
      <div class="chart-container">
        <div class="chart">
          <h2>User Login Statistics</h2>
          <canvas id="loginChart"></canvas>
        </div>
        <div class="chart">
          <h2>User Registration Statistics</h2>
          <canvas id="registrationChart"></canvas>
        </div>
      </div>
  
      <div class="chart-container">
        <div class="chart">
          <h2>Daily Posts Count</h2>
          <canvas id="postsChart"></canvas>
        </div>
        <div class="chart">
          <h2>Daily Bookings Count</h2>
          <canvas id="bookingsChart"></canvas>
        </div>
      </div>
  
      <div class="chart-container">
        <div class="chart">
          <h2>Daily Feedback Count & Average Ratings</h2>
          <canvas id="feedbackChart"></canvas>
        </div>
        <div class="chart">
          <h2>Daily Health Tests Count & Average Score</h2>
          <canvas id="healthTestsChart"></canvas>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { onMounted, ref } from 'vue';
  import { getFirestore, collection, getDocs } from 'firebase/firestore';
  import Chart from 'chart.js/auto';
  import { format } from 'date-fns';
  import 'chartjs-adapter-date-fns';
  
  export default {
    name: 'AdminDashboardTrafficChart',
    setup() {
      const db = getFirestore();
      const selectedMonth = ref('');
      const months = ref([...Array(12).keys()].map(i => format(new Date(2024, i), 'yyyy-MM')));
  
      // Define labels and data points for charts
      const postsLabels = ref([]);
      const postsPoints = ref([]);
      const bookingsLabels = ref([]);
      const bookingsPoints = ref([]);
      const feedbackLabels = ref([]);
      const feedbackPoints = ref([]);
      const feedbackAverageRatings = ref([]);
      const healthTestsLabels = ref([]);
      const healthTestsPoints = ref([]);
      const healthTestsAverageScores = ref([]);
      const loginLabels = ref([]);
      const loginPoints = ref([]);
      const registrationLabels = ref([]);
      const registrationPoints = ref([]);
  
      // Method to get data for selected month
      const fetchDataForSelectedMonth = async () => {
        const isMonthlyView = selectedMonth.value !== '';
        await getPostsData(isMonthlyView, selectedMonth.value);
        await getBookingsData(isMonthlyView, selectedMonth.value);
        await getFeedbackData(isMonthlyView, selectedMonth.value);
        await getHealthTestsData(isMonthlyView, selectedMonth.value);
        await getTrafficData(isMonthlyView, selectedMonth.value);
        await getRegisterTrafficData(isMonthlyView, selectedMonth.value);
        createCharts();
      };
  
      const getDailyCounts = (documents, dateField, isMonthly = false, selectedMonth = '') => {
        const counts = {};
        documents.forEach(doc => {
          const dateValue = doc.data()[dateField];
          const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue.toDate();
          const formattedDate = isMonthly ? format(date, 'yyyy-MM') : format(date, 'yyyy-MM-dd');
          if (isMonthly && selectedMonth && !formattedDate.startsWith(selectedMonth)) {
            return;
          }
          counts[formattedDate] = (counts[formattedDate] || 0) + 1;
        });
        return counts;
      };
  
      const getPostsData = async (isMonthly = false, selectedMonth = '') => {
        try {
          const querySnapshot = await getDocs(collection(db, 'posts'));
          const counts = getDailyCounts(querySnapshot.docs, 'timestamp', isMonthly, selectedMonth);
          postsLabels.value = Object.keys(counts);
          postsPoints.value = Object.values(counts);
        } catch (error) {
          console.error('Error getting posts data:', error);
        }
      };
  
      const getBookingsData = async (isMonthly = false, selectedMonth = '') => {
        try {
          const querySnapshot = await getDocs(collection(db, 'consultations'));
          const counts = getDailyCounts(querySnapshot.docs, 'date', isMonthly, selectedMonth);
          bookingsLabels.value = Object.keys(counts);
          bookingsPoints.value = Object.values(counts);
        } catch (error) {
          console.error('Error getting bookings data:', error);
        }
      };
  
      const getFeedbackData = async (isMonthly = false, selectedMonth = '') => {
        try {
          const querySnapshot = await getDocs(collection(db, 'feedback'));
          const counts = getDailyCounts(querySnapshot.docs, 'timestamp', isMonthly, selectedMonth);
          const ratingsSum = {};
          const ratingsCount = {};
  
          querySnapshot.docs.forEach(doc => {
            const feedback = doc.data();
            const formattedDate = isMonthly ? format(feedback.timestamp.toDate(), 'yyyy-MM') : format(feedback.timestamp.toDate(), 'yyyy-MM-dd');
            if (isMonthly && selectedMonth && !formattedDate.startsWith(selectedMonth)) {
              return;
            }
            counts[formattedDate] = (counts[formattedDate] || 0) + 1;
  
            feedback.ratings.forEach((ratingObj, index) => {
              if (!ratingsSum[index]) {
                ratingsSum[index] = 0;
                ratingsCount[index] = 0;
              }
              ratingsSum[index] += ratingObj.rating;
              ratingsCount[index]++;
            });
          });
  
          feedbackLabels.value = Object.keys(counts);
          feedbackPoints.value = Object.values(counts);
          feedbackAverageRatings.value = Object.keys(ratingsSum).map(index => (ratingsSum[index] / ratingsCount[index]).toFixed(2));
        } catch (error) {
          console.error('Error getting feedback data:', error);
        }
      };
  
      const getHealthTestsData = async (isMonthly = false, selectedMonth = '') => {
        try {
          const querySnapshot = await getDocs(collection(db, 'healthTestResults'));
          const counts = getDailyCounts(querySnapshot.docs, 'date', isMonthly, selectedMonth);
          const scoresSum = {};
          const scoresCount = {};
  
          querySnapshot.docs.forEach(doc => {
            const healthTest = doc.data();
            const formattedDate = isMonthly ? format(healthTest.date.toDate(), 'yyyy-MM') : format(healthTest.date.toDate(), 'yyyy-MM-dd');
            if (isMonthly && selectedMonth && !formattedDate.startsWith(selectedMonth)) {
              return;
            }
            counts[formattedDate] = (counts[formattedDate] || 0) + 1;
  
            if (!scoresSum[formattedDate]) {
              scoresSum[formattedDate] = 0;
              scoresCount[formattedDate] = 0;
            }
            scoresSum[formattedDate] += healthTest.score;
            scoresCount[formattedDate]++;
          });
  
          healthTestsLabels.value = Object.keys(counts);
          healthTestsPoints.value = Object.values(counts);
          healthTestsAverageScores.value = Object.keys(scoresSum).map(date => (scoresSum[date] / scoresCount[date]).toFixed(2));
        } catch (error) {
          console.error('Error getting health tests data:', error);
        }
      };
  
      const getTrafficData = async (isMonthly = false, selectedMonth = '') => {
        try {
          const querySnapshot = await getDocs(collection(db, 'traffic'));
          const loginCounts = {};
  
          querySnapshot.docs.forEach(doc => {
            const traffic = doc.data();
            const formattedDate = format(traffic.date.toDate(), 'yyyy-MM-dd');
            if (isMonthly && selectedMonth && !formattedDate.startsWith(selectedMonth)) {
              return;
            }
            loginCounts[formattedDate] = (loginCounts[formattedDate] || 0) + traffic.views;
          });
  
          loginLabels.value = Object.keys(loginCounts);
          loginPoints.value = Object.values(loginCounts);
        } catch (error) {
          console.error('Error getting login traffic data:', error);
        }
      };
  
      const getRegisterTrafficData = async (isMonthly = false, selectedMonth = '') => {
        try {
          const querySnapshot = await getDocs(collection(db, 'RegisterAmount'));
          const registrationCounts = {};
  
          querySnapshot.docs.forEach(doc => {
            const registration = doc.data();
            const formattedDate = format(registration.date.toDate(), 'yyyy-MM-dd');
            if (isMonthly && selectedMonth && !formattedDate.startsWith(selectedMonth)) {
              return;
            }
            registrationCounts[formattedDate] = (registrationCounts[formattedDate] || 0) + registration.views;
          });
  
          registrationLabels.value = Object.keys(registrationCounts);
          registrationPoints.value = Object.values(registrationCounts);
        } catch (error) {
          console.error('Error getting registration traffic data:', error);
        }
      };
  
      const createCharts = () => {
        createChart(document.getElementById('postsChart').getContext('2d'), postsLabels.value, postsPoints.value, 'Daily Posts Count', 'bar', 'rgba(255, 99, 132, 1)', 'rgba(255, 99, 132, 0.2)');
        createChart(document.getElementById('bookingsChart').getContext('2d'), bookingsLabels.value, bookingsPoints.value, 'Daily Bookings Count', 'bar', 'rgba(255, 206, 86, 1)', 'rgba(255, 206, 86, 0.2)');
        createChart(document.getElementById('feedbackChart').getContext('2d'), feedbackLabels.value, feedbackPoints.value, 'Daily Feedback Count', 'bar', 'rgba(75, 192, 192, 1)', 'rgba(75, 192, 192, 0.2)');
        createChart(document.getElementById('healthTestsChart').getContext('2d'), healthTestsLabels.value, healthTestsPoints.value, 'Daily Health Tests Count', 'bar', 'rgba(153, 102, 255, 1)', 'rgba(153, 102, 255, 0.2)');
        createChart(document.getElementById('loginChart').getContext('2d'), loginLabels.value, loginPoints.value, 'Daily Login Count', 'line', 'rgba(54, 162, 235, 1)', 'rgba(54, 162, 235, 0.2)');
        createChart(document.getElementById('registrationChart').getContext('2d'), registrationLabels.value, registrationPoints.value, 'Daily Registration Count', 'line', 'rgba(255, 159, 64, 1)', 'rgba(255, 159, 64, 0.2)');
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
                type: 'time',
                time: {
                  unit: labels.length > 0 && labels[0].length > 7 ? 'month' : 'day'
                },
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
  
      onMounted(fetchDataForSelectedMonth);
  
      return {
        selectedMonth,
        months,
        fetchDataForSelectedMonth,
      };
    }
  };
  </script>
  
  <style scoped>
  .admin-dashboard {
    padding: 20px;
  }
  
  .month-selector {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 20px;
  }
  
  #month-select {
    padding: 5px;
    font-size: 16px;
  }
  
  .chart-container {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    margin-bottom: 40px;
  }
  
  .chart {
    flex: 1;
    min-width: 45%;
    margin: 20px;
  }
  </style>