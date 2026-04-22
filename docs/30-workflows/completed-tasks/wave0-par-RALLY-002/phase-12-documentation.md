# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 12                                     |
| タスクID   | TASK-RALLY-002                         |
| 機能名     | restored-pending-request-clarification |
| 前提Phase  | Phase 11                               |
| 後続Phase  | Phase 13                               |
| 作成日     | 2026-04-21                             |
| ステータス | completed                              |

## 目的

変更内容をドキュメントとして記録し、後続タスク（RALLY-010〜013）に引き継ぐ情報を整理する。

## 実行タスク

1. Phase 12 canonical 6成果物を `outputs/phase-12/` に揃える
2. 実装内容、手動テスト証跡、system spec 影響を整理する
3. 未タスク有無と skill へのフィードバックを明文化する

## 変更サマリー

`ConversationalInterview.tsx` の `pendingRequest` 合成式に、`restoredPendingRequest` を優先する理由と適用条件を説明するコメントを追加した。

加えて、既存の clear `useEffect` が「requestId 変化時に restored state から通常フローへ戻す」役割であることを明文化し、S-1〜S-4 / X-1〜X-2 のシナリオテストを追加して切り替えルールを固定した。

これにより、ラリー機能ギャップの設計書（rally-phase-1-analysis.md）の懸念点2「restoredPendingRequest合成の優先ルール不明確」を close-out できる状態になった。

## 中学生レベルの概念説明

**セッション復元とは何か？**

アプリを使っている途中でパソコンを再起動したり、ページを更新したりしても、「どこまでやっていたか」を覚えておいて続きから始められる仕組みです。

このとき、「前回の続きを表示するデータ（restoredPendingRequest）」と「サーバーから届く最新のデータ（workflowSnapshot）」の2種類があります。最初は前者を優先して素早く表示し、最新データが届いたら自動的に切り替える。このルールをコメントとテストでわかりやすく固定したのが今回の変更です。

## 更新すべきドキュメント

| ドキュメント                                                                             | 更新内容                         | 優先度 |
| ---------------------------------------------------------------------------------------- | -------------------------------- | ------ |
| `docs/30-workflows/wave0-par-RALLY-002/index.md`                                         | workflow root と status 記録更新 | 必須   |
| `docs/30-workflows/wave0-par-RALLY-002/artifacts.json`                                   | artifacts / phase status と整合  | 必須   |
| `docs/30-workflows/skill-create-flow-gaps/index.md`                                      | RALLY-002 の完了状態反映         | 推奨   |
| `docs/30-workflows/completed-tasks/00-task-spec-design-docs-2/rally-phase-1-analysis.md` | 懸念点2の close-out 注記         | 推奨   |

## 後続タスクへの引き継ぎ

| 引き継ぎ項目                             | 内容                                                                              | 引き継ぎ先     |
| ---------------------------------------- | --------------------------------------------------------------------------------- | -------------- |
| ConversationalInterview.tsx の現在の状態 | pendingRequest合成コメント追加済み・クリアuseEffect追加済み                       | RALLY-010      |
| pendingRequest の動作仕様                | セッション復元中はrestoredPendingRequestを優先、awaitingUserInput確定後に切り替え | RALLY-010〜013 |

## 参照資料

| 資料名                   | パス                                              | 用途            |
| ------------------------ | ------------------------------------------------- | --------------- |
| 手動テスト結果           | `outputs/phase-11/manual-test-result.md`          | Phase 11 成果物 |
| 実装サマリー             | `outputs/phase-5/implementation-summary.md`       | Phase 5 成果物  |
| P50チェック結果          | `outputs/phase-1/p50-check-result.md`             | Phase 1 成果物  |
| 変更設計書               | `outputs/phase-2/change-design.md`                | Phase 2 成果物  |
| リファクタリング計画     | `outputs/phase-8/refactoring-plan.md`             | Phase 8 成果物  |
| 責務境界マップ           | `outputs/phase-8/responsibility-boundary-map.md`  | Phase 8 成果物  |
| 品質レポート             | `outputs/phase-9/quality-report.md`               | Phase 9 成果物  |
| リスク台帳               | `outputs/phase-9/risk-register.md`                | Phase 9 成果物  |
| 因果ループ監査           | `outputs/phase-9/causal-loop-check.md`            | Phase 9 成果物  |
| 最終レビュー結果         | `outputs/phase-10/final-review-result.md`         | Phase 10 成果物 |
| ゲート判定               | `outputs/phase-10/gate-decision.md`               | Phase 10 成果物 |
| 出荷準備チェック         | `outputs/phase-10/release-readiness-checklist.md` | Phase 10 成果物 |
| 手動テストチェックリスト | `outputs/phase-11/manual-test-checklist.md`       | Phase 11 成果物 |
| 証跡インデックス         | `outputs/phase-11/evidence-index.md`              | Phase 11 成果物 |

## 統合テスト連携

- `implementation-guide.md` に Phase 11 `NON_VISUAL` 判定と manual result を相互参照で残す
- `system-spec-update-summary.md` で docs 更新対象、未更新対象、理由を分離して記録する

## 多角的チェック観点（AIが判断）

- 抽象化思考: 今回の知見を RALLY 系タスクへ再利用できるルールとして残せるか
- ダブル・ループ思考: 個別 close-out だけでなく今後の spec drift 防止に寄与するか
- 論点思考: 「何を更新したか」と「何を更新しなかったか」を分離しているか

## サブタスク管理

- D12-1: implementation-guide
- D12-2: system-spec-update-summary
- D12-3: documentation-changelog
- D12-4: unassigned-task-detection
- D12-5: skill-feedback-report
- D12-6: phase12-task-spec-compliance-check

## 成果物

| 成果物               | パス                                                     | 説明                              |
| -------------------- | -------------------------------------------------------- | --------------------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`               | 変更内容の詳細ガイド              |
| 仕様更新サマリー     | `outputs/phase-12/system-spec-update-summary.md`         | 変更内容と影響範囲のサマリー      |
| 更新履歴             | `outputs/phase-12/documentation-changelog.md`            | ドキュメント更新の記録            |
| 未タスク検出         | `outputs/phase-12/unassigned-task-detection.md`          | follow-up の有無と理由            |
| skill フィードバック | `outputs/phase-12/skill-feedback-report.md`              | 改善点または改善点なしの記録      |
| Phase 12 準拠確認    | `outputs/phase-12/phase12-task-spec-compliance-check.md` | canonical 6成果物と証跡の最終確認 |

## 完了条件

- [ ] canonical 6成果物を全て生成した
- [ ] 更新したドキュメントと未更新理由を区別して記録した
- [ ] Phase 11 が `NON_VISUAL` であることと screenshot 不要理由を記録した
- [ ] RALLY-010以降への handoff を implementation-guide または summary に記録した
- [ ] 成果物テーブル記載のファイルを全件生成した

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 受け入れ基準 AC-1〜AC-5 全 PASS 確認
- [ ] 成果物テーブル記載のファイルを全件生成

## 次のPhase

Phase 13: PR作成
