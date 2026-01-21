# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容                                     |
| ---------- | ---------------------------------------- |
| Phase      | 12                                       |
| Phase名    | ドキュメント更新                         |
| 前提Phase  | Phase 11                                 |
| 後続Phase  | Phase 13                                 |
| ステータス | 未実施                                   |
| 作成日     | 2026-01-18                               |
| 機能名     | file-selector-accessibility-improvements |

---

## 目的

実装内容を文書化し、システム仕様更新の要否を判断する。

## 背景

実装と検証が完了したため、ドキュメントを更新し、未タスクの有無を整理する必要がある。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク0: T-12-1 実装ガイド作成

**目的**: 実装内容を理解できるガイドを作成する。

**実行手順**:

1. Part 1 と Part 2 の構成で実装ガイドを作成する。
2. 実装の目的と利用手順を記載する。
3. テストと検証手順を記載する。

**期待される成果物**:

- outputs/phase-12/implementation-guide.md

---

### タスク1: T-12-2 ドキュメント更新履歴作成

**目的**: 更新したドキュメントの一覧と変更内容を記録する。

**実行手順**:

1. 更新対象のファイル一覧を作成する。
2. 変更内容と更新理由を記録する。

**期待される成果物**:

- outputs/phase-12/documentation-change-log.md

---

### タスク2: T-12-3 未タスク検出レポート作成

**目的**: 未タスクの有無を記録する。

**実行手順**:

1. テスト結果と発見課題を確認する。
2. 未タスクがない場合も 0 件として記録する。

**期待される成果物**:

- outputs/phase-12/unassigned-task-report.md

---

### タスク3: T-12-4 システム仕様更新判断

**目的**: aiworkflow-requirements の更新要否を判断する。

**実行手順**:

1. `.claude/skills/task-specification-creator/references/spec-update-workflow.md` を確認する。
2. 更新が必要な場合は該当する仕様ファイルを更新し、インデックスを再生成する。
3. 仕様更新時はタスク完了ステータス、変更履歴、残課題更新の記載を行う。
4. 更新有無と理由を `outputs/phase-12/spec-update-decision.md` に記録する。

**期待される成果物**:

- outputs/phase-12/spec-update-decision.md

---

## 参照資料

依存Phase成果物:

| 参照資料             | パス                                      | 内容                 |
| -------------------- | ----------------------------------------- | -------------------- |
| 受け入れ基準         | outputs/phase-1/acceptance-criteria.md    | Phase 1 の基準       |
| アクセシビリティ設計 | outputs/phase-2/accessibility-design.md   | Phase 2 の設計       |
| 実装メモ             | outputs/phase-5/implementation-notes.md   | Phase 5 の実装       |
| テスト拡充サマリー   | outputs/phase-6/test-expansion-summary.md | Phase 6 の追加テスト |
| カバレッジ報告       | outputs/phase-7/coverage-report.md        | Phase 7 の結果       |
| リファクタ記録       | outputs/phase-8/refactor-notes.md         | Phase 8 の変更       |
| 品質報告             | outputs/phase-9/quality-report.md         | Phase 9 の結果       |
| 最終レビュー報告     | outputs/phase-10/final-review-report.md   | Phase 10 の判定      |
| 手動テスト結果       | outputs/phase-11/manual-test-result.md    | Phase 11 の結果      |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                 | パス                                                                       | 内容                 |
| ------------------------ | -------------------------------------------------------------------------- | -------------------- |
| ファイルセレクターUI設計 | `.claude/skills/aiworkflow-requirements/references/ui-ux-file-selector.md` | UI 仕様              |
| UI/UXコンポーネント      | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`    | アクセシビリティ要件 |

### タスク仕様書スキル

| 参照資料             | パス                                                                           | 内容                   |
| -------------------- | ------------------------------------------------------------------------------ | ---------------------- |
| 仕様更新ワークフロー | `.claude/skills/task-specification-creator/references/spec-update-workflow.md` | 仕様更新判断と更新手順 |

---

## 成果物

| 成果物           | パス                                         | 内容                 |
| ---------------- | -------------------------------------------- | -------------------- |
| 実装ガイド       | outputs/phase-12/implementation-guide.md     | 2 パート構成のガイド |
| 更新履歴         | outputs/phase-12/documentation-change-log.md | 更新ファイル一覧     |
| 未タスクレポート | outputs/phase-12/unassigned-task-report.md   | 未タスク結果         |
| 仕様更新判断     | outputs/phase-12/spec-update-decision.md     | 更新の要否記録       |

---

## 未タスク検出レポート形式（0件の場合）

未タスクが存在しない場合も、以下の形式で `outputs/phase-12/unassigned-task-report.md` を作成する。

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

## 統合テスト連携（Phase 1〜11は必須）

本Phaseは統合テスト連携の対象外とする。

---

## 完了条件

- [ ] 実装ガイドが作成されている
- [ ] ドキュメント更新履歴が作成されている
- [ ] 未タスクレポートが作成されている
- [ ] 仕様更新判断が記録されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施（Phase 1〜11）
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/file-selector-accessibility-improvements --phase 12
```

---

## 依存関係

- **前提**: Phase 11 が完了していること
- **後続**: Phase 13 へ進む

---

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 12 実行記録

### 実行タスク

- T-12-1 実装ガイド作成: {result}
- T-12-2 ドキュメント更新履歴作成: {result}
- T-12-3 未タスク検出レポート作成: {result}
- T-12-4 システム仕様更新判断: {result}

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

`phase-13-pr-creation.md`
