# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                  |
| ---------- | --------------------- |
| Phase      | 13                    |
| Phase名    | PR作成                |
| 前提Phase  | Phase 12              |
| 後続Phase  | なし（最終Phase）     |
| ステータス | 未実施                |
| 作成日     | 2026-01-18            |
| 機能名     | database-optimization |

---

## 目的

ローカル確認とCI結果を整理し、PR作成の準備を完了する。

## 背景

品質ゲートを通過した内容であることを確認し、レビュー可能な状態にする必要がある。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: ローカル確認結果の記録

**目的**: ビルド・テスト・型チェックの結果を整理する

**実行手順**:

1. 必須コマンドの実行結果を収集する
2. 結果を `outputs/phase-13/local-check-result.md` に記録する

**期待される成果物**:

- `outputs/phase-13/local-check-result.md`

---

### タスク2: CI結果の記録

**目的**: CIの通過状況を記録する

**実行手順**:

1. CI結果を確認する
2. 結果を `outputs/phase-13/ci-result.md` に記録する

**期待される成果物**:

- `outputs/phase-13/ci-result.md`

---

### タスク3: 完了報告の作成

**目的**: 完了内容をまとめる

**実行手順**:

1. 変更点、検証結果、残課題を整理する
2. `outputs/phase-13/completion-report.md` に記録する

**期待される成果物**:

- `outputs/phase-13/completion-report.md`

---

## 参照資料

**システム仕様（aiworkflow-requirements）**

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料   | パス                                                                        | 内容              |
| ---------- | --------------------------------------------------------------------------- | ----------------- |
| 非機能要件 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | ビルド/テスト基準 |

**前Phase成果物**

| 参照資料             | パス                                         | 内容       |
| -------------------- | -------------------------------------------- | ---------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`   | 実装内容   |
| ドキュメント変更履歴 | `outputs/phase-12/document-changelog.md`     | 変更一覧   |
| 未タスクレポート     | `outputs/phase-12/unassigned-task-report.md` | 未対応項目 |
| 仕様更新判断         | `outputs/phase-12/spec-update-decision.md`   | 更新判断   |

---

**依存Phase成果物**

| 参照資料        | パス                                            | 内容                  |
| --------------- | ----------------------------------------------- | --------------------- |
| Phase 1 成果物  | `outputs/phase-1/requirements-definition.md`    | Phase 1 の主要成果物  |
| Phase 2 成果物  | `outputs/phase-2/schema-optimization-design.md` | Phase 2 の主要成果物  |
| Phase 5 成果物  | `outputs/phase-5/migration-files.md`            | Phase 5 の主要成果物  |
| Phase 6 成果物  | `outputs/phase-6/integrity-tests.md`            | Phase 6 の主要成果物  |
| Phase 7 成果物  | `outputs/phase-7/coverage-report.md`            | Phase 7 の主要成果物  |
| Phase 8 成果物  | `outputs/phase-8/code-analysis.md`              | Phase 8 の主要成果物  |
| Phase 9 成果物  | `outputs/phase-9/eslint-result.md`              | Phase 9 の主要成果物  |
| Phase 10 成果物 | `outputs/phase-10/requirements-check.md`        | Phase 10 の主要成果物 |
| Phase 11 成果物 | `outputs/phase-11/manual-test-result.md`        | Phase 11 の主要成果物 |

---

## 成果物

| 成果物           | パス                                     | 内容             |
| ---------------- | ---------------------------------------- | ---------------- |
| ローカル確認結果 | `outputs/phase-13/local-check-result.md` | ローカル確認記録 |
| CI結果           | `outputs/phase-13/ci-result.md`          | CI結果記録       |
| 完了報告         | `outputs/phase-13/completion-report.md`  | 完了内容         |

---

## 完了条件

- [ ] ローカル確認結果が記録されている
- [ ] CI結果が記録されている
- [ ] 完了報告が作成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] artifacts.jsonを更新

---

## PR作成に関する注意

- PR作成はユーザーの明示的な許可が必要
- `diff-to-pr`の実行は許可後に実施する

---

## 依存関係

- **前提**: Phase 12 が完了していること
- **後続**: なし（完了）

## Phase 13 実行記録

### 実行タスク

- タスク1: ローカル確認結果の記録
- タスク2: CI結果の記録
- タスク3: 完了報告の作成

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
