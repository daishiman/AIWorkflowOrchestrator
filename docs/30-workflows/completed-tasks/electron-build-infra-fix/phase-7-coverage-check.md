# Phase 7: テストカバレッジ確認

## メタ情報

| 項目       | 内容                    |
| ---------- | ----------------------- |
| Phase      | 7                       |
| タスクID   | TASK-ELECTRON-BUILD-FIX |
| 前提Phase  | Phase 5, Phase 6        |
| 後続Phase  | Phase 8                 |
| ステータス | completed               |
| 主担当     | Agent-D                 |

## 目的

問題A、問題B、quality gate への接続が coverage 上も dependency edge 上も不足していないことを確認する。

## 実行タスク

- concern ごとの coverage を整理する
- dependency edge ごとの確認手段を整理する
- 未達観点があれば Phase 6 へ差し戻す

## 参照資料

| 資料                 | パス                                                                        | 用途          |
| -------------------- | --------------------------------------------------------------------------- | ------------- |
| phase 4              | `docs/30-workflows/electron-build-infra-fix/phase-4-test-creation.md`       | AC 対応表     |
| phase 6              | `docs/30-workflows/electron-build-infra-fix/phase-6-test-expansion.md`      | 追加観点      |
| quality requirements | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | coverage 基準 |

## 実行手順

### ステップ1: concern coverage

- 問題A と問題B の各 concern がテストやチェックに接続しているか確認する

### ステップ2: dependency edge coverage

- shared build、preload bundle、native rebuild、packaging hook の edge を確認する

### ステップ3: 差し戻し判定

- 未達があれば Phase 6 へ差し戻し、実装不足が明白な場合は Phase 5 も巻き戻す

## 統合テスト連携

- concern coverage と dependency edge coverage の両方を Phase 9 の gate に接続する
- 未達観点は次のテスト追加候補として formalize する

## 成果物

| 成果物                 | パス                                        | 説明               |
| ---------------------- | ------------------------------------------- | ------------------ |
| coverage report        | `outputs/phase-7/coverage-report.md`        | concern 単位の結果 |
| dependency edge matrix | `outputs/phase-7/dependency-edge-matrix.md` | edge 単位の結果    |
| coverage gap           | `outputs/phase-7/coverage-gap-report.md`    | 未達がある場合のみ |

## 完了条件

- [ ] 問題A と問題B の concern coverage が明記されている
- [ ] dependency edge が明記されている
- [ ] 未達がある場合の戻り先が定義されている
- [ ] Phase 8 で不要なリファクタリングを避ける根拠がある
