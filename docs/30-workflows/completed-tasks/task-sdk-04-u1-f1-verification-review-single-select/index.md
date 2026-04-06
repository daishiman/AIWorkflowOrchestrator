# TASK-SDK-04-U1-F1 - タスク実行仕様書

## メタ情報

| 項目       | 内容                                                         |
| ---------- | ------------------------------------------------------------ |
| タスクID   | TASK-SDK-04-U1-F1                                            |
| タスク名   | verification_review request を single_select kind に変更する |
| 機能名     | task-sdk-04-u1-f1-verification-review-single-select          |
| 作成日     | 2026-04-06                                                   |
| ステータス | pending                                                      |
| 総Phase数  | 13                                                           |
| 優先度     | 中                                                           |
| 規模       | 小規模                                                       |
| 親タスク   | TASK-SDK-04-U1                                               |
| 関連Issue  | #1693                                                        |

---

## 背景・目的

TASK-SDK-04-U1 で `submitUserInput()` に reason 別の phase transition semantics を実装した。
engine は `selectedOptionId` に基づいて approve/improve/reject を判定するが、
`createVerificationReviewRequest()` が `free_text` kind のままであるため、UI で選択肢が表示されない。

`createVerificationReviewRequest()` を `single_select` kind に変更し、
approve/improve/reject の 3 選択肢を提示することでこの乖離を解消する。

---

## オーケストレーション方針

- Phase 2 では `task-specification-creator` 準拠監査 lane と `aiworkflow-requirements` 同期監査 lane を並列実行する。
- 両 lane の結果を受けて、synthesis lane が最小差分の改善案へ収束させる。
- 分析では 30 種の思考法を 7 カテゴリすべてで一巡し、重複する示唆は synthesis で統合する。
- 既存実装の破棄は原則しない。破棄が最小複雑性になると判断された場合のみ、Phase 3 の gate で根拠を明示して戻す。

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
| 13    | PR作成               | [phase-13-pr-creation.md](phase-13-pr-creation.md)           | pending    |

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

## 主要変更対象ファイル

| ファイル                                                                              | 変更種別 | 内容                                                                                              |
| ------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------- |
| `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`                | 修正     | `createVerificationReviewRequest()` の kind を `free_text` → `single_select` に変更、options 追加 |
| `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts` | 修正     | verification_review テストの submission を `textValue` → `selectedOptionId` に変更                |

---

## Phase完了時の必須アクション

1. **タスク100%実行**: Phase内で指定された全タスクを完全に実行
2. **成果物確認**: 全ての必須成果物が生成されていることを検証
3. **artifacts.json更新**: `complete-phase.js` でPhase完了ステータスを更新
4. **完了条件チェック**: 各タスクを完遂した旨を必ず明記

```bash
# Phase完了処理
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/task-sdk-04-u1-f1-verification-review-single-select --phase {{N}} \
  --artifacts "outputs/phase-{{N}}/{{FILE}}.md:{{DESCRIPTION}}"
```

---

## 成果物

| Phase | 主要成果物                                                                               |
| ----- | ---------------------------------------------------------------------------------------- |
| 1     | 要件定義書, 受け入れ基準, 仕様抽出結果                                                   |
| 2     | 設計書（kind変更設計・30種の思考法分析）, サブエージェント分担表, テスト戦略             |
| 3     | 設計レビュー結果, ゲート判定                                                             |
| 4     | テスト仕様書, Red結果                                                                    |
| 5     | 実装サマリー, 変更ファイル一覧                                                           |
| 6     | 拡張テストケース, 回帰テスト結果                                                         |
| 7     | カバレッジレポート                                                                       |
| 8     | リファクタリング計画・結果                                                               |
| 9     | 品質レポート                                                                             |
| 10    | 最終レビュー結果, ゲート判定                                                             |
| 11    | 手動テスト結果（NON_VISUAL）                                                             |
| 12    | 実装ガイド, 仕様更新サマリー, 更新履歴, 未タスク検出, スキルフィードバック, 準拠チェック |
| 13    | ローカル確認結果, 変更サマリー, PR作成結果, PR情報                                       |

---

_このファイルは task-specification-creator skill に基づいて生成されました。_
_作成日: 2026-04-06_
