# Phase 10: 最終レビューゲート

## メタ情報

| 項目   | 値                            |
| ------ | ----------------------------- |
| Phase  | 10                            |
| 機能名 | UT-W3-ANALYTICS-DASHBOARD-001 |
| 作成日 | 2026-04-13                    |

## 目的

acceptance criteria と blocker を判定し、Phase 11 への進行可否を決定する。
受入基準 AC-1〜AC-5 との完全な照合を行い、PASS/FAIL を判定する。

---

## 実行タスク

- **タスク1**: 受入基準 AC-1〜AC-5 の最終照合
- **タスク2**: コードレビュー観点のチェック
- **タスク3**: PASS/FAIL 判定と戻り先の決定
- **タスク4**: 最終レビュー結果の記録

---

## 参照資料

| 資料名                                         | パス                                       | 説明              |
| ---------------------------------------------- | ------------------------------------------ | ----------------- |
| Phase 1 受入基準                               | `outputs/phase-1/acceptance-criteria.md`   | AC-1〜AC-5 の定義 |
| Phase 9 品質チェック結果                       | `outputs/phase-9/quality-check-result.md`  | 品質ゲート結果    |
| P50チェック結果                                | `outputs/phase-1/p50-check-result.md`      | Phase 1 成果物    |
| スコープ定義                                   | `outputs/phase-1/scope-definition.md`      | Phase 1 成果物    |
| 設計判断記録                                   | `outputs/phase-2/design-decisions.md`      | Phase 2 成果物    |
| コンポーネントインターフェース定義             | `outputs/phase-2/component-interface.md`   | Phase 2 成果物    |
| 実装結果                                       | `outputs/phase-5/implementation-result.md` | Phase 5 成果物    |
| Green確認結果（全テストPASS）                  | `outputs/phase-5/green-confirmation.md`    | Phase 5 成果物    |
| カバレッジ報告（全指標100%・ゲートPASS）       | `outputs/phase-7/coverage-report.md`       | Phase 7 成果物    |
| リファクタリング結果（変更なし・既に最適状態） | `outputs/phase-8/refactoring-result.md`    | Phase 8 成果物    |

---

## 実行手順

### ステップ1: 受入基準 AC-1〜AC-5 の最終照合

| AC番号 | 基準                                                        | 検証方法                 | 判定 |
| ------ | ----------------------------------------------------------- | ------------------------ | ---- |
| AC-1   | 設定画面に `AnalyticsDashboardPanel` が統合されていること   | UI確認 / テスト結果      | TBD  |
| AC-2   | オプトアウト状態の現在値（ON/OFF）が UI で確認できること    | UI確認 / テスト結果      | TBD  |
| AC-3   | 開発モードで dev-only 診断ブロックが表示されること          | UI確認 / テスト結果      | TBD  |
| AC-4   | Playwright E2E テストが PASS すること                       | Phase 9 テスト結果       | TBD  |
| AC-5   | `pnpm typecheck && pnpm lint && pnpm test` が PASS すること | Phase 9 品質チェック結果 | TBD  |

### ステップ2: コードレビュー観点チェック

| 観点                       | チェック内容                                                  | 判定 |
| -------------------------- | ------------------------------------------------------------- | ---- |
| 型安全性                   | `AnalyticsDashboardPanelProps` が必要最小限で定義されているか | TBD  |
| NODE_ENV 分岐の適切な実装  | `NODE_ENV !== 'production'` の分岐が正しく実装されているか    | TBD  |
| analyticsAdapter の利用    | `getQueueSize()` / `isOptedOut()` が直接使われているか        | TBD  |
| コンポーネント分離の適切性 | `AnalyticsDashboardPanel` 内で責務が過剰に分割されていないか  | TBD  |
| テストの意図明確性         | テスト名が「何を検証するか」を明示しているか                  | TBD  |
| アクセシビリティ           | パネルに適切な aria 属性が付与されているか                    | TBD  |

### ステップ3: PASS/FAIL 判定

| 判定          | 条件                                         | 戻り先                         |
| ------------- | -------------------------------------------- | ------------------------------ |
| PASS          | AC-1〜AC-5 が全て ✅、コードレビュー問題なし | Phase 11 へ進む                |
| MINOR         | 軽微な指摘（コメント追加、命名微修正など）   | Phase 11 継続・Phase 12 で解決 |
| MAJOR: 実装   | AC-1〜AC-3 のいずれかが ❌                   | Phase 5 へ戻る                 |
| MAJOR: テスト | AC-4〜AC-5 のいずれかが ❌                   | Phase 4/6 へ戻る               |
| MAJOR: 設計   | 設定画面統合の根本的問題                     | Phase 2 へ戻る                 |
| CRITICAL      | 要件の再定義が必要                           | Phase 1 へ戻る                 |

---

## MINOR 指摘の未タスク化ルール

MINOR 指摘は Phase 11〜12 で解決できる場合は追加タスクとして記録し、
解決不可能な場合は `docs/30-workflows/unassigned-task/` に正式な指示書として未タスク化する。

---

## 統合テスト連携

- 最終レビューで統合テスト結果（T4-01〜T4-08 の PASS）を確認
- AC-3 が「dev-only 診断ブロックの表示」として記録済みであることを確認

---

## サブタスク管理

| ID     | タスク名                   | ステータス |
| ------ | -------------------------- | ---------- |
| T-10-1 | 受入基準 AC-1〜AC-5 照合   | 未実施     |
| T-10-2 | コードレビュー観点チェック | 未実施     |
| T-10-3 | PASS/FAIL 判定             | 未実施     |
| T-10-4 | 最終レビュー結果記録       | 未実施     |

---

## 成果物

| 成果物           | 配置先                                    | 形式     |
| ---------------- | ----------------------------------------- | -------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md` | Markdown |
| AC 検証記録      | `outputs/phase-10/ac-verification.md`     | Markdown |

---

## 完了条件

- [ ] AC-1〜AC-5 が全て ✅ であること
- [ ] コードレビュー観点の全チェック項目が ✅ であること
- [ ] PASS/FAIL 判定が「PASS」であること
- [ ] `outputs/phase-10/final-review-result.md` に判定結果が記録されていること
- [ ] `outputs/phase-10/ac-verification.md` に AC-1〜AC-5 の証拠が記録されていること

---

## タスク100%実行確認【必須】

- [ ] T-10-1: AC-1〜AC-5 の照合を実行し `outputs/phase-10/ac-verification.md` に記録済み
- [ ] T-10-2: コードレビュー観点チェックを実行し結果を記録済み
- [ ] T-10-3: PASS/FAIL 判定を確定し `outputs/phase-10/final-review-result.md` に記録済み
- [ ] T-10-4: 最終レビュー結果サマリを記録済み

---

## 次Phase

**Phase 11: 手動テスト** — デスクトップアプリでの動作確認を行う。

**Phase 11 開始条件**: Phase 10 の判定が「PASS」であること。
**Phase 13 blocked 条件**: MAJOR 判定が残存している場合は PR 作成不可。
