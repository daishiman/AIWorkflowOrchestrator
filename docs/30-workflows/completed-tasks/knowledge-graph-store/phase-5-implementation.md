# Phase 5: 実装（TDD: Green） - タスク仕様書

## メタ情報

| 項目       | 内容                  |
| ---------- | --------------------- |
| Phase      | 5                     |
| Phase名    | 実装                  |
| 前提Phase  | Phase 4               |
| 後続Phase  | Phase 6               |
| ステータス | 未実施                |
| 作成日     | 2026-01-08            |
| 機能名     | knowledge-graph-store |

---

## 目的

テストを通すための最小限の実装を行う（Green状態）。

## 背景

Phase 4で作成したテストを通すため、IKnowledgeGraphStoreとSQLiteKnowledgeGraphStoreを実装する。

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。
> 各スキルは `.claude/skills/{{スキル名}}/SKILL.md` を参照してください。

### スキル1: clean-code-practices

**パス**: `.claude/skills/clean-code-practices/SKILL.md`

**Trigger条件**:
クリーンなコード設計・実装が必要な場合

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 可読性・保守性の高い実装を行う

**期待される成果物**:

- `packages/shared/src/services/graph/knowledge-graph-store.ts`

---

### スキル2: error-handling-patterns

**パス**: `.claude/skills/error-handling-patterns/SKILL.md`

**Trigger条件**:
Result型によるエラーハンドリングが必要な場合

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 一貫したエラーハンドリングを実装

**期待される成果物**:

- エラーハンドリングが実装されたコード

---

### スキル3: repository-pattern

**パス**: `.claude/skills/repository-pattern/SKILL.md`

**Trigger条件**:
リポジトリパターンの実装が必要な場合

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. EntityRepository, RelationRepositoryを活用した実装

**期待される成果物**:

- リポジトリ連携が実装されたコード

---

## 参照資料

| 参照資料       | パス                                                                    | 内容          |
| -------------- | ----------------------------------------------------------------------- | ------------- |
| テスト仕様書   | `outputs/phase-4/test-specification.md`                                 | Phase 4成果物 |
| ドメインモデル | `outputs/phase-2/domain-model.md`                                       | Phase 2成果物 |
| リポジトリIF   | `outputs/phase-2/repository-interface.md`                               | Phase 2成果物 |
| 元タスク指示書 | `docs/30-workflows/unassigned-task/task-08-01-knowledge-graph-store.md` | 実装仕様      |

---

## 実装対象

| ファイル                                                      | 説明                                            |
| ------------------------------------------------------------- | ----------------------------------------------- |
| `packages/shared/src/services/graph/types.ts`                 | StoredEntity, StoredRelation, GraphPath等       |
| `packages/shared/src/services/graph/knowledge-graph-store.ts` | IKnowledgeGraphStore, SQLiteKnowledgeGraphStore |

---

## 統合テスト連携【必須】

フロント/バック接続の実装とテスト支援コード整備:

| 実装項目       | 内容                                          |
| -------------- | --------------------------------------------- |
| DB接続         | DrizzleClientを使用したSQLiteアクセス         |
| リポジトリ連携 | EntityRepository/RelationRepository経由のCRUD |
| ベクトル検索   | vector_distance_cosを使用した類似検索         |

---

## 成果物

| 成果物     | パス                                                          | 内容       |
| ---------- | ------------------------------------------------------------- | ---------- |
| 型定義     | `packages/shared/src/services/graph/types.ts`                 | ドメイン型 |
| ストア実装 | `packages/shared/src/services/graph/knowledge-graph-store.ts` | 本体実装   |

---

## 完了条件

- [ ] types.ts（StoredEntity, StoredRelation, GraphPath等）が実装されている
- [ ] IKnowledgeGraphStoreインターフェースが定義されている
- [ ] SQLiteKnowledgeGraphStoreが実装されている
- [ ] エンティティ操作（CRUD、マージ、類似検索）が実装されている
- [ ] 関係操作（CRUD、重み更新）が実装されている
- [ ] グラフトラバーサル（BFS、最短パス）が実装されている
- [ ] すべてのテストが成功状態（Green）
- [ ] **本Phase内の全スキルを100%実行完了**

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

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] スキルフィードバックが記録されている

---

## 依存関係

- **前提**: Phase 4 が完了していること
- **後続**: Phase 6 へ進む

---

## スキルフィードバック記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 5 実行記録

### 使用スキル

- clean-code-practices: {{result}}
- error-handling-patterns: {{result}}
- repository-pattern: {{result}}

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

`docs/30-workflows/knowledge-graph-store/phase-6-test-expansion.md`
