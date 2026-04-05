# Phase 2: 設計書 — TASK-P0-03

## メタ情報

| 項目     | 値                                     |
| -------- | -------------------------------------- |
| Phase    | 2                                      |
| タスクID | TASK-P0-03                             |
| 機能名   | workflow-manifest-production-placement |
| 実行日   | 2026-04-04                             |

## テストフィクスチャの構造分析

テストフィクスチャ（`fixtures/workflow-manifest/workflow-manifest.json`）の構造:

- **schemaVersion**: 1
- **workflowId**: "task-sdk-01-foundation"（テスト用、本番は "skill-creator"）
- **phases**: 2 件（phase-1, phase-2）
- **resources**: 2 件（manifest-overview, cache-target）
- **entry**: 2 件（load-manifest, validate-loader）
- **exit**: 2 件（publish-scope, publish-loader）

本番 manifest はフィクスチャの構造パターンを踏襲しつつ、5 phase / 7 resource / 5 entry / 5 exit に拡張する。

## skill-creator ディレクトリの実在ファイル調査

| ディレクトリ | ファイル数 | manifest で使用するファイル                                 |
| ------------ | ---------- | ----------------------------------------------------------- |
| agents/      | 38         | analyze-request.md, define-boundary.md, analyze-feedback.md |
| references/  | 57         | core-principles.md, codex-best-practices.md                 |
| schemas/     | 40         | agent-definition.json, boundary.json                        |

## 5 フェーズ定義の設計

| 順序 | phase id               | title    | dependsOn                | entryHookId   | exitHookId   |
| ---- | ---------------------- | -------- | ------------------------ | ------------- | ------------ |
| 0    | requirements-gathering | 要件収集 | （なし）                 | rg-entry      | rg-exit      |
| 1    | plan                   | 計画策定 | [requirements-gathering] | plan-entry    | plan-exit    |
| 2    | execute                | 実行     | [plan]                   | execute-entry | execute-exit |
| 3    | verify                 | 検証     | [execute]                | verify-entry  | verify-exit  |
| 4    | improve                | 改善     | [verify]                 | improve-entry | improve-exit |

## resource descriptor の設計

| resource id              | kind      | path                                 | phaseIds                 |
| ------------------------ | --------- | ------------------------------------ | ------------------------ |
| agent-analyze-request    | agent     | ./agents/analyze-request.md          | [requirements-gathering] |
| agent-define-boundary    | agent     | ./agents/define-boundary.md          | [plan]                   |
| ref-core-principles      | reference | ./references/core-principles.md      | [plan]                   |
| ref-codex-best-practices | reference | ./references/codex-best-practices.md | [execute]                |
| schema-agent-definition  | schema    | ./schemas/agent-definition.json      | [execute]                |
| schema-boundary          | schema    | ./schemas/boundary.json              | [verify]                 |
| agent-analyze-feedback   | agent     | ./agents/analyze-feedback.md         | [improve]                |

## phase ↔ resource 双方向参照

| phase                  | resourceIds                                         |
| ---------------------- | --------------------------------------------------- |
| requirements-gathering | [agent-analyze-request]                             |
| plan                   | [agent-define-boundary, ref-core-principles]        |
| execute                | [ref-codex-best-practices, schema-agent-definition] |
| verify                 | [schema-boundary]                                   |
| improve                | [agent-analyze-feedback]                            |

逆方向（resource → phase）: 各 resource の phaseIds が上記と対称であることを確認済み。

## entry / exit hook の設計

### entry hooks

| id            | command                      |
| ------------- | ---------------------------- |
| rg-entry      | validate requirements input  |
| plan-entry    | validate plan prerequisites  |
| execute-entry | validate execution context   |
| verify-entry  | validate verification scope  |
| improve-entry | validate improvement targets |

### exit hooks

| id           | command                      |
| ------------ | ---------------------------- |
| rg-exit      | handoff requirements summary |
| plan-exit    | handoff plan artifacts       |
| execute-exit | handoff generated artifacts  |
| verify-exit  | handoff verification report  |
| improve-exit | handoff improvement summary  |

## manifest JSON の完全構造設計

