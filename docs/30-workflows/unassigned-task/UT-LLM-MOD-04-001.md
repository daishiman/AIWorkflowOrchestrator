# UT-LLM-MOD-04-001: OpenAI/xAIアダプターテストのレガシーモデルID統一

## メタ情報

```yaml
task_id: UT-LLM-MOD-04-001
task_name: OpenAI/xAIアダプターテストのレガシーモデルID統一
category: refactor
priority: low
status: not_started
source_phase: TASK-LLM-MOD-04 Phase 10-12
created_date: 2026-03-24
spec_path: docs/30-workflows/unassigned-task/UT-LLM-MOD-04-001.md
parent_workflow: docs/30-workflows/step-03-seq-task-04-test-update/index.md
issue_path: docs/30-workflows/issues/issue-1561.md
detection_artifact: docs/30-workflows/step-03-seq-task-04-test-update/outputs/phase-12/unassigned-task-detection.md
```

## 背景

provider registry は `gpt-5.4` 系と `grok-4-1-fast-non-reasoning` を current facts としているが、
OpenAIAdapter/xAIAdapter の一部 test には `gpt-4o` と `grok-1` が残っている。

## 対象

- `apps/desktop/src/main/adapters/llm/__tests__/OpenAIAdapter.test.ts`
- `apps/desktop/src/main/adapters/llm/__tests__/xAIAdapter.test.ts`

## 参照導線

- parent workflow: `docs/30-workflows/step-03-seq-task-04-test-update/index.md`
- tracking issue: `docs/30-workflows/issues/issue-1561.md`
- detection artifact: `docs/30-workflows/step-03-seq-task-04-test-update/outputs/phase-12/unassigned-task-detection.md`

## 完了条件

- [ ] OpenAIAdapter test の legacy model ID を current registry に合わせる
- [ ] xAIAdapter test の legacy model ID を current registry に合わせる
- [ ] 関連 adapter tests が PASS する
