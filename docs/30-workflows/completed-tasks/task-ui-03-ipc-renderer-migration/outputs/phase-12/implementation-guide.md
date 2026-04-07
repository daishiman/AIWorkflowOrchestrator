# Phase 12 Implementation Guide

## メタ情報

| 項目     | 内容                              |
| -------- | --------------------------------- |
| Phase    | 12                                |
| 機能名   | task-ui-03-ipc-renderer-migration |
| 証跡方式 | NON_VISUAL                        |
| 作成日   | 2026-04-07                        |

## Part 1

### なぜ必要か

2つの入口があると、どこを直せばよいか分かりにくくなります。今回の整理は、renderer が見る窓口を 1 つにそろえて、調べる場所と使う場所を迷わないようにするためです。

### 何をするか

`window.skillCreatorAPI` を renderer の主な窓口として使います。`window.electronAPI.skillCreator` は preload 側の互換シムとして残し、古い経路を renderer から直接触らないようにします。

### 日常の例え

たとえば、学校の連絡を「連絡帳」と「LINE」の 2 つで送っていたら、どちらを見ればよいか毎回迷います。そこで「先生への連絡は LINE に統一する。ただし、しばらくは連絡帳も保管だけする」と決めるのが今回の整理に近いです。

### 今回作ったもの

| 日本語                            | 役割                    |
| --------------------------------- | ----------------------- |
| `window.skillCreatorAPI`          | renderer が使う主な窓口 |
| `window.electronAPI.skillCreator` | preload に残る互換シム  |

## Part 2

### 型定義

```typescript
import type {
  ApplyImprovementResult,
  RuntimeSkillCreatorImproveSuggestion,
  SkillCreatorGovernanceState,
} from "@repo/shared/types";

interface IpcResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface SkillCreatorAPI {
  applyRuntimeImprovement(
    skillName: string,
    suggestions: RuntimeSkillCreatorImproveSuggestion[],
  ): Promise<IpcResult<ApplyImprovementResult>>;
  getGovernanceState(): Promise<IpcResult<SkillCreatorGovernanceState>>;
  planSkill(prompt: string): Promise<unknown>;
  executePlan(planId: string, skillSpec: string): Promise<unknown>;
  onProgress(
    callback: (progress: {
      phase: string;
      percentage: number;
      message: string;
    }) => void,
  ): () => void;
}

declare global {
  interface Window {
    skillCreatorAPI: SkillCreatorAPI;
  }
}
```

### APIシグネチャ

- `window.skillCreatorAPI.applyRuntimeImprovement(skillName, suggestions)`
- `window.skillCreatorAPI.getGovernanceState()`
- `window.skillCreatorAPI.planSkill(prompt)`
- `window.skillCreatorAPI.executePlan(planId, skillSpec)`
- `window.skillCreatorAPI.onProgress(callback)`
- 互換シムとして `window.electronAPI.skillCreator` は preload で保持する

### 使用例

```typescript
const selectedSuggestions = suggestions.filter((_, index) =>
  selectedIndices.has(index),
);

const applyResult = await window.skillCreatorAPI.applyRuntimeImprovement(
  "TASK-UI-03-REMAINING",
  selectedSuggestions,
);

if (applyResult.success && applyResult.data) {
  console.log(applyResult.data.applied);
}

const governanceResult = await window.skillCreatorAPI.getGovernanceState();
if (governanceResult.success && governanceResult.data) {
  console.log(governanceResult.data.phase);
}
```

### エラーハンドリング

- API が存在しない場合は preload 側の公開漏れとして扱う
- 呼び出し失敗時は renderer で例外を握りつぶさず、UI に明示する
- renderer は `window.skillCreatorAPI` を優先し、互換境界が必要な箇所のみ `window.electronAPI.skillCreator` を最後の fallback にする

### エッジケース

- 古いコードが `window.electronAPI.skillCreator` を参照しても、renderer の新規実装では増やさない
- 既存の `SkillCreateWizard.tsx` / `SkillLifecyclePanel.tsx` / `useLLMAdapterStatus.ts` / `useStreamingProgress.ts` は、互換境界として最後の fallback を残す
- `getGovernanceState` の `success: false` や `data` 欠落は、表示側でロード継続または警告表示に分岐する
- `applyRuntimeImprovement` の再実行時は重複送信を避ける

### 設定項目と定数一覧

| 項目               | 内容                                         | 理由                          |
| ------------------ | -------------------------------------------- | ----------------------------- |
| canonical API      | `window.skillCreatorAPI`                     | renderer の単一入口にするため |
| compatibility shim | `window.electronAPI.skillCreator`            | 後方互換を壊さないため        |
| 旧経路参照監査     | `grep -rn "window.electronAPI.skillCreator"` | 0件確認を維持するため         |

### テスト構成

- typecheck で型の整合を確認する
- lint で不要な参照を確認する
- `grep` で renderer の direct ref がないことを確認する
- Phase 11 では NON_VISUAL として API 呼び出し結果を確認する

### Consumer Contract & IPC Compatibility

| Before                                                    | After                                            | 備考                       |
| --------------------------------------------------------- | ------------------------------------------------ | -------------------------- |
| `window.electronAPI.skillCreator.applyRuntimeImprovement` | `window.skillCreatorAPI.applyRuntimeImprovement` | renderer の canonical 経路 |
| `window.electronAPI.skillCreator.getGovernanceState`      | `window.skillCreatorAPI.getGovernanceState`      | renderer の canonical 経路 |
| preload での互換シムなし                                  | preload で互換シムあり                           | 既存呼び出しのために残す   |

## 実行メモ

- 本ガイドは workflow spec の close-out 用ドラフトとして整備する
- 実装時は `phase-2-design.md` / `phase-3-design-review.md` と整合させる
