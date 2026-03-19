# Phase 5 実装計画

| 項目     | 内容                                    |
| -------- | --------------------------------------- |
| タスクID | TASK-IMP-SLIDE-AI-RUNTIME-ALIGNMENT-001 |
| Phase    | 5 - 実装                                |
| 作成日   | 2026-03-19                              |

## 概要

Slide/Modifier/Legacy Agent 経路の runtime 整流実装計画。
T-5-1〜T-5-7 の7タスクを依存関係順に実装する。

## 依存関係グラフ

```
T-5-1 (IPC チャネル名統一)
  └→ T-5-2 (validateIpcSender + P42 追加)
       └→ T-5-3 (agent-client.ts 廃止 + RuntimeResolver 統合)
            ├→ T-5-4 (ModifierSkill 統合)
            └→ T-5-5 (onHtmlChange → SyncManager 自動パス接続)
                  └→ T-5-6 (slideSlice 新設 + IPC リスナー)
                        └→ T-5-7 (UI 4領域コンポーネント実装)
```

T-5-1 が全タスクの前提となる。T-5-4 と T-5-5 は T-5-3 完了後に並列実行可能。

---

## T-5-1: IPC チャネル名統一

**目的**: 4系統の IPC チャネル名を正本に統一し、文字列リテラルを `IPC_CHANNELS` 定数に置き換える（P27対策）

**変更対象ファイル**:

- `apps/desktop/src/main/slide/ipc-handlers.ts`
- `apps/desktop/src/shared/ipc-channels.ts` (または `channels.ts`)
- `apps/desktop/src/preload/slide-api.ts`

**チャネル名統一マッピング**:

| 旧チャネル名（廃止）  | 新チャネル名（正本）  | 定数名                             |
| --------------------- | --------------------- | ---------------------------------- |
| `slide:startWatching` | `slide:watch-start`   | `IPC_CHANNELS.SLIDE_WATCH_START`   |
| `slide:stopWatching`  | `slide:watch-stop`    | `IPC_CHANNELS.SLIDE_WATCH_STOP`    |
| `slide:syncProgress`  | `slide:sync-progress` | `IPC_CHANNELS.SLIDE_SYNC_PROGRESS` |
| `slide:syncError`     | `slide:sync-error`    | `IPC_CHANNELS.SLIDE_SYNC_ERROR`    |
| `slide:reverseSync`   | `slide:reverse-sync`  | `IPC_CHANNELS.SLIDE_REVERSE_SYNC`  |
| `slide:getStatus`     | `slide:status`        | `IPC_CHANNELS.SLIDE_STATUS`        |

**実装パターン（P27対策）**:

```typescript
// ❌ 文字列リテラル使用禁止
ipcMain.handle("slide:startWatching", async (event, args) => { ... });

// ✅ IPC_CHANNELS 定数を使用
import { IPC_CHANNELS } from "../shared/ipc-channels";
ipcMain.handle(IPC_CHANNELS.SLIDE_WATCH_START, async (event, args) => { ... });
```

**検証コマンド**:

```bash
# 文字列リテラルでのチャネル名指定が残っていないことを確認
grep -rn "slide:" apps/desktop/src/main/ | grep -v "IPC_CHANNELS"
grep -rn "slide:" apps/desktop/src/preload/ | grep -v "IPC_CHANNELS"
```

**完了条件**:

- [ ] `ipc-channels.ts` に全6チャネル定数が定義済み
- [ ] `ipc-handlers.ts` の全ハンドラが `IPC_CHANNELS` 定数を使用
- [ ] `preload/slide-api.ts` の全 `safeInvoke`/`safeOn` が `IPC_CHANNELS` 定数を使用
- [ ] 文字列リテラルでのチャネル名指定がゼロ

---

## T-5-2: validateIpcSender + P42 追加

**目的**: 全6 IPC ハンドラにセキュリティチェックと3段バリデーションを追加

**変更対象ファイル**:

- `apps/desktop/src/main/slide/ipc-handlers.ts`

**依存**: T-5-1 完了

**実装パターン（validateIpcSender + P42 3段バリデーション）**:

```typescript
ipcMain.handle(IPC_CHANNELS.SLIDE_WATCH_START, async (event, args) => {
  // セキュリティチェック（validateIpcSender）
  if (
    !validateIpcSender(event, mainWindow, {
      getAllowedWindows: () => [mainWindow],
    })
  ) {
    return {
      success: false,
      error: { code: "UNAUTHORIZED", message: "Unauthorized sender" },
    };
  }

  // P42 3段バリデーション（型チェック → 空文字列 → トリム空文字列）
  if (
    typeof args?.slidePath !== "string" ||
    args.slidePath === "" ||
    args.slidePath.trim() === ""
  ) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "slidePath must be a non-empty string",
      },
    };
  }

  // ビジネスロジック
  // ...
});
```

