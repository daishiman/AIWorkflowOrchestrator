# SLI設計ガイド

## SLI設計の基本原則

### 原則1: ユーザー中心

**ユーザー体験を反映**:
❌ CPU使用率、メモリ使用率（内部指標）
✅ リクエスト成功率、レイテンシ（ユーザー体験）

### 原則2: 測定可能性

**自動収集可能**:
❌ 「ユーザーは満足している」（主観的）
✅ 「P99レイテンシ < 200ms」（定量的）

### 原則3: 代表性

**サービス全体の品質を代表**:
❌ 単一エンドポイント（/health）のみ
✅ すべての主要エンドポイント

## SLI種別と設計

### 可用性SLI

**定義**:

```
可用性 = 成功リクエスト数 / 全リクエスト数
```

**成功の定義パターン**:

**パターン1**: HTTPステータスコードベース

```
成功 = HTTPステータスコード 2xx or 3xx
失敗 = HTTPステータスコード 4xx or 5xx
```

**パターン2**: ビジネスロジックベース

```
成功 = ビジネス処理が完了 AND レスポンス時間 < タイムアウト
失敗 = ビジネス処理失敗 OR レスポンス時間 >= タイムアウト
```

**測定対象の選定**:

```
# 全エンドポイント
可用性 = 全エンドポイントの成功率

# 特定エンドポイント（ビジネスクリティカル）
API可用性 = /api/* エンドポイントの成功率
```

**Prometheusクエリ例**:

```
# 全エンドポイントの可用性
sum(rate(http_requests_total{status=~"2.."}[30d]))
/
sum(rate(http_requests_total[30d]))

# 特定エンドポイント
sum(rate(http_requests_total{path=~"/api/.*", status=~"2.."}[30d]))
/
sum(rate(http_requests_total{path=~"/api/.*"}[30d]))
```

### レイテンシSLI

**定義**:

```
レイテンシSLI = 指定パーセンタイルの応答時間
```

**パーセンタイル選択指針**:

| パーセンタイル | 意味                 | 使用ケース               |
| -------------- | -------------------- | ------------------------ |
| P50（中央値）  | 典型的なユーザー体験 | 通常のパフォーマンス確認 |
| P95            | 95%のユーザー体験    | 大多数のユーザー保護     |
| P99            | 99%のユーザー体験    | ロングテール対策         |
| P99.9          | 99.9%のユーザー体験  | 極端な外れ値検出         |

**推奨組み合わせ**:

```
P50 < 100ms   # 通常ケース
P95 < 300ms   # 標準保証
P99 < 500ms   # ロングテール
```

**Prometheusクエリ例**:

```
# P99レイテンシ
histogram_quantile(0.99,
  rate(http_request_duration_seconds_bucket[5m])
)

# P95レイテンシ
histogram_quantile(0.95,
  rate(http_request_duration_seconds_bucket[5m])
)
```

### エラー率SLI

**定義**:

```
エラー率 = エラーリクエスト数 / 全リクエスト数
```

**エラー分類**:

**サーバーエラー（5xx）**:

- 500 Internal Server Error
- 502 Bad Gateway
- 503 Service Unavailable
- 504 Gateway Timeout

**クライアントエラー（一部4xx）**:

- 429 Too Many Requests（サーバー側の問題）
- 408 Request Timeout

**除外すべきエラー**:

- 400 Bad Request（クライアントの問題）
- 401 Unauthorized（認証の問題）
- 403 Forbidden（認可の問題）
- 404 Not Found（存在しないリソース）

**Prometheusクエリ例**:

```
# 5xxエラー率
sum(rate(http_requests_total{status=~"5.."}[30d]))
/
sum(rate(http_requests_total[30d]))

# 5xx + 429エラー率
sum(rate(http_requests_total{status=~"5..|429"}[30d]))
/
sum(rate(http_requests_total[30d]))
```

## SLI定義ドキュメントテンプレート

```yaml
sli:
  name: "API可用性"
  description: "APIリクエストの成功率"
  type: "availability"
  measurement:
    numerator: "HTTPステータスコード2xxまたは3xxのリクエスト数"
    denominator: "全HTTPリクエスト数"
    data_source: "Prometheusメトリクス http_requests_total"
    query: |
      sum(rate(http_requests_total{status=~"2..|3.."}[30d]))
      /
      sum(rate(http_requests_total[30d]))
  success_criteria: "HTTPステータスコード 2xx または 3xx"
  exclusions:
    - "ヘルスチェックエンドポイント (/health, /metrics)"
    - "内部管理エンドポイント (/admin/*)"
```

## ベストプラクティス

1. **ユーザー視点**: 内部指標ではなくユーザー体験を測定
2. **明確な定義**: 成功/失敗の基準を明確に
3. **自動測定**: 手動測定に依存しない
4. **複数SLI**: 単一指標ではなく複数の側面を測定
5. **段階的目標**: 初期は達成可能、徐々に厳格化

## アンチパターン

❌ **内部指標のみ**: CPU使用率、メモリ使用率
✅ **ユーザー指標**: 可用性、レイテンシ、エラー率

❌ **曖昧な定義**: 「システムは正常に動作している」
✅ **明確な定義**: 「99.9%のリクエストが成功」

❌ **測定不可能**: 「ユーザーは満足している」
✅ **測定可能**: 「P99レイテンシ < 200ms」
