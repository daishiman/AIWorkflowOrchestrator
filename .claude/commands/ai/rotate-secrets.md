---
description: |
  APIキーやシークレットを安全にローテーション（更新）し、
  古いシークレットの無効化と新しいシークレットの設定を支援します。

  🤖 起動エージェント:
  - Phase 1-3: `.claude/agents/secret-mgr.md` - 機密情報ローテーション専門

  📚 利用可能スキル（secret-mgrエージェントが参照）:
  - `.claude/skills/encryption-key-lifecycle/SKILL.md` - 鍵生成・保管・Rotation・廃棄
  - `.claude/skills/zero-trust-security/SKILL.md` - JITアクセス、継続的検証
  - `.claude/skills/environment-isolation/SKILL.md` - 環境分離、クロスアカウント制御
  - `.claude/skills/railway-secrets-management/SKILL.md` - Railway Secrets更新
  - `.claude/skills/github-actions-security/SKILL.md` - GitHub Secrets更新
  - `.claude/skills/project-architecture-integration/SKILL.md` - 依存関係分析

  ⚙️ このコマンドの設定:
  - argument-hint: "[secret-name]"（ローテーション対象: DATABASE_URL, API_KEY等）
  - allowed-tools: シークレットローテーション用
    • Read: 使用箇所特定、依存サービス確認用
    • Write: 更新スクリプト、手順書生成用
    • Bash: 検証スクリプト実行用
  - model: sonnet（標準的なローテーションタスク）
  - disable-model-invocation: true（手動確認必須）

  📋 成果物:
  - ローテーション計画書
  - 更新スクリプト（手動実行用）
  - ロールバック手順

  ⚠️ 重要: disable-model-invocation: true により、AIによる自動実行は行われません。
  生成されるスクリプトを手動で確認・実行してください。

  トリガーキーワード: secret rotation, キーローテーション, パスワード変更, API key rotation, 鍵更新
argument-hint: "[secret-name]"
allowed-tools:
  - Read
  - Write
  - Bash
model: sonnet
disable-model-invocation: true
---

# /ai:rotate-secrets - APIキー・シークレットのローテーション

**目的**: APIキー、データベースパスワード、JWT シークレット等の機密情報を安全にローテーション（更新）し、古いシークレットの無効化と新しいシークレットの設定を段階的に支援します。

**トリガーキーワード**: secret rotation, キーローテーション, パスワード変更, API key rotation, シークレット更新, credentials rotation, 鍵更新

---

## 📋 引数仕様

- **$1 (secret-name)**: ローテーション対象のシークレット名
  - 例: `DATABASE_URL`, `API_SECRET_KEY`, `JWT_SECRET`, `GITHUB_CLIENT_SECRET`
  - 必須: 対象を明示することで誤操作を防止

**使用例**:
```bash
/ai:rotate-secrets DATABASE_URL
/ai:rotate-secrets API_SECRET_KEY
/ai:rotate-secrets JWT_SECRET
/ai:rotate-secrets STRIPE_SECRET_KEY
```

---

## ⚠️ 重要な注意事項

**このコマンドは `disable-model-invocation: true` に設定されています**

- **手動実行が必須**: AIによる自動実行は行われません
- **理由**: シークレットローテーションは機密性が高く、誤操作のリスクがあるため
- **実行方法**: コマンド実行後に生成されるスクリプトを手動で確認・実行してください

---

## 🎯 実行フロー（3フェーズ構造）

### Phase 1: 準備・影響範囲分析

**エージェント起動**:
```
`.claude/agents/secret-mgr.md` を起動し、以下を依頼:
- 対象シークレット: $1
- 対象シークレットの使用箇所特定
- 依存サービスの確認
- ローテーション計画の作成
- ダウンタイム影響の評価
```

**スキル参照** (Phase 1):
- `.claude/skills/tool-permission-management/SKILL.md`: シークレット権限管理
- `.claude/skills/best-practices-curation/SKILL.md`: ローテーションベストプラクティス
- `.claude/skills/project-architecture-integration/SKILL.md`: 依存関係分析

**分析内容**:
```
【使用箇所の特定】
- コード内での参照箇所
- 設定ファイル
- CI/CD環境変数
- 本番環境設定
- バックアップ・復旧手順

【影響範囲の評価】
- サービスダウンタイムの有無
- ダウンタイムの許容時間
- ロールバック手順
- 依存する外部サービス
```

**期待成果物**:
- 影響範囲分析レポート
- ローテーション計画
- ロールバック手順

---

### Phase 2: ローテーションスクリプト生成

**エージェント起動**:
```
`.claude/agents/secret-mgr.md` を起動し、以下を依頼:
- ローテーションスクリプトの生成
- 検証スクリプトの生成
- ロールバックスクリプトの生成
- チェックリストの作成
```

**スキル参照** (Phase 2):
- `.claude/skills/tool-permission-management/SKILL.md`: 安全なシークレット管理
- `.claude/skills/best-practices-curation/SKILL.md`: ローテーション手順

