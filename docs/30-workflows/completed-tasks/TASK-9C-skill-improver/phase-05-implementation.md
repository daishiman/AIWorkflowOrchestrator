# Phase 5: 実装（TDD: Green）

## メタ情報

| 項目   | 値                               |
| ------ | -------------------------------- |
| Phase  | 5                                |
| タスク | TASK-9C スキル改善・自動修正機能 |
| 作成日 | 2026-02-03                       |

## 目的

テストを通すための最小限の実装を行う。

## 実行タスク

- SkillAnalyzer実装: スキル分析サービス
- SkillImprover実装: スキル改善サービス
- PromptOptimizer実装: プロンプト最適化サービス
- IPC統合: skillHandlers.tsへのチャネル追加
- 型定義追加: @repo/sharedへの型追加

## 参照資料

| 資料名       | パス                                                        | 説明          |
| ------------ | ----------------------------------------------------------- | ------------- |
| 設計書       | `outputs/phase-2/architecture-design.md`                    | Phase 2成果物 |
| テスト仕様書 | `outputs/phase-4/test-specification.md`                     | Phase 4成果物 |
| SDK仕様      | `aiworkflow-requirements: interfaces-agent-sdk-executor.md` | SDK API       |

## 実行手順

### 1. 型定義追加（@repo/shared）

```typescript
// packages/shared/src/types/skill-improver.ts

export interface SkillAnalysis {
  skillName: string;
  overallScore: number;
  categories: AnalysisCategory[];
  suggestions: Suggestion[];
  risks: Risk[];
}

export interface AnalysisCategory {
  name: "prompt" | "structure" | "security" | "documentation";
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

export interface ImprovementResult {
  applied: Suggestion[];
  skipped: Suggestion[];
  errors: { suggestion: Suggestion; error: string }[];
}

export interface ImprovementOptions {
  autoFix?: boolean;
  types?: Suggestion["type"][];
  minPriority?: Suggestion["priority"];
}

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

export interface PromptEvaluation {
  score: number;
  feedback: string[];
}
```

### 2. SkillAnalyzer実装

```typescript
// apps/desktop/src/main/services/skill/SkillAnalyzer.ts

import fs from "fs/promises";
import path from "path";
import { query } from "@anthropic-ai/claude-agent-sdk";
import type {
  ImportedSkill,
  SkillAnalysis,
  AnalysisCategory,
  Suggestion,
  Risk,
} from "@repo/shared";

interface StaticAnalysis {
  issues: string[];
  metrics: Record<string, number>;
}

interface AIAnalysis {
  categories: AnalysisCategory[];
  suggestions: Suggestion[];
  risks: Risk[];
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
    // 実装: ディレクトリを再帰的に走査してファイル内容を収集
  }

  private performStaticAnalysis(files: Map<string, string>): StaticAnalysis {
    // 実装: SKILL.md、agents/、references/ の静的チェック
  }

  private async performAIAnalysis(
    skill: ImportedSkill,
    files: Map<string, string>,
  ): Promise<AIAnalysis> {
    // 実装: Claude Agent SDK query() を使用してAI分析
  }

  private mergeAnalysis(
    skillName: string,
    staticAnalysis: StaticAnalysis,
    aiAnalysis: AIAnalysis,
  ): SkillAnalysis {
    // 実装: 静的分析とAI分析を統合
  }
}
```

### 3. SkillImprover実装

```typescript
// apps/desktop/src/main/services/skill/SkillImprover.ts

import fs from "fs/promises";
import path from "path";
import { query } from "@anthropic-ai/claude-agent-sdk";
import type {
  SkillAnalysis,
  Suggestion,
  ImprovementResult,
  ImprovementOptions,
} from "@repo/shared";

export class SkillImprover {
  constructor(private skillsDir: string) {}

  async applyImprovements(
    skillName: string,
    analysis: SkillAnalysis,
    options: ImprovementOptions = {},
  ): Promise<ImprovementResult> {
    // 1. バックアップ作成
    await this.createBackup(skillName);

    // 2. フィルタリングとソート
    const suggestions = this.filterAndSortSuggestions(
      analysis.suggestions,
      options,
    );

    // 3. 各改善を適用
    const result: ImprovementResult = { applied: [], skipped: [], errors: [] };

    for (const suggestion of suggestions) {
      try {
        if (suggestion.autoFixable || options.autoFix) {
          await this.applySuggestion(skillName, suggestion);
          result.applied.push(suggestion);
        } else {
          result.skipped.push(suggestion);
        }
      } catch (error) {
        result.errors.push({ suggestion, error: String(error) });
      }
    }

    return result;
  }

  private async createBackup(skillName: string): Promise<void> {
    // 実装: スキルディレクトリのバックアップ作成
  }

  private filterAndSortSuggestions(
    suggestions: Suggestion[],
    options: ImprovementOptions,
  ): Suggestion[] {
    // 実装: オプションに基づくフィルタリングとソート
  }

  private async applySuggestion(
    skillName: string,
    suggestion: Suggestion,
  ): Promise<void> {
    // 実装: 改善タイプに応じた適用処理
  }

  async restoreFromBackup(skillName: string): Promise<void> {
    // 実装: バックアップからの復元
  }
}
```

