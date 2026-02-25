# Phase 3: 設計レビューゲート

## メタ情報

| 項目       | 値                               |
| ---------- | -------------------------------- |
| Phase      | 3                                |
| タスクID   | UT-IPC-AUTH-HANDLE-DUPLICATE-001 |
| 機能名     | ut-ipc-auth-handle-duplicate-001 |
| 前提Phase  | Phase 2                          |
| 後続Phase  | Phase 4                          |
| ステータス | 未実施                           |
| 作成日     | 2026-02-25                       |

## 目的

実装前に設計妥当性を検証し、戻り先を明確にしたゲート判定を行う。

## 実行タスク

- Lead: レビュー観点（契約不変、影響範囲、テスト性）で判定する。
- SubAgent-A: 要件との一致を確認する。
- SubAgent-B: テスト戦略が設計を検証できることを確認する。

## 参照資料

| 参照資料                     | パス                                                                         | 内容           |
| ---------------------------- | ---------------------------------------------------------------------------- | -------------- |
| Phase 1                      | `phase-1-requirements.md`                                                    | 要件根拠       |
| Phase 2                      | `phase-2-design.md`                                                          | 設計根拠       |
| IPCセキュリティ              | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` | 登録ガード要件 |
| acceptance-criteria.md       | `outputs/phase-1/acceptance-criteria.md`                                     | Phase 1 成果物 |
| requirements-definition.md   | `outputs/phase-1/requirements-definition.md`                                 | Phase 1 成果物 |
| spec-planned-artifacts.md    | `outputs/phase-1/spec-planned-artifacts.md`                                  | Phase 1 成果物 |
| subagent-responsibilities.md | `outputs/phase-1/subagent-responsibilities.md`                               | Phase 1 成果物 |
| design-test-mapping.md       | `outputs/phase-2/design-test-mapping.md`                                     | Phase 2 成果物 |
| registration-design.md       | `outputs/phase-2/registration-design.md`                                     | Phase 2 成果物 |
| risk-analysis.md             | `outputs/phase-2/risk-analysis.md`                                           | Phase 2 成果物 |
| spec-planned-artifacts.md    | `outputs/phase-2/spec-planned-artifacts.md`                                  | Phase 2 成果物 |

## 実行手順

1. レビュー観点テーブルで採点する。
2. PASS/MINOR/MAJOR を判定して記録する。
3. MAJOR時の戻り先を明示して終了する。

## 統合テスト連携

| レビュー項目 | 判定基準                          |
| ------------ | --------------------------------- |
| 契約整合     | Preload公開契約が非変更           |
| 影響範囲     | AUTH以外のチャネルに副作用なし    |
| テスト連動   | Phase 4ケースで設計を再現検証可能 |

## 成果物

| 成果物       | パス                                      | 説明             |
| ------------ | ----------------------------------------- | ---------------- |
| レビュー結果 | `outputs/phase-3/design-review-result.md` | PASS/MINOR/MAJOR |
| 指摘一覧     | `outputs/phase-3/review-findings.md`      | 修正要求一覧     |

## 完了条件

- [ ] レビュー観点が全件判定済み
- [ ] 判定結果と根拠が記録済み
- [ ] 次Phaseへ進行条件が明確
- [ ] 統合テスト連携判定が記録済み
- [ ] 本Phase内の全タスクを100%実行完了
