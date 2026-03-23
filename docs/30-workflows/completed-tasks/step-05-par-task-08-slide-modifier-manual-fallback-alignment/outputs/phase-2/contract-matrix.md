# Phase 2: 契約マトリクス

## メタ情報

| 項目     | 内容                                                  |
| -------- | ----------------------------------------------------- |
| タスクID | TASK-IMP-SLIDE-MODIFIER-MANUAL-FALLBACK-ALIGNMENT-001 |
| Phase    | 2                                                     |
| 作成日   | 2026-03-23                                            |

## 1. State 契約

### SlideUIStatus（4状態）

| 状態     | 意味                         | 遷移元            | 遷移先                     |
| -------- | ---------------------------- | ----------------- | -------------------------- |
| synced   | 正常同期完了                 | running, guidance | running                    |
| running  | 実行中                       | synced            | synced, degraded, guidance |
| degraded | 品質低下、自動復旧不可       | running           | guidance, synced           |
| guidance | ユーザー操作ガイダンス表示中 | running, degraded | synced                     |

### 不正遷移（禁止パターン）

| 遷移                | 理由                                      |
| ------------------- | ----------------------------------------- |
| synced → degraded   | 実行せずに degraded になることはない      |
| synced → guidance   | 実行せずに guidance になることはない      |
| guidance → degraded | guidance から品質低下に戻ることはない     |
| degraded → running  | degraded から自動再実行しない（P62 対策） |

## 2. Action 契約

### Slide 操作アクション

| Action            | 起点状態 | 結果状態 | Main Process 側の処理                   |
| ----------------- | -------- | -------- | --------------------------------------- |
| startSync         | synced   | running  | skill-executor 経由で slide 同期開始    |
| completeSync      | running  | synced   | 正常終了通知                            |
| reportDegradation | running  | degraded | 品質低下検出、fallback card 表示指示    |
| requestGuidance   | degraded | guidance | ユーザーが fallback card CTA をクリック |
| openTerminal      | guidance | guidance | terminal launcher で terminal を開く    |
| resolveManually   | guidance | synced   | ユーザーが手動操作で復旧完了            |
| retryFromGuidance | guidance | running  | ユーザーが再試行を選択                  |

### 禁止アクション（ManualBoundary 準拠）

| 禁止アクション   | 理由                                 |
| ---------------- | ------------------------------------ |
| auto-send        | manual lane では自動送信しない       |
| hidden injection | ユーザーに見えない操作を挿入しない   |
| silent retry     | 無言のリトライは fallback 状態を隠す |

## 3. Ownership 契約

### ファイル別 Ownership

| ファイル                 | 現在の owner           | 変更権限                   | 変更時の Gate             |
| ------------------------ | ---------------------- | -------------------------- | ------------------------- |
| agent-client.ts          | legacy (Task08 棚卸し) | UT-SLIDE-IMPL-001          | Task09 governance 承認    |
| modifier-skill.ts        | legacy (Task08 棚卸し) | UT-SLIDE-IMPL-001          | ModifierResponse 型確定後 |
| skill-executor.ts        | Task08                 | Task08 → UT-SLIDE-IMPL-001 | Phase 3 PASS              |
| SlideWorkspace.tsx       | Task08 (契約定義)      | UT-SLIDE-UI-001            | UI 4領域契約確定後        |
| slideSettingsStore.ts    | 共有                   | 各タスクで変更可           | IPC contract check        |
| slideSettingsHandlers.ts | 共有                   | 各タスクで変更可           | IPC contract check        |

## 4. DTO 契約

### ModifierResponse（拡張案）

| フィールド       | 型           | 必須 | 現状 | 追加 |
| ---------------- | ------------ | ---- | ---- | ---- |
| success          | boolean      | yes  | yes  | -    |
| changes          | ChangeItem[] | no   | yes  | -    |
| error            | string       | no   | yes  | -    |
| fallback_reason  | string       | no   | -    | yes  |
| suggested_action | string       | no   | -    | yes  |

### SlideCapabilityDTO（新規）

| フィールド    | 型                                 | 必須 | 用途                               |
| ------------- | ---------------------------------- | ---- | ---------------------------------- |
| lane          | `"integrated" \| "manual"`         | yes  | 現在の実行 lane                    |
| apiKeySource  | `"safeStorage" \| "env" \| "none"` | yes  | API key の取得元（P62 対策）       |
| uiStatus      | SlideUIStatus                      | yes  | 現在の UI 状態                     |
| blockedReason | string                             | no   | degraded/guidance 時のブロック理由 |

### TerminalHandoffCard（Task05 共有）

| フィールド     | 型      | 必須 | 用途                       |
| -------------- | ------- | ---- | -------------------------- |
| target         | string  | yes  | 起動するターミナルコマンド |
| contextSummary | string  | yes  | 現在の slide 状態の要約    |
| isAvailable    | boolean | yes  | terminal 起動可能かどうか  |

## 5. Screenshot 契約（UX-07 準拠）

### 必須 Screenshot TC-ID

| TC-ID     | 状態     | 画面要素                           | 検証観点                          |
| --------- | -------- | ---------------------------------- | --------------------------------- |
| UX-07-S01 | synced   | progress row のみ表示              | 他の3領域が非表示であること       |
| UX-07-S02 | running  | progress row + アニメーション      | 実行中インジケータが表示される    |
| UX-07-S03 | degraded | progress row + guidance + fallback | fallback card の CTA が表示される |
| UX-07-S04 | guidance | progress row + guidance + terminal | terminal launcher が表示される    |
| UX-07-S05 | fallback | fallback card の CTA クリック後    | guidance 状態に遷移する           |

## 6. IPC Namespace 契約

### 現状と整理方針

| Namespace                  | 状態   | 整理方針                          | 担当              |
| -------------------------- | ------ | --------------------------------- | ----------------- |
| slide:settings:\*          | active | 維持（正常動作中）                | 共有              |
| slide:sync:\*              | legacy | Task09 governance で統一          | Task09 follow-up  |
| registerSlideIpcHandlers() | 未接続 | main index への接続を実装タスクで | UT-SLIDE-IMPL-001 |
