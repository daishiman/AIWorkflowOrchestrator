# Phase 4: テスト作成

## メタ情報

| 項目       | 値                               |
| ---------- | -------------------------------- |
| Phase      | 4                                |
| 機能名     | TASK-RALLY-009                   |
| タスク名   | getSkillCreatorApi()型ガード強化 |
| 前提Phase  | Phase 3                          |
| 後続Phase  | Phase 5                          |
| 作成日     | 2026-04-21                       |
| ステータス | pending                          |

## 目的

型ガード関数および`getSkillCreatorApi()`・`getSessionResumeApi()`に対するテスト仕様を作成し、Red状態を確認する。

## 実行タスク

- TC-1〜TC-7のテスト仕様を作成する
- Vitestでテストファイルを作成する（Red状態確認）
- 統合テスト計画を策定する

## テストケース一覧

| テストケース | 内容                                                                      | 期待結果                            |
| ------------ | ------------------------------------------------------------------------- | ----------------------------------- |
| TC-1         | `window.skillCreatorAPI`がundefined                                       | `getSkillCreatorApi()`がnullを返す  |
| TC-2         | `window.skillCreatorAPI`が空オブジェクト`{}`                              | `getSkillCreatorApi()`がnullを返す  |
| TC-3         | `window.skillCreatorAPI`が必須メソッドの一部のみ持つオブジェクト          | 型ガードが失敗しnullを返す          |
| TC-4         | `window.skillCreatorAPI`が全必須メソッドを持つオブジェクト                | 型ガードが成功しオブジェクトを返す  |
| TC-5         | `window.skillCreatorAPI`がnull                                            | `getSkillCreatorApi()`がnullを返す  |
| TC-6         | `getSessionResumeApi()`にSessionResumeApiの必須メソッドを持つオブジェクト | 型ガードが成功しオブジェクトを返す  |
| TC-7         | `window.electronAPI?.skillCreator`にフォールバックするケース              | electronAPI経由でオブジェクトが返る |

## 参照資料

| 資料名             | パス                                     | 用途          |
| ------------------ | ---------------------------------------- | ------------- |
| 受け入れ基準       | `outputs/phase-1/acceptance-criteria.md` | Phase 1成果物 |
| アーキテクチャ設計 | `outputs/phase-2/design-spec.md`         | Phase 2成果物 |
| ゲート判定         | `outputs/phase-3/gate-decision.md`       | Phase 3成果物 |

## 成果物

| 成果物         | パス                                       | 説明                 |
| -------------- | ------------------------------------------ | -------------------- |
| テスト仕様書   | `outputs/phase-4/test-specification.md`    | TC-1〜TC-7の詳細仕様 |
| Red結果        | `outputs/phase-4/red-test-result.md`       | 実装前テスト失敗記録 |
| 統合テスト計画 | `outputs/phase-4/integration-test-plan.md` | 統合テスト方針       |

## 完了条件

- [ ] TC-1〜TC-7のテスト仕様が作成されていること
- [ ] テストがRed状態（実装前に失敗）であることが確認されていること
- [ ] 統合テスト計画が策定されていること
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 5: 実装
