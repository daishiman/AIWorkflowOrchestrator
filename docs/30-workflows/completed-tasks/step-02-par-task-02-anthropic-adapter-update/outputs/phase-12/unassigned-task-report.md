# 未タスク検出レポート -- TASK-LLM-MOD-02

## 検出日: 2026-03-23

## 検出件数: 2件

| 未タスクID                     | 説明                                              | 優先度 | 発見Phase | 指示書パス                                                            |
| ------------------------------ | ------------------------------------------------- | ------ | --------- | --------------------------------------------------------------------- |
| TASK-LLM-MOD-HEALTHCHECK-CONST | ヘルスチェックモデルIDの定数化（全 Adapter 統一） | 低     | Phase 8   | `docs/30-workflows/unassigned-task/task-llm-mod-healthcheck-const.md` |
| TASK-LLM-MOD-HEALTHCHECK-BODY  | checkHealth の max_tokens / messages 固定値テスト | 低     | Phase 6   | `docs/30-workflows/unassigned-task/task-llm-mod-healthcheck-body.md`  |

## 3ステップ処理状況（P3/P38準拠）

| ステップ                           | HEALTHCHECK-CONST | HEALTHCHECK-BODY |
| ---------------------------------- | ----------------- | ---------------- |
| 1. `unassigned-task/` 指示書作成   | 完了              | 完了             |
| 2. `task-workflow-backlog.md` 登録 | 完了              | 完了             |
| 3. 関連仕様書リンク追加            | 該当なし          | 該当なし         |

## 未タスク詳細

### TASK-LLM-MOD-HEALTHCHECK-CONST

ヘルスチェックモデルIDが各 Adapter（Anthropic / Google / OpenAI 等）でハードコードされている。定数化することでモデル退役時の変更を1箇所に集約できる。

**追加発見**: `apps/desktop/src/main/services/auth/types.ts:286` に `ANTHROPIC_VALIDATION_MODEL = "claude-3-haiku-20240307"` が残存しており、本タスクで統合対応が必要。

### TASK-LLM-MOD-HEALTHCHECK-BODY

`checkHealth` リクエストの `max_tokens: 1` と `messages: [{ role: "user", content: "Hi" }]` が固定値として正しいことを検証するテストが未実装。HC-001（モデルID検証）と同じパターンでリクエストボディの他のフィールドも検証できる。
