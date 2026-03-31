# Phase 8: リファクタリング

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| Phase      | 8                                             |
| Phase名    | リファクタリング                              |
| 対象機能   | TASK-P0-04-manifest-loader-default-activation |
| 前提Phase  | Phase 7: カバレッジ確認                       |
| 次Phase    | Phase 9: 品質保証                             |
| ステータス | pending                                       |
| 作成日     | 2026-03-29                                    |

## 目的

初期化ロジックの責務を整理し、init メソッドの抽出により Facade コンストラクタの複雑性を低減する。

## 実行タスク

### Task 1: init メソッド抽出

- コンストラクタ内の自動インスタンス化ロジックを専用 init メソッドに抽出する
- init メソッドの可読性を向上する
- 各コンポーネントの生成を個別メソッドに分離する（必要に応じて）

### Task 2: fallback chain 整理

- fallback 判定ロジックの重複を排除する
- dynamic resource pipeline 旧ガードと `plan()` 内の条件分岐を整理する
- 判定ロジックの単一責任化を進める

### Task 3: 命名整理

- 自動インスタンス化関連の変数名・メソッド名を統一する
- internal / external の区別が命名から明確になるようにする

## 参照資料

| 資料名         | パス                                                                  | 説明                       |
| -------------- | --------------------------------------------------------------------- | -------------------------- |
| 実装記録       | `outputs/phase-5/implementation-record.md`                            | 整理対象の本体             |
| カバレッジ     | `phase-7-coverage-check.md`                                           | 重複削減候補               |
| テスト拡充記録 | `outputs/phase-6/extended-test-record.md`                             | 壊してはいけない境界ケース |
| Facade         | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | 整理対象                   |

## 統合テスト連携

- リファクタ後も pipeline activation テストの観測点を変えない
- 命名整理がテスト expectation を壊していないことを確認する

## 成果物

| 成果物               | パス                                    | 説明                |
| -------------------- | --------------------------------------- | ------------------- |
| リファクタリング記録 | `outputs/phase-8/refactoring-record.md` | init 抽出、整理判断 |

## 完了条件

- [ ] init メソッドが抽出されている
- [ ] fallback chain の重複が排除されている
- [ ] 命名が統一されている
- [ ] 最小複雑性の判断理由が記録されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 9: 品質保証](./phase-9-quality-assurance.md)
