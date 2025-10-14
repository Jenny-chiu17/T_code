<template>
  <div class="app">
    <!-- 導航欄 -->
    <nav class="navbar">
      <div class="logo">🏢 內外規比對系統</div>
      <div class="user-menu">
        <span>👤 {{ username }}</span>
        <button class="btn btn-secondary" @click="logout">登出</button>
      </div>
    </nav>

    <!-- 頁籤切換 -->
    <div class="page-switcher">
      <button 
        v-for="(page, index) in pages" 
        :key="index"
        class="page-tab"
        :class="{ active: currentPage === index }"
        @click="currentPage = index"
      >
        {{ page.icon }} {{ page.name }}
      </button>
    </div>

    <!-- 頁面內容 -->
    <div class="page-content">
      <!-- 頁面 1: 首頁 -->
      <DashboardPage v-if="currentPage === 0" @navigate="navigateTo" />
      
      <!-- 頁面 2: 新增分析 -->
      <AnalysisPage v-if="currentPage === 1" @navigate="navigateTo" />
      
      <!-- 頁面 3: 審閱修改 -->
      <ReviewPage v-if="currentPage === 2" @navigate="navigateTo" />
    </div>

    <!-- 底部版權資訊 -->
    <footer class="footer">
      <div class="footer-content">
        <div class="footer-section">
          <p>© 2025 內外規比對系統. All rights reserved.</p>
        </div>
        <div class="footer-section">
          <p>資料來源：內部規章資料庫</p>
        </div>
        <div class="footer-section">
          <p>Powered by AI 智能比對引擎</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import DashboardPage from './components/DashboardPage.vue'
import AnalysisPage from './components/AnalysisPage.vue'
import ReviewPage from './components/ReviewPage.vue'

const username = ref('使用者')
const currentPage = ref(0)

const pages = [
  { name: '首頁', icon: '🏠' },
  { name: '新增分析', icon: '📤' },
  { name: '審閱修改', icon: '📋' }
]

const navigateTo = (pageIndex) => {
  currentPage.value = pageIndex
}

// 🔌 後端串接：登出
const logout = async () => {
  // TODO: 呼叫後端 API
  // await fetch('/api/auth/logout', { method: 'POST' })
  alert('🔌 需要串接後端 API: POST /api/auth/logout')
}
</script>