# Phase 2: 設計

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 2                                      |
| タスクID   | TASK-RALLY-002                         |
| 機能名     | restored-pending-request-clarification |
| タスク名   | restoredPendingRequest合成ルール明確化 |
| 前提Phase  | Phase 1                                |
| 後続Phase  | Phase 3                                |
| 作成日     | 2026-04-21                             |
| ステータス | pending                                |
| 実装モード | verify_existing                        |

## 目的

既存コードを壊さずに意味を固定するための設計を定義する。RALLY-002 の設計対象はコード改修設計ではなく、検証設計・責務境界・後続 handoff 契約の3点とする。

## 実行タスク

1. `comment semantics`、`clear condition verification`、`downstream handoff` の3責務へ分割する。
2. 上流解決策と現状コードの差分を比較し、追加実装が不要である根拠を残す。
3. 自動検証、targeted verification、手動 semantic check のコマンドと目的を定義する。

## 参照資料

| 資料名           | パス                                                                                     | 用途                       |
| ---------------- | ---------------------------------------------------------------------------------------- | -------------------------- |
| Phase 1 要件定義 | `outputs/phase-1/requirements-definition.md`                                             | 対象・非対象の確認         |
| Phase 1 受入基準 | `outputs/phase-1/acceptance-criteria.md`                                                 | AC-1〜AC-5 の確認          |
| 解決策設計書     | `docs/30-workflows/completed-tasks/00-task-spec-design-docs-2/rally-phase-2-solution.md` | verify_existing 方針の確認 |
| レビュー資料     | `docs/30-workflows/completed-tasks/00-task-spec-design-docs-2/rally-phase-3-review.md`   | downstream 依存の確認      |
| 対象コード       | `apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx`                 | 実コードとの整合確認       |

## 実行手順

1. Phase 1 の AC を読み、Phase 2 が背負う責務を3つに絞る。
2. 現状コードと上流解決策を突き合わせ、ロジック変更不要の根拠を `verification-design.md` に記録する。
3. 検証コマンドと evidence の取得方法を `validation-command-matrix.md` に整理する。
4. downstream handoff 契約を `responsibility-boundary-matrix.md` に明記する。

## 統合テスト連携

- `pnpm --filter @repo/desktop typecheck`
- `pnpm --filter @repo/desktop exec eslint src/renderer/components/skill/ConversationalInterview.tsx`
- `pnpm --filter @repo/desktop exec vitest run ...ConversationalInterview...`

テストは「書き換える設計」ではなく「既存挙動を固定する設計」として扱う。

## 多角的チェック観点（AIが判断）

- 合成順序を変更しない
- クリア条件の依存を変更しない
- コメント追加や handoff 文書化で目的を満たせるなら、それを優先する
- 後続タスクへ誤解なく引き渡せるかを設計完了条件に含める

## サブタスク管理

| concern | 内容                         | 成果物                              |
| ------- | ---------------------------- | ----------------------------------- |
| C1      | comment semantics            | `verification-design.md`            |
| C2      | clear condition verification | `validation-command-matrix.md`      |
| C3      | downstream handoff           | `responsibility-boundary-matrix.md` |

## 成果物

- `outputs/phase-2/verification-design.md`
- `outputs/phase-2/responsibility-boundary-matrix.md`
- `outputs/phase-2/validation-command-matrix.md`

## 完了条件

- [ ] 3責務へ分割した
- [ ] ロジック変更不要の根拠を記録した
- [ ] 検証コマンドと evidence 取得方法を記録した
- [ ] handoff 契約を記録した

## タスク100%実行確認【必須】

- [ ] Phase 2 の3成果物を作成した
- [ ] `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/wave0-par-RALLY-002 --phase 2` を実行または実行可能な状態にした
- [ ] Phase 3 へ渡すレビュー論点を固定した

## 次のPhase

Phase 3: 設計レビューゲート
