# Phase 10: 最終レビューゲート

## メタ情報

| 項目       | 内容                                                               |
| ---------- | ------------------------------------------------------------------ |
| Phase      | 10                                                                 |
| 機能名     | UT-TASK-SPEC-TEMPLATE-IMPROVEMENT-001                              |
| タスク名   | task-specification-creator テンプレートの validator 必須見出し強化 |
| 前提Phase  | Phase 9                                                            |
| 後続Phase  | Phase 11                                                           |
| 作成日     | 2026-04-06                                                         |
| ステータス | 完了                                                               |

## 目的

全成果物の最終品質確認を行い、マージ可能な状態かどうかを判定する。

## 背景

Phase 9 で品質ゲートを通過した成果物が、当初の受け入れ基準を全て満たしているか最終確認する。

## 実行タスク

### タスク1: 最終レビュー実施

**目的**: 全成果物の品質を最終確認する

**実行手順**:

1. Phase 1 の受け入れ基準を再読する
2. 以下の全チェック項目を確認する:
   - `validate-phase12-implementation-guide.js` が `### 使用例` 見出しの有無を確実に検査できているか
   - `### 使用例` が欠落した実装ガイドに対して validator がエラーを報告するか
   - `documentation-changelog-template.md` に `変更者` フィールドが追加されているか
   - `documentation-changelog-template.md` に `関連 Issue / PR` フィールドが追加されているか
   - `documentation-changelog-template.md` に `validator 実行結果` フィールドが追加されているか
   - `documentation-changelog-template.md` に `current / baseline` フィールドが追加されているか
   - `documentation-changelog-template.md` に `artifacts 同期結果` フィールドが追加されているか
   - `phase-12-documentation.md` に `system-spec-update-summary.md` / `documentation-changelog.md` / `unassigned-task-detection.md` / `skill-feedback-report.md` / `phase12-task-spec-compliance-check.md` がすべて列挙されているか
   - `phase-12-documentation.md` で `outputs/phase-12/system-spec-update-summary.md` の旧名が残っていないか
   - 全既存テストが PASS しているか
   - 新規テストが追加されているか
   - ESLint エラーがないか
3. レビュー判定を記録する

**実行コマンド**:

```bash
pnpm vitest run --reporter=verbose -- validate-phase12-implementation-guide

node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --json

grep -c '変更者\|関連 Issue / PR\|validator 実行結果\|current / baseline\|artifacts 同期結果' .claude/skills/task-specification-creator/assets/documentation-changelog-template.md

grep -c 'system-spec-update-summary.md\|documentation-changelog.md\|unassigned-task-detection.md\|skill-feedback-report.md\|phase12-task-spec-compliance-check.md' docs/30-workflows/UT-TASK-SPEC-TEMPLATE-IMPROVEMENT-001/phase-12-documentation.md

grep -c 'outputs/phase-12/system-spec-update-summary.md' docs/30-workflows/UT-TASK-SPEC-TEMPLATE-IMPROVEMENT-001/phase-12-documentation.md
```

**期待される成果物**:

- `outputs/phase-10/final-review.md`

---

## 参照資料

| 参照資料         | パス                                          | 用途           |
| ---------------- | --------------------------------------------- | -------------- |
| 受け入れ基準     | `outputs/phase-1/acceptance-criteria.md`      | 最終確認の基準 |
| 品質保証レポート | `outputs/phase-9/quality-assurance-report.md` | 前 Phase 確認  |

## 統合テスト連携

- 最終レビューで全テスト結果を確認する

## レビュー結果判定

| 判定     | 条件                     | 次のアクション             |
| -------- | ------------------------ | -------------------------- |
| PASS     | 全チェック項目で問題なし | Phase 11 へ進行            |
| MINOR    | 軽微な指摘あり           | 指摘対応後、Phase 11 へ    |
| MAJOR    | 重大な問題あり           | Phase 8 へ戻る             |
| CRITICAL | 致命的な問題あり         | Phase 1 へ戻りユーザー確認 |

## 完了条件チェックリスト

### 機能要件

- [ ] `validate-phase12-implementation-guide.js` が `### 使用例` 見出しの有無を確実に検査できる
- [ ] `### 使用例` が欠落した実装ガイドに対して validator がエラーを報告する
- [ ] `documentation-changelog-template.md` に `変更者` フィールドが追加されている
- [ ] `documentation-changelog-template.md` に `関連 Issue / PR` フィールドが追加されている
- [ ] `documentation-changelog-template.md` に `validator 実行結果` フィールドが追加されている
- [ ] `documentation-changelog-template.md` に `current / baseline` フィールドが追加されている
- [ ] `documentation-changelog-template.md` に `artifacts 同期結果` フィールドが追加されている
- [ ] `phase-12-documentation.md` に `system-spec-update-summary.md` / `documentation-changelog.md` / `unassigned-task-detection.md` / `skill-feedback-report.md` / `phase12-task-spec-compliance-check.md` が列挙されている
- [ ] `phase-12-documentation.md` で `outputs/phase-12/system-spec-update-summary.md` の旧名が残っていない

### 品質要件

- [ ] 全既存テストが PASS している
- [ ] 新規テストが追加されている
- [ ] ESLint エラーがない

### ドキュメント要件

- [ ] `implementation-guide-template.md` の「validator 最小骨格」にある必須見出しがテンプレート本体に含まれている
- [ ] `documentation-changelog-template.md` の品質チェックリストに新規フィールドの確認項目が追加されている

## 成果物

| 成果物           | パス                               | 内容                 |
| ---------------- | ---------------------------------- | -------------------- |
| 最終レビュー結果 | `outputs/phase-10/final-review.md` | 判定・全チェック結果 |

## タスク 100% 実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 11: 手動テスト
