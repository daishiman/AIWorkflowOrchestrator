# Phase 4: テスト作成

## メタ情報

| 項目   | 値                              |
| ------ | ------------------------------- |
| Phase  | 4                               |
| 機能名 | verify-execution-engine-layer12 |
| 作成日 | 2026-03-29                      |

## 目的

Layer 1/2 全チェック項目の pass/fail シナリオ、結果型の検証、Facade injection の動作確認を test matrix として定義する。

## 実行タスク

- Layer 1 pass/fail test case を定義する
- Layer 2 pass/fail test case を定義する
- engine 集約結果の test case を定義する
- Facade injection test case を定義する

## 参照資料

| 資料名              | パス                                     | 説明                    |
| ------------------- | ---------------------------------------- | ----------------------- |
| Phase 1 要件        | `phase-1-requirements.md`                | チェック項目一覧        |
| Phase 2 設計        | `phase-2-design.md`                      | validator / engine 設計 |
| layer check catalog | `outputs/phase-2/layer-check-catalog.md` | L1/L2 チェック ID       |
| Phase 3 review      | `phase-3-design-review.md`               | gate 判定結果           |

## 実行手順

### ステップ1: Layer 1 テストケースを定義する

| テストケース | チェックID | シナリオ                        | 期待結果                                          |
| ------------ | ---------- | ------------------------------- | ------------------------------------------------- |
| `T-L1-01`    | L1-001     | SKILL.md が存在する             | pass, layer: "layer1"                             |
| `T-L1-02`    | L1-001     | SKILL.md が存在しない           | fail, severity: error, evidenceSummary にパス記載 |
| `T-L1-03`    | L1-002     | agents/ が存在する              | pass                                              |
| `T-L1-04`    | L1-002     | agents/ が存在しない            | fail, severity: error                             |
| `T-L1-05`    | L1-003     | agents/ 配下にファイルあり      | pass                                              |
| `T-L1-06`    | L1-003     | agents/ は空ディレクトリ        | fail, severity: error                             |
| `T-L1-07`    | L1-004     | references/ が存在する          | pass                                              |
| `T-L1-08`    | L1-004     | references/ が存在しない        | fail, severity: warning                           |
| `T-L1-09`    | L1-005     | output-schema.json が存在する   | pass                                              |
| `T-L1-10`    | L1-005     | output-schema.json が存在しない | fail, severity: warning                           |

### ステップ2: Layer 2 テストケースを定義する

| テストケース | チェックID | シナリオ                                 | 期待結果                |
| ------------ | ---------- | ---------------------------------------- | ----------------------- |
| `T-L2-01`    | L2-001     | SKILL.md に `# スキル名` あり            | pass, layer: "layer2"   |
| `T-L2-02`    | L2-001     | SKILL.md に H1 heading なし              | fail, severity: error   |
| `T-L2-03`    | L2-002     | `## 概要` セクションあり                 | pass                    |
| `T-L2-04`    | L2-002     | `## 概要` セクションなし                 | fail, severity: error   |
| `T-L2-05`    | L2-003     | `## Trigger` セクションあり              | pass                    |
| `T-L2-06`    | L2-003     | `## Trigger` セクションなし              | fail, severity: error   |
| `T-L2-07`    | L2-004     | `## Anchors` セクションあり              | pass                    |
| `T-L2-08`    | L2-004     | `## Anchors` セクションなし              | fail, severity: warning |
| `T-L2-09`    | L2-005     | agent ファイルに `# エージェント名` あり | pass                    |
| `T-L2-10`    | L2-005     | agent ファイルに H1 heading なし         | fail, severity: error   |
| `T-L2-11`    | L2-006     | agent ファイルに `## 責務` あり          | pass                    |
| `T-L2-12`    | L2-006     | agent ファイルに `## 責務` なし          | fail, severity: warning |
| `T-L2-13`    | L2-007     | output-schema.json が valid JSON         | pass                    |
| `T-L2-14`    | L2-007     | output-schema.json が invalid JSON       | fail, severity: error   |

### ステップ3: engine 集約テストケースを定義する

| テストケース | シナリオ                  | 期待結果                                           |
| ------------ | ------------------------- | -------------------------------------------------- |
| `T-ENG-01`   | 完全な skill ディレクトリ | 全チェック pass、layer1/layer2 エントリ混在        |
| `T-ENG-02`   | 空ディレクトリ            | Layer 1 全 error、Layer 2 スキップ（依存関係）     |
| `T-ENG-03`   | SKILL.md のみ存在         | Layer 1 部分 fail、Layer 2 SKILL.md チェックは実行 |

### ステップ4: Facade injection テストケースを定義する

| テストケース | シナリオ                              | 期待結果                           |
| ------------ | ------------------------------------- | ---------------------------------- |
| `T-FAC-01`   | engine を inject して verify 呼び出し | engine.verify() が呼ばれ結果が返る |
| `T-FAC-02`   | engine 未 inject で verify 呼び出し   | 適切なエラーまたはデフォルト動作   |

## 統合テスト連携

- Phase 6 で破損ファイル、権限不足、symlink 等の edge case を追加する。
- Phase 7 で L1/L2 全チェック ID の test coverage を集計する。

## 成果物

| 成果物      | パス                             | 説明                         |
| ----------- | -------------------------------- | ---------------------------- |
| test matrix | `outputs/phase-4/test-matrix.md` | pass/fail シナリオと期待結果 |

## 完了条件

- [ ] L1-001〜L1-005 の pass/fail case が定義されている
- [ ] L2-001〜L2-007 の pass/fail case が定義されている
- [ ] engine 集約と Facade injection の test case がある
- [ ] **本Phase内の全タスクを100%実行完了**
