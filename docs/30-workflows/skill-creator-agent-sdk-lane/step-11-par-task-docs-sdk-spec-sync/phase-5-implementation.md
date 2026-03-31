# Phase 5: 実装

## メタ情報

| 項目   | 値                                  |
| ------ | ----------------------------------- |
| Phase  | 5                                   |
| 機能名 | step-11-par-task-docs-sdk-spec-sync |
| 作成日 | 2026-03-31                          |

## 目的

**コード変更なし、docs/仕様書のみ更新する。**

Phase 4 のテストマトリックスに従い、SDK-04（canonical path resync）と SDK-02（system spec 同期）の対象仕様書を安全な順番で更新し、same-wave remediation を実施する。

## SubAgent 分担

| SubAgent | 担当範囲                                                                                               | 実行形態         | 完了条件                                             |
| -------- | ------------------------------------------------------------------------------------------------------ | ---------------- | ---------------------------------------------------- |
| A        | `task-workflow-completed.md`                                                                           | 直列の起点       | current path の seed を固定                          |
| B        | `resource-map.md` / `quick-reference.md` / `topic-map.md`                                              | A 完了後に並列   | stale path 0 件                                      |
| C        | `architecture-overview-core.md` / `arch-electron-services-details-part2.md` / `api-ipc-system-core.md` | A 完了後に並列   | current owner / current contract / no future wording |
| D        | grep / validator / diff の再実行                                                                       | B/C 完了後に直列 | AC-1〜AC-10 を再確認                                 |

## 実行タスク

- SDK-04: `task-workflow-completed.md` の TASK-SDK-04 完了記録のパスを current path へ修正する
- SDK-04: `resource-map.md` の stale path を current path へ修正する
- SDK-04: `quick-reference.md` の stale path を current path へ修正する
- SDK-04: `topic-map.md` の stale path を current path へ修正する
- SDK-02: `architecture-overview-core.md` を `SkillCreatorWorkflowEngine` current owner として更新する
- SDK-02: `arch-electron-services-details-part2.md` の実装済みファクトを反映する
- SDK-02: `api-ipc-system-core.md` を実装済み契約に合わせて更新する

## 更新すべき仕様書のリスト

### SDK-04 対象（先に実施）

| ファイル                     | パス（相対）                                                                   | 優先度 |
| ---------------------------- | ------------------------------------------------------------------------------ | ------ |
| `task-workflow-completed.md` | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md` | 1      |
| `resource-map.md`            | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`               | 2      |
| `quick-reference.md`         | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`            | 3      |
| `topic-map.md`               | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`                  | 4      |

### SDK-02 対象（SDK-04 完了後に実施）

| ファイル                                  | パス（相対）                                                                                | 優先度 |
| ----------------------------------------- | ------------------------------------------------------------------------------------------- | ------ |
| `architecture-overview-core.md`           | `.claude/skills/aiworkflow-requirements/references/architecture-overview-core.md`           | 5      |
| `arch-electron-services-details-part2.md` | `.claude/skills/aiworkflow-requirements/references/arch-electron-services-details-part2.md` | 6      |
| `api-ipc-system-core.md`                  | `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`                  | 7      |

## 各仕様書で確認・修正すべき観点

### task-workflow-completed.md

- TASK-SDK-04 の完了記録に含まれるパスが `skill-creator-agent-sdk-lane/.../step-03-...` のままになっていないか確認する
- 旧パスを `docs/30-workflows/completed-tasks/step-03-par-task-04-user-interaction-bridge-and-phase-ui/` へ修正する
- 「完了済み」「checked」等のステータス表現が current state と一致していることを確認する
- `更新予定`、`後でやる`、`後続判断待ち`、`仕様策定のみ`、`実行予定`、`保留として記録` が残っていないことを確認する

### resource-map.md

- TASK-SDK-04 関連エントリの URL / パスが stale path を含んでいないか確認する
- `step-03-par-task-04-user-interaction-bridge-and-phase-ui` への参照がすべて completed-tasks 配下の current path を指すことを確認する
- リソースマップ全体のエントリ数と整合性を確認する

### quick-reference.md

- TASK-SDK-04 関連のクイックリファレンスエントリのパスが stale でないか確認する
- completed-tasks 配下の current path へのリンクになっていることを確認する
- 不要になった行・セクションが残っていないことを確認する

