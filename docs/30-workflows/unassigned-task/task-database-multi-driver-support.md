# データベースマルチドライバ対応 - タスク指示書

## メタ情報

```yaml
issue_number: 410
```

## メタ情報

| 項目         | 内容                                         |
| ------------ | -------------------------------------------- |
| タスクID     | UT-DB-001                                    |
| タスク名     | データベースマルチドライバ対応               |
| 分類         | 改善                                         |
| 対象機能     | データベース層                               |
| 優先度       | 低                                           |
| 見積もり規模 | 大規模                                       |
| ステータス   | 未実施                                       |
| 発見元       | Phase 12（ドキュメント更新）- 既知の制限事項 |
| 発見日       | 2026-01-22                                   |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

現在のDrizzle Repository実装はSQLite（better-sqlite3）専用で設計されている。これは以下の要因による：

- デスクトップアプリケーションでの軽量DBの必要性
- 開発初期の迅速な実装
- 同期ドライバによるシンプルな実装

将来的にPostgreSQLやMySQL等への対応が必要になる可能性がある（サーバーサイドデプロイ、クラウド移行等）。

### 1.2 問題点・課題

| 問題点             | 詳細                                         |
| ------------------ | -------------------------------------------- |
| ベンダーロックイン | SQLite専用のため他DBへの移行が困難           |
| スケーラビリティ   | SQLiteは単一ファイルのため大規模データに制限 |
| 同時接続           | SQLiteの書き込みロック制限                   |
| クラウド対応       | マネージドDBサービスが使用不可               |

### 1.3 放置した場合の影響

- **現状影響なし**: デスクトップアプリケーションとしてはSQLiteで十分
- **将来的リスク**: サーバーサイド展開やクラウド移行時に大規模リファクタリング必要
- **運用制限**: マルチユーザー環境での同時アクセスに制限

---

## 2. 何を達成するか（What）

### 2.1 目的

Drizzle Repository実装をマルチDBドライバ対応に拡張し、SQLite以外のデータベース（PostgreSQL等）でも動作可能にする。

### 2.2 最終ゴール

- 設定でDBドライバを切り替え可能
- SQLite/PostgreSQL/MySQLで同一コードが動作
- ドライバ固有機能の抽象化

### 2.3 スコープ

#### 含むもの

- DBドライバ抽象化レイヤー設計
- PostgreSQLドライバ対応
- 設定ファイルによるドライバ切り替え
- マイグレーションのマルチDB対応
- 統合テスト環境構築

#### 含まないもの

- MySQL/MariaDB対応（Phase 2として別途）
- クラウドDB固有機能（リードレプリカ等）
- ORMの変更（Drizzle以外への移行）

### 2.4 成果物

| 成果物             | パス                                            |
| ------------------ | ----------------------------------------------- |
| DB抽象化レイヤー   | `packages/shared/src/db/drivers/`               |
| PostgreSQLスキーマ | `packages/shared/src/db/schema/postgresql/`     |
| 設定モジュール     | `packages/shared/src/db/config.ts`              |
| マイグレーション   | `packages/shared/src/db/migrations/postgresql/` |
| 設計ドキュメント   | `outputs/phase-2/multi-driver-design.md`        |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- Drizzle Repository実装が完了していること（完了済み）
- Clean Architecture準拠であること（完了済み）
- PostgreSQLテスト環境が利用可能

### 3.2 依存タスク

- なし（独立して実行可能、ただしFTS5タスクとの調整が必要）

### 3.3 必要な知識

- Drizzle ORM（複数ドライバ対応）
- PostgreSQL（基本構文、型システム）
- TypeScript（ジェネリクス、条件型）
- Docker（テスト環境構築）

### 3.4 推奨アプローチ

1. **Strategy Pattern**: ドライバごとにStrategy実装
2. **Abstract Factory**: ドライバ生成の抽象化
3. **Configuration-based**: 環境変数/設定ファイルで切り替え
4. **Feature Toggle**: 段階的なロールアウト

---

## 4. 実行手順

### Phase構成

このタスクは大規模のため、標準フェーズ構成（13 Phase）で実行する。

### Phase 1: 要件定義

#### 目的

マルチドライバ対応の詳細要件を定義

#### 手順

1. 対応DBドライバの優先順位決定
2. SQLite固有機能の洗い出し
3. PostgreSQL固有機能の調査
4. 互換性要件の定義

