# CI/CD MVP要件定義書

## 1. 概要

### 1.1 背景

AIWorkflowOrchestratorプロジェクトはモノレポ構成で以下のアプリケーションを含む：

- `apps/desktop` - Electronデスクトップアプリ
- `apps/backend` - バックエンドAPI（Railway デプロイ済み）
- `apps/web` - Next.js Webアプリ（未デプロイ）
- `packages/shared` - 共通ライブラリ

現状、backend向けのCD（backend-ci.yml）は設定済みだが、以下の課題がある。

### 1.2 現状の課題

| 課題                | 詳細                                           | 影響度          |
| ------------------- | ---------------------------------------------- | --------------- |
| Webアプリ未デプロイ | apps/webのCD設定が存在しない                   | 高              |
| 品質ゲート緩い      | ci.ymlで`continue-on-error: true`が多用        | 中              |
| 通知システム未実装  | Discord Webhook通知が未設定                    | 低              |
| E2E未統合           | Playwright E2Eテストがパイプラインに未組み込み | 低（MVP範囲外） |

---

## 2. 機能要件（Functional Requirements）

### 2.1 CI要件（PR時に実行）

#### FR-CI-01: 静的解析チェック

- **必須**: Lintエラーがある場合、PRマージ不可
- **実行コマンド**: `pnpm lint`
- **対象**: 全.ts/.tsxファイル

#### FR-CI-02: 型チェック

- **必須**: 型エラーがある場合、PRマージ不可
- **実行コマンド**: `pnpm typecheck`
- **前提**: sharedパッケージのビルドが完了していること

#### FR-CI-03: ユニットテスト

- **必須**: テスト失敗の場合、PRマージ不可
- **実行コマンド**: `pnpm test`
- **カバレッジ**: 60%以上（MVP努力目標、将来は必達）

#### FR-CI-04: ビルド確認

- **必須**: ビルド失敗の場合、PRマージ不可
- **依存**: FR-CI-01〜03が全て成功後に実行
- **対象**: shared, desktop, web

#### FR-CI-05: セキュリティ監査

- **推奨**: `pnpm audit --audit-level=high`
- **方針**: highレベル以上の脆弱性は警告（MVPでは失敗としない）

### 2.2 CD要件（mainマージ時に実行）

#### FR-CD-01: バックエンドデプロイ（既存）

- **トリガー**: mainブランチへのpush（apps/backend変更時）
- **デプロイ先**: Railway
- **ヘルスチェック**: `/api/health`エンドポイント確認

#### FR-CD-02: Webアプリデプロイ（新規）

- **トリガー**: mainブランチへのpush（apps/web変更時）
- **デプロイ先**: Railway
- **ヘルスチェック**: ルートページのHTTP 200確認

#### FR-CD-03: デスクトップアプリビルド（既存継続）

- **トリガー**: リリースタグ作成時（`v*`パターン）
- **ビルド対象**: Windows, macOS, Linux
- **成果物**: GitHub Releasesにアップロード

### 2.3 通知要件

#### FR-NOTIFY-01: デプロイ成功通知

- **チャンネル**: Discord Webhook
- **形式**: Embed形式
- **内容**: コミットハッシュ、ブランチ名、作成者、タイムスタンプ

#### FR-NOTIFY-02: デプロイ失敗通知

- **チャンネル**: Discord Webhook
- **形式**: Embed形式（赤色）
- **内容**: エラー概要、失敗ジョブ、コミット情報

---

## 3. 非機能要件（Non-Functional Requirements）

### 3.1 パフォーマンス

| 要件               | 目標値   | 測定方法               |
| ------------------ | -------- | ---------------------- |
| CI実行時間         | 5分以内  | GitHub Actions実行時間 |
| CD実行時間         | 10分以内 | デプロイ完了までの時間 |
| ヘルスチェック応答 | 30秒以内 | curlレスポンス時間     |

### 3.2 可用性

| 要件           | 仕様                                       |
| -------------- | ------------------------------------------ |
| デプロイ失敗時 | 自動ロールバックなし（手動対応）           |
| 再試行         | ヘルスチェックは最大10回リトライ           |
| 同時実行制御   | 同一ブランチの古いワークフローをキャンセル |

### 3.3 セキュリティ

| 要件             | 仕様                             |
| ---------------- | -------------------------------- |
| シークレット管理 | GitHub Secretsで管理             |
| ログマスキング   | シークレットは自動マスク         |
| 最小権限         | 各ワークフローに必要最小限の権限 |
| 環境分離         | production環境はprotectedに設定  |

### 3.4 保守性

| 要件           | 仕様                                          |
| -------------- | --------------------------------------------- |
| 再利用性       | 共通処理は再利用可能ワークフローに抽出        |
| ドキュメント   | ワークフロー構成図をREADMEに記載              |
| バージョン管理 | アクションはメジャーバージョンで固定（@v4等） |

