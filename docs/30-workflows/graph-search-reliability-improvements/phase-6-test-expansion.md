# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase      | 6                                     |
| Phase名    | テスト拡充                            |
| 前提Phase  | Phase 5（実装）                       |
| 後続Phase  | Phase 7（カバレッジ確認）             |
| ステータス | 未実施                                |
| 作成日     | 2026-01-18                            |
| 機能名     | graph-search-reliability-improvements |

---

## 目的

タイムアウト関連のエッジケースとフォールバック挙動のテストを拡充し、品質を高める。

## 背景

Phase 5の実装に対して、境界条件や統合条件の追加テストが必要である。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: エッジケーステスト追加

**目的**: timeoutMsの境界値に対する挙動を検証する

**実行手順**:

1. timeoutMsが0/負値/極端に大きい場合の挙動を定義
2. 入力バリデーションとデフォルト値の適用を検証
3. `outputs/phase-6/edge-case-tests.md` に記録

**期待される成果物**:

- `outputs/phase-6/edge-case-tests.md`

---

### タスク2: フォールバック挙動テスト追加

**目的**: GraphSearch失敗時のフォールバック動作を強化検証する

**実行手順**:

1. GraphStoreタイムアウト時の戻り値とログを検証
2. Embeddingタイムアウト時の戻り値とログを検証
3. `outputs/phase-6/fallback-tests.md` に記録

**期待される成果物**:

- `outputs/phase-6/fallback-tests.md`

---

### タスク3: テスト拡充結果まとめ

**目的**: 追加テストの結果と対象範囲を記録する

**実行手順**:

1. 追加したテスト一覧と結果をまとめる
2. `outputs/phase-6/test-expansion-result.md` を作成

**期待される成果物**:

- `outputs/phase-6/test-expansion-result.md`

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

| 参照資料      | パス                                        | 内容       |
| ------------- | ------------------------------------------- | ---------- |
| 実装サマリー  | `outputs/phase-5/implementation-summary.md` | 実装内容   |
| Green状態確認 | `outputs/phase-5/test-green-status.md`      | テスト結果 |

---

## 成果物

| 成果物               | パス                                       | 内容                   |
| -------------------- | ------------------------------------------ | ---------------------- |
| エッジケーステスト   | `outputs/phase-6/edge-case-tests.md`       | 境界値テスト結果       |
| フォールバックテスト | `outputs/phase-6/fallback-tests.md`        | フォールバック検証結果 |
| テスト拡充結果       | `outputs/phase-6/test-expansion-result.md` | 追加テストまとめ       |

---

## 統合テスト連携（Phase 1〜11は必須）

- GraphSearchタイムアウト時の統合テストに追加ケースを組み込む
- エラーコードの統合ログ出力を再確認する

---

## 完了条件

- [ ] エッジケーステストが追加されている
- [ ] フォールバック挙動テストが追加されている
- [ ] テスト拡充結果が記録されている

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/graph-search-reliability-improvements --phase 6
```

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 6 実行記録

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

- **前提**: Phase 5（実装）の完了
- **後続**: Phase 7（カバレッジ確認）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/graph-search-reliability-improvements/phase-7-coverage-check.md`
