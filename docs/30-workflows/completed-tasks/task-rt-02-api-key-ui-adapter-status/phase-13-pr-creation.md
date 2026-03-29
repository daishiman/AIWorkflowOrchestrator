# Phase 13: PR作成

## メタ情報

| 項目       | 値                                   |
| ---------- | ------------------------------------ |
| Phase      | 13                                   |
| Phase名    | PR作成                               |
| 前提Phase  | Phase 12                             |
| 後続Phase  | -                                    |
| ステータス | blocked                              |
| 作成日     | 2026-03-29                           |
| 機能名     | task-rt-02-api-key-ui-adapter-status |

## 目的

Phase 1〜12 の成果物を基に PR を準備する。ただし、この Phase は user の明示承認があるまで着手しない。

## 実行タスク

- 変更範囲確認
- PR 本文下書き作成
- approval 取得後にのみ commit / push / PR 作成

## 制約

- user approval 未取得のまま completed にしない
- commit / push / PR 作成を先行実行しない
- blocked 理由を明記したまま保持する

## 参照資料

| 参照資料     | パス                                                                           | 内容        |
| ------------ | ------------------------------------------------------------------------------ | ----------- |
| レビュー基準 | `.claude/skills/task-specification-creator/references/review-gate-criteria.md` | PR 進行条件 |

## 成果物

| 成果物       | パス      | 説明                 |
| ------------ | --------- | -------------------- |
| Pull Request | GitHub UI | user approval 後のみ |

## 完了条件

- [ ] user approval を取得している
- [ ] commit / push / PR が完了している
- [ ] CI が成功している
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

なし
