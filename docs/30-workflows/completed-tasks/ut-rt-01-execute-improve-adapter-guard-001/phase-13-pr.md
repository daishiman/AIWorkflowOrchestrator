# Phase 13: PR 作成 — TASK-UT-RT-01-EXECUTE-IMPROVE-ADAPTER-GUARD-001

## メタ情報

| 項目     | 値                                              |
| -------- | ----------------------------------------------- |
| Phase    | 13                                              |
| タスクID | TASK-UT-RT-01-EXECUTE-IMPROVE-ADAPTER-GUARD-001 |
| 機能名   | ut-rt-01-execute-improve-adapter-guard-001      |
| 作成日   | 2026-04-04                                      |
| 依存     | Phase 12 完了・**ユーザーの明示的な承認**       |

## ⚠️ 重要: PR 作成はユーザーの明示承認後のみ実施

```
PR 作成は自動実行しない。必ずユーザーの明示的な許可を得てから実行すること。
```

## PR 準備情報

### ブランチ名

```
feat/ut-rt-01-execute-improve-adapter-guard-001
```

### PR タイトル

```
feat(runtime): execute()/improve() に LLMAdapter ステータスチェックを追加 (#1703)
```

### PR 本文テンプレート

```markdown
## Summary

- `RuntimeSkillCreatorFacade.execute()` / `improve()` の先頭に `_llmAdapterStatus` チェックを追加
- adapter が `"failed"` / `"initializing"` 状態の場合、`llm_adapter_unavailable` エラーを即座に返す
- `RuntimeSkillCreatorExecuteErrorResponse` 型を新設し、execute の返却型 union に追加
- T-EX-01〜06、T-IM-01〜05、T-REG-01〜02 テスト追加（+35件）
- T-COMPAT-02 を "initializing" 状態の新メッセージに合わせて更新

## Motivation

TASK-RT-01 で `plan()` に実装したアダプターステータスガードが `execute()` / `improve()` に未適用だった（Issue #1703）。

## Test Plan

- [ ] `pnpm --filter @repo/desktop test -- --testPathPattern="adapter-status"` 全 PASS
- [ ] `pnpm --filter @repo/desktop test -- --testPathPattern="RuntimeSkillCreatorFacade"` リグレッションなし
- [ ] `pnpm --filter @repo/shared typecheck` エラー 0
- [ ] `pnpm --filter @repo/desktop typecheck` エラー 0

## Related

- Closes #1703
- Parent: TASK-RT-01
```

## 実行コマンド（承認後）

```bash
git add \
  packages/shared/src/types/skillCreator.ts \
  packages/shared/src/types/index.ts \
  apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts \
  apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.adapter-status.test.ts

git commit -m "feat(runtime): execute()/improve() に LLMAdapter ステータスチェックを追加 (#1703)"

gh pr create \
  --title "feat(runtime): execute()/improve() に LLMAdapter ステータスチェックを追加 (#1703)" \
  --body "..."
```

## 完了条件

- [ ] ユーザーの明示的な PR 作成承認を受けた
- [ ] 全テストが PASS した状態でコミットした
- [ ] PR が作成された
- [ ] Issue #1703 が PR にリンクされた
