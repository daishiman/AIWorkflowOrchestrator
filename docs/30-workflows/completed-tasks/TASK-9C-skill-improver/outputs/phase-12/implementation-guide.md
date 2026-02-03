# TASK-9C 実装ガイド: スキル改善・自動修正機能

## メタ情報

| 項目   | 値                               |
| ------ | -------------------------------- |
| タスク | TASK-9C スキル改善・自動修正機能 |
| 作成日 | 2026-02-03                       |
| 対象   | AIWorkflowOrchestrator           |

---

# Part 1: 概念説明（中学生でもわかる版）

## この機能は何をするの？

**一言でいうと**: AIが「スキル」と呼ばれる設定ファイルを自動的にチェックして、より良くする提案をしてくれる機能です。

### なぜこの機能が必要なの？

スキルというのは、AIに「こうやって仕事をしてね」と教える説明書のようなものです。

でも、この説明書をうまく書くのは意外と難しい。

- 説明が曖昧だと、AIが勘違いしてしまう
- 大事なことを書き忘れると、AIが必要な情報を持っていない
- 古い書き方のままだと、効率が悪い

そこで、**AIが説明書をチェックして、「ここをこう直すといいよ」と教えてくれる**のがこの機能です。

---

## 日常生活でたとえると？

### 📝 スキル分析 = 「テストの採点」

学校のテストを先生が採点するイメージです。

| テストの採点                     | スキル分析                    |
| -------------------------------- | ----------------------------- |
| 答案用紙                         | スキルファイル（SKILL.md）    |
| 先生が赤ペンでチェック           | AIが問題点を発見              |
| 点数をつける（0〜100点）         | スコアをつける（0〜100点）    |
| 「ここが間違っている」とコメント | 改善提案（suggestions）を生成 |

### 💡 改善提案 = 「コーチからのアドバイス」

スポーツのコーチが「もっとこうしたら上手くなるよ」とアドバイスをくれるイメージです。

- **優先度が高いアドバイス**: 「フォームを直さないと怪我するよ！」→ すぐ直すべき
- **優先度が中くらい**: 「体力をつけるともっと良くなるよ」→ できれば直す
- **優先度が低い**: 「ユニフォームの色を変えてもいいね」→ 余裕があれば

### 🔧 自動修正 = 「スペルチェック」

Wordで文章を書いていると、スペルミスに赤い波線が出て、クリックすると自動で直してくれますよね。それと同じです。

- AIが「ここはこう書いた方がいい」と判断
- ワンクリックで自動的に修正
- 心配なら、修正前の状態も保存しておける（バックアップ）

### 💾 バックアップ = 「テストの下書きを保存しておく」

テストで答えを書き直す前に、元の答えを消しゴムで消してしまったら、後から「やっぱり最初の答えが正しかった」となっても困りますよね。

だから、修正を加える前に、元の状態をコピーして保存しておきます。これを「バックアップ」といいます。

---

## この機能でできること

| 機能             | 日常の例え           | 説明                                   |
| ---------------- | -------------------- | -------------------------------------- |
| スキル分析       | テストの採点         | スキルの品質をチェックして点数をつける |
| 改善提案         | コーチのアドバイス   | 「ここを直すといいよ」と具体的に教える |
| 自動修正         | スペルチェック       | ワンクリックで自動的に修正する         |
| バックアップ     | 下書きの保存         | 修正前の状態を保存しておく             |
| 復元             | 下書きから書き直し   | 間違えたら元に戻せる                   |
| プロンプト最適化 | 作文の添削           | AIへの指示文をより良くする             |
| バリアント生成   | 同じ内容の別の言い方 | 「こういう言い方もあるよ」を提案       |

---

## まとめ

この機能は、**AIがスキル（説明書）を自動でチェックして、より良くするお手伝いをしてくれる**ものです。

- 先生のように採点してくれる
- コーチのようにアドバイスしてくれる
- スペルチェックのように自動で直してくれる
- 消しゴムで消す前に、元の状態を保存しておいてくれる

---

# Part 2: 技術的詳細（開発者向け）

## アーキテクチャ概要

```
Renderer Process (React)
    │
    │ IPC invoke()
    ▼
Main Process (Electron)
    │
    ├─ skillHandlers.ts (IPC Handlers)
    │   ├─ skill:analyze   → SkillAnalyzer
    │   ├─ skill:improve   → SkillImprover
    │   ├─ skill:optimize  → PromptOptimizer
    │   ├─ skill:optimize:variants
    │   └─ skill:optimize:evaluate
    │
    └─ Services
        ├─ SkillAnalyzer   (静的分析 + AI分析)
        ├─ SkillImprover   (改善適用 + バックアップ)
        └─ PromptOptimizer (最適化 + 評価)
```

