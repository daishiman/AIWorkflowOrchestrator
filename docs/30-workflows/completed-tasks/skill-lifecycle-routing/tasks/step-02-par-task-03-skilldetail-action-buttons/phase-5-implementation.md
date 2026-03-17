# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| Phase      | 5                                       |
| Phase名    | 実装                                    |
| タスクID   | TASK-IMP-SKILLDETAIL-ACTION-BUTTONS-001 |
| 前提Phase  | Phase 4（テスト作成 Red 確認済み）      |
| 後続Phase  | Phase 6（テスト拡充）                   |
| ステータス | not_started                             |
| 作成日     | 2026-03-17                              |
| 機能名     | skilldetail-action-buttons              |

## 目的

Phase 4 で作成した TC-01〜TC-08 が Green（成功）になるプロダクションコードを実装する。変更ファイルは3つ: `SkillDetailPanel.tsx`・`useSkillCenter.ts`・`SkillCenterView/index.tsx`。

## 前提条件

- Phase 4 でテストが Red 状態であることを確認済みであること
- Task01（TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001）の Phase 3 が完了し、`skillAnalysis` ViewType が `store/types.ts` に追加済みであること（依存関係）

## 実行タスク

実装は以下の順序で行う:

1. `SkillDetailPanelProps` を拡張する（onEdit / onAnalyze 追加）
2. `PanelContent` にアクションボタンゾーンを追加する
3. `useSkillCenter` に `handleEditSkill` / `handleAnalyzeSkill` を追加する
4. `SkillCenterView/index.tsx` で prop バインディングを追加する
5. テストを実行して Green になることを確認する

## 実装詳細

### Step 1: SkillDetailPanelProps 拡張

**対象ファイル**: `apps/desktop/src/renderer/views/SkillCenterView/components/SkillDetailPanel/SkillDetailPanel.tsx`

```typescript
// SkillDetailPanelProps に以下を追加する
export interface SkillDetailPanelProps {
  skillName: string | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (skillName: string) => void;
  isImported: boolean;
  skill?: SkillMetadata | ImportedSkill;
  /** 編集ボタンクリック時のハンドラ（インポート済みスキルのみ有効） */
  onEdit?: (skillName: string) => void;
  /** 分析ボタンクリック時のハンドラ（インポート済みスキルのみ有効） */
  onAnalyze?: (skillName: string) => void;
}
```

### Step 2: PanelContent にアクションボタンゾーンを追加する

`PanelContent` コンポーネントに `onEdit` / `onAnalyze` を prop として追加し、danger zone の上部に配置する。

```tsx
// PanelContent 内の danger zone 直前に追加
{
  isImported && onEdit && onAnalyze && (
    <div className="flex gap-3" data-testid="action-buttons-zone">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => skillName && onEdit(skillName)}
        leftIcon="edit-2"
        data-testid="edit-skill-button"
        className="flex-1"
      >
        エディタで開く
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => skillName && onAnalyze(skillName)}
        leftIcon="bar-chart-2"
        data-testid="analyze-skill-button"
        className="flex-1"
      >
        分析する
      </Button>
    </div>
  );
}
```

**注意事項**:

- `Button` コンポーネントは `apps/desktop/src/renderer/components/atoms/Button/index.tsx` から import する
- `variant="secondary"` / `size="sm"` / `leftIcon` の利用可能な値を実装前に Button のソースで確認する
- `className="flex-1"` で2ボタンを均等幅に設定する（Apple HIG 8px Grid 準拠）
- `data-testid` は TC-01〜TC-04 のテストが依存するため省略不可

### Step 3: useSkillCenter に遷移ハンドラを追加する

**対象ファイル**: `apps/desktop/src/renderer/views/SkillCenterView/hooks/useSkillCenter.ts`

```typescript
// 既存のハンドラ（handleCloseDetail 等）の後に追加
const handleEditSkill = useCallback(
  (skillName: string) => {
    setCurrentSkillName(skillName);
    setCurrentView("skill-editor");
    handleCloseDetail();
  },
  [setCurrentSkillName, setCurrentView, handleCloseDetail],
);

// NOTE: skillAnalysis ViewType は Task01 完了後に利用可能になる
const handleAnalyzeSkill = useCallback(
  (skillName: string) => {
    setCurrentSkillName(skillName);
    setCurrentView("skillAnalysis");
    handleCloseDetail();
  },
  [setCurrentSkillName, setCurrentView, handleCloseDetail],
);

// return オブジェクトに以下を追加する
return {
  // ...既存の返却値,
  handleEditSkill,
  handleAnalyzeSkill,
};
```

**注意事項**:

