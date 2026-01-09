# Knowledge Graph ストア実装 - タスク指示書

## メタ情報

| 項目         | 内容                                      |
| ------------ | ----------------------------------------- |
| タスクID     | CONV-08-01                                |
| タスク名     | Knowledge Graph ストア実装                |
| 分類         | 要件                                      |
| 対象機能     | Knowledge Graph                           |
| 親タスク     | CONV-08 (Knowledge Graph構築)             |
| 依存タスク   | CONV-04-05 (Knowledge Graphテーブル)      |
| 優先度       | 高                                        |
| 見積もり規模 | 中規模                                    |
| ステータス   | 未実施                                    |
| 発見元       | 要件分析（Knowledge Graph構築タスク分解） |
| 発見日       | 2026-01-08                                |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

GraphRAGアーキテクチャにおいて、エンティティと関係の永続化・検索機能は中核コンポーネントである。
CONV-06-04（エンティティ抽出）とCONV-06-05（関係抽出）で抽出されたデータを、
効率的に格納・検索できるストア層が必要となる。

現在、抽出されたエンティティ・関係データは一時的なオブジェクトとして存在するのみで、
永続化・クエリ・トラバーサル機能が未実装の状態にある。

### 1.2 問題点・課題

| 問題点                     | 詳細                                       |
| -------------------------- | ------------------------------------------ |
| 永続化機能の欠如           | 抽出データがセッション間で保持されない     |
| グラフ検索機能の欠如       | エンティティ間の関係をトラバースできない   |
| 類似エンティティ検索の欠如 | 埋め込みベースの類似検索が実装されていない |
| 統計・分析機能の欠如       | グラフ構造の可視化・分析ができない         |
| バッチ処理の非効率性       | 大量データの一括処理に対応していない       |

### 1.3 放置した場合の影響

| 影響                         | 重大度 |
| ---------------------------- | ------ |
| GraphRAG機能が動作しない     | 致命的 |
| コミュニティ検出が実行不可   | 高     |
| グラフベースの質問応答が不可 | 高     |
| システム全体の価値提供が遅延 | 高     |

---

## 2. 何を達成するか（What）

### 2.1 目的

抽出されたエンティティと関係を永続化し、グラフトラバーサル・検索機能を提供するKnowledge Graphストアを実装する。

### 2.2 最終ゴール

- エンティティ・関係のCRUD操作が完全に動作する
- グラフトラバーサル（BFS/最短パス）が実行可能
- ベクトル類似検索によるエンティティ検索が動作する
- グラフ統計（ノード数、エッジ数、密度等）が取得可能
- 全テストが通過し、カバレッジ基準を達成

### 2.3 スコープ

#### 含むもの

- `IKnowledgeGraphStore` インターフェース定義
- `SQLiteKnowledgeGraphStore` 実装
- エンティティ操作（upsert/get/find/delete）
- 関係操作（add/get/find/delete）
- グラフトラバーサル（traverse/findShortestPath/getNeighbors）
- グラフ統計（getStats）
- バッチ操作（bulkUpsert/bulkAdd）
- ユニットテスト・統合テスト

#### 含まないもの

- コミュニティ検出（CONV-08-02で実装）
- グラフの可視化UI
- 分散グラフストア
- リアルタイム同期

### 2.4 成果物

| 種別         | 成果物                          | 配置先                                                        |
| ------------ | ------------------------------- | ------------------------------------------------------------- |
| 型定義       | `types.ts`                      | `packages/shared/src/services/graph/types.ts`                 |
| 実装         | `knowledge-graph-store.ts`      | `packages/shared/src/services/graph/knowledge-graph-store.ts` |
| テスト       | `knowledge-graph-store.test.ts` | `packages/shared/src/services/graph/__tests__/`               |
| ドキュメント | 実装ガイド                      | `outputs/phase-12/implementation-guide.md`                    |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- CONV-04-05（Knowledge Graphテーブル）が完了していること
- Drizzle ORMのセットアップが完了していること
- ベクトル検索（sqlite-vec）が利用可能であること

