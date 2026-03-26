# Phase 4: テスト作成

## メタ情報

| 項目   | 値                                    |
| ------ | ------------------------------------- |
| Phase  | 4                                     |
| 機能名 | context-budget-and-resource-selection |
| 作成日 | 2026-03-26                            |

## 目的

source discovery、resource selection、token budget、degrade 条件の検証観点を定義する。

## 実行タスク

- source discovery 正常系 / 異常系を定義する
- budget tier の正常系 / 異常系を定義する
- provenance snapshot と degrade reason の検証観点を定義する

## 参照資料

| 資料名                   | パス                                          | 説明                     |
| ------------------------ | --------------------------------------------- | ------------------------ |
| Phase 1 抽出表           | `outputs/phase-1/spec-extraction-map.md`      | source / provenance 論点 |
| Phase 2 設計             | `phase-2-design.md`                           | 設計本文                 |
| source resolution matrix | `outputs/phase-2/source-resolution-matrix.md` | candidate root 観点      |
| budget degrade matrix    | `outputs/phase-2/budget-degrade-matrix.md`    | budget / degrade 観点    |
| Phase 3 gate             | `outputs/phase-3/design-review-gate.md`       | review pass 条件         |

## 実行手順

### ステップ1: source discovery case を定義する

- manifest absolute path が存在する場合
- explicit path が manifest を上書きする場合
- env / home / repo bundle の fallback を使う場合
- 同名 resource が複数 root に存在し conflict する場合

### ステップ2: budget / degrade case を定義する

- required-core だけで収まる場合
- optional-quality を落として収める場合
- required resource 欠落で degrade する場合
- structure mismatch で採択 root を切り替える場合

## 統合テスト連携

- `ResourceLoader` / `SkillCreatorSourceResolver` 単体テストを作る。
- `RuntimeSkillCreatorFacade.plan()` は fixed 3 agent 読み込みから planner 経由へ変わっても public contract を維持する。
- Phase 9 で silent fallback がないことを再確認する。

## 成果物

| 成果物       | パス                             | 説明                         |
| ------------ | -------------------------------- | ---------------------------- |
| テスト作成書 | `phase-4-test-creation.md`       | test 観点の本文              |
| test matrix  | `outputs/phase-4/test-matrix.md` | suite / regression case 一覧 |

## 完了条件

- [ ] resource 選択の正常系 / 異常系が定義されている
- [ ] multi-root discovery と structure variant がテスト対象に入っている
- [ ] provenance snapshot と degrade reason の検証観点がある
      [ ] **本Phase内の全タスクを100%実行完了**
