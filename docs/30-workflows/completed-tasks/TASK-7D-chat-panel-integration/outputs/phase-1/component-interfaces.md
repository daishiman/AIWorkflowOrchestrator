# コンポーネントインターフェース一覧

## 分析日: 2026-01-30

## TASK-7A: SkillSelector

### ファイル: `apps/desktop/src/renderer/components/skill/SkillSelector.tsx`

**Props:**

```typescript
export interface SkillSelectorProps {
  className?: string;
}
```

**Store連携**: `useSkillStore()` フックを使用

- 状態: `availableSkills`, `importedSkills`, `selectedSkillName`, `isLoadingSkills`, `isScanning`
- アクション: `selectSkillByName`, `fetchSkills`, `rescanSkills`

**onImportRequest**: SkillSelector 内部で未インポートスキルクリック時に呼び出されるハンドラ。ChatPanel 側で `setImportDialogSkill(skill)` として接続する必要がある。

**注意**: SkillSelector は SkillSelectorProps には `onImportRequest` を含まない。内部で useSkillStore を使用している。ChatPanel 統合時に、未インポートスキルのインポート要求を ChatPanel 側で受け取るメカニズムを確認する必要がある。

---

## TASK-7B: SkillImportDialog

### ファイル: `apps/desktop/src/renderer/components/skill/SkillImportDialog.tsx`

**Props:**

```typescript
export interface SkillImportDialogProps {
  skill: SkillMetadata;
  isOpen: boolean;
  onClose: () => void;
}
```

**Store連携**: `useAppStore()` から `importSkill` アクションを使用
**テスト済みIF**: isOpen 制御、onClose コールバック、skill メタデータ表示

---

## TASK-7C: PermissionDialog

### ファイル: `apps/desktop/src/renderer/components/skill/PermissionDialog.tsx`

**Props**: なし（Store-direct パターン）

**Store連携**: `useAppStore()` から以下を使用:

- 状態: `pendingPermission`
- アクション: `respondToSkillPermission`

**表示条件**: `pendingPermission !== null` の場合に自動表示
**テスト済みIF**: 3ボタンパターン（拒否、1回許可、許可）、記憶チェックボックス

---

## skill/index.ts エクスポート一覧

```typescript
export { PermissionDialog } from "./PermissionDialog";
export { SkillImportDialog } from "./SkillImportDialog";
export type { SkillImportDialogProps } from "./SkillImportDialog";
export { SkillSelector } from "./SkillSelector";
export type { SkillSelectorProps } from "./SkillSelector";
// SkillStreamingView は未追加（TASK-7D で追加）
```
