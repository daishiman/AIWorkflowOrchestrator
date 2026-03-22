# 問題定義・根本原因レビュー

| 項目       | 値                                      |
| ---------- | --------------------------------------- |
| レビュー日 | 2026-03-20                              |
| 対象       | Task 01-04 Phase 1-2 + ソースコード     |
| 判定       | **要修正** (MINOR改善 + 1件 仮説未排除) |

---

## 1. 5 Whys 分析結果

### Why Chain A: ChatView で AI から応答が返らない

```
Why 1: なぜ AI から応答が返らないのか？
  → callLLMAPI() が { success: false } を返しているから

Why 2: なぜ callLLMAPI() が失敗するのか？
  → (a) aiHandlers.ts L128-135: getSelectedLLMConfig() が null を返す
  → (b) aiHandlers.ts L163-178: LLMAdapter.sendChat() が LLMError を throw する

Why 3: なぜ getSelectedLLMConfig() が null を返すのか？
  → llmConfigProvider.ts の currentConfig がメモリ内変数で、
     アプリ起動後に syncSelectedConfigToMain() が呼ばれていないから

Why 4: なぜ syncSelectedConfigToMain() が呼ばれないのか？
  → llmSlice.ts L119-138: fetchProviders() 完了後に呼ばれるが、
     selectedProviderId/selectedModelId が persist 対象外のため、
     再起動後は null → firstProvider のデフォルトが使われる。
     ただし fetchProviders() 自体が呼ばれていない可能性がある

Why 5: なぜ fetchProviders() が呼ばれていない可能性があるのか？
  → ChatView には fetchProviders() の呼び出しが存在しない。
     Settings 画面を開かない限り providers が空のままになる可能性がある
```

**重要な発見**: Why 5 で **fetchProviders() の呼び出しタイミング** という仕様書で言及されていない問題が浮上した。ChatView や WorkspaceView に直接遷移した場合、fetchProviders() が一度も呼ばれず、providers 配列が空のまま currentConfig も null のままになる。

### Why Chain B: エラーが表示されない

```
Why 1: なぜエラーがユーザーに表示されないのか？
  → chatSlice.ts L294-296: else ブロックで set({ isSending: false }) のみ

Why 2: なぜエラー情報が保持されないのか？
  → chatSlice の ChatSlice インターフェースに chatError state が存在しない

Why 3: なぜ chatError を実装しなかったのか？
  → callLLMAPI() L72-100 の戻り値に error フィールドがなく、
     success: false のみが返されるため、エラー種別を判別できない

Why 4: なぜ callLLMAPI() が error を返さないのか？
  → aiHandlers.ts L164-178 は error フィールドを含むレスポンスを返すが、
     callLLMAPI() L91-95 で response.data のみチェックし、
     response.error を完全に無視しているから

Why 5: なぜ response.error が無視されたのか？
  → callLLMAPI() の戻り値型が { success: boolean; message?: string } であり、
     error フィールドが型に含まれていないため、設計時点で考慮漏れ
```

**結論**: Task 1 の根本原因「エラー握りつぶし」は正確だが、Why 4-5 の「callLLMAPI がレスポンスの error フィールドを無視している」ことがより精確な根本原因。仕様書はこの点を正しく捉えている。

---

## 2. 因果関係マップ

```
[Task 3: persist未対応]
  selectedProviderId = null (再起動後)
       |
       v
[fetchProviders() 呼び出しタイミング不明確] ← ★仕様書で未言及
       |
       v
[llmConfigProvider.ts: currentConfig = null]
       |
       v
[aiHandlers.ts L128-135: "LLMプロバイダーが選択されていません" エラー返却]
       |
       +--→ [Task 1: callLLMAPI が error フィールドを無視]
       |         |
       |         v
       |    [chatSlice.ts L294: isSending=false のみ設定、エラー非表示]
       |         |
       |         v
       |    [ユーザー: メッセージ送信後、無言で失敗]
       |
       +--→ [Task 4: WorkspaceChat onStreamError にアクションボタンなし]
                  |
                  v
             [ユーザー: エラーメッセージは見えるが次の行動がわからない]

[Task 2: ガイダンスバナー未実装]
       |
       v
[ユーザー: モデル未選択状態に気付けない]
       |
       v
[送信して初めて失敗に気付く（Task 1 の症状と合流）]
```

### 因果ループの有無

Task 3 (persist) を修正すれば再起動後の自動null化は防げるが、**初回起動時（persist データなし）や fetchProviders() 未呼び出し時は依然として null** であるため、Task 1 のエラー表示は引き続き必要。循環依存ではなく、**多重防御の関係**（どちらも必要）。

---

## 3. 仮説検証

### 排除すべき別仮説

