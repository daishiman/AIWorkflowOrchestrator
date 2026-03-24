# Phase 8: リファクタリング

## メタ情報

| 項目     | 値                               |
| -------- | -------------------------------- |
| Phase    | 8                                |
| タスクID | TASK-SC-06-UI-RUNTIME-CONNECTION |
| 機能名   | w4b-2-sc-ui-runtime-connection   |
| 作成日   | 2026-03-22                       |
| 更新日   | 2026-03-24                       |

## 目的

Phase 5 で実装した plan/execute ロジックのコード品質を向上させる。具体的には、SkillLifecyclePanel 内の LLM 生成ロジックをカスタム Hook として抽出し、条件分岐を整理し、リファクタリング後も全テストが Green のまま維持されることを確認する。

## 依存関係

- 前提成果物: Phase 5 実装コード（SkillLifecyclePanel.tsx, agentSlice.ts, store/index.ts）
- 前提成果物: Phase 7 カバレッジ確認（全基準達成済み）

## 実行タスク

### Task 1: useSkillLLMGeneration カスタム Hook の抽出

#### 対象ファイル

- 新規: `apps/desktop/src/renderer/hooks/useSkillLLMGeneration.ts`
- 変更: `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`

#### 抽出するロジック

Phase 5 で実装した以下のロジックを Hook に移動する:

- `handlePlanSkill(description: string)`: planSkill IPC 呼び出し + 状態更新
- `handleExecutePlan()`: executePlan IPC 呼び出し + スキル選択 + 状態クリア
- Zustand 個別セレクタ（useIsSkillGenerating, useGenerationProgress 等）の呼び出し
- skillCreatorApi 参照（`window.electronAPI?.skillCreator`）

#### Hook のインターフェース設計

```typescript
// apps/desktop/src/renderer/hooks/useSkillLLMGeneration.ts

export interface UseSkillLLMGenerationReturn {
  // 状態（読み取り専用）
  isGenerating: boolean;
  generationProgress: string | null;
  generationError: string | null;
  currentPlanId: string | null;
  currentPlanResult: RuntimeSkillCreatorPlanResponse | null;

  // アクション
  handlePlanSkill: (description: string) => Promise<void>;
  handleExecutePlan: () => Promise<void>;
  clearGenerationState: () => void;
}

export function useSkillLLMGeneration(): UseSkillLLMGenerationReturn {
  // Zustand 個別セレクタ（P31 対策: 合成 Hook 不使用）
  const isGenerating = useIsSkillGenerating();
  const generationProgress = useGenerationProgress();
  const generationError = useGenerationError();
  const currentPlanId = useCurrentPlanId();
  const currentPlanResult = useCurrentPlanResult();
  const setIsGenerating = useSetIsSkillGenerating();
  const clearGenerationState = useClearGenerationState();

  // ... handlePlanSkill, handleExecutePlan 実装
  return {
    isGenerating,
    generationProgress,
    generationError,
    currentPlanId,
    currentPlanResult,
    handlePlanSkill,
    handleExecutePlan,
    clearGenerationState,
  };
}
```

#### SkillLifecyclePanel.tsx の変更内容

抽出後の SkillLifecyclePanel は Hook を呼び出すだけになる:

```typescript
// Before: コンポーネント内にロジックが散在
const handlePlanSkill = async (description: string) => {
  /* 長いロジック */
};
const handleExecutePlan = async () => {
  /* 長いロジック */
};

// After: Hook に委譲
const {
  isGenerating,
  generationProgress,
  generationError,
  currentPlanId,
  currentPlanResult,
  handlePlanSkill,
  handleExecutePlan,
  clearGenerationState,
} = useSkillLLMGeneration();
```

### Task 2: 条件分岐の整理

#### 対象箇所

`handlePrepare()` 内の detectMode 結果による分岐:

```typescript
// Before: 分岐が暗黙的
const result = await skillCreatorApi.detectMode(trimmedRequest);
setDetectedMode(result.data);
if (result.data === "plan" || result.data === "improve") {
  await handlePlanSkill(trimmedRequest);
}

// After: 判定関数を切り出して意図を明確化
const shouldUseLLMGeneration = (mode: SkillCreatorMode | undefined): boolean =>
  mode === "plan" || mode === "improve";

const result = await skillCreatorApi.detectMode(trimmedRequest);
setDetectedMode(result.data);
if (shouldUseLLMGeneration(result.data)) {
  await handlePlanSkill(trimmedRequest);
}
```

#### R-1 対応の確認（Phase 3 指摘事項）

handlePlanSkill 冒頭の `isGenerating` ガードが実装されているか確認する:

```typescript
// 必須: isGenerating ガード（Phase 3 R-1 対応）
const handlePlanSkill = async (description: string) => {
  if (isGenerating) return; // 二重呼出防止
  setIsGenerating(true);
  // ...
};
```

未実装の場合は Phase 8 で追加する。

### Task 3: Zustand Slice の責務確認

#### 確認内容

- `agentSlice.ts` に追加した 5 フィールド（isGenerating, generationProgress, generationError, currentPlanId, currentPlanResult）が他の Slice（skillSlice 等）と責務重複していないか確認する
- 重複がある場合は統合または削除する

#### 確認手順

