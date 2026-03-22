# Phase 2: 設計

## メタ情報

| 項目      | 値                                      |
| --------- | --------------------------------------- |
| Phase番号 | 2                                       |
| 機能名    | ChatView エラーサイレント握りつぶし修正 |
| タスクID  | TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE  |
| 作成日    | 2026-03-20                              |
| 前Phase   | `phase-1-requirements.md`               |

## 目的

Phase 1 で確定した要件に基づき、`chatSlice.ts` へのエラーstate追加・`callLLMAPI` のエラー伝搬・`ChatView` のエラーバナーUIを設計する。P31対策の個別セレクタ追加とDIP準拠の設計も含む。

## 実行タスク

### Task 1: chatSlice.ts 設計

#### 1-A: ChatSlice インターフェース拡張

`ChatSlice` に以下を追加する:

```typescript
// State
chatError: string | null;

// Actions
clearChatError: () => void;
```

既存の `streamingError: StreamingError | null` とは独立した state として管理する（`StreamingError` はストリーミング専用の詳細型のため、`sendMessage` 用には `string | null` で十分）。

#### 1-B: callLLMAPI の戻り値型拡張

```typescript
// 変更前
Promise<{ success: boolean; message?: string }>;

// 変更後
Promise<{ success: boolean; message?: string; error?: string }>;
```

エラーソースに応じたメッセージ:

| 状況                                     | error フィールド値                                |
| ---------------------------------------- | ------------------------------------------------- |
| `window.electronAPI` が未定義            | `"AI_UNAVAILABLE"`                                |
| `response.success` が false でエラーあり | `response.error` の値（または `"UNKNOWN_ERROR"`） |
| `catch` ブロックで例外発生               | `"API_CALL_FAILED"`                               |

#### 1-C: sendMessage のエラーハンドリング設計

```typescript
sendMessage: async (message) => {
  // 前回のエラーをクリア
  set({ chatError: null });

  // ... 既存処理 ...

  if (response.success && response.message) {
    // 成功パス: 変更なし
  } else {
    // エラーパス: chatError にメッセージコードを設定
    const errorCode = response.error ?? "UNKNOWN_ERROR";
    set({ isSending: false, chatError: errorCode });
  }
},

clearChatError: () => set({ chatError: null }),
```

#### 1-D: 初期state

```typescript
chatError: null,
```

### Task 2: store/index.ts 設計（個別セレクタ追加）

P31対策として個別セレクタを追加する。追加場所は既存の `useIsSending` セレクタの直後:

```typescript
export const useChatError = () => useAppStore((state) => state.chatError);
export const useClearChatError = () =>
  useAppStore((state) => state.clearChatError);
```

`useClearChatError` はZustandアクション参照であり安定しているため、`useEffect` 依存配列に含めても無限ループは発生しない（P31対策済み）。

### Task 3: ChatView エラーバナーUI設計

#### 3-A: エラーコードと日本語メッセージのマッピング

```typescript
const ERROR_MESSAGES: Record<string, string> = {
  AI_UNAVAILABLE: "AI機能が利用できません。アプリを再起動してください。",
  API_CALL_FAILED:
    "メッセージの送信に失敗しました。しばらく待ってから再試行してください。",
  UNKNOWN_ERROR: "予期しないエラーが発生しました。",
  // IPC経由で返ってくる可能性があるエラーコード
  API_KEY_MISSING:
    "APIキーが設定されていません。設定画面からAPIキーを入力してください。",
  PROVIDER_NOT_FOUND: "選択されたAIプロバイダーが見つかりません。",
  MODEL_NOT_FOUND: "選択されたモデルが見つかりません。",
  RATE_LIMIT_EXCEEDED:
    "API利用制限に達しました。しばらく待ってから再試行してください。",
  NETWORK_ERROR: "ネットワークエラーが発生しました。接続を確認してください。",
};

function getErrorMessage(code: string): string {
  return ERROR_MESSAGES[code] ?? ERROR_MESSAGES.UNKNOWN_ERROR;
}
```

#### 3-B: エラーバナーコンポーネント設計

Apple HIG準拠のインラインエラーバナー:

```
┌─────────────────────────────────────────────────┐
│ [!] エラーメッセージテキスト              [×]  │
└─────────────────────────────────────────────────┘
```

- カラー: `systemRed`（ライト: `#FF3B30`、ダーク: `#FF453A`）
- 背景: `systemRed` の10%透過
- 位置: チャット入力フォームの直上
- 自動消去: バナー表示から5秒後に `clearChatError` を呼び出す

#### 3-C: ChatView への統合方針

`ChatView` コンポーネント内で `useChatError` と `useClearChatError` を個別セレクタで取得する。`useEffect` で5秒タイマーを設定し、`chatError` が変化したタイミングでタイマーをリセットする。

