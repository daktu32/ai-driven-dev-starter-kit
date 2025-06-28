---
name: Template File Cleanup
about: テンプレートファイルの残存と重複ファイル問題の修正
title: "[修正] テンプレートファイル残存と重複ファイル問題"
labels: bug, cleanup
assignees: ''

---

## 🚨 問題の概要

スケルトン生成時に以下の問題が発生しています：

1. **テンプレートファイルの残存**: `.template` 拡張子が除去されていないファイルが存在
2. **ファイルの重複**: 同じファイルがルートと `docs/` に重複して生成
3. **処理フローの不整合**: プロジェクト構造コピーとドキュメント処理が独立

## 🔍 具体的な問題

### 1. テンプレートファイル残存
```bash
# 発見されたファイル
/Users/aiq/work/mcp-tabelog-search/tools/ci-cd/deploy.yml.template

# 期待される状態
/Users/aiq/work/mcp-tabelog-search/tools/ci-cd/deploy.yml
```

### 2. ファイル重複
```bash
# 重複ファイル
/Users/aiq/work/mcp-tabelog-search/ARCHITECTURE.md      # 9.6 KB
/Users/aiq/work/mcp-tabelog-search/docs/ARCHITECTURE.md # 6.7 KB

/Users/aiq/work/mcp-tabelog-search/README.md           # 1.9 KB  
/Users/aiq/work/mcp-tabelog-search/docs/README.md      # 3.7 KB
```

### 3. 処理フローの問題
```
現在のフロー:
copyProjectStructure() → templates/project-structures/mcp-server/ をコピー
     ↓ (独立した処理)
processDocumentTemplates() → templates/docs/ を処理
     ↓ 
結果: ファイルが重複、処理が非効率
```

## 💡 解決策

### 1. 統一されたテンプレート処理システム

```typescript
export class UnifiedTemplateProcessor {
  private processedFiles: Set<string> = new Set();
  
  async processAllTemplates(config: ProjectConfig, targetPath: string): Promise<void> {
    // 処理順序を制御
    await this.processProjectStructure(config, targetPath);
    await this.processAdditionalDocuments(config, targetPath);
    await this.cleanupDuplicates(targetPath);
  }
  
  private async processProjectStructure(config: ProjectConfig, targetPath: string): Promise<void> {
    const templatePath = path.join(this.sourceDir, 'templates', 'project-structures', config.projectType);
    
    await this.processDirectoryRecursively(templatePath, targetPath, config);
  }
  
  private async processDirectoryRecursively(
    sourcePath: string, 
    targetPath: string, 
    config: ProjectConfig
  ): Promise<void> {
    const items = await readdir(sourcePath, { withFileTypes: true });
    
    for (const item of items) {
      const sourceItemPath = path.join(sourcePath, item.name);
      
      if (item.isFile()) {
        await this.processTemplateFile(sourceItemPath, targetPath, config);
      } else if (item.isDirectory()) {
        const targetDirPath = path.join(targetPath, item.name);
        await fs.ensureDir(targetDirPath);
        await this.processDirectoryRecursively(sourceItemPath, targetDirPath, config);
      }
    }
  }
  
  private async processTemplateFile(
    sourceFilePath: string, 
    targetDirPath: string, 
    config: ProjectConfig
  ): Promise<void> {
    const fileName = path.basename(sourceFilePath);
    
    // .template 拡張子を除去
    const targetFileName = fileName.endsWith('.template') 
      ? fileName.replace('.template', '') 
      : fileName;
    
    const targetFilePath = path.join(targetDirPath, targetFileName);
    
    // 重複チェック
    if (this.processedFiles.has(targetFilePath)) {
      console.warn(`ファイル重複をスキップ: ${targetFilePath}`);
      return;
    }
    
    // ファイル内容を読み込み、変数置換
    let content = await fs.readFile(sourceFilePath, 'utf-8');
    content = this.replaceVariables(content, config);
    
    // ファイル作成
    await fs.ensureDir(path.dirname(targetFilePath));
    await fs.writeFile(targetFilePath, content, 'utf-8');
    
    // 処理済みマーク
    this.processedFiles.add(targetFilePath);
  }
}
```