**生成スクリプト**:
```bash
# scripts/rotate-secret-<secret-name>.sh
#!/bin/bash
# シークレットローテーションスクリプト: <secret-name>
# 生成日時: YYYY-MM-DD HH:MM:SS

# Phase 1: 新しいシークレット生成
echo "Phase 1: 新しいシークレットを生成しています..."
# (安全な乱数生成コマンド)

# Phase 2: 設定ファイルの更新
echo "Phase 2: 設定ファイルを更新しています..."
# (環境変数ファイルの更新)

# Phase 3: サービスの再起動
echo "Phase 3: サービスを再起動しています..."
# (アプリケーション再起動コマンド)

# Phase 4: 検証
echo "Phase 4: 新しいシークレットを検証しています..."
# (ヘルスチェックコマンド)

# Phase 5: 古いシークレットの無効化
echo "Phase 5: 古いシークレットを無効化しています..."
# (外部サービスでの無効化手順)
```

**期待成果物**:
- `scripts/rotate-secret-<secret-name>.sh`: ローテーションスクリプト
- `scripts/verify-secret-<secret-name>.sh`: 検証スクリプト
- `scripts/rollback-secret-<secret-name>.sh`: ロールバックスクリプト

---

### Phase 3: 実行ガイド生成

**エージェント起動**:
```
`.claude/agents/secret-mgr.md` を起動し、以下を依頼:
- 実行手順書の作成
- チェックリストの生成
- トラブルシューティングガイドの作成
- 実行後の検証項目リスト
```

**スキル参照** (Phase 3):
- `.claude/skills/best-practices-curation/SKILL.md`: 運用ベストプラクティス

**成果物**:
- `docs/security/rotation-guide-<secret-name>.md`: 実行ガイド
  - **事前準備チェックリスト**
  - **ローテーション手順（ステップバイステップ）**
  - **検証手順**
  - **ロールバック手順**
  - **トラブルシューティング**
  - **実行後の確認事項**

---

## 📝 実行手順書の例

```markdown
# DATABASE_URL ローテーション実行ガイド

## 事前準備チェックリスト

- [ ] データベースのバックアップ取得完了
- [ ] メンテナンス時間の確保（推定: 15分）
- [ ] ロールバック手順の確認完了
- [ ] 関係者への通知完了

## ローテーション手順

### Step 1: 新しいパスワード生成
```bash
# 安全なランダムパスワードを生成
openssl rand -base64 32
```

### Step 2: データベースパスワード更新
```sql
ALTER USER myuser WITH PASSWORD 'new-password';
```

### Step 3: 環境変数の更新
```bash
# .env.production を編集
DATABASE_URL=postgresql://myuser:new-password@localhost:5432/mydb
```

### Step 4: アプリケーション再起動
```bash
pm2 restart app
```

### Step 5: 接続確認
```bash
./scripts/verify-secret-DATABASE_URL.sh
```

## 検証手順

- [ ] データベース接続成功
- [ ] アプリケーションが正常動作
- [ ] エラーログに異常なし
- [ ] ヘルスチェック成功

## ロールバック手順

問題が発生した場合:
```bash
./scripts/rollback-secret-DATABASE_URL.sh
```
```

---

## 🔍 実行前の確認事項

**必ず以下を確認してから実行してください**:

- [ ] バックアップが取得されている
- [ ] ローテーション計画を確認した
- [ ] メンテナンス時間が確保されている
- [ ] ロールバック手順を理解している
- [ ] 関係者に通知済み
- [ ] 生成されたスクリプトの内容を確認した

---

## 🔒 セキュリティ考慮事項

### ローテーション後の処理
1. **古いシークレットの無効化**: 新しいシークレットが動作確認できたら即座に無効化
2. **アクセスログの確認**: 不正アクセスの痕跡がないか確認
3. **ローテーション履歴の記録**: いつ、誰が、何をローテーションしたか記録
4. **CI/CD環境の更新**: 本番環境だけでなくCI/CD環境も忘れずに更新

### 緊急ローテーションが必要な場合
- シークレットが漏洩した可能性がある
- 不正アクセスを検出した
- 定期ローテーション期限（90日）を超えた
- 退職者がシークレットにアクセスできる状態

---

## 📊 シークレット別のローテーション頻度

| シークレットタイプ | 推奨頻度 | 重要度 |
|------------------|---------|-------|
| データベースパスワード | 90日 | Critical |
| API Secret Key | 180日 | High |
| JWT Secret | 180日 | High |
| OAuth Client Secret | 180日 | High |
| 外部API Key | プロバイダー推奨に従う | Medium |
| 暗号化キー | 365日 | Critical |

---

## 📚 関連コマンド

- `/ai:manage-secrets` - シークレット管理の初期セットアップ
- `/ai:security-audit` - セキュリティ監査（シークレット漏洩検出）
- `/ai:setup-auth` - 認証システム実装

---

## 🎓 参考資料

**エージェント仕様**:
- `.claude/agents/secret-mgr.md`: シークレット管理エージェント

**スキル仕様**:
- `.claude/skills/tool-permission-management/SKILL.md`: 権限管理
- `.claude/skills/best-practices-curation/SKILL.md`: セキュリティベストプラクティス

---

## 🚨 トラブルシューティング

### 問題: ローテーション後にアプリケーションが起動しない
**解決策**: ロールバックスクリプトを実行
```bash
./scripts/rollback-secret-<secret-name>.sh
```

### 問題: データベース接続エラー
**解決策**:
1. DATABASE_URL の形式を確認
2. ユーザー権限を確認
3. ネットワーク接続を確認

### 問題: CI/CDパイプラインが失敗
**解決策**: CI/CD環境の環境変数を更新し忘れていないか確認
