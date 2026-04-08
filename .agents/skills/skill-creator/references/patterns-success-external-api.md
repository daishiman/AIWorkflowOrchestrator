# 外部API統合 成功パターン

## 概要

外部 API（Google Calendar、Slack Webhook 等）を統合したスキルの設計で実証された成功パターン。

---

## [ExtAPI-SUCCESS-001] 複数外部サービスの認証分離パターン

### 状況

Google Calendar API（サービスアカウント）と Slack API（Webhook URL）のような、認証方式が異なる複数の外部サービスを1スキルで扱う場合、設定管理と setup ガイドが混在しやすい。

### 成功パターン

**サービスごとに setup ガイドを別ファイルに分離する。**

```
references/
├── google-calendar-setup.md   # Google Cloud 認証手順のみ
└── slack-setup.md             # Slack Webhook 設定手順のみ
```

各ファイルが単一サービスの設定に責任を持ち、必要時だけ読み込む（Progressive Disclosure）。

### なぜ有効か

- セットアップ担当が1サービスだけ設定する際、他サービスの情報に干渉されない
- 認証方式が変わっても（例: OAuth → サービスアカウント）影響範囲が局所化される
- AI アシスタントが「このサービスの設定手順は？」という質問に直接応答できる

### アンチパターン

❌ 1つの `README.md` に全サービスの設定を羅列する
→ 設定項目が増えるほど「どこを見ればいいか」が不明瞭になる

### 適用タスク

`google` スキル（google-calendar + slack 統合）— 2026-04-08

---

## [ExtAPI-SUCCESS-002] スキル専用パッケージの pnpm workspace 分離

### 状況

Claude Code スキルのスクリプトが外部 npm パッケージ（`googleapis`、`axios` 等）を必要とするが、monorepo の workspace に追加するとすべてのパッケージの依存グラフに影響する。

### 成功パターン

**スキルディレクトリ直下に独立した `package.json` を配置し、workspace から切り離す。**

```json
// .claude/skills/google/package.json
{
  "name": "google-calendar-slack-skill",
  "private": true,
  "dependencies": {
    "googleapis": "^144.0.0"
  }
}
```

スクリプト実行前に `pnpm install` を該当ディレクトリで実行する。`SKILL.md` の Phase 1 に環境チェックスクリプト（`setup_check.js`）を置き、依存関係のインストール状態を確認させる。

### なぜ有効か

- monorepo の型チェック・lint サイクルにスキル専用パッケージが混入しない
- スキルを削除する際に workspace 全体の依存グラフを修正する必要がない
- スキルのバージョン管理が独立して行える

### 適用タスク

`google` スキル（googleapis ^144.0.0）— 2026-04-08

---

## [ExtAPI-SUCCESS-003] Dry-run モードによる安全な検証フロー

### 状況

外部サービスへの実際の投稿（Slack メッセージ送信等）を、本番実行前に検証したい。

### 成功パターン

**環境変数フラグ（`SLACK_DRY_RUN=1`）で実投稿をスキップし、コンソール出力に切り替える。**

```javascript
if (process.env.SLACK_DRY_RUN === '1') {
  console.log('[DRY RUN] Would send:', JSON.stringify(payload, null, 2));
  return;
}
// 実際の Webhook 呼び出し
```

### なぜ有効か

- CI/CD 環境でのテスト実行で外部サービスへの誤送信を防止
- Phase 12 のスクリーンショット取得時にも安全に動作確認できる
- 本番と同じコードパスを通るため、実際の送信直前のペイロードを検証できる

### 適用タスク

`google` スキル — 2026-04-08

---

## 変更履歴

| 日付 | 変更内容 |
| --- | --- |
| 2026-04-08 | 新規作成。google スキル（Google Calendar + Slack 統合）の成功パターン 3 件を追加 |
