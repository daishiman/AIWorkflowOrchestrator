# エラーレポーティングサービス連携 - タスク指示書

## メタ情報

```yaml
issue_number: 317
```

## メタ情報

| 項目         | 内容                             |
| ------------ | -------------------------------- |
| タスクID     | IMP-ERROR-001                    |
| タスク名     | エラーレポーティングサービス連携 |
| 分類         | 改善                             |
| 対象機能     | エラーハンドリング・監視         |
| 優先度       | 低                               |
| 見積もり規模 | 中規模                           |
| ステータス   | 未実施                           |
| 発見元       | Phase 12 未タスク検出            |
| 発見日       | 2026-01-11                       |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

現在、アプリケーションで発生したエラーはローカルでログ出力されるのみで、開発チームがリアルタイムでエラーを把握する手段がない。`AuthErrorBoundary`コンポーネントにTODOコメントとして「将来的なエラーレポーティングサービスへの送信」が記載されている。

### 1.2 問題点・課題

1. 本番環境でのエラーを開発チームが把握できない
2. エラーの傾向分析ができない
3. ユーザーからの報告なしにはバグを発見できない
4. エラーの再現情報（スタックトレース、環境情報）が収集されていない

### 1.3 放置した場合の影響

- 本番環境のバグが発見されずに放置される
- ユーザー体験の低下に気づけない
- 同じエラーが繰り返し発生しても対応できない
- リリース後の品質監視ができない

---

## 2. 何を達成するか（What）

### 2.1 目的

Sentry等のエラーレポーティングサービスと連携し、本番環境で発生したエラーを自動的に収集・通知できるようにする。

### 2.2 最終ゴール

- ErrorBoundaryでキャッチしたエラーがSentryに送信される
- エラー発生時に開発チームに通知される
- エラーの傾向分析ができる
- ユーザー環境情報（OS、アプリバージョン等）が収集される

### 2.3 スコープ

#### 含むもの

- Sentry（または同等のサービス）のセットアップ
- ErrorBoundaryへのSentry連携実装
- 環境変数による有効/無効切り替え
- ユーザープライバシーに配慮した情報収集

#### 含まないもの

- パフォーマンス監視（APM）機能
- ユーザー行動分析（アナリティクス）
- 有料プランの機能

### 2.4 成果物

| 成果物                             | パス                                                                   |
| ---------------------------------- | ---------------------------------------------------------------------- |
| Sentry設定ファイル                 | `apps/desktop/sentry.config.ts`                                        |
| ErrorBoundary更新                  | `apps/desktop/src/renderer/components/AuthGuard/AuthErrorBoundary.tsx` |
| 環境変数定義更新                   | `apps/desktop/.env.example`                                            |
| エラーレポーティングユーティリティ | `apps/desktop/src/renderer/utils/errorReporting.ts`                    |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- Sentryアカウントの作成（無料プランで可）
- Sentry DSN（Data Source Name）の取得
- プライバシーポリシーの更新（必要に応じて）

### 3.2 依存タスク

なし（独立して実装可能）

### 3.3 必要な知識

- Sentry SDK（@sentry/electron または @sentry/react）
- Electron メインプロセス/レンダラープロセスの理解
- 環境変数管理
- プライバシー・GDPR対応

### 3.4 推奨アプローチ

1. Sentryプロジェクトを作成
2. @sentry/electronをインストール
3. エラーレポーティングユーティリティを作成
4. ErrorBoundaryにSentry連携を追加
5. 環境変数で有効/無効を切り替え可能にする
6. プライバシー設定（PII除去）を実装

---

## 4. 実行手順

### Phase構成

Phase 1-13の標準フローに従って実装する。

### Phase 1: 要件定義

#### 機能要件

| ID      | 要件                                                  |
| ------- | ----------------------------------------------------- |
| ERR-001 | ErrorBoundaryでキャッチしたエラーがSentryに送信される |
| ERR-002 | 未キャッチのエラーもSentryに送信される                |
| ERR-003 | エラーにはスタックトレースが含まれる                  |
| ERR-004 | エラーにはアプリバージョンが含まれる                  |
| ERR-005 | エラーにはOS情報が含まれる                            |
| ERR-006 | 環境変数でSentry連携を無効化できる                    |
| ERR-007 | 開発環境ではSentryに送信しない（設定可能）            |

#### 非機能要件

| ID          | 要件                                           |
| ----------- | ---------------------------------------------- |
| NFR-ERR-001 | PII（個人識別情報）は送信しない                |
| NFR-ERR-002 | エラー送信がアプリのパフォーマンスに影響しない |
| NFR-ERR-003 | ネットワークエラー時も本体機能に影響しない     |

