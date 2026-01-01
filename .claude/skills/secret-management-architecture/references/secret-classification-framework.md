# Secret分類フレームワーク

## 分類の3つの軸

Secret管理では、以下の3つの軸で機密情報を分類することで、
適切な管理方式、アクセス制御、Rotation戦略を決定します。

### 軸1: 重要度（Criticality）

### 軸2: スコープ（Scope）

### 軸3: Rotation頻度（Rotation Frequency）

## 軸1: 重要度分類

### Critical（最重要）

**定義**: 漏洩時に即座に重大な被害が発生するSecret

**例**:

- 本番データベース認証情報（フルアクセス）
- 本番APIキー（課金対象、顧客データアクセス）
- 暗号化マスターキー（全データ暗号化に使用）
- OAuth Client Secret（本番、ユーザー認証）
- クラウドプロバイダーRoot認証情報

**管理要件**:

- アクセス: 最小限（Security Admin、本番サービスのみ）
- 保存: 暗号化必須、Hardware Security Module（HSM）推奨
- Rotation: 30日毎または侵害検知時即座
- 監査: すべてのアクセスをリアルタイム記録、異常検知アラート
- バックアップ: 暗号化バックアップ、複数リージョン

**漏洩時の影響**:

- データベース全削除リスク
- 顧客データ漏洩
- 不正課金（クラウド破産）
- システム全体の侵害

### High（重要）

**定義**: 漏洩時に重大な被害が発生するが、即座ではないSecret

**例**:

- ステージング環境データベース認証情報
- サードパーティAPI キー（無料枠、制限あり）
- セッション暗号化キー
- 内部サービス間認証トークン

**管理要件**:

- アクセス: 限定的（DevOps、関連サービス）
- 保存: 暗号化推奨
- Rotation: 90日毎
- 監査: 定期レビュー、異常検知
- バックアップ: 暗号化バックアップ

**漏洩時の影響**:

- ステージング環境の侵害
- API制限超過
- セッションハイジャック

### Medium（中程度）

**定義**: 漏洩時に限定的な被害が発生するSecret

**例**:

- 開発環境データベース認証情報
- 内部API認証トークン（読み取り専用）
- ログ集約サービスキー
- 非本番環境のOAuth Secret

**管理要件**:

- アクセス: 開発者、DevOps
- 保存: 基本的な保護
- Rotation: 180日毎または必要時
- 監査: 定期レビュー
- バックアップ: 標準バックアップ

**漏洩時の影響**:

- 開発環境の侵害
- ログデータの閲覧
- 限定的なサービスアクセス

### Low（低）

**定義**: 漏洩時の影響が最小限のSecret

**例**:

- 非機密設定値（機密情報を含まない）
- 公開情報への参照
- デフォルト設定値

**管理要件**:

- アクセス: 全開発者
- 保存: 最小限の保護
- Rotation: 不要または年1回
- 監査: 基本ログのみ
- バックアップ: 標準バックアップ

**漏洩時の影響**: ほぼなし

## 軸2: スコープ分類

### Global（グローバル）

**定義**: すべてのサービス・環境で共通のSecret

**例**:

- ログ集約サービスエンドポイント
- 共通暗号化アルゴリズム設定
- 全環境共通の外部APIエンドポイント

**特性**:

- 変更時の影響範囲が広い
- 環境間で値が同一
- 変更頻度が低い

**管理方式**: 中央集約、厳格な変更管理

### Environment（環境固有）

**定義**: 環境毎に異なるが、環境内では共通のSecret

**例**:

- DATABASE_URL（dev/staging/prodで異なるDB）
- API_BASE_URL（環境毎のエンドポイント）
- REDIS_URL（環境毎のRedis）
- SENTRY_DSN（環境毎のプロジェクト）

**特性**:

- 環境毎に完全に分離
- 環境内では複数サービスで共有可能
- 環境間のSecret共有は厳禁

**管理方式**: 環境グループ機能、環境変数注入

### Service（サービス専用）

**定義**: 特定サービスのみが使用する専用Secret

**例**:

- DISCORD_WEBHOOK_URL（Discord連携サービス専用）
- STRIPE_SECRET_KEY（決済サービス専用）
- SENDGRID_API_KEY（メールサービス専用）
- GITHUB_PERSONAL_ACCESS_TOKEN（GitHub連携サービス専用）

