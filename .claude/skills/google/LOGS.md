# Skill Usage Logs

このファイルにはスキルの使用記録が追記されます。

---

## 2026-04-08 - 初期リリース v1.1.0

| 項目 | 内容 |
| --- | --- |
| バージョン | v1.1.0 |
| 変更種別 | 新規スキル追加 |
| 概要 | Google Calendar API v3 + Slack Webhook を統合した日次予定通知スキルを新規作成 |
| 主な成果物 | `SKILL.md`（209行）、`scripts/`（setup_check.js / fetch_calendar.js / daily_schedule.js / slack_notify.js）、`references/`（google-calendar-setup.md / slack-setup.md / patterns.md）、`assets/slack-message-template.json` |
| 認証方式 | Google: サービスアカウント JSON キー、Slack: Incoming Webhook URL |
| 教訓 | 複数外部サービス統合スキルは setup ガイドをサービスごとに別ファイル分離する（L-GOOGLE-CAL-001）。googleapis は スキルディレクトリ直下 package.json に閉じ込める（L-GOOGLE-CAL-002）。 |

