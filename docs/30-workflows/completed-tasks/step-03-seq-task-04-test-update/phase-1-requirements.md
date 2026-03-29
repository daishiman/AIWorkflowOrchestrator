# Phase 1: 要件定義

## メタ情報

| 項目   | 値                         |
| ------ | -------------------------- |
| Phase  | 1                          |
| 機能名 | task-llm-mod-04-audit-sync |
| 作成日 | 2026-03-29                 |

## 目的

`TASK-LLM-MOD-04` の current facts を固定し、この workflow の責務を「実装追加」から「監査・証跡同期」へ再定義する。

## 実行タスク

- 既存コード調査: 実ファイル位置と正本を確定する
- 既存テスト調査: R-01〜R-05 相当の痕跡を確認する
- system spec 照合: `aiworkflow-requirements` と `task-specification-creator` の完了記録を確認する
- stale spec 抽出: 旧パス、旧フェーズ名、旧作業前提を列挙する

## 要件

| ID   | 要件                                                                                                |
| ---- | --------------------------------------------------------------------------------------------------- |
| R-01 | provider/model 正本が `packages/shared/src/types/llm/schemas/provider-registry.ts` であると明記する |
| R-02 | `llm.test.ts` に `o3` / `o4-mini` の検証が既存で存在すると記録する                                  |
| R-03 | `AnthropicAdapter.test.ts` に `claude-haiku-4-5` health check 検証があると記録する                  |
| R-04 | `GoogleAdapter.test.ts` に `system_instruction` 関連ケースが既存で存在すると記録する                |
| R-05 | この workflow はコード追加を要求しない P50検証タスクであると明記する                                |
| R-06 | Phase 11 / 12 / artifacts の不足成果物を補完する                                                    |
| R-07 | PR 作成・コミット・push は実施しない                                                                |

## 非機能要件

- NFR-01: 旧パス `apps/desktop/src/main/handlers/llm/providers.ts` を参照しない
- NFR-02: 旧 workflow root `docs/30-workflows/llm-provider-model-modernization/tasks/...` への成果物パスを残さない
- NFR-03: Phase 11 は NON_VISUAL 監査として記録する
- NFR-04: Phase 12 は outputs を実ファイルとして揃える

## 参照資料

| 資料                   | パス                                                         | 説明                  |
| ---------------------- | ------------------------------------------------------------ | --------------------- |
| provider registry 正本 | `packages/shared/src/types/llm/schemas/provider-registry.ts` | provider/model SSoT   |
| main handler           | `apps/desktop/src/main/handlers/llm.ts`                      | shared 正本参照の実装 |
| system spec log        | `.claude/skills/aiworkflow-requirements/LOGS.md`             | 2026-03-24 完了同期   |
| skill log              | `.claude/skills/task-specification-creator/LOGS.md`          | P50 close-out 記録    |

## 統合テスト連携

本 Phase ではテスト追加を行わず、既存テストと system spec の整合を確認対象とする。

## 成果物

| 成果物   | パス                      | 説明                       |
| -------- | ------------------------- | -------------------------- |
| 要件定義 | `phase-1-requirements.md` | current facts と要件の固定 |

## 完了条件

- [x] R-01〜R-07 を定義した
- [x] stale spec の主因を「旧実装前提」と特定した
- [x] 本 workflow の責務を P50検証へ再定義した
- [x] **本Phase内の全タスクを100%実行完了**
