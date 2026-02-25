# Phase 3 設計ギャップ一覧

## ギャップ一覧

| ID     | 種別         | 重要度 | 内容                                                                                                             | 対応Phase |
| ------ | ------------ | ------ | ---------------------------------------------------------------------------------------------------------------- | --------- |
| GAP-01 | 参照パス差分 | 高     | task群の一部が `apps/desktop/src/main/ipc/channels.ts` を参照、現行実体は `apps/desktop/src/preload/channels.ts` | Phase 5   |
| GAP-02 | 命名差分     | 中     | task-012推奨名（例: `schedule:create`）とtask-9G正本（`schedule:add`）に差分                                     | Phase 5   |
| GAP-03 | 参照資料欠落 | 中     | `references/06-known-pitfalls.md` が現ワークツリーに存在しない                                                   | Phase 9   |

## 是正方針

- GAP-01: artifacts.modifiesを現行構造に合わせて更新。
- GAP-02: 9D〜9J仕様書を正本として名称固定。
- GAP-03: 代替参照（`lessons-learned.md`, `ipc-contract-checklist.md`）を監査ログに明記。

## 完了状態

- Phase 3 ギャップ登録: Completed
