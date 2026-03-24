# Phase 2: 設計

## メタ情報

| 項目     | 値                            |
| -------- | ----------------------------- |
| Phase    | 2                             |
| 機能名   | UT-06-002-permission-store-v2 |
| 作成日   | 2026-03-23                    |
| タスクID | UT-06-002                     |

## 目的

Phase 1 の要件に基づき、AllowedToolEntryV2 ベースの PermissionStore V2 のアーキテクチャ、IPC チャンネル、マイグレーション戦略を設計する。

## 実行タスク

- Task 2-1: 型定義設計 — AllowedToolEntryV2, ExpiryPolicy, IPermissionStoreV2, PermissionStoreSchemaV2, calcExpiresAt を設計
- Task 2-2: PermissionStore V2 実装設計 — isToolAllowed 6分岐フロー, allowToolV2, revokeSessionEntries, マイグレーション
- Task 2-3: IPC チャンネル設計 — permission:clear-session チャンネルの設計（P42準拠 3段バリデーション）
- Task 2-4: セッション終了フック設計 — before-quit イベントでのセッションエントリクリア

## 参照資料

| 資料名                     | パス                                                                                                                              | 説明                        |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| Phase 1 要件定義           | `outputs/phase-1/requirements.md`                                                                                                 | Phase 1 成果物              |
| Phase 5 PermissionStore IF | `docs/30-workflows/completed-tasks/step-05-par-task-06-trust-permission-governance/outputs/phase-5/permission-store-interface.ts` | AllowedToolEntryV2 正式定義 |
| IPC 契約チェックリスト     | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`                                                     | IPC 品質基準                |

## 実行手順

### ステップ1: 型定義設計

Phase 5 設計書から AllowedToolEntryV2, calcExpiresAt, IPermissionStoreV2, PermissionStoreSchemaV2 を `@repo/shared` 配置で設計する。

### ステップ2: PermissionStore V2 フロー設計

isToolAllowed の6分岐フロー、allowToolV2 フロー、revokeSessionEntries フロー、V1→V2 マイグレーションを設計する。

### ステップ3: IPC チャンネル設計

permission:clear-session チャンネルの設計。P42準拠 3段バリデーション、レスポンス型、sender 検証を含める。

### ステップ4: 変更対象ファイル一覧の確定

変更するファイルとその変更種別（拡張/新規）を一覧化する。

## 統合テスト連携

Phase 2 は設計フェーズのため、テスト実行は不要。設計書に以下の情報を含め、Phase 4 に引き継ぐ:

| 引き継ぎ項目           | 内容                                                          |
| ---------------------- | ------------------------------------------------------------- |
| テスト対象ファイル一覧 | テストファイルの配置先とテスト対象クラス/関数を明記           |
| テスト戦略             | 6分岐フローの全パステスト、マイグレーションテスト、IPC テスト |

## 多角的チェック観点

| 観点               | 適用 | 確認内容                                                          |
| ------------------ | ---- | ----------------------------------------------------------------- |
| セキュリティ       | 適用 | IPC ハンドラの入力バリデーション設計（P42準拠）                   |
| アーキテクチャ     | 適用 | レイヤー依存方向、DIP 準拠（IPermissionStoreV2 インターフェース） |
| IPC通信            | 適用 | ipc-contract-checklist.md 準拠、sender 検証設計                   |
| エラーハンドリング | 適用 | electron-store 読み書きの graceful degradation 設計               |
| データ整合性       | 適用 | V1→V2 マイグレーションのデータ保全設計                            |

## 成果物

| 成果物 | パス                        | 説明     |
| ------ | --------------------------- | -------- |
| 設計書 | `outputs/phase-2/design.md` | 設計結果 |

## 完了条件

- [ ] アーキテクチャ設計が定義されている
- [ ] 型定義設計が完了している（AllowedToolEntryV2, IPermissionStoreV2, PermissionStoreSchemaV2, calcExpiresAt）
- [ ] isToolAllowed 6分岐フロー設計が完了している
- [ ] IPC チャンネル設計が完了している（P42準拠 3段バリデーション含む）
- [ ] マイグレーション戦略が定義されている
- [ ] 変更対象ファイル一覧が明確である
- [ ] リスクと対策が記述されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 3: 設計レビュー
