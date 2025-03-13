<template>
  <div class="dairy-container">
    <!-- 固定格式的头部 -->
    <header class="header">
      <img src="@/assets/logo.png" alt="Health Test Logo" class="logo" />
      <div class="header-text">
        <h1>心理日记</h1>
        <p>{{ currentDate }}</p>
      </div>
    </header>

    <!-- 下拉菜单 -->
    <div class="dropdown">
      <button @click="toggleDropdown" class="dropdown-btn">
        选择功能
      </button>
      <div v-if="showDropdown" class="dropdown-content">
        <button @click="goToPage('healthtest')">心理测试</button>
        <button @click="goToPage('testHistory')">查看心理测试记录</button>
        <button @click="goToPage('averageScore')">心理评分和建议</button>
        <button @click="goToPage('newDiary')">新建日记</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const showDropdown = ref(false)
const currentDate = new Date().toLocaleDateString()

// 切换下拉菜单显示/隐藏
const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

// 根据选择的功能跳转到不同的页面
const goToPage = (page) => {
  router.push(`/${page}`)
  showDropdown.value = false // 选择后隐藏下拉菜单
}
</script>

<style scoped>
.dairy-container {
  max-width: 800px;
  margin: auto;
  padding: 20px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid #ddd;
}

.logo {
  width: 60px;
  height: auto;
}

.header-text {
  flex-grow: 1;
  text-align: right;
}

/* 下拉菜单样式 */
.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-btn {
  background-color: #4CAF50;
  color: white;
  padding: 10px 20px;
  border: none;
  cursor: pointer;
  font-size: 16px;
  border-radius: 5px;
}

.dropdown-btn:hover {
  background-color: #45a049;
}

.dropdown-content {
  display: block;
  position: absolute;
  background-color: #f9f9f9;
  min-width: 160px;
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
  z-index: 1;
}

.dropdown-content button {
  background-color: white;
  color: black;
  padding: 12px 16px;
  text-align: left;
  border: none;
  width: 100%;
  cursor: pointer;
}

.dropdown-content button:hover {
  background-color: #ddd;
}
</style>
