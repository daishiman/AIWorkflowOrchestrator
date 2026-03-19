# Phase 1: 要件定義 - 成果物

## メタ情報

| 項目     | 内容                                    |
| -------- | --------------------------------------- |
| タスクID | TASK-IMP-SLIDE-AI-RUNTIME-ALIGNMENT-001 |
| Phase    | 1                                       |
| 作成日   | 2026-03-19                              |

---

## T-1-1: 経路棚卸し

### 現状 runtime / 認証経路マップ

| ファイル          | 認証取得方法                                            | runtime engine                       | fallback パス                        |
| ----------------- | ------------------------------------------------------- | ------------------------------------ | ------------------------------------ |
| agent-client.ts   | electron-store 直読み → safeStorage 復号 → env fallback | `new Anthropic({ apiKey })` (Direct) | `process.env.ANTHROPIC_API_KEY`      |
| skill-executor.ts | `getAgentAPI()` → agent-client.ts に委譲                | `agentAPI.query()` → agent-client    | なし（agent-client 側で処理）        |
| modifier-skill.ts | `getAgentAPI()` → agent-client.ts に委譲                | `agentAPI.query()` → agent-client    | なし（呼び出しチェーン未接続・孤立） |
| ipc-handlers.ts   | なし（skill-executor.ts に委譲）                        | なし（orchestration のみ）           | なし                                 |
| sync-manager.ts   | なし（skill-executor.ts に委譲）                        | なし（orchestration のみ）           | なし                                 |
| file-watcher.ts   | なし（ファイルシステム操作のみ）                        | なし                                 | なし                                 |

### 現行認証取得フロー図

```
[現行]
SlideWorkspace.tsx
  → useSlideProject.ts (window.slideApi.executePhase)
    → ipc-handlers.ts (slide:executePhase)
      → skill-executor.ts (getAgentAPI())
        → agent-client.ts
          → electron-store 直読み (L99,117)
            → safeStorage 復号
              → [成功] new Anthropic({ apiKey }) → client.messages.create() (L245-256)
              → [失敗] process.env.ANTHROPIC_API_KEY (L127)
                → [成功] new Anthropic({ apiKey })
                → [失敗] エラー throw

[期待]
SlideWorkspace.tsx
  → useSlideProject.ts (window.slideApi.executePhase)
    → ipc-handlers.ts (slide:executePhase) + validateIpcSender
      → skill-executor.ts
        → RuntimeResolver.resolve()
          → [integrated] IAuthKeyService.getKey() → SkillExecutor.execute()
          → [handoff] guidance + terminal handoff → UI 表示
```

---

## T-1-2: Direct SDK / Silent Fallback の特定

### 問題箇所一覧

| #   | 問題カテゴリ          | ファイル:行番号         | 内容                                                        | 排除方法            |
| --- | --------------------- | ----------------------- | ----------------------------------------------------------- | ------------------- |
| 1   | Direct SDK import     | `agent-client.ts:9`     | `import Anthropic from "@anthropic-ai/sdk"`                 | ファイル廃止        |
| 2   | electron-store 直読み | `agent-client.ts:99`    | `const store = new Store<{ anthropic_api_key?: string }>()` | ファイル廃止        |
| 3   | electron-store 直読み | `agent-client.ts:117`   | `const encrypted = store.get("anthropic_api_key")`          | ファイル廃止        |
| 4   | env fallback          | `agent-client.ts:127`   | `const envKey = process.env.ANTHROPIC_API_KEY`              | ファイル廃止        |
| 5   | SDK 直呼び出し        | `agent-client.ts:245`   | `const client = new Anthropic({ apiKey })`                  | ファイル廃止        |
| 6   | SDK 直呼び出し        | `agent-client.ts:248`   | `client.messages.create(...)`                               | ファイル廃止        |
| 7   | コメント乖離          | `agent-client.ts:163`   | 「シミュレーション実装」コメントだが実際は SDK 直呼び出し   | コメント削除        |
| 8   | 孤立モジュール        | `modifier-skill.ts:11`  | `import { getAgentAPI }` → agent-client.ts 依存             | skill-executor 統合 |
| 9   | 孤立モジュール        | `modifier-skill.ts:287` | `agentAPI.query()` 呼び出し（未接続）                       | skill-executor 統合 |

