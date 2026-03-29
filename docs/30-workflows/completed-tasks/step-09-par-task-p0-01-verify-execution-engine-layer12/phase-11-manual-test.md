# Phase 11: 手動テスト

## メタ情報

| 項目   | 値                              |
| ------ | ------------------------------- |
| Phase  | 11                              |
| 機能名 | verify-execution-engine-layer12 |
| 作成日 | 2026-03-29                      |

## 目的

実装着手後に verification engine を実 skill ディレクトリへ適用する際の確認手順を固定し、`spec_created` 現在地で必要な非画面証跡を整理する。

## 実行タスク

- 正常系 walkthrough の確認手順を固定する
- 不完全・空ディレクトリ walkthrough の確認手順を固定する
- 結果型と severity の確認観点を固定する
- `spec_created` 現在地の非画面証跡を記録する

## テストケース

| テストケース | 観点           | 手順                                                                | 期待結果                                             |
| ------------ | -------------- | ------------------------------------------------------------------- | ---------------------------------------------------- |
| `TC-11-01`   | 正常構造       | `.agents/skills/` 配下の既存 skill ディレクトリで verify を実行する | 全 Layer 1 チェック pass、Layer 2 チェック概ね pass  |
| `TC-11-02`   | 不完全構造     | SKILL.md のみのテスト用ディレクトリで verify を実行する             | L1-002/L1-003 fail、L2 SKILL.md チェックは実行される |
| `TC-11-03`   | 空ディレクトリ | 空のテスト用ディレクトリで verify を実行する                        | 全 Layer 1 error チェック fail、graceful に結果返却  |
| `TC-11-04`   | 結果型確認     | 返却された `RuntimeSkillCreatorVerifyCheck[]` の構造を確認する      | layer, severity, summary, evidenceSummary が全て存在 |

## 証跡マトリクス

| テストケース | 対象           | 証跡パス                                    | 実施方針                                  |
| ------------ | -------------- | ------------------------------------------- | ----------------------------------------- |
| `TC-11-01`   | 正常系候補     | `outputs/phase-11/manual-test-checklist.md` | walkthrough 手順を current facts で固定   |
| `TC-11-02`   | 部分 fail 候補 | `outputs/phase-11/manual-test-result.md`    | 実装後に確認すべき fail path を列挙する   |
| `TC-11-03`   | 全 fail 候補   | `outputs/phase-11/discovered-issues.md`     | blocker / note / info の分類基準を残す    |
| `TC-11-04`   | 型構造確認     | `outputs/phase-11/manual-test-report.md`    | 非画面証跡で確認する current state を残す |

## 参照資料

| 資料名                 | パス                                            | 説明           |
| ---------------------- | ----------------------------------------------- | -------------- |
| Phase 2 design         | `outputs/phase-2/verification-engine-design.md` | class plan     |
| Phase 4 test matrix    | `outputs/phase-4/test-matrix.md`                | baseline suite |
| Phase 5 実装           | `phase-5-implementation.md`                     | engine 実装    |
| Phase 6 test expansion | `phase-6-test-expansion.md`                     | edge case      |
| Phase 7 coverage plan  | `phase-7-coverage-check.md`                     | coverage gate  |
| Phase 8 refactoring    | `phase-8-refactoring.md`                        | utility split  |
| Phase 9 QA             | `phase-9-quality-assurance.md`                  | quality gate   |
| Phase 10 final review  | `phase-10-final-review.md`                      | AC matrix      |

## 実行手順

### ステップ1: 正常 skill ディレクトリで検証する

- `.agents/skills/` 配下の既存 skill（例: `task-specification-creator`）を対象に `verify()` を実行する。
- 全 Layer 1 チェックが pass であることを確認する。
- Layer 2 チェックの結果を確認し、warning があれば妥当性を判断する。
- `spec_created` 現在地ではコマンド実行を行わず、対象 skill・期待結果・再実行条件だけを証跡へ固定する。

### ステップ2: 不完全・空ディレクトリで検証する

- SKILL.md のみ配置したテスト用ディレクトリで実行し、部分 fail を確認する。
- 空ディレクトリで実行し、全 fail + graceful degradation を確認する。
- 発見事項は `Blocker / Note / Info` へ分類する。
- `spec_created` 現在地では fixture 条件と期待 fail を証跡へ先行記録する。

### ステップ3: 結果型の妥当性を確認する

- 返却配列の各要素が `id`, `layer`, `severity`, `summary`, `evidenceSummary` を持つことを確認する。
- `layer` が `"layer1"` または `"layer2"` であることを確認する。
- current facts では型観点と manual walkthrough 観点の境界を `manual-test-report.md` へ分離する。

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

- [ ] 正常系 walkthrough の手順と期待結果を固定した
- [ ] 不完全・空ディレクトリの fail path と分類基準を固定した
- [ ] 結果型の構造確認観点と再実行条件を固定した
- [ ] **本Phase内の全タスクを100%実行完了**
