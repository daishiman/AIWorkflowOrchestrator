# Phase 4: テスト作成（TDD: Red） - タスク仕様書

## メタ情報

| 項目       | 内容                  |
| ---------- | --------------------- |
| Phase      | 4                     |
| Phase名    | テスト作成            |
| 前提Phase  | Phase 3               |
| 後続Phase  | Phase 5               |
| ステータス | 未実施                |
| 作成日     | 2026-01-08            |
| 機能名     | knowledge-graph-store |

---

## 目的

期待される動作を検証するテストを実装より先に作成する（Red状態）。

## 背景

TDDに従い、実装前にテストを作成することで、要件の理解を深め、設計の妥当性を検証する。

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。
> 各スキルは `.claude/skills/{{スキル名}}/SKILL.md` を参照してください。

### スキル1: tdd-principles

**パス**: `.claude/skills/tdd-principles/SKILL.md`

**Trigger条件**:
TDDの原則に従ったテスト設計が必要な場合

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 受け入れ基準からテストケースを導出

**期待される成果物**:

- `outputs/phase-4/test-specification.md`

---

### スキル2: vitest-best-practices

**パス**: `.claude/skills/vitest-best-practices/SKILL.md`

**Trigger条件**:
Vitestを使用したテスト作成が必要な場合

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. テストファイルを作成

**期待される成果物**:

- `packages/shared/src/services/graph/__tests__/knowledge-graph-store.test.ts`

---

### スキル3: boundary-value-analysis

**パス**: `.claude/skills/boundary-value-analysis/SKILL.md`

**Trigger条件**:
境界値テストの設計が必要な場合

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. エッジケースのテストを追加

**期待される成果物**:

- `outputs/phase-4/boundary-test-cases.md`

---

## 参照資料

| 参照資料       | パス                                                                    | 内容           |
| -------------- | ----------------------------------------------------------------------- | -------------- |
| 要件定義書     | `outputs/phase-1/requirements-definition.md`                            | Phase 1成果物  |
| 受け入れ基準   | `outputs/phase-1/acceptance-criteria.md`                                | Phase 1成果物  |
| 設計レビュー   | `outputs/phase-3/design-review-result.md`                               | Phase 3成果物  |
| 元タスク指示書 | `docs/30-workflows/unassigned-task/task-08-01-knowledge-graph-store.md` | テストケース例 |

---

## テストカテゴリ

| カテゴリ           | テスト対象                                                                                |
| ------------------ | ----------------------------------------------------------------------------------------- |
| エンティティ操作   | upsertEntity, getEntity, getEntityByName, findEntities, findSimilarEntities, deleteEntity |
| 関係操作           | addRelation, getRelation, getRelations, findRelations, deleteRelation                     |
| グラフトラバーサル | traverse, findShortestPath, getNeighbors                                                  |
| 統計               | getStats                                                                                  |
| バッチ操作         | bulkUpsertEntities, bulkAddRelations                                                      |

---

## 統合テスト連携【必須】

統合テストシナリオを全カテゴリで設計する:

| シナリオカテゴリ   | 検証内容                           | テストファイル          |
| ------------------ | ---------------------------------- | ----------------------- |
| DB接続テスト       | SQLite/DrizzleORM経由のCRUD操作    | `*.integration.test.ts` |
| データフローテスト | Entity作成→Relation追加→Traverse   | `*.flow.test.ts`        |
| エラーハンドリング | 存在しないEntityへの操作時のエラー | `*.error.test.ts`       |
| ベクトル検索テスト | DiskANN経由の類似検索              | `*.vector.test.ts`      |

---

## 成果物

| 成果物         | パス                                                                         | 内容         |
| -------------- | ---------------------------------------------------------------------------- | ------------ |
| テスト仕様書   | `outputs/phase-4/test-specification.md`                                      | テスト設計   |
| テストケース   | `outputs/phase-4/test-cases.md`                                              | ケース一覧   |
| 境界値テスト   | `outputs/phase-4/boundary-test-cases.md`                                     | エッジケース |
| テストファイル | `packages/shared/src/services/graph/__tests__/knowledge-graph-store.test.ts` | テストコード |

---

## 完了条件

- [ ] エンティティ操作のテストが作成されている
- [ ] 関係操作のテストが作成されている
- [ ] グラフトラバーサルのテストが作成されている
- [ ] エラーケースのテストが作成されている
- [ ] 境界値テストが含まれている
- [ ] 統合テストシナリオが全カテゴリで定義されている
- [ ] すべてのテストが失敗状態（Red）
- [ ] **本Phase内の全スキルを100%実行完了**

---

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/shared test

# 確認項目
# - [ ] テストが失敗することを確認（Red状態）
```

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] スキルフィードバックが記録されている

---

## 依存関係

- **前提**: Phase 3 が完了していること
- **後続**: Phase 5 へ進む

---

## スキルフィードバック記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 4 実行記録

### 使用スキル

- tdd-principles: {{result}}
- vitest-best-practices: {{result}}
- boundary-value-analysis: {{result}}

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

`docs/30-workflows/knowledge-graph-store/phase-5-implementation.md`
