# Phase 5: 実装レポート (UT-FIX-AGENTVIEW-INFINITE-LOOP-001)

## メタ情報

| 項目     | 値                                 |
| -------- | ---------------------------------- |
| タスクID | UT-FIX-AGENTVIEW-INFINITE-LOOP-001 |
| Phase    | 5 (実装)                           |
| 実施日   | 2026-02-12                         |

## 変更ファイル一覧

| ファイル                                                                 | 変更種別 | 概要                                                              |
| ------------------------------------------------------------------------ | -------- | ----------------------------------------------------------------- |
| `apps/desktop/src/renderer/store/index.ts`                               | 追加     | AgentView用の個別セレクタHook 15個を追加                          |
| `apps/desktop/src/renderer/views/AgentView/index.tsx`                    | 書き換え | インラインセレクタ→個別セレクタ移行、デバッグログ除去             |
| `apps/desktop/src/renderer/views/AgentView/__tests__/AgentView.test.tsx` | 書き換え | モック方式を個別セレクタベースに変更、無限ループ防止テスト3件追加 |

## 実装詳細

### Step 1: store/index.ts に個別セレクタHookを追加

`useClearStreamingMessages` の後に以下の15個の個別セレクタを追加:

**状態セレクタ（8個）**:

- `useSkills` - スキル一覧（レガシー）
- `useAvailableSkills` - 利用可能スキル一覧（レガシー）
- `useImportedSkillIds` - インポート済みスキルID一覧
- `useSelectedSkill` - 選択中のスキル
- `useSkillFilter` - スキルフィルター文字列
- `useSkillCategory` - スキルカテゴリフィルター
- `useIsImportDialogOpen` - インポートダイアログ表示状態
- `useToastMessage` - トーストメッセージ

**アクションセレクタ（7個）**:

- `useSelectSkill` - スキル選択
- `useSetSkillFilter` - フィルター設定
- `useSetSkillCategory` - カテゴリ設定
- `useOpenImportDialog` - インポートダイアログ開く
- `useCloseImportDialog` - インポートダイアログ閉じる
- `useShowToast` - トースト表示
- `useClearToast` - トーストクリア

### Step 2: AgentView/index.tsx の修正

#### 無限ループの原因と解決

**原因**:

1. `useAppStore((state) => state.setSkills)` のようなインラインセレクタは、Zustandの`useAppStore`が毎回新しいオブジェクト参照を返す
2. `fetchSkills` の `useCallback` がこれらを依存配列に含む
3. `useEffect([fetchSkills])` が `fetchSkills` の参照変更を検知して再実行
4. `fetchSkills` 内で `setSkills` を呼ぶとStore更新 → セレクタが新参照を返す → 以下ループ

**解決策**:

1. すべてのインラインセレクタを個別セレクタHook（`useIsLoadingSkills()`, `useSkillError()` 等）に置換
2. ローカルの `fetchSkills` / `fetchAvailableSkills` useCallback を廃止し、agentSliceの `useFetchSkills()` を使用
3. デバッグ用 `console.log` / `renderCount` を全削除
4. `useRef` や `useMemo` の不要な使用を排除

#### 変更の差分概要

| 変更前                                             | 変更後                                          |
| -------------------------------------------------- | ----------------------------------------------- |
| `import { useAppStore } from "../../store"`        | 個別セレクタ22個をimport                        |
| `useAppStore((state) => state.isLoading)`          | `useIsLoadingSkills()`                          |
| `useAppStore((state) => state.error)`              | `useSkillError()`                               |
| `useAppStore((state) => state.skills)`             | `useImportedSkills()` + `as unknown as Skill[]` |
| ローカル `fetchSkills = useCallback(...)`          | `useFetchSkills()`                              |
| ローカル `fetchAvailableSkills = useCallback(...)` | 削除（`useFetchSkills()`がavailableも取得）     |
| `renderCount` / `console.log`                      | 削除                                            |

### Step 3: テストモックの更新

モック方式を `useAppStore` セレクタパターンから個別セレクタモックに変更:

```typescript
// 変更前
vi.mock("../../../store", () => ({
  useAppStore: vi.fn((selector) => selector(createMockState())),
}));

// 変更後
vi.mock("../../../store", () => ({
  useAppStore: vi.fn(),
  useFetchSkills: vi.fn(() => mockFetchSkills),
  useImportedSkills: vi.fn(() => []),
  useIsLoadingSkills: vi.fn(() => false),
  // ... 各セレクタを個別にモック
}));
```

## テスト結果

```
 Test Files  1 passed (1)
      Tests  31 passed (31)
   Duration  2.90s (transform 466ms, setup 452ms, collect 608ms, tests 393ms)
```

全31テスト PASS。
