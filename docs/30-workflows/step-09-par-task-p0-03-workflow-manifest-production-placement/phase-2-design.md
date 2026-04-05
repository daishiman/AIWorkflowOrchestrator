# Phase 2: 設計

## メタ情報

| 項目       | 値                                     |
| ---------- | -------------------------------------- |
| Phase      | 2                                      |
| タスクID   | TASK-P0-03                             |
| 機能名     | workflow-manifest-production-placement |
| カテゴリ   | 新機能（Spec P0系）                    |
| タスク分類 | NON_VISUAL（UIタスクではない）         |
| 作成日     | 2026-04-04                             |

## 目的

`workflow-manifest.json` の完全な JSON 構造を設計し、canonical / mirror 配置戦略を確定する。テストフィクスチャの構造分析と skill-creator ディレクトリの実在ファイル調査に基づき、ManifestLoader の全検証ステップを通過する manifest を設計する。

## 実行タスク

- テストフィクスチャの構造を分析し、本番 manifest への転用ポイントを特定する
- skill-creator 配下の実在ファイル（agents/ references/ schemas/）を調査し、resource descriptor に使用するファイルを選定する
- 5 フェーズ定義（requirements-gathering, plan, execute, verify, improve）を設計する
- resource の双方向参照（phase.resourceIds ↔ resource.phaseIds）を設計する
- entry / exit hook の定義を設計する
- canonical / mirror 配置戦略を確定する

## 参照資料

| 資料名                     | パス                                                                                                 | 説明                |
| -------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------- |
| Phase 1                    | `phase-1-requirements.md`                                                                            | 要件定義            |
| ManifestLoader             | `apps/desktop/src/main/services/runtime/ManifestLoader.ts`                                           | 検証ロジック本体    |
| production-manifest テスト | `apps/desktop/src/main/services/runtime/__tests__/ManifestLoader.production-manifest.test.ts`        | テスト期待値        |
| テストフィクスチャ         | `apps/desktop/src/main/services/runtime/__tests__/fixtures/workflow-manifest/workflow-manifest.json` | 構造リファレンス    |
| canonical manifest（現状） | `.claude/skills/skill-creator/workflow-manifest.json`                                                | 現在の本番 manifest |
| 要件定義書                 | `outputs/phase-1/requirements.md`                                                                    | Phase 1 成果物      |

### システム仕様（aiworkflow-requirements）

