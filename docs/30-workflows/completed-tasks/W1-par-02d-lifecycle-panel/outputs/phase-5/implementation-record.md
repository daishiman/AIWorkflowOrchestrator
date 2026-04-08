# Phase 5: 実装記録

## タスクID: UT-SKILL-WIZARD-W1-par-02d

## 変更ファイル一覧

| ファイル                                                                            | 変更種別       | 概要                               |
| ----------------------------------------------------------------------------------- | -------------- | ---------------------------------- |
| `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                | 改修           | Props追加・state/関数削除・JSX置換 |
| `apps/desktop/src/renderer/App.tsx`                                                 | 呼び出し元更新 | `onOpenSkillWizard` 追加           |
| `apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx`               | 呼び出し元更新 | `onOpenSkillWizard` 追加           |
| `apps/desktop/src/renderer/phase11-task-skill-lifecycle-severity-filter.tsx`        | 呼び出し元更新 | `onOpenSkillWizard` 追加           |
| `apps/desktop/src/renderer/phase11-task-rt-04-skill-authkey.tsx`                    | 呼び出し元更新 | `onOpenSkillWizard` 追加           |
| `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.test.tsx` | テスト更新     | 旧テスト削除・新テスト追加         |

## SkillLifecyclePanel.tsx 差分サマリ

### Props インターフェース変更

```typescript
// Before
export interface SkillLifecyclePanelProps {
  onClose: () => void;
  onOpenWizard?: () => void;
  skillName?: string;
}

// After
export interface SkillLifecyclePanelProps {
  onClose: () => void;
  onOpenWizard?: () => void;
  onOpenSkillWizard: () => void; // 追加（必須）
  skillName?: string;
}
```

### 関数シグネチャ変更

```typescript
// Before
export function SkillLifecyclePanel({
  onClose,
  onOpenWizard,
  skillName: _skillName,
});

// After
export function SkillLifecyclePanel({
  onClose,
  onOpenWizard,
  onOpenSkillWizard,
  skillName: _skillName,
});
```

### 削除した state・ref

| 削除対象                 | 型                          |
| ------------------------ | --------------------------- |
| `request`                | `string`                    |
| `isPreparing`            | `boolean`                   |
| `isCreating`             | `boolean`                   |
| `createdSkillPath`       | `string \| null`            |
| `isPrepareFlowActiveRef` | `MutableRefObject<boolean>` |

### 削除した関数

| 削除対象          | 理由                                     |
| ----------------- | ---------------------------------------- |
| `handlePrepare()` | テキストエリア廃止でウィザード誘導に置換 |
| `handleCreate()`  | 直接生成フロー廃止                       |

### 削除した import

| 削除対象         | 理由                          |
| ---------------- | ----------------------------- |
| `useCreateSkill` | `handleCreate` 削除に伴い不要 |

### JSX 変更（セクション1）

**Before:**

```tsx
<div className="rounded-2xl border ...">
  <div className="flex items-center justify-between gap-3">
    <div>
      <h3>1. 依頼をまとめる</h3>
      <p>何を作りたいかを自然文で入力してください...</p>
    </div>
    <button data-testid="skill-lifecycle-prepare-button" onClick={handlePrepare}>方針を決める</button>
  </div>
  <textarea data-testid="skill-lifecycle-request-input" ... />
  <button data-testid="skill-lifecycle-create-button" onClick={handleCreate}>スキルを生成する</button>
  {createdSkillPath ? <p data-testid="skill-lifecycle-created-path">...</p> : null}
</div>
```

**After:**

```tsx
<section>
  <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-5">
    <h3 className="text-base font-semibold text-[var(--text-primary)]">
      1. スキルを作成する
    </h3>
    <p className="mt-1 text-sm text-[var(--text-secondary)]">
      スキルの目的・機能・連携ツールをガイドに沿って設定し、
      AIと対話しながらスキルを生成します。
    </p>
    <button
      type="button"
      className={lifecycleButtonStyles.primary}
      onClick={onOpenSkillWizard}
      data-testid="skill-lifecycle-open-wizard-button"
    >
      スキル作成ウィザードを開く →
    </button>
  </div>
</section>
```

## 型チェック結果

```
tsc --noEmit → PASS（エラーゼロ）
```

## 完了確認

- [x] `request` state と setRequest が削除されている
- [x] `handleCreate()` 関数が削除されている
- [x] `handlePrepare()` 関数が削除されている
- [x] テキストエリア（skill-lifecycle-request-input）が削除されている
- [x] 「スキルを生成する」ボタン（skill-lifecycle-create-button）が削除されている
- [x] 「方針を決める」ボタン（skill-lifecycle-prepare-button）が削除されている
- [x] 「スキル作成ウィザードを開く →」ボタン（skill-lifecycle-open-wizard-button）が追加されている
- [x] onOpenSkillWizard Props が追加されている
- [x] 呼び出し元で onOpenSkillWizard が渡されている（4ファイル）
