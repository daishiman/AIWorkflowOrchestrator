---
id: TASK-9C
tier: 2
title: スキル改善・自動修正機能
phase: 9
depends_on: [TASK-7D, TASK-8C]
parallel_with: [TASK-9A, TASK-9B]
blocks: [TASK-10A]
status: pending
priority: high
estimated_complexity: large
tags: [backend, main, skill-management, claude-agent-sdk, ai-improvement]

execution:
  mode: sequential
  timeout_minutes: 90
  retry_count: 1
  allow_partial: true

verification:
  auto_verify: true
  require_tests: true
  require_typecheck: true

artifacts:
  creates:
    - apps/desktop/src/main/services/skill/SkillImprover.ts
    - apps/desktop/src/main/services/skill/SkillAnalyzer.ts
    - apps/desktop/src/main/services/skill/PromptOptimizer.ts
  modifies:
    - apps/desktop/src/main/ipc/skillHandlers.ts
    - apps/desktop/src/renderer/store/slices/skillSlice.ts
---

# スキル改善・自動修正機能

## 概要

Claude Agent SDK を活用して、既存スキルを分析・改善・自動修正する機能を実装する。
ユーザーが「このスキルを改善して」と指示するだけで、AI がスキルを自動的に改善する。

## 入力

- TASK-7D: ChatPanel統合済みのUI
- TASK-8C: 統合テスト完了

## 出力

- スキル分析サービス
- スキル改善サービス
- プロンプト最適化機能

## 改善フロー

```
┌──────────────────────────────────────────────────────────────────┐
│                    スキル改善フロー                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ユーザー: 「skill-Xを改善して」                                 │
│       │                                                          │
│       ▼                                                          │
│  ┌─────────────────┐                                            │
│  │  SkillAnalyzer  │  スキル構造・品質を分析                    │
│  └────────┬────────┘                                            │
│           │                                                      │
│           ▼                                                      │
│  ┌─────────────────┐                                            │
│  │ 改善提案を生成   │  Claude Agent SDK で提案生成              │
│  └────────┬────────┘                                            │
│           │                                                      │
│           ▼                                                      │
│  ┌─────────────────┐     ┌─────────────────┐                   │
│  │ ユーザー確認？   │──▶ │ 自動適用モード   │                   │
│  └────────┬────────┘     └────────┬────────┘                   │
│           │ (手動)                │ (自動)                      │
│           ▼                       ▼                              │
│  ┌─────────────────┐     ┌─────────────────┐                   │
│  │ 改善内容を表示   │     │ SkillImprover   │                   │
│  │ ユーザー承認待ち │     │ 自動修正を実行   │                   │
│  └────────┬────────┘     └────────┬────────┘                   │
│           │                       │                              │
│           ▼                       ▼                              │
│  ┌─────────────────────────────────────────┐                    │
│  │            検証・テスト実行              │                    │
│  └─────────────────────────────────────────┘                    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## 実行手順

### Step 1: SkillAnalyzer 実装

**ツール**: Write

**操作**:

```typescript
// apps/desktop/src/main/services/skill/SkillAnalyzer.ts

import fs from "fs/promises";
import path from "path";
import { query } from "@anthropic-ai/claude-agent-sdk";
import type { ImportedSkill } from "@repo/shared";

export interface SkillAnalysis {
  skillName: string;
  overallScore: number; // 0-100
  categories: AnalysisCategory[];
  suggestions: Suggestion[];
  risks: Risk[];
}

export interface AnalysisCategory {
  name: string;
  score: number;
  details: string;
  issues: string[];
}

export interface Suggestion {
  type: "prompt" | "structure" | "security" | "performance" | "documentation";
  priority: "low" | "medium" | "high" | "critical";
  description: string;
  currentCode?: string;
  suggestedCode?: string;
  autoFixable: boolean;
}

export interface Risk {
  level: "low" | "medium" | "high";
  description: string;
  mitigation: string;
}

