# Phase 1: 仕様抽出マップ

## aiworkflow-requirements 正本との対応

| 仕様項目                            | 正本ファイル                                                       | 確認内容                                      |
| ----------------------------------- | ------------------------------------------------------------------ | --------------------------------------------- |
| createSkill シグネチャ              | `apps/desktop/src/renderer/store/slices/agentSlice.ts`             | 第4引数 `signal?: AbortSignal` を保持する     |
| createSkill 実装                    | `apps/desktop/src/renderer/store/slices/agentSlice.ts`             | Renderer guard で `signal?.aborted` を確認    |
| SkillCreateWizard handleGenerate    | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx` | `const signal = startGeneration()` を実装済み |
| useCancelGeneration startGeneration | `apps/desktop/src/renderer/hooks/useCancelGeneration.ts`           | AbortSignal 返値確認済み                      |
| IPC shape                           | window.electronAPI.skill.create                                    | { description, options, context } を維持する  |

## current contract の証拠

```
startGeneration() → AbortSignal を生成・返す
SkillCreateWizard.handleGenerate():
  const signal = startGeneration();
  const path = await createSkill(
    formData.purpose,
    SKILL_GENERATION_OPTIONS,
    skillContext,
    signal,
  );

agentSlice.createSkill():
  if (signal?.aborted) return "";
  window.electronAPI.skill.create({ description, options, context });
```

## スコープ境界

- **含む**: agentSlice.ts の型定義・実装、SkillCreateWizard.tsx の signal 受け渡し
- **含まない**: IPC ブリッジ層（window.electronAPI.skill.create の shape は変えない）
- **含まない**: Main 側 AbortController との接続（TASK-SC-ABORT-SIGNAL-CREATE-SKILL-001 で完了）
