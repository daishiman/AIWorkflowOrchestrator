# [#1561] [UT-LLM-MOD-04-001] アダプターテストのレガシーモデルID統一

## メタ情報

```yaml
task_id: UT-LLM-MOD-04-001
task_name: アダプターテストのレガシーモデルID統一
category: リファクタリング
priority: low
scale: small
status: 未実施
source_phase: TASK-LLM-MOD-04 Phase 10-11
created_date: 2026-03-24
dependencies: []
spec_path: docs/30-workflows/unassigned-task/UT-LLM-MOD-04-001.md
parent_workflow: docs/30-workflows/step-03-seq-task-04-test-update/index.md
classification: existing_backlog_retained_during_audit_sync
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | low    |
| 規模       | small  |
| ステータス | 未実施 |

---

## 目的

PROVIDER_CONFIGS から削除済みのレガシーモデルID（`gpt-4o`, `grok-1`）がテストファイルのモック入力に残存している。新規開発者の混乱を防ぐため、現行モデルIDに統一する。

## current wave での位置づけ

- `TASK-LLM-MOD-04` の docs / close-out wave では再実装しない
- 既存 backlog として維持し、current workflow からの導線だけを補強した
- 検出元は `outputs/phase-12/unassigned-task-detection.md` に再記録されている

## 変更内容

| ファイル              | 変更箇所 | 旧値     | 新値                          |
| --------------------- | -------- | -------- | ----------------------------- |
| OpenAIAdapter.test.ts | 11箇所   | `gpt-4o` | `gpt-5.4`                     |
| xAIAdapter.test.ts    | 12箇所   | `grok-1` | `grok-4-1-fast-non-reasoning` |

## 影響範囲

- 機能影響なし。テストは全 PASS
- `inferProviderId` はプレフィックスベースのため正常に解決される
- コード品質改善目的の変更

## 対象ファイル

- `apps/desktop/src/main/adapters/llm/__tests__/OpenAIAdapter.test.ts` (11箇所)
- `apps/desktop/src/main/adapters/llm/__tests__/xAIAdapter.test.ts` (12箇所)

## 実行手順

1. 対象ファイルを Read して変更箇所を確認
2. sed または Edit ツールで一括置換
3. `cd apps/desktop && pnpm vitest run src/main/adapters/llm/__tests__/` で全 PASS 確認

## 完了条件

- [ ] OpenAIAdapter.test.ts の `gpt-4o` が `gpt-5.4` に置換されている
- [ ] xAIAdapter.test.ts の `grok-1` が `grok-4-1-fast-non-reasoning` に置換されている
- [ ] `cd apps/desktop && pnpm vitest run` が全 PASS する

## 参照

- 検出元: `docs/30-workflows/step-03-seq-task-04-test-update/outputs/phase-12/unassigned-task-detection.md`
- parent workflow: `docs/30-workflows/step-03-seq-task-04-test-update/index.md`
