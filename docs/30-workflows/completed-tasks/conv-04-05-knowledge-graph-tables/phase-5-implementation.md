# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                       |
| ---------- | -------------------------- |
| Phase      | 5                          |
| Phase名    | 実装 (TDD: Green)          |
| 前提Phase  | Phase 4                    |
| 後続Phase  | Phase 6                    |
| ステータス | 未実施                     |
| 作成日     | 2026-01-04                 |
| 機能名     | Knowledge Graph テーブル群 |

---

## 目的

TDDのGreen段階として、Phase 4で作成したテストを通過させる最小限の実装を行う。

## 背景

テストを通過させることに集中し、必要最小限のコードで実装を完了させる。

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。

### スキル1: drizzle-orm

**パス**: `.claude/skills/drizzle-orm/SKILL.md`

**Trigger条件**: Drizzle ORMでスキーマを実装する場合

**実行方法**:

1. SKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 設計に基づいてスキーマを実装

**期待される成果物**:

- 6つのテーブル定義ファイル
- リレーション定義ファイル
- エクスポートファイル

---

### スキル2: tdd-red-green-refactor

**パス**: `.claude/skills/tdd-red-green-refactor/SKILL.md`

**Trigger条件**: 実装後にテストを通過させる場合

**実行方法**:

1. SKILL.mdを開く
2. 「Green Phase」セクションに従って実行
3. テストが通過することを確認

---

## 参照資料

| 参照資料                 | パス                                                                     | 内容               |
| ------------------------ | ------------------------------------------------------------------------ | ------------------ |
| Phase 2 成果物           | `outputs/phase-2/`                                                       | 設計書             |
| Phase 4 成果物           | `outputs/phase-4/`                                                       | テスト仕様         |
| 元タスク仕様（コード例） | `docs/30-workflows/unassigned-task/task-04-05-knowledge-graph-tables.md` | 実装サンプルコード |

---

## 成果物

| 成果物       | パス                                        | 内容           |
| ------------ | ------------------------------------------- | -------------- |
| 実装サマリー | `outputs/phase-5/implementation-summary.md` | 実装内容の概要 |

### コード成果物（プロジェクト配置）

| 成果物                    | パス                                                        |
| ------------------------- | ----------------------------------------------------------- |
| entitiesテーブル          | `packages/shared/src/db/schema/graph/entities.ts`           |
| relationsテーブル         | `packages/shared/src/db/schema/graph/relations.ts`          |
| relationEvidenceテーブル  | `packages/shared/src/db/schema/graph/relation-evidence.ts`  |
| communitiesテーブル       | `packages/shared/src/db/schema/graph/communities.ts`        |
| entityCommunitiesテーブル | `packages/shared/src/db/schema/graph/entity-communities.ts` |
| chunkEntitiesテーブル     | `packages/shared/src/db/schema/graph/chunk-entities.ts`     |
| グラフリレーション        | `packages/shared/src/db/schema/graph/graph-relations.ts`    |
| エクスポート              | `packages/shared/src/db/schema/graph/index.ts`              |

---

## 実装手順

### 1. ディレクトリ作成

```bash
mkdir -p packages/shared/src/db/schema/graph
mkdir -p packages/shared/src/db/schema/graph/__tests__
```

### 2. 各テーブルファイルの実装

元タスク仕様のコード例を参考に、設計に基づいて実装:

1. `entities.ts` - エンティティテーブル
2. `relations.ts` - 関係テーブル
3. `relation-evidence.ts` - 関係証拠テーブル
4. `communities.ts` - コミュニティテーブル
5. `entity-communities.ts` - エンティティ-コミュニティ中間テーブル
6. `chunk-entities.ts` - チャンク-エンティティ中間テーブル
7. `graph-relations.ts` - Drizzleリレーション定義
8. `index.ts` - バレルエクスポート

### 3. テスト実行

```bash
pnpm --filter @repo/shared test:run -- --grep "graph"
```

---

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/shared test:run -- --grep "graph"
```

**確認項目**:

- [ ] テストが成功することを確認（Green状態）
- [ ] 全テストケースが通過している

---

## 完了条件

- [ ] 全6テーブルが実装されている
- [ ] Drizzleリレーションが実装されている
- [ ] エクスポートファイルが作成されている
- [ ] 全テストが通過している（Green状態）
- [ ] 型エラーがない

---

## 依存関係

- **前提**: Phase 4 が完了していること
- **後続**: Phase 6（リファクタリング）へ進む

---

## スキルフィードバック記録（Phase完了後に記入）

```markdown
## Phase 5 実行記録

### 使用スキル

- drizzle-orm: (結果を記入)
- tdd-red-green-refactor: (結果を記入)

### テスト結果

- テストケース数: (件数)
- 成功数: (件数)
- Green状態確認: OK/NG

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

`docs/30-workflows/conv-04-05-knowledge-graph-tables/phase-6-refactoring.md`