### 3.2 依存タスク

| タスクID   | タスク名                 | 必須 |
| ---------- | ------------------------ | ---- |
| CONV-04-05 | Knowledge Graphテーブル  | ✅   |
| CONV-06-04 | エンティティ抽出サービス | ✅   |
| CONV-06-05 | 関係抽出サービス         | ✅   |

### 3.3 必要な知識・スキル

- TypeScript/Drizzle ORM
- グラフデータ構造（BFS/DFS）
- ベクトル類似検索
- TDDプラクティス

### 3.4 推奨アプローチ

Repository パターンを適用し、データアクセス層を抽象化する。
グラフトラバーサルはBFSベースで実装し、メモリ効率を考慮したイテレータパターンを検討する。

---

## 4. 実行手順（Phase構成）

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料             | パス                                                                  | 内容                       |
| -------------------- | --------------------------------------------------------------------- | -------------------------- |
| データベース設計     | `.claude/skills/aiworkflow-requirements/references/database-*.md`     | テーブル設計・スキーマ定義 |
| アーキテクチャ       | `.claude/skills/aiworkflow-requirements/references/architecture-*.md` | レイヤー構成・依存関係     |
| インターフェース仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-*.md`   | API・型定義                |

**仕様検索**: `node .claude/skills/aiworkflow-requirements/scripts/search-spec.mjs "knowledge graph"`

---

### Phase 1: 要件定義

#### 使用スキル

| スキル名                 | パス                                               | 選定理由                                            |
| ------------------------ | -------------------------------------------------- | --------------------------------------------------- |
| requirements-engineering | `.claude/skills/requirements-engineering/SKILL.md` | Trigger: 要件定義、受け入れ基準、ユーザーストーリー |

#### 目的

目的・スコープ・受け入れ基準を明確化する。

#### 成果物

- `outputs/phase-1/requirements.md`
- `outputs/phase-1/acceptance-criteria.md`

#### 完了条件

- [ ] 機能要件・非機能要件が定義済み
- [ ] 受け入れ基準がGiven-When-Then形式で記述済み
- [ ] スコープが明確に定義済み
- [ ] **本Phase内の全スキルを100%実行完了**

---

### Phase 2: 設計

#### 使用スキル

| スキル名               | パス                                             | 選定理由                                      |
| ---------------------- | ------------------------------------------------ | --------------------------------------------- |
| domain-modeling        | `.claude/skills/domain-modeling/SKILL.md`        | Trigger: ドメインモデル設計、エンティティ識別 |
| architectural-patterns | `.claude/skills/architectural-patterns/SKILL.md` | Trigger: アーキテクチャ設計、レイヤー構成     |

#### 目的

アーキテクチャ・詳細設計を行う。

#### 成果物

- `outputs/phase-2/architecture.md`
- `outputs/phase-2/detailed-design.md`
- `outputs/phase-2/interface-definition.md`

#### 完了条件

- [ ] `IKnowledgeGraphStore`インターフェースが設計済み
- [ ] `StoredEntity`/`StoredRelation`型が定義済み
- [ ] グラフトラバーサルアルゴリズムが設計済み
- [ ] **本Phase内の全スキルを100%実行完了**

---

### Phase 3: 設計レビューゲート

#### 使用スキル

| スキル名    | パス                                  | 選定理由                          |
| ----------- | ------------------------------------- | --------------------------------- |
| code-review | `.claude/skills/code-review/SKILL.md` | Trigger: 設計レビュー、品質ゲート |

#### 目的

要件・設計の妥当性を検証する。

#### 成果物

- `outputs/phase-3/design-review-result.md`

#### 完了条件

- [ ] PASS/MINOR判定を取得（MAJORの場合はPhase 1/2へ戻る）
- [ ] MINOR指摘は未タスクとして記録
- [ ] **本Phase内の全スキルを100%実行完了**

---

### Phase 4: テスト作成

#### 使用スキル

| スキル名       | パス                                     | 選定理由                         |
| -------------- | ---------------------------------------- | -------------------------------- |
| tdd-principles | `.claude/skills/tdd-principles/SKILL.md` | Trigger: TDD、Red-Green-Refactor |

#### 目的

期待される動作を検証するテストを実装より先に作成する（Red状態）。

#### 成果物

- `packages/shared/src/services/graph/__tests__/knowledge-graph-store.test.ts`

#### 統合テストシナリオ【必須】

| シナリオカテゴリ   | 検証内容                                   |
| ------------------ | ------------------------------------------ |
| API接続テスト      | ストア操作の疎通確認                       |
| データフローテスト | エンティティ→関係→トラバーサルの往復       |
| エラーハンドリング | 存在しないエンティティへのアクセス時の挙動 |

#### 完了条件

- [ ] 受け入れ基準ごとにユニットテストがある
- [ ] 統合テストシナリオが全カテゴリで定義されている
- [ ] すべてのテストが失敗状態（Red）
- [ ] **本Phase内の全スキルを100%実行完了**

---

### Phase 5: 実装

#### 使用スキル

| スキル名       | パス                                     | 選定理由                      |
| -------------- | ---------------------------------------- | ----------------------------- |
| tdd-principles | `.claude/skills/tdd-principles/SKILL.md` | Trigger: TDD、Green状態の実装 |

#### 目的

テストを通す実装を行う（Green状態）。

#### 成果物

- `packages/shared/src/services/graph/types.ts`
- `packages/shared/src/services/graph/knowledge-graph-store.ts`

#### 完了条件

- [ ] 全てのユニットテストがパス
- [ ] TypeScript型エラーなし
- [ ] **本Phase内の全スキルを100%実行完了**

---

### Phase 6: テスト拡充

#### 使用スキル

| スキル名       | パス                                     | 選定理由                      |
| -------------- | ---------------------------------------- | ----------------------------- |
| tdd-principles | `.claude/skills/tdd-principles/SKILL.md` | Trigger: テストカバレッジ向上 |

#### 目的

追加テストによりカバレッジ目標を達成する。

#### ユニットテストカバレッジ基準

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

#### 完了条件

- [ ] ユニットテストカバレッジ基準を達成
- [ ] 統合テストの追加が完了
- [ ] **本Phase内の全スキルを100%実行完了**

---

### Phase 7: テストカバレッジ確認

#### 目的

カバレッジ基準を満たすかゲートとして確認する。

#### 完了条件

- [ ] Line Coverage 80%以上
- [ ] Branch Coverage 60%以上
- [ ] Function Coverage 80%以上
- [ ] 統合テストが全て成功
- [ ] **本Phase内の全スキルを100%実行完了**

---

### Phase 8: リファクタリング

#### 使用スキル

| スキル名       | パス                                     | 選定理由              |
| -------------- | ---------------------------------------- | --------------------- |
| tdd-principles | `.claude/skills/tdd-principles/SKILL.md` | Trigger: Refactor状態 |

#### 目的

コード品質を改善する（Refactor状態）。

#### 完了条件

- [ ] リファクタリング後も全テストがパス
- [ ] ESLint警告なし
- [ ] **本Phase内の全スキルを100%実行完了**

---

### Phase 9: 品質保証

#### 使用スキル

| スキル名        | パス                                      | 選定理由                      |
| --------------- | ----------------------------------------- | ----------------------------- |
| security-review | `.claude/skills/security-review/SKILL.md` | Trigger: セキュリティレビュー |

#### 目的

静的解析・セキュリティ・性能を検証する。

#### 完了条件

- [ ] 静的解析（ESLint/TypeScript）がパス
- [ ] セキュリティ脆弱性がない
- [ ] **本Phase内の全スキルを100%実行完了**

---

### Phase 10: 最終レビューゲート

#### 使用スキル

| スキル名    | パス                                  | 選定理由              |
| ----------- | ------------------------------------- | --------------------- |
| code-review | `.claude/skills/code-review/SKILL.md` | Trigger: 最終レビュー |

#### 目的

全体品質・整合性を検証する。

#### 完了条件

- [ ] PASS/MINOR判定を取得
- [ ] MINOR指摘は未タスクとして記録
- [ ] **本Phase内の全スキルを100%実行完了**

---

### Phase 11: 手動テスト検証

#### 目的

UX・実環境動作を確認する。

#### 完了条件

- [ ] 手動テストシナリオが実行済み
- [ ] 重大な問題がない
- [ ] **本Phase内の全スキルを100%実行完了**

---

### Phase 12: ドキュメント更新 & スキル改善【必須】

Phase 12では4つの必須作業を行う:

#### 12-1: 実装ガイド作成

##### 使用スキル

| スキル名          | パス                                        | 選定理由                  |
| ----------------- | ------------------------------------------- | ------------------------- |
| technical-writing | `.claude/skills/technical-writing/SKILL.md` | Trigger: ドキュメント作成 |

##### 成果物

- `outputs/phase-12/implementation-guide.md`

##### 要件

| セクション         | 必須 | 内容                                     |
| ------------------ | ---- | ---------------------------------------- |
| 概念的な説明       | ✅   | 中学生にもわかる比喩・例え話を使った説明 |
| 全体アーキテクチャ | ✅   | ASCII図解付きのレイヤー構造説明          |
| 各層の実装詳細     | ✅   | コード例 + 設計意図の説明                |
| 用語集             | ✅   | 専門用語の読み方・意味・コンテキスト     |

#### 12-2: システムドキュメント更新

##### 更新対象

| 更新対象                                             | 更新内容                        |
| ---------------------------------------------------- | ------------------------------- |
| `docs/00-requirements/`                              | Knowledge Graphストア仕様の追記 |
| `.claude/skills/aiworkflow-requirements/references/` | 新規仕様の追加（該当する場合）  |

##### 更新フロー

```bash
# 仕様変更がある場合
# 1. 該当ファイルを編集
# 2. インデックス再生成
node .claude/skills/aiworkflow-requirements/scripts/generate-index.mjs
```

#### 12-3: 未タスク検出【必須】

##### 検出ソース

| ソース                 | 確認項目                      | Grepパターン例                                      |
| ---------------------- | ----------------------------- | --------------------------------------------------- |
| Phase 3レビュー結果    | MINOR判定の指摘事項           | `outputs/phase-3/`                                  |
| Phase 10レビュー結果   | MINOR判定の指摘事項           | `outputs/phase-10/`                                 |
| Phase 11手動テスト結果 | スコープ外の発見事項          | `outputs/phase-11/`                                 |
| 各Phase成果物          | 「将来対応」「TODO」「FIXME」 | `grep -r "TODO\|FIXME\|将来対応" outputs/`          |
| コードベース           | TODO/FIXME/HACK/XXXコメント   | `grep -rn "TODO\|FIXME\|HACK\|XXX" packages/ apps/` |
| スキルLOGS.md          | partial/failure記録           | 各使用スキルのLOGS.md                               |

##### 成果物

- `outputs/phase-12/unassigned-task-report.md`
- `docs/30-workflows/unassigned-task/task-*.md`（該当する場合）

#### 12-4: スキルフィードバック・改善・新規作成【必須】

##### 使用スキル

| スキル名      | パス                                    | 選定理由                                |
| ------------- | --------------------------------------- | --------------------------------------- |
| skill-creator | `.claude/skills/skill-creator/SKILL.md` | Trigger: スキル更新、フィードバック記録 |

##### 12-4-1: フィードバック収集

各Phaseで使用したスキルの実行結果を評価し記録する。

```bash
# フィードバック記録
node .claude/skills/task-specification-creator/scripts/log_usage.mjs \
  --skill {{SKILL_NAME}} --result {{success|failure|partial}} --phase {{PHASE_NUMBER}}
