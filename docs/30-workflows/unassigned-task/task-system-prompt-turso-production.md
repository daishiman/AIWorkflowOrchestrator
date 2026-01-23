# Tursoクラウド同期の本番設定 - タスク実行仕様書

## メタ情報

```yaml
issue_number: 449
```

## メタ情報

| 項目         | 内容                                  |
| ------------ | ------------------------------------- |
| タスクID     | UNASSIGNED-SYSPROMPT-002              |
| タスク名     | Tursoクラウド同期の本番設定           |
| 分類         | インフラ設定                          |
| 対象機能     | データベース - Turso Embedded Replica |
| 優先度       | **高**                                |
| 見積もり規模 | **小規模**                            |
| ステータス   | 未実施                                |
| 発見元       | TASK-CHAT-SYSPROMPT-DB-001 Phase 12   |
| 発見日       | 2026-01-22                            |

---

## 1. なぜこのタスクが必要か（Why）

### 背景

システムプロンプトのDB永続化機能（TASK-CHAT-SYSPROMPT-DB-001）では、Turso Embedded Replicaを使用しています。現在の開発環境では**ローカルSQLiteのみ**で動作しており、**クラウド同期は無効**です。

### 問題点・課題

| 問題               | 影響                             |
| ------------------ | -------------------------------- |
| クラウド同期が無効 | デバイス間のデータ同期ができない |
| バックアップなし   | ローカルデータ消失時に復旧不可   |
| 本番環境設定未完了 | 本番デプロイ時に追加設定が必要   |

### 放置した場合の影響

- ユーザーが複数デバイスで同じテンプレートを使用できない
- デバイス故障時にテンプレートデータが失われる
- Turso Embedded Replicaの価値（オフライン+同期）が半減

---

## 2. 何を達成するか（What）

### 目的

本番環境でTursoクラウド同期を有効化し、デバイス間のデータ同期とクラウドバックアップを実現する。

### 最終ゴール

| ゴール             | 詳細                                     |
| ------------------ | ---------------------------------------- |
| クラウド同期有効化 | ローカルSQLite ⇔ Tursoクラウド自動同期   |
| 環境変数設定       | TURSO_DATABASE_URL, TURSO_AUTH_TOKEN設定 |
| 同期間隔設定       | 適切な同期間隔（例: 5秒）を設定          |
| オフライン対応維持 | オフライン時もローカルSQLiteで動作       |

### スコープ

**含むもの**:

- Tursoアカウント/データベース作成手順
- 環境変数設定
- 同期間隔の設定
- 接続確認テスト

**含まないもの**:

- Turso以外のクラウドDBへの対応
- マルチテナント対応
- 高度な競合解決ロジック

### 成果物一覧

| 種別         | 成果物             | 配置先                              |
| ------------ | ------------------ | ----------------------------------- |
| 設定         | 環境変数定義       | `.env.production`, `.env.example`   |
| ドキュメント | デプロイガイド     | `docs/deployment/turso-setup.md`    |
| テスト       | 接続確認スクリプト | `scripts/check-turso-connection.ts` |

---

## 3. どのように実行するか（How）

### 前提条件

| 条件                       | 状態   |
| -------------------------- | ------ |
| Turso Embedded Replica実装 | ✅完了 |
| オフライン動作実装         | ✅完了 |
| Tursoアカウント            | 要作成 |

### 依存タスク

- なし

### 必要な知識・スキル

| スキル       | レベル |
| ------------ | ------ |
| Turso CLI    | 基礎   |
| 環境変数管理 | 基礎   |
| Drizzle ORM  | 基礎   |

### 推奨アプローチ

1. **Tursoアカウント作成**: turso.tech でアカウント作成
2. **データベース作成**: Turso CLI でデータベース作成
3. **環境変数設定**: 接続情報を環境変数に設定
4. **接続確認**: スクリプトで接続テスト

---

## 4. 実行手順

### Phase構成

| Phase | 内容              | 見積もり |
| ----- | ----------------- | -------- |
| 1     | Tursoセットアップ | 小       |
| 2     | 環境変数設定      | 小       |
| 3     | 接続確認          | 小       |
| 4     | ドキュメント作成  | 小       |

