# Phase 12: ドキュメント更新 - Skill Runtime API Key Panel

## メタ情報

| 項目       | 値                     |
| ---------- | ---------------------- |
| タスクID   | TASK-RT-04             |
| Phase      | 12 - ドキュメント更新  |
| 前提Phase  | Phase 1, 2, 5〜11 完了 |
| 関連Issue  | #1881                  |
| ステータス | completed              |

## 目的

実装ガイド・system spec update・未タスク検出・スキルフィードバックを完了させる。

## 実行タスク

- Task 12-1: 実装ガイド（Part 1 / Part 2）を作成する
- Task 12-2: system spec update summary と current facts / canonical root / mirror parity を同期する
- Task 12-3: documentation changelog を作成する
- Task 12-4: unassigned-task detection を 0件でも出力する
- Task 12-5: skill feedback report を作成する
- Task 12-6: phase12-task-spec-compliance-check で全完了と parity を確認する

## 参照資料

| 資料名                                     | パス                                                                                   | 用途                             |
| ------------------------------------------ | -------------------------------------------------------------------------------------- | -------------------------------- |
| Phase 11 手動テスト                        | [phase-11-manual-test.md](phase-11-manual-test.md)                                     | manual evidence                  |
| task-specification-creator Phase 12 ガイド | `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md` | 必須タスク定義                   |
| aiworkflow-requirements 正本               | `.claude/skills/aiworkflow-requirements/SKILL.md`                                      | system spec update の参照元      |
| aiworkflow-requirements mirror             | `.agents/skills/aiworkflow-requirements/SKILL.md`                                      | canonical / mirror parity の確認 |

## 統合テスト連携

- 依存Phase: Phase 1, Phase 2, Phase 5, Phase 6, Phase 7, Phase 8, Phase 9, Phase 10, Phase 11
- Phase 11 の current build screenshots を Phase 12 の更新へ引き継ぐ
- 生成した system spec と current facts を同一 wave で閉じる
- `artifacts.json` と `outputs/artifacts.json` の parity を current facts として残す

## 成果物

| 成果物                       | パス                                                   |
| ---------------------------- | ------------------------------------------------------ |
| 実装ガイド                   | outputs/phase-12/implementation-guide.md               |
| システム仕様更新サマリー     | outputs/phase-12/system-spec-update-summary.md         |
| ドキュメント変更ログ         | outputs/phase-12/documentation-changelog.md            |
| 未タスク検出レポート         | outputs/phase-12/unassigned-task-detection.md          |
| スキルフィードバックレポート | outputs/phase-12/skill-feedback-report.md              |
| Phase 12 準拠チェック        | outputs/phase-12/phase12-task-spec-compliance-check.md |

## 完了条件

- [x] 実装ガイドが Part 1 / Part 2 を含んでいる
- [x] システム仕様更新が current facts と整合している
- [x] canonical root と mirror parity が記録されている
- [x] `artifacts.json` と `outputs/artifacts.json` の parity が記録されている
- [x] 未タスク検出レポートが出力されている
- [x] スキルフィードバックレポートが出力されている
