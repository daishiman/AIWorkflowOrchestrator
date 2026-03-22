# Phase 5: 実装

## メタ情報

| 項目   | 値                           |
| ------ | ---------------------------- |
| Phase  | 5                            |
| 機能名 | slide-runtime-alignment-impl |
| 作成日 | 2026-03-22                   |
| Issue  | #1363                        |

## 目的

Phase 4 で作成した Red テストを Green にする。Phase 2 設計の Wave A → B → C 順序で実装を進め、各 Wave 完了時に typecheck と対応テスト PASS を確認してから次 Wave へ進む。

## 実行タスク

1. Wave A: IPC 接続 + チャネル統一 + セキュリティ（ステップ 1〜5）
2. Wave B: RuntimeResolver 統合（ステップ 6〜8）
3. Wave C: Store fields + legacy 廃止（ステップ 9〜10）

## 参照資料

| 資料名        | パス                                                                                  |
| ------------- | ------------------------------------------------------------------------------------- |
| 要件定義      | `docs/30-workflows/slide-runtime-alignment-impl/phase-01-requirements.md`             |
| 設計書        | `docs/30-workflows/slide-runtime-alignment-impl/phase-02-design.md`                   |
| テスト仕様    | `docs/30-workflows/slide-runtime-alignment-impl/phase-04-test-creation.md`            |
| IPC 正本      | `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`            |
| Security 正本 | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-core.md`     |
| State 正本    | `.claude/skills/aiworkflow-requirements/references/arch-state-management-advanced.md` |
| P5 対策       | `.claude/rules/06-known-pitfalls.md#P5`（リスナー二重登録）                           |
| P42 対策      | `.claude/rules/06-known-pitfalls.md#P42`（.trim() バリデーション）                    |
| P44 対策      | `.claude/rules/06-known-pitfalls.md#P44`（IPC インターフェース不整合）                |
| P48 対策      | `.claude/rules/06-known-pitfalls.md#P48`（useShallow 未適用）                         |
| P60 対策      | `.claude/rules/06-known-pitfalls.md#P60`（レスポンス形式不一致）                      |
| P65 対策      | `.claude/rules/06-known-pitfalls.md#P65`（dead-end namespace）                        |

## 実行手順

---

### ステップ0: 前提ファイル存在確認

実装開始前に以下の前提ファイルの存在を確認する:

```bash
# RuntimeResolver の存在確認
grep -rn "RuntimeResolver" apps/desktop/src/main/runtime/

# detectPathTraversal の存在確認
grep -rn "detectPathTraversal" apps/desktop/src/main/

# sanitizeError の存在確認
grep -rn "sanitizeError" apps/desktop/src/main/

# validateIpcSender の存在確認
grep -rn "validateIpcSender" apps/desktop/src/main/
```

いずれかが存在しない場合は、実装前に当該ユーティリティの作成または代替手段の検討が必要。

---

## Wave A: IPC 接続 + チャネル統一 + セキュリティ

Wave A は D1（IPC handler 未接続）、D2（チャネル名 legacy）、D5（validateIpcSender 未実装）を解消する。

**Wave A ゲート**: ステップ 1〜5 完了後に `pnpm --filter @repo/desktop typecheck` PASS + Wave A テスト PASS を確認してから Wave B へ進む。

---

> **重要**: ステップ1（Main 側 rename）とステップ2（Preload 側 rename）は同一コミットで実施すること。
> 片方だけを先にコミットすると IPC チャネル名の不一致で全 slide 操作が破壊される（P44 対策）。

### ステップ 1: `ipc-handlers.ts` のチャネル定数を正本 12 チャネルへ rename

**対象ファイル**: `apps/desktop/src/main/slide/ipc-handlers.ts`

**変更内容**:

1. `SLIDE_IPC_CHANNELS` を `SLIDE_INVOKE_CHANNELS` と `SLIDE_PUSH_CHANNELS` の2定数に分割する
2. 各定数のキーと値を以下の正本定義に合わせて rename する

