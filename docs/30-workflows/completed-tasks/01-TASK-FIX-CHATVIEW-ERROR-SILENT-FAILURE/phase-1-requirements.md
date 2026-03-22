# Phase 1: 要件定義

## メタ情報

| 項目      | 値                                      |
| --------- | --------------------------------------- |
| Phase番号 | 1                                       |
| 機能名    | ChatView エラーサイレント握りつぶし修正 |
| タスクID  | TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE  |
| 作成日    | 2026-03-20                              |

## 目的

`chatSlice.ts` の `sendMessage` アクションにおいて、`callLLMAPI()` が失敗した場合にエラー情報をUIに伝えず `isSending: false` にするだけで握りつぶしている問題を修正する。ユーザーがメッセージを送信しても応答が返らない場合に、その原因をUIで視認可能にする。

## 実行タスク

### Task 1: P50チェック（既実装調査）

既に同様のエラーハンドリングが実装済みでないか確認する。

```bash
git log --oneline -20 -- apps/desktop/src/renderer/store/slices/chatSlice.ts
git log --oneline -20 -- apps/desktop/src/renderer/views/ChatView/index.tsx
```

`chatError` state やエラー表示UIが既に存在する場合、該当Phaseは「検証・補完」モードに切り替える。

### Task 2: 機能要件の確定

- `chatSlice.ts` の `sendMessage` アクションにエラーハンドリングを追加
- `ChatSlice` インターフェースに `chatError: string | null` state を追加
- `clearChatError` アクションを追加
- `callLLMAPI` のレスポンスにエラー情報を含める（`{ success: false, error?: string }`）
- `ChatView` コンポーネントにインラインエラーバナーを追加

### Task 3: 非機能要件の確定

- エラーバナーは以下のいずれかで消去される:
  - ユーザーが次のメッセージ送信時（`sendMessage` 呼び出し時に `chatError` をクリア）
  - ユーザーが手動でバナーを閉じる（×ボタン）
  - 5秒後に自動消去（`setTimeout` + `clearChatError`）
- エラーメッセージはエラー種別に応じた日本語文言を表示する
- UIはApple HIG準拠（`systemRed`: ライトモード `#FF3B30`、ダークモード `#FF453A`）

### Task 4: 受入基準の確定

1. `callLLMAPI` が `{ success: false }` を返した際に `chatError` が設定される
2. `chatError` が設定された時点でChatViewのエラーバナーが表示される
3. エラーバナーには日本語のエラーメッセージが含まれる
4. 次のメッセージ送信時またはバナーの×ボタンクリックでバナーが消える
5. 5秒後に自動消去される
6. エラー発生時も `isSending: false` に正しく戻る

## 参照資料

### システム仕様（aiworkflow-requirements）

| 資料名                  | パス                                                                                        |
| ----------------------- | ------------------------------------------------------------------------------------------- |
| エラーハンドリング設計  | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       |
| LLM IPC契約             | `.claude/skills/aiworkflow-requirements/references/llm-ipc-types.md`                        |
| Zustand状態管理設計     | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                |
| 実装パターン（P31/P48） | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` |

### 実装コード

| 資料名                             | パス                                                  |
| ---------------------------------- | ----------------------------------------------------- |
| chatSlice.ts（修正対象）           | `apps/desktop/src/renderer/store/slices/chatSlice.ts` |
| Store index.ts（セレクタ追加対象） | `apps/desktop/src/renderer/store/index.ts`            |
| ChatView（UI追加対象）             | `apps/desktop/src/renderer/views/ChatView/index.tsx`  |

### ルール

| 資料名               | パス                                   |
| -------------------- | -------------------------------------- |
| コード品質ルール     | `.claude/rules/02-code-quality.md`     |
| 状態管理ルール       | `.claude/rules/03-state-management.md` |
| アーキテクチャルール | `.claude/rules/01-architecture.md`     |

## 実行手順

### Step 1: P50チェック（既実装調査）

```bash
# chatSlice.ts の変更履歴確認
git log --oneline -20 -- apps/desktop/src/renderer/store/slices/chatSlice.ts

# chatError が既に存在するか確認
grep -n "chatError" apps/desktop/src/renderer/store/slices/chatSlice.ts
grep -n "chatError" apps/desktop/src/renderer/store/index.ts
grep -n "chatError" apps/desktop/src/renderer/views/ChatView/index.tsx
```

- 既実装が発見された場合: Phase 4-5 を「検証・補完」モードに切り替え、既存実装のテストカバレッジを確認
- 既実装が存在しない場合: 通常のPhase 2設計へ進む

### Step 2: callLLMAPI のレスポンス構造確認

`apps/desktop/src/renderer/store/slices/chatSlice.ts` L66-100 の `callLLMAPI` 関数を読み、
`window.electronAPI.ai.chat` のレスポンス構造（`response.error` の有無）を確認する。

### Step 3: 機能要件・受入基準の文書化

本Phase仕様書の「受入基準」セクションを最終化する。

## 統合テスト連携

- 現行実装との差分、対象テスト、依存タスクとの接続点をこのPhaseで確認・更新する。
- 追加・変更したテスト観点は対応する `apps/desktop/src/` の実装ファイルと1対1で突合する。

## 成果物

| 成果物                       | パス                                                                                                  |
| ---------------------------- | ----------------------------------------------------------------------------------------------------- |
| Phase 1 仕様書（本ファイル） | `docs/30-workflows/completed-tasks/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/phase-1-requirements.md` |

## 完了条件

- [ ] P50チェックを実施し、既実装の有無を確認した
- [ ] `callLLMAPI` のレスポンス構造（`response.error` の有無）を確認した
- [ ] 機能要件・非機能要件が明文化されている
- [ ] 受入基準がチェックリスト形式で明文化されている
- [ ] エラーメッセージの自動消去方式（5秒タイムアウト or 手動クリア）を決定した

## 次Phase

Phase 2: 設計（`phase-2-design.md`）
