# Phase 7: カバレッジ確認

## メタ情報

| 項目   | 値                              |
| ------ | ------------------------------- |
| Phase  | 7                               |
| 機能名 | verify-execution-engine-layer12 |
| 作成日 | 2026-03-29                      |

## 目的

L1/L2 全チェック ID、engine 集約、Facade injection のテストカバレッジを確認する。

## 実行タスク

- Layer 1 チェック ID の coverage を確認する
- Layer 2 チェック ID の coverage を確認する
- engine / Facade メソッドの coverage を確認する
- edge case の coverage を確認する

## 参照資料

| 資料名                 | パス                                     | 説明              |
| ---------------------- | ---------------------------------------- | ----------------- |
| Phase 4 test matrix    | `outputs/phase-4/test-matrix.md`         | baseline suite    |
| Phase 5 実装           | `phase-5-implementation.md`              | 実装対象          |
| Phase 6 test expansion | `phase-6-test-expansion.md`              | edge case 補完    |
| layer check catalog    | `outputs/phase-2/layer-check-catalog.md` | L1/L2 チェック ID |

## 実行手順

### ステップ1: チェック ID coverage を集計する

**Layer 1 チェック**:

| チェック ID | チェック内容             | pass case | fail case | edge case  |
| ----------- | ------------------------ | --------- | --------- | ---------- |
| L1-001      | SKILL.md 存在            | T-L1-01   | T-L1-02   | 空ファイル |
| L1-002      | agents/ 存在             | T-L1-03   | T-L1-04   | symlink    |
| L1-003      | agents/ 配下ファイル存在 | T-L1-05   | T-L1-06   | 非.md のみ |
| L1-004      | references/ 存在         | T-L1-07   | T-L1-08   | —          |
| L1-005      | output-schema.json 存在  | T-L1-09   | T-L1-10   | —          |

**Layer 2 チェック**:

| チェック ID | チェック内容                | pass case | fail case | edge case        |
| ----------- | --------------------------- | --------- | --------- | ---------------- |
| L2-001      | SKILL.md H1 heading         | T-L2-01   | T-L2-02   | バイナリファイル |
| L2-002      | SKILL.md 概要セクション     | T-L2-03   | T-L2-04   | 空ファイル       |
| L2-003      | SKILL.md Trigger セクション | T-L2-05   | T-L2-06   | —                |
| L2-004      | SKILL.md Anchors セクション | T-L2-07   | T-L2-08   | —                |
| L2-005      | agent H1 heading            | T-L2-09   | T-L2-10   | 0バイトファイル  |
| L2-006      | agent 責務セクション        | T-L2-11   | T-L2-12   | —                |
| L2-007      | output-schema.json JSON     | T-L2-13   | T-L2-14   | truncated JSON   |

### ステップ2: メソッド coverage を確認する

| メソッド                                  | テスト       |
| ----------------------------------------- | ------------ |
| `SkillCreatorVerificationEngine.verify()` | T-ENG-01〜03 |
| `Layer1Validator.validate()`              | T-L1-01〜10  |
| `Layer2Validator.validate()`              | T-L2-01〜14  |
| `Facade.verifySkill()`                    | T-FAC-01〜02 |

## 統合テスト連携

- Phase 9 で coverage gap が品質リスクを残していないか監査する。
- Phase 10 で AC-5 のテスト網羅性を最終判定する。

## 成果物

| 成果物         | パス                        | 説明              |
| -------------- | --------------------------- | ----------------- |
| coverage check | `phase-7-coverage-check.md` | coverage 観点本文 |

## 完了条件

- [ ] L1-001〜L1-005 の全 ID に pass/fail case がある
- [ ] L2-001〜L2-007 の全 ID に pass/fail case がある
- [ ] engine / Facade メソッドの coverage がある
- [ ] edge case の coverage が Phase 6 と整合している
- [ ] **本Phase内の全タスクを100%実行完了**