```

##### 12-4-2: 既存スキル改善判定

skill-creatorで改善必要性を判定し、必要な場合は更新する。

```bash
# スキル更新（必要な場合）
node .claude/skills/skill-creator/scripts/detect_mode.mjs \
  --request "スキルを更新" --skill-path .claude/skills/{{SKILL_NAME}}
```

##### 12-4-3: 新規スキル必要性判定【重要】

| 検出条件           | 新規スキル作成の判断基準                     |
| ------------------ | -------------------------------------------- |
| 手動作業の繰り返し | 同じ手順を3回以上手動で実行した              |
| 既存スキル不在     | 必要なスキルが見つからず自前で対応した       |
| スキルの責務超過   | 1つのスキルに複数責務を詰め込んだ            |
| ドメイン知識の欠落 | 特定ドメインの専門知識が必要だった           |
| 再利用性の発見     | 他タスクでも使える汎用的な処理パターンを発見 |

##### 12-4-4: 新規スキル作成

新規スキルが必要と判定された場合、skill-creatorの**createモード**で作成する。

```bash
# 新規スキル作成
node .claude/skills/skill-creator/scripts/detect_mode.mjs \
  --request "{{NEW_SKILL_DESCRIPTION}}"

# 作成後の検証
node .claude/skills/skill-creator/scripts/validate_all.mjs \
  .claude/skills/{{NEW_SKILL_NAME}}

