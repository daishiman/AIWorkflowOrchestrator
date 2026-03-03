# Phase 2: アーキテクチャ設計書

> **タスク**: TASK-FIX-SKILL-CHAIN-HANDLER-REGISTRATION-001
> **日付**: 2026-03-03
> **対象**: registerSkillChainHandlers の registerAllIpcHandlers への配線追加

---

## 1. 問題の概要

`registerSkillChainHandlers()` は `skillHandlers.ts` 行1194-1343 に実装済みだが、`registerAllIpcHandlers()` (`ipc/index.ts` 行412-639) から呼び出されていない。その結果、スキルチェーン関連の5つの IPC チャンネルがランタイムで未登録のまま残り、Renderer からの呼び出しが全て失敗する。

## 2. 層別影響分析

### 2.1 Main Process 層（変更あり）

#### 変更対象: `apps/desktop/src/main/ipc/index.ts`

**変更内容**: `registerAllIpcHandlers()` 内に `registerSkillChainHandlers()` 呼び出しを追加する。

**インスタンス生成**:

- `SkillChainStore`: コンストラクタに `storagePath: string` が必要。ファイルベースの JSON 永続化。
- `SkillChainExecutor`: コンストラクタに `skillExecuteFn` コールバックが必要。`skillService.executeSkill` をアダプタとして渡す。

**配置箇所**: 既存のスキル関連ハンドラ登録ブロック（行492-560付近）の直後。スキルスケジュールハンドラ（行563）の前に挿入する。

```typescript
// Register Skill Chain handlers (TASK-9D)
const chainStoragePath = path.join(
  app.getPath("userData"),
  "skill-chains.json",
);
const chainStore = new SkillChainStore(chainStoragePath);
const chainExecutor = new SkillChainExecutor(
  async (skillName: string, input: unknown) => {
    const result = await skillService.executeSkill(skillName, {
      prompt: typeof input === "string" ? input : JSON.stringify(input),
    });
    return result;
  },
);
registerSkillChainHandlers(mainWindow, chainStore, chainExecutor);
```

**依存関係**:

- `SkillChainStore` は `electron` の `app.getPath("userData")` に依存（永続化パス）
- `SkillChainExecutor` は `skillService` に依存（`executeSkill` メソッド）
- したがって `skillService` 生成後、かつ `registerSkillHandlers` 呼び出し後に配置する

**import 追加**:

```typescript
import { registerSkillChainHandlers } from "./skillHandlers";
```

既に `registerSkillHandlers` が同ファイルから import されているため、名前付き import に追加するのみ。`app` は `electron` から追加 import が必要（未 import の場合）。

#### 変更対象: `apps/desktop/src/main/ipc/index.ts` (unregister)

`unregisterAllIpcHandlers()` は `Object.values(IPC_CHANNELS)` を全走査するため、SKILL*CHAIN*\* チャンネル（5つ）は既にカバーされている。**追加変更は不要**。

### 2.2 Preload 層（変更なし）

以下は全て実装済み・登録済み:

| ファイル                         | 状態                                               |
| -------------------------------- | -------------------------------------------------- |
| `preload/channels.ts` 行214-219  | SKILL_CHAIN_LIST/GET/SAVE/DELETE/EXECUTE 定義済み  |
| `preload/channels.ts` 行496-501  | ホワイトリストに登録済み                           |
| `preload/skill-api.ts` 行599-621 | chainList/Get/Save/Delete/Execute メソッド実装済み |

### 2.3 Renderer 層（変更なし）

Renderer 側の呼び出しコード（SkillChainView 等）は Preload API 経由で呼び出すため、Main Process 側の登録修正のみで動作する。

## 3. 発見された副次的課題: P44パターンのインターフェース不整合

### 3.1 chainGet / chainDelete の引数形式不整合

**Preload 側** (`skill-api.ts` 行604-616):

```typescript
chainGet: (chainId: string) =>
  safeInvokeUnwrap(IPC_CHANNELS.SKILL_CHAIN_GET, { chainId }); // オブジェクトを送信

chainDelete: (chainId: string) =>
  safeInvokeUnwrap(IPC_CHANNELS.SKILL_CHAIN_DELETE, { chainId }); // オブジェクトを送信
```

