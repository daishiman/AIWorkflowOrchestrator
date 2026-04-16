# Phase 2: 設計

## メタ情報

| 項目       | 内容                        |
| ---------- | --------------------------- |
| Phase      | 2                           |
| Phase名    | 設計                        |
| 対象機能   | TASK-SW-CANCEL-001          |
| 前提Phase  | Phase 1: 要件定義           |
| 次Phase    | Phase 3: 設計レビューゲート |
| ステータス | 未実施                      |
| 作成日     | 2026-04-16                  |

## 目的

`SKILL_CREATOR_CANCEL` チャンネル定数追加の詳細設計を行う。
追加箇所・値・Preload 側への自動伝播メカニズムを明確にする。

## 実行タスク

### Task 1: 修正箇所の特定と変更内容設計

**変更対象**: `packages/shared/src/ipc/channels.ts` 行 195-211 付近の `SKILL_CREATOR_RUNTIME_CHANNELS`

**変更前**:

```typescript
export const SKILL_CREATOR_RUNTIME_CHANNELS = {
  SKILL_CREATOR_PROGRESS: "skill-creator:progress",
  SKILL_CREATOR_WORKFLOW_STATE_CHANGED: "skill-creator:workflow-state-changed",
  SKILL_CREATOR_ADAPTER_STATUS_CHANGED: "skill-creator:adapter-status-changed",
} as const;
```

**変更後**:

```typescript
export const SKILL_CREATOR_RUNTIME_CHANNELS = {
  SKILL_CREATOR_PROGRESS: "skill-creator:progress",
  SKILL_CREATOR_WORKFLOW_STATE_CHANGED: "skill-creator:workflow-state-changed",
  SKILL_CREATOR_ADAPTER_STATUS_CHANGED: "skill-creator:adapter-status-changed",
  SKILL_CREATOR_CANCEL: "skill-creator:cancel", // AC-1: キャンセル処理IPC連携用チャンネル
} as const;
```

### Task 2: Preload 側の自動有効化確認

`apps/desktop/src/preload/channels.ts` が `SKILL_CREATOR_RUNTIME_CHANNELS` をスプレッドしているため、
本タスクでチャンネル定数を追加するだけで Preload 側は自動で有効になる。

確認対象箇所（`apps/desktop/src/preload/channels.ts` 行 220 付近）:

```typescript
export const IPC_CHANNELS = {
  ...SKILL_CREATOR_RUNTIME_CHANNELS, // ← ここでスプレッドされるため自動有効化
  // ...
} as const;
```

この設計により、Preload 側への追加変更は不要。AC-2 はコードレビューで確認する。

### Task 3: チャンネル値の命名設計

既存チャンネルの命名規則を確認する:

| チャンネル名                         | 値                                       |
| ------------------------------------ | ---------------------------------------- |
| SKILL_CREATOR_PROGRESS               | `"skill-creator:progress"`               |
| SKILL_CREATOR_WORKFLOW_STATE_CHANGED | `"skill-creator:workflow-state-changed"` |
| SKILL_CREATOR_ADAPTER_STATUS_CHANGED | `"skill-creator:adapter-status-changed"` |

規則: `"skill-creator:<action>"` の形式。`SKILL_CREATOR_CANCEL` の値は `"skill-creator:cancel"` が適切。

### Task 4: concern 数と設計書分割基準確認

- concern 数: 1（`channels.ts` の `SKILL_CREATOR_RUNTIME_CHANNELS` への1行追加のみ）
- 単一 `phase-2-design.md` に記述する

### Task 5: IPC 4層整合性チェック

本タスクは IPC チャンネル定数の追加であり、実際のハンドラー・Preload API・フロント側フックの実装は
後続タスク（TASK-SW-CANCEL-002〜TASK-SW-CANCEL-004）で行う。

| 層                   | 変更有無 | 備考                           |
| -------------------- | -------- | ------------------------------ |
| Renderer（フロント） | なし     | TASK-SW-CANCEL-004 で対応      |
| Preload              | 自動有効 | スプレッドにより AC-2 を満たす |
| IPC チャンネル定数   | あり     | 本タスクの変更対象             |
| Main（ハンドラー）   | なし     | TASK-SW-CANCEL-003 で対応      |

## 参照資料

- `outputs/phase-1/TASK-SW-CANCEL-001-requirements.md` — 受入条件（AC-1〜AC-4）
- `packages/shared/src/ipc/channels.ts` — 実装対象
- `apps/desktop/src/preload/channels.ts` — スプレッド確認対象

## 統合テスト連携

- チャンネル定数追加のみのため、既存の IPC 契約への破壊的変更はない
- TASK-SW-CANCEL-002 が参照する `IPC_CHANNELS.SKILL_CREATOR_CANCEL` が正しく定義されることを設計で保証する

## 成果物

| 成果物                       | パス                                           |
| ---------------------------- | ---------------------------------------------- |
| TASK-SW-CANCEL-001-design.md | `outputs/phase-2/TASK-SW-CANCEL-001-design.md` |

## 完了条件

- [ ] 変更前/後のコードが設計書に明記されている
- [ ] チャンネル値の命名規則に従っていることが確認されている
- [ ] Preload 側スプレッドによる自動有効化の設計が確認されている
- [ ] IPC 4層整合性チェックが完了している

## タスク100%実行確認【必須】

- [ ] Task 1（修正箇所の特定と変更内容設計）を100%実行した
- [ ] Task 2（Preload 側の自動有効化確認）を100%実行した
- [ ] Task 3（チャンネル値の命名設計）を100%実行した
- [ ] Task 4（concern 数と設計書分割基準確認）を100%実行した
- [ ] Task 5（IPC 4層整合性チェック）を100%実行した
- [ ] 成果物（TASK-SW-CANCEL-001-design.md）が生成されている
- [ ] artifacts.json が更新されている

## 次 Phase

→ [Phase 3: 設計レビューゲート](./phase-3-design-review.md)
