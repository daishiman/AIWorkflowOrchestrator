# Phase 11: 手動テスト検証

## メタ情報

| 項目   | 値                                                                      |
| ------ | ----------------------------------------------------------------------- |
| Phase  | 11                                                                      |
| 機能名 | task-058e-ui-08-notification-center                                     |
| 作成日 | 2026-03-11                                                              |
| 前提   | Phase 1, Phase 2, Phase 5, Phase 6, Phase 7, Phase 8, Phase 9, Phase 10 |

## 目的

desktop / tablet / mobile の 3 幅で 058e の視覚品質と操作品質を証跡付きで確認する。

## 実行タスク

- screenshot計画: 主要 7 状態の撮影点を固定する。
- 手動ケース実行: open、mark all、expand、delete reveal、tablet、mobile、empty state を確認する。
- a11y確認: keyboard と focus 復帰を確認する。
- 発見事項記録: open items を次 Phase へ送る。

## 参照資料

| 参照資料             | パス                                                                               | 説明            |
| -------------------- | ---------------------------------------------------------------------------------- | --------------- |
| Phase 1 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`                                           | 判定条件        |
| Phase 2 設計         | `outputs/phase-2/component-design.md`                                              | 画面構造        |
| Phase 5 実装         | `outputs/phase-5/implementation-summary.md`                                        | 実装結果        |
| Phase 6 a11y         | `outputs/phase-6/accessibility-cases.md`                                           | a11y 観点       |
| Phase 7 coverage     | `outputs/phase-7/coverage-report.md`                                               | coverage 結果   |
| Phase 8 境界         | `outputs/phase-8/boundary-checklist.md`                                            | 境界確認        |
| Phase 9 品質         | `outputs/phase-9/quality-report.md`                                                | 品質結果        |
| Phase 10 判定        | `outputs/phase-10/final-review-result.md`                                          | 着手条件        |
| 056c 証跡            | `docs/30-workflows/completed-tasks/task-056c-notification-history-domain/index.md` | 既存比較        |
| 未解決項目           | `outputs/phase-10/open-items.md`                                                   | Phase 10 成果物 |

## 実行手順

## テストケース

| テストケース | viewport         | 状態            | 優先度 |
| ------------ | ---------------- | --------------- | ------ |
| TC-11-01     | desktop 1440x900 | Bell idle badge | A      |
| TC-11-02     | desktop 1440x900 | popover open    | A      |
| TC-11-03     | desktop 1440x900 | item expanded   | A      |
| TC-11-04     | tablet 1024x768  | popover open    | A      |
| TC-11-05     | mobile 390x844   | overlay open    | A      |
| TC-11-06     | desktop 1440x900 | empty state     | B      |
| TC-11-07     | desktop 1440x900 | delete reveal   | A      |

## 画面カバレッジマトリクス

| テストケース | 画面状態            | 証跡                                             | 備考                           |
| ------------ | ------------------- | ------------------------------------------------ | ------------------------------ |
| TC-11-01     | idle badge          | `screenshots/TC-11-01-desktop-idle-badge.png`    | Bell 導線の初期状態            |
| TC-11-02     | popover open        | `screenshots/TC-11-02-desktop-popover-open.png`  | header / list / CTA            |
| TC-11-03     | item expanded       | `screenshots/TC-11-03-desktop-item-expanded.png` | detail 階層と relative time    |
| TC-11-04     | tablet open         | `screenshots/TC-11-04-tablet-popover-open.png`   | 1024px の収まり                |
| TC-11-05     | mobile overlay open | `screenshots/TC-11-05-mobile-overlay-open.png`   | overlay と close 導線          |
| TC-11-06     | empty state         | `screenshots/TC-11-06-empty-state.png`           | EmptyState と copy             |
| TC-11-07     | delete reveal       | `screenshots/TC-11-07-desktop-delete-reveal.png` | swipe 相当の delete affordance |

### ステップ2: 手動確認項目

| 項目     | 確認内容                     |
| -------- | ---------------------------- |
| Bell     | open / close と badge 更新   |
| mark all | unread から read へ遷移      |
| expand   | 1件だけ開く                  |
| delete   | swipe で削除導線が出る       |
| keyboard | Escape close と focus return |

## 統合テスト連携

| 観点   | 内容                                        |
| ------ | ------------------------------------------- |
| UI     | desktop / tablet / mobile の 3 幅を確認する |
| a11y   | keyboard のみで close と expand を確認する  |
| Domain | push 後の list 順序と既読遷移を確認する     |

## 成果物

| 成果物                 | パス                                      | 説明         |
| ---------------------- | ----------------------------------------- | ------------ |
| 手動テスト計画         | `outputs/phase-11/manual-test-plan.md`    | ケース一覧   |
| 手動テスト結果         | `outputs/phase-11/manual-test-result.md`  | 実行結果     |
| screenshot plan        | `outputs/phase-11/screenshot-plan.json`   | 撮影計画     |
| スクリーンショット一覧 | `outputs/phase-11/screenshot-matrix.md`   | 証跡一覧     |
| screenshot coverage    | `outputs/phase-11/screenshot-coverage.md` | 網羅率確認   |
| discovered issues      | `outputs/phase-11/discovered-issues.md`   | 視覚所見一覧 |

## 完了条件

- [ ] 主要 7 状態の screenshot 計画を定義している
- [ ] desktop / tablet / mobile の 3 幅を確認対象に含めている
- [ ] keyboard と focus return を確認対象に含めている
- [ ] open items を記録する前提を含めている
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. screenshot 計画
2. 手動ケース整理
3. a11y 手動確認整理
4. open items 整理
5. 完了条件の確認

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] `outputs/phase-11/` の成果物名を固定済み
- [ ] `artifacts.json` の Phase 11 と整合している

## 次のPhase

[Phase 12: ドキュメント更新](./phase-12-documentation.md)
