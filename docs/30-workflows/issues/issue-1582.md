# [#1582] [UT-IMP-SESSION-DOCK-TESTID-DEDUP-001] Session Dock の data-testid 重複解消

## 概要

HandoffBlock と PersistentTerminalLauncher が同じ `data-testid="persistent-terminal-launcher"` を使用しており、両コンポーネントが同時にレンダリングされる場合にテストIDが衝突する。

## 対応方針

- HandoffBlock に固有の `data-testid="handoff-block"` を付与する
- PersistentTerminalLauncher は既存の `data-testid="persistent-terminal-launcher"` を維持する
- 関連テストのセレクタを更新する

## 受入基準

- [ ] HandoffBlock に固有の `data-testid="handoff-block"` が付与されている
- [ ] PersistentTerminalLauncher の `data-testid="persistent-terminal-launcher"` は維持されている
- [ ] 両コンポーネント同時レンダリング時に data-testid が一意である
- [ ] 関連テストのセレクタが更新されている

## メタ情報

| 項目   | 内容                                                                        |
| ------ | --------------------------------------------------------------------------- |
| 発見元 | TASK-IMP-SESSION-DOCK-ARTIFACT-BRIDGE-001 Phase 10 MN-10-01                 |
| 優先度 | 低                                                                          |
| 分類   | リファクタリング                                                            |
| 仕様書 | `docs/30-workflows/unassigned-task/UT-IMP-SESSION-DOCK-TESTID-DEDUP-001.md` |
