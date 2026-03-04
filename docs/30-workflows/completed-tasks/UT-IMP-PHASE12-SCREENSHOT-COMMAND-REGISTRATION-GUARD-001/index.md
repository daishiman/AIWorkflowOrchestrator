# ut-imp-phase12-screenshot-command-registration-guard-001 - タスク実行仕様書

## メタ情報

| 項目       | 内容                                                     |
| ---------- | -------------------------------------------------------- |
| 機能名     | ut-imp-phase12-screenshot-command-registration-guard-001 |
| 作成日     | 2026-03-04                                               |
| ステータス | 実行中                                                   |
| 総Phase数  | 13                                                       |

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
| 13    | PR作成               | [phase-13-pr-creation.md](phase-13-pr-creation.md)           | 未実施     |

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
  --workflow docs/30-workflows/completed-tasks/UT-IMP-PHASE12-SCREENSHOT-COMMAND-REGISTRATION-GUARD-001 --phase {{N}} \
  --artifacts "outputs/phase-{{N}}/{{FILE}}.md:{{DESCRIPTION}}"
```

---

## 成果物

| Phase | 主要成果物                                                                                                       |
| ----- | ---------------------------------------------------------------------------------------------------------------- |
| 1     | 要件定義書, 受入基準, スコープ定義                                                                               |
| 2     | 設計書, 文書同期マトリクス, 検証コマンド設計, 仕様抽出マトリクス                                                 |
| 3     | 設計レビュー結果, レビューコメント                                                                               |
| 4     | テスト仕様書, テストケース, 統合テスト設計                                                                       |
| 5     | 実装サマリー, 変更差分一覧, 実行ログ                                                                             |
| 6     | テスト拡充レポート, 回帰マトリクス, 監査分離ログ                                                                 |
| 7     | カバレッジレポート, 欠落分析                                                                                     |
| 8     | リファクタログ, 命名規約表, 監査テンプレート                                                                     |
| 9     | 品質レポート, リスク評価                                                                                         |
| 10    | 最終レビュー結果, 最終レビューコメント                                                                           |
| 11    | 手動テスト結果, 発見課題, 証跡一覧                                                                               |
| 12    | 実装ガイド, 仕様更新サマリー, 更新履歴, 未タスク検出, スキルフィードバック, スキル準拠監査, エレガント性レビュー |
| 13    | -                                                                                                                |

---

_このファイルは `generate-index.js` によって自動生成されました。_
_最終更新: 2026-03-04T12:30:01.815Z_
