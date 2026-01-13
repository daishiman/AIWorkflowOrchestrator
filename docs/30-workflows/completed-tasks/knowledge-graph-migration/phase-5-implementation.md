# Phase 5: 実装（TDD: Green） - タスク仕様書

## メタ情報

| 項目       | 内容                      |
| ---------- | ------------------------- |
| Phase      | 5                         |
| Phase名    | 実装（TDD: Green）        |
| 前提Phase  | Phase 4                   |
| 後続Phase  | Phase 6                   |
| ステータス | 未実施                    |
| 作成日     | 2026-01-12                |
| 機能名     | knowledge-graph-migration |

---

## 目的

テストを通すための最小限の実装を行う。マイグレーションを生成し、データベースに適用する。

## 背景

TDD（テスト駆動開発）のGreenフェーズとして、Phase 4で作成したテストを通すためにマイグレーションを生成・適用する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: drizzle.config.ts更新（必要な場合）

**目的**: graph/ディレクトリがスキーマに含まれていることを確認し、必要であれば更新する

**実行手順**:

1. `packages/shared/drizzle.config.ts` を読み込む
2. graph/index.tsがschemaに含まれているか確認
3. 含まれていない場合は追加
4. 設定変更をコミット

**期待される成果物**:

- 更新済みdrizzle.config.ts（必要な場合）

---

### タスク2: マイグレーション生成

**目的**: Drizzle Kitでマイグレーションファイルを生成する

**実行手順**:

1. `pnpm --filter @repo/shared drizzle-kit generate` を実行
2. 生成されたマイグレーションファイルを確認
3. 6テーブル分のCREATE TABLE文が含まれているか確認
4. 外部キー制約・インデックスが含まれているか確認

**期待される成果物**:

- マイグレーションSQLファイル

---

### タスク3: マイグレーション適用

**目的**: マイグレーションをローカルデータベースに適用する

**実行手順**:

1. `pnpm --filter @repo/shared drizzle-kit push` を実行
2. 適用結果を確認
3. エラーがあれば対処

**期待される成果物**:

- 適用済みデータベース

---

### タスク4: テスト実行（Green確認）

**目的**: Phase 4で作成したテストが成功することを確認する

**実行手順**:

1. `pnpm --filter @repo/shared test` を実行
2. 全テストがパスすることを確認
3. 失敗するテストがあれば原因を調査・修正

**期待される成果物**:

- テスト成功レポート

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料     | パス                                                                           | 内容                |
| ------------ | ------------------------------------------------------------------------------ | ------------------- |
| 設計書       | `outputs/phase-2/design-document.md`                                           | Phase 2成果物       |
| テスト仕様書 | `outputs/phase-4/test-specification.md`                                        | Phase 4成果物       |
| DB実装仕様   | `.claude/skills/aiworkflow-requirements/references/database-implementation.md` | Drizzle Kit使用方法 |

---

## 成果物

| 成果物                   | パス                                       | 内容                |
| ------------------------ | ------------------------------------------ | ------------------- |
| マイグレーションファイル | `packages/shared/src/db/migrations/*.sql`  | マイグレーションSQL |
| 実装レポート             | `outputs/phase-5/implementation-report.md` | 実装結果            |

---

## 統合テスト連携【必須】

マイグレーション生成・適用の実装:

| 実装項目             | 内容                                       |
| -------------------- | ------------------------------------------ |
| drizzle.config.ts    | graph/index.tsをschemaに追加（必要な場合） |
| マイグレーション生成 | drizzle-kit generateで6テーブル分のSQL生成 |
| マイグレーション適用 | drizzle-kit pushでローカルDBに適用         |
| 外部キー有効化       | PRAGMA foreign_keys = ON の確認            |

---

## 実行コマンド

```bash
# マイグレーション生成
pnpm --filter @repo/shared drizzle-kit generate

# マイグレーション適用（開発環境）
pnpm --filter @repo/shared drizzle-kit push

# テスト実行
pnpm --filter @repo/shared test
```

---

## 完了条件

- [ ] drizzle.config.tsにgraph/index.tsが含まれている
- [ ] マイグレーションファイルが生成されている
- [ ] 6テーブルがデータベースに作成されている
- [ ] 外部キー制約が設定されている
- [ ] すべてのテストが成功状態（Green）
- [ ] **本Phase内の全タスクを100%実行完了**

---

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/shared test

# 確認項目
# - [ ] テストが成功することを確認（Green状態）
```

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/knowledge-graph-migration --phase 5
```

---

## 依存関係

- **前提**: Phase 4（テスト作成）が完了していること
- **後続**: Phase 6（テスト拡充）へ進む

---

## Phase実行記録（実行後に記入）

Phase完了後、以下を記録してください:

```markdown
## Phase 5 実行記録

### 実行タスク

- drizzle.config.ts更新: {{結果}}
- マイグレーション生成: {{結果}}
- マイグレーション適用: {{結果}}
- テスト実行: {{結果}}

### TDD状態

- **Green状態確認**: {{全テスト成功 / 一部失敗}}

### 生成されたテーブル

- entities: {{作成済み / 未作成}}
- relations: {{作成済み / 未作成}}
- relation_evidence: {{作成済み / 未作成}}
- communities: {{作成済み / 未作成}}
- entity_communities: {{作成済み / 未作成}}
- chunk_entities: {{作成済み / 未作成}}

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phaseへの引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/knowledge-graph-migration/phase-6-test-expansion.md`
