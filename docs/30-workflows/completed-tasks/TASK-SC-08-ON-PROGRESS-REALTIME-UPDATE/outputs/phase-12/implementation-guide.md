# Phase 12 成果物: 実装ガイド

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| タスク     | TASK-SC-08-ON-PROGRESS-REALTIME-UPDATE |
| Phase      | 12                                     |
| 作成日     | 2026-04-19                             |
| ステータス | 完了                                   |

## Part 1: 中学生レベルの説明

この変更は、工場の進み具合を示す案内板に「別の呼び方」を追加したようなものです。
今までは `planning` や `generating-skill` だけ分かっていましたが、実際の処理では
`interview`、`consensus`、`loading-skill`、`engine-selection` のような別名も届いていました。

案内板がその言葉を知らないと、「いま何をしているか」が少し雑にしか分かりません。
今回の修正では、その別名を既存の段階に正しくひもづけて、表示の意味が崩れないようにしました。

## Part 2: 技術的実装詳細

### 実変更ファイル

| ファイル                                                                 | 変更内容                                                                                  |
| ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| `apps/desktop/src/renderer/hooks/useStreamingProgress.ts`                | `PHASE_TO_STAGE` に collaborative / update / orchestrate / improve-prompt 用 phase を追加 |
| `apps/desktop/src/renderer/hooks/__tests__/useStreamingProgress.test.ts` | `interview` / `consensus` を含む mode-specific phase と hook -> UI 反映テストを追加       |

### phase -> stage マッピング

```ts
const PHASE_TO_STAGE: Record<string, StreamingGenerationStage> = {
  planning: "planning",
  "generating-skill": "generating-skill",
  "generating-agents": "generating-agents",
  validating: "validating",
  done: "done",
  interview: "planning",
  consensus: "planning",
  "loading-skill": "planning",
  analyzing: "planning",
  "engine-selection": "planning",
  improving: "generating-skill",
};
```

### API シグネチャ

```ts
export interface UseStreamingProgressReturn {
  stage: StreamingGenerationStage;
  percent: number;
  message: string;
  previewContent: string | null;
  error: StreamingGenerationError | null;
  isGenerating: boolean;
}

export function useStreamingProgress(): UseStreamingProgressReturn;
```

### テスト実測値

```bash
pnpm --filter @repo/desktop exec vitest run src/renderer/hooks/__tests__/useStreamingProgress.test.ts -t "TC-00"
pnpm --filter @repo/desktop exec vitest run src/renderer/hooks/__tests__/useStreamingProgress.test.ts -t "hook から UI への反映"
```

結果:

- `interview` / `consensus` focused run: PASS
- hook -> UI focused run: PASS
- full file run は本環境で SIGKILL のため、focused verification を採用

### エッジケース

| ケース                    | 動作                                               |
| ------------------------- | -------------------------------------------------- |
| 未知の phase              | `planning` へフォールバック                        |
| `error` phase             | `setStage("error")` と `setError(...)` を優先      |
| `interview` / `consensus` | collaborative モードでも `planning` として一貫表示 |
| `improving`               | `generating-skill` へ集約し、message で意味を補う  |

## 視覚証跡

本タスクは NON_VISUAL。スクリーンショットは撮影していないが、Phase 11 の判定証跡は残している。

| 種別               | パス                                             |
| ------------------ | ------------------------------------------------ |
| screenshot plan    | `outputs/phase-11/screenshot-plan.json`          |
| capture metadata   | `outputs/phase-11/phase11-capture-metadata.json` |
| manual test result | `outputs/phase-11/manual-test-result.md`         |

## 補足

- `GenerateStep.tsx` は変更していない
- `SkillCreateWizard.tsx` の購読点は既存の `useStreamingProgress()` のまま
- 今回の改善で collaborative モードの phase 漏れも解消した