| #   | 仮説                                     | 検証結果                                                                                                                                                                              | ステータス                |
| --- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| H1  | APIキー設定UIが壊れている                | aiHandlers.ts は LLMAdapterFactory 経由でキーを取得。Settings UI自体は本タスク範囲外だが、キー設定フロー自体は別問題                                                                  | **別問題（排除）**        |
| H2  | Preload bridge が機能していない          | callLLMAPI() L73: `window.electronAPI?.ai?.chat` の null チェックが存在し、bridge 不在時は `{ success: false }` を返す。bridge 自体の問題ではなく callLLMAPI のエラーハンドリング問題 | **排除済み**              |
| H3  | fetchProviders() が一度も呼ばれない      | ChatView に fetchProviders() 呼び出しなし。llmSlice.ts にも自動実行ロジックなし。**Settings 画面を経由しないと providers が空のまま**                                                 | **★未排除 — 要調査**      |
| H4  | llm:setSelectedConfig IPC が失敗している | syncSelectedConfigToMain() L66-78 は失敗時に console.warn のみで握りつぶし。IPC 失敗は currentConfig = null の原因になりうる                                                          | **低リスク（warn あり）** |
| H5  | LLMAdapterFactory がアダプタ取得に失敗   | aiHandlers.ts L144 で getAdapter() を呼ぶが、APIキー未設定時はここで throw される可能性あり。catch ブロックで処理される                                                               | **排除済み**              |

### H3 の詳細分析（重大）

`ChatView/index.tsx` を確認すると:

- L49-51: `chatMessages`, `chatInput`, `isSending` を store から取得
- **fetchProviders() の呼び出しが存在しない**
- Settings 画面を開かずに ChatView で直接メッセージを送信すると:
  1. `providers` = [] (空配列)
  2. `selectedProviderId` = null
  3. `selectedModelId` = null
  4. `callLLMAPI()` → `providerId` / `modelId` が falsy → else ブロック (L127)
  5. `getSelectedLLMConfig()` → null (currentConfig 未設定)
  6. **"LLMプロバイダーが選択されていません"** エラー

これは **Task 2 のガイダンスバナーだけでは解決しない**。ガイダンスバナーは `selectedModelId === null` を条件にするが、`fetchProviders()` 未呼び出し時は providers 自体が空で、モデル選択自体が不可能。

---

## 4. 逆説検証

### 「4タスクを全て修正しても AI と対話できないケース」

| #   | シナリオ                                                  | 原因                                                            | 4タスクで解決するか                                                          |
| --- | --------------------------------------------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| S1  | 初回起動後、Settings を開かずに ChatView でメッセージ送信 | fetchProviders() 未呼び出し → providers 空 → currentConfig null | **Task 2 のバナーは表示されるが、根本的にモデル選択ができない**              |
| S2  | APIキーを設定していない                                   | aiHandlers.ts で API_KEY_MISSING エラー                         | Task 1 でエラー表示される。Task 4 で Settings 誘導ボタンが出る。**解決**     |
| S3  | ネットワーク未接続                                        | NETWORK_ERROR                                                   | Task 1/4 でエラー表示 + リトライ。**解決**                                   |
| S4  | 有効な Provider が0件（全APIキー未設定）                  | fetchProviders() が空配列を返す                                 | Task 2 バナー表示。**部分解決**（Settings に飛んでも設定できるとは限らない） |
| S5  | persist データが壊れている                                | Zustand hydrate 失敗 → 全 state リセット                        | Task 3 の migrate 設計で対応。**解決**                                       |
| S6  | Electron contextBridge 初期化タイミング問題               | window.electronAPI が undefined                                 | callLLMAPI L73 で { success: false } → Task 1 で表示。**解決**               |

**S1 が最も危険**: fetchProviders() がアプリ起動時に自動実行されない設計は、4タスク全修正後も「AI と対話できない」状態を引き起こしうる。

---

## 5. 素人視点検証（初回ユーザーフロー分析）

### フロー: 初めてアプリを起動して AI と対話する

```
Step 1: アプリ起動
  → Zustand hydrate（persist データなし → 全 null）
  → fetchProviders() は自動呼び出しなし ← ★問題

Step 2: ChatView 画面に遷移（デフォルト画面と仮定）
  → selectedModelId = null, selectedProviderId = null
  → [Task 2 修正後] ガイダンスバナー表示:
    「AIモデルが選択されていません」→「設定画面へ」ボタン
  → ★バナーに気付かずメッセージを入力・送信する可能性あり

Step 3: メッセージを送信
  → callLLMAPI() → response = { success: false }
  → [Task 1 修正前] 無言で失敗
  → [Task 1 修正後] エラーバナー表示

Step 4: 「設定画面へ」ボタンをクリック
  → Settings 画面へ遷移
  → ★この時点で fetchProviders() が呼ばれる（Settings 画面の useEffect）
  → providers が取得される

Step 5: Provider 選択 → Model 選択 → APIキー入力
  → syncSelectedConfigToMain() が呼ばれる
  → currentConfig が設定される

Step 6: ChatView に戻る
  → メッセージ送信 → 成功
```

### 問題点

1. **Step 1-2 間**: fetchProviders() が自動実行されないため、Settings を経由しないと providers が取得されない
2. **Step 2**: バナーの視認性。ヘッダー直下だと画面下部のチャット入力欄に注意が集中し、バナーに気付かない可能性
3. **Step 3**: Task 1 修正前は完全に無言失敗。修正後もエラーメッセージが5秒で自動消去されると、タイミングによっては見逃す
4. **Step 5**: APIキー入力の導線は本タスク範囲外だが、Provider 選択後に「APIキーが必要です」というガイダンスが出るか不明

