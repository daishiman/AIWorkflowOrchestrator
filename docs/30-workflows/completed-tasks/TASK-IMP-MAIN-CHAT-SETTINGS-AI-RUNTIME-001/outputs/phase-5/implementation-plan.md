# Phase 5: 実装計画

## メタ情報

| 項目     | 内容                                       |
| -------- | ------------------------------------------ |
| Phase    | 5                                          |
| 機能名   | Main Chat / Settings runtime 同期          |
| タスクID | TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001 |
| 成果物   | implementation-plan.md                     |
| 作成日   | 2026-03-17                                 |

---

## 1. 実装方針

### 1.1 基本方針

- **Authority First**: Main Process が Source of Truth となる設計を最優先で実装する
- **破壊的変更の最小化**: 既存の IPC チャンネル名・Store 構造を維持しながら、契約の精度を上げる
- **型安全の強化**: `any` キャストや型アサーションを排除し、契約型から一貫して導出する
- **P42 準拠バリデーション**: 新規・修正するすべての IPC ハンドラに3段バリデーションを適用する
- **P31/P48 対策**: 新規セレクタには個別セレクタ + useShallow を適用する
- **P5 対策**: onModeChanged など双方向 IPC リスナーの二重登録を防ぐ

### 1.2 依存関係と実装順序

```
[事前条件] Task01 の access matrix resolver インターフェース定義
  │
  ├─ Step 1-5: 型・定数定義（依存なし。並列実行可能）
  │
  ├─ Step 6-10: Main Process ハンドラ実装（Step 1-5 完了後）
  │
  ├─ Step 11-16: Zustand Store 更新（Step 1-5 完了後、Step 6-10 と並列）
  │
  └─ Step 17-22: Renderer コンポーネント更新（Step 6-16 完了後）
```

---

## 2. SubAgent 分担

### 2.1 3エージェント分担方針

| Agent 名              | 責務                                     | 担当ステップ |
| --------------------- | ---------------------------------------- | ------------ |
| Chat Authority Agent  | AI_CHAT 経路・chatSlice・aiHandlers      | Step 1-8     |
| Selector Sync Agent   | LLMSelector・llmSlice・llm handlers      | Step 9-15    |
| Prompt Settings Agent | Settings 画面・SystemPrompt・AuthMode 系 | Step 16-22   |

### 2.2 責務境界と依存関係

```
Chat Authority Agent         Selector Sync Agent          Prompt Settings Agent
┌────────────────────┐       ┌────────────────────┐       ┌────────────────────┐
│ Step 1: 型定義更新 │       │ Step 9: llm handlers│       │ Step 16: authMode  │
│ Step 2: aiHandlers │  ──→  │ Step 10: llmSlice   │  ──→  │ Step 17: SettingsV │
│ Step 3: chatSlice  │       │ Step 11: LLMSelector│       │ Step 18: ApiKeys   │
│ Step 4: ChatView   │       │ Step 12: health 廃止│       │ Step 19: authKey   │
│ Step 5-8: tests    │       │ Step 13-15: tests   │       │ Step 20-22: tests  │
└────────────────────┘       └────────────────────┘       └────────────────────┘
    Step 1 完了後                Step 1 完了後                Step 9 完了後
    独立実行可能                 独立実行可能                  依存あり
```

---

## 3. 実装ステップ一覧テーブル

