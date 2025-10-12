<template>
  <div class="container">
    <a href="#" class="back-btn" @click.prevent="$emit('navigate', 0)">
      ← 返回首頁
    </a>

    <div style="margin-bottom: 24px;">
      <h1 style="margin-bottom: 8px;">📋 審閱與修改 #20241010-001</h1>
      <p style="color: #64748b;">
        📄 外規：XXXXX 法規 | 
        ⏰ 分析時間：2024/10/10 14:30
      </p>
    </div>

    <!-- 影響統計 -->
    <div class="impact-stats">
      <div class="impact-item">
        <div style="font-size: 24px;">🔴</div>
        <div class="impact-number impact-high">3</div>
        <div class="impact-label">高度相關</div>
      </div>
      <div class="impact-item">
        <div style="font-size: 24px;">🟡</div>
        <div class="impact-number impact-medium">7</div>
        <div class="impact-label">中度相關</div>
      </div>
      <div class="impact-item">
        <div style="font-size: 24px;">🟢</div>
        <div class="impact-number impact-low">2</div>
        <div class="impact-label">低度相關</div>
      </div>
      <div class="impact-item">
        <div style="font-size: 24px;">📊</div>
        <div class="impact-number impact-total">12</div>
        <div class="impact-label">總計</div>
      </div>
    </div>

    <!-- 搜尋 -->
    <div class="filter-bar">
      <input 
        v-model="searchQuery"
        type="text" 
        class="search-input" 
        placeholder="🔍 搜尋內規名稱..."
      >
    </div>

    <!-- 內規列表 -->
    <div class="group-header">
      <span>🔴</span>
      <span>高度相關 (3)</span>
    </div>

    <PolicyAccordion 
      v-for="policy in policies"
      :key="policy.id"
      :policy="policy"
    />

    <!-- 底部下載區 -->
    <div class="final-download">
      <div class="download-info">
        <div class="download-title">🎉 審閱進度：{{ reviewProgress }}</div>
        <div class="download-desc">完成所有審閱後，可下載包含修改的內規文件</div>
      </div>
      <button 
        class="btn btn-primary btn-lg"
        @click="downloadCompleted"
      >
        📥 下載所有已完成的內規
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import PolicyAccordion from './PolicyAccordion.vue'

defineEmits(['navigate'])

const searchQuery = ref('')
const reviewProgress = computed(() => '2/12 已完成')

const policies = ref([
  {
    id: 1,
    name: '內部 XXXXX 辦法',
    similarity: 95,
    modificationsCount: 5,
    reviewedCount: 0,
    modifications: [
      {
        id: 'MOD-001',
        number: '1/5',
        article: '第 3 條第 2 款',
        original: '原始的條文內容',
        suggested: '建議修改後的內容',
        reason: '修改原因',
        status: 'pending'
      }
    ]
  }
])

// 🔌 下載已完成內規
const downloadCompleted = () => {
  // TODO: 呼叫後端 API
  // window.location.href = '/api/download/20241010-001/completed'
  alert('🔌 需要串接：GET /api/download/20241010-001/completed')
}
</script>