# Phase 13: PR作成

## メタ情報

| 項目       | 値                                    |
| ---------- | ------------------------------------- |
| Phase      | 13                                    |
| 機能名     | phase11-ui-ux-auto-eval-feedback-loop |
| タスクID   | TASK-UIUX-FEEDBACK-001                |
| 作成日     | 2026-03-31                            |
| ステータス | blocked                               |
| 担当       | リリース担当                          |

## 目的

ユーザー承認後にのみ PR 草稿を確定できるよう、ブランチ名、PR 本文、確認項目を整理しておく。承認前は commit、push、PR 作成を実行しない。

## 実行タスク

- PR ブランチ名、タイトル、本文の草稿を保持する
- CI/CD と manual evidence の確認項目を列挙する
- ユーザー承認前は blocked のまま維持する

## 参照資料

| 資料名                           | パス                                                                                     | 説明                    |
| -------------------------------- | ---------------------------------------------------------------------------------------- | ----------------------- |
| Phase 12 ドキュメント更新        | `docs/30-workflows/task-uiux-feedback-001-phase11-enhancement/phase-12-documentation.md` | PR 本文の根拠           |
| PR 要約                          | `outputs/phase-13/pr-summary.md`                                                         | 草稿の要約              |
| task-specification-creator SKILL | `.claude/skills/task-specification-creator/SKILL.md`                                     | Phase 13 blocked ルール |

## 実行手順

### ステップ 1: 草稿確認

- `outputs/phase-13/pr-summary.md` の記述をレビューする

### ステップ 2: 承認待ち管理

- ユーザーが明示的に PR 作成を指示するまでは `blocked` を維持する

## 統合テスト連携

| 連携先   | 連携内容                                                 |
| -------- | -------------------------------------------------------- |
| Phase 11 | manual evidence の有無を PR 本文へ反映する               |
| Phase 12 | system spec update summary と changelog を PR 根拠に使う |

## 成果物

| 成果物名    | パス                                                                                   | 説明                 |
| ----------- | -------------------------------------------------------------------------------------- | -------------------- |
| PR 作成仕様 | `docs/30-workflows/task-uiux-feedback-001-phase11-enhancement/phase-13-pr-creation.md` | 本フェーズの親仕様書 |
| PR 要約     | `outputs/phase-13/pr-summary.md`                                                       | 承認後に利用する草稿 |

## 完了条件チェックリスト

- [ ] PR 草稿の参照元が Phase 12 に揃っている
- [ ] 承認前は blocked のまま維持する方針が明記されている
- [ ] commit / push / PR 作成を実行しないことが明記されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**