#### 成果物

- 要件定義書

#### 完了条件

- [ ] 対応ドライバ優先順位が確定
- [ ] 互換性要件が定義されている

### Phase 2: 設計

#### 目的

ドライバ抽象化アーキテクチャの設計

#### 手順

1. 抽象化レイヤーのインターフェース設計
2. ドライバファクトリパターン設計
3. 設定管理方式設計
4. マイグレーション戦略設計

#### 成果物

- 設計書

#### 完了条件

- [ ] インターフェースが定義されている
- [ ] 設定方式が決定している

### Phase 3-12: 実装・テスト・品質保証

標準13 Phaseフレームワークに従い実行。

### Phase 13: PR作成

#### 完了条件

- [ ] 全テストパス
- [ ] PostgreSQL環境で動作確認済み
- [ ] ドキュメント更新完了

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] SQLiteドライバで既存機能が動作
- [ ] PostgreSQLドライバで全機能が動作
- [ ] 設定でドライバ切り替え可能
- [ ] マイグレーションが両DBで動作

### 品質要件

- [ ] テストカバレッジ80%以上
- [ ] 型エラー0件
- [ ] Lintエラー0件
- [ ] PostgreSQLでのE2Eテストパス

### ドキュメント要件

- [ ] マルチドライバ設計書が作成されている
- [ ] システム仕様書が更新されている
- [ ] 設定ガイドがある
- [ ] マイグレーションガイドがある

---

## 6. 検証方法

### テストケース

| TC-ID  | テスト内容       | 期待結果           |
| ------ | ---------------- | ------------------ |
| TC-001 | SQLiteでCRUD     | 既存動作維持       |
| TC-002 | PostgreSQLでCRUD | 同等動作           |
| TC-003 | ドライバ切り替え | 設定で切り替え可能 |
| TC-004 | マイグレーション | 両DBで成功         |
| TC-005 | トランザクション | 両DBで動作         |

### 検証手順

1. SQLite環境でのリグレッションテスト
2. PostgreSQL Docker環境構築
3. PostgreSQL環境での統合テスト
4. パフォーマンス比較

---

## 7. リスクと対策

| リスク                 | 影響度 | 発生確率 | 対策                       |
| ---------------------- | ------ | -------- | -------------------------- |
| SQLite固有機能の非互換 | 高     | 中       | 事前調査、代替実装         |
| マイグレーション複雑化 | 中     | 高       | DB固有マイグレーション管理 |
| パフォーマンス差異     | 中     | 中       | ベンチマーク、最適化       |
| テスト環境構築コスト   | 中     | 低       | Docker Compose活用         |
| 既存コードへの影響     | 高     | 中       | 段階的移行、Feature Toggle |

---

## 8. 参照情報

### 関連ドキュメント

| 資料                   | パス                                                                             |
| ---------------------- | -------------------------------------------------------------------------------- |
| アーキテクチャ仕様     | `.claude/skills/aiworkflow-requirements/references/architecture-chat-history.md` |
| データベース仕様       | `.claude/skills/aiworkflow-requirements/references/database-architecture.md`     |
| アーキテクチャパターン | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md`     |

### 参考資料

- Drizzle ORM Documentation: Multiple Database Support
- PostgreSQL vs SQLite Comparison
- Strategy Pattern in TypeScript
- Docker Compose for PostgreSQL

---

## 9. 備考

### 現状の制限事項

```typescript
// 現在のDrizzle DB型定義（SQLite専用）
type DrizzleDB = BetterSQLite3Database<{
  chatSessions: typeof chatSessions;
  chatSessionsRelations: typeof chatSessionsRelations;
}>;
```

この型定義をジェネリック化して複数ドライバに対応する必要がある。

### 補足事項

- このタスクは優先度「低」かつ大規模のため、具体的な要件が発生した際に着手
- 現状のデスクトップアプリケーションではSQLiteで十分
- サーバーサイド展開やマルチユーザー対応が必要になった場合に検討
- FTS5タスク（UT-CHAT-HIST-002）との調整が必要（PostgreSQLは別のFTS機能を持つ）

### 優先順位

1. PostgreSQL（最優先）: クラウド対応の標準DB
2. MySQL/MariaDB（次点）: 既存インフラとの互換
3. libsql（将来）: Tursoによるエッジ対応
