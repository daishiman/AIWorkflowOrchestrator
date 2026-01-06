# Phase 1: 要件定義 - CI/CDカバレッジ閾値統合

## メタ情報

| 項目       | 内容                      |
| ---------- | ------------------------- |
| Phase      | 1                         |
| Phase名    | 要件定義                  |
| 前提Phase  | なし                      |
| 後続Phase  | Phase 2（設計）           |
| ステータス | 未実施                    |
| 作成日     | 2026-01-05                |
| 機能名     | cicd-coverage-integration |

---

## 目的

CI/CDカバレッジ閾値統合に必要な要件を明確化し、受け入れ基準を定義する。

## 背景

vitest.config.tsにカバレッジ閾値（80%）は設定済みだが、CI/CDパイプラインには未統合。PRマージ前に自動的にカバレッジをチェックする仕組みが必要。

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。

### スキル1: functional-non-functional-requirements

**パス**: `.claude/skills/functional-non-functional-requirements/SKILL.md`

**Trigger条件**:

- 機能要件と非機能要件の分類が必要
- FR/NFRの明確な区別が求められる

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- 機能要件リスト
- 非機能要件リスト

---

### スキル2: acceptance-criteria-writing

**パス**: `.claude/skills/acceptance-criteria-writing/SKILL.md`

**Trigger条件**:

- 受け入れ基準の作成が必要
- Given-When-Then形式での記述

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- 受け入れ基準定義書

---

## 参照資料

| 参照資料           | パス                                                                  | 内容                   |
| ------------------ | --------------------------------------------------------------------- | ---------------------- |
| 元タスク指示書     | `docs/30-workflows/unassigned-task/task-cicd-coverage-integration.md` | タスクの背景・目的     |
| 現行CIワークフロー | `.github/workflows/ci.yml`                                            | 現状のCI設定           |
| Vitestカバレッジ   | `vitest.config.ts`                                                    | 現行カバレッジ閾値設定 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料   | パス                                                           | 内容             |
| ---------- | -------------------------------------------------------------- | ---------------- |
| CI/CD仕様  | `.claude/skills/aiworkflow-requirements/references/ci-cd.md`   | CI/CD設計方針    |
| テスト戦略 | `.claude/skills/aiworkflow-requirements/references/testing.md` | テスト基準・閾値 |

---

## 実行手順

### ステップ1: 現状分析

現行CI/CDワークフローを分析し、カバレッジチェックの現状を把握する。

```bash
# 現行CIワークフロー確認
cat .github/workflows/ci.yml | grep -A 10 coverage

# Vitestカバレッジ設定確認
cat vitest.config.ts | grep -A 20 coverage
```

### ステップ2: 機能要件抽出

functional-non-functional-requirementsスキルを使用して、機能要件を抽出する。

**機能要件候補**:

1. CIでカバレッジチェックを実行する
2. 閾値未達でPRをブロックする
3. Codecovでカバレッジを可視化する
4. PRにカバレッジ差分をコメントする

### ステップ3: 非機能要件抽出

**非機能要件候補**:

1. カバレッジチェックは5分以内に完了する
2. Codecovトークンは安全に管理する
3. 既存のCIジョブに影響を与えない

### ステップ4: 受け入れ基準作成

acceptance-criteria-writingスキルを使用して、各要件の受け入れ基準を定義する。

---

## 成果物

| 成果物       | パス                                         | 内容           |
| ------------ | -------------------------------------------- | -------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | FR/NFR定義     |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | AC定義         |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 実装範囲明確化 |

---

## 完了条件

- [ ] 機能要件が抽出されている
- [ ] 非機能要件が抽出されている
- [ ] 各要件に受け入れ基準がある
- [ ] スコープ（含むもの/含まないもの）が明確
- [ ] 現行CI設定との整合性が確認されている
- [ ] artifacts.jsonが更新されている

---

## スキルフィードバック記録

Phase完了後、以下を記録してください:

```markdown
## Phase 1 実行記録

### 使用スキル

- functional-non-functional-requirements: {{result}}
- acceptance-criteria-writing: {{result}}

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/cicd-coverage-integration/phase-2-design.md`
