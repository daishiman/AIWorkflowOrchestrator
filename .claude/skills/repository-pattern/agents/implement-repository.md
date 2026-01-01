# Task仕様書：Repository実装作成

## 1. メタ情報

| 項目     | 内容                      |
| -------- | ------------------------- |
| 名前     | Repository Implementation |
| 専門領域 | データアクセス層実装      |

> 注記: 実装パターンに基づいた具体的なコード生成を行う。

---

## 2. プロフィール

### 2.1 背景

Repositoryパターンの実装は、インターフェース仕様に基づき、具体的なデータアクセス技術（SQL, ORM, NoSQL等）を使用してデータ永続化を実現する。

### 2.2 目的

Repositoryインターフェースに基づいた実装クラスを作成する。

### 2.3 責務

| 責務                   | 成果物               |
| ---------------------- | -------------------- |
| インターフェース実装   | 実装クラス           |
| エンティティマッピング | DB型↔ドメイン型変換  |
| クエリロジック実装     | SQL/ORMクエリ        |
| トランザクション管理   | トランザクション境界 |
| エラーハンドリング     | ドメイン例外への変換 |

---

## 3. 知識ベース

### 3.1 参考文献

| 書籍/ドキュメント                                       | 適用方法                     |
| ------------------------------------------------------- | ---------------------------- |
| Patterns of Enterprise Application Architecture (PoEAA) | Repository実装パターン       |
| Clean Architecture (Martin)                             | 依存性逆転原則に基づいた実装 |

> 実装パターン詳細は `references/implementation-patterns.md` を参照
> マッピング戦略は `references/entity-mapping.md` を参照

---

## 4. 実行仕様

### 4.1 思考プロセス

| ステップ | アクション                               |
| -------- | ---------------------------------------- |
| 1        | Repositoryインターフェースの確認         |
| 2        | 使用するデータアクセス技術の選択         |
| 3        | エンティティマッピング戦略の決定         |
| 4        | 各メソッドのクエリロジック実装           |
| 5        | DB型からドメイン型への変換実装           |
| 6        | エラーハンドリングとドメイン例外への変換 |
| 7        | 依存性注入対応の実装                     |
| 8        | テンプレート形式で出力                   |

### 4.2 チェックリスト

| 項目                   | 基準                                         |
| ---------------------- | -------------------------------------------- |
| インターフェース準拠   | すべてのメソッドが実装されている             |
| エンティティマッピング | DB型とドメイン型の変換が正しく実装されている |
| エラー変換             | DB例外がドメイン例外に変換されている         |
| 依存性注入             | DBアクセスが注入可能になっている             |
| テスト可能性           | モック化・スタブ化が可能                     |
| トランザクション       | 適切なトランザクション境界が設定されている   |

### 4.3 ビジネスルール（制約）

| 制約                 | 説明                                           |
| -------------------- | ---------------------------------------------- |
| インターフェース実装 | Repositoryインターフェースを完全に実装する     |
| マッピング分離       | マッピングロジックを専用関数/クラスに分離する  |
| ドメイン例外         | DB例外を直接スローせず、ドメイン例外に変換する |
| 依存性注入           | DB接続はコンストラクタまたはメソッドで注入する |
| テスト容易性         | 実装がモック化可能な構造になっている           |

---

## 5. インターフェース

### 5.1 入力

| データ名                       | 提供元                | 検証ルール                       | 欠損時処理                 |
| ------------------------------ | --------------------- | -------------------------------- | -------------------------- |
| Repositoryインターフェース定義 | design-interface      | インターフェースが定義されている | design-interfaceに差し戻し |
| データアクセス技術指定         | ユーザー              | 使用技術が明確（SQL, ORM等）     | プロジェクト標準を確認     |
| エンティティマッピング戦略     | design-entity-mapping | マッピング方針が決定されている   | マッピング戦略の決定を依頼 |

### 5.2 出力

| 成果物名             | 受領先                         | 内容       |
| -------------------- | ------------------------------ | ---------- |
| Repository実装クラス | improve-testability / ユーザー | 実装コード |

#### 出力テンプレート (TypeScript + Drizzle ORM)

```typescript
import { db } from './db';
import { {{tableName}} } from './schema';
import { eq } from 'drizzle-orm';
import { {{EntityName}}Repository } from './{{entityName}}.repository.interface';
import { {{EntityName}} } from '../domain/{{entityName}}';

export class {{EntityName}}RepositoryImpl implements {{EntityName}}Repository {
  constructor(private readonly database = db) {}

  async save(entity: {{EntityName}}): Promise<{{EntityName}}> {
    try {
      const dbEntity = this.toDbEntity(entity);
      const [result] = await this.database
        .insert({{tableName}})
        .values(dbEntity)
        .returning();

      return this.toDomainEntity(result);
    } catch (error) {
      throw new RepositoryError(`Failed to save {{entityName}}`, error);
    }
  }

  async findById(id: string): Promise<{{EntityName}} | null> {
    try {
      const result = await this.database
        .select()
        .from({{tableName}})
        .where(eq({{tableName}}.id, id))
        .limit(1);

      return result[0] ? this.toDomainEntity(result[0]) : null;
    } catch (error) {
      throw new RepositoryError(`Failed to find {{entityName}} by id`, error);
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.database
        .delete({{tableName}})
        .where(eq({{tableName}}.id, id));
    } catch (error) {
      throw new RepositoryError(`Failed to remove {{entityName}}`, error);
    }
  }

  // Entity Mapping
  private toDomainEntity(dbEntity: typeof {{tableName}}.$inferSelect): {{EntityName}} {
    // DB型 → ドメイン型変換
    return new {{EntityName}}({
      // マッピングロジック
    });
  }

  private toDbEntity(entity: {{EntityName}}): typeof {{tableName}}.$inferInsert {
    // ドメイン型 → DB型変換
    return {
      // マッピングロジック
    };
  }
}
```

---

## 関連リソース

- **実装パターン**: See [references/implementation-patterns.md](../references/implementation-patterns.md)
- **エンティティマッピング**: See [references/entity-mapping.md](../references/entity-mapping.md)
- **Level 2実務**: See [references/Level2_intermediate.md](../references/Level2_intermediate.md)
