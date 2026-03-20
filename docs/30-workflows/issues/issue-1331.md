# [#1331] [UT-TASK06-007-EXT-002] 別定数オブジェクトチャンネル解決対応

## 概要

`CHAT_EDIT_CHANNELS` 等の `IPC_CHANNELS` 以外の定数オブジェクトのチャンネル名解決に対応する。resolveChannelMapを複数定数オブジェクトに対応させる。

## 受け入れ基準

- [ ] CHAT_EDIT_CHANNELS定数のチャンネル名が解決される
- [ ] 新規定数オブジェクト追加時の拡張が容易

## メタ情報

- 発見元: UT-TASK06-007 Phase 11 TC-11-04
- 優先度: 低
- 指示書: `docs/30-workflows/completed-tasks/UT-TASK06-007-ipc-contract-drift-auto-detect/unassigned-task/ut-task06-007-ext-002-multi-channel-const-resolution.md`
