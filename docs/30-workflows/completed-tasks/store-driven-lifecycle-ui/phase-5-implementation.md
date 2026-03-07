# Phase 5: 実装（TDD: Green） — Store駆動ライフサイクルUI統合

## メタ情報

| 項目      | 値                                |
| --------- | --------------------------------- |
| Phase     | 5                                 |
| 機能名    | store-driven-lifecycle-ui         |
| タスクID  | TASK-10A-F                        |
| 作成日    | 2026-03-07                        |
| 前提Phase | Phase 4 完了（全テスト Red 状態） |
| 次Phase   | Phase 6（テスト拡充）             |

## 目的

Phase 4 で作成した全テストを Green にするための最小限のコード変更を行う。SkillCreateWizard と useSkillAnalysis から `window.electronAPI` の直接呼び出しを排除し、Zustand agentSlice の store action と個別セレクタ経由に置換する。

## 参照資料

| 資料                                                                              | 用途                                                                                     |
| --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Phase 4 成果物（テストファイル4本）                                               | Green にすべきテスト一覧                                                                 |
| `apps/desktop/src/renderer/store/slices/agentSlice.ts:849-959`                    | 既存 store action（analyzeSkill, applySkillImprovements, autoImproveSkill, createSkill） |
| `apps/desktop/src/renderer/store/index.ts:625-649`                                | 既存個別セレクタ（useAnalyzeSkill 等）                                                   |
| `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx:46`             | 排除対象: `window.electronAPI.skill.create({...})`                                       |
| `apps/desktop/src/renderer/components/skill/hooks/useSkillAnalysis.ts:94,140,171` | 排除対象: `window.electronAPI.skill.analyze`, `.applyImprovements`, `.autoImprove`       |

## 既知のPitfall対策

| Pitfall | 対策                                                                                                          | 適用箇所                            |
| ------- | ------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| P5      | リスナー二重登録防止: `useEffect` 内のイベント登録はクリーンアップ関数で解除                                  | useSkillAnalysis                    |
| P31     | 合成Store Hookの戻り値関数を `useEffect` 依存配列に含めない。個別セレクタ（`useAnalyzeSkill()` 等）を使用する | useSkillAnalysis, SkillCreateWizard |
| P39     | happy-dom環境では `userEvent` 使用禁止。`fireEvent` を使用する                                                | テスト実行時                        |
| P40     | テスト実行は `cd apps/desktop && pnpm vitest run` で行う                                                      | テスト実行時                        |
| P48     | `.filter()` / `.map()` で新しい配列参照を返す派生セレクタには `useShallow` を適用する                         | 新規派生セレクタ追加時              |

## 実行タスク

### Task 1: SkillCreateWizard の直接IPC呼び出しを store action に置換

**対象ファイル**: `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`

#### 変更内容

1. `useCreateSkill` セレクタを `../../store` から import する
2. コンポーネント内で `const createSkill = useCreateSkill();` を呼び出す
3. `handleGenerate` 関数内の `window.electronAPI.skill.create({description, options})` を `createSkill(description, options)` に置換する
4. `createSkill` の戻り値（生成パス文字列）を `setSkillPath` に設定する
5. `createSkill` が空文字列を返した場合（= store 内部でエラー発生）をエラーとして処理する

#### 変更前後の対比

```typescript
// ❌ 変更前（SkillCreateWizard.tsx:41-58）
const handleGenerate = async () => {
  goToStep(2);
  setIsGenerating(true);
  setError(null);
  try {
    const result = await window.electronAPI.skill.create({
      description,
      options,
    });
    setSkillPath(result.path);
    goToStep(3);
  } catch (err) {
    setError(
      err instanceof Error ? err : new Error("スキル生成に失敗しました"),
    );
  } finally {
    setIsGenerating(false);
  }
};

// ✅ 変更後
const createSkill = useCreateSkill();

const handleGenerate = async () => {
  goToStep(2);
  setIsGenerating(true);
  setError(null);
  try {
    const path = await createSkill(description, options);
    if (path) {
      setSkillPath(path);
      goToStep(3);
    } else {
      setError(new Error("スキル生成に失敗しました"));
    }
  } catch (err) {
    setError(
      err instanceof Error ? err : new Error("スキル生成に失敗しました"),
    );
  } finally {
    setIsGenerating(false);
  }
};
```

### Task 2: useSkillAnalysis の直接IPC呼び出しを store action に置換

**対象ファイル**: `apps/desktop/src/renderer/components/skill/hooks/useSkillAnalysis.ts`

#### 変更内容

1. 以下の個別セレクタを `../../../store` から import する:
   - `useAnalyzeSkill`
   - `useApplySkillImprovements`
   - `useAutoImproveSkill`
   - `useCurrentAnalysis`
   - `useIsAnalyzingSkill`
   - `useIsImprovingSkill`
   - `useSkillError`
   - `useClearSkillError`
   - `useClearAnalysis`

2. Hook 内で各セレクタを呼び出して store の状態・アクションを取得する

3. `handleAnalyze` 内の `window.electronAPI.skill.analyze(skillName)` を `analyzeSkill(skillName)` に置換する

4. `handleApplySelected` 内の `window.electronAPI.skill.applyImprovements(skillName, selected)` を `applySkillImprovements(skillName, selected)` に置換する

5. `handleAutoImprove` 内の `window.electronAPI.skill.autoImprove(skillName)` を `autoImproveSkill(skillName)` に置換する