### 影響範囲

| 呼び出し元        | 現行の呼び出し方                                 | 影響                                              |
| ----------------- | ------------------------------------------------ | ------------------------------------------------- |
| skill-executor.ts | `getAgentAPI()` → agent-client の Direct SDK     | RuntimeResolver + IAuthKeyService 経由に置換      |
| sync-manager.ts   | `skillExecutor.execute("modifier", projectPath)` | 変更なし（skill-executor 経由のまま）             |
| ipc-handlers.ts   | 間接的（skill-executor 経由）                    | 変更なし                                          |
| modifier-skill.ts | `getAgentAPI()` → agent-client 依存（孤立）      | skill-executor.ts に統合し modifier-skill.ts 廃止 |

---

## T-1-3: 既存保証抽出

### IPC 契約の現行 / 正本比較表

| IPC チャネル              | 方向          | 現行実装状態 | 正本仕様定義               | 維持判定                 | validateIpcSender |
| ------------------------- | ------------- | ------------ | -------------------------- | ------------------------ | ----------------- |
| `slide:executePhase`      | Renderer→Main | 実装済       | -                          | 維持（runtime 切替対象） | 未実装            |
| `slide:startWatching`     | Renderer→Main | 実装済       | `slide:watch-start`        | 名称統一要               | 未実装            |
| `slide:stopWatching`      | Renderer→Main | 実装済       | `slide:watch-stop`         | 名称統一要               | 未実装            |
| `slide:getSyncStatus`     | Renderer→Main | 実装済       | `slide:sync-status`        | 名称統一要               | 未実装            |
| `slide:manualSync`        | Renderer→Main | 実装済       | `slide:reverse-sync`       | 名称統一要               | 未実装            |
| `slide:cancelExecution`   | Renderer→Main | 実装済       | -                          | 維持                     | 未実装            |
| `slide:structureChanged`  | Main→Renderer | 実装済       | -                          | 維持                     | N/A (push)        |
| `slide:syncStatusChanged` | Main→Renderer | 実装済       | `slide:sync-status` push   | 維持                     | N/A (push)        |
| `slide:executionProgress` | Main→Renderer | 実装済       | `slide:sync-progress` push | 維持                     | N/A (push)        |

### 未接続パス

| 未接続箇所                   | 現状                                                    | 要件                                                     |
| ---------------------------- | ------------------------------------------------------- | -------------------------------------------------------- |
| onHtmlChange 未登録          | file-watcher.ts L134 に定義あり、ipc-handlers.ts 未登録 | file-watcher → sync-manager → integrated runtime 接続    |
| reverseSync 未公開           | sync-manager.ts L47 に定義あり、IPC 経由で未呼出        | slide:reverse-sync IPC で SyncManager.reverseSync() 呼出 |
| modifier-skill.ts 孤立       | createModifierSkill() が呼び出しチェーンに未接続        | skill-executor.ts に統合                                 |
| degraded / guidance 表示なし | SlideWorkspace.tsx にエラー表示のみ                     | degraded / guidance 状態の UI 表示追加                   |

---

## T-1-4: Role 対応付け

| Internal Role       | 現行実装                                                          | 正本仕様上の位置付け                        | 要件上の扱い                           |
| ------------------- | ----------------------------------------------------------------- | ------------------------------------------- | -------------------------------------- |
| Watcher             | `file-watcher.ts` (chokidar, structure.md + index.html)           | `slide:watch-start/stop` で制御             | runtime 切替の影響範囲を分離して棚卸し |
| Modifier            | `modifier-skill.ts` (孤立) + `skill-executor.ts` (phase=modifier) | ModifierSkill in interfaces-agent-sdk-skill | 二重実装を解消し skill-executor に統合 |
| Reverse-Sync        | `sync-manager.ts` (reverseSync 未公開)                            | `slide:reverse-sync`                        | IPC 経由で公開し接続を確立             |
| Legacy Agent Client | `agent-client.ts` (Direct SDK + electron-store)                   | なし（排除対象）                            | agent-client.ts を廃止                 |
| Sync Status Manager | `sync-manager.ts` (SyncStatus 管理)                               | `slide:sync-status` push                    | Zustand slideSlice との接続を確立      |

