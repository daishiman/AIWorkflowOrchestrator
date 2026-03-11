# Phase 10: 最終レビュー

## メタ情報

| 項目       | 値                                                             |
| ---------- | -------------------------------------------------------------- |
| Phase      | 10                                                             |
| Phase名    | 最終レビュー                                                   |
| タスクID   | TASK-SKILL-LIFECYCLE-01                                        |
| タスク名   | スキルライフサイクル一次導線・画面責務基盤                     |
| 前提Phase  | [phase-9-quality-assurance.md](./phase-9-quality-assurance.md) |
| 後続Phase  | [phase-11-manual-test.md](./phase-11-manual-test.md)           |
| ステータス | completed                                                      |
| 作成日     | 2026-03-11                                                     |

## 目的

Task01 単体だけでなく、Task02-05 の前提として十分な基盤かを最終判定する。

## 実行タスク

- 機能完全性レビュー: AC が満たされているかを確認する
- 基盤性レビュー: Task02-05 が迷わず参照できるかを確認する
- extraction レビュー: aiworkflow-requirements の逆引き改善が十分かを確認する
- 残課題レビュー: 未解決事項を持ち越すか未タスク化するか判定する

## 参照資料

| 参照資料              | パス                                                                           | 内容                      |
| --------------------- | ------------------------------------------------------------------------------ | ------------------------- |
| requirements          | `outputs/phase-1/requirements-definition.md`                                   | AC 正本                   |
| responsibility matrix | `outputs/phase-2/surface-responsibility-matrix.md`                             | 責務正本                  |
| implementation log    | `outputs/phase-5/implementation-log.md`                                        | 実装要約                  |
| quality report        | `outputs/phase-9/quality-report.md`                                            | 品質監査結果              |
| accessibility audit   | `outputs/phase-9/accessibility-audit.md`                                       | a11y 結果                 |
| contract audit        | `outputs/phase-9/contract-audit.md`                                            | downstream 整合           |
| extraction audit      | `outputs/phase-9/spec-extraction-audit.md`                                     | 逆引き監査                |
| review criteria       | `.claude/skills/task-specification-creator/references/review-gate-criteria.md` | PASS/MINOR/MAJOR/CRITICAL |

## 判定基準

| 判定     | 条件                   | 対応                                   |
| -------- | ---------------------- | -------------------------------------- |
| PASS     | 重大指摘なし           | Phase 11 へ進む                        |
| MINOR    | 軽微な不足のみ         | 未タスク候補整理の上で Phase 11 へ進む |
| MAJOR    | Task02-05 前提が揺らぐ | Phase 1-9 の該当箇所へ戻る             |
| CRITICAL | 要件前提が崩れている   | Phase 1 へ戻る                         |

## 実行手順

1. AC、責務、実装、品質監査結果を横断して確認する。
2. Task02-05 の前提が崩れていないかを判定する。
3. extraction 改善が十分かを確認し、未解消分は Phase 12 へ引き継ぐ。
4. PASS/MINOR/MAJOR/CRITICAL を記録する。

## 統合テスト連携

| 観点               | 連携内容                                            |
| ------------------ | --------------------------------------------------- |
| AC 完了判定        | 手動テスト前に AC 状態を固定する                    |
| 未タスク候補       | Phase 12 で formalize する候補を分離する            |
| extraction quality | quick-reference/resource-map 改善の有効性を確認する |

## 成果物

| 成果物           | パス                                        | 説明         |
| ---------------- | ------------------------------------------- | ------------ |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md`   | 判定結果     |
| 指摘一覧         | `outputs/phase-10/final-review-findings.md` | 論点整理     |
| 是正計画         | `outputs/phase-10/remediation-plan.md`      | 戻り先と対応 |

## 完了条件

- [x] Task02-05 着手可否が判定されている
- [x] extraction 改善の可否が判定されている
- [x] MAJOR / CRITICAL 時の戻り先が明記されている
- [x] Phase 11 へ持ち込む観点が整理されている
- [x] 本Phase内の全タスクを100%実行完了

## 依存関係

- 前提: [phase-9-quality-assurance.md](./phase-9-quality-assurance.md)
- 後続: [phase-11-manual-test.md](./phase-11-manual-test.md)

## サブタスク管理

- [x] 参照資料確認
- [x] 判定レビュー
- [x] 指摘整理
- [x] 是正計画作成
- [x] 完了条件検証

## タスク100%実行確認

- [x] 本Phase内の全タスクを100%実行完了
- [x] 判定と戻り先が対応づいている
- [x] Phase 11 の観点が明記されている

## 次のPhase

Phase 11: [phase-11-manual-test.md](./phase-11-manual-test.md)
