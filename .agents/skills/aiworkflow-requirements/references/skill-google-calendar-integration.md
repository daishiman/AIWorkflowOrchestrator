# Google Calendar スキル統合仕様

## 概要

`google` スキル（`.claude/skills/google/`）は Google Calendar API v3 と Slack Incoming Webhook を統合し、当日または指定日の予定を Slack チャンネルへ通知する Claude Code スキル。

- **バージョン**: 1.1.0
- **作成日**: 2026-04-06
- **最終更新**: 2026-04-08

## ファイル構成

```
.claude/skills/google/
├── SKILL.md                    # スキル仕様書（209行）
├── LOGS.md                     # 使用記録
├── package.json                # googleapis ^144.0.0
├── scripts/
│   ├── setup_check.js          # Phase 1: 環境確認スクリプト
│   ├── fetch_calendar.js       # Phase 2: カレンダーイベント取得
│   ├── daily_schedule.js       # Phase 2+3: 日次スケジュール取得+整形
│   └── slack_notify.js         # Phase 3: Slack 投稿
├── references/
│   ├── google-calendar-setup.md  # Google Cloud / サービスアカウント設定ガイド
│   ├── slack-setup.md            # Slack Webhook / Bot API 設定ガイド
│   └── patterns.md               # 実行パターン集（日次/週次/手動/dry-run）
└── assets/
    └── slack-message-template.json  # Block Kit テンプレート
```

## 認証方式

| サービス | 認証方式 | 設定方法 |
| --- | --- | --- |
| Google Calendar API | サービスアカウント JSON キー | `GOOGLE_SERVICE_ACCOUNT_KEY_PATH` 環境変数 |
| Slack | Incoming Webhook URL | `SLACK_WEBHOOK_URL` 環境変数 |

## フェーズ定義

| フェーズ | スクリプト | 内容 |
| --- | --- | --- |
| Phase 1 | `setup_check.js` | 環境変数・認証キーの存在確認 |
| Phase 2 | `fetch_calendar.js` / `daily_schedule.js` | Google Calendar API でイベント取得 |
| Phase 3 | `slack_notify.js` | Block Kit 形式で Slack 投稿 |

## エラーハンドリング

| エラー種別 | 原因 | 対処 |
| --- | --- | --- |
| `GOOGLE_AUTH_FAILED` | サービスアカウントキー不正 | キーパスと権限を再確認 |
| `CALENDAR_NOT_FOUND` | カレンダー ID 誤り | Google Calendar の設定で ID を確認 |
| `SLACK_WEBHOOK_ERROR` | Webhook URL 無効 | Slack App の設定でURLを再生成 |
| `ENV_MISSING` | 必須環境変数未設定 | setup_check.js を実行して一覧確認 |

## 設計上の重要ポイント

### 複合認証分離パターン

複数の外部サービスを扱うため、認証設定を `google-calendar-setup.md` と `slack-setup.md` に分離した。単一 README に混在させると、一方のセットアップ中に他方の情報が干渉する。

### pnpm workspace 独立パッケージ

`googleapis` npm パッケージはスキルディレクトリ直下の `package.json` に閉じ込め、workspace の依存関係と分離。スクリプト実行前に `pnpm install` を実行する。

### Dry-run モード

`SLACK_DRY_RUN=1` 環境変数を設定すると Slack への実投稿をスキップし、出力内容をコンソールに表示する。CI/CD 環境での動作確認に使用。

## 関連ドキュメント

- `lessons-learned-current-2026-04.md` — L-GOOGLE-CAL-001, L-GOOGLE-CAL-002
- `.claude/skills/google/SKILL.md` — スキル本体の仕様
- `.claude/skills/google/references/google-calendar-setup.md` — Google Cloud セットアップ
- `.claude/skills/google/references/slack-setup.md` — Slack セットアップ
