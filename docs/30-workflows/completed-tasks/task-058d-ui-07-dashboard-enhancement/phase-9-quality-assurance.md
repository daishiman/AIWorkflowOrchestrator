# Phase 9: 品質保証

## メタ情報

| 項目         | 内容             |
| ------------ | ---------------- |
| Phase        | 9                |
| Phase名      | 品質保証         |
| 前提Phase    | Phase 5, 6, 7, 8 |
| 後続Phase    | Phase 10         |
| ステータス   | completed        |
| 作成日       | 2026-03-11       |
| 担当SubAgent | SubAgent-D       |

## 目的

UI、A11y、導線、文言、状態管理の観点からホーム画面変更を総合チェックする。

## 実行タスク

- テーマ確認: light / dark / kanagawa-dragon で視認性を確認する
- A11y 確認: EmptyState、Timeline、CTA の keyboard / focus を確認する
- 契約確認: `historySearch` handoff と `dashboard` ID 維持を確認する

## 参照資料

| 参照資料           | パス                                                                        | 内容                                  |
| ------------------ | --------------------------------------------------------------------------- | ------------------------------------- |
| Phase 5仕様        | `phase-5-implementation.md`                                                 | 実装対象                              |
| Phase 6仕様        | `phase-6-test-expansion.md`                                                 | 回帰範囲                              |
| Phase 8仕様        | `phase-8-refactoring.md`                                                    | 共通化後確認                          |
| 設計レビュー結果   | `outputs/phase-3/design-review-result.md`                                   | 既知留意点                            |
| Atoms 実装パターン | `.agents/skills/aiworkflow-requirements/references/ui-ux-atoms-patterns.md` | touch target / mood 運用 / prop drift |

## システム仕様（aiworkflow-requirements）

| 参照資料         | パス                                                                           | 内容         |
| ---------------- | ------------------------------------------------------------------------------ | ------------ |
| UI設計原則       | `.agents/skills/aiworkflow-requirements/references/ui-ux-design-principles.md` | 文言と階層   |
| デザインシステム | `.agents/skills/aiworkflow-requirements/references/ui-ux-design-system.md`     | token 一貫性 |
| A11y テスト      | `.agents/skills/aiworkflow-requirements/references/testing-accessibility.md`   | WCAG 観点    |
| lessons learned  | `.agents/skills/aiworkflow-requirements/references/lessons-learned.md`         | 既知再発防止 |

## 統合テスト連携

| 観点   | 内容                                    |
| ------ | --------------------------------------- |
| テーマ | light / dark / kanagawa-dragon の見え方 |
| 導線   | CTA と `historySearch` handoff の一貫性 |
| Atoms  | touch target と mood 運用の整合         |

## 多角的チェック観点

| 観点               | 適用判断                                                   | 仕様参照先                                          |
| ------------------ | ---------------------------------------------------------- | --------------------------------------------------- |
| UI/UX              | 品質保証の主対象なので適用                                 | `aiworkflow-requirements: ui-ux-*.md`               |
| アクセシビリティ   | focus / keyboard / role / contrast で適用                  | `aiworkflow-requirements: testing-accessibility.md` |
| セキュリティ       | 新規外部境界追加なしと既存契約維持を確認するため適用       | `aiworkflow-requirements: security-*.md`            |
| エラーハンドリング | empty / loading / invalid timestamp の fallback 確認で適用 | `aiworkflow-requirements: error-handling.md`        |
| テスタビリティ     | Phase 11 へ handoff する観点整理で適用                     | `aiworkflow-requirements: testing-*.md`             |

## 成果物

| 成果物             | パス                                               | 内容         |
| ------------------ | -------------------------------------------------- | ------------ |
| 品質チェックリスト | `outputs/phase-9/quality-checklist.md`             | 品質観点     |
| A11y 検証計画      | `outputs/phase-9/accessibility-validation-plan.md` | 手動確認観点 |

## 完了条件

- [x] テーマ差分が確認観点に入っている
- [x] keyboard / SR 観点が含まれている
- [x] `historySearch` handoff が含まれている
- [x] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. テーマ確認観点整理
3. A11y 観点整理
4. 導線確認観点整理
5. 完了条件の確認

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 成果物パスが `outputs/phase-9/` に確定している
- [x] 既知未タスクと再発防止観点が参照されている
- [x] `artifacts.json` の Phase 9 記述と整合している

## 次のPhase

Phase 10: 最終レビューゲート