# スキルリスト更新
node .claude/skills/skill-creator/scripts/update_skill_list.mjs \
  --skill-path .claude/skills/{{NEW_SKILL_NAME}}
```

##### 成果物

- `outputs/phase-12/skill-feedback-report.md`

#### Phase 12 完了条件

- [ ] 実装ガイド（Part 1: 概念的説明 + Part 2: 技術的詳細）が作成されている
- [ ] ドキュメント更新記録が出力されている
- [ ] 未タスク検出レポートが出力されている
- [ ] 検出された未タスクに対して指示書が作成されている（該当する場合）
- [ ] **スキルフィードバックがskill-creatorで記録されている**【必須】
- [ ] スキル改善/新規作成が必要な場合、skill-creatorで実行されている
- [ ] **本Phase内の全スキルを100%実行完了**

---

### Phase 13: PR作成

#### 使用スキル

| スキル名   | パス                                 | 選定理由                  |
| ---------- | ------------------------------------ | ------------------------- |
| diff-to-pr | `.claude/skills/diff-to-pr/SKILL.md` | Trigger: PR作成、コミット |

#### 目的

`/ai:diff-to-pr` でコミット・PR・CI確認を行う。

#### 完了フロー

```
Phase 13: PR作成（/ai:diff-to-pr 使用）
    ↓
