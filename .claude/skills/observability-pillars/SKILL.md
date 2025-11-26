---
name: observability-pillars
description: |
  オブザーバビリティの三本柱（ログ・メトリクス・トレース）の統合設計スキル。
  Charity Majorsの『Observability Engineering』に基づく実践的な統合パターンを提供します。

  使用タイミング:
  - ログ、メトリクス、トレースを統合的に設計する時
  - 相関IDで三本柱を連携させる時
  - メトリクス異常から該当ログへナビゲートする仕組みを構築する時
  - OpenTelemetryで三本柱を統一する時
  - 高カーディナリティデータを設計する時
  - オブザーバビリティ戦略を立案する時

  活性化キーワード: observability, logs metrics traces, three pillars,
  correlation, OpenTelemetry, high cardinality, telemetry integration

version: 1.0.0
---

# Observability Pillars - オブザーバビリティ三本柱統合

## 概要

オブザーバビリティの三本柱（ログ・メトリクス・トレース）を統合的に設計することで、
システムの内部状態を完全に可視化し、未知の問題を発見・診断できる能力を実現します。

このスキルは、Charity Majorsの『Observability Engineering』とGoogleの
『Site Reliability Engineering』に基づく実践的な統合パターンを提供します。

## 核心概念

### 1. 三本柱の役割と相互補完

#### Pillar 1: ログ（Logs）

**役割**: 個別イベントの詳細記録

**強み**:
- 問題の深掘り診断が可能
- 詳細なコンテキスト情報
- イベントの時系列把握

**弱み**:
- 大量データの集計が困難
- 傾向把握には不向き
- ストレージコストが高い

**使用例**:
- エラーの根本原因特定
- ユーザー行動の詳細追跡
- 監査ログ

#### Pillar 2: メトリクス（Metrics）

**役割**: 集計データの時系列推移

**強み**:
- 傾向とパターンの把握が容易
- 軽量で保存効率が高い
- リアルタイムダッシュボード

**弱み**:
- 詳細コンテキスト不足
- 個別イベントの特定が困難

**使用例**:
- CPU/メモリ使用率監視
- リクエスト数、エラー率の時系列
- SLO/SLI測定

#### Pillar 3: トレース（Traces）

**役割**: リクエストフローの可視化

**強み**:
- エンドツーエンドの流れを追跡
- ボトルネック特定が容易
- サービス間依存関係の可視化

**弱み**:
- サンプリングが必要（全リクエストは記録できない）
- セットアップが複雑

**使用例**:
- マイクロサービス間の呼び出し追跡
- レイテンシボトルネックの特定
- 分散システムのデバッグ

### 2. 三本柱の統合パターン

#### 統一相関ID

**設計原則**:
すべての三本柱で同一の識別子（request_id、trace_id）を共有する

**ログ**:
```json
{
  "request_id": "550e8400-e29b-41d4-a716-446655440000",
  "trace_id": "4bf92f3577b34da6a3ce929d0e0e4736",
  "message": "User query executed"
}
```

**メトリクス**:
```
http_request_duration_seconds{request_id="550e8400", trace_id="4bf92f35"} 0.045
```

**トレース**:
```
Trace ID: 4bf92f3577b34da6a3ce929d0e0e4736
  Span: api-gateway (45ms)
    Span: user-service (30ms)
      Span: database-query (20ms)
```

#### 双方向ナビゲーション

**メトリクス → ログ**:
1. ダッシュボードでエラー率急増を検知
2. 該当時刻のエラーログを検索
3. request_idで詳細ログを取得

**ログ → トレース**:
1. エラーログからtrace_idを取得
2. トレーシングシステムで該当トレースを検索
3. リクエストフロー全体を可視化

**トレース → メトリクス**:
1. ボトルネックスパンを特定
2. 該当サービスのメトリクスを確認
3. CPU/メモリ等のリソース状況を分析

### 3. OpenTelemetry統合

**OpenTelemetry（OTel）** は、三本柱を統一的に扱うための標準規格です。

#### 自動計装 vs 手動計装

**自動計装**:
- ライブラリが自動的にテレメトリを収集
- セットアップが簡単
- カバレッジが広い

**手動計装**:
- ビジネスロジックの重要箇所を明示的に計測
- 詳細なコンテキスト情報を追加
- ビジネスメトリクスの収集

**推奨**: 自動計装 + 重要箇所の手動計装

#### スパン設計

**スパン（Span）**: トレースの構成要素、一つの処理単位

**設計原則**:
- ビジネスロジックの意味のある単位でスパンを作成
- スパンには属性（attributes）を追加してコンテキストを充実
- 親子関係で処理の階層を表現

**例**:
```
Root Span: HTTP Request (100ms)
├─ Child Span: Authentication (10ms)
├─ Child Span: Business Logic (70ms)
│  ├─ Child Span: Database Query (40ms)
│  └─ Child Span: External API Call (25ms)
└─ Child Span: Response Serialization (5ms)
```

#### 属性タグ戦略

**タグの種類**:
- **リソース属性**: サービス名、バージョン、環境
- **スパン属性**: HTTP method、URL、status code
- **カスタム属性**: ビジネス情報（user_id、order_id等）

