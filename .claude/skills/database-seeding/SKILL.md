---
name: database-seeding
description: |
    データベースシーディング（初期データ投入）の専門スキル。
    開発環境のセットアップ、テストデータ生成、本番初期データ管理を
    安全かつ効率的に行うための知識を提供します。
    専門分野:
    - 開発シード: 開発環境用のリアルなテストデータ生成
    - テストフィクスチャ: テスト用の再現可能なデータセット
    - 本番初期データ: マスターデータや初期設定の管理
    - データファクトリ: 動的なテストデータ生成パターン
    - 環境分離: 環境ごとのシード戦略
    使用タイミング:
    - 新規プロジェクトの初期データを設計する時
    - 開発環境のテストデータを生成する時
    - テスト用フィクスチャを作成する時
    - 本番デプロイ用の初期データを管理する時
    - データ生成の自動化を構築する時
    Use proactively when designing seed data strategies,
    creating test fixtures, or managing initial production data.

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/database-seeding/resources/data-generation.md`: Fakerを使用したリアルなテストデータ生成テクニック
  - `.claude/skills/database-seeding/resources/environment-separation.md`: 開発・テスト・本番環境の分離戦略と制御方法
  - `.claude/skills/database-seeding/resources/seed-strategies.md`: シード戦略パターンと冪等性の実装手法
  - `.claude/skills/database-seeding/templates/seed-file-template.ts`: 再利用可能なシードファイルの実装テンプレート
  - `.claude/skills/database-seeding/scripts/seed-runner.mjs`: シード実行を自動化するランナースクリプト

version: 1.0.0
---

# Database Seeding

## 概要

このスキルは、データベースの初期データ投入（シーディング）を
安全かつ効率的に行うための知識とパターンを提供します。
開発、テスト、本番の各環境に適したシード戦略を設計できます。

**主要な価値**:

- 開発環境の即座のセットアップ
- 再現可能なテストデータ
- 本番初期データの安全な管理

**対象ユーザー**:

- `@dba-mgr`エージェント
- バックエンド開発者
- QA エンジニア
- DevOps エンジニア

## リソース構造

```
database-seeding/
├── SKILL.md                                    # 本ファイル
├── resources/
│   ├── seed-strategies.md                     # シード戦略パターン
│   ├── data-generation.md                     # データ生成テクニック
│   └── environment-separation.md             # 環境分離の考え方
├── scripts/
│   └── seed-runner.mjs                        # シード実行スクリプト
└── templates/
    └── seed-file-template.ts                  # シードファイルテンプレート
```

## コマンドリファレンス

### リソース読み取り

```bash
# シード戦略
cat .claude/skills/database-seeding/resources/seed-strategies.md

# データ生成テクニック
cat .claude/skills/database-seeding/resources/data-generation.md

# 環境分離
cat .claude/skills/database-seeding/resources/environment-separation.md
```

### スクリプト実行

```bash
# シード実行
node .claude/skills/database-seeding/scripts/seed-runner.mjs
```

## いつ使うか

### シナリオ 1: 新規プロジェクトセットアップ

**状況**: 新しいプロジェクトで初期データ構造を設計する

**適用条件**:

- [ ] データベーススキーマが決定済み
- [ ] 必要なマスターデータが特定されている
- [ ] 開発チームの要件が明確

**期待される成果**: 環境別のシード戦略と実装

### シナリオ 2: テストデータ生成

**状況**: テスト用のリアルなデータセットが必要

**適用条件**:

- [ ] テストシナリオが明確
- [ ] データ量の要件が決まっている
- [ ] 個人情報の扱いが決まっている

**期待される成果**: 再現可能なテストフィクスチャ

### シナリオ 3: 本番データ移行

**状況**: 本番環境の初期データを安全に投入する

**適用条件**:

- [ ] 初期データが確定している
- [ ] 冪等性が担保できる
- [ ] ロールバック手順がある

**期待される成果**: 安全な本番シード手順

## ワークフロー

### Phase 1: シード戦略の設計

**目的**: 環境ごとのシード要件を明確化する

**ステップ**:

1. **データ分類**:
   - マスターデータ（すべての環境で必要）
   - 開発データ（開発環境のみ）
   - テストデータ（テスト環境のみ）

2. **依存関係の整理**:
   - テーブル間の外部キー関係
   - シード実行順序の決定

**判断基準**:

- [ ] データ分類が完了しているか？
- [ ] 依存関係が明確か？
- [ ] 環境ごとの要件が定義されているか？

**リソース**: `resources/seed-strategies.md`

### Phase 2: シードデータの作成

**目的**: 実際のシードデータを生成する

**ステップ**:

1. **マスターデータの定義**:

   ```typescript
   // 固定データ
   const roles = [
     { id: 1, name: "admin", description: "管理者" },
     { id: 2, name: "user", description: "一般ユーザー" },
   ];
   ```

2. **動的データの生成**:

   ```typescript
   // Fakerを使用
   import { faker } from "@faker-js/faker";

   const users = Array.from({ length: 100 }, () => ({
     name: faker.person.fullName(),
     email: faker.internet.email(),
   }));
   ```

**判断基準**:

- [ ] データがリアルか？
- [ ] 個人情報が含まれていないか？
- [ ] データ量は適切か？

**リソース**: `resources/data-generation.md`

### Phase 3: シードの実装

**目的**: 再現可能なシード実行を実装する

**ステップ**:

1. **冪等性の確保**:

   ```typescript
   // upsertを使用
   await db
     .insert(users)
     .values(userData)
     .onConflictDoUpdate({
       target: users.email,
       set: { name: sql`excluded.name` },
     });
   ```

2. **トランザクション管理**:
   ```typescript
   await db.transaction(async (tx) => {
     await seedRoles(tx);
     await seedUsers(tx);
     await seedOrders(tx);
   });
   ```

**判断基準**:

- [ ] 冪等性が確保されているか？
- [ ] エラー時にロールバックされるか？
- [ ] 実行順序が正しいか？

**リソース**: `templates/seed-file-template.ts`

### Phase 4: 環境分離

**目的**: 環境ごとに適切なシードを実行する

**ステップ**:

1. **環境変数による制御**:

   ```typescript
   const env = process.env.NODE_ENV;

   if (env === "production") {
     await seedMasterData();
   } else {
     await seedMasterData();
     await seedDevelopmentData();
   }
   ```

**判断基準**:

- [ ] 環境の判定が正しいか？
- [ ] 本番に開発データが入らないか？
- [ ] 実行前確認があるか？

**リソース**: `resources/environment-separation.md`

## 核心概念

### シードの種類

| 種類           | 説明                 | 環境       | 例                           |
| -------------- | -------------------- | ---------- | ---------------------------- |
| マスターシード | 静的な基本データ     | すべて     | ロール、カテゴリ、設定       |
| 開発シード     | 開発用テストデータ   | 開発のみ   | サンプルユーザー、ダミー注文 |
| テストシード   | テスト用フィクスチャ | テストのみ | 特定シナリオのデータ         |
| 本番シード     | 初期本番データ       | 本番のみ   | 管理者アカウント             |

### シード順序

```
1. 独立テーブル（外部キーなし）
   └─ roles, categories, settings

