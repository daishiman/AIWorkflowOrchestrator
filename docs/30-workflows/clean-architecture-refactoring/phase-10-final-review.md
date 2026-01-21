# Phase 10: 最終レビューゲート - タスク仕様書

## メタ情報

| 項目       | 内容                           |
| ---------- | ------------------------------ |
| Phase      | 10                             |
| Phase名    | 最終レビューゲート             |
| 前提Phase  | Phase 9（品質保証）            |
| 後続Phase  | Phase 11（手動テスト検証）     |
| ステータス | 未実施                         |
| 作成日     | 2026-01-18                     |
| 機能名     | clean-architecture-refactoring |
| タスクID   | ARCH-001                       |

---

## 目的

全ての受け入れ基準を満たしていることを最終確認し、本番適用の承認を行う。

## 背景

品質保証が完了したため、プロジェクト全体の受け入れ基準を満たしているかを最終確認する。Phase 1で定義した受け入れ基準との照合を行う。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 受け入れ基準照合

**目的**: Phase 1で定義した受け入れ基準を満たしているか確認する

**実行手順**:

1. `outputs/phase-1/acceptance-criteria.md` を読み込む

2. 各受け入れ基準を確認する:

   **アーキテクチャ準拠**:
   - [ ] Domain層がInfrastructure層に依存していない
   - [ ] Domain層がApplication層に依存していない
   - [ ] Application層がInfrastructure層に依存していない
   - [ ] Domain層がDrizzle ORMに依存していない
   - [ ] 準拠率が100%である

   **コード品質**:
   - [ ] 型エラーが0件である
   - [ ] Lintエラーが0件である
   - [ ] フォーマット違反が0件である

   **テストカバレッジ**:
   - [ ] Line Coverage ≥ 80%
   - [ ] Branch Coverage ≥ 60%
   - [ ] Function Coverage ≥ 80%

   **機能維持**:
   - [ ] 既存機能が全て動作する（リグレッションなし）
   - [ ] 既存テストが全てPASSする

3. 未達成項目がある場合:
   - 該当Phaseに戻り修正
   - 再度レビューを実施

**期待される成果物**:

- `outputs/phase-10/acceptance-review.md` - 受け入れ基準照合結果

---

### タスク2: 設計ドキュメント整合性確認

**目的**: 実装が設計ドキュメントと整合していることを確認する

**実行手順**:

1. Phase 2の設計ドキュメントを確認する:
   - [ ] `outputs/phase-2/domain-entities-design.md` と実装の整合性
   - [ ] `outputs/phase-2/use-cases-design.md` と実装の整合性
   - [ ] `outputs/phase-2/infrastructure-design.md` と実装の整合性

2. 設計変更がある場合:
   - 変更点を文書化
   - 設計ドキュメントを更新（Phase 12で実施）

3. 整合性チェックリスト:
   - [ ] エンティティの構造が設計と一致している
   - [ ] 値オブジェクトの構造が設計と一致している
   - [ ] Use Caseの責務が設計と一致している
   - [ ] リポジトリインターフェースが設計と一致している
   - [ ] マッパーの変換ロジックが設計と一致している

**期待される成果物**:

- `outputs/phase-10/design-consistency-report.md` - 設計整合性レポート

---

### タスク3: 成果物完全性確認

**目的**: 全Phaseの成果物が揃っていることを確認する

**実行手順**:

1. 各Phaseの成果物を確認する:

   | Phase | 成果物                              | 存在確認 |
   | ----- | ----------------------------------- | -------- |
   | 1     | `acceptance-criteria.md`            | [ ]      |
   | 1     | `architecture-analysis.md`          | [ ]      |
   | 2     | `domain-entities-design.md`         | [ ]      |
   | 2     | `use-cases-design.md`               | [ ]      |
   | 2     | `infrastructure-design.md`          | [ ]      |
   | 3     | `design-review-report.md`           | [ ]      |
   | 5     | `implementation-report.md`          | [ ]      |
   | 6     | `test-expansion-report.md`          | [ ]      |
   | 6     | `coverage-snapshot.md`              | [ ]      |
   | 7     | `coverage-report.md`                | [ ]      |
   | 7     | `gate-decision.md`                  | [ ]      |
   | 8     | `refactoring-report.md`             | [ ]      |
   | 9     | `quality-assurance-report.md`       | [ ]      |
   | 9     | `architecture-compliance-report.md` | [ ]      |

2. 不足している成果物がある場合:
   - 該当Phaseに戻り作成
   - 再度確認を実施