```typescript
// invoke (Renderer → Main): 6本
export const SLIDE_INVOKE_CHANNELS = {
  EXECUTE_PHASE: "slide:executePhase", // 据え置き
  WATCH_START: "slide:watch-start", // rename: startWatching → watch-start
  WATCH_STOP: "slide:watch-stop", // rename: stopWatching → watch-stop
  SYNC_STATUS: "slide:sync-status", // rename: getSyncStatus → sync-status
  REVERSE_SYNC: "slide:reverse-sync", // rename: manualSync → reverse-sync
  CANCEL: "slide:cancel", // rename: cancelExecution → cancel
} as const;

// push (Main → Renderer): 6本
export const SLIDE_PUSH_CHANNELS = {
  SYNC_STATUS_CHANGED: "slide:sync-status-changed", // 据え置き
  SYNC_PROGRESS: "slide:sync-progress", // 新規追加
  SYNC_ERROR: "slide:sync-error", // 新規追加
  EXECUTION_PROGRESS: "slide:execution-progress", // rename: executionProgress → execution-progress
  STRUCTURE_CHANGED: "slide:structureChanged", // 据え置き
  WATCH_STATUS: "slide:watch-status", // 新規追加
} as const;
```

3. ファイル内の `ipcMain.handle(channel, ...)` 呼び出しを新定数に更新する
4. `webContents.send(channel, ...)` 呼び出しを新定数に更新する

**完了条件**:

- [ ] `SLIDE_INVOKE_CHANNELS` に legacy 値（`slide:startWatching` 等）が含まれない
- [ ] `grep -n "startWatching\|stopWatching\|getSyncStatus\|manualSync\|cancelExecution" apps/desktop/src/main/slide/ipc-handlers.ts` で結果なし

---

### ステップ 2: `preload/channels.ts` の定数を同期 rename

**対象ファイル**: `apps/desktop/src/preload/channels.ts`

**変更内容**:

`IPC_CHANNELS` の `SLIDE` 系定数をステップ 1 の正本定義と同一文字列に更新する。

```typescript
// preload/channels.ts（変更箇所のみ記載）
export const IPC_CHANNELS = {
  // ... 既存定数 ...
  SLIDE: {
    EXECUTE_PHASE: "slide:executePhase",
    WATCH_START: "slide:watch-start", // rename
    WATCH_STOP: "slide:watch-stop", // rename
    SYNC_STATUS: "slide:sync-status", // rename
    REVERSE_SYNC: "slide:reverse-sync", // rename
    CANCEL: "slide:cancel", // rename
    // push
    SYNC_STATUS_CHANGED: "slide:sync-status-changed",
    SYNC_PROGRESS: "slide:sync-progress",
    SYNC_ERROR: "slide:sync-error",
    EXECUTION_PROGRESS: "slide:execution-progress",
    STRUCTURE_CHANGED: "slide:structureChanged",
    WATCH_STATUS: "slide:watch-status",
  },
} as const;
```

**完了条件**:

- [ ] `preload/channels.ts` の SLIDE チャネル値が `ipc-handlers.ts` の値と完全一致する
- [ ] P44 対策: `grep -rn "slide:startWatching\|slide:stopWatching" apps/desktop/src/preload/` で結果なし

---

### ステップ 3: `preload/index.ts` の slideApi 参照を更新

**対象ファイル**: `apps/desktop/src/preload/index.ts`

**変更内容**:

`slideApi` の `contextBridge.exposeInMainWorld` 内で参照しているチャネル文字列を、ステップ 2 で更新した `IPC_CHANNELS.SLIDE.*` 定数に置き換える。

```typescript
// preload/index.ts（変更箇所のみ）
contextBridge.exposeInMainWorld("slideApi", {
  executePhase: (phase: string, projectPath: string) =>
    safeInvoke(IPC_CHANNELS.SLIDE.EXECUTE_PHASE, phase, projectPath),
  watchStart: (projectPath: string) =>
    safeInvoke(IPC_CHANNELS.SLIDE.WATCH_START, projectPath), // 更新
  watchStop: () => safeInvoke(IPC_CHANNELS.SLIDE.WATCH_STOP), // 更新
  getSyncStatus: () => safeInvoke(IPC_CHANNELS.SLIDE.SYNC_STATUS), // 更新
  reverseSync: (projectPath: string) =>
    safeInvoke(IPC_CHANNELS.SLIDE.REVERSE_SYNC, projectPath), // 更新
  cancel: () => safeInvoke(IPC_CHANNELS.SLIDE.CANCEL), // 更新
});
```

**完了条件**:

- [ ] `preload/index.ts` 内に legacy チャネル文字列のハードコードが残っていない
- [ ] P27 対策: `grep -n "slide:startWatching\|slide:stopWatching" apps/desktop/src/preload/index.ts` で結果なし

