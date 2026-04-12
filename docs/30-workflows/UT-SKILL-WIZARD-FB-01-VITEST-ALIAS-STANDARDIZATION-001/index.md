# UT-SKILL-WIZARD-FB-01-VITEST-ALIAS-STANDARDIZATION-001 - タスク実行仕様書

## メタ情報

| 項目       | 内容                                                                  |
| ---------- | --------------------------------------------------------------------- |
| タスクID   | UT-SKILL-WIZARD-FB-01-VITEST-ALIAS-STANDARDIZATION-001                |
| タイトル   | packages/shared/vitest.config.ts の @repo/shared resolve alias 標準化 |
| issue番号  | 2029                                                                  |
| 作成日     | 2026-04-08                                                            |
| ステータス | 完了（実装済み）                                                      |
| 優先度     | MEDIUM                                                                |
| スケール   | small                                                                 |
| タイプ     | improvement                                                           |
| 総Phase数  | 13                                                                    |

---

## 概要

`packages/shared/` 内テストが `@repo/shared` をインポートする場合、`vitest.config.ts` に
`resolve.alias` 設定が必須だが、パッケージ標準テンプレートに含まれていなかった。
ESLint post-tool-use フックが import パスを `../path` → `@repo/shared` へ自動変換した後、
vitest が `@repo/shared` を解決できずテストが全件失敗する問題が発生した。

## 検出元

UT-SKILL-WIZARD-W0-SMART-DEFAULT-REASONING-001 Phase 11 フィードバック（FB-01）

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
  --workflow docs/30-workflows/UT-SKILL-WIZARD-FB-01-VITEST-ALIAS-STANDARDIZATION-001 \
  --phase {{N}} \
  --artifacts "outputs/phase-{{N}}/{{FILE}}.md:{{DESCRIPTION}}"
```

---

## 成果物

| Phase | 主要成果物                                                       |
| ----- | ---------------------------------------------------------------- |
| 1     | 要件定義書, 受け入れ基準, 仕様抽出結果                           |
| 2     | 設計書, vitest設定変更計画, テスト戦略                           |
| 3     | 設計レビュー結果, ゲート判定                                     |
| 4     | テスト仕様書, Red結果                                            |
| 5     | 実装サマリー, 変更ファイル一覧                                   |
| 6     | 拡張テストケース, 回帰テスト結果                                 |
| 7     | カバレッジレポート                                               |
| 8     | リファクタリング計画（N/A可）                                    |
| 9     | 品質レポート                                                     |
| 10    | 最終レビュー結果, 出荷準備チェック                               |
| 11    | 手動テスト結果                                                   |
| 12    | 実装ガイド, 仕様更新サマリー, 未タスク検出, スキルフィードバック |
| 13    | -                                                                |

---

_作成日: 2026-04-08_