- `setCurrentSkillName` / `setCurrentView` は `navigationSlice` の個別セレクタで取得する（P31 対策）
- `handleCloseDetail` は既存の実装を再利用する（新たに定義しない）
- `useCallback` の依存配列は正確に記述する（ESLint の `react-hooks/exhaustive-deps` 準拠）

### Step 4: SkillCenterView/index.tsx で prop バインディングを追加する

**対象ファイル**: `apps/desktop/src/renderer/views/SkillCenterView/index.tsx`

```tsx
// useSkillCenter から handleEditSkill / handleAnalyzeSkill を分割代入で取得
const {
  // ...既存,
  handleEditSkill,
  handleAnalyzeSkill,
} = useSkillCenter();

// SkillDetailPanel への prop バインディングに追加
<SkillDetailPanel
  skillName={detailSkillName}
  isOpen={isDetailOpen}
  onClose={handleCloseDetail}
  onDelete={handleRequestDelete}
  isImported={isDetailImported}
  skill={detailSkill}
  onEdit={handleEditSkill} // 追加
  onAnalyze={handleAnalyzeSkill} // 追加
/>;
```

## 実装後の確認コマンド

```bash
# テストを実行して Green であることを確認
cd apps/desktop && pnpm vitest run src/renderer/views/SkillCenterView/__tests__/

# TypeScript 型チェック
cd apps/desktop && pnpm typecheck

# ESLint
cd apps/desktop && pnpm lint
```

## 参照資料

| 参照資料                   | パス                                                                                               | 内容                                                    |
| -------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Phase 4（テスト作成）      | `phase-4-test-creation.md`                                                                         | Green にすべきテストケースを確認する                    |
| Phase 2（設計）            | `phase-2-design.md`                                                                                | 実装の設計仕様（Props・マークアップ・遷移フロー）を確認 |
| SkillDetailPanel 実装      | `apps/desktop/src/renderer/views/SkillCenterView/components/SkillDetailPanel/SkillDetailPanel.tsx` | 現行実装の構造を確認する                                |
| useSkillCenter 実装        | `apps/desktop/src/renderer/views/SkillCenterView/hooks/useSkillCenter.ts`                          | 既存ハンドラの実装を確認する                            |
| Button コンポーネント      | `apps/desktop/src/renderer/components/atoms/Button/index.tsx`                                      | variant / size / leftIcon の利用可能な値を確認する      |
| navigationSlice            | `apps/desktop/src/renderer/store/slices/navigationSlice.ts`                                        | setCurrentView / setCurrentSkillName の API を確認する  |
| P31（合成Hook無限ループ）  | `.claude/rules/06-known-pitfalls.md#P31`                                                           | 個別セレクタ使用の必要性を確認する                      |
| P44（IPC引数命名ドリフト） | `.claude/rules/06-known-pitfalls.md#P44`                                                           | Props の命名と実態の一致を確認する                      |

## 統合テスト連携

- 本Phaseの変更点が受入基準（AC）と追跡可能であることを確認する
- 前Phase成果物と本Phaseテスト（単体・統合・手動）の対応関係を記録する
- 未達・差分がある場合は戻り先Phaseと再実行条件を明記する

## 成果物

| 成果物                  | パス                                        | 内容                                     |
| ----------------------- | ------------------------------------------- | ---------------------------------------- |
| テスト実行ログ（Green） | `outputs/phase-5/test-run-green.md`         | テスト実行結果（成功ログ）を記録する     |
| 実装変更サマリー        | `outputs/phase-5/implementation-summary.md` | 各ファイルの変更内容・変更行数を記録する |

## 完了条件

- [ ] `SkillDetailPanelProps` に `onEdit?: (skillName: string) => void` / `onAnalyze?: (skillName: string) => void` が追加されている
- [ ] `PanelContent` 内の danger zone 上部にアクションボタンゾーンが追加されている
- [ ] `data-testid="action-buttons-zone"` / `data-testid="edit-skill-button"` / `data-testid="analyze-skill-button"` が設定されている
- [ ] `useSkillCenter` に `handleEditSkill` / `handleAnalyzeSkill` が追加され、return に含まれている
- [ ] `SkillCenterView/index.tsx` で `onEdit={handleEditSkill}` / `onAnalyze={handleAnalyzeSkill}` がバインディングされている
- [ ] TC-01〜TC-08 が全て Green（成功）である
- [ ] `pnpm typecheck` が PASS している
- [ ] `pnpm lint` が PASS している
- [ ] **本Phase内の全タスクを100%実行完了**

## 次の Phase

- [Phase 6（テスト拡充）](./phase-6-test-expansion.md) に進む