**期待される成果物**:

- `outputs/phase-10/artifact-checklist.md` - 成果物チェックリスト

---

### タスク4: コードレビューチェックリスト

**目的**: コードの品質と保守性を最終確認する

**実行手順**:

1. コードレビュー観点を確認する:

   **可読性**:
   - [ ] 命名が明確で一貫している
   - [ ] コメントが適切に配置されている
   - [ ] 複雑な処理に説明がある

   **保守性**:
   - [ ] 単一責務の原則が守られている
   - [ ] 重複コードがない
   - [ ] 適切な抽象化レベルである

   **テスタビリティ**:
   - [ ] 依存関係が注入可能である
   - [ ] モックが容易に作成できる
   - [ ] テストが独立して実行できる

   **セキュリティ**:
   - [ ] 入力バリデーションが適切である
   - [ ] 機密情報が露出していない
   - [ ] SQLインジェクション対策がされている

2. 問題がある場合:
   - 修正箇所を特定
   - Phase 8に戻り修正

**期待される成果物**:

- `outputs/phase-10/code-review-checklist.md` - コードレビューチェックリスト

---

### タスク5: 最終承認判定

**目的**: 本番適用の最終承認を行う

**実行手順**:

1. 最終判定基準:

   | 基準                 | 条件         | 達成 |
   | -------------------- | ------------ | ---- |
   | 受け入れ基準         | 全項目達成   | [ ]  |
   | 設計整合性           | 全項目一致   | [ ]  |
   | 成果物完全性         | 全成果物存在 | [ ]  |
   | コードレビュー       | 全項目OK     | [ ]  |
   | アーキテクチャ準拠率 | 100%         | [ ]  |
   | テストカバレッジ     | 基準達成     | [ ]  |

2. 判定結果:
   - **承認（APPROVED）**: 全基準を満たす → Phase 11へ進行
   - **条件付き承認（CONDITIONAL）**: 軽微な問題あり → 問題を記録しPhase 11へ
   - **却下（REJECTED）**: 重大な問題あり → 該当Phaseに戻り修正

3. 最終承認レポートを作成する

**期待される成果物**:

- `outputs/phase-10/final-approval-report.md` - 最終承認レポート

---

## 参照資料

| 参照資料      | パス                                          | 内容             |
| ------------- | --------------------------------------------- | ---------------- |
| Phase 1成果物 | `outputs/phase-1/acceptance-criteria.md`      | 受け入れ基準     |
| Phase 2成果物 | `outputs/phase-2/`                            | 設計ドキュメント |
| Phase 9成果物 | `outputs/phase-9/quality-assurance-report.md` | 品質レポート     |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                     | パス                                                                           | 内容     |
| ---------------------------- | ------------------------------------------------------------------------------ | -------- |
| チャット履歴インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md` | 既存仕様 |
| 品質要件                     | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`    | 品質基準 |

---

## 成果物

| 成果物               | パス                                            | 内容             |
| -------------------- | ----------------------------------------------- | ---------------- |
| 受け入れ基準照合結果 | `outputs/phase-10/acceptance-review.md`         | 基準達成状況     |
| 設計整合性レポート   | `outputs/phase-10/design-consistency-report.md` | 設計との整合性   |
| 成果物チェックリスト | `outputs/phase-10/artifact-checklist.md`        | 成果物存在確認   |
| コードレビュー結果   | `outputs/phase-10/code-review-checklist.md`     | コード品質確認   |
| 最終承認レポート     | `outputs/phase-10/final-approval-report.md`     | 最終承認判定結果 |

---

## 統合テスト連携

最終レビューで確認すべき統合テスト項目:

- 全アーキテクチャテストがPASSしていること
- 全統合テストがPASSしていること
- dependency-cruiser違反が0件であること
- カバレッジ基準を満たしていること

---

## 完了条件

- [ ] 受け入れ基準が全て満たされている
- [ ] 設計ドキュメントと実装が整合している
- [ ] 全成果物が揃っている
- [ ] コードレビューチェックリストが全てOKである
- [ ] 最終承認が「承認」または「条件付き承認」である
- [ ] 最終承認レポートが作成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] `artifacts.json` のPhase 10ステータスを更新

---

## 依存関係

- **前提**: Phase 9（品質保証）が完了していること
- **後続**: Phase 11（手動テスト検証）へ進む（承認の場合）
- **戻り**: 該当Phaseへ戻る（却下の場合）

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/clean-architecture-refactoring/phase-11-manual-test.md`
