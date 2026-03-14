# Phase 12 成果物: 実装ガイド

## Part 1: 初学者向け（中学生レベル）

### なぜ必要か

認証方式が `subscription` と `api-key` で違うのに、実行の入口が同じままだと「実行できるはずなのに止まる」「どこで続ければよいかわからない」という混乱が起きる。

たとえば、学校の図書室で「本を借りる人」と「館内で読む人」を同じ列に並ばせると、途中で手続きが分かれて行列が詰まる。最初に列を分けておけば、全員が迷わず進める。

### 何をするか

1. 実行前に `RuntimeResolver` でルートを決める。
2. `subscription` 側は Terminal handoff 用のガイド（コマンド、理由、文脈）を返す。
3. `api-key` 側は既存の integrated 実行をそのまま続ける。
4. 画面には `TerminalHandoffCard` を表示して、コピーと閉じる操作を提供する。

### この変更でできること

- Skill / Agent の両方で同じ判断ルールを使える。
- 「失敗」で終わらず、次の実行手段（CLI）が明示される。
- handoff の案内を Store に保存し、ユーザーが閉じるまで再表示できる。

## Part 2: 開発者向け（技術詳細）

### 型定義（TypeScript）

```ts
export interface HandoffGuidance {
  terminalCommand: string;
  contextSummary: string;
  reason: string;
}

export interface SkillExecutionResponse {
  executionId: string;
  success: boolean;
  error?: string;
  handoff?: boolean;
  guidance?: HandoffGuidance;
}
```

### APIシグネチャ

```ts
// preload/renderer
window.electronAPI.skill.execute(request: SkillExecutionRequest): Promise<SkillExecutionResponse>
window.agentAPI.start(request: AgentStartRequest): Promise<AgentStartResult>

// main/ipc
agent:start(request) -> { success: true, executionId } | { success: false, handoff: true, guidance }
skill:execute(request) -> { success: true, data: SkillExecutionResponse }
```

### 使用例

```bash
# Skill handoff capture (Phase 11)
node apps/desktop/scripts/capture-runtime-routing-integration-closure-phase11.mjs
```

```ts
const response = await window.electronAPI.skill.execute({
  skillName: "skill-creator",
  prompt: "Continue this task",
});

if (response.handoff && response.guidance) {
  setHandoffGuidance(response.guidance);
}
```

### 実装ポイント

1. `apps/desktop/src/main/services/runtime/RuntimeResolver.ts`  
   `authMode` と API key 状態から `integrated` / `handoff` を決定する。
2. `apps/desktop/src/main/services/runtime/TerminalHandoffBuilder.ts`  
   Skill/Agent 向けに `HandoffGuidance` を生成する。
3. `apps/desktop/src/main/ipc/skillHandlers.ts` / `agentHandlers.ts`  
   runtime 判定を execute 前に挿入し、handoff 応答を返す。
4. `apps/desktop/src/renderer/store/slices/agentSlice.ts`  
   `handoffGuidance` 状態を保持し、UI 表示を制御する。
5. `apps/desktop/src/renderer/views/AgentView/index.tsx` / `AgentExecutionView.tsx`  
   `TerminalHandoffCard` を接続する。

### エラーハンドリング

- `skill:execute` は preload 側で wrapper を unwrap するため、handoff を `success: true, data: { success: false, handoff: true }` 形式で返す必要がある。
- `agent:start` の handoff は `success: false` を返し、Renderer 側で `handoff` フラグを見て通常エラーと分離する。
- クリップボード書き込み失敗時は UI を壊さず console error のみに留める。

### エッジケース

- `subscription` + API key 未設定: preflight は通すが runtime は handoff を返す。
- 空 prompt: `TerminalHandoffBuilder` がデフォルト文を補完する。
- 長文 command: `break-all` で折り返し表示。
- Vite 起動不可（esbuild mismatch）: Phase 11 capture は fallback-review-board に自動切替。

### 設定項目または定数一覧

| 項目                           | 値 / 役割                                           |
| ------------------------------ | --------------------------------------------------- |
| `RUNTIME_ROUTING_PHASE11_PORT` | Phase 11 capture スクリプト用ポート（既定 `4179`）  |
| `MAX_MESSAGES`                 | `useSkillExecution.ts` のストリーム保持上限（1000） |
| `AUTH_GUIDANCE_SUFFIX`         | preflight エラー文の共通サフィックス                |
