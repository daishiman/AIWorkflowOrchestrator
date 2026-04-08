# Phase 2: 設計 — 成果物

## タスクID: UT-SKILL-WIZARD-W1-par-02d

## 変更対象の差分設計

### 削除するコードブロック

```typescript
// 削除1: request state (L493)
const [request, setRequest] = useState("");

// 削除2: isPreparing / isCreating state (L514-515)
const [isPreparing, setIsPreparing] = useState(false);
const [isCreating, setIsCreating] = useState(false);

// 削除3: createdSkillPath state (L504)
const [createdSkillPath, setCreatedSkillPath] = useState<string | null>(null);

// 削除4: isPrepareFlowActiveRef (L568)
const isPrepareFlowActiveRef = useRef(false);

// 削除5: handlePrepare 関数全体 (L1111-1233)
const handlePrepare = async () => { ... };

// 削除6: handleCreate 関数全体 (L1332-1377)
const handleCreate = async () => { ... };
```

### 削除する JSX ブロック

```tsx
// 削除7: 「1. 依頼をまとめる」セクション全体 (L1992-2048)
<div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-5">
  <div className="flex items-center justify-between gap-3">
    <div>
      <h3 ...>1. 依頼をまとめる</h3>
      ...
    </div>
    <button data-testid="skill-lifecycle-prepare-button" ...>方針を決める</button>
  </div>
  <textarea data-testid="skill-lifecycle-request-input" ... />
  <div ...>
    <button data-testid="skill-lifecycle-create-button" ...>スキルを生成する</button>
    ...
  </div>
  {createdSkillPath ? <p data-testid="skill-lifecycle-created-path">...</p> : null}
</div>
```

### 追加する JSX ブロック

```tsx
// 追加: 「1. スキルを作成する」セクション
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

## Props インターフェース変更設計

```typescript
// Before (現行)
export interface SkillLifecyclePanelProps {
  onClose: () => void;
  onOpenWizard?: () => void;
  skillName?: string;
}

// After (変更後)
export interface SkillLifecyclePanelProps {
  onClose: () => void;
  onOpenWizard?: () => void;
  onOpenSkillWizard: () => void; // 追加（必須）
  skillName?: string;
}
```

## 変更影響範囲

| ファイル                                                                     | 変更内容                                                             |
| ---------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `SkillLifecyclePanel.tsx`                                                    | 本タスクの直接改修対象                                               |
| `apps/desktop/src/renderer/App.tsx`                                          | `onOpenSkillWizard` を渡す（既存の `onOpenWizard` と同じ関数を使用） |
| `apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx`        | 同上                                                                 |
| `apps/desktop/src/renderer/phase11-task-skill-lifecycle-severity-filter.tsx` | `onOpenSkillWizard={() => undefined}` を追加                         |
| `apps/desktop/src/renderer/phase11-task-rt-04-skill-authkey.tsx`             | `onOpenSkillWizard` を追加                                           |

## data-testid 変更一覧

| 要素                         | data-testid                          | 変更種別                     |
| ---------------------------- | ------------------------------------ | ---------------------------- |
| テキストエリア（削除）       | `skill-lifecycle-request-input`      | 削除                         |
| 「スキルを生成する」（削除） | `skill-lifecycle-create-button`      | 削除                         |
| 「方針を決める」（削除）     | `skill-lifecycle-prepare-button`     | 削除                         |
| ウィザードボタン（追加）     | `skill-lifecycle-open-wizard-button` | 追加                         |
| 生成先パス（削除）           | `skill-lifecycle-created-path`       | 削除（セクション削除に伴う） |

## 変更最小化の原則確認

変更しない要素:

- 「2. 生成したスキルを実行する」以降のセクション
- `onClose` Props
- `onOpenWizard` Props（既存の詳細ウィザードボタン用に維持）
- `lifecycleButtonStyles` CSS 定数
- `handleExecute` / `handlePlanImprovement` 等のその他関数

## 完了確認

- [x] 削除するコードブロックが全て特定されている
- [x] 追加するJSXブロックが定義されている
- [x] Props インターフェースの変更が設計されている
- [x] 変更影響範囲が確認されている
- [x] data-testid の変更一覧が定義されている
- [x] 変更最小化の原則が確認されている
