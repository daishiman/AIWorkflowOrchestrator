# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 12                                     |
| タスクID   | TASK-RALLY-002                         |
| 機能名     | restored-pending-request-clarification |
| タスク名   | restoredPendingRequest合成ルール明確化 |
| 前提Phase  | Phase 11                               |
| 後続Phase  | Phase 13                               |
| 作成日     | 2026-04-21                             |
| ステータス | pending                                |
| 実装モード | verify_existing                        |

## 目的

RALLY-002 の close-out を、`task-specification-creator` と `aiworkflow-requirements` の両正本に沿って記録する。Task 12-1〜12-5 を明示し、Task 12-2 では Step 1-A〜1-D を必須、Step 2 は no-op / required の条件判定として扱う。

## 実行タスク

| Task      | 内容                             | 主成果物                                                                                              |
| --------- | -------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Task 12-1 | 実装ガイド作成                   | `outputs/phase-12/implementation-guide.md`                                                            |
| Task 12-2 | システム仕様更新                 | `outputs/phase-12/system-spec-update-summary.md`                                                      |
| Task 12-3 | ドキュメント更新履歴             | `outputs/phase-12/documentation-changelog.md`                                                         |
| Task 12-4 | 未タスク検出                     | `outputs/phase-12/unassigned-task-detection.md`                                                       |
| Task 12-5 | スキルフィードバックと準拠再確認 | `outputs/phase-12/skill-feedback-report.md`, `outputs/phase-12/phase12-task-spec-compliance-check.md` |

- Task 12-1: 実装ガイド作成
- Task 12-2: システム仕様更新
- Task 12-3: ドキュメント更新履歴
- Task 12-4: 未タスク検出
- Task 12-5: スキルフィードバックと準拠再確認

## 事前チェック【必須】

- Step 1 は「完了記録」であり、実装ガイド更新ではない
- Step 1-A〜1-D は必須
- Step 2 は外部 contract / state semantics / phase semantics が変わった場合のみ required
- NON_VISUAL のため `UI/UX変更なしのため Phase 11 スクリーンショット不要` を必ず実装ガイドへ記載する

## 実行手順

1. Task 12-1 として implementation guide を作成する。
2. Task 12-2 で Step 1-A〜1-D を記録し、続けて Step 2 の no-op / required を判定する。
3. Task 12-3〜12-5 を順に作成し、最後に compliance check へ集約する。

## 統合テスト連携

- `implementation-guide.md` には `## 視覚証跡` を設ける
- 固定文言: `UI/UX変更なしのため Phase 11 スクリーンショット不要`
- 代替証跡: `outputs/phase-10/final-review-result.md`, `outputs/phase-11/manual-test-result.md`

## サブフェーズ

### Task 12-1: 実装ガイド作成

- Part 1: 中学生レベルの説明
- Part 2: 技術者向け説明
- `## 視覚証跡` を含める

### Task 12-2: システム仕様更新

#### Step 1-A: 完了記録

- RALLY-002 の close-out 要約を記録する
- 関連ドキュメントへのリンクを記録する

#### Step 1-B: 実装状況テーブル確認

- 実装状況の更新要否を判定する

#### Step 1-C: 関連タスク同期

- `RALLY-010〜013` への handoff 状態を記録する

#### Step 1-D: index / topic-map 再生成要否

- 今回の更新が task-spec 側だけか、system-spec 側まで及ぶかを判定する

#### Step 2: domain sync 判定

- required 条件: 外部 contract が変わる、state semantics が変わる、phase semantics が変わる
- no-op 条件: コメント追加や仕様固定のみで、外部 contract / state semantics / phase semantics が不変

### Task 12-3: documentation changelog

- 変更したファイル、no-op 判定、実測コマンド結果を記録する

### Task 12-4: unassigned-task detection

- RALLY-002 の範囲外だが後続へ渡すべき懸念を記録する

### Task 12-5: skill feedback と準拠再確認

- workflow 改善点を記録する
- `outputs/phase-12/phase12-task-spec-compliance-check.md` に Task 12-1〜12-5 と Step 1-A〜1-D / Step 2 を集約する

## 参照資料

| 資料名        | パス                                                                                    | 用途          |
| ------------- | --------------------------------------------------------------------------------------- | ------------- |
| Task 正本     | `.claude/skills/task-specification-creator/SKILL.md`                                    | Phase 12 骨格 |
| Phase 12 詳細 | `.claude/skills/task-specification-creator/references/phase-template-phase12-detail.md` | Step 構造確認 |
| 仕様正本      | `.claude/skills/aiworkflow-requirements/SKILL.md`                                       | 同期要件確認  |
| Phase 10 結果 | `outputs/phase-10/final-review-result.md`                                               | 代替証跡      |
| Phase 11 結果 | `outputs/phase-11/manual-test-result.md`                                                | 代替証跡      |

## 成果物

- `outputs/phase-12/implementation-guide.md`
- `outputs/phase-12/system-spec-update-summary.md`
- `outputs/phase-12/documentation-changelog.md`
- `outputs/phase-12/unassigned-task-detection.md`
- `outputs/phase-12/skill-feedback-report.md`
- `outputs/phase-12/phase12-task-spec-compliance-check.md`

## 完了条件

- [ ] Task 12-1〜12-5 をすべて記録した
- [ ] Step 1-A〜1-D を記録した
- [ ] Step 2 を no-op / required で判定した
- [ ] `implementation-guide.md` に `## 視覚証跡` を含めた
- [ ] 固定文言 `UI/UX変更なしのため Phase 11 スクリーンショット不要` を記載した
- [ ] 6成果物を作成した

## タスク100%実行確認【必須】

- [ ] Task 12-1〜12-5 を実行した
- [ ] Step 1-A〜1-D を明記した
- [ ] Step 2 の判定を記録した
- [ ] `outputs/phase-12/phase12-task-spec-compliance-check.md` に判定を集約した

## 次のPhase

Phase 13: PR作成
