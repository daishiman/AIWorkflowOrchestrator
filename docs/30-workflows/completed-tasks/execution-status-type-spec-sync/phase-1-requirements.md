# Phase 1: 要件定義 - SkillExecutionStatus 型同期の再監査

## メタ情報

| 項目   | 値                              |
| ------ | ------------------------------- |
| Phase  | 1                               |
| 機能名 | execution-status-type-spec-sync |
| 作成日 | 2026-03-20                      |

## 目的

`SkillExecutionStatus` の現物値と canonical spec を照合し、本タスクを `ready` / `blocked` のどちらで進めるべきかを確定する。

## 実行タスク

- P50 readiness 判定: 現物 `skill.ts` を読み、`ready` / `blocked` を確定する
- 必要仕様抽出: `resource-map` / `topic-map` / `search-spec.js` で canonical refs を拾う
- 対象分類: 更新対象と確認対象を分離する
- 要件確定: FR/NFR と受入基準を固定する

### タスク1: P50 readiness 判定

### タスク2: `aiworkflow-requirements` からの必要仕様抽出

### タスク3: 更新対象 / 確認対象の分類

### タスク4: FR/NFR と受入基準の確定

## 参照資料

| 資料名             | パス                                                                                                       | 説明                  |
| ------------------ | ---------------------------------------------------------------------------------------------------------- | --------------------- |
| 実コード           | `packages/shared/src/types/skill.ts`                                                                       | 現行型定義            |
| resource map       | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                                           | canonical 入口        |
| topic map          | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`                                              | section 特定          |
| 検索パターン       | `.claude/skills/aiworkflow-requirements/indexes/quick-reference-search-patterns-code.md`                   | Task12 検索補助       |
| Task12 一次情報    | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed-skill-lifecycle-design.md`      | 3状態追加根拠         |
| Task12 UI 一次情報 | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed-skill-lifecycle-ui.md`          | UI / selector 影響    |
| task ledger        | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                       | current workflow 台帳 |
| lessons learned    | `.claude/skills/aiworkflow-requirements/references/lessons-learned-current-electron-menu-docs-task0912.md` | P64/P65 対策          |

## 実行手順

### ステップ1: P50 readiness を判定する

```bash
sed -n '360,390p' packages/shared/src/types/skill.ts
```

| 判定      | 条件                                                            | 対応                                                  |
| --------- | --------------------------------------------------------------- | ----------------------------------------------------- |
| `ready`   | `review` / `improve_ready` / `reuse_ready` が実コードに存在する | Phase 2 以降を通常進行                                |
| `blocked` | 実コードが 6 値のまま                                           | blocker を記録し、後続 Phase では blocked path を優先 |

### ステップ2: 必要仕様を抽出する

1. `resource-map.md` で Skill Lifecycle / docs-only sync 系の入口を特定する
2. `node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "SkillExecutionStatus"` を実行する
3. `node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "TASK-IMP-LIFECYCLE-REUSE-IMPROVE-CYCLE-001"` を実行する
4. `node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "task-workflow-completed-skill-lifecycle-ui"` を実行する
5. `topic-map.md` で以下 5 ファイルの行位置を確定する

| ファイル                                            | 役割                     |
| --------------------------------------------------- | ------------------------ |
| `interfaces-agent-sdk-integration.md`               | 型テーブル更新候補       |
| `arch-state-management-core.md`                     | 状態配置更新候補         |
| `task-workflow-completed-skill-lifecycle-design.md` | 一次情報                 |
| `task-workflow-completed-skill-lifecycle-ui.md`     | UI / selector 一次情報   |
| `task-workflow.md`                                  | current backlog / status |

### ステップ3: 要件を確定する

| 要件ID | 要件                                                          | 分類 | 優先度 |
| ------ | ------------------------------------------------------------- | ---- | ------ |
| FR-01  | readiness を `ready` / `blocked` のどちらかに確定する         | 機能 | must   |
| FR-02  | `resource-map` 起点の抽出手順を固定する                       | 機能 | must   |
| FR-03  | Task12 design/UI 一次情報と lessons learned を直接参照する    | 機能 | must   |
| FR-04  | 更新対象と確認対象を分離する                                  | 品質 | must   |
| FR-05  | `ready` の場合のみ canonical spec / index / mirror 更新へ進む | 品質 | must   |
| FR-06  | `blocked` の場合は blocker と未タスク検出へ進む               | 品質 | must   |

## 統合テスト連携（Phase 1）

| 検証項目       | 方法                                   | 期待結果                           |
| -------------- | -------------------------------------- | ---------------------------------- |
| readiness 判定 | `skill.ts` から現値を確認              | `ready` または `blocked` が確定    |
| 一次情報探索   | `search-spec.js` 2 本 + `topic-map.md` | canonical path に到達できる        |
| 検索スコープ   | `references/` 限定 grep                | ノイズを抑えて参照箇所を列挙できる |

## 多角的チェック観点

| 観点             | 適用判断                         | 仕様参照先                                                                           |
| ---------------- | -------------------------------- | ------------------------------------------------------------------------------------ |
| アーキテクチャ   | 状態配置の同期対象があるため適用 | `aiworkflow-requirements: arch-state-management-core.md`                             |
| データ整合性     | 型と仕様書の一致確認が必要       | `aiworkflow-requirements: interfaces-agent-sdk-integration.md`                       |
| ドキュメント運用 | docs-only task であるため適用    | `task-specification-creator: phase-template-phase11.md`, `phase-template-phase12.md` |

## 成果物

| 成果物         | パス                                     | 説明               |
| -------------- | ---------------------------------------- | ------------------ |
| 要件定義書     | `outputs/phase-1/requirements.md`        | FR/NFR と判定結果  |
| 参照箇所リスト | `outputs/phase-1/reference-locations.md` | canonical 参照一覧 |

## 完了条件

- [ ] readiness 判定が記録されている
- [ ] `resource-map` / `topic-map` / `search-spec.js` を使った抽出結果がある
- [ ] 更新対象と確認対象が区別されている
- [ ] FR-01〜FR-06 が確定している
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. readiness 判定
3. 必要仕様の抽出
4. 要件確定
5. 成果物作成
6. 完了条件の検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/execution-status-type-spec-sync --phase 1
```

## 次のPhase

Phase 2: 設計
