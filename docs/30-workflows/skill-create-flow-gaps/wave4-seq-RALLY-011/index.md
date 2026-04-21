# TASK-RALLY-011 - タスク実行仕様書

## メタ情報

| 項目       | 内容                 |
| ---------- | -------------------- |
| タスクID   | TASK-RALLY-011       |
| 機能名     | 送信中競合防止UI強化 |
| 作成日     | 2026-04-21           |
| ステータス | pending              |
| 総Phase数  | 13                   |

---

## ConversationalInterviewドメイン実行順序

```text
RALLY-002（pendingRequest合成修正）← Wave 1
↓
RALLY-010（ラリー完了UI） ← Wave 3
↓
RALLY-011（送信中競合防止）← Wave 3【本タスク】
↓
RALLY-012（エラー回復導線）
↓
RALLY-013（Undo可能範囲視覚化）
```

**直列実行必須**: ConversationalInterview.tsx への変更はすべて同一ファイルを対象とするため、
RALLY-010 完了後に本タスクを着手する。

---

## 依存関係

| 種別     | タスクID  | 理由                                                            |
| -------- | --------- | --------------------------------------------------------------- |
| 前提     | RALLY-010 | 同一ファイル（ConversationalInterview.tsx）への変更のため直列   |
| 前提     | RALLY-005 | IPC権限設計（workflowSnapshot更新権限）が確立されてから着手     |
| 後続     | RALLY-012 | 同一ファイルへの変更のため直列                                  |
| 並列不可 | -         | 同一ファイル衝突により他ConversationalInterviewタスクと並列不可 |

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

## Phase内SubAgent編成方針

| Phase | SubAgent構成                                     | 実行形態 |
| ----- | ------------------------------------------------ | -------- |
| 1     | SubAgent-A（isSubmitting中push受信シナリオ分析） | 直列     |
| 2     | SubAgent一体（バッファリング実装方針の設計）     | 直列     |
| 11    | UIの目視確認シナリオを複数SubAgentで実施         | **並列** |

---

## 成果物

| Phase | 主要成果物                                                       |
| ----- | ---------------------------------------------------------------- |
| 1     | 要件定義書, 受け入れ基準, isSubmitting競合シナリオ分析           |
| 2     | バッファリング設計書, pendingSnapshotRef設計, activeSnapshot設計 |
| 3     | 設計レビュー結果, ゲート判定, 矛盾チェック表                     |
| 4     | テスト仕様書, Red結果                                            |
| 5     | 実装サマリー, 変更ファイル一覧                                   |
| 6     | 拡張テストケース, 回帰テスト結果, 異常系結果                     |
| 7     | カバレッジ計画, 未到達分析, トレーサビリティ網羅率               |
| 8     | リファクタ計画, 再テスト計画, 責務境界マップ                     |
| 9     | 品質レポート, リスク台帳, 因果ループ監査                         |
| 10    | 最終レビュー結果, 是正計画, 出荷準備チェック                     |
| 11    | 手動テスト結果, 証跡インデックス, スクリーンショット計画         |
| 12    | 実装ガイド, 仕様更新サマリー, 更新履歴, 未タスク検出             |
| 13    | PR準備メモ, 引き継ぎサマリー, 承認チェック                       |

---

## Phase完了時の必須アクション

1. **タスク100%実行**: Phase内で指定された全タスクを完全に実行
2. **成果物確認**: 全ての必須成果物が生成されていることを検証
3. **artifacts.json更新**: `complete-phase.js` でPhase完了ステータスを更新
4. **完了条件チェック**: 各タスクを完遂した旨を必ず明記

```bash
# Phase完了処理
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/skill-create-flow-gaps/p11-seq-RALLY-011 --phase {{N}} \
  --artifacts "outputs/phase-{{N}}/{{FILE}}.md:{{DESCRIPTION}}"
```
