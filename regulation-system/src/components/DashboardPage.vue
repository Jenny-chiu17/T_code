<template>
  <div class="container">
    <h1 class="page-title">🏠 首頁</h1>

    <!-- 統計卡片 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-number">{{ stats.pending }}</div>
        <div class="stat-label">待審閱項目</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ stats.completed }}</div>
        <div class="stat-label">已完成項目</div>
      </div>
    </div>

    <!-- 快速操作 -->
    <div class="card">
      <h3>⚡ 快速操作</h3>
      <div style="display: flex; gap: 12px; margin-top: 16px;">
        <button class="btn btn-primary" @click="$emit('navigate', 1)">
          ➕ 新增分析
        </button>
        <button class="btn btn-secondary">
          📁 查看全部歷史記錄
        </button>
      </div>
    </div>

    <!-- 最近項目 -->
    <div class="card">
      <h3 style="margin-bottom: 20px;">📋 最近的分析項目</h3>
      
      <h4 style="color: #ef4444; margin-bottom: 12px;">🔴 待審閱</h4>
      <div 
        v-for="item in pendingItems" 
        :key="item.id"
        class="history-item"
      >
        <div style="display: flex; justify-content: space-between; align-items: start;">
          <div>
            <div style="font-weight: 600; margin-bottom: 8px;">
              {{ item.name }}
            </div>
            <div style="font-size: 14px; color: #64748b;">
              {{ item.date }} | {{ item.info }}
            </div>
          </div>
          <button class="btn btn-primary" @click="$emit('navigate', 2)">
            繼續審閱
          </button>
        </div>
      </div>

      <h4 style="color: #10b981; margin: 24px 0 12px 0;">🟢 已完成</h4>
      <div 
        v-for="item in completedItems" 
        :key="item.id"
        class="history-item"
      >
        <div style="display: flex; justify-content: space-between; align-items: start;">
          <div>
            <div style="font-weight: 600; margin-bottom: 8px;">
              {{ item.name }}
            </div>
            <div style="font-size: 14px; color: #64748b;">
              {{ item.date }} | {{ item.info }}
            </div>
          </div>
          <button class="btn btn-secondary">查看結果</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

defineEmits(['navigate'])

const stats = ref({
  pending: 5,
  completed: 3
})

const pendingItems = ref([
  {
    id: 1,
    name: '📄 XXXXX 法規',
    date: '2024/10/10 14:30',
    info: '12 份內規 | 進度：3/12 審閱中'
  }
])

const completedItems = ref([
  {
    id: 2,
    name: '📄 XXXXX 條文',
    date: '2024/10/05 16:20',
    info: '15 份內規 | 全部已審閱'
  }
])

// 🔌 載入儀表板資料
onMounted(async () => {
  // TODO: 從後端 API 載入資料
  // const response = await fetch('/api/dashboard/stats')
  // stats.value = await response.json()
})
</script>