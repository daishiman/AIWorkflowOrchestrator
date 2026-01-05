# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                       |
| ---------- | -------------------------- |
| Phase      | 4                          |
| Phase名    | テスト作成 (TDD: Red)      |
| 前提Phase  | Phase 3                    |
| 後続Phase  | Phase 5                    |
| ステータス | 未実施                     |
| 作成日     | 2026-01-04                 |
| 機能名     | Knowledge Graph テーブル群 |

---

## 目的

TDDのRed段階として、実装前に失敗するテストを作成する。

## 背景

テスト駆動開発（TDD）に従い、実装コードより先にテストを作成することで:

1. 要件の明確化
2. 設計の検証
3. 回帰テストの基盤確立

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。

### スキル1: tdd-red-green-refactor

**パス**: `.claude/skills/tdd-red-green-refactor/SKILL.md`

**Trigger条件**: TDDでテストを作成する場合

**実行方法**:

1. SKILL.mdを開く
2. 「Red Phase」セクションに従って実行
3. 失敗するテストケースを作成

**期待される成果物**:

- 各テーブルのスキーマテスト
- CRUD操作のテスト
- リレーションのテスト
- インデックス動作のテスト

---

## 参照資料

| 参照資料       | パス               | 内容         |
| -------------- | ------------------ | ------------ |
| Phase 2 成果物 | `outputs/phase-2/` | 設計書       |
| Phase 3 成果物 | `outputs/phase-3/` | レビュー結果 |

---

## 成果物

| 成果物       | パス                                    | 内容             |
| ------------ | --------------------------------------- | ---------------- |
| テスト仕様書 | `outputs/phase-4/test-specification.md` | テスト戦略と範囲 |
| テストケース | `outputs/phase-4/test-cases.md`         | テストケース一覧 |

### コード成果物（プロジェクト配置）

| 成果物             | パス                                                                    |
| ------------------ | ----------------------------------------------------------------------- |
| entitiesテスト     | `packages/shared/src/db/schema/graph/__tests__/entities.test.ts`        |
| relationsテスト    | `packages/shared/src/db/schema/graph/__tests__/relations.test.ts`       |
| communitiesテスト  | `packages/shared/src/db/schema/graph/__tests__/communities.test.ts`     |
| 中間テーブルテスト | `packages/shared/src/db/schema/graph/__tests__/junction-tables.test.ts` |
| リレーションテスト | `packages/shared/src/db/schema/graph/__tests__/graph-relations.test.ts` |

---

## テスト対象

### 1. スキーマ定義テスト

各テーブルが正しく定義されていることを確認:

```typescript
describe("entities table", () => {
  it("should have required columns", () => {
    // テストコード
  });

  it("should have correct indexes", () => {
    // テストコード
  });

  it("should enforce unique constraint on normalizedName + type", () => {
    // テストコード
  });
});
```

### 2. CRUD操作テスト

```typescript
describe("entities CRUD", () => {
  it("should insert a new entity", async () => {
    // テストコード
  });

  it("should select entity by id", async () => {
    // テストコード
  });

  it("should update entity", async () => {
    // テストコード
  });

  it("should delete entity and cascade to relations", async () => {
    // テストコード
  });
});
```

### 3. リレーションテスト

```typescript
describe("graph relations", () => {
  it("should load entity with relations", async () => {
    // テストコード
  });

  it("should load relation with evidence", async () => {
    // テストコード
  });

  it("should load community with members", async () => {
    // テストコード
  });
});
```

---

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/shared test:run -- --grep "graph"
```

**確認項目**:

- [ ] テストが失敗することを確認（Red状態）
- [ ] 全テストケースが意図した理由で失敗している
- [ ] テストケースが要件をカバーしている

---

## 完了条件

- [ ] 全テーブルのスキーマテストが作成されている
- [ ] CRUD操作のテストが作成されている
- [ ] リレーションのテストが作成されている
- [ ] テストが失敗することを確認している（Red状態）
- [ ] テストコードがプロジェクトの適切な場所に配置されている

---

## 依存関係

- **前提**: Phase 3 が完了していること
- **後続**: Phase 5（実装）へ進む

---

## スキルフィードバック記録（Phase完了後に記入）

```markdown
## Phase 4 実行記録

### 使用スキル

- tdd-red-green-refactor: (結果を記入)

### テスト結果

- テストケース数: (件数)
- 失敗数: (件数)
- Red状態確認: OK/NG

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

`docs/30-workflows/conv-04-05-knowledge-graph-tables/phase-5-implementation.md`
