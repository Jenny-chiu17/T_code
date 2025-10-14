# 版本更新說明 - V2.0

## 更新時間
2024/10/14

## 主要更新內容

### 1. 支援多檔案上傳與分析 ✨

#### AnalysisPage.vue 修改
- ✅ 上傳區域改為支援多檔案選擇 (multiple 屬性)
- ✅ 可以拖曳多個檔案到上傳區
- ✅ 顯示已選擇的檔案列表，包含檔案名稱和大小
- ✅ 可以單獨移除某個檔案或清除全部
- ✅ 按鈕顯示檔案數量「開始分析 (N 個檔案)」

#### 修改的功能
```javascript
// 新增
- selectedFiles: ref([])  // 改為陣列
- handleFileSelect()      // 支援多檔案
- handleDrop()           // 支援多檔案拖曳
- removeFile(index)      // 移除單一檔案
- clearAllFiles()        // 清除所有檔案
- formatFileSize()       // 格式化檔案大小顯示
```

---

### 2. 資料結構調整 - 支援多外規檔案 🗂️

#### analysisStore.js 重大改版

新增的資料結構：
```javascript
{
  id: '...',
  name: '批次分析 - 10/14',
  date: '...',
  status: 'pending',
  totalPolicies: 12,     // 所有外規影響的內規總數
  reviewedPolicies: 3,   // 已審閱的內規總數
  
  // 🆕 新增：多個外規檔案
  externalRegulations: [
    {
      id: 'EXT-001',
      name: '📄 XXXXX 法規',
      fileName: 'XXXXX法規.pdf',
      
      // 每個外規有自己的內規列表
      policies: [
        {
          id: 1,
          externalRegId: 'EXT-001',  // 🆕 關聯到外規
          name: '內部 XXXXX 辦法',
          similarity: 95,
          modificationsCount: 3,
          reviewedCount: 0,
          status: 'pending',
          modifications: [...]
        },
        // ... 更多內規
      ]
    },
    {
      id: 'EXT-002',
      name: '📄 ZZZZZ 條文',
      fileName: 'ZZZZZ條文.pdf',
      policies: [...]
    }
    // ... 更多外規
  ]
}
```

#### 新增的 Store 方法
- ✅ `submitMultipleAnalysis(files)` - 提交多檔案分析
- ✅ `addMultipleAnalysis(analysisData)` - 新增多檔案分析項目
- ✅ `generateMockPolicies(extRegId, fileIndex)` - 生成模擬資料
- ✅ `currentPolicies` computed - 展平所有外規的內規列表

---

### 3. 審閱頁面按文件分組顯示 📊

#### ReviewPage.vue 重大改版

新功能：
1. **整體統計區** - 顯示所有外規影響的內規統計（高中低相關）
2. **按外規分組** - 每份外規文件獨立顯示為一個卡片區塊
3. **個別統計** - 每份外規都有自己的高中低統計
4. **搜尋功能** - 在所有外規中搜尋內規名稱

#### 畫面結構
```
📋 審閱與修改
├─ 📊 整體影響統計
│   ├─ 🔴 高度相關 (N)
│   ├─ 🟡 中度相關 (N)
│   ├─ 🟢 低度相關 (N)
│   └─ 📊 總計 (N)
│
├─ 🔍 搜尋內規
│
├─ 📄 外規文件 1
│   ├─ 📊 該文件的影響統計 (高中低)
│   └─ 📋 受影響的內規列表
│
├─ 📄 外規文件 2
│   ├─ 📊 該文件的影響統計 (高中低)
│   └─ 📋 受影響的內規列表
│
└─ 📥 下載所有已完成的內規
```

#### 新增的計算屬性與方法
```javascript
// 整體統計（所有外規的總和）
overallStats: computed(() => {
  high: N,
  medium: N,
  low: N
})

// 取得特定外規的統計
getRegulationStats(extReg) {
  return { high, medium, low }
}

// 取得特定外規的篩選後內規
getFilteredPolicies(extReg) {
  return filtered policies
}
```

---

### 4. 首頁顯示更新 🏠

#### DashboardPage.vue 修改
- ✅ 顯示外規數量：「N 份外規 | M 份內規」
- ✅ 同時顯示在待審閱和已完成項目中

---

## 相似度分級標準

| 相似度 | 等級 | 顏色 | 說明 |
|--------|------|------|------|
| >= 80% | 高度相關 | 🔴 紅色 | 需優先處理 |
| 50-79% | 中度相關 | 🟡 黃色 | 建議處理 |
| < 50%  | 低度相關 | 🟢 綠色 | 參考即可 |

---

## 檔案變更清單

1. ✅ `vite.config.js` - 修復路徑別名問題
2. ✅ `src/components/AnalysisPage.vue` - 支援多檔案上傳
3. ✅ `src/stores/analysisStore.js` - 資料結構重構，支援多外規
4. ✅ `src/components/ReviewPage.vue` - 按文件分組顯示
5. ✅ `src/components/DashboardPage.vue` - 顯示外規數量

---

## 使用說明

### 上傳多個檔案
1. 點擊「新增分析」
2. 點擊上傳區域或拖曳多個檔案
3. 檢查已選擇的檔案列表
4. 可以移除不需要的檔案
5. 點擊「開始分析 (N 個檔案)」

### 審閱多檔案分析結果
1. 首頁會顯示「N 份外規 | M 份內規」
2. 進入審閱頁面後：
   - 頂部顯示整體統計
   - 每份外規獨立顯示
   - 每份外規有自己的高中低統計
   - 可搜尋所有內規

---

## 後續 TODO

### API 串接點
```javascript
// 1. 多檔案上傳分析
POST /api/analyze-multiple
FormData: files[] (多個檔案)

// 2. 下載已完成內規
GET /api/download/${analysisId}/completed

// 3. 載入分析詳情
GET /api/analyses/${id}
Response: 包含 externalRegulations 結構
```

### 建議的後端資料結構
後端回傳的 JSON 應該遵循 analysisStore.js 中定義的結構，包含：
- externalRegulations 陣列
- 每個外規有自己的 policies 陣列
- 每個 policy 有 externalRegId 關聯

---

## 測試建議

1. 上傳 1 個檔案 - 確認向下相容
2. 上傳 3-5 個檔案 - 測試多檔案流程
3. 審閱時切換不同外規的內規
4. 搜尋功能是否正常
5. 統計數字是否正確計算

---

## 版本兼容性

- ✅ 向下相容：單檔案上傳仍可正常使用
- ✅ 資料遷移：舊資料會被包裝在 externalRegulations 陣列中
- ✅ API 彈性：submitAnalysis() 和 submitMultipleAnalysis() 都可用

---

## 效能考量

- 模擬資料生成：每份外規 2-4 個內規，每個內規 1-3 個修改建議
- 相似度隨機生成：30-95 之間，根據檔案索引微調
- 建議真實環境根據實際需求調整

---

## 聯絡資訊

如有問題請參考：
- Store 定義：`src/stores/analysisStore.js`
- 元件實作：`src/components/` 目錄
- 資料結構範例：analysisStore.js 中的初始資料
