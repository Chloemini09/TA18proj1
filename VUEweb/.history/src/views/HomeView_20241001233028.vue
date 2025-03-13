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
          <router-link to="/healthtest">TEST</router-link>
          <router-link to="/testHistory">TEST HISTORY</router-link>
          <router-link to="/averageScore">SCORES AND ADVICE</router-link>
          <router-link to="/dairy">DAIRY</router-link>
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
/* 修改导航栏的整体布局为 flex */
.home-nav {
  display: flex;
  justify-content: space-around;
  padding: 1rem 0;
  background-color: #f8f8f8;
  border-bottom: 2px solid #e0e0e0;
}

.nav-item, .dropbtn {
  text-decoration: none;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  color: #333;
  white-space: nowrap;
  flex: 1; /* 确保每个导航项占据同样的空间 */
  text-align: center; /* 使文字居中 */
}

.nav-item.active,
.nav-item:hover {
  background-color: #4caf50;
  color: white;
}

/* Dairy下拉菜单 */
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
  white-space: nowrap;
}

.dropdown:hover .dropdown-content {
  display: block;
}

/* 下拉菜单中的每一项 */
.dropdown-content a {
  color: black;
  padding: 12px 16px;
  text-decoration: none;
  display: block;
  text-align: left;
  background-color: #ffffff;
}

.dropdown-content a:nth-child(odd) {
  background-color: #4caf50;
  color: white;
}

.dropdown-content a:nth-child(even) {
  background-color: #ffffff;
  color: black;
}

.dropdown-content a:hover {
  background-color: #ddd;
}

</style>
