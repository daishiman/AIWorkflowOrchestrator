# Phase 9: 品質検証

## メタ情報

| 項目       | 値                                                     |
| ---------- | ------------------------------------------------------ |
| Phase      | 9                                                      |
| Phase名    | 品質検証                                               |
| タスクID   | TASK-SKILL-LIFECYCLE-01                                |
| タスク名   | スキルライフサイクル一次導線・画面責務基盤             |
| 前提Phase  | [phase-8-refactoring.md](./phase-8-refactoring.md)     |
| 後続Phase  | [phase-10-final-review.md](./phase-10-final-review.md) |
| ステータス | completed                                              |
| 作成日     | 2026-03-11                                             |

## 目的

Task01 の導線設計と実装が UI/UX、アクセシビリティ、契約整合、抽出経路の観点で妥当かを確認する。

## 実行タスク

- UX監査: 一次導線の視認性、理解しやすさ、言葉の一貫性を確認する
- a11y監査: キーボード導線、ラベル、コントラストを確認する
- contract 監査: Task02-05 依存 surface が安定しているか確認する
- extraction 監査: aiworkflow-requirements の逆引きで必要仕様へ到達できるか確認する

## 参照資料

| 参照資料                 | パス                                          | 内容     |
| ------------------------ | --------------------------------------------- | -------- |
| implementation log       | `outputs/phase-5/implementation-log.md`       | 実装内容 |
| refactoring log          | `outputs/phase-8/refactoring-log.md`          | 最終構造 |
| naming alignment         | `outputs/phase-8/naming-alignment.md`         | 用語     |
| requirement traceability | `outputs/phase-7/requirement-traceability.md` | AC 追跡  |

### システム仕様（aiworkflow-requirements）

| 参照資料              | パス                                                                            | 内容                 |
| --------------------- | ------------------------------------------------------------------------------- | -------------------- |
| UI design principles  | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`  | HIG/WCAG 観点        |
| accessibility testing | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`    | a11y 基準            |
| UI navigation         | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`         | route/nav 契約       |
| feature components    | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | 画面責務             |
| security api electron | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`    | route 露出と安全境界 |

## 実行手順

1. UX、a11y、contract、extraction の 4 軸で監査する。
2. 重大指摘は Phase 10 前に是正するか、戻り先候補を明記する。
3. 軽微指摘は Phase 10 に持ち込めるよう分類する。

## 統合テスト連携

| 観点       | 連携内容                                  |
| ---------- | ----------------------------------------- |
| UX         | 手動テスト前のチェックリスト化            |
| a11y       | Phase 11 の視覚証跡と併用する観点整理     |
| extraction | resource-map / quick-reference の導線確認 |

## 成果物

| 成果物               | パス                                       | 説明                |
| -------------------- | ------------------------------------------ | ------------------- |
| 品質レポート         | `outputs/phase-9/quality-report.md`        | 総合監査結果        |
| アクセシビリティ監査 | `outputs/phase-9/accessibility-audit.md`   | a11y 観点           |
| 契約監査             | `outputs/phase-9/contract-audit.md`        | Task02-05 依存確認  |
| 抽出経路監査         | `outputs/phase-9/spec-extraction-audit.md` | aiworkflow 導線確認 |

## 完了条件

- [x] UX 重大回帰がない
- [x] a11y 重大問題がない
- [x] Task02-05 依存 surface が安定している
- [x] aiworkflow-requirements 抽出経路の不足が整理されている
- [x] 本Phase内の全タスクを100%実行完了

## 依存関係

- 前提: [phase-8-refactoring.md](./phase-8-refactoring.md)
- 後続: [phase-10-final-review.md](./phase-10-final-review.md)

## サブタスク管理

- [x] 参照資料確認
- [x] UX監査
- [x] a11y監査
- [x] contract/extraction 監査
- [x] 成果物作成

## タスク100%実行確認

- [x] 本Phase内の全タスクを100%実行完了
- [x] 重大指摘の扱いが明記されている
- [x] Phase 10 へ持ち込む論点が整理されている

## 次のPhase

Phase 10: [phase-10-final-review.md](./phase-10-final-review.md)
