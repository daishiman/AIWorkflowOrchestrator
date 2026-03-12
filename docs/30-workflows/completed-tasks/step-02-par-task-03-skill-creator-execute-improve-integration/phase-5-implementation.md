# Phase 5: 実装

## メタ情報

| 項目   | 値                                                            |
| ------ | ------------------------------------------------------------- |
| Phase  | 5                                                             |
| 機能名 | step-02-par-task-03-skill-creator-execute-improve-integration |
| 作成日 | 2026-03-11                                                    |

## 目的

Phase 2 の設計と Phase 4 の Red テストに基づき、Skill Creator の create / execute / improve 導線を `SkillManagementPanel` の単一セッションへ実装する。

## 実行タスク

- セッション UI 実装: list view 上に session card を追加し、自然言語入力と action 群を実装する
- handoff 実装: create 成功後に選択 skill と実行対象を同期する
- improve 実装: analyze / apply improvements / auto improve の導線を session card に接続する
- wizard 縮退実装: `SkillCreateWizard` を secondary action に配置する
- 内部エンジン接続: `skillCreatorAPI.detectMode` と `validateSkill` を UI ヒントへ接続する

## 参照資料

| 参照資料          | パス                                 | 説明           |
| ----------------- | ------------------------------------ | -------------- |
| テスト戦略        | `outputs/phase-4/test-strategy.md`   | Phase 4 成果物 |
| テストケース一覧  | `outputs/phase-4/test-cases.md`      | Phase 4 成果物 |
| Redテスト追加記録 | `outputs/phase-4/red-test-report.md` | Phase 4 成果物 |

## 実行手順

### ステップ1: session card の状態モデルを追加する

`SkillManagementPanel` に session state を追加し、prompt、detected mode、created skill、execution result、improvement summary を保持する。

### ステップ2: create 経路を接続する

自然言語入力から `skill.create` を呼び出し、生成された skill name を選択状態へ同期する。

### ステップ3: execute / improve 経路を接続する

作成済み skill を `executeSkill`、`analyzeSkill`、`applySkillImprovements`、`autoImproveSkill` に接続し、結果表示を同一カードに集約する。

### ステップ4: wizard を secondary action へ移設する

詳細設定導線を session card から開けるようにし、一次導線を list view の session card に固定する。

## 統合テスト連携

| 統合観点           | 実装対象                  | 連携内容                                     |
| ------------------ | ------------------------- | -------------------------------------------- |
| create action      | renderer component + hook | Phase 4 の Red テストを Green 化する         |
| execute handoff    | store + component         | 作成済み skill の selection 同期を保証する   |
| improve action     | hook + component          | analyze / improve の結果表示を保証する       |
| internal mode hint | skillCreatorAPI           | 表 UI で内部エンジンを補助情報として表示する |

## 成果物

| 成果物           | パス                                        | 説明                                  |
| ---------------- | ------------------------------------------- | ------------------------------------- |
| 実装記録         | `outputs/phase-5/implementation-summary.md` | 実装内容と変更点                      |
| 変更ファイル一覧 | `outputs/phase-5/modified-files.md`         | 主要コード差分の整理                  |
| 統合フロー記録   | `outputs/phase-5/integration-flow.md`       | create / execute / improve の接続説明 |

## 完了条件

- [ ] 単一セッションで create / execute / improve に到達できる
- [ ] wizard が secondary action として機能している
- [ ] Phase 4 の Red テストが Green になっている
- [ ] 内部エンジンの責務が UI へ過剰露出していない
