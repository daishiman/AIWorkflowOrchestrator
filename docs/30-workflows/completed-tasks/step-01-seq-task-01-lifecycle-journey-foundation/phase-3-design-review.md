# Phase 3: 設計レビュー

## メタ情報

| 項目       | 値                                                     |
| ---------- | ------------------------------------------------------ |
| Phase      | 3                                                      |
| Phase名    | 設計レビュー                                           |
| タスクID   | TASK-SKILL-LIFECYCLE-01                                |
| タスク名   | スキルライフサイクル一次導線・画面責務基盤             |
| 前提Phase  | [phase-2-design.md](./phase-2-design.md)               |
| 後続Phase  | [phase-4-test-creation.md](./phase-4-test-creation.md) |
| ステータス | completed                                              |
| 作成日     | 2026-03-11                                             |

## 目的

Task01 の設計が要件を満たし、後続タスクが迷わず依存できる粒度かを判定する。

## 実行タスク

- 導線レビュー: 一次導線が 1 本に見えるかを確認する
- 責務レビュー: 画面責務が排他的かを確認する
- advanced レビュー: hidden / advanced が主要導線の代替になっていないかを確認する
- 依存契約レビュー: Task02-05 の入力・出力・禁止事項が十分かを確認する
- 仕様抽出レビュー: aiworkflow-requirements の参照順序で取りこぼしがないかを確認する

## 参照資料

| 参照資料               | パス                                                                           | 内容                  |
| ---------------------- | ------------------------------------------------------------------------------ | --------------------- |
| Phase 1 要件           | `outputs/phase-1/requirements-definition.md`                                   | 要件正本              |
| Phase 2 導線シーケンス | `outputs/phase-2/primary-journey-sequence.md`                                  | 導線設計              |
| Phase 2 責務マトリクス | `outputs/phase-2/surface-responsibility-matrix.md`                             | 画面責務              |
| Phase 2 advanced 方針  | `outputs/phase-2/advanced-route-policy.md`                                     | advanced 判断         |
| Phase 2 依存契約表     | `outputs/phase-2/dependency-contracts.md`                                      | 後続依存条件          |
| review criteria        | `.claude/skills/task-specification-creator/references/review-gate-criteria.md` | PASS/MINOR/MAJOR 判定 |

### システム仕様（aiworkflow-requirements）

| 参照資料              | パス                                                                            | 内容                     |
| --------------------- | ------------------------------------------------------------------------------- | ------------------------ |
| UIナビゲーション      | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`         | nav と rollback の妥当性 |
| feature catalog       | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | 既存画面責務との衝突確認 |
| state management      | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`    | state ownership          |
| architecture overview | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`    | shell 整合               |
| UI原則                | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`  | HIG/WCAG 観点            |

## レビュー観点

- 一次導線が `作る` `使う` `改善する` の 3 ジョブを自然に包含しているか
- `Skill Center` `Workspace` `Agent` `Chat` `Skill Creator` の責務が排他的か
- advanced 導線が主要導線を食っていないか
- Atent Team / SubAgent が UI の概念として漏れ出ていないか
- aiworkflow-requirements の参照順序だけで必要仕様へ到達できるか

## 判定基準

| 判定  | 条件                           | 対応                          |
| ----- | ------------------------------ | ----------------------------- |
| PASS  | 重大指摘なし                   | Phase 4 へ進む                |
| MINOR | 軽微な表現修正のみ             | 修正後に Phase 4 へ進む       |
| MAJOR | 導線・責務・依存契約に欠落あり | Phase 1 または Phase 2 へ戻る |

## 統合テスト連携

| 観点             | 連携内容                                             |
| ---------------- | ---------------------------------------------------- |
| route contract   | 導線設計をルート/ナビテストへ接続する                |
| screen ownership | 画面責務を smoke test と review checklist へ接続する |
| advanced policy  | advanced 導線の非主要化を回帰テストへ接続する        |

## 成果物

| 成果物           | パス                                        | 説明                  |
| ---------------- | ------------------------------------------- | --------------------- |
| 設計レビュー結果 | `outputs/phase-3/design-review-result.md`   | PASS/MINOR/MAJOR 判定 |
| 指摘一覧         | `outputs/phase-3/design-review-findings.md` | 観点別指摘            |
| 差し戻し計画     | `outputs/phase-3/remediation-plan.md`       | 戻り先と対応          |

## 完了条件

- [x] PASS/MINOR/MAJOR 判定が記録されている
- [x] MAJOR 指摘時の戻り先が明記されている
- [x] Task02-05 着手可否が判定されている
- [x] aiworkflow-requirements の抽出経路妥当性が判定されている
- [x] 本Phase内の全タスクを100%実行完了

## 依存関係

- 前提: [phase-2-design.md](./phase-2-design.md)
- 後続: [phase-4-test-creation.md](./phase-4-test-creation.md)

## サブタスク管理

- [x] 参照資料確認
- [x] 観点別レビュー
- [x] 判定記録
- [x] 差し戻し要否整理
- [x] 完了条件検証

## タスク100%実行確認

- [x] 本Phase内の全タスクを100%実行完了
- [x] レビュー結果が Phase 4 に引き継げる
- [x] 指摘と戻り先が対応づいている

## 次のPhase

Phase 4: [phase-4-test-creation.md](./phase-4-test-creation.md)
