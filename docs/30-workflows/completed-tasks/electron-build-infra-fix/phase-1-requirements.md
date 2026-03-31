# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                    |
| ---------- | ----------------------- |
| Phase      | 1                       |
| タスクID   | TASK-ELECTRON-BUILD-FIX |
| 前提Phase  | -                       |
| 後続Phase  | Phase 2                 |
| ステータス | completed               |
| 主担当     | Agent-A, Agent-B        |

## 目的

問題A と問題B の境界、受け入れ基準、対象ファイル、対象外を固定し、後続 Phase で定義ドリフトが起きない状態を作る。

## 実行タスク

- P50 チェックとして対象ファイルの現状と最近の変更履歴を確認する
- AC-1〜AC-9 を確定する
- 対象ファイルインベントリと変更責務を確定する
- `aiworkflow-requirements` から最小限の関連仕様を引く

## 参照資料

| 資料                  | パス                                                                              | 用途                            |
| --------------------- | --------------------------------------------------------------------------------- | ------------------------------- |
| workflow index        | `docs/30-workflows/electron-build-infra-fix/index.md`                             | 共通定義の参照                  |
| resource map          | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                  | 仕様探索起点                    |
| architecture overview | `.claude/skills/aiworkflow-requirements/references/architecture-overview-core.md` | desktop / shared の位置づけ確認 |
| security electron ipc | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`      | preload 境界確認                |

## 実行手順

### ステップ1: 現状把握

- `git log -- <対象ファイル>` とファイル本文を確認する
- preload が CJS 前提で動く箇所と native module を使う箇所を確認する

### ステップ2: 受け入れ基準固定

- `index.md` の AC-1〜AC-9 をこの Phase の正本として再確認する
- 検証不能な表現は採用しない

### ステップ3: 境界固定

- In Scope / Out of Scope を明示する
- 変更ファイルごとの責務を 1 行で定義する

## 統合テスト連携

- AC-1〜AC-9 と後続の自動検証・手動検証の対応を固定する
- 問題A と問題B を別 concern として追跡する

## 成果物

| 成果物               | パス                                      | 説明               |
| -------------------- | ----------------------------------------- | ------------------ |
| 要件サマリー         | `outputs/phase-1/requirements-summary.md` | AC、スコープ、境界 |
| ファイルインベントリ | `outputs/phase-1/file-inventory.md`       | 変更対象一覧       |
| 仕様参照メモ         | `outputs/phase-1/spec-reference-notes.md` | 引いた仕様と理由   |

## 完了条件

- [ ] AC-1〜AC-9 が固定されている
- [ ] 変更対象と対象外が区別されている
- [ ] 問題A と問題B の責務が分離されている
- [ ] 後続 Phase が参照すべき定義源が `index.md` に揃っている
