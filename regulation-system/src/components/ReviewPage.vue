<template>
  <div class="container">
    <a href="#" class="back-btn" @click.prevent="$emit('navigate', 0)">
      ← 返回首頁
    </a>

    <div v-if="currentAnalysis" style="margin-bottom: 24px;">
      <h1 style="margin-bottom: 8px;">📋 審閱與修改 #{{ currentAnalysis.id }}</h1>
      <p style="color: #64748b;">
        📦 批次分析：{{ currentAnalysis.externalRegulations.length }} 份外規 | 
        ⏰ 分析時間：{{ currentAnalysis.date }}
      </p>
    </div>

    <div v-else style="text-align: center; padding: 40px;">
      <p style="color: #64748b;">未選擇分析項目</p>
      <button class="btn btn-primary" @click="$emit('navigate', 0)">
        返回首頁
      </button>
    </div>

    <template v-if="currentAnalysis">
      <!-- 整體統計 -->
      <div class="card" style="margin-bottom: 24px;">
        <h3 style="margin-bottom: 16px;">📊 整體影響統計</h3>
        <div class="impact-stats">
          <div class="impact-item">
            <div style="font-size: 24px;">🔴</div>
            <div class="impact-number impact-high">{{ overallStats.high }}</div>
            <div class="impact-label">高度相關</div>
          </div>
          <div class="impact-item">
            <div style="font-size: 24px;">🟡</div>
            <div class="impact-number impact-medium">{{ overallStats.medium }}</div>
            <div class="impact-label">中度相關</div>
          </div>
          <div class="impact-item">
            <div style="font-size: 24px;">🟢</div>
            <div class="impact-number impact-low">{{ overallStats.low }}</div>
            <div class="impact-label">低度相關</div>
          </div>
          <div class="impact-item">
            <div style="font-size: 24px;">📊</div>
            <div class="impact-number impact-total">{{ currentAnalysis.totalPolicies }}</div>
            <div class="impact-label">總計</div>
          </div>
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

      <!-- 按外規文件分組顯示 -->
      <div v-if="currentAnalysis.externalRegulations.length > 0">
        <div 
          v-for="extReg in currentAnalysis.externalRegulations"
          :key="extReg.id"
          class="card"
          style="margin-bottom: 24px;"
        >
          <!-- 外規標題 -->
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 20px;">
            <div>
              <h2 style="margin-bottom: 8px;">{{ extReg.name }}</h2>
              <p style="color: #64748b; font-size: 14px;">
                檔案：{{ extReg.fileName }} | 
                影響 {{ extReg.policies.length }} 份內規
              </p>
            </div>
          </div>

          <!-- 該外規的影響統計 -->
          <div class="impact-stats" style="margin-bottom: 24px;">
            <div class="impact-item">
              <div style="font-size: 20px;">🔴</div>
              <div class="impact-number impact-high" style="font-size: 20px;">
                {{ getRegulationStats(extReg).high }}
              </div>
              <div class="impact-label" style="font-size: 12px;">高度相關</div>
            </div>
            <div class="impact-item">
              <div style="font-size: 20px;">🟡</div>
              <div class="impact-number impact-medium" style="font-size: 20px;">
                {{ getRegulationStats(extReg).medium }}
              </div>
              <div class="impact-label" style="font-size: 12px;">中度相關</div>
            </div>
            <div class="impact-item">
              <div style="font-size: 20px;">🟢</div>
              <div class="impact-number impact-low" style="font-size: 20px;">
                {{ getRegulationStats(extReg).low }}
              </div>
              <div class="impact-label" style="font-size: 12px;">低度相關</div>
            </div>
            <div class="impact-item">
              <div style="font-size: 20px;">📊</div>
              <div class="impact-number impact-total" style="font-size: 20px;">
                {{ extReg.policies.length }}
              </div>
              <div class="impact-label" style="font-size: 12px;">總計</div>
            </div>
          </div>

          <!-- 該外規的內規列表 -->
          <div v-if="getFilteredPolicies(extReg).length > 0">
            <div class="group-header">
              <span>📋</span>
              <span>受影響的內規列表 ({{ getFilteredPolicies(extReg).length }})</span>
            </div>

            <PolicyAccordion 
              v-for="policy in getFilteredPolicies(extReg)"
              :key="policy.id"
              :policy="policy"
              @update-modification="handleUpdateModification"
            />
          </div>

          <div v-else style="text-align: center; color: #94a3b8; padding: 20px;">
            沒有找到相關內規
          </div>
        </div>
      </div>

      <div v-else style="text-align: center; color: #94a3b8; padding: 40px;">
        此分析項目沒有外規資料
      </div>

      <!-- 底部下載區 -->
      <div class="final-download">
        <div class="download-info">
          <div class="download-title">🎉 審閱進度：{{ reviewProgress }}</div>
          <div class="download-desc">完成所有審閱後，可下載包含修改的內規文件</div>
        </div>
        <button 
          class="btn btn-primary btn-lg"
          @click="downloadCompleted"
          :disabled="currentAnalysis.reviewedPolicies === 0"
        >
          📥 下載所有已完成的內規
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAnalysisStore } from '@/stores/analysisStore'
import PolicyAccordion from './PolicyAccordion.vue'

defineEmits(['navigate'])
const store = useAnalysisStore()

const searchQuery = ref('')

// 當前審閱的分析項目
const currentAnalysis = computed(() => store.currentAnalysis)

// 審閱進度
const reviewProgress = computed(() => {
  if (!currentAnalysis.value) return '0/0'
  return `${currentAnalysis.value.reviewedPolicies}/${currentAnalysis.value.totalPolicies} 已完成`
})

// 整體統計（所有外規的統計總和）
const overallStats = computed(() => {
  if (!currentAnalysis.value) return { high: 0, medium: 0, low: 0 }
  
  let high = 0, medium = 0, low = 0
  
  currentAnalysis.value.externalRegulations.forEach(extReg => {
    extReg.policies.forEach(policy => {
      if (policy.similarity >= 80) high++
      else if (policy.similarity >= 50) medium++
      else low++
    })
  })
  
  return { high, medium, low }
})

// 取得特定外規的統計
const getRegulationStats = (extReg) => {
  let high = 0, medium = 0, low = 0
  
  extReg.policies.forEach(policy => {
    if (policy.similarity >= 80) high++
    else if (policy.similarity >= 50) medium++
    else low++
  })
  
  return { high, medium, low }
}

// 取得特定外規的篩選後內規列表
const getFilteredPolicies = (extReg) => {
  if (!searchQuery.value) return extReg.policies

  const query = searchQuery.value.toLowerCase()
  return extReg.policies.filter(policy =>
    policy.name.toLowerCase().includes(query)
  )
}

// 處理修改建議狀態更新
const handleUpdateModification = ({ policyId, modificationId, status }) => {
  if (!currentAnalysis.value) return
  
  store.updateModificationStatus(
    currentAnalysis.value.id,
    policyId,
    modificationId,
    status
  )
}

// 🔌 下載已完成內規
const downloadCompleted = () => {
  // TODO: 呼叫後端 API
  alert(`🔌 需要串接：GET /api/download/${currentAnalysis.value.id}/completed`)
}
</script>