**特性**:

- 他サービスからアクセス不可
- サービスの責任範囲内で管理
- 高い変更頻度の可能性

**管理方式**: サービススコープ制限、マイクロセグメンテーション

## 軸3: Rotation頻度分類

### 頻繁（30日毎）

**対象Secret**:

- Critical重要度のすべてのSecret
- 外部APIキー（課金対象）
- データベースパスワード（本番）
- OAuth Client Secret

**Rotationプロセス**:

1. 新Secret生成
2. 両方のSecretを並行有効化
3. アプリケーションを新Secretに移行
4. 旧Secretを無効化
5. 監視期間（24時間）
6. 旧Secretを完全削除

**自動化**: 推奨（手動は高リスク）

### 定期（90日毎）

**対象Secret**:

- High重要度のSecret
- 暗号化キー
- セッションSecret
- 内部API認証トークン

**Rotationプロセス**:

- 手動または半自動
- 計画的なメンテナンスウィンドウで実施
- ロールバック手順を事前準備

### 不定期（必要時のみ）

**対象Secret**:

- Medium/Low重要度のSecret
- 開発環境Secret
- 設定値
- 侵害検知時の緊急Rotation

**Rotationトリガー**:

- セキュリティインシデント検知
- 開発者の退職
- サードパーティサービスの侵害報告
- コンプライアンス監査要求

## 分類マトリクス例

| Secret名          | 重要度   | スコープ    | Rotation頻度 | 管理方式          | アクセス権限        |
| ----------------- | -------- | ----------- | ------------ | ----------------- | ------------------- |
| DB_PASSWORD_PROD  | Critical | Environment | 30日         | Vault             | Admin, Prod Service |
| DB_PASSWORD_DEV   | Medium   | Environment | 不定期       | .env              | All Developers      |
| STRIPE_SECRET_KEY | Critical | Service     | 30日         | Railway Secrets   | Payment Service     |
| DISCORD_WEBHOOK   | High     | Service     | 90日         | Railway Secrets   | Discord Service     |
| API_BASE_URL_PROD | Low      | Environment | 不定期       | Railway Variables | All Services        |
| LOG_LEVEL         | Low      | Global      | 不定期       | .env.example      | All                 |

## 分類決定フローチャート

```
Secret評価開始
│
├─ 漏洩時の影響評価 → Critical/High/Medium/Low
│
├─ 使用範囲評価 → Global/Environment/Service
│
├─ 変更頻度評価 → 頻繁/定期/不定期
│
└─ 管理方式決定
   ├─ Critical + Service → クラウドSecrets Manager必須
   ├─ High + Environment → クラウドSecrets Manager推奨
   ├─ Medium + Global → 環境変数ファイル可
   └─ Low → 設定ファイル可
```

## 実装ガイドライン

### ステップ1: Secret棚卸し

プロジェクトで使用するすべてのSecretをリストアップ:

- 名前、用途、現在の保存場所
- 使用しているサービス・環境
- 現在のアクセス権限

### ステップ2: 分類実施

各Secretを3つの軸で分類:

- 重要度（Critical/High/Medium/Low）
- スコープ（Global/Environment/Service）
- Rotation頻度（頻繁/定期/不定期）

### ステップ3: 管理方式決定

分類結果に基づいて最適な管理方式を選択:

- Critical → クラウドSecrets Manager必須
- High → クラウドSecrets Manager推奨
- Medium → 環境変数ファイルまたはSecrets Manager
- Low → 設定ファイル可

### ステップ4: 移行計画策定

現在の管理方式から目標の管理方式への移行計画:

- 優先順位（Critical優先）
- 移行手順
- ロールバック手順
- テスト計画

## チェックリスト

### 分類完了確認

- [ ] すべてのSecretが棚卸しされているか？
- [ ] 各Secretが3つの軸で分類されているか？
- [ ] 分類結果がドキュメント化されているか？
- [ ] チーム全体で分類基準が共有されているか？

### 管理方式確認

- [ ] 重要度に応じた適切な管理方式が選択されているか？
- [ ] コスト・複雑さとセキュリティのバランスが取れているか？
- [ ] 既存インフラとの統合性が確認されているか？
- [ ] 移行計画が策定されているか？
