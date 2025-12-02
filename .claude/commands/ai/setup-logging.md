---
description: |
  構造化ロギングシステムの設計と実装。
  JSON形式ログ、相関ID、ログレベル管理を含む堅牢なロギング基盤を構築します。

  🤖 起動エージェント:
  - `.claude/agents/sre-observer.md`: ロギング・監視設計専門エージェント

  📚 利用可能スキル（sre-observerエージェントが必要時に参照）:
  **Phase 1（現状分析時）:** structured-logging, observability-pillars
  **Phase 3（実装時）:** structured-logging（必須）, distributed-tracing

  ⚙️ このコマンドの設定:
  - argument-hint: ログレベル（debug/info/warn/error、オプション）
  - allowed-tools: エージェント起動とロギング実装用
    • Task: sre-observerエージェント起動
    • Read: ソースコード、既存ログ設定
    • Write(src/shared/infrastructure/logging/**|config/logging.*): ロギング実装、設定ファイル
    • Edit: 既存ファイル更新
    • Grep: ログ出力箇所検索
  - model: sonnet（ロギング設計・実装タスク）

  トリガーキーワード: logging, log, json, structured, correlation id
argument-hint: "[log-level]"
allowed-tools:
  - Task
  - Read
  - Write(src/shared/infrastructure/logging/**|config/logging.*)
  - Edit
  - Grep
model: sonnet
---

# 構造化ロギング実装コマンド

あなたは `/ai:setup-logging` コマンドを実行します。

## 目的

master_system_design.md（2.2章）に準拠した構造化ロギングシステムを設計・実装し、
JSON形式ログ、相関ID追跡、PIIマスキングを含む堅牢なロギング基盤を構築します。

## 実行フロー

### Phase 1: エージェント起動準備

**ユーザー引数の処理:**
- `$1` (log-level): デフォルトログレベル（デフォルト: info）
  - `debug`: デバッグ情報含む
  - `info`: 重要イベントのみ
  - `warn`: 警告以上
  - `error`: エラーのみ

**コンテキスト収集:**
```bash
# 既存ログ出力の確認
grep -r "console.log\|console.error" src/

# master_system_design.md のログ仕様確認
cat docs/00-requirements/master_system_design.md | grep -A 30 "## 2.2 ロギング仕様"
```

### Phase 2: sre-observer エージェント起動

```typescript
`.claude/agents/sre-observer.md` を起動し、以下を依頼:

**タスク**: 構造化ロギングシステムの設計と実装
**フォーカス**: structured-loggingスキルを中心に活用

**入力情報**:
- デフォルトログレベル: $LOG_LEVEL
- プロジェクトコンテキスト: master_system_design.md（2.2章: ロギング仕様）
- 既存ログ出力: grep結果

**期待成果物**:
1. `src/shared/infrastructure/logging/logger.ts`: 統一ロガー実装
2. `src/shared/infrastructure/logging/types.ts`: ログ型定義
3. `config/logging.ts`: ログ設定
4. `docs/observability/logging-guide.md`: ロギングガイド

**実装要件**（master_system_design.md 2.2章準拠）:

**ログフォーマット（JSON構造化ログ）**:
```typescript
{
  level: "error" | "warn" | "info" | "debug",
  message: string,
  timestamp: string,  // ISO8601形式
  request_id: string, // リクエスト追跡ID（必須）
  workflow_id?: string,
  user_id?: string,
  context: {
    feature?: string,
    step?: string,
    ...
  },
  error?: {
    message: string,
    stack: string,
    code?: string
  }
}
```

**ログレベル使い分け**:
- error: システムエラー、例外、障害（即座の対応必要）
- warn: 警告、リトライ、非推奨機能使用
- info: 重要イベント（ワークフロー開始/完了等）
- debug: デバッグ情報（開発環境のみ）

**ログ出力先**:
- 開発環境: console（標準出力）
- 本番環境: Railway Logs（自動収集、7日間保持）

**必須機能**:
- 相関ID自動付与
- PIIマスキング（個人情報保護）
- コンテキスト情報の自動追加
- エラースタックトレース含む
```

### Phase 3: 完了報告

エージェントからの成果物を受け取り、ユーザーに以下を報告:
- ✅ 実装されたファイル一覧
- 📊 ロギング統計
  - 変換されたログ出力箇所数
  - 構造化ログ形式への準拠率
- 🔍 相関ID追跡の実装状況
- 💡 推奨される次のステップ（モニタリング統合等）

## 注意事項

- このコマンドはロギング実装のみを行い、詳細はエージェントに委譲
- master_system_design.md 2.2章の仕様に完全準拠
- 既存の console.log は構造化ロガーに置き換え
