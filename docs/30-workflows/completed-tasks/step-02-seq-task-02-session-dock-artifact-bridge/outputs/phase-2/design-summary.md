# Design Summary - Session Dock Artifact Bridge

## 設計結論

### 概要

Session Dock を「session の常設パネル」として再定義し、以下の 4 面を一つの surface 契約にまとめる。

1. **State Machine**: 8 状態の dock state による統一的な状態管理
2. **Persistence**: session ID ベースの transcript / artifact 保持と reopen restore
3. **Artifact-First**: 実行結果の primary surface を Artifact Summary に変更
4. **Manual Share**: 手動 3 操作 + Provenance Chip による transcript 共有

### 設計原則

| 原則              | 説明                                                                                                                                 |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Computed State    | 既存の `executionState.status` / `skillExecutionStatus` / `handoffGuidance` を壊さず、computed selector として dock state を算出する |
| Event-Driven      | claudeCliAPI の event を dock state machine の遷移トリガーとして接続する                                                             |
| Artifact-First    | raw log は secondary/tertiary に降格し、Artifact Summary を primary surface にする                                                   |
| Manual-Only Share | 全 share 操作はユーザーの明示的なクリックが必須。自動送信パスは設計しない                                                            |
| Session Scoped    | transcript / artifact / share history は session 単位で管理し、session 外に漏洩しない                                                |

## State Machine 設計

### 8 状態の定義

```
collapsed ←→ ready ←→ handoff → running → done
                                     ↓       ↓
                                   aborted   (retry → ready)
unavailable ←→ collapsed
guidance-only ←→ collapsed
```

詳細: [session-state-contract.md](./session-state-contract.md)

### 既存 State との統合マッピング

| Dock State    | executionState.status | skillExecutionStatus | handoffGuidance                 |
| ------------- | --------------------- | -------------------- | ------------------------------- |
| collapsed     | any                   | any                  | any                             |
| ready         | idle                  | -                    | != null                         |
| handoff       | -                     | -                    | != null (execution pending)     |
| running       | executing / streaming | running              | -                               |
| done          | idle                  | completed            | -                               |
| aborted       | error / idle          | error / cancelled    | -                               |
| unavailable   | -                     | -                    | - (CLI check failed)            |
| guidance-only | idle                  | -                    | != null (no execution required) |

## Persistence 設計

### Session ID

- 形式: `session-{crypto.randomUUID()}` (例: `session-550e8400-e29b-41d4-a716-446655440000`)
- 注: 当初 `session-{timestamp}-{random4}` を検討したが、Phase 3 MN-03 で UUID v4 に変更
- 採番タイミング: `ready` → `handoff` 遷移時
- 保持: agentSlice の sessionDock.sessionId に格納

### 保持ポリシー

| 項目         | 値                         | 根拠                            |
| ------------ | -------------------------- | ------------------------------- |
| 最大保持件数 | 10 件                      | メモリ効率と実用性のバランス    |
| 保持期間     | 24 時間                    | 1日の作業サイクルをカバー       |
| cleanup      | FIFO (First In, First Out) | 最古のセッションから削除        |
| 明示削除     | 可能                       | ユーザーが手動で session を削除 |

### Reopen Restore

| 手順 | 説明                                                                     |
| ---- | ------------------------------------------------------------------------ |
| 1    | dock を閉じる → `collapsed` に遷移。session データは保持                 |
| 2    | dock を開く → 最新の session ID を検索                                   |
| 3    | session が存在 → `claudeCliAPI.getSession(sessionId)` で transcript 取得 |
| 4    | restore 成功 → 前回の dock state に復帰（done/aborted のまま）           |
| 5    | restore 失敗 → `ready` state にフォールバック + エラー通知               |

## Artifact-First 設計

### 表示優先度

```
[1] Artifact Summary (primary)    → 生成ファイル・差分・次アクション
[2] Execution Summary (secondary) → 実行時間・exit code・warning/error数
[3] Transcript Detail (tertiary)  → 折りたたみ式の詳細ログ
[4] Share Rail (footer)           → 手動3操作ボタン
```

詳細: [artifact-bridge-design.md](./artifact-bridge-design.md)

## Manual Share 設計

### 3 操作

1. **選択範囲を送る**: transcript 内テキスト選択 → chat message 化
2. **直近出力を添付**: 最新 transcript entry → chat message 添付
3. **セッションを貼る**: session 全体サマリー → chat message 化

### Provenance Chip

share された chat message に付与される出典情報:

- `source`: session ID + entry index
- `sharedAt`: 共有日時
- `inspect`: 元の transcript へのリンク

### Manual Boundary 準拠

MB-1〜MB-4 に完全準拠。auto-send / hidden injection / headless execution / credential passthrough の全パスを設計レベルで排除。

詳細: [artifact-bridge-design.md](./artifact-bridge-design.md)

## 変更対象ファイル一覧

| ファイル                         | 変更種別 | 変更内容                                     |
| -------------------------------- | -------- | -------------------------------------------- |
| `agentSlice.ts`                  | 修正     | SessionDockState の追加、dock アクション追加 |
| `preload/index.ts`               | 修正     | claudeCliAPI event と dock state の接続確認  |
| `ExecutionConsoleView/index.tsx` | 修正     | dock state machine の接続、表示切替          |
| `HandoffBlock.tsx`               | 修正     | dock 接続、handoff → running 遷移            |
| `PersistentTerminalLauncher.tsx` | 修正     | dock 常設パネル、collapsed → ready 遷移      |
| `ArtifactSummary.tsx`            | 新規     | artifact-first 結果表示                      |
| `TranscriptShareRail.tsx`        | 新規     | 手動 3 操作 rail                             |
| `ProvenanceChip.tsx`             | 新規     | 共有元表示 chip                              |

## AC 達成確認

| AC   | 設計での対応                                                | 対応先                    |
| ---- | ----------------------------------------------------------- | ------------------------- |
| AC-1 | 8 state の定義 + 遷移表 + CTA 定義                          | session-state-contract.md |
| AC-2 | session ID 採番 + 保持ポリシー + reopen restore             | 本文 Persistence 設計     |
| AC-3 | 手動 3 操作 + provenance chip + MB-1〜MB-4 準拠             | artifact-bridge-design.md |
| AC-4 | Artifact Summary を primary surface に + 表示順序定義       | artifact-bridge-design.md |
| AC-5 | done state の warning 表示 + aborted state の error summary | session-state-contract.md |
