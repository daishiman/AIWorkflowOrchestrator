---
id: TASK-9I
title: スキルドキュメント生成機能実装
tier: 3
phase: 9
depends_on: [TASK-9B]
parallel_with: [TASK-9D, TASK-9E, TASK-9F, TASK-9G, TASK-9H, TASK-9J]
blocks: []
status: pending
priority: low
estimated_complexity: medium
tags: [backend, main, skill-management, docs, generation, llm, future]

execution:
  mode: sequential
  timeout_minutes: 60
  retry_count: 1
  allow_partial: false

verification:
  auto_verify: true
  require_tests: true
  require_typecheck: true

artifacts:
  creates:
    - apps/desktop/src/main/services/skill/SkillDocGenerator.ts
    - apps/desktop/src/renderer/components/skill/GenerateDocsDialog.tsx
    - apps/desktop/src/renderer/components/skill/DocPreview.tsx
  modifies:
    - apps/desktop/src/main/ipc/skillHandlers.ts
    - apps/desktop/src/preload/skillAPI.ts
---

# スキルドキュメント生成機能実装

## 概要

スキルの構造を解析し、LLMを使って自動的にドキュメントを生成する機能。

## 入力

- TASK-9B: skill-creator スキル（docsコマンド追加済み）
- specification.md §23: ドキュメント生成機能仕様
- technical-decisions.md §24: 設計判断

## 出力

- SkillDocGenerator サービス
- GenerateDocsDialog / DocPreview UI コンポーネント

## 実装手順

### Step 1: 型定義追加

**ファイル**: `packages/shared/src/types/skillDocs.ts`

```typescript
export interface DocGenerationRequest {
  skillName: string;
  outputFormat: "markdown" | "html" | "pdf";
  includeExamples: boolean;
  includeApiReference: boolean;
  language: "ja" | "en";
  customSections?: string[];
}

export interface GeneratedDoc {
  skillName: string;
  format: "markdown" | "html" | "pdf";
  content: string;
  sections: DocSection[];
  generatedAt: Date;
  wordCount: number;
}

export interface DocSection {
  id: string;
  title: string;
  content: string;
  order: number;
}

export interface DocTemplate {
  id: string;
  name: string;
  description: string;
  sections: TemplateSection[];
}

export interface TemplateSection {
  id: string;
  title: string;
  prompt: string;
  required: boolean;
}
```

### Step 2: SkillDocGenerator 実装

**ファイル**: `apps/desktop/src/main/services/skill/SkillDocGenerator.ts`

```typescript
export class SkillDocGenerator {
  async generate(request: DocGenerationRequest): Promise<GeneratedDoc>;

  async preview(
    skillName: string,
    template?: DocTemplate,
  ): Promise<GeneratedDoc>;

  async exportToFile(doc: GeneratedDoc, outputPath: string): Promise<void>;

  private analyzeSkillStructure(skillPath: string): Promise<SkillAnalysis>;
  private generateSection(
    analysis: SkillAnalysis,
    section: TemplateSection,
  ): Promise<DocSection>;
  private convertToHtml(markdown: string): string;
  private convertToPdf(html: string, outputPath: string): Promise<void>;
}
```

### Step 3: デフォルトテンプレート定義

```typescript
const defaultTemplate: DocTemplate = {
  id: "default",
  name: "Standard Documentation",
  sections: [
    {
      id: "overview",
      title: "概要",
      prompt: "スキルの目的と主な機能を説明してください",
      required: true,
    },
    {
      id: "installation",
      title: "インストール",
      prompt: "スキルのインストール方法を説明してください",
      required: true,
    },
    {
      id: "usage",
      title: "使い方",
      prompt: "基本的な使い方を例とともに説明してください",
      required: true,
    },
    {
      id: "commands",
      title: "コマンド一覧",
      prompt: "利用可能なコマンドを一覧で説明してください",
      required: true,
    },
    {
      id: "configuration",
      title: "設定",
      prompt: "設定オプションを説明してください",
      required: false,
    },
    {
      id: "examples",
      title: "使用例",
      prompt: "実践的な使用例を提供してください",
      required: false,
    },
    {
      id: "troubleshooting",
      title: "トラブルシューティング",
      prompt: "よくある問題と解決方法を説明してください",
      required: false,
    },
  ],
};
```

### Step 4: IPC拡張

**チャネル追加**:

- `skill:docs:generate` - ドキュメント生成
- `skill:docs:preview` - プレビュー生成
- `skill:docs:export` - ファイルエクスポート
- `skill:docs:templates` - テンプレート一覧取得

### Step 5: GenerateDocsDialog 実装

**ファイル**: `apps/desktop/src/renderer/components/skill/GenerateDocsDialog.tsx`

- スキル選択
- 出力フォーマット選択
- 言語選択
- セクション選択
- テンプレート選択
- 生成実行

### Step 6: DocPreview 実装

**ファイル**: `apps/desktop/src/renderer/components/skill/DocPreview.tsx`

- Markdownプレビュー
- セクション編集
- エクスポートボタン
- コピー機能

## 依存パッケージ

```bash
# PDF生成用（オプション）
pnpm --filter @repo/desktop add puppeteer-core
```

## 検証条件

### 必須条件

- [ ] スキルからMarkdownドキュメントを生成できる
- [ ] HTML形式でエクスポートできる
- [ ] 日本語/英語の切り替えができる
- [ ] カスタムセクションを追加できる
- [ ] プレビューが表示される

### 自動検証コマンド

```bash
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/desktop test -- --grep "SkillDocGenerator"
```

## 関連仕様

- specification.md §23: ドキュメント生成機能
- technical-decisions.md §24: 設計判断
