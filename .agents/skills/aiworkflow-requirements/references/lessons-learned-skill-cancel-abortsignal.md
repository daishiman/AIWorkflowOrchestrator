# Lessons Learned — Skill Creator Cancel / AbortSignal（2026-04-16）

## タスク概要

| タスクID | 内容 |
| --- | --- |
| p01-seq-CANCEL-001 (TASK-SW-CANCEL-001) | IPC_CHANNELS.SKILL_CREATOR_CANCEL 定数追加（`packages/shared/src/ipc/channels.ts`） |
| p02-seq-CANCEL-002 (TASK-SW-CANCEL-002) | Preload `cancelGeneration()` API追加（`skill-creator-api.ts` + `preload/channels.ts` allowlist） |
| p03-seq-CANCEL-003 (TASK-SW-CANCEL-003) | Main プロセス CANCEL ハンドラー実装（`skillCreatorHandlers.ts` + `SkillCreatorService.cancelCurrentOperation()`） |
| p04-seq-CANCEL-004 (TASK-SW-CANCEL-004) | Renderer `useCancelGeneration` フック完成（IPC 経由でメインプロセスへ通知） |
| TASK-SC-IMP-CREATE-WORKFLOW-001（補完） | AbortSignal を `ScriptExecutor` / `ResourceLoader` まで伝播 |

---

## 主要知見

### 1. AbortSignal の 4 層伝播パターン

IPC 4 層（shared 定数 → Preload → Main ハンドラー → Service / ScriptExecutor / ResourceLoader）を通じてキャンセルを実現する際は、各層で役割が異なる。

| 層 | ファイル | 役割 |
| --- | --- | --- |
| 定数層 | `packages/shared/src/ipc/channels.ts` | `SKILL_CREATOR_CANCEL` チャンネル名を一元定義 |
| Preload 層 | `skill-creator-api.ts` / `preload/channels.ts` | `cancelGeneration()` を公開 API として expose し、`ALLOWED_INVOKE_CHANNELS` に追加 |
| Main ハンドラー層 | `skillCreatorHandlers.ts` | `SKILL_CREATOR_CANCEL` チャンネルを `ipcMain.handle()` で受信し `cancelCurrentOperation()` を呼ぶ。`unregisterSkillCreatorHandlers()` に対称的に `removeHandler` を追加 |
| Service / 実行層 | `SkillCreatorService.ts` / `ScriptExecutor.ts` / `ResourceLoader.ts` | `AbortController` を生成・保持し、各処理に `signal` を伝播。子プロセスの kill と Promise reject を `settled` フラグで制御 |

**設計原則**: キャンセルチャンネル名は shared 定数で一元管理し、定数なしに直接文字列を書かない。各層は「受け渡すだけ / 実行するだけ」に責務を分離する。

---

### 2. settled フラグによる重複 reject 防止

`ScriptExecutor.execute()` の Promise 内部で `spawn()` したプロセスに AbortSignal を組み合わせる際、`close` イベントと `abort` イベントが競合して二重 reject が発生しうる。

```typescript
let settled = false;

const handleAbort = () => {
  if (settled) return;
  settled = true;
  cleanup();
  try { proc.kill(); } catch { /* 既に終了済みでも成功扱い */ }
  reject(new DOMException("Aborted", "AbortError"));
};

proc.on("close", (exitCode) => {
  if (settled) return;
  settled = true;
  cleanup();
  resolve({ success: exitCode === 0, ... });
});
```

**標準ルール**: `spawn()` を使う Promise では `settled` フラグを宣言し、`handleAbort` / `close` / `error` の全ハンドラーで先頭に `if (settled) return` を置く。

---

### 3. 半完成ディレクトリの自動削除

キャンセル時に途中まで作成されたスキルディレクトリが残存すると、次回の作成処理でエラーが生じる。`cleanupCancelledSkillDir()` で対処する。

```typescript
private async cleanupCancelledSkillDir(
  skillDir: string,
  existedBefore: boolean,
  signal?: AbortSignal,
  error?: unknown,
): Promise<void> {
  if (existedBefore) return;                          // 既存ディレクトリは削除しない
  if (!signal?.aborted && !this.isAbortError(error)) return; // キャンセル以外は削除しない
  try {
    await fs.rm(skillDir, { recursive: true, force: true });
  } catch (cleanupError) {
    this.logger.warn("cancelled skill dir cleanup failed", { skillDir, cleanupError });
  }
}
```

