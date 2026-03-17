# main-chat-settings-runtime-sync - タスク実行仕様書

## ユーザーからの元の指示

```text
AI 機能を `Integrated API Runtime` と `ユーザー操作の Claude Code terminal surface` に分離し、すべての AI surface で切替・handoff・UI/UX・実行順序が分かるタスク仕様書を task-specification-creator と aiworkflow-requirements に従って整備する。実装は行わない。
```

## メタ情報

| 項目         | 内容                                                            |
| ------------ | --------------------------------------------------------------- |
| タスクID     | TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001                      |
| タスク名     | main-chat-settings-runtime-sync                                 |
| 分類         | 設計                                                            |
| 対象機能     | Main Chat / Settings / Selector / System Prompt の runtime 同期 |
| 優先度       | 高                                                              |
| 見積もり規模 | 中規模                                                          |
| ステータス   | spec_created                                                    |
| 作成日       | 2026-03-13                                                      |

> ステータス解釈:
> `artifacts.json` の `specs_completed` は「Phase 1-13 の仕様書と成果物定義を生成済み」を示す。
> 各 `phase-*.md` の `not_started` は「実装/実行フェーズは未着手」を示し、意味を分離して管理する。

## タスク概要

### 目的

ChatView、LLMSelectorPanel、SystemPromptPanel、SettingsView、AuthModeSelector、AuthKeySection、ApiKeysSection が `Integrated API Runtime` と `Claude Code terminal surface` を同じ Main authority で扱えるようにし、legacy `authMode` を access capability へ移行する。

### 背景

現状の Main Chat 系 surface は `AI_CHAT`、`llm:set-selected-config`、system prompt 永続化、`AI_CHECK_CONNECTION`、Settings 内の RAG 状態、AuthMode / API key 保存状態が別々に存在している。さらに設定モデルも `subscription/api-key` の排他的 toggle を前提にしており、manual terminal と integrated runtime の実体差を表現できていない。実装前に `access card + launcher + guidance` の同期境界を仕様で固定する必要がある。

### 最終ゴール

Main Chat と Settings の間で provider / model / integrated runtime / terminal capability / system prompt / API key 保存状態 / health / RAG 状態の handoff が一貫する設計を確定する。

### 追加UI改善要求（2026-03-13 設定画面レビュー反映）

添付レビュー（赤枠）で示された設定画面の 3 ブロックを、Task06 の必須改善対象として固定する。

1. 認証方式カード（`Claude Agent SDK 認証方式`）:
   `サブスクリプション` / `APIキー` の選択状態と access capability 表示を矛盾なく同期し、状態語彙を `ready / blocked / unavailable` に統一する。
2. Claude Agent SDK APIキーセクション:
   APIキー入力、保存、削除の結果表示を capability card と同一の guidance 文言で同期し、成功・失敗の責務境界を明示する。
3. APIキー設定一覧:
   Provider 行ごとの `未登録/登録` 表示を上位の認証方式・access card と整合させ、`どのキーが不足しているか` を1画面で判読可能にする。

### 成果物一覧

| 種別               | 成果物                                                                                                                                                                                                                                                      | 配置先                                                                                                                         |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| 仕様書             | index.md / phase-1〜13 / artifacts.json                                                                                                                                                                                                                     | `docs/30-workflows/ai-runtime-authmode-unification/tasks/step-03-par-task-06-main-chat-settings-runtime-sync`                  |
| 設計成果物         | outputs/phase-_/_.md                                                                                                                                                                                                                                        | `docs/30-workflows/ai-runtime-authmode-unification/tasks/step-03-par-task-06-main-chat-settings-runtime-sync/outputs/phase-*/` |
| system spec 同期先 | interfaces-auth.md / api-ipc-system.md / interfaces-llm.md / ui-ux-llm-selector.md / ui-ux-system-prompt.md / ui-ux-settings.md / ui-ux-feature-components.md / arch-state-management.md / security-electron-ipc.md / task-workflow.md / lessons-learned.md | `/.claude/skills/aiworkflow-requirements/references/`                                                                          |

## 参照ファイル

