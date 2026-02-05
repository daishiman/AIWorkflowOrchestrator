# TASK-AUTH-SESSION-REFRESH-001: セッション自動リフレッシュ実装

## メタ情報

| 項目         | 内容                           |
| ------------ | ------------------------------ |
| タスクID     | TASK-AUTH-SESSION-REFRESH-001  |
| 元タスクID   | UX-002                         |
| GitHub Issue | #278                           |
| タスク名     | セッション自動リフレッシュ実装 |
| 分類         | 改善                           |
| 対象機能     | OAuth認証（Desktop）           |
| 優先度       | 中                             |
| 見積もり規模 | 中規模                         |
| ステータス   | 仕様書作成完了                 |
| 作成日       | 2026-02-05                     |

## 概要

Access Token有効期限切れ前に自動的にRefresh Tokenを使用してトークンをリフレッシュし、ユーザーの作業を中断させないセッション自動リフレッシュ機能を実装する。

## Phase構成

| Phase | 名称                 | カテゴリ     | 依存Phase               |
| ----- | -------------------- | ------------ | ----------------------- |
| 1     | 要件定義             | 要件         | -                       |
| 2     | 設計                 | 設計         | 1                       |
| 3     | 設計レビューゲート   | ゲート       | 1, 2                    |
| 4     | テスト作成           | TDD-Red      | 1, 2, 3                 |
| 5     | 実装                 | TDD-Green    | 4                       |
| 6     | テスト拡充           | 品質         | 5                       |
| 7     | テストカバレッジ確認 | 品質         | 5, 6                    |
| 8     | リファクタリング     | TDD-Refactor | 1, 2, 5, 6, 7           |
| 9     | 品質保証             | 品質         | 5                       |
| 10    | 最終レビューゲート   | ゲート       | 1, 2, 5                 |
| 11    | 手動テスト検証       | 検証         | 1, 2, 5, 6, 7, 8, 9, 10 |
| 12    | ドキュメント更新     | 文書化       | 全Phase                 |
| 13    | PR作成               | 完了         | 全Phase                 |

## 主要成果物

| 種別   | 成果物                          | 配置先                                                         |
| ------ | ------------------------------- | -------------------------------------------------------------- |
| 実装   | TokenRefreshScheduler           | `apps/desktop/src/main/services/tokenRefreshScheduler.ts`      |
| 実装   | authHandlers.ts修正             | `apps/desktop/src/main/ipc/authHandlers.ts`                    |
| 実装   | authSlice修正                   | `apps/desktop/src/renderer/store/slices/authSlice.ts`          |
| テスト | TokenRefreshScheduler単体テスト | `apps/desktop/src/main/services/tokenRefreshScheduler.test.ts` |

## スコープ

### 含むもの

- TokenRefreshScheduler実装（Main Process）
- authSlice修正（Renderer Process - 自動リフレッシュ連携）
- authHandlers.ts修正（IPC - リフレッシュハンドラー改善）
- リフレッシュ失敗時のフォールバック処理
- ユニットテスト追加

### 含まないもの

- ログイン履歴記録（AUDIT-001として別タスク）
- オフライン時の動作（別タスク）
- Refresh Token自動更新（Supabase SDK側で管理）

## 関連ドキュメント

| ドキュメント         | パス                                                             |
| -------------------- | ---------------------------------------------------------------- |
| 元タスク指示書       | `docs/30-workflows/unassigned-task/task-auth-session-refresh.md` |
| セキュリティガイド   | `docs/00-requirements/17-security-guidelines.md`                 |
| アーキテクチャ設計   | `docs/00-requirements/05-architecture.md`                        |
| API設計              | `docs/00-requirements/08-api-design.md`                          |
| コアインターフェース | `docs/00-requirements/06-core-interfaces.md`                     |
| 既存認証ハンドラー   | `apps/desktop/src/main/ipc/authHandlers.ts`                      |
| 認証状態管理         | `apps/desktop/src/renderer/store/slices/authSlice.ts`            |
| セキュアストレージ   | `apps/desktop/src/main/infrastructure/secureStorage.ts`          |
| 認証共有型定義       | `packages/shared/types/auth.ts`                                  |
| IPCチャネル定義      | `apps/desktop/src/preload/channels.ts`                           |