---

## 4. 品質ゲート定義

### 4.1 PRマージ条件（必須）

```yaml
required_status_checks:
  - lint
  - typecheck
  - test
  - build
```

### 4.2 品質レベル

| レベル | 基準               | MVP対応                      |
| ------ | ------------------ | ---------------------------- |
| 必須   | 失敗時はマージ不可 | lint, typecheck, test, build |
| 推奨   | 失敗時は警告のみ   | security audit               |
| 任意   | 情報提供のみ       | coverage report              |

### 4.3 continue-on-error方針

| ジョブ        | 現状             | MVP後        |
| ------------- | ---------------- | ------------ |
| lint          | true → **false** | 必須化       |
| typecheck     | なし             | **false**    |
| test          | なし             | **false**    |
| test:coverage | true             | true（維持） |
| security      | true             | true（維持） |
| build         | なし             | **false**    |

---

## 5. デプロイ対象の明確化

### 5.1 デプロイ対象一覧

| アプリ       | デプロイ先      | トリガー                | 優先度     |
| ------------ | --------------- | ----------------------- | ---------- |
| apps/backend | Railway         | main push + path filter | 既存       |
| apps/web     | Railway         | main push + path filter | 新規（高） |
| apps/desktop | GitHub Releases | tag push (`v*`)         | 既存       |

### 5.2 パスフィルター設定

```yaml
# backend-ci.yml
paths:
  - "apps/backend/**"
  - "packages/shared/**"
  - ".github/workflows/backend-ci.yml"

# web-cd.yml（新規）
paths:
  - "apps/web/**"
  - "packages/shared/**"
  - ".github/workflows/web-cd.yml"
```

### 5.3 Railway環境

| サービス | 環境変数グループ | ドメイン                 |
| -------- | ---------------- | ------------------------ |
| backend  | production       | RAILWAY_DOMAIN (backend) |
| web      | production       | RAILWAY_DOMAIN (web)     |

---

## 6. 通知要件詳細

### 6.1 Discord Embed形式

#### 成功通知

```json
{
  "embeds": [
    {
      "title": "Deploy Succeeded",
      "color": 3066993,
      "fields": [
        { "name": "Service", "value": "backend | web", "inline": true },
        { "name": "Branch", "value": "main", "inline": true },
        { "name": "Commit", "value": "abc1234", "inline": true },
        { "name": "Author", "value": "@username", "inline": true }
      ],
      "timestamp": "ISO8601"
    }
  ]
}
```

#### 失敗通知

```json
{
  "embeds": [
    {
      "title": "Deploy Failed",
      "color": 15158332,
      "fields": [
        { "name": "Service", "value": "backend | web", "inline": true },
        { "name": "Branch", "value": "main", "inline": true },
        { "name": "Error", "value": "Health check failed", "inline": false }
      ],
      "timestamp": "ISO8601"
    }
  ]
}
```

### 6.2 シークレット設定

| Secret名            | 用途              | 設定場所           |
| ------------------- | ----------------- | ------------------ |
| RAILWAY_TOKEN       | Railway CLI認証   | Repository Secrets |
| RAILWAY_DOMAIN      | ヘルスチェックURL | Repository Secrets |
| DISCORD_WEBHOOK_URL | Discord通知       | Repository Secrets |

---

## 7. MVP範囲定義

### 7.1 MVP対象（Phase 1）

- [x] CI品質ゲート厳格化
- [x] Webアプリ自動デプロイ
- [x] Discord通知（成功/失敗）
- [x] ワークフロー最適化（キャッシュ）

### 7.2 MVP対象外（Phase 2以降）

- [ ] E2Eテストのパイプライン統合
- [ ] ステージング環境
- [ ] 自動ロールバック
- [ ] Slack通知
- [ ] パフォーマンステスト

---

## 8. 完了条件チェックリスト

- [x] 品質ゲートの厳格化レベルが決定されている
  - lint, typecheck, test, build は必須（continue-on-error: false）
  - security, coverage は推奨（continue-on-error: true）

- [x] デプロイ対象（backend/web）が明確化されている
  - backend: 既存維持
  - web: 新規追加（Railway）
  - desktop: 既存維持（タグトリガー）

- [x] 通知要件（Discord Webhook）が定義されている
  - 成功/失敗それぞれのEmbed形式定義済み
  - DISCORD_WEBHOOK_URL シークレット必須

- [x] MVP範囲が明確に定義されている
  - CI強化、Web CD、Discord通知が対象
  - E2E統合、ステージング環境は対象外

---

## 9. 参照ドキュメント

- [非機能要件](../../00-requirements/02-non-functional-requirements.md)
- [テクノロジースタック](../../00-requirements/03-technology-stack.md)
- [デプロイメント](../../00-requirements/12-deployment.md)
- [タスク実行仕様書](./task-cicd-mvp.md)
