# Phase 10: 最終レビュー

## メタ情報

| 項目          | 値                                                                                       |
| ------------- | ---------------------------------------------------------------------------------------- |
| Phase番号     | 10                                                                                       |
| 機能名        | WorkspaceChat ストリーミングエラーUX改善                                                 |
| タスクID      | TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR                                                     |
| 作成日        | 2026-03-20                                                                               |
| 判定          | PASS                                                                                     |
| 前Phase成果物 | `docs/30-workflows/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/phase-9-quality-assurance.md` |

## 目的

Phase 1 の受入基準 AC-1〜AC-6、Renderer 内の責務分離、Apple HIG 準拠、エッジケース処理を最終確認し、Phase 11 の視覚証跡取得へ進んでよいかを判断する。

## 実行タスク

- Task 1: AC-1〜AC-6 を code / test / screenshot plan の 3 層で突合する
- Task 2: `streamingError` primary contract と `errorMessage` fallback 契約を確認する
- Task 3: Apple HIG とアクセシビリティ属性を実装値で確認する
- Task 4: edge case と retry / dismiss の回帰 guard を確認する
- Task 5: MINOR 指摘の有無を判定し、Phase 11 進行可否を確定する

### Task 1: 受入基準のコードレベル確認

| 受入基準 | 実装 / 証跡                                                                                                                  | 判定 |
| -------- | ---------------------------------------------------------------------------------------------------------------------------- | ---- |
| AC-1     | `mapLLMErrorToStreamingError` の `API_KEY_MISSING -> SETTINGS`、`StreamingErrorDisplay` の Settings CTA、Phase 11 `TC-11-01` | OK   |
| AC-2     | `NETWORK_ERROR -> RETRY`、`retryLastMessage()`、runtime test `R-26`、Phase 11 `TC-11-02`                                     | OK   |
| AC-3     | `RATE_LIMIT -> RETRY + hint`、component test `C-05`、Phase 11 `TC-11-03`                                                     | OK   |
| AC-4     | `VALIDATION_ERROR -> action=null`、component test `C-04`、Phase 11 `TC-11-05`                                                | OK   |
| AC-5     | `onStreamError` の状態リセット、`dismiss` 後の回復、runtime test `R-25/R-27`、Phase 11 `TC-11-04`                            | OK   |
| AC-6     | `dismissStreamingError()` が structured/raw を同時 clear、runtime test `R-27`                                                | OK   |

### Task 2: アーキテクチャ最終確認

| 確認項目         | 実装値                                                                                   | 判定 |
| ---------------- | ---------------------------------------------------------------------------------------- | ---- |
| レイヤー依存方向 | Renderer 内完結。IPC / preload / shared types の変更なし                                 | OK   |
| 後方互換性       | `errorMessage: string \| null` は維持し、`streamingError` を primary contract として追加 | OK   |
| 型安全           | production code に `any` / non-null assertion を追加していない                           | OK   |
| P31対策          | `useCallback` 依存配列は local callback / state のみで閉じる                             | OK   |
| P5対策           | `onStreamChunk` / `onStreamEnd` / `onStreamError` の dispose パターンを維持              | OK   |
| DIP準拠          | `WorkspaceChatPanel` は `WorkspaceChatController` を受け取り、具象実装へ直接依存しない   | OK   |

### Task 3: Apple HIG / アクセシビリティ最終確認

| 確認項目                     | 実装値                                                  | 判定 |
| ---------------------------- | ------------------------------------------------------- | ---- |
| エラー色（ライト）           | `#FF3B30`                                               | OK   |
| エラー色（ダーク）           | `#FF453A`                                               | OK   |
| アクション色（ライト）       | `#007AFF`                                               | OK   |
| アクション色（ダーク）       | `#0A84FF`                                               | OK   |
| 背景色                       | `rgba(255,59,48,0.08)` / `rgba(255,69,58,0.12)`         | OK   |
| 角丸                         | `rounded-lg` 相当（8px）                                | OK   |
| `role="alert"` / `aria-live` | `role="alert"` + `aria-live="assertive"`                | OK   |
| dismiss / CTA label          | `aria-label="エラーを閉じる"` / `設定を開く` / `再試行` | OK   |

