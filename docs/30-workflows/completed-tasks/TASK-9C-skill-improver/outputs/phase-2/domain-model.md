# TASK-9C ドメインモデル定義

## メタ情報

| 項目   | 値                               |
| ------ | -------------------------------- |
| タスク | TASK-9C スキル改善・自動修正機能 |
| 作成日 | 2026-02-03                       |
| Phase  | 2                                |

---

## エンティティ一覧

| #   | エンティティ名     | 説明                       |
| --- | ------------------ | -------------------------- |
| 1   | SkillAnalysis      | スキル分析結果             |
| 2   | AnalysisCategory   | 分析カテゴリ（スコア付き） |
| 3   | Suggestion         | 改善提案                   |
| 4   | Risk               | リスク評価                 |
| 5   | ImprovementResult  | 改善適用結果               |
| 6   | OptimizationResult | プロンプト最適化結果       |
| 7   | PromptEvaluation   | プロンプト評価結果         |
| 8   | ImprovementOptions | 改善オプション             |

---

## 1. SkillAnalysis（スキル分析結果）

```typescript
/**
 * スキル分析結果
 * SkillAnalyzer.analyze() の戻り値
 */
interface SkillAnalysis {
  /** 分析対象のスキル名 */
  skillName: string;

  /** 総合スコア (0-100) */
  overallScore: number;

  /** カテゴリ別スコア */
  categories: AnalysisCategory[];

  /** 改善提案リスト */
  suggestions: Suggestion[];

  /** リスク評価リスト */
  risks: Risk[];
}
```

### 制約

- `overallScore` は 0〜100 の整数
- `categories` は 1件以上
- `suggestions` は 0件以上

---

## 2. AnalysisCategory（分析カテゴリ）

```typescript
/**
 * 分析カテゴリ
 * 各観点でのスコアと詳細
 */
interface AnalysisCategory {
  /** カテゴリ名 */
  name: "prompt" | "structure" | "security" | "documentation";

  /** カテゴリスコア (0-100) */
  score: number;

  /** 詳細説明 */
  details: string;

  /** 検出された問題点 */
  issues: string[];
}
```

### カテゴリ定義

| name          | 説明               | 評価観点                      |
| ------------- | ------------------ | ----------------------------- |
| prompt        | プロンプト品質     | 明確性、具体性、網羅性        |
| structure     | 構造の適切さ       | ファイル分割、モジュール化    |
| security      | セキュリティ       | allowed_tools、危険操作の制限 |
| documentation | ドキュメント充実度 | 説明、使用例、注意事項        |

---

## 3. Suggestion（改善提案）

```typescript
/**
 * 改善提案
 * 分析結果に含まれる具体的な改善アクション
 */
interface Suggestion {
  /** 改善タイプ */
  type: "prompt" | "structure" | "security" | "performance" | "documentation";

  /** 優先度 */
  priority: "low" | "medium" | "high" | "critical";

  /** 改善内容の説明 */
  description: string;

  /** 現在のコード（置換対象） */
  currentCode?: string;

  /** 提案するコード（置換後） */
  suggestedCode?: string;

  /** 自動修正可能かどうか */
  autoFixable: boolean;
}
```

### 優先度定義

| priority | 説明         | 対応             |
| -------- | ------------ | ---------------- |
| critical | 致命的な問題 | 即座に対応必須   |
| high     | 重要な問題   | 早急に対応推奨   |
| medium   | 改善推奨     | 時間があれば対応 |
| low      | 軽微な改善   | 任意             |

---

## 4. Risk（リスク評価）

```typescript
/**
 * リスク評価
 * スキルに潜在するリスクと緩和策
 */
interface Risk {
  /** リスクレベル */
  level: "low" | "medium" | "high";

  /** リスクの説明 */
  description: string;

  /** 緩和策 */
  mitigation: string;
}
```

---

## 5. ImprovementResult（改善適用結果）

```typescript
/**
 * 改善適用結果
 * SkillImprover.applyImprovements() の戻り値
 */
interface ImprovementResult {
  /** 適用された改善 */
  applied: Suggestion[];

  /** スキップされた改善（手動確認必要） */
  skipped: Suggestion[];

  /** エラーが発生した改善 */
  errors: {
    suggestion: Suggestion;
    error: string;
  }[];
}
```

---

## 6. OptimizationResult（プロンプト最適化結果）

```typescript
/**
 * プロンプト最適化結果
 * PromptOptimizer.optimize() の戻り値
 */
interface OptimizationResult {
  /** 元のプロンプト */
  original: string;

  /** 最適化後のプロンプト */
  optimized: string;

  /** 変更点のリスト */
  changes: string[];

  /** 品質メトリクス */
  metrics: {
    /** 明確性スコア (0-100) */
    clarityScore: number;

    /** 具体性スコア (0-100) */
    specificityScore: number;

    /** 網羅性スコア (0-100) */
    completenessScore: number;
  };
}
```

---

## 7. PromptEvaluation（プロンプト評価結果）

```typescript
/**
 * プロンプト評価結果
 * PromptOptimizer.evaluate() の戻り値
 */
interface PromptEvaluation {
  /** 総合スコア (0-100) */
  score: number;

  /** フィードバックリスト */
  feedback: string[];
}
```

---

## 8. ImprovementOptions（改善オプション）

```typescript
/**
 * 改善オプション
 * SkillImprover.applyImprovements() のオプション引数
 */
interface ImprovementOptions {
  /** 自動修正を有効にするか（デフォルト: false） */
  autoFix?: boolean;

  /** 適用する改善タイプのフィルタ */
  types?: Suggestion["type"][];

  /** 最低優先度（これ以上の優先度のみ適用） */
  minPriority?: Suggestion["priority"];
}
```

---

## エンティティ関係図

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ImportedSkill ──────────┬──────────────────────────────────┐  │
│  (既存型)                │                                  │  │
│                          │ analyze()                        │  │
│                          ▼                                  │  │
│               ┌──────────────────┐                          │  │
│               │  SkillAnalysis   │                          │  │
│               ├──────────────────┤                          │  │
│               │ skillName        │                          │  │
│               │ overallScore     │                          │  │
│               │ categories ──────┼──▶ AnalysisCategory[]    │  │
│               │ suggestions ─────┼──▶ Suggestion[]          │  │
│               │ risks ───────────┼──▶ Risk[]                │  │
│               └────────┬─────────┘                          │  │
│                        │                                    │  │
│                        │ applyImprovements()                │  │
│                        ▼                                    │  │
│               ┌──────────────────┐                          │  │
│               │ ImprovementResult│                          │  │
│               ├──────────────────┤                          │  │
│               │ applied ─────────┼──▶ Suggestion[]          │  │
│               │ skipped ─────────┼──▶ Suggestion[]          │  │
│               │ errors           │                          │  │
│               └──────────────────┘                          │  │
│                                                             │  │
│  PromptOptimizer                                            │  │
│  ┌────────────────────────────────────────────────────────┐ │  │
│  │                                                        │ │  │
│  │  optimize() ──────────▶ OptimizationResult            │ │  │
│  │  evaluate() ──────────▶ PromptEvaluation              │ │  │
│  │  generateVariants() ──▶ string[]                      │ │  │
│  │                                                        │ │  │
│  └────────────────────────────────────────────────────────┘ │  │
│                                                             │  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 型定義ファイルパス

```
packages/shared/src/types/skill-improver.ts
```

---

## 作成日時

- **作成**: 2026-02-03
- **作成者**: AI (Phase 2 自動生成)