export class SkillAnalyzer {
  constructor(private skillsDir: string) {}

  async analyze(skill: ImportedSkill): Promise<SkillAnalysis> {
    const skillDir = path.join(this.skillsDir, skill.name);

    // 1. ファイル内容を収集
    const files = await this.collectFiles(skillDir);

    // 2. 静的分析
    const staticAnalysis = this.performStaticAnalysis(files);

    // 3. AI分析（Claude Agent SDK）
    const aiAnalysis = await this.performAIAnalysis(skill, files);

    // 4. 結果を統合
    return this.mergeAnalysis(skill.name, staticAnalysis, aiAnalysis);
  }

  private async collectFiles(skillDir: string): Promise<Map<string, string>> {
    const files = new Map<string, string>();

    const walk = async (dir: string, prefix: string = "") => {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.join(prefix, entry.name);

        if (entry.isDirectory()) {
          await walk(fullPath, relativePath);
        } else if (entry.isFile()) {
          const content = await fs.readFile(fullPath, "utf-8");
          files.set(relativePath, content);
        }
      }
    };

    await walk(skillDir);
    return files;
  }

  private performStaticAnalysis(files: Map<string, string>): StaticAnalysis {
    const issues: string[] = [];
    const metrics: Record<string, number> = {};

    // SKILL.md チェック
    const skillMd = files.get("SKILL.md");
    if (!skillMd) {
      issues.push("SKILL.md が見つかりません");
    } else {
      // Frontmatter チェック
      if (!skillMd.includes("---")) {
        issues.push("SKILL.md に Frontmatter がありません");
      }

      // allowed_tools チェック
      if (!skillMd.includes("allowed_tools")) {
        issues.push("allowed_tools が定義されていません");
      }

      // 説明の充実度
      const wordCount = skillMd.split(/\s+/).length;
      metrics.descriptionLength = wordCount;
      if (wordCount < 100) {
        issues.push("説明が短すぎます（100語未満）");
      }
    }

    // エージェントファイルチェック
    const agentFiles = Array.from(files.keys()).filter((f) =>
      f.startsWith("agents/"),
    );
    metrics.agentCount = agentFiles.length;

    for (const agentFile of agentFiles) {
      const content = files.get(agentFile)!;
      if (content.length < 200) {
        issues.push(`${agentFile} の内容が不十分です`);
      }
    }

    // リファレンスファイルチェック
    const refFiles = Array.from(files.keys()).filter((f) =>
      f.startsWith("references/"),
    );
    metrics.referenceCount = refFiles.length;

    return { issues, metrics };
  }

  private async performAIAnalysis(
    skill: ImportedSkill,
    files: Map<string, string>,
  ): Promise<AIAnalysis> {
    const filesContent = Array.from(files.entries())
      .map(([name, content]) => `=== ${name} ===\n${content}`)
      .join("\n\n");

    const result = await query({
      prompt: `以下のスキルを分析し、改善点を提案してください。

スキル名: ${skill.name}
説明: ${skill.description}

ファイル内容:
${filesContent}

以下の観点で分析してください:
1. プロンプトの品質（明確性、具体性、網羅性）
2. 構造の適切さ（ファイル分割、モジュール化）
3. セキュリティ（危険な操作の制限）
4. ドキュメントの充実度
5. 再利用性・拡張性

JSON形式で回答してください:
{
  "categories": [
    { "name": "プロンプト品質", "score": 80, "details": "...", "issues": [...] }
  ],
  "suggestions": [
    { "type": "prompt", "priority": "high", "description": "...", "autoFixable": true }
  ],
  "risks": [
    { "level": "medium", "description": "...", "mitigation": "..." }
  ]
}`,
      systemPrompt: `あなたはスキル品質分析の専門家です。
客観的かつ建設的なフィードバックを提供してください。`,
      maxTurns: 1,
    });

    return JSON.parse(result.content);
  }

  private mergeAnalysis(
    skillName: string,
    staticAnalysis: StaticAnalysis,
    aiAnalysis: AIAnalysis,
  ): SkillAnalysis {
    // 静的分析の問題をSuggestionに変換
    const staticSuggestions: Suggestion[] = staticAnalysis.issues.map(
      (issue) => ({
        type: "structure" as const,
        priority: "medium" as const,
        description: issue,
        autoFixable: false,
      }),
    );

    // スコア計算
    const overallScore = Math.round(
      aiAnalysis.categories.reduce((sum, cat) => sum + cat.score, 0) /
        aiAnalysis.categories.length,
    );

    return {
      skillName,
      overallScore,
      categories: aiAnalysis.categories,
      suggestions: [...staticSuggestions, ...aiAnalysis.suggestions],
      risks: aiAnalysis.risks,
    };
  }
}