| Step | 対象ファイル                                                      | 変更内容                                                                                   | 依存関係 | GAP/DRIFT |
| ---- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | -------- | --------- |
| 1    | `packages/shared/src/agent/types.ts`                              | AI_CHAT リクエスト型に providerId/modelId を必須フィールドとして追加                       | なし     | GAP-01    |
| 2    | `packages/shared/src/llm/types.ts`                                | AuthMode 型を `"ready" \| "blocked" \| "unavailable"` に更新                               | なし     | DRIFT-1   |
| 3    | `packages/shared/src/llm/constants.ts`                            | AI_CHECK_CONNECTION 定数を削除候補としてマーク（deprecated）                               | なし     | DRIFT-4   |
| 4    | `apps/desktop/src/main/handlers/aiHandlers.ts`                    | AI_CHAT ハンドラに P42 準拠 3段バリデーション追加、providerId/modelId を直接使用           | Step 1   | GAP-01/03 |
| 5    | `apps/desktop/src/main/handlers/aiHandlers.ts`                    | AI_CHECK_CONNECTION ハンドラを削除                                                         | Step 4   | DRIFT-4   |
| 6    | `apps/desktop/src/main/services/LLMConfigProvider.ts`             | DEFAULT_CONFIG への暗黙 fallback を廃止、getSelectedLLMConfig() が null を返せるように変更 | Step 1   | GAP-03    |
| 7    | `apps/desktop/src/main/handlers/llm.ts`                           | handleCheckHealth() を LLMAdapterFactory 経由の実装に更新（ダミー実装廃止）                | Step 1   | GAP-02    |
| 8    | `apps/desktop/src/main/handlers/llm.ts`                           | handleSetSelectedConfig() に P42 バリデーション追加                                        | Step 1   | P42       |
| 9    | `apps/desktop/src/main/handlers/authModeHandlers.ts`              | mode の語彙バリデーションを `ready/blocked/unavailable` に更新                             | Step 2   | DRIFT-1   |
| 10   | `apps/desktop/src/main/handlers/authKeyHandlers.ts`               | auth-key:exists のレスポンスに source フィールド追加                                       | Step 2   | GAP-06    |
| 11   | `apps/desktop/src/main/handlers/apiKeyHandlers.ts`                | api-key:set/delete 後に clearInstance() 呼び出し追加                                       | なし     | GAP-05    |
| 12   | `apps/desktop/src/renderer/store/slices/chatSlice.ts`             | sendMessage() で llmSlice から providerId/modelId を取得して明示送信                       | Step 1   | GAP-01/03 |
| 13   | `apps/desktop/src/renderer/store/slices/llmSlice.ts`              | selectProvider() / selectModel() に syncSelectedConfigToMain() 呼び出し追加                | Step 1   | GAP-01    |
| 14   | `apps/desktop/src/renderer/store/slices/llmSlice.ts`              | checkHealth() を llm:check-health のみ使用するように変更（AI_CHECK_CONNECTION 廃止）       | Step 3   | DRIFT-4   |
| 15   | `apps/desktop/src/renderer/store/slices/authModeSlice.ts`         | onModeChanged リスナー P5 対策: モジュールレベルガード追加                                 | Step 2   | P5        |
| 16   | `apps/desktop/src/renderer/store/slices/authModeSlice.ts`         | initializeAuthMode() / fetchStatus() の型を AuthMode 語彙に合わせて更新                    | Step 2   | DRIFT-1   |
| 17   | `apps/desktop/src/renderer/views/ChatView/index.tsx`              | handleSend() で chatSlice.sendMessage() に providerId/modelId を渡す                       | Step 12  | GAP-01    |
| 18   | `apps/desktop/src/renderer/views/ChatView/index.tsx`              | selectedProviderId が null の場合に送信ボタンを disabled に                                | Step 12  | GAP-01    |
| 19   | `apps/desktop/src/renderer/components/LLMSelectorPanel/index.tsx` | Provider 変更 onChange → selectProvider() 経由で llm:set-selected-config 同期              | Step 13  | DRIFT-4   |
| 20   | `apps/desktop/src/renderer/views/SettingsView/index.tsx`          | Access Capability Card の状態表示を capability ready/missing-key/blocked に対応            | Step 16  | DRIFT-1/2 |
| 21   | `apps/desktop/src/renderer/components/ApiKeysSection/index.tsx`   | api-key:validate 呼び出しに 300ms デバウンス追加（MINOR-02 対応）                          | Step 11  | GAP-07    |
| 22   | `apps/desktop/src/renderer/components/AuthKeySection/index.tsx`   | AuthKeySection を capability card の sub-section として再配置（MINOR-03 段階的対応）       | Step 16  | DRIFT-2   |

---

## 4. ファイル変更マトリクス

