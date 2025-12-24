---
name: .claude/skills/distributed-tracing/SKILL.md
description: |
    分散トレーシングとOpenTelemetry統合の専門スキル。
    マイクロサービスアーキテクチャにおけるリクエストフローの可視化とボトルネック特定を提供します。
    使用タイミング:
    - 分散システムのリクエストフロー を可視化する時
    - OpenTelemetryで分散トレーシングを導入する時
    - トレースIDとスパンIDを設計する時
    - サービス間の呼び出し関係を追跡する時
    - レイテンシボトルネックを特定する時
    - W3C Trace Contextでトレースを伝播させる時
    活性化キーワード: distributed tracing, OpenTelemetry, span, trace ID,
    W3C Trace Context, Jaeger, Zipkin, trace propagation, bottleneck

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/distributed-tracing/resources/span-design-guide.md`: スパンの適切な粒度設計、命名規則、属性設計ガイド
  - `.claude/skills/distributed-tracing/resources/trace-structure-design.md`: トレース構造とスパン階層の設計パターン
  - `.claude/skills/distributed-tracing/resources/w3c-trace-context.md`: W3C Trace Context標準準拠の実装ガイド
  - `.claude/skills/distributed-tracing/templates/tracing-config.ts`: OpenTelemetryトレーシング設定のTypeScriptテンプレート
  - `.claude/skills/distributed-tracing/scripts/analyze-trace.mjs`: トレースデータ分析とボトルネック特定スクリプト

  Use proactively when implementing .claude/skills/distributed-tracing/SKILL.md patterns or solving related problems.
version: 1.0.0
---

# Distributed Tracing - 分散トレーシング

## 概要

分散トレーシングは、マイクロサービスやサーバーレスアーキテクチャにおいて、
単一リクエストがシステム全体をどのように流れるかを可視化する技術です。

このスキルは、OpenTelemetry の標準と『Mastering Distributed Tracing』に基づく
実践的な分散トレーシング設計と実装知識を提供します。

## 核心概念

### 1. トレースの構造

#### トレース（Trace）

**定義**: 単一リクエストのエンドツーエンドの流れ

**構成要素**: 複数のスパン（Span）の集合

**例**:

```
Trace: "ユーザー注文処理"
├─ Span 1: API Gateway (100ms)
├─ Span 2: Order Service (80ms)
│  ├─ Span 2.1: Database Query (30ms)
│  └─ Span 2.2: Payment API Call (40ms)
└─ Span 3: Notification Service (20ms)
```

#### スパン（Span）

**定義**: 処理の一単位（関数呼び出し、API 呼び出し等）

**属性**:

- **Span ID**: スパン識別子（16 バイト Hex）
- **Trace ID**: 所属トレース識別子（16 バイト Hex）
- **Parent Span ID**: 親スパン識別子
- **開始時刻**: スパン開始のタイムスタンプ
- **終了時刻**: スパン終了のタイムスタンプ
- **Duration**: 処理時間（終了時刻 - 開始時刻）
- **Attributes**: カスタム属性（user_id、endpoint 等）
- **Events**: スパン内のイベント（ログ等）
- **Status**: 成功/失敗

### 2. トレース ID/スパン ID 設計

#### Trace ID

**フォーマット**: 16 バイト（32 文字 Hex）

```
例: 4bf92f3577b34da6a3ce929d0e0e4736
```

**生成**:

- エントリーポイント（API Gateway、Load Balancer）で生成
- 外部から受信した場合は引き継ぐ（W3C Trace Context）

**伝播**:

- すべてのサービス間通信で引き継ぐ
- HTTP ヘッダー `traceparent` で伝達

#### Span ID

**フォーマット**: 8 バイト（16 文字 Hex）

```
例: 00f067aa0ba902b7
```

**生成**:

- 各スパン開始時に生成
- 親スパン ID として子スパンに引き継がれる

### 3. W3C Trace Context

**標準ヘッダー**:

```
traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01
             |   |                                |                |
             version  trace-id (32 hex)         span-id (16 hex)  flags
