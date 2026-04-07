# Phase 11: 手動テスト

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 11                                |
| Phase名    | 手動テスト                        |
| 機能名     | task-ui-03-ipc-renderer-migration |
| 前提Phase  | Phase 10: 最終レビュー            |
| 次Phase    | Phase 12: ドキュメント更新        |
| 証跡方式   | NON_VISUAL                        |
| ステータス | pending                           |
| 作成日     | 2026-04-07                        |

## 目的

実際の Electron アプリ上で IPC 経路移行後の動作が正常であることを確認する。UI変更は伴わないため、スクリーンショットは不要（NON_VISUAL）。

## スクリーンショット判断

| タスク種別                    | スクリーンショット     | 判断理由                                |
| ----------------------------- | ---------------------- | --------------------------------------- |
| IPC/API変更のみ（UI変更なし） | **不要（NON_VISUAL）** | renderer 参照先の変更のみ、UIは変化なし |

## NON_VISUAL 判定

- 判定: `NON_VISUAL`
- 理由: `ImprovementProposalPanel` と `GovernanceSummaryPanel` の変更は API 参照先の移行のみで、レイアウトや視覚状態は変わらない
- 証跡: `skillCreatorAPI.applyRuntimeImprovement` / `skillCreatorAPI.getGovernanceState` の呼び出し成功、`window.electronAPI.skillCreator` 参照 0 件、Electron コンソール警告なし

## 参照資料

| 資料名               | パス                                                                                  | 説明                                  |
| -------------------- | ------------------------------------------------------------------------------------- | ------------------------------------- |
| 最終レビュー         | `outputs/phase-10/final-review-result.md`                                             | Phase 10 の受入判定                   |
| IPC 公開 API         | `apps/desktop/src/preload/skill-creator-api.ts`                                       | `skillCreatorAPI` の正本              |
| preload 公開エントリ | `apps/desktop/src/preload/index.ts`                                                   | `electronAPI.skillCreator` の互換シム |
| renderer 参照箇所    | `apps/desktop/src/renderer/components/skill/ImprovementProposalPanel.tsx`             | 変更対象 1                            |
| renderer 参照箇所    | `apps/desktop/src/renderer/components/organisms/AgentView/GovernanceSummaryPanel.tsx` | 変更対象 2                            |
| 設計レビュー         | `phase-3-design-review.md`                                                            | 互換シム方針の確認                    |

## 実行タスク

### Task 1: ImprovementProposalPanel 動作確認

アプリを起動し、Skill改善提案パネルで以下を確認:

| テストケース | 操作                       | 期待結果                                                           |
| ------------ | -------------------------- | ------------------------------------------------------------------ |
| TC-01        | 改善提案を適用する         | `skillCreatorAPI.applyRuntimeImprovement` が呼ばれ、正常に完了する |
| TC-02        | DevToolsでネットワーク確認 | `window.electronAPI.skillCreator` への呼び出しが発生しない         |

### Task 2: GovernanceSummaryPanel 動作確認

| テストケース | 操作                    | 期待結果                                                        |
| ------------ | ----------------------- | --------------------------------------------------------------- |
| TC-03        | ガバナンスパネルを表示  | `skillCreatorAPI.getGovernanceState` が呼ばれ、正常に表示される |
| TC-04        | DevToolsのConsoleを確認 | `window.electronAPI.skillCreator` 関連のエラーが発生しない      |

### Task 3: 全体的な Skill Creator フロー確認

- スキル作成フロー全体が正常に動作することを確認
- Electron コンソールに IPC 関連の警告・エラーが出ていないことを確認

## 統合テスト連携

手動統合テスト確認:

| テスト項目 | 確認内容                      | 期待結果             |
| ---------- | ----------------------------- | -------------------- |
| IPC経路    | DevToolsで呼び出し元APIを確認 | skillCreatorAPI 経由 |
| エラーなし | Electronコンソール確認        | 警告・エラーなし     |

## 成果物

| 成果物             | パス                                        | 説明                  |
| ------------------ | ------------------------------------------- | --------------------- |
| 手動チェックリスト | `outputs/phase-11/manual-test-checklist.md` | 実施前後の確認項目    |
| 手動テスト結果     | `outputs/phase-11/manual-test-result.md`    | テストケース実行結果  |
| 発見課題           | `outputs/phase-11/discovered-issues.md`     | Blocker / Note / Info |

## 完了条件

- [ ] TC-01〜TC-04 が全て PASS
- [ ] Electron コンソールに IPC 関連エラーなし
- [ ] `manual-test-checklist.md` が生成されている
- [ ] `discovered-issues.md` が生成されている
- [ ] スクリーンショット: NON_VISUAL（UI変更なしのため不要）
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている

## 次Phase

→ [Phase 12: ドキュメント更新](./phase-12-documentation.md)
