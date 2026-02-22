# Phase 3: 設計レビューゲート — SkillImportDialog skill.id/skill.name 不整合修正

## メタ情報

| 項目     | 値                                  |
| -------- | ----------------------------------- |
| Phase    | 3 — 設計レビューゲート              |
| タスクID | UT-FIX-SKILL-IMPORT-ID-MISMATCH-001 |
| 機能名   | skill-import-id-mismatch-fix        |
| 作成日   | 2026-02-22                          |

## 目的

Phase 2の設計が、契約ドリフトを増やさずに不具合を解消する最小変更になっていることを確認する。

## 実行タスク

- 要件適合性レビュー: Phase 1のACを満たす設計かを確認する
- 契約整合レビュー: Dialog/View/IPCの値セマンティクスを確認する
- 変更境界レビュー: Store/Mainへの不要変更が混入していないかを確認する
- テスト妥当性レビュー: 失敗再現と修正検証の両方を満たすかを確認する

## 参照資料

| 参照資料         | パス                                                                         | 内容         |
| ---------------- | ---------------------------------------------------------------------------- | ------------ |
| Phase 1 要件     | `docs/30-workflows/skill-import-id-mismatch-fix/phase-1-requirements.md`     | 受け入れ基準 |
| Phase 2 設計     | `docs/30-workflows/skill-import-id-mismatch-fix/phase-2-design.md`           | 設計詳細     |
| 実装対象(Dialog) | `apps/desktop/src/renderer/components/organisms/SkillImportDialog/index.tsx` | 修正対象     |
| 実装対象(View)   | `apps/desktop/src/renderer/views/AgentView/index.tsx`                        | 修正対象     |

### システム仕様（aiworkflow-requirements）

| 参照資料                   | パス                                                                                        | 内容                           |
| -------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------ |
| スキルインターフェース仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | `skill:import(skillName)` 契約 |
| API IPC仕様                | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | チャンネル仕様                 |
| 実装パターン仕様           | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | P44/P45対策                    |
| 状態管理仕様               | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | store責務境界                  |
| セキュリティ仕様           | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | IPC入力検証                    |

## 実行手順

### Step 1: 要件適合チェック

- AC-1: `onImport` に `skill.name[]` が渡る設計か
- AC-2: インポート済み判定が `skill.id` で維持される設計か
- AC-3/4: `importSkill(skillName)` -> `getSkillByName(skillName)` が一致するか

### Step 2: 契約整合チェック（P44/P45）

| 境界       | 入力値                         | 期待         |
| ---------- | ------------------------------ | ------------ |
| Dialog内部 | `selectedIds: Set<skill.id>`   | ID管理を維持 |
| Dialog出力 | `onImport(skillNames)`         | name配列     |
| View処理   | `importSkillAction(skillName)` | name文字列   |
| IPC        | `skill:import(skillName)`      | nameで解決   |

### Step 3: 変更境界チェック

- `agentSlice` の `importedSkillIds`（ID配列）を変更しない
- Main/Preloadのインターフェース変更を行わない
- 修正対象を Dialog/View/テストに限定する

### Step 4: レビュー判定

- PASS: 上記3観点に不整合なし
- MINOR: 文言/命名の微修正のみ
- MAJOR: セマンティクス不一致が残る

## 統合テスト連携【必須】

| 観点         | 確認内容                                                  |
| ------------ | --------------------------------------------------------- |
| データフロー | Dialog(ID選択) -> View(name処理) -> IPC(name) の一貫性    |
| 回帰         | `importedSkillIds` 依存の既存表示ロジックが維持されること |

## レビュー判定

### 判定結果: **PASS**

- 変更境界が限定されており、破壊的影響が小さい
- 値セマンティクスが境界ごとに明確化されている
- Store命名/値のドリフトを新規に作らない

## 成果物

| 成果物       | パス                                                                      |
| ------------ | ------------------------------------------------------------------------- |
| レビュー結果 | `docs/30-workflows/skill-import-id-mismatch-fix/phase-3-design-review.md` |

## 完了条件

- [x] 要件適合性レビューが完了している
- [x] P44/P45観点の契約整合レビューが完了している
- [x] 変更境界レビューが完了している
- [x] 判定結果（PASS/MINOR/MAJOR）が明記されている

## 次のPhase

Phase 4（テスト作成）: `docs/30-workflows/skill-import-id-mismatch-fix/phase-4-test-creation.md`
