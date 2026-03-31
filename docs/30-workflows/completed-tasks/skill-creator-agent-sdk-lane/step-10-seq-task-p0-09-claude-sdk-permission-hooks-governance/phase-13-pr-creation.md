# Phase 13: PR作成

## メタ情報

| 項目   | 値                                     |
| ------ | -------------------------------------- |
| Phase  | 13                                     |
| 機能名 | claude-sdk-permission-hooks-governance |
| 作成日 | 2026-03-29                             |

## 目的

governance 変更の PR 用チェック項目と summary を準備する。

## 実行タスク

- local check 結果整理
- change summary 作成
- blocked 理由の記録
- user approval の有無確認
- PR 実行可否の最終整理

## 実行手順

1. Phase 12 までの完了根拠と current facts を確認する
2. local check を lint / typecheck / link / validator で実施し、結果を `local-check-result.md` に記録する
3. change summary と `pr-info.md` を作成し、user approval がない場合は blocked のまま明記する
4. user approval がある場合のみ PR 実行に進む

## 参照資料

| 資料名            | パス                                                                             | 説明           |
| ----------------- | -------------------------------------------------------------------------------- | -------------- |
| Phase 10          | `phase-10-final-review.md`                                                       | 最終判定       |
| Phase 12          | `phase-12-documentation.md`                                                      | close-out 根拠 |
| Phase 13 template | `.claude/skills/task-specification-creator/references/phase-template-phase13.md` | blocked ルール |

## 成果物

| 成果物             | パス                                     | 説明             |
| ------------------ | ---------------------------------------- | ---------------- |
| change summary     | `outputs/phase-13/change-summary.md`     | 変更要約         |
| local check result | `outputs/phase-13/local-check-result.md` | ローカル確認要約 |
| pr info            | `outputs/phase-13/pr-info.md`            | PR 実行前情報    |

## 完了条件

- [ ] blocked 理由が明記されている
- [ ] user approval の有無が記録されている
- [ ] local check の結果要約がある
- [ ] **user approval がない限り PR は blocked のままである**
- [ ] **本Phase内の全タスクを100%実行完了**

## 統合テスト連携

- Phase 12 の検証結果を change summary に引き継ぐ
- PR 作成前の local check に lint / typecheck / link / validator を含める

## 多角的チェック観点（AIが判断）

- PR が user 承認なしで進もうとしていないか
- local check の要約だけでなく根拠が残っているか
- Phase 12 の close-out で残した未解決事項がないか

## サブタスク管理

| SubAgent   | 責務                    |
| ---------- | ----------------------- |
| SubAgent-A | local check 整理        |
| SubAgent-B | change summary 作成     |
| Lead       | blocked / approval 判定 |

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

- user approval が得られた場合のみ PR 実行へ進む