**対象ハンドラ一覧**:

| ハンドラ             | 検証対象引数        | 検証項目           |
| -------------------- | ------------------- | ------------------ |
| `SLIDE_WATCH_START`  | `slidePath: string` | 型・空文字・トリム |
| `SLIDE_WATCH_STOP`   | なし                | sender のみ        |
| `SLIDE_REVERSE_SYNC` | `htmlPath: string`  | 型・空文字・トリム |
| `SLIDE_STATUS`       | なし                | sender のみ        |

**完了条件**:

- [ ] 全ハンドラに `validateIpcSender` チェックを追加
- [ ] 文字列引数を持つハンドラに P42 3段バリデーションを追加
- [ ] エラーレスポンス形式が `{ success: false, error: { code, message } }` で統一

---

## T-5-3: agent-client.ts 廃止 + RuntimeResolver 統合

**目的**: Direct SDK / electron-store / env fallback を排除し、RuntimeResolver + IAuthKeyService 経由に統一

**変更対象ファイル**:

- `apps/desktop/src/main/slide/skill-executor.ts` (主要変更)
- `apps/desktop/src/main/slide/agent-client.ts` (廃止)

**依存**: T-5-2 完了

**廃止対象パターン**:

```typescript
// ❌ 廃止: Direct SDK 直接呼び出し
import { ClaudeAgentSDK } from "@anthropic-ai/claude-agent-sdk";
const sdk = new ClaudeAgentSDK({ apiKey: process.env.ANTHROPIC_API_KEY });

// ❌ 廃止: electron-store からの直接取得
const apiKey = store.get("apiKey") as string;

// ❌ 廃止: env fallback
const apiKey = process.env.ANTHROPIC_API_KEY ?? store.get("apiKey");
```

**統合後パターン（RuntimeResolver + IAuthKeyService）**:

```typescript
// ✅ RuntimeResolver で runtime モード判定
const runtimeMode = await this.runtimeResolver.resolve();

if (runtimeMode.mode === "handoff") {
  return {
    success: true,
    data: {
      isHandoff: true,
      handoffGuidance: runtimeMode.guidance,
    },
  };
}

// ✅ IAuthKeyService 経由でトークン取得
const token = await this.authKeyService.getKey();
if (!token) {
  return {
    success: false,
    error: {
      code: "AUTHENTICATION_ERROR",
      message: "認証情報が見つかりません",
    },
  };
}

// ✅ トークンを SDK に渡す（IAuthKeyService 経由のみ）
const result = await this.sdkClient.execute(skill, context, { token });
```

**DI コンストラクタ設計（P61 DIP 準拠）**:

```typescript
// ✅ インターフェースに依存（具象クラスに依存しない）
export class SkillExecutor {
  constructor(
    private readonly sdkClient: ISdkClient,
    private readonly runtimeResolver: IRuntimeResolver,
    private readonly authKeyService: IAuthKeyService,
  ) {}
}
```

**agent-client.ts 廃止手順**:

1. `agent-client.ts` の全 export が `skill-executor.ts` で再実装されていることを確認
2. `agent-client.ts` のインポート箇所を `grep -rn "agent-client"` で洗い出す
3. 全インポートを新パスに差し替え
4. `agent-client.ts` ファイルを削除

**完了条件**:

- [ ] `agent-client.ts` が削除済み
- [ ] `skill-executor.ts` が `RuntimeResolver` と `IAuthKeyService` を DI で受け取る
- [ ] Direct SDK / electron-store / env fallback の呼び出しがゼロ
- [ ] `grep -rn "agent-client" apps/desktop/src/` がゼロ件

---

## T-5-4: ModifierSkill 統合

**目的**: `modifier-skill.ts` の機能を `skill-executor.ts` に統合し、重複実装を排除

**変更対象ファイル**:

- `apps/desktop/src/main/slide/skill-executor.ts` (統合先)
- `apps/desktop/src/main/slide/modifier-skill.ts` (廃止)

**依存**: T-5-3 完了（T-5-5 と並列実行可能）

**統合方針**:

- `modifier-skill.ts` の修正ロジックを `skill-executor.ts` の `executeModifier()` メソッドとして組み込む
- `ModifierSkill` の型定義は `packages/shared` に移動（P32対策）

**実装パターン**:

