# Phase 5: 実装（TDD Green）

## メタ情報

| 項目     | 値                        |
| -------- | ------------------------- |
| Phase    | 5                         |
| タスクID | TASK-10A-F                |
| 機能名   | store-driven-lifecycle-ui |
| 作成日   | 2026-03-08                |

## 目的

Phase 4 で作成した Red テストを全て PASS させるために、SkillCreateWizard / SkillAnalysisView / useSkillAnalysis の直接 IPC 呼び出しを store action 経由に書き換える（Green Phase）。

## 実行タスク

- SkillCreateWizard: `window.electronAPI.skill.createSkill` → `useCreateSkill` hook 経由に変更（既に完了済みの場合は確認のみ）
- SkillAnalysisView / useSkillAnalysis: analyze / improve の直接 IPC 呼び出し → store action 経由（既に完了済みの場合は確認のみ）
- 個別セレクタ実装の確認（P31 対策）
- SkillManagementPanel の直接 IPC 呼び出し排除確認

## 参照資料

| 資料名                 | パス                                                                                        | 説明                        |
| ---------------------- | ------------------------------------------------------------------------------------------- | --------------------------- |
| Phase 4 テスト         | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/phase-4-test-creation.md`      | テストケース一覧            |
| 状態管理仕様           | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | action/selector 責務分離    |
| 実装パターン           | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | Store 駆動 UI パターン      |
| Skill インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | create/analyze/improve 契約 |
| IPC API 仕様           | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | チャネル責務境界            |
| エラー仕様             | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | エラーカテゴリとコード範囲  |

### 前 Phase 成果物

| 資料名         | パス                                                                                   | 用途               |
| -------------- | -------------------------------------------------------------------------------------- | ------------------ |
| Phase 4 成果物 | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/phase-4-test-creation.md` | テストケースを参照 |

## 実行手順

### ステップ 1: 現在の実装状態を確認

1. 以下のファイルで `window.electronAPI` の直接呼び出しが残っていないか確認する:

```bash
cd apps/desktop && grep -rn "window\.electronAPI" src/renderer/components/skill/
```

2. 確認対象ファイル:
   - `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`
   - `apps/desktop/src/renderer/components/skill/SkillAnalysisView.tsx`
   - `apps/desktop/src/renderer/components/skill/hooks/useSkillAnalysis.ts`
   - `apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx`

3. 各ファイルが store セレクタ（`useCreateSkill`, `useAnalyzeSkill` 等）を import しているか確認する

### ステップ 2: SkillCreateWizard の Store 統合確認・修正

**対象ファイル**: `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`

**確認項目**:

| 項目                        | 期待する状態                                                                 |
| --------------------------- | ---------------------------------------------------------------------------- |
| `useCreateSkill` の import  | `../../store` から import されている                                         |
| `createSkill` の呼び出し    | `handleGenerate` 内で `const path = await createSkill(description, options)` |
| `window.electronAPI` の不在 | ファイル内に `window.electronAPI` が存在しない                               |
| エラーハンドリング          | `try/catch` で Error を catch し、Error 以外は フォールバックメッセージ      |
| 状態遷移                    | `isGenerating` のローカル state で生成中を管理                               |

**修正が必要な場合のコード変更**:

`window.electronAPI.skill.create(description, options)` を以下に置き換える:

