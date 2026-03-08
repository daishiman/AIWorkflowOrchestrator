# Phase 12 証跡集約バンドル

## メタ情報

| 項目       | 値                   |
| ---------- | -------------------- |
| タスクID   | <TASK-ID>            |
| 監査実行日 | <YYYY-MM-DD>         |
| 監査実行者 | <lead/SubAgent名>    |

## 2Workflow監査結果サマリー

| 項目                         | spec_created workflow      | completed workflow         |
| ---------------------------- | -------------------------- | -------------------------- |
| workflowパス                 | docs/30-workflows/<PATH-1> | docs/30-workflows/<PATH-2> |
| verify-all-specs violations  | <数値>                     | <数値>                     |
| validate-phase-output errors | <数値>                     | <数値>                     |
| 監査日時                     | <ISO 8601>                 | <ISO 8601>                 |

## verify-all-specs 詳細

### spec_created workflow

| #   | 違反内容 | 種別 | 重要度 |
| --- | -------- | ---- | ------ |

### completed workflow

| #   | 違反内容 | 種別 | 重要度 |
| --- | -------- | ---- | ------ |

## validate-phase-output 詳細

### spec_created workflow

| #   | エラー内容 | Phase | 対処 |
| --- | ---------- | ----- | ---- |

### completed workflow

| #   | エラー内容 | Phase | 対処 |
| --- | ---------- | ----- | ---- |

## Task実体確認チェックリスト

### Task 1: 実装ガイド

- [ ] 1-1: implementation-guide.md が存在する
- [ ] 1-2: Part 1 セクションが存在する
- [ ] 1-3: Part 1 に日常例えが含まれる
- [ ] 1-4: Part 2 セクションが存在する
- [ ] 1-5: API/IPC/Component文書が存在する

### Task 3: documentation-changelog

- [ ] 3-1: documentation-changelog.md が存在する
- [ ] 3-2: 変更記録が1件以上存在する

### Task 4: 未タスク検出

- [ ] 4-1: unassigned-task-detection.md が存在する（0件でも必須）
- [ ] 4-2: 検出した未タスクが3ステップ全完了している

### Task 5: スキルフィードバック・LOGS更新

- [ ] 5-1: skill-feedback-report.md が存在する（改善点なしでも必須）
- [ ] 5-2: aiworkflow-requirements/LOGS.md が更新されている
- [ ] 5-3: task-specification-creator/LOGS.md が更新されている

## スクリーンショット証跡

### 判定: N/A（UIタスクではないため） / UIタスクの場合

| #   | チェック項目     | コマンド/確認方法              | 結果    |
| --- | ---------------- | ------------------------------ | ------- |
| S-1 | ファイル実在     | ls -la <path>                  | OK/NG   |
| S-2 | 取得日確認       | stat -f "%Sm" <path>           | <日付>  |
| S-3 | 取得日が合理的か | ブランチ作成日以降             | OK/NG   |
| S-4 | 内容目視確認     | 該当画面と一致                 | OK/NG   |

## current/baseline分離

### spec_created workflow

#### Baseline Violations（タスク着手前から存在）

| #   | 違反内容 | 検出元スクリプト | 初検出タスク |
| --- | -------- | ---------------- | ------------ |

**Baseline合計**: <N>件

#### Current Violations（今回のタスクで新規発生）

| #   | 違反内容 | 検出元スクリプト | 対処 |
| --- | -------- | ---------------- | ---- |

**Current合計**: <N>件

### completed workflow

#### Baseline Violations（タスク着手前から存在）

| #   | 違反内容 | 検出元スクリプト | 初検出タスク |
| --- | -------- | ---------------- | ------------ |

**Baseline合計**: <N>件

#### Current Violations（今回のタスクで新規発生）

| #   | 違反内容 | 検出元スクリプト | 対処 |
| --- | -------- | ---------------- | ---- |

**Current合計**: <N>件

### 統合判定

| Workflow     | Current | Baseline | 判定     |
| ------------ | ------- | -------- | -------- |
| spec_created | 0       | <N>      | PASS     |
| completed    | 0       | <N>      | PASS     |
| **統合結果** | **0**   | **<N>**  | **PASS** |

- **判定基準**: `currentViolations.total === 0`（全workflowの合算）
- **Baseline違反の扱い**: 未タスクとして別途管理

## 台帳同期チェック

- [ ] task-workflow.md 完了台帳に記録済み
- [ ] task-workflow.md 残課題テーブル更新済み（該当時）
- [ ] lessons-learned.md 更新済み（新規教訓検出時）
- [ ] aiworkflow-requirements/LOGS.md 更新済み
- [ ] task-specification-creator/LOGS.md 更新済み
- [ ] aiworkflow-requirements/SKILL.md 変更履歴更新済み
- [ ] task-specification-creator/SKILL.md 変更履歴更新済み
