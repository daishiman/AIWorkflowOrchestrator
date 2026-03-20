# Phase 9: 品質保証 - SkillExecutionStatus 型同期の再監査

## メタ情報

| 項目   | 値                              |
| ------ | ------------------------------- |
| Phase  | 9                               |
| 機能名 | execution-status-type-spec-sync |
| 作成日 | 2026-03-20                      |

## 目的

現行命名規約で validator / parity / readiness 整合を確認し、Phase 10 に進める品質ゲートを定義する。

## 実行タスク

- workflow validator: workflow 本文の整合を検証する
- root parity: `.claude` / `.agents` の差分を確認する
- readiness 整合: Phase 1 と実値が一致するか確認する
- index 再生成確認: topic-map / indexes の最新性を確認する

### タスク1: workflow validator

### タスク2: root parity

### タスク3: readiness 整合

### タスク4: index 再生成確認

## 参照資料

| 資料名               | パス                                                                                    | 説明         |
| -------------------- | --------------------------------------------------------------------------------------- | ------------ |
| Phase 5 実装サマリー | `outputs/phase-5/implementation-summary.md`                                             | 分岐結果     |
| Phase 8 結果         | `outputs/phase-8/refactoring-report.md`                                                 | 命名統一結果 |
| validation matrix    | `.claude/skills/task-specification-creator/references/spec-update-validation-matrix.md` | validator 群 |
| spec update step1    | `.claude/skills/task-specification-creator/references/spec-update-step1-completion.md`  | Step 1-G     |

## 実行手順

### ステップ1: validator を実行する

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/execution-status-type-spec-sync --phase 9
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/execution-status-type-spec-sync --json
```

Phase 9 では quality gate に必要な即時判定を行い、Phase 12 Step 1-G ではその結果を成果物へ転記する。

| コマンド                   | Phase 9 での責務                            | Phase 12 Step 1-G での責務                        |
| -------------------------- | ------------------------------------------- | ------------------------------------------------- |
| `quick_validate.js`        | 追加実行して全体 warning 0 を確認してよい   | 実行結果を `system-spec-update-summary.md` へ転記 |
| `validate_all.js`          | 追加実行して family contract を確認してよい | validator summary として転記                      |
| `validate-phase-output.js` | 各 phase の即時品質を確認                   | 対象 phase の結果を一覧化                         |
| `verify-all-specs.js`      | workflow 全体整合を確認                     | JSON summary を転記                               |
| `diff -qr`                 | parity / drift の即時検出                   | 差分 0 または差分理由を転記                       |
| `generate-index.js`        | index 最新性を回復                          | 実更新対象として changelog に転記                 |

### ステップ2: root parity を確認する

```bash
diff -qr .claude/skills/aiworkflow-requirements .agents/skills/aiworkflow-requirements
diff -qr .claude/skills/task-specification-creator .agents/skills/task-specification-creator
```

### ステップ3: readiness と index を確認する

```bash
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
sed -n '360,390p' packages/shared/src/types/skill.ts
```

Phase 12 Step 1-G へ転記する validator summary を固めるため、full validation matrix も実行する。

```bash
node .claude/skills/task-specification-creator/scripts/quick_validate.js docs/30-workflows/execution-status-type-spec-sync
node .claude/skills/task-specification-creator/scripts/validate_all.js docs/30-workflows/execution-status-type-spec-sync
```

## 統合テスト連携（Phase 9）

| 検証項目               | 方法                                        | 期待結果            |
| ---------------------- | ------------------------------------------- | ------------------- |
| workflow validator     | `validate-phase-output`, `verify-all-specs` | error 0             |
| root parity            | `diff -qr`                                  | diff 0              |
| index 最新性           | `generate-index.js`                         | 正常終了            |
| readiness              | `skill.ts` 確認                             | Phase 1 判定と一致  |
| full validation matrix | `quick_validate`, `validate_all`            | error 0 / warning 0 |

## 成果物

| 成果物       | パス                                | 説明           |
| ------------ | ----------------------------------- | -------------- |
| 品質レポート | `outputs/phase-9/quality-report.md` | 品質ゲート結果 |

## 完了条件

- [ ] `phase-9-quality-assurance.md` 命名で統一されている
- [ ] validator が定義されている
- [ ] root parity が定義されている
- [ ] readiness と index の確認手順が定義されている
- [ ] Phase 9 の即時実行と Phase 12 Step 1-G の転記責務が分離されている
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. validator 定義
3. root parity 定義
4. readiness / index 定義
5. 成果物作成
6. 完了条件の検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/execution-status-type-spec-sync --phase 9
```

## 次のPhase

Phase 10: 最終レビュー
