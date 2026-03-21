# Phase 1 成果物: 現行実装との GAP 分析

## メタ情報

| 項目     | 内容            |
| -------- | --------------- |
| タスクID | UT-SLIDE-UI-001 |
| Phase    | 1 - 要件定義    |
| 作成日   | 2026-03-21      |

## GAP 分析テーブル

| 領域         | 現行実装                             | 正本要件                                       | GAP                                        | 対応方針                                             |
| ------------ | ------------------------------------ | ---------------------------------------------- | ------------------------------------------ | ---------------------------------------------------- |
| empty state  | open CTA あり                        | open CTA                                       | なし                                       | 変更不要                                             |
| synced state | project path + SyncStatusIndicator   | + runtime/auth badge + watch status            | runtime/auth badge 欠如、watch status 欠如 | SlideSyncCard + SlideWatchStatus 新規追加            |
| out-of-sync  | 手動同期ボタンのみ                   | reverse-sync + guidance/degraded 導線          | 導線と用語が不一致                         | SlideGuidanceBlock で導線実装                        |
| running      | SkillPhasePanel 内 progress/cancel   | + direction/watch/runtime 情報                 | runtime 情報欠如                           | SlideProgressRow で置換                              |
| degraded     | error alert のみ                     | terminal launcher + handoff reason + retry CTA | handoff 導線欠如                           | SlideGuidanceBlock(degraded) + TerminalLauncher 追加 |
| guidance     | 存在しない                           | 設定不足時の CTA + terminal launcher           | 全体欠如                                   | SlideGuidanceBlock(guidance) 新規追加                |
| Terminal     | 存在しない                           | 全状態で右下固定表示                           | 全体欠如                                   | TerminalLauncher 新規追加                            |
| Badge 色     | Tailwind green-500/blue-500 etc      | Apple HIG systemGreen/systemBlue/systemOrange  | カラー非準拠                               | CSS 変数 + Apple HIG 色に変更                        |
| ARIA         | SyncStatusIndicator に role="status" | 全 UI 要素に ARIA ラベル                       | 部分的                                     | 全コンポーネントに ARIA 付与                         |
| Store 語彙   | `"out-of-sync"` 使用                 | 正本は `"idle"` を含む                         | legacy drift                               | UI 層で吸収（store 変更なし）                        |

## コンポーネント新規/変更マトリクス

| コンポーネント      | 種別 | 変更内容                                              |
| ------------------- | ---- | ----------------------------------------------------- |
| SlideSyncCard       | 新規 | プロジェクト情報 + 4状態 Badge + メタ情報             |
| SlideProgressRow    | 新規 | 進捗バー + メッセージ + キャンセル CTA                |
| SlideWatchStatus    | 新規 | ファイル監視状態 + 同期方向表示                       |
| SlideGuidanceBlock  | 新規 | guidance/degraded 2バリアント + CTA                   |
| TerminalLauncher    | 新規 | コマンド表示 + コピー + 起動 CTA                      |
| SlideWorkspace      | 変更 | 4領域コンポーネントで再構成                           |
| SyncStatusIndicator | 維持 | SlideSyncCard 内部で参照可能（直接使用は廃止）        |
| SkillPhasePanel     | 維持 | synced 時のみ表示に条件変更                           |
| types.ts            | 新規 | SlideUIStatus / GuidanceVariant / deriveSlideUIStatus |
| selectors.ts        | 新規 | 個別セレクタ（P31/P48 対策）                          |

## 依存タスク境界

| 本タスク（UT-SLIDE-UI-001）の責務 | UT-SLIDE-IMPL-001 の責務             |
| --------------------------------- | ------------------------------------ |
| UI コンポーネント実装             | store フィールド追加（isHandoff 等） |
| 個別セレクタ定義                  | IPC ハンドラ接続                     |
| SlideUIStatus 導出ロジック        | SyncStatus 型語彙変更（idle 統一）   |
| 条件レンダリング                  | handoffGuidance DTO 実装             |
| モック状態でのテスト              | 実データでの結合テスト               |

## SyncStatus drift 対応

現行: `"synced" | "out-of-sync" | "syncing" | "error"`
正本: `"idle" | "syncing" | "synced" | "error"`

**本タスクの方針**: store / IPC 契約を変更せず、`deriveSlideUIStatus()` で UI 語彙に変換する。`"out-of-sync"` は `"synced"`（synced 相当、差分あり状態）として扱い、`"idle"` は現行 store に存在しないため `"synced"` にフォールバックする。
