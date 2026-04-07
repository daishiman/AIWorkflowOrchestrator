# IPC 統合戦略（TASK-UI-03）

## メタ情報

| 項目       | 内容                           |
| ---------- | ------------------------------ |
| Phase      | 2                              |
| 作成日     | 2026-04-06                     |
| ステータス | complete                       |
| 前提       | Phase 1 spec-extraction-map.md |

---

## 統合方針の比較検討

### 方針 A: 完全統合

**概要**: Session IPC と Runtime IPC を単一の統合 API に統合し、`window.skillCreatorAPI` のみを公開する。

**メリット**:

- API surface が 1 本化され、新機能開発の迷いがなくなる
- 型定義の統合が可能

**デメリット**:

- `startSession` / `ANSWER` / `QUESTION_RECEIVED` パターンと `planSkill` / `WORKFLOW_STATE_CHANGED` パターンの状態モデルが根本的に異なる（イベント駆動 vs スナップショット）
- `SkillCreatorConversationPanel`（Session IPC 使用）の全面リライトが必要 → スコープ外
- 既存テストの大規模修正が発生
- リグレッションリスクが高い

**結論**: **採用しない**（スコープ外作業が発生し、TASK-UI-03 の範囲を超える）

---

### 方針 B: 明確な分離契約（推奨）

**概要**: 2 つの IPC 経路を明確な責務で分離し、使用基準をドキュメント化する。セキュリティ要件を両経路で均一化する。

**変更内容**:

1. `window.skillCreatorAPI` = Runtime IPC（ワークフロー状態型）← 一次導線
2. `window.skillCreatorSessionAPI` = Session IPC（会話フロー型）← 二次導線
3. `window.electronAPI.skillCreator` / `skillCreatorSession` の冗長露出を廃止
4. Session IPC ハンドラーに `validateSender` を適用
5. IPC 使用判断ガイドラインを Phase 12 で文書化

**メリット**:

- 既存 UI コンポーネントへの影響が最小限
- 既存テストの修正が少ない
- セキュリティ均一化（AC-6）を実現
- 新機能開発者に明確な判断基準を提供

**デメリット**:

- 2 つの API パターンが継続して存在する
- Session IPC の状態モデルが Runtime IPC と異なったまま

**結論**: **採用する**（既存影響最小・責務明確化・セキュリティ改善の観点で最適）

---

### 方針 C: ハイブリッド（段階的移行）

**概要**: Runtime IPC を一次導線として確立し、Session IPC をレガシー扱いにして段階的に廃止する中間層を追加する。

**メリット**:

- 将来的な完全統合への道筋を作れる

**デメリット**:

- 中間層の追加コストが大きい
- TASK-UI-03 の「統合/整理のみ」のスコープを超える
- 廃止スケジュールが別タスクになる

**結論**: **採用しない**（スコープ範囲外の作業が多い）

---

## 採用方針: B（明確な分離契約）の詳細設計

### IPC 経路の責務定義

```
┌─────────────────────────────────────────────────────────────────┐
│                    Skill Creator IPC 経路                        │
├──────────────────────────────┬──────────────────────────────────┤
│   Session IPC（会話フロー）  │   Runtime IPC（ワークフロー）    │
│   window.skillCreatorSessionAPI                                  │
│                              │   window.skillCreatorAPI         │
├──────────────────────────────┼──────────────────────────────────┤
│ 責務: 対話型スキル作成フロー │ 責務: ワークフロー状態管理       │
│ パターン: 質問→回答の逐次型  │ パターン: 状態スナップショット型  │
│ 使用場面: 新規スキル作成会話 │ 使用場面: plan/execute/verify/   │
│                              │          improve フロー          │
├──────────────────────────────┼──────────────────────────────────┤
│ TASK-SDK-SC-01 系チャネル    │ TASK-9B-H / TASK-P0-08 系        │
└──────────────────────────────┴──────────────────────────────────┘
```

### 新機能開発の判断基準

| 要件                             | 使用すべき IPC                                  |
| -------------------------------- | ----------------------------------------------- |
| 会話型インタビューのステップ追加 | Session IPC (`skillCreatorSessionAPI`)          |
| ワークフロー状態の取得・更新     | Runtime IPC (`skillCreatorAPI`)                 |
| セッションの保存・復元           | Runtime IPC (`skillCreatorAPI.listSessions` 等) |
| スキルの計画・実行・改善         | Runtime IPC (`skillCreatorAPI`)                 |
| 新規会話フロー機能               | Session IPC                                     |
| 新規ワークフロー機能             | Runtime IPC                                     |