---

### ステップ 4: `ipc-handlers.ts` に validateIpcSender + P42 + path guard 追加

**対象ファイル**: `apps/desktop/src/main/slide/ipc-handlers.ts`

**変更内容**:

全 6 invoke ハンドラに以下の検証順序を追加する（設計書 Wave A-3 参照）。

検証順序は以下を厳守する（順序を変えると正しいエラーコードが返らない）:

1. `validateIpcSender(event, channel, { getAllowedWindows: () => [mainWindow] })`
2. 文字列引数ごとに P42 3段バリデーション（`typeof !== "string"` → `=== ""` → `.trim() === ""`）
3. `projectPath` を持つハンドラのみ `detectPathTraversal(projectPath)` チェック
4. ビジネスロジック呼び出し
5. エラーは `sanitizeError(error)` を通して返す

```typescript
// 実装例: slide:executePhase ハンドラ
ipcMain.handle(
  SLIDE_INVOKE_CHANNELS.EXECUTE_PHASE,
  async (event, phase: string, projectPath: string) => {
    // 1. sender 検証
    validateIpcSender(event, SLIDE_INVOKE_CHANNELS.EXECUTE_PHASE, {
      getAllowedWindows: () => [mainWindow],
    });

    // 2a. P42: phase バリデーション
    if (typeof phase !== "string" || phase.trim() === "") {
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "phase must be a non-empty string",
        },
      };
    }

    // 2b. P42: projectPath バリデーション
    if (typeof projectPath !== "string" || projectPath.trim() === "") {
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "projectPath must be a non-empty string",
        },
      };
    }

    // 3. path traversal guard
    if (detectPathTraversal(projectPath)) {
      return {
        success: false,
        error: { code: "SECURITY_ERROR", message: "Invalid path" },
      };
    }

    // 4. business logic
    try {
      const result = await skillExecutor.execute(
        phase.trim() as SkillPhase,
        projectPath.trim(),
      );
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: sanitizeError(error) };
    }
  },
);
```

`sanitizeError()` の実装要件（AC-8）:

- `message` のみを含み `stack` を含まない
- ファイルシステムパス（`/Users/`, `/home/` 等）をマスクする
- P55 対策: `os.homedir()` を `RegExp` に渡す場合は `escapeRegExp()` でエスケープする

**完了条件**:

- [ ] 全 6 invoke ハンドラに `validateIpcSender` 呼び出しが存在する
- [ ] 全 `projectPath` 引数に `detectPathTraversal` チェックが存在する
- [ ] P42 3段バリデーションが全文字列引数に適用されている（`phase.trim() === ""` を含む）
- [ ] 全ハンドラのレスポンスが `{ success: true, data }` / `{ success: false, error: { code, message } }` 形式

---

### ステップ 5: `ipc/index.ts` に `registerSlideIpcHandlers(mainWindow)` 登録

**対象ファイル**: `apps/desktop/src/main/ipc/index.ts`

**変更内容**:

1. `import { registerSlideIpcHandlers, unregisterSlideIpcHandlers } from "../slide/ipc-handlers"` を追加
2. `registerAllIpcHandlers(mainWindow)` 内に `registerSlideIpcHandlers(mainWindow)` を追加
3. `unregisterAllIpcHandlers()` 内に `unregisterSlideIpcHandlers()` を追加

```typescript
// ipc/index.ts（追加箇所のみ）
import {
  registerSlideIpcHandlers,
  unregisterSlideIpcHandlers,
} from "../slide/ipc-handlers";

export function registerAllIpcHandlers(mainWindow: BrowserWindow): void {
  // ... 既存 handler 登録 ...
  registerSlideIpcHandlers(mainWindow); // 追加
}

export function unregisterAllIpcHandlers(): void {
  // ... 既存 handler 解除 ...
  unregisterSlideIpcHandlers(); // 追加（P5: リスナー二重登録防止）
}
```

**完了条件**:

- [ ] `registerAllIpcHandlers` が `registerSlideIpcHandlers` を呼び出している（AC-1 達成）
- [ ] `unregisterAllIpcHandlers` が `unregisterSlideIpcHandlers` を呼び出している（P5 対策）
- [ ] `pnpm --filter @repo/desktop typecheck` が PASS する
- [ ] Wave A テスト（`ipc-handlers.test.ts`）が全て PASS する

