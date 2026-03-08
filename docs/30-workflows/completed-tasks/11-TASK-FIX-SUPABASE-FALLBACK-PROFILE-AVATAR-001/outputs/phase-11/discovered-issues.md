# Phase 11: Discovered Issues

## 一覧

| ID       | 重要度 | 発見元                       | 内容                                                                                                   | 対応方針                                                                        |
| -------- | ------ | ---------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| DI-11-01 | 中     | `TC-11-UI-02`, `TC-11-UI-03` | `profile/not-configured` / `avatar/not-configured` の生メッセージが英語のまま Settings UI に表示される | Phase 12 で未タスク化し、Renderer 側の code ベース localized message へ切り出す |

## 詳細

### DI-11-01: fallback error の英語メッセージ露出

- 再現:
  - `TC-11-UI-02`: `Profile service is not configured. Supabase environment variables are required.`
  - `TC-11-UI-03`: `Avatar service is not configured. Supabase environment variables are required.`
- 画面影響:
  - クラッシュはしない
  - error banner 自体は表示される
  - ただし日本語 UI の中で transport message がそのまま見えている
- 判定:
  - 本タスクの受け入れ条件である「fallback 表示」と「No handler registered 防止」は達成
  - ただし UI/UX と i18n 一貫性の観点で follow-up が必要