```typescript
export class SkillExecutor {
  // 既存の execute() に加えて modifier 実行を統合
  async executeModifier(
    modifier: ModifierSkill,
    context: ExecutionContext,
  ): Promise<ExecutionResult> {
    // modifier-skill.ts の処理を移植
    const runtimeMode = await this.runtimeResolver.resolve();
    // ...
  }
}
```

**完了条件**:

- [ ] `modifier-skill.ts` の全機能が `skill-executor.ts` に移植済み
- [ ] `modifier-skill.ts` が削除済み
- [ ] `grep -rn "modifier-skill" apps/desktop/src/` がゼロ件
- [ ] `ModifierSkill` 型が `packages/shared` に移動済み

---

## T-5-5: onHtmlChange → SyncManager 自動パス接続

**目的**: `FileWatcher` の `onHtmlChange` コールバックを `SyncManager.reverseSync` に接続し、HTML 変更の自動逆同期を実現

**変更対象ファイル**:

- `apps/desktop/src/main/slide/file-watcher.ts`
- `apps/desktop/src/main/slide/sync-manager.ts`
- `apps/desktop/src/main/slide/slide-service.ts` (接続箇所)

**依存**: T-5-3 完了（T-5-4 と並列実行可能）

**接続パターン**:

```typescript
// slide-service.ts での接続
export class SlideService {
  constructor(
    private readonly fileWatcher: FileWatcher,
    private readonly syncManager: SyncManager,
  ) {
    // onHtmlChange を SyncManager.reverseSync に接続
    this.fileWatcher.onHtmlChange = async (htmlPath: string) => {
      await this.syncManager.reverseSync(htmlPath);
    };
  }
}
```

**P5 対策（register/unregister ペア）**:

```typescript
async startWatching(slidePath: string): Promise<void> {
  // 既存リスナーの登録解除（P5対策）
  await this.fileWatcher.stop();
  // 新規登録
  await this.fileWatcher.start(slidePath);
}

async stopWatching(): Promise<void> {
  await this.fileWatcher.stop();
  this.fileWatcher.onHtmlChange = undefined;
}
```

**完了条件**:

- [ ] `onHtmlChange` が `SyncManager.reverseSync` に接続済み
- [ ] start/stop のペアで onHtmlChange の設定/解除が行われる（P5対策）
- [ ] TC-04-05 のテストがパス

---

## T-5-6: slideSlice 新設 + IPC リスナー

**目的**: Zustand `slideSlice` を新設し、Main Process からの IPC push を受信してストアを更新する

**変更対象ファイル**:

- `apps/desktop/src/renderer/store/slices/slideSlice.ts` (新規作成)
- `apps/desktop/src/renderer/store/store.ts` (slideSlice を統合)

**依存**: T-5-5 完了

**slideSlice 型定義**（Phase 1-3 設計結論より）:

```typescript
export interface SlideState {
  syncStatus: "idle" | "syncing" | "synced" | "error";
  syncDirection: "forward" | "reverse" | null;
  syncProgress: number; // 0-100
  syncError: { code: string; message: string } | null;
  isHandoff: boolean;
  handoffGuidance: string | null;
}

const initialState: SlideState = {
  syncStatus: "idle", // "out-of-sync" ではなく "idle" に統一
  syncDirection: null,
  syncProgress: 0,
  syncError: null,
  isHandoff: false,
  handoffGuidance: null,
};
```

**IPC リスナー登録（P5対策: モジュールレベルでガード）**:

```typescript
// slideSlice.ts でのリスナー登録パターン
let isListenerRegistered = false; // P5: 二重登録防止

export function registerSlideIpcListeners(): void {
  if (isListenerRegistered) return;
  isListenerRegistered = true;

  window.electronAPI.on(IPC_CHANNELS.SLIDE_SYNC_PROGRESS, (data) => {
    useSlideStore.setState({
      syncProgress: data.progress,
      syncDirection: data.syncDirection,
      syncStatus: "syncing",
    });
  });

  window.electronAPI.on(IPC_CHANNELS.SLIDE_SYNC_ERROR, (data) => {
    useSlideStore.setState({
      syncError: data,
      syncStatus: "error",
    });
  });
}
```

**個別セレクタ（P31対策）**:

```typescript
// ❌ 合成Hook（useEffect 依存配列との組み合わせで無限ループリスク）
// const { syncStatus, syncProgress } = useSlideStore();

// ✅ 個別セレクタを提供
export const useSyncStatus = () => useSlideStore((s) => s.syncStatus);
export const useSyncProgress = () => useSlideStore((s) => s.syncProgress);
export const useIsHandoff = () => useSlideStore((s) => s.isHandoff);
export const useHandoffGuidance = () => useSlideStore((s) => s.handoffGuidance);
```

**完了条件**:

