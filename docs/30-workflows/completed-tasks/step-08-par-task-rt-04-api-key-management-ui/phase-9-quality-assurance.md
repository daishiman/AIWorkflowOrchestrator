# Phase 9: 品質保証

## メタ情報

| 項目       | 値                    |
| ---------- | --------------------- |
| Phase      | 9                     |
| 機能名     | api-key-management-ui |
| 作成日     | 2026-03-29            |
| ステータス | pending               |

## 目的

lint、typecheck、link、mirror parity、line budget、セキュリティ観点をまとめて判定する。

## 実行タスク

- 品質コマンドを実行する
- セキュリティレビューを行う
- AC 根拠を記録する

## 参照資料

| 資料名        | パス                                                                         | 説明             |
| ------------- | ---------------------------------------------------------------------------- | ---------------- |
| Phase 8       | `phase-8-refactoring.md`                                                     | リファクタ後状態 |
| quality guide | `.agents/skills/task-specification-creator/references/quality-standards.md`  | 品質基準         |
| security spec | `.agents/skills/aiworkflow-requirements/references/security-electron-ipc.md` | IPC セキュリティ |

## 実行手順

### ステップ1: 静的チェック

1. lint
2. typecheck
3. 必要 test suite

### ステップ2: 品質監査

1. line budget
2. link 切れ
3. mirror parity

### ステップ3: AC 根拠整理

1. AC ごとの証跡を整理する。
2. current / baseline を区別する。

## 統合テスト連携

- Phase 10 の gate 判定に渡す根拠を固定する。

## 成果物

| 成果物          | パス                                 | 説明             |
| --------------- | ------------------------------------ | ---------------- |
| quality report  | `outputs/phase-9/quality-report.md`  | 品質総括         |
| security review | `outputs/phase-9/security-review.md` | セキュリティ確認 |
| AC evidence     | `outputs/phase-9/ac-evidence.md`     | AC 根拠表        |

## 完了条件

- [ ] lint / typecheck / 必要テスト結果が記録されている
- [ ] line budget / link / parity が監査されている
- [ ] AC evidence が揃っている
- [ ] **本Phase内の全タスクを100%実行完了**
