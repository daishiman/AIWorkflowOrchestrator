# ローカルエージェント仕様 (Local Agent)

> 本ドキュメントは統合システム設計仕様書の一部です。
> マスタードキュメント: [master_system_design.md](./master_system_design.md)

## 9.1 機能概要

- 指定ディレクトリの監視（Chokidar）
- ファイル追加検知時のクラウドアップロード
- 完了ワークフローのポーリングと成果物ダウンロード

---

## 9.2 設定項目

| 環境変数 | 必須 | デフォルト | 説明 |
|----------|------|------------|------|
| `API_BASE_URL` | YES | - | クラウドAPIのベースURL |
| `AGENT_SECRET_KEY` | YES | - | 認証キー |
| `WATCH_DIR` | YES | - | 監視対象ディレクトリ |
| `OUTPUT_DIR` | YES | - | 成果物保存ディレクトリ |
| `POLL_INTERVAL_MS` | NO | 30000 | ポーリング間隔 |
| `MAX_FILE_SIZE_MB` | NO | 100 | 最大ファイルサイズ |

---

## 9.3 監視ルール

### 対象ファイル

| 項目 | 設定 |
|------|------|
| 拡張子 | `.mp3`, `.mp4`, `.wav`, `.pdf`, `.txt`, `.csv` |
| サイズ | `MAX_FILE_SIZE_MB` 以下 |

### 除外パターン

| パターン | 説明 |
|----------|------|
| `.` で始まるファイル | 隠しファイル |
| `~` で終わるファイル | 一時ファイル |
| `node_modules/` 配下 | 依存関係 |
| `.git/` 配下 | バージョン管理 |

---

## 9.4 PM2 設定

ecosystem.config.js の設定項目：

| 設定項目 | 値 | 説明 |
|----------|-----|------|
| `name` | `'ai-workflow-agent'` | プロセス名 |
| `script` | `'./dist/index.js'` | エントリーポイント（ビルド済みJS） |
| `instances` | `1` | プロセス数（シングルインスタンス） |
| `autorestart` | `true` | クラッシュ時に自動再起動 |
| `max_restarts` | `10` | 最大再起動回数（無限ループ防止） |
| `restart_delay` | `5000` | 再起動までの待機時間（5秒） |
| `watch` | `false` | ファイル監視モード無効（本番用） |
| `max_memory_restart` | `'500M'` | メモリ500MB超過で再起動 |
| `log_date_format` | `'YYYY-MM-DD HH:mm:ss'` | ログの日時フォーマット |
| `error_file` | `'./logs/error.log'` | エラーログ出力先 |
| `out_file` | `'./logs/out.log'` | 標準出力ログ出力先 |
| `merge_logs` | `true` | 複数インスタンスのログを統合 |

### 設定項目の説明

| 設定項目 | 説明 |
|----------|------|
| autorestart | プロセスがクラッシュした場合、自動的に再起動 |
| max_restarts | 短時間に連続でクラッシュする場合の上限（10回） |
| restart_delay | 再起動前の待機時間（即座の再起動を防ぐ） |
| max_memory_restart | メモリリークを防ぐための自動再起動トリガー |
| watch | 開発環境では true、本番環境では false に設定 |
| ログ設定 | 標準出力とエラー出力を別ファイルに記録、日時付き |

---

## 関連ドキュメント

- [環境変数](./13-environment-variables.md)
- [デプロイメント](./12-deployment.md)
- [プロジェクト概要](./01-overview.md)
