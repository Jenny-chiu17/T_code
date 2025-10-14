import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAnalysisStore = defineStore('analysis', () => {
  // ==================== 狀態 (State) ====================
  
  // 所有分析項目（V2: 支援多外規檔案）
  const analyses = ref([
    {
      id: '20241010-001',
      name: '批次分析 - 10/10',
      date: '2024/10/10 14:30',
      status: 'pending', // pending, inprogress, completed
      totalPolicies: 12,
      reviewedPolicies: 3,
      // 新增：多個外規檔案
      externalRegulations: [
        {
          id: 'EXT-001',
          name: '📄 XXXXX 法規',
          fileName: 'XXXXX法規.pdf',
          policies: [
            {
              id: 1,
              externalRegId: 'EXT-001', // 關聯到外規
              name: '內部 XXXXX 辦法',
              similarity: 95,
              modificationsCount: 3,
              reviewedCount: 0,
              status: 'pending',
              modifications: [
                {
                  id: 'MOD-001',
                  number: '1/3',
                  article: '第 3 條第 2 款',
                  original: '原始的條文內容範例...',
                  suggested: '建議修改後的內容範例...',
                  reason: '因應新法規要求，需調整相關文字敘述',
                  status: 'pending'
                },
                {
                  id: 'MOD-002',
                  number: '2/3',
                  article: '第 5 條第 1 款',
                  original: '原始的條文內容範例 2...',
                  suggested: '建議修改後的內容範例 2...',
                  reason: '因應新法規要求，需調整相關文字敘述',
                  status: 'pending'
                },
                {
                  id: 'MOD-003',
                  number: '3/3',
                  article: '第 7 條',
                  original: '原始的條文內容範例 3...',
                  suggested: '建議修改後的內容範例 3...',
                  reason: '因應新法規要求，需調整相關文字敘述',
                  status: 'pending'
                }
              ]
            },
            {
              id: 2,
              externalRegId: 'EXT-001',
              name: '內部 YYYYY 管理辦法',
              similarity: 75,
              modificationsCount: 2,
              reviewedCount: 0,
              status: 'pending',
              modifications: [
                {
                  id: 'MOD-004',
                  number: '1/2',
                  article: '第 2 條',
                  original: '原始的條文內容範例...',
                  suggested: '建議修改後的內容範例...',
                  reason: '符合外規新要求',
                  status: 'pending'
                },
                {
                  id: 'MOD-005',
                  number: '2/2',
                  article: '第 4 條第 3 款',
                  original: '原始的條文內容範例...',
                  suggested: '建議修改後的內容範例...',
                  reason: '符合外規新要求',
                  status: 'pending'
                }
              ]
            }
          ]
        },
        {
          id: 'EXT-002',
          name: '📄 ZZZZZ 條文',
          fileName: 'ZZZZZ條文.pdf',
          policies: [
            {
              id: 3,
              externalRegId: 'EXT-002',
              name: '內部 ZZZZZ 作業要點',
              similarity: 60,
              modificationsCount: 2,
              reviewedCount: 0,
              status: 'pending',
              modifications: [
                {
                  id: 'MOD-006',
                  number: '1/2',
                  article: '第 1 條',
                  original: '原始的條文內容範例...',
                  suggested: '建議修改後的內容範例...',
                  reason: '配合外規調整',
                  status: 'pending'
                },
                {
                  id: 'MOD-007',
                  number: '2/2',
                  article: '第 6 條',
                  original: '原始的條文內容範例...',
                  suggested: '建議修改後的內容範例...',
                  reason: '配合外規調整',
                  status: 'pending'
                }
              ]
            },
            {
              id: 4,
              externalRegId: 'EXT-002',
              name: '內部 AAAAA 實施細則',
              similarity: 45,
              modificationsCount: 1,
              reviewedCount: 0,
              status: 'pending',
              modifications: [
                {
                  id: 'MOD-008',
                  number: '1/1',
                  article: '第 3 條第 1 款',
                  original: '原始的條文內容範例...',
                  suggested: '建議修改後的內容範例...',
                  reason: '配合外規調整',
                  status: 'pending'
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: '20241005-001',
      name: '批次分析 - 10/05',
      date: '2024/10/05 16:20',
      status: 'completed',
      totalPolicies: 15,
      reviewedPolicies: 15,
      externalRegulations: []
    }
  ])

  // 當前正在審閱的分析項目
  const currentAnalysisId = ref(null)

  // 載入狀態
  const isLoading = ref(false)

  // 錯誤訊息
  const errorMessage = ref('')

  // ==================== 計算屬性 (Getters) ====================

  // 當前分析項目
  const currentAnalysis = computed(() => {
    if (!currentAnalysisId.value) return null
    return analyses.value.find(a => a.id === currentAnalysisId.value)
  })

  // 當前分析項目的所有內規（展平）
  const currentPolicies = computed(() => {
    if (!currentAnalysis.value) return []
    const policies = []
    currentAnalysis.value.externalRegulations.forEach(extReg => {
      policies.push(...extReg.policies)
    })
    return policies
  })

  // 待審閱項目數量
  const pendingCount = computed(() => {
    return analyses.value.filter(a => a.status === 'pending').length
  })

  // 已完成項目數量
  const completedCount = computed(() => {
    return analyses.value.filter(a => a.status === 'completed').length
  })

  // 待審閱的項目列表
  const pendingAnalyses = computed(() => {
    return analyses.value.filter(a => a.status === 'pending')
  })

  // 已完成的項目列表
  const completedAnalyses = computed(() => {
    return analyses.value.filter(a => a.status === 'completed')
  })

  // 統計資料
  const stats = computed(() => ({
    total: analyses.value.length,
    pending: pendingCount.value,
    completed: completedCount.value,
    inProgress: analyses.value.filter(a => a.status === 'inprogress').length
  }))

  // ==================== 動作 (Actions) ====================

  /**
   * 設定當前審閱的分析項目
   */
  function setCurrentAnalysis(id) {
    currentAnalysisId.value = id
  }

  /**
   * 新增分析項目（單檔案 - 向下相容）
   */
  function addAnalysis(analysis) {
    analyses.value.unshift({
      ...analysis,
      id: generateId(),
      date: new Date().toLocaleString('zh-TW'),
      status: 'pending',
      reviewedPolicies: 0,
      externalRegulations: analysis.externalRegulations || []
    })
  }

  /**
   * 新增分析項目（多檔案）
   */
  function addMultipleAnalysis(analysisData) {
    analyses.value.unshift({
      ...analysisData,
      id: generateId(),
      date: new Date().toLocaleString('zh-TW'),
      status: 'pending',
      reviewedPolicies: 0
    })
  }

  /**
   * 更新分析項目狀態
   */
  function updateAnalysisStatus(id, status) {
    const analysis = analyses.value.find(a => a.id === id)
    if (analysis) {
      analysis.status = status
    }
  }

  /**
   * 更新修改建議的狀態
   */
  function updateModificationStatus(analysisId, policyId, modificationId, status) {
    const analysis = analyses.value.find(a => a.id === analysisId)
    if (!analysis) return

    // 在所有外規中尋找該政策
    let policy = null
    for (const extReg of analysis.externalRegulations) {
      policy = extReg.policies.find(p => p.id === policyId)
      if (policy) break
    }
    
    if (!policy) return

    const modification = policy.modifications.find(m => m.id === modificationId)
    if (!modification) return

    modification.status = status

    // 更新已審閱數量
    const reviewedCount = policy.modifications.filter(m => 
      m.status === 'accepted' || m.status === 'rejected'
    ).length
    policy.reviewedCount = reviewedCount

    // 檢查政策是否完成
    if (reviewedCount === policy.modificationsCount) {
      policy.status = 'completed'
    } else if (reviewedCount > 0) {
      policy.status = 'inprogress'
    }

    // 更新整體進度
    let totalCompletedPolicies = 0
    analysis.externalRegulations.forEach(extReg => {
      totalCompletedPolicies += extReg.policies.filter(p => p.status === 'completed').length
    })
    analysis.reviewedPolicies = totalCompletedPolicies

    // 檢查分析是否完成
    if (totalCompletedPolicies === analysis.totalPolicies) {
      analysis.status = 'completed'
    } else if (totalCompletedPolicies > 0) {
      analysis.status = 'inprogress'
    }
  }

  /**
   * 刪除分析項目
   */
  function deleteAnalysis(id) {
    const index = analyses.value.findIndex(a => a.id === id)
    if (index !== -1) {
      analyses.value.splice(index, 1)
    }
  }

  /**
   * 從 API 載入分析列表
   */
  async function fetchAnalyses() {
    isLoading.value = true
    errorMessage.value = ''

    try {
      // TODO: 實際的 API 呼叫
      // const response = await fetch('/api/analyses')
      // const data = await response.json()
      // analyses.value = data

      // 模擬 API 延遲
      await new Promise(resolve => setTimeout(resolve, 500))
      
      console.log('📊 已載入分析列表')
    } catch (error) {
      errorMessage.value = '載入失敗：' + error.message
      console.error('載入分析列表失敗:', error)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 從 API 載入特定分析項目的詳細資料
   */
  async function fetchAnalysisDetail(id) {
    isLoading.value = true
    errorMessage.value = ''

    try {
      // TODO: 實際的 API 呼叫
      // const response = await fetch(`/api/analyses/${id}`)
      // const data = await response.json()
      // 更新 analyses 中的對應項目

      await new Promise(resolve => setTimeout(resolve, 500))
      
      console.log(`📋 已載入分析詳情: ${id}`)
    } catch (error) {
      errorMessage.value = '載入失敗：' + error.message
      console.error('載入分析詳情失敗:', error)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 提交新的分析請求到後端（單檔案）
   */
  async function submitAnalysis(file) {
    isLoading.value = true
    errorMessage.value = ''

    try {
      const formData = new FormData()
      formData.append('file', file)

      // TODO: 實際的 API 呼叫
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockAnalysis = {
        name: `分析 - ${file.name}`,
        totalPolicies: 5,
        externalRegulations: [
          {
            id: 'EXT-' + Date.now(),
            name: `📄 ${file.name}`,
            fileName: file.name,
            policies: []
          }
        ]
      }
      addAnalysis(mockAnalysis)

      console.log('✅ 分析提交成功')
      return true
    } catch (error) {
      errorMessage.value = '提交失敗：' + error.message
      console.error('提交分析失敗:', error)
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 提交多檔案分析請求到後端
   */
  async function submitMultipleAnalysis(files) {
    isLoading.value = true
    errorMessage.value = ''

    try {
      const formData = new FormData()
      files.forEach(file => {
        formData.append('files[]', file)
      })

      // TODO: 實際的 API 呼叫
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 建立模擬的外規資料
      const externalRegulations = files.map((file, index) => ({
        id: 'EXT-' + Date.now() + '-' + index,
        name: `📄 ${file.name.replace(/\.[^/.]+$/, '')}`,
        fileName: file.name,
        policies: generateMockPolicies('EXT-' + Date.now() + '-' + index, index)
      }))

      // 計算總內規數量
      const totalPolicies = externalRegulations.reduce((sum, extReg) => sum + extReg.policies.length, 0)

      const mockAnalysis = {
        name: `批次分析 - ${new Date().toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit' })}`,
        totalPolicies,
        externalRegulations
      }
      
      addMultipleAnalysis(mockAnalysis)

      console.log('✅ 多檔案分析提交成功')
      return true
    } catch (error) {
      errorMessage.value = '提交失敗：' + error.message
      console.error('提交多檔案分析失敗:', error)
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 清除錯誤訊息
   */
  function clearError() {
    errorMessage.value = ''
  }

  // ==================== 工具函數 ====================

  /**
   * 生成唯一 ID
   */
  function generateId() {
    const date = new Date()
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '')
    const timeStr = Date.now().toString().slice(-6)
    return `${dateStr}-${timeStr}`
  }

  /**
   * 生成模擬內規資料
   */
  function generateMockPolicies(extRegId, fileIndex) {
    const policyCount = Math.floor(Math.random() * 3) + 2 // 2-4 個內規
    const policies = []
    
    for (let i = 0; i < policyCount; i++) {
      const modCount = Math.floor(Math.random() * 3) + 1 // 1-3 個修改建議
      const similarity = Math.floor(Math.random() * 50) + 30 + (fileIndex * 10) // 30-90 的相似度
      
      const modifications = []
      for (let j = 0; j < modCount; j++) {
        modifications.push({
          id: `MOD-${Date.now()}-${i}-${j}`,
          number: `${j + 1}/${modCount}`,
          article: `第 ${j + 1} 條`,
          original: `原始的條文內容範例 ${j + 1}...`,
          suggested: `建議修改後的內容範例 ${j + 1}...`,
          reason: '因應新法規要求，需調整相關文字敘述',
          status: 'pending'
        })
      }

      policies.push({
        id: Date.now() + i,
        externalRegId: extRegId,
        name: `內部作業辦法 ${String.fromCharCode(65 + i)}`,
        similarity: Math.min(similarity, 95),
        modificationsCount: modCount,
        reviewedCount: 0,
        status: 'pending',
        modifications
      })
    }
    
    return policies
  }

  // ==================== 返回 ====================

  return {
    // State
    analyses,
    currentAnalysisId,
    isLoading,
    errorMessage,

    // Getters
    currentAnalysis,
    currentPolicies,
    pendingCount,
    completedCount,
    pendingAnalyses,
    completedAnalyses,
    stats,

    // Actions
    setCurrentAnalysis,
    addAnalysis,
    addMultipleAnalysis,
    updateAnalysisStatus,
    updateModificationStatus,
    deleteAnalysis,
    fetchAnalyses,
    fetchAnalysisDetail,
    submitAnalysis,
    submitMultipleAnalysis,
    clearError
  }
})
