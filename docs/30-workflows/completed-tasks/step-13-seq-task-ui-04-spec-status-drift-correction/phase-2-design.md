# Phase 2: 設計

## メタ情報

| 項目       | 内容                                |
| ---------- | ----------------------------------- |
| Phase      | 2                                   |
| Phase名    | 設計                                |
| 機能名     | spec-status-drift-correction        |
| 対象機能   | TASK-UI-04 仕様書ステータス乖離修正 |
| 前提Phase  | Phase 1: 要件定義                   |
| 次Phase    | Phase 3: 設計レビュー               |
| ステータス | completed                           |
| 作成日     | 2026-04-06                          |

## 目的

Phase 1 で確定した乖離インベントリに基づき、具体的な修正計画（どのファイルをどう更新するか）と completed-tasks 移動計画を策定する。

## 実行タスク

### Task 1: artifacts.json 修正計画

各タスクの artifacts.json に対する具体的な変更を設計する。

| タスクID   | 現行 status  | 修正後 status | phases 更新                              | 備考                               |
| ---------- | ------------ | ------------- | ---------------------------------------- | ---------------------------------- |
| TASK-P0-01 | in_progress  | completed     | 全 phase → completed                     | コード・テスト完全実装済み         |
| TASK-P0-02 | spec_created | completed     | 実装済み phase → completed               | recordVerifyPass 等実装済み        |
| TASK-P0-04 | spec_created | completed     | 実装済み phase → completed               | hasDynamicResourcePipeline 済み    |
| TASK-P0-05 | spec_created | completed     | 実装済み phase → completed               | \_executeInternal パイプライン済み |
| TASK-P0-06 | spec_created | completed     | 実装済み phase → completed               | ConversationalInterview.tsx 済み   |
| TASK-P0-07 | spec_created | TBD           | Phase 1 調査結果に依存                   | 動的解決状態の検証が必要           |
| TASK-P0-08 | spec_created | in_progress   | 実装済み phase → completed, 残 → pending | 部分実装の可能性あり               |
| TASK-P0-09 | in_progress  | completed     | 全 phase → completed                     | governance/ 完全実装済み           |

### Task 2: index.md 修正計画

各タスクの index.md のメタ情報テーブルにおけるステータス行を更新する計画を策定する。

- `| ステータス     | spec_created |` → `| ステータス     | completed |`
- 更新日を修正実行日に更新する

### Task 3: completed-tasks 移動計画

完了タスクのディレクトリを `completed-tasks/` に移動する計画を策定する。

```
# 移動計画（ステータスが completed に確定したタスクのみ）
docs/30-workflows/skill-creator-agent-sdk-lane/step-10-seq-task-p0-02-... → docs/30-workflows/completed-tasks/
docs/30-workflows/skill-creator-agent-sdk-lane/step-10-seq-task-p0-04-... → docs/30-workflows/completed-tasks/
# ... 対象タスクごとに同様
```

移動時の注意:

- 相互参照リンクの確認（他タスクからの参照が壊れないか）
- executor-guide.md のリンク更新
- 親 index.md のリンク更新

### Task 4: 残作業記録テンプレート

部分完了タスク（TASK-P0-07, TASK-P0-08 等）に対する残作業記録のテンプレートを設計する。

```markdown
## 残作業記録

| 項目           | 内容             |
| -------------- | ---------------- |
| タスクID       | TASK-P0-XX       |
| 現行ステータス | in_progress      |
| 完了済み作業   | （具体的に列挙） |
| 残作業         | （具体的に列挙） |
| ブロッカー     | （あれば記載）   |
| 見積もり       | （残作業の規模） |
```

### Task 5: executor-guide.md 更新計画

executor-guide.md のタスク一覧テーブルにステータス列を追加または更新する計画を策定する。

## 参照資料

| 資料名               | パス                                                               | 説明                   |
| -------------------- | ------------------------------------------------------------------ | ---------------------- |
| 乖離インベントリ     | `outputs/phase-1/status-drift-inventory.md`                        | Phase 1 の調査結果     |
| ステータス抽出マップ | `outputs/phase-1/spec-extraction-map.md`                           | Phase 1 の status 一覧 |
| executor-guide       | `docs/30-workflows/skill-creator-agent-sdk-lane/executor-guide.md` | 更新対象               |

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

| 成果物   | パス                                 | 説明                                   |
| -------- | ------------------------------------ | -------------------------------------- |
| 修正計画 | `outputs/phase-2/correction-plan.md` | ファイルごとの具体的修正内容と移動計画 |

## 完了条件

- [ ] 全タスクの artifacts.json 修正内容が確定している
- [ ] 全タスクの index.md 修正内容が確定している
- [ ] completed-tasks 移動計画が策定されている
- [ ] 残作業記録テンプレートが設計されている
- [ ] executor-guide.md 更新計画が策定されている
- [ ] 相互参照リンクへの影響が評価されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 3: 設計レビュー](./phase-3-design-review.md)
