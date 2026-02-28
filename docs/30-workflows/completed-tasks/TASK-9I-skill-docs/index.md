# TASK-9I-skill-docs - タスク実行仕様書

## メタ情報

| 項目       | 内容               |
| ---------- | ------------------ |
| 機能名     | TASK-9I-skill-docs |
| 作成日     | 2026-02-28         |
| ステータス | 実行中             |
| 総Phase数  | 13                 |

---

## Phase一覧

| Phase | 名称                 | 仕様書                                                       | ステータス |
| ----- | -------------------- | ------------------------------------------------------------ | ---------- |
| 1     | 要件定義             | [phase-1-requirements.md](phase-1-requirements.md)           | 完了       |
| 2     | 設計                 | [phase-2-design.md](phase-2-design.md)                       | 完了       |
| 3     | 設計レビューゲート   | [phase-3-design-review.md](phase-3-design-review.md)         | 完了       |
| 4     | テスト作成           | [phase-4-test-creation.md](phase-4-test-creation.md)         | 完了       |
| 5     | 実装                 | [phase-5-implementation.md](phase-5-implementation.md)       | 完了       |
| 6     | テスト拡充           | [phase-6-test-expansion.md](phase-6-test-expansion.md)       | 完了       |
| 7     | テストカバレッジ確認 | [phase-7-coverage-check.md](phase-7-coverage-check.md)       | 完了       |
| 8     | リファクタリング     | [phase-8-refactoring.md](phase-8-refactoring.md)             | 完了       |
| 9     | 品質保証             | [phase-9-quality-assurance.md](phase-9-quality-assurance.md) | 完了       |
| 10    | 最終レビューゲート   | [phase-10-final-review.md](phase-10-final-review.md)         | 完了       |
| 11    | 手動テスト検証       | [phase-11-manual-test.md](phase-11-manual-test.md)           | 完了       |
| 12    | ドキュメント更新     | [phase-12-documentation.md](phase-12-documentation.md)       | 完了       |
| 13    | PR作成               | [phase-13-pr-creation.md](phase-13-pr-creation.md)           | 完了       |

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

## Phase完了時の必須アクション

1. **タスク100%実行**: Phase内で指定された全タスクを完全に実行
2. **成果物確認**: 全ての必須成果物が生成されていることを検証
3. **artifacts.json更新**: `complete-phase.js` でPhase完了ステータスを更新
4. **完了条件チェック**: 各タスクを完遂した旨を必ず明記

```bash
# Phase完了処理
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/TASK-9I-skill-docs --phase {{N}} \
  --artifacts "outputs/phase-{{N}}/{{FILE}}.md:{{DESCRIPTION}}"
```

---

## 成果物

| Phase | 主要成果物                                                                                                                                                                  |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | 要件定義書（FR/NFR分類、受け入れ基準）, 受け入れ基準, スコープ定義（バックエンド・IPC・型定義のみ、UI除外）                                                                 |
| 2     | SkillDocGenerator アーキテクチャ設計, IPC チャネル・型定義設計                                                                                                              |
| 3     | 設計レビュー結果                                                                                                                                                            |
| 4     | テスト仕様書, テストケース一覧, 統合テスト設計, SkillDocGenerator ユニットテスト, IPC ドキュメントハンドラーテスト                                                          |
| 5     | ドキュメント生成型定義, SkillDocGenerator 実装, IPC ハンドラー追加（registerSkillDocsHandlers）, SKILL*DOCS*\* チャネル定数追加, SkillAPI docs 操作追加, Preload 型定義追加 |
| 6     | カバレッジ分析レポート, 統合テスト結果                                                                                                                                      |
| 7     | カバレッジ再測定結果, 統合テスト再実行結果                                                                                                                                  |
| 8     | リファクタリング記録                                                                                                                                                        |
| 9     | Lint結果, 型チェック結果, セキュリティ確認, テスト・カバレッジ結果, 品質ゲート総合判定                                                                                      |
| 10    | 最終レビュー結果                                                                                                                                                            |
| 11    | 自動テスト結果, 正常系手動テスト結果, 異常系手動テスト結果, 統合テスト結果, リグレッションテスト結果, 発見課題一覧                                                          |
| 12    | 実装ガイド（Part 1: 概念 + Part 2: 技術詳細）, ドキュメント更新履歴, 未タスク検出レポート, スキルフィードバックレポート, 仕様書更新サマリー                                 |
| 13    | ローカルチェック結果, 変更サマリー, PR作成結果, PR情報, CI結果, マージ準備報告                                                                                              |

---

_このファイルは `generate-index.js` によって自動生成されました。_
_最終更新: 2026-02-28T00:33:37.480Z_
