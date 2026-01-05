# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                  |
| ---------- | --------------------- |
| Phase      | 4                     |
| Phase名    | テスト作成（TDD Red） |
| 前提Phase  | Phase 3               |
| 後続Phase  | Phase 5               |
| ステータス | 完了                  |
| 作成日     | 2026-01-04            |
| 完了日     | 2026-01-04            |
| 機能名     | diskann-vector-index  |

---

## 目的

TDDの「Red」フェーズとして、失敗するテストを先に作成する。

## 背景

テスト駆動開発（TDD）に従い、実装前にテストを作成することで、要件を満たす最小限の実装を導く。

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。

### スキル1: tdd-principles

**パス**: `.claude/skills/tdd-principles/SKILL.md`

**Trigger条件**: TDDサイクルを実行する場合

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- テストコード（失敗状態）

---

### スキル2: test-doubles

**パス**: `.claude/skills/test-doubles/SKILL.md`

**Trigger条件**: モック・スタブが必要な場合

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行

**期待される成果物**:

- テストダブル設計

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> テスト設計時に以下のシステム仕様を参照してください。

| 参照資料                   | パス                                                                           | 内容                           |
| -------------------------- | ------------------------------------------------------------------------------ | ------------------------------ |
| データベースアーキテクチャ | `.claude/skills/aiworkflow-requirements/references/database-architecture.md`   | DB設計方針・テーブル構成       |
| データベース実装           | `.claude/skills/aiworkflow-requirements/references/database-implementation.md` | Drizzle ORM実装パターン        |
| RAGインターフェース        | `.claude/skills/aiworkflow-requirements/references/interfaces-rag.md`          | 埋め込み・検索インターフェース |

### Phase成果物

| 参照資料       | パス                                                                   | 内容             |
| -------------- | ---------------------------------------------------------------------- | ---------------- |
| Phase 2 成果物 | `outputs/phase-2/`                                                     | 設計書・API仕様  |
| Phase 3 成果物 | `outputs/phase-3/`                                                     | 設計レビュー結果 |
| 元タスク仕様   | `docs/30-workflows/unassigned-task/task-04-04-diskann-vector-index.md` | テストケース     |

---

## 成果物

| 成果物       | パス                                                         | 内容                       |
| ------------ | ------------------------------------------------------------ | -------------------------- |
| テスト仕様書 | `outputs/phase-4/test-specification.md`                      | テスト設計書               |
| テストコード | `packages/shared/src/db/schema/__tests__/embeddings.test.ts` | 単体テスト（コード成果物） |

---

## 完了条件

- [x] テストファイルが作成されている
- [x] 全テストケースが実装されている
- [x] テストを実行すると全て失敗する（Red状態）
- [x] テスト仕様書が作成されている

---

## 依存関係

- **前提**: Phase 3 が完了していること
- **後続**: Phase 5 へ進む

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/shared test:run -- --grep "embeddings"
```

**確認項目**:

- [x] テストが失敗することを確認（Red状態）

**実行結果**:

```
FAIL  src/db/schema/__tests__/embeddings.test.ts
Error: Failed to load url ../embeddings
  (resolved id: ../embeddings)
  Does the file exist?
```

---

## テストケース一覧

元タスク仕様書から抽出したテストケース:

### 1. embeddingsテーブル

```typescript
describe("embeddings テーブル", () => {
  it("埋め込みを挿入できる", async () => {});
  it("chunkId で一意性が保証される", async () => {});
  it("chunk 削除時にカスケード削除される", async () => {});
});
```

### 2. ベクトルインデックス

```typescript
describe("ベクトルインデックス", () => {
  it("インデックスを作成できる", async () => {});
  it("インデックスを削除できる", async () => {});
  it("インデックスを再構築できる", async () => {});
  it("統計情報を取得できる", async () => {});
});
```

### 3. ベクトル検索

```typescript
describe("ベクトル検索", () => {
  it("コサイン類似度検索が動作する", async () => {});
  it("ユークリッド距離検索が動作する", async () => {});
  it("内積検索が動作する", async () => {});
  it("minSimilarity でフィルタリングされる", async () => {});
  it("fileIds でフィルタリングできる", async () => {});
  it("結果が類似度順でソートされる", async () => {});
});
```

### 4. バッチ挿入

```typescript
describe("バッチ挿入", () => {
  it("複数の埋め込みを一括挿入できる", async () => {});
  it("大量データでもバッチ分割される", async () => {});
});
```

### 5. Float32Array変換

```typescript
describe("Float32Array 変換", () => {
  it("vectorToBlob が正しく変換する", async () => {});
  it("blobToVector が正しく復元する", async () => {});
  it("往復変換でデータが保持される", async () => {});
});
```

---

## スキルフィードバック記録

Phase完了後、使用したスキルへのフィードバックを記録してください:

```bash
# フィードバック記録
node .claude/skills/task-specification-creator/scripts/log_usage.mjs \
  --skill tdd-principles --result {{success|failure|partial}} --phase 4

node .claude/skills/task-specification-creator/scripts/log_usage.mjs \
  --skill test-doubles --result {{success|failure|partial}} --phase 4
```

### 記録内容

| スキル         | 結果    | 備考                                                            |
| -------------- | ------- | --------------------------------------------------------------- |
| tdd-principles | success | テスト仕様書を作成し、失敗するテストコードを先に実装（Red状態） |
| test-doubles   | partial | テストダブル設計は記載、実際のモックは統合テスト時に実装予定    |

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/diskann-vector-index/phase-5-implementation.md`
