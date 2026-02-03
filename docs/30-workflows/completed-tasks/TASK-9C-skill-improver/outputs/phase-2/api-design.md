# TASK-9C API設計書（IPCチャネル仕様）

## メタ情報

| 項目   | 値                               |
| ------ | -------------------------------- |
| タスク | TASK-9C スキル改善・自動修正機能 |
| 作成日 | 2026-02-03                       |
| Phase  | 2                                |

---

## IPCチャネル一覧

| #   | チャネル                | メソッド | 説明             |
| --- | ----------------------- | -------- | ---------------- |
| 1   | skill:analyze           | invoke   | スキル分析       |
| 2   | skill:improve           | invoke   | 改善適用         |
| 3   | skill:optimize          | invoke   | プロンプト最適化 |
| 4   | skill:optimize:variants | invoke   | バリアント生成   |
| 5   | skill:optimize:evaluate | invoke   | プロンプト評価   |

---

## 1. skill:analyze

### 概要

指定されたスキルを分析し、品質スコアと改善提案を返す。

### リクエスト

```typescript
interface SkillAnalyzeRequest {
  /** 分析対象のスキル名 */
  skillName: string;
}
```

### レスポンス

```typescript
interface SkillAnalyzeResponse {
  success: boolean;
  data?: SkillAnalysis;
  error?: string;
}
```

### エラーケース

| エラー               | error メッセージ               |
| -------------------- | ------------------------------ |
| スキル名が空         | "skillName must be a string"   |
| スキルが見つからない | "スキルが見つかりません"       |
| SKILL.mdが存在しない | "SKILL.mdが見つかりません"     |
| SDK応答エラー        | "分析中にエラーが発生しました" |

### 使用例

```typescript
// Renderer側
const result = await window.electron.ipcRenderer.invoke("skill:analyze", {
  skillName: "task-specification-creator",
});

if (result.success) {
  console.log("スコア:", result.data.overallScore);
  console.log("提案数:", result.data.suggestions.length);
} else {
  console.error("エラー:", result.error);
}
```

---

## 2. skill:improve

### 概要

分析結果に基づいてスキルを改善する。改善前にバックアップを作成。

### リクエスト

```typescript
interface SkillImproveRequest {
  /** 改善対象のスキル名 */
  skillName: string;

  /** 改善オプション */
  options?: ImprovementOptions;
}

interface ImprovementOptions {
  /** 自動修正を有効にする（デフォルト: false） */
  autoFix?: boolean;

  /** 適用する改善タイプのフィルタ */
  types?: (
    | "prompt"
    | "structure"
    | "security"
    | "performance"
    | "documentation"
  )[];

  /** 最低優先度 */
  minPriority?: "low" | "medium" | "high" | "critical";
}
```

### レスポンス

```typescript
interface SkillImproveResponse {
  success: boolean;
  data?: ImprovementResult;
  error?: string;
}
```

### エラーケース

| エラー               | error メッセージ                   |
| -------------------- | ---------------------------------- |
| スキル名が空         | "skillName must be a string"       |
| スキルが見つからない | "スキルが見つかりません"           |
| バックアップ作成失敗 | "バックアップの作成に失敗しました" |
| 改善適用エラー       | "改善の適用に失敗しました"         |

### 使用例

```typescript
// Renderer側
const result = await window.electron.ipcRenderer.invoke("skill:improve", {
  skillName: "task-specification-creator",
  options: {
    autoFix: true,
    types: ["prompt", "documentation"],
    minPriority: "medium",
  },
});

if (result.success) {
  console.log("適用:", result.data.applied.length);
  console.log("スキップ:", result.data.skipped.length);
  console.log("エラー:", result.data.errors.length);
}
```

---

## 3. skill:optimize

### 概要

プロンプトを最適化し、改善されたプロンプトと品質メトリクスを返す。

### リクエスト

```typescript
interface SkillOptimizeRequest {
  /** 最適化対象のプロンプト */
  prompt: string;
}
```