### topic-map.md

- TASK-SDK-04 に関連するトピックのパスが stale でないか確認する
- completed-tasks 配下の current path へのリンクになっていることを確認する
- `SkillCreatorWorkflowEngine` トピックに関連するエントリが current owner 化を反映しているか確認する

### architecture-overview-core.md

- `SkillCreatorWorkflowEngine` が「実装予定」「future」「will be」等の未実装表現で記述されていないか確認する
- workflow engine の owner として明確に現在形で記述されているか確認する
- 実装済みのアーキテクチャ構成と一致した記述になっているか確認する

### arch-electron-services-details-part2.md

- Electron サービス層の記述が実装前の状態（「将来的には」「予定」等）のままでないか確認する
- `SkillCreatorWorkflowEngine` に関連するサービス間の依存関係が現状コードと一致しているか確認する
- stale な IPC チャンネル名・メソッド名が残っていないか確認する

### api-ipc-system-core.md

- workflow engine 関連の IPC API 仕様が実装済みの契約を反映しているか確認する
- Phase/State トランジションの記述が `SkillCreatorWorkflowEngine` の実際の実装と一致しているか確認する
- 未実装として記述されているエンドポイントが実際は実装済みになっていないか確認する

## 更新手順

### ステップ1: SDK-04 の path drift を解消する

1. `task-workflow-completed.md` を開き、TASK-SDK-04 関連の旧 path を特定する
2. `rg "skill-creator-agent-sdk-lane.*step-03"` で stale path を洗い出す
3. 各エントリを current path（`completed-tasks/step-03-par-task-04-...`）へ置換する
4. `resource-map.md`、`quick-reference.md`、`topic-map.md` に同様の手順を適用する

### ステップ2: SDK-02 の system spec を更新する

1. `architecture-overview-core.md` の `SkillCreatorWorkflowEngine` 関連記述を特定する
2. future / 未実装表現を current owner 表現へ書き換える
3. `arch-electron-services-details-part2.md` の実装前記述を実装済みファクトへ更新する
4. `api-ipc-system-core.md` の IPC API 仕様を実装済み契約へ更新する

### ステップ3: 検証を行う

- `rg "skill-creator-agent-sdk-lane.*step-03"` で stale path が 0 件であることを確認する
- `rg "更新予定|後でやる|後続判断待ち|仕様策定のみ|実行予定|保留として記録"` で未完了表現が 0 件であることを確認する
- `git diff --name-only` で `.ts`、`.tsx`、`.test.ts` が含まれていないことを確認する

## 参照資料

| 資料名              | パス                                                                                              | 説明                             |
| ------------------- | ------------------------------------------------------------------------------------------------- | -------------------------------- |
| Phase 2 設計        | `phase-2-design.md`                                                                               | 更新対象と観点                   |
| Phase 4 test matrix | `outputs/phase-4/test-matrix.md`                                                                  | 実装後検証コマンド               |
| completed ledger    | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`                    | current fact の正本              |
| lessons             | `.claude/skills/aiworkflow-requirements/references/lessons-learned-phase12-workflow-lifecycle.md` | no-op 根拠と partial update 防止 |

## 成果物

| 成果物                    | パス                                           | 説明                         |
| ------------------------- | ---------------------------------------------- | ---------------------------- |
| 実装計画書                | `phase-5-implementation.md`                    | 更新すべき仕様書と観点の定義 |
| implementation sequencing | `outputs/phase-5/implementation-sequencing.md` | 更新手順の詳細・実施記録     |

## 完了条件

- [ ] SDK-04 対象 4 ファイルの stale path がすべて current path へ修正されている
- [ ] SDK-02 対象 3 ファイルの wording が current owner 化されている
- [ ] コード変更（`.ts`、`.tsx` 等）が行われていない
- [ ] Phase 4 のテストマトリックスを実行できる状態になっている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

1. 参照資料の確認
2. SDK-04 の path drift 解消（4 ファイル）
3. SDK-02 の system spec 更新（3 ファイル）
4. 検証コマンドの実行
5. 成果物の作成・配置
6. 完了条件の検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が最新の成果物名と整合している
- [ ] Phase 6 以降で再利用する検証導線が固定されている
