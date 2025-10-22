import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import mammoth from 'mammoth';
import { fileURLToPath } from 'url';
import { config } from '../config/index.js';
import { geminiService } from '../services/llm/gemini-service.js';
import { logger } from '../utils/logger.js';
import { ValidationError } from '../utils/errors.js';
import { convertDocToDocx, needsConversion, cleanupConvertedFile } from '../utils/doc-converter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const { taskId, temperature, maxTokens } = req.body;

    if (!taskId) {
      throw new ValidationError('缺少 taskId 參數');
    }

    logger.info('開始生成修改建議', { taskId });

    const matchPath = path.join(config.upload.uploadPath, `match_${taskId}.json`);

    let matchData;
    try {
      const content = await fs.readFile(matchPath, 'utf-8');
      matchData = JSON.parse(content);
    } catch (error) {
      throw new ValidationError('找不到比對結果，請先執行比對');
    }

    if (temperature !== undefined) {
      config.ai.temperature = parseFloat(temperature);
    }
    if (maxTokens !== undefined) {
      config.ai.maxOutputTokens = parseInt(maxTokens);
    }

    const suggestions = [];

    for (const match of matchData) {
      try {
        logger.info(`生成建議: ${match.diffItem.sectionTitle}`);

        const enhancedContexts = await prepareFullDocumentContexts(match.policyContexts);
        
        const suggestion = await geminiService.generateSuggestion(
          match.diffItem,
          enhancedContexts
        );

        // 從 match.policyContexts 取得相似度和關鍵字匹配信息
        if (match.policyContexts && match.policyContexts.length > 0) {
          const bestContext = match.policyContexts[0]; // 第一個是最相關的
          suggestion.similarity = bestContext.similarity || 0.5;
          suggestion.keywordMatches = bestContext.keywordMatches || { high: [], medium: [], low: [] };
          suggestion.matchSummary = bestContext.matchSummary || '';
        } else {
          suggestion.similarity = 0.5;
          suggestion.keywordMatches = { high: [], medium: [], low: [] };
          suggestion.matchSummary = '';
        }
        
        suggestion.keywords = extractKeywords(suggestion.diff_summary + ' ' + suggestion.suggestion_text);

        suggestions.push(suggestion);
      } catch (error) {
        logger.error(`生成建議失敗: ${match.diffItem.sectionTitle}`, {
          error: error.message,
        });

        suggestions.push({
          file: '生成失敗',
          section: match.diffItem.sectionTitle,
          diff_summary: match.diffItem.sectionTitle,
          change_type: match.diffItem.diffType,
          suggestion_text: '（建議生成失敗，請人工處理）',
          reason: error.message,
          similarity: 0,
          keywordMatches: { high: [], medium: [], low: [] },
          trace: {
            regulation_anchor: match.diffItem.sectionTitle,
            policy_anchor: '',
          },
        });
      }
    }

    const suggestionsByDocument = groupSuggestionsByDocument(suggestions);

    const suggestPath = path.join(config.upload.uploadPath, `suggestions_${taskId}.json`);
    await fs.writeFile(
      suggestPath,
      JSON.stringify({ 
        suggestions,
        suggestions_by_document: suggestionsByDocument,
      }, null, 2)
    );

    logger.info('建議生成完成', { 
      count: suggestions.length,
      documentCount: suggestionsByDocument.length,
    });

    res.json({
      success: true,
      data: {
        taskId,
        suggestionCount: suggestions.length,
        suggestions,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:taskId', async (req, res, next) => {
  try {
    const { taskId } = req.params;

    const suggestPath = path.join(config.upload.uploadPath, `suggestions_${taskId}.json`);

    let suggestData;
    try {
      const content = await fs.readFile(suggestPath, 'utf-8');
      suggestData = JSON.parse(content);
    } catch (error) {
      throw new ValidationError('找不到建議結果');
    }

    res.json({
      success: true,
      data: {
        taskId,
        ...suggestData,
      },
    });
  } catch (error) {
    next(error);
  }
});

function groupSuggestionsByDocument(suggestions) {
  const grouped = {};
  
  suggestions.forEach(suggestion => {
    const docName = suggestion.file;
    
    if (!grouped[docName]) {
      grouped[docName] = {
        document: docName,
        document_type: docName.includes('-F') ? '附件範本' : '主規章',
        total_changes: 0,
        changes: [],
      };
    }
    
    grouped[docName].changes.push({
      regulation_source: suggestion.trace.regulation_anchor,
      target_section: suggestion.section,
      change_type: suggestion.change_type,
      diff_summary: suggestion.diff_summary,
      suggestion_text: suggestion.suggestion_text,
      reason: suggestion.reason,
      similarity: suggestion.similarity, // 確保相似度被傳遞
      keywordMatches: suggestion.keywordMatches, // 確保關鍵字匹配被傳遞
      matchSummary: suggestion.matchSummary,
      keywords: suggestion.keywords,
      trace: suggestion.trace,
    });
    
    grouped[docName].total_changes++;
  });
  
  // 計算每個文件的平均相似度
  Object.values(grouped).forEach(doc => {
    const similarities = doc.changes
      .map(c => c.similarity)
      .filter(s => s !== undefined && s !== null && s > 0);
    
    doc.avgSimilarity = similarities.length > 0
      ? similarities.reduce((sum, s) => sum + s, 0) / similarities.length
      : 0;
  });
  
  return Object.values(grouped).sort((a, b) => b.total_changes - a.total_changes);
}

function extractKeywords(text) {
  if (!text) return [];
  
  const patterns = [
    /資[通訊]安全/g,
    /委外/g,
    /風險[管理評估控制]/g,
    /個[人]?資/g,
    /供應商/g,
    /雲端[運算服務]?/g,
    /備援/g,
    /稽核/g,
    /合約/g,
    /營運持續/g,
    /通報/g,
    /事件/g,
  ];
  
  const keywords = new Set();
  patterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(m => keywords.add(m));
    }
  });
  
  return Array.from(keywords).slice(0, 5);
}