interface StaticAnalysis {
  issues: string[];
  metrics: Record<string, number>;
}

interface AIAnalysis {
  categories: AnalysisCategory[];
  suggestions: Suggestion[];
  risks: Risk[];
}
```

**期待結果**: スキル分析サービスが作成される

### Step 2: SkillImprover 実装

**ツール**: Write

**操作**:

```typescript
// apps/desktop/src/main/services/skill/SkillImprover.ts

import fs from "fs/promises";
import path from "path";
import { query } from "@anthropic-ai/claude-agent-sdk";
import type { SkillAnalysis, Suggestion } from "./SkillAnalyzer";

export interface ImprovementResult {
  applied: Suggestion[];
  skipped: Suggestion[];
  errors: { suggestion: Suggestion; error: string }[];
}

export class SkillImprover {
  constructor(private skillsDir: string) {}

  // 改善を適用
  async applyImprovements(
    skillName: string,
    analysis: SkillAnalysis,
    options: {
      autoFix?: boolean;
      types?: Suggestion["type"][];
      minPriority?: Suggestion["priority"];
    } = {},
  ): Promise<ImprovementResult> {
    const { autoFix = false, types, minPriority = "low" } = options;

    const priorityOrder = ["critical", "high", "medium", "low"];
    const minPriorityIndex = priorityOrder.indexOf(minPriority);

    // フィルタリング
    let suggestions = analysis.suggestions.filter((s) => {
      if (types && !types.includes(s.type)) return false;
      const priorityIndex = priorityOrder.indexOf(s.priority);
      return priorityIndex <= minPriorityIndex;
    });

    // autoFix対象のみ
    if (autoFix) {
      suggestions = suggestions.filter((s) => s.autoFixable);
    }

    const result: ImprovementResult = {
      applied: [],
      skipped: [],
      errors: [],
    };

    for (const suggestion of suggestions) {
      try {
        if (suggestion.autoFixable || autoFix) {
          await this.applySuggestion(skillName, suggestion);
          result.applied.push(suggestion);
        } else {
          result.skipped.push(suggestion);
        }
      } catch (error) {
        result.errors.push({
          suggestion,
          error: String(error),
        });
      }
    }

    return result;
  }

  // 個別の改善を適用
  private async applySuggestion(
    skillName: string,
    suggestion: Suggestion,
  ): Promise<void> {
    const skillDir = path.join(this.skillsDir, skillName);

    switch (suggestion.type) {
      case "prompt":
        await this.improvePrompt(skillDir, suggestion);
        break;
      case "structure":
        await this.improveStructure(skillDir, suggestion);
        break;
      case "documentation":
        await this.improveDocumentation(skillDir, suggestion);
        break;
      case "security":
        await this.improveSecurity(skillDir, suggestion);
        break;
      case "performance":
        // パフォーマンス改善は手動対応
        break;
    }
  }

