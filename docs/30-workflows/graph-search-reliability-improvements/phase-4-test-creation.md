# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase      | 4                                     |
| Phase名    | テスト作成                            |
| 前提Phase  | Phase 3（設計レビューゲート）         |
| 後続Phase  | Phase 5（実装）                       |
| ステータス | 未実施                                |
| 作成日     | 2026-01-18                            |
| 機能名     | graph-search-reliability-improvements |

---

## 目的

タイムアウトとエラーコードの期待動作を検証するテストを先に作成し、Red状態を確認する。

## 背景

信頼性改善は境界条件の検証が重要であるため、実装より先にテストを固定する必要がある。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: GraphStoreタイムアウトテスト作成

**目的**: GraphStore呼び出しのタイムアウトが正しく処理されることを検証する

**実行手順**:

1. GraphStore呼び出しが指定時間を超過するテストダブルを準備
2. timeoutMs指定時にタイムアウトエラーが返ることを検証
3. テスト仕様を `outputs/phase-4/test-specification.md` に記載

**期待される成果物**:

- `outputs/phase-4/test-specification.md`

---

### タスク2: Embeddingタイムアウトテスト作成

**目的**: Embedding生成のタイムアウトが正しく処理されることを検証する

**実行手順**:

1. EmbeddingProvider呼び出しが遅延するテストダブルを準備
2. timeoutMs指定時にタイムアウトエラーが返ることを検証
3. テスト仕様を更新

**期待される成果物**:

- `outputs/phase-4/test-specification.md`

---

### タスク3: エラーコード検証テスト作成

**目的**: タイムアウト時のエラーコードが正しく付与されることを検証する

**実行手順**:

1. タイムアウト時のエラーコードが期待値であることを検証
2. エラーコンテキストにtimeoutMsと対象APIが含まれることを検証
3. テスト仕様を更新

**期待される成果物**:

- `outputs/phase-4/test-specification.md`

---

### タスク4: フォールバック挙動テスト作成

**目的**: GraphSearch失敗時のフォールバックが期待通りであることを検証する

**実行手順**:

1. GraphSearchStrategyがタイムアウトした場合の戻り値を検証
2. HybridRAG統合テストでGraphSearch失敗時に他戦略で継続することを検証
3. テスト仕様を更新

**期待される成果物**:

- `outputs/phase-4/test-specification.md`

---

## 参照資料

**システム仕様（aiworkflow-requirements）**

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                  | パス                                                                                        | 内容                                    |
| ------------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------- |
| GraphSearchStrategy仕様   | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-search.md`                | GraphSearchOptions/インターフェース仕様 |
| Knowledge Graph Store仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-knowledge-graph-store.md` | GraphStoreインターフェースとエラー処理  |
| Embedding API仕様         | `.claude/skills/aiworkflow-requirements/references/api-internal-embedding.md`               | 埋め込み生成のタイムアウト設定          |
| エラーハンドリング仕様    | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | エラーコード体系と分類                  |
| RAGアーキテクチャ         | `.claude/skills/aiworkflow-requirements/references/architecture-rag.md`                     | 検索パイプライン全体像                  |

**前Phase成果物**

| 参照資料         | パス                                   | 内容          |
| ---------------- | -------------------------------------- | ------------- |
| 設計ドキュメント | `outputs/phase-2/design-document.md`   | 設計書        |
| タイムアウト設計 | `outputs/phase-2/timeout-design.md`    | timeoutMs設計 |
| エラーコード設計 | `outputs/phase-2/error-code-design.md` | エラーコード  |

**依存Phase成果物**

| 参照資料         | パス                                         | 内容         |
| ---------------- | -------------------------------------------- | ------------ |
| 要件定義         | `outputs/phase-1/requirements-definition.md` | 要件一覧     |
| 受け入れ基準     | `outputs/phase-1/acceptance-criteria.md`     | 合否基準     |
| 設計レビュー結果 | `outputs/phase-3/design-review-result.md`    | レビュー結果 |

---

## 成果物

| 成果物       | パス                                    | 内容        |
| ------------ | --------------------------------------- | ----------- |
| テスト仕様書 | `outputs/phase-4/test-specification.md` | テスト観点  |
| Red状態確認  | `outputs/phase-4/test-red-status.md`    | Red結果記録 |

---

## 統合テスト連携（Phase 1〜11は必須）

- GraphSearchタイムアウト時にHybridRAGが継続する統合テストを作成
- エラーコードが統合ログに残ることを統合テスト観点に追加

---

## 完了条件

- [ ] GraphStoreタイムアウトのテストが作成されている
- [ ] Embeddingタイムアウトのテストが作成されている
- [ ] エラーコード検証テストが作成されている
- [ ] フォールバック挙動テストが作成されている
- [ ] Red状態が記録されている

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
3. 統合テスト連携の実施（Phase 1〜11）
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/graph-search-reliability-improvements --phase 4
```

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 4 実行記録

### 実行タスク

- タスク1:
- タスク2:

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

## 依存関係

- **前提**: Phase 3（設計レビューゲート）の完了
- **後続**: Phase 5（実装）へ進む

---

## TDD検証（Phase 4, 5, 8 の場合）

### TDD サイクル確認

```bash
pnpm test -- --filter="GraphSearchStrategy"
```

**確認項目**:

- [ ] テストが失敗することを確認（Red状態）

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/graph-search-reliability-improvements/phase-5-implementation.md`
