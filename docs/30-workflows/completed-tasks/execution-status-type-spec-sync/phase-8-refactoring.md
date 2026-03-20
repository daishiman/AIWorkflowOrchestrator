# Phase 8: リファクタリング - SkillExecutionStatus 型同期の再監査

## メタ情報

| 項目   | 値                              |
| ------ | ------------------------------- |
| Phase  | 8                               |
| 機能名 | execution-status-type-spec-sync |
| 作成日 | 2026-03-20                      |

## 目的

workflow 本文の表現、成果物名、参照パスを統一し、future-state 前提や stale path を除去する。

## 実行タスク

- stale path 除去: 非実在参照を消す
- 成果物名統一: 正式名称へ揃える
- 用語統一: ready/blocked と docs-only の語彙を固定する

### タスク1: stale path の除去

### タスク2: 成果物名の統一

### タスク3: ready/blocked 用語の統一

## 参照資料

| 資料名               | パス                                                                             | 説明                 |
| -------------------- | -------------------------------------------------------------------------------- | -------------------- |
| Phase 1 要件         | `outputs/phase-1/requirements.md`                                                | readiness 契約       |
| Phase 2 設計         | `outputs/phase-2/design.md`                                                      | 分岐設計             |
| Phase 5 実装サマリー | `outputs/phase-5/implementation-summary.md`                                      | 実施分岐             |
| Phase 6 拡充結果     | `outputs/phase-6/expanded-test-results.md`                                       | parity / naming 補助 |
| Phase 7 カバレッジ   | `outputs/phase-7/coverage-report.md`                                             | 漏れ箇所             |
| phase 12 template    | `.claude/skills/task-specification-creator/references/phase-template-phase12.md` | 成果物名             |
| spec update workflow | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`   | 命名規約             |

## 実行手順

### ステップ1: stale path を除去する

- 実在しない Task12 設計パスを削除する
- `resource-map` / `topic-map` / canonical refs へ統一する

### ステップ2: 成果物名を統一する

- `phase-9-quality-assurance.md`
- `unassigned-task-detection.md`
- `phase12-task-spec-compliance-check.md`

### ステップ3: 用語を統一する

- `same change set`
- `ready` / `blocked`
- `docs-only`

## 統合テスト連携（Phase 8）

| 検証項目   | 方法                 | 期待結果                    |
| ---------- | -------------------- | --------------------------- |
| stale path | `test -f` と `rg -n` | 非実在参照なし              |
| 成果物名   | `rg -n`              | 正式名称に統一              |
| 用語統一   | 目視レビュー         | future-state 前提が残らない |

## 成果物

| 成果物               | パス                                    | 説明     |
| -------------------- | --------------------------------------- | -------- |
| リファクタリング結果 | `outputs/phase-8/refactoring-report.md` | 修正内容 |

## 完了条件

- [ ] stale path が除去されている
- [ ] 正式成果物名へ統一されている
- [ ] ready/blocked 用語が統一されている
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. stale path の除去
3. 成果物名の統一
4. 用語統一
5. 成果物作成
6. 完了条件の検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/execution-status-type-spec-sync --phase 8
```

## 次のPhase

Phase 9: 品質保証
