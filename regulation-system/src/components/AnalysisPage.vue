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
        <div style="font-size: 48px; margin-bottom: 16px;">📄</div>
        <h3>拖曳檔案到此處</h3>
        <p style="color: #64748b; margin: 8px 0;">或點擊選擇檔案（可多選）</p>
        <p style="color: #94a3b8; font-size: 14px;">
          支援 PDF, DOCX, TXT | 每個檔案大小限制: 10MB
        </p>
      </div>

      <input 
        ref="fileInput"
        type="file" 
        multiple
        style="display: none;"
        accept=".pdf,.docx,.txt"
        @change="handleFileSelect"
      >

      <div v-if="selectedFiles.length > 0" style="margin-top: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <h3 style="margin: 0;">已選擇 {{ selectedFiles.length }} 個檔案</h3>
          <button class="btn btn-secondary" @click="clearAllFiles">清除全部</button>
        </div>
        
        <div 
          v-for="(file, index) in selectedFiles" 
          :key="index"
          style="margin-bottom: 12px; padding: 16px; background: #eff6ff; border-radius: 8px;"
        >
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 24px;">📄</span>
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
          開始分析 ({{ selectedFiles.length }} 個檔案)
        </button>
      </div>
    </div>

    <!-- 分析進度 -->
    <div v-else class="analysis-progress-card">
      <div class="progress-header">
        <div class="progress-icon">🔄</div>
        <h2 style="margin-bottom: 8px;">AI 正在分析您的外規</h2>
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
          </div>
        </div>
      </div>

      <div style="margin-top: 24px; padding: 16px; background: #eff6ff; border-radius: 8px; text-align: center;">
        <span style="color: #2563eb;">💡 小提示：系統正在比對您的 168 份內規資料庫...</span>
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
import { ref } from 'vue'
import { useAnalysisStore } from '@/stores/analysisStore'

const emit = defineEmits(['navigate'])
const store = useAnalysisStore()

const isAnalyzing = ref(false)
const selectedFiles = ref([])
const progress = ref(0)
const timeRemaining = ref(60)

const steps = ref([
  { name: '文字提取與預處理', icon: '⏸️', status: '等待中', completed: false },
  { name: '關鍵詞與語義分析', icon: '⏸️', status: '等待中', completed: false },
  { name: '搜尋相關內規', icon: '⏸️', status: '等待中', completed: false },
  { name: '生成修改建議', icon: '⏸️', status: '等待中', completed: false },
  { name: '整理分析結果', icon: '⏸️', status: '等待中', completed: false }
])

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
    alert('請上傳檔案')
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
    progress.value += 2
    timeRemaining.value = Math.max(0, 60 - progress.value)

    // 更新步驟狀態
    const stepIndex = Math.floor(progress.value / 20)
    steps.value.forEach((step, index) => {
      if (index < stepIndex) {
        step.icon = '✅'
        step.status = '完成'
        step.completed = true
      } else if (index === stepIndex) {
        step.icon = '⏳'
        step.status = '進行中...'
      }
    })

    if (progress.value >= 100) {
      clearInterval(interval)
      steps.value[4].icon = '✅'
      steps.value[4].status = '完成'
      steps.value[4].completed = true
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
