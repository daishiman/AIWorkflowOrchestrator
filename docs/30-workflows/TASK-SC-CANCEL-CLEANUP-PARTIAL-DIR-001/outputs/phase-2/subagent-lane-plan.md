# SubAgent Lane Plan

## Lane 構成

| Lane   | 役割                                   | 実行形態 | 担当 Phase                  |
| ------ | -------------------------------------- | -------- | --------------------------- |
| Lane A | skill準拠監査                          | 並列     | Phase 3（レビュー観点提供） |
| Lane B | 30思考法による多角分析                 | 並列     | Phase 3（設計妥当性検証）   |
| Lane C | phase spec 再構成と canonical 命名整備 | 直列     | Phase 4〜12                 |

## Lane A: skill 準拠監査

### 監査対象

- `.claude/skills/task-specification-creator/SKILL.md`
- `.claude/skills/task-specification-creator/references/phase-templates.md`
- `.claude/skills/aiworkflow-requirements/SKILL.md`

### 監査観点

| 観点                | チェック項目                                      |
| ------------------- | ------------------------------------------------- |
| mandatory artifacts | Phase 1-13 の成果物が artifact registry にある    |
| phase gate          | Phase 間のゲート条件が定義されている              |
| task classification | `NON_VISUAL code task` 分類が正しく適用されている |
| Phase 11/12         | `NON_VISUAL` 代替証跡方針が整合している           |

## Lane B: 30思考法による多角分析

### 適用思考法と目的

| 系統         | 思考法               | 本 task での目的                          |
| ------------ | -------------------- | ----------------------------------------- |
| 論理分析系   | 批判的思考、演繹思考 | 実コードと仕様書の矛盾を明確化            |
| 構造分解系   | MECE、プロセス思考   | artifact / gate の漏れを排除              |
| メタ・抽象系 | メタ思考、抽象化思考 | 個別修正でなく骨格整列へ                  |
| 発想系       | 逆説思考、if 思考    | `docs-only` 分類が誤りである理由の強化    |
| システム系   | 因果関係分析         | 命名揺れが close-out 漏れを生む因果を断つ |

## Lane C: spec 再構成

### 実行フロー

```
Phase 1 成果物（要件定義・監査）
    ↓
Phase 2 成果物（設計・lane plan）
    ↓
Phase 3 成果物（Lane A + B のレビュー結果を統合）
    ↓
Phase 4〜10 成果物（Lane C が直列で作成）
    ↓
Phase 11〜12 成果物（NON_VISUAL 代替証跡）
    ↓
Phase 13 成果物（blocked: user 承認待ち）
```

## 並列実行可能範囲

- Phase 3 の Lane A と Lane B は並列実行可能
- Phase 4〜10 の成果物作成は基本直列（依存関係あり）
- Phase 11 と Phase 12 の一部タスクは並列実行可能
