# Phase 5: 実装

## メタ情報

| 項目       | 内容                                                     |
| ---------- | -------------------------------------------------------- |
| Phase      | 5                                                        |
| Phase名    | 実装                                                     |
| タスクID   | UT-SKILL-WIZARD-W1-par-02d                               |
| 機能名     | SkillLifecyclePanel テキストエリア削除・ウィザード遷移化 |
| 前提Phase  | Phase 4: テスト作成                                      |
| 次Phase    | Phase 6: テスト拡充                                      |
| ステータス | pending                                                  |
| 作成日     | 2026-04-07                                               |

## 目的

Phase 2 の設計と Phase 4 のテストに基づき、`SkillLifecyclePanel.tsx` の最小変更を実装する。

## 実行手順

### Step 0: 現行ファイルの確認

```bash
cat apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx
```

### Step 1: `request` state と関連コードの削除

以下の行を削除する:

```typescript
// 削除: request state
const [request, setRequest] = useState("");
```

`useState` が他の state でも使われている場合は import を維持し、`request` state のみ削除する。

### Step 2: `handleCreate` 関数の削除

```typescript
// 削除対象（全体）
const handleCreate = async () => {
  // 旧スキル生成ロジック（関数全体を削除）
};
```

### Step 3: `handlePrepare` 関数の削除

```typescript
// 削除対象（全体）
const handlePrepare = async () => {
  // 旧方針決定ロジック（関数全体を削除）
};
```

### Step 4: 「1. 依頼をまとめる」JSX セクションの削除・置換

以下の JSX ブロックを削除し、新しいセクションに置き換える:

**削除する JSX**:

- `data-testid="skill-lifecycle-request-input"` のテキストエリア
- `data-testid="skill-lifecycle-create-button"` の「スキルを生成する」ボタン
- `data-testid="skill-lifecycle-prepare-button"` の「方針を決める」ボタン
- これらを含む「1. 依頼をまとめる」セクション全体

**追加する JSX**:

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

### Step 5: Props インターフェースの更新

```typescript
// Before
interface SkillLifecyclePanelProps {
  onClose: () => void;
}

// After
interface SkillLifecyclePanelProps {
  onClose: () => void;
  onOpenSkillWizard: () => void;
}
```

### Step 6: 関数シグネチャの更新

```typescript
// Before
export function SkillLifecyclePanel({ onClose }: SkillLifecyclePanelProps) {

// After
export function SkillLifecyclePanel({ onClose, onOpenSkillWizard }: SkillLifecyclePanelProps) {
```

### Step 7: 不要 import の削除

`request` state や `handleCreate` / `handlePrepare` でのみ使用されていた import を削除する。

```bash
# 削除後の import を確認
head -20 apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx
```

### Step 8: 呼び出し元への対応

```bash
# 呼び出し元を確認し onOpenSkillWizard を渡す
rg -n "SkillLifecyclePanel" apps/desktop/src/ --glob "*.tsx"
```

呼び出し元で `onOpenSkillWizard` props を追加する（TypeScript エラーが発生した箇所を全て対応する）。

### Step 9: テスト実行（GREEN確認）

```bash
pnpm --filter @repo/desktop vitest run -- SkillLifecyclePanel
```

## 参照資料

| 資料名         | パス                                                                                 | 説明       |
| -------------- | ------------------------------------------------------------------------------------ | ---------- |
| 設計書         | `outputs/phase-2/design.md`                                                          | 実装の根拠 |
| テストファイル | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel*.test.tsx` | 検証基準   |

## 成果物

| 成果物       | パス                                                                 | 説明                  |
| ------------ | -------------------------------------------------------------------- | --------------------- |
| 実装ファイル | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` | 改修完了ファイル      |
| 実装記録     | `outputs/phase-5/implementation-record.md`                           | 変更内容・diff サマリ |

## 完了条件

- [ ] `request` state と setRequest が削除されている
- [ ] `handleCreate()` 関数が削除されている
- [ ] `handlePrepare()` 関数が削除されている
- [ ] テキストエリア（skill-lifecycle-request-input）が削除されている
- [ ] 「スキルを生成する」ボタン（skill-lifecycle-create-button）が削除されている
- [ ] 「方針を決める」ボタン（skill-lifecycle-prepare-button）が削除されている
- [ ] 「スキル作成ウィザードを開く →」ボタン（skill-lifecycle-open-wizard-button）が追加されている
- [ ] onOpenSkillWizard Props が追加されている
- [ ] 呼び出し元で onOpenSkillWizard が渡されている
- [ ] Phase 4 のテストが全てpassしている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 6: テスト拡充](./phase-6-test-expansion.md)
