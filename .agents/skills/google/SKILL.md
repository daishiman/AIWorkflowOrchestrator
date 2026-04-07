---
name: google-calendar-slack
description: |
  Google Calendar から当日（または指定日）の予定を取得し、Slack チャンネルへ
  整形されたメッセージとして通知するスキル。
  定期実行・手動実行どちらにも対応し、Dry-run モードで送信前に内容確認が可能。

  Anchors:
  • Google Calendar API v3 / 適用: イベント取得 / 目的: カレンダーデータ取得
  • Slack Incoming Webhook / Bot API / 適用: メッセージ投稿 / 目的: 予定を Slack 通知

  Trigger:
  今日の予定をSlackに送る, Googleカレンダーの予定をSlackに連携,
  カレンダー通知, 日次スケジュール通知, 予定をSlackに投稿
tags:
  - google
  - calendar
  - slack
  - notification
  - automation
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
---

# Google Calendar → Slack 予定通知スキル

## 概要

Google Calendar API（v3）で当日の予定を取得し、Slack の Incoming Webhook または
Bot API 経由でフォーマット済みメッセージを投稿するスキル。
Node.js スクリプトとして完結しており、cron や CI/CD からも呼び出せる。

---

## 前提条件（初回セットアップ）

### 依存パッケージのインストール

```bash
cd .claude/skills/google
pnpm install
```

### 環境変数の設定

以下のいずれかの認証方法と Slack 設定が必要。
詳細は `references/google-calendar-setup.md` および `references/slack-setup.md` を参照。

#### Google Calendar 認証（いずれか 1 つ）

| 変数名 | 説明 |
|---|---|
| `GOOGLE_APPLICATION_CREDENTIALS` | サービスアカウント JSON ファイルのパス（推奨） |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | サービスアカウント JSON を Base64 エンコードした文字列 |
| `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` + `GOOGLE_REFRESH_TOKEN` | OAuth 2.0 リフレッシュトークン方式 |

#### カレンダー ID

| 変数名 | 説明 |
|---|---|
| `GOOGLE_CALENDAR_ID` | 対象カレンダーの ID（例: `primary` または `xxx@group.calendar.google.com`） |

#### Slack 設定（いずれか 1 つ）

| 変数名 | 説明 |
|---|---|
| `SLACK_WEBHOOK_URL` | Incoming Webhook URL（推奨・シンプル） |
| `SLACK_BOT_TOKEN` + `SLACK_CHANNEL_ID` | Bot Token 方式（`xoxb-...`） |

---

## ワークフロー

### Phase 1: 環境チェック

**目的**: 必要な環境変数と依存パッケージを確認する

**アクション**:
1. `scripts/setup_check.js` を実行して設定状況を確認
2. 不足があればセットアップガイドを提示して終了
3. `node_modules/googleapis` が存在しない場合は `pnpm install` を実行

```bash
node .claude/skills/google/scripts/setup_check.js
```

### Phase 2: カレンダーイベント取得

**目的**: Google Calendar API から当日の予定を取得する

**アクション**:
1. `fetch_calendar.js` が認証情報を自動判別（サービスアカウント優先）
2. 指定日の 00:00〜23:59 のイベントを `singleEvents: true` で取得
3. `startTime` 順でソートして返却

### Phase 3: Slack 投稿

**目的**: 取得した予定を整形して Slack に投稿する

**アクション**:
1. `post_to_slack.js` がイベント配列を Slack Block Kit 形式に変換
2. Webhook URL または Bot Token のどちらかで POST
3. `--dry-run` フラグ時はコンソール出力のみ（送信なし）

---

## 実行コマンド

```bash
# 今日の予定を Slack に送信
node .claude/skills/google/scripts/daily_schedule.js

# 送信内容をプレビューのみ（Slack 送信なし）
node .claude/skills/google/scripts/daily_schedule.js --dry-run

# 特定日の予定を送信
node .claude/skills/google/scripts/daily_schedule.js --date 2026-04-10

# カレンダー ID を上書き指定
node .claude/skills/google/scripts/daily_schedule.js --calendar primary

# 設定確認
node .claude/skills/google/scripts/setup_check.js
```

---

## Slack メッセージ形式

```
📅 2026/04/07(火) の予定 (3件)
──────────────────────────────
🕐 09:00〜10:00  チームミーティング
   📍 会議室A | 🎥 Google Meet

🕐 13:00〜14:00  プロジェクトレビュー
   💬 第Q4進捗確認

📌 終日予定: 創立記念日
──────────────────────────────
Google Calendar から自動取得 | 2026/04/07 08:00:00
```

---

## ベストプラクティス

### すべきこと

- `--dry-run` で内容を確認してから本番送信する
- サービスアカウントは `roles/calendar.reader` のみ付与（最小権限）
- Slack Webhook URL は `.env` ファイルまたは Secret Manager で管理
- 毎朝の定期実行は cron または GitHub Actions で自動化する
- 実行後は `scripts/log_usage.js` でフィードバックを記録する

### 避けるべきこと

- サービスアカウント JSON をリポジトリにコミットしない
- `GOOGLE_CALENDAR_ID` に `primary` を使う場合はサービスアカウントに共有設定が必要
- イベント数が多い場合は `maxResults` パラメータで件数を制限する

---

## エラーハンドリング

| エラー | 原因 | 対処 |
|---|---|---|
| `UNAUTHENTICATED` | 認証情報が不正 | サービスアカウントの JSON を確認 |
| `notFound` | カレンダー ID が存在しない | `GOOGLE_CALENDAR_ID` を確認 |
| `forbidden` | カレンダーへのアクセス権がない | サービスアカウントをカレンダーに共有 |
| `invalid_auth` | Slack Token が無効 | Webhook URL / Bot Token を再確認 |
| `channel_not_found` | Slack チャンネルが存在しない | `SLACK_CHANNEL_ID` を確認 |

---

## リソース参照

### references/

- **セットアップガイド（Google）**: [references/google-calendar-setup.md](references/google-calendar-setup.md)
- **セットアップガイド（Slack）**: [references/slack-setup.md](references/slack-setup.md)
- **実行パターン集**: [references/patterns.md](references/patterns.md)

### scripts/

| スクリプト | 役割 |
|---|---|
| `scripts/daily_schedule.js` | メイン実行スクリプト（オーケストレーション） |
| `scripts/fetch_calendar.js` | Google Calendar API クライアント |
| `scripts/post_to_slack.js` | Slack 投稿・メッセージフォーマット |
| `scripts/setup_check.js` | 環境変数・依存関係チェック |
| `scripts/log_usage.js` | フィードバック記録 |

### assets/

- `assets/slack-message-template.json`: Slack Block Kit テンプレート（参考用）

---

## 変更履歴

| Version | Date       | Changes                                         |
|---------|------------|-------------------------------------------------|
| 1.1.0   | 2026-04-07 | 初実装（Google Calendar → Slack 通知）          |
| 1.0.0   | 2026-04-06 | テンプレート作成                                |
