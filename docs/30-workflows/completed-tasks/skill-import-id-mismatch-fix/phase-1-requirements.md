# Phase 1: 要件定義 — SkillImportDialog skill.id/skill.name 不整合修正

## メタ情報

| 項目     | 値                                        |
| -------- | ----------------------------------------- |
| Phase    | 1 — 要件定義                              |
| タスクID | UT-FIX-SKILL-IMPORT-ID-MISMATCH-001       |
| 機能名   | skill-import-id-mismatch-fix              |
| 分類     | バグ修正                                  |
| 優先度   | 高                                        |
| 見積もり | 小規模                                    |
| ブランチ | `fix/ut-fix-skill-import-id-mismatch-001` |
| 作成日   | 2026-02-22                                |

## 目的

`organisms/SkillImportDialog` がスキル選択時に `skill.id`（SHA-256ハッシュの先頭16文字）を使用し、その値が IPC ハンドラの `skillName` パラメータに到達するため、`getSkillByName()` でスキル名と一致せずインポートが100%失敗するバグを修正する。

## 実行タスク

- 根本原因分析: データフローを追跡して不一致点を特定する
- 機能要件定義: `skill.id` と `skill.name` の責務境界を明確化する
- 非機能要件定義: テスト互換性と実行環境制約を明確化する
- 受け入れ基準定義: 実装完了を判定できる条件を定義する
- スコープ定義: 今回変更対象と対象外を固定する

## 実行手順

### Step 1: バグの根本原因分析

### 原因の特定

SkillImportDialog は以下の3箇所で `skill.id`（ハッシュ値、例: `"a478b3e7c728cd18"`）を使用している。

1. **156行目**: `importedSkillIds.includes(skill.id)` — インポート済み判定
2. **157行目**: `selectedIds.has(skill.id)` — 選択状態判定
3. **174行目**: `handleToggleSkill(skill.id)` — 選択トグル

これにより、`handleImport` → `onImport(Array.from(selectedIds))` で渡される値がハッシュ値となる。

### データフローの追跡

```
【現在のフロー（バグ）】
SkillImportDialog: skill.id ("a478b3e7c728cd18") → selectedIds → onImport([...selectedIds])
    ↓
AgentView: handleImport(skillIds) → forEach(skillName => importSkillAction(skillName))
    ↓
agentSlice: importSkill("a478b3e7c728cd18") → window.electronAPI.skill.import("a478b3e7c728cd18")
    ↓
IPC handler: skillName = "a478b3e7c728cd18" → getSkillByName("a478b3e7c728cd18") → null → IMPORT_ERROR

【修正後のフロー】
SkillImportDialog: skill.name ("task-specification-creator") → selectedIds → onImport([...selectedIds])
    ↓
AgentView: handleImport(skillNames) → forEach(skillName => importSkillAction(skillName))
    ↓
agentSlice: importSkill("task-specification-creator") → window.electronAPI.skill.import("task-specification-creator")
    ↓
IPC handler: skillName = "task-specification-creator" → getSkillByName("task-specification-creator") → Skill → 成功
```

## 機能要件

### FR-1: `onImport` に渡す値を `skill.name` に統一する

| 項目                | 現在の実装                          | 修正後                                                  |
| ------------------- | ----------------------------------- | ------------------------------------------------------- |
| `onImport` 呼び出し | `onImport(Array.from(selectedIds))` | `selectedIds` を `skill.name` 配列へ変換して `onImport` |
| 変換方式            | なし                                | `availableSkills` から `id -> name` を逆引きして変換    |

### FR-2: `importedSkillIds` はIDのまま維持する

| 項目               | 方針                                                      |
| ------------------ | --------------------------------------------------------- |
| `importedSkillIds` | `skill.id` の配列として維持する                           |
| 判定ロジック       | `importedSkillIds.includes(skill.id)` のまま維持する      |
| 目的               | 命名と値の意味を一致させ、store契約とのドリフトを防止する |

### FR-3: SkillImportDialog 内部状態はIDで保持する

| 項目       | 方針                                     |
| ---------- | ---------------------------------------- |
| 選択状態   | `selectedIds: Set<string>` を維持する    |
| チェック値 | `handleToggleSkill(skill.id)` を維持する |
| key値      | `key={skill.id}` を維持する              |

### FR-4: AgentView の接続コード修正

| 項目               | 現在の実装                            | 修正後                                        |
| ------------------ | ------------------------------------- | --------------------------------------------- |
| handleImport引数名 | `async (skillIds: string[])`          | `async (skillNames: string[])`                |
| ループ変数名       | `for (const skillName of skillIds)`   | `for (const skillName of skillNames)`         |
| トースト表示       | `` `${skillIds.length}件の...` ``     | `` `${skillNames.length}件の...` ``           |
| Props渡し          | `importedSkillIds={importedSkillIds}` | `importedSkillIds={importedSkillIds}`（維持） |

### FR-5: 変換失敗時の安全動作を定義する

| 項目         | 方針                                                                  |
| ------------ | --------------------------------------------------------------------- |
| 存在しないID | `availableSkills` に存在しないIDは `onImport` の引数から除外する      |
| 空配列時     | 変換結果が0件なら `onImport([])` を呼び、上位で既存の失敗処理に任せる |

### FR-6: store / IPC 契約は変更しない