| 参照資料                             | パス                                                                                                     | 内容                                                                              |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| pack parent index                    | `docs/30-workflows/ai-runtime-authmode-unification/index.md`                                             | 実行順序、依存グラフ、共通方針の正本を確認する                                    |
| pack design audit                    | `docs/30-workflows/ai-runtime-authmode-unification/design-audit-matrix.md`                               | 多角的監査の結論、禁止事項、依存整合を確認する                                    |
| pack UI/UX 図解                      | `docs/30-workflows/ai-runtime-authmode-unification/ui-ux-diagrams.md`                                    | 5図セットの画面構成、状態遷移、CTA 導線を確認する                                 |
| pack UI/UX 正本                      | `docs/30-workflows/ai-runtime-authmode-unification/ui-ux-realization.md`                                 | 全 surface 共通の状態、CTA、microcopy 契約を確認する                              |
| Task01 foundation investigation      | `docs/30-workflows/TASK-FIX-SKILL-DOCS-SPEC-FOUNDATION/task-05-phase-1-3-source-investigation-report.md` | access matrix / resolver / fail-fast / terminal boundary の現行調査結果を継承する |
| Task01 settings review investigation | `docs/30-workflows/TASK-FIX-SKILL-DOCS-SPEC-FOUNDATION/task-05-phase-1-3-source-investigation-report.md` | 設定画面レビュー結果（TC-11-00 相当）を設計へ反映する                             |
| ChatView                             | `apps/desktop/src/renderer/views/ChatView/index.tsx`                                                     | main chat の UI と state 利用点を確認する                                         |
| chatSlice                            | `apps/desktop/src/renderer/store/slices/chatSlice.ts`                                                    | `AI_CHAT` 送信経路と selected config handoff を確認する                           |
| llmSlice                             | `apps/desktop/src/renderer/store/slices/llmSlice.ts`                                                     | provider / model の選択と Main 同期を確認する                                     |
| LLMSelectorPanel                     | `apps/desktop/src/renderer/components/llm/LLMSelectorPanel.tsx`                                          | selector UI と health check の現状を確認する                                      |
| systemPromptTemplateSlice            | `apps/desktop/src/renderer/store/slices/systemPromptTemplateSlice.ts`                                    | template 永続化と current prompt handoff を確認する                               |
| systemPromptHandlers                 | `apps/desktop/src/main/ipc/systemPromptHandlers.ts`                                                      | prompt template の Main 側 authority を確認する                                   |
| aiHandlers                           | `apps/desktop/src/main/ipc/aiHandlers.ts`                                                                | `AI_CHAT` / `AI_CHECK_CONNECTION` の current path を確認する                      |
| llm handlers                         | `apps/desktop/src/main/handlers/llm.ts`                                                                  | `llm:set-selected-config` / health / streaming の authority を確認する            |
| llmConfigProvider                    | `apps/desktop/src/main/ipc/llmConfigProvider.ts`                                                         | selected config の in-memory default を確認する                                   |
| SettingsView                         | `apps/desktop/src/renderer/views/SettingsView/index.tsx`                                                 | access capability / API key / RAG 表示の現状を確認する                            |
| AuthModeSelector                     | `apps/desktop/src/renderer/components/settings/AuthModeSelector/index.tsx`                               | legacy access capability 切替 UI と migration 影響を確認する                      |
| AuthKeySection                       | `apps/desktop/src/renderer/components/settings/AuthKeySection/index.tsx`                                 | Anthropic auth key 保存状態の UI 契約を確認する                                   |
| ApiKeysSection                       | `apps/desktop/src/renderer/components/organisms/ApiKeysSection/index.tsx`                                | provider ごとの API key 保存状態と表示契約を確認する                              |
| authKeyHandlers                      | `apps/desktop/src/main/ipc/authKeyHandlers.ts`                                                           | auth key 保存 / 削除 / validate IPC の authority を確認する                       |
| apiKeyHandlers                       | `apps/desktop/src/main/ipc/apiKeyHandlers.ts`                                                            | provider API key 保存 / 一覧 / 削除 IPC の authority を確認する                   |

## タスク分解サマリー

| ID   | フェーズ   | サブタスク名     | 責務                                                                  | 依存 |
| ---- | ---------- | ---------------- | --------------------------------------------------------------------- | ---- |
| T-01 | Phase 1    | 要件整理         | Main Chat / Settings の current routing と state gap を整理する       | -    |
| T-02 | Phase 2    | 設計確定         | selected config / prompt / health / RAG state の authority を設計する | T-01 |
| T-03 | Phase 3    | レビューゲート   | Main authority と UI state の矛盾がないか判定する                     | T-02 |
| T-04 | Phase 4-7  | テスト仕様化     | selector / prompt / health / settings 反映のテスト仕様を定義する      | T-03 |
| T-05 | Phase 8-13 | 文書化と handoff | spec sync と rollout 順序を整理する                                   | T-04 |

## 実行フロー

1. Phase 1-3 で current state、authority、レビューゲートを固める。
2. Phase 4-7 で selector / prompt / settings / health の回帰テスト仕様を固める。
3. Phase 8-13 で実装順序、spec sync、handoff を固める。

## Phase一覧

| Phase | 名称             | 仕様書                                                         | ステータス  |
| ----- | ---------------- | -------------------------------------------------------------- | ----------- |
| 1     | 要件定義         | [phase-1-requirements.md](./phase-1-requirements.md)           | not_started |
| 2     | 設計             | [phase-2-design.md](./phase-2-design.md)                       | not_started |
| 3     | 設計レビュー     | [phase-3-design-review.md](./phase-3-design-review.md)         | not_started |
| 4     | テスト作成       | [phase-4-test-creation.md](./phase-4-test-creation.md)         | not_started |
| 5     | 実装             | [phase-5-implementation.md](./phase-5-implementation.md)       | not_started |
| 6     | テスト拡充       | [phase-6-test-expansion.md](./phase-6-test-expansion.md)       | not_started |
| 7     | カバレッジ確認   | [phase-7-coverage-check.md](./phase-7-coverage-check.md)       | not_started |
| 8     | リファクタリング | [phase-8-refactoring.md](./phase-8-refactoring.md)             | not_started |
| 9     | 品質検証         | [phase-9-quality-assurance.md](./phase-9-quality-assurance.md) | not_started |
| 10    | 最終レビュー     | [phase-10-final-review.md](./phase-10-final-review.md)         | not_started |
| 11    | 手動テスト       | [phase-11-manual-test.md](./phase-11-manual-test.md)           | not_started |
| 12    | ドキュメント     | [phase-12-documentation.md](./phase-12-documentation.md)       | not_started |
| 13    | PR作成           | [phase-13-pr-creation.md](./phase-13-pr-creation.md)           | not_started |

## 統合テスト連携（Phase 1〜11で必須）

- integrated runtime、terminal capability、selected config、system prompt、health / RAG state の接続点を各 Phase で必ず扱う。
- 本タスクでは `AI_CHAT`、`AI_CHECK_CONNECTION`、`llm:set-selected-config`、systemPromptAPI、Settings access card、terminal launcher を統合テスト観点の中心に置く。

## Phase完了時の必須アクション

- 本Phase内の全タスクを100%実行完了と記録する。
- 成果物パスと完了条件を確認する。
- artifacts.json を更新対象として扱う。
