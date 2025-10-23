import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { config } from '../config/index.js';
import { chromaService } from '../services/rag/chroma-service.js';
import { logger } from '../utils/logger.js';
import { ValidationError } from '../utils/errors.js';

const router = express.Router();

/**
 * 提取關鍵詞組並計算匹配度
 */
function extractKeyPhrasesWithScore(text) {
  if (!text) return [];
  
  const phrases = [];
  
  // 模式 1：「應/應當/必須/需要/禁止」相關規範
  const shouldPatterns = /(?:應|應當|必須|需要|禁止|得|不得)([^。，；\n]{2,25}?)(?:[。，；\n]|$)/g;
  let matches = text.matchAll(shouldPatterns);
  for (const match of matches) {
    if (match[1] && match[1].trim().length >= 2) {
      phrases.push({
        keyword: match[1].trim(),
        type: 'regulation',
        weight: 1.0
      });
    }
  }
  
  // 模式 2：專業術語
  const technicalTerms = [
    { pattern: /資[通訊]安全[^。，；\n]{0,15}/g, weight: 1.2 },
    { pattern: /委外[^。，；\n]{0,15}/g, weight: 1.1 },
    { pattern: /風險[管理評估控制][^。，；\n]{0,15}/g, weight: 1.1 },
    { pattern: /合約[^。，；\n]{0,15}/g, weight: 0.9 },
    { pattern: /稽核[^。，；\n]{0,15}/g, weight: 1.0 },
    { pattern: /備援[^。，；\n]{0,15}/g, weight: 1.0 },
    { pattern: /個資[^。，；\n]{0,15}/g, weight: 1.1 },
    { pattern: /供應商[^。，；\n]{0,15}/g, weight: 1.0 },
    { pattern: /雲端[運算服務][^。，；\n]{0,15}/g, weight: 1.2 },
    { pattern: /營運持續[^。，；\n]{0,15}/g, weight: 1.1 },
  ];
  
  technicalTerms.forEach(({ pattern, weight }) => {
    const termMatches = text.matchAll(pattern);
    for (const match of termMatches) {
      if (match[0] && match[0].trim().length >= 2) {
        phrases.push({
          keyword: match[0].trim(),
          type: 'technical',
          weight
        });
      }
    }
  });
  
  return phrases;
}

/**
 * 分析關鍵字匹配度
 */
function analyzeKeywordMatches(queryKeywords, contextContent) {
  const matches = {
    high: [],      // 高相關 (完全匹配)
    medium: [],    // 中相關 (部分匹配)
    low: []        // 低相關 (相關概念)
  };
  
  queryKeywords.forEach(({ keyword, type, weight }) => {
    // 完全匹配
    if (contextContent.includes(keyword)) {
      matches.high.push({ keyword, type, weight });
    } 
    // 部分匹配 (關鍵字的前3個字)
    else if (keyword.length >= 3 && contextContent.includes(keyword.substring(0, 3))) {
      matches.medium.push({ keyword, type, weight });
    }
    // 相關概念 (同類型其他關鍵字出現)
    else if (type === 'technical') {
      const relatedTerms = ['資訊', '資通', '安全', '管理', '風險'];
      const hasRelated = relatedTerms.some(term => 
        keyword.includes(term) && contextContent.includes(term)
      );
      if (hasRelated) {
        matches.low.push({ keyword, type, weight });
      }
    }
  });
  
  return matches;
}

/**
 * 計算綜合相似度分數
 */
function calculateSimilarityScore(keywordMatches, originalDistance) {
  const { high, medium, low } = keywordMatches;
  
  // 基於關鍵字匹配的分數
  const keywordScore = (
    high.reduce((sum, k) => sum + k.weight, 0) * 0.5 +
    medium.reduce((sum, k) => sum + k.weight, 0) * 0.3 +
    low.reduce((sum, k) => sum + k.weight, 0) * 0.1
  );
  
  // 向量距離分數 (距離越小分數越高)
  const distanceScore = Math.max(0, 1 - originalDistance);
  
  // 綜合分數 (60% 向量相似度 + 40% 關鍵字匹配)
  const combinedScore = distanceScore * 0.6 + Math.min(keywordScore / 5, 1) * 0.4;
  
  return Math.min(combinedScore, 1);
}

/**
 * POST /api/match
 */