  // プロンプト改善
  private async improvePrompt(
    skillDir: string,
    suggestion: Suggestion,
  ): Promise<void> {
    if (suggestion.currentCode && suggestion.suggestedCode) {
      // 直接置換
      const skillMdPath = path.join(skillDir, "SKILL.md");
      let content = await fs.readFile(skillMdPath, "utf-8");
      content = content.replace(
        suggestion.currentCode,
        suggestion.suggestedCode,
      );
      await fs.writeFile(skillMdPath, content);
    } else {
      // AIに改善を依頼
      const skillMdPath = path.join(skillDir, "SKILL.md");
      const currentContent = await fs.readFile(skillMdPath, "utf-8");

      const improved = await query({
        prompt: `以下のスキルのプロンプトを改善してください。

改善ポイント: ${suggestion.description}

現在の内容:
${currentContent}

改善後の完全な SKILL.md を出力してください。`,
        systemPrompt: `あなたはプロンプトエンジニアリングの専門家です。
明確で具体的なプロンプトを作成してください。`,
        maxTurns: 1,
      });

      await fs.writeFile(skillMdPath, improved.content);
    }
  }

  // 構造改善
  private async improveStructure(
    skillDir: string,
    suggestion: Suggestion,
  ): Promise<void> {
    // AIに構造改善を依頼
    const files = await this.collectFiles(skillDir);

    const result = await query({
      prompt: `以下のスキルの構造を改善してください。

改善ポイント: ${suggestion.description}

現在のファイル:
${Array.from(files.entries())
  .map(([name, content]) => `=== ${name} ===\n${content}`)
  .join("\n\n")}

必要な変更をJSON形式で出力してください:
{
  "create": [{ "path": "...", "content": "..." }],
  "modify": [{ "path": "...", "content": "..." }],
  "delete": ["..."]
}`,
      maxTurns: 1,
    });

    const changes = JSON.parse(result.content);

    // 変更を適用
    for (const { path: filePath, content } of changes.create || []) {
      const fullPath = path.join(skillDir, filePath);
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, content);
    }

    for (const { path: filePath, content } of changes.modify || []) {
      const fullPath = path.join(skillDir, filePath);
      await fs.writeFile(fullPath, content);
    }

    for (const filePath of changes.delete || []) {
      const fullPath = path.join(skillDir, filePath);
      await fs.unlink(fullPath);
    }
  }

  // ドキュメント改善
  private async improveDocumentation(
    skillDir: string,
    suggestion: Suggestion,
  ): Promise<void> {
    const skillMdPath = path.join(skillDir, "SKILL.md");
    const currentContent = await fs.readFile(skillMdPath, "utf-8");

    const improved = await query({
      prompt: `以下のスキルのドキュメントを充実させてください。

改善ポイント: ${suggestion.description}

現在の内容:
${currentContent}

以下を追加・改善してください:
- 使用例
- パラメータ説明
- 注意事項
- トラブルシューティング

改善後の完全な SKILL.md を出力してください。`,
      maxTurns: 1,
    });

    await fs.writeFile(skillMdPath, improved.content);
  }

  // セキュリティ改善
  private async improveSecurity(
    skillDir: string,
    suggestion: Suggestion,
  ): Promise<void> {
    const skillMdPath = path.join(skillDir, "SKILL.md");
    const currentContent = await fs.readFile(skillMdPath, "utf-8");

    const improved = await query({
      prompt: `以下のスキルにセキュリティ対策を追加してください。

セキュリティ課題: ${suggestion.description}

現在の内容:
${currentContent}

以下を追加・改善してください:
- 危険な操作の制限（allowed_tools の見直し）
- 入力検証の追加
- 警告メッセージの追加

改善後の完全な SKILL.md を出力してください。`,
      maxTurns: 1,
    });

    await fs.writeFile(skillMdPath, improved.content);
  }

  private async collectFiles(dir: string): Promise<Map<string, string>> {
    const files = new Map<string, string>();
    const walk = async (currentDir: string, prefix: string = "") => {
      const entries = await fs.readdir(currentDir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        const relativePath = path.join(prefix, entry.name);
        if (entry.isDirectory()) {
          await walk(fullPath, relativePath);
        } else {
          files.set(relativePath, await fs.readFile(fullPath, "utf-8"));
        }
      }
    };
    await walk(dir);
    return files;
  }
}
```

**期待結果**: スキル改善サービスが作成される

### Step 3: PromptOptimizer 実装

**ツール**: Write

**操作**:

```typescript
// apps/desktop/src/main/services/skill/PromptOptimizer.ts

