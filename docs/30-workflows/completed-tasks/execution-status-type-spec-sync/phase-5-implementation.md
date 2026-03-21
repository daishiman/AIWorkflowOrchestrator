# Phase 5: 実装 - SkillExecutionStatus 型同期の再監査

## メタ情報

| 項目   | 値                              |
| ------ | ------------------------------- |
| Phase  | 5                               |
| 機能名 | execution-status-type-spec-sync |
| 作成日 | 2026-03-20                      |

## 目的

Phase 1 の readiness 判定に従い、`ready` なら canonical spec を同期し、`blocked` なら blocker と停止条件を記録する。

## 実行タスク

- P65 実値照合: `skill.ts` の現値を固定する
- ready path 更新: canonical spec を same change set で同期する
- blocked path 記録: 前提未充足なら停止理由を残す
- index / mirror 実施: 後続 validator 用の前提をこの Phase で一度実行して固定する

### タスク1: P65 実値照合

### タスク2: ready path の system spec 更新

### タスク3: blocked path の停止記録

### タスク4: index / mirror 同期と初回検証

## 参照資料

| 資料名           | パス                                                                                    | 説明           |
| ---------------- | --------------------------------------------------------------------------------------- | -------------- |
| Phase 1 要件     | `outputs/phase-1/requirements.md`                                                       | readiness 判定 |
| Phase 2 設計     | `outputs/phase-2/design.md`                                                             | update order   |
| Phase 4 テスト   | `outputs/phase-4/test-cases.md`                                                         | command suite  |
| interfaces       | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-integration.md` | 更新候補       |
| state management | `.claude/skills/aiworkflow-requirements/references/arch-state-management-core.md`       | 更新候補       |

## 実行手順

### ステップ1: P65 で実値を固定する

```bash
sed -n '360,390p' packages/shared/src/types/skill.ts
```

この結果を Phase 5 の冒頭に転記し、以降の記述は実値に従わせる。

### ステップ2: ready path を実行する

`review` / `improve_ready` / `reuse_ready` が実コードに存在する場合のみ、以下を同一 change set で実施する。

1. `interfaces-agent-sdk-integration.md` の `SkillExecutionStatus` テーブル更新
2. `arch-state-management-core.md` の状態配置ルール更新
3. `grep -rn "SkillExecutionStatus" .claude/skills/aiworkflow-requirements/references/` で確認対象を再分類
4. `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行する
5. `diff -qr .claude/skills/aiworkflow-requirements .agents/skills/aiworkflow-requirements` で mirror parity を確認する

### ステップ3: blocked path を実行する

実コードが 6 値のままなら以下を行う。

1. `system spec update blocked: Task12 implementation not landed` を記録する
2. system spec の本文更新は行わない
3. blocker を `documentation-changelog.md` と `system-spec-update-summary.md` に残す
4. `diff -qr .claude/skills/aiworkflow-requirements .agents/skills/aiworkflow-requirements` を実行し、mirror drift の有無だけは確認する

### ステップ4: index / mirror と初回 validator を実行する

ready / blocked のどちらでも、Phase 5 の時点で初回検証を行う。

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/execution-status-type-spec-sync --phase 5
diff -qr .claude/skills/aiworkflow-requirements .agents/skills/aiworkflow-requirements
```

task-spec root parity と index 再生成が対象に含まれる場合は、以下も実行する。

```bash
diff -qr .claude/skills/task-specification-creator .agents/skills/task-specification-creator
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
```

## 統合テスト連携（Phase 5）

| 検証項目                | 方法                                | 期待結果                           |
| ----------------------- | ----------------------------------- | ---------------------------------- |
| P65 実値照合            | `skill.ts` の抜粋を記録             | 実値に追随している                 |
| ready path              | 2ファイル更新 + refs 再分類         | canonical spec が同期される        |
| blocked path            | 更新停止を記録                      | future-state を書き込まない        |
| 初回 validator / parity | `validate-phase-output`, `diff -qr` | Phase 5 時点の差分状態が固定される |

## 成果物

| 成果物       | パス                                        | 説明                     |
| ------------ | ------------------------------------------- | ------------------------ |
| 実装サマリー | `outputs/phase-5/implementation-summary.md` | ready/blocked の実施結果 |

## 完了条件

- [ ] P65 実値が記録されている
- [ ] ready 時の更新対象と blocked 時の停止条件が分離されている
- [ ] system spec 更新は ready 時のみ行うと明記されている
- [ ] 同一コミットではなく same change set を使うことが明記されている
- [ ] index / mirror / initial validator が Phase 5 の責務として定義されている
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. P65 実値照合
3. ready path 設計
4. blocked path 設計
5. 成果物作成
6. 完了条件の検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/execution-status-type-spec-sync --phase 5
```

## 次のPhase

Phase 6: テスト拡充
