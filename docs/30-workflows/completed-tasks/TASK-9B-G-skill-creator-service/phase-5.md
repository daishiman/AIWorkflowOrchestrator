# Phase 5: 実装（TDD: Green）

## メタ情報

| 項目   | 値                    |
| ------ | --------------------- |
| Phase  | 5                     |
| タスク | TASK-9B-G             |
| 機能名 | skill-creator-service |
| 作成日 | 2026-02-03            |

## 目的

テストを通すための最小限の実装を行い、全テストをGreen状態にする。

## 実行タスク

- Task 5-1: 型定義実装（skillCreator.ts）
- Task 5-2: ScriptExecutor実装
- Task 5-3: ResourceLoader実装
- Task 5-4: SkillCreatorService実装

## 参照資料

| 資料名       | パス                                                                     | 説明          |
| ------------ | ------------------------------------------------------------------------ | ------------- |
| 設計書       | `outputs/phase-2/architecture-design.md`                                 | 実装対象設計  |
| テストコード | `apps/desktop/src/main/services/skill/__tests__/*.test.ts`               | Phase 4成果物 |
| 元タスク仕様 | `docs/30-workflows/skill-import-agent-system/tasks/task-9b-g-service.md` | コード例参照  |
| 実装パターン | `aiworkflow-requirements: architecture-implementation-patterns.md`       | 実装パターン  |

## 実行手順

### Task 5-1: 型定義実装（skillCreator.ts）

`packages/shared/src/types/skillCreator.ts` に以下の型を実装：

| 型名                | 説明                                                                                      |
| ------------------- | ----------------------------------------------------------------------------------------- |
| SkillCreatorMode    | `"collaborative" \| "orchestrate" \| "create" \| "update" \| "improve-prompt"`            |
| ExecutionEngine     | `"claude" \| "codex" \| "claude-to-codex"`                                                |
| CreateSkillOptions  | name, description, mode, executionEngine?, generateTasks?, interviewResult?, domainModel? |
| InterviewResult     | purpose, features, inputs, outputs, externalApis?, toolsNeeded, abstractionLevel          |
| DomainModel         | coreDomain, entities, boundedContexts, ubiquitousLanguage                                 |
| ExecuteTasksOptions | tasksDir, parallel?, dryRun?, maxTurns?                                                   |
| ExecutionReport     | mode, tasks?, results?, summary?, estimatedTime?                                          |
| TaskResult          | taskId, status, duration, error?, artifacts?                                              |
| ExecutionSummary    | total, completed, failed, skipped                                                         |
| Entity              | name, attributes                                                                          |
| BoundedContext      | name, entities                                                                            |
| ExternalApiConfig   | name, endpoint, authType?                                                                 |

### Task 5-2: ScriptExecutor実装

`apps/desktop/src/main/services/skill/ScriptExecutor.ts`

| メソッド       | 実装内容                                                          |
| -------------- | ----------------------------------------------------------------- |
| constructor    | scriptsディレクトリパスを保持                                     |
| execute        | child_process.spawnでスクリプト実行、stdout/stderr/exitCodeを返却 |
| executeJson<T> | execute後にstdoutをJSON.parseして返却                             |

**実装のポイント**:

- Promiseベースの非同期処理
- 標準出力/エラー出力の収集
- 終了コードによる成功/失敗判定

### Task 5-3: ResourceLoader実装

`apps/desktop/src/main/services/skill/ResourceLoader.ts`

| メソッド    | 実装内容                                                         |
| ----------- | ---------------------------------------------------------------- |
| constructor | basePathを保持、空のMapキャッシュを初期化                        |
| load        | キャッシュチェック → なければfs.readFile → キャッシュ格納 → 返却 |
| loadAgent   | `load("agents", `${agentName}.md`)` を呼び出し                   |
| loadSchema  | `load("schemas", `${schemaName}.json`)` → JSON.parse             |
| clearCache  | `cache.clear()`                                                  |

**実装のポイント**:

- Map<string, string>によるキャッシュ
- Progressive Disclosure原則の実現

### Task 5-4: SkillCreatorService実装

`apps/desktop/src/main/services/skill/SkillCreatorService.ts`

