# Phase 11: 手動テスト - タスク仕様書

## メタ情報

| 項目       | 内容                                                                                                                                                                                |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase      | 11                                                                                                                                                                                  |
| Phase名    | 手動テスト                                                                                                                                                                          |
| タスクID   | TASK-IMP-AI-RUNTIME-AUTHMODE-UNIFICATION-001                                                                                                                                        |
| 前提Phase  | Phase 1（要件定義）、Phase 2（設計）、Phase 5（実装）、Phase 6（テスト拡充）、Phase 7（カバレッジ確認）、Phase 8（リファクタリング）、Phase 9（品質検証）、Phase 10（最終レビュー） |
| 後続Phase  | Phase 12（ドキュメント）                                                                                                                                                            |
| ステータス | not_started                                                                                                                                                                         |
| 作成日     | 2026-03-13                                                                                                                                                                          |
| 機能名     | ai-runtime-authmode-foundation                                                                                                                                                      |

## 目的

全 AI surface の access matrix foundation の代表シナリオを手動で確認する。

## 実行タスク

- 代表状態確認: Settings の access card と terminal card が各 surface の想定と一致するか確認する
- 失敗系確認: missing API key、terminal unavailable の guidance を確認する

## テストケース

| テストケース | 目的                        | 期待結果                                                                                 |
| ------------ | --------------------------- | ---------------------------------------------------------------------------------------- |
| TC-11-00     | 設定画面3領域の統合レビュー | 認証方式カード / Claude Agent SDK APIキー / APIキー設定一覧の3領域で改善要求が判読できる |
| TC-11-01     | access card の反映確認      | integrated runtime / terminal surface / guidance-only の各状態が定義通りに見える         |
| TC-11-02     | 資格情報不足の確認          | missing API key の guidance が明記されている                                             |
| TC-11-03     | terminal unavailable の確認 | terminal card が unavailable と理由付きで表示される                                      |

## 画面カバレッジマトリクス

| テストケース | 対象画面                     | 状態                               | 証跡計画                                                |
| ------------ | ---------------------------- | ---------------------------------- | ------------------------------------------------------- |
| TC-11-00     | Settings / review board      | authmode + api key + provider list | screenshots/TC-11-00-settings-authmode-review-board.png |
| TC-11-01     | Settings / AI surface        | access card synced                 | TC-11-01-access-card-sync.png                           |
| TC-11-02     | AI surface                   | missing api key                    | TC-11-02-runtime-missing-api-key.png                    |
| TC-11-03     | Settings / terminal launcher | terminal unavailable               | TC-11-03-terminal-unavailable.png                       |

## 参照資料

| 参照資料                    | パス                                                      | 内容                                   |
| --------------------------- | --------------------------------------------------------- | -------------------------------------- |
| Phase 1（要件定義）         | `phase-1-requirements.md`                                 | 依存する前提成果物を確認する           |
| Phase 2（設計）             | `phase-2-design.md`                                       | 依存する前提成果物を確認する           |
| Phase 5（実装）             | `phase-5-implementation.md`                               | 依存する前提成果物を確認する           |
| Phase 6（テスト拡充）       | `phase-6-test-expansion.md`                               | 依存する前提成果物を確認する           |
| Phase 7（カバレッジ確認）   | `phase-7-coverage-check.md`                               | 依存する前提成果物を確認する           |
| Phase 8（リファクタリング） | `phase-8-refactoring.md`                                  | 依存する前提成果物を確認する           |
| Phase 9（品質検証）         | `phase-9-quality-assurance.md`                            | 依存する前提成果物を確認する           |
| Phase 10（最終レビュー）    | `phase-10-final-review.md`                                | 依存する前提成果物を確認する           |
| AuthModeService             | `apps/desktop/src/main/services/auth/AuthModeService.ts`  | legacy authMode の移行レイヤを確認する |
| SkillExecutor               | `apps/desktop/src/main/services/skill/SkillExecutor.ts`   | API キー直読みに依存する経路を確認する |
| AgentExecutor               | `apps/desktop/src/main/services/agent/AgentExecutor.ts`   | agent 実行の runtime 入口を確認する    |
| LLMAdapterFactory           | `apps/desktop/src/main/adapters/llm/LLMAdapterFactory.ts` | LLM adapter の認証解決点を確認する     |

### システム仕様（aiworkflow-requirements）

> 実装前に以下の正本仕様を確認し、既存設計との整合性を確保する。

| 参照資料                                        | パス                                                                                                   | 内容                                                               |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| interfaces-auth                                 | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`                                 | auth-mode 公開契約と error code 正本                               |
| api-ipc-system                                  | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                                  | AI_CHAT、auth key、selected config の IPC 正本                     |
| security-electron-ipc                           | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                           | sender 検証、secret masking、error envelope                        |
| ui-ux-settings                                  | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`                                  | access card / launcher / guidance の表示契約                       |
| workflow-apikey-chat-tool-integration-alignment | `.claude/skills/aiworkflow-requirements/references/workflow-apikey-chat-tool-integration-alignment.md` | integrated runtime の selected config と auth key ルール           |
| arch-state-management                           | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                           | access card / selected config / terminal availability state の正本 |

## 実行手順

### ステップ1: 参照資料を確認する

この Phase で使う code path、前提 Phase、system spec を確認し、全 AI surface の access matrix foundation の対象範囲を固定する。

### ステップ2: 実行タスクを上から順に実施する

手動テスト の実行タスクを上から順に処理し、順序を崩さずに成果物へ反映する。

### ステップ3: system spec との整合を確認する

aiworkflow-requirements の正本と照合し、契約、UI、security、state のズレを残さない。

### ステップ4: 成果物と完了条件を確認する

成果物パス、完了条件、次の Phase への handoff を確認して記録する。

## 統合テスト連携

capability resolver、launcher / guidance、IPC、cache invalidation の代表シナリオを手動で確認する。

## 成果物

| 成果物         | パス                                     | 内容                                  |
| -------------- | ---------------------------------------- | ------------------------------------- |
| 手動テスト結果 | `outputs/phase-11/manual-test-result.md` | 代表シナリオの結果を記録する          |
| 撮影計画       | `outputs/phase-11/screenshot-plan.json`  | 代表画面の撮影対象と TC-ID を整理する |

## 完了条件

- [ ] 設定画面3領域（認証方式カード・Claude Agent SDK APIキー・APIキー設定一覧）のレビュー証跡を含む4ケースが PASS している

## 次のPhase

- [Phase 12（ドキュメント）](./phase-12-documentation.md) に進む
