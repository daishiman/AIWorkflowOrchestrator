# task-imp-error-reporting-001: エラーレポーティングサービス統合

| 項目         | 内容                             |
| ------------ | -------------------------------- |
| タスクID     | task-imp-error-reporting-001     |
| タスク名     | エラーレポーティングサービス統合 |
| カテゴリ     | 改善（imp）                      |
| 優先度       | 低（low）                        |
| 規模         | 中（medium）                     |
| ステータス   | 未着手                           |
| 発見元       | コードコメント（TODO）           |
| 発見日       | 2026-01-29                       |
| issue_number | 570                              |

---

## なぜこのタスクが必要か（Why）

### 背景

`apps/desktop/src/renderer/components/AuthGuard/AuthErrorBoundary.tsx:108` に「TODO: 将来的なエラーレポーティングサービスへの送信」というコメントが存在する。現在、AuthErrorBoundaryでキャッチされたエラーはローカルのconsole.errorにのみ出力されており、外部のエラートラッキングサービスには送信されていない。

### 問題点

プロダクション環境でユーザーが遭遇するエラーを把握する手段がない。特に認証フローのエラーはユーザー体験に直接影響するため、発生状況の可視化が重要である。現在の構成では:

- エラー発生率が不明
- エラーの再現条件を特定できない
- ユーザーからの問い合わせでしかエラーを把握できない

### 放置した場合の影響

- プロダクションエラーの検出が遅延する
- エラーの根本原因分析が困難になる
- ユーザー体験の改善サイクルが回らない

---

## 何を達成するか（What）

### 目的

エラーバウンダリでキャッチされたエラーを外部エラートラッキングサービスに送信し、プロダクションエラーの可視化と分析を可能にする。

### 最終ゴール

AuthErrorBoundary（および将来的に他のErrorBoundary）でキャッチされたエラーがエラートラッキングサービスに自動送信され、ダッシュボードで確認できる状態にする。

### スコープ

**含む:**

- エラーレポーティングサービスの選定と初期設定
- AuthErrorBoundary へのエラー送信ロジック追加
- エラーコンテキスト（ユーザー情報、画面情報）の付加
- プライバシーを考慮した個人情報フィルタリング

**含まない:**

- エラートラッキングダッシュボードのカスタマイズ
- 全コンポーネントへのErrorBoundary追加（AuthErrorBoundaryのみ）
- アラート通知の設定（Slack, Email等）
- パフォーマンスモニタリング

### 成果物

| 成果物名                 | 説明                           |
| ------------------------ | ------------------------------ |
| エラーレポーティング設定 | サービス初期設定と環境変数定義 |
| AuthErrorBoundary修正    | エラー送信ロジックの追加       |
| プライバシーフィルター   | 個人情報除去のユーティリティ   |
| テストケース             | エラー送信の検証テスト         |

---

## どのように実行するか（How）

### 前提条件

- エラーレポーティングサービスのアカウント作成
- Electron アプリケーションでの外部サービス統合パターンの理解
- プライバシーポリシーに基づく送信可能データの確認

### 依存タスク

- なし（独立して実行可能。ただし認証機能の本番実装完了後が効果的）

### 必要な知識

- React Error Boundary パターン
- エラートラッキングサービスのSDK（Sentry等）
- Electron のレンダラー/メインプロセス間通信
- 個人情報保護の基本原則

### 推奨アプローチ

Sentry（無料枠: 5Kイベント/月）を使用する。React SDK が Error Boundary と統合しやすく、Electron にも対応している。個人情報フィルタリングは `beforeSend` フックで実装する。

推奨コマンド:

- `pnpm --filter @repo/desktop add @sentry/react @sentry/electron` - Sentry SDK追加
- `pnpm --filter @repo/desktop vitest run AuthErrorBoundary` - テスト実行

---

## 実行手順

### Phase 1: サービス選定と初期設定

**目的**: エラーレポーティングサービスを選定し、初期設定を行う

**手順:**

- エラーレポーティングサービスを選定（Sentry推奨）
- プロジェクト作成とDSN取得
- 環境変数にDSNを設定（`.env.production`）
- SDK をインストール

**成果物:** サービス初期設定、環境変数定義

**完了条件:** SDK がインストールされ、初期化コードが動作すること

### Phase 2: AuthErrorBoundary統合

