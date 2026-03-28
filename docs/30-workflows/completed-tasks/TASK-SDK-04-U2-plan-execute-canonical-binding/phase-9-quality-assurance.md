# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| Phase      | 9                                             |
| Phase名    | 品質保証                                      |
| 対象機能   | TASK-SDK-04-U2-plan-execute-canonical-binding |
| 前提Phase  | Phase 8: リファクタリング                     |
| 次Phase    | Phase 10: 最終レビュー                        |
| ステータス | completed                                     |
| 作成日     | 2026-03-27                                    |

## 目的

構造、命名、依存関係、成果物名がすべて揃っているかを品質ゲートとして確認する。

## 実行タスク

### Task 1: 実装品質

- approved snapshot の owner と API binding を確認する
- stale state と hidden coupling がないことを確認する

### Task 2: 仕様書品質

- phase 名、成果物名、artifacts 名称を統一する
- Phase 11/12 の補助成果物を先に定義する

## 参照資料

| 資料名           | パス                                                 | 説明             |
| ---------------- | ---------------------------------------------------- | ---------------- |
| 実装記録         | `outputs/phase-5/implementation-record.md`           | 品質ゲートの根拠 |
| リファクタリング | `phase-8-refactoring.md`                             | 品質ゲート対象   |
| 仕様 skill       | `.agents/skills/task-specification-creator/SKILL.md` | 準拠基準         |

## 統合テスト連携

- validator 前提のファイル命名をここで固定する
- Phase 10 へ渡す blocker をここで出し切る

## 成果物

| 成果物           | パス                                | 説明           |
| ---------------- | ----------------------------------- | -------------- |
| 品質保証レポート | `outputs/phase-9/quality-report.md` | 品質ゲート結果 |

## 完了条件

- [ ] 実装品質の blocker が整理されている
- [ ] 仕様書品質の drift が解消されている
- [ ] artifacts と実ファイル名が揃っている
- [ ] Phase 10 に渡す gate 材料が揃っている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 10: 最終レビュー](./phase-10-final-review.md)
