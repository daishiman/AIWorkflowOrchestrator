# Phase 1 Scope Boundary

## 親と child の境界

| 領域        | 親 workflow が持つ                     | child workflow が持つ                             | 判定 |
| ----------- | -------------------------------------- | ------------------------------------------------- | ---- |
| 04A         | 入口説明、依存順序、canonical path     | layout / file browser / watcher / screenshot 実装 | 分離 |
| 04B         | 入口説明、並列開始条件、canonical path | chat / mention / stream / conversation 実装       | 分離 |
| 04C         | 入口説明、並列開始条件、canonical path | preview / quick search / timeout / retry 実装     | 分離 |
| system spec | 参照入口、同期方針、更新責務の所在     | 個別 feature の詳細仕様                           | 分離 |
| Phase 11    | child evidence の継承方針              | 個別 screenshot 実体                              | 分離 |

## In Scope

- 親参照仕様の requirements / design / gate / validator 定義
- parent pointer と master index の導線整備
- child canonical path の正規化
- system spec への `spec_created` 同期
- Phase 11 での evidence inheritance 記録

## Out Of Scope

- `apps/desktop` 配下の実装変更
- 04A / 04B / 04C の再設計や再実装
- child workflow の成果物差し替え
- commit / PR 実行

## リスク

| リスク         | 内容                                  | 対応                                     |
| -------------- | ------------------------------------- | ---------------------------------------- |
| scope drift    | 親が child 実装や status を持ち始める | responsibility matrix を Phase 2 で固定  |
| path drift     | current/completed の表記が混在する    | canonical path を completed-tasks に統一 |
| evidence drift | 親が新規 screenshot を要求してしまう  | Phase 11 で docs-only N/A を明文化       |

## 結論

親 workflow は docs-only の orchestration layer として扱い、child workflow と system spec の接続面のみを責務に持つ。
