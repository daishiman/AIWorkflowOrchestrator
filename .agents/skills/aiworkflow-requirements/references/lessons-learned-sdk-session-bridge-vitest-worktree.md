# Lessons Learned — SDK Session Bridge / Vitest / Worktree

> 親仕様書: [lessons-learned.md](lessons-learned.md)
> 役割: TASK-SDK-SC-01 SDK Session Bridge 実装で発生した苦戦箇所の記録

## TASK-SDK-SC-01: SDK Session Bridge 実装

### タスク概要

| 項目       | 内容                                                                                                          |
| ---------- | ------------------------------------------------------------------------------------------------------------- |
| タスクID   | TASK-SDK-SC-01                                                                                                |
| 目的       | SkillCreator が Agent SDK `query()` を直接呼び出す IPC ブリッジ層を実装する                                  |
| 完了日     | 2026-04-03                                                                                                    |
| ステータス | **完了**                                                                                                      |

### 実装内容

| 変更内容                      | ファイル                                                              | 説明                                                               |
| ----------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------ |
| SDK セッション実装            | `apps/desktop/src/main/services/runtime/SkillCreatorSdkSession.ts`   | `createSdkMcpServer` + `tool` で AskUserQuestion MCP ツールを登録し `query()` を呼び出す |
| IPC ブリッジ実装              | `apps/desktop/src/main/services/runtime/SkillCreatorIpcBridge.ts`    | フルライフサイクル管理付き IPC ブリッジ                           |
| スキルディレクトリ探索        | `apps/desktop/src/main/services/runtime/SkillLocator.ts`             | fast-glob + mtime キャッシュによる高速スキル探索                  |
| 型定義追加                    | `packages/shared/src/types/skillCreatorSession.ts`                   | セッション関連の型定義                                             |
| IPC チャネル追加              | `packages/shared/src/ipc/channels.ts`                                | `SKILL_CREATOR_SESSION_CHANNELS` を追加                           |

### 苦戦箇所と解決策

#### 1. worktree 内の esbuild バイナリバージョン不一致

| 項目       | 内容                                                                                                                                                                                                          |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **課題**   | worktree 内で `pnpm exec vitest run` を実行すると「Host version "0.21.5" does not match binary version "0.25.12"」エラーが発生し、vitest が起動しない                                                        |
| **原因**   | worktree は main プロジェクトの `node_modules/.bin/esbuild` ホストを使うが、バイナリは worktree ローカルの arm64 バイナリを参照するため、バージョンが混在する                                                |
| **解決策** | `ESBUILD_BINARY_PATH` 環境変数に main プロジェクトの arm64 バイナリパスを明示指定して vitest を起動する                                                                                                      |
| **教訓**   | worktree で vitest が esbuild バージョンエラーで起動しない場合は、まず `ESBUILD_BINARY_PATH` を main プロジェクトのバイナリに向ける。`find /path/to/main -name "esbuild" -path "*/darwin-arm64/*"` で特定可 |

**コード例**:

```bash
# main プロジェクトの arm64 バイナリを特定
find /path/to/main/node_modules -name "esbuild" -path "*/darwin-arm64/*"

# worktree 内での vitest 実行
ESBUILD_BINARY_PATH=/path/to/main/node_modules/@esbuild/darwin-arm64/bin/esbuild \
  pnpm exec vitest run src/main/services/runtime/__tests__/SkillCreatorSdkSession.test.ts
```

---

#### 2. vi.restoreAllMocks() が vi.fn() の mockResolvedValue を破壊する（Vitest 2.x）

| 項目       | 内容                                                                                                                                                                                                         |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **課題**   | `afterEach(() => vi.restoreAllMocks())` を設定した状態で `beforeAll` や `beforeEach` 内で `mockFn.mockResolvedValue(...)` をセットしても、2件目以降のテストで `mockFn` の戻り値が `undefined` になる          |
| **原因**   | Vitest 2.x では `restoreAllMocks()` が `vi.fn()` で作成したスパイに対しても `mockReset()` を呼び出し、`implementation` を `() => void 0` にリセットする。`vi.spyOn` の restore と混同しやすい               |
| **解決策** | `afterEach` で `restoreAllMocks()` を使う場合、`mockResolvedValue` のセットを必ず `beforeEach`（各テスト直前）に移動する。`beforeAll` だけでは最初のテストしか正しく動作しない                             |
| **教訓**   | `vi.restoreAllMocks()` と `vi.fn()` を組み合わせる際は、`mockResolvedValue` / `mockReturnValue` のセットを必ず `beforeEach` に置く。`beforeAll` + `restoreAllMocks` の組み合わせは機能しない               |