## 型定義

### SkillAnalysis - 分析結果

```typescript
interface SkillAnalysis {
  skillName: string;
  overallScore: number; // 0-100
  categories: AnalysisCategory[];
  suggestions: Suggestion[];
  risks: Risk[];
  analyzedAt: Date;
}

interface AnalysisCategory {
  name: string; // 'prompt'|'structure'|'security'|'documentation'
  score: number; // 0-100
  details: string;
  issues: string[];
}
```

### Suggestion - 改善提案

```typescript
interface Suggestion {
  type: SuggestionType; // 'prompt'|'structure'|'documentation'|'security'|'performance'
  priority: SuggestionPriority; // 'low'|'medium'|'high'
  description: string;
  currentCode?: string;
  suggestedCode?: string;
  autoFixable: boolean;
}

type SuggestionType =
  | "prompt"
  | "structure"
  | "documentation"
  | "security"
  | "performance";
type SuggestionPriority = "low" | "medium" | "high";
```

### ImprovementResult - 改善結果

```typescript
interface ImprovementResult {
  skillName: string;
  applied: AppliedImprovement[];
  skipped: Suggestion[];
  errors: Array<{ suggestion: Suggestion; error: string }>;
  backupPath?: string;
  executedAt: Date;
}

interface AppliedImprovement {
  suggestion: Suggestion;
  result: "success" | "partial" | "failed";
  changes: string[];
  error?: string;
}
```

### OptimizationResult - 最適化結果

```typescript
interface OptimizationResult {
  original: string;
  optimized: string;
  changes: string[];
  metrics: OptimizationMetrics;
}

interface OptimizationMetrics {
  clarityScore: number; // 0-100
  specificityScore: number; // 0-100
  completenessScore: number; // 0-100
}
```

## IPCチャネル仕様

### skill:analyze - スキル分析

| 項目         | 値                               |
| ------------ | -------------------------------- |
| チャネル名   | `skill:analyze`                  |
| リクエスト型 | `{ skillName: string }`          |
| レスポンス型 | `OperationResult<SkillAnalysis>` |
| 処理         | SkillAnalyzer.analyze()          |

### skill:improve - スキル改善

| 項目         | 値                                                                             |
| ------------ | ------------------------------------------------------------------------------ |
| チャネル名   | `skill:improve`                                                                |
| リクエスト型 | `{ skillName: string; analysis: SkillAnalysis; options?: ImprovementOptions }` |
| レスポンス型 | `OperationResult<ImprovementResult>`                                           |
| 処理         | SkillImprover.applyImprovements()                                              |

```typescript
interface ImprovementOptions {
  types?: SuggestionType[]; // フィルタ: 適用する改善の種類
  minPriority?: SuggestionPriority; // フィルタ: 最小優先度
  autoFix?: boolean; // 自動修正可能なもののみ適用
  dryRun?: boolean; // テスト実行（実際には変更しない）
  createBackup?: boolean; // バックアップ作成（デフォルト: true）
}
```

### skill:optimize - プロンプト最適化

| 項目         | 値                                    |
| ------------ | ------------------------------------- |
| チャネル名   | `skill:optimize`                      |
| リクエスト型 | `{ prompt: string }`                  |
| レスポンス型 | `OperationResult<OptimizationResult>` |
| 処理         | PromptOptimizer.optimize()            |

### skill:optimize:variants - バリアント生成

| 項目         | 値                                   |
| ------------ | ------------------------------------ |
| チャネル名   | `skill:optimize:variants`            |
| リクエスト型 | `{ prompt: string; count?: number }` |
| レスポンス型 | `OperationResult<string[]>`          |
| 処理         | PromptOptimizer.generateVariants()   |

### skill:optimize:evaluate - プロンプト評価

| 項目         | 値                                  |
| ------------ | ----------------------------------- |
| チャネル名   | `skill:optimize:evaluate`           |
| リクエスト型 | `{ prompt: string }`                |
| レスポンス型 | `OperationResult<PromptEvaluation>` |
| 処理         | PromptOptimizer.evaluate()          |

## 使用例

### スキル分析の実行

```typescript
// Renderer Process
const result = await window.skillAPI.analyze({ skillName: "my-skill" });
if (result.success) {
  console.log("スコア:", result.data.overallScore);
  console.log("改善提案:", result.data.suggestions.length, "件");
} else {
  console.error("分析失敗:", result.error);
}
```

