# 未タスク検出レポート

## 検出結果: 2件

| ID                                  | 内容                             | 発見元                              | formalize 先                                                                    | 優先度 |
| ----------------------------------- | -------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------- | ------ |
| UT-CHATVIEW-ERROR-BANNER-I18N-001   | エラーメッセージ i18n 対応       | Phase 10 MINOR-01 / Phase 12 再監査 | `docs/30-workflows/unassigned-task/task-ut-chatview-error-banner-i18n-001.md`   | Low    |
| UT-AI-CHAT-ERROR-CODE-INVENTORY-001 | ai.chat エラーコード一覧の明文化 | Phase 10 MINOR-02 / Phase 12 再監査 | `docs/30-workflows/unassigned-task/task-ut-ai-chat-error-code-inventory-001.md` | Medium |

## TODO / FIXME / HACK スキャン

- 対象となる workflow-local ファイル群で TODO / FIXME / HACK / XXX コメントは検出していない。

## Phase 11 からの観測

- `manual-test-result.md` と `screenshot-coverage.md` の PNG 実体を確認済み。
- 画像差し替え待ちの情報は未タスクではなく、証跡として扱う。

## スコープ外判断項目

| 項目                                                        | 判断     | 理由                         |
| ----------------------------------------------------------- | -------- | ---------------------------- |
| `WorkspaceChatInput` のエラー表示                           | scope 外 | 別 workflow の責務           |
| streaming 系 UI の統合                                      | scope 外 | 既存の別機構で管理           |
| LLM selector / persistence / Workspace stream UX の実装変更 | scope 外 | 親 workflow の別 Task で扱う |

## 確認ソース

- `docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/phase-12-documentation.md`
- `docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/outputs/phase-11/manual-test-result.md`
- `docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/outputs/phase-12/system-spec-update-summary.md`
