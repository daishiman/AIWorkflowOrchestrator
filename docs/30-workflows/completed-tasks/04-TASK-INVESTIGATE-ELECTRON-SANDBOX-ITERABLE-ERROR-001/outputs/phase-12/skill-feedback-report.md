# Phase 12 スキルフィードバック

## 改善提案

- 改善提案件数: 3件

1. `NON_VISUAL` タスクでもユーザー要求時に即座に `SCREENSHOT` モードへ切り替える運用フラグを標準化する
2. `audit-unassigned-tasks` の引数誤用防止のため、`--target-file` は `.md` 限定であることをテンプレートに明記する
3. Phase 12再監査で `phase-12-documentation.md` ステータス/完了チェックが残置しないよう、完了同期をテンプレートの必須チェックに固定する

## コメント

- 今回は Phase 11 が `NON_VISUAL` 記録だったため、再監査でスクリーンショット3件を追加して整合を回復した。
- 次回同種タスクでは、初回 Phase 11 から `TC-ID ↔ png` を生成することで再作業を削減できる。
- 本提案は `skill-creator` の patterns/template へ反映済み。