| ファイルパス                                                          | 変更種別 | 変更概要                                                          |
| --------------------------------------------------------------------- | -------- | ----------------------------------------------------------------- |
| `packages/shared/src/agent/types.ts`                                  | 修正     | AIChatRequest 型に providerId/modelId を必須フィールド追加        |
| `packages/shared/src/llm/types.ts`                                    | 修正     | AuthMode 型定義を ready/blocked/unavailable に更新                |
| `packages/shared/src/llm/constants.ts`                                | 修正     | AI_CHECK_CONNECTION 定数を @deprecated でマーク                   |
| `packages/shared/src/llm/ipc-channels.ts`                             | 修正     | LLM_CHECK_HEALTH チャンネル定数の正規化                           |
| `apps/desktop/src/main/handlers/aiHandlers.ts`                        | 修正     | AI_CHAT P42 バリデーション追加、AI_CHECK_CONNECTION 削除          |
| `apps/desktop/src/main/handlers/llm.ts`                               | 修正     | handleCheckHealth() 実装化、handleSetSelectedConfig() P42対応     |
| `apps/desktop/src/main/handlers/authModeHandlers.ts`                  | 修正     | mode 語彙バリデーション更新                                       |
| `apps/desktop/src/main/handlers/authKeyHandlers.ts`                   | 修正     | auth-key:exists の source フィールド追加                          |
| `apps/desktop/src/main/handlers/apiKeyHandlers.ts`                    | 修正     | api-key:set/delete 後の clearInstance() 呼び出し追加              |
| `apps/desktop/src/main/services/LLMConfigProvider.ts`                 | 修正     | DEFAULT_CONFIG 暗黙 fallback 廃止                                 |
| `apps/desktop/src/main/services/LLMAdapterFactory.ts`                 | 修正     | clearInstance() メソッドの公開 API 確認・補完（GAP-05）           |
| `apps/desktop/src/renderer/store/slices/chatSlice.ts`                 | 修正     | sendMessage() に providerId/modelId の明示送信ロジック追加        |
| `apps/desktop/src/renderer/store/slices/llmSlice.ts`                  | 修正     | selectProvider/Model, checkHealth, syncConfig のロジック更新      |
| `apps/desktop/src/renderer/store/slices/authModeSlice.ts`             | 修正     | onModeChanged P5 ガード、mode 語彙更新、initializeAuthMode()      |
| `apps/desktop/src/renderer/store/slices/systemPromptTemplateSlice.ts` | 修正     | currentTemplate 取得・反映ロジックの確認・補完                    |
| `apps/desktop/src/renderer/store/index.ts`                            | 修正     | P31 対策: 個別セレクタの追加（useSelectedProviderId 等）          |
| `apps/desktop/src/renderer/views/ChatView/index.tsx`                  | 修正     | handleSend() 更新、送信ボタン disabled 制御追加                   |
| `apps/desktop/src/renderer/views/SettingsView/index.tsx`              | 修正     | Access Capability Card 表示ロジック更新                           |
| `apps/desktop/src/renderer/components/LLMSelectorPanel/index.tsx`     | 修正     | Provider/Model onChange 経由の Main 同期処理追加                  |
| `apps/desktop/src/renderer/components/ApiKeysSection/index.tsx`       | 修正     | api-key:validate デバウンス 300ms 追加（MINOR-02）                |
| `apps/desktop/src/renderer/components/AuthKeySection/index.tsx`       | 修正     | capability card sub-section への段階的再配置（MINOR-03）          |
| `apps/desktop/src/renderer/components/AuthModeSelector/index.tsx`     | 修正     | mode 語彙 ready/blocked/unavailable への対応                      |
| `apps/desktop/src/renderer/components/SystemPromptPanel/index.tsx`    | 修正     | currentTemplate 反映・save/delete フロー確認                      |
| `apps/desktop/src/preload/types.ts`                                   | 修正     | P32: 型定義の二箇所同時更新（shared との整合確認）                |
| `apps/desktop/src/main/handlers/ragHandlers.ts`                       | 新規     | MINOR-01: rag:get-state / rag:set-state IPC ハンドラ新規追加      |
| `apps/desktop/src/renderer/store/slices/ragSlice.ts`                  | 修正     | MINOR-01: RAG state を Main authority 昇格（ローカル state 廃止） |

---

## 5. MINOR 指摘対応計画

