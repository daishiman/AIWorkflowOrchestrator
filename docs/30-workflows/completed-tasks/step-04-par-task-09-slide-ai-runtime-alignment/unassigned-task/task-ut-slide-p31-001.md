# useSlideProject P31 セレクタ移行 - 解消記録

## メタ情報

```yaml
issue_number: 1364
```

| 項目       | 内容                             |
| ---------- | -------------------------------- |
| タスクID   | UT-SLIDE-P31-001                 |
| タスク名   | useSlideProject P31 セレクタ移行 |
| 分類       | リファクタリング                 |
| 対象機能   | slide-ai-runtime-alignment       |
| 優先度     | 中                               |
| ステータス | 解消済み                         |
| 解消日     | 2026-03-21                       |

## 解消内容

- `apps/desktop/src/renderer/slide/useSlideProject.ts` は store 全体参照を廃止し、`projectPath` / `syncStatus` / `currentPhase` / action 群を個別 selector で取得する構造へ移行済み
- `apps/desktop/src/renderer/slide/selectors.ts` が `useSlideUIStatus()` を含む scalar selector 群を提供し、UI 側も合成参照に依存しない
- Task09 / system spec 側の stale な「P31 未解消」記述を current branch 状態へ同期した

## 検証メモ

| 項目             | 結果                                                                      |
| ---------------- | ------------------------------------------------------------------------- |
| 実装確認         | `useSlideProject.ts` は `useSlideProjectStore()` の全体取得を使っていない |
| ドキュメント同期 | `arch-state-management-advanced.md` / `task-workflow-completed.md` を更新 |
| 残作業           | なし                                                                      |

## 備考

ファイルは履歴保持のため残す。Task09 の pending follow-up からは除外した。
