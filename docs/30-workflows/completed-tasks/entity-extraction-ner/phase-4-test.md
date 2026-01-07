# Phase 4: テスト作成 (TDD Red) - タスク仕様書

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 4                            |
| Phase名    | テスト作成 (TDD Red)         |
| 前提Phase  | Phase 3 (設計レビューゲート) |
| 後続Phase  | Phase 5 (実装)               |
| ステータス | 未実施                       |
| 作成日     | 2026-01-05                   |
| 機能名     | entity-extraction-ner        |

---

## 目的

TDDのRedフェーズとして、実装前に失敗するテストを作成する。

## 背景

テスト駆動開発により、要件を満たす実装を保証する。テストは実装の仕様書として機能する。

---

## 使用スキル

### スキル1: tdd-principles

**パス**: `.claude/skills/tdd-principles/SKILL.md`

**Trigger条件**: TDD、テスト駆動開発、Red-Green-Refactor

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. Redフェーズの原則に従ってテストを作成
3. テストが失敗することを確認

**期待される成果物**:

- 失敗するユニットテスト

---

### スキル2: test-doubles

**パス**: `.claude/skills/test-doubles/SKILL.md`

**Trigger条件**: モック、スタブ、テストダブル設計

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. LLMProviderのモックを設計
3. 必要なスタブを作成

**期待される成果物**:

- モック・スタブ定義

---

## 参照資料

| 参照資料     | パス                               | 内容                         |
| ------------ | ---------------------------------- | ---------------------------- |
| 設計書       | `outputs/phase-2/`                 | インターフェース・クラス設計 |
| レビュー結果 | `outputs/phase-3/design-review.md` | 設計レビュー                 |

---

## 成果物

| 成果物         | パス                                                                         | 内容           |
| -------------- | ---------------------------------------------------------------------------- | -------------- |
| テストファイル | `packages/shared/src/services/extraction/__tests__/entity-extractor.test.ts` | ユニットテスト |
| モック         | `packages/shared/src/services/extraction/__tests__/mocks/`                   | テストダブル   |

---

## テストケース設計

### LLMEntityExtractor テスト

```typescript
describe("LLMEntityExtractor", () => {
  describe("extract", () => {
    it("テキストからエンティティを抽出できる", async () => {});
    it("指定タイプのみ抽出できる", async () => {});
    it("信頼度でフィルタリングできる", async () => {});
    it("最大抽出数を制限できる", async () => {});
    it("説明を生成できる", async () => {});
    it("エイリアスを抽出できる", async () => {});
    it("メンション情報を含める", async () => {});
  });

  describe("extractBatch", () => {
    it("複数チャンクからバッチ抽出できる", async () => {});
    it("エラー時もスキップして継続する", async () => {});
  });

  describe("mergeEntities", () => {
    it("重複エンティティをマージできる", async () => {});
    it("メンションを集約できる", async () => {});
    it("信頼度は最大値を採用する", async () => {});
    it("エイリアスをマージできる", async () => {});
  });
});
```

### RuleBasedEntityExtractor テスト

```typescript
describe("RuleBasedEntityExtractor", () => {
  describe("extract", () => {
    it("技術名を抽出できる", async () => {});
    it("組織名を抽出できる", async () => {});
    it("日付を抽出できる", async () => {});
    it("重複を除外できる", async () => {});
  });
});
```

---

## TDD検証

### テスト実行コマンド

```bash
pnpm --filter @repo/shared test:run -- --grep "EntityExtractor"
```

### 確認項目

- [ ] テストが失敗することを確認（Red状態）
- [ ] テストケースが要件をカバーしている
- [ ] モック・スタブが適切に設計されている

---

## 完了条件

- [ ] LLMEntityExtractorのテストが作成されている
- [ ] RuleBasedEntityExtractorのテストが作成されている
- [ ] モック・スタブが作成されている
- [ ] 全テストが失敗する（Red状態）
- [ ] テストが要件をカバーしている

---

## 依存関係

- **前提**: Phase 3 が完了していること（PASS/MINOR判定）
- **後続**: Phase 5 (実装) へ進む

---

## スキルフィードバック記録

```markdown
## Phase 4 実行記録

### 使用スキル

- tdd-principles: {{result}}
- test-doubles: {{result}}

### TDD状態

- Red確認: {{完了/未完了}}
- 失敗テスト数: {{数}}

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/entity-extraction-ner/phase-5-implementation.md`
