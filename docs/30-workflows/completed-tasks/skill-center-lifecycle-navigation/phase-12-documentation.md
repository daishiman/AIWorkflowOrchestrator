# Phase 12: ドキュメント更新

## TASK-SKILL-CENTER-LIFECYCLE-NAV-001

---

## Task 12-1: 実装ガイド（2 パート）

成果物: `outputs/phase-12/implementation-guide.md`

### Part 1（中学生レベル）

**例え話**: `skillCreate` はお店の「正面玄関」、`skillManagement` は奥にある「受付への案内口」です。正面玄関はそのまま残し、受付へ行く扉を増やすのが今回の変更です。

**なぜ必要か**: すでに完成している `SkillLifecyclePanel` へ、main-shell から自然にたどり着けるようにするためです。

**何をしたか**: `SkillCenterView` に「スキル管理」ボタンを追加し、`SkillManagementPanel` を開けるようにしました。`SkillCreateWizard` はそのまま残します。

### Part 2（技術者レベル）

**変更インターフェース**:

```typescript
// ViewType（store/types.ts）
type ViewType = ... | "skillCreate" | "skillManagement" | ...

// App.tsx renderView()
case "skillManagement":
  return <SkillManagementPanel onClose={...} />;

// useSkillCenter.ts
navigateToSkillManagement: () => void
```

**影響範囲**:

- Renderer 層のみ。IPC / Main Process / Preload の変更なし
- 既存の `skillCreate` / `SkillCreateWizard` は `/advanced/skill-create-wizard` URL で残存
- `SkillLifecyclePanel` は `SkillManagementPanel` 内部サブビューとして再利用

---

## Task 12-2: システム仕様書更新

### Step 1-A: 完了タスク記録

- `task-workflow-completed.md` に TASK-SKILL-CENTER-LIFECYCLE-NAV-001 を追加
- LOGS.md（aiworkflow-requirements / task-specification-creator）を両方更新

### Step 1-B: 実装状況テーブル更新

- `SkillManagementPanel` 接続: 「未実装」→「完了」
- `skillCreate` の主導線は継続維持として記録

### Step 1-C: 関連タスクテーブル更新

- `SkillCenterView` の導線追加を完了済みに更新
- `SkillManagementPanel` の内部 lifecycle/create 切替は既存実装として扱う

### Step 2: 新規インターフェース追加判定

- ViewType に 1 種追加（`"skillManagement"`）→ **Step 2 実施必要**

---

## Task 12-3: ドキュメント更新履歴

成果物: `outputs/phase-12/documentation-changelog.md`

---

## Task 12-4: 未タスク検出

成果物: `outputs/phase-12/unassigned-task-detection.md`

| 未タスク候補                                                | 発生源             |
| ----------------------------------------------------------- | ------------------ |
| AppDock/サイドバーへの `skillManagement` ショートカット追加 | Phase 3 MINOR 指摘 |

---

## Task 12-5: スキルフィードバックレポート

成果物: `outputs/phase-12/skill-feedback-report.md`

---

## Phase 12 完了確認

- [ ] implementation-guide.md（Part 1/2）作成
- [ ] system-spec-update-summary.md 作成
- [ ] documentation-changelog.md 作成
- [ ] unassigned-task-detection.md 作成（1 件記録）
- [ ] skill-feedback-report.md 作成
- [ ] LOGS.md 2 ファイル更新
