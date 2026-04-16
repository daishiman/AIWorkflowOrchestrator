# UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001: resolveExternalIntegration 複数ツール並列統合対応

## メタ情報

| 項目         | 内容                                                                     |
| ------------ | ------------------------------------------------------------------------ |
| タスクID     | UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001                                 |
| タスク名     | resolveExternalIntegration 複数ツール並列統合対応                        |
| 種別         | unassigned-task / improvement                                            |
| 優先度       | low                                                                      |
| スケール     | medium                                                                   |
| 依存タスク   | UT-SKILL-WIZARD-MSO-MAIN-TOOL-UI-001（完了済み・Issue #2071 CLOSED）     |
| 発見元       | Phase 12（skill-wizard-multi-select-options M-01 TODO として登録）       |
| GitHub Issue | [#2069](https://github.com/daishiman/AIWorkflowOrchestrator/issues/2069) |
| 作成日       | 2026-04-15                                                               |
| ステータス   | phase12_completed（Phase 13 blocked）                                    |
| タスク分類   | NON_VISUAL（Renderer 内部ロジック変更のみ）                              |
| Phase 13     | blocked（コミット・PR は未実施）                                         |

## 概要

スキルウィザード Q5（外部ツール選択）で複数ツールが選ばれたときに、
`resolveExternalIntegration` が全選択ツールを集約できるように renderer-local helper を整理した。
あわせて、前提タスク `UT-SKILL-WIZARD-MSO-MAIN-TOOL-UI-001` で導入された暫定バッジを削除し、
Phase 12 の必須6成果物、workflow root、artifacts parity、task-workflow completed ledger を同期した。

## current facts

- `apps/desktop/src/renderer/components/skill/fetchToolIntegrationInfo.ts` を追加し、Slack / GitHub / Notion の統合情報取得を独立化
- `SkillCreateWizard.tsx` の `resolveExternalIntegration()` は `string[]` を受け取り、`Promise.all` と `mergeIntegrations()` で複数ツールを統合
- `ConversationRoundStep.tsx` から主ツールバッジ関連コードを削除
- `ConversationRoundStep.test.tsx` から主ツールバッジ関連テストを削除し、`resolveExternalIntegration.test.ts` を追加
- Phase 12 close-out では、`answers.q5.selectedOptions` が Step 0 直後に空になり得るため、`smartDefaults.tool` を fallback 候補として外部連携状態を維持する renderer-local ルールを明記
- shared interface / backend / IPC 契約への昇格は不要であり、`packages/shared/` 変更は N/A

## 対象ファイル

| ファイル                                                                                     | 操作 | 説明                                                                    |
| -------------------------------------------------------------------------------------------- | ---- | ----------------------------------------------------------------------- |
| `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                           | 変更 | `resolveExternalIntegration` シグネチャ変更・複数ツール並列処理ロジック |
| `apps/desktop/src/renderer/components/skill/fetchToolIntegrationInfo.ts`                     | 追加 | 外部ツール統合情報取得 helper                                           |
| `apps/desktop/src/renderer/components/skill/__tests__/resolveExternalIntegration.test.ts`    | 追加 | 複数ツール統合ロジックのユニットテスト                                  |
| `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`                | 変更 | 暫定バッジ削除                                                          |
| `apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx` | 変更 | バッジ関連テスト削除・回帰維持                                          |

## スコープ

### 含む

- `resolveExternalIntegration` の `string[]` 対応
- 複数ツール情報の並列取得と統合
- `fetchToolIntegrationInfo.ts` への helper 分離
- `smartDefaults.tool` fallback を含む renderer-local close-out ルールの明文化
- 暫定バッジ関連コードの削除
- Phase 12 必須6成果物の完成
- root `artifacts.json` と `outputs/artifacts.json` の parity
- aiworkflow-requirements の completed ledger 追記

### 含まない

- shared interface 変更
- backend 変更
- Phase 13 のコミット / PR 作成

## 受入基準

| ID   | 受入基準                                                                            | 状態 |
| ---- | ----------------------------------------------------------------------------------- | ---- |
| AC-1 | `resolveExternalIntegration` が `string[]` を受け取り、複数ツールを並列で処理できる | 完了 |
| AC-2 | 各ツールの統合情報が取得・マージされる                                              | 完了 |
| AC-3 | 単一ツール選択時の後方互換性を維持する                                              | 完了 |
| AC-4 | 空配列・未対応ツール・一部失敗時に安全にフォールバックする                          | 完了 |
| AC-5 | 呼び出し箇所が複数ツール配列を渡す                                                  | 完了 |
| AC-6 | `resolveExternalIntegration` のテストカバレッジ方針が Phase 7 まで閉じられている    | 完了 |
| AC-7 | M-01 TODO コメントと暫定バッジ関連コードが削除されている                            | 完了 |

## Phase 状態

| Phase | 名前           | 状態      |
| ----- | -------------- | --------- |
| 1     | 要件定義       | completed |
| 2     | 設計           | completed |
| 3     | 設計レビュー   | completed |
| 4     | テスト作成     | completed |
| 5     | 実装           | completed |
| 6     | テスト拡充     | completed |
| 7     | カバレッジ確認 | completed |
| 8     | リファクタ     | completed |
| 9     | 品質保証       | completed |
| 10    | 最終レビュー   | completed |
| 11    | 手動テスト     | completed |
| 12    | ドキュメント   | completed |
| 13    | PR作成         | blocked   |

## 関連

- 発見元タスク: skill-wizard-multi-select-options（M-01 TODO として登録）
- 前提タスク: UT-SKILL-WIZARD-MSO-MAIN-TOOL-UI-001（#2071 CLOSED 2026-04-13）
- GitHub Issue: [#2069](https://github.com/daishiman/AIWorkflowOrchestrator/issues/2069)（CLOSED）
- 参照仕様書: `docs/30-workflows/unassigned-task/UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001.md`
