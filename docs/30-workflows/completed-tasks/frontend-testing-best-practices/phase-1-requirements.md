# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 1                               |
| Phase名    | 要件定義                        |
| 前提Phase  | なし                            |
| 後続Phase  | Phase 2                         |
| ステータス | 未実施                          |
| 作成日     | 2026-01-04                      |
| 機能名     | frontend-testing-best-practices |

---

## 目的

タスクの目的、スコープ、受け入れ基準を明文化する。

## 背景

現在のプロジェクトには以下の課題が存在する：

- 外部APIへの依存によるテストの不安定性
- ビジュアルテストランナーの不在によるデバッグ効率の低下
- E2Eテストのカバレッジ不足（4本のみ）
- カバレッジ閾値未設定による品質基準の曖昧さ

---

## 使用エージェント

| エージェント    | パス                                | 選定理由                       |
| --------------- | ----------------------------------- | ------------------------------ |
| frontend-tester | `.claude/agents/frontend-tester.md` | フロントエンドテスト戦略に特化 |

**代替候補**: `.claude/agents/unit-tester.md`

---

## 使用スキル

| スキル名                               | パス                                                             | 活用方法             | 選定理由               |
| -------------------------------------- | ---------------------------------------------------------------- | -------------------- | ---------------------- |
| functional-non-functional-requirements | `.claude/skills/functional-non-functional-requirements/SKILL.md` | FR/NFR分類           | 要件整理の基礎         |
| acceptance-criteria-writing            | `.claude/skills/acceptance-criteria-writing/SKILL.md`            | 受け入れ基準作成     | 完了条件の明確化       |
| boundary-value-analysis                | `.claude/skills/boundary-value-analysis/SKILL.md`                | エッジケース洗い出し | テストケース網羅性向上 |

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料       | パス                                                                        | 内容           |
| -------------- | --------------------------------------------------------------------------- | -------------- |
| 元タスク指示書 | `docs/30-workflows/unassigned-task/task-frontend-testing-best-practices.md` | 詳細要件       |
| テスト戦略仕様 | `.claude/skills/frontend-testing/SKILL.md`                                  | テスト設計方針 |

---

## 実行手順

### ステップ1: 現状分析

```bash
# 現在のテストカバレッジ確認
pnpm test:coverage

# テストファイル数確認
find apps packages -name "*.test.ts*" -not -path "*/node_modules/*" | wc -l

# E2Eテスト一覧
ls apps/desktop/e2e/
```

### ステップ2: 要件抽出

functional-non-functional-requirementsスキルを使用して、以下を分類：

**機能要件（FR）**:

1. MSW導入によるAPIモック
2. Vitest UI導入
3. E2Eテスト10-15本実装
4. カバレッジ閾値設定
5. テストユーティリティ整備
6. CI/CD統合

**非機能要件（NFR）**:

1. テスト実行時間: 10秒以下
2. カバレッジ: 80%以上
3. E2E flaky rate: 0%
4. 新規開発者がドキュメントだけで実行可能

### ステップ3: 受け入れ基準作成

acceptance-criteria-writingスキルを使用して、各要件の受け入れ基準を定義。

---

## 成果物

| 成果物       | パス                                         | 内容             |
| ------------ | -------------------------------------------- | ---------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | 機能・非機能要件 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | AC定義           |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 実装範囲         |

---

## 完了条件

- [ ] 全要件が抽出されている
- [ ] 各要件に受け入れ基準がある
- [ ] FR/NFRが分類されている
- [ ] スコープ（含むもの/含まないもの）が明確
- [ ] 現在のカバレッジ率が把握されている
- [ ] 外部API依存箇所がリストアップされている

---

## 依存関係

- **前提**: なし
- **後続**: Phase 2 へ進む

---

## スキルフィードバック記録

| スキル                                 | 結果 | 備考 |
| -------------------------------------- | ---- | ---- |
| functional-non-functional-requirements | -    | -    |
| acceptance-criteria-writing            | -    | -    |
| boundary-value-analysis                | -    | -    |

---

## 次のPhase

`docs/30-workflows/frontend-testing-best-practices/phase-2-design.md`
