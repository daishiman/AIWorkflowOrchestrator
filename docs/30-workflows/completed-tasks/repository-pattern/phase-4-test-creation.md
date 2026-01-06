# Phase 4: テスト作成 - Repository パターン実装

## メタ情報

| 項目       | 内容                          |
| ---------- | ----------------------------- |
| Phase      | 4                             |
| Phase名    | テスト作成（TDD: Red）        |
| 前提Phase  | Phase 3（設計レビューゲート） |
| 後続Phase  | Phase 5（実装）               |
| ステータス | 未実施                        |
| 作成日     | 2026-01-05                    |
| 機能名     | repository-pattern            |
| タスクID   | CONV-04-06                    |

---

## 目的

TDDのRedフェーズとして、失敗するテストを先に作成する。
Repository各メソッドのユニットテストを設計・実装し、期待される動作を明確化する。

## 背景

TDD（テスト駆動開発）では、実装前にテストを書くことで、
仕様の明確化と高いテストカバレッジを実現する。

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。
> 各スキルは `.claude/skills/{{スキル名}}/SKILL.md` を参照してください。

### スキル1: tdd-principles

**パス**: `.claude/skills/tdd-principles/SKILL.md`

**Trigger条件**:
TDD、Red-Green-Refactor、テスト駆動

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- `outputs/phase-4/test-specification.md` - テスト仕様書
- `packages/shared/src/db/repositories/__tests__/` - テストコード

---

### スキル2: test-doubles

**パス**: `.claude/skills/test-doubles/SKILL.md`

**Trigger条件**:
モック、スタブ、テストダブル

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. DB依存のモック戦略を設計
3. 成果物を下記のパスに出力

**期待される成果物**:

- `outputs/phase-4/mock-strategy.md` - モック戦略

---

## 参照資料

| 参照資料           | パス                                         | 内容           |
| ------------------ | -------------------------------------------- | -------------- |
| 要件定義書         | `outputs/phase-1/requirements-definition.md` | 機能要件       |
| 受け入れ基準       | `outputs/phase-1/acceptance-criteria.md`     | 受け入れ条件   |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md`     | Repository設計 |
| 設計レビュー結果   | `outputs/phase-3/design-review-result.md`    | レビュー結果   |

---

## 成果物

| 成果物       | パス                                             | 内容               |
| ------------ | ------------------------------------------------ | ------------------ |
| テスト仕様書 | `outputs/phase-4/test-specification.md`          | テストケース一覧   |
| モック戦略   | `outputs/phase-4/mock-strategy.md`               | DB依存のモック方針 |
| テストコード | `packages/shared/src/db/repositories/__tests__/` | Vitestテスト       |

---

## 完了条件

- [ ] BaseRepositoryの全メソッドに対するテストケースが定義されている
- [ ] FileRepository固有メソッドのテストケースが定義されている
- [ ] ChunkRepository固有メソッドのテストケースが定義されている
- [ ] EntityRepository固有メソッドのテストケースが定義されている
- [ ] テストがすべて失敗する状態（Red）であることを確認
- [ ] DBモック戦略が決定されている
- [ ] 成果物が `outputs/phase-4/` および `packages/shared/` に出力されている
- [ ] `artifacts.json` の Phase 4 が更新されている

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/shared test:run
```

**確認項目**:

- [ ] テストが失敗することを確認（Red状態）

---

## テスト設計指針

### テストケース構造

```typescript
// packages/shared/src/db/repositories/__tests__/base.repository.test.ts
describe("BaseRepository", () => {
  describe("findById", () => {
    it("should return ok with entity when found", async () => {});
    it("should return ok with null when not found", async () => {});
    it("should return err on database error", async () => {});
  });

  describe("findAll", () => {
    it("should return paginated result", async () => {});
    it("should respect limit and offset", async () => {});
  });

  describe("create", () => {
    it("should return ok with created entity", async () => {});
    it("should return err on constraint violation", async () => {});
  });

  // ... 他のメソッド
});
```

### モック戦略

| 対象     | モック方法                      |
| -------- | ------------------------------- |
| Database | インメモリSQLite または vi.mock |
| テーブル | テスト用データ投入              |
| Result型 | 実際の型を使用                  |

---

## 依存関係

- **前提**: Phase 3（設計レビューゲート）が完了していること
- **後続**: Phase 5（実装）へ進む

---

## スキルフィードバック記録

Phase完了後、以下を記録してください:

```markdown
## Phase 4 実行記録

### 使用スキル

- tdd-principles: {{result}}
- test-doubles: {{result}}

### TDD状態確認

- テスト総数: {{N}}
- 失敗数: {{N}}（すべて失敗 = Red状態OK）

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

`docs/30-workflows/repository-pattern/phase-5-implementation.md`
