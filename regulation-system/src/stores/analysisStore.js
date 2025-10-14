import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAnalysisStore = defineStore('analysis', () => {
  // ==================== 狀態 (State) ====================
  
  // 所有分析項目（V2: 支援多差異比較表）
  const analyses = ref([
    {
      id: '20241010-001',
      name: '批次分析 - 10/10',
      date: '2024/10/10 14:30',
      status: 'pending',
      totalPolicies: 9,
      reviewedPolicies: 0,
      // 多個差異比較表（系統會自動讀取內規與外規）
      externalRegulations: [
        {
          id: 'EXT-001',
          name: '📊 金融業法規差異表',
          fileName: '金融業法規差異表.xlsx',
          policies: [
            // 🔴 高度相關 (≥80%)
            {
              id: 1,
              externalRegId: 'EXT-001',
              name: '客戶資料保護管理辦法',
              similarity: 92,
              modificationsCount: 4,
              reviewedCount: 0,
              status: 'pending',
              modifications: [
                {
                  id: 'MOD-001',
                  number: '1/4',
                  article: '第 3 條第 2 款',
                  original: '客戶個人資料之蒐集、處理及利用，應遵循個人資料保護法之規定。',
                  suggested: '客戶個人資料之蒐集、處理及利用，應遵循個人資料保護法及金融監督管理委員會最新公告之規定，並建立完善之資料保護機制。',
                  reason: '新法規要求金融機構應建立更完善的資料保護機制，並明確引用主管機關規定',
                  status: 'pending'
                },
                {
                  id: 'MOD-002',
                  number: '2/4',
                  article: '第 5 條第 1 款',
                  original: '應設置資料保護專責人員。',
                  suggested: '應設置資料保護長（DPO），並向董事會或總經理直接報告，確保資料保護政策之落實。',
                  reason: '配合新制要求設置資料保護長並明確其職責與報告路線',
                  status: 'pending'
                },
                {
                  id: 'MOD-003',
                  number: '3/4',
                  article: '第 7 條',
                  original: '定期辦理員工教育訓練。',
                  suggested: '每年至少辦理兩次員工個資保護教育訓練，並留存訓練記錄至少五年。',
                  reason: '新法規明確規範訓練頻率及記錄保存年限',
                  status: 'pending'
                },
                {
                  id: 'MOD-004',
                  number: '4/4',
                  article: '第 10 條第 3 款',
                  original: '發生個資外洩事件時，應立即通報主管機關。',
                  suggested: '發生個資外洩事件時，應於知悉後 72 小時內通報主管機關，並同步通知受影響之當事人。',
                  reason: '新增明確的通報時限及當事人通知義務',
                  status: 'pending'
                }
              ]
            },
            {
              id: 2,
              externalRegId: 'EXT-001',
              name: '洗錢防制作業要點',
              similarity: 88,
              modificationsCount: 3,
              reviewedCount: 0,
              status: 'pending',
              modifications: [
                {
                  id: 'MOD-005',
                  number: '1/3',
                  article: '第 2 條',
                  original: '應確實執行客戶身分確認程序。',
                  suggested: '應確實執行客戶身分確認程序（KYC），包含實質受益人識別，並依風險等級採取相應之強化措施。',
                  reason: '新增實質受益人識別要求及風險等級分級措施',
                  status: 'pending'
                },
                {
                  id: 'MOD-006',
                  number: '2/3',
                  article: '第 4 條第 2 款',
                  original: '對於可疑交易應進行申報。',
                  suggested: '對於可疑交易應於發現後立即進行內部評估，並於確認後 10 個營業日內完成申報，不得事先通知客戶。',
                  reason: '明確申報時限並增加保密規定',
                  status: 'pending'
                },
                {
                  id: 'MOD-007',
                  number: '3/3',
                  article: '第 8 條',
                  original: '定期辦理防制洗錢教育訓練。',
                  suggested: '每年至少辦理一次防制洗錢及打擊資恐教育訓練，新進人員應於到職三個月內完成訓練，並保存訓練記錄。',
                  reason: '新增打擊資恐內容及新進人員訓練時限要求',
                  status: 'pending'
                }
              ]
            },
            // 🟡 中度相關 (50-79%)
            {
              id: 3,
              externalRegId: 'EXT-001',
              name: '內部控制制度實施辦法',
              similarity: 68,
              modificationsCount: 2,
              reviewedCount: 0,
              status: 'pending',
              modifications: [
                {
                  id: 'MOD-008',
                  number: '1/2',
                  article: '第 6 條',
                  original: '應建立內部控制三道防線。',
                  suggested: '應建立內部控制三道防線，明確區分第一線業務單位、第二線風險管理及法令遵循單位、第三線內部稽核單位之職責。',
                  reason: '明確說明三道防線的組成單位及職責劃分',
                  status: 'pending'
                },
                {
                  id: 'MOD-009',
                  number: '2/2',
                  article: '第 12 條',
                  original: '每年進行一次內部控制自行評估。',
                  suggested: '每年至少進行一次內部控制自行評估，並將評估結果提報董事會，缺失事項應追蹤改善。',
                  reason: '增加董事會報告及缺失追蹤要求',
                  status: 'pending'
                }
              ]
            },
            {
              id: 4,
              externalRegId: 'EXT-001',
              name: '資訊安全管理規範',
              similarity: 75,
              modificationsCount: 3,
              reviewedCount: 0,
              status: 'pending',
              modifications: [
                {
                  id: 'MOD-010',
                  number: '1/3',
                  article: '第 3 條',
                  original: '應定期進行資訊安全檢測。',
                  suggested: '應每年至少進行一次滲透測試及弱點掃描，重大系統上線前應完成資安檢測。',
                  reason: '明確檢測頻率及範圍',
                  status: 'pending'
                },
                {
                  id: 'MOD-011',
                  number: '2/3',
                  article: '第 7 條第 1 款',
                  original: '建立資訊安全事件通報機制。',
                  suggested: '建立資訊安全事件通報機制，重大事件應於 2 小時內通報資安長，並於 24 小時內通報主管機關。',
                  reason: '新增通報時限規定',
                  status: 'pending'
                },
                {
                  id: 'MOD-012',
                  number: '3/3',
                  article: '第 9 條',
                  original: '員工應接受資安教育訓練。',
                  suggested: '全體員工每年應接受至少 3 小時資安教育訓練，資安相關人員應接受至少 12 小時專業訓練。',
                  reason: '明確訓練時數要求並區分一般員工與資安人員',
                  status: 'pending'
                }
              ]
            }
          ]
        },
        {
          id: 'EXT-002',
          name: '📊 風險管理差異表',
          fileName: '風險管理差異表.xlsx',
          policies: [
            // 🔴 高度相關
            {
              id: 5,
              externalRegId: 'EXT-002',
              name: '風險管理政策',
              similarity: 85,
              modificationsCount: 2,
              reviewedCount: 0,
              status: 'pending',
              modifications: [
                {
                  id: 'MOD-013',
                  number: '1/2',
                  article: '第 4 條',
                  original: '應建立風險管理機制。',
                  suggested: '應建立完善風險管理機制，包含風險識別、衡量、監控及報告四大流程，並定期檢討更新。',
                  reason: '明確風險管理四大流程',
                  status: 'pending'
                },
                {
                  id: 'MOD-014',
                  number: '2/2',
                  article: '第 8 條',
                  original: '定期向董事會報告風險管理執行情形。',
                  suggested: '每季向董事會報告風險管理執行情形，包含風險指標、重大風險事件及因應措施。',
                  reason: '明確報告頻率及內容',
                  status: 'pending'
                }
              ]
            },
            // 🟡 中度相關
            {
              id: 6,
              externalRegId: 'EXT-002',
              name: '信用風險管理辦法',
              similarity: 62,
              modificationsCount: 2,
              reviewedCount: 0,
              status: 'pending',
              modifications: [
                {
                  id: 'MOD-015',
                  number: '1/2',
                  article: '第 5 條',
                  original: '應建立信用評等制度。',
                  suggested: '應建立信用評等制度，定期檢視評等模型之有效性，並每年至少進行一次模型驗證。',
                  reason: '增加模型驗證要求',
                  status: 'pending'
                },
                {
                  id: 'MOD-016',
                  number: '2/2',
                  article: '第 10 條',
                  original: '定期檢視授信品質。',
                  suggested: '每月檢視授信品質，包含逾期率、呆帳率等指標，並提報風險管理委員會。',
                  reason: '明確檢視頻率及報告對象',
                  status: 'pending'
                }
              ]
            },
            // 🟢 低度相關
            {
              id: 7,
              externalRegId: 'EXT-002',
              name: '作業風險管理準則',
              similarity: 45,
              modificationsCount: 2,
              reviewedCount: 0,
              status: 'pending',
              modifications: [
                {
                  id: 'MOD-017',
                  number: '1/2',
                  article: '第 3 條',
                  original: '應建立作業風險資料庫。',
                  suggested: '應建立作業風險資料庫，記錄損失事件、近似事件及關鍵風險指標，並定期分析。',
                  reason: '明確資料庫記錄內容',
                  status: 'pending'
                },
                {
                  id: 'MOD-018',
                  number: '2/2',
                  article: '第 7 條',
                  original: '建立業務持續營運計畫。',
                  suggested: '建立業務持續營運計畫（BCP），每年至少演練一次，並於演練後檢討改善。',
                  reason: '增加演練頻率及檢討要求',
                  status: 'pending'
                }
              ]
            },
            {
              id: 8,
              externalRegId: 'EXT-002',
              name: '市場風險管理規則',
              similarity: 38,
              modificationsCount: 1,
              reviewedCount: 0,
              status: 'pending',
              modifications: [
                {
                  id: 'MOD-019',
                  number: '1/1',
                  article: '第 6 條',
                  original: '應設定交易限額。',
                  suggested: '應設定交易限額，包含個別交易員限額、部門限額及全公司限額，並建立超限處理機制。',
                  reason: '明確限額層級及超限處理',
                  status: 'pending'
                }
              ]
            },
            {
              id: 9,
              externalRegId: 'EXT-002',
              name: '流動性風險控管要點',
              similarity: 42,
              modificationsCount: 1,
              reviewedCount: 0,
              status: 'pending',
              modifications: [
                {
                  id: 'MOD-020',
                  number: '1/1',
                  article: '第 4 條',
                  original: '應監控流動性指標。',
                  suggested: '應每日監控流動性覆蓋比率（LCR）及淨穩定資金比率（NSFR），確保符合法規要求。',
                  reason: '明確監控頻率及指標項目',
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

    // 在所有差異表中尋找該政策
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
            name: `📊 ${file.name}`,
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
      
      // 建立模擬的差異表資料
      const externalRegulations = files.map((file, index) => ({
        id: 'EXT-' + Date.now() + '-' + index,
        name: `📊 ${file.name.replace(/\.[^/.]+$/, '')}`,
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
   * 生成模擬內規資料（包含不同相似度等級）
   */
  function generateMockPolicies(extRegId, fileIndex) {
    const policyCount = Math.floor(Math.random() * 3) + 2 // 2-4 個內規
    const policies = []
    
    // 確保有不同相似度等級的分佈
    const similarityRanges = [
      { min: 85, max: 95 },  // 高度相關
      { min: 55, max: 75 },  // 中度相關
      { min: 35, max: 48 }   // 低度相關
    ]
    
    for (let i = 0; i < policyCount; i++) {
      const modCount = Math.floor(Math.random() * 3) + 1 // 1-3 個修改建議
      
      // 根據索引選擇相似度範圍
      const rangeIndex = i % similarityRanges.length
      const range = similarityRanges[rangeIndex]
      const similarity = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min
      
      const modifications = []
      for (let j = 0; j < modCount; j++) {
        modifications.push({
          id: `MOD-${Date.now()}-${i}-${j}`,
          number: `${j + 1}/${modCount}`,
          article: `第 ${j + 1} 條`,
          original: `原始條文內容範例 ${j + 1}...`,
          suggested: `建議修改後的內容範例 ${j + 1}...`,
          reason: '因應新法規要求，需調整相關文字敘述',
          status: 'pending'
        })
      }

      policies.push({
        id: Date.now() + i,
        externalRegId: extRegId,
        name: `內部作業辦法 ${String.fromCharCode(65 + i)}`,
        similarity: similarity,
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
