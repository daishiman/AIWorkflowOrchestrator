# UNASSIGNED-EVALS-SKILL-SCANNER-CONTENT-VALIDATE-001 - タスク実行仕様書

## メタ情報

| 項目                | 値                                                                               |
| ------------------- | -------------------------------------------------------------------------------- |
| タスクID            | UNASSIGNED-EVALS-SKILL-SCANNER-CONTENT-VALIDATE-001                              |
| 機能名              | evals-skill-scanner-content-validate                                             |
| タイトル            | SkillScanner に EVALS.json 内容バリデーション追加                                |
| 作成日              | 2026-04-21                                                                       |
| ステータス          | pending                                                                          |
| 総 Phase 数         | 13                                                                               |
| タスク分類          | NON_VISUAL                                                                       |
| implementation_mode | new                                                                              |
| 優先度              | 中                                                                               |
| 関連 Issue          | [#2329](https://github.com/daishiman/AIWorkflowOrchestrator/issues/2329)（OPEN） |
| 依存タスク          | UNASSIGNED-EVALS-VALIDATOR-GUARD-001（先行推奨）                                 |

---

## Phase 一覧

| Phase | 名称                 | 仕様書                                                       | ステータス |
| ----- | -------------------- | ------------------------------------------------------------ | ---------- |
| 1     | 要件定義             | [phase-1-requirements.md](phase-1-requirements.md)           | pending    |
| 2     | 設計                 | [phase-2-design.md](phase-2-design.md)                       | pending    |
| 3     | 設計レビューゲート   | [phase-3-design-review.md](phase-3-design-review.md)         | pending    |
| 4     | テスト作成           | [phase-4-test-creation.md](phase-4-test-creation.md)         | pending    |
| 5     | 実装                 | [phase-5-implementation.md](phase-5-implementation.md)       | pending    |
| 6     | テスト拡充           | [phase-6-test-expansion.md](phase-6-test-expansion.md)       | pending    |
| 7     | テストカバレッジ確認 | [phase-7-coverage-check.md](phase-7-coverage-check.md)       | pending    |
| 8     | リファクタリング     | [phase-8-refactoring.md](phase-8-refactoring.md)             | pending    |
| 9     | 品質保証             | [phase-9-quality-assurance.md](phase-9-quality-assurance.md) | pending    |
| 10    | 最終レビューゲート   | [phase-10-final-review.md](phase-10-final-review.md)         | pending    |
| 11    | 手動テスト検証       | [phase-11-manual-test.md](phase-11-manual-test.md)           | pending    |
| 12    | ドキュメント更新     | [phase-12-documentation.md](phase-12-documentation.md)       | pending    |
| 13    | PR 作成              | [phase-13-pr-creation.md](phase-13-pr-creation.md)           | pending    |

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

## Phase 完了時の必須アクション

1. **タスク100%実行**: Phase 内で指定された全タスクを完全に実行
2. **成果物確認**: 全ての必須成果物が生成されていることを検証
3. **artifacts.json 更新**: `complete-phase.js` で Phase 完了ステータスを更新
4. **完了条件チェック**: 各タスクを完遂した旨を必ず明記

```bash
# Phase 完了処理
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/UNASSIGNED-EVALS-SKILL-SCANNER-CONTENT-VALIDATE-001 \
  --phase {{N}} \
  --artifacts "outputs/phase-{{N}}/{{FILE}}.md:{{DESCRIPTION}}"
```

---

## 成果物

| Phase | 主要成果物                                                                                |
| ----- | ----------------------------------------------------------------------------------------- |
| 1     | 要件定義書、受け入れ基準（AC-1〜AC-10）、現状スキャンロジック分析                         |
| 2     | バリデーションフック設計書、型定義設計（EvalsValidationStatus）、camelCase/snake_case方針 |
| 3     | 設計レビュー結果、ゲート判定、リスク評価表                                                |
| 4     | テスト仕様書（既存3テスト契約更新計画 + 破損 EVALS 新規ケース設計）                       |
| 5     | 実装サマリー、変更ファイル一覧、コード内コメント（ポリシー明文化）                        |
| 6     | 回帰テスト結果、新規テストケース実行結果                                                  |
| 7     | カバレッジ確認結果（バリデーション分岐の網羅確認）                                        |
| 8     | リファクタリング計画・実施結果                                                            |
| 9     | 品質レポート、リスク台帳                                                                  |
| 10    | 最終レビュー結果、是正計画、出荷準備チェック                                              |
| 11    | 手動テスト結果、証跡インデックス                                                          |
| 12    | 実装ガイド、仕様更新サマリー、更新履歴、未タスク検出レポート、スキルフィードバック        |
| 13    | PR 作成完了                                                                               |
