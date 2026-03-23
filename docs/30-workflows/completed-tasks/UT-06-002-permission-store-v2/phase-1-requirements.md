# Phase 1: 要件定義

## メタ情報

| 項目     | 値                            |
| -------- | ----------------------------- |
| Phase    | 1                             |
| 機能名   | UT-06-002-permission-store-v2 |
| 作成日   | 2026-03-23                    |
| タスクID | UT-06-002                     |

## 目的

タスクの目的、スコープ、受け入れ基準を明文化する。既存 PermissionStore V1 から V2 への拡張に必要な機能要件・非機能要件を抽出する。

## 実行タスク

- Task 1-1: P50チェック（既実装状態の調査）— 対象ファイルの現在の実装状態を確認し、新規実装 or 拡張を判定
- Task 1-2: 要件抽出 — ユーザー要求から機能要件（FR-01〜FR-10）・非機能要件（NFR-01〜NFR-06）を抽出
- Task 1-3: 受け入れ基準作成 — 各要件に対して検証可能な受け入れ基準を定義
- Task 1-4: スコープ定義 — 含むもの/含まないものを明確化
- Task 1-5: 依存タスク調査 — 前提タスク（TASK-SKILL-LIFECYCLE-06）と後続タスクを整理

## 参照資料

| 資料名                     | パス                                                                                                                              | 説明                        |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| Phase 5 PermissionStore IF | `docs/30-workflows/completed-tasks/step-05-par-task-06-trust-permission-governance/outputs/phase-5/permission-store-interface.ts` | AllowedToolEntryV2 正式定義 |
| 既存 PermissionStore       | `apps/desktop/src/main/services/skill/PermissionStore.ts`                                                                         | V1 実装                     |
| 既存 共有型定義            | `packages/shared/src/types/permission-store.ts`                                                                                   | V1 型定義                   |
| 既存 IPC ハンドラ          | `apps/desktop/src/main/ipc/permission-store-handlers.ts`                                                                          | V1 ハンドラ                 |
| セキュリティ仕様           | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                                                      | IPC セキュリティ基準        |

## 実行手順

### ステップ1: P50チェック — 既実装状態の調査

```bash
git log --oneline -20 -- apps/desktop/src/main/services/skill/PermissionStore.ts
grep -n "AllowedToolEntryV2\|expiryPolicy\|revokeSession" apps/desktop/src/main/services/skill/PermissionStore.ts
```

| 判定       | 条件                      | 対応                             |
| ---------- | ------------------------- | -------------------------------- |
| 新規実装   | V2 機能が存在しない       | Phase 4-5 は「新規実装」モード   |
| V1→V2 拡張 | V1 が存在し V2 機能がない | Phase 4-5 は「拡張」モード       |
| 既実装     | V2 機能が既に存在         | Phase 4-5 は「検証・補完」モード |

### ステップ2: 要件抽出

Phase 5 設計書から AllowedToolEntryV2 / IPermissionStoreV2 / calcExpiresAt の機能要件を抽出する。

### ステップ3: FR/NFR 分類

機能要件（FR-01〜FR-10）と非機能要件（NFR-01〜NFR-06）を分類し、優先度を設定する。

## 統合テスト連携

Phase 1 は要件定義フェーズのため、テスト実行は不要。以下の観点を Phase 4 以降に引き継ぐ:

| 引き継ぎ項目      | 内容                                            |
| ----------------- | ----------------------------------------------- |
| カバレッジ基準    | Line 80%+, Branch 60%+, Function 80%+           |
| テスト対象        | PermissionStore V2, calcExpiresAt, IPC ハンドラ |
| 6分岐フローテスト | isToolAllowed の全分岐パスを Phase 4 で設計     |

## 多角的チェック観点

| 観点               | 適用   | 確認内容                                                      |
| ------------------ | ------ | ------------------------------------------------------------- |
| セキュリティ       | 適用   | IPC ハンドラの入力バリデーション（P42準拠 3段バリデーション） |
| アーキテクチャ     | 適用   | レイヤー依存方向（shared→desktop 一方向）                     |
| エラーハンドリング | 適用   | electron-store 読み書きの graceful degradation                |
| IPC通信            | 適用   | `ipc-contract-checklist.md` Phase 1-6 準拠                    |
| UI/UX              | 非適用 | UI変更を伴わないバックエンドタスク                            |
| データ整合性       | 適用   | V1→V2 マイグレーション時のデータ保全                          |

## 成果物

| 成果物     | パス                              | 説明         |
| ---------- | --------------------------------- | ------------ |
| 要件定義書 | `outputs/phase-1/requirements.md` | 要件定義結果 |

## 完了条件

- [ ] P50チェック（既実装状態の調査）が実施されている
- [ ] 要件抽出（FR/NFR 分類）が完了している
- [ ] 受け入れ基準が検証可能な形式で記述されている
- [ ] スコープが明確に定義されている（含む/含まない）
- [ ] 依存タスクが明記されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 2: 設計
