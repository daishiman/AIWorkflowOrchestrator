---
description: |
  データベース初期データ投入コマンド（開発・テスト・本番環境対応）。

  環境別シーディング戦略、べき等性、ファクトリパターンに基づき、
  安全かつ再現可能なデータ投入を実行します。

  🤖 起動エージェント:
  - `.claude/agents/dba-mgr.md`: データベース管理専門エージェント（Phase 3で起動）

  📚 利用可能スキル（dba-mgrエージェントが必要時に参照）:
  **必須**: database-seeding（環境別Seeding、べき等性、ファクトリパターン）
  **推奨**: database-migrations（スキーマ確認）、test-data-management（テストデータ生成）

  📖 設計書参照:
  - `docs/00-requirements/master_system_design.md`: 第5.2.3節（workflows テーブル）、第2.4節（テスト戦略）

  ⚙️ このコマンドの設定:
  - argument-hint: オプション引数1つ（環境: development/test/production、未指定時は development）
  - allowed-tools: dba-mgrエージェント起動と実行用
    • Task: dba-mgrエージェント起動用
    • Read: スキーマ・既存Seed確認用
    • Write(src/shared/infrastructure/database/**): Seedファイル生成用（パス制限）
    • Bash(pnpm*, drizzle-kit*, node*): 依存関係・Drizzle Kit・Seed実行用
  - model: sonnet（構造化データ投入タスク）

  トリガーキーワード: seed, seeding, 初期データ, テストデータ, マスターデータ
argument-hint: "[environment]"
allowed-tools:
  - Task
  - Read
  - Write(src/shared/infrastructure/database/**)
  - Bash(pnpm*|drizzle-kit*|node*)
model: sonnet
---

# Database Seeding - データベース初期データ投入

## Purpose（目的）

データベースに環境別の初期データを安全に投入します。
開発環境のテストデータ、本番環境のマスターデータを、べき等性を保ちながら管理します。

## Usage（使用方法）

### 基本実行

```bash
/ai:seed-database
```

デフォルトで development 環境のシードを実行します。

### 環境指定実行

```bash
# 開発環境（リアルなテストデータ生成）
/ai:seed-database development

# テスト環境（フィクスチャデータ）
/ai:seed-database test

# 本番環境（マスターデータのみ、確認プロンプトあり）
/ai:seed-database production
```

## What This Command Does（コマンドの動作）

### Phase 1: コンテキスト理解（dba-mgr起動前）

1. **環境確認**:
   - 引数から環境を取得（未指定時は `development`）
   - 環境の妥当性検証（development/test/production）
   - 本番環境の場合は警告表示

2. **スキーマ確認**:
   ```bash
   # スキーマ定義を確認
   cat src/shared/infrastructure/database/schema.ts

   # マイグレーション履歴を確認
   pnpm drizzle-kit:check
   ```

3. **既存Seed確認**:
   ```bash
   # 既存のSeedファイルをチェック
   ls -la src/shared/infrastructure/database/seed*.ts 2>/dev/null || echo "Seedファイル未作成"
   ```

### Phase 2: エージェント起動と依頼

**`.claude/agents/dba-mgr.md` エージェント起動**:

```
あなたは Database Administrator (DBA) です。

**タスク**: データベースシーディングの設計と実装

**環境**: {environment} 環境（development/test/production）

**要件**:
1. master_system_design.md 第5.2.3節（workflows テーブル）準拠のシードデータ作成
2. 環境別シーディング戦略の適用（`.claude/skills/database-seeding/resources/environment-separation.md` 参照）
3. べき等性の確保（何度実行しても同じ結果）
4. ファクトリパターンによるリアルなテストデータ生成

**実行フェーズ**:
- Phase 1: スキーマ分析（schema.ts確認済み）
- Phase 2: マイグレーション設計（スキップ、Seed実装のみ）
- Phase 3: Seed実装（`.claude/skills/database-seeding/SKILL.md` 参照）
  - 冪等性確保（UPSERT or 削除→挿入）
  - トランザクション管理
  - 環境別データ分離
- Phase 4: 信頼性保証（実行テスト、整合性検証）

**成果物**:
- `src/shared/infrastructure/database/seed.ts`: メインSeedファイル
- `src/shared/infrastructure/database/seeds/`: 環境別Seedディレクトリ（必要時）
- シード実行コマンド（package.json scripts）

**制約**:
- 本番環境（production）の場合は実行前に必ず確認プロンプト
- 個人情報は含めない（Faker等で生成）
- データ量: development（100件程度）、test（最小限）、production（マスターのみ）

**参照スキル**（必要時のみ）:
- `.claude/skills/database-seeding/SKILL.md`: べき等性、環境分離、ファクトリパターン
- `.claude/skills/database-seeding/resources/seed-strategies.md`: シード戦略パターン
- `.claude/skills/database-seeding/resources/data-generation.md`: Fakerによるデータ生成
- `.claude/skills/database-seeding/templates/seed-file-template.ts`: 実装テンプレート
```

### Phase 3: dba-mgr実行フロー（エージェント内部）

**dba-mgr が実行するステップ**:

1. **Phase 1: スキーマ分析**:
   - workflows テーブル構造確認
   - 外部キー依存関係の把握
   - シード順序の決定

2. **Phase 3: Seed実装**:
   - べき等性パターン適用（UPSERT）:
     ```typescript
     await db.insert(workflows)
       .values(seedData)
       .onConflictDoUpdate({
         target: workflows.id,
         set: { status: sql`excluded.status` }
       });
     ```
   - トランザクション管理:
     ```typescript
     await db.transaction(async (tx) => {
       await seedMasterData(tx);
       if (env !== 'production') {
         await seedDevelopmentData(tx);
       }
     });
     ```
   - 環境別データ分離:
     ```typescript
     const env = process.env.NODE_ENV || 'development';
     const seedData = env === 'production'
       ? masterData
       : [...masterData, ...developmentData];
     ```

3. **Phase 4: 信頼性保証**:
   - ローカル実行テスト:
     ```bash
     pnpm tsx src/shared/infrastructure/database/seed.ts
     ```
   - データ整合性検証:
     ```bash
     # workflows テーブルのレコード数確認
     pnpm drizzle-kit studio  # Drizzle Studio起動
     ```

### Phase 4: 完了報告と次のステップ

**完了報告**:
```
✅ データベースシーディング完了

**環境**: {environment}
**成果物**:
- src/shared/infrastructure/database/seed.ts
- package.json scripts追加（seed:dev, seed:test, seed:prod）

**実行結果**:
- workflows テーブル: X件投入
- 冪等性: ✅ 確認済み（再実行可能）
- トランザクション: ✅ エラー時ロールバック

**Next Steps**:
1. ローカルテスト実行:
   pnpm seed:dev  # 開発環境

2. CI/CD統合（推奨）:
   - .github/workflows/ci.yml に seed:test 追加
   - デプロイ後の seed:prod 自動実行検討

3. データ確認:
   pnpm drizzle-kit studio  # Drizzle Studio起動
```

## Arguments（引数）

| 引数 | 説明 | デフォルト | 例 |
|------|------|-----------|-----|
| `environment` | 環境（development/test/production） | `development` | `production` |

## Examples（使用例）

### 例1: 開発環境のテストデータ生成

```bash
/ai:seed-database development
```

**期待される動作**:
- Fakerを使用したリアルなテストデータ生成（100件程度）
- workflows テーブルに多様なステータスのサンプルデータ
- 外部キー整合性を保った関連データ

### 例2: テスト環境のフィクスチャ作成

```bash
/ai:seed-database test
```

**期待される動作**:
- 最小限の再現可能なテストフィクスチャ
- 各ステータス（PENDING, PROCESSING, COMPLETED, FAILED）のサンプルデータ
- ユニットテスト用の既知データセット

### 例3: 本番環境の初期マスターデータ投入

```bash
/ai:seed-database production
```

**期待される動作**:
- **実行前確認プロンプト**: "本番環境にシードを実行します。よろしいですか？ (y/N)"
- マスターデータのみ投入（設定、ロール等）
- 冪等性保証（再実行しても安全）

## Related Commands（関連コマンド）

- `/ai:design-database` - データベーススキーマ設計
- `/ai:create-schema` - Drizzleスキーマ定義作成

## Notes（注意事項）

### ⚠️ 本番環境実行時の注意

本番環境（`production`）で実行する場合:

1. **事前確認**:
   - スキーママイグレーションが完了していること
   - バックアップが取得されていること
   - データ投入内容のレビューが完了していること

2. **実行タイミング**:
   - メンテナンス時間帯を推奨
   - トラフィックの少ない時間帯
   - ロールバック可能な状態を確保

3. **確認ステップ**:
   - Dry-run 実行（オプション）
   - レビュー承認
   - 実行ログの記録

### 💡 ベストプラクティス

1. **べき等性の確保**:
   - UPSERT パターンを使用
   - 何度実行しても同じ結果になること

2. **環境分離**:
   - 本番環境には最小限のデータのみ
   - テストデータは development/test 環境のみ

3. **データ生成**:
   - Faker等のライブラリを活用
   - リアルだが個人情報を含まないデータ

4. **トランザクション管理**:
   - すべてのシードをトランザクション内で実行
   - エラー時は自動ロールバック

## Troubleshooting（トラブルシューティング）

### 問題1: 外部キー違反エラー

**症状**:
```
Error: insert or update on table "workflows" violates foreign key constraint
```

**原因**: シード順序が不正（参照先データが未投入）

**解決策**:
```typescript
// 依存関係順に実行
await db.transaction(async (tx) => {
  await seedRoles(tx);      // 独立テーブル
  await seedUsers(tx);      // rolesに依存
  await seedWorkflows(tx);  // usersに依存
});
```

### 問題2: シード実行が遅い

**症状**: 大量データのシードに時間がかかる

**解決策**:
```typescript
// バッチインサート
const BATCH_SIZE = 1000;
for (let i = 0; i < data.length; i += BATCH_SIZE) {
  const batch = data.slice(i, i + BATCH_SIZE);
  await db.insert(workflows).values(batch);
}
```

### 問題3: 本番環境に誤ってテストデータが投入

**予防策**:
```typescript
// 環境チェックを厳格に
if (process.env.NODE_ENV === 'production') {
  const answer = await prompt('本番環境にシードを実行します。よろしいですか？ (y/N)');
  if (answer !== 'y') {
    throw new Error('本番シード実行がキャンセルされました');
  }
}
```

---

**最終更新**: 2025-11-29
**バージョン**: 1.0.0
**関連エージェント**: `.claude/agents/dba-mgr.md`
**関連スキル**: `.claude/skills/database-seeding/SKILL.md`
