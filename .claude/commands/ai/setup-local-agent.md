---
description: |
  ローカルエージェント（ファイル監視）のセットアップ。
  Chokidarによるファイル監視、PM2プロセス管理、クラウドAPI連携を構築します。

  🤖 起動エージェント:
  - `.claude/agents/local-watcher.md`: ファイル監視専門エージェント
  - `.claude/agents/local-sync.md`: クラウド同期専門エージェント（補助）
  - `.claude/agents/process-mgr.md`: PM2プロセス管理専門エージェント（補助）

  📚 利用可能スキル（エージェントが必要時に参照）:
  **local-watcher:** event-driven-file-watching（必須）, debounce-throttle-patterns, file-exclusion-patterns
  **補助スキル:** pm2-ecosystem-config, graceful-shutdown-patterns, file-watcher-security

  ⚙️ このコマンドの設定:
  - argument-hint: なし
  - allowed-tools: エージェント起動とローカルエージェント構築用
    • Task: 複数エージェント起動（local-watcher, local-sync, process-mgr）
    • Bash: local-agentディレクトリ作成、PM2コマンド
    • Read: master_system_design.md、既存設定
    • Write(local-agent/**): ローカルエージェント実装
  - model: sonnet（ローカルエージェント構築タスク）

  トリガーキーワード: local agent, file watching, chokidar, pm2, local sync
argument-hint: ""
allowed-tools: [Task, Bash, Read, Write(local-agent/**)]
model: sonnet
---

# ローカルエージェントセットアップコマンド

あなたは `/ai:setup-local-agent` コマンドを実行します。

## 目的

master_system_design.md（9章）に準拠したローカルエージェントを構築し、
ファイル監視・クラウド同期・PM2プロセス管理の完全な統合システムを実装します。

## 実行フロー

### Phase 1: エージェント起動準備

**コンテキスト収集:**
```bash
# master_system_design.md の仕様確認
cat docs/00-requirements/master_system_design.md | grep -A 50 "## 9. ローカルエージェント仕様"

# 既存local-agent確認
ls -la local-agent/ 2>/dev/null || echo "No existing local-agent"
```

### Phase 2: 複数エージェント起動（並列）

**並列起動** - 以下の3エージェントを同時に起動:

#### 2-1. @local-watcher エージェント起動
```typescript
@local-watcher を起動し、以下を依頼:

**タスク**: ファイル監視システムの実装
**フォーカス**: event-driven-file-watching, debounce-throttle-patterns

**期待成果物**:
1. `local-agent/src/watcher.ts`: Chokidarファイル監視実装
2. `local-agent/src/config.ts`: 環境設定
   - WATCH_DIR: 監視ディレクトリ
   - OUTPUT_DIR: 成果物保存ディレクトリ
   - MAX_FILE_SIZE_MB: 最大ファイルサイズ（デフォルト: 100MB）

**実装要件**（master_system_design.md 9章準拠）:
- 対象拡張子: .mp3, .mp4, .wav, .pdf, .txt, .csv
- 除外パターン: .で始まる、~で終わる、node_modules/, .git/
- デバウンス: 2秒（連続発火防止）
- イベント: add, change（unlink除外）
```

#### 2-2. @local-sync エージェント起動
```typescript
@local-sync を起動し、以下を依頼:

**タスク**: クラウドAPI連携実装
**期待成果物**:
1. `local-agent/src/sync.ts`: アップロード・ダウンロード実装
   - アップロード: POST /api/agent/upload
   - ポーリング: GET /api/agent/poll
   - 認証: AGENT_SECRET_KEY ヘッダー

**環境変数**:
- API_BASE_URL: クラウドAPIベースURL
- AGENT_SECRET_KEY: 認証キー
- POLL_INTERVAL_MS: ポーリング間隔（デフォルト: 30000ms）
```

#### 2-3. @process-mgr エージェント起動
```typescript
@process-mgr を起動し、以下を依頼:

**タスク**: PM2設定とプロセス管理
**期待成果物**:
1. `local-agent/ecosystem.config.js`: PM2設定
   - name: 'ai-workflow-agent'
   - instances: 1
   - autorestart: true
   - max_restarts: 10
   - restart_delay: 5000ms
   - max_memory_restart: '500M'
   - log管理: error.log, out.log

2. `local-agent/package.json`: scriptsセクション
   - start: "pm2 start ecosystem.config.js"
   - stop: "pm2 stop ai-workflow-agent"
   - logs: "pm2 logs ai-workflow-agent"
```

### Phase 3: 統合と完了報告

3エージェントの成果物を統合し、ユーザーに以下を報告:
- ✅ 実装されたファイル一覧
  - local-agent/src/index.ts
  - local-agent/src/watcher.ts
  - local-agent/src/sync.ts
  - local-agent/src/config.ts
  - local-agent/ecosystem.config.js
  - local-agent/package.json
  - local-agent/.env.example

- 📊 設定項目サマリー
  - 監視対象拡張子: X種類
  - 除外パターン: X個
  - 最大ファイルサイズ: XMOB
  - ポーリング間隔: Xms

- 🚀 起動手順
  ```bash
  cd local-agent
  pnpm install
  cp .env.example .env
  # .envを編集: API_BASE_URL, AGENT_SECRET_KEY等
  pnpm start
  ```

- 💡 推奨される次のステップ
  - .envファイルの設定
  - クラウドAPIエンドポイント確認
  - テストファイルでの動作確認

## 注意事項

- このコマンドはローカルエージェント構築のみを行い、詳細は各エージェントに委譲
- master_system_design.md 9章の仕様に完全準拠
- PM2での常駐実行を前提とした設計
