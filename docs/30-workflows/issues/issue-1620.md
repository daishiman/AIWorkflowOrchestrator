# [#1620] "[TASK-LLM-MOD-HEALTHCHECK-CONST] TASK"

## メタ情報

```yaml
task_id: TASK-LLM-MOD-HEALTHCHECK-CONST
task_name: TASK
category: -
target_feature: -
priority: 低
scale: -
status: 未実施
source_phase: TASK-LLM-MOD-02 Phase 8
created_date: 2026-03-25
dependencies: []
spec_path: docs/30-workflows/unassigned-task/task-llm-mod-healthcheck-const.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | -      |
| ステータス | 未実施 |

---

## 目的

ヘルスチェックで使用するモデルIDが各 Adapter（Anthropic / Google / OpenAI 等）でハードコードされている。定数化することでモデル退役時の変更を1箇所に集約する。

## 対象ファイル

| ファイル                                                      | 現状                                                                          |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `apps/desktop/src/main/adapters/llm/AnthropicAdapter.ts` L207 | `"claude-haiku-4-5"` ハードコード                                             |
| `apps/desktop/src/main/services/auth/types.ts` L286           | `ANTHROPIC_VALIDATION_MODEL = "claude-3-haiku-20240307"` (**旧モデルID残存**) |

## 実行タスク

1. 共通定数ファイル（例: `adapters/llm/constants.ts`）に各プロバイダのヘルスチェック用モデルIDを定義
2. `AnthropicAdapter.ts` L207 の文字列リテラルを定数参照に置換
3. `auth/types.ts` の `ANTHROPIC_VALIDATION_MODEL` を同一定数に統合（または `claude-haiku-4-5` に更新）
4. 対応テストの更新

## 注意事項

- `ANTHROPIC_VALIDATION_MODEL`（`auth/types.ts:286`）は APIキー検証用の別経路で使用されている（`AuthKeyService.ts:279`）。`checkHealth` とは独立したフローだが、同一モデルIDを参照すべき
- `claude-3-haiku-20240307` が廃止された場合、APIキー設定フローが常にエラーを返す実害が発生する

## 完了条件

- [ ] ヘルスチェック用モデルIDが定数化されている
- [ ] `ANTHROPIC_VALIDATION_MODEL` が最新モデルIDに更新されている
- [ ] 全テストがPASS
