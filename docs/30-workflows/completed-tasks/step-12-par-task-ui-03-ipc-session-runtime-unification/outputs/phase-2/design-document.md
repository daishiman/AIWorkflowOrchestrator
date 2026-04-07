# 設計書（TASK-UI-03）

## メタ情報

| 項目       | 内容                                                     |
| ---------- | -------------------------------------------------------- |
| Phase      | 2                                                        |
| 作成日     | 2026-04-06                                               |
| ステータス | complete                                                 |
| 採用方針   | B（明確な分離契約）                                      |
| 前提       | Phase 1 の両成果物 + SkillCreatorIpcBridge.ts の調査結果 |

---

## P50チェック補足（Phase 2 追加調査）

### Session IPC ハンドラーの実態

**調査結果**: Session IPC (`START_SESSION`, `ANSWER` 等) は `SkillCreatorIpcBridge.ts` で処理されており、独自の `assertSender` メソッドを持つ。

```typescript
// SkillCreatorIpcBridge.ts:501
private assertSender(event: IpcMainInvokeEvent): void {
  if (event.sender.id !== this.window.webContents.id) {
    throw new Error("[SkillCreatorIpcBridge] IPC sender does not match the active window");
  }
}
```

**Phase 1 の修正**: セキュリティ「ギャップ」ではなく「実装の非統一性」が正確な問題。

| 観点           | Session IPC（`SkillCreatorIpcBridge`） | Runtime IPC（`creatorHandlers.ts`）     |
| -------------- | -------------------------------------- | --------------------------------------- |
| sender 検証    | `assertSender`（独自実装）             | `validateSender` → `validateIpcSender`  |
| エラー形式     | `throw new Error(...)`                 | `return { success: false, error: ... }` |
| バリデーション | `isBlank` 相当のチェックあり           | `isBlank` ユーティリティ使用            |

### `window.electronAPI.skillCreator` の使用状況

**調査結果**: 2 つの Renderer コンポーネントが実際に使用中。

| コンポーネント                 | 使用方法                                                       |
| ------------------------------ | -------------------------------------------------------------- |
| `GovernanceSummaryPanel.tsx`   | `window.electronAPI.skillCreator.getGovernanceState()`         |
| `ImprovementProposalPanel.tsx` | `window.electronAPI.skillCreator.applyRuntimeImprovement(...)` |

**結論**: `electronAPI.skillCreator` の削除には上記 2 コンポーネントの更新が必要。

---

## 採用方針: B（明確な分離契約）詳細

### 設計原則

1. **責務の明確化**: Session IPC と Runtime IPC の責務を文書化し、開発者が迷わず選択できるようにする
2. **セキュリティの均一化**: 異なる実装の sender 検証を標準化する
3. **API 露出の整理**: 4経路を 2経路に削減（使用中コンポーネントの移行後）
4. **非破壊的変更**: 既存 UI コンポーネントへの影響を最小限に抑える

### IPC 経路の責務定義（確定版）

```
┌───────────────────────────────────────────────────────────────────┐
│                    Skill Creator IPC 経路（確定版）                │
├────────────────────────────┬──────────────────────────────────────┤
│  Session IPC               │  Runtime IPC                         │
│  (window.skillCreatorSessionAPI)                                  │
│                            │  (window.skillCreatorAPI)            │
├────────────────────────────┼──────────────────────────────────────┤
│ ハンドラー:                │ ハンドラー:                          │
│ SkillCreatorIpcBridge      │ creatorHandlers.ts                   │
│                            │ + SkillCreatorIpcBridge(出力系)      │
├────────────────────────────┼──────────────────────────────────────┤
│ 責務:                      │ 責務:                                │
│ 会話型スキル作成フロー      │ ワークフロー状態管理                  │
│ （質問→回答の逐次型）       │ （plan/execute/verify/improve）      │
├────────────────────────────┼──────────────────────────────────────┤
│ パターン:                  │ パターン:                            │
│ イベント駆動               │ スナップショット型 + push 通知       │
└────────────────────────────┴──────────────────────────────────────┘
```

---

## preload API Surface 整理設計

### 現状

```typescript
// index.ts が公開する 4 経路
window.skillCreatorAPI; // ← skill-creator-api.ts（Runtime）
window.skillCreatorSessionAPI; // ← skill-creator-session-api.ts（Session）
window.electronAPI.skillCreator; // ← skillCreatorAPI と同一オブジェクト
window.electronAPI.skillCreatorSession; // ← skillCreatorSessionAPI と同一オブジェクト
```

### 変更後（2 経路）

```typescript
// 正規 API surface（維持）
window.skillCreatorAPI; // Runtime IPC の一次導線
window.skillCreatorSessionAPI; // Session IPC の会話フロー

// electronAPI からの削除（コンポーネント移行後）
// window.electronAPI.skillCreator    → 廃止（移行先: window.skillCreatorAPI）
// window.electronAPI.skillCreatorSession → 廃止（移行先: window.skillCreatorSessionAPI）
```

### コンポーネント移行計画

| コンポーネント                 | 現在の参照                                                | 移行後の参照                                     |
| ------------------------------ | --------------------------------------------------------- | ------------------------------------------------ |
| `GovernanceSummaryPanel.tsx`   | `window.electronAPI.skillCreator.getGovernanceState`      | `window.skillCreatorAPI.getGovernanceState`      |
| `ImprovementProposalPanel.tsx` | `window.electronAPI.skillCreator.applyRuntimeImprovement` | `window.skillCreatorAPI.applyRuntimeImprovement` |

---

## セキュリティ均一化設計（修正版）

