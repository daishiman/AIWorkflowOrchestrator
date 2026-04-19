---
task_id: UT-LIFECYCLE-PANEL-LLM-GEN-DESCRIBE-SKIP-CLEANUP-001
task_name: SkillLifecyclePanel LLM生成テスト describe.skip クリーンアップ
category: 改善
target_feature: SkillLifecyclePanel LLM生成テスト（llm-generation.test.tsx）
priority: 中
scale: 中規模
status: completed
issue_number: 2236
created_date: 2026-04-18
dependencies:
  - UT-W2-03A-LLM-GENERATION-TEST-CLEANUP-001
---

# UT-LIFECYCLE-PANEL-LLM-GEN-DESCRIBE-SKIP-CLEANUP-001 - タスク実行仕様書

## タスクID

`UT-LIFECYCLE-PANEL-LLM-GEN-DESCRIBE-SKIP-CLEANUP-001`

## タスク名

SkillLifecyclePanel LLM生成テスト describe.skip クリーンアップ

## 背景

`SkillLifecyclePanel.llm-generation.test.tsx` に 12 件の `describe.skip` が存在し、スキップされた状態のまま放置されている。
また、廃止済み API（`planSkill` / `detectMode`）に依存するモック宣言がテストファイル内に残存しており、テストコードの保守性を低下させている。`executePlan` は現行フローのため cleanup 対象に含めない。

依存タスク `UT-W2-03A-LLM-GENERATION-TEST-CLEANUP-001` が完了済みであるため、本タスクではその成果を引き継ぎ、`describe.skip` の適切な処理（削除・修正・別途 Issue 化）および旧 API モック宣言の整理を行う。

## 目的

- `SkillLifecyclePanel.llm-generation.test.tsx` の `describe.skip` を 0 件にする
- 廃止済み API（`planSkill` / `detectMode`）依存のモック宣言を除去する
- テストコードの保守性・可読性を向上させる
- クリーンアップ後の全テストが PASS であることを確認する

## スコープ

| 対象               | パス                                                                                               |
| ------------------ | -------------------------------------------------------------------------------------------------- |
| 主対象ファイル     | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx` |
| 参照コンポーネント | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                               |
| スコープ外         | UIコンポーネント本体の変更、他テストファイルの変更                                                 |

## Phase 構成テーブル

| Phase | 名称                 | 仕様書                                                       | ステータス |
| ----- | -------------------- | ------------------------------------------------------------ | ---------- |
| 1     | 要件定義             | `phase-1-requirements.md`                                    | completed  |
| 2     | 設計                 | `phase-2-design.md`                                          | completed  |
| 3     | 設計レビューゲート   | [phase-3-design-review.md](phase-3-design-review.md)         | completed  |
| 4     | テスト作成           | `phase-4-test-creation.md`                                   | completed  |
| 5     | 実装                 | `phase-5-implementation.md`                                  | completed  |
| 6     | テスト拡充           | `phase-6-test-expansion.md`                                  | completed  |
| 7     | テストカバレッジ確認 | `phase-7-coverage-check.md`                                  | completed  |
| 8     | リファクタリング     | [phase-8-refactoring.md](phase-8-refactoring.md)             | completed  |
| 9     | 品質保証             | [phase-9-quality-assurance.md](phase-9-quality-assurance.md) | completed  |
| 10    | 最終レビューゲート   | [phase-10-final-review.md](phase-10-final-review.md)         | completed  |
| 11    | 手動テスト検証       | [phase-11-manual-test.md](phase-11-manual-test.md)           | completed  |
| 12    | ドキュメント更新     | [phase-12-documentation.md](phase-12-documentation.md)       | completed  |
| 13    | PR作成               | [phase-13-pr-creation.md](phase-13-pr-creation.md)           | blocked    |

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

## 成果物一覧

| Phase | 主要成果物                                                                                 |
| ----- | ------------------------------------------------------------------------------------------ |
| 1     | 要件定義書, 受け入れ基準, 仕様抽出結果                                                     |
| 2     | 設計書, テスト戦略                                                                         |
| 3     | 設計レビュー結果, ゲート判定                                                               |
| 4     | テスト仕様書, Red 結果                                                                     |
| 5     | 実装サマリー, 変更ファイル一覧                                                             |
| 6     | 拡張テストケース, 回帰テスト結果                                                           |
| 7     | カバレッジ計画, トレーサビリティ網羅率                                                     |
| 8     | リファクタ計画, 再テスト計画, 責務境界マップ                                               |
| 9     | 品質レポート, リスク台帳, 因果ループ監査                                                   |
| 10    | 最終レビュー結果, 是正計画, 出荷準備チェック                                               |
| 11    | 手動テスト結果（非視覚シナリオ）, 証跡インデックス（N/A明記）                              |
| 12    | 実装ガイド（中学生向け概念説明含む）, 仕様更新サマリー, 未タスク検出, スキルフィードバック |
| 13    | PR準備メモ, 引き継ぎサマリー, 承認チェック                                                 |

## 完了条件チェックリスト

- [ ] `describe.skip` が対象ファイルで 0 件であることを確認
- [ ] 廃止済み API（`planSkill` / `detectMode`）のモック宣言が 0 件であることを確認
- [ ] 不要な import 文が 0 件であることを確認
- [ ] Vitest 全件 PASS であることを確認
- [ ] TypeScript 型エラーが 0 件であることを確認
- [ ] ESLint エラー・警告が 0 件であることを確認
- [ ] Phase 8〜13 の全成果物が作成されていることを確認
- [ ] Phase 12 の中学生レベル概念説明（describe.skip）が含まれていることを確認
- [ ] Phase 11 の NON_VISUAL 判定根拠が明記されていることを確認
- [ ] artifacts.json が最終ステータスに更新されていることを確認

---

## Phase 完了時の必須アクション

1. **タスク 100% 実行**: Phase 内で指定された全タスクを完全に実行
2. **成果物確認**: 全ての必須成果物が生成されていることを検証
3. **artifacts.json 更新**: `complete-phase.js` で Phase 完了ステータスを更新
4. **完了条件チェック**: 各タスクを完遂した旨を必ず明記

```bash
# Phase 完了処理
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/UT-LIFECYCLE-PANEL-LLM-GEN-DESCRIBE-SKIP-CLEANUP-001 \
  --phase {{N}} \
  --artifacts "outputs/phase-{{N}}/{{FILE}}.md:{{DESCRIPTION}}"
```

---

_このファイルは task-specification-creator によって生成されました。_
_最終更新: 2026-04-18T00:00:00.000Z_
