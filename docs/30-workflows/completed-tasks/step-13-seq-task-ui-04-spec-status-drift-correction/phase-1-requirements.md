# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                |
| ---------- | ----------------------------------- |
| Phase      | 1                                   |
| Phase名    | 要件定義                            |
| 機能名     | spec-status-drift-correction        |
| 対象機能   | TASK-UI-04 仕様書ステータス乖離修正 |
| 前提Phase  | -                                   |
| 次Phase    | Phase 2: 設計                       |
| ステータス | completed                           |
| 作成日     | 2026-04-06                          |

## 目的

全タスク仕様書の現行ステータスと実際のコード実装状態を網羅的に洗い出し、乖離の全容を確定する。

## 実行タスク

### Task 1: 全タスク仕様書の現行ステータス抽出

対象ディレクトリ配下の全 artifacts.json から status フィールドを抽出し、一覧表を作成する。

```bash
# 全 artifacts.json の status を一括抽出
find docs/30-workflows/{skill-creator-agent-sdk-lane,completed-tasks} -name "artifacts.json" -exec echo "---" \; -exec echo {} \; -exec jq '.status, .metadata.taskId' {} \;

# 各 index.md のステータス行を抽出
grep -rn "ステータス" docs/30-workflows/{skill-creator-agent-sdk-lane,completed-tasks} --include="index.md"
```

対象タスク仕様書:

| タスクID   | ディレクトリ                                                                                        | artifacts.json の現行 status |
| ---------- | --------------------------------------------------------------------------------------------------- | ---------------------------- |
| TASK-P0-01 | `docs/30-workflows/completed-tasks/step-09-par-task-p0-01-verify-execution-engine-layer12`          | in_progress                  |
| TASK-P0-02 | `docs/30-workflows/completed-tasks/step-10-seq-task-p0-02-verify-improve-reverify-closed-loop`      | spec_created                 |
| TASK-P0-04 | `docs/30-workflows/completed-tasks/step-10-seq-task-p0-04-manifest-loader-default-activation`       | spec_created                 |
| TASK-P0-05 | `docs/30-workflows/completed-tasks/step-09-par-task-p0-05-execute-skill-file-writer-integration`    | spec_created                 |
| TASK-P0-06 | `docs/30-workflows/completed-tasks/step-09-par-task-p0-06-conversational-interview-ui`              | spec_created                 |
| TASK-P0-07 | `docs/30-workflows/completed-tasks/step-10-seq-task-p0-07-hardcoded-agent-names-dynamic-resolution` | spec_created                 |
| TASK-P0-08 | `docs/30-workflows/completed-tasks/step-10-seq-task-p0-08-session-resume-renderer-integration`      | spec_created                 |
| TASK-P0-09 | `docs/30-workflows/completed-tasks/step-10-seq-task-p0-09-claude-sdk-permission-hooks-governance`   | in_progress                  |

### Task 2: 実装状態の確認

各タスクについて、対応するコードファイルの実装状態を確認する。

```bash
# TASK-P0-01: VerificationEngine の実装状態
ls -la apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts
grep -c "describe\|it(" apps/desktop/src/main/services/runtime/__tests__/SkillCreatorVerificationEngine.test.ts

# TASK-P0-02: recordVerifyPass / requestReverify の実装状態
grep -n "recordVerifyPass\|requestReverify" apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts

# TASK-P0-04: hasDynamicResourcePipeline の実装状態
grep -rn "hasDynamicResourcePipeline" apps/desktop/src/main/services/runtime/

# TASK-P0-05: _executeInternal パイプラインの実装状態
grep -n "_executeInternal\|SkillFileWriter" apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts

# TASK-P0-06: ConversationalInterview UI の実装状態
ls -la apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx

# TASK-P0-07: 動的エージェント名解決の実装状態
grep -rn "agentName\|resolveAgent" apps/desktop/src/main/services/runtime/

# TASK-P0-08: session IPC handlers の実装状態
grep -n "session\|resume" apps/desktop/src/main/ipc/creatorHandlers.ts

# TASK-P0-09: governance ディレクトリの実装状態
ls -la apps/desktop/src/main/services/runtime/governance/
```

