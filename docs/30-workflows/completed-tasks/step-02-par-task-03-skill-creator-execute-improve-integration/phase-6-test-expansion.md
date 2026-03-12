# Phase 6: テスト拡充

## メタ情報

| 項目   | 値                                                            |
| ------ | ------------------------------------------------------------- |
| Phase  | 6                                                             |
| 機能名 | step-02-par-task-03-skill-creator-execute-improve-integration |
| 作成日 | 2026-03-11                                                    |

## 目的

create / execute / improve の失敗系、validation failure、wizard 併用、internal engine failure を検証し、単一セッション導線の回復性を高める。

## 実行タスク

- create 失敗テスト追加: 作成失敗時のエラーメッセージと再試行導線を検証する
- execute 失敗テスト追加: 実行失敗後も analyze と wizard へ戻れることを検証する
- improve 失敗テスト追加: analyze / autoImprove failure 時の UI 維持を検証する
- validation failure テスト追加: `validateSkill` 結果が session card に反映されることを検証する
- wizard 併用テスト追加: secondary action と単一セッションの競合がないことを検証する

## 参照資料

| 参照資料          | パス                                        | 説明           |
| ----------------- | ------------------------------------------- | -------------- |
| テスト戦略        | `outputs/phase-4/test-strategy.md`          | Phase 4 成果物 |
| テストケース一覧  | `outputs/phase-4/test-cases.md`             | Phase 4 成果物 |
| Redテスト追加記録 | `outputs/phase-4/red-test-report.md`        | Phase 4 成果物 |
| 実装記録          | `outputs/phase-5/implementation-summary.md` | Phase 5 成果物 |
| 変更ファイル一覧  | `outputs/phase-5/modified-files.md`         | Phase 5 成果物 |
| 統合フロー記録    | `outputs/phase-5/integration-flow.md`       | Phase 5 成果物 |

## 実行手順

### ステップ1: failure matrix を定義する

create / execute / analyze / autoImprove / validate の各失敗点を洗い出し、UI 挙動を期待値として固定する。

### ステップ2: 回復経路のテストを追加する

失敗後に prompt 編集、再実行、wizard 遷移、selection 維持が可能かをテストする。

### ステップ3: UI 境界の失敗時挙動を確認する

内部エンジンや delegated execution の failure が発生しても、表 UI が内部名称へ崩れないことを検証する。

## 統合テスト連携

| 統合観点           | 検証内容                                | 期待結果                                        |
| ------------------ | --------------------------------------- | ----------------------------------------------- |
| create failure     | create rejection 後の UI                | prompt と再試行導線が保持される                 |
| execute failure    | execute rejection 後の UI               | skill selection が維持される                    |
| improve failure    | analyze / autoImprove rejection 後の UI | 改善欄が error state を表示する                 |
| validation failure | invalid skill result                    | validation summary が session card に表示される |

## 成果物

| 成果物           | パス                                       | 説明                        |
| ---------------- | ------------------------------------------ | --------------------------- |
| 失敗系テスト一覧 | `outputs/phase-6/failure-test-cases.md`    | failure matrix とケース定義 |
| テスト拡充結果   | `outputs/phase-6/test-expansion-report.md` | 追加テストと結果            |

## 完了条件

- [ ] create / execute / improve の主要 failure がテスト化されている
- [ ] 回復経路がテストで確認されている
- [ ] internal engine failure 時も UI 境界が維持されている
