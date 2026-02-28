# Phase 2 アーキテクチャ設計 - TASK-9H-SKILL-DEBUG

## レイヤー図

```
┌─────────────────────────────────────────────────────┐
│ Renderer (React)                                     │
│  SkillDebugPanel → useSkillDebug() hook              │
│     ↓ IPC via contextBridge                          │
├─────────────────────────────────────────────────────┤
│ Preload                                              │
│  skill-api.ts (safeInvoke/safeOn)                    │
│  channels.ts (IPC_CHANNELS定数)                      │
│     ↓                                                │
├─────────────────────────────────────────────────────┤
│ Main Process                                         │
│  IPC Handlers (skill-debug-handlers.ts)              │
│     ↓                                                │
│  SkillDebugger (統合クラス)                           │
│     ├── DebugSession (状態管理)                      │
│     ├── SkillExecutor (スキル実行委譲)               │
│     └── BrowserWindow (イベント送信)                 │
└─────────────────────────────────────────────────────┘
```

## 新規ファイルと責務

| ファイルパス                                        | 責務                                                                         |
| --------------------------------------------------- | ---------------------------------------------------------------------------- |
| `packages/shared/src/types/skill-debug.ts`          | 共有型定義（セッション・ブレークポイント・イベント・IPC型）                  |
| `apps/desktop/src/main/services/skill-debugger.ts`  | デバッガ統合クラス：セッション管理・コマンド実行・イベント送信               |
| `apps/desktop/src/main/services/debug-session.ts`   | デバッグセッション状態管理：状態遷移・ブレークポイント・変数・コールスタック |
| `apps/desktop/src/main/ipc/skill-debug-handlers.ts` | IPCハンドラ：7チャネルの登録・バリデーション・委譲                           |
| `apps/desktop/src/preload/channels.ts`              | チャネル定数追加（DEBUG\_\*）                                                |
| `apps/desktop/src/preload/skill-api.ts`             | Preload API追加（debugStart等）                                              |

## DIパターン

```
SkillService
  └── setSkillDebugger(debugger)  ← Setter Injection（BrowserWindow依存のため遅延注入）

SkillDebugger
  ├── constructor(mainWindow)     ← Constructor Injection
  ├── DebugSession（内部生成）
  └── SkillExecutor（外部注入）
```

- **SkillDebugger**: `BrowserWindow` を Constructor Injection で受け取る。`mainWindow` 生成後に `SkillService` へ Setter Injection で注入
- **DebugSession**: `SkillDebugger` が内部で生成・管理（Factory パターン）。セッションごとに新規インスタンスを作成
- 既存の `SkillService.setSkillExecutor()` パターン（P34）に準拠
