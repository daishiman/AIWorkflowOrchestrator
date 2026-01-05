# Phase 5: 実装 - Repository パターン実装

## メタ情報

| 項目       | 内容                        |
| ---------- | --------------------------- |
| Phase      | 5                           |
| Phase名    | 実装（TDD: Green）          |
| 前提Phase  | Phase 4（テスト作成）       |
| 後続Phase  | Phase 6（リファクタリング） |
| ステータス | 未実施                      |
| 作成日     | 2026-01-05                  |
| 機能名     | repository-pattern          |
| タスクID   | CONV-04-06                  |

---

## 目的

TDDのGreenフェーズとして、Phase 4で作成したテストをすべて通す最小限の実装を行う。
BaseRepository、各具象Repository、ファクトリ関数を実装する。

## 背景

TDDのGreenフェーズでは、テストを通すことに集中し、
コードの美しさやリファクタリングは次のフェーズで行う。

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。
> 各スキルは `.claude/skills/{{スキル名}}/SKILL.md` を参照してください。

### スキル1: repository-pattern

**パス**: `.claude/skills/repository-pattern/SKILL.md`

**Trigger条件**:
リポジトリパターン、データアクセス抽象化、CRUD操作

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実装
3. 成果物をプロジェクトディレクトリに出力

**期待される成果物**:

- `packages/shared/src/db/repositories/base.repository.ts`
- `packages/shared/src/db/repositories/file.repository.ts`
- `packages/shared/src/db/repositories/chunk.repository.ts`
- `packages/shared/src/db/repositories/entity.repository.ts`
- `packages/shared/src/db/repositories/index.ts`

---

### スキル2: error-handling-patterns

**パス**: `.claude/skills/error-handling-patterns/SKILL.md`

**Trigger条件**:
エラーハンドリング、Result型、例外処理

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. Result型パターンを適用
3. RAGError作成パターンを実装

**期待される成果物**:

- `outputs/phase-5/implementation-summary.md` - 実装サマリー

---

## 参照資料

| 参照資料           | パス                                                                 | 内容             |
| ------------------ | -------------------------------------------------------------------- | ---------------- |
| 未タスク指示書     | `docs/30-workflows/unassigned-task/task-04-06-repository-pattern.md` | 実装コード例     |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md`                             | Repository設計   |
| 型定義設計         | `outputs/phase-2/type-definitions.md`                                | ジェネリクス設計 |
| テスト仕様書       | `outputs/phase-4/test-specification.md`                              | テストケース     |
| RAG型定義          | `packages/shared/src/types/rag/`                                     | Result、RAGError |
| DBスキーマ         | `packages/shared/src/db/schema/`                                     | テーブル定義     |

---

## 成果物

| 成果物           | パス                                                       | 内容                   |
| ---------------- | ---------------------------------------------------------- | ---------------------- |
| BaseRepository   | `packages/shared/src/db/repositories/base.repository.ts`   | 基底クラス             |
| FileRepository   | `packages/shared/src/db/repositories/file.repository.ts`   | ファイルリポジトリ     |
| ChunkRepository  | `packages/shared/src/db/repositories/chunk.repository.ts`  | チャンクリポジトリ     |
| EntityRepository | `packages/shared/src/db/repositories/entity.repository.ts` | エンティティリポジトリ |
| ファクトリ       | `packages/shared/src/db/repositories/index.ts`             | バレル・ファクトリ     |
| 実装サマリー     | `outputs/phase-5/implementation-summary.md`                | 実装記録               |

---

## 完了条件

- [ ] BaseRepositoryが実装されている（CRUD操作）
- [ ] FileRepositoryが実装されている
- [ ] ChunkRepositoryが実装されている
- [ ] EntityRepositoryが実装されている
- [ ] 全Repositoryが`Result<T, RAGError>`を返す
- [ ] ファクトリ関数`createRepositories`が実装されている
- [ ] ページネーション対応している
- [ ] エラーハンドリングが適切に実装されている
- [ ] Phase 4のテストがすべて成功する（Green状態）
- [ ] 成果物が出力されている
- [ ] `artifacts.json` の Phase 5 が更新されている

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/shared test:run
```

**確認項目**:

- [ ] テストが成功することを確認（Green状態）

---

## 実装指針

### 実装順序

1. `base.repository.ts` - 基底クラス
2. `file.repository.ts` - FileRepository
3. `chunk.repository.ts` - ChunkRepository
4. `entity.repository.ts` - EntityRepository
5. `index.ts` - ファクトリ・バレルエクスポート

### エラーハンドリングパターン

```typescript
try {
  const result = await this.db
    .select()
    .from(this.table)
    .where(eq(this.idColumn, id))
    .limit(1);
  return ok(result[0] ?? null);
} catch (error) {
  return err(
    createRAGError(
      ErrorCodes.DB_QUERY_ERROR,
      `Failed to find by id: ${id}`,
      { id },
      error as Error,
    ),
  );
}
```

---

## 依存関係

- **前提**: Phase 4（テスト作成）が完了していること
- **後続**: Phase 6（リファクタリング）へ進む

---

## スキルフィードバック記録

Phase完了後、以下を記録してください:

```markdown
## Phase 5 実行記録

### 使用スキル

- repository-pattern: {{result}}
- error-handling-patterns: {{result}}

### TDD状態確認

- テスト総数: {{N}}
- 成功数: {{N}}（すべて成功 = Green状態OK）

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/repository-pattern/phase-6-refactoring.md`
