<template>
  <div class="container">
    <a href="#" class="back-btn" @click.prevent="emit('navigate', 0)">
      ← 返回首頁
    </a>
    <h1 class="page-title">📤 新增分析</h1>

    <!-- 上傳區域 -->
    <div v-if="!isAnalyzing" class="card">
      <div 
        class="upload-zone"
        @click="$refs.fileInput.click()"
        @dragover.prevent
        @drop.prevent="handleDrop"
      >
        <div style="font-size: 48px; margin-bottom: 16px;">📊</div>
        <h3>上傳差異比較表</h3>
        <p style="color: #64748b; margin: 8px 0;">或點擊選擇檔案（可多選）</p>
        <p style="color: #94a3b8; font-size: 14px;">
          支援 PDF, DOCX, XLSX, CSV | 每個檔案大小限制: 10MB
        </p>
        <p style="color: #2563eb; font-size: 13px; margin-top: 8px;">
          💡 系統將自動讀取內規與外規資料進行比對分析
        </p>
      </div>

      <input 
        ref="fileInput"
        type="file" 
        multiple
        style="display: none;"
        accept=".pdf,.docx,.xlsx,.csv"
        @change="handleFileSelect"
      >

      <div v-if="selectedFiles.length > 0" style="margin-top: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <h3 style="margin: 0;">已選擇 {{ selectedFiles.length }} 個差異比較表</h3>
          <button class="btn btn-secondary" @click="clearAllFiles">清除全部</button>
        </div>
        
        <div 
          v-for="(file, index) in selectedFiles" 
          :key="index"
          style="margin-bottom: 12px; padding: 16px; background: #eff6ff; border-radius: 8px;"
        >
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 24px;">📊</span>
            <div style="flex: 1;">
              <div style="font-weight: 600; color: #1e293b;">{{ file.name }}</div>
              <div style="font-size: 14px; color: #64748b;">{{ formatFileSize(file.size) }}</div>
            </div>
            <button class="btn btn-secondary" @click="removeFile(index)">移除</button>
          </div>
        </div>
      </div>

      <div style="text-align: center; margin-top: 24px;">
        <button 
          class="btn btn-primary btn-lg"
          :disabled="selectedFiles.length === 0"
          @click="startAnalysis"
        >
          開始分析比對 ({{ selectedFiles.length }} 個檔案)
        </button>
      </div>
    </div>

    <!-- 分析進度 -->
    <div v-else class="analysis-progress-card">
      <div class="progress-header">
        <div class="progress-icon">🔄</div>
        <h2 style="margin-bottom: 8px;">AI 正在分析比對您的差異表</h2>
        <p style="color: #64748b;">正在處理 {{ selectedFiles.length }} 個檔案...</p>
      </div>

      <div class="progress-bar-container">
        <div 
          class="progress-fill" 
          :style="{ width: progress + '%' }"
        ></div>
      </div>

      <div style="text-align: center; margin-bottom: 32px;">
        <div style="font-size: 24px; font-weight: 700; color: #3b82f6; margin-bottom: 4px;">
          {{ progress }}%
        </div>
        <div style="color: #64748b; font-size: 14px;">
          預計剩餘時間：約 {{ timeRemaining }} 秒
        </div>
      </div>

      <div class="progress-steps">
        <div 
          v-for="(step, index) in steps"
          :key="index"
          class="progress-step"
          :class="getStepClass(index)"
        >
          <span style="font-size: 20px;">{{ step.icon }}</span>
          <div>
            <div style="font-weight: 600;" :style="{ color: step.completed ? '#1e293b' : '#94a3b8' }">
              {{ step.name }}
            </div>
            <div style="font-size: 12px; color: #64748b;">
              {{ step.status }}
            </div>
            <div v-if="step.estimatedTime && !step.completed" style="font-size: 11px; color: #94a3b8;">
              預計 {{ step.estimatedTime }}
            </div>
          </div>
        </div>
      </div>

      <div style="margin-top: 24px; padding: 16px; background: #eff6ff; border-radius: 8px; text-align: center;">
        <span style="color: #2563eb;">💡 {{ currentTip }}</span>
      </div>

      <!-- Demo 按鈕 -->
      <div style="text-align: center; margin-top: 24px;">
        <button class="btn btn-secondary" @click="completeAnalysis">
          （Demo：模擬完成）
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAnalysisStore } from '@/stores/analysisStore'

