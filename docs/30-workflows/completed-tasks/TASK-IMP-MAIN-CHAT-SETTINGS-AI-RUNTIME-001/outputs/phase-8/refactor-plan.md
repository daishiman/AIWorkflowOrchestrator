# Phase 8: リファクタリング計画

## メタ情報

| 項目     | 内容                                       |
| -------- | ------------------------------------------ |
| Phase    | 8                                          |
| 機能名   | Main Chat / Settings runtime 同期          |
| タスクID | TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001 |
| 成果物   | refactor-plan.md                           |
| 作成日   | 2026-03-17                                 |

---

## 1. リファクタリング方針

Phase 5 実装完了後のコードベースに対し、以下の方針でリファクタリングを実施する。

1. **型安全性最優先**: `as` キャストと non-null assertion (`!`) を実行時検証に置換（P19/P48 対策）
2. **命名規約統一**: authMode 語彙を `ready/blocked/unavailable` に統一（DRIFT-1 解決）
3. **重複コード除去**: health check 二重経路を `llm:check-health` 単一経路に統合（DRIFT-4）
4. **DIP 準拠確保**: IPC ハンドラの依存先を具象クラスからインターフェースに変更（P61 対策）
5. **変更範囲最小化**: 既存テストが壊れない範囲で段階的にリファクタリングを実施

---

## 2. リファクタリング項目一覧

| ID   | 対象ファイル                                | 現状の問題                                                      | 改善内容                                                                                                  | リスク | 優先度 |
| ---- | ------------------------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ------ | ------ |
| R-01 | `renderer/views/ChatView/index.tsx`         | `providerId as LLMProviderId` 型キャスト（GAP-01）              | `isLLMProviderId()` 型ガード関数で実行時検証に置換                                                        | 低     | 高     |
| R-02 | `renderer/store/slices/chatSlice.ts`        | `modelId: "" as string` 初期値のキャスト                        | 明示的な `string` 型宣言に変更                                                                            | 低     | 高     |
| R-03 | `main/handlers/aiHandlers.ts`               | `AI_CHECK_CONNECTION` ダミー実装（GAP-02）                      | ハンドラ登録を削除し `llm:check-health` に統一                                                            | 中     | 高     |
| R-04 | `renderer/components/LLMSelectorPanel/`     | `DEFAULT_CONFIG` への暗黙 fallback（GAP-03）                    | `providerId/modelId` を常に明示送信するように修正                                                         | 中     | 高     |
| R-05 | `renderer/components/AuthModeSelector/`     | `auto/ask/deny` 語彙残存（DRIFT-1）                             | `ready/blocked/unavailable` に全て置換                                                                    | 低     | 高     |
| R-06 | `renderer/components/AuthKeySection/`       | 独立 Section として存在（DRIFT-2）                              | Access Capability Card の sub-section に再配置                                                            | 中     | 中     |
| R-07 | `main/handlers/apiKeyHandlers.ts`           | API key 変更時に `clearInstance()` 未呼び出し（GAP-05）         | `LLMAdapterFactory.clearInstance()` 呼び出しを追加                                                        | 低     | 高     |
| R-08 | `main/handlers/authKeyHandlers.ts`          | `authKey.exists` の source 契約不明確（GAP-06）                 | 返却値の source フィールド (`secure-storage` 固定) を明示化                                               | 低     | 中     |
| R-09 | `renderer/views/SettingsView/index.tsx`     | セクション順序が設計と不一致                                    | 6 セクション構成（Access Cards, Provider/Model, API Key, System Prompt, Health/RAG, Profile/Theme）に整理 | 低     | 中     |
| R-10 | `main/services/LLMAdapterFactory.ts`        | `clearInstance()` の public API が未公開の場合あり              | メソッドを public にして型定義に追加                                                                      | 低     | 高     |
| R-11 | `renderer/store/slices/llmSlice.ts`         | `healthStatus` の初期値が `undefined`                           | `Record<LLMProviderId, HealthStatus>` で明示的な初期状態定義                                              | 低     | 中     |
| R-12 | `renderer/components/ApiKeysSection/`       | Provider 一覧と capability 独立判定（DRIFT-3）                  | capability card と連動した表示制御に統合                                                                  | 中     | 中     |
| R-13 | `preload/index.ts`                          | IPC チャンネル名の文字列リテラル混在（P27 対策）                | 全チャンネル名を `IPC_CHANNELS` 定数に統一                                                                | 低     | 高     |
| R-14 | `main/handlers/systemPromptHandlers.ts`     | `result.data!` non-null assertion（P48 対策）                   | `Array.isArray()` / optional chaining に置換                                                              | 低     | 高     |
| R-15 | `renderer/views/ChatView/RuntimeBanner.tsx` | health check 表示が `AI_CHECK_CONNECTION` 結果に依存（DRIFT-4） | `llm:check-health` 結果のみを参照するように修正                                                           | 低     | 高     |

---

## 3. コード品質改善計画

### 3.1 型安全性向上

#### as キャスト除去（R-01, R-02）

```typescript
// 修正前（GAP-01 キャスト問題）
const providerId = selectedProviderId as LLMProviderId;

// 修正後（型ガード関数で実行時検証）
function isLLMProviderId(value: unknown): value is LLMProviderId {
  return (
    value != null &&
    typeof value === "string" &&
    "provider" in value && // 型定義に応じて調整
    LLM_PROVIDER_IDS.includes(value as LLMProviderId)
  );
}

if (!isLLMProviderId(selectedProviderId)) {
  return {
    success: false,
    error: { code: "VALIDATION_ERROR", message: "Invalid providerId" },
  };
}
const providerId = selectedProviderId; // 型ナロイング済み
```

