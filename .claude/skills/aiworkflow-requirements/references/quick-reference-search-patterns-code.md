# クイックリファレンス — 検索パターン集: コードパターン早見

> 機能・タスク別キーワードとコードパターンの早見表
> スキルライフサイクル系は [quick-reference-search-patterns-skill-lifecycle.md](quick-reference-search-patterns-skill-lifecycle.md) を参照
> IPC/インフラ系は [quick-reference-search-patterns-ipc-infra.md](quick-reference-search-patterns-ipc-infra.md) を参照

---

## 機能・タスク別のキーワード

| 機能・タスク種別 | 検索キーワード |
| --- | --- |
| Skill Lifecycle Terminal 統合 | TerminalHandoffCard, improve要約, terminal-surface, skill-lifecycle |
| Skill Create Constraint UI | ConstraintChip, ConstraintChipList, constraint-chips |
| Quality Gate / Runtime UI | QualityGateLabel, RuntimeBanner, quality-gate, runtime-banner |
| Reuse/Improve Cycle | ReuseReady, ImproveReady, review, SkillExecutionStatus |

---

## コードパターン早見

### Electron IPC パターン

```typescript
// Main Process Handler
ipcMain.handle("xxx:action", async (event, request) => {
  return { success: true, data: result };
});

// Preload API
contextBridge.exposeInMainWorld("xxxAPI", {
  action: (req) => ipcRenderer.invoke("xxx:action", req),
});

// React Hook
const result = await window.xxxAPI.action(request);
```

**詳細**: architecture-patterns.md L620-905, security-api-electron.md

### IPC transport DTO 正本化パターン

```typescript
// shared transport DTO を唯一の正本にする
export type IPCResponse<T> =
  | { success: true; data?: T }
  | { success: false; error: { code: string; message: string } };

// Main / Preload / Renderer は再定義せず import / re-export する
```

| 確認項目 | 期待値 |
|---------|--------|
| request / response / event | `packages/shared/src/types/*` の DTO と一致 |
| Preload 公開型 | local 再定義ではなく shared 型の import / re-export |
| error envelope | `success` / `data` / `error.code` / `error.message` / `guidance?` が一致 |

**詳細**: api-ipc-system.md, interfaces-auth.md, ipc-contract-checklist.md

### IPC ハンドラライフサイクル管理パターン（P5 Main Process 対策）

macOS `activate` イベントでウィンドウ再作成時の二重登録防止:

```typescript
// ❌ 二重登録例外（handle は2回目で例外送出）
app.on("activate", () => {
  mainWindowRef = createWindow();
  registerAllIpcHandlers(mainWindowRef); // Error!
});

// ✅ unregister → createWindow → register の3ステップ
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    unregisterAllIpcHandlers();           // Step 1: 全解除
    mainWindowRef = createWindow();       // Step 2: 新ウィンドウ
    registerAllIpcHandlers(mainWindowRef); // Step 3: 再登録
  }
});
```

| API | 二重登録時の動作 | 解除API |
|-----|-----------------|---------|
| `ipcMain.handle()` | 例外送出 | `removeHandler()` |
| `ipcMain.on()` | リスナー累積 | `removeAllListeners()` |

**詳細**: security-electron-ipc.md（IPC ハンドラライフサイクル管理）, architecture-implementation-patterns.md（二重登録防止パターン）
**関連 Pitfall**: 06-known-pitfalls.md#P5

### Supabase 未設定 fallback handler パターン

```typescript
if (getSupabaseClient()) {
  registerAuthHandlers(mainWindow, supabase, secureStorage);
  registerProfileHandlers(mainWindow, supabase, profileCache);
  registerAvatarHandlers(mainWindow, supabase);
} else {
  registerAuthFallbackHandlers();
  registerProfileFallbackHandlers();
  registerAvatarFallbackHandlers();
}
```

| 確認項目 | 期待値 |
| -------- | ------ |
| Profile channels | `profile:*` 11チャネルを fallback 配列へ全件登録 |
| Avatar channels | `avatar:*` 3チャネルを fallback 配列へ全件登録 |
| error envelope | `{ success: false, error: { code, message } }` に統一し、`PROFILE_ERROR_CODES.NOT_CONFIGURED` / `AVATAR_ERROR_CODES.NOT_CONFIGURED` を返す |
| registration | `ReadonlyArray` + `for...of` で宣言的登録 |
| lifecycle | 通常経路と fallback 経路を if/else 排他にする |

