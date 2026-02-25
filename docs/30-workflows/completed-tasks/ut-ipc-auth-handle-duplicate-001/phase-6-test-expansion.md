# Phase 6: テスト拡充

## メタ情報

| 項目       | 値                               |
| ---------- | -------------------------------- |
| Phase      | 6                                |
| タスクID   | UT-IPC-AUTH-HANDLE-DUPLICATE-001 |
| 機能名     | ut-ipc-auth-handle-duplicate-001 |
| 前提Phase  | Phase 5                          |
| 後続Phase  | Phase 7                          |
| ステータス | 未実施                           |
| 作成日     | 2026-02-25                       |

## 目的

回帰耐性を高めるため、失敗が起きやすい境界ケースを追加検証する。

## 実行タスク

- SubAgent-B: 失敗系と境界値ケースを追加する。
- SubAgent-C: 登録一元化コードの分岐網羅を補完する。
- Lead: テスト観点の漏れを棚卸ししてPhase 7へ渡す。

## 参照資料

| 参照資料                  | パス                                                                   | 内容           |
| ------------------------- | ---------------------------------------------------------------------- | -------------- |
| Phase 4                   | `phase-4-test-creation.md`                                             | 基本テスト仕様 |
| Phase 5                   | `phase-5-implementation.md`                                            | 実装差分       |
| 教訓集                    | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` | 再発観点       |
| regression-cases.md       | `outputs/phase-4/regression-cases.md`                                  | Phase 4 成果物 |
| spec-planned-artifacts.md | `outputs/phase-4/spec-planned-artifacts.md`                            | Phase 4 成果物 |
| test-commands.md          | `outputs/phase-4/test-commands.md`                                     | Phase 4 成果物 |
| test-specification.md     | `outputs/phase-4/test-specification.md`                                | Phase 4 成果物 |
| diff-summary.md           | `outputs/phase-5/diff-summary.md`                                      | Phase 5 成果物 |
| impact-analysis.md        | `outputs/phase-5/impact-analysis.md`                                   | Phase 5 成果物 |
| implementation-log.md     | `outputs/phase-5/implementation-log.md`                                | Phase 5 成果物 |
| spec-planned-artifacts.md | `outputs/phase-5/spec-planned-artifacts.md`                            | Phase 5 成果物 |

## 実行手順

1. 境界値ケースを追加する。
2. 異常系ケースを追加する。
3. 重複登録再発を検出する監査ケースを追加する。

## 統合テスト連携

| ケース           | 期待結果             |
| ---------------- | -------------------- |
| 登録順序変化     | 正常登録される       |
| 認証失敗ケース   | エラー契約が一致     |
| 再起動相当ケース | 登録重複が発生しない |

## 成果物

| 成果物           | パス                                       | 説明            |
| ---------------- | ------------------------------------------ | --------------- |
| 拡張テスト結果   | `outputs/phase-6/test-expansion-result.md` | 追加ケース結果  |
| 失敗系一覧       | `outputs/phase-6/failure-cases.md`         | 想定障害一覧    |
| 差分補完レポート | `outputs/phase-6/delta-report.md`          | Phase 4との差分 |

## 完了条件

- [ ] 境界値ケースが追加済み
- [ ] 異常系ケースが追加済み
- [ ] 再発検出ケースが追加済み
- [ ] 統合テスト連携ケースが更新済み
- [ ] 本Phase内の全タスクを100%実行完了