### Task 4: エッジケース確認

| エッジケース                                | 証跡                                                                                  | 判定 |
| ------------------------------------------- | ------------------------------------------------------------------------------------- | ---- |
| ストリーム中にエラーが連続発火              | 最新エラーで上書きする hook 実装、runtime test `R-25`                                 | OK   |
| リトライ時の重複 user message 保存          | `sendMessageCore({ persistUserMessage: false })`、runtime test `R-26`                 | OK   |
| dismiss 直後に次メッセージ送信              | Phase 11 `TC-11-04` と runtime test `R-27`                                            | OK   |
| `lastUserMessageRef` が null の状態で retry | `retryLastMessage()` の early return                                                  | OK   |
| inline error の二重表示                     | `WorkspaceChatInput` で `!controller.streamingError` guard、panel runtime test `U-07` | OK   |

### Task 5: レビュー判定

| 項目             | 結果                                                         |
| ---------------- | ------------------------------------------------------------ |
| MINOR 指摘       | 0 件                                                         |
| MAJOR / CRITICAL | 0 件                                                         |
| 判定             | PASS                                                         |
| 次アクション     | Phase 11 で screenshot / metadata / manual result を取得する |

## 参照資料

| ドキュメント       | パス                                                                                     | 参照目的                  |
| ------------------ | ---------------------------------------------------------------------------------------- | ------------------------- |
| Phase 1 受入基準   | `docs/30-workflows/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/phase-1-requirements.md`      | AC-1〜AC-6 の基準         |
| Phase 6 テスト拡充 | `docs/30-workflows/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/phase-6-test-expansion.md`    | runtime / panel test 拡充 |
| Phase 9 品質保証   | `docs/30-workflows/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/phase-9-quality-assurance.md` | テスト実行結果            |
| 実装ファイル       | `apps/desktop/src/renderer/views/WorkspaceView/hooks/useWorkspaceChatController.ts`      | hook 契約確認             |
| 実装ファイル       | `apps/desktop/src/renderer/views/WorkspaceView/components/StreamingErrorDisplay.tsx`     | UI 契約確認               |

## 実行手順

1. hook / panel / component の production code を読み、AC ごとの責務を確認する。
2. targeted test suite の結果を突合する。
3. Phase 11 screenshot plan で必要な代表シナリオを固定する。
4. PASS / MINOR / MAJOR / CRITICAL を判定する。

## 統合テスト連携

- `useWorkspaceChatController.runtime.test.ts` が retry / dismiss / state reset を固定する。
- `WorkspaceChatPanel.runtime.test.tsx` が panel-to-input / banner-to-inline-error の統合を固定する。
- `StreamingErrorDisplay.test.tsx` と `mapLLMErrorToStreamingError.test.ts` が UI/action 分岐の境界を固定する。
- Phase 11 では `screenshot:workspace-chat-stream-error` で representative screenshot 5 件を追加取得する。

## 成果物

| 成果物            | パス                                                                                 | 形式       |
| ----------------- | ------------------------------------------------------------------------------------ | ---------- |
| 最終レビュー結果  | `docs/30-workflows/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/phase-10-final-review.md` | Markdown   |
| Phase 11 進行判定 | 本ファイル Task 5                                                                    | インライン |

## 完了条件

- [x] AC-1〜AC-6 の確認が完了している
- [x] アーキテクチャ確認全項目が `OK`
- [x] Apple HIG / a11y 項目が `OK`
- [x] edge case 確認項目が `OK`
- [x] MINOR 指摘が 0 件である
- [x] 判定結果 `PASS` を記録した
- [x] Phase 11 に進行してよい状態である

## 次Phase

Phase 11: 手動テスト (`phase-11-manual-test.md`)
