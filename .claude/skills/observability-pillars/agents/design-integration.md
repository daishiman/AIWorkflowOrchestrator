# Task: 三本柱統合設計

> **相対パス**: `agents/design-integration.md`
> **バージョン**: 1.0.0

---

## 目的

ログ・メトリクス・トレースを統合するアーキテクチャを設計し、双方向ナビゲーションを実現する。

## 入力

- 成熟度評価結果（`analyze-pillars`の出力）
- 既存インフラ構成
- 要件（SLO、保持期間、コスト制約）

## 出力

- 統合アーキテクチャ設計書
- 相関ID体系設計
- ナビゲーション設計

## 手順

### Step 1: 相関ID体系設計

**設計決定事項**:

| 項目           | 選択肢                       | 推奨                |
| -------------- | ---------------------------- | ------------------- |
| Request ID形式 | UUID v4 / ULID / Snowflake   | UUID v4（標準的）   |
| Trace ID形式   | W3C Trace Context / カスタム | W3C Trace Context   |
| ID生成場所     | API Gateway / ミドルウェア   | API Gateway（統一） |
| ID伝播方式     | HTTPヘッダー / メタデータ    | HTTPヘッダー        |

**ID命名規則**:

```
# HTTPヘッダー
X-Request-ID: <uuid v4>
traceparent: 00-<trace_id>-<span_id>-<flags>

# ログフィールド
request_id: string
trace_id: string
span_id: string
```

### Step 2: コンテキスト伝播設計

**同期処理**:

```typescript
// ミドルウェア設計
interface RequestContext {
  request_id: string;
  trace_id: string;
  span_id: string;
  user_id?: string;
  timestamp: string;
}

// 伝播方式: AsyncLocalStorage
```

**非同期処理（メッセージキュー）**:

```typescript
// メッセージヘッダーに含める
interface MessageHeaders {
  request_id: string;
  trace_id: string;
  parent_span_id: string;
}
```

### Step 3: ナビゲーション経路設計

**メトリクス → ログ**:

```
1. Grafanaダッシュボードでメトリクス異常を検知
2. 時間範囲とサービス名でLokiクエリを生成
3. ログパネルにドリルダウンリンクを設定
```

**ログ → トレース**:

```
1. ログエントリからtrace_idを取得
2. Tempo/Jaegerへのリンクを生成
3. トレース詳細画面へ遷移
```

**トレース → メトリクス**:

```
1. スパン属性からサービス名・エンドポイントを取得
2. 該当メトリクスのPrometheusクエリを生成
3. Grafanaパネルへのリンクを設定
```

### Step 4: ダッシュボード構成設計

```
┌─────────────────────────────────────────────────────┐
│ Overview Dashboard                                  │
├─────────────────────────────────────────────────────┤
│ [Error Rate] [Latency P99] [Request Rate]           │
│      ↓ drill-down link                              │
├─────────────────────────────────────────────────────┤
│ [Error Logs Panel] - Loki query with time filter    │
│      ↓ trace_id link                                │
├─────────────────────────────────────────────────────┤
│ [Trace Details Panel] - Tempo embedded view         │
└─────────────────────────────────────────────────────┘
```

## 設計成果物

1. **相関ID仕様書**: ID形式、生成ルール、伝播ルール
2. **ミドルウェア設計書**: コンテキスト管理、ID注入
3. **ダッシュボード設計書**: パネル構成、ドリルダウンリンク
4. **データフロー図**: 三本柱間のデータ流れ

## 完了条件

- [ ] 相関ID体系を文書化
- [ ] コンテキスト伝播方式を決定
- [ ] ナビゲーション経路を設計
- [ ] ダッシュボード構成を設計