```typescript
import { useCreateSkill } from "../../store";

const createSkill = useCreateSkill();

const handleGenerate = async () => {
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

### ステップ 3: useSkillAnalysis の Store 統合確認・修正

**対象ファイル**: `apps/desktop/src/renderer/components/skill/hooks/useSkillAnalysis.ts`

**確認項目**:

| 項目                        | 期待する状態                                                                                                                                                                               |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 個別セレクタ import         | `useCurrentAnalysis`, `useIsAnalyzingSkill`, `useIsImprovingSkill`, `useSkillError`, `useAnalyzeSkill`, `useApplySkillImprovements`, `useAutoImproveSkill` が `../../../store` から import |
| `window.electronAPI` の不在 | ファイル内に `window.electronAPI` が存在しない                                                                                                                                             |
| `handleAnalyze`             | `analyzeSkill(skillName)` を呼び出し、catch 内で UIクラッシュ防止                                                                                                                          |
| `handleApplySelected`       | `applySkillImprovements(skillName, selected)` を呼び出す                                                                                                                                   |
| `handleAutoImprove`         | `window.confirm` で確認後 `autoImproveSkill(skillName)` を呼び出す                                                                                                                         |
| P31 対策                    | action セレクタは個別セレクタ（`useAnalyzeSkill()` 等）で取得                                                                                                                              |
| `useCallback` 依存配列      | `[analyzeSkill, skillName]` のように個別セレクタ参照のみ含む                                                                                                                               |
| `useEffect` 依存配列        | `[handleAnalyze]` で初回マウント時に分析を実行                                                                                                                                             |

**修正が必要な場合の重要ポイント**:

```typescript
// P31 対策: 合成 Hook（useAgentStore()）ではなく個別セレクタを使用
const analyzeSkill = useAnalyzeSkill(); // 安定参照
const applySkillImprovements = useApplySkillImprovements(); // 安定参照
const autoImproveSkill = useAutoImproveSkill(); // 安定参照
```

### ステップ 4: SkillManagementPanel の確認

**対象ファイル**: `apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx`

**確認項目**:

| 項目                        | 期待する状態                                                        |
| --------------------------- | ------------------------------------------------------------------- |
| store セレクタ import       | `useImportedSkills`, `useFetchSkills`, `useRemoveSkill` 等が import |
| `window.electronAPI` の不在 | ファイル内に `window.electronAPI` が存在しない                      |
| `removeSkill` の呼び出し    | store action 経由で `removeSkill(skillName)` を呼び出す             |
| `fetchSkills` の呼び出し    | `useEffect` 内で `fetchSkills()` を呼び出す                         |

### ステップ 5: store/index.ts のセレクタエクスポート確認

**対象ファイル**: `apps/desktop/src/renderer/store/index.ts`

以下の個別セレクタが export されていることを確認する:

| セレクタ名                  | 型                                                                               | 説明                   |
| --------------------------- | -------------------------------------------------------------------------------- | ---------------------- |
| `useCreateSkill`            | `() => (description: string, options: WizardOptions) => Promise<string \| null>` | スキル作成 action      |
| `useAnalyzeSkill`           | `() => (skillName: string) => Promise<void>`                                     | スキル分析 action      |
| `useApplySkillImprovements` | `() => (skillName: string, suggestions: Suggestion[]) => Promise<void>`          | 改善適用 action        |
| `useAutoImproveSkill`       | `() => (skillName: string) => Promise<void>`                                     | 全自動改善 action      |
| `useCurrentAnalysis`        | `() => SkillAnalysis \| null`                                                    | 現在の分析結果         |
| `useIsAnalyzingSkill`       | `() => boolean`                                                                  | 分析中フラグ           |
| `useIsImprovingSkill`       | `() => boolean`                                                                  | 改善中フラグ           |
| `useSkillError`             | `() => string \| null`                                                           | スキルエラーメッセージ |

### ステップ 6: テスト実行と Green 確認

1. Phase 4 で作成した全テストを実行し、PASS することを確認する:

```bash
cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/SkillCreateWizard.store-integration.test.tsx
cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/SkillAnalysisView.store-integration.test.tsx
cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/useSkillAnalysis.test.ts
```

2. 既存テストも含めた全テスト実行:

```bash
cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/
```

3. TypeScript 型チェック:

```bash
pnpm --filter @repo/desktop typecheck
```

### ステップ 7: 直接 IPC 呼び出し排除の最終検証

以下のコマンドで `window.electronAPI` の直接呼び出しが skill コンポーネント内に残っていないことを最終確認する:

```bash
cd apps/desktop && grep -rn "window\.electronAPI" src/renderer/components/skill/ --include="*.tsx" --include="*.ts" | grep -v "__tests__" | grep -v "\.test\."
```

このコマンドの出力が空であることを確認する。テストファイル内のスパイ定義は除外する。

## 統合テスト連携

### TASK-10A-G への引き渡し確認

Phase 5 完了時点で以下が保証される:

| 保証事項                                 | 検証方法                                       |
| ---------------------------------------- | ---------------------------------------------- |
| 全 UI コンポーネントが store action 経由 | `grep` で `window.electronAPI` 不在を確認      |
| 個別セレクタが P31 対策済み              | TC-P31-01 〜 TC-P31-05 が PASS                 |
| 状態遷移が store state で一元管理        | TC-AV-07, TC-AV-08, TC-CW-03, TC-CW-04 が PASS |
| エラーハンドリングが store 経由          | `skillError` state 経由でエラー表示            |

## 多角的チェック観点

| 観点             | 確認事項                                                                     |
| ---------------- | ---------------------------------------------------------------------------- |
| 直接 IPC 排除    | `grep` で skill コンポーネント内に `window.electronAPI` が不在               |
| P31 安定参照     | 個別セレクタ使用、合成 Hook 不使用                                           |
| P42 トリム検証   | store action 内部で引数の `.trim()` 検証が行われている                       |
| レイヤー依存方向 | Renderer → Store → (IPC) の一方向依存                                        |
| 型安全           | `pnpm typecheck` が PASS                                                     |
| エラーカテゴリ   | store action 内部で ERR_3001/ERR_4004 等のエラーコードを `skillError` に格納 |

## 成果物

| 成果物                        | パス                                                                   | 説明                                |
| ----------------------------- | ---------------------------------------------------------------------- | ----------------------------------- |
| SkillCreateWizard（修正確認） | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`     | store action 経由に統一済み         |
| useSkillAnalysis（修正確認）  | `apps/desktop/src/renderer/components/skill/hooks/useSkillAnalysis.ts` | 個別セレクタ経由に統一済み          |
| SkillAnalysisView（修正不要） | `apps/desktop/src/renderer/components/skill/SkillAnalysisView.tsx`     | useSkillAnalysis 経由のため変更不要 |
| SkillManagementPanel（確認）  | `apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx`  | store セレクタ経由を確認            |