| メソッド           | 実装内容                                                                             |
| ------------------ | ------------------------------------------------------------------------------------ |
| constructor        | skillsDir, workflowsDir設定、ScriptExecutor/ResourceLoader初期化                     |
| detectMode         | `scriptExecutor.executeJson("detect_mode.js", [...])`                                |
| createSkill        | モード分岐 → ワークフロー実行 → init_skill.js → generate_skill_md.js → validateSkill |
| executeTasks       | scanTasks → buildDependencyGraph → detectCycles → topologicalSort → 実行/ドライラン  |
| validateSkill      | `scriptExecutor.execute("validate_all.js", [...])`                                   |
| validateWithSchema | `scriptExecutor.execute("validate_schema.js", [...])`                                |

**プライベートメソッド**:

| メソッド                 | 実装内容                                         |
| ------------------------ | ------------------------------------------------ |
| runCollaborativeWorkflow | エージェントプロンプト読み込み → Phase実行       |
| runOrchestrateWorkflow   | 実行エンジン選択 → 実行                          |
| runCreateWorkflow        | リクエスト分析 → 生成                            |
| scanTasks                | タスクディレクトリをスキャンしてTaskSpec[]を返却 |
| buildDependencyGraph     | depends_onからMap<string, TaskSpec[]>を構築      |
| detectCycles             | DFSで循環検出                                    |
| topologicalSort          | Kahn's algorithmで実行順序を決定                 |
| estimateTime             | タスク数 × 5分で概算                             |
| executeTask              | 単一タスク実行、TaskResultを返却                 |
| summarizeResults         | completed/failed/skippedをカウント               |

## 統合テスト連携【必須】

| 実装項目         | 内容                                                                  |
| ---------------- | --------------------------------------------------------------------- |
| スクリプト接続   | ScriptExecutor → scripts/\*.js が正しく呼び出される                   |
| リソース読み込み | ResourceLoader → agents/, references/, assets/, schemas/ が読み込める |
| 依存関係解決     | トポロジカルソートが正しく動作する                                    |

## アーキテクチャ層別実装

| 層                   | 実装観点     | 実装ファイル配置                            |
| -------------------- | ------------ | ------------------------------------------- |
| バックエンド（Main） | サービス実装 | `apps/desktop/src/main/services/skill/`     |
| Shared               | 型定義       | `packages/shared/src/types/skillCreator.ts` |

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                | 仕様参照先                                   |
| ------------------ | ----------------------- | -------------------------------------------- |
| アーキテクチャ     | サービス層実装          | `aiworkflow-requirements: architecture-*.md` |
| 型安全性           | TypeScript strictモード | -                                            |
| エラーハンドリング | スクリプト失敗時の処理  | `aiworkflow-requirements: error-handling.md` |
| Script First       | 決定論的処理の委譲      | skill-creator core-principles.md             |

## 成果物

| 成果物              | パス                                                          | 説明             |
| ------------------- | ------------------------------------------------------------- | ---------------- |
| 型定義              | `packages/shared/src/types/skillCreator.ts`                   | 共有型定義       |
| ScriptExecutor      | `apps/desktop/src/main/services/skill/ScriptExecutor.ts`      | Script First基盤 |
| ResourceLoader      | `apps/desktop/src/main/services/skill/ResourceLoader.ts`      | 遅延読み込み基盤 |
| SkillCreatorService | `apps/desktop/src/main/services/skill/SkillCreatorService.ts` | メインサービス   |

## 完了条件

- [ ] skillCreator.ts に全型定義が実装されている
- [ ] ScriptExecutor.ts が実装されている
- [ ] ResourceLoader.ts が実装されている
- [ ] SkillCreatorService.ts が実装されている
- [ ] すべてのテストが成功状態（Green）
- [ ] 実装が最小限に抑えられている
- [ ] **本Phase内の全タスクを100%実行完了**

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test

# 確認項目
# - [ ] テストが成功することを確認（Green状態）
```

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. Task 5-1: 型定義実装（skillCreator.ts）
3. Task 5-2: ScriptExecutor実装
4. Task 5-3: ResourceLoader実装
5. Task 5-4: SkillCreatorService実装
6. Green状態の確認
7. 成果物の作成・配置

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] 全テストがGreen状態

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-9B-G-skill-creator-service --phase 5
```

## 次のPhase

Phase 6: テスト拡充