| 項目       | 方針                                                       |
| ---------- | ---------------------------------------------------------- |
| agentSlice | `importedSkillIds: skills.map((s) => s.id)` を維持する     |
| IPC        | `skill:import(skillName: string)` 契約は既存仕様を維持する |
| 変更境界   | Renderer（SkillImportDialog / AgentView）に限定する        |

## 非機能要件

### NFR-1: 既存テスト互換性

- 既存テスト47件のうち、`onImport` の期待値だけを `skill.name` ベースに更新する
- `importedSkillIds` の期待値（ID配列）は維持する
- テスト全47件が修正後もPASSすること

### NFR-2: テスト環境互換性

- テストは `fireEvent` を使用すること（`userEvent` は使用しない — P39 happy-dom互換）
- テスト実行は `apps/desktop` ディレクトリから行うこと（P40 モノレポ対応）

## 受け入れ基準

- [ ] AC-1: SkillImportDialog でスキルを選択し「インポート」ボタンをクリックすると、`onImport` にスキル名の配列（例: `["task-specification-creator"]`）が渡される
- [ ] AC-2: インポート済みスキルが `skill.id` ベースで正しく「インポート済み」として表示され、チェックボックスが無効化される
- [ ] AC-3: AgentView 経由で agentSlice の `importSkill(skillName)` が正しいスキル名で呼び出される
- [ ] AC-4: IPC ハンドラの `getSkillByName()` がスキル名で正しくスキルを検索し、インポートが成功する
- [ ] AC-5: 既存テスト47件が全てPASSする（期待値修正後）
- [ ] AC-6: 新規テスト（ID選択 + name引き渡し変換の検証）がPASSする

## スコープ

### スコープ内

| ファイル          | パス                                                                                                    | 変更内容                                               |
| ----------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| SkillImportDialog | `apps/desktop/src/renderer/components/organisms/SkillImportDialog/index.tsx`                            | `onImport` 呼び出し前に `id -> name` 変換を追加        |
| AgentView         | `apps/desktop/src/renderer/views/AgentView/index.tsx`                                                   | `handleImport` 引数名修正（`skillIds` → `skillNames`） |
| テスト            | `apps/desktop/src/renderer/components/organisms/SkillImportDialog/__tests__/SkillImportDialog.test.tsx` | 期待値・Props名変更                                    |

### スコープ外

| 項目                                              | 理由                                                |
| ------------------------------------------------- | --------------------------------------------------- |
| IPC ハンドラ（skill:import）の変更                | UT-FIX-SKILL-IMPORT-INTERFACE-001 で完了済み        |
| IPC 戻り値型の変更                                | UT-FIX-SKILL-IMPORT-RETURN-TYPE-001 で完了済み      |
| agentSlice の `importedSkillIds` 生成ロジック変更 | 本不具合の直接原因ではないため今回対象外            |
| Preload 層（skill-api.ts）の変更                  | Preload は既に `skillName: string` を正しく渡す設計 |

## 前提タスク（完了済み）

| タスクID                            | タスク名                  | ステータス |
| ----------------------------------- | ------------------------- | ---------- |
| UT-FIX-SKILL-IMPORT-INTERFACE-001   | skill:import 引数形式統一 | 完了       |
| UT-FIX-SKILL-IMPORT-RETURN-TYPE-001 | skill:import 戻り値型変換 | 完了       |

## 参照資料

### システム仕様（aiworkflow-requirements）

| 参照資料                   | パス                                                                                        | 内容                                              |
| -------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| スキルインターフェース仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | skill:import チャンネル契約                       |
| 状態管理仕様               | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | agentSlice設計                                    |
| API IPC仕様                | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | skill:import チャンネル定義・戻り値               |
| 実装パターン仕様           | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 契約ドリフト防止パターン                          |
| IPC契約チェックリスト      | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | IPC引数の整合性確認手順                           |
| 既知の落とし穴             | `.claude/rules/06-known-pitfalls.md`                                                        | P44, P45（IPC引数契約ドリフト）                   |
| セキュリティ仕様           | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | IPC セキュリティ原則                              |
| UIコンポーネント仕様       | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                     | Atomic Design（organisms）                        |
| Skill型定義                | `packages/shared/src/types/skill.ts`                                                        | Skill インターフェース（id, name フィールド定義） |

## 統合テスト連携【必須】

| 接続観点         | 記載内容                                                                |
| ---------------- | ----------------------------------------------------------------------- |
| Renderer → Store | SkillImportDialog から AgentView へ `skill.name[]` が渡ること           |
| Store → IPC      | AgentView から `importSkill(skillName)` が呼ばれること                  |
| IPC → Main       | `skill:import(skillName)` が `getSkillByName(skillName)` と一致すること |

## 成果物

| 成果物             | パス                                                                     |
| ------------------ | ------------------------------------------------------------------------ |
| Phase 1 要件定義書 | `docs/30-workflows/skill-import-id-mismatch-fix/phase-1-requirements.md` |

## 完了条件

- [x] バグの根本原因が特定され、データフローが文書化されている
- [x] 機能要件 FR-1〜FR-6 が定義されている
- [x] 非機能要件 NFR-1〜NFR-2 が定義されている
- [x] 受け入れ基準 AC-1〜AC-6 が定義されている
- [x] スコープ内/外が明確に定義されている
- [x] 修正対象ファイルと変更内容が特定されている
- [x] 変更境界が Renderer（SkillImportDialog / AgentView）に限定されている

## 次のPhase

Phase 2（設計）: `docs/30-workflows/skill-import-id-mismatch-fix/phase-2-design.md`
