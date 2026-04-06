# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                                               |
| ---------- | ------------------------------------------------------------------ |
| Phase      | 1                                                                  |
| 機能名     | UT-TASK-SPEC-TEMPLATE-IMPROVEMENT-001                              |
| タスク名   | task-specification-creator テンプレートの validator 必須見出し強化 |
| 前提Phase  | -                                                                  |
| 後続Phase  | Phase 2                                                            |
| 作成日     | 2026-04-06                                                         |
| ステータス | 完了                                                               |

## 目的

`validate-phase12-implementation-guide.js` の `extractSection()` の構造的検査漏れと `documentation-changelog-template.md` の必須フィールド欠落という 2 点の問題を分析し、修正要件を確定する。

## 背景

TASK-P0-01 Phase 12 skill-feedback-report 実行時に以下の問題が発見された:

1. `extractSection()` 関数が `## Part 2` から次の `## Part` 系見出しまでしか切り出さない前提になっておらず、Part 2 内の内部 `##` セクションの後ろにある `### 使用例` を見落とす可能性がある。
2. `documentation-changelog-template.md` に `変更者` / `関連 Issue / PR` / `validator 実行結果` / `current / baseline` / `artifacts 同期結果` の必須フィールドが存在しない。

## 実行タスク

### タスク1: 現状分析

**目的**: 問題の根本原因を理解し修正範囲を確定する

**実行手順**:

1. `validate-phase12-implementation-guide.js` の `extractSection()` 関数の動作を分析する
2. `buildChecks()` 内の `part2_usage_example` チェックロジックを確認する
3. `implementation-guide-template.md` の `## Part 2` 配下の構造を確認する
4. `documentation-changelog-template.md` のメタ情報テーブルの現状を確認する
5. 既存テストファイルの有無と内容を確認する

**期待される成果物**:

- `outputs/phase-1/requirements-definition.md`

---

### タスク2: 修正要件の確定

**目的**: 修正範囲と受け入れ基準を矛盾なく固定する

**実行手順**:

1. アプローチ A（validator 側で `### 使用例` を全文検索する）とアプローチ B（`extractSection` を Part 見出し単位で切り出す）を評価する
2. changelog テンプレートへの 5 フィールド追加要件を定義する
3. テスト追加要件を定義する（正常系・異常系）
4. 受け入れ基準を検証可能な形式で記述する

**期待される成果物**:

- `outputs/phase-1/acceptance-criteria.md`
- `outputs/phase-1/requirements-definition.md`（更新）

---

## 参照資料

| 参照資料                    | パス                                                                                                       | 用途                   |
| --------------------------- | ---------------------------------------------------------------------------------------------------------- | ---------------------- |
| validator スクリプト        | `.claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js`               | 問題の根本原因分析     |
| 実装ガイドテンプレート      | `.claude/skills/task-specification-creator/assets/implementation-guide-template.md`                        | Part 2 構造確認        |
| changelog テンプレート      | `.claude/skills/task-specification-creator/assets/documentation-changelog-template.md`                     | 必須フィールド欠落確認 |
| Phase 12 ドキュメントガイド | `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md`                     | 必須セクション定義     |
| Phase 12 完了チェックリスト | `.claude/skills/task-specification-creator/references/phase-12-completion-checklist.md`                    | 品質基準確認           |
| 既存テストファイル          | `.claude/skills/task-specification-creator/scripts/__tests__/validate-phase12-implementation-guide.test.*` | 現状テスト確認         |

## 統合テスト連携

- `### 使用例` 見出し検査のテストシナリオ（Part 2 内の内部 `##` セクションあり/なし）を Phase 1 で事前定義する
- changelog テンプレートの必須フィールド検証シナリオを定義する
- validator の入出力インターフェースを要件に記録する

## 成果物

| 成果物       | パス                                         | 内容                     |
| ------------ | -------------------------------------------- | ------------------------ |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | 機能要件・非機能要件一覧 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | 検証可能な AC 一覧       |

## 完了条件

- [ ] `extractSection()` の切り出し範囲を Part 見出し単位として正確に把握している
- [ ] 修正アプローチ（A または B）の選択根拠が明確になっている
- [ ] changelog テンプレートに追加すべき 5 フィールドが確定している
- [ ] テスト追加要件が検証可能な形で記述されている
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## タスク 100% 実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 2: 設計