### 4. PromptOptimizer実装

```typescript
// apps/desktop/src/main/services/skill/PromptOptimizer.ts

import { query } from "@anthropic-ai/claude-agent-sdk";
import type { OptimizationResult, PromptEvaluation } from "@repo/shared";

export class PromptOptimizer {
  async optimize(prompt: string): Promise<OptimizationResult> {
    // 実装: Claude Agent SDK query() を使用してプロンプト最適化
  }

  async generateVariants(prompt: string, count: number = 3): Promise<string[]> {
    // 実装: 複数バリアント生成
  }

  async evaluate(prompt: string): Promise<PromptEvaluation> {
    // 実装: プロンプト評価
  }
}
```

### 5. IPCハンドラー追加

```typescript
// apps/desktop/src/main/ipc/skillHandlers.ts に追加

import { SkillAnalyzer } from "../services/skill/SkillAnalyzer";
import { SkillImprover } from "../services/skill/SkillImprover";
import { PromptOptimizer } from "../services/skill/PromptOptimizer";

// 分析チャネル
ipcMain.handle("skill:analyze", async (_, { skillName }) => {
  const analyzer = new SkillAnalyzer(skillsDir);
  const skill = await skillService.getSkillByName(skillName);
  return analyzer.analyze(skill);
});

// 改善チャネル
ipcMain.handle("skill:improve", async (_, { skillName, options }) => {
  const improver = new SkillImprover(skillsDir);
  const analyzer = new SkillAnalyzer(skillsDir);
  const skill = await skillService.getSkillByName(skillName);
  const analysis = await analyzer.analyze(skill);
  return improver.applyImprovements(skillName, analysis, options);
});

// 最適化チャネル
ipcMain.handle("skill:optimize", async (_, { prompt }) => {
  const optimizer = new PromptOptimizer();
  return optimizer.optimize(prompt);
});

// バリアント生成チャネル
ipcMain.handle("skill:optimize:variants", async (_, { prompt, count }) => {
  const optimizer = new PromptOptimizer();
  return optimizer.generateVariants(prompt, count);
});

// 評価チャネル
ipcMain.handle("skill:optimize:evaluate", async (_, { prompt }) => {
  const optimizer = new PromptOptimizer();
  return optimizer.evaluate(prompt);
});
```

## 統合テスト連携【必須】

フロント/バック接続の実装とテスト支援コード整備:

| 実装項目           | 内容                                                        |
| ------------------ | ----------------------------------------------------------- |
| IPC接続            | 5チャネル（analyze, improve, optimize, variants, evaluate） |
| エラーハンドリング | SDK/FSエラーをIpcResultでラップ                             |
| バックアップ       | 改善前に `${skillName}.backup` ディレクトリ作成             |

## アーキテクチャ層別実装（AIが判断）

| 層           | 実装観点                                      | 実装ファイル配置                              |
| ------------ | --------------------------------------------- | --------------------------------------------- |
| Main Process | SkillAnalyzer, SkillImprover, PromptOptimizer | `apps/desktop/src/main/services/skill/`       |
| IPC通信      | 5チャネルハンドラー                           | `apps/desktop/src/main/ipc/skillHandlers.ts`  |
| Shared       | 型定義                                        | `packages/shared/src/types/skill-improver.ts` |

## 成果物

| 成果物          | パス                                                      | 説明           |
| --------------- | --------------------------------------------------------- | -------------- |
| SkillAnalyzer   | `apps/desktop/src/main/services/skill/SkillAnalyzer.ts`   | 分析サービス   |
| SkillImprover   | `apps/desktop/src/main/services/skill/SkillImprover.ts`   | 改善サービス   |
| PromptOptimizer | `apps/desktop/src/main/services/skill/PromptOptimizer.ts` | 最適化サービス |
| 型定義          | `packages/shared/src/types/skill-improver.ts`             | 共通型定義     |
| IPCハンドラー   | `apps/desktop/src/main/ipc/skillHandlers.ts`（修正）      | IPC追加        |

## 完了条件

- [ ] SkillAnalyzer が実装されている
- [ ] SkillImprover が実装されている
- [ ] PromptOptimizer が実装されている
- [ ] すべてのテストが成功状態（Green）
- [ ] 型定義が @repo/shared に追加されている
- [ ] IPCチャネルが5つ追加されている
- [ ] バックアップ機能が動作する
- [ ] **本Phase内の全タスクを100%実行完了**

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test

# 確認項目
# - [ ] テストが成功することを確認（Green状態）
```

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 型定義追加（@repo/shared）
2. SkillAnalyzer実装
3. SkillImprover実装
4. PromptOptimizer実装
5. IPCハンドラー追加（5チャネル）
6. テスト実行・Green状態確認
7. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] テストが成功状態（Green）であることを確認
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/skill-import-agent-system/tasks/TASK-9C-skill-improver --phase 5
```

---

## 次のPhase

Phase 6: テスト拡充
