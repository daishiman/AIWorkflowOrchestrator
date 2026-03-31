# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 値                                    |
| ---------- | ------------------------------------- |
| Phase      | 12                                    |
| 機能名     | phase11-ui-ux-auto-eval-feedback-loop |
| タスクID   | TASK-UIUX-FEEDBACK-001                |
| 作成日     | 2026-03-31                            |
| ステータス | spec_created                          |
| 担当       | ドキュメント同期担当                  |

## 目的

Phase 11 の証跡と 3 層評価の知見を、implementation guide、system spec update summary、skill feedback へ落とし込み、`.claude` 正本と `.agents` mirror の同期要件を崩さずに close-out できる状態にする。

## 実行タスク

- 実装ガイド 2 パート構成を `outputs/phase-12/implementation-guide.md` に固定する
- canonical root と mirror root の同期方針を `system-spec-update-summary.md` に記録する
- documentation changelog、unassigned detection、skill feedback を current facts で閉じる
- Phase 12 compliance check を用意し、将来時制表現の残存を監査する

## 参照資料

| 資料名                        | パス                                                                                   | 説明                                  |
| ----------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------- |
| Phase 12 ガイド               | `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md` | Task 12-1〜12-6 の基準                |
| Phase 11/12 ガイド            | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`            | screenshot fallback と same-wave sync |
| aiworkflow-requirements SKILL | `.claude/skills/aiworkflow-requirements/SKILL.md`                                      | spec sync の canonical 前提           |

## 実行手順

### ステップ 1: implementation guide の固定

- Part 1 を概念説明、Part 2 を技術説明として分離する
- `outputs/phase-12/implementation-guide.md` を正本成果物として扱う

### ステップ 2: system spec sync の整理

- `.claude/skills/task-specification-creator/` を canonical root として記録する
- `.agents/skills/task-specification-creator/` を mirror 同期対象として記録する
- `artifacts.json` と `outputs/artifacts.json` の同期結果を summary に残す

### ステップ 3: close-out 補助成果物の整備

- `documentation-changelog.md`
- `unassigned-task-detection.md`
- `skill-feedback-report.md`
- `phase12-task-spec-compliance-check.md`

## 統合テスト連携

| 連携先   | 連携内容                          |
| -------- | --------------------------------- |
| Phase 11 | 実行証跡の受け取り元              |
| Phase 13 | PR 本文に反映すべき更新点の整理元 |

## 成果物

| 成果物名                 | パス                                                                                     | 説明                                    |
| ------------------------ | ---------------------------------------------------------------------------------------- | --------------------------------------- |
| ドキュメント更新仕様     | `docs/30-workflows/task-uiux-feedback-001-phase11-enhancement/phase-12-documentation.md` | 本フェーズの親仕様書                    |
| 実装ガイド               | `outputs/phase-12/implementation-guide.md`                                               | Part 1 / Part 2 の実装ガイド            |
| システム仕様更新サマリー | `outputs/phase-12/system-spec-update-summary.md`                                         | canonical / mirror / artifacts 同期結果 |
| 変更履歴                 | `outputs/phase-12/documentation-changelog.md`                                            | 更新ファイル一覧                        |
| 未タスク検出             | `outputs/phase-12/unassigned-task-detection.md`                                          | 0件でも残すレポート                     |
| スキルフィードバック     | `outputs/phase-12/skill-feedback-report.md`                                              | 改善提案またはなしの根拠                |
| compliance check         | `outputs/phase-12/phase12-task-spec-compliance-check.md`                                 | Phase 12 完了判定                       |

## 完了条件チェックリスト

- [ ] implementation guide の 2 パート構成が明記されている
- [ ] canonical `.claude` / mirror `.agents` の扱いが明記されている
- [ ] outputs/phase-12 配下の 6 成果物が列挙されている
- [ ] artifacts 同期と将来時制表現監査の扱いが定義されている
- [ ] spec_created 現在地として、same-wave sync 済み範囲と未実行範囲が矛盾なく分離されている