**コード例**:

```typescript
// ❌ 動かない — beforeAll でセットしても restoreAllMocks が毎回リセットする
const mockQuery = vi.fn();
beforeAll(() => {
  mockQuery.mockResolvedValue({ result: "ok" });
});
afterEach(() => vi.restoreAllMocks());

// ✅ 正しい — beforeEach でセットし直す
const mockQuery = vi.fn();
beforeEach(() => {
  mockQuery.mockResolvedValue({ result: "ok" }); // 毎テスト前にセット
});
afterEach(() => vi.restoreAllMocks());
```

---

#### 3. @repo/shared/ipc/channels パスが package.json exports に未登録

| 項目       | 内容                                                                                                                                                                                                  |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **課題**   | `import { SKILL_CREATOR_SESSION_CHANNELS } from "@repo/shared/ipc/channels"` が vitest 実行時に「Cannot find module」エラーになる                                                                    |
| **原因**   | `packages/shared/package.json` の `exports` フィールドには `"./src/ipc/channels"` のみ定義されており、`"./ipc/channels"` というショートパスが未登録だった                                           |
| **解決策** | `vitest.config.ts` の `resolve.alias` に `@repo/shared/ipc/channels` → `packages/shared/src/ipc/channels.ts` のマッピングを追加し、`tsconfig.json` の `paths` にも同様のエントリを追加する          |
| **教訓**   | `@repo/shared` 配下の新しいサブパスを追加した場合、`package.json` exports・`vitest.config.ts` alias・`tsconfig.json` paths の3箇所を必ず同時に更新する。1箇所でも漏れると vitest か tsc が失敗する  |

**コード例**:

```typescript
// vitest.config.ts の resolve.alias に追加
{
  "@repo/shared/ipc/channels": path.resolve(__dirname, "../../packages/shared/src/ipc/channels.ts"),
}

// tsconfig.json の paths に追加
{
  "@repo/shared/ipc/channels": ["../../packages/shared/src/ipc/channels.ts"]
}
```

---

#### 4. TypeScript 可変状態への narrowing による型エラー

| 項目       | 内容                                                                                                                                                                                                                 |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **課題**   | `if (this.state.status !== "running") { return; }` の後、非同期関数の続きで `this.state.status` を別の値に代入しようとすると「Type '"stopped"' is not assignable to type '"running"'」エラーになる                  |
| **原因**   | TypeScript は `if` によるナローイングを async 関数内でも持続させる。ガード後は `this.state.status` の型が `"running"` に確定するため、他の文字列リテラルを代入できない                                             |
| **解決策** | 代入箇所で `(this.state as { status: string }).status = "stopped"` のようにキャストして型を広げる。または状態オブジェクト全体を再代入する方式（`this.state = { ...this.state, status: "stopped" }`）を使う          |
| **教訓**   | クラスのミュータブルな状態フィールドに対して TypeScript のナローイングが効きすぎる場合は、キャストで意図を明示する。ナローイング自体は正しい動作なので、設計として状態遷移を `setState()` メソッドに集約するのが長期的解決策 |

**コード例**:

```typescript
async run(): Promise<void> {
  if (this.state.status !== "running") { return; }
  // ここ以降 TS は this.state.status === "running" に narrowing する

  // ❌ コンパイルエラー
  this.state.status = "stopped";

  // ✅ キャストで回避
  (this.state as { status: string }).status = "stopped";

  // ✅ または全体再代入
  this.state = { ...this.state, status: "stopped" };
}
```

---

### 成果物

| 成果物                  | パス                                                                                   |
| ----------------------- | -------------------------------------------------------------------------------------- |
| SDK セッション実装      | `apps/desktop/src/main/services/runtime/SkillCreatorSdkSession.ts`                    |
| IPC ブリッジ実装        | `apps/desktop/src/main/services/runtime/SkillCreatorIpcBridge.ts`                     |
| スキルディレクトリ探索  | `apps/desktop/src/main/services/runtime/SkillLocator.ts`                              |
| 型定義                  | `packages/shared/src/types/skillCreatorSession.ts`                                    |
| IPC チャネル定義        | `packages/shared/src/ipc/channels.ts`（SKILL_CREATOR_SESSION_CHANNELS）               |
| ワークフロー一式        | `docs/30-workflows/step-01-seq-task-01-sdk-session-bridge/`                           |