---

## T-1-5: IPC チャネル名称の正本統一確認

| 現行実装チャネル名    | 正本仕様チャネル名   | 差異                       | 統一方針（Phase 2 入力） |
| --------------------- | -------------------- | -------------------------- | ------------------------ |
| `slide:startWatching` | `slide:watch-start`  | 動詞形式 vs ハイフン区切り | 正本に合わせる           |
| `slide:stopWatching`  | `slide:watch-stop`   | 同上                       | 正本に合わせる           |
| `slide:manualSync`    | `slide:reverse-sync` | 動作名が異なる             | 正本に合わせる           |
| `slide:getSyncStatus` | `slide:sync-status`  | get プレフィックス有無     | 正本に合わせる           |

---

## 統合テスト連携要件

| 接続点                     | 現状                                                  | 要件                                                                  |
| -------------------------- | ----------------------------------------------------- | --------------------------------------------------------------------- |
| reverse-sync 自動トリガー  | `onHtmlChange` が ipc-handlers.ts で未登録            | file-watcher → sync-manager → integrated runtime の自動パスを確立する |
| watch-start/stop lifecycle | 実装済だが validateIpcSender なし                     | P42 準拠 3 段バリデーション + sender 検証を追加する                   |
| sync status push           | `slide:syncStatusChanged` で Main→Renderer push       | Zustand slideSlice への受信経路を確立する                             |
| execution progress push    | `slide:executionProgress` で Main→Renderer push       | Zustand slideSlice への受信経路を確立する                             |
| sync error push            | 現行実装に sync-error push なし                       | `slide:sync-error` push を追加し error code 体系と整合させる          |
| legacy agent client 排除   | agent-client.ts が Direct SDK + electron-store 直読み | IAuthKeyService + RuntimeResolver 経由に置換する                      |
| guidance 表示              | SlideWorkspace に degraded/guidance 表示なし          | `degraded` / `guidance` 状態の UI 表示を追加する                      |

---

## 多角的チェック観点

| 観点               | 現状                                                       | 要件                                              |
| ------------------ | ---------------------------------------------------------- | ------------------------------------------------- |
| セキュリティ       | 全 6 IPC ハンドラに validateIpcSender 未実装               | 全チャネルに sender 検証を追加                    |
| セキュリティ       | API key 取得が IAuthKeyService 以外（electron-store）      | electron-store 直読み・env fallback を排除        |
| アーキテクチャ     | Direct SDK (`@anthropic-ai/sdk`) 残存（agent-client.ts:9） | RuntimeResolver / SkillExecutor 経由に置換        |
| UI/UX              | degraded / guidance 表示未実装                             | 4 状態（synced/running/degraded/guidance）UI 定義 |
| State Management   | slideSlice に syncProgress / syncError 未定義              | Zustand slideSlice 拡張                           |
| エラーハンドリング | SlideErrorCode は SLIDE_E001-E999 の独自体系               | execute 契約の error code との整合が必要          |

---

## Renderer 側の課題

| 課題                           | 詳細                                                           | 優先度 |
| ------------------------------ | -------------------------------------------------------------- | ------ |
| AI Runtime 参照なし            | SlideWorkspace に authMode / provider / model の参照が全くない | HIGH   |
| degraded 表示なし              | AI Runtime 未設定時の degraded UI が実装されていない           | HIGH   |
| guidance 表示なし              | API key 未設定時のユーザーガイダンスが存在しない               | HIGH   |
| P31 パターン (useSlideProject) | `useSlideProjectStore()` 全体取得を依存配列に渡している        | MEDIUM |
| P5 リスク (useSlideProject)    | useEffect の依存配列に `store` を含みリスナー再登録の可能性    | MEDIUM |

---

## 現行 Zustand Store スキーマ

