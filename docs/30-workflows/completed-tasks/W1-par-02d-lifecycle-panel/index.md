# W1-par-02d: SkillLifecyclePanel テキストエリア削除・ウィザード遷移化

## メタ情報

- タスクID: UT-SKILL-WIZARD-W1-par-02d
- 機能名: SkillLifecyclePanel テキストエリア削除・ウィザード遷移化
- タスク分類: UI / refactor task
- 実行順: Wave 0-1（W0-seq-01と並列実行可・型依存なし）
- 依存: なし（最小変更）
- 作成日: 2026-04-07

## 検証基準

- `task-specification-creator`: Phase 1 の task classification、Phase 11 の UI task 証跡、Phase 12 の canonical 6 outputs
- `aiworkflow-requirements`: canonical root、current / baseline 分離、`artifacts.json` / `outputs/artifacts.json` の parity
- 30思考法: Phase 3 の設計レビューと Phase 10 の最終レビューで全 30 観点を使う

## カノニカル成果物

| Phase | Canonical outputs                                                                                                                                                                                                                                                                                                                                                                                                         |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | `phase-1-requirements.md`, `outputs/phase-1/requirements.md`                                                                                                                                                                                                                                                                                                                                                              |
| 2     | `phase-2-design.md`, `outputs/phase-2/design.md`                                                                                                                                                                                                                                                                                                                                                                          |
| 3     | `phase-3-design-review.md`, `outputs/phase-3/design-review.md`                                                                                                                                                                                                                                                                                                                                                            |
| 4     | `phase-4-test-creation.md`, `outputs/phase-4/test-matrix.md`                                                                                                                                                                                                                                                                                                                                                              |
| 5     | `phase-5-implementation.md`, `outputs/phase-5/implementation-record.md`                                                                                                                                                                                                                                                                                                                                                   |
| 6     | `phase-6-test-expansion.md`, `outputs/phase-6/test-expansion.md`                                                                                                                                                                                                                                                                                                                                                          |
| 7     | `phase-7-coverage.md`, `outputs/phase-7/coverage-report.md`                                                                                                                                                                                                                                                                                                                                                               |
| 8     | `phase-8-refactoring.md`, `outputs/phase-8/refactoring-log.md`                                                                                                                                                                                                                                                                                                                                                            |
| 9     | `phase-9-qa.md`, `outputs/phase-9/qa-report.md`                                                                                                                                                                                                                                                                                                                                                                           |
| 10    | `phase-10-final-review.md`, `outputs/phase-10/final-review-result.md`                                                                                                                                                                                                                                                                                                                                                     |
| 11    | `phase-11-manual-test.md`, `outputs/phase-11/manual-test-checklist.md`, `outputs/phase-11/manual-test-result.md`, `outputs/phase-11/manual-test-report.md`, `outputs/phase-11/ui-sanity-visual-review.md`, `outputs/phase-11/discovered-issues.md`, `outputs/phase-11/screenshot-plan.json`, `outputs/phase-11/screenshot-coverage.md`, `outputs/phase-11/phase11-capture-metadata.json`, `outputs/phase-11/screenshots/` |
| 12    | `phase-12-docs.md`, `outputs/phase-12/implementation-guide.md`, `outputs/phase-12/system-spec-update-summary.md`, `outputs/phase-12/documentation-changelog.md`, `outputs/phase-12/unassigned-task-detection.md`, `outputs/phase-12/skill-feedback-report.md`, `outputs/phase-12/phase12-task-spec-compliance-check.md`                                                                                                   |
| 13    | `phase-13-pr.md`, `outputs/phase-13/pr-readiness.md`                                                                                                                                                                                                                                                                                                                                                                      |

## タスク概要

`apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` を修正する。既存のテキストエリア・「スキルを生成する」ボタン・「方針を決める」ボタンを削除し、「スキル作成ウィザードを開く →」ボタン一つに置き換える。

## 実装スコープ

### 削除対象

- `request` state と setRequest
- `handleCreate()` 関数
- `handlePrepare()` 関数（「方針を決める」）
- テキストエリア（data-testid="skill-lifecycle-request-input"）
- 「スキルを生成する」ボタン（data-testid="skill-lifecycle-create-button"）
- 「方針を決める」ボタン（data-testid="skill-lifecycle-prepare-button"）
- 「1. 依頼をまとめる」セクション全体

### 追加対象

```tsx
<section>
  <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-5">
    <h3 className="text-base font-semibold text-[var(--text-primary)]">
      1. スキルを作成する
    </h3>
    <p className="mt-1 text-sm text-[var(--text-secondary)]">
      スキルの目的・機能・連携ツールをガイドに沿って設定し、
      AIと対話しながらスキルを生成します。
    </p>
    <button
      type="button"
      className={lifecycleButtonStyles.primary}
      onClick={onOpenSkillWizard}
      data-testid="skill-lifecycle-open-wizard-button"
    >
      スキル作成ウィザードを開く →
    </button>
  </div>
</section>
```

### Props変更

```typescript
interface SkillLifecyclePanelProps {
  onClose: () => void;
  onOpenSkillWizard: () => void; // 追加
}
```

## Phase一覧

| Phase | ファイル                  | 内容              |
| ----- | ------------------------- | ----------------- |
| 1     | phase-1-requirements.md   | 要件定義          |
| 2     | phase-2-design.md         | 設計              |
| 3     | phase-3-design-review.md  | 設計レビュー      |
| 4     | phase-4-test-creation.md  | テスト作成        |
| 5     | phase-5-implementation.md | 実装              |
| 6     | phase-6-test-expansion.md | テスト拡充        |
| 7     | phase-7-coverage.md       | カバレッジ確認    |
| 8     | phase-8-refactoring.md    | リファクタリング  |
| 9     | phase-9-qa.md             | QA                |
| 10    | phase-10-final-review.md  | 最終レビュー      |
| 11    | phase-11-manual-test.md   | 手動テスト        |
| 12    | phase-12-docs.md          | ドキュメント整備  |
| 13    | phase-13-pr.md            | PR準備（blocked） |

## 実行原則

- Phase 2 と Phase 3 は独立論点を並列で扱い、最後に統合する
- Phase 11 は UI task として screenshot / manual evidence を必須にする
- Phase 12 は canonical 6 outputs を同一 wave で揃える
- Phase 13 は user 承認がない限り blocked を維持する
