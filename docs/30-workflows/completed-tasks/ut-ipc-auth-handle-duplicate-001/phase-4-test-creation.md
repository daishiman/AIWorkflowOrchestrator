# Phase 4: テスト作成

## メタ情報

| 項目       | 値                               |
| ---------- | -------------------------------- |
| Phase      | 4                                |
| タスクID   | UT-IPC-AUTH-HANDLE-DUPLICATE-001 |
| 機能名     | ut-ipc-auth-handle-duplicate-001 |
| 前提Phase  | Phase 3                          |
| 後続Phase  | Phase 5                          |
| ステータス | 未実施                           |
| 作成日     | 2026-02-25                       |

## 目的

登録一元化後の互換性を保証する回帰テストを先に定義する。

## 実行タスク

- SubAgent-B: AUTH IPC主要シナリオの回帰テストケースを作成する。
- SubAgent-C: 登録一元化に固有の失敗系ケースを定義する。
- Lead: カバレッジ対象を明確化しPhase 5へ引き渡す。

## 参照資料

| 参照資料                     | パス                                                                              | 内容           |
| ---------------------------- | --------------------------------------------------------------------------------- | -------------- |
| Phase 1                      | `phase-1-requirements.md`                                                         | 受入基準       |
| Phase 2                      | `phase-2-design.md`                                                               | 実装方式       |
| Phase 3                      | `phase-3-design-review.md`                                                        | ゲート判定     |
| テスト指針                   | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | テストパターン |
| acceptance-criteria.md       | `outputs/phase-1/acceptance-criteria.md`                                          | Phase 1 成果物 |
| requirements-definition.md   | `outputs/phase-1/requirements-definition.md`                                      | Phase 1 成果物 |
| spec-planned-artifacts.md    | `outputs/phase-1/spec-planned-artifacts.md`                                       | Phase 1 成果物 |
| subagent-responsibilities.md | `outputs/phase-1/subagent-responsibilities.md`                                    | Phase 1 成果物 |
| design-test-mapping.md       | `outputs/phase-2/design-test-mapping.md`                                          | Phase 2 成果物 |
| registration-design.md       | `outputs/phase-2/registration-design.md`                                          | Phase 2 成果物 |
| risk-analysis.md             | `outputs/phase-2/risk-analysis.md`                                                | Phase 2 成果物 |
| spec-planned-artifacts.md    | `outputs/phase-2/spec-planned-artifacts.md`                                       | Phase 2 成果物 |
| design-review-result.md      | `outputs/phase-3/design-review-result.md`                                         | Phase 3 成果物 |
| review-findings.md           | `outputs/phase-3/review-findings.md`                                              | Phase 3 成果物 |
| spec-planned-artifacts.md    | `outputs/phase-3/spec-planned-artifacts.md`                                       | Phase 3 成果物 |

## 実行手順

1. 正常系・異常系・境界値のケースを作成する。
2. 既存挙動固定のアサーションを定義する。
3. 一元化方式でのみ失敗するケースを追加する。

## 統合テスト連携

| カテゴリ   | 検証内容                         |
| ---------- | -------------------------------- |
| IPC契約    | 引数/戻り値の後方互換性          |
| 認証エラー | 既存エラーコードとメッセージ整合 |
| 起動時登録 | 重複登録や欠落登録が発生しない   |

## 成果物

| 成果物         | パス                                    | 説明         |
| -------------- | --------------------------------------- | ------------ |
| テスト仕様     | `outputs/phase-4/test-specification.md` | ケース設計   |
| テストコマンド | `outputs/phase-4/test-commands.md`      | 検証手順     |
| 回帰ケース一覧 | `outputs/phase-4/regression-cases.md`   | 期待結果一覧 |

## 完了条件

- [ ] 回帰ケースが正常系/異常系/境界値を含む
- [ ] 既存契約固定のアサーションが明記されている
- [ ] Phase 5で実装判定に使えるテスト観点が定義済み
- [ ] 統合テスト連携ケースが定義済み
- [ ] 本Phase内の全タスクを100%実行完了