### 問題の再定義

「ギャップ」ではなく「実装の非統一性」：

| 観点                    | 現状                                   | 改善後                                          |
| ----------------------- | -------------------------------------- | ----------------------------------------------- |
| Session IPC sender 検証 | `assertSender`（独自実装・throw）      | `assertSender` を維持（既存テストが存在）       |
| Runtime IPC sender 検証 | `validateSender`（ipc-validator 経由） | 変更なし                                        |
| セキュリティ効果        | 両経路とも webContents.id 検証済み     | 変更なし                                        |
| エラーハンドリング形式  | Session: throw / Runtime: IpcResult    | Session を IpcResult パターンに寄せる（低優先） |

**結論**: sender 検証の機能的ギャップはない。実装パターンの統一は将来課題（本タスクスコープ内で低優先で対応）。

### Session IPC 入力バリデーション強化

`SkillCreatorIpcBridge.ts` の `onStartSession` は `req.request` の空チェックを実施済み。
追加対応:

- `ANSWER` ハンドラーの `answer.toolCallId` 検証は実装済み
- `CONFIGURE_API` ハンドラーの入力バリデーション確認が必要（Phase 5 で確認）

---

## IPC 契約チェックリスト準拠設計（AC-5）

変更が生じるファイルの 3 層同時更新計画:

| 変更内容                        | Main ハンドラー            | Preload API | 型定義 |
| ------------------------------- | -------------------------- | ----------- | ------ |
| `electronAPI.skillCreator` 削除 | 不要                       | `index.ts`  | 不要   |
| コンポーネント移行              | 不要                       | 不要        | 不要   |
| 入力バリデーション追加          | `SkillCreatorIpcBridge.ts` | 不要        | 不要   |

---

## creatorHandlers.ts 構成整合確認

### 現状の重複 handler 問題

`creatorHandlers.ts` の `SKILL_CREATOR_GET_ADAPTER_STATUS` ハンドラーが**重複登録**されている（lines 219-253 と 254-287 に同一ハンドラーが 2 回 `ipcMain.handle` 呼び出し）。

**対応**: Phase 5 で重複ハンドラーを除去する。

### unregister パターンの確認

| API         | register                              | unregister                                 |
| ----------- | ------------------------------------- | ------------------------------------------ |
| Runtime IPC | `registerRuntimeSkillCreatorHandlers` | `unregisterRuntimeSkillCreatorHandlers` ✅ |
| Session IPC | `SkillCreatorIpcBridge.register()`    | `SkillCreatorIpcBridge.unregister()` ✅    |

**結論**: 両経路ともに register/unregister ペアが存在する。問題なし。

---

## チャネル命名規則の確認

| 確認項目           | 結果                                          |
| ------------------ | --------------------------------------------- |
| プレフィックス統一 | ✅ 全チャネル `skill-creator:` プレフィックス |
| 動詞統一           | ✅ `get-`/`set-`/`on-` パターン概ね統一       |
| 変更必要箇所       | なし                                          |

---

## 型定義整理設計

`packages/shared/src/types/skillCreator.ts` に以下のセクション区切りコメントを追加:

```typescript
// ============================================
// Session IPC 型（TASK-SDK-SC-01 系）
// ============================================
// UserInputAnswer, UserInputQuestion, etc.

// ============================================
// Runtime IPC 型（TASK-9B-H 系）
// ============================================
// SkillCreatorWorkflowUiSnapshot, etc.

// ============================================
// Session Resume 型（TASK-P0-08 系）
// ============================================
// SkillCreatorSessionListItem, etc.
```

---

## 変更ファイル一覧（確定版）

| ファイル                                                                              | 変更内容                                                                | 優先度 | AC 対応 |
| ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ------ | ------- |
| `apps/desktop/src/preload/index.ts`                                                   | `electronAPI.skillCreator` / `skillCreatorSession` 削除、型定義から除去 | 高     | AC-3    |
| `apps/desktop/src/renderer/components/organisms/AgentView/GovernanceSummaryPanel.tsx` | `electronAPI.skillCreator` → `skillCreatorAPI`                          | 高     | AC-3    |
| `apps/desktop/src/renderer/components/skill/ImprovementProposalPanel.tsx`             | `electronAPI.skillCreator` → `skillCreatorAPI`                          | 高     | AC-3    |
| `apps/desktop/src/main/ipc/creatorHandlers.ts`                                        | `SKILL_CREATOR_GET_ADAPTER_STATUS` 重複 handler 除去                    | 高     | AC-4    |
| `packages/shared/src/types/skillCreator.ts`                                           | セクション区切りコメント追加                                            | 低     | AC-2    |
| 新規: `docs/*/ipc-decision-guide.md`                                                  | IPC 使用判断ガイドライン（Phase 12 で作成）                             | 中     | AC-2    |

---

## Phase 3 レビューへの持ち越し事項

1. **MINOR 候補**: Session IPC エラーハンドリングの IpcResult パターン統一（低優先、別タスクでも可）
2. **確認事項**: `electronAPI` の型定義（`ElectronAPI` interface）から `skillCreator` / `skillCreatorSession` フィールドを削除後の型整合性
3. **確認事項**: `GovernanceSummaryPanel.test.tsx` のテスト（`window.electronAPI.skillCreator が未定義の場合...` テストケースあり）の修正方針

---

## 設計レビュー判定予測

- AC-1〜AC-7 すべて方針 B で実現可能
- リグレッションリスク: 低（既存 API surface は維持し、使用箇所の参照先変更のみ）
- テスト修正範囲: `GovernanceSummaryPanel.test.tsx` の mock 修正が必要
