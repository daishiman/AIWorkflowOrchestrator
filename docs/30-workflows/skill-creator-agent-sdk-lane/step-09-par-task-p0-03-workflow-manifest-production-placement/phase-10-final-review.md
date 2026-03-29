# Phase 10: 最終レビュー

## メタ情報

| 項目     | 値                                     |
| -------- | -------------------------------------- |
| Phase    | 10                                     |
| 機能名   | workflow-manifest-production-placement |
| 作成日   | 2026-03-29                             |
| タスクID | TASK-P0-03                             |

## 目的

受入基準 AC-1 から AC-6 の最終確認を行い、Phase 11 手動テストへ進めるかを判定する。

## 実行タスク

- AC matrix 最終確認: AC-1 から AC-6 を evidence とともに再確認する
- open findings 整理: 未解決項目を列挙する
- review 判定: PASS / MINOR / MAJOR を記録する

## 参照資料

| 資料名                    | パス                                                  | 説明             |
| ------------------------- | ----------------------------------------------------- | ---------------- |
| phase-1 requirements      | `phase-1-requirements.md`                             | AC 一覧          |
| phase-5 implementation    | `phase-5-implementation.md`                           | 実装結果         |
| phase-7 coverage check    | `phase-7-coverage-check.md`                           | カバレッジ       |
| phase-9 quality assurance | `phase-9-quality-assurance.md`                        | 品質確認結果     |
| quality checklist         | `outputs/phase-9/quality-checklist.md`                | 品質チェック結果 |
| risk register             | `outputs/phase-9/risk-register.md`                    | 残リスク         |
| workflow-manifest.json    | `.agents/skills/skill-creator/workflow-manifest.json` | 検証対象         |

## AC matrix

| AC   | 判定基準                                                         | evidence                     | 結果     |
| ---- | ---------------------------------------------------------------- | ---------------------------- | -------- |
| AC-1 | `.agents/skills/skill-creator/workflow-manifest.json` が存在する | `fs.existsSync()` 結果       | 確認対象 |
| AC-2 | `ManifestLoader.loadManifest()` がエラーなしで完了する           | テスト TC-01 結果            | 確認対象 |
| AC-3 | resource descriptor が実在ファイルを参照する                     | cross-reference 結果         | 確認対象 |
| AC-4 | phase 定義が skill creation workflow lifecycle をカバーする      | phases.length >= 5           | 確認対象 |
| AC-5 | schemaVersion が 1 である                                        | manifest.schemaVersion === 1 | 確認対象 |
| AC-6 | entry/exit hooks が定義され、検証を通過する                      | TC-05, TC-06, TC-07 結果     | 確認対象 |

## 実行手順

### ステップ1: AC を再確認する

AC ごとに evidence を確認し、全て PASS していることを検証する。

### ステップ2: unresolved item を整理する

Phase 9 の risk register から未解決項目を整理する。

### ステップ3: 判定を記録する

PASS なら Phase 11 へ進む。MAJOR なら戻り先 Phase を決める。

## 統合テスト連携

| 観点       | 実施内容                    |
| ---------- | --------------------------- |
| AC review  | 全 AC の evidence 確認      |
| unresolved | open findings の棚卸し      |
| gate       | PASS / MINOR / MAJOR の記録 |

## 多角的チェック観点

| 観点     | この Phase で確認する内容                                         |
| -------- | ----------------------------------------------------------------- |
| 判断力   | manifest 配置と ManifestLoader コード変更を混同せず判定しているか |
| 客観性   | evidence に基づいて判定しているか                                 |
| 逆算思考 | TASK-P0-04 への引き継ぎに必要な情報が揃っているか                 |

## サブタスク管理

1. AC matrix 最終確認
2. open findings 整理
3. gate 判定
4. Phase 11 input 整理

## 成果物

| 成果物              | パス                                      | 説明        |
| ------------------- | ----------------------------------------- | ----------- |
| final review result | `outputs/phase-10/final-review-result.md` | 判定結果    |
| open findings       | `outputs/phase-10/open-findings.md`       | 未解決項目  |
| ac matrix result    | `outputs/phase-10/ac-matrix-result.md`    | AC 判定結果 |

## 完了条件

- [ ] AC-1 から AC-6 の最終確認が完了している
- [ ] open findings が記録されている
- [ ] PASS / MINOR / MAJOR の判定が記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] Phase 1 を参照した
- [ ] Phase 5 を参照した
- [ ] Phase 7 を参照した
- [ ] Phase 9 を参照した
- [ ] AC matrix を確認した

## 次のPhase

Phase 11: 手動テスト
