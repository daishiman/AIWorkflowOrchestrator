# Phase 12: スキルフィードバックレポート

## タスクID: TASK-SC-CREATOR-UPDATE-IMPL-001

## task-specification-creator へのフィードバック

### FB-001: `implementation_mode` 定義の正本不一致

| 項目       | 内容                                                                                              |
| ---------- | ------------------------------------------------------------------------------------------------- |
| 対象スキル | `task-specification-creator`                                                                      |
| 問題       | `implementation_mode` の値として `new` と `new_feature` が混在しており、どちらが正式かが曖昧      |
| 影響       | task index.md 作成時にどちらを選択すべきか迷う。本 task では既存リポジトリ慣習に従い `new` を採用 |
| 改善提案   | `task-specification-creator` の定義を `new` に統一し、`new_feature` を deprecated または削除する  |
| 優先度     | 低（誤解を防ぐための明確化）                                                                      |

## aiworkflow-requirements へのフィードバック

### FB-002: update mode の実装パターン記録

| 項目   | 内容                                                                                                                                                  |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| 対象   | `api-ipc-system-skill-creator.md`                                                                                                                     |
| 提案   | `runUpdateWorkflow()` の実装パターン（read → purpose-regen → StructurePlanJson）を current facts として記録すると、次の update 系タスクで参照しやすい |
| 優先度 | 低（Step 2 N/A のため必須ではない）                                                                                                                   |

## skill-creator への追加フィードバック

### FB-003: update-process と app runtime 実装の乖離

| 項目     | 内容                                                                                                           |
| -------- | -------------------------------------------------------------------------------------------------------------- |
| 対象     | `skill-creator/references/update-process.md`                                                                   |
| 問題     | skill 正本は差分適用ベースの update を示すが、app runtime は依然として新規生成寄りの共通後続処理を共有している |
| 影響     | skill を正本として読むエージェントと実アプリ実装の期待がずれる                                                 |
| 改善提案 | 既知制約として明記するか、runtime 実装を差分更新契約へ合わせる follow-up task を正本へ相互参照する             |
| 優先度   | 中                                                                                                             |

## 改善なし項目

- Phase 1〜12 の骨格自体は機能しており、今回のタスク遂行に問題なし
- NON_VISUAL task の代替証跡設計（typecheck + unit test）は適切に機能した
