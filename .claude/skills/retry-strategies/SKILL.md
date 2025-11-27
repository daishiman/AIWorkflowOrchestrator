---
name: retry-strategies
description: |
  外部APIの一時的障害に対するリトライ戦略とサーキットブレーカーパターンを専門とするスキル。

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/retry-strategies/resources/bulkhead-pattern.md`: Bulkhead Patternリソース
  - `.claude/skills/retry-strategies/resources/circuit-breaker.md`: Circuit Breakerリソース
  - `.claude/skills/retry-strategies/resources/exponential-backoff.md`: Exponential Backoffリソース
  - `.claude/skills/retry-strategies/resources/timeout-strategies.md`: Timeout Strategiesリソース

  - `.claude/skills/retry-strategies/templates/circuit-breaker-template.ts`: Circuit Breakerテンプレート
  - `.claude/skills/retry-strategies/templates/retry-wrapper-template.ts`: Retry Wrapperテンプレート

  - `.claude/skills/retry-strategies/scripts/analyze-retry-config.mjs`: Analyze Retry Configスクリプト

version: 1.0.0
---

# Retry Strategies

## 概要

このスキルは、外部 API 呼び出しにおける障害耐性パターンを提供します。
サム・ニューマンの『Building Microservices』およびマイケル・ナイガードの『Release It!』に基づき、
分散システムにおける一時的障害からの自動復旧メカニズムを設計します。

**主要な価値**:

- 一時的障害からの自動復旧による可用性向上
- サーキットブレーカーによる障害連鎖の防止
- 適切なバックオフによるサーバー負荷軽減
- 段階的復旧による安定したサービス提供

**対象ユーザー**:

- 外部 API 統合を実装するエージェント（@gateway-dev）
- インフラ層の設計者
- SRE エンジニア

## リソース構造

```
retry-strategies/
├── SKILL.md                                    # 本ファイル（概要とワークフロー）
├── resources/
│   ├── exponential-backoff.md                  # 指数バックオフの詳細ガイド
│   ├── circuit-breaker.md                      # サーキットブレーカーの詳細ガイド
│   ├── bulkhead-pattern.md                     # バルクヘッドパターンの詳細
│   └── timeout-strategies.md                   # タイムアウト戦略の詳細
├── scripts/
│   └── analyze-retry-config.mjs                # リトライ設定分析スクリプト
└── templates/
    ├── retry-wrapper-template.ts               # リトライラッパーテンプレート
    └── circuit-breaker-template.ts             # サーキットブレーカーテンプレート
```

## コマンドリファレンス

このスキルで使用可能なリソース、スクリプト、テンプレートへのアクセスコマンド:

### リソース読み取り

```bash
# 指数バックオフの詳細
cat .claude/skills/retry-strategies/resources/exponential-backoff.md

# サーキットブレーカーの詳細
cat .claude/skills/retry-strategies/resources/circuit-breaker.md

# バルクヘッドパターンの詳細
cat .claude/skills/retry-strategies/resources/bulkhead-pattern.md

# タイムアウト戦略の詳細
cat .claude/skills/retry-strategies/resources/timeout-strategies.md
```

### スクリプト実行

```bash
# リトライ設定の分析
node .claude/skills/retry-strategies/scripts/analyze-retry-config.mjs <config-file>
```

### テンプレート参照

```bash
# リトライラッパーテンプレート
cat .claude/skills/retry-strategies/templates/retry-wrapper-template.ts

