# Phase 13: PR作成 - Skill Runtime API Key Panel

## メタ情報

| 項目       | 値                     |
| ---------- | ---------------------- |
| タスクID   | TASK-RT-04             |
| Phase      | 13 - PR作成            |
| 前提Phase  | Phase 1, 2, 5〜12 完了 |
| 関連Issue  | #1881                  |
| ステータス | blocked                |

## 重要

**PR作成はユーザーの明示的な承認後のみ実施する。**

## 目的

Phase 1-12 の全成果を統合し、レビュー用 PR を作成する前提を固定する。

## 実行タスク

- ローカル動作確認の結果をまとめる
- `local-check-result.md` に current facts と `artifacts.json` / `outputs/artifacts.json` parity を残す
- 変更サマリーを提示してユーザー承認を得る
- 承認後にのみ PR 作成と CI 確認を行う

## 参照資料

| 資料名                    | パス                                                                                    | 用途                      |
| ------------------------- | --------------------------------------------------------------------------------------- | ------------------------- |
| Phase 10 最終レビュー     | [phase-10-final-review.md](phase-10-final-review.md)                                    | 受入判定の根拠            |
| Phase 11 手動テスト       | [phase-11-manual-test.md](phase-11-manual-test.md)                                      | 手動確認の根拠            |
| Phase 12 ドキュメント更新 | [phase-12-documentation.md](phase-12-documentation.md)                                  | 変更サマリーの根拠        |
| Phase 13 テンプレート     | `.claude/skills/task-specification-creator/references/phase-template-phase13-detail.md` | blocked / approval ルール |

## 統合テスト連携

- 依存Phase: Phase 1, Phase 2, Phase 5, Phase 6, Phase 7, Phase 8, Phase 9, Phase 10, Phase 11, Phase 12
- Phase 10 / 11 / 12 の記録を PR の根拠に使う
- CI が通るまで completed にしない
- canonical root と mirror parity が崩れていないことを local check で確認する

## 成果物

| 成果物             | パス                                   |
| ------------------ | -------------------------------------- |
| ローカル確認結果   | outputs/phase-13/local-check-result.md |
| 変更サマリー       | outputs/phase-13/change-summary.md     |
| PR情報テンプレート | outputs/phase-13/pr-info.md            |

## 完了条件

- [ ] ユーザーの明示的な承認が得られている
- [ ] `local-check-result.md` と `change-summary.md` が作成されている
- [ ] `local-check-result.md` に current facts と parity が記録されている
- [ ] PR が作成されている
- [ ] CI チェックが通過している