**目的**: AuthErrorBoundaryにエラー送信ロジックを追加する

**手順:**

- AuthErrorBoundary の `componentDidCatch` にエラー送信処理を追加
- エラーコンテキスト（画面名、認証状態）を付加
- 個人情報フィルタリング（`beforeSend` フック）を実装
- プロダクション環境のみで送信する条件分岐を追加
- テストケースを追加（モックを使用したエラー送信検証）

**成果物:** 修正済みAuthErrorBoundary、プライバシーフィルター、テストケース

**完了条件:** エラー送信が正常に動作し、テストが通過

---

## 完了条件チェックリスト

### 機能要件

- [ ] AuthErrorBoundaryでキャッチされたエラーがサービスに送信される
- [ ] エラーコンテキスト（画面名、認証状態）が付加されている
- [ ] プロダクション環境でのみ送信される
- [ ] 個人情報がフィルタリングされている

### 品質要件

- [ ] エラー送信のテストケースが追加されている
- [ ] 既存テストが全て通過する
- [ ] TypeScript型チェックがエラーなし
- [ ] ESLint警告が増加していない
- [ ] バンドルサイズの増加が許容範囲内

### ドキュメント要件

- [ ] AuthErrorBoundary.tsx のTODOコメントが解消されている
- [ ] 環境変数の設定方法が記載されている

---

## 検証方法

### テストケース

| テストケース                 | 期待結果                           | 検証コマンド                                               |
| ---------------------------- | ---------------------------------- | ---------------------------------------------------------- |
| エラーキャッチ時の送信テスト | モックサービスにエラーが送信される | `pnpm --filter @repo/desktop vitest run AuthErrorBoundary` |
| プロダクション環境判定       | dev環境では送信されない            | `pnpm --filter @repo/desktop vitest run AuthErrorBoundary` |
| 個人情報フィルタリング       | PII がエラーデータに含まれない     | `pnpm --filter @repo/desktop vitest run AuthErrorBoundary` |
| 型チェック                   | エラー0件                          | `pnpm --filter @repo/desktop typecheck`                    |

### 検証手順

- テストでモックサービスを使用し、エラー送信が呼び出されることを確認
- 送信データに個人情報が含まれていないことを確認
- 開発環境では送信が行われないことを確認
- AuthErrorBoundary の既存テストが通過することを確認

---

## リスクと対策

| リスク                          | 影響度 | 確率 | 対策                                                          |
| ------------------------------- | ------ | ---- | ------------------------------------------------------------- |
| 無料枠超過による追加コスト      | 中     | 低   | サンプリングレート設定（例: 10%）で送信量を制御               |
| 個人情報の意図しない送信        | 高     | 中   | beforeSend フックで厳格にフィルタリング、レビュー時にPII確認  |
| SDK追加によるバンドルサイズ増加 | 低     | 高   | Tree-shaking対応SDKを選択、Lazy loadingで初期ロード影響を軽減 |

---

## 参照情報

| ドキュメント              | パス                                                                       | 用途                           |
| ------------------------- | -------------------------------------------------------------------------- | ------------------------------ |
| AuthErrorBoundary         | apps/desktop/src/renderer/components/AuthGuard/AuthErrorBoundary.tsx       | 修正対象（108行目TODO）        |
| technology-backend仕様    | .claude/skills/aiworkflow-requirements/references/technology-backend.md    | 技術スタック参照               |
| technology-devops仕様     | .claude/skills/aiworkflow-requirements/references/technology-devops.md     | 無料枠最適化戦略参照           |
| security-api-electron仕様 | .claude/skills/aiworkflow-requirements/references/security-api-electron.md | セキュリティ要件参照           |
| error-handling仕様        | .claude/skills/aiworkflow-requirements/references/error-handling.md        | エラーハンドリングパターン参照 |

---

## 備考

- Sentry無料枠: 5,000イベント/月（個人開発プロジェクトには十分）
- technology-devops.md の無料枠最適化戦略に準拠してサービスを選定
- 認証機能の本番実装（AUTH系タスク）完了後に実施することで、より実用的なエラートラッキングが可能
- 将来的には他のErrorBoundary（アプリ全体、各機能単位）にも拡張予定
- 発見元: TASK-CI-FIX-001実行中のコードベーススキャン（Phase 12 未タスク検出）