**Handler 側** (`skillHandlers.ts` 行1224, 1280):

```typescript
async (event, chainId: unknown) => {   // 直接 string を期待
  validateStringArg(chainId, "chainId");  // typeof { chainId: "..." } !== "string" → エラー
```

Preload は `{ chainId: "some-id" }` オブジェクトを送信するが、ハンドラは第2引数を直接 `chainId: unknown` として受け取る。結果として `validateStringArg` が常にエラーを返す。

**対処方針**: ハンドラ側を Preload に合わせてオブジェクト形式で受け取るように修正する（P44 解決パターン準拠）。

### 3.2 chainExecute の引数形式（一致済み）

Preload: `safeInvokeUnwrap(CHANNEL, { chainId })` → ハンドラ: `args: unknown` → `{ chainId, variables }` でデストラクチャ → **一致**。ただし Preload 側が `variables` を渡していない点は機能制限であり、本タスクのスコープ外。

### 3.3 chainSave の引数形式（一致済み）

Preload: `safeInvokeUnwrap(CHANNEL, chain)` → ハンドラ: `chain: unknown` → **一致**。

## 4. 変更対象ファイル一覧

| ファイル                                                              | 変更種別 | 内容                                                  |
| --------------------------------------------------------------------- | -------- | ----------------------------------------------------- |
| `apps/desktop/src/main/ipc/index.ts`                                  | **修正** | registerSkillChainHandlers 呼び出し追加 + import 追加 |
| `apps/desktop/src/main/ipc/skillHandlers.ts`                          | **修正** | chainGet/chainDelete ハンドラの引数形式を P44 修正    |
| `apps/desktop/src/main/ipc/__tests__/ipc-double-registration.test.ts` | **修正** | registerSkillChainHandlers モック追加                 |

## 5. 変更しないファイル

| ファイル                | 理由                                                   |
| ----------------------- | ------------------------------------------------------ |
| `preload/channels.ts`   | チャンネル定義・ホワイトリスト登録済み                 |
| `preload/skill-api.ts`  | Preload API メソッド実装済み                           |
| `preload/types.ts`      | 型定義は SkillChainDefinition を @repo/shared から参照 |
| `SkillChainStore.ts`    | 実装完了、変更不要                                     |
| `SkillChainExecutor.ts` | 実装完了、変更不要                                     |

## 6. インスタンス生成のライフサイクル

```
app.whenReady()
  └→ createMainWindow()
      └→ registerAllIpcHandlers(mainWindow)
          ├→ ... 既存ハンドラ ...
          ├→ registerSkillHandlers(mainWindow, skillService)           // 行492
          ├→ registerSkillFileHandlers(mainWindow, ...)                // 行496
          ├→ registerSkillShareHandlers(mainWindow, ...)               // 行560
          ├→ [NEW] registerSkillChainHandlers(mainWindow, chainStore, chainExecutor)
          ├→ registerSkillScheduleHandlers(mainWindow, ...)            // 行593
          └→ ... 後続ハンドラ ...
```

## 7. 二重登録防止（P5 対策）

- `unregisterAllIpcHandlers()` は `Object.values(IPC_CHANNELS)` を全走査して `removeHandler` / `removeAllListeners` を実行する
- SKILL*CHAIN*\* 5チャンネルは `IPC_CHANNELS` に定義済みのため、解除処理は自動的にカバーされる
- `registerSkillChainHandlers` 内では `ipcMain.handle()` を使用しており、同一チャンネルへの二重登録は Electron が例外を送出する
- 安全性は `unregisterAllIpcHandlers()` → `registerAllIpcHandlers()` の順序保証で担保

## 8. リスク評価

| リスク                                           | 影響度 | 対策                                             |
| ------------------------------------------------ | ------ | ------------------------------------------------ |
| skillService 生成前に chainExecutor が使用される | 低     | 生成順序を skillService → chainExecutor に固定   |
| chainStore の storagePath が不正                 | 低     | `app.getPath("userData")` は Electron 保証のパス |
| P44 修正による既存テストの破壊                   | 中     | ハンドラテストの引数を同時更新                   |
| 二重登録例外                                     | 低     | unregister が全チャンネルを走査するため安全      |
