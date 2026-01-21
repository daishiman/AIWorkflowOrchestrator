# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容                  |
| ---------- | --------------------- |
| Phase      | 12                    |
| Phase名    | ドキュメント更新      |
| 前提Phase  | Phase 11              |
| 後続Phase  | Phase 13              |
| ステータス | 未実施                |
| 作成日     | 2026-01-18            |
| 機能名     | database-optimization |

---

## 目的

実装内容をドキュメントに反映し、未タスク検出と仕様更新判断を記録する。

## 背景

DBスキーマ変更は仕様書と運用資料の更新が必須であるため、実装ガイドと変更履歴を整備する必要がある。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 実装ガイドの作成

**目的**: 実装内容を整理し、再現可能な手順として残す

**実行手順**:

1. Part 1（概念説明）とPart 2（技術詳細）で構成する
2. ベンチマーク結果とmessage_count判断の根拠を含める
3. `outputs/phase-12/implementation-guide.md` を作成する

**期待される成果物**:

- `outputs/phase-12/implementation-guide.md`

---

### タスク2: ドキュメント変更履歴の作成

**目的**: 更新したドキュメントを一覧化する

**実行手順**:

1. 更新対象ファイルの一覧を作成する
2. 変更内容の要約を記録する
3. `outputs/phase-12/document-changelog.md` に記録する

**期待される成果物**:

- `outputs/phase-12/document-changelog.md`

---

### タスク3: 未タスク検出レポートの作成

**目的**: 未対応項目の有無を明確にする

**実行手順**:

1. テスト結果・発見課題・アクセシビリティ結果（WCAG違反含む）を確認する
2. 未タスクがない場合も「検出タスクなし」と記載する
3. `outputs/phase-12/unassigned-task-report.md` を作成する

**期待される成果物**:

- `outputs/phase-12/unassigned-task-report.md`

---

### タスク4: 仕様更新判断の記録

**目的**: aiworkflow-requirementsの更新要否を判断する

**実行手順**:

1. `references/spec-update-workflow.md` を参照し更新要否を判断する
2. database-schema.mdやinterfaces-chat-history.mdへの反映要否を決定する
3. 更新が必要な場合はタスク完了ステータスセクションを追加する
4. 変更履歴にバージョンを追記する
5. 判断結果を `outputs/phase-12/spec-update-decision.md` に記録する

**期待される成果物**:

- `outputs/phase-12/spec-update-decision.md`

---

## 未タスク検出レポート形式（0件の場合）

```markdown
## 検出結果サマリー

| ソース           | 検出数  |
| ---------------- | ------- |
| テスト結果       | 0件     |
| 発見課題         | 0件     |
| アクセシビリティ | 0件     |
| **合計**         | **0件** |

## 検出タスク一覧

**検出タスクなし**

すべてのテストがPASSし、発見課題もないため、未タスクとして記録すべき項目はありません。
```

---

## 参照資料

**システム仕様（aiworkflow-requirements）**

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                 | パス                                                                                 | 内容                 |
| ------------------------ | ------------------------------------------------------------------------------------ | -------------------- |
| データベーススキーマ設計 | `.claude/skills/aiworkflow-requirements/references/database-schema.md`               | スキーマ変更対象     |
| 仕様更新フロー           | `.claude/skills/aiworkflow-requirements/references/spec-update-workflow.md`          | 更新判断基準         |
| 技術ドキュメントガイド   | `.claude/skills/aiworkflow-requirements/references/technical-documentation-guide.md` | ドキュメント記述指針 |

**前Phase成果物**

| 参照資料       | パス                                     | 内容         |
| -------------- | ---------------------------------------- | ------------ |
| 手動テスト結果 | `outputs/phase-11/manual-test-result.md` | 手動検証結果 |
| 発見課題       | `outputs/phase-11/discovered-issues.md`  | 課題一覧     |

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

---

## 成果物

| 成果物               | パス                                         | 内容             |
| -------------------- | -------------------------------------------- | ---------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`   | 実装内容の説明   |
| ドキュメント変更履歴 | `outputs/phase-12/document-changelog.md`     | 更新一覧         |
| 未タスクレポート     | `outputs/phase-12/unassigned-task-report.md` | 未対応項目の記録 |
| 仕様更新判断         | `outputs/phase-12/spec-update-decision.md`   | 更新要否の記録   |

---

## 統合テスト連携（Phase 1〜11は必須）

- 手動テスト結果と統合テスト結果をドキュメントに反映
- 未タスク検出レポートに統合テスト起因の課題を反映

---

## 完了条件

- [ ] 実装ガイドが作成されている
- [ ] 変更履歴が作成されている
- [ ] 未タスクレポートが作成されている
- [ ] 仕様更新判断が記録されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] artifacts.jsonを更新

---

## 依存関係

- **前提**: Phase 11 が完了していること
- **後続**: Phase 13 へ進む

---

## Phase 12 実行記録

### 実行タスク

- タスク1: 実装ガイドの作成
- タスク2: ドキュメント変更履歴の作成
- タスク3: 未タスク検出レポートの作成
- タスク4: 仕様更新判断の記録

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-

## 次のPhase

完了後、以下のファイルを実行してください:

`phase-13-pr-creation.md`
