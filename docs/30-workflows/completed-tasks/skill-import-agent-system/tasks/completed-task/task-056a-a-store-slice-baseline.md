---
id: TASK-UI-01-A-STORE-SLICE-BASELINE
tier: 3
title: Store Slice棚卸しと状態境界の基準化
phase: 6
depends_on: [TASK-UI-00-DESIGN-FOUNDATION]
parallel_with: [TASK-UI-01-B-IPC-CONTRACT-SECURITY]
blocks:
  [TASK-UI-01-C-NOTIFICATION-HISTORY-DOMAIN, TASK-UI-01-D-VIEWTYPE-ROUTING-NAV]
status: pending
priority: critical
estimated_complexity: large
tags: [frontend, electron, zustand, state-management]

execution:
  mode: sequential
  timeout_minutes: 60
  retry_count: 1
  allow_partial: false

verification:
  auto_verify: true
  require_tests: true
  require_typecheck: true

artifacts:
  creates:
    - docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-056-ui-01-store-ipc-architecture/task-056a-a-store-slice-baseline/index.md
    - docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-056-ui-01-store-ipc-architecture/outputs/task-056a-slice-inventory.md
    - docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-056-ui-01-store-ipc-architecture/outputs/task-056a-slice-boundary-matrix.md
  modifies:
    - apps/desktop/src/renderer/store/index.ts
    - apps/desktop/src/renderer/store/types.ts
    - apps/desktop/src/renderer/store/slices/*.ts
---

# TASK-UI-01-A: Store Slice棚卸しと状態境界の基準化

## 概要

既存Sliceの責務と依存を棚卸しし、追加対象と非追加対象の判断基準を固定する。P31再発防止を前提に、個別セレクタ運用と`useState`境界を先に確定し、後続仕様の入力を一つに揃える。

## スコープ

- 既存Store (`index.ts`, `types.ts`, `slices/*.ts`) の責務分解
- Notification / HistorySearch の新規Slice判定
- SkillCenterの`useState`境界固定
- ViewType拡張へ渡すStore境界定義

## 非スコープ

- IPCチャネル新規定義
- Main/Preload実装
- UIコンポーネント実装

## 入力

- `task-056-ui-01-store-ipc-architecture.md`（親仕様）
- `apps/desktop/src/renderer/store/index.ts`
- `apps/desktop/src/renderer/store/types.ts`
- `apps/desktop/src/renderer/store/slices/*.ts`

## 出力

- `task-056-ui-01-store-ipc-architecture/task-056a-a-store-slice-baseline/index.md`
- `outputs/task-056a-slice-inventory.md`: 既存Slice一覧、責務、依存、永続化対象
- `outputs/task-056a-slice-boundary-matrix.md`: 新規/拡張/非対象の判断表

## Atent Team（SubAgent）分割

| SubAgent                       | 関心ごと                  | 実行区分           | 成果物                               |
| ------------------------------ | ------------------------- | ------------------ | ------------------------------------ |
| SA-01: Inventory Analyst       | 既存Slice棚卸し           | 並列               | `task-056a-slice-inventory.md`       |
| SA-02: Boundary Architect      | Store境界と`useState`境界 | 並列               | `task-056a-slice-boundary-matrix.md` |
| SA-03: Selector Policy Auditor | P31対策、個別セレクタ規約 | 直列（SA-01/02後） | `task-056a-selector-policy.md`       |
| SA-04: Spec Gate Reviewer      | A/B/C成果物の矛盾検査     | 直列（SA-03後）    | `task-056a-review-gate.md`           |

## システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                                        | 本タスクへの反映事項                                |
| ------------------ | ------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| 状態管理パターン   | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | Slice分離、個別セレクタ、P31対策、`useState`境界    |
| アーキテクチャ総論 | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                | Renderer/Main/Preload責務分離、Slice Isolation      |
| 実装パターン       | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | セレクタ命名規約、型同期、Result返却方針            |
| エラーハンドリング | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | Storeアクション失敗時のエラー分類、ユーザー向け文言 |

## 実行手順

### Step 1: 既存Slice棚卸し（並列）

- SA-01が全Sliceの状態、アクション、永続化対象を一覧化する。
- SA-02が画面局所状態を抽出し、Store配置対象と`useState`対象を分類する。

### Step 2: 境界判断の固定（直列）

- Notification/HistorySearchの新規Slice条件を明文化する。
- SkillCenterを`useState`管理に固定し、新規Sliceを作成しない方針を明示する。
- Workspace既存Sliceの拡張不要判定を確定する。

### Step 3: P31対策の仕様固定（直列）

- SA-03が個別セレクタ命名規約と非推奨Hookを定義する。
- `useEffect`依存配列でStore関数を扱う運用ルールを仕様化する。

### Step 4: 統合レビュー（直列）

- SA-04がA/B/C成果物の矛盾を検査する。
- `task-056c` と `task-056d` へ引き渡す参照リンクを固定する。

## 検証条件

- [ ] 既存Sliceの責務重複が判定済み
- [ ] 新規/拡張/非対象の判断理由が全項目で記載済み
- [ ] P31対策（個別セレクタ前提）が明記済み
- [ ] SkillCenterを`useState`で扱う境界が明記済み
- [ ] `task-056c` と `task-056d` が参照できるリンクが整備済み

## リスクと対策

| リスク               | 対策                                |
| -------------------- | ----------------------------------- |
| Store責務の肥大化    | 1 Slice = 1ドメイン責務を維持する   |
| 合成Hook再導入       | 個別セレクタ命名規約を固定する      |
| 永続化対象の抜け漏れ | `partialize`対象を一覧で監査する    |
| 後続仕様との不整合   | SA-04レビューゲートで矛盾を遮断する |

## 仕様書ディレクトリ

- `task-056-ui-01-store-ipc-architecture/task-056a-a-store-slice-baseline/`
  - `index.md`
  - `phase-1` から `phase-13`
  - `artifacts.json`
