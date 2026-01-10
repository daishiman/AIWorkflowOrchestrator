# コミュニティ検出 (Leiden) - ワークフロー

## メタ情報

| 項目         | 内容                                                                         |
| ------------ | ---------------------------------------------------------------------------- |
| タスクID     | CONV-08-02                                                                   |
| タスク名     | コミュニティ検出 (Leiden)                                                    |
| 親タスク     | CONV-08 (Knowledge Graph構築)                                                |
| 依存タスク   | CONV-08-01 (Knowledge Graphストア)                                           |
| 規模         | 大                                                                           |
| 見積もり工数 | 1.5日                                                                        |
| ステータス   | 未実施                                                                       |
| 作成日       | 2026-01-10                                                                   |
| 元タスク     | `docs/30-workflows/unassigned-task/task-08-02-community-detection-leiden.md` |

---

## 概要

Knowledge Graph内のエンティティをLeidenアルゴリズムでクラスタリングし、意味的に関連するコミュニティを検出する。グローバルクエリ対応の基盤となる。

### 目的

- Leidenアルゴリズムによるコミュニティ検出機能の実装
- 階層的なコミュニティ構造の発見
- GraphRAGのグローバルクエリ基盤の構築

### 成果物

- `packages/shared/src/services/graph/community-detector.ts`
- `packages/shared/src/services/graph/leiden-algorithm.ts`
- `packages/shared/src/services/graph/__tests__/community-detector.test.ts`

---

## Phase一覧

| Phase | 名称                 | ステータス | 完了日 |
| ----- | -------------------- | ---------- | ------ |
| 1     | 要件定義             | 未実施     | -      |
| 2     | 設計                 | 未実施     | -      |
| 3     | 設計レビューゲート   | 未実施     | -      |
| 4     | テスト作成           | 未実施     | -      |
| 5     | 実装                 | 未実施     | -      |
| 6     | テスト拡充           | 未実施     | -      |
| 7     | テストカバレッジ確認 | 未実施     | -      |
| 8     | リファクタリング     | 未実施     | -      |
| 9     | 品質保証             | 未実施     | -      |
| 10    | 最終レビューゲート   | 未実施     | -      |
| 11    | 手動テスト検証       | 未実施     | -      |
| 12    | ドキュメント更新     | 未実施     | -      |
| 13    | PR作成               | 未実施     | -      |

---

## Phaseドキュメント

- [Phase 1: 要件定義](./phase-1-requirements.md)
- [Phase 2: 設計](./phase-2-design.md)
- [Phase 3: 設計レビューゲート](./phase-3-design-review.md)
- [Phase 4: テスト作成](./phase-4-test-creation.md)
- [Phase 5: 実装](./phase-5-implementation.md)
- [Phase 6: テスト拡充](./phase-6-test-enhancement.md)
- [Phase 7: テストカバレッジ確認](./phase-7-coverage-verification.md)
- [Phase 8: リファクタリング](./phase-8-refactoring.md)
- [Phase 9: 品質保証](./phase-9-quality-assurance.md)
- [Phase 10: 最終レビューゲート](./phase-10-final-review.md)
- [Phase 11: 手動テスト検証](./phase-11-manual-testing.md)
- [Phase 12: ドキュメント更新](./phase-12-documentation.md)
- [Phase 13: PR作成](./phase-13-pr-creation.md)

---

## システム仕様参照

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料              | パス                                                                                        | 内容                         |
| --------------------- | ------------------------------------------------------------------------------------------- | ---------------------------- |
| RAGアーキテクチャ     | `.claude/skills/aiworkflow-requirements/references/architecture-rag.md`                     | Knowledge Graph型定義        |
| RAGインターフェース   | `.claude/skills/aiworkflow-requirements/references/interfaces-rag.md`                       | RAG共通インターフェース      |
| Knowledge Graphストア | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-knowledge-graph-store.md` | グラフストアインターフェース |
| データベース実装      | `.claude/skills/aiworkflow-requirements/references/database-implementation.md`              | Knowledge Graphテーブル群    |

---

## 依存関係

### 前提タスク

- CONV-08-01: Knowledge Graphストア（完了していること）

### 後続タスク

- CONV-08-03: コミュニティ要約生成

---

## 備考

- Leidenアルゴリズムの参考: [Leiden Algorithm Paper](https://www.nature.com/articles/s41598-019-41695-z)
- Microsoft GraphRAGの実装参考: [microsoft/graphrag](https://github.com/microsoft/graphrag)