呼び出し元の `createSkill()` では `catch` ブロックで実行し、cleanup 自体の失敗は non-fatal として warn ログに留める。

**標準ルール**:
- 処理開始前に `existedBefore = await this.pathExists(skillDir)` で事前存在確認を記録する
- cleanup は `catch` ブロックで呼び、`finally` で `currentAbortController = null` リセットを行う

---

### 4. IPC 4 層キャンセル設計

SkillCreator キャンセルは以下の順序で完成させる必要がある。片方が欠けると動作しない直列依存になっている。

```
CANCEL-001: 定数追加（shared）
    ↓
CANCEL-002: Preload allowlist + cancelGeneration() 公開
    ↓
CANCEL-003: Main handle + SkillCreatorService.cancelCurrentOperation() 実装
    ↓
CANCEL-004: Renderer useCancelGeneration フックから window.skillCreatorAPI.cancelGeneration() を呼び出す
```

**`unregisterSkillCreatorHandlers()` の対称性**: ハンドラーを追加したら必ず `removeHandler` も対称に追加する。追加漏れがあると次回の登録時に二重登録エラーで後続ハンドラーが全停止する（L-IPC-DUP-001 参照）。

---

### 5. ResourceLoader への AbortSignal 伝播

`ResourceLoader.load()` / `loadAgent()` / `loadSchema()` はキャッシュヒット後と `fs.readFile()` 完了後の2箇所で `signal.aborted` をチェックする。

```typescript
async load(category, name, options = {}) {
  if (options.signal?.aborted) throw new DOMException("Aborted", "AbortError");
  if (this.cache.has(key)) return this.cache.get(key)!;
  const content = await fs.readFile(resourcePath, "utf-8");
  if (options.signal?.aborted) throw new DOMException("Aborted", "AbortError");
  this.cache.set(key, content);
  return content;
}
```

**設計根拠**: `fs.readFile` は AbortSignal を直接受け取らないため、完了後に再チェックする二段構えが必要。読み込みは成功しても、その後の処理はキャンセル済みとして扱う。

---

## 苦戦箇所と解決策

| # | 苦戦箇所 | 解決策 |
| --- | --- | --- |
| 1 | `spawn()` の `close` イベントと AbortSignal の `abort` イベントが競合し、Promise が二重 reject される | `settled` フラグを導入し、全コールバックの先頭で `if (settled) return` チェックを行う |
| 2 | 既存スキルディレクトリをキャンセル時に誤削除するリスク | 処理開始前に `pathExists()` で `existedBefore` フラグを記録し、`existedBefore === true` の場合は削除しない |
| 3 | `unregisterSkillCreatorHandlers()` に `SKILL_CREATOR_CANCEL` の `removeHandler` 追加を忘れると次回登録で二重登録エラーが発生 | ハンドラー登録と解除を同一 PR でセットとして実装し、count を一致させる |
| 4 | `useCancelGeneration` の `cancelGeneration()` が同期か非同期かで型が揺れる | IPC 経由のためシグネチャを `async () => Promise<void>` に統一し、呼び出し側は `await cancelGeneration()` を使う |
| 5 | `AbortController` が `createSkill()` 実行中にのみ有効で、それ以外の時は `null` を保持する必要がある | `finally` ブロックで `this.currentAbortController = null` を行い、`cancelCurrentOperation()` 呼び出し後も null に統一 |

---

## 今後の標準ルール

1. **IPC キャンセル設計は 4 タスク直列で設計する**: 定数 → Preload → Main → Renderer の 4 層を分割タスクにする場合、各タスクの完了条件を次タスクの前提条件として明記する。

2. **settled フラグは spawn を使う Promise の標準パターン**: `child_process.spawn()` を使う全 Promise に導入し、競合 settle を防ぐ。

3. **cleanup は non-fatal として設計する**: キャンセル後のディレクトリ削除や一時ファイル削除は `catch` で拾い `warn` ログだけ出す。削除失敗で処理全体を止めない。

4. **handleXxx / removeHandler の対称性を PR ルールとする**: `registerXxxHandlers()` で追加したチャンネル数と `unregisterXxxHandlers()` の `removeHandler` 数は常に一致させる。差分があれば CI が検出できるようスナップショットテストを用意する。

5. **Renderer 側の `cancelGeneration()` は IPC 呼び出しを await する**: `window.api?.cancelXxx?.()` の optional chain を使いつつ `await` して、Main 側のキャンセル完了を待つ設計を標準とする。
