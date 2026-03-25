# UT-IMP-SESSION-DOCK-TESTID-DEDUP-001: data-testid 衝突解消

## メタ情報

| 項目       | 内容                                                                          |
| ---------- | ----------------------------------------------------------------------------- |
| 未タスクID | UT-IMP-SESSION-DOCK-TESTID-DEDUP-001                                          |
| 発見元     | TASK-IMP-SESSION-DOCK-ARTIFACT-BRIDGE-001 Phase 10 MN-10-01 / Phase 9 RISK-06 |
| 優先度     | 低                                                                            |
| 分類       | リファクタリング                                                              |
| 対応時期   | 実装タスク Phase 5                                                            |

## 概要

HandoffBlock と PersistentTerminalLauncher が同じ `data-testid="persistent-terminal-launcher"` を使用しており、両コンポーネントが同時にレンダリングされる場合にテストIDが衝突する。

## 対応方針

- HandoffBlock に固有の `data-testid="handoff-block"` を付与する
- PersistentTerminalLauncher は既存の `data-testid="persistent-terminal-launcher"` を維持する
- 関連テストのセレクタを更新する

## 対象ファイル

- `apps/desktop/src/renderer/components/chat/HandoffBlock.tsx`
- `apps/desktop/src/renderer/components/chat/PersistentTerminalLauncher.tsx`
- 関連テストファイル

## 受入基準

- [ ] HandoffBlock に固有の `data-testid="handoff-block"` が付与されている
- [ ] PersistentTerminalLauncher の `data-testid="persistent-terminal-launcher"` は維持されている
- [ ] 両コンポーネント同時レンダリング時に data-testid が一意である
- [ ] 関連テストのセレクタが更新されている

## 依存関係

- 親タスク: TASK-IMP-SESSION-DOCK-ARTIFACT-BRIDGE-001
- 前提: なし（単独実行可能）

## 開発知見・苦戦箇所

- DockState 8状態 × コンポーネント数の組み合わせで data-testid 一意性を保証する設計が必要。Phase 10 レビューで初めて検出された（設計段階では見落としやすい）
- 同一 data-testid を持つコンポーネントが条件付きレンダリングで排他的に表示される場合は衝突しないが、同時レンダリングのケースを網羅的に検証すること

## 関連仕様書

- `docs/30-workflows/completed-tasks/step-02-seq-task-02-session-dock-artifact-bridge/outputs/phase-10/final-review-report.md`