### 2. 重複ファイル管理戦略

```typescript
interface FileConflictResolution {
  strategy: 'skip' | 'overwrite' | 'merge' | 'rename';
  priority: 'project-structure' | 'documents' | 'user-defined';
}

const conflictResolution: { [key: string]: FileConflictResolution } = {
  'ARCHITECTURE.md': {
    strategy: 'skip',  // プロジェクト構造の方を優先
    priority: 'project-structure'
  },
  'README.md': {
    strategy: 'skip',  // プロジェクト構造の方を優先  
    priority: 'project-structure'
  },
  'docs/ARCHITECTURE.md': {
    strategy: 'overwrite', // ドキュメント処理で上書き
    priority: 'documents'
  }
};
```

### 3. ファイル優先度の明確化

```
プロジェクト構造ファイル (優先度: 高)
├── package.json
├── tsconfig.json  
├── src/
├── README.md              ← プロジェクト用README
└── ARCHITECTURE.md        ← プロジェクト用アーキテクチャ

ドキュメントファイル (優先度: 中)
└── docs/
    ├── README.md          ← ドキュメント用README  
    ├── ARCHITECTURE.md    ← 詳細アーキテクチャ
    ├── PRD.md
    └── ...
```

### 4. テンプレート除去の確実な実行

```typescript
private async cleanupTemplateFiles(targetPath: string): Promise<void> {
  // .template ファイルを再帰的に検索
  const templateFiles = await glob('**/*.template', { 
    cwd: targetPath,
    absolute: true 
  });
  
  for (const templateFile of templateFiles) {
    const cleanFile = templateFile.replace('.template', '');
    
    // .template ファイルを削除（既に処理済みのはず）
    if (await fs.pathExists(cleanFile)) {
      await fs.remove(templateFile);
      console.log(`テンプレートファイルを削除: ${templateFile}`);
    } else {
      console.warn(`処理されていないテンプレートファイル: ${templateFile}`);
    }
  }
}
```

## 🧪 テストケース

```typescript
describe('Template Processing', () => {
  it('should not leave .template files', async () => {
    await generateProject({...config});
    
    const templateFiles = await glob('**/*.template', { cwd: targetPath });
    expect(templateFiles).toHaveLength(0);
  });
  
  it('should not create duplicate files', async () => {
    await generateProject({...config});
    
    // 重複可能性のあるファイルをチェック
    const rootArchitecture = await fs.pathExists(path.join(targetPath, 'ARCHITECTURE.md'));
    const docsArchitecture = await fs.pathExists(path.join(targetPath, 'docs/ARCHITECTURE.md'));
    
    // 両方存在する場合は内容が異なることを確認
    if (rootArchitecture && docsArchitecture) {
      const rootContent = await fs.readFile(path.join(targetPath, 'ARCHITECTURE.md'), 'utf-8');
      const docsContent = await fs.readFile(path.join(targetPath, 'docs/ARCHITECTURE.md'), 'utf-8');
      
      expect(rootContent).not.toEqual(docsContent);
    }
  });
});
```

## 📊 実装優先度

### Phase 1: 緊急修正
- [ ] `.template` ファイル除去の修正
- [ ] 重複ファイル問題の解決

### Phase 2: 統合改善  
- [ ] UnifiedTemplateProcessor の実装
- [ ] ファイル優先度戦略の実装

### Phase 3: 品質向上
- [ ] テストケースの追加
- [ ] ドキュメント更新

## 🔗 関連Issue

- #18 fs-extra インポートエラーの修正（完了）
- #21 3層構造の変数置換戦略
- #19 トランザクション処理とロールバック機能

## ✅ 完了条件

- [ ] 生成されたプロジェクトに `.template` ファイルが残らない
- [ ] ファイル重複が解消される
- [ ] 処理フローが統一される
- [ ] テストで品質が保証される