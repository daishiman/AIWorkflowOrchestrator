# Phase 3: 設計レビュー

## メタ情報

| 項目   | 値                            |
| ------ | ----------------------------- |
| Phase  | 3                             |
| 機能名 | llm-adapter-error-propagation |
| 作成日 | 2026-03-29                    |

## 目的

ステータス管理の責務配置、fire-and-forget パターンとの整合、型拡張の後方互換性、エラーメッセージの actionability を判定する。

## 実行タスク

- ステータス管理責務の配置判定
- fire-and-forget パターンとの整合判定
- 型拡張の後方互換性判定
- エラーメッセージの actionability 判定

## 参照資料

| 資料名                 | パス                                                                       | 説明                                |
| ---------------------- | -------------------------------------------------------------------------- | ----------------------------------- |
| Phase 1 要件           | `phase-1-requirements.md`                                                  | ステータス・エラーレスポンス要件    |
| Phase 2 設計           | `phase-2-design.md`                                                        | Facade / IPC / レスポンス設計       |
| adapter status 設計    | `outputs/phase-2/adapter-status-design.md`                                 | ステータス遷移図                    |
| error response catalog | `outputs/phase-2/error-response-catalog.md`                                | エラーコード一覧                    |
| 親 workflow pack       | `../skill-creator-agent-sdk-lane/root-workflow-pack/index.md`              | lane 共通不変条件                   |
| aiworkflow IPC 契約    | `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md` | handler / preload / shared contract |

## 判定

PASS

## Gate Summary

| Gate                                | 結果 | 根拠                                                                                                         |
| ----------------------------------- | ---- | ------------------------------------------------------------------------------------------------------------ |
| G-01 ステータス管理責務配置         | PASS | ステータスは Facade に集約。ipc/index.ts は初期化トリガーのみで、ステータス判定ロジックを持たない            |
| G-02 fire-and-forget パターン整合   | PASS | `void (async () => { ... })()` パターンを維持。catch ブロックに `setLLMAdapterFailed()` を追加するのみ       |
| G-03 型拡張の後方互換               | PASS | `RuntimeSkillCreatorPlanErrorResponse` を union 追加し、既存成功レスポンスとの互換を維持                     |
| G-04 エラーメッセージ actionability | PASS | API キー未設定時は「APIキーを設定してください」、それ以外は具体的な失敗理由を返す                            |
| G-05 テスト影響範囲                 | PASS | 既存テストは `setLLMAdapter()` 経由で llmAdapter を設定するため、ステータス自動遷移で影響なし                |
| G-06 aiworkflow 整合                | PASS | Facade は public bridge のまま。state owner や channel 増設に踏み込まず、current contract の最小差分に留める |

## Minor Notes

| 項目                                                 | 行き先            |
| ---------------------------------------------------- | ----------------- |
| `setLLMAdapterFailed()` → `setLLMAdapter()` の再遷移 | Phase 6 edge case |
| actionable メッセージの i18n 対応                    | follow-up task    |
| `LLM_ADAPTER_INITIALIZING` 時のリトライ UI           | TASK-RT-02        |

## 統合テスト連携

- Phase 4 の test matrix にステータス遷移全パターンが含まれていることを確認する
- Phase 9 で既存テストとの互換性を再監査する

## Phase 4 開始条件

- ステータス遷移の全パターン（initializing→ready、initializing→failed）が test case へ変換可能であること
- `plan()` エラーレスポンスの全パターンが test case へ変換可能であること

## Phase 13 blocked 条件

- ユーザー承認がない限り PR / commit は実行しない
- ユーザー承認がない限り、local check と change summary までで止める

## 成果物

| 成果物             | パス                                    | 説明                    |
| ------------------ | --------------------------------------- | ----------------------- |
| design review gate | `outputs/phase-3/design-review-gate.md` | gate summary と判定根拠 |

## 完了条件

- [ ] ステータス管理が Facade に閉じていることを確認した
- [ ] fire-and-forget パターンが破壊されないことを確認した
- [ ] 型拡張が後方互換であることを確認した
- [ ] エラーメッセージが actionable であることを確認した
- [ ] **本Phase内の全タスクを100%実行完了**
