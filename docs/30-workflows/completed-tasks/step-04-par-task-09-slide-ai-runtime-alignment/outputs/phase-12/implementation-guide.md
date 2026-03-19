# Phase 12: 実装ガイド

## メタ情報

| 項目     | 内容                                    |
| -------- | --------------------------------------- |
| タスクID | TASK-IMP-SLIDE-AI-RUNTIME-ALIGNMENT-001 |
| Phase    | 12                                      |
| 作成日   | 2026-03-19                              |

---

## Part 1: 中学生レベル概念説明

### 1. なぜ統一するのか — バラバラだと何が起きるか

### 図書館のカウンターが3つある問題

たとえば、学校の図書館で「本を借りる手続き」のカウンターが3つあるとします。

- **カウンター A**（agent-client.ts）: 引き出しから直接カード（API key）を取り出して本を貸す
- **カウンター B**（modifier-skill.ts）: 同じ手続きを別の紙に書いてあるが、実際には誰も使っていない
- **カウンター C**（skill-executor.ts）: カウンター A に頼んで本を貸す中間役

この状態では：

- カードの管理方法が変わると3か所を修正しなければならない
- カウンター B は誰も使っていないのにメンテナンスが必要
- 「今どのカウンターがどんな方法でカードを管理しているか」が分かりにくい

**今回の整理**: カウンターを1つ（skill-executor.ts）に統合し、カードの管理は「総合受付（RuntimeResolver）」に一本化する。

#### この機能でできること

- AI 実行経路を 1 本化し、認証方法の分岐を RuntimeResolver に集約できる
- `handoff` / `guidance` を共通 DTO で扱い、UI と Main Process の説明責務をそろえられる
- slide sync の状態遷移と fallback 導線を同じ基準で設計できる

---

### 2. RuntimeResolver とは — AI 使用の許可判定係

### 入り口の警備員のたとえ

図書館の入り口に「AI 利用許可判定係」がいると想像してください。

```
あなた（スライドの編集要求）が来る
         ↓
許可判定係（RuntimeResolver）が確認する
         ↓
 ┌────────────────────────────────────────┐
 │ 質問1: 今の設定モードは何ですか？     │
 │  → サブスクリプション（月額契約）モード│
 │  → API キーモード                     │
 └────────────────────────────────────────┘
         ↓
 ┌────────────────────────────────────────┐
 │ 質問2（API キーモードの場合のみ）:    │
 │  API キーは登録されていますか？       │
 │  → はい（鍵が金庫にある）           │
 │  → いいえ（鍵がない）               │
 └────────────────────────────────────────┘
         ↓
   判定結果が出る（3パターン）
```

| 状況                            | 判定       | 意味                           |
| ------------------------------- | ---------- | ------------------------------ |
| API キーモード + 鍵あり         | integrated | 自分で AI を使える             |
| API キーモード + 鍵なし         | handoff    | 設定が必要（案内を表示）       |
| サブスクリプションモード（any） | handoff    | Claude Code に渡す（案内表示） |

---

### 3. handoff / guidance とは — 「できません、でもこうすれば」

### 友達のノートを写す時の許可システム

友達のノートをコピーしたい時を考えます。

- **integrated（自分でできる）**: 先生に許可をもらい、コピー機の鍵（API key）を持っているので自分でコピーできる
- **handoff（案内に従う）**: コピー機の鍵を持っていない。先生（RuntimeResolver）が「じゃあこうしてください」と案内してくれる

`handoff` になった場合、アプリは「**HandoffGuidance（案内チラシ）**」を表示します。

```
┌─────────────────────────────────────────┐
│ 設定が必要です                          │
│                                         │
│ 理由: API キーが設定されていません      │
│                                         │
│ 手順:                                   │
│  1. 設定画面を開く                      │
│  2. API キーを入力する                  │
│                                         │
│  または、ターミナルで以下を実行:        │
│  claude --slide /path/to/project        │
│                                         │
│ [API キーを設定] [ターミナルを開く]     │
└─────────────────────────────────────────┘
```

