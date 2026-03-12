# 設計レビュー指摘一覧

| ID    | 重要度 | 指摘                                                          | 対応                          |
| ----- | ------ | ------------------------------------------------------------- | ----------------------------- |
| DR-01 | Medium | `chatSlice` と `useStreamingChat` が二重 authority になり得る | hook を facade 化して解消     |
| DR-02 | Medium | Workspace / Skill Center が chat UI を重複実装し得る          | handoff 導線へ統一            |
| DR-03 | High   | Chat surface が light theme で読みにくい                      | Phase 11 で contrast 修正済み |

## 総評

- session/model/context の分離方針は妥当。
- surface ownership を Task01 の導線と矛盾なく維持できる。
