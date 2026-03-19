# Phase 12 システム仕様更新サマリー

## メタ情報

| 項目     | 内容                                             |
| -------- | ------------------------------------------------ |
| タスクID | TASK-IMP-RAG-EMBEDDING-EXTRACTION-AI-RUNTIME-001 |
| 実施日   | 2026-03-19                                       |
| 判定     | completed                                        |

## Step 1-A: 完了記録 / 履歴同期

更新したファイル:

- `.claude/skills/aiworkflow-requirements/LOGS.md`
- `.claude/skills/aiworkflow-requirements/SKILL.md`
- `.claude/skills/task-specification-creator/LOGS.md`
- `.claude/skills/task-specification-creator/SKILL.md`
- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`
- `.claude/skills/skill-creator/LOGS.md`
- `.claude/skills/skill-creator/SKILL.md`
- `.claude/skills/skill-creator/references/patterns-success-phase12-advanced.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow-completed-skill-lifecycle.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md`

要点:

- Task08 の completed record を「全件未タスク化済み」という誤記から、13件 formalize 済みの実績へ修正
- current workflow の screenshot fallback 実績と spec sync 実施内容を履歴へ追加
- user request による docs-heavy task の screenshot review 運用を lessons learned へ反映
- 正式 ID（`UT-*`）と physical filename（lowercase `task-*`）を分離し、未タスク canonical path を正規化した
- `task-specification-creator` / `skill-creator` に、filename 正規化と current-state 再監査の再利用ルールを反映した

## Step 1-B: 実装状況テーブル / completed ledger

更新対象:

- `task-workflow-completed-skill-lifecycle.md`
- `task-workflow.md`

反映内容:

- `AI_CHECK_CONNECTION` は廃止完了ではなく legacy guidance 残置
- `AI_INDEX` は long-running job ではなく zero-count guidance stub
- `COMMUNITY_*` は `NOT_IN_SCOPE` guidance-only
- `GraphRAGQueryService` は `fallbackReason` を返す implemented 状態
- `HybridRAGFactory.createFull/createLite` は `[FACTORY_NOT_READY]` Error throw 状態

## Step 1-C: 関連タスク / backlog 同期

登録した未タスク:

- `UT-RAG-08-001` 〜 `UT-RAG-08-013`

補足:

- `UT-RAG-08-014` 相当の cleanup は `UT-RAG-08-006` に統合
- `docs/30-workflows/completed-tasks/ai-runtime-authmode-unification/tasks/step-04-par-task-08-rag-embedding-extraction-runtime/unassigned-task/` 実体作成、backlog 登録、completed record 反映を同ターンで完了
- 13件の未タスク physical filename を lowercase `task-rag-08-*.md` へ正規化し、`verify-unassigned-links` と `audit-unassigned-tasks --target-file` の両方で確認した

## Step 1-D: index / mirror

実施内容:

- `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js`
- `indexes/resource-map.md` / `indexes/quick-reference.md` / `indexes/quick-reference-search-patterns.md` を Task08 current canonical set に同期
- `.claude` → `.agents` mirror 同期（`aiworkflow-requirements` / `task-specification-creator` / `skill-creator`）
- `diff -qr .claude/skills/aiworkflow-requirements .agents/skills/aiworkflow-requirements`
- `diff -qr .claude/skills/task-specification-creator .agents/skills/task-specification-creator`
- `diff -qr .claude/skills/skill-creator .agents/skills/skill-creator`

判定:

- `topic-map.md`, `keywords.json` を再生成
- mirror parity は最終 diff で確認

## Step 2: domain spec sync

### 実更新した仕様書

| ファイル                                               | 反映内容                                                                                |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| `references/api-ipc-system-core.md`                    | `AI_CHECK_CONNECTION` / `AI_INDEX` の legacy guidance 契約を current code に同期        |
| `references/llm-ipc-types.md`                          | `lastSyncTime?: Date`、`recursive?: boolean`、`errors: string[]` を current type に同期 |
| `references/rag-search-hybrid.md`                      | `HybridRAGFactory.createFull/createLite` の `[FACTORY_NOT_READY]` 状態を同期            |
| `references/interfaces-rag-graphrag-query.md`          | `fallbackReason` / warn + empty-results fallback を同期                                 |
| `references/interfaces-rag-community-summarization.md` | embed failure warn + summary save 継続を同期                                            |
| `references/rag-query-pipeline.md`                     | GraphRAG fallback と HybridRAGFactory stub 状態を親仕様へ同期                           |
| `references/architecture-rag.md`                       | runtime rule snapshot を追加し、検索層 / service 層の current status を同期             |

### follow-up として残した仕様同期

| 項目                                        | 理由                                               | 追跡先          |
| ------------------------------------------- | -------------------------------------------------- | --------------- |
| `llm-embedding.md` の broader catalog drift | runtime rule を超える embedding catalog 差分が残る | `UT-RAG-08-003` |
| contract-matrix postconditions の全面修正   | workflow 成果物側の整合整理が別論点                | `UT-RAG-08-009` |

## 検証

| コマンド                                                                                                                                                                                                                                                                                   | 目的                                                              |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| `diff -qr .claude/skills/aiworkflow-requirements .agents/skills/aiworkflow-requirements`                                                                                                                                                                                                   | mirror parity（PASS）                                             |
| `diff -qr .claude/skills/task-specification-creator .agents/skills/task-specification-creator`                                                                                                                                                                                             | task-spec mirror parity（PASS）                                   |
| `diff -qr .claude/skills/skill-creator .agents/skills/skill-creator`                                                                                                                                                                                                                       | skill-creator mirror parity（PASS）                               |
| `node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow ...`                                                                                                                                                                           | implementation guide literal 要件（PASS: 10/10）                  |
| `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js --workflow ...`                                                                                                                                                                                         | current workflow の未タスクリンク確認（PASS: missing 0）          |
| `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD --target-file docs/30-workflows/completed-tasks/ai-runtime-authmode-unification/tasks/step-04-par-task-08-rag-embedding-extraction-runtime/unassigned-task/task-rag-08-0xx-*.md` | 13件の canonical filename / 形式監査（PASS: currentViolations=0） |
| `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js ... --phase 11/12`                                                                                                                                                                                        | Phase 11/12 必須セクション・完了条件確認（PASS）                  |

## 結論

Phase 12 Task 2 は完了。
今回の branch で実装済みの runtime ルールは system spec へ同期し、未解決差分は 13 件の未タスクとして formalize した。
あわせて、direct capture fallback の教訓と未タスク canonical filename の再利用ルールも system spec / skill 側へ同期した。