HandoffGuidance には3つの情報が入っています：

- `terminalCommand`: ターミナルで実行するコマンド例
- `contextSummary`: 何をしようとしていたかの要約
- `reason`: なぜ handoff になったのかの理由

---

### 4. 4つの表示状態

スライド同期の画面は4つの状態を持ちます。信号機のようなイメージです。

| 状態     | 色         | 意味                     | ボタン                                 |
| -------- | ---------- | ------------------------ | -------------------------------------- |
| synced   | 緑         | 同期完了。最新の状態です | 「同期を実行」                         |
| running  | 青（点滅） | 今まさに同期中です       | 「キャンセル」                         |
| degraded | オレンジ   | 同期に失敗しました       | 「再試行」「ターミナルで実行」         |
| guidance | 青         | 設定が必要です           | 「API キーを設定」「ターミナルを開く」 |

画面の右下には「ターミナルランチャーボタン」が常時表示されます。degraded / guidance 時は目立つ枠線がつきます。

---

### 5. セキュリティ — 入口での身分証確認

### お店の会員カード確認のたとえ

スライド機能を操作する IPC（プロセス間通信）のリクエストは、会員制のお店の入り口と同じです。

```
お客さん（Renderer画面）がリクエストを送る
             ↓
[1] 会員カード確認（validateIpcSender）
    → 「このウィンドウからのリクエストですか？」
    → 偽物のウィンドウからはブロック
             ↓
[2] 注文内容の確認（P42 3段バリデーション）
    → 「パスが入力されていますか？」
    → 「空白だけじゃないですか？」
    → 「おかしなパスじゃないですか？（../../../ 等）」
             ↓
[3] 処理実行（SyncManager / SkillExecutor）
```

---

## Part 2: 技術詳細（開発者向け）

### 1. TypeScript 型定義一覧

### APIシグネチャの前提

- `window.slideApi.executePhase(phase, projectPath)`
- `window.slideApi.startWatching(projectPath)`
- `window.slideApi.stopWatching()`
- `window.slideApi.getSyncStatus(projectPath)`
- `window.slideApi.manualSync(projectPath)`
- `window.slideApi.cancelExecution()`

### SlideSliceState

```typescript
// apps/desktop/src/renderer/slide/store.ts
interface SlideSliceState {
  projectPath: string | null;
  syncStatus: SyncStatus; // "idle" | "syncing" | "synced" | "error"
  syncDirection: SyncDirection; // "forward" | "reverse"
  syncProgress: { percent: number; message: string } | null;
  syncError: { code: string; message: string } | null;
  currentPhase: SkillPhase | "idle";
  lastSyncAt: Date | null;
  isWatching: boolean;
  executionProgress: number; // 0-100
  error: string | null;
  isHandoff: boolean;
  handoffGuidance: HandoffGuidance | null;
}
```

### SlideSliceActions

```typescript
interface SlideSliceActions {
  setProject: (path: string | null) => void;
  setSyncStatus: (status: SyncStatus) => void;
  setSyncDirection: (direction: SyncDirection) => void;
  setSyncProgress: (
    progress: { percent: number; message: string } | null,
  ) => void;
  setSyncError: (error: { code: string; message: string } | null) => void;
  setPhase: (phase: SkillPhase | "idle") => void;
  setWatching: (isWatching: boolean) => void;
  setProgress: (progress: number) => void;
  setError: (error: string | null) => void;
  setHandoff: (isHandoff: boolean, guidance: HandoffGuidance | null) => void;
  reset: () => void;
}
```

### SlideUIStatus（UI 表示状態の派生型）

```typescript
// synced / running / degraded / guidance の4状態
type SlideUIStatus = "synced" | "running" | "degraded" | "guidance";

// 判定ロジック（コンポーネント内での計算例）
function deriveUIStatus(state: SlideSliceState): SlideUIStatus {
  if (state.isHandoff) return "guidance";
  if (state.syncStatus === "error") return "degraded";
  if (state.syncStatus === "syncing" || state.currentPhase !== "idle")
    return "running";
  return "synced";
}
```

