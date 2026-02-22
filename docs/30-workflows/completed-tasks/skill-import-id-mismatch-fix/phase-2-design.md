# Phase 2: 設計 — SkillImportDialog skill.id/skill.name 不整合修正

## メタ情報

| 項目     | 値                                  |
| -------- | ----------------------------------- |
| Phase    | 2 — 設計                            |
| タスクID | UT-FIX-SKILL-IMPORT-ID-MISMATCH-001 |
| 機能名   | skill-import-id-mismatch-fix        |
| 分類     | バグ修正                            |
| 作成日   | 2026-02-22                          |

## 目的

`skill.id`（内部識別子）と `skill.name`（IPC契約値）の責務を分離し、最小変更でインポート失敗を解消する実装設計を確定する。

## 実行タスク

- 設計方針確定: 変更境界を Renderer（Dialog/View）に限定する
- データフロー設計: `selectedIds` から `skillNames` への変換経路を定義する
- インターフェース設計: `onImport` 引数の意味を `skillName[]` に固定する
- テスト設計: 既存テストへの最小差分を定義する
- 影響分析: Store / IPC / Main 側を非変更とする妥当性を確認する

## 参照資料

| 参照資料           | パス                                                                         | 内容                 |
| ------------------ | ---------------------------------------------------------------------------- | -------------------- |
| Phase 1 要件定義書 | `docs/30-workflows/skill-import-id-mismatch-fix/phase-1-requirements.md`     | 要件・受け入れ基準   |
| Skill型定義        | `packages/shared/src/types/skill.ts`                                         | `id` / `name` の意味 |
| UI実装             | `apps/desktop/src/renderer/components/organisms/SkillImportDialog/index.tsx` | 現行実装             |
| View実装           | `apps/desktop/src/renderer/views/AgentView/index.tsx`                        | 呼び出し境界         |

### システム仕様（aiworkflow-requirements）

| 参照資料                   | パス                                                                                        | 内容                           |
| -------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------ |
| スキルインターフェース仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | `skill:import(skillName)` 契約 |
| API IPC仕様                | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | チャンネル仕様 / 戻り値        |
| 実装パターン仕様           | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 契約ドリフト防止パターン       |
| 状態管理仕様               | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | store責務の境界                |
| IPC契約チェックリスト      | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | 破壊的変更回避の観点           |
| セキュリティ仕様           | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | IPC入力検証原則                |

## 実行手順

### Step 1: 変更境界の固定

- `importedSkillIds` は `skill.id` 配列として維持する
- `selectedIds` も `skill.id` の集合として維持する
- `agentSlice` / IPC / Main は変更しない

### Step 2: Dialog側の変換設計

`handleImport` 実行時のみ `id -> name` 変換を行う。

```typescript
const selectedNames = availableSkills
  .filter((skill) => selectedIds.has(skill.id))
  .map((skill) => skill.name);

onImport(selectedNames);
```

補足:

- 変換できないIDは `filter` で自然に除外
- 判定ロジック `importedSkillIds.includes(skill.id)` は維持

### Step 3: AgentView接続設計

- `handleImport` の引数名を `skillNames` に修正
- `for (const skillName of skillNames)` で `importSkillAction` を呼ぶ
- `SkillImportDialog` への `importedSkillIds` props は維持

### Step 4: テスト設計

- `importedSkillIds` の期待値はIDのまま維持
- `onImport` 呼び出し期待値を `skill.name[]` に更新
- 新規テストを1件追加（ID選択時にname配列を渡すこと）

## 影響分析

| レイヤー          | 変更有無 | 変更内容                             |
| ----------------- | -------- | ------------------------------------ |
| Renderer(Dialog)  | あり     | `handleImport` でID→name変換を追加   |
| Renderer(View)    | あり     | `handleImport` 引数名整理            |
| Store(agentSlice) | なし     | `importedSkillIds` はIDのまま        |
| Preload           | なし     | `skillName` 契約維持                 |
| Main/IPC          | なし     | `getSkillByName(skillName)` 契約維持 |

## 統合テスト連携【必須】

| 境界             | 検証ポイント                                  |
| ---------------- | --------------------------------------------- |
| Dialog → View    | `onImport` が `skill.name[]` を渡す           |
| View → Store     | `importSkill(skillName)` が文字列名で呼ばれる |
| Store → IPC/Main | `skill:import(skillName)` が成功する          |

## 多角的チェック観点

| 観点         | 適用内容                                     |
| ------------ | -------------------------------------------- |
| セキュリティ | IPC引数が `skillName` 文字列であることを維持 |
| 型安全性     | `id`/`name` の意味を境界で明示的に分離       |
| 保守性       | Store契約を維持して波及を最小化              |

## 成果物

| 成果物         | パス                                                               |
| -------------- | ------------------------------------------------------------------ |
| Phase 2 設計書 | `docs/30-workflows/skill-import-id-mismatch-fix/phase-2-design.md` |

## 完了条件

- [x] 変更境界（Renderer限定）が明確である
- [x] `id -> name` 変換ロジックが具体化されている
- [x] `importedSkillIds` をIDのまま維持する方針が明記されている
- [x] AgentViewの引数セマンティクスが `skillNames` へ統一されている
- [x] テスト変更方針（ID判定維持 + name引き渡し検証）が定義されている

## 次のPhase

Phase 3（設計レビューゲート）: `docs/30-workflows/skill-import-id-mismatch-fix/phase-3-design-review.md`