# サーキットブレーカーテンプレート
cat .claude/skills/retry-strategies/templates/circuit-breaker-template.ts
```

## いつ使うか

### シナリオ 1: 外部 API へのリトライ実装

**状況**: 外部 API が一時的に利用不可になることがある

**適用条件**:

- [ ] 外部 API が 5xx 系エラーを返すことがある
- [ ] ネットワーク障害で接続が切れることがある
- [ ] タイムアウトが発生することがある

**期待される成果**: Exponential Backoff によるリトライ実装

### シナリオ 2: 障害連鎖の防止

**状況**: 外部サービスの障害がシステム全体に波及する

**適用条件**:

- [ ] 外部サービスの障害が長時間続くことがある
- [ ] 障害時にリクエストが滞留する
- [ ] システムリソースが枯渇する

**期待される成果**: サーキットブレーカーによる障害遮断

### シナリオ 3: タイムアウト設計

**状況**: 適切なタイムアウト設定が必要

**適用条件**:

- [ ] 外部 API 呼び出しが予期せず長時間かかることがある
- [ ] リソースのブロックを避けたい
- [ ] ユーザー体験への影響を最小化したい

**期待される成果**: 適切なタイムアウト戦略の実装

## 前提条件

### 必要な知識

- [ ] HTTP 通信の基礎（ステータスコード、タイムアウト）
- [ ] 非同期処理（Promise、async/await）
- [ ] エラーハンドリングの基本

### 必要なツール

- Read: 既存コードの確認
- Write: リトライロジックの実装
- Bash: テスト実行

### 環境要件

- TypeScript/JavaScript 環境
- 外部 API クライアントが実装済み

## 核心概念

### 1. Exponential Backoff（指数バックオフ）

**目的**: リトライ間隔を指数的に増加させ、サーバー負荷を軽減

**原則**:

- 初回失敗後は短い待機時間
- リトライごとに待機時間を 2 倍に増加
- ジッターを追加して同時リトライを回避
- 最大待機時間を設定

**計算式**:

```
待機時間 = min(baseDelay * 2^attempt + jitter, maxDelay)
```

**詳細**: `resources/exponential-backoff.md`

### 2. Circuit Breaker（サーキットブレーカー）

**目的**: 連続失敗時にリクエストを遮断し、システムを保護

**状態遷移**:

```
Closed（正常）
    │
    │ 失敗閾値到達
    ▼
  Open（遮断）
    │
    │ タイムアウト経過
    ▼
Half-Open（試行）
    │
    ├─ 成功 → Closed
    └─ 失敗 → Open
