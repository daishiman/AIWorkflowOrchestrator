# Phase 1 SubAgent責務表

## 関心ごとの分離

| SubAgent   | 担当                                       | 今回の実作業への写像                                           |
| ---------- | ------------------------------------------ | -------------------------------------------------------------- |
| SubAgent-A | Renderer UI / UX / responsive / screenshot | NotificationCenter 分割、Portal、EmptyState、Phase 11 視覚検証 |
| SubAgent-B | Store / Preload / Main IPC / security      | `notification:delete` 追加、allowlist、sender 検証、state 同期 |
| SubAgent-C | テスト / coverage / review gate            | renderer/store/main test、coverage、Phase 3/10 判定            |
| SubAgent-D | task workflow / outputs / Phase 12 sync    | 各 phase 成果物、台帳更新、未タスク検出、実装ガイド            |

## 並列化ポイント

- SubAgent-A と SubAgent-B は Phase 5 で並列可能
- SubAgent-C は Phase 4 の Red テスト設計を先行し、Phase 5 後に Phase 6-7 を直列実行
- SubAgent-D は Phase 1-3 の台帳作成と、Phase 11-12 の証跡整理を並列実行

## バリア条件

- Phase 3 が `PASS` か `MINOR` でなければ Phase 4 へ進まない
- Phase 7 で coverage gate 未達の場合は Phase 5-6 へ戻す
- Phase 10 が `PASS` か `MINOR` でなければ Phase 11-12 へ進まない
