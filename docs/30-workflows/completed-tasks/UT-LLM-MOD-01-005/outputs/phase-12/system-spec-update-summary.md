# Phase 12: システム仕様更新サマリー

## メタ情報

| 項目           | 内容                 |
| -------------- | -------------------- |
| タスクID       | UT-LLM-MOD-01-005    |
| 更新日         | 2026-03-25           |
| canonical root | `.claude/skills/...` |
| mirror root    | `.agents/skills/...` |

## Step 1-A: 完了記録

- workflow 本文: `docs/30-workflows/completed-tasks/UT-LLM-MOD-01-005/phase-12-documentation.md`
- workflow 台帳: `references/task-workflow-backlog.md`, `references/task-workflow-completed.md`

## Step 1-B: 実装状況テーブル更新

| ファイル                                        | 更新内容                                                                                          |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `references/api-ipc-system-core.md`             | branch 上の既存更新で `provider-registry.ts` 正本注記が入っていることを再確認。今回追加編集は不要 |
| `references/llm-ipc-types.md`                   | `provider-registry.ts` / `LLMProviderSchema` / `handleGetProviders()` の current contract に同期  |
| `references/interfaces-llm.md`                  | provider catalog の正本を `llm-ipc-types.md` へ寄せ、代表例 + 読む順番に整理                      |
| `references/ui-ux-llm-selector.md`              | 5 provider、persist 済み selection、`validateAndSyncPersistedConfig()` に同期                     |
| `references/lessons-learned-test-typesafety.md` | UT-LLM-MOD-01-005 の苦戦箇所3件を追加                                                             |
| `references/lessons-learned-current.md`         | lessons index に UT-LLM-MOD-01-005 を追加                                                         |
| `indexes/quick-reference.md`                    | provider registry SSoT への即時導線を追加                                                         |
| `indexes/resource-map.md`                       | provider registry SSoT sync 用の逆引き行を追加                                                    |

## Step 1-C: 関連タスク整理

| 区分 | タスク                                          | 扱い                                                                |
| ---- | ----------------------------------------------- | ------------------------------------------------------------------- |
| 完了 | UT-LLM-MOD-01-005                               | completed ledger へ移行                                             |
| 継続 | UT-LLM-MOD-01-001〜004                          | 既存 follow-up として backlog 継続                                  |
| 新規 | `task-llm-adapter-factory-provider-ids-ssot`    | `LLMAdapterFactory` の `SUPPORTED_PROVIDER_IDS` SSoT 化を formalize |
| 新規 | `task-llm-handle-get-providers-readonly-models` | readonly models bridge の follow-up を formalize                    |

## Step 1-D: index 再生成

- `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行
- `indexes/topic-map.md` と `indexes/keywords.json` を再生成

## Step 1-E: 未タスク登録

- `docs/30-workflows/unassigned-task/task-llm-adapter-factory-provider-ids-ssot.md`
- `docs/30-workflows/unassigned-task/task-llm-handle-get-providers-readonly-models.md`

## Step 1-F: 補助更新

- 親タスクで発生した苦戦箇所は 2 件の未タスク仕様書と lessons learned に記録した
- `aiworkflow-requirements` の `LOGS.md` / `SKILL.md` を更新した
- `task-specification-creator` の `phase-12-documentation-guide.md` / `spec-update-step1-validation-commands.md` / `spec-update-step2-domain-sync.md` / `unassigned-task-guidelines.md` / `LOGS.md` / `SKILL.md` を更新した
- `skill-creator` は review のみで、今回の gap を埋める追加編集は不要と判断した

## Step 1-G: 検証

| コマンド                                                              | 結果                                                                                                       |
| --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `validate-phase-output.js`                                            | PASS（32項目パス, 0 error, 0 warning）                                                                     |
| `validate-phase12-implementation-guide.js`                            | PASS（10/10）                                                                                              |
| `verify-all-specs.js --workflow ... --json`                           | PASS（errors 0, warnings 18）                                                                              |
| `audit-unassigned-tasks.js --json --diff-from HEAD --target-file ...` | currentViolations 0 / baselineViolations 334                                                               |
| `generate-index.js`                                                   | PASS（`topic-map.md`, `keywords.json` 再生成）                                                             |
| `validate-structure.js`                                               | PASS（exit 0, warning 5）                                                                                  |
| `quick_validate.js`                                                   | PASS（`aiworkflow-requirements`: 12項目 / warning 345、`task-specification-creator`: 18項目 / warning 26） |
| mirror sync                                                           | PASS（`.claude` → `.agents` rsync 完了）                                                                   |
| `diff -qr`                                                            | PASS（差分 0）                                                                                             |

## Step 2: domain spec sync

### 判定

**更新あり**

理由:

- `provider-registry.ts` が shared public contract として新設された
- `LLMProviderIdSchema` が手動 enum から `PROVIDER_IDS` 自動導出へ変わった
- `inferProviderId()` が Main local helper から shared export へ昇格した
- UI / IPC / interface docs の複製テーブルを「正本 + 代表例」へ寄せる必要があった

### current canonical facts

```text
provider-registry.ts
  PROVIDER_CONFIGS
  PROVIDER_IDS
  inferProviderId()
provider.ts
  LLMProviderIdSchema = z.enum(PROVIDER_IDS)
llm.ts
  handleGetProviders() は PROVIDER_CONFIGS を参照
  request.providerId ?? inferProviderId(request.modelId) を使用
```

### 苦戦箇所

| 課題                                                     | 解決                                                                    |
| -------------------------------------------------------- | ----------------------------------------------------------------------- |
| `specialMatcher` が optional で union narrowing が崩れる | `"specialMatcher" in provider` で narrowing してから呼び出す            |
| `z.enum()` が tuple を要求する                           | `ProviderIdUnion` を維持した tuple cast で `PROVIDER_IDS` を作る        |
| shared readonly models と Main mutable surface がずれる  | 現在は `[...config.models]` で橋渡しし、follow-up として formalize した |