### HandoffGuidance

```typescript
// packages/shared/src/slide/types.ts（または agent/types.ts から再利用）
interface HandoffGuidance {
  terminalCommand: string; // "claude --slide /path/to/project" など
  contextSummary: string; // "structure.md L12-45 の構造変更を適用"
  reason: string; // "API key not configured" | "subscription mode"
}
```

### SyncStatus 変更点（注意）

```typescript
// 変更前（packages/shared/src/slide/types.ts）
type SyncStatus = "synced" | "out-of-sync" | "syncing" | "error";

// 変更後（正本仕様に合わせる）
type SyncStatus = "idle" | "syncing" | "synced" | "error";
```

`"out-of-sync"` → `"idle"` への変更で影響する箇所：

- `SyncStatusIndicator.tsx` の STATUS_CONFIG テーブル
- `store.ts` のデフォルト値 `syncStatus: "idle"`

---

### 2. IPC チャネル名テーブル（統一後12チャネル）

### channels.ts 定数定義

```typescript
// apps/desktop/src/main/slide/channels.ts
export const SLIDE_IPC_CHANNELS = {
  // invoke (Renderer → Main) — 6チャネル
  EXECUTE_PHASE: "slide:executePhase",
  WATCH_START: "slide:watch-start",
  WATCH_STOP: "slide:watch-stop",
  SYNC_STATUS: "slide:sync-status",
  REVERSE_SYNC: "slide:reverse-sync",
  CANCEL: "slide:cancel",
  // push (Main → Renderer) — 6チャネル
  SYNC_STATUS_CHANGED: "slide:sync-status-changed",
  SYNC_PROGRESS: "slide:sync-progress",
  SYNC_ERROR: "slide:sync-error",
  EXECUTION_PROGRESS: "slide:execution-progress",
  STRUCTURE_CHANGED: "slide:structureChanged",
  WATCH_STATUS: "slide:watch-status",
} as const;
```

### 変更前後の rename テーブル

| 現行名（廃止）            | 正本名（統一後）            | 種別   |
| ------------------------- | --------------------------- | ------ |
| `slide:startWatching`     | `slide:watch-start`         | invoke |
| `slide:stopWatching`      | `slide:watch-stop`          | invoke |
| `slide:manualSync`        | `slide:reverse-sync`        | invoke |
| `slide:getSyncStatus`     | `slide:sync-status`         | invoke |
| `slide:syncStatusChanged` | `slide:sync-status-changed` | push   |
| `slide:executionProgress` | `slide:execution-progress`  | push   |
| （新規）                  | `slide:sync-error`          | push   |
| （新規）                  | `slide:watch-status`        | push   |

---

### 3. DI 境界図

```
ipc-handlers.ts (registerSlideIpcHandlers)
  ├── ISyncManager ─────────────────────────┐
  │     ├── IFileWatcher                    │  Main Process 境界
  │     │     └── chokidar (具象)           │
  │     └── ISkillExecutor ──────────────── ┤
  │           ├── IAuthKeyService           │
  │           └── IAuthModeService          │
  └── ISkillExecutor (executePhase/cancel) ─┘
```

### インターフェース定義（P61 準拠: DIP）