### レスポンス

```typescript
interface SkillOptimizeResponse {
  success: boolean;
  data?: OptimizationResult;
  error?: string;
}
```

### エラーケース

| エラー         | error メッセージ                    |
| -------------- | ----------------------------------- |
| プロンプトが空 | "prompt must be a non-empty string" |
| SDK応答エラー  | "最適化中にエラーが発生しました"    |

### 使用例

```typescript
// Renderer側
const result = await window.electron.ipcRenderer.invoke("skill:optimize", {
  prompt: "ファイルを読み込んで要約してください",
});

if (result.success) {
  console.log("最適化後:", result.data.optimized);
  console.log("明確性:", result.data.metrics.clarityScore);
}
```

---

## 4. skill:optimize:variants

### 概要

プロンプトの異なるバリアントを生成する（A/Bテスト用）。

### リクエスト

```typescript
interface SkillOptimizeVariantsRequest {
  /** 元のプロンプト */
  prompt: string;

  /** 生成するバリアント数（デフォルト: 3） */
  count?: number;
}
```

### レスポンス

```typescript
interface SkillOptimizeVariantsResponse {
  success: boolean;
  data?: string[];
  error?: string;
}
```

### エラーケース

| エラー         | error メッセージ                         |
| -------------- | ---------------------------------------- |
| プロンプトが空 | "prompt must be a non-empty string"      |
| countが無効    | "count must be a positive number"        |
| SDK応答エラー  | "バリアント生成中にエラーが発生しました" |

### 使用例

```typescript
// Renderer側
const result = await window.electron.ipcRenderer.invoke(
  "skill:optimize:variants",
  {
    prompt: "コードをレビューしてください",
    count: 3,
  },
);

if (result.success) {
  result.data.forEach((variant, i) => {
    console.log(`バリアント${i + 1}:`, variant);
  });
}
```

---

## 5. skill:optimize:evaluate

### 概要

プロンプトを評価し、スコアとフィードバックを返す。

### リクエスト

```typescript
interface SkillOptimizeEvaluateRequest {
  /** 評価対象のプロンプト */
  prompt: string;
}
```

### レスポンス

```typescript
interface SkillOptimizeEvaluateResponse {
  success: boolean;
  data?: PromptEvaluation;
  error?: string;
}
```

### エラーケース

| エラー         | error メッセージ                    |
| -------------- | ----------------------------------- |
| プロンプトが空 | "prompt must be a non-empty string" |
| SDK応答エラー  | "評価中にエラーが発生しました"      |

### 使用例

```typescript
// Renderer側
const result = await window.electron.ipcRenderer.invoke(
  "skill:optimize:evaluate",
  {
    prompt: "このファイルを分析して",
  },
);

if (result.success) {
  console.log("スコア:", result.data.score);
  console.log("フィードバック:", result.data.feedback);
}
```

---

## IPC_CHANNELS 定義追加

```typescript
// apps/desktop/src/preload/channels.ts に追加

export const IPC_CHANNELS = {
  // 既存チャネル...

  // スキル改善関連（追加）
  SKILL_ANALYZE: "skill:analyze",
  SKILL_IMPROVE: "skill:improve",
  SKILL_OPTIMIZE: "skill:optimize",
  SKILL_OPTIMIZE_VARIANTS: "skill:optimize:variants",
  SKILL_OPTIMIZE_EVALUATE: "skill:optimize:evaluate",
} as const;
```

---

## 統合ポイント/契約

| 統合ポイント | 契約定義                                     |
| ------------ | -------------------------------------------- |
| Renderer→IPC | 上記5チャネルのリクエスト/レスポンス型       |
| IPC→Services | サービスメソッドシグネチャ（上記参照）       |
| Services→SDK | Claude Agent SDK query() API                 |
| Services→FS  | fs.promises (readFile, writeFile, readdir等) |

---

## 作成日時

- **作成**: 2026-02-03
- **作成者**: AI (Phase 2 自動生成)