---

## preload API Surface 再設計

### 現在（4経路）

```typescript
window.skillCreatorAPI; // 直接公開（Runtime）
window.skillCreatorSessionAPI; // 直接公開（Session）
window.electronAPI.skillCreator; // 冗長（Runtime と同一）
window.electronAPI.skillCreatorSession; // 冗長（Session と同一）
```

### 変更後（2経路）

```typescript
window.skillCreatorAPI; // Runtime IPC（一次導線）- 維持
window.skillCreatorSessionAPI; // Session IPC（会話フロー）- 維持
// window.electronAPI.skillCreator        → 廃止
// window.electronAPI.skillCreatorSession → 廃止
```

**影響調査必要コンポーネント**:

- `window.electronAPI.skillCreator` の使用箇所を grep して `window.skillCreatorAPI` に移行
- `window.electronAPI.skillCreatorSession` の使用箇所を grep して `window.skillCreatorSessionAPI` に移行

---

## セキュリティ均一化設計

### Session IPC ハンドラーへの `validateSender` 適用

対象ファイル: Session IPC の Main ハンドラー（`START_SESSION`, `ANSWER` のハンドラー）

適用パターン（Runtime IPC から転用）:

```typescript
ipcMain.handle(
  IPC_CHANNELS.START_SESSION,
  async (
    event: IpcMainInvokeEvent,
    args: { request: string; sessionId?: string },
  ) => {
    validateSender(event, IPC_CHANNELS.START_SESSION, mainWindow); // ← 追加
    // 既存処理...
  },
);
```

**適用すべき全チャネル**:

- `START_SESSION`
- `ANSWER`
- `CONFIGURE_API`

### 入力バリデーション統一

Session IPC の入力バリデーションを Runtime IPC パターン（`isBlank` チェック）に合わせる:

```typescript
// 適用例
if (isBlank(args?.request)) {
  return { success: false, error: "request が指定されていません" };
}
```

---

## creatorHandlers 構成整合化

### 現在の構成

`creatorHandlers.ts` は Runtime IPC + Session Resume ハンドラーのみ（計 16 handlers）。Session IPC ハンドラーは別ファイルに存在する可能性。

### 確認事項

- Session IPC の Main ハンドラーの所在を特定（`skillCreatorHandlers.ts` または `sessionHandlers.ts` 等）
- Session IPC ハンドラーに `validateSender` が適用されていない箇所を全列挙
- `unregisterRuntimeSkillCreatorHandlers` に対応する Session IPC の unregister が存在するか確認

### 命名規則統一確認

現在のチャネル命名は `skill-creator:xxx` プレフィックスで既に統一済み。
変更不要。

---

## 型定義の整理方針

`packages/shared/src/types/skillCreator.ts` の型分類:

| 型グループ                                            | 現状                     | 方針                                 |
| ----------------------------------------------------- | ------------------------ | ------------------------------------ |
| Session IPC 型（`UserInputAnswer` 等）                | `skillCreator.ts` に混在 | 分離不要（ファイルサイズは許容範囲） |
| Runtime IPC 型（`SkillCreatorWorkflowUiSnapshot` 等） | `skillCreator.ts` に混在 | 分離不要                             |
| Session Resume 型（`SkillCreatorSessionListItem` 等） | `skillCreator.ts` に混在 | 分離不要                             |

**結論**: 型定義は現行ファイルを維持。コメントブロックで「Session IPC 型」「Runtime IPC 型」「Session Resume 型」を明示するのみ。

---

## 変更ファイル一覧

| ファイル                                    | 変更内容                                                  | 優先度     |
| ------------------------------------------- | --------------------------------------------------------- | ---------- |
| `apps/desktop/src/preload/index.ts`         | `electronAPI.skillCreator` / `skillCreatorSession` の削除 | 高         |
| Session IPC Main ハンドラーファイル         | `validateSender` 適用                                     | 高（AC-6） |
| `packages/shared/src/types/skillCreator.ts` | コメントブロックで型分類を明示                            | 低         |
| 新規: IPC 使用ガイドライン                  | どの IPC を使うかの判断基準文書（Phase 12 で作成）        | 中         |

---

## Phase 3 設計レビューへの持ち越し事項

1. `window.electronAPI.skillCreator` の使用箇所が存在する場合の移行計画
2. Session IPC Main ハンドラーファイルの特定（grep 結果を Phase 3 前に確認）
3. `validateSender` 適用時の既存テストへの影響範囲