**詳細**: api-ipc-auth.md, architecture-auth-security.md, security-electron-ipc.md, ipc-contract-checklist.md
**完了タスク**: TASK-FIX-SUPABASE-FALLBACK-PROFILE-AVATAR-001（Profile 11ch / Avatar 3ch の fallback 実装完了）

### Result Pattern

```typescript
type Result<T, E> = { success: true; data: T } | { success: false; error: E };
```

**詳細**: interfaces-core.md L70-105

### Zustand Slice

```typescript
export const createXxxSlice: StateCreator<XxxSlice> = (set) => ({
  // state
  data: null,
  // actions
  setData: (data) => set({ data }),
});
```

**詳細**: architecture-patterns.md L141-234

### P31対策: Store Hooks無限ループ防止

合成Store Hook（`useAuthModeStore()`等）が毎回新しいオブジェクトを返すため、関数を`useEffect`依存配列に含めると無限ループ発生。

| 対策 | 方法 | 適用場面 |
|------|------|---------|
| 短期 | `useRef`ガード + 空の依存配列 | 既存コード緊急修正 |
| 長期 | 個別セレクタ再設計 | 新規実装時 |

```typescript
// ❌ 無限ループ
const { initializeAuthMode } = useAuthModeStore();
useEffect(() => { initializeAuthMode(); }, [initializeAuthMode]);

// ✅ useRefガード
const initRef = useRef(false);
useEffect(() => {
  if (!initRef.current) { initRef.current = true; initializeAuthMode(); }
}, []); // P31対策: 意図的に空の依存配列
```

**詳細**:
- 設計原則: arch-state-management.md L156-245
- 成功パターン: patterns.md（Zustand Store Hooks 無限ループ対策）
- 落とし穴: 06-known-pitfalls.md#P31

### Store selector migration / renderer direct IPC removal

```typescript
// before
const result = await window.electronAPI.skill.analyze(skillName);

// after
const analyzeSkill = useAnalyzeSkill();
await analyzeSkill(skillName);
```

| 確認項目 | 期待値 |
|---------|--------|
| 対象 | Renderer 直呼び出しを Store action / 個別セレクタへ寄せる |
| state 境界 | 共有 state は Store、UI 一時 state は local |
| 検索語 | `TASK-10A-F`, `store-driven lifecycle`, `selector migration`, `renderer direct IPC removal` |

**詳細**: arch-state-management.md, architecture-implementation-patterns.md, task-workflow.md, lessons-learned.md

### CTA制御マトリクスパターン（TASK-SKILL-LIFECYCLE-05）

`Record<ScoringGate, CTAVisibility>` で採点ゲート → ボタン表示状態を静的マッピング。キー不足はコンパイルエラーで検出。30テスト（16マトリクス + 7境界値 + 3異常値 + 4ハイライト）。

```typescript
import { getCTAVisibilityFromScore } from "@repo/shared";
const cta = getCTAVisibilityFromScore(85); // USE_ALLOWED
// cta.useNow === "primary", cta.improveFirst === "hidden"
```

**詳細**: workflow-skill-lifecycle-created-skill-usage-journey.md, packages/shared/src/types/cta-visibility.ts

### ChatPanel統合パターン（TASK-7D）

```typescript
// 条件レンダーでSkillStreamingViewを統合
{isExecuting && selectedSkillName && (
  <SkillStreamingView skillName={selectedSkillName} />
)}

// forwardRef + useImperativeHandle で外部API公開
const ChatPanel = forwardRef<ChatPanelHandle, ChatPanelProps>((props, ref) => {
  useImperativeHandle(ref, () => ({ handleImportRequest }));
});

// DisplayableStatus型（idle除外の厳密なステータス）
type DisplayableStatus = Exclude<SkillExecutionStatus, "idle">;

// Store個別セレクタで再レンダー最適化
const isExecuting = useAppStore((s) => s.skill.isExecuting);
const selectedSkillName = useAppStore((s) => s.skill.selectedSkillName);
```

**詳細**: interfaces-agent-sdk-ui.md, ui-ux-agent-execution.md, ui-ux-feature-components.md
