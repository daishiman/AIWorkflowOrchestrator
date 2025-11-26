---
name: structured-logging
description: |
  構造化ログシステム設計の専門スキル。JSON形式ログ、ログレベル階層、
  相関ID体系、コンテキスト情報設計、個人情報保護を提供します。

  使用タイミング:
  - JSON形式の構造化ログを設計する時
  - ログレベル（DEBUG/INFO/WARN/ERROR/FATAL）の使い分け基準を決定する時
  - 相関IDやトレースIDによるリクエスト追跡を実装する時
  - エラーログに診断コンテキストを追加する時
  - PIIマスキングやGDPR/CCPA対応を設計する時
  - ログ量とコストのバランスを最適化する時

  活性化キーワード: JSON log, structured logging, correlation ID, trace ID,
  log level, context, PII masking, log format, diagnostic logging

version: 1.0.0
---

# Structured Logging - 構造化ロギング設計

## 概要

構造化ロギングは、機械可読で一貫性のあるログシステムを実現する設計手法です。
このスキルは、ベッツィ・ベイヤーの『Site Reliability Engineering』とCharity Majorsの
『Observability Engineering』に基づく実践的な構造化ログ設計知識を提供します。

## 核心概念

### 1. 構造化ログの本質

**従来のログ（非構造化）の問題**:
- テキスト文字列のみ → パースが困難
- フォーマットの不統一 → 検索・集計が不可能
- コンテキスト情報の欠如 → 診断に時間がかかる

**構造化ログの利点**:
- 機械可読（JSON/構造化形式） → 自動分析可能
- 一貫したフィールド → クエリと集計が容易
- 豊富なコンテキスト → 迅速な問題診断

### 2. ログレベル階層の設計原則

**5段階階層**:

1. **DEBUG**: 開発時の詳細情報（本番では無効化）
   - トリガー: 変数値、内部状態、詳細フロー
   - 出力先: 開発環境のみ

2. **INFO**: 正常動作の重要イベント
   - トリガー: ビジネスイベント、起動/終了、設定変更
   - 出力先: 全環境

3. **WARN**: 予期しないが対応可能な状況
   - トリガー: リトライ発生、非推奨機能使用、設定ミス
   - 出力先: 全環境、アラート候補

4. **ERROR**: 機能障害（部分的影響）
   - トリガー: 処理失敗、データエラー、外部API障害
   - 出力先: 全環境、必ずアラート

5. **FATAL**: システム停止レベルの重大エラー
   - トリガー: 起動失敗、リカバリ不可能な状態
   - 出力先: 全環境、即座エスカレーション

**環境別制御**:
- 開発環境: DEBUG以上
- ステージング環境: INFO以上
- 本番環境: INFO以上（負荷に応じてWARN以上）

### 3. 相関ID体系とトレーサビリティ

**3層ID戦略**:

1. **Request ID** (`request_id`):
   - スコープ: 単一HTTPリクエスト
   - 生成: エントリーポイント（APIゲートウェイ、ミドルウェア）
   - 伝播: すべてのログ、HTTPヘッダー（X-Request-ID）

2. **Trace ID** (`trace_id`):
   - スコープ: 分散システム全体のリクエストフロー
   - 生成: OpenTelemetry等のトレーシングシステム
   - 伝播: W3C Trace Context標準

3. **Session ID** (`session_id`):
   - スコープ: ユーザーセッション全体
   - 生成: 認証時
   - 伝播: セッション管理システム

**伝播戦略**:
- HTTPヘッダー: X-Request-ID、X-Trace-ID
- 非同期処理: コンテキスト変数で自動伝播
- 外部API呼び出し: ヘッダーに含めて送信

### 4. コンテキスト情報設計

**必須フィールド（全ログ共通）**:
- `timestamp`: ISO8601形式（タイムゾーン付き）
- `level`: ログレベル（DEBUG/INFO/WARN/ERROR/FATAL）
- `message`: 人間可読なメッセージ
- `service`: サービス名またはコンポーネント名
- `environment`: 実行環境（dev/staging/production）

**推奨フィールド（トレーサビリティ）**:
- `request_id`: リクエスト識別子
- `trace_id`: 分散トレース識別子
- `user_id`: ユーザー識別子（認証済みの場合）
- `session_id`: セッション識別子