#### non-null assertion 除去（R-14）

```typescript
// 修正前（P48 違反）
const templates = result.data!.templates;

// 修正後（P48 準拠）
const templates = Array.isArray(result.data?.templates)
  ? result.data.templates
  : [];
```

### 3.2 重複コード統合

#### health check 経路統一（R-03, R-15）

```typescript
// 修正前（DRIFT-4: 二重経路）
// aiHandlers.ts に AI_CHECK_CONNECTION（ダミー）が存在
// llmHandlers.ts に llm:check-health が存在

// 修正後（単一経路）
// aiHandlers.ts の AI_CHECK_CONNECTION 登録を削除
// llmHandlers.ts の llm:check-health のみ使用
```

### 3.3 命名規則統一（R-05）

全ソースファイルで authMode 語彙を統一する：

| 旧語彙 | 新語彙        | 対象ファイル                              |
| ------ | ------------- | ----------------------------------------- |
| `auto` | `ready`       | AuthModeSelector, authModeSlice, types.ts |
| `ask`  | `blocked`     | AuthModeSelector, authModeSlice, types.ts |
| `deny` | `unavailable` | AuthModeSelector, authModeSlice, types.ts |

---

## 4. リファクタリング実行順序

以下の順序で段階的に実施する（依存関係を考慮）：

### Step 1: 型定義・定数の整備（R-05, R-13）

1. `packages/shared/src/types.ts` に `AuthMode = 'ready' | 'blocked' | 'unavailable'` を定義
2. `IPC_CHANNELS` 定数にすべてのチャンネル名を登録
3. 型ガード関数 `isLLMProviderId()` を `packages/shared/src/guards.ts` に追加

### Step 2: Main Process ハンドラの修正（R-03, R-07, R-08, R-10, R-14）

1. `aiHandlers.ts` から `AI_CHECK_CONNECTION` 登録を削除（R-03）
2. `apiKeyHandlers.ts` に `clearInstance()` 呼び出しを追加（R-07）
3. `authKeyHandlers.ts` の source フィールドを明示化（R-08）
4. `LLMAdapterFactory` の `clearInstance()` を public 化（R-10）
5. `systemPromptHandlers.ts` の non-null assertion を除去（R-14）

### Step 3: Renderer Store の修正（R-02, R-11）

1. `chatSlice.ts` の型キャストを除去（R-02）
2. `llmSlice.ts` の `healthStatus` 初期値を明示化（R-11）

### Step 4: Renderer コンポーネントの修正（R-01, R-04, R-05, R-06, R-12, R-15）

1. `ChatView` の `providerId` 型キャストを型ガードに置換（R-01）
2. `LLMSelectorPanel` の `DEFAULT_CONFIG` fallback を除去（R-04）
3. `AuthModeSelector` の語彙を `ready/blocked/unavailable` に統一（R-05）
4. `AuthKeySection` を Access Capability Card sub-section に再配置（R-06）
5. `ApiKeysSection` を capability card と連動（R-12）
6. `RuntimeBanner` を `llm:check-health` のみ参照に修正（R-15）

### Step 5: Settings 画面の整理（R-09）

1. `SettingsView` の 6 セクション構成に整理
2. 各セクション間の依存関係とイベント伝播を確認

### Step 6: TDD Refactor 状態確認（各 Step 後に実施）

TDD の Refactor フェーズとして、リファクタリング後にテストがすべて Green を維持していることを確認する。

```bash
pnpm --filter @repo/desktop test
pnpm --filter @repo/shared typecheck
pnpm lint
```

| 確認項目                                          | 合格基準                  |
| ------------------------------------------------- | ------------------------- |
| 全ユニットテストが PASS                           | 0 件失敗                  |
| TypeScript 型エラーなし                           | 0 件エラー                |
| ESLint エラーなし                                 | 0 件エラー                |
| カバレッジが Phase 6 完了時点から低下していないか | Line/Function 80%+ を維持 |

> **重要**: 各 Step 完了後に必ず上記を実行し、テストが Green であることを確認してから次 Step に進む。Red になった場合はリファクタリングを差し戻して原因を特定すること。

---

## 5. P49 対策: type predicate 内の型キャスト除去

P49 (type predicate 内での `as` キャスト使用) は P19（型キャストバイパス）の派生パターンであり、実行時に不正な値が通過するリスクがある。リファクタリング時に以下を確認する。

### 5.1 問題パターンと修正方針

```typescript
// P49 違反（as キャストで実行時検証をバイパス）
function isLLMProviderId(value: unknown): value is LLMProviderId {
  return typeof (value as Record<string, unknown>).provider === "string";
}

// P49 準拠（in 演算子で実行時プロパティ存在を検証）
function isLLMProviderId(value: unknown): value is LLMProviderId {
  return (
    value != null &&
    typeof value === "string" &&
    LLM_PROVIDER_IDS.includes(value as LLMProviderId)
  );
}
```

### 5.2 P49 チェック対象ファイル

| ファイル                             | 確認内容                                           |
| ------------------------------------ | -------------------------------------------------- |
| `packages/shared/src/guards.ts`      | 新規追加の型ガード関数に `as` キャストがないか     |
| `renderer/views/ChatView/index.tsx`  | `isLLMProviderId()` が `in` 演算子を使用しているか |
| `main/handlers/aiHandlers.ts`        | ハンドラ内の type predicate に `as` がないか       |
| `renderer/store/slices/chatSlice.ts` | セレクタ内の型ガードに `as` がないか               |