- [ ] `slideSlice.ts` が新規作成済み
- [ ] `SyncStatus` 型が `"idle"` を含む（`"out-of-sync"` は使用しない）
- [ ] `store.ts` に `slideSlice` が統合済み
- [ ] IPC リスナーが二重登録されないよう P5 ガードが実装済み
- [ ] 個別セレクタが `useSyncStatus`, `useSyncProgress`, `useIsHandoff`, `useHandoffGuidance` の4つ以上提供済み
- [ ] TC-04-11 のテストがパス

---

## T-5-7: UI 4領域コンポーネント実装

**目的**: `SlideSyncCard`, `SlideProgressRow`, `SlideWatchStatus`, `SlideGuidanceBlock` の4コンポーネントを実装

**変更対象ファイル**:

- `apps/desktop/src/renderer/slide/SlideSyncCard.tsx` (新規作成)
- `apps/desktop/src/renderer/slide/SlideProgressRow.tsx` (新規作成)
- `apps/desktop/src/renderer/slide/SlideWatchStatus.tsx` (新規作成)
- `apps/desktop/src/renderer/slide/SlideGuidanceBlock.tsx` (新規作成)
- `apps/desktop/src/renderer/slide/SlideWorkspace.tsx` (統合)

**依存**: T-5-6 完了

**コンポーネント仕様**:

### SlideSyncCard

メイン同期カード。他の3コンポーネントを包含する。

```typescript
interface SlideSyncCardProps {
  slidePath: string;
  onStartWatch: () => void;
  onStopWatch: () => void;
}
```

### SlideProgressRow

進捗バー行。0-100% のプログレス表示。

```typescript
interface SlideProgressRowProps {
  progress: number; // 0-100
  direction: "forward" | "reverse" | null;
}
```

### SlideWatchStatus

4状態（idle/syncing/synced/error）のステータス表示。

```typescript
interface SlideWatchStatusProps {
  syncStatus: "idle" | "syncing" | "synced" | "error";
}

// 状態ラベルマッピング（P47対策: Record定数として export）
export const syncStatusLabels: Record<
  SlideWatchStatusProps["syncStatus"],
  string
> = {
  idle: "待機中",
  syncing: "同期中",
  synced: "同期済み",
  error: "エラー",
};
```

### SlideGuidanceBlock

Handoff/degraded 状態のガイダンス表示。

```typescript
interface SlideGuidanceBlockProps {
  isHandoff: boolean;
  handoffGuidance: string | null;
}
```

**Apple HIG 準拠スタイリング（01-architecture.md）**:

- カラー: `systemBlue` (#007AFF / #0A84FF), `systemGreen` (#34C759 / #30D158)
- 角丸: `8px` 〜 `12px`
- 影: `0 1px 3px rgba(0,0,0,0.04)`
- アニメーション: 200-300ms

**完了条件**:

- [ ] 4コンポーネントが新規作成済み
- [ ] `SlideWorkspace.tsx` に統合済み
- [ ] `syncStatusLabels` が `Record<SyncStatus, string>` 型で export 済み（P47対策）
- [ ] TC-04-09, TC-04-10 のテストがパス
- [ ] ライト/ダークモード両対応

---

## 共通対策まとめ

| 落とし穴                                | 対策箇所                                   |
| --------------------------------------- | ------------------------------------------ |
| P5: リスナー二重登録                    | T-5-5 (onHtmlChange), T-5-6 (IPC リスナー) |
| P27: IPC_CHANNELS 定数不使用            | T-5-1 (全チャネル名統一)                   |
| P31: 合成Hook無限ループ                 | T-5-6 (個別セレクタ提供)                   |
| P39: happy-dom userEvent                | 全 UI テスト (fireEvent 使用)              |
| P41: v8 カバレッジ inline function      | T-5-2 (getAllowedWindows コールバック検証) |
| P42: 3段バリデーション漏れ              | T-5-2 (全ハンドラ)                         |
| P47: CSS変数テストアサーション          | T-5-7 (syncStatusLabels export)            |
| P61: DIP 違反                           | T-5-3 (インターフェース依存)               |
| P62: DEFAULT_CONFIG fallback            | T-5-3 (RuntimeResolver 必須判定)           |
| P63: サブエージェントインポートパス誤り | 全テスト作成時に既存テストのパスを参照     |

## 実装前チェックリスト

- [ ] 対象ファイルの `git log` と現在のコードで既実装確認（P50対策）
- [ ] `grep -rn "agent-client\|modifier-skill" apps/desktop/src/` で廃止対象の参照箇所を全洗い出し
- [ ] テスト作成前に既存テストのインポートパスを確認（P63対策）
