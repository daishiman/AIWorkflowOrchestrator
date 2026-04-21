# Phase 5: 実装

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 5                                      |
| タスクID   | TASK-RALLY-002                         |
| 機能名     | restored-pending-request-clarification |
| 前提Phase  | Phase 4                                |
| 後続Phase  | Phase 6                                |
| 作成日     | 2026-04-21                             |
| ステータス | completed                              |

## 目的

本ブランチに既に存在する実装を diff で確認し、仕様とのズレがある箇所だけを最小修正する。

## 実行タスク

1. `ConversationalInterview.tsx` の現実装と Phase 2 設計を照合する
2. 仕様との差分が見つかった場合のみ comment / wording / tiny guard を修正する
3. typecheck / lint / targeted test で verify_existing を完了する

## 実行手順

```bash
git diff -- apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/desktop lint
```

## 統合テスト連携

- Phase 4 で定義した targeted scenario のみを主確認とする
- 既存コードが仕様を満たすなら「変更なし」を許容する

## 多角的チェック観点（AIが判断）

- 逆説思考: 変更しない方が正しい箇所を増やしていないか
- トレードオン思考: 追加修正のコストが downstream 価値を上回っていないか

## サブタスク管理

| 変更区分      | 方針                                                                                        |
| ------------- | ------------------------------------------------------------------------------------------- |
| new file      | `ConversationalInterview.restoredPendingRequest.test.tsx` を targeted regression として追加 |
| existing file | `ConversationalInterview.tsx` の comment / wording のみ                                     |
| no-op         | ロジック本体は既に仕様一致なら diff-check-result に記録                                     |

## 参照資料

| 資料名         | パス                   | 用途     |
| -------------- | ---------------------- | -------- |
| Phase 4 成果物 | `outputs/phase-4/*.md` | 確認対象 |

## 成果物

- `outputs/phase-5/diff-check-result.md`
- `outputs/phase-5/changed-files.md`
- `outputs/phase-5/verification-result.md`

## 完了条件

- [ ] 現実装と仕様の差分を確認した
- [ ] 必要な場合のみ最小修正した
- [ ] typecheck / lint / targeted test を確認した

## タスク100%実行確認【必須】

- [ ] 実行タスク 1〜3 完了
- [ ] AC-1〜AC-5 を再確認
- [ ] 成果物を全件定義

## 次のPhase

Phase 6: テスト拡充