```typescript
// P31準拠: 個別セレクタを使用
const chatError = useChatError();
const clearChatError = useClearChatError();

useEffect(() => {
  if (!chatError) return;
  const timer = setTimeout(() => clearChatError(), 5000);
  return () => clearTimeout(timer);
}, [chatError, clearChatError]);
```

### Task 4: アーキテクチャ依存方向の確認

```
callLLMAPI (chatSlice内部関数)
    ↓ error フィールド追加
ChatSlice (chatError state)
    ↓ 個別セレクタ経由
ChatView (エラーバナー表示)
```

Store → View の一方向依存を維持。`ChatView` は `useChatError` / `useClearChatError` のみを参照し、`chatSlice` の内部実装には依存しない。

### Task 5: SubAgent lane と validation path の設計

本 task は Task 01 単体でも関心分離して進める。

| Lane   | 主責務                      | 対象ファイル                                                          | 並列可否                       |
| ------ | --------------------------- | --------------------------------------------------------------------- | ------------------------------ |
| Lane A | store / contract 設計       | `chatSlice.ts`, `store/index.ts`                                      | UI lane と並列可               |
| Lane B | ChatView error surface 設計 | `ChatView/index.tsx`, `ChatView.test.tsx`                             | store lane と並列可            |
| Lane C | validation path 設計        | `chatSlice.test.ts`, `ChatView.test.tsx`, validator 実行              | A/B の設計確定後に合流         |
| Lane D | spec sync 設計              | workflow phase docs, Phase 12 outputs, aiworkflow-requirements 更新先 | A/B/C の結果を受けて後段で実施 |

validation path は以下で固定する。

1. `chatSlice` 単体テストで error contract を確認する
2. `ChatView` テストで error surface と timer cleanup を確認する
3. `verify-all-specs` / `validate-phase-output` で仕様書構造を確認する
4. Phase 12 で system spec と workflow docs の同期結果を証跡化する

## 参照資料

### システム仕様（aiworkflow-requirements）

| 資料名                  | パス                                                                                        |
| ----------------------- | ------------------------------------------------------------------------------------------- |
| エラーハンドリング設計  | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       |
| Zustand状態管理設計     | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                |
| 実装パターン（P31/P48） | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` |

### ルール

| 資料名               | パス                                   |
| -------------------- | -------------------------------------- |
| 状態管理ルール       | `.claude/rules/03-state-management.md` |
| アーキテクチャルール | `.claude/rules/01-architecture.md`     |
| 既知の落とし穴       | `.claude/rules/06-known-pitfalls.md`   |

### 前Phase成果物

| 成果物         | パス                                                                                                  |
| -------------- | ----------------------------------------------------------------------------------------------------- |
| Phase 1 仕様書 | `docs/30-workflows/completed-tasks/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/phase-1-requirements.md` |

## 実行手順

### Step 1: 設計前の現状調査

```bash
# ChatSlice インターフェースの全stateとactionを確認
grep -n "chatError\|isSending\|streamingError" \
  apps/desktop/src/renderer/store/slices/chatSlice.ts

# ChatView コンポーネントの構造確認
cat apps/desktop/src/renderer/views/ChatView/index.tsx | head -80

# 既存の個別セレクタ一覧確認
grep -n "^export const use" apps/desktop/src/renderer/store/index.ts
```

### Step 2: chatSlice.ts 設計の文書化

本Phase仕様書 Task 1 の設計内容に基づき、修正前後のコード差分を明確にする。

### Step 3: store/index.ts 設計の文書化

追加する個別セレクタ2つを明確にする。

### Step 4: ChatView UI設計の文書化

エラーバナーのレイアウト・カラー・タイマー実装を設計書に記録する。

## 統合テスト連携

- 現行実装との差分、対象テスト、依存タスクとの接続点をこのPhaseで確認・更新する。
- 追加・変更したテスト観点は対応する `apps/desktop/src/` の実装ファイルと1対1で突合する。

## 成果物

| 成果物                       | パス                                                                                            |
| ---------------------------- | ----------------------------------------------------------------------------------------------- |
| Phase 2 仕様書（本ファイル） | `docs/30-workflows/completed-tasks/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/phase-2-design.md` |

## 完了条件

- [ ] `ChatSlice` インターフェースの `chatError` state と `clearChatError` アクションが設計されている
- [ ] `callLLMAPI` の戻り値型に `error?: string` フィールドが追加されている
- [ ] `sendMessage` のエラーパスで `chatError` を設定する設計が明文化されている
- [ ] `useChatError` / `useClearChatError` 個別セレクタが設計されている（P31対策）
- [ ] エラーコードと日本語メッセージのマッピングが設計されている
- [ ] エラーバナーのUIデザイン（位置、カラー、自動消去タイミング）が明文化されている
- [ ] Store → View の一方向依存が設計で保たれている
- [ ] SubAgent lane と validation path が明文化されている

## 次Phase

Phase 3: 設計レビュー（`phase-3-design-review.md`）