**例**:
```typescript
span.setAttributes({
  // 標準属性
  'http.method': 'POST',
  'http.url': '/api/orders',
  'http.status_code': 200,

  // カスタム属性
  'user.id': 'user_12345',
  'order.id': 'ord_abc123',
  'order.total_amount': 1234.56
});
```

### 4. 高カーディナリティデータ

**カーディナリティ（Cardinality）**: データの値の種類数

**高カーディナリティ**:
- user_id（数百万種類）
- request_id（無限）
- session_id（数十万種類）

**低カーディナリティ**:
- environment（3種類: dev/staging/production）
- log_level（5種類: DEBUG/INFO/WARN/ERROR/FATAL）
- http_method（9種類: GET/POST等）

**重要性**:
高カーディナリティデータをログに含めることで、詳細な診断が可能になる

**例**:
```json
{
  "message": "Payment failed",
  "user_id": "user_12345",        // 高カーディナリティ
  "transaction_id": "txn_xyz",    // 高カーディナリティ
  "payment_method": "credit_card", // 低カーディナリティ
  "error_code": "insufficient_funds" // 低カーディナリティ
}
```

## 統合設計パターン

### パターン1: 相関IDによる統合

**設計**:
すべての三本柱でrequest_idとtrace_idを共有

**実装ステップ**:
1. リクエスト受信時にrequest_idとtrace_idを生成
2. ログにrequest_id/trace_idを含める
3. メトリクスラベルにrequest_id/trace_idを追加（サンプル）
4. トレースにtrace_idを設定

**ナビゲーション**:
- メトリクス異常 → request_idで該当ログを検索
- ログのtrace_id → トレーシングシステムで詳細確認

### パターン2: 自動相関分析

**設計**:
異常検知時に関連情報を自動収集

**例**:
1. メトリクス: エラー率が5%超
2. 自動トリガー: 該当時刻のERRORログを検索
3. 自動トリガー: 該当trace_idのトレースを取得
4. ダッシュボード: すべての関連情報を表示

### パターン3: サンプリング戦略

**正常リクエスト**:
- ログ: 1%サンプリング
- メトリクス: 100%記録（軽量）
- トレース: 1%サンプリング

**エラーリクエスト**:
- ログ: 100%記録
- メトリクス: 100%記録
- トレース: 100%記録

**理由**:
コストと診断能力のバランス

## 実装チェックリスト

### 統合設計
- [ ] 三本柱すべてでrequest_id/trace_idが一貫しているか？
- [ ] メトリクス異常から該当ログに即座にアクセスできるか？
- [ ] ログのtrace_idからトレース詳細にナビゲートできるか？
- [ ] 三本柱が同一のタイムスタンプ基準を使用しているか？

### OpenTelemetry統合
- [ ] 自動計装ライブラリが導入されているか？
- [ ] 重要処理に手動スパンが追加されているか？
- [ ] スパン属性に診断に有用な情報が含まれるか？
- [ ] トレースコンテキストがログに含まれるか？

### 高カーディナリティデータ
- [ ] user_id、session_id等がログに含まれるか？
- [ ] トレースに詳細な属性タグが付与されているか？
- [ ] メトリクスラベルは適切な粒度か（過剰な高カーディナリティは避ける）？

### サンプリング戦略
- [ ] 正常リクエストとエラーリクエストで異なるサンプリング率か？
- [ ] サンプリング率は診断能力とコストを適切にバランスしているか？
- [ ] 重要なビジネスイベントは100%記録されるか？

## 関連リソース

詳細な統合パターンと実装ガイドは以下のリソースを参照:

- **三本柱統合パターン**: `.claude/skills/observability-pillars/resources/integration-patterns.md`
- **OpenTelemetry導入ガイド**: `.claude/skills/observability-pillars/resources/opentelemetry-guide.md`
- **サンプリング戦略設計**: `.claude/skills/observability-pillars/resources/sampling-strategies.md`
- **統合設定テンプレート**: `.claude/skills/observability-pillars/templates/integration-config.ts`

## 関連スキル

このスキルは以下のスキルと連携します:

- `.claude/skills/structured-logging/SKILL.md` - ログ設計の詳細
- `.claude/skills/distributed-tracing/SKILL.md` - トレース設計の詳細
- `.claude/skills/slo-sli-design/SKILL.md` - メトリクスベースのSLO測定
- `.claude/skills/alert-design/SKILL.md` - 三本柱を活用したアラート設計

## 使用例

### 開発環境での利用

```bash
# このスキルを参照
cat .claude/skills/observability-pillars/SKILL.md

# 統合パターンを確認
cat .claude/skills/observability-pillars/resources/integration-patterns.md

# OpenTelemetry導入ガイドを参照
cat .claude/skills/observability-pillars/resources/opentelemetry-guide.md
```

### エージェントからの参照

```markdown
## Phase 2: オブザーバビリティ三本柱の統合

**使用スキル**: `.claude/skills/observability-pillars/SKILL.md`

**実行内容**:
1. 相関IDによる三本柱統合
2. OpenTelemetry導入と設定
3. サンプリング戦略の設計
4. 双方向ナビゲーションの実現
```

## 参照文献

- Charity Majors et al., 『Observability Engineering』, O'Reilly, 2022
- Betsy Beyer et al., 『Site Reliability Engineering』, O'Reilly, 2016
- OpenTelemetry Documentation, https://opentelemetry.io/docs/
