# Phase 4: テスト作成

## メタ情報

| 項目      | 値                                         |
| --------- | ------------------------------------------ |
| Phase     | 4                                          |
| Phase名   | テスト作成                                 |
| 機能名    | task-055-ui-00-foundation-reflection-audit |
| タスクID  | TASK-UI-00-FOUNDATION-REFLECTION-AUDIT     |
| 作成日    | 2026-03-05                                 |
| 前提Phase | Phase 3                                    |
| 後続Phase | Phase 5                                    |

## 目的

反映漏れを確実に検出できる監査テストケースと検証コマンドを作成し、Phase 5 の監査実行を再現可能にする。

## 実行タスク

- テストケース作成: 章単位、ファイル単位、リンク単位の監査ケースを作成する。
- Red条件定義: 反映漏れ、リンク切れ、判定未記入を失敗条件として定義する。
- 検証コマンド整備: `rg` ベースの確認コマンドと目視確認手順を固定する。

## 参照資料

| 参照資料             | パス                                                                                        | 内容             |
| -------------------- | ------------------------------------------------------------------------------------------- | ---------------- |
| Phase 1 要件定義     | `outputs/phase-1/requirements-definition.md`                                                | テスト観点の基準 |
| Phase 2 監査設計     | `outputs/phase-2/audit-matrix-design.md`                                                    | テスト構造の基準 |
| Phase 3 レビュー報告 | `outputs/phase-3/design-review-report.md`                                                   | 反映すべき指摘   |
| Phase 3 ゲート判定   | `outputs/phase-3/review-gate-decision.md`                                                   | テスト対象の確定 |
| 画面証跡手順         | `.claude/skills/task-specification-creator/references/screenshot-verification-procedure.md` | 証跡取得ルール   |
| 受け入れ基準         | `outputs/phase-1/acceptance-criteria.md`                                                    | Phase 1 成果物   |
| スコープ定義         | `outputs/phase-1/scope-definition.md`                                                       | Phase 1 成果物   |
| 証跡取得計画         | `outputs/phase-2/evidence-plan.md`                                                          | Phase 2 成果物   |
| SubAgent計画         | `outputs/phase-2/subagent-plan.md`                                                          | Phase 2 成果物   |

## システム仕様（aiworkflow-requirements）

| 参照資料               | パス                                                                              | このPhaseでの適用観点  |
| ---------------------- | --------------------------------------------------------------------------------- | ---------------------- |
| コンポーネントテスト   | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | テスト記録形式         |
| アクセシビリティテスト | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`      | ARIA/WCAG検証項目      |
| UI設計原則             | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`    | キーボード操作検証項目 |

## 統合テスト連携

| 連携観点       | 実施内容                                                   | 出力先                                        |
| -------------- | ---------------------------------------------------------- | --------------------------------------------- |
| ケース粒度     | 章単位/ファイル単位/リンク単位でテストケースIDを採番する。 | `outputs/phase-4/audit-test-cases.md`         |
| Red条件固定    | 反映漏れ、リンク切れ、判定未記入を失敗条件として固定する。 | `outputs/phase-4/red-check-plan.md`           |
| 実行自動化準備 | `rg` ベースの確認コマンドをケースIDに紐付ける。            | `outputs/phase-4/validation-command-sheet.md` |

## 実行順序（直列/並列）

| 作業             | 実行方式 | 理由                         |
| ---------------- | -------- | ---------------------------- |
| Red条件定義      | 直列     | 合否判定を先に固定するため   |
| テストケース作成 | 並列     | 章別ケースを独立に作れるため |
| コマンド整備     | 直列     | 実行順を統一するため         |

## SubAgent Team分担

| SubAgent           | 関心ごと         | 担当成果物                                    |
| ------------------ | ---------------- | --------------------------------------------- |
| SubAgent-TEST-CASE | ケース設計       | `outputs/phase-4/audit-test-cases.md`         |
| SubAgent-TEST-RED  | 失敗条件設計     | `outputs/phase-4/red-check-plan.md`           |
| SubAgent-TEST-CMD  | 検証コマンド設計 | `outputs/phase-4/validation-command-sheet.md` |

## 成果物

| 成果物           | パス                                          | 内容                 |
| ---------------- | --------------------------------------------- | -------------------- |
| 監査テストケース | `outputs/phase-4/audit-test-cases.md`         | ケース一覧           |
| Redチェック計画  | `outputs/phase-4/red-check-plan.md`           | 失敗条件             |
| 検証コマンド表   | `outputs/phase-4/validation-command-sheet.md` | 実行コマンドと期待値 |

## 完了条件

- [x] 監査テストケースがID付きで定義されている。
- [x] Red条件がケースへ紐付いている。
- [x] 検証コマンドが実行順で定義されている。
- [x] 目視確認項目が明記されている。
- [x] 本Phase内の全タスクを100%実行完了。

## サブタスク管理

1. 指摘事項をテストケースへ変換する。
2. SubAgentごとにケースを作成する。
3. コマンドとケースIDを対応付ける。

## タスク100%実行確認【必須】

- [x] 実行タスクの全項目を完了した。
- [x] 完了条件の全チェック項目を確認した。
- [x] Phase 5 実行順を確定した。

## 依存関係

- 前提: Phase 3
- 後続: Phase 5

## 次のPhase

- Phase 5: 実装
