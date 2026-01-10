# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                       |
| ---------- | -------------------------- |
| Phase      | 1                          |
| Phase名    | 要件定義                   |
| 前提Phase  | なし                       |
| 後続Phase  | Phase 2 (設計)             |
| ステータス | 未実施                     |
| 作成日     | 2026-01-10                 |
| 機能名     | community-detection-leiden |

---

## 目的

Leidenアルゴリズムによるコミュニティ検出機能の目的、スコープ、受け入れ基準を明文化する。

## 背景

GraphRAGにおいて、グローバルクエリ（「全体のテーマは？」等）への回答にはコミュニティ単位での要約が必要。Leidenアルゴリズムは、Louvainアルゴリズムの改良版で、より高品質なコミュニティを検出できる。

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。
> 各スキルは `.claude/skills/{{スキル名}}/SKILL.md` を参照してください。

### スキル1: requirements-engineering

**パス**: `.claude/skills/requirements-engineering/SKILL.md`

**Trigger条件**:
機能要件・非機能要件の抽出・整理が必要な場合

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- `outputs/phase-1/requirements-definition.md`（要件定義書）

---

### スキル2: acceptance-criteria-writing

**パス**: `.claude/skills/acceptance-criteria-writing/SKILL.md`

**Trigger条件**:
テスト可能な受け入れ基準（Given-When-Then形式）の定義が必要な場合

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- `outputs/phase-1/acceptance-criteria.md`（受け入れ基準）

---

### スキル3: functional-non-functional-requirements

**パス**: `.claude/skills/functional-non-functional-requirements/SKILL.md`

**Trigger条件**:
機能要件と非機能要件の分類・整理が必要な場合

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- `outputs/phase-1/scope-definition.md`（スコープ定義・FR/NFR分類）

---

## 参照資料

| 参照資料                  | パス                                                                                        | 内容                         |
| ------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------- |
| 元タスク指示書            | `docs/30-workflows/unassigned-task/task-08-02-community-detection-leiden.md`                | 元のタスク仕様               |
| RAGアーキテクチャ         | `.claude/skills/aiworkflow-requirements/references/architecture-rag.md`                     | Knowledge Graph型定義        |
| RAGインターフェース       | `.claude/skills/aiworkflow-requirements/references/interfaces-rag.md`                       | RAG共通インターフェース      |
| Knowledge Graphストア仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-knowledge-graph-store.md` | グラフストアインターフェース |

---

## 成果物

| 成果物       | パス                                         | 内容                    |
| ------------ | -------------------------------------------- | ----------------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | 機能・非機能要件        |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | Given-When-Then形式のAC |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 実装範囲・FR/NFR分類    |

---

## 統合テスト連携【必須】

接続要件（API/認証/データフロー）を要件に明記する:

| 接続要件カテゴリ | 記載内容                                                   |
| ---------------- | ---------------------------------------------------------- |
| API接続          | IKnowledgeGraphStoreインターフェース経由でグラフデータ取得 |
| データフロー     | Knowledge Graph → Leiden検出 → Community → DB保存          |
| 外部連携         | なし（内部サービス）                                       |

---

## 機能要件（抽出指針）

### FR-1: コミュニティ検出

- Leidenアルゴリズムによるモジュラリティ最適化
- 階層的なコミュニティ構造の発見（maxLevels指定可能）
- 解像度パラメータ（resolution）によるコミュニティ粒度制御

### FR-2: コミュニティ管理

- 検出結果のDB保存
- エンティティが属するコミュニティの取得
- レベル別コミュニティ一覧の取得

### FR-3: インターフェース

- ICommunityDetectorインターフェースの実装
- Result型によるエラーハンドリング

---

## 非機能要件（抽出指針）

### NFR-1: パフォーマンス

- 1000ノード規模のグラフで10秒以内に検出完了
- メモリ使用量: グラフサイズの3倍以内

### NFR-2: 品質

- TypeScript型安全性の確保
- テストカバレッジ: Line 80%以上

### NFR-3: 再現性

- 乱数シード指定による再現可能な結果

---

## 完了条件

- [ ] 全要件が抽出されている
- [ ] 各要件に受け入れ基準がある（Given-When-Then形式）
- [ ] FR/NFRが分類されている
- [ ] 接続要件（API/データフロー）が明記されている
- [ ] IKnowledgeGraphStoreとの連携が定義されている
- [ ] **本Phase内の全スキルを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] スキルフィードバックが記録されている

---

## 依存関係

- **前提**: なし（ワークフローの開始点）
- **後続**: Phase 2 へ進む

---

## スキルフィードバック記録（Phase完了後に記入）

| スキル                                 | 結果 | 備考 |
| -------------------------------------- | ---- | ---- |
| requirements-engineering               |      |      |
| acceptance-criteria-writing            |      |      |
| functional-non-functional-requirements |      |      |

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/community-detection-leiden/phase-2-design.md`
