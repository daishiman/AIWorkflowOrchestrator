---
name: connection-pooling
description: |
  データベース接続プール管理の専門スキル。
  サーバーレス環境での接続管理、Neon/Supabaseの接続プーリング、
  高負荷時の接続最適化を専門とします。

  専門分野:
  - 接続プール設計: 環境に応じた最適なプール設定
  - サーバーレス対応: Neon/Supabaseでの接続管理
  - Drizzle ORM統合: DrizzleでのDB接続設定
  - 障害対策: 接続エラーハンドリングとリトライ
  - 監視: 接続状態の監視とアラート

  使用タイミング:
  - 新規プロジェクトでDB接続を設定する時
  - 接続プールのサイジングを決める時
  - サーバーレス環境での接続問題を解決する時
  - 接続エラーが頻発する時
  - 高負荷時の接続最適化が必要な時

  Use proactively when setting up database connections,
  troubleshooting connection issues, or optimizing for serverless.
version: 1.0.0
---

# Connection Pooling

## 概要

このスキルは、データベース接続プールの設計と管理に関する
知識を提供します。特にサーバーレス環境（Neon, Supabase）での
接続管理に焦点を当てています。

**主要な価値**:
- サーバーレス環境での安定した接続
- 高負荷時のパフォーマンス維持
- 接続リソースの効率的な利用

**対象ユーザー**:
- `@dba-mgr`エージェント
- バックエンド開発者
- DevOpsエンジニア
- SREチーム

## リソース構造

```
connection-pooling/
├── SKILL.md                                    # 本ファイル
├── resources/
│   ├── pool-sizing-guide.md                   # プールサイジング
│   ├── serverless-connections.md              # サーバーレス接続
│   └── error-handling.md                      # エラーハンドリング
├── scripts/
│   └── check-connections.mjs                  # 接続状態確認
└── templates/
    └── drizzle-config-template.ts             # Drizzle設定テンプレート
```

## コマンドリファレンス

### リソース読み取り

```bash
# プールサイジング
cat .claude/skills/connection-pooling/resources/pool-sizing-guide.md

# サーバーレス接続
cat .claude/skills/connection-pooling/resources/serverless-connections.md

# エラーハンドリング
cat .claude/skills/connection-pooling/resources/error-handling.md
```

### スクリプト実行

```bash
# 接続状態確認
node .claude/skills/connection-pooling/scripts/check-connections.mjs
```

## いつ使うか

### シナリオ1: 新規プロジェクトセットアップ
**状況**: 新しいプロジェクトでDB接続を設定する

**適用条件**:
- [ ] データベースサービスが決定済み
- [ ] 想定負荷が見積もられている
- [ ] 実行環境が決まっている

**期待される成果**: 最適な接続プール設定

### シナリオ2: 接続エラーの解決
**状況**: 「too many connections」などのエラーが発生

**適用条件**:
- [ ] エラーの発生パターンが把握できている
- [ ] 現在の設定が確認できる
- [ ] 接続数の監視ができる

**期待される成果**: 安定した接続設定

### シナリオ3: サーバーレス移行
**状況**: サーバーレス環境への移行で接続管理を見直す

**適用条件**:
- [ ] サーバーレスプラットフォームが決定
- [ ] 接続パターンが理解されている
- [ ] プーラー（PgBouncer等）の選択肢がある

**期待される成果**: サーバーレス対応の接続設定

## ワークフロー

### Phase 1: 要件分析

**目的**: 接続要件を明確化する

**ステップ**:
1. **環境の確認**:
   - サーバーレス vs 常駐サーバー
   - Neon / Supabase / Self-hosted
   - ワーカー数・インスタンス数

2. **負荷の見積もり**:
   - 同時リクエスト数
   - クエリの実行時間
   - ピーク時の負荷

**判断基準**:
- [ ] 実行環境が明確か？
- [ ] 負荷の見積もりがあるか？
- [ ] プーラーの選択肢が理解されているか？

**リソース**: `resources/serverless-connections.md`

### Phase 2: プール設計

**目的**: 適切なプールサイズを決定する

**ステップ**:
1. **プールサイズの計算**:
   ```
   推奨接続数 = (コア数 * 2) + 有効スピンドル数
   ```

2. **設定の実装**:
   ```typescript
   const pool = {
     max: 20,           // 最大接続数
     min: 5,            // 最小接続数
     idleTimeout: 30000, // アイドルタイムアウト
   };
   ```

**判断基準**:
- [ ] 接続数がDBの制限内か？
- [ ] タイムアウト設定は適切か？
- [ ] リトライ設定があるか？

**リソース**: `resources/pool-sizing-guide.md`

### Phase 3: エラーハンドリング

**目的**: 接続エラーに対する回復力を確保する

**ステップ**:
1. **リトライ戦略**:
   - 指数バックオフ
   - 最大リトライ回数
   - リトライ可能なエラーの定義

2. **サーキットブレーカー**:
   - 連続失敗時のオープン
   - 回復試行間隔
   - 半開状態の管理

