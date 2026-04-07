# Phase 13: PR作成（blocked）

## メタ情報

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| Phase      | 13                                          |
| 機能名     | UT-SDK-07-APPROVAL-REQUEST-SURFACE-001      |
| タスク名   | Skill Creator approval request surface 接続 |
| 前提Phase  | Phase 12                                    |
| 後続Phase  | -                                           |
| 作成日     | 2026-04-06                                  |
| ステータス | blocked                                     |

## 目的

ユーザーの明示的な承認が得られるまで blocked を維持し、commit / PR を自動実行せずに local check の結果と change summary を記録する。

## 重要: blocked-only

**commit / PR / push はこの workflow のスコープ外。**

Phase 12 までの全成果物が揃った状態を確認し、Phase 13 は blocked のまま記録する。

## 実行タスク

1. Phase 1〜12 の全成果物が揃っていることを最終確認する
2. ユーザー approval の有無を確認する
3. `outputs/phase-13/local-check-result.md` に blocked 理由と local check 結果を記録する
4. `outputs/phase-13/change-summary.md` に差分要約と未実施範囲を記録する
5. commit / PR / push を実行せず、blocked 状態を維持する

## blocked 記録情報

### 変更対象

| ファイル                                 | 変更内容                        |
| ---------------------------------------- | ------------------------------- |
| `outputs/phase-13/local-check-result.md` | blocked 理由と local check 結果 |
| `outputs/phase-13/change-summary.md`     | 差分要約と未実施範囲            |

## 参照資料

| 参照資料                                                    | パス                                                                             | 説明             |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------- | ---------------- |
| システム仕様更新サマリー                                    | `outputs/phase-12/system-spec-update-summary.md`                                 | Phase 12 成果物  |
| Phase 12 準拠チェック                                       | `outputs/phase-12/phase12-task-spec-compliance-check.md`                         | Phase 12 成果物  |
| ドキュメント更新履歴                                        | `outputs/phase-12/documentation-changelog.md`                                    | Phase 12 成果物  |
| blocked ルール                                              | `.claude/skills/task-specification-creator/references/phase-template-phase13.md` | blocked 判定基準 |
| 最終レビュー結果 outputs/phase-10/corrective-action-plan.md | `outputs/phase-10/final-review-result.md`                                        | Phase 10 成果物  |
| 手動テストチェックリスト                                    | `outputs/phase-11/manual-test-checklist.md`                                      | Phase 11 成果物  |
| 実装ガイド                                                  | `outputs/phase-12/implementation-guide.md`                                       | Phase 12 成果物  |

## 実行手順

1. Phase 12 全成果物を確認する。
2. ユーザー approval の有無を確認し、未取得なら blocked と明記する。
3. blocked 理由、local check 結果、差分要約を `outputs/phase-13/` に記録する。
4. commit / PR / push の実行手順は記録しない。

## 完了条件

- [ ] user approval の有無が記録されている
- [ ] blocked 理由が記録されている
- [ ] local check の結果が記録されている
- [ ] change summary が記録されている
- [ ] commit / PR / push を実行していない
- [ ] Phase 12 までの完了根拠が参照できる

## タスク100%実行確認【必須】

- [ ] blocked 状態を明示している
- [ ] commit / PR / push を誘導する記述を残していない
- [ ] Phase 13 の記録が Phase 12 の成果物と整合している
