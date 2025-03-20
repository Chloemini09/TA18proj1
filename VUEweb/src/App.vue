<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import BHeader from './components/BHeader.vue';
import BFooter from './components/BFooter.vue';

const route = useRoute();

// 计算属性控制头部和底部的显示
const showHeader = computed(() => route.name !== 'CountBookAPI');
const showFooter = computed(() => route.name !== 'CountBookAPI');
</script>

<template>
  <div class="app-container">
    <BHeader v-if="showHeader" />
    
    <main class="main-content">
      <router-view></router-view>
    </main>
    
    <BFooter v-if="showFooter" />
  </div>
</template>

<style>
/* 全局样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Roboto', Arial, sans-serif;
  color: #333;
  line-height: 1.6;
}

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
}

a {
  text-decoration: none;
  color: inherit;
}

img {
  max-width: 100%;
}
</style>