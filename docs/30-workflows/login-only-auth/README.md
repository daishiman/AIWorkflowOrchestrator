# login-only-auth ワークフロー

## 概要

ログイン専用画面（AuthView）と認証ガード（AuthGuard）機能の実装ワークフロー。

未認証ユーザーにはログイン画面のみを表示し、認証後にメインアプリケーションへアクセスを許可する。

## 実装ステータス

| フェーズ | ステータス | 説明                  |
| -------- | ---------- | --------------------- |
| Phase 0  | ✅ 完了    | タスク分解・要件定義  |
| Phase 1  | ✅ 完了    | 要件定義・設計        |
| Phase 2  | ✅ 完了    | テスト作成（TDD Red） |
| Phase 3  | ✅ 完了    | 実装（TDD Green）     |
| Phase 4  | ✅ 完了    | リファクタリング      |
| Phase 5  | ✅ 完了    | 品質保証・レビュー    |
| Phase 6  | ✅ 完了    | ドキュメント更新      |

## ドキュメント構成

### タスク仕様書

- [task-login-only-auth.md](./task-login-only-auth.md) - メインタスク仕様書

### 要件定義

- [requirements-auth-guard.md](./requirements-auth-guard.md) - AuthGuard 要件定義
- [requirements-auth-view.md](./requirements-auth-view.md) - AuthView 要件定義

### 設計書

- [design-auth-guard.md](./design-auth-guard.md) - AuthGuard 設計書
- [design-auth-view.md](./design-auth-view.md) - AuthView 設計書

### レビュー

- [review-design.md](./review-design.md) - 設計レビュー結果

### 改善タスク（未実施）

| ドキュメント                                                             | 優先度 | 概要                                                 |
| ------------------------------------------------------------------------ | ------ | ---------------------------------------------------- |
| [task-security-improvements.md](./task-security-improvements.md)         | 高     | CSP設定、入力値バリデーション、IPC sender検証        |
| [task-code-quality-improvements.md](./task-code-quality-improvements.md) | 中     | JSDocコメント、Error Boundary、エラーハンドリング    |
| [task-test-improvements.md](./task-test-improvements.md)                 | 中     | 状態遷移テスト、キーボードナビゲーション、a11yテスト |
| [task-architecture-improvements.md](./task-architecture-improvements.md) | 低     | LoadingScreen配置、アニメーション定義抽出            |

## 実装ファイル

### コンポーネント

| ファイル                                  | 層       | 説明                      |
| ----------------------------------------- | -------- | ------------------------- |
| `components/AuthGuard/index.tsx`          | HOC      | 認証ガードコンポーネント  |
| `components/AuthGuard/LoadingScreen.tsx`  | molecule | ローディング画面          |
| `components/AuthGuard/types.ts`           | -        | 型定義                    |
| `views/AuthView/index.tsx`                | view     | ログイン画面ビュー        |
| `components/atoms/ProviderIcon/index.tsx` | atom     | OAuthプロバイダーアイコン |

### テスト

| ファイル                                                      | テスト数 |
| ------------------------------------------------------------- | -------- |
| `components/AuthGuard/AuthGuard.test.tsx`                     | 10       |
| `views/AuthView/AuthView.test.tsx`                            | 7        |
| `components/organisms/AccountSection/AccountSection.test.tsx` | 31       |

## 関連ドキュメント

- [docs/00-requirements/05-architecture.md](../../00-requirements/05-architecture.md) - アーキテクチャ設計（5.8.5 認証UIコンポーネント）
- [docs/30-workflows/user-auth/](../user-auth/) - 認証バックエンド実装

## 技術スタック

- **フレームワーク**: React 18
- **状態管理**: Zustand (authSlice)
- **スタイリング**: Tailwind CSS
- **テスト**: Vitest + React Testing Library
- **認証基盤**: Supabase Auth (OAuth 2.0 PKCE)