---

## Wave B: RuntimeResolver 統合

Wave B は D3（SDK 直接利用）と D4（modifier-skill 独立実装）を解消する。

**Wave B 前提**: Wave A が全て PASS していること。

**Wave B 前提確認**:

```bash
# RuntimeResolver が "slide" surface をサポートしていることを確認
grep -n '"slide"' apps/desktop/src/main/runtime/runtime-resolver.ts
```

未サポートの場合は RuntimeResolver への "slide" surface 追加を先行実施する。

**Wave B ゲート**: ステップ 6〜8 完了後に `pnpm --filter @repo/desktop typecheck` PASS + Wave B テスト PASS を確認してから Wave C へ進む。

---

### ステップ 6: `shared/slide/types.ts` に `HandoffGuidance` 型追加

**対象ファイル**: `packages/shared/src/slide/types.ts`

**変更内容**:

```typescript
// packages/shared/src/slide/types.ts に追加
export interface HandoffGuidance {
  /** terminal で実行するコマンド */
  command: string;
  /** コンテキスト要約（phase・プロジェクト情報等） */
  contextSummary: string;
  /** handoff の理由（RuntimeResolver がなぜ handoff を選択したか） */
  reason: string;
}
```

`packages/shared/src/index.ts`（または barrel export ファイル）から `HandoffGuidance` を export に追加する。

**完了条件**:

- [ ] `HandoffGuidance` 型が `packages/shared/src/slide/types.ts` に定義されている
- [ ] `@repo/shared` から `HandoffGuidance` がインポート可能である
- [ ] `pnpm --filter @repo/shared build` が PASS する

---

### ステップ 7: `skill-executor.ts` に RuntimeResolver 統合

**対象ファイル**: `apps/desktop/src/main/slide/skill-executor.ts`

**変更内容**:

1. `SkillExecutionResult` インターフェースに handoff 関連フィールドを追加する

```typescript
import type { HandoffGuidance } from "@repo/shared";

export interface SkillExecutionResult {
  success: boolean;
  phase: SkillPhase;
  data?: unknown;
  isHandoff?: boolean;
  guidance?: HandoffGuidance;
  error?: { code: string; message: string };
}
```

2. `execute()` メソッドに RuntimeResolver 分岐ロジックを追加する

```typescript
async function execute(
  phase: SkillPhase,
  projectPath: string,
): Promise<SkillExecutionResult> {
  const runtimeMode = await RuntimeResolver.resolve("slide", phase);

  if (runtimeMode === "integrated") {
    return executeIntegrated(phase, projectPath);
  } else {
    // handoff モード: terminal launcher 用の guidance を生成して返す
    return {
      success: true,
      phase,
      isHandoff: true,
      guidance: buildHandoffGuidance(phase, projectPath),
    };
  }
}
```

3. `buildHandoffGuidance()` を実装する

```typescript
function buildHandoffGuidance(
  phase: SkillPhase,
  projectPath: string,
): HandoffGuidance {
  return {
    command: `claude run --phase ${phase} --project ${projectPath}`,
    contextSummary: `slide ${phase} phase for project: ${projectPath}`,
    reason: "RuntimeResolver selected handoff mode for this execution context",
  };
}
```

**完了条件**:

- [ ] `SkillExecutionResult` に `isHandoff` と `guidance` フィールドが追加されている（AC-3）
- [ ] `RuntimeResolver.resolve("slide", phase)` が呼ばれる実装になっている
- [ ] integrated モードと handoff モードで異なる処理パスが実行される
- [ ] Wave B テストの RuntimeResolver 分岐テストが PASS する

---

### ステップ 8: `modifier-skill.ts` の buildModifierPrompt / parseModifierResponse を utility 化

**対象ファイル**: `apps/desktop/src/main/slide/modifier-skill.ts`

**変更内容**:

1. `buildModifierPrompt()` と `parseModifierResponse()` を `export` する（utility 関数として公開）
2. これら以外の責務（実行ロジック等）を `skill-executor.ts` の `executeIntegrated()` に移管する
3. `skill-executor.ts` の `executeIntegrated()` 内で `phase === "modifier"` 分岐を追加する