```

**フィールド**:

- **version**: 常に `00`
- **trace-id**: トレース識別子（32 文字 Hex）
- **span-id**: 現在のスパン識別子（16 文字 Hex）
- **flags**: サンプリング等のフラグ（01 = sampled）

**伝播方法**:

```typescript
// リクエスト送信時
const response = await fetch("https://downstream-service/api", {
  headers: {
    traceparent: `00-${traceId}-${spanId}-01`,
  },
});

// リクエスト受信時
const traceContext = parseTraceParent(req.headers["traceparent"]);
```

### 4. スパン設計原則

#### ビジネスロジック単位

**良いスパン**:

```
✅ "process_order" - ビジネス的意味がある
✅ "validate_payment" - 明確な処理単位
✅ "send_notification" - 独立した機能
```

**悪いスパン**:

```
❌ "function_A" - 意味不明
❌ "line_123" - 技術的すぎる
❌ "do_stuff" - 曖昧
```

#### 適切な粒度

**粗すぎる**:

```
❌ 1つのスパンで全処理 → ボトルネック特定不可
```

**細かすぎる**:

```
❌ 1行ごとにスパン → オーバーヘッド大、ノイズ
```

**適切**:

```
✅ ビジネスロジックの意味のある単位
✅ ボトルネック特定に有用な粒度
```

### 5. サンプリング戦略

#### ヘッドベースサンプリング

**定義**: リクエスト受信時に記録するか決定

**利点**: シンプル、リソース予測可能

**実装**:

```typescript
const samplingRate = 0.01; // 1%
const shouldSample = Math.random() < samplingRate;
```

#### テールベースサンプリング

**定義**: リクエスト完了後に記録するか決定

**利点**: エラーリクエストを確実に記録

**条件**:

```yaml
tail_sampling:
  policies:
    - name: errors
      type: status_code
      status_code: { status_codes: [ERROR] }
    - name: slow_requests
      type: latency
      latency: { threshold_ms: 1000 }
    - name: baseline
      type: probabilistic
      probabilistic: { sampling_percentage: 1 }
```

## 実装チェックリスト

### 基本設定

- [ ] OpenTelemetry がインストール・設定されているか？
- [ ] 自動計装が有効化されているか？
- [ ] トレースエクスポーターが設定されているか（Jaeger、Zipkin 等）？

### トレーシング設計

- [ ] Trace ID が全サービスで一貫しているか？
- [ ] W3C Trace Context に準拠しているか？
- [ ] スパンがビジネスロジックの意味のある単位か？
- [ ] スパン属性に診断に有用な情報が含まれるか？

### ログ統合

- [ ] ログに trace_id/span_id が含まれるか？
- [ ] ログからトレーシングシステムにナビゲート可能か？

### サンプリング

- [ ] エラーリクエストは 100%記録されるか？
- [ ] 正常リクエストは適切にサンプリングされるか（1-10%）？
- [ ] サンプリング率は診断能力とコストをバランスしているか？

## 関連リソース

詳細な実装パターンと設計ガイドは以下のリソースを参照:

- **トレース構造設計**: `.claude/skills/distributed-tracing/resources/trace-structure-design.md`
- **W3C Trace Context 実装**: `.claude/skills/distributed-tracing/resources/w3c-trace-context.md`
- **スパン設計ガイド**: `.claude/skills/distributed-tracing/resources/span-design-guide.md`
- **トレーシング設定テンプレート**: `.claude/skills/distributed-tracing/templates/tracing-config.ts`

## 関連スキル

このスキルは以下のスキルと連携します:

- `.claude/skills/observability-pillars/SKILL.md` - ログ・メトリクスとの統合
- `.claude/skills/structured-logging/SKILL.md` - ログへの trace_id 埋め込み

## 使用例

### 開発環境での利用

```bash
# このスキルを参照
cat .claude/skills/distributed-tracing/SKILL.md

# W3C Trace Context実装を確認
cat .claude/skills/distributed-tracing/resources/w3c-trace-context.md

# トレーシング設定テンプレートを使用
cat .claude/skills/distributed-tracing/templates/tracing-config.ts
```

## 参照文献

- Yuri Shkuro, 『Mastering Distributed Tracing』, Packt, 2019
- OpenTelemetry Documentation, https://opentelemetry.io/docs/
- W3C Trace Context Specification, https://www.w3.org/TR/trace-context/
