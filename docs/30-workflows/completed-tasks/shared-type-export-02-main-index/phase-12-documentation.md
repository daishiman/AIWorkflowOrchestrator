# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容                             |
| ---------- | -------------------------------- |
| Phase      | 12                               |
| Phase名    | ドキュメント更新                 |
| 前提Phase  | Phase 11                         |
| 後続Phase  | Phase 13                         |
| ステータス | 未実施                           |
| 作成日     | 2026-01-14                       |
| 機能名     | shared-type-export-02-main-index |

---

## 目的

実装した変更をドキュメントに反映し、未タスクを検出する。

## 背景

型エクスポートの追加により、パッケージの公開APIが変更された。この変更をシステム仕様書に反映し、関連する未タスクがあれば検出する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 実装ガイドを作成

**目的**: 実装した内容をドキュメント化する

**実行手順**:

1. 以下の内容を含む実装ガイドを作成:

#### Part 1: 概念的説明

**型エクスポートとは?**

パッケージの「型エクスポート」は、図書館の蔵書目録のようなものです。本（型定義）がどこにあるか（ファイルパス）を知らなくても、目録（エクスポート）を見れば必要な本を見つけられます。

**なぜメインindex.tsからエクスポートするのか?**

- 利用者は深いパスを知らなくても型を使える
- パッケージの公開APIが明確になる
- 将来の内部リファクタリングが容易になる

#### Part 2: 技術的詳細

追加したエクスポート:

```typescript
// types (export type)
(Community,
  CommunitySummary,
  StoredEntity,
  CommunityStructure,
  GraphNode,
  GraphEdge,
  GraphPath,
  GraphTraversalResult,
  GraphStats,
  // ... 他の型

  // values (export)
  CommunityErrorCode,
  CommunityDetectionError,
  CommunitySummarizationErrorCode,
  CommunitySummarizationError,
  normalizeEntityName);
```

**期待される成果物**:

- 実装ガイド（`outputs/phase-12/implementation-guide.md`）

---

### タスク2: システムドキュメントを更新

**目的**: 既存のシステム仕様書を更新する

**実行手順**:

1. `architecture-monorepo.md`を確認し、必要に応じて更新:
   - 型エクスポートパターンの説明が含まれているか確認
   - メインindex.tsからのエクスポートについて記載があるか確認

2. 更新が必要な場合は以下を追記:

````markdown
### メインエントリポイントからのエクスポート

パッケージのメインエントリポイント（`packages/shared/index.ts`）から、
主要なサービスの型をエクスポートする。

**エクスポート例**:

```typescript
import type { Community, CommunitySummary, StoredEntity } from "@repo/shared";
```
````

````

3. ドキュメント更新記録を作成

**期待される成果物**:

- ドキュメント更新記録（`outputs/phase-12/documentation-update-log.md`）

---

### タスク3: 未タスクを検出

**目的**: 関連する未完了タスクを検出する

**実行手順**:

1. 以下のソースを確認:
   - Phase 3レビュー結果（MINOR判定があれば）
   - Phase 10レビュー結果（MINOR判定があれば）
   - コードベースのTODO/FIXMEコメント

2. 検出方法:

```bash
# コードベースのTODO/FIXMEを検索
grep -rn "TODO\|FIXME" packages/shared/index.ts packages/shared/src/services/graph/
````

3. 未タスク検出レポートを作成:
   - 検出された未タスクの一覧
   - 各未タスクの優先度と対応方針

4. 未タスクが検出された場合:
   - `docs/30-workflows/unassigned-task/` に未タスク指示書を作成

**期待される成果物**:

- 未タスク検出レポート（`outputs/phase-12/unassigned-task-report.md`）
- 未タスク指示書（該当する場合）

---

## 参照資料

| 参照資料               | パス                                                                                | 内容         |
| ---------------------- | ----------------------------------------------------------------------------------- | ------------ |
| 実装ガイドテンプレート | `.claude/skills/task-specification-creator/assets/implementation-guide-template.md` | テンプレート |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料               | パス                                                                         | 内容               |
| ---------------------- | ---------------------------------------------------------------------------- | ------------------ |
| モノレポアーキテクチャ | `.claude/skills/aiworkflow-requirements/references/architecture-monorepo.md` | 更新対象（必要時） |

**仕様検索**: `node .claude/skills/aiworkflow-requirements/scripts/search-spec.mjs "documentation"`

---

## 成果物

| 成果物               | パス                                           | 内容         |
| -------------------- | ---------------------------------------------- | ------------ |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`     | 実装説明     |
| ドキュメント更新記録 | `outputs/phase-12/documentation-update-log.md` | 更新記録     |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-report.md`   | 未タスク一覧 |

---

## 完了条件

- [ ] 実装ガイド（Part 1: 概念的説明 + Part 2: 技術的詳細）が作成されている
- [ ] ドキュメント更新記録が出力されている
- [ ] 未タスク検出レポートが出力されている
- [ ] 検出された未タスクに対して指示書が作成されている（該当する場合）

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] `artifacts.json`のPhase 12ステータスを更新

---

## 依存関係

- **前提**: Phase 11 が完了していること
- **後続**: Phase 13 へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/shared-type-export-02-main-index/phase-13-pr.md`