```bash
# isGenerating 類似フィールドの全 Slice 横断検索
grep -rn "isGenerating\|generationProgress\|generationError\|currentPlanId" \
  apps/desktop/src/renderer/store/slices/
```

期待結果: `agentSlice.ts` のみに定義されている。

### Task 4: 未使用 import の除去

```bash
# 未使用 import の確認（ESLint で自動検出）
pnpm --filter @repo/desktop lint -- --rule "no-unused-vars: error"
```

SkillLifecyclePanel.tsx からロジックを Hook に移動した場合、以下の import が不要になる可能性がある:

- `useIsSkillGenerating`, `useGenerationProgress` 等の個別セレクタ（Hook 内部に移動）
- `RuntimeSkillCreatorPlanResponse` 型（Hook の戻り値型として Hook ファイルに移動）

### Task 5: リファクタリング後のテスト実行

リファクタリングは「振る舞いを変えず、構造のみ改善する」原則を守る。

```bash
# デスクトップパッケージの全テスト実行
cd apps/desktop && pnpm vitest run src/renderer/components/skill/

# 新規 Hook のテスト（抽出した場合）
cd apps/desktop && pnpm vitest run src/renderer/hooks/useSkillLLMGeneration.test.ts
```

全テスト Green を確認してから次の Phase に進む。

## 参照資料

- Phase 5 実装コード
- `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`
- `apps/desktop/src/renderer/store/slices/agentSlice.ts`
- `apps/desktop/src/renderer/store/index.ts`
- `.claude/rules/02-code-quality.md`（SRP 原則）
- `.claude/rules/03-state-management.md`（Zustand 設計原則）
- `.claude/rules/06-known-pitfalls.md`（P31: 合成 Hook 無限ループ防止）

## 実行手順

### ステップ1: useSkillLLMGeneration Hook 抽出判断

SkillLifecyclePanel 内の plan/execute ロジックが100行を超える場合は Hook 抽出を実施する。100行未満の場合は理由を記録して抽出しない。

### ステップ2: 条件分岐の整理

`shouldUseLLMGeneration()` 判定関数を切り出し、detectMode 結果の分岐意図を明確化する。

### ステップ3: Zustand Slice 責務確認

agentSlice.ts の新規5フィールドが他の Slice と責務重複していないことを `grep` で確認する。

### ステップ4: 未使用 import の除去

ESLint で未使用 import を検出・除去する。

### ステップ5: テスト Green 確認

リファクタリング後に全テストが Green のままであることを確認する。

## 統合テスト連携

- Phase 4 テスト（U-1〜U-12）がリファクタリング後も全て PASS することを確認
- Phase 6 テスト（E-1〜E-10、E-S-1〜E-S-3）がリファクタリング後も全て PASS することを確認
- Hook 抽出した場合、既存テストの mock パスが変更されていないことを確認
- 既存の `SkillLifecyclePanel.test.tsx` テストに影響がないことを確認

## 多角的チェック観点

| 観点            | 適用判断 | 確認内容                             |
| --------------- | -------- | ------------------------------------ |
| SRP（単一責務） | 該当     | Hook 抽出による責務分離の妥当性      |
| 後方互換        | 該当     | リファクタリング後のテスト全 Green   |
| P31 対策        | 該当     | 合成 Hook 不使用の維持               |
| コード品質      | 該当     | 未使用 import 除去、条件分岐の明確化 |

## サブタスク管理

| サブタスク                  | 担当           | 状態   | 備考                   |
| --------------------------- | -------------- | ------ | ---------------------- |
| Task 1: Hook 抽出判断・実施 | Phase 8 実行者 | 未着手 | 100行基準              |
| Task 2: 条件分岐整理        | Phase 8 実行者 | 未着手 | shouldUseLLMGeneration |
| Task 3: Slice 責務確認      | Phase 8 実行者 | 未着手 | grep 横断検索          |
| Task 4: 未使用 import 除去  | Phase 8 実行者 | 未着手 | ESLint                 |
| Task 5: テスト Green 確認   | Phase 8 実行者 | 未着手 | 全テスト実行           |

## 成果物

- 新規 `apps/desktop/src/renderer/hooks/useSkillLLMGeneration.ts`（抽出した場合）
- リファクタリング済み `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`
- テスト実行結果（全 Green 確認）

## 完了条件

- [ ] useSkillLLMGeneration Hook の抽出可否を判断した（抽出が合理的でない場合は理由を記録）
- [ ] 抽出した場合: Hook のインターフェースが `UseSkillLLMGenerationReturn` 型に準拠している
- [ ] shouldUseLLMGeneration 判定関数を切り出して条件分岐を明確化した
- [ ] R-1 対応（isGenerating ガード）が実装されていることを確認した
- [ ] Zustand Slice の責務重複がないことを確認した
- [ ] 未使用 import を除去した
- [ ] リファクタリング後に全テストが Green のままであることを確認した

## タスク100%実行確認【必須】

- [ ] 上記「完了条件」の全チェックボックスが ON であることを確認した
- [ ] 「実行手順」の全ステップを実行した
- [ ] 「サブタスク管理」の全タスクが完了状態である
- [ ] 「統合テスト連携」の全項目を確認した
- [ ] 「多角的チェック観点」の全観点を確認した
- [ ] 成果物が全て生成されている

## 次のPhase

Phase 9: 品質検証
