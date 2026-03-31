# TASK-TRACE-SKILL-AUTH-001 - タスク実行仕様書

## メタ情報

| 項目       | 値                                            |
| ---------- | --------------------------------------------- |
| タスクID   | TASK-TRACE-SKILL-AUTH-001                     |
| 機能名     | スキル生成→auth:login呼び出し経路の調査・修正 |
| 作成日     | 2026-04-01                                    |
| 優先度     | high                                          |
| 複雑度     | medium                                        |
| ステータス | 未実施                                        |
| 総Phase数  | 13                                            |
| 依存タスク | なし（TASK-FIX-AUTH-IPC-001と並列実行可能）   |

---

## 背景

スキル生成ボタン押下時に `auth:login` IPC タイムアウトが発生している。
30種の思考法による調査で以下が判明している:

- スキル生成フロー（handlePrepare → planSkill → RuntimePolicyResolver）は `login()` を直接呼ばない
- `auth:login` の呼び出し元は `AccountSection` と `AuthView` のみと確認されているが、スキル生成時にも発生している
- 4つの仮説（SkillLifecyclePanel / agentSlice / authModeSlice / 未発見コンポーネント）を全て検証済み
- 未発見の呼び出し経路が存在する可能性が高い

このタスクは実際のスタックトレースを取得して呼び出し経路を特定し、不要な `auth:login` 呼び出しを除去することを目的とする。

---

## 特記事項

このタスクは**調査フェーズ（Phase 1-3）**と**修正フェーズ（Phase 4-10）**に明確に分かれる。
調査結果によっては修正内容が変わる可能性があるため、**Phase 3 でユーザー承認を得ること**。

---

## Phase一覧

| Phase | 名称               | 仕様書                                                       | ステータス |
| ----- | ------------------ | ------------------------------------------------------------ | ---------- |
| 1     | 調査要件定義       | [phase-1-requirements.md](phase-1-requirements.md)           | 未実施     |
| 2     | 調査設計           | [phase-2-design.md](phase-2-design.md)                       | 未実施     |
| 3     | 設計レビューゲート | [phase-3-design-review.md](phase-3-design-review.md)         | 未実施     |
| 4     | テスト仕様作成     | [phase-4-test-creation.md](phase-4-test-creation.md)         | 未実施     |
| 5     | 調査実行+修正      | [phase-5-implementation.md](phase-5-implementation.md)       | 未実施     |
| 6     | テスト拡充         | [phase-6-test-expansion.md](phase-6-test-expansion.md)       | 未実施     |
| 7     | カバレッジ確認     | [phase-7-coverage-check.md](phase-7-coverage-check.md)       | 未実施     |
| 8     | リファクタリング   | [phase-8-refactoring.md](phase-8-refactoring.md)             | 未実施     |
| 9     | 品質保証           | [phase-9-quality-assurance.md](phase-9-quality-assurance.md) | 未実施     |
| 10    | 最終レビューゲート | [phase-10-final-review.md](phase-10-final-review.md)         | 未実施     |
| 11    | 手動テスト検証     | [phase-11-manual-test.md](phase-11-manual-test.md)           | 未実施     |
| 12    | ドキュメント更新   | [phase-12-documentation.md](phase-12-documentation.md)       | 未実施     |
| 13    | PR作成             | [phase-13-pr-creation.md](phase-13-pr-creation.md)           | 未実施     |

---

## 実行フロー

```
Phase 1 (調査要件) → Phase 2 (調査設計) → Phase 3 (Gate: ユーザー承認) → Phase 4 (テスト仕様)
                                                    ↓
                                           (MAJOR→戻り / 承認待ち)
                                                    ↓
Phase 5 (調査実行+修正) → Phase 6 → Phase 7 → Phase 8 → Phase 9 → Phase 10 (Gate)
                                                                         ↓
                                                                    (MAJOR→戻り)
                                                                         ↓
                                                    Phase 11 → Phase 12 → Phase 13 → 完了
```

---

## 調査対象候補

| 候補                                                             | 概要                              |
| ---------------------------------------------------------------- | --------------------------------- |
| `apps/desktop/src/renderer/store/slices/agentSlice.ts`           | 完全実装確認（login呼び出し検索） |
| `apps/desktop/src/renderer/utils/skillExecutionAuthPreflight.ts` | auth preflight ロジック           |
| スキル生成 → terminal_handoff 受信後の Renderer 側処理           | useEffect 連鎖トリガー            |
| `authModeSlice` 内の副作用                                       | dispatch パターンの検索           |

---

## Phase完了時の必須アクション

1. **タスク100%実行**: Phase内で指定された全タスクを完全に実行
2. **成果物確認**: 全ての必須成果物が生成されていることを検証
3. **artifacts.json更新**: Phase完了ステータスを更新
4. **完了条件チェック**: 各タスクを完遂した旨を必ず明記

---

## 成果物

| Phase | 主要成果物                                               |
| ----- | -------------------------------------------------------- |
| 1     | requirements-definition.md, investigation-scope.md       |
| 2     | debug-procedure.md, stacktrace-method.md                 |
| 3     | gate-decision.md, design-review-result.md                |
| 4     | test-specification.md, red-test-result.md                |
| 5     | stacktrace-evidence.md, changed-files.md, fix-summary.md |
| 6     | expanded-test-cases.md, regression-test-result.md        |
| 7     | coverage-plan.md                                         |
| 8     | refactoring-plan.md                                      |
| 9     | quality-report.md, risk-register.md                      |
| 10    | final-review-result.md, gate-decision.md                 |
| 11    | manual-test-result.md                                    |
| 12    | documentation-changelog.md, lessons-learned.md           |
| 13    | -                                                        |

---

_このファイルは手動作成されました。_
_最終更新: 2026-04-01_
