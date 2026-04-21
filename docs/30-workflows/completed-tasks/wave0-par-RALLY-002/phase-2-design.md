# Phase 2: 設計

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 2                                      |
| タスクID   | TASK-RALLY-002                         |
| 機能名     | restored-pending-request-clarification |
| 前提Phase  | Phase 1                                |
| 後続Phase  | Phase 3                                |
| 作成日     | 2026-04-21                             |
| ステータス | completed                              |

## 目的

既存コードを壊さずに意味づけを固定する検証設計を定義し、Phase 4 以降を verify_existing モードで運用できる形にする。

## 実行タスク

1. 変更責務を `comment semantics`、`clear condition verification`、`downstream handoff` に分割する
2. 現コードと上流設計書の矛盾点を設計レベルで解消する
3. 検証コマンド、targeted test、手動確認の責務境界を明記する

## 実行手順

1. `ConversationalInterview.tsx` の既存 `useEffect` と comment 周辺を確認する
2. `rally-phase-2-solution.md` の「ロジック変更なし」方針と現コード差分を比較する
3. RALLY-002 の成果を RALLY-010 以降が参照できる表現へ圧縮する

## 統合テスト連携

- 単体: `pendingRequest` 優先順と `requestId` 依存でのクリア条件
- 回帰: undo / submit 後の `restoredPendingRequest` ハンドリング
- 手動: リロード後に旧質問を即時表示し、その後 snapshot 側へ切り替わること

## 多角的チェック観点（AIが判断）

- システム思考: downstream の UI 追加タスクへどう波及するか
- 因果関係分析: `awaitingUserInput` 更新と `restoredPendingRequest` クリアの因果を分離できているか
- トレードオン思考: 新規実装を増やすより既存実装を検証する方が適切か
- 論点思考: RALLY-002 の責務を「説明固定」に絞れているか

## サブタスク管理

| 項目                | 設計判断                                                            |
| ------------------- | ------------------------------------------------------------------- |
| topology            | `ConversationalInterview.tsx` 単一ファイルに閉じる                  |
| downstream contract | RALLY-010 以降は「pendingRequest の意味が既に固定済み」を前提とする |
| validation path     | typecheck / lint / targeted test / manual semantic check            |

## 設計要点

- `implementation_mode` は `verify_existing`
- `pendingRequest` 合成式は既存の null 合体順を維持する
- Phase 5 は「diff check が主、コード修正は従」とする
- Phase 11 は NON_VISUAL とし、視覚証跡ではなく semantic result を残す

## 参照資料

| 資料名         | パス                                                                   | 用途     |
| -------------- | ---------------------------------------------------------------------- | -------- |
| Phase 1 成果物 | `outputs/phase-1/*.md`                                                 | 要件固定 |
| 上流解決策     | `docs/30-workflows/00-task-spec-design-docs/rally-phase-2-solution.md` | 設計整合 |

## 成果物

- `outputs/phase-2/verification-design.md`
- `outputs/phase-2/responsibility-boundary-matrix.md`
- `outputs/phase-2/validation-command-matrix.md`

## 完了条件

- [ ] verify_existing 前提の設計に置き換えた
- [ ] validation path をコマンド単位で定義した
- [ ] RALLY-010 以降への handoff を明文化した

## タスク100%実行確認【必須】

- [ ] 実行タスク 1〜3 完了
- [ ] 成果物を全件定義
- [ ] 4条件で設計矛盾がない

## 次のPhase

Phase 3: 設計レビューゲート