```typescript
// 全て interface（具象クラスへの直接依存禁止）
interface ISyncManager {
  startWatching(
    projectPath: string,
  ): Promise<SlideResponse<{ watching: boolean }>>;
  stopWatching(projectPath: string): Promise<SlideResponse<void>>;
  reverseSync(
    projectPath: string,
  ): Promise<SlideResponse<SkillExecutionResult>>;
  getSyncStatus(
    projectPath: string,
  ): Promise<SlideResponse<{ status: SyncStatus }>>;
}

interface ISkillExecutor {
  executePhase(
    phase: SkillPhase,
    projectPath: string,
  ): Promise<SkillExecutionResult>;
  cancelExecution(): Promise<void>;
}

interface IFileWatcher {
  startWatching(path: string, callbacks: FileWatcherCallbacks): Promise<void>;
  stopWatching(path: string): Promise<void>;
}

interface IAuthKeyService {
  getKey(): string | null;
  exists(): AuthKeyExistsResponse;
  validate(key: string): AuthKeyValidateResponse;
}

interface IAuthModeService {
  getAuthMode(): AuthMode;
}
```

---

### 4. RuntimeResolver 統合パターン（コード例）

### 統合後の skill-executor.ts における呼び出し

```typescript
// apps/desktop/src/main/slide/skill-executor.ts
export class SkillExecutor implements ISkillExecutor {
  constructor(
    private readonly authKeyService: IAuthKeyService,
    private readonly authModeService: IAuthModeService,
  ) {}

  async executePhase(
    phase: SkillPhase,
    projectPath: string,
  ): Promise<SkillExecutionResult> {
    // 1. RuntimeResolver で実行可否を判定
    const resolution = RuntimeResolver.resolve(
      this.authModeService.getAuthMode(),
      this.authKeyService,
    );

    // 2. handoff の場合: SkillExecutionResult に guidance を含めて返す
    if (resolution.type === "handoff") {
      return {
        phase,
        success: false,
        isHandoff: true,
        guidance: resolution.guidance,
        duration: 0,
      };
    }

    // 3. integrated の場合: API key を取得して SDK を呼び出す
    const apiKey = this.authKeyService.getKey();
    const client = new Anthropic({ apiKey: apiKey! });

    // modifier phase の場合はモディファイアプロンプトを構成
    const prompt =
      phase === "modifier"
        ? buildModifierPrompt(projectPath)
        : buildSkillPrompt(phase, projectPath);

    const response = await client.messages.create({
      /* ... */
    });
    return parseSkillResponse(phase, response);
  }
}
```

### RuntimeResolver 分岐ロジック

```typescript
// packages/shared/src/runtime/resolver.ts（または再利用）
export const RuntimeResolver = {
  resolve(
    authMode: AuthMode,
    authKeyService: IAuthKeyService,
  ): RuntimeResolution {
    if (authMode === "subscription") {
      return {
        type: "handoff",
        guidance: {
          terminalCommand: "claude --slide .",
          contextSummary: "slide reverse-sync",
          reason: "subscription mode",
        },
      };
    }

    const key = authKeyService.getKey();
    if (!key) {
      return {
        type: "handoff",
        guidance: {
          terminalCommand: "claude --slide .",
          contextSummary: "slide reverse-sync",
          reason: "API key not configured",
        },
      };
    }

    return { type: "integrated" };
  },
};
```

---

### 5. validateIpcSender + P42 3段バリデーションの実装パターン

### 標準テンプレート（全 invoke チャネル共通）

```typescript
ipcMain.handle(
  SLIDE_IPC_CHANNELS.WATCH_START,
  async (event, projectPath: string) => {
    // Step 1: sender 検証（セキュリティ層）
    const validation = validateIpcSender(
      event,
      SLIDE_IPC_CHANNELS.WATCH_START,
      {
        getAllowedWindows: () => [mainWindow],
      },
    );
    if (!validation.valid) return toIPCValidationError(validation);

    // Step 2: P42 3段バリデーション（型 → 空文字列 → トリム空文字列）
    if (
      typeof projectPath !== "string" ||
      projectPath === "" ||
      projectPath.trim() === ""
    ) {
      return {
        success: false,
        error: { code: "VALIDATION_ERROR", message: "projectPath is required" },
      };
    }

    // Step 3: パストラバーサル検出
    if (detectPathTraversal(projectPath)) {
      return {
        success: false,
        error: { code: "VALIDATION_ERROR", message: "invalid path" },
      };
    }

    // Step 4: ビジネスロジック委譲（trim 済みの値を渡す）
    return syncManager.startWatching(projectPath.trim());
  },
);
```