const emit = defineEmits(['navigate'])
const store = useAnalysisStore()

const isAnalyzing = ref(false)
const selectedFiles = ref([])
const progress = ref(0)
const timeRemaining = ref(90)

const steps = ref([
  { 
    name: '差異表解析與資料提取', 
    icon: '⏸️', 
    status: '等待中', 
    completed: false,
    estimatedTime: '15秒'
  },
  { 
    name: 'RAG 檢索比對', 
    icon: '⏸️', 
    status: '等待中', 
    completed: false,
    estimatedTime: '25秒'
  },
  { 
    name: '相似度計算與分類', 
    icon: '⏸️', 
    status: '等待中', 
    completed: false,
    estimatedTime: '20秒'
  },
  { 
    name: 'AI 建議生成', 
    icon: '⏸️', 
    status: '等待中', 
    completed: false,
    estimatedTime: '20秒'
  },
  { 
    name: '報告匯出與整理', 
    icon: '⏸️', 
    status: '等待中', 
    completed: false,
    estimatedTime: '10秒'
  }
])

const tips = [
  '系統正在比對您的 168 份內規資料庫...',
  '正在使用 RAG 技術進行深度檢索...',
  'AI 正在分析條文相似度與關聯性...',
  '正在生成精準的修改建議...',
  '即將完成，正在整理分析結果...'
]

const currentTip = computed(() => {
  const stepIndex = Math.floor(progress.value / 20)
  return tips[Math.min(stepIndex, tips.length - 1)]
})

const handleFileSelect = (event) => {
  const files = Array.from(event.target.files)
  selectedFiles.value = [...selectedFiles.value, ...files]
}

const handleDrop = (event) => {
  const files = Array.from(event.dataTransfer.files)
  selectedFiles.value = [...selectedFiles.value, ...files]
}

const removeFile = (index) => {
  selectedFiles.value.splice(index, 1)
}

const clearAllFiles = () => {
  selectedFiles.value = []
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

// 🔌 開始分析
const startAnalysis = async () => {
  if (selectedFiles.value.length === 0) {
    alert('請上傳差異比較表')
    return
  }

  isAnalyzing.value = true
  
  // 模擬進度
  simulateProgress()
  
  // 提交到後端（現在是模擬）
  setTimeout(async () => {
    const success = await store.submitMultipleAnalysis(selectedFiles.value)
    if (success) {
      // 分析完成，跳轉到審閱頁面
      const newAnalysis = store.analyses[0] // 最新的分析
      store.setCurrentAnalysis(newAnalysis.id)
    }
  }, 100)
}

// Demo: 模擬進度更新
const simulateProgress = () => {
  const interval = setInterval(() => {
    progress.value += 1.1  // 調整速度以配合 90 秒
    timeRemaining.value = Math.max(0, Math.round(90 - (progress.value * 0.9)))

    // 更新步驟狀態
    const stepIndex = Math.floor(progress.value / 20)
    steps.value.forEach((step, index) => {
      if (index < stepIndex) {
        step.icon = '✅'
        step.status = '完成'
        step.completed = true
        step.estimatedTime = null
      } else if (index === stepIndex) {
        step.icon = '⏳'
        step.status = '進行中...'
        // 顯示剩餘時間
        const remainingSteps = steps.value.length - index
        const avgTime = timeRemaining.value / remainingSteps
        step.estimatedTime = `約 ${Math.round(avgTime)} 秒`
      }
    })

    if (progress.value >= 100) {
      clearInterval(interval)
      steps.value[4].icon = '✅'
      steps.value[4].status = '完成'
      steps.value[4].completed = true
      steps.value[4].estimatedTime = null
    }
  }, 200)
}

const getStepClass = (index) => {
  const step = steps.value[index]
  if (step.completed) return 'step-completed'
  if (step.icon === '⏳') return 'step-active'
  return ''
}

const completeAnalysis = () => {
  // 跳轉到審閱頁面
  emit('navigate', 2)
}
</script>