```typescript
// skill-executor.ts（executeIntegrated 内の modifier 分岐）
async function executeIntegrated(
  phase: SkillPhase,
  projectPath: string,
): Promise<SkillExecutionResult> {
  if (phase === "modifier") {
    // modifier-skill.ts の utility 関数を呼び出す（AC-4 達成）
    const context = await buildModifierContext(projectPath);
    const prompt = buildModifierPrompt(context);
    // runtimeClient の取得: RuntimeResolver から surface + phase に対応する client を取得
    const runtimeClient: RuntimeClient = await RuntimeResolver.getClient(
      "slide",
      phase,
    );
    const response = await runtimeClient.complete(prompt);
    const parsed = parseModifierResponse(response);
    return { success: true, phase, data: parsed };
  }
  // ... 他の phase 処理
}
```

**modifier-skill.ts の残すもの**:

- `buildModifierPrompt(context: ModifierContext): string`
- `parseModifierResponse(response: string): ModifierResult`
- 型定義 `ModifierContext`, `ModifierResult`

**完了条件**:

- [ ] `buildModifierPrompt` と `parseModifierResponse` が `modifier-skill.ts` から export されている
- [ ] `skill-executor.ts` の `phase === "modifier"` 分岐でこれらが呼ばれている（AC-4 達成）
- [ ] `modifier-skill.ts` に独立した実行パス（呼び出し元のない実行コード）が残っていない
- [ ] Wave B の modifier 統合テストが PASS する

---

## Wave C: Store fields + legacy 廃止

Wave C は D6（slideSlice store fields 不足）と agent-client.ts の legacy path を解消する。

**Wave C 前提**: Wave B が全て PASS していること。

---

### ステップ 9: slideSlice に正本 7 fields + 個別 selector 追加

**対象ファイル**: Renderer 側 slideSlice（Zustand store）

実際のファイルパスは実装前に以下のコマンドで確認する:

```bash
find apps/desktop/src/renderer -name "slideSlice*" -o -name "slide-slice*" | head -5
```

**変更内容**:

1. `SlideSliceState` インターフェースに正本 7 fields を追加する

```typescript
interface SlideSliceState {
  // 既存 fields（変更なし）
  syncStatus: SyncStatus;
  isWatching: boolean;

  // 新規追加: 正本 7 fields の残り 5 fields
  syncDirection: SyncDirection; // "forward" | "reverse"
  syncProgress: { percent: number; message: string } | null;
  syncError: { code: string; message: string } | null;
  isHandoff: boolean;
  handoffGuidance: HandoffGuidance | null;

  // actions
  setSyncProgress: (
    progress: { percent: number; message: string } | null,
  ) => void;
  setSyncError: (error: { code: string; message: string } | null) => void;
  setHandoffGuidance: (guidance: HandoffGuidance | null) => void;
  clearHandoff: () => void;
}
```

2. 個別 selector を追加する（P31/P48 対策）

```typescript
// scalar selector（useShallow 不要）
export const useSyncStatus = () => useSlideStore((s) => s.syncStatus);
export const useIsWatching = () => useSlideStore((s) => s.isWatching);
export const useSyncDirection = () => useSlideStore((s) => s.syncDirection);
export const useIsHandoff = () => useSlideStore((s) => s.isHandoff);

// object selector（P48 対策: useShallow 必須）
export const useSyncProgress = () =>
  useSlideStore(useShallow((s) => s.syncProgress));
export const useSyncError = () => useSlideStore(useShallow((s) => s.syncError));
export const useHandoffGuidance = () =>
  useSlideStore(useShallow((s) => s.handoffGuidance));
```

**完了条件**:

- [ ] slideSlice に正本 7 fields が全て定義されている（AC-11 達成）
- [ ] `syncProgress` / `syncError` / `handoffGuidance` の selector に `useShallow` が適用されている（P48 対策）
- [ ] Wave C の store fields テストが全て PASS する

---

### ステップ 10: `agent-client.ts` の legacy path 除去

**対象ファイル**: `apps/desktop/src/main/slide/agent-client.ts`

**事前確認**: 除去前に呼び出し元を確認する

```bash
grep -rn "agent-client" apps/desktop/src/main/slide/ --include="*.ts"
```

**変更内容**:

以下の直接利用を除去し、RuntimeResolver 経由に置き換える（AC-7 達成）:

1. `@anthropic-ai/sdk` の直接 import を除去
2. `electron-store` の `Store<{ anthropic_api_key?: string }>` 直接利用を除去
3. `safeStorage` の直接利用を除去
4. `process.env.ANTHROPIC_API_KEY` の env fallback を除去