### Task 3: 乖離インベントリの作成

各タスクについて以下を記録する:

| タスクID   | 仕様書 status | 実装状態     | 乖離あり | 推奨アクション                    |
| ---------- | ------------- | ------------ | -------- | --------------------------------- |
| TASK-P0-01 | in_progress   | 完全実装済み | YES      | status → completed                |
| TASK-P0-02 | spec_created  | 実装済み     | YES      | status → completed or in_progress |
| TASK-P0-04 | spec_created  | 実装済み     | YES      | status → completed                |
| TASK-P0-05 | spec_created  | 実装済み     | YES      | status → completed                |
| TASK-P0-06 | spec_created  | 実装済み     | YES      | status → completed                |
| TASK-P0-07 | spec_created  | 要検証       | TBD      | 実装確認後に判定                  |
| TASK-P0-08 | spec_created  | 部分実装     | YES      | 残作業を記録                      |
| TASK-P0-09 | in_progress   | 完全実装済み | YES      | status → completed                |

### Task 4: スコープ境界の確定

- **含む**: artifacts.json の status 更新、index.md のステータス更新、completed-tasks 移動計画、残作業記録、executor-guide.md 更新
- **含まない**: コード変更、テスト追加、機能実装、新規タスク仕様書の作成

## 参照資料

| 資料名               | パス                                                               | 説明         |
| -------------------- | ------------------------------------------------------------------ | ------------ |
| lane 親 index        | `docs/30-workflows/skill-creator-agent-sdk-lane/index.md`          | タスク一覧   |
| executor-guide       | `docs/30-workflows/skill-creator-agent-sdk-lane/executor-guide.md` | 実行ガイド   |
| runtime ディレクトリ | `apps/desktop/src/main/services/runtime/`                          | 実装確認対象 |
| UI コンポーネント    | `apps/desktop/src/renderer/components/skill/`                      | 実装確認対象 |
| IPC ハンドラ         | `apps/desktop/src/main/ipc/creatorHandlers.ts`                     | 実装確認対象 |

### システム仕様（aiworkflow-requirements）

| 参照資料                       | パス                                                                                        | 内容                                      |
| ------------------------------ | ------------------------------------------------------------------------------------------- | ----------------------------------------- |
| Skill Creator Service仕様      | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference.md` | SkillCreatorService の公開 API と状態遷移 |
| タスクワークフローフェーズ仕様 | `.claude/skills/aiworkflow-requirements/references/task-workflow-phases.md`                 | Phase 1-13 のフェーズ遷移テーブル         |

## 統合テスト連携

- `artifacts.json` / `outputs/artifacts.json` / `index.md` の status 整合を維持する。
- Phase 11 の `manual-test-result.md` へ確認結果を引き継ぐ。
- Phase 12 の `implementation-guide.md` と `documentation-changelog.md` に更新理由と差分を反映する。

## 成果物

| 成果物               | パス                                        | 説明                                   |
| -------------------- | ------------------------------------------- | -------------------------------------- |
| ステータス抽出マップ | `outputs/phase-1/spec-extraction-map.md`    | 全タスクの仕様書 status 一覧           |
| ステータス乖離一覧   | `outputs/phase-1/status-drift-inventory.md` | 乖離の全容とタスクごとの推奨アクション |

## 完了条件

- [ ] 全タスク仕様書の artifacts.json status が抽出されている
- [ ] 全タスクの実装状態が確認されている
- [ ] 乖離インベントリが完成している
- [ ] 各タスクの推奨アクションが記録されている
- [ ] 含む / 含まないが明確である
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 2: 設計](./phase-2-design.md)
