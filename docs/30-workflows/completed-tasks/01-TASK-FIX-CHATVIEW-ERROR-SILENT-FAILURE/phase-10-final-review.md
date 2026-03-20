# Phase 10: 最終レビュー

## メタ情報

| 項目      | 値                                      |
| --------- | --------------------------------------- |
| Phase番号 | 10                                      |
| 機能名    | ChatView エラーサイレント握りつぶし修正 |
| タスクID  | TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE  |
| 作成日    | 2026-03-20                              |
| 前Phase   | `phase-9-quality-assurance.md`          |

## 目的

実装の多角的な品質・整合性レビューを実施し、Phase 11 へ進む前の最終ゲートとする。要件・設計・実装・テストの一貫性を確認し、PASS/MINOR/MAJOR/CRITICAL を判定する。

## 実行タスク

- Task 1: 要件・設計・実装・品質証跡が Task 01 の範囲で閉じているか確認する。
- Task 2: silent failure 修正が Task 2〜4 の concern と混線していないか確認する。
- Task 3: 残課題は Phase 12 の未タスク候補へ送る。

### Task 1: 要件との整合性確認

Phase 1 の受入基準と実装を照合する:

| 受入基準                                                           | 確認内容                                                 |
| ------------------------------------------------------------------ | -------------------------------------------------------- |
| `callLLMAPI` が `{ success: false }` 時に `chatError` が設定される | `chatSlice.ts` のエラーパスを確認                        |
| `chatError` 設定時にエラーバナーが表示される                       | `ChatView` の `{chatError && ...}` JSX を確認            |
| エラーバナーに日本語メッセージが含まれる                           | `getErrorMessage(chatError)` の呼び出しを確認            |
| 次のメッセージ送信時またはバナーの×ボタンでバナーが消える          | `clearChatError` の呼び出し箇所を確認                    |
| 5秒後に自動消去される                                              | `useEffect` の `setTimeout(clearChatError, 5000)` を確認 |
| エラー発生時も `isSending: false` に戻る                           | エラーパスで `set({ isSending: false })` を確認          |

### Task 2: 設計との整合性確認

Phase 2 の設計と実装を照合する:

| 設計要素                                        | 確認内容                                             |
| ----------------------------------------------- | ---------------------------------------------------- | -------------------------- |
| `ChatSlice` に `chatError: string               | null` がある                                         | インターフェース定義を確認 |
| `callLLMAPI` の戻り値に `error?: string` がある | 関数の戻り値型を確認                                 |
| `useChatError` / `useClearChatError` が存在する | `store/index.ts` を確認                              |
| エラーバナーの位置がチャット入力フォームの直上  | `ChatView` のJSX構造を確認                           |
| Store → View の一方向依存が維持されている       | `ChatView` が `chatSlice` 内部を直接参照していないか |

### Task 3: 型安全性の確認

| 確認項目                                       | 確認方法                                                            |
| ---------------------------------------------- | ------------------------------------------------------------------- |
| `any` 型の使用がない                           | `grep -n "any" apps/desktop/src/renderer/store/slices/chatSlice.ts` |
| `response.error` の型ガードが実装されている    | `typeof response.error === "string"` の確認                         |
| `getErrorMessage` のインデックスアクセスが安全 | `?? ERROR_MESSAGES["UNKNOWN_ERROR"]` フォールバック確認             |
| non-null assertion (`!`) の使用がない          | `grep -n "!"` でスキャン（P52対策）                                 |

### Task 4: セキュリティ確認

| 確認項目                                   | 確認内容                                             |
| ------------------------------------------ | ---------------------------------------------------- |
| エラーメッセージに内部情報が含まれない     | `error.message` をそのまま表示していないか確認       |
| ユーザー入力がエラーメッセージに含まれない | `chatError` がエラーコード文字列のみであることを確認 |

### Task 5: アクセシビリティ確認

| 確認項目                                       | 確認内容                                     |
| ---------------------------------------------- | -------------------------------------------- |
| エラーバナーに `role="alert"` がある           | スクリーンリーダーへの即時通知               |
| ×ボタンに `aria-label="エラーを閉じる"` がある | Phase 3 MINOR指摘の対応確認                  |
| エラーバナーがキーボードアクセス可能           | ×ボタンが `type="button"` で明示されているか |

### Task 6: 最終レビュー総合判定

#### 判定基準

| 判定     | 条件                                                             |
| -------- | ---------------------------------------------------------------- |
| PASS     | 全チェック項目に問題なし                                         |
| MINOR    | 軽微な改善点があるが機能に影響しない。未タスク化して Phase 11 へ |
| MAJOR    | 設計・実装の問題。影響範囲に応じて Phase 1-5 へ戻る              |
| CRITICAL | 要件・セキュリティの根本的な問題。Phase 1 へ戻る                 |

**MINOR 指摘は全て未タスク化すること（省略不可: P05-task-execution.md 参照）**

## 参照資料

| 資料名           | パス                                                                                       |
| ---------------- | ------------------------------------------------------------------------------------------ |
| Phase 1 要件定義 | `docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/phase-1-requirements.md`      |
| Phase 2 設計書   | `docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/phase-2-design.md`            |
| Phase 5 実装     | `docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/phase-5-implementation.md`    |
| Phase 9 品質検証 | `docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/phase-9-quality-assurance.md` |
| タスク実行ルール | `.claude/rules/05-task-execution.md`                                                       |
| 既知の落とし穴   | `.claude/rules/06-known-pitfalls.md`                                                       |

## 実行手順

### Step 1: 要件との整合性確認

Task 1 の表を埋めながら、各受入基準が実装で満たされているかを確認する。

### Step 2: 設計・型安全性・セキュリティ・アクセシビリティ確認

Task 2-5 を順次確認する。

### Step 3: 判定の記録

Task 6 の判定基準に基づき、PASS/MINOR/MAJOR/CRITICAL を判定して記録する。

### Step 4: MINOR 指摘の未タスク化

MINOR 指摘がある場合は `docs/30-workflows/unassigned-task/` に独立した指示書ファイルを作成する（P3・P58対策）。

## 統合テスト連携

- 最終判定は `chatSlice.test.ts` / `ChatView.test.tsx` / `pnpm --filter @repo/desktop typecheck` / `pnpm --filter @repo/desktop lint` を主要証跡とする。
- Workspace 側のモデル未選択ガードや stream error 文言は既存仕様の確認対象に留め、Task 01 の完了判定へ直接混入させない。

## 成果物

| 成果物                        | パス                                                                                   |
| ----------------------------- | -------------------------------------------------------------------------------------- |
| Phase 10 仕様書（本ファイル） | `docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/phase-10-final-review.md` |

## 完了条件

- [ ] 全受入基準が実装で満たされていることを確認した
- [ ] 設計との整合性を確認した
- [ ] `any` 型・non-null assertion の使用がないことを確認した（P52対策）
- [ ] セキュリティ確認を実施した（エラーメッセージに内部情報なし）
- [ ] アクセシビリティ確認を実施した（role="alert", aria-label）
- [ ] PASS/MINOR/MAJOR/CRITICAL の判定を記録した
- [ ] MINOR 指摘がある場合、全て未タスク化した（省略不可）

## 次Phase

判定結果に応じて:

- PASS / MINOR: Phase 11（手動テスト）へ進む
- MAJOR: 影響範囲に応じて Phase 1-5 へ戻る
- CRITICAL: Phase 1 へ戻り要件再確認
