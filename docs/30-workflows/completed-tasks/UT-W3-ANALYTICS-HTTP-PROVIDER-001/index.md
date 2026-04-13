# UT-W3-ANALYTICS-HTTP-PROVIDER-001 - タスク実行仕様書

## メタ情報

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| 機能名     | UT-W3-ANALYTICS-HTTP-PROVIDER-001                    |
| タイトル   | 本番 analytics HTTP 送信実装（外部分析基盤への接続） |
| 作成日     | 2026-04-13                                           |
| ステータス | pending                                              |
| 総Phase数  | 13                                                   |
| 優先度     | P1（High）                                           |
| Issue      | #2097（CLOSED）                                      |
| 依存       | UT-W3-ANALYTICS-ADAPTER-001（完了済み）              |
| タスク種別 | docs-only（non-ui-task）                             |

---

## Phase一覧

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

## Phase完了時の必須アクション

1. **タスク100%実行**: Phase内で指定された全タスクを完全に実行
2. **成果物確認**: 全ての必須成果物が生成されていることを検証
3. **artifacts.json更新**: `complete-phase.js` でPhase完了ステータスを更新
4. **完了条件チェック**: 各タスクを完遂した旨を必ず明記

```bash
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/UT-W3-ANALYTICS-HTTP-PROVIDER-001 --phase {{N}} \
  --artifacts "outputs/phase-{{N}}/{{FILE}}.md:{{DESCRIPTION}}"
```

---

## 主要変更ファイル

| ファイル                                                       | 変更種別  | 説明                           |
| -------------------------------------------------------------- | --------- | ------------------------------ |
| `apps/desktop/src/main/ipc/analyticsHandler.ts`                | 修正      | `sendToAnalyticsProvider` 追加 |
| `apps/desktop/src/main/ipc/__tests__/analyticsHandler.test.ts` | 新規/修正 | HTTP 送信パステスト追加        |

---

## 成果物

| Phase | 主要成果物                                                                                   |
| ----- | -------------------------------------------------------------------------------------------- |
| 1     | 要件定義書, 受け入れ基準, 仕様抽出結果, 差分カバレッジ, トレーサビリティ行列                 |
| 2     | アーキテクチャ設計, HTTP送信設計, テスト戦略, 依存整合マトリクス                             |
| 3     | 設計レビュー結果, ゲート判定, 矛盾チェック表                                                 |
| 4     | テスト仕様書, Red結果, HTTP送信モック設計                                                    |
| 5     | 実装サマリー, 変更ファイル一覧, 契約差分                                                     |
| 6     | 拡張テストケース, 回帰テスト結果, 異常系結果                                                 |
| 7     | カバレッジ計画, 未到達分析, トレーサビリティ網羅率                                           |
| 8     | リファクタ計画, 再テスト計画, 責務境界マップ                                                 |
| 9     | 品質レポート, リスク台帳, 因果ループ監査                                                     |
| 10    | 最終レビュー結果, 是正計画, 出荷準備チェック                                                 |
| 11    | 手動テストチェックリスト, 手動テスト結果, 発見課題一覧                                       |
| 12    | 実装ガイド, 仕様更新サマリー, 更新履歴, 未タスク検出, スキルフィードバック, compliance check |
| 13    | ローカル確認結果, 変更サマリー, PR情報                                                       |

---

_このファイルは task-specification-creator によって生成されました。_
_最終更新: 2026-04-13_
