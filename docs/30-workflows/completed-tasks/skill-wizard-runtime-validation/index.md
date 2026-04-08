# skill-wizard-runtime-validation - タスク実行仕様書

## メタ情報

| 項目         | 内容                                                 |
| ------------ | ---------------------------------------------------- |
| タスクID     | UT-SKILL-WIZARD-W0-RUNTIME-VALIDATION-001            |
| 機能名       | skill-wizard-runtime-validation                      |
| 分類         | 改善                                                 |
| 対象機能     | スキルウィザード SkillInfoFormData バリデーション    |
| 優先度       | 中                                                   |
| 見積もり規模 | 小規模                                               |
| ステータス   | completed（Phase 1-12 completed / Phase 13 blocked） |
| タスク種別   | NON_VISUAL                                           |
| 作成日       | 2026-04-08                                           |
| 総Phase数    | 13                                                   |

---

## タスク概要

### 目的

スキルウィザードの `SkillInfoFormData` に対するランタイムバリデーション（実行時の入力値検証）を実装する。
TypeScript 型定義はコンパイル時のみ有効であり、空白のみのスキル名や短すぎる目的文字列を防ぐためのランタイムチェックが必要。

### 背景

W0-seq-01 で `SkillInfoFormData` の TypeScript 型定義が完成したが、ランタイムバリデーションが未実装のため、
空白のみのスキル名や短すぎる目的文字列（例: 1文字）が通過してしまう。バリデーションエラーメッセージも未定義。

### 最終ゴール

- `skillName` のランタイムバリデーション関数が実装され、空白・最大文字数チェックが動作する
- `purpose` のランタイムバリデーション関数が実装され、最小10文字・最大文字数チェックが動作する
- バリデーションエラーメッセージが日本語で定義されている
- 全バリデーション関数のユニットテストが PASS している

### スコープ

**含む**:

- `skillName` のバリデーション: trim後の空文字列チェック、最大文字数チェック
- `purpose` のバリデーション: 最小文字数（10文字以上）、最大文字数チェック
- バリデーション関数の実装と型定義
- バリデーションエラーメッセージの定義（日本語対応）
- バリデーション関数のユニットテスト

**含まない**:

- UI フォームコンポーネント自体の変更（後続 Wave）
- `SkillInfoFormData` 型定義の変更

---

## 受入基準

| AC番号 | 基準                                                             | 検証方法         |
| ------ | ---------------------------------------------------------------- | ---------------- |
| AC-1   | `skillName` が空白のみの場合、バリデーションエラーが返される     | ユニットテスト   |
| AC-2   | `purpose` が最小文字数未満の場合、バリデーションエラーが返される | ユニットテスト   |
| AC-3   | バリデーション関数のユニットテストが実装され PASS する           | `pnpm test` PASS |
| AC-4   | バリデーションエラーメッセージが日本語で定義されている           | コードレビュー   |
| AC-5   | `pnpm --filter @repo/shared typecheck` が通る                    | typecheck PASS   |

---

## Phase一覧

| Phase | 名称                 | 仕様書                                                       | ステータス |
| ----- | -------------------- | ------------------------------------------------------------ | ---------- |
| 1     | 要件定義             | [phase-1-requirements.md](phase-1-requirements.md)           | completed  |
| 2     | 設計                 | [phase-2-design.md](phase-2-design.md)                       | completed  |
| 3     | 設計レビューゲート   | [phase-3-design-review.md](phase-3-design-review.md)         | completed  |
| 4     | テスト作成           | [phase-4-test-creation.md](phase-4-test-creation.md)         | completed  |
| 5     | 実装                 | [phase-5-implementation.md](phase-5-implementation.md)       | completed  |
| 6     | テスト拡充           | [phase-6-test-expansion.md](phase-6-test-expansion.md)       | completed  |
| 7     | テストカバレッジ確認 | [phase-7-coverage-check.md](phase-7-coverage-check.md)       | completed  |
| 8     | リファクタリング     | [phase-8-refactoring.md](phase-8-refactoring.md)             | completed  |
| 9     | 品質保証             | [phase-9-quality-assurance.md](phase-9-quality-assurance.md) | completed  |
| 10    | 最終レビューゲート   | [phase-10-final-review.md](phase-10-final-review.md)         | completed  |
| 11    | 手動テスト検証       | [phase-11-manual-test.md](phase-11-manual-test.md)           | completed  |
| 12    | ドキュメント更新     | [phase-12-documentation.md](phase-12-documentation.md)       | completed  |
| 13    | PR作成               | [phase-13-pr-creation.md](phase-13-pr-creation.md)           | blocked    |

