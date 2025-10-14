<template>
  <div class="container">
    <a href="#" class="back-btn" @click.prevent="$emit('navigate', 0)">
      ← 返回首頁
    </a>

    <div v-if="currentAnalysis" style="margin-bottom: 24px;">
      <h1 style="margin-bottom: 8px;">📋 審閱與修改 #{{ currentAnalysis.id }}</h1>
      <p style="color: #64748b;">
        📦 批次分析：{{ currentAnalysis.externalRegulations.length }} 份差異表 | 
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
            <div class="impact-label">高度相關 (≥80%)</div>
          </div>
          <div class="impact-item">
            <div style="font-size: 24px;">🟡</div>
            <div class="impact-number impact-medium">{{ overallStats.medium }}</div>
            <div class="impact-label">中度相關 (50-79%)</div>
          </div>
          <div class="impact-item">
            <div style="font-size: 24px;">🟢</div>
            <div class="impact-number impact-low">{{ overallStats.low }}</div>
            <div class="impact-label">低度相關 (<50%)</div>
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

      <!-- 第一層：按相似度分類 -->
      
      <!-- 🔴 高度相關 -->
      <div v-if="highSimilarityPolicies.length > 0" class="card" style="margin-bottom: 24px;">
        <div 
          class="similarity-header" 
          style="background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); padding: 20px; border-radius: 12px; margin-bottom: 20px; cursor: pointer;"
          @click="toggleSection('high')"
        >
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="font-size: 32px;">🔴</span>
              <div>
                <h2 style="margin: 0; color: #991b1b;">高度相關 (相似度 ≥80%)</h2>
                <p style="margin: 4px 0 0 0; color: #dc2626; font-size: 14px;">
                  需優先處理 • {{ highSimilarityPolicies.length }} 份內規 • {{ getModificationCount(highSimilarityPolicies) }} 項修改建議
                </p>
              </div>
            </div>
            <span style="font-size: 24px; color: #991b1b;">{{ expandedSections.high ? '▼' : '▶' }}</span>
          </div>
        </div>

        <!-- 第二層：內規列表 -->
        <div v-show="expandedSections.high">
          <PolicyAccordion 
            v-for="policy in highSimilarityPolicies"
            :key="policy.id"
            :policy="policy"
            @update-modification="handleUpdateModification"
          />
        </div>
      </div>

      <!-- 🟡 中度相關 -->
      <div v-if="mediumSimilarityPolicies.length > 0" class="card" style="margin-bottom: 24px;">
        <div 
          class="similarity-header" 
          style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 20px; border-radius: 12px; margin-bottom: 20px; cursor: pointer;"
          @click="toggleSection('medium')"
        >
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="font-size: 32px;">🟡</span>
              <div>
                <h2 style="margin: 0; color: #92400e;">中度相關 (相似度 50-79%)</h2>
                <p style="margin: 4px 0 0 0; color: #d97706; font-size: 14px;">
                  建議處理 • {{ mediumSimilarityPolicies.length }} 份內規 • {{ getModificationCount(mediumSimilarityPolicies) }} 項修改建議
                </p>
              </div>
            </div>
            <span style="font-size: 24px; color: #92400e;">{{ expandedSections.medium ? '▼' : '▶' }}</span>
          </div>
        </div>

        <!-- 第二層：內規列表 -->
        <div v-show="expandedSections.medium">
          <PolicyAccordion 
            v-for="policy in mediumSimilarityPolicies"
            :key="policy.id"
            :policy="policy"
            @update-modification="handleUpdateModification"
          />
        </div>
      </div>

      <!-- 🟢 低度相關 -->
      <div v-if="lowSimilarityPolicies.length > 0" class="card" style="margin-bottom: 24px;">
        <div 
          class="similarity-header" 
          style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); padding: 20px; border-radius: 12px; margin-bottom: 20px; cursor: pointer;"
          @click="toggleSection('low')"
        >
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="font-size: 32px;">🟢</span>
              <div>
                <h2 style="margin: 0; color: #065f46;">低度相關 (相似度 <50%)</h2>
                <p style="margin: 4px 0 0 0; color: #059669; font-size: 14px;">
                  參考即可 • {{ lowSimilarityPolicies.length }} 份內規 • {{ getModificationCount(lowSimilarityPolicies) }} 項修改建議
                </p>
              </div>
            </div>
            <span style="font-size: 24px; color: #065f46;">{{ expandedSections.low ? '▼' : '▶' }}</span>
          </div>
        </div>

        <!-- 第二層：內規列表 -->
        <div v-show="expandedSections.low">
          <PolicyAccordion 
            v-for="policy in lowSimilarityPolicies"
            :key="policy.id"
            :policy="policy"
            @update-modification="handleUpdateModification"
          />
        </div>
      </div>

      <!-- 沒有內規 -->
      <div v-if="allPolicies.length === 0" style="text-align: center; color: #94a3b8; padding: 40px;">
        沒有找到相關內規
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
const expandedSections = ref({
  high: true,    // 高度相關預設展開
  medium: false,
  low: false
})

// 當前審閱的分析項目
const currentAnalysis = computed(() => store.currentAnalysis)

// 審閱進度
const reviewProgress = computed(() => {
  if (!currentAnalysis.value) return '0/0'
  return `${currentAnalysis.value.reviewedPolicies}/${currentAnalysis.value.totalPolicies} 已完成`
})

// 取得所有內規（展平）
const allPolicies = computed(() => {
  if (!currentAnalysis.value) return []
  const policies = []
  currentAnalysis.value.externalRegulations.forEach(extReg => {
    policies.push(...extReg.policies)
  })
  return policies
})

// 篩選後的內規
const filteredPolicies = computed(() => {
  if (!searchQuery.value) return allPolicies.value

  const query = searchQuery.value.toLowerCase()
  return allPolicies.value.filter(policy =>
    policy.name.toLowerCase().includes(query)
  )
})

// 🔴 高度相關的內規 (≥80%)
const highSimilarityPolicies = computed(() => {
  return filteredPolicies.value.filter(p => p.similarity >= 80)
})

// 🟡 中度相關的內規 (50-79%)
const mediumSimilarityPolicies = computed(() => {
  return filteredPolicies.value.filter(p => p.similarity >= 50 && p.similarity < 80)
})

// 🟢 低度相關的內規 (<50%)
const lowSimilarityPolicies = computed(() => {
  return filteredPolicies.value.filter(p => p.similarity < 50)
})

// 整體統計
const overallStats = computed(() => {
  return {
    high: highSimilarityPolicies.value.length,
    medium: mediumSimilarityPolicies.value.length,
    low: lowSimilarityPolicies.value.length
  }
})

// 計算修改建議總數
const getModificationCount = (policies) => {
  return policies.reduce((sum, policy) => sum + policy.modificationsCount, 0)
}

// 切換區段展開/收合
const toggleSection = (section) => {
  expandedSections.value[section] = !expandedSections.value[section]
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

<style scoped>
.similarity-header {
  transition: all 0.3s ease;
}

.similarity-header:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>
