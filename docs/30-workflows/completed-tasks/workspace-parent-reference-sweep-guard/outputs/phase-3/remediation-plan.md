# 是正計画

## 実装前是正

| 項目                                          | 実施 Phase | 内容                                                               |
| --------------------------------------------- | ---------- | ------------------------------------------------------------------ |
| red case 分離                                 | Phase 4    | path/status/mirror を別テストケースにする                          |
| manifest 直指定 validator                     | Phase 5    | `scripts/validate-workspace-parent-reference-sweep.mjs` を追加する |
| completed-task pointer docs の patch 範囲制御 | Phase 5    | 先頭メタ情報と導線注記だけを変更する                               |

## ドキュメント是正

| 項目             | 実施 Phase | 内容                                                                         |
| ---------------- | ---------- | ---------------------------------------------------------------------------- |
| lessons 化       | Phase 12   | docs-only parent workflow sweep を lessons-learned に追加する                |
| 台帳同期         | Phase 12   | `task-workflow.md` と `ui-ux-feature-components.md` に related UT を追加する |
| mirror sync 記録 | Phase 12   | `.claude` / `.agents` の `diff -qr` を compliance check に記録する           |