### 改善の適用

```typescript
// 分析結果をもとに改善を適用
const improveResult = await window.skillAPI.improve({
  skillName: "my-skill",
  analysis: analysisResult,
  options: {
    types: ["prompt", "documentation"], // プロンプトとドキュメントのみ
    minPriority: "medium", // 中優先度以上
    autoFix: false, // 全て適用（手動確認なし）
  },
});

if (improveResult.success) {
  console.log("適用:", improveResult.data.applied.length, "件");
  console.log("スキップ:", improveResult.data.skipped.length, "件");
  console.log("バックアップ:", improveResult.data.backupPath);
}
```

### プロンプト最適化

```typescript
// プロンプトを最適化
const optimizeResult = await window.skillAPI.optimize({
  prompt: "何か面白いことを教えて",
});

if (optimizeResult.success) {
  console.log("最適化後:", optimizeResult.data.optimized);
  console.log("明確性スコア:", optimizeResult.data.metrics.clarityScore);
}

// バリアントを3つ生成
const variants = await window.skillAPI.optimizeVariants({
  prompt: "何か面白いことを教えて",
  count: 3,
});
```

## エラーハンドリング

### エラーの種類

| エラー                   | 発生条件                       | 対処                                 |
| ------------------------ | ------------------------------ | ------------------------------------ |
| スキル名が空             | skillName が空文字             | 入力バリデーション                   |
| スキルが見つからない     | 指定されたスキルが存在しない   | SkillService.getSkillByName() で確認 |
| ディレクトリが存在しない | スキルディレクトリが削除された | パスの存在確認                       |
| SKILL.mdが見つからない   | SKILL.mdファイルがない         | ファイル存在確認                     |
| AI応答パースエラー       | SDKの応答がJSONとして不正      | graceful fallback（空の結果を返す）  |
| ファイル書き込みエラー   | 権限不足・ディスク容量不足     | errors[] に詳細を含めて返却          |

### graceful fallback

SDK接続エラーやタイムアウト時は、例外をスローせずに空の結果を返してサービスを継続します。

```typescript
// SkillAnalyzer.performAIAnalysis()
try {
  const response = await this.queryFn(prompt);
  return this.parseAIResponse(response.content);
} catch (error) {
  console.error("AI分析中にエラーが発生しました:", error);
  return { categories: [], suggestions: [], risks: [] }; // graceful fallback
}
```

## セキュリティ考慮

| 項目                     | 実装                                          |
| ------------------------ | --------------------------------------------- |
| ファイル操作制限         | スキルディレクトリ内のみ（path.joinで正規化） |
| スキル名バリデーション   | `<>:"\|?*` を含む名前を拒否                   |
| プロンプトバリデーション | 空文字・空白のみを拒否                        |
| バックアップ保護         | タイムスタンプ付きで上書き防止                |
| SDK呼び出し              | DI経由でquery関数を注入（テスト時モック可能） |

## ファイル構成

```
apps/desktop/src/main/services/skill/
├── SkillAnalyzer.ts     # スキル分析サービス
├── SkillImprover.ts     # スキル改善サービス
├── PromptOptimizer.ts   # プロンプト最適化サービス
├── utils/
│   ├── fileUtils.ts     # ファイル操作ユーティリティ
│   ├── sdkUtils.ts      # SDK呼び出しユーティリティ
│   └── index.ts         # エクスポート
└── __tests__/
    ├── SkillAnalyzer.test.ts
    ├── SkillAnalyzer.additional.test.ts
    ├── SkillImprover.test.ts
    ├── SkillImprover.additional.test.ts
    ├── PromptOptimizer.test.ts
    └── __mocks__/
        └── claude-agent-sdk.ts
```

## テスト

| ファイル                         | テスト数 | カテゴリ       |
| -------------------------------- | -------- | -------------- |
| SkillAnalyzer.test.ts            | 8        | 基本機能       |
| SkillAnalyzer.additional.test.ts | 13       | エッジケース   |
| SkillImprover.test.ts            | 10       | 基本機能       |
| SkillImprover.additional.test.ts | 18       | エッジケース   |
| PromptOptimizer.test.ts          | 11       | 基本機能       |
| skillHandlers.improve.test.ts    | 18       | IPC統合        |
| performance.test.ts              | 5        | パフォーマンス |
| **合計**                         | **83**   |                |

---

## 作成日時

- **作成**: 2026-02-03
- **作成者**: AI (Phase 12 自動生成)