CI通過確認
    ↓
タスクディレクトリを completed-tasks/ に移動
    ↓
（該当する場合）未タスク指示書を削除
    ↓
変更をコミット・プッシュ
    ↓
ワークフロー完了
```

#### 移動手順

```bash
# 1. タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/knowledge-graph-store/ docs/30-workflows/completed-tasks/

# 2. 移動を確認
ls docs/30-workflows/completed-tasks/ | grep knowledge-graph-store

# 3. 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): knowledge-graph-storeをcompleted-tasksに移動"
git push
```

#### Phase 13 完了条件

| #   | 項目                                               | 必須 |
| --- | -------------------------------------------------- | ---- |
| 1   | PRが作成されている                                 | ✅   |
| 2   | CIが全て通過している                               | ✅   |
| 3   | タスクディレクトリが `completed-tasks/` に移動済み | ✅   |
| 4   | `artifacts.json` の `status` が `"completed"`      | ✅   |
| 5   | （該当時）未タスク指示書が削除済み                 | 条件 |
| 6   | **本Phase内の全作業を100%完了**                    | ✅   |

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `IKnowledgeGraphStore`インターフェースが定義済み
- [ ] `SQLiteKnowledgeGraphStore`が実装済み
- [ ] エンティティのCRUD操作が動作する
- [ ] エンティティのマージが正しく動作する
- [ ] 類似エンティティ検索が動作する
- [ ] 関係のCRUD操作が動作する
- [ ] 関係の重み更新が動作する
- [ ] グラフトラバーサルが動作する
- [ ] 最短パス検索が動作する
- [ ] グラフ統計が取得できる
- [ ] バッチ操作が動作する

### 品質要件

- [ ] 全テストがパス
- [ ] TypeScript型エラーなし
- [ ] ESLint警告なし
- [ ] ユニットテストカバレッジ: Line 80%+, Branch 60%+, Function 80%+

### ドキュメント要件

- [ ] JSDocコメントが記述されている
- [ ] 実装ガイドが作成されている
- [ ] システム仕様が更新されている（該当する場合）

---

## 6. 検証方法

### テストケース

```typescript
describe("SQLiteKnowledgeGraphStore", () => {
  describe("Entity operations", () => {
    it("エンティティを作成・取得できる");
    it("既存エンティティはマージされる");
    it("類似エンティティを検索できる");
  });

  describe("Relation operations", () => {
    it("関係を追加・取得できる");
    it("同じ関係は重みが増加する");
  });

  describe("Traversal", () => {
    it("グラフをトラバースできる");
    it("最短パスを見つけられる");
  });
});
```

### 検証手順

```bash
# ユニットテスト実行
pnpm --filter @repo/shared test