---

## 実行フロー

```
Phase 1 → Phase 2 → Phase 3 (Gate) → Phase 4 → Phase 5 → Phase 6 → Phase 7
                         ↓                                      ↓
                    (MAJOR→戻り)                           (未達→戻り)
                         ↓                                      ↓
Phase 8 → Phase 9 → Phase 10 (Gate) → Phase 11 → Phase 12 → Phase 13 → 完了
                         ↓
                    (MAJOR→戻り)
```

---

## 成果物一覧

| Phase | 主要成果物                                                                                                                                                                                                                                                                              |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | outputs/phase-1/acceptance-criteria.md, outputs/phase-1/p50-check-result.md, outputs/phase-1/scope-definition.md                                                                                                                                                                        |
| 2     | outputs/phase-2/design-decisions.md, outputs/phase-2/validation-interface.md, outputs/phase-2/error-messages.md                                                                                                                                                                         |
| 3     | outputs/phase-3/design-review-result.md, outputs/phase-3/minor-tracking.md                                                                                                                                                                                                              |
| 4     | outputs/phase-4/test-matrix.md, outputs/phase-4/red-confirmation.md                                                                                                                                                                                                                     |
| 5     | outputs/phase-5/implementation-result.md, outputs/phase-5/green-confirmation.md                                                                                                                                                                                                         |
| 6     | outputs/phase-6/test-expansion-result.md                                                                                                                                                                                                                                                |
| 7     | outputs/phase-7/coverage-report.md                                                                                                                                                                                                                                                      |
| 8     | outputs/phase-8/refactoring-result.md                                                                                                                                                                                                                                                   |
| 9     | outputs/phase-9/quality-check-result.md                                                                                                                                                                                                                                                 |
| 10    | outputs/phase-10/final-review-result.md, outputs/phase-10/ac-verification.md                                                                                                                                                                                                            |
| 11    | outputs/phase-11/manual-test-result.md, outputs/phase-11/discovered-issues.md                                                                                                                                                                                                           |
| 12    | outputs/phase-12/implementation-guide.md, outputs/phase-12/system-spec-update-summary.md, outputs/phase-12/documentation-changelog.md, outputs/phase-12/unassigned-task-detection.md, outputs/phase-12/skill-feedback-report.md, outputs/phase-12/phase12-task-spec-compliance-check.md |
| 13    | outputs/phase-13/local-check-result.md, outputs/phase-13/change-summary.md, outputs/phase-13/pr-info.md, outputs/phase-13/pr-ready-report.md                                                                                                                                            |

---

## Phase完了時の必須アクション

1. **タスク100%実行**: Phase内で指定された全タスクを完全に実行
2. **成果物確認**: 全ての必須成果物が生成されていることを検証
3. **artifacts.json更新**: `complete-phase.js` でPhase完了ステータスを更新
4. **完了条件チェック**: 各タスクを完遂した旨を必ず明記

```bash
# Phase完了処理
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/skill-wizard-runtime-validation --phase {{N}} \
  --artifacts "outputs/phase-{{N}}/{{FILE}}.md:{{DESCRIPTION}}"
```

---

## 関連タスク

| タスクID                                  | 関係     | ステータス |
| ----------------------------------------- | -------- | ---------- |
| UT-SKILL-WIZARD-W0-seq-01                 | 親タスク | completed  |
| UT-SKILL-WIZARD-W0-RUNTIME-VALIDATION-001 | 本タスク | completed  |

---

_このファイルは task-specification-creator skill に従い手動生成されました。_
_最終更新: 2026-04-08_
