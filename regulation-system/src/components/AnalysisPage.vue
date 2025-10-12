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
        <p style="color: #64748b; margin: 8px 0;">或點擊選擇檔案</p>
        <p style="color: #94a3b8; font-size: 14px;">
          支援 PDF, DOCX, TXT | 檔案大小限制: 10MB
        </p>
      </div>

      <input 
        ref="fileInput"
        type="file" 
        style="display: none;"
        accept=".pdf,.docx,.txt"
        @change="handleFileSelect"
      >

      <div class="divider">
        <span class="divider-text">或</span>
      </div>

      <div>
        <label class="input-label">貼上外規文字內容</label>
        <textarea 
          v-model="textInput"
          class="text-input"
          placeholder="在此貼上外規條文內容..."
        ></textarea>
      </div>

      <div style="text-align: center; margin-top: 24px;">
        <button 
          class="btn btn-primary btn-lg"
          @click="startAnalysis"
        >
          開始分析
        </button>
      </div>
    </div>

    <!-- 分析進度 -->
    <div v-else class="analysis-progress-card">
      <div class="progress-header">
        <div class="progress-icon">🔄</div>
        <h2 style="margin-bottom: 8px;">AI 正在分析您的外規</h2>
        <p style="color: #64748b;">{{ fileName }}</p>
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

const emit = defineEmits(['navigate'])

const isAnalyzing = ref(false)
const selectedFile = ref(null)
const textInput = ref('')
const fileName = ref('')
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
  selectedFile.value = event.target.files[0]
  if (selectedFile.value) {
    fileName.value = selectedFile.value.name
  }
}

const handleDrop = (event) => {
  const files = event.dataTransfer.files
  if (files.length > 0) {
    selectedFile.value = files[0]
    fileName.value = files[0].name
  }
}

// 🔌 開始分析
const startAnalysis = async () => {
  if (!selectedFile.value && !textInput.value) {
    alert('請上傳檔案或貼上文字')
    return
  }

  // TODO: 呼叫後端 API
  /*
  const formData = new FormData()
  if (selectedFile.value) {
    formData.append('file', selectedFile.value)
  } else {
    formData.append('text', textInput.value)
  }

  const response = await fetch('/api/analyze', {
    method: 'POST',
    body: formData
  })

  const { analysis_id } = await response.json()
  pollProgress(analysis_id)
  */

  // Demo: 模擬進度
  isAnalyzing.value = true
  fileName.value = selectedFile.value?.name || '外規文字.txt'
  simulateProgress()
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
  emit('navigate', 2)
}
</script>