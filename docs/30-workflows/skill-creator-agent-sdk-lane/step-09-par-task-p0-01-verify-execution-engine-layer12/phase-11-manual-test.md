# Phase 11: 手動テスト

## メタ情報

| 項目   | 値                              |
| ------ | ------------------------------- |
| Phase  | 11                              |
| 機能名 | verify-execution-engine-layer12 |
| 作成日 | 2026-03-29                      |

## 目的

実際の skill ディレクトリに対して verification engine を実行し、Layer 1/2 チェック結果が期待通りであることを人手で確認する。

## 実行タスク

- 正常な skill ディレクトリでの検証確認
- 不完全な skill ディレクトリでの検証確認
- 結果型と severity の妥当性確認
- TASK-P0-02 連携の理解しやすさ確認

## テストケース

| テストケース | 観点           | 手順                                                                | 期待結果                                             |
| ------------ | -------------- | ------------------------------------------------------------------- | ---------------------------------------------------- |
| `TC-11-01`   | 正常構造       | `.agents/skills/` 配下の既存 skill ディレクトリで verify を実行する | 全 Layer 1 チェック pass、Layer 2 チェック概ね pass  |
| `TC-11-02`   | 不完全構造     | SKILL.md のみのテスト用ディレクトリで verify を実行する             | L1-002/L1-003 fail、L2 SKILL.md チェックは実行される |
| `TC-11-03`   | 空ディレクトリ | 空のテスト用ディレクトリで verify を実行する                        | 全 Layer 1 error チェック fail、graceful に結果返却  |
| `TC-11-04`   | 結果型確認     | 返却された `RuntimeSkillCreatorVerifyCheck[]` の構造を確認する      | layer, severity, summary, evidenceSummary が全て存在 |

## 画面カバレッジマトリクス

| テストケース | 対象            | 画面/証跡                                      | 実施方針                        |
| ------------ | --------------- | ---------------------------------------------- | ------------------------------- |
| `TC-11-01`   | engine 実行結果 | `outputs/phase-11/screenshots/placeholder.png` | テスト出力の representative log |
| `TC-11-02`   | 部分 fail 結果  | `outputs/phase-11/screenshots/placeholder.png` | テスト出力の representative log |
| `TC-11-03`   | 全 fail 結果    | `outputs/phase-11/screenshots/placeholder.png` | テスト出力の representative log |
| `TC-11-04`   | 型構造確認      | `outputs/phase-11/screenshots/placeholder.png` | TypeScript 型チェック出力       |

## 参照資料

| 資料名                 | パス                             | 説明           |
| ---------------------- | -------------------------------- | -------------- |
| Phase 4 test matrix    | `outputs/phase-4/test-matrix.md` | baseline suite |
| Phase 5 実装           | `phase-5-implementation.md`      | engine 実装    |
| Phase 6 test expansion | `phase-6-test-expansion.md`      | edge case      |
| Phase 9 QA             | `phase-9-quality-assurance.md`   | quality gate   |
| Phase 10 final review  | `phase-10-final-review.md`       | AC matrix      |

## 実行手順

### ステップ1: 正常 skill ディレクトリで検証する

- `.agents/skills/` 配下の既存 skill（例: `task-specification-creator`）を対象に `verify()` を実行する。
- 全 Layer 1 チェックが pass であることを確認する。
- Layer 2 チェックの結果を確認し、warning があれば妥当性を判断する。

### ステップ2: 不完全・空ディレクトリで検証する

- SKILL.md のみ配置したテスト用ディレクトリで実行し、部分 fail を確認する。
- 空ディレクトリで実行し、全 fail + graceful degradation を確認する。
- 発見事項は `Blocker / Note / Info` へ分類する。

### ステップ3: 結果型の妥当性を確認する

- 返却配列の各要素が `id`, `layer`, `severity`, `summary`, `evidenceSummary` を持つことを確認する。
- `layer` が `"layer1"` または `"layer2"` であることを確認する。

## 統合テスト連携

- Phase 12 に walkthrough 結果を反映する。
- 発見された Blocker は Phase 13 の blocked 条件に追加する。

## 成果物

| 成果物            | パス                                        | 説明                       |
| ----------------- | ------------------------------------------- | -------------------------- |
| manual checklist  | `outputs/phase-11/manual-test-checklist.md` | 人手確認項目               |
| manual result     | `outputs/phase-11/manual-test-result.md`    | 実施結果                   |
| manual report     | `outputs/phase-11/manual-test-report.md`    | walkthrough 所見           |
| discovered issues | `outputs/phase-11/discovered-issues.md`     | Blocker / Note / Info 分類 |

## 完了条件

- [ ] 正常 skill ディレクトリで全 Layer 1 pass を確認した
- [ ] 不完全・空ディレクトリで適切な fail を確認した
- [ ] 結果型の構造が期待通りであることを確認した
- [ ] **本Phase内の全タスクを100%実行完了**