# カバレッジ確認
pnpm --filter @repo/shared test:coverage

# 型チェック
pnpm --filter @repo/shared typecheck

# Lint
pnpm --filter @repo/shared lint
```

---

## 7. リスクと対策

| リスク                           | 影響度 | 発生確率 | 対策                                         |
| -------------------------------- | ------ | -------- | -------------------------------------------- |
| ベクトル検索のパフォーマンス低下 | 中     | 中       | インデックス最適化、バッチサイズ調整         |
| グラフトラバーサルのメモリ消費   | 中     | 低       | イテレータパターン、深さ制限の適用           |
| 大量データでのトランザクション   | 高     | 中       | バッチ処理の分割、ロールバック戦略の実装     |
| エンティティマージの競合         | 低     | 低       | 楽観的ロック、コンフリクト解決ロジックの実装 |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント                    | パス       |
| ------------------------------- | ---------- |
| Knowledge Graphテーブル         | CONV-04-05 |
| エンティティ抽出サービス        | CONV-06-04 |
| 関係抽出サービス                | CONV-06-05 |
| Knowledge Graph構築（親タスク） | CONV-08    |

### システム仕様

| 仕様             | パス                                                                  |
| ---------------- | --------------------------------------------------------------------- |
| データベース設計 | `.claude/skills/aiworkflow-requirements/references/database-*.md`     |
| アーキテクチャ   | `.claude/skills/aiworkflow-requirements/references/architecture-*.md` |

### スキルリソース

| リソース                   | パス                                                 |
| -------------------------- | ---------------------------------------------------- |
| スキル一覧                 | `.claude/skills/skill-list.md`                       |
| task-specification-creator | `.claude/skills/task-specification-creator/SKILL.md` |
| skill-creator              | `.claude/skills/skill-creator/SKILL.md`              |

---

## 9. 備考

### 次のタスク

- CONV-08-02: コミュニティ検出 (Leiden)

---

## 10. 出力仕様詳細

以下は実装時の型定義・インターフェース仕様である。

### 10.1 型定義

```typescript
// packages/shared/src/services/graph/types.ts
import { z } from "zod";
import type {
  EntityId,
  RelationId,
  CommunityId,
  ChunkId,
} from "@/types/branded";

