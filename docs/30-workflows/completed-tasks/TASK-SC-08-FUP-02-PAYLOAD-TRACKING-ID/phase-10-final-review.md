# Phase 10: 最終レビュー

## メタ情報

| 項目       | 値                                                           |
| ---------- | ------------------------------------------------------------ |
| Phase      | 10                                                           |
| タスクID   | TASK-SC-08-FUP-02-PAYLOAD-TRACKING-ID                        |
| タスク種別 | NON_VISUAL code task                                         |
| 前Phase    | [phase-9-quality-assurance.md](phase-9-quality-assurance.md) |
| 次Phase    | [phase-11-manual-test.md](phase-11-manual-test.md)           |

## 目的

AC-1 〜 AC-9 を phase 1-9 の evidence と突合し、Phase 11 の受入代替証跡へ進めるかを判定する。
artifact parity の最終確認も本 phase で完結させる。

## AC × Phase evidence 突合

| AC   | 内容                                                    | 評価根拠 phase                    | 判定   |
| ---- | ------------------------------------------------------- | --------------------------------- | ------ |
| AC-1 | `SkillCreatorProgress` に `planId?` / `requestId?` 追加 | Phase 5 実装 + Phase 9 typecheck  | 未実施 |
| AC-2 | `sendSkillCreatorProgress` が両 ID を送信できる         | Phase 5 実装 + Phase 9 typecheck  | 未実施 |
| AC-3 | `useStreamingProgress` に `options.planId` filter 実装  | Phase 5 実装 + Phase 7 統合テスト | 未実施 |
| AC-4 | `planId` 一致時のみ store 書き込み                      | Phase 6 vitest（filter match）    | 未実施 |
| AC-5 | `planId` 不一致は skip                                  | Phase 6 vitest（filter miss）     | 未実施 |
| AC-6 | `progress.planId` 未設定は後方互換で受信                | Phase 6 vitest（legacy payload）  | 未実施 |
| AC-7 | `options.planId` 未指定は全受信                         | Phase 6 vitest（no options）      | 未実施 |
| AC-8 | 既存 `useStreamingProgress` テスト全 PASS               | Phase 9 targeted test             | 未実施 |
| AC-9 | typecheck / lint / targeted test PASS                   | Phase 9 quality gate              | 未実施 |

## Blocker 判定ルール

| 状況                         | 次アクション                       |
| ---------------------------- | ---------------------------------- |
| 0 blocker（全 AC が PASS）   | Phase 11 受入へ進行                |
| 1+ blocker（any AC が FAIL） | FAIL した AC 根拠 phase へ差し戻し |
| 1+ MINOR（文言不整合等）     | 同 phase で修正し再評価            |

## artifact parity 最終確認

- `artifacts.json` に列挙された全パスが `outputs/` 配下に実在する
- Phase 1-9 の `成果物` セクションに記載した canonical パスと `artifacts.json` が完全一致
- `index.md` と artifacts registry の phase 数が一致（Phase 1-10）
- `outputs/phase-10/final-review-result.md` 自身が生成されている

## 実行タスク

- AC-1 から AC-9 を evidence と突合して判定する
- blocker 数と差し戻し先を明確化する
- artifact parity の最終確認を記録する

## 成果物

| 成果物              | パス                                      |
| ------------------- | ----------------------------------------- |
| final review result | `outputs/phase-10/final-review-result.md` |

## 参照資料

- [phase-1-requirements.md](phase-1-requirements.md) — AC-1 〜 AC-9 原典
- [phase-9-quality-assurance.md](phase-9-quality-assurance.md) — 品質ゲート PASS 根拠
- `artifacts.json` / `index.md`
- `.claude/skills/task-specification-creator/references/review-gate-criteria.md`

## 統合テスト連携

- Phase 10 自体では追加テストを実行しない
- Phase 9 の typecheck / lint / targeted test 結果を受けて、Phase 11 の manual-test evidence へ進行するかを判定する

## 完了条件

- [ ] AC-1 〜 AC-9 それぞれに PASS / FAIL / MINOR 判定が記録されている
- [ ] blocker 数（0 / 1+）が明示されている
- [ ] 0 blocker の場合 Phase 11 進行根拠が記録されている
- [ ] 1+ blocker の場合、差し戻し先 phase が明記されている
- [ ] artifact parity 最終確認結果（全パス実在）が記録されている
- [ ] `outputs/phase-10/final-review-result.md` が生成されている