**エラー時の追加フィールド**:
- `error.type`: エラー分類（Validation/Business/External/Infrastructure/Internal）
- `error.message`: エラーメッセージ
- `error.stack`: スタックトレース
- `error.code`: エラーコード
- `context`: エラー発生時の関連情報（リクエストパラメータ、データベースクエリ等）

### 5. PIIマスキングとコンプライアンス

**PII（個人識別情報）の例**:
- メールアドレス、電話番号、クレジットカード番号
- パスワード、APIキー、トークン
- 住所、氏名、生年月日

**マスキング戦略**:
- **完全マスキング**: パスワード、クレジットカード → `***`
- **部分マスキング**: メールアドレス → `us***@example.com`
- **ハッシュ化**: user_id → SHA256ハッシュ
- **除外**: ログに含めない（最も安全）

**コンプライアンス考慮**:
- GDPR: EU市民のデータ保護
- CCPA: カリフォルニア州消費者プライバシー
- HIPAA: 医療情報保護（該当する場合）

## 設計チェックリスト

### 構造化ログ基本設計
- [ ] すべてのログがJSON形式で出力されるか？
- [ ] 必須フィールド（timestamp, level, message, service, environment）が含まれるか？
- [ ] ログレベルが明確な基準で分類されているか？
- [ ] 環境別にログレベル制御が可能か？

### トレーサビリティ設計
- [ ] すべてのログにrequest_idが含まれるか？
- [ ] 相関IDが分散システム全体で一貫しているか？
- [ ] 外部API呼び出し時にIDが伝播するか？
- [ ] 非同期処理でもコンテキストが維持されるか？

### エラーログ設計
- [ ] エラーログにスタックトレースが含まれるか？
- [ ] エラー分類が体系的に定義されているか？
- [ ] 診断に必要なコンテキスト情報が含まれるか？
- [ ] エラーコードが一貫して付与されるか？

### プライバシーとセキュリティ
- [ ] PIIが適切にマスキングされるか？
- [ ] パスワードやAPIキーがログに出力されないか？
- [ ] GDPR/CCPA等のコンプライアンス要件を満たすか？
- [ ] ログアクセス権限が適切に制御されているか？

### パフォーマンスとコスト
- [ ] ログ量が過剰でないか（サンプリング検討）？
- [ ] ログ出力がアプリケーションパフォーマンスに影響しないか？
- [ ] ログストレージコストが予算内か？
- [ ] ログ保持期間が適切に設定されているか？

## 関連リソース

詳細な実装パターンと設計ガイドは以下のリソースを参照:

- **ログスキーマ設計**: `.claude/skills/structured-logging/resources/log-schema-design.md`
- **ログレベル使用ガイド**: `.claude/skills/structured-logging/resources/log-level-guide.md`
- **PIIマスキングパターン**: `.claude/skills/structured-logging/resources/pii-masking-patterns.md`
- **ログフォーマット例**: `.claude/skills/structured-logging/templates/log-format-examples.json`
- **ロガー実装テンプレート**: `.claude/skills/structured-logging/templates/logger-template.ts`

## 関連スキル

このスキルは以下のスキルと連携します:

- `.claude/skills/observability-pillars/SKILL.md` - ログをメトリクス・トレースと統合
- `.claude/skills/distributed-tracing/SKILL.md` - トレースIDとログの相関
- `.claude/skills/alert-design/SKILL.md` - ログベースアラートの設計
- `.claude/skills/context-optimization/SKILL.md` - ログ量の最適化

## 使用例

### 開発環境での利用

```bash
# このスキルを参照
cat .claude/skills/structured-logging/SKILL.md

# ログスキーマテンプレートを確認
cat .claude/skills/structured-logging/templates/log-format-examples.json

# PIIマスキングパターンを参照
cat .claude/skills/structured-logging/resources/pii-masking-patterns.md
```

### エージェントからの参照

```markdown
## Phase 3: 構造化ロギング実装

**使用スキル**: `.claude/skills/structured-logging/SKILL.md`

**実行内容**:
1. ログスキーマ設計（必須フィールド、推奨フィールド）
2. ログレベル使用基準の定義
3. 相関ID伝播メカニズムの実装
4. PIIマスキング戦略の適用
```

## 参照文献

- Betsy Beyer et al., 『Site Reliability Engineering』, O'Reilly, 2016
- Charity Majors et al., 『Observability Engineering』, O'Reilly, 2022
- 『Effective Logging in Cloud Native Applications』, CNCF Best Practices
