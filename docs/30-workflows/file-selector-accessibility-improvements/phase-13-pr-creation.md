# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                     |
| ---------- | ---------------------------------------- |
| Phase      | 13                                       |
| Phase名    | PR作成                                   |
| 前提Phase  | Phase 12                                 |
| 後続Phase  | なし                                     |
| ステータス | 未実施                                   |
| 作成日     | 2026-01-18                               |
| 機能名     | file-selector-accessibility-improvements |

---

## 目的

PR 作成準備を行い、ユーザー承認を得てから PR を作成できる状態にする。

## 背景

ドキュメント更新が完了したため、PR 作成前の準備を行う。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク0: T-13-1 PR準備

**目的**: PR 作成に必要な情報を整理する。

**実行手順**:

1. 変更点の概要とテスト結果を整理する。
2. PR テンプレートに記載する内容を作成する。
3. PR 作成はユーザー承認後にのみ実行する旨を明記する。

**期待される成果物**:

- outputs/phase-13/pr-preparation.md
- outputs/phase-13/ci-checklist.md

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
| 実装ガイド           | outputs/phase-12/implementation-guide.md  | Phase 12 のガイド    |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料           | パス                                                                 | 内容           |
| ------------------ | -------------------------------------------------------------------- | -------------- |
| タスクワークフロー | `.claude/skills/aiworkflow-requirements/references/task-workflow.md` | 作業手順の基本 |

---

## 成果物

| 成果物           | パス                               | 内容                 |
| ---------------- | ---------------------------------- | -------------------- |
| PR準備資料       | outputs/phase-13/pr-preparation.md | 変更概要とテスト結果 |
| CIチェックリスト | outputs/phase-13/ci-checklist.md   | 実行済みチェック一覧 |

---

## 統合テスト連携（Phase 1〜11は必須）

本Phaseは統合テスト連携の対象外とする。

---

## 完了条件

- [ ] PR準備資料が作成されている
- [ ] CIチェックリストが作成されている
- [ ] PR作成はユーザー承認後に実行する旨が記載されている

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/file-selector-accessibility-improvements --phase 13
```

---

## 依存関係

- **前提**: Phase 12 が完了していること
- **後続**: なし

---

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 13 実行記録

### 実行タスク

- T-13-1 PR準備: {result}

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、PR 作成前にユーザーの承認を得てください。