```json
{
  "schemaVersion": 1,
  "workflowId": "skill-creator",
  "phases": [
    {
      "id": "requirements-gathering",
      "title": "要件収集",
      "entryHookId": "rg-entry",
      "exitHookId": "rg-exit",
      "resourceIds": ["agent-analyze-request"]
    },
    {
      "id": "plan",
      "title": "計画策定",
      "dependsOn": ["requirements-gathering"],
      "entryHookId": "plan-entry",
      "exitHookId": "plan-exit",
      "resourceIds": ["agent-define-boundary", "ref-core-principles"]
    },
    {
      "id": "execute",
      "title": "実行",
      "dependsOn": ["plan"],
      "entryHookId": "execute-entry",
      "exitHookId": "execute-exit",
      "resourceIds": ["ref-codex-best-practices", "schema-agent-definition"]
    },
    {
      "id": "verify",
      "title": "検証",
      "dependsOn": ["execute"],
      "entryHookId": "verify-entry",
      "exitHookId": "verify-exit",
      "resourceIds": ["schema-boundary"]
    },
    {
      "id": "improve",
      "title": "改善",
      "dependsOn": ["verify"],
      "entryHookId": "improve-entry",
      "exitHookId": "improve-exit",
      "resourceIds": ["agent-analyze-feedback"]
    }
  ],
  "resources": [
    {
      "id": "agent-analyze-request",
      "kind": "agent",
      "path": "./agents/analyze-request.md",
      "phaseIds": ["requirements-gathering"]
    },
    {
      "id": "agent-define-boundary",
      "kind": "agent",
      "path": "./agents/define-boundary.md",
      "phaseIds": ["plan"]
    },
    {
      "id": "ref-core-principles",
      "kind": "reference",
      "path": "./references/core-principles.md",
      "phaseIds": ["plan"]
    },
    {
      "id": "ref-codex-best-practices",
      "kind": "reference",
      "path": "./references/codex-best-practices.md",
      "phaseIds": ["execute"]
    },
    {
      "id": "schema-agent-definition",
      "kind": "schema",
      "path": "./schemas/agent-definition.json",
      "phaseIds": ["execute"]
    },
    {
      "id": "schema-boundary",
      "kind": "schema",
      "path": "./schemas/boundary.json",
      "phaseIds": ["verify"]
    },
    {
      "id": "agent-analyze-feedback",
      "kind": "agent",
      "path": "./agents/analyze-feedback.md",
      "phaseIds": ["improve"]
    }
  ],
  "entry": [
    { "id": "rg-entry", "command": "validate requirements input" },
    { "id": "plan-entry", "command": "validate plan prerequisites" },
    { "id": "execute-entry", "command": "validate execution context" },
    { "id": "verify-entry", "command": "validate verification scope" },
    { "id": "improve-entry", "command": "validate improvement targets" }
  ],
  "exit": [
    { "id": "rg-exit", "command": "handoff requirements summary" },
    { "id": "plan-exit", "command": "handoff plan artifacts" },
    { "id": "execute-exit", "command": "handoff generated artifacts" },
    { "id": "verify-exit", "command": "handoff verification report" },
    { "id": "improve-exit", "command": "handoff improvement summary" }
  ]
}
```

## canonical / mirror 配置戦略

| 項目           | 値                                                    |
| -------------- | ----------------------------------------------------- |
| canonical パス | `.claude/skills/skill-creator/workflow-manifest.json` |
| mirror パス    | `.agents/skills/skill-creator/workflow-manifest.json` |
| 同期方式       | ファイルコピー（byte-for-byte 同一）                  |
| 同期タイミング | manifest 更新時に同時配置                             |
| 検証方法       | テスト AC-2 で canonical と mirror の内容一致を確認   |

## ManifestLoader 検証ステップとの対応

| 検証ステップ       | manifest 設計の対応箇所                                             |
| ------------------ | ------------------------------------------------------------------- |
| 1. トップレベル    | schemaVersion / workflowId / phases / resources / entry / exit のみ |
| 2. schemaVersion   | `1`（WORKFLOW_MANIFEST_SCHEMA_VERSION 定数）                        |
| 3. workflowId      | `"skill-creator"`（空でない文字列）                                 |
| 4. entry hooks     | 5 件、全て id / command あり、id 一意                               |
| 5. exit hooks      | 5 件、全て id / command あり、id 一意                               |
| 6. resources       | 7 件、全て id / kind / path あり、kind は agent/reference/schema    |
| 7. phases          | 5 件、全て id / title / entryHookId / exitHookId あり               |
| 8. hook 参照       | 全 entryHookId → entry[]、exitHookId → exit[] に存在                |
| 9. resource 参照   | 全 phase.resourceIds → resources[].id に存在                        |
| 10. 双方向一致     | resource.phaseIds ↔ phases[].resourceIds が対称                     |
| 11. dependsOn 順序 | 依存先が自身より前のインデックスに定義                              |
| 12. path 実在      | 全 resource.path が skill-creator ディレクトリ配下に実在            |

## 完了確認

- [x] テストフィクスチャの構造分析が完了している
- [x] skill-creator 配下の実在ファイルが調査されている
- [x] 5 フェーズ定義が設計されている
- [x] 7 resource descriptor が設計されている
- [x] phase ↔ resource の双方向参照が対称的に設計されている
- [x] entry / exit hook（各 5 件）が設計されている
- [x] manifest JSON の完全な構造が設計されている
- [x] canonical / mirror 配置戦略が確定している
- [x] ManifestLoader の全検証ステップとの対応が確認されている
- [x] 本 Phase 内の全タスクを 100% 実行完了