除去後の `agent-client.ts` の責務は「RuntimeResolver への委譲のみ」とし、`getAgentAPI()` の実装を `skill-executor.ts` の `executeIntegrated()` に移管する。

最終的に `agent-client.ts` は空実装またはファイルとして廃止する。廃止する場合は `ipc-handlers.ts` や他のファイルからの import を事前に全て除去する。

**廃止手順**:

1. `grep -rn "agent-client" apps/desktop/src/` で参照箇所を全確認
2. 全 import を `skill-executor.ts` 経由に置き換える
3. `agent-client.ts` ファイルを削除する

**完了条件**:

- [ ] `agent-client.ts` 内に `@anthropic-ai/sdk` の import が存在しない（AC-7 達成）
- [ ] `agent-client.ts` 内に `electron-store` / `safeStorage` / `process.env.ANTHROPIC_API_KEY` が存在しない
- [ ] `pnpm --filter @repo/desktop typecheck` が PASS する
- [ ] 全テスト（Wave A + B + C）が PASS する

---

## 最終確認

全ステップ完了後に以下を実行して受入基準を確認する:

```bash
# typecheck
pnpm --filter @repo/desktop typecheck

# テスト実行
cd apps/desktop && pnpm vitest run src/main/slide/

# legacy チャネル名残存確認
grep -rn "startWatching\|stopWatching\|getSyncStatus\|manualSync\|cancelExecution" \
  apps/desktop/src/main/slide/ \
  apps/desktop/src/preload/

# SDK 直接利用残存確認
grep -rn "@anthropic-ai/sdk\|safeStorage\|ANTHROPIC_API_KEY" \
  apps/desktop/src/main/slide/agent-client.ts 2>/dev/null || echo "OK: agent-client.ts is removed"
```

## 統合テスト連携

| Wave   | ステップ | 受入基準                     | テストファイル                     |
| ------ | -------- | ---------------------------- | ---------------------------------- |
| Wave A | 1〜5     | AC-1, AC-2, AC-5, AC-6, AC-8 | `__tests__/ipc-handlers.test.ts`   |
| Wave B | 6〜8     | AC-3, AC-4, AC-7, AC-8       | `__tests__/skill-executor.test.ts` |
| Wave C | 9〜10    | AC-9, AC-10, AC-11           | `__tests__/slide-slice.test.ts`    |

## 成果物

| 成果物                  | パス                                            | 説明                          |
| ----------------------- | ----------------------------------------------- | ----------------------------- |
| チャネル定数（Main）    | `apps/desktop/src/main/slide/ipc-handlers.ts`   | canonical 12チャネルへ rename |
| チャネル定数（Preload） | `apps/desktop/src/preload/channels.ts`          | Main と同期した rename        |
| Preload slideApi        | `apps/desktop/src/preload/index.ts`             | 新チャネル参照への更新        |
| IPC index               | `apps/desktop/src/main/ipc/index.ts`            | registerSlideIpcHandlers 登録 |
| skill-executor          | `apps/desktop/src/main/slide/skill-executor.ts` | RuntimeResolver 統合          |
| 共有型                  | `packages/shared/src/slide/types.ts`            | HandoffGuidance 型追加        |

## 完了条件

- [ ] AC-1: `registerSlideIpcHandlers()` が `registerAllIpcHandlers()` から呼ばれている
- [ ] AC-2: IPC チャネル名が正本 12 チャネルへ統一されている
- [ ] AC-3: `skill-executor.ts` が RuntimeResolver と handoffGuidance を返せる
- [ ] AC-4: `phase === "modifier"` が `skill-executor.ts` の同一実行面で処理される
- [ ] AC-5: 全 invoke ハンドラに `validateIpcSender` が適用されている
- [ ] AC-6: 全 `projectPath` 引数に P42 3段バリデーション + `detectPathTraversal` が適用されている
- [ ] AC-7: `agent-client.ts` の SDK 直接利用・env fallback が除去されている
- [ ] AC-8: エラーはサニタイズされ内部パス・スタックトレースが Renderer に漏洩しない
- [ ] AC-9: `pnpm --filter @repo/desktop typecheck` が PASS する
- [ ] AC-10: slide 関連テストが全て PASS する
- [ ] AC-11: slideSlice に正本 7 fields が追加されている

## 次のPhase

Phase 6（テスト拡充）へ進む。