### Phase 1: Tursoセットアップ

**手順**:

```bash
# 1. Turso CLIインストール
brew install tursodatabase/tap/turso

# 2. ログイン
turso auth login

# 3. データベース作成
turso db create aiworkflow-orchestrator

# 4. 認証トークン作成
turso db tokens create aiworkflow-orchestrator

# 5. 接続URL取得
turso db show aiworkflow-orchestrator --url
```

### Phase 2: 環境変数設定

**.env.production**:

```env
# Turso Database
TURSO_DATABASE_URL=libsql://aiworkflow-orchestrator-xxx.turso.io
TURSO_AUTH_TOKEN=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9...

# 同期設定
TURSO_SYNC_INTERVAL_MS=5000
```

**.env.example**:

```env
# Turso Database
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-auth-token

# 同期設定
TURSO_SYNC_INTERVAL_MS=5000
```

### Phase 3: 接続確認

**確認スクリプト**:

```typescript
// scripts/check-turso-connection.ts
import { createClient } from "@libsql/client";

async function checkConnection() {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  });

  try {
    const result = await client.execute("SELECT 1");
    console.log("✅ Turso接続成功");
    return true;
  } catch (error) {
    console.error("❌ Turso接続失敗:", error);
    return false;
  }
}

checkConnection();
```

### Phase 4: ドキュメント作成

**デプロイガイド内容**:

1. Tursoアカウント作成手順
2. データベース作成手順
3. 環境変数設定手順
4. 接続確認手順
5. トラブルシューティング

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] Tursoアカウント作成済み
- [ ] 本番用データベース作成済み
- [ ] 環境変数設定済み
- [ ] ローカル ⇔ クラウド同期が動作する
- [ ] オフライン時もローカルSQLiteで動作する

### 品質要件

- [ ] 接続確認スクリプトがパスする
- [ ] 同期間隔が適切（5秒程度）
- [ ] 認証トークンが安全に管理されている

### ドキュメント要件

- [ ] デプロイガイド作成
- [ ] .env.example更新

---

## 6. 検証方法

### テストケース

| ID   | テストケース              | 期待結果                |
| ---- | ------------------------- | ----------------------- |
| TC01 | オンライン時のデータ作成  | ローカル+クラウドに保存 |
| TC02 | オフライン時のデータ作成  | ローカルのみに保存      |
| TC03 | オフライン→オンライン復帰 | クラウドに自動同期      |
| TC04 | 別デバイスでのデータ確認  | 同じデータが表示される  |

---

## 7. リスクと対策

| リスク            | 影響度 | 対策                          |
| ----------------- | ------ | ----------------------------- |
| 認証トークン漏洩  | 高     | 環境変数で管理、Gitに含めない |
| 同期競合          | 中     | Last-Write-Wins方式           |
| Tursoサービス障害 | 低     | オフラインモードで継続動作    |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント          | URL/パス                                                                      |
| --------------------- | ----------------------------------------------------------------------------- |
| Turso公式ドキュメント | https://docs.turso.tech/                                                      |
| Embedded Replicas     | https://docs.turso.tech/features/embedded-replicas                            |
| 実装ガイド            | `docs/30-workflows/system-prompt-db/outputs/phase-12/implementation-guide.md` |

### 実装済みコード

| ファイル                          | 内容           |
| --------------------------------- | -------------- |
| `packages/shared/src/db/turso.ts` | Turso接続設定  |
| `system-prompt-repository.ts`     | Repository実装 |

---

## 9. 備考

### Turso料金プラン

| プラン  | 読み取り  | 書き込み  | ストレージ | 月額   |
| ------- | --------- | --------- | ---------- | ------ |
| Starter | 1B行/月   | 25M行/月  | 9GB        | 無料   |
| Scaler  | 100B行/月 | 100M行/月 | 24GB       | $29/月 |

※ 個人利用であればStarterプランで十分

---

## 更新履歴

| 日付       | 版  | 変更内容                   | 作成者 |
| ---------- | --- | -------------------------- | ------ |
| 2026-01-22 | 1.0 | 初版作成（Phase 12で検出） | Claude |