router.post('/', async (req, res, next) => {
  try {
    const { taskId, topK } = req.body;

    if (!taskId) {
      throw new ValidationError('缺少 taskId 參數');
    }

    logger.info('開始比對法規與內規', { taskId, topK });

    const resultPath = path.join(
      config.upload.uploadPath,
      `regulation_${taskId}.json`
    );

    let regulationData;
    try {
      const content = await fs.readFile(resultPath, 'utf-8');
      regulationData = JSON.parse(content);
    } catch (error) {
      throw new ValidationError('找不到法規解析結果，請先上傳法規文件');
    }

    const { items } = regulationData;
    const matchResults = [];

    for (const item of items) {
      logger.info(`比對條文: ${item.sectionTitle}`);

      // 提取查詢關鍵詞
      const queryKeywords = extractKeyPhrasesWithScore(
        [item.sectionTitle, item.newText, item.explanation].filter(Boolean).join('\n')
      );

      // 建構查詢
      const query = buildEnhancedQuery(item);

      // 搜尋相關內規
      const contexts = await chromaService.search(query, topK);

      // 分析每個結果的關鍵字匹配
      const enrichedContexts = contexts.map(ctx => {
        const keywordMatches = analyzeKeywordMatches(queryKeywords, ctx.content);
        const similarity = calculateSimilarityScore(keywordMatches, ctx.distance);
        
        return {
          content: ctx.content,
          meta: ctx.metadata,
          distance: ctx.distance,
          similarity: similarity,
          keywordMatches: {
            high: keywordMatches.high.map(k => k.keyword),
            medium: keywordMatches.medium.map(k => k.keyword),
            low: keywordMatches.low.map(k => k.keyword)
          },
          matchSummary: generateMatchSummary(keywordMatches, similarity)
        };
      });

      matchResults.push({
        diffItem: item,
        queryKeywords: queryKeywords.map(k => k.keyword),
        policyContexts: enrichedContexts
      });
    }

    const matchPath = path.join(
      config.upload.uploadPath,
      `match_${taskId}.json`
    );
    await fs.writeFile(matchPath, JSON.stringify(matchResults, null, 2));

    logger.info('比對完成', { itemCount: matchResults.length });

    res.json({
      success: true,
      data: {
        taskId,
        matchCount: matchResults.length,
        results: matchResults,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * 生成匹配摘要
 */
function generateMatchSummary(keywordMatches, similarity) {
  const { high, medium, low } = keywordMatches;
  
  let level = '低相關';
  if (similarity >= 0.8) level = '高相關';
  else if (similarity >= 0.6) level = '中相關';
  
  const parts = [];
  if (high.length > 0) parts.push(`${high.length}個核心關鍵字完全匹配`);
  if (medium.length > 0) parts.push(`${medium.length}個關鍵字部分匹配`);
  if (low.length > 0) parts.push(`${low.length}個相關概念`);
  
  return `${level} - ${parts.join('，')}`;
}

/**
 * 建構增強型查詢
 */
function buildEnhancedQuery(item) {
  const parts = [];
  
  if (item.sectionTitle) {
    parts.push(`📌 條文：${item.sectionTitle}`);
  }
  
  if (item.explanation) {
    const keywords = extractKeyPhrasesWithScore(item.explanation);
    if (keywords.length > 0) {
      parts.push(`🔑 關鍵概念：${keywords.slice(0, 8).map(k => k.keyword).join('、')}`);
    }
  }
  
  if (item.newText && item.oldText) {
    const diffSummary = generateDiffSummary(item.newText, item.oldText);
    if (diffSummary) {
      parts.push(`🔄 修正重點：${diffSummary}`);
    }
  }
  
  return parts.join('\n\n');
}

function generateDiffSummary(newText, oldText) {
  if (!newText || !oldText) return '';
  
  const extractWords = (text) => {
    const words = text.match(/[\u4e00-\u9fa5]{2,6}/g) || [];
    return new Set(words);
  };
  
  const oldWords = extractWords(oldText);
  const newWords = extractWords(newText);
  
  const added = [...newWords].filter(w => !oldWords.has(w));
  const removed = [...oldWords].filter(w => !newWords.has(w));
  
  const summaryParts = [];
  
  if (added.length > 0) {
    const relevantAdded = added.filter(w => w.length >= 3).slice(0, 5);
    if (relevantAdded.length > 0) {
      summaryParts.push('新增概念：' + relevantAdded.join('、'));
    }
  }
  
  if (removed.length > 0) {
    const relevantRemoved = removed.filter(w => w.length >= 3).slice(0, 3);
    if (relevantRemoved.length > 0) {
      summaryParts.push('移除概念：' + relevantRemoved.join('、'));
    }
  }
  
  return summaryParts.join('；') || '條文內容修正';
}

/**
 * GET /api/match/:taskId
 */
router.get('/:taskId', async (req, res, next) => {
  try {
    const { taskId } = req.params;

    const matchPath = path.join(
      config.upload.uploadPath,
      `match_${taskId}.json`
    );

    let matchData;
    try {
      const content = await fs.readFile(matchPath, 'utf-8');
      matchData = JSON.parse(content);
    } catch (error) {
      throw new ValidationError('找不到比對結果');
    }

    res.json({
      success: true,
      data: {
        taskId,
        matchCount: matchData.length,
        results: matchData,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
