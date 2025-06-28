#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import { DocumentTemplateProcessor } from './scripts/lib/documentTemplateProcessor.js';

// 簡単なテスト用設定
const testConfig = {
  projectName: 'mcp-tabelog-search',
  projectType: 'mcp-server',
  description: 'mcp-tabelog-search - AI駆動開発スターターキットで生成',
  repositoryUrl: 'https://github.com/your-username/mcp-tabelog-search',
  prompt: 'basic-development',
  techStack: {
    frontend: 'N/A',
    backend: 'Node.js/TypeScript',
    database: 'JSON Files',
    infrastructure: 'Docker',
    deployment: 'npm Registry',
    monitoring: 'Logs',
  },
  team: {
    size: 1,
    type: 'individual',
    industry: 'Technology',
    complianceLevel: 'low',
  },
  customizations: {},
};

const targetPath = '/Users/aiq/work/mcp-tabelog-search';

async function testDocumentGeneration() {
  try {
    console.log('📋 ドキュメントテンプレート処理開始...');
    
    const processor = new DocumentTemplateProcessor();
    
    // ドキュメント処理
    const processedFiles = await processor.processDocumentTemplates(testConfig, targetPath);
    console.log(`✅ ${processedFiles.length}個のドキュメントを処理しました`);
    
    // CLAUDE.md生成
    await processor.createProjectCLAUDE(testConfig, targetPath);
    console.log('✅ CLAUDE.mdを生成しました');
    
    console.log('\n📁 生成されたファイル:');
    for (const file of processedFiles) {
      console.log(`  - docs/${file}`);
    }
    console.log('  - CLAUDE.md');
    
  } catch (error) {
    console.error('❌ エラー:', error);
  }
}

testDocumentGeneration();