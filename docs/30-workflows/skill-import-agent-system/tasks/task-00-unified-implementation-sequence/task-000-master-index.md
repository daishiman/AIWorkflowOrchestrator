# Unified Task Execution Index

UI/UX/バックエンドを1ディレクトリで実行するための統合インデックス。

## 実行順序（単一フロー）

### Phase 0: 参照と実行計画

1. `task-001-skill-creator-integration.md`
2. `task-002-task-template.md`
3. `task-003-execution-plan.md`

### Phase 1: 契約ギャップ先行解消（UT）

4. `../completed-task/task-010a-ut-skill-import-channel-conflict-001.md`（並列：010a∥011∥014）
5. `../completed-task/task-011-ut-ipc-data-flow-type-gaps-001.md`（並列：010a∥011∥014）
6. `task-014-ut-fix-skill-execute-interface-001.md`（並列：010a∥011∥014、依存なし）
7. `../completed-task/task-012-ut-skill-ipc-preload-extension-001.md`（010a/011完了後）
8. `../completed-task/task-013-task9-ui-backend-consistency-improvements-001.md`（012完了後）
   - SubAgent Team: `../../../completed-tasks/task-013-subagent-team/index.md`
9. `task-013e-phase12-action-bridge.md`（013再監査後、次アクション実行の入口）

```
010a ─┐
011  ─┤→ 012 → 013
014  ─┘
```

### Phase 2: バックエンド基幹（部分並列）

9. `task-020a-task-9b-skill-creator.md`（並列：020a∥020b）
10. `task-020b-task-9a-skill-editor.md`（並列：020a∥020b）
11. `task-022-task-9f-skill-share.md`（020a完了後）

```
020a ─┐
020b ─┤→ 022
```

### Phase 3: バックエンド拡張（並列）

12. `task-023a-task-9g-skill-schedule.md`（並列）
13. `task-023b-task-9h-skill-debug.md`（並列）
14. `task-023c-task-9i-skill-docs.md`（並列）
15. `task-023d-task-9j-skill-analytics.md`（並列）
16. `task-023e-task-9d-skill-chain.md`（並列）
17. `task-023f-task-9e-skill-fork.md`（並列）

### Phase 4: UIスキル管理（部分並列）

18. `task-030-ui-05-skill-center-view.md`（直列：先行）
19. `task-031a-ui-05a-skill-editor-view.md`（並列：031a∥031b、030完了後）
20. `task-031b-ui-05b-skill-advanced-views.md`（並列：031a∥031b、030完了後）

```
030 → 031a ─┐
      031b ─┘
```

### Phase 5: 10A統合

21. `task-040-task-10a-skill-lifecycle.md`
22. `task-041a-task-10a-a-management-panel.md`（並列）
23. `task-041b-task-10a-b-analysis-view.md`（並列）
24. `task-041c-task-10a-c-create-wizard.md`（並列）
25. `task-042-task-10a-d-integration.md`（最終統合）

### Phase 6: UI/UX基盤トラック（独立管理）

#### Step 6-A: 基盤構築（直列）

26. `task-050-ui-00-ui-design-foundation.md`
27. ~~`task-051-ui-00-1-design-tokens.md`~~（完了済み）
28. ~~`task-052-ui-00-2-atoms-components.md`~~（完了済み）
29. `task-053-ui-00-3-molecules-components.md`
30. `task-054-ui-00-4-organisms-components.md`
31. `task-055-ui-00-foundation-reflection-audit.md`
32. `task-056-ui-01-store-ipc-architecture.md`
33. `task-057-ui-02-global-nav-core.md`

#### Step 6-B: 画面実装（並列、057完了後）

34. `task-058a-ui-03-agent-view-enhancement.md`（並列）
35. `task-058b-ui-04a-workspace-layout-filebrowser.md`（並列、059a/059bをブロック）
36. `task-058c-ui-06-history-search-view.md`（並列）
37. `task-058d-ui-07-dashboard-enhancement.md`（並列）
38. `task-058e-ui-08-notification-center.md`（並列）

```
057 ─┬→ 058a (UI-03) ──────────────────────┐
     ├→ 058b (UI-04A) → 059a∥059b (04B∥04C) ┤
     ├→ 058c (UI-06) ──────────────────────┤
     ├→ 058d (UI-07) ──────────────────────┤
     └→ 058e (UI-08) ──────────────────────┘
                                             ↓
```

#### Step 6-C: ワークスペース分割（058b完了後、並列）

39. `task-059a-ui-04b-workspace-chat-panel.md`（並列：059a∥059b）
40. `task-059b-ui-04c-workspace-preview-quicksearch.md`（並列：059a∥059b）

#### Step 6-D: 参照仕様（060は設計ドキュメント、実装は058b/059a/059bに分割済み）

41. `task-060-ui-04-workspace-view.md`（参照仕様）

#### Step 6-E: オンボーディング（全UI完了後）

42. `task-061-ui-09-onboarding-wizard.md`（全UI完了後）

## 並列実行ルール

### Phase内の並列化

- `task-010a` と `task-011` と `task-014` は同時実行可能（相互依存なし）。`task-012` は `task-010a/011` 完了後。
- `task-020a` と `task-020b` は同時実行可能（同一依存元、parallel_with 相互記載）。`task-022` は `task-020a` 完了後。
- `task-023a`〜`task-023f` は同時実行可能。
- `task-031a` と `task-031b` は同時実行可能（`task-030` 完了後）。
- `task-041a`〜`task-041c` は同時実行可能。`task-042` は `task-041a/b/c` 完了後。
- `task-058a`〜`task-058e` は同時実行可能（`task-057` 完了後）。
- `task-059a` と `task-059b` は同時実行可能（`task-058b` 完了後）。
- `task-061` は全UIタスク完了後に実施。

### トラック間の並列化

- `task-050`〜`task-061`（Phase 6）は UI/UX独立トラックとして、Phase 2〜5 と並列進行可能。

## 管理単位（独立）

- バックエンド/IPC契約: `task-010a`〜`task-023f`（`task-011` は `completed-task` 配下参照）
- UIスキル管理: `task-030`〜`task-031b`
- 統合: `task-040`〜`task-042`
- UI/UX基盤: `task-050`〜`task-061`

## ファイル命名規約（最適化）

- 正式ファイルは `task-<連番><枝番>-<カテゴリ>-<サブID>-<slug>.md` を使用する。
- `task-058a` / `task-058b` のような枝番は、同一フェーズ内での分割仕様を示す。
- 旧命名（`04A-*.md` など）は使用せず、参照リンクは本インデックスの正式ファイル名に統一する。
- 分割済みの親仕様（例: `task-060-ui-04-workspace-view.md`）はポインタードキュメントとして扱い、実装仕様は分割先（`task-058b`, `task-059a`, `task-059b`）を参照する。

## 旧インデックス（参考）

- `task-090-tasks-index-legacy.md`
- `task-091-ui-overhaul-index-legacy.md`
- `task-092-task9-execution-order-index-legacy.md`
