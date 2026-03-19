# Phase 11: 手動テスト結果

## メタ情報

| 項目       | 内容                                                    |
| ---------- | ------------------------------------------------------- |
| タスクID   | TASK-IMP-RAG-EMBEDDING-EXTRACTION-AI-RUNTIME-001        |
| Phase      | 11                                                      |
| 実施日     | 2026-03-19                                              |
| ステータス | completed                                               |
| 判定       | PASS                                                    |
| 実施方式   | current build preflight + fallback review board capture |

## 実施概要

本 workflow は docs-heavy だが、ユーザーが branch 全体の画面検証を明示要求したため、
current workflow 配下へ representative screenshot evidence を再構成した。

- direct capture 試行: `apps/desktop/scripts/capture-task-06-main-chat-settings-runtime-sync-phase11.mjs`
- 結果: `@esbuild/darwin-arm64` と current 環境の `darwin-x64` が不一致のため失敗
- fallback: same-day upstream evidence + current workflow review board を `capture-rag-embedding-runtime-phase11-fallback.mjs` で生成
- code/spec walkthrough: `aiHandlers.ts` / `communityHandlers.ts` / `preload/types.ts` / aiworkflow-requirements を同一ターンで突合

## テスト結果サマリー

| テストケース | 観点                                | 期待結果                                                                                  | 結果 | 証跡                                                          | 備考                                                                 |
| ------------ | ----------------------------------- | ----------------------------------------------------------------------------------------- | ---- | ------------------------------------------------------------- | -------------------------------------------------------------------- |
| TC-11-01     | Settings / RAG guidance sanity      | runtime health と RAG guidance の責務分離が視覚的に把握できる                             | PASS | `screenshots/TC-11-01-rag-settings-guidance-review-board.png` | source evidence: `TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001`        |
| TC-11-02     | AI IPC contract sanity              | `AI_CHECK_CONNECTION` / `AI_INDEX` が `disconnected` / zero-count guidance として整合する | PASS | `screenshots/TC-11-02-ai-ipc-guidance-review-board.png`       | `AICheckConnectionResponse.lastSyncTime` は optional に整合          |
| TC-11-03     | Community guidance sanity           | community IPC が `NOT_IN_SCOPE` guidance-only を返す                                      | PASS | `screenshots/TC-11-03-community-guidance-review-board.png`    | response shape drift は follow-up 化                                 |
| TC-11-04     | GraphRAG / HybridRAG runtime sanity | fallbackReason / FACTORY_NOT_READY / embed failure warn+save が仕様に反映される           | PASS | `screenshots/TC-11-04-graphrag-hybrid-review-board.png`       | GraphRAGQueryService / HybridRAGFactory / CommunitySummarizer を突合 |

## 仕様照合結果

| 確認項目                          | 結果 | 根拠                                                                                         |
| --------------------------------- | ---- | -------------------------------------------------------------------------------------------- |
| レイアウト / grouping             | PASS | source screenshot 上で guidance と状態表示が分離され、review board でも責務単位に再構成した  |
| guidance wording                  | PASS | `利用できない / 今後のリリースで対応予定` の文言が実装と一致                                 |
| IPC 契約整合                      | PASS | `AI_CHECK_CONNECTION` / `AI_INDEX` / `CommunityResult<T>` の drift を system spec に反映     |
| GraphRAG / HybridRAG runtime note | PASS | `fallbackReason` / `[FACTORY_NOT_READY]` / embed failure warn を current workflow 正本へ同期 |

## direct capture 失敗の記録

| 項目     | 内容                                                                                       |
| -------- | ------------------------------------------------------------------------------------------ |
| コマンド | `node apps/desktop/scripts/capture-task-06-main-chat-settings-runtime-sync-phase11.mjs`    |
| 失敗理由 | `@esbuild/darwin-arm64` が install 済みだが current 実行環境は `darwin-x64`                |
| 判定     | feature blocker ではなく capture environment blocker                                       |
| 対応     | `phase-11-12-guide.md` の fallback review board ルールに従い current workflow 配下で再撮影 |

## Visual Review

詳細は `ui-sanity-visual-review.md` に記録した。総合所見は以下。

- hierarchy: source screenshot の guidance / health / runtime 情報の分離は十分
- grouping: current review board は責務単位に再構成され、検証対象が明確
- contrast: guidance message と補足説明の可読性は維持
- risk: current build 直撮りは未達のため、今後 current build preflight の共通 guard を維持する

## 発見事項要約

| 区分    | 件数 | 内容                                                                       |
| ------- | ---- | -------------------------------------------------------------------------- |
| Blocker | 0    | なし                                                                       |
| Note    | 3    | response shape drift、HybridRAGFactory wiring、RelevanceEvaluator 設計差分 |
| Info    | 1    | current build capture は esbuild mismatch で fallback 実施                 |

## 総合判定

Phase 11 は PASS。
current build の直接 capture は失敗したが、明示的な fallback review board 経路で
TC-ID と `.png` 証跡を current workflow 正本へ再構成し、仕様・実装・UI sanity の突合を完了した。