export interface StoredEntity {
  id: EntityId;
  name: string;
  normalizedName: string;
  type: EntityType;
  description?: string;
  aliases: string[];
  embedding?: number[];
  chunkIds: ChunkId[];
  mentionCount: number;
  attributes?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface StoredRelation {
  id: RelationId;
  sourceEntityId: EntityId;
  targetEntityId: EntityId;
  relationType: RelationType;
  description?: string;
  weight: number;
  evidence: RelationEvidence[];
  bidirectional: boolean;
  attributes?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface RelationEvidence {
  chunkId: ChunkId;
  text: string;
  confidence: number;
}

export interface GraphNode {
  entity: StoredEntity;
  inRelations: StoredRelation[];
  outRelations: StoredRelation[];
}

export interface GraphTraversalResult {
  startEntity: StoredEntity;
  paths: GraphPath[];
  visitedEntities: StoredEntity[];
  maxDepthReached: number;
}

export interface GraphPath {
  entities: StoredEntity[];
  relations: StoredRelation[];
  totalWeight: number;
}

export interface GraphStats {
  entityCount: number;
  relationCount: number;
  entityTypeDistribution: Record<EntityType, number>;
  relationTypeDistribution: Record<RelationType, number>;
  averageRelationsPerEntity: number;
  graphDensity: number;
}
```

### 10.2 インターフェース定義

```typescript
// packages/shared/src/services/graph/knowledge-graph-store.ts
import type { Result } from "@/types/result";

export interface IKnowledgeGraphStore {
  // エンティティ操作
  upsertEntity(entity: ExtractedEntity): Promise<Result<StoredEntity, Error>>;
  getEntity(id: EntityId): Promise<Result<StoredEntity | null, Error>>;
  getEntityByName(
    normalizedName: string,
  ): Promise<Result<StoredEntity | null, Error>>;
  findEntities(query: EntityQuery): Promise<Result<StoredEntity[], Error>>;
  findSimilarEntities(
    embedding: number[],
    limit: number,
    threshold?: number,
  ): Promise<Result<StoredEntity[], Error>>;
  deleteEntity(id: EntityId): Promise<Result<void, Error>>;

  // 関係操作
  addRelation(
    relation: ExtractedRelation,
  ): Promise<Result<StoredRelation, Error>>;
  getRelation(id: RelationId): Promise<Result<StoredRelation | null, Error>>;
  getRelations(
    entityId: EntityId,
    options?: { direction?: "in" | "out" | "both"; types?: RelationType[] },
  ): Promise<Result<StoredRelation[], Error>>;
  findRelations(
    sourceHint: string,
    targetHint: string,
    relationHint?: string,
  ): Promise<Result<StoredRelation[], Error>>;
  deleteRelation(id: RelationId): Promise<Result<void, Error>>;

  // グラフトラバーサル
  traverse(
    startEntityId: EntityId,
    options: TraversalOptions,
  ): Promise<Result<GraphTraversalResult, Error>>;
  findShortestPath(
    sourceId: EntityId,
    targetId: EntityId,
    maxDepth?: number,
  ): Promise<Result<GraphPath | null, Error>>;
  getNeighbors(
    entityId: EntityId,
    depth?: number,
  ): Promise<Result<GraphNode[], Error>>;

  // グラフ統計
  getStats(): Promise<Result<GraphStats, Error>>;

  // バッチ操作
  bulkUpsertEntities(
    entities: ExtractedEntity[],
  ): Promise<Result<StoredEntity[], Error>>;
  bulkAddRelations(
    relations: ExtractedRelation[],
  ): Promise<Result<StoredRelation[], Error>>;
}

export interface EntityQuery {
  types?: EntityType[];
  namePattern?: string;
  minMentionCount?: number;
  chunkIds?: ChunkId[];
  limit?: number;
  offset?: number;
}

export interface TraversalOptions {
  maxDepth: number;
  relationTypes?: RelationType[];
  direction?: "in" | "out" | "both";
  maxNodes?: number;
  minRelationWeight?: number;
}
```

---

## スキルフィードバック記録

> Phase完了時に使用した各スキルの結果を記録する

| Phase | スキル                   | 結果    | 備考                           |
| ----- | ------------------------ | ------- | ------------------------------ |
| 1     | requirements-engineering | pending | 要件定義時に使用予定           |
| 2     | domain-modeling          | pending | ドメインモデル設計時に使用予定 |
| 2     | architectural-patterns   | pending | アーキテクチャ設計時に使用予定 |
| 4     | tdd-principles           | pending | テスト作成時に使用予定         |
| 5     | tdd-principles           | pending | 実装時に使用予定               |
| 12    | skill-creator            | pending | フィードバック記録時に使用予定 |
| 13    | diff-to-pr               | pending | PR作成時に使用予定             |