2. 依存テーブル（レベル1）
   └─ users（rolesに依存）

3. 依存テーブル（レベル2）
   └─ orders（usersに依存）

4. 関連テーブル
   └─ order_items（ordersに依存）
```

### 冪等性パターン

```typescript
// パターン1: UPSERT
await db
  .insert(table)
  .values(data)
  .onConflictDoUpdate({ target: table.id, set: data });

// パターン2: 削除して挿入
await db.delete(table);
await db.insert(table).values(data);

// パターン3: 存在チェック
const exists = await db.select().from(table).where(eq(table.id, id));
if (!exists.length) {
  await db.insert(table).values(data);
}
```

## ベストプラクティス

### すべきこと

1. **冪等性を確保する**:
   - 何度実行しても同じ結果
   - エラーからの再実行が安全

2. **本番と開発を分離する**:
   - 環境変数で明示的に制御
   - 本番シードは最小限に

3. **リアルなデータを生成する**:
   - Faker などのライブラリを活用
   - エッジケースも含める

### 避けるべきこと

1. **本番データの直接コピー**:
   - ❌ 個人情報のリスク
   - ✅ 匿名化または Faker で生成

2. **ハードコードされた ID**:
   - ❌ `id: 1` を参照する
   - ✅ 生成された ID を動的に参照

3. **巨大なシードファイル**:
   - ❌ 1 ファイルに全データ
   - ✅ テーブルごとに分割

## トラブルシューティング

### 問題 1: 外部キー違反

**症状**: シード実行時に外部キーエラー

**原因**:

- シード順序が不正
- 参照先データが存在しない

**解決策**:

```typescript
// 依存関係を考慮した順序
const seedOrder = [
  "roles",
  "users", // rolesに依存
  "orders", // usersに依存
  "order_items", // ordersに依存
];
```

### 問題 2: シードが遅い

**症状**: 大量データのシードに時間がかかる

**原因**:

- 1 行ずつ INSERT
- インデックスの再構築

**解決策**:

```typescript
// バッチインサート
const BATCH_SIZE = 1000;
for (let i = 0; i < data.length; i += BATCH_SIZE) {
  const batch = data.slice(i, i + BATCH_SIZE);
  await db.insert(table).values(batch);
}
```

### 問題 3: データの不整合

**症状**: 関連データ間で矛盾がある

**原因**:

- 個別にデータを生成
- 参照整合性の未考慮

**解決策**:

```typescript
// ファクトリパターンで関連データを一緒に生成
async function createOrderWithItems(userId: number) {
  const order = await createOrder(userId);
  await createOrderItems(order.id, 3);
  return order;
}
```

## 関連スキル

- **database-migrations** (`.claude/skills/database-migrations/SKILL.md`): マイグレーション管理
- **test-data-management** (`.claude/skills/test-data-management/SKILL.md`): テストデータ管理

## メトリクス

### シード品質指標

| 指標           | 目標値           | 警告値   |
| -------------- | ---------------- | -------- |
| シード実行時間 | < 30 秒          | > 2 分   |
| 冪等性         | 100%             | < 100%   |
| カバレッジ     | すべてのテーブル | 欠落あり |
| 依存関係エラー | 0                | > 0      |

## 変更履歴

| バージョン | 日付       | 変更内容                            |
| ---------- | ---------- | ----------------------------------- |
| 1.0.0      | 2025-11-27 | 初版作成 - データベースシーディング |

## 参考文献

- **Faker.js**: https://fakerjs.dev/
- **Drizzle ORM Seeding**: https://orm.drizzle.team/docs/seed-overview
