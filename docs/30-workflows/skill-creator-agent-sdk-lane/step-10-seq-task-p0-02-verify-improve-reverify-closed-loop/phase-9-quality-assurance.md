# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                                             |
| ---------- | ------------------------------------------------ |
| Phase      | 9                                                |
| Phase名    | 品質保証                                         |
| 対象機能   | TASK-P0-02 verify→improve→re-verify 閉ループ修復 |
| 前提Phase  | Phase 8: リファクタリング                        |
| 次Phase    | Phase 10: 最終レビュー                           |
| ステータス | pending                                          |
| 作成日     | 2026-03-29                                       |

## 目的

state machine の不変条件を検証し、閉ループの全遷移が安全であることを品質ゲートとして確認する。

## 実行タスク

### Task 1: state 不変条件の検証

- 「verify phase でのみ recordVerifyPass/Failure が呼べる」不変条件を確認する
- 「improve phase でのみ re-verify が要求できる」不変条件を確認する
- 「遷移テーブルに存在しない遷移は全て禁止される」不変条件を確認する
- dead state（到達不能状態）が存在しないことを再確認する

### Task 2: 実装品質チェック

- recordVerifyPass/Failure の対称性が維持されていることを確認する
- Facade と Engine の責務分離が適切であることを確認する
- IPC handler が Engine の内部状態に直接アクセスしていないことを確認する
- 型安全性: any 型の使用がないことを確認する

### Task 3: 仕様書品質チェック

- phase 名、成果物名、artifacts 名称を統一する
- Phase 11/12 の補助成果物を先に定義する
- artifacts.json と実ファイル名が揃っていることを確認する

## 参照資料

| 資料名               | パス                                       | 説明             |
| -------------------- | ------------------------------------------ | ---------------- |
| 実装記録             | `outputs/phase-5/implementation-record.md` | 品質ゲートの根拠 |
| リファクタリング記録 | `phase-8-refactoring.md`                   | 品質ゲート対象   |
| カバレッジレポート   | `outputs/phase-7/coverage-report.md`       | AC 対応表        |

## 統合テスト連携

- 不変条件のテストが Phase 4/6 で定義されていることを cross-check する
- Phase 10 へ渡す blocker をここで出し切る

## 成果物

| 成果物           | パス                                | 説明                               |
| ---------------- | ----------------------------------- | ---------------------------------- |
| 品質保証レポート | `outputs/phase-9/quality-report.md` | 不変条件検証、実装品質、仕様書品質 |

## 完了��件

- [ ] state 不変条件が全て検証されている
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
