# 実装ガイド: agentSlice.executeSkill 並行実行ガード

> タスクID: TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001
> 更新日: 2026-03-09

## Part 1: 概念説明（中学生レベル）

### なぜ必要か

なぜこの仕組みが必要かというと、AI が返事を作っている最中に同じ実行ボタンをもう一度押すと、2回分の処理が同時に走って画面表示が混ざるからです。結果として、途中のメッセージが重なったり、キャンセルや完了の状態がずれて見えたりします。

### たとえば改札のイメージ

たとえば駅の改札をイメージしてください。電車に入る人が通っている最中に、同じ人がもう一度同じ改札へ横から入ろうとしても、改札は1人分ずつしか通しません。今まさに通過中なら、次の入力は待たせるか無視します。今回のガードはその改札と同じで、「いま実行中なら次の実行は受け付けない」という壁です。

### 何をしたか

1. Store の `executeSkill` 冒頭で「すでに実行中か」を同期的に確認するようにした
2. UI 側でも実行中は押せない・入力できない・実行中表示が出る、という二重防御をそろえた
3. `ChatPanel` は個別セレクタ `useIsSkillExecuting()` に統一し、P31 の無限ループ系リスクも同時に下げた

## Part 2: 技術詳細

### 型定義

```ts
type ExecuteSkill = (prompt: string) => Promise<void>;

interface ConcurrencyGuardState {
  isExecuting: boolean;
  executionId: string | null;
  selectedSkillName: SkillName | null;
}
```

### APIシグネチャ

Store 側の入口は `executeSkill(prompt)`、IPC 呼び出しは `window.electronAPI.skill.execute(...)` である。

```ts
executeSkill: async (prompt: string) => {
  const { selectedSkillName, isExecuting } = get();
  if (!selectedSkillName) return;
  if (isExecuting) return;

  const response = await window.electronAPI.skill.execute({
    skillName: selectedSkillName,
    prompt,
  });

  set({ executionId: response.executionId });
};
```

### 二重防御の責務

| 層    | 実装                                | 役割                       |
| ----- | ----------------------------------- | -------------------------- |
| Store | `if (isExecuting) return;`          | プログラム的再入を止める   |
| UI    | `disabled={isExecuting}` / 条件描画 | 利用者に実行中状態を見せる |

### 使用例

```ts
const executeSkill = useAppStore((state) => state.executeSkill);
const isExecuting = useIsSkillExecuting();

if (!isExecuting) {
  await executeSkill("現在の状態を確認して");
}
```

```bash
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/store/slices/__tests__/agentSlice-concurrency-guard.test.ts \
  src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx
```

### エラーハンドリング

- auth preflight に失敗した場合は `skillExecutionStatus: "error"` と `skillError` を設定して終了する
- IPC 実行で例外が発生した場合も `catch` で `isExecuting: false` に戻す
- 完了/失敗イベントは `setupSkillListeners.ts` から `_handleComplete` / `_handleError` に流れ、最終的にガード解除される

### エッジケース

- ダブルクリックや Enter 連打で `executeSkill()` が短時間に複数回呼ばれても、2 回目以降は早期 return する
- UI 側でボタン非活性が崩れても、Store 側のガードが最後の防波堤になる
- `abortExecution` 連打については同じ形の保護がまだなく、未タスク `UT-FIX-CANCEL-SKILL-CONCURRENCY-GUARD-001` として分離した

### 設定項目と定数

| 項目                    | 意味                                            |
| ----------------------- | ----------------------------------------------- |
| `isExecuting`           | 実行中フラグ。ガードの主判定                    |
| `executionId`           | 現在の実行識別子。listener 復元と追跡に利用     |
| `skillExecutionStatus`  | `running` / `completed` / `error` / `cancelled` |
| `useIsSkillExecuting()` | UI から `isExecuting` を読む個別セレクタ        |

### 実装判断

- `get()` は Zustand の同期読み取りなので、React の再レンダー完了を待たず最新状態を確認できる
- `useAppStore((s) => s.isExecuting)` のインライン利用は動作自体は問題ないが、P31 の「Store 利用形を揃える」観点から `useIsSkillExecuting()` に統一した
- 今回は IPC 契約変更ではないため `preload` / `main` の API シグネチャ変更は不要
