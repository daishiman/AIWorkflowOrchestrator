# [#1333] [UT-TASK06-007-EXT-004] check-ipc-contracts.ts モジュール分割リファクタリング

## 概要

`check-ipc-contracts.ts`（478行）をNFR-05（200行以内目安）に近づけるため、型定義・抽出関数・検出関数・レポート関数・CLI関数を別ファイルに分割する。

## 受け入れ基準

- [ ] メインスクリプトが200行以内になる
- [ ] 既存テストが回帰しない
- [ ] CLIの実行方法が変わらない

## メタ情報

- 発見元: UT-TASK06-007 Phase 8 リファクタリングレポート
- 優先度: 低
- 指示書: `docs/30-workflows/completed-tasks/UT-TASK06-007-ipc-contract-drift-auto-detect/unassigned-task/ut-task06-007-ext-004-script-modular-split.md`