### `slide:executePhase` の例（複数引数バリデーション）

```typescript
ipcMain.handle(
  SLIDE_IPC_CHANNELS.EXECUTE_PHASE,
  async (event, phase: SkillPhase, projectPath: string) => {
    // Step 1: sender 検証
    const validation = validateIpcSender(
      event,
      SLIDE_IPC_CHANNELS.EXECUTE_PHASE,
      {
        getAllowedWindows: () => [mainWindow],
      },
    );
    if (!validation.valid) return toIPCValidationError(validation);

    // Step 2: phase バリデーション
    const VALID_PHASES: SkillPhase[] = [
      "hearing",
      "structure",
      "html",
      "modifier",
    ];
    if (!VALID_PHASES.includes(phase)) {
      return {
        success: false,
        error: { code: "VALIDATION_ERROR", message: "invalid phase" },
      };
    }

    // Step 3: projectPath の P42 + パストラバーサル
    if (
      typeof projectPath !== "string" ||
      projectPath === "" ||
      projectPath.trim() === "" ||
      detectPathTraversal(projectPath)
    ) {
      return {
        success: false,
        error: { code: "VALIDATION_ERROR", message: "projectPath is required" },
      };
    }

    return skillExecutor.executePhase(phase, projectPath.trim());
  },
);
```

---

### 6. Zustand 個別セレクタの使用方法（P31/P48 準拠）

### セレクタ一覧

```typescript
// apps/desktop/src/renderer/slide/selectors.ts
import { useShallow } from "zustand/react/shallow";
import { useSlideStore } from "./store";

// スカラーセレクタ（P48 リスクなし: 参照安定）
export const useSyncStatus = () => useSlideStore((s) => s.syncStatus);
export const useSyncDirection = () => useSlideStore((s) => s.syncDirection);
export const useIsWatching = () => useSlideStore((s) => s.isWatching);
export const useExecutionProgress = () =>
  useSlideStore((s) => s.executionProgress);
export const useCurrentPhase = () => useSlideStore((s) => s.currentPhase);
export const useProjectPath = () => useSlideStore((s) => s.projectPath);
export const useIsHandoff = () => useSlideStore((s) => s.isHandoff);

// オブジェクトセレクタ（useShallow 適用: P48 対策 — filter/map で新参照が生まれる）
export const useSyncProgress = () =>
  useSlideStore(useShallow((s) => s.syncProgress));
export const useSyncError = () => useSlideStore(useShallow((s) => s.syncError));
export const useHandoffGuidance = () =>
  useSlideStore(useShallow((s) => s.handoffGuidance));

// 派生セレクタ（スカラー値: P48 リスクなし）
export const useIsExecuting = () =>
  useSlideStore((s) => s.currentPhase !== "idle");
export const useHasProject = () => useSlideStore((s) => s.projectPath !== null);

// アクションセレクタ（Zustand アクション参照は安定: P31 対策）
export const useSetSyncStatus = () => useSlideStore((s) => s.setSyncStatus);
export const useSetHandoff = () => useSlideStore((s) => s.setHandoff);
export const useResetSlide = () => useSlideStore((s) => s.reset);
```

### コンポーネントでの使用例

```typescript
// ❌ 合成 Hook を依存配列に渡す（P31 無限ループリスク）
const { setSyncStatus, isHandoff } = useSlideStore();
useEffect(() => {
  /* setSyncStatus を依存配列に入れると無限ループ */
}, [setSyncStatus]);

// ✅ 個別セレクタを使う
const isHandoff = useIsHandoff();
const handoffGuidance = useHandoffGuidance();
const setSyncStatus = useSetSyncStatus();
useEffect(() => {
  /* Zustand アクション参照は安定しているため安全 */
}, [setSyncStatus]);
```

---