```

**詳細**: `resources/circuit-breaker.md`

### 3. Bulkhead（バルクヘッド）

**目的**: リソースを分離し、障害の波及を防止

**原則**:

- 外部サービスごとにリソースプールを分離
- 一部の障害が全体に影響しない
- 同時接続数の制限

**詳細**: `resources/bulkhead-pattern.md`

### 4. Timeout Management（タイムアウト管理）

**目的**: 適切なタイムアウトでリソース枯渇を防止

**種類**:

- **接続タイムアウト**: TCP 接続確立の待機時間
- **読み取りタイムアウト**: レスポンス受信の待機時間
- **全体タイムアウト**: 操作全体の最大時間

**詳細**: `resources/timeout-strategies.md`

## ワークフロー

### Phase 1: 障害パターンの分析

**目的**: リトライが必要な障害パターンを特定する

**ステップ**:

1. **エラー分類**:

   - 一時的エラー（5xx, タイムアウト, ネットワーク）
   - 永続的エラー（4xx, 認証エラー）

2. **頻度分析**:

   - 障害発生頻度
   - 平均復旧時間
   - ピーク時の挙動

3. **影響評価**:
   - システムへの影響
   - ユーザー体験への影響
   - コスト影響

**判断基準**:

- [ ] リトライ対象のエラーが特定されているか？
- [ ] 障害パターンが分析されているか？
- [ ] 影響度が評価されているか？

### Phase 2: リトライ戦略の設計

**目的**: 適切なリトライパラメータを決定する

**ステップ**:

1. **リトライ対象の決定**:

   - 5xx 系エラー: ✅ リトライ対象
   - 408 Request Timeout: ✅ リトライ対象
   - 429 Too Many Requests: ✅ リトライ対象（Retry-After 考慮）
   - 4xx 系エラー（上記以外）: ❌ リトライ対象外

2. **パラメータ設計**:

   - 初期待機時間（baseDelay）
   - 最大待機時間（maxDelay）
   - 最大リトライ回数（maxRetries）
   - ジッター範囲

3. **バックオフ戦略選択**:
   - Exponential: 指数的増加（推奨）
   - Linear: 線形増加
   - Constant: 固定間隔

**判断基準**:

- [ ] リトライ対象が明確に定義されているか？
- [ ] パラメータが外部 API の特性に合っているか？
- [ ] 最大リトライでの総待機時間が許容範囲か？

### Phase 3: サーキットブレーカー設計

**目的**: 障害遮断の閾値とフォールバックを設計する

**ステップ**:

1. **閾値設計**:

   - 失敗カウント閾値（Open 状態への遷移）
   - タイムアウト閾値（Open 状態の継続時間）
   - 成功判定閾値（Half-Open→Closed の条件）

2. **フォールバック設計**:

   - キャッシュからのデータ返却
   - デフォルト値の返却
   - 即座のエラー返却

3. **モニタリング設計**:
   - 状態遷移のログ記録
   - メトリクス収集
   - アラート設定

**判断基準**:

- [ ] 閾値がシステム要件に合っているか？
- [ ] フォールバックがビジネス要件を満たすか？
- [ ] 状態がモニタリング可能か？

### Phase 4: 実装とテスト

**目的**: リトライロジックを実装し、動作を検証する

**ステップ**:

1. **実装**:

   - リトライラッパーの作成
   - サーキットブレーカーの作成
   - 既存クライアントへの統合

2. **ユニットテスト**:

   - リトライ動作のテスト
   - 状態遷移のテスト
   - フォールバックのテスト

3. **統合テスト**:
   - 実際の障害シミュレーション
   - 負荷テスト
   - カオスエンジニアリング

**判断基準**:

- [ ] リトライが正しく動作するか？
- [ ] サーキットブレーカーが適切に遷移するか？
- [ ] テストカバレッジは十分か？

## ベストプラクティス

### すべきこと

1. **一時的エラーのみリトライ**:

   - ✅ 5xx, タイムアウト, ネットワークエラー
   - ❌ 4xx（認証エラー、バリデーションエラー）

2. **ジッターの追加**:

   - 同時リトライによる負荷集中を回避
   - ランダム要素を待機時間に追加

3. **べき等性の確保**:

   - リトライ対象の操作はべき等であること
   - 副作用のある操作は注意が必要

4. **ログとメトリクス**:
   - リトライ回数の記録
   - サーキットブレーカー状態の記録
   - 成功率のモニタリング

### 避けるべきこと

1. **無限リトライ**:

   - ❌ 最大回数なしのリトライ
   - ✅ 明確な上限を設定

2. **固定間隔リトライ**:

   - ❌ 常に同じ間隔でリトライ
   - ✅ Exponential Backoff を使用

3. **永続的エラーへのリトライ**:
   - ❌ 401, 403, 404 へのリトライ
   - ✅ 一時的エラーのみリトライ

## トラブルシューティング

### 問題 1: リトライでも回復しない

**症状**: 最大リトライ後も失敗が続く

**原因**:

- 外部サービスの長時間障害
- 設定の問題（タイムアウトが短すぎる等）

**解決策**:

1. サーキットブレーカーを導入
2. フォールバック処理を実装
3. タイムアウト設定を見直し

### 問題 2: サーキットブレーカーがすぐに Open になる

**症状**: 少しのエラーでサーキットブレーカーが開く

**原因**: 閾値が厳しすぎる

**解決策**:

1. 失敗カウント閾値を引き上げ
2. 時間ウィンドウを導入（例: 1 分間で 5 回失敗）
3. エラー率ベースの判定に変更

### 問題 3: リソース枯渇

**症状**: リトライ待機中にリソースが枯渇

**原因**: 同時リトライが多すぎる

**解決策**:

1. Bulkhead パターンで同時実行数を制限
2. タイムアウトを短縮
3. キューイングを導入

## 関連スキル

- **api-client-patterns** (`.claude/skills/api-client-patterns/SKILL.md`): API クライアント設計
- **http-best-practices** (`.claude/skills/http-best-practices/SKILL.md`): HTTP 通信のベストプラクティス
- **rate-limiting** (`.claude/skills/rate-limiting/SKILL.md`): レート制限対応

## 参考文献

- **『Building Microservices』** Sam Newman 著

  - Chapter 11: Microservices at Scale - サーキットブレーカーとバルクヘッド

- **『Release It!』** Michael T. Nygard 著
  - Chapter 5: Stability Patterns - Circuit Breaker, Bulkhead, Timeouts

## 変更履歴

| バージョン | 日付       | 変更内容                                                           |
| ---------- | ---------- | ------------------------------------------------------------------ |
| 1.0.0      | 2025-11-25 | 初版作成 - Exponential Backoff, Circuit Breaker, Bulkhead, Timeout |

## 使用上の注意

### このスキルが得意なこと

- リトライ戦略の設計とパラメータ決定
- サーキットブレーカーの状態遷移設計
- タイムアウト戦略の設計

### このスキルが行わないこと

- 具体的なリトライコードの実装（それは@gateway-dev エージェントの役割）
- API クライアント全体の設計（api-client-patterns スキル）
- レート制限の実装（rate-limiting スキル）
