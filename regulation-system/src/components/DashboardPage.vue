<template>
  <div class="container">
    <h1 class="page-title">🏠 首頁</h1>

    <!-- 統計卡片 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-number">{{ store.pendingCount }}</div>
        <div class="stat-label">待審閱項目</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ store.completedCount }}</div>
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
      
      <!-- 待審閱 -->
      <h4 style="color: #ef4444; margin-bottom: 12px;">🔴 待審閱</h4>
      <div 
        v-for="item in store.pendingAnalyses" 
        :key="item.id"
        class="history-item"
      >
        <div style="display: flex; justify-content: space-between; align-items: start;">
          <div>
            <div style="font-weight: 600; margin-bottom: 8px;">
              {{ item.name }}
            </div>
            <div style="font-size: 14px; color: #64748b;">
              {{ item.date}} | 
              {{ item.externalRegulations?.length || 0 }} 份差異表 | 
              {{ item.totalPolicies }} 份內規 | 
              進度：{{ item.reviewedPolicies }}/{{ item.totalPolicies }} 審閱中
            </div>
          </div>
          <button class="btn btn-primary" @click="goToReview(item.id)">
            繼續審閱
          </button>
        </div>
      </div>

      <div v-if="store.pendingAnalyses.length === 0" style="text-align: center; color: #94a3b8; padding: 20px;">
        目前沒有待審閱項目
      </div>

      <!-- 已完成 -->
      <h4 style="color: #10b981; margin: 24px 0 12px 0;">🟢 已完成</h4>
      <div 
        v-for="item in store.completedAnalyses" 
        :key="item.id"
        class="history-item"
      >
        <div style="display: flex; justify-content: space-between; align-items: start;">
          <div>
            <div style="font-weight: 600; margin-bottom: 8px;">
              {{ item.name }}
            </div>
            <div style="font-size: 14px; color: #64748b;">
              {{ item.date }} | 
              {{ item.externalRegulations?.length || 0 }} 份差異表 | 
              {{ item.totalPolicies }} 份內規 | 
              全部已審閱
            </div>
          </div>
          <button class="btn btn-secondary" @click="viewResult(item.id)">查看結果</button>
        </div>
      </div>

      <div v-if="store.completedAnalyses.length === 0" style="text-align: center; color: #94a3b8; padding: 20px;">
        目前沒有已完成項目
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAnalysisStore } from '@/stores/analysisStore'

const emit = defineEmits(['navigate'])
const store = useAnalysisStore()

// 跳轉到審閱頁面
const goToReview = (id) => {
  store.setCurrentAnalysis(id)
  emit('navigate', 2)
}

// 查看結果
const viewResult = (id) => {
  store.setCurrentAnalysis(id)
  emit('navigate', 2)
}

// 載入資料
onMounted(async () => {
  await store.fetchAnalyses()
})
</script>
