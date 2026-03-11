# Phase 4: テスト作成

## メタ情報

| 項目       | 値                                                       |
| ---------- | -------------------------------------------------------- |
| Phase      | 4                                                        |
| Phase名    | テスト作成                                               |
| タスクID   | TASK-SKILL-LIFECYCLE-01                                  |
| タスク名   | スキルライフサイクル一次導線・画面責務基盤               |
| 前提Phase  | [phase-3-design-review.md](./phase-3-design-review.md)   |
| 後続Phase  | [phase-5-implementation.md](./phase-5-implementation.md) |
| ステータス | completed                                                |
| 作成日     | 2026-03-11                                               |

## 目的

導線、責務、advanced 導線方針の破綻を実装前に検出できるテスト戦略を定義する。

## 実行タスク

- route test 設計: 一次導線に到達できるルート・ナビテストを定義する
- responsibility smoke 設計: 各画面の主責務と禁止責務を確認する観点を定義する
- advanced regression 設計: advanced 導線が主要導線を置換しないことを検証する
- dependency contract 設計: Task02-05 の入口が Task01 設計に従うことを確認する
- screenshot plan 下準備: Phase 11 の撮影対象候補と TC-ID を先に定義する

## 参照資料

| 参照資料               | パス                                                                        | 内容                         |
| ---------------------- | --------------------------------------------------------------------------- | ---------------------------- |
| design review result   | `outputs/phase-3/design-review-result.md`                                   | レビュー判定                 |
| design review findings | `outputs/phase-3/design-review-findings.md`                                 | 指摘内容                     |
| 導線シーケンス         | `outputs/phase-2/primary-journey-sequence.md`                               | テスト対象導線               |
| 責務マトリクス         | `outputs/phase-2/surface-responsibility-matrix.md`                          | 役割ごとの期待値             |
| advanced 方針          | `outputs/phase-2/advanced-route-policy.md`                                  | 回帰条件                     |
| 依存契約表             | `outputs/phase-2/dependency-contracts.md`                                   | 後続テスト観点               |
| phase 11/12 guide      | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md` | TC-ID と screenshot 先行設計 |

### システム仕様（aiworkflow-requirements）

| 参照資料              | パス                                                                              | 内容                                  |
| --------------------- | --------------------------------------------------------------------------------- | ------------------------------------- |
| quality requirements  | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | TDD/coverage 基準                     |
| component testing     | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | UI テスト粒度                         |
| accessibility testing | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`      | a11y 観点                             |
| UI navigation         | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`           | route/nav 検証対象                    |
| feature components    | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`   | Skill Center / Workspace / Agent 関連 |

## 実行手順

1. 一次導線の各遷移点に TC-ID を割り当てる。
2. route/nav テスト、責務 smoke、advanced regression、依存契約テストに分類する。
3. Phase 11 で必要になる視覚確認状態を先に列挙する。
4. 実装前に fail すべき観点と、実装後に pass すべき観点を分離する。

## 統合テスト連携

| 観点         | 連携内容                                             |
| ------------ | ---------------------------------------------------- |
| ルーティング | `App.tsx` と nav shell を結ぶ統合観点を作る          |
| 画面責務     | 主要画面で許可される action / 禁止 action を列挙する |
| 後続依存     | Task02-05 が Task01 の入口契約を破らない観点を作る   |

## 成果物

| 成果物               | パス                                            | 説明              |
| -------------------- | ----------------------------------------------- | ----------------- |
| テストケース一覧     | `outputs/phase-4/test-cases.md`                 | TC-ID と期待結果  |
| ルート契約マトリクス | `outputs/phase-4/route-contract-test-matrix.md` | route/nav テスト  |
| 責務 smoke 一覧      | `outputs/phase-4/surface-smoke-checklist.md`    | 画面責務確認      |
| screenshot 先行計画  | `outputs/phase-4/phase11-screenshot-preplan.md` | Phase 11 対象候補 |
| Red チェックリスト   | `outputs/phase-4/red-checklist.md`              | 実装前失敗確認    |

## 完了条件

- [x] 一次導線を覆う TC-ID が定義されている
- [x] 画面責務 smoke 観点が定義されている
- [x] advanced regression 観点が定義されている
- [x] Task02-05 依存契約テスト観点が定義されている
- [x] Phase 11 screenshot 対象候補が列挙されている
- [x] 本Phase内の全タスクを100%実行完了

## 依存関係

- 前提: [phase-3-design-review.md](./phase-3-design-review.md)
- 後続: [phase-5-implementation.md](./phase-5-implementation.md)

## サブタスク管理

- [x] 参照資料確認
- [x] TC-ID 設計
- [x] route/責務/advanced/依存契約テスト設計
- [x] screenshot 先行計画
- [x] 完了条件検証

## タスク100%実行確認

- [x] 本Phase内の全タスクを100%実行完了
- [x] Phase 5 が Red/Green を始められる
- [x] Phase 11 が TC-ID を再利用できる

## 次のPhase

Phase 5: [phase-5-implementation.md](./phase-5-implementation.md)
