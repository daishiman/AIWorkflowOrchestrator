# [#1328] [UT-TASK06-007-EXT-001] タプル配列経由ハンドラ抽出パターン拡張

## 概要

`check-ipc-contracts.ts` のMainハンドラ抽出で、タプル配列経由登録（`[IPC_CHANNELS.XXX, handler]` 形式）の約108件が未抽出。extractMainHandlersに配列内パターンマッチを追加する。

## 受け入れ基準

- [ ] `registerFallbackHandlers` 等のタプル配列内のチャンネル名が抽出される
- [ ] 抽出数が324件に近づく（現状216件）
- [ ] 既存テストが回帰しない

## メタ情報

- 発見元: UT-TASK06-007 Phase 11 TC-11-04
- 優先度: 中
- 指示書: `docs/30-workflows/completed-tasks/UT-TASK06-007-ipc-contract-drift-auto-detect/unassigned-task/ut-task06-007-ext-001-tuple-array-handler-extraction.md`