```typescript
// apps/desktop/src/renderer/slide/store.ts
interface SlideProjectState {
  projectPath: string | null;
  syncStatus: SyncStatus; // "synced" | "out-of-sync" | "syncing" | "error"
  currentPhase: SkillPhase | "idle";
  lastSyncAt: Date | null;
  isWatching: boolean;
  executionProgress: number; // 0-100
  error: string | null;
}
```

### 拡張要件（Phase 2 入力）

```typescript
// 追加が必要なフィールド
interface SlideSliceExtension {
  syncDirection: SyncDirection; // "forward" | "reverse"
  syncProgress: { percent: number; message: string } | null;
  syncError: { code: string; message: string } | null;
  // guidance / degraded 状態
}
```

---

## 現行 Shared Types

```typescript
// packages/shared/src/slide/types.ts
type SyncStatus = "synced" | "out-of-sync" | "syncing" | "error";
type SkillPhase = "hearing" | "structure" | "html" | "modifier";
type SyncDirection = "forward" | "reverse";

// SlideResponse<T> = { success: boolean; data?: T; error?: SlideError }
// SlideError = { code: SlideErrorCode; message: string; details?: unknown }
// SlideErrorCode = "SLIDE_E001" | ... | "SLIDE_E009" | "SLIDE_E999"
```

---

## 正本仕様との差異（Phase 1 Lane 3 調査結果）

### SyncStatus 型の差異

| 正本仕様（api-ipc-system-core.md）           | 現行実装（types.ts）                                | 差異                    |
| -------------------------------------------- | --------------------------------------------------- | ----------------------- |
| `"idle" \| "syncing" \| "synced" \| "error"` | `"synced" \| "out-of-sync" \| "syncing" \| "error"` | `idle` vs `out-of-sync` |

Phase 2 で正本仕様に合わせて `out-of-sync` → `idle` に変更する設計が必要。

### RuntimeResolver 契約（再利用元: llm-workspace-chat-edit.md）

| authMode       | hasApiKey | 結果         | reason                   |
| -------------- | --------- | ------------ | ------------------------ |
| `subscription` | any       | `handoff`    | "subscription mode"      |
| `api-key`      | `true`    | `integrated` | AnthropicLLMAdapter 返却 |
| `api-key`      | `false`   | `handoff`    | "API key not configured" |

### IAuthKeyService インターフェース

- `getKey()`: `string | null` — Main Process 内部のみ公開、Renderer 非公開
- `exists()`: `AuthKeyExistsResponse` — source: `"saved"` / `"env-fallback"` / `"not-set"`
- `validate(key)`: `AuthKeyValidateResponse` — `sk-ant-api` プレフィックスパターン検証

### HandoffGuidance DTO（再利用可能）

```typescript
interface HandoffGuidance {
  terminalCommand: string; // Claude Code で実行するコマンド例
  contextSummary: string; // ファイル名・行範囲・コマンドタイプの要約
  reason: string; // handoff になった理由
}
```

### validateIpcSender 仕様

検証順序（固定）:

1. `webContents` → `BrowserWindow` 存在確認
2. DevTools 呼び出し検出・拒否
3. 許可ウィンドウリスト照合

失敗時: `toIPCValidationError(validation)` → `errorCode: "ERR_2004"`

### セキュリティ検証順序（標準）

```
sender検証 → P42バリデーション → パストラバーサル検出 → エラーサニタイズ
```

---

## Acceptance Criteria 照合

| AC   | 充足状態 | 根拠                                                          |
| ---- | -------- | ------------------------------------------------------------- |
| AC-1 | 充足     | T-1-1 で 7 ファイルの runtime/auth 経路を表形式で整理済み     |
| AC-2 | 充足     | T-1-3 で 9 IPC チャネルの現行/正本比較表を作成済み            |
| AC-3 | 充足     | T-1-2 で 9 箇所の問題を file:line で列挙済み                  |
| AC-4 | 充足     | T-1-5 で 4 チャネルの差異を列挙済み                           |
| AC-5 | 充足     | T-1-3 で未接続パス 4 件、スコープ外 3 件を記録済み            |
| AC-6 | 充足     | Renderer 課題テーブルで degraded/guidance/sync 状態を記録済み |
