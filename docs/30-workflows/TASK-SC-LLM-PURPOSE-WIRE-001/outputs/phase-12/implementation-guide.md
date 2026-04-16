# Phase 12 成果物: 実装ガイド

## タスクID: TASK-SC-LLM-PURPOSE-WIRE-001 — llm-purpose-wire

---

## Part 1: 中学生レベルの説明

### 何をしたの？

スキル作成機能の「目的（purpose）」フィールドに、AIが考えた答えを入れるように改善しました。

**Before（改善前）**: 「目的」の欄に、エージェント定義書の文章がそのままコピーされていた
**After（改善後）**: AIに「このスキルの目的は何？」と聞いて、その答えを「目的」の欄に入れる

### 仕組みのイメージ

```
スキル名・説明
   ↓
extract-purpose エージェント定義書を AI に渡す
   ↓
AI が「このスキルの目的」を考えて返答する
   ↓
purpose フィールドに格納
```

もし AI が答えられなかった場合は、もともとの「説明文」をそのまま使います（安全設計）。

---

## Part 2: 技術者レベルの説明

### 変更の概要

`SkillCreatorService.runCreateWorkflow` に `ILLMClient` の DI（依存性注入）と LLM 呼び出し処理を追加した。

### 変更ファイル

| ファイル                                                                     | 変更内容                                              |
| ---------------------------------------------------------------------------- | ----------------------------------------------------- |
| `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                | `ILLMClient` DI、`runCreateWorkflow` LLM 呼び出し実装 |
| `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts` | TC-01〜TC-13 + TC-08b/TC-09b 追加、旧 TC-04 修正      |
| `apps/desktop/tsconfig.json`                                                 | `@repo/shared/services/llm/types` エイリアス追加      |

### 実装ポイント

#### 1. コンストラクタへの ILLMClient インジェクション（後方互換）

```typescript
constructor(skillsDir?: string, workflowsDir?: string, llmClient?: ILLMClient) {
  // ...
  this.llmClient = llmClient ?? createDefaultSkillCreatorLLMClient();
}
```

省略可能（オプショナル）なので既存の `new SkillCreatorService()` 呼び出しに影響しない。
未注入時は default client を生成し、選択済み LLM 設定で実行する。

#### 2. try/catch 2段構成のエラーハンドリング

```typescript
// loadAgent 失敗 → ワークフロー全体の失敗（null 返却）
try {
  extractPurposeAgent = await this.resourceLoader.loadAgent("extract-purpose");
  planStructureAgent = await this.resourceLoader.loadAgent("plan-structure");
} catch {
  return null;
}

// LLM 失敗 → purpose のみフォールバック（ワークフロー継続）
let purpose: string = options.description;
try {
  const result = await this.llmClient.complete(skillInput, {
    systemPrompt: extractPurposeAgent,
  });
  if (result.success) {
    const normalizedPurpose = normalizePurpose(result.data);
    if (normalizedPurpose !== null) {
      purpose = normalizedPurpose;
    }
  }
} catch {
  /* フォールバック維持 */
}
```

`loadAgent` 失敗は致命的（null 返却）、LLM 失敗は部分的（description フォールバック）と重大度で分離。

#### 3. Result 型の正しい使い方

このプロジェクトの `Result<T, E>` は `success`/`data` 判別子を使用（`ok`/`value` ではない）。

```typescript
// 正しい
if (result.success) {
  purpose = result.data;
}

// 誤り（コンパイルエラー）
// 判別子を取り違えると TypeScript が検出する
```

### テスト設計

`runCreateWorkflow` は `private` メソッドのため、`createSkill(mode: "create")` 経由で間接テスト。`ILLMClient` をコンストラクタから注入してモック化することで、LLM 呼び出しの検証が可能。

### AC 達成状況

| AC-ID | 内容                       | 達成 |
| ----- | -------------------------- | ---- |
| AC-1  | LLM に agent 定義を渡す    | PASS |
| AC-2  | purpose に LLM 結果格納    | PASS |
| AC-3  | 方式を設計書に明記         | PASS |
| AC-4  | loadAgent 失敗ハンドリング | PASS |
| AC-5  | LLM 失敗ハンドリング       | PASS |
| AC-6  | 既存テスト全 PASS          | PASS |
