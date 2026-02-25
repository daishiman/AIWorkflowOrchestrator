# Phase 1: 要件定義

## メタ情報

| 項目       | 値                               |
| ---------- | -------------------------------- |
| Phase      | 1                                |
| タスクID   | UT-IPC-AUTH-HANDLE-DUPLICATE-001 |
| 機能名     | ut-ipc-auth-handle-duplicate-001 |
| 前提Phase  | なし                             |
| 後続Phase  | Phase 2                          |
| ステータス | 未実施                           |
| 作成日     | 2026-02-25                       |

## 目的

AUTH系 IPC登録の重複式を解消するための機能要件・非機能要件・受け入れ基準を確定する。

## 実行タスク

- SubAgent-A: 既存 `AUTH_*` 登録箇所を列挙し、重複式5件の対象範囲を固定する。
- SubAgent-B: 回帰要件（戻り値、エラー、型契約）を要件化する。
- Lead: 実施範囲と非範囲を確定し、Phase 2へ引き渡す。

## 参照資料

| 参照資料                 | パス                                                                         | 内容               |
| ------------------------ | ---------------------------------------------------------------------------- | ------------------ |
| 元未タスク（完了移管先） | `docs/30-workflows/completed-tasks/task-ipc-auth-handle-duplicate-001.md`    | Why/What/How       |
| 認証IPC仕様              | `.claude/skills/aiworkflow-requirements/references/api-ipc-auth.md`          | AUTHチャネル仕様   |
| IPCセキュリティ          | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` | 登録方式の制約     |
| 関連教訓                 | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`       | 過去の再発防止知見 |

## 実行手順

1. `AUTH_*` の `ipcMain.handle` 登録箇所を抽出する。
2. 重複式の構文差分と契約差分を分離して記録する。
3. 機能要件・品質要件・制約をPhase 1成果物へ整理する。

## 統合テスト連携

| 観点             | 要件                                     |
| ---------------- | ---------------------------------------- |
| Main→Preload契約 | チャネル名・引数・戻り値が既存仕様と一致 |
| エラー伝播       | 認証失敗時のエラー形式を維持             |
| 監査再現性       | 重複式検出コマンドで同一結果が再現       |

## 成果物

| 成果物       | パス                                           | 説明               |
| ------------ | ---------------------------------------------- | ------------------ |
| 要件定義     | `outputs/phase-1/requirements-definition.md`   | 機能/非機能要件    |
| 受入基準     | `outputs/phase-1/acceptance-criteria.md`       | 検証可能な判定条件 |
| SubAgent分担 | `outputs/phase-1/subagent-responsibilities.md` | 役割と責任分解     |

## 完了条件

- [ ] 対象範囲が5件で固定されている
- [ ] 非範囲が明文化されている
- [ ] 受入基準が検証可能な形で定義されている
- [ ] 統合テスト連携要件が記録されている
- [ ] 本Phase内の全タスクを100%実行完了
