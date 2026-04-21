# Phase 8: リファクタリング

## メタ情報

| 項目       | 値                               |
| ---------- | -------------------------------- |
| Phase      | 8                                |
| 機能名     | TASK-RALLY-009                   |
| タスク名   | getSkillCreatorApi()型ガード強化 |
| 前提Phase  | Phase 7                          |
| 後続Phase  | Phase 9                          |
| 作成日     | 2026-04-21                       |
| ステータス | pending                          |

## 目的

実装コードの品質を向上させ、型ガード関数のJSDocコメントを整備する。テストが全てGreenのままリファクタリングを完了する。

## 実行タスク

- `isSkillCreatorRuntimeApi`・`isSessionResumeApi`にJSDocコメントを追加する（なぜ型ガードが必要かを説明）
- `getSkillCreatorApi()`・`getSessionResumeApi()`に「runtime型ガードを通過したオブジェクトのみ返す」旨のコメントを追加する
- 型ガード関数の配置（同一ファイル内かユーティリティファイルに分離するか）を既存コードのパターンに合わせて判断する
- リファクタリング後にテストがGreenのままであることを確認する

## 参照資料

| 資料名             | パス                                         | 用途          |
| ------------------ | -------------------------------------------- | ------------- |
| カバレッジ計画     | `outputs/phase-7/coverage-plan.md`           | Phase 7成果物 |
| 未到達分析         | `outputs/phase-7/uncovered-analysis-plan.md` | Phase 7成果物 |
| アーキテクチャ設計 | `outputs/phase-2/design-spec.md`             | Phase 2成果物 |

## 成果物

| 成果物         | パス                                             | 説明                       |
| -------------- | ------------------------------------------------ | -------------------------- |
| リファクタ計画 | `outputs/phase-8/refactoring-plan.md`            | リファクタリング内容と根拠 |
| 再テスト計画   | `outputs/phase-8/post-refactor-test-plan.md`     | リファクタ後の再テスト方針 |
| 責務境界マップ | `outputs/phase-8/responsibility-boundary-map.md` | 型ガード関数の責務整理     |

## 完了条件

- [ ] リファクタリング後もテストが全てGreenであること
- [ ] JSDocコメントが追加されていること
- [ ] 型ガード関数の配置が適切であること
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 9: 品質保証