| 参照対象                     | パス                                                                                        | 要点                                                                                           |
| ---------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| workflow manifest foundation | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference.md` | `WorkflowManifest*` / `LoadedWorkflowManifest` / `ManifestLoader` の read / validate 契約      |
| orchestration boundary       | `.claude/skills/aiworkflow-requirements/references/architecture-overview-core.md`           | `ManifestLoader` は workflow foundation であり state owner ではない                            |
| owner separation             | `.claude/skills/aiworkflow-requirements/references/arch-electron-services-details-part2.md` | `ManifestLoader` は route/state authority を持たず `SkillCreatorWorkflowEngine` と責務分離する |

## 実行手順

### ステップ1: テストフィクスチャの構造分析

テストフィクスチャ（`fixtures/workflow-manifest/workflow-manifest.json`）の構造:

```json
{
  "schemaVersion": 1,
  "workflowId": "task-sdk-01-foundation",
  "phases": [{ "id", "title", "resourceIds", "entryHookId", "exitHookId", "dependsOn" }],
  "resources": [{ "id", "kind", "path", "phaseIds" }],
  "entry": [{ "id", "command" }],
  "exit": [{ "id", "command" }]
}
```

トップレベルフィールドは `ALLOWED_TOP_LEVEL_FIELDS`（schemaVersion / workflowId / phases / resources / entry / exit）のみ許可。

### ステップ2: skill-creator ディレクトリの実在ファイル調査

resource descriptor として登録するファイルを skill-creator ディレクトリから選定する:

| ディレクトリ | ファイル数 | 代表ファイル例                                              |
| ------------ | ---------- | ----------------------------------------------------------- |
| agents/      | 36         | analyze-request.md, define-boundary.md, analyze-feedback.md |
| references/  | 58         | core-principles.md, codex-best-practices.md                 |
| schemas/     | 38         | agent-definition.json, boundary.json                        |

### ステップ3: 5 フェーズ定義の設計

テスト TC-04 の期待値に基づき、以下の順序で 5 フェーズを定義する:

| 順序 | phase id               | title    | dependsOn                | entryHookId   | exitHookId   |
| ---- | ---------------------- | -------- | ------------------------ | ------------- | ------------ |
| 0    | requirements-gathering | 要件収集 | （なし）                 | rg-entry      | rg-exit      |
| 1    | plan                   | 計画策定 | [requirements-gathering] | plan-entry    | plan-exit    |
| 2    | execute                | 実行     | [plan]                   | execute-entry | execute-exit |
| 3    | verify                 | 検証     | [execute]                | verify-entry  | verify-exit  |
| 4    | improve                | 改善     | [verify]                 | improve-entry | improve-exit |

テスト TC-09（dependsOn 検証）の期待値:

- 最初の phase は `dependsOn` なし（undefined）
- 2 番目以降は直前の phase に依存

### ステップ4: resource descriptor の設計

各 phase に紐づく resource を設計する。双方向参照（`phase.resourceIds` ↔ `resource.phaseIds`）の対称性を確保する。

| resource id              | kind      | path                                 | phaseIds                 |
| ------------------------ | --------- | ------------------------------------ | ------------------------ |
| agent-analyze-request    | agent     | ./agents/analyze-request.md          | [requirements-gathering] |
| agent-define-boundary    | agent     | ./agents/define-boundary.md          | [plan]                   |
| ref-core-principles      | reference | ./references/core-principles.md      | [plan]                   |
| ref-codex-best-practices | reference | ./references/codex-best-practices.md | [execute]                |
| schema-agent-definition  | schema    | ./schemas/agent-definition.json      | [execute]                |
| schema-boundary          | schema    | ./schemas/boundary.json              | [verify]                 |
| agent-analyze-feedback   | agent     | ./agents/analyze-feedback.md         | [improve]                |

双方向参照の対応表:

| phase                  | resourceIds                                         |
| ---------------------- | --------------------------------------------------- |
| requirements-gathering | [agent-analyze-request]                             |
| plan                   | [agent-define-boundary, ref-core-principles]        |
| execute                | [ref-codex-best-practices, schema-agent-definition] |
| verify                 | [schema-boundary]                                   |
| improve                | [agent-analyze-feedback]                            |

### ステップ5: entry / exit hook の設計

各 phase に対応する entry / exit hook を定義する:

**entry hooks:**

| id            | command                      |
| ------------- | ---------------------------- |
| rg-entry      | validate requirements input  |
| plan-entry    | validate plan prerequisites  |
| execute-entry | validate execution context   |
| verify-entry  | validate verification scope  |
| improve-entry | validate improvement targets |

**exit hooks:**

| id           | command                      |
| ------------ | ---------------------------- |
| rg-exit      | handoff requirements summary |
| plan-exit    | handoff plan artifacts       |
| execute-exit | handoff generated artifacts  |
| verify-exit  | handoff verification report  |
| improve-exit | handoff improvement summary  |

### ステップ6: manifest JSON の完全構造設計

上記の設計をまとめた完全な JSON 構造:

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

### ステップ7: canonical / mirror 配置戦略

| 項目           | 値                                                    |
| -------------- | ----------------------------------------------------- |
| canonical パス | `.claude/skills/skill-creator/workflow-manifest.json` |
| mirror パス    | `.agents/skills/skill-creator/workflow-manifest.json` |
| 同期方式       | ファイルコピー（byte-for-byte 同一）                  |
| 同期タイミング | manifest 更新時に同時配置                             |
| 検証方法       | テスト AC-2 で canonical と mirror の内容一致を確認   |

配置手順:

1. canonical パスに `workflow-manifest.json` を配置する
2. canonical ファイルを mirror パスにコピーする
3. `ManifestLoader.production-manifest.test.ts` で両パスの同一性を検証する

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

## 統合テスト連携

- Phase 2 の設計結果は `ManifestLoader.production-manifest.test.ts` の全 17 ケースで検証される
- manifest JSON 構造はテスト TC-01〜TC-07 の期待値と完全に一致する必要がある
- resource path はテスト TC-03 で `fs.access()` による実在確認が行われる
- canonical / mirror の同一性はテスト AC-2 で `readFile` の内容比較により検証される

## 多角的チェック観点

- ALLOWED_TOP_LEVEL_FIELDS 以外のフィールドが含まれていないか
- resource.path が manifest ファイルからの相対パスで正しく解決されるか
- phase.resourceIds と resource.phaseIds の双方向参照が完全に対称か
- dependsOn の値が phases 配列内で自身より前のインデックスの phase id のみを参照しているか
- entry/exit hook の数が phase の数と一致し、全 phase の hookId がカバーされているか
- resource の kind が agent / reference / schema / asset のいずれかであるか
- workflowId が既存テストの期待値 `"skill-creator"` と一致しているか

## 成果物

| 成果物 | パス                        | 説明                        |
| ------ | --------------------------- | --------------------------- |
| 設計書 | `outputs/phase-2/design.md` | manifest 構造設計・配置戦略 |

## 完了条件

- [ ] テストフィクスチャの構造分析が完了している
- [ ] skill-creator 配下の実在ファイルが調査されている
- [ ] 5 フェーズ定義（id / title / dependsOn / entryHookId / exitHookId / resourceIds）が設計されている
- [ ] 7 resource descriptor（id / kind / path / phaseIds）が設計されている
- [ ] phase ↔ resource の双方向参照が対称的に設計されている
- [ ] entry / exit hook（各 5 件）が設計されている
- [ ] manifest JSON の完全な構造が設計されている
- [ ] canonical / mirror 配置戦略が確定している
- [ ] ManifestLoader の全検証ステップとの対応が確認されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

| SubAgent   | 責務                                      |
| ---------- | ----------------------------------------- |
| SubAgent-A | テストフィクスチャ分析・manifest 構造設計 |
| SubAgent-B | resource descriptor・双方向参照設計       |
| SubAgent-C | canonical / mirror 配置戦略策定           |

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次のPhase

Phase 3: 設計レビュー