**判断基準**:
- [ ] リトライ戦略が実装されているか？
- [ ] タイムアウトが設定されているか？
- [ ] エラーログが記録されるか？

**リソース**: `resources/error-handling.md`

### Phase 4: 監視

**目的**: 接続状態を継続的に監視する

**ステップ**:
1. **メトリクスの収集**:
   - アクティブ接続数
   - 待機中の接続
   - 接続エラー率

2. **アラート設定**:
   - 接続枯渇の警告
   - エラー率の閾値
   - レイテンシの監視

**判断基準**:
- [ ] 接続数の監視があるか？
- [ ] アラートが設定されているか？
- [ ] ダッシュボードがあるか？

## 核心概念

### 接続プールの基本

```
アプリケーション
    │
    ├── リクエスト1 ──→ [接続1]
    ├── リクエスト2 ──→ [接続2]  ←── 接続プール
    ├── リクエスト3 ──→ [接続3]       (再利用)
    └── リクエスト4 ──→ [待機...]
                           │
                           ▼
                      データベース
```

### プールモード

| モード | 説明 | 用途 |
|--------|------|------|
| Session | 接続をセッション全体で保持 | 長いトランザクション |
| Transaction | トランザクション単位で割り当て | 一般的なWeb |
| Statement | ステートメント単位で割り当て | 高速なクエリ |

### サーバーレス特有の課題

```
Lambda/Edge Function
    │
    ├── コールドスタート → 新規接続
    │                      (オーバーヘッド)
    ├── ウォームスタート → 既存接続再利用
    │                      (高速)
    └── スケールアウト → 接続爆発のリスク
                          (プーラーで制御)
```

## ベストプラクティス

### すべきこと

1. **外部プーラーを使用する**:
   - Neon: 接続プーリング有効化
   - Supabase: PgBouncerを使用
   - Self-hosted: PgBouncer/Pgpool-II

2. **接続を適切にリリースする**:
   ```typescript
   try {
     const result = await db.query(...);
     return result;
   } finally {
     // 接続は自動的にプールに戻る
   }
   ```

3. **タイムアウトを設定する**:
   ```typescript
   const config = {
     connectionTimeout: 5000,    // 接続タイムアウト
     idleTimeout: 30000,         // アイドルタイムアウト
     queryTimeout: 10000,        // クエリタイムアウト
   };
   ```

### 避けるべきこと

1. **接続のリーク**:
   - ❌ 接続を閉じ忘れる
   - ✅ try-finallyで確実にリリース

2. **プールサイズの過大設定**:
   - ❌ max: 100（リソース浪費）
   - ✅ 負荷に応じた適切なサイズ

3. **サーバーレスでの直接接続**:
   - ❌ プーラーなしで直接接続
   - ✅ プーラー経由で接続

## トラブルシューティング

### 問題1: 接続枯渇

**症状**: 「too many connections」エラー

**原因**:
- プールサイズが小さすぎる
- 接続のリーク
- 長いトランザクション

**解決策**:
```sql
-- 現在の接続状況を確認
SELECT state, count(*) FROM pg_stat_activity GROUP BY state;

-- アイドル接続を強制切断
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE state = 'idle' AND query_start < NOW() - INTERVAL '10 minutes';
```

### 問題2: 接続タイムアウト

**症状**: 接続確立がタイムアウト

**原因**:
- ネットワーク遅延
- プール枯渇
- DNSの問題

**解決策**:
```typescript
// タイムアウト設定の調整
const config = {
  connectionTimeout: 10000, // 増やす
  acquireTimeout: 30000,    // 取得タイムアウト
};

// リトライ戦略
const retryConfig = {
  retries: 3,
  factor: 2,
  minTimeout: 1000,
  maxTimeout: 5000,
};
```

### 問題3: コールドスタートの遅延

**症状**: Lambda/Edgeの初回リクエストが遅い

**原因**:
- 新規接続の確立
- DNS解決
- TLSハンドシェイク

**解決策**:
- プーラー経由の接続（Neon Pooler）
- Provisioned Concurrencyの使用
- 接続のウォームアップ

## 関連スキル

- **query-performance-tuning** (`.claude/skills/query-performance-tuning/SKILL.md`): クエリ最適化
- **backup-recovery** (`.claude/skills/backup-recovery/SKILL.md`): バックアップ戦略

## メトリクス

### 接続プール健全性指標

| 指標 | 目標値 | 警告値 |
|------|--------|--------|
| 接続使用率 | < 80% | > 90% |
| 待機リクエスト | 0 | > 10 |
| 接続エラー率 | < 0.1% | > 1% |
| 平均接続時間 | < 100ms | > 500ms |

## 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0.0 | 2025-11-27 | 初版作成 - 接続プール管理 |

## 参考文献

- **Neon Documentation**: https://neon.tech/docs/connect/connection-pooling
- **Supabase Documentation**: https://supabase.com/docs/guides/database/connecting-to-postgres
- **PgBouncer**: https://www.pgbouncer.org/
