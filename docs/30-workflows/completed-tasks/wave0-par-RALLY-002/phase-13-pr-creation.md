# Phase 13: PR作成

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 13                                     |
| タスクID   | TASK-RALLY-002                         |
| 機能名     | restored-pending-request-clarification |
| 前提Phase  | Phase 12                               |
| 後続Phase  | - （タスク完了）                       |
| 作成日     | 2026-04-21                             |
| ステータス | blocked（user approval待ち）           |

## 目的

user の明示承認が得られた場合のみ、変更を Pull Request として提出できる状態に整える。

## 実行タスク

1. Phase 1〜12 の完了根拠と local check 結果を再確認する
2. user approval 未取得時は blocked 理由を記録して終了する
3. 承認後のみ PR 情報を組み立て、作成結果を記録する

## PR作成手順（承認後のみ実施）

```bash
# 1. 変更内容の最終確認
git diff --stat

# 2. PR作成
gh pr create \
  --title "feat(conversational-interview): TASK-RALLY-002 clarify restoredPendingRequest priority rule" \
  --body "..."
```

## PR説明テンプレート

```markdown
## 概要

TASK-RALLY-002: `pendingRequest` 合成式の優先ルールを明確化する。

## 変更内容

- `pendingRequest` 合成式の直上に優先ルール説明コメントを追加
- `workflowSnapshot?.awaitingUserInput` が確定したとき `restoredPendingRequest` をクリアする `useEffect` を追加

## 背景

`restoredPendingRequest ?? workflowSnapshot?.awaitingUserInput` という合成式の優先ルールが
コード上に明示されておらず、設計の意図が読み取れなかった（RALLY Phase 1 懸念点2）。

セッション復元フローでの正しい動作をコードで明示し、後続タスク（RALLY-010〜013）の
ConversationalInterview.tsx 変更の基盤を整備する。

## テスト

- [x] `pnpm --filter @repo/desktop typecheck` 通過
- [x] `pnpm --filter @repo/desktop lint` 通過（exhaustive-deps 含む）
- [x] シナリオテスト（正常系・異常系・境界値）全通過
- [x] 既存テスト全通過

## 関連タスク

- Wave 0 並列: RALLY-001, RALLY-004
- Wave 1 後続: RALLY-010（本PR完了が前提）
```

## 参照資料

| 資料名                   | パス                                                     | 用途                |
| ------------------------ | -------------------------------------------------------- | ------------------- |
| 最終レビュー結果         | `outputs/phase-10/final-review-result.md`                | Phase 10 の完了根拠 |
| 手動テスト結果           | `outputs/phase-11/manual-test-result.md`                 | Phase 11 の一次証跡 |
| Phase 12 準拠確認        | `outputs/phase-12/phase12-task-spec-compliance-check.md` | close-out 完了確認  |
| ゲート判定               | `outputs/phase-10/gate-decision.md`                      | Phase 10 成果物     |
| 出荷準備チェック         | `outputs/phase-10/release-readiness-checklist.md`        | Phase 10 成果物     |
| 手動テストチェックリスト | `outputs/phase-11/manual-test-checklist.md`              | Phase 11 成果物     |
| 証跡インデックス         | `outputs/phase-11/evidence-index.md`                     | Phase 11 成果物     |
| 実装ガイド               | `outputs/phase-12/implementation-guide.md`               | Phase 12 成果物     |
| 仕様更新サマリー         | `outputs/phase-12/system-spec-update-summary.md`         | Phase 12 成果物     |
| 変更ログ                 | `outputs/phase-12/documentation-changelog.md`            | Phase 12 成果物     |
| 未タスク検出             | `outputs/phase-12/unassigned-task-detection.md`          | Phase 12 成果物     |
| スキルフィードバック     | `outputs/phase-12/skill-feedback-report.md`              | Phase 12 成果物     |

## 統合テスト連携

- PR 前の local check は Phase 5〜11 の再実行ではなく、変更サマリーと主要検証結果の再確認に集約する
- 承認未取得時は blocked のままにし、完了扱いへ進めない

## 多角的チェック観点（AIが判断）

- 戦略的思考: Phase 13 を approvals と切り離すことで docs 作業完了を詰まらせていないか
- 逆説思考: 承認なしで PR を進めた場合に何が壊れるかを先に封じているか
- 価値提案思考: レビュアーが最短で意図を理解できる summary を用意できているか

## サブタスク管理

- P13-1: local check 集約
- P13-2: blocked 理由記録
- P13-3: 承認後の PR 情報作成

## 成果物

| 成果物          | パス                                     | 説明                           |
| --------------- | ---------------------------------------- | ------------------------------ |
| local check結果 | `outputs/phase-13/local-check-result.md` | Phase 1〜12 の主要検証結果要約 |
| change summary  | `outputs/phase-13/change-summary.md`     | PR本文の元になる変更要約       |
| PR情報          | `outputs/phase-13/pr-info.md`            | 承認後に使うタイトル・本文草案 |
| PR作成結果      | `outputs/phase-13/pr-creation-result.md` | 承認後に作成した場合のみ記録   |

## 完了条件

- [ ] user approval 未取得なら blocked 理由を記録した
- [ ] 承認後に実施した場合は PR URL と結果を記録した
- [ ] 成果物テーブル記載のファイルを必要条件に応じて生成した

## タスク100%実行確認【必須】

- [ ] Phase 1〜12 全完了確認
- [ ] 受け入れ基準 AC-1〜AC-5 全 PASS
- [ ] user approval 未取得時は blocked を維持