6. ローカル state（`analysis`, `isAnalyzing`, `isImproving`, `error`）を store の状態に置換する:
   - `useState<SkillAnalysis | null>(null)` → `useCurrentAnalysis()`
   - `useState<boolean>(false)` (isAnalyzing) → `useIsAnalyzingSkill()`
   - `useState<boolean>(false)` (isImproving) → `useIsImprovingSkill()`
   - `useState<string | null>(null)` (error) → `useSkillError()`

7. `selectedSuggestions` と `improvementResult` はローカル state のまま維持する（UI固有の選択状態であり store で管理する必要がない）

8. `isMountedRef` によるアンマウント後の setState ガードは、store action が store 内部で状態管理するため不要になる。`selectedSuggestions` と `improvementResult` のローカル state 更新のみガードする

#### P31対策の実装

```typescript
// ✅ 個別セレクタで取得（安定参照が保証される）
const analyzeSkill = useAnalyzeSkill();
const applySkillImprovements = useApplySkillImprovements();
const autoImproveSkill = useAutoImproveSkill();

// ✅ useEffect 依存配列に含めても安全
useEffect(() => {
  analyzeSkill(skillName);
}, [analyzeSkill, skillName]);
```

### Task 3: SkillManagementPanel の作成完了後一覧同期を store action 経由に統一

**対象ファイル**: `apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx`

#### 変更内容

SkillManagementPanel 自体は既に store セレクタ（`useFetchSkills` 等）を使用している。store の `createSkill` action 内部で `fetchSkills()` が呼ばれるため（agentSlice.ts:951）、SkillManagementPanel 側での追加変更は不要。

確認事項:

1. `SkillCreateWizard` の `onClose` コールバック経由で `setCurrentView("list")` が呼ばれる
2. store の `createSkill` action 内部で `fetchSkills()` が自動実行される
3. SkillManagementPanel は store の `importedSkills` と `availableSkillsMetadata` を購読しているため、`fetchSkills()` 完了後に自動で再レンダリングされる

### Task 4: 既存テストの更新

**対象ファイル**:

- `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx`
- `apps/desktop/src/renderer/components/skill/__tests__/SkillAnalysisView.test.tsx`

#### 変更方針

既存テストは直接 `window.electronAPI` をモックしているため、store action 経由に変更した後は以下の対応が必要:

1. **SkillCreateWizard.test.tsx**: store の `useCreateSkill` をモックするように変更する。`window.electronAPI.skill.create` のモックを `vi.mock("../../store", ...)` 経由の `useCreateSkill` モックに置換する
2. **SkillAnalysisView.test.tsx**: store の各セレクタをモックするように変更する。`mock-electron-api.ts` の `setupMockElectronAPI` から store セレクタモックに移行する

## 統合テスト連携

### store → IPC → Main Process のデータフロー確認

```
[Renderer]                              [Main Process]
SkillCreateWizard
  └─ useCreateSkill() ─── store.createSkill()
       └─ window.electronAPI.skill.create() ─── IPC ─── skill:create handler
            └─ store.fetchSkills() ─── window.electronAPI.skill.getImported() ─── IPC ─── skill:getImported handler

useSkillAnalysis
  └─ useAnalyzeSkill() ─── store.analyzeSkill()
       └─ window.electronAPI.skill.analyze() ─── IPC ─── skill:analyze handler
  └─ useApplySkillImprovements() ─── store.applySkillImprovements()
       └─ window.electronAPI.skill.applyImprovements() ─── IPC ─── skill:applyImprovements handler
       └─ window.electronAPI.skill.analyze() ─── IPC ─── skill:analyze handler（再分析）
  └─ useAutoImproveSkill() ─── store.autoImproveSkill()
       └─ window.electronAPI.skill.autoImprove() ─── IPC ─── skill:autoImprove handler
       └─ window.electronAPI.skill.analyze() ─── IPC ─── skill:analyze handler（再分析）
```

## 成果物

| 成果物                            | パス                                                                              |
| --------------------------------- | --------------------------------------------------------------------------------- |
| 変更済み SkillCreateWizard        | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                |
| 変更済み useSkillAnalysis         | `apps/desktop/src/renderer/components/skill/hooks/useSkillAnalysis.ts`            |
| 更新済み SkillCreateWizard テスト | `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx` |
| 更新済み SkillAnalysisView テスト | `apps/desktop/src/renderer/components/skill/__tests__/SkillAnalysisView.test.tsx` |

## 完了条件

- [ ] Task 1: SkillCreateWizard.tsx から `window.electronAPI.skill.create` の直接呼び出しが排除されている
- [ ] Task 2: useSkillAnalysis.ts から `window.electronAPI.skill.analyze`, `.applyImprovements`, `.autoImprove` の直接呼び出しが排除されている
- [ ] Task 3: SkillManagementPanel の作成完了後一覧同期が store action 経由で動作することを確認済み
- [ ] Task 4: 既存テスト（SkillCreateWizard.test.tsx, SkillAnalysisView.test.tsx）が store モックに更新されている
- [ ] Phase 4 で作成した全テスト（Store統合テスト、P31回帰テスト、P48回帰テスト）が Green 状態
- [ ] 既存テストが全て Green 状態（回帰なし）
- [ ] `grep -rn "window\.electronAPI\.skill\." apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx apps/desktop/src/renderer/components/skill/hooks/useSkillAnalysis.ts` の結果が空（直接呼び出しゼロ）
- [ ] `cd apps/desktop && pnpm vitest run` で全テスト PASS
- [ ] `pnpm lint` が通ること
- [ ] `pnpm typecheck` が通ること
- [ ] 本Phase内の全タスクを100%実行完了

## 次Phase

Phase 6: テスト拡充へ進む。
