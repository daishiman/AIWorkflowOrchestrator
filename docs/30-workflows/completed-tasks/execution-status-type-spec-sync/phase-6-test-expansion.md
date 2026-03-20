# Phase 6: テスト拡充 - SkillExecutionStatus 型同期の再監査

## メタ情報

| 項目   | 値                              |
| ------ | ------------------------------- |
| Phase  | 6                               |
| 機能名 | execution-status-type-spec-sync |
| 作成日 | 2026-03-20                      |

## 目的

Phase 4 の基礎テストに加え、root parity、planned wording、docs-only blocker 記録、ready path の網羅性、validator 一式を拡充確認する。

## 実行タスク

- parity テスト: `.claude` / `.agents` の root drift を検出する
- planned wording 検査: docs-only の保留表現を残さない
- blocker 記録確認: blocked path の根拠が残っているか見る
- cross-reference 再確認: ready path の参照漏れを洗う
- validator 回帰確認: task-spec validator 群を current warning 0 で再確認する

### タスク1: mirror parity テスト

### タスク2: planned wording 残存チェック

### タスク3: docs-only blocker 記録確認

### タスク4: ready path の cross-reference 再確認

### タスク5: validator 回帰確認

## 参照資料

| 資料名               | パス                                                                                    | 説明         |
| -------------------- | --------------------------------------------------------------------------------------- | ------------ |
| Phase 4 テストケース | `outputs/phase-4/test-cases.md`                                                         | 基礎テスト   |
| Phase 5 実装サマリー | `outputs/phase-5/implementation-summary.md`                                             | 分岐実施結果 |
| validation matrix    | `.claude/skills/task-specification-creator/references/spec-update-validation-matrix.md` | validator 群 |

## 実行手順

### ステップ1: parity と validator 前提を拡充確認する

| テストID | 内容                   | コマンド                                                                                                                                         | 期待結果            |
| -------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------- |
| T6-1     | aiworkflow root parity | `diff -qr .claude/skills/aiworkflow-requirements .agents/skills/aiworkflow-requirements`                                                         | diff 0              |
| T6-2     | task-spec root parity  | `diff -qr .claude/skills/task-specification-creator .agents/skills/task-specification-creator`                                                   | diff 0              |
| T6-3     | workflow validator     | `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/execution-status-type-spec-sync --json` | error 0 / warning 0 |

### ステップ2: docs-only 固有の漏れを検査する

| テストID | 内容                                      | コマンド                                                                              | 期待結果                         |
| -------- | ----------------------------------------- | ------------------------------------------------------------------------------------- | -------------------------------- | ------------------------------------------------------------------ | ----------- |
| T6-4     | planned wording 残存                      | `rg -n "仕様策定のみ                                                                  | 実行予定                         | 保留として記録" docs/30-workflows/execution-status-type-spec-sync` | 該当なし    |
| T6-5     | blocker 記録の存在                        | `rg -n "blocked                                                                       | Task12 implementation not landed | readiness" docs/30-workflows/execution-status-type-spec-sync`      | 0件ではない |
| T6-6     | `unassigned-task-detection.md` 名称の使用 | `rg -n "unassigned-task-detection" docs/30-workflows/execution-status-type-spec-sync` | 0件ではない                      |

### ステップ3: T4 系列の回帰を再実行する

| テストID | 内容                                           | コマンド                                               | 期待結果                   |
| -------- | ---------------------------------------------- | ------------------------------------------------------ | -------------------------- | -------------------------------------------------------------------------------------------- | ---------------------------------- |
| T6-7     | T4 readiness 回帰                              | `sed -n '360,390p' packages/shared/src/types/skill.ts` | current reality を維持     |
| T6-8     | ready path refs / blocked path baseline 再確認 | `rg -n "interfaces-agent-sdk-integration               | arch-state-management-core | blocked" docs/30-workflows/execution-status-type-spec-sync`                                  | ready / blocked の両方が確認できる |
| T6-9     | Phase 5 初回検証の継承確認                     | `rg -n "validate-phase-output                          | diff -qr                   | generate-index" docs/30-workflows/execution-status-type-spec-sync/phase-5-implementation.md` | 初回検証が明記されている           |

### ステップ4: validator 一式を実行する

| テストID | 内容                   | コマンド                                                                                                                                         | 期待結果            |
| -------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------- |
| T6-10    | quick validate         | `node .claude/skills/task-specification-creator/scripts/quick_validate.js docs/30-workflows/execution-status-type-spec-sync`                     | error 0 / warning 0 |
| T6-11    | validate all           | `node .claude/skills/task-specification-creator/scripts/validate_all.js docs/30-workflows/execution-status-type-spec-sync`                       | error 0 / warning 0 |
| T6-12    | phase output validator | `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/execution-status-type-spec-sync --phase 6`    | error 0 / warning 0 |
| T6-13    | spec verifier          | `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/execution-status-type-spec-sync --json` | error 0 / warning 0 |
| T6-14    | root diff              | `diff -qr .claude/skills/task-specification-creator .agents/skills/task-specification-creator`                                                   | diff 0              |

## 統合テスト連携（Phase 6）

| 検証項目       | 方法         | 期待結果                               |
| -------------- | ------------ | -------------------------------------- |
| root parity    | T6-1, T6-2   | diff 0                                 |
| validator 前提 | T6-3         | current error 0 / warning 0            |
| docs-only 漏れ | T6-4〜T6-6   | planned wording なし、blocked 記録あり |
| 回帰確認       | T6-7〜T6-9   | current/baseline が混線しない          |
| validator 一式 | T6-10〜T6-14 | current error 0 / warning 0            |

## 成果物

| 成果物         | パス                                       | 説明               |
| -------------- | ------------------------------------------ | ------------------ |
| 拡充テスト結果 | `outputs/phase-6/expanded-test-results.md` | T6-1〜T6-14 の結果 |

## 完了条件

- [ ] root parity テストが定義されている
- [ ] docs-only 固有の漏れ検査が定義されている
- [ ] `unassigned-task-detection.md` 名称が仕様へ反映されている
- [ ] `quick_validate.js` / `validate_all.js` / `validate-phase-output.js` / `verify-all-specs.js` / `diff -qr` が定義されている
- [ ] pass 条件が current error 0 / warning 0 になっている
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. parity テスト設計
3. docs-only 漏れ検査設計
4. T4 回帰再確認
5. validator 一式の定義
6. 成果物作成
7. 完了条件の検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/execution-status-type-spec-sync --phase 6
```

## 次のPhase

Phase 7: カバレッジ確認