---

## 6. 問題定義の妥当性判定

| タスク                                           | 判定                 | 理由                                                                          |
| ------------------------------------------------ | -------------------- | ----------------------------------------------------------------------------- |
| Task 1: ChatView エラーサイレント握りつぶし修正  | **PASS**             | 根本原因（callLLMAPI の error 無視 + chatError state 不在）は正確。設計も妥当 |
| Task 2: LLM モデル選択インラインガイダンス       | **PASS (MINOR注意)** | 問題定義は正確。ただし fetchProviders() 未呼び出し時の動作を考慮すべき        |
| Task 3: LLM 設定永続化                           | **PASS**             | 問題定義・設計ともに正確。persist migration 戦略も妥当。P62 対策あり          |
| Task 4: WorkspaceChat ストリーミングエラーUX改善 | **PASS**             | 既存の onStreamError ハンドラ (L545-582) の改善。設計は正確                   |

**総合判定: 要修正 (MINOR)**

---

## 7. 改善提案

### 7-1: fetchProviders() 自動実行の追加（重要度: HIGH）

**問題**: fetchProviders() が Settings 画面でしか呼ばれない。ChatView / WorkspaceView に直接遷移すると providers が空のまま。

**提案**: 以下のいずれかで対応:

**(A) App ルートレベルで fetchProviders() を呼ぶ**

```typescript
// App.tsx または ルートレイアウトコンポーネント
const fetchProviders = useFetchProviders();
useEffect(() => {
  fetchProviders();
}, [fetchProviders]);
```

**(B) Task 2 のガイダンスバナー内で fetchProviders() を呼ぶ**

```typescript
// LLMGuidanceBanner.tsx
const fetchProviders = useFetchProviders();
const providers = useLLMProviders();
useEffect(() => {
  if (providers.length === 0) {
    fetchProviders();
  }
}, [providers.length, fetchProviders]);
```

**(C) 新タスクとして分離**

- `TASK-FIX-LLM-PROVIDER-INIT` として fetchProviders() のアプリ起動時自動実行を追加

**推奨**: (C) を新タスクとして追加し、Task 2 の依存タスクとする。Task 2 のガイダンスバナーは providers が空の場合も考慮した表示にする。

### 7-2: callLLMAPI の error フィールド伝搬（Task 1 の補完）

**問題**: aiHandlers.ts は `{ success: false, error: "..." }` を返すが、callLLMAPI() L91-95 で response.error を無視している。

**確認済み**: Task 1 Phase 2 設計でこの点は正しく対処されている（L36-52 の戻り値型拡張）。追加の改善は不要。

### 7-3: ChatView の sendMessage 事前ガード（Task 2 との連携）

**提案**: Task 2 のガイダンスバナーに加えて、ChatView の handleSend() で selectedModelId が null の場合に送信をブロックする:

```typescript
const handleSend = useCallback(async () => {
  const trimmedInput = chatInput.trim();
  if (!trimmedInput || isSending) return;
  if (!selectedModelId) {
    // Task 1 の chatError に設定してバナー表示
    // または Task 2 のガイダンスバナーへフォーカス
    return;
  }
  await sendMessage(chatInput);
  setChatInput("");
}, [chatInput, isSending, selectedModelId, sendMessage, setChatInput]);
```

**注意**: WorkspaceChat (L347-356) は既に `!selectedModelId` ガードが存在する。ChatView は存在しない。

### 7-4: Task 1 エラー自動消去タイミングの再考

**問題**: 5秒自動消去は API_KEY_MISSING のような設定エラーには短すぎる。ユーザーが Settings 画面に遷移する前に消える可能性。

**提案**: エラー種別によって自動消去を制御:

- `NETWORK_ERROR`, `TIMEOUT`: 5秒自動消去（一時的エラー）
- `API_KEY_MISSING`, `MODEL_NOT_FOUND`, `AI_UNAVAILABLE`: 自動消去なし（アクション必要）

### 7-5: Task 4 既存実装の活用確認

**発見**: WorkspaceChatController L557-580 に既にエラーコード別の switch 文が存在する。Task 4 は「アクションボタン追加」が主目的であり、エラーメッセージ表示自体は既実装。Phase 1 の P50 チェックでこの点を明確に記録すべき。

### 7-6: 因果関係の明示化

**提案**: 4タスクの仕様書に相互依存関係を明示的に記載:

```
Task 3 (persist) ←── 再起動後の null 化防止
Task 2 (guidance) ←── 未選択状態の事前通知
Task 1 (error display) ←── 失敗時のエラー表示（最終防衛線）
Task 4 (stream error UX) ←── WorkspaceChat 固有のエラーUX改善

実行順序推奨: Task 3 → Task 2 → Task 1 → Task 4
（Task 3 が根本原因に最も近く、修正効果が最大）
```