### Phase 2: 設計

#### Sentryセットアップ

```typescript
// apps/desktop/src/main/sentry.ts
import * as Sentry from "@sentry/electron";

export function initSentry() {
  if (process.env.SENTRY_DSN && process.env.NODE_ENV === "production") {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      release: app.getVersion(),
      beforeSend(event) {
        // PII除去
        delete event.user?.email;
        delete event.user?.ip_address;
        return event;
      },
    });
  }
}
```

#### ErrorBoundary連携

```typescript
// AuthErrorBoundary.tsx の更新
import { captureException } from "@/utils/errorReporting";

componentDidCatch(error: Error, errorInfo: ErrorInfo) {
  // Sentryに送信
  captureException(error, {
    contexts: {
      react: {
        componentStack: errorInfo.componentStack,
      },
    },
  });

  this.setState({
    hasError: true,
    error,
    errorInfo,
  });
}
```

#### エラーレポーティングユーティリティ

```typescript
// apps/desktop/src/renderer/utils/errorReporting.ts
import * as Sentry from "@sentry/electron/renderer";

export function captureException(
  error: Error,
  context?: Record<string, unknown>,
) {
  if (process.env.SENTRY_DSN) {
    Sentry.captureException(error, context);
  } else {
    console.error("[ErrorReporting] Error captured:", error);
  }
}

export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = "info",
) {
  if (process.env.SENTRY_DSN) {
    Sentry.captureMessage(message, level);
  } else {
    console.log(`[ErrorReporting] ${level}: ${message}`);
  }
}
```

### Phase 3-13: 標準フロー

標準のPhase 3-13フローに従って実装を完了する。

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] ErrorBoundaryでキャッチしたエラーがSentryに送信される
- [ ] 未キャッチのエラーもSentryに送信される
- [ ] エラーにスタックトレース・バージョン・OS情報が含まれる
- [ ] 環境変数でSentry連携を無効化できる
- [ ] 開発環境では送信しない設定が動作する

### 品質要件

- [ ] PII（個人識別情報）が送信されない
- [ ] エラー送信がアプリのパフォーマンスに影響しない
- [ ] ネットワークエラー時も本体機能に影響しない
- [ ] テストカバレッジ: Line 80%以上

### ドキュメント要件

- [ ] Sentryセットアップ手順がドキュメント化されている
- [ ] 環境変数の説明が.env.exampleに記載されている

---

## 6. 検証方法

### テストケース

```typescript
describe("errorReporting", () => {
  it("should call Sentry.captureException when DSN is set", () => {});
  it("should not call Sentry when DSN is not set", () => {});
  it("should remove PII before sending", () => {});
});

describe("AuthErrorBoundary with Sentry", () => {
  it("should report error to Sentry when error occurs", () => {});
  it("should include component stack in error context", () => {});
});
```

### 検証手順

1. Sentryダッシュボードを開く
2. アプリで意図的にエラーを発生させる
3. Sentryダッシュボードにエラーが表示されることを確認
4. エラー詳細にスタックトレースが含まれることを確認
5. PIIが含まれていないことを確認

---

## 7. リスクと対策

| リスク                         | 影響度 | 発生確率 | 対策                              |
| ------------------------------ | ------ | -------- | --------------------------------- |
| Sentry無料プランの制限に達する | 中     | 中       | エラーのサンプリングレートを設定  |
| PIIが誤って送信される          | 高     | 低       | beforeSendフックで確実にPIIを除去 |
| Sentry SDKがアプリを重くする   | 中     | 低       | 非同期初期化、遅延ロード          |

---

## 8. 参照情報

### 関連ドキュメント

- [Sentry Electron SDK Documentation](https://docs.sentry.io/platforms/javascript/guides/electron/)
- `apps/desktop/src/renderer/components/AuthGuard/AuthErrorBoundary.tsx`

### システム仕様（aiworkflow-requirements）

| 参照資料         | パス                                                              | 内容             |
| ---------------- | ----------------------------------------------------------------- | ---------------- |
| セキュリティ仕様 | `.claude/skills/aiworkflow-requirements/references/security-*.md` | プライバシー要件 |

---

## 9. 備考

### TODOコメントの原文

**AuthErrorBoundary.tsx:108**

```
// TODO: 将来的なエラーレポーティングサービスへの送信
```

### 補足事項

- Sentry以外の選択肢としてBugsnag、Rollbar等も検討可能
- プライバシーポリシーの更新が必要な場合がある
- GDPR対応が必要な場合はユーザー同意の仕組みも検討