## 完了条件

- [ ] `SkillCreateWizard.tsx` 内に `window.electronAPI` の直接呼び出しが存在しない
- [ ] `useSkillAnalysis.ts` 内に `window.electronAPI` の直接呼び出しが存在しない
- [ ] `SkillAnalysisView.tsx` 内に `window.electronAPI` の直接呼び出しが存在しない
- [ ] `SkillManagementPanel.tsx` 内に `window.electronAPI` の直接呼び出しが存在しない
- [ ] 全個別セレクタ（`useCreateSkill`, `useAnalyzeSkill`, `useApplySkillImprovements`, `useAutoImproveSkill`, `useCurrentAnalysis`, `useIsAnalyzingSkill`, `useIsImprovingSkill`, `useSkillError`）が `store/index.ts` から export されている
- [ ] Phase 4 のテスト TC-CW-01 〜 TC-CW-07 が全て PASS
- [ ] Phase 4 のテスト TC-AV-01 〜 TC-AV-11 が全て PASS
- [ ] Phase 4 のテスト TC-UA-01 〜 TC-UA-09 が全て PASS
- [ ] Phase 4 のテスト TC-P31-01 〜 TC-P31-05, TC-P48-01 が全て PASS
- [ ] `pnpm --filter @repo/desktop typecheck` が PASS
- [ ] `grep -rn "window\.electronAPI" src/renderer/components/skill/ --include="*.tsx" --include="*.ts" | grep -v "__tests__"` の出力が空

## 次の Phase

Phase 6: テスト拡充（`docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/phase-6-test-expansion.md`）
