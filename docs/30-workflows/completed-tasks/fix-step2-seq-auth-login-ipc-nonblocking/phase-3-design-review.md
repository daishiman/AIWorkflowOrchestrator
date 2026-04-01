# Phase 3: 設計レビュー

## メタ情報

| 項目   | 値                                         |
| ------ | ------------------------------------------ |
| Phase  | 3                                          |
| 機能名 | auth:login IPCハンドラーの非ブロッキング化 |
| 作成日 | 2026-04-01                                 |

## 目的

Phase 1-2 の要件定義・設計を確認し、Phase 4 以降へ進めるかを判定する。

## 実行タスク

- 500ms timeout と current code の整合を確認する
- `AUTH_STATE_CHANGED` の通知責務が handler と orchestrator で二重化していないか確認する
- 代替案を比較し、fire-and-forget が最小複雑性であることを確認する
- Phase 4 の実装・テストへ進める条件を明記する

## レビュー結果

| 観点       | 判定 | 理由                                                    |
| ---------- | ---- | ------------------------------------------------------- |
| 問題設定   | PASS | blocking の根本原因が `await` にあることが明確          |
| スコープ   | PASS | 変更対象が `authHandlers.ts` と関連テストに絞られている |
| 設計方針   | PASS | fire-and-forget で timeout 制約に合わせる方針が妥当     |
| 後方互換性 | PASS | `authSlice.ts` の listener を変更せずに維持できる       |
| エラーパス | PASS | 失敗通知の source of truth を orchestrator に一本化する |
| 実装可能性 | PASS | 変更量が小さく、既存コードへの影響が限定的              |
| リスク     | PASS | 失敗時の重複通知を避ければ副作用は最小                  |

## 総合判定

**PASS** — Phase 4 以降へ進む。

理由:

- `auth:login` の timeout は 500ms であり、待機をなくすのが最短で確実
- 成功・失敗の `AUTH_STATE_CHANGED` は既存の `AuthFlowOrchestrator` が担当しているため、設計の重複がない
- `authHandlers.ts` は provider validation と起動責務に専念できる

## 代替案比較

| 案  | 内容                                          | 判定                                            |
| --- | --------------------------------------------- | ----------------------------------------------- |
| A   | timeout を延ばす                              | 不採用。根本原因を隠し、UX を悪化させる         |
| B   | handler 側で event を再送信する               | 不採用。`AuthFlowOrchestrator` と責務が重複する |
| C   | fire-and-forget + orchestrator 送信を維持する | 採用。最小複雑性で要件を満たす                  |

## 残課題・注意事項

| 項目                              | 内容                                         |
| --------------------------------- | -------------------------------------------- |
| `sanitizeErrorMessage` の活用     | outer catch では機密情報を含めずにログへ出す |
| `provider` バリデーション         | invalid provider は即時エラーのまま維持する  |
| `AUTH_STATE_CHANGED` 二重送信回避 | handler での再送信を追加しない               |

## 統合テスト連携

| 項目                   | 確認内容                                      | 結果 |
| ---------------------- | --------------------------------------------- | ---- |
| handler response       | 500ms 以内に返る                              | TBD  |
| event ownership        | orchestrator が AUTH_STATE_CHANGED を継続送信 | TBD  |
| listener compatibility | renderer listener 互換                        | TBD  |

## 参照資料

| 資料名                  | パス                                                  | 説明                 |
| ----------------------- | ----------------------------------------------------- | -------------------- |
| 要件定義                | `./phase-1-requirements.md`                           | FR / AC              |
| 設計書                  | `./phase-2-design.md`                                 | fire-and-forget 設計 |
| authFlowOrchestrator.ts | `apps/desktop/src/main/auth/authFlowOrchestrator.ts`  | event source         |
| authSlice.ts            | `apps/desktop/src/renderer/store/slices/authSlice.ts` | listener             |

## 成果物

| 成果物       | パス                       | 説明       |
| ------------ | -------------------------- | ---------- |
| レビュー結果 | `phase-3-design-review.md` | 本ファイル |

## 完了条件

- [ ] Phase 1 の要件が 500ms 前提で実装可能と確認されている
- [ ] Phase 2 の fire-and-forget 設計が妥当と確認されている
- [ ] `AUTH_STATE_CHANGED` の責務が orchestrator に残ることが確認されている
- [ ] 総合判定が PASS である
- [ ] 残課題・注意事項が列挙されている
- [ ] **本Phase内の全タスクを100%実行完了**
