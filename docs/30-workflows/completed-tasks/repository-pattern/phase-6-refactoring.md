# Phase 6: リファクタリング - Repository パターン実装

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 6                                 |
| Phase名    | リファクタリング（TDD: Refactor） |
| 前提Phase  | Phase 5（実装）                   |
| 後続Phase  | Phase 7（品質保証）               |
| ステータス | 未実施                            |
| 作成日     | 2026-01-05                        |
| 機能名     | repository-pattern                |
| タスクID   | CONV-04-06                        |

---

## 目的

TDDのRefactorフェーズとして、テストを維持しながらコード品質を改善する。
重複排除、命名改善、構造改善を行い、保守性を高める。

## 背景

TDDのRefactorフェーズでは、機能を変えずにコードを改善する。
テストがあるため、リファクタリングによる回帰バグを防げる。

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。
> 各スキルは `.claude/skills/{{スキル名}}/SKILL.md` を参照してください。

### スキル1: refactoring-patterns

**パス**: `.claude/skills/refactoring-patterns/SKILL.md`

**Trigger条件**:
リファクタリング、コード改善、技術的負債

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を出力

**期待される成果物**:

- `outputs/phase-6/refactoring-log.md` - リファクタリング記録

---

### スキル2: clean-code-practices

**パス**: `.claude/skills/clean-code-practices/SKILL.md`

**Trigger条件**:
命名改善、関数分割、重複排除

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. コード品質チェックを実施
3. 改善点を適用

**期待される成果物**:

- 改善されたRepositoryコード

---

## 参照資料

| 参照資料         | パス                                                       | 内容       |
| ---------------- | ---------------------------------------------------------- | ---------- |
| BaseRepository   | `packages/shared/src/db/repositories/base.repository.ts`   | 現在の実装 |
| FileRepository   | `packages/shared/src/db/repositories/file.repository.ts`   | 現在の実装 |
| ChunkRepository  | `packages/shared/src/db/repositories/chunk.repository.ts`  | 現在の実装 |
| EntityRepository | `packages/shared/src/db/repositories/entity.repository.ts` | 現在の実装 |
| テストコード     | `packages/shared/src/db/repositories/__tests__/`           | テスト     |

---

## 成果物

| 成果物               | パス                                   | 内容                 |
| -------------------- | -------------------------------------- | -------------------- |
| リファクタリング記録 | `outputs/phase-6/refactoring-log.md`   | 改善内容の記録       |
| 改善されたコード     | `packages/shared/src/db/repositories/` | リファクタリング済み |

---

## 完了条件

- [ ] コードの重複が排除されている
- [ ] 命名が明確で一貫している
- [ ] 関数が適切なサイズに分割されている
- [ ] コメントが適切に追加されている
- [ ] リファクタリング後もテストがすべて成功する
- [ ] リファクタリング記録が作成されている
- [ ] 成果物が `outputs/phase-6/` に出力されている
- [ ] `artifacts.json` の Phase 6 が更新されている

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/shared test:run
```

**確認項目**:

- [ ] リファクタリング後もテストが成功することを確認

---

## リファクタリング指針

### チェック項目

| #   | 観点         | チェック項目               |
| --- | ------------ | -------------------------- |
| 1   | DRY原則      | エラーハンドリングの共通化 |
| 2   | 命名         | メソッド名・変数名の明確さ |
| 3   | 関数サイズ   | 1関数20行以内を目安        |
| 4   | 型安全       | any使用箇所の型定義追加    |
| 5   | ドキュメント | JSDocコメントの追加        |

### リファクタリング例

```typescript
// Before: 重複するエラーハンドリング
try { ... } catch (error) { return err(createRAGError(...)); }
try { ... } catch (error) { return err(createRAGError(...)); }

// After: ヘルパーメソッド抽出
protected async executeQuery<T>(
  operation: () => Promise<T>,
  errorMessage: string,
  context: Record<string, unknown> = {},
): Promise<Result<T, RAGError>> {
  try {
    return ok(await operation());
  } catch (error) {
    return err(createRAGError(
      ErrorCodes.DB_QUERY_ERROR,
      errorMessage,
      context,
      error as Error,
    ));
  }
}
```

---

## 依存関係

- **前提**: Phase 5（実装）が完了していること
- **後続**: Phase 7（品質保証）へ進む

---

## スキルフィードバック記録

Phase完了後、以下を記録してください:

```markdown
## Phase 6 実行記録

### 使用スキル

- refactoring-patterns: {{result}}
- clean-code-practices: {{result}}

### TDD状態確認

- テスト総数: {{N}}
- 成功数: {{N}}（すべて成功を維持）

### 実施したリファクタリング

1. {{改善内容1}}
2. {{改善内容2}}
3. {{改善内容3}}

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

`docs/30-workflows/repository-pattern/phase-7-quality-assurance.md`