### MINOR-01: RAG state の Main authority 昇格 IPC 設計

| 項目       | 内容                                                                                                |
| ---------- | --------------------------------------------------------------------------------------------------- |
| 対応       | Phase 5 で ragHandlers.ts を新規作成し、以下の IPC を追加する                                       |
| チャンネル | `rag:get-state` (Renderer→Main, レスポンス: `{enabled: boolean}`)                                   |
| チャンネル | `rag:set-state` (Renderer→Main, リクエスト: `{enabled: boolean}`, レスポンス: `{success: boolean}`) |
| 実装場所   | `apps/desktop/src/main/handlers/ragHandlers.ts` (新規)                                              |
| Store 更新 | `ragSlice.ts` から `useRagEnabled` / `useSetRagEnabled` 個別セレクタを追加                          |

### MINOR-02: apiKey.validate() デバウンス実装

| 項目     | 内容                                                                        |
| -------- | --------------------------------------------------------------------------- |
| 対応     | Renderer 側デバウンス 300ms を標準化する                                    |
| 実装場所 | `apps/desktop/src/renderer/components/ApiKeysSection/index.tsx`             |
| 実装方法 | `useCallback` + `useRef` で debounce タイマーを管理（外部ライブラリ不使用） |
| P13 対策 | テストでは `vi.advanceTimersByTimeAsync(300)` を使用する                    |

```typescript
// MINOR-02: デバウンス実装パターン
const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

const handleApiKeyChange = useCallback(
  (value: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(async () => {
      if (value.trim() !== "") {
        await validateApiKey({ provider, apiKey: value });
      }
    }, 300);
  },
  [provider, validateApiKey],
);
```

### MINOR-03: AccountSection header 統合の段階的対応

| 項目       | 内容                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------ |
| 対応       | 初回実装は AccountSection を Settings 画面末尾移動のみ。header 統合は後続タスク化          |
| 実装場所   | `apps/desktop/src/renderer/views/SettingsView/index.tsx`                                   |
| 具体的変更 | SettingsView の sections 配列末尾に AccountSection を移動（header への組み込みは行わない） |
| 未タスク   | `TASK-SETTINGS-ACCOUNT-HEADER-INTEGRATION-001` として後続タスク化                          |

---

## 6. リスクと軽減策

| リスク                                        | 影響度 | 発生可能性 | 軽減策                                                                                    |
| --------------------------------------------- | ------ | ---------- | ----------------------------------------------------------------------------------------- |
| AI_CHECK_CONNECTION 廃止による既存画面の破損  | 高     | 中         | Step 3 で deprecated マークのみ付け、完全削除は Renderer 修正後                           |
| Task01 access matrix 未定義時のスタブ依存     | 中     | 中         | Task01 の定義を待てない場合は `AccessCapabilityStub` で仮実装                             |
| DEFAULT_CONFIG 廃止による型エラーの波及       | 高     | 高         | Step 6 実装後に即 `pnpm typecheck` を実行して波及箇所を特定                               |
| P32: 型定義の片方更新漏れ                     | 中     | 中         | Step 1-2 完了後に `pnpm typecheck` を実行し不整合を早期検出                               |
| MINOR-01 RAG IPC 追加による既存テストへの影響 | 低     | 低         | ragHandlers.ts 新規追加は既存ハンドラに影響しない                                         |
| P48: Provider 派生セレクタの無限ループ        | 高     | 中         | `useFilteredProviders()` 等に useShallow を適用する                                       |
| P44/P45: IPC 引数命名の契約ドリフト           | 高     | 中         | 新規 IPC ハンドラ実装時に ipc-contract-checklist.md を参照する                            |
| P60: IPC テスト応答形式不一致                 | 中     | 中         | 全 IPC レスポンスを `{ success, data?, error? }` wrapper 形式で統一する                   |
| P54: safeRegister パターン不適合              | 中     | 中         | 戻り値が必要なハンドラ（unsubscribe 等）は個別 try-catch を使用し safeRegister を回避する |

---

## 7. Foundation 契約と aiworkflow-requirements 反映

### 7.1 capability 値の定義