import { query } from "@anthropic-ai/claude-agent-sdk";

export interface OptimizationResult {
  original: string;
  optimized: string;
  changes: string[];
  metrics: {
    clarityScore: number;
    specificityScore: number;
    completenessScore: number;
  };
}

export class PromptOptimizer {
  // プロンプトを最適化
  async optimize(prompt: string): Promise<OptimizationResult> {
    const result = await query({
      prompt: `以下のプロンプトを最適化してください。

元のプロンプト:
${prompt}

最適化の観点:
1. 明確性（Clarity）: 曖昧な表現を具体的に
2. 具体性（Specificity）: 抽象的な指示を具体的なステップに
3. 網羅性（Completeness）: 必要な情報を漏れなく

JSON形式で回答してください:
{
  "optimized": "最適化後のプロンプト",
  "changes": ["変更点1", "変更点2", ...],
  "metrics": {
    "clarityScore": 85,
    "specificityScore": 90,
    "completenessScore": 80
  }
}`,
      systemPrompt: `あなたはプロンプトエンジニアリングの専門家です。
Claude が最も効果的に動作するプロンプトを作成してください。

ベストプラクティス:
- 明確な役割定義
- 具体的な出力形式
- 制約条件の明示
- 例示の活用`,
      maxTurns: 1,
    });

    const parsed = JSON.parse(result.content);

    return {
      original: prompt,
      optimized: parsed.optimized,
      changes: parsed.changes,
      metrics: parsed.metrics,
    };
  }

  // A/Bテスト用の複数バリアント生成
  async generateVariants(prompt: string, count: number = 3): Promise<string[]> {
    const result = await query({
      prompt: `以下のプロンプトの異なるバリアントを${count}個生成してください。

元のプロンプト:
${prompt}

各バリアントは異なるアプローチを取ってください:
1. より簡潔なバージョン
2. より詳細なバージョン
3. より構造化されたバージョン

JSON配列で回答してください: ["バリアント1", "バリアント2", ...]`,
      maxTurns: 1,
    });

    return JSON.parse(result.content);
  }

  // プロンプトの評価
  async evaluate(prompt: string): Promise<{
    score: number;
    feedback: string[];
  }> {
    const result = await query({
      prompt: `以下のプロンプトを評価してください。

プロンプト:
${prompt}

評価観点:
1. 明確性 (0-100)
2. 具体性 (0-100)
3. 網羅性 (0-100)
4. 再現性 (0-100)
5. セキュリティ (0-100)

JSON形式で回答:
{
  "score": 総合スコア,
  "breakdown": { "clarity": 80, ... },
  "feedback": ["改善点1", "改善点2", ...]
}`,
      maxTurns: 1,
    });

    const parsed = JSON.parse(result.content);
    return {
      score: parsed.score,
      feedback: parsed.feedback,
    };
  }
}
```

**期待結果**: プロンプト最適化サービスが作成される

## 検証条件

### 必須条件

- [ ] スキルの分析結果が取得できる
- [ ] 分析結果にスコアと改善提案が含まれる
- [ ] 自動改善が実行できる
- [ ] 改善後のスキルが正常に動作する
- [ ] プロンプト最適化が機能する
- [ ] バックアップが作成される（ロールバック可能）

### 自動検証コマンド

```bash
# 型チェック
pnpm --filter @repo/desktop typecheck

# テスト
pnpm --filter @repo/desktop test -- --grep "SkillImprover"
```

## メモ

- 改善はバックアップを作成してから実行
- 破壊的な変更は手動確認を必須とする
- AI生成の改善案は必ず検証してから適用
