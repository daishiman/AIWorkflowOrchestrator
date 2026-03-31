# Phase 8: リファクタリング

## メタ情報

| 項目       | 内容                    |
| ---------- | ----------------------- |
| Phase      | 8                       |
| タスクID   | TASK-ELECTRON-BUILD-FIX |
| 前提Phase  | Phase 7                 |
| 後続Phase  | Phase 9                 |
| ステータス | completed               |
| 主担当     | Agent-A, Agent-B        |

## 目的

動作を変えずに、設定、スクリプト、テストの重複と読みづらさを削減し、品質 gate を通しやすくする。

## 実行タスク

- 重複設定の抽出
- エラーハンドリングの一貫化
- 命名とコメントの整理
- Before / After / 理由の記録

## 参照資料

| 資料                 | パス                                                                        | 用途                     |
| -------------------- | --------------------------------------------------------------------------- | ------------------------ |
| phase 5              | `docs/30-workflows/electron-build-infra-fix/phase-5-implementation.md`      | 実装内容確認             |
| phase 7              | `docs/30-workflows/electron-build-infra-fix/phase-7-coverage-check.md`      | 守るべき観点確認         |
| quality requirements | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | 読みやすさと保守性の基準 |

## 実行手順

### ステップ1: 重複検出

- tsup 設定、shell script、hook script の重複を確認する

### ステップ2: 安全な整理

- 振る舞いを変えない範囲で重複、命名、エラーハンドリングを整理する

### ステップ3: 記録

- `対象 / Before / After / 理由` を残す

## 統合テスト連携

- リファクタ後に Phase 9 の gate を通す前提で、既存の検証経路を壊さない
- build、ABI、bundle の確認経路を維持する

## 成果物

| 成果物             | パス                                    | 説明     |
| ------------------ | --------------------------------------- | -------- |
| refactor summary   | `outputs/phase-8/refactor-summary.md`   | 変更要点 |
| before-after table | `outputs/phase-8/before-after-table.md` | 変更記録 |

## 完了条件

- [ ] 動作変更を伴わない整理であることが確認されている
- [ ] Before / After / 理由の記録がある
- [ ] naming drift が増えていない
- [ ] Phase 9 の gate に悪影響がない