Foundation 契約（Task01 access matrix resolver）で定義される capability 値は以下の4種類。
実装時はこの値を型定義（`packages/shared/src/llm/types.ts`）に追加する。

| capability 値       | 説明                             |
| ------------------- | -------------------------------- |
| `integratedRuntime` | Integrated Runtime のみ有効      |
| `terminalSurface`   | Terminal Surface のみ有効        |
| `both`              | 両方のサーフェスが有効           |
| `none`              | アクセス不可（認証・設定未完了） |

### 7.2 Settings 3領域改善契約

SettingsView での以下の3領域を改善対象とする（DRIFT-1/2/3 対応）。

| 領域           | 改善内容                                                                 |
| -------------- | ------------------------------------------------------------------------ |
| 認証方式カード | `authMode.status` の `capability` 値に応じて表示状態を切り替える         |
| SDK APIキー    | `auth-key:exists` の `source` フィールドで保存/環境変数/未設定を区別表示 |
| APIキー一覧    | `api-key:list` の `ProviderListResult` 構造に基づいて一覧を描画          |

### 7.3 ProviderListResult 構造

`api-key:list` IPC のレスポンス型定義（Phase 5 Step 1 で `packages/shared` に追加）。

```typescript
interface ProviderListResult {
  providers: ProviderStatus[]; // 各プロバイダーの設定状態
  registeredCount: number; // APIキー設定済みプロバイダー数
  totalCount: number; // 全プロバイダー数
}
```

### 7.4 auth-key:exists source 契約

`auth-key:exists` IPC のレスポンスに含まれる `source` フィールドの定義。

| source 値        | 説明                                       |
| ---------------- | ------------------------------------------ |
| `"saved"`        | SecureStorage に保存されたキーを使用中     |
| `"env-fallback"` | 環境変数（`ANTHROPIC_API_KEY` 等）から取得 |
| `"not-set"`      | キーが存在しない                           |

### 7.5 S30 Graceful Degradation パターン

IPC ハンドラ登録失敗時のフォールバック戦略（S30 パターン準拠）。
ハンドラ登録が失敗した場合もアプリが起動できるよう、graceful degradation を実装する。

```typescript
// S30 パターン: IPC ハンドラの graceful degradation
function safeRegisterHandler(
  channel: string,
  handler: IpcMainInvokeEvent,
): void {
  try {
    ipcMain.handle(channel, handler);
  } catch (error) {
    // P5 対策: 二重登録エラーを検出して既存ハンドラを維持
    logger.warn(`Handler for ${channel} already registered, skipping`);
  }
}
```

> **注意（P54 対策）**: `safeRegister` パターンは戻り値を破棄する。`setupThemeWatcher` のように
> unsubscribe 関数を変数にキャプチャする必要があるハンドラには使用しないこと。

---

## 8. TDD Green 状態確認

Phase 5 完了時点では、Phase 4 で作成した全テストが **GREEN** になっていることを確認する。

### 8.1 Green 状態確認手順

```bash
# Phase 5 完了後の Green 状態確認
pnpm --filter @repo/desktop exec vitest run src/__tests__/

# 全テスト GREEN を確認
# カバレッジ付き確認
pnpm --filter @repo/desktop exec vitest run --coverage src/__tests__/
```

### 8.2 Green 確認必須のテストケース（Phase 4 の Red 対象）

| テストケース ID | 対象                    | Green 確認内容                                 |
| --------------- | ----------------------- | ---------------------------------------------- |
| UT-001〜003     | chatSlice               | providerId/modelId 必須ロジック実装済み        |
| UT-005          | llmSlice                | AI_CHECK_CONNECTION 廃止済み                   |
| UT-009          | LLMConfigProvider       | DEFAULT_CONFIG fallback 廃止済み               |
| IT-002〜004     | AI_CHAT IPC             | P42 バリデーション実装済み                     |
| IT-009          | AI_CHECK_CONNECTION廃止 | ハンドラ削除済み                               |
| IT-012, IT-012b | auth-key:exists         | source フィールド追加済み（not-set 含む）      |
| CT-001          | ChatView                | selectedProviderId=null での disabled 実装済み |
| CT-006〜008     | SettingsView            | capability 表示ロジック実装済み                |
