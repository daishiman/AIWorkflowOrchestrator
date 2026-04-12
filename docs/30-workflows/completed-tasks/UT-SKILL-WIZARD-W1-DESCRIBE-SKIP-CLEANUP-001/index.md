# UT-SKILL-WIZARD-W1-DESCRIBE-SKIP-CLEANUP-001 - タスク実行仕様書

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| タスクID   | UT-SKILL-WIZARD-W1-DESCRIBE-SKIP-CLEANUP-001   |
| タイトル   | describe.skip 内の旧 testid 参照クリーンアップ |
| issue番号  | 2053                                           |
| 作成日     | 2026-04-11                                     |
| ステータス | 未実施                                         |
| 優先度     | 低                                             |
| スケール   | small                                          |
| タイプ     | refactoring                                    |
| タスク種別 | NON_VISUAL                                     |
| 総Phase数  | 13                                             |

---

## 概要

`describe.skip` ブロック内に残存する削除済み testid `skill-lifecycle-request-input` への参照を、
対象テストファイル2件から削除または現行 testid に書き換えるクリーンアップタスク。

SkillLifecyclePanel のリファクタリング（遷移ボタン化）に伴い `skill-lifecycle-request-input` testid が
削除されたが、`SkillLifecyclePanel.llm-generation.test.tsx` および
`SkillLifecyclePanel.auth-regression.test.tsx` 内の `describe.skip` ブロックに旧 testid 参照が
残留している。スキップ状態のテストであっても、存在しない testid への参照は将来的な混乱の原因となるため、
クリーンアップを行う。

## 検出元

UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001 Phase 12 フィードバック #2（親タスク: #2015）

---

## Phase一覧

| Phase | 名称                 | 仕様書                                                       | ステータス |
| ----- | -------------------- | ------------------------------------------------------------ | ---------- |
| 1     | 要件定義             | [phase-1-requirements.md](phase-1-requirements.md)           | 未実施     |
| 2     | 設計                 | [phase-2-design.md](phase-2-design.md)                       | 未実施     |
| 3     | 設計レビューゲート   | [phase-3-design-review.md](phase-3-design-review.md)         | 未実施     |
| 4     | テスト作成           | [phase-4-test-creation.md](phase-4-test-creation.md)         | 未実施     |
| 5     | 実装                 | [phase-5-implementation.md](phase-5-implementation.md)       | 未実施     |
| 6     | テスト拡充           | [phase-6-test-expansion.md](phase-6-test-expansion.md)       | 未実施     |
| 7     | テストカバレッジ確認 | [phase-7-coverage-check.md](phase-7-coverage-check.md)       | 未実施     |
| 8     | リファクタリング     | [phase-8-refactoring.md](phase-8-refactoring.md)             | 未実施     |
| 9     | 品質保証             | [phase-9-quality-assurance.md](phase-9-quality-assurance.md) | 未実施     |
| 10    | 最終レビューゲート   | [phase-10-final-review.md](phase-10-final-review.md)         | 未実施     |
| 11    | 手動テスト検証       | [phase-11-manual-test.md](phase-11-manual-test.md)           | 未実施     |
| 12    | ドキュメント更新     | [phase-12-documentation.md](phase-12-documentation.md)       | 未実施     |
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
  --workflow docs/30-workflows/UT-SKILL-WIZARD-W1-DESCRIBE-SKIP-CLEANUP-001 \
  --phase {{N}} \
  --artifacts "outputs/phase-{{N}}/{{FILE}}.md:{{DESCRIPTION}}"
```

---

## 成果物

| Phase | 主要成果物                                                       |
| ----- | ---------------------------------------------------------------- |
| 1     | 要件定義書, 受け入れ基準, 仕様抽出結果                           |
| 2     | 設計書, testidクリーンアップ計画                                 |
| 3     | 設計レビュー結果, ゲート判定                                     |
| 4     | テスト仕様書（N/A可）                                            |
| 5     | 実装サマリー, 変更ファイル一覧                                   |
| 6     | 回帰テスト結果                                                   |
| 7     | カバレッジレポート                                               |
| 8     | リファクタリングレポート                                         |
| 9     | 品質レポート                                                     |
| 10    | 最終レビュー結果, 出荷準備チェック                               |
| 11    | 手動テスト結果                                                   |
| 12    | 実装ガイド, 仕様更新サマリー, 未タスク検出, スキルフィードバック |
| 13    | -                                                                |

---

_作成日: 2026-04-11_