### 7. 廃止ファイル一覧

| ファイル                                        | 廃止理由                                          | 移行先              |
| ----------------------------------------------- | ------------------------------------------------- | ------------------- |
| `apps/desktop/src/main/slide/agent-client.ts`   | Direct SDK + electron-store 直読み + env fallback | `skill-executor.ts` |
| `apps/desktop/src/main/slide/modifier-skill.ts` | 孤立コード・skill-executor と二重実装             | `skill-executor.ts` |

### 廃止に伴うテストファイルの変更

| テストファイル                        | 変更内容                                         |
| ------------------------------------- | ------------------------------------------------ |
| `__tests__/agent-client.test.ts`      | 廃止 → skill-executor.test.ts に移植             |
| `__tests__/modifier-skill.test.ts`    | 廃止 → skill-executor.test.ts に統合             |
| `__tests__/skill-executor.test.ts`    | `vi.mock("../agent-client")` 削除、DI モック差替 |
| `__tests__/sdk-integration.test.ts`   | agent-client 経由 → skill-executor 経由に改修    |
| `__tests__/slide-integration.test.ts` | agent-client mock → skill-executor DI mock       |

---

### 8. 設定項目と定数一覧

```typescript
// apps/desktop/src/preload/channels.ts（または whitelist 定義ファイル）

// ALLOWED_INVOKE_CHANNELS に追加
const ALLOWED_INVOKE_CHANNELS = [
  // ... 既存
  "slide:executePhase",
  "slide:watch-start",
  "slide:watch-stop",
  "slide:sync-status",
  "slide:reverse-sync",
  "slide:cancel",
] as const;

// ALLOWED_ON_CHANNELS に追加
const ALLOWED_ON_CHANNELS = [
  // ... 既存
  "slide:sync-status-changed",
  "slide:sync-progress",
  "slide:sync-error",
  "slide:execution-progress",
  "slide:structureChanged",
  "slide:watch-status",
] as const;
```

---

### 9. エラーハンドリング

| ケース           | 方針                                                                 |
| ---------------- | -------------------------------------------------------------------- |
| invalid sender   | `validateIpcSender` の失敗を IPC error envelope へ正規化する         |
| validation error | `code: "VALIDATION_ERROR"` と最小限の `message` を返す               |
| runtime handoff  | `isHandoff: true` と `guidance` を返し、secret は command に含めない |
| sync failure     | `sync-error` push と store error を同じ taxonomy に正規化する        |

### 10. エッジケース

| エッジケース                  | 対応                                                                     |
| ----------------------------- | ------------------------------------------------------------------------ |
| `authMode === "subscription"` | integrated 実行せず terminal handoff を返す                              |
| API key 未設定                | `guidance.reason = "API key not configured"` を返す                      |
| `projectPath` が空文字列      | P42 3段バリデーションで reject する                                      |
| `../` を含む path             | path traversal guard で reject する                                      |
| 旧チャネル名 listener が残る  | rename table を定数化して preload / renderer / main を同 wave で置換する |

### 11. 実装優先順位（Phase 5 向け参考）

| 優先度 | タスク                                       | 依存先                    |
| ------ | -------------------------------------------- | ------------------------- |
| 1      | `channels.ts` IPC 定数定義                   | なし                      |
| 2      | `SyncStatus` 型変更（out-of-sync → idle）    | channels.ts               |
| 3      | `SlideSliceState` / `Actions` 拡張           | 型変更                    |
| 4      | `ipc-handlers.ts` validateIpcSender + P42    | channels.ts, 型定義       |
| 5      | `skill-executor.ts` RuntimeResolver 統合     | IAuthKeyService           |
| 6      | `agent-client.ts` / `modifier-skill.ts` 廃止 | skill-executor 統合完了後 |
| 7      | Zustand 個別セレクタ追加                     | SlideSlice 拡張後         |
| 8      | UI コンポーネント（degraded/guidance 表示）  | セレクタ追加後            |
