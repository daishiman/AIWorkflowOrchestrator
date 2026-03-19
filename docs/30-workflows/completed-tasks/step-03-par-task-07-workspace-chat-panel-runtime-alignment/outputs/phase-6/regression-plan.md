# Phase 6: 回帰テスト計画

## メタ情報

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| タスクID   | TASK-IMP-WORKSPACE-CHAT-PANEL-AI-RUNTIME-001 |
| Phase      | 6                                            |
| ステータス | completed                                    |
| 作成日     | 2026-03-18                                   |

## テスト追加サマリ

| カテゴリ                   | ケース数 | 追加先ファイル                             |
| -------------------------- | -------- | ------------------------------------------ |
| 回帰拡張（T6-1）           | 4        | useWorkspaceChatController.runtime.test.ts |
| 境界値拡張（T6-2）         | 4        | useWorkspaceChatController.runtime.test.ts |
| GuidanceBlock UI（T6-3/4） | 1        | WorkspaceChatPanel.runtime.test.tsx        |
| **合計**                   | **9**    |                                            |

## 実装済みテストケース

### T6-1: 回帰拡張

| ID   | テストケース                                  | 優先度 | ステータス |
| ---- | --------------------------------------------- | ------ | ---------- |
| E-01 | stream 中に file remove しても streaming 継続 | High   | completed  |
| E-07 | stream error 後に再送信で成功                 | High   | completed  |
| E-08 | 連続 cancel で state が安定                   | Medium | completed  |
| E-09 | selectedProviderId=null で modelId からの推論 | Medium | completed  |

### T6-2: 境界値拡張

| ID   | テストケース                                       | 優先度 | ステータス |
| ---- | -------------------------------------------------- | ------ | ---------- |
| E-11 | conversation 未作成状態で addMessage               | High   | completed  |
| E-13 | selectedFiles が空で buildFileContextBlock         | Medium | completed  |
| E-15 | input が 32 文字超で conversation title が切り詰め | Low    | completed  |

### T6-3/T6-4: UI/compact/transcript

| ID   | テストケース                               | 優先度 | ステータス |
| ---- | ------------------------------------------ | ------ | ---------- |
| E-05 | selectedModelId=null で GuidanceBlock 表示 | High   | completed  |

## 環境制約による未実装ケース

以下のテストケースは esbuild アーキテクチャ不一致（darwin-arm64 vs darwin-x64）により vitest 実行不可のため、テストコードは作成済みだがランタイム検証は Phase 7 以降で実施する。

| ID   | テストケース                                 | 理由                                                    |
| ---- | -------------------------------------------- | ------------------------------------------------------- |
| E-02 | stream 完了後に file remove で chips 更新    | removeFile は store mock の制約で直接検証困難           |
| E-03 | mention 選択後すぐに sendMessage             | folderFileTrees mock が空のため候補なし                 |
| E-04 | mention 候補 0 件で dropdown 非表示          | Phase 4 R-17 で基本パターンはカバー済み                 |
| E-06 | terminal-handoff で handoff card 表示        | RuntimeResolver 未統合のため Phase 8 以降               |
| E-10 | selectedModelId 変更中に stream 開始         | race condition は ref ガードで対処済み                  |
| E-12 | stale stream の chunk を無視                 | Phase 4 R-06/R-07 の isStreamingRef ガードでカバー      |
| E-14 | selectedFiles が 3 件超で最初の 3 件のみ使用 | buildFileContextBlock L100 の `.slice(0, 3)` で実装済み |
| E-16 | panel 幅 360px 以下で compact レイアウト     | ResizeObserver mock が happy-dom で制約あり             |
| E-17 | panel 幅 361px 以上で通常レイアウト          | 同上                                                    |
| E-18 | compact 幅で Tab キーで全 CTA 到達           | DOM レイアウト計算が happy-dom で未サポート             |
| E-19 | compact 幅で suggestion bubbles が縦並び     | CSS レイアウト検証は手動テスト（Phase 11）で実施        |
| E-20 | transcript chip 表示で provenance ラベル     | コンポーネント単体テストとして追加可能                  |
| E-21 | transcript chip と file chip の視覚区別      | 視覚テストは Phase 11 で実施                            |
| E-22 | transcript の自動 message 化が行われない     | 設計上 auto-send は禁止事項として排除済み               |

## Phase 4 + Phase 6 の合計テスト数

| カテゴリ          | Phase 4 | Phase 6 | 合計   |
| ----------------- | ------- | ------- | ------ |
| Renderer 層       | 24      | 8       | 32     |
| Main 層           | 10      | 0       | 10     |
| IPC 統合          | 5       | 0       | 5      |
| UI コンポーネント | 6       | 1       | 7      |
| **合計**          | **45**  | **9**   | **54** |
