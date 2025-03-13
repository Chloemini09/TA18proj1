<template>
  <div class="home-container">
    <header class="home-header">
      <div class="header-left">
        <h1>Hi, {{ username }}</h1>
        <p class="tagline">Mending Minds, Healing Hearts</p>
      </div>
      <div class="header-right">
        <p class="date">{{ currentDate }}</p>
        <button @click="logout" class="btn-logout">Logout</button>
      </div>
    </header>

    <nav class="home-nav">
      <router-link to="/home" class="nav-item active">Home</router-link>
      <router-link to="/course" class="nav-item">Courses</router-link>
      
      <!-- Dairy dropdown with hover effect -->
      <div class="dropdown">
        <a href="#" class="nav-item dropbtn">Dairy</a>
        <div class="dropdown-content">
          <router-link to="/healthtest">心理测试</router-link>
          <router-link to="/testHistory">查看心理测试记录</router-link>
          <router-link to="/averageScore">心理评分和建议</router-link>
          <router-link to="/newDiary">新建日记</router-link>
        </div>
      </div>

      <router-link to="/community" class="nav-item">Community</router-link>
      <router-link to="/clinic" class="nav-item">Clinic</router-link>
      <router-link to="/counselling" class="nav-item">Counselling</router-link>
      <router-link to="/my" class="nav-item">My</router-link>
    </nav>

    <section class="content-section">
      <div class="main-banner">
        <h2>Step-by-Step Guide to Accessing a Mental Health Care Plan</h2>
      </div>
      <div class="help-section">
        <h2>Do you need help?</h2>
        <p>Click here to start your test</p>
        <button @click="goToHealthtest" class="btn-start">Start</button>
      </div>
    </section>

    <footer class="home-footer">
      <p>Our working time from 9:00 to 18:00 everyday</p>
      <p>Call at +61 430030118 if you need help</p>
      <div class="rate-us-container">
        <button @click="goToEvaluate" class="btn-rate">Evaluate Us</button>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

// 初始化状态
const router = useRouter();
const auth = getAuth();
const db = getFirestore();
const username = ref('User'); // 默认值为 "User"
const currentDate = ref('');

// 格式化日期
function formatDate(date) {
  const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

// 登出逻辑
function logout() {
  auth.signOut().then(() => {
    router.push('/');
  }).catch((error) => {
    console.error("Error during logout:", error);
  });
}

// 跳转到评价页面
function goToEvaluate() {
  router.push('/evaluate');
}

function goToHealthtest()
{
  router.push('/healthtest');
}

// 获取当前用户信息
onMounted(async () => {
  const today = new Date();
  currentDate.value = formatDate(today);

  const currentUser = auth.currentUser;
  if (currentUser) {
    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
    if (userDoc.exists()) {
      username.value = userDoc.data().username; // 从 Firestore 获取用户名
    } else {
      console.log("No such user document!");
    }
  } else {
    console.log("No user is logged in.");
    router.push('/login'); // 如果没有用户登录，重定向到登录页面
  }
});
</script>

<style scoped>
.home-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 1rem 2rem;
  background-color: #ffffff;
}

.home-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e0e0e0;
}

.header-left {
  display: flex;
  flex-direction: column;
}

.header-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.home-header h1 {
  font-size: 2rem;
  color: #333;
}

.tagline {
  margin: 0;
  font-style: italic;
  color: #666;
  font-size: 1.1rem;
}

.date {
  font-size: 1.2rem;
  color: #4caf50;
  margin-bottom: 0.5rem;
}

.btn-logout {
  background-color: #d9534f;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
}

.home-nav {
  display: flex;
  justify-content: space-around;
  padding: 1rem 0;
  background-color: #f8f8f8;
  border-bottom: 2px solid #e0e0e0;
}

.nav-item {
  text-decoration: none;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  color: #333;
}

.nav-item.active,
.nav-item:hover {
  background-color: #4caf50;
  color: white;
}

/* Dairy下拉菜单样式 */
.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-content {
  display: none;
  position: absolute;
  background-color: #f9f9f9;
  min-width: 160px;
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
  z-index: 1;
}

.dropdown-content a {
  color: black;
  padding: 12px 16px;
  text-decoration: none;
  display: block;
}

.dropdown-content a:hover {
  background-color: #ddd;
}

.dropdown:hover .dropdown-content {
  display: block;
}

.content-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 0;
}

.main-banner {
  flex-grow: 2;
  margin-right: 2rem;
  background: url('@/assets/banner.png') center/cover no-repeat;
  height: 400px; 
  color: #fff;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.main-banner h2 {
  font-size: 2rem;  
  line-height: 1.4;  
  margin: 0;  
  background-color: rgba(0, 0, 0, 0.5); 
  padding: 10px;
  border-radius: 5px;
}

.help-section {
  flex-grow: 1;
  text-align: center;
}

.help-section h2 {
  font-size: 1.8rem;
  margin-bottom: 1rem;
}

.help-section p {
  margin-bottom: 1rem;
}

.btn-start {
  background-color: #4caf50;
  color: white;
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
}

.home-footer {
  text-align: center;
  padding-top: 1rem;
  border-top: 2px solid #e0e0e0;
  font-size: 0.9rem;
  color: #999;
  margin-top: auto;
}

.rate-us-container {
  margin-top: 2rem;
}
.btn-rate {
  background-color: #4caf50;
  color: white;
  padding: 1rem 2rem;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 1.5rem;
}

.btn-rate:hover {
  background-color: #388e3c;
}
</style>
