# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                    |
| ---------- | ----------------------- |
| Phase      | 9                       |
| タスクID   | TASK-ELECTRON-BUILD-FIX |
| 前提Phase  | Phase 8                 |
| 後続Phase  | Phase 10                |
| ステータス | completed               |
| 主担当     | Agent-D                 |

## 目的

lint、typecheck、build test、ABI、preload bundle の 6 gate を一括で通し、Phase 10 の最終判定材料を作る。

## 実行タスク

- lint 実行
- typecheck 実行
- shared / desktop の build test 実行
- ABI 確認
- preload bundle の外部参照確認

## 参照資料

| 資料           | パス                                                                   | 用途             |
| -------------- | ---------------------------------------------------------------------- | ---------------- |
| workflow index | `docs/30-workflows/electron-build-infra-fix/index.md`                  | AC 参照          |
| phase 5        | `docs/30-workflows/electron-build-infra-fix/phase-5-implementation.md` | 実装確認         |
| phase 8        | `docs/30-workflows/electron-build-infra-fix/phase-8-refactoring.md`    | リファクタ後確認 |

## 実行手順

### ステップ1: 静的 gate

- `pnpm lint`
- `pnpm typecheck`

### ステップ2: build / runtime gate

- shared test
- desktop test
- ABI 確認
- preload bundle 確認

### ステップ3: 総括

- 1 件でも FAIL があれば戻り先を明記して差し戻す

## 統合テスト連携

- lint、typecheck、shared test、desktop test、ABI、bundle の 6 gate を横断で確認する
- 結果を Phase 10 の AC 判定へ引き渡す

## 成果物

| 成果物         | パス                                | 説明           |
| -------------- | ----------------------------------- | -------------- |
| quality report | `outputs/phase-9/quality-report.md` | 全 gate の結果 |
| risk ledger    | `outputs/phase-9/risk-ledger.md`    | 残課題と戻り先 |

## 完了条件

- [ ] AC-8 と AC-9 の判定が出ている
- [ ] AC-1〜AC-6 に接続するテスト結果がある
- [ ] ABI と preload bundle の確認結果がある
- [ ] Phase 10 の最終判定に必要な証跡が揃っている