async function prepareFullDocumentContexts(policyContexts) {
  const contexts = [];
  const rulesDir = path.join(__dirname, '../../../data/internal_rules');
  const processedDocs = new Set();
  
  logger.info('準備完整文件上下文...');
  
  const docGroups = {};
  policyContexts.forEach(ctx => {
    const docName = ctx.meta.doc_name;
    if (!docGroups[docName]) {
      docGroups[docName] = {
        name: docName,
        isMain: !docName.includes('-F'),
        snippets: [],
        bestDistance: ctx.distance,
      };
    }
    docGroups[docName].snippets.push(ctx);
    docGroups[docName].bestDistance = Math.min(docGroups[docName].bestDistance, ctx.distance);
  });
  
  const sortedDocs = Object.values(docGroups).sort((a, b) => {
    if (a.isMain && !b.isMain) return -1;
    if (!a.isMain && b.isMain) return 1;
    return a.bestDistance - b.bestDistance;
  });
  
  logger.info(`找到 ${sortedDocs.length} 個不同文件，準備讀取完整內容`);
  
  for (const doc of sortedDocs) {
    if (processedDocs.has(doc.name)) continue;
    
    const filePath = path.join(rulesDir, doc.name);
    let actualFilePath = filePath;
    let needsCleanup = false;
    
    try {
      logger.info(`讀取完整文件: ${doc.name} (${doc.isMain ? '主規章' : '附件範本'})`);
      
      if (needsConversion(filePath)) {
        logger.info(`檢測到 .doc 文件，開始自動轉換: ${doc.name}`);
        actualFilePath = await convertDocToDocx(filePath);
        needsCleanup = true;
        logger.info('轉換完成，繼續讀取');
      }
      
      const result = await mammoth.extractRawText({ path: actualFilePath });
      const fullContent = result.value;
      
      const relevantSections = doc.snippets
        .map(s => s.meta.section_path)
        .filter(Boolean)
        .filter((v, i, a) => a.indexOf(v) === i);
      
      contexts.push({
        type: 'full_document',
        doc_name: doc.name,
        is_primary: doc.isMain,
        content: fullContent,
        relevant_sections: relevantSections,
        distance: doc.bestDistance,
        snippet_count: doc.snippets.length,
      });
      
      logger.info(`✅ 完整文件載入: ${doc.name}, 長度: ${fullContent.length} 字`);
      
      processedDocs.add(doc.name);
      
    } catch (error) {
      logger.warn(`無法讀取完整文件 ${doc.name}: ${error.message}`);
      
      doc.snippets.forEach((snippet, idx) => {
        if (idx === 0) {
          contexts.push({
            type: 'snippet',
            doc_name: doc.name,
            section: snippet.meta.section_path,
            content: snippet.content,
            distance: snippet.distance,
          });
        }
      });
    } finally {
      if (needsCleanup && actualFilePath !== filePath) {
        await cleanupConvertedFile(actualFilePath);
      }
    }
  }
  
  logger.info(`完整文件上下文準備完成: ${contexts.length} 個文件`);
  
  return contexts;
}

export default router;
