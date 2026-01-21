# Phase 3: 設計レビューゲート - タスク仕様書

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase      | 3                                     |
| Phase名    | 設計レビューゲート                    |
| 前提Phase  | Phase 2（設計）                       |
| 後続Phase  | Phase 4（テスト作成）                 |
| ステータス | 未実施                                |
| 作成日     | 2026-01-18                            |
| 機能名     | graph-search-reliability-improvements |

---

## 目的

設計内容が要件・既存仕様・後方互換性に適合しているかをレビューし、次Phaseへ進む判定を行う。

## 背景

timeoutMsやエラーコードの設計は既存GraphSearchStrategyとRAGエラー体系に影響するため、設計レビューで適合性を確認する必要がある。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 要件適合レビュー

**目的**: Phase 1で定義した要件を満たす設計になっているか確認する

**実行手順**:

1. 要件定義と設計ドキュメントを突合
2. timeoutMsの適用範囲とデフォルト値が要件を満たすか確認
3. `outputs/phase-3/design-review-result.md` にレビュー結果を記録

**期待される成果物**:

- `outputs/phase-3/design-review-result.md`

---

### タスク2: 仕様準拠レビュー

**目的**: RAGエラーコード体系と既存API仕様への準拠を確認する

**実行手順**:

1. error-handling.md と設計内容を突合
2. GraphSearchOptions拡張が既存API互換性を維持することを確認
3. 結果をレビュー結果に追記

**期待される成果物**:

- `outputs/phase-3/design-review-result.md`

---

### タスク3: 統合影響レビュー

**目的**: HybridRAG統合への影響を確認する

**実行手順**:

1. GraphSearchStrategyの戻り値とエラーコードが統合に影響しないか確認
2. 統合テスト観点の不足がないか確認
3. 結果をレビュー結果に追記

**期待される成果物**:

- `outputs/phase-3/design-review-result.md`

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
| タイムアウト設計 | `outputs/phase-2/timeout-design.md`    | timeoutMs設計 |
| エラーコード設計 | `outputs/phase-2/error-code-design.md` | コード体系    |
| 設計ドキュメント | `outputs/phase-2/design-document.md`   | 統合設計書    |

**依存Phase成果物**

| 参照資料     | パス                                         | 内容     |
| ------------ | -------------------------------------------- | -------- |
| 要件定義     | `outputs/phase-1/requirements-definition.md` | 要件一覧 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | 合否基準 |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 対象範囲 |

---

## 成果物

| 成果物           | パス                                      | 内容               |
| ---------------- | ----------------------------------------- | ------------------ |
| 設計レビュー結果 | `outputs/phase-3/design-review-result.md` | レビュー判定と指摘 |

---

## 統合テスト連携（Phase 1〜11は必須）

- GraphSearchタイムアウト時の統合テスト観点が設計書に含まれていることを確認
- エラーコード伝播の統合観点がレビュー結果に記載されていることを確認

---

## 完了条件

- [ ] 要件適合レビューが完了している
- [ ] 仕様準拠レビューが完了している
- [ ] 統合影響レビューが完了している
- [ ] レビュー結果が記録されている

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/graph-search-reliability-improvements --phase 3
```

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 3 実行記録

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

- **前提**: Phase 2（設計）の完了
- **後続**: Phase 4（テスト作成）へ進む

---

## レビューゲート（Phase 3, 10 の場合）

### レビュー結果判定

| 判定     | 条件                     | 次のアクション            |
| -------- | ------------------------ | ------------------------- |
| PASS     | 全レビュー観点で問題なし | 次のPhaseへ進行           |
| MINOR    | 軽微な指摘あり           | 指摘対応後、次のPhaseへ   |
| MAJOR    | 重大な問題あり           | 影響範囲に応じて戻る      |
| CRITICAL | 致命的な問題あり         | Phase 1へ戻りユーザー確認 |

### 戻り先決定基準

| 問題の種類       | 戻り先                |
| ---------------- | --------------------- |
| 要件の問題       | Phase 1（要件定義）   |
| 設計の問題       | Phase 2（設計）       |
| テスト設計の問題 | Phase 4（テスト）     |
| 実装の問題       | Phase 5（実装）       |
| 品質の問題       | Phase 8（リファクタ） |

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/graph-search-reliability-improvements/phase-4-test-creation.md`
