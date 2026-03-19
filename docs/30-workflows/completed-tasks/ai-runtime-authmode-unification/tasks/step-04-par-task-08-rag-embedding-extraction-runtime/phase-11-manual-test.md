# Phase 11: 手動テスト - タスク仕様書

## メタ情報

| 項目       | 内容                                             |
| ---------- | ------------------------------------------------ |
| Phase      | 11                                               |
| Phase名    | 手動テスト                                       |
| タスクID   | TASK-IMP-RAG-EMBEDDING-EXTRACTION-AI-RUNTIME-001 |
| 前提Phase  | Phase 10（最終レビュー）                         |
| 後続Phase  | Phase 12（ドキュメント）                         |
| ステータス | completed                                        |
| 作成日     | 2026-03-13                                       |
| 更新日     | 2026-03-19                                       |
| 機能名     | rag-embedding-extraction-runtime                 |

## タスク種別判定

```text
判定: DOCS_HEAVY + SCREENSHOT_REQUIRED
理由:
- 本 workflow の主軸は runtime ルール整理と仕様同期であり、専用 UI 実装タスクではない
- ただしユーザーが「画面関係の検証はスクリーンショットで」と明示要求した
- phase-11-12-guide.md の explicit visual sanity ルールに従い、current workflow 配下で representative screenshot を残す

実施方式:
1. current build の直接 capture を試行
2. esbuild native binary mismatch で current build capture が失敗した場合は、
   same-day upstream evidence + current workflow review board capture に切り替える
3. screenshot と code/spec walkthrough を突合し、Apple UI/UX 観点で sanity review を行う
```

## 目的

RAG / AI_INDEX / Embedding / Extraction / Graph Summary の runtime ルールが、
実装・仕様書・既存 UI surface で矛盾なく表現されているかを確認する。
本 Phase では current workflow 正本に screenshot evidence を集約し、Phase 12 の spec sync と同値にする。

## テストケース

| テストケース | 観点                                | 参照 UI / 契約                                                  | 期待結果                                                                        | 証跡                                                          |
| ------------ | ----------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| TC-11-01     | Settings / RAG guidance sanity      | SettingsView の health / RAG guidance surface                   | runtime health と RAG guidance の責務分離が視覚的に把握できる                   | `screenshots/TC-11-01-rag-settings-guidance-review-board.png` |
| TC-11-02     | AI IPC contract sanity              | `AI_CHECK_CONNECTION` / `AI_INDEX` の legacy guidance 契約      | 実装・型定義・system spec が `disconnected` / zero-count guidance に整合する    | `screenshots/TC-11-02-ai-ipc-guidance-review-board.png`       |
| TC-11-03     | Community guidance sanity           | community IPC の guidance-only 応答                             | UI/契約が「未対応機能を guidance で返す」方針に整合する                         | `screenshots/TC-11-03-community-guidance-review-board.png`    |
| TC-11-04     | GraphRAG / HybridRAG runtime sanity | GraphRAG fallback / HybridRAGFactory stub / CommunitySummarizer | fallbackReason / FACTORY_NOT_READY / embed failure warn+save が仕様に反映される | `screenshots/TC-11-04-graphrag-hybrid-review-board.png`       |

## 画面カバレッジマトリクス

| テストケース | 画面 / 責務                        | 状態                                   | 取得方式                               | 優先度 | 証跡                                                          |
| ------------ | ---------------------------------- | -------------------------------------- | -------------------------------------- | ------ | ------------------------------------------------------------- |
| TC-11-01     | Settings health / guidance         | 代表状態                               | upstream source + current review board | A      | `screenshots/TC-11-01-rag-settings-guidance-review-board.png` |
| TC-11-02     | AI IPC guidance contract           | disconnected / zero-count              | current review board                   | A      | `screenshots/TC-11-02-ai-ipc-guidance-review-board.png`       |
| TC-11-03     | Community unavailable guidance     | guidance-only / NOT_IN_SCOPE           | upstream source + current review board | A      | `screenshots/TC-11-03-community-guidance-review-board.png`    |
| TC-11-04     | GraphRAG / HybridRAG runtime notes | fallback / not-ready / partial-failure | current review board                   | B      | `screenshots/TC-11-04-graphrag-hybrid-review-board.png`       |

## 実行タスク

- current build capture preflight: existing capture script を実行し、直接撮影可否を確認する
- fallback evidence capture: same-day upstream evidence と current review board を組み合わせて screenshot を生成する
- code / spec walkthrough: `aiHandlers.ts` / `communityHandlers.ts` / `preload/types.ts` / aiworkflow-requirements を同時突合する
- Apple UI/UX review: hierarchy、grouping、contrast、guidance clarity の4観点で sanity review を行う
- follow-up classification: Blocker / Note / Info を `discovered-issues.md` に残す

## 実行手順

### ステップ 1: current build capture の可否を確認する

以下を実行し、dev capture が可能か判定する。

```bash
node apps/desktop/scripts/capture-task-06-main-chat-settings-runtime-sync-phase11.mjs
```

### ステップ 2: 失敗時は fallback review board へ切り替える

current build capture が環境依存で失敗した場合は、same-day upstream screenshot と current workflow review board を current workflow 配下に再生成する。

```bash
node apps/desktop/scripts/capture-rag-embedding-runtime-phase11-fallback.mjs
```

### ステップ 3: TC-ID と証跡を current workflow 正本へ同期する

- `outputs/phase-11/manual-test-checklist.md`
- `outputs/phase-11/screenshot-plan.json`
- `outputs/phase-11/manual-test-result.md`
- `outputs/phase-11/ui-sanity-visual-review.md`
- `outputs/phase-11/screenshots/phase11-capture-metadata.json`

### ステップ 4: coverage validator を通す

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js \
  --workflow docs/30-workflows/completed-tasks/ai-runtime-authmode-unification/tasks/step-04-par-task-08-rag-embedding-extraction-runtime
```

## 統合テスト連携

| 観点                  | 内容                                                                                                                                                                                                     |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 自動テストとの関係    | Phase 11 は UI 実装の挙動確認ではなく、Phase 5〜10 で確定した runtime 契約と current system spec の整合を review board で最終確認する                                                                    |
| 参照する自動検証      | `apps/desktop/src/main/ipc/aiHandlers.test.ts`、`packages/shared/src/services/search/__tests__/hybrid-rag-engine.test.ts`、GraphRAG 系テスト、`communityHandlers.ts` / `preload/types.ts` の静的契約確認 |
| 手動確認で補う点      | `AI_CHECK_CONNECTION` / `AI_INDEX` / `COMMUNITY_*` の guidance wording、GraphRAG fallback / HybridRAGFactory stub / CommunitySummarizer partial failure のドキュメント反映状態                           |
| Phase 12 への受け渡し | screenshot review board で確認した current behavior を `implementation-guide.md` と system spec 更新対象へ反映する                                                                                       |

## 参照資料

| 参照資料              | パス                                                                        | 内容                                                                   |
| --------------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Phase 10 最終レビュー | `phase-10-final-review.md`                                                  | MINOR 指摘と spec sync 対象の確認                                      |
| aiHandlers            | `apps/desktop/src/main/ipc/aiHandlers.ts`                                   | `AI_CHECK_CONNECTION` / `AI_INDEX` guidance 実装                       |
| communityHandlers     | `apps/desktop/src/main/ipc/communityHandlers.ts`                            | `NOT_IN_SCOPE` guidance-only 実装                                      |
| preload types         | `apps/desktop/src/preload/types.ts`                                         | `AICheckConnectionResponse` / `AIIndexResponse` / `CommunityResult<T>` |
| GraphRAGQueryService  | `packages/shared/src/services/search/graphrag-query-service.ts`             | fallbackReason と warn log                                             |
| HybridRAGFactory      | `packages/shared/src/services/search/hybrid-rag-factory.ts`                 | `[FACTORY_NOT_READY]` guidance stub                                    |
| CommunitySummarizer   | `packages/shared/src/services/graph/community-summarizer.ts`                | embed failure 時の warn + summary save                                 |
| Phase 11/12 guide     | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md` | explicit screenshot request と fallback review board ルール            |

## 成果物

| 成果物                   | パス                                                         | 内容                                               |
| ------------------------ | ------------------------------------------------------------ | -------------------------------------------------- |
| 手動テスト結果           | `outputs/phase-11/manual-test-result.md`                     | TC-11-01〜04 の結果と証跡                          |
| 手動テストチェックリスト | `outputs/phase-11/manual-test-checklist.md`                  | TC ごとの実施記録                                  |
| 発見事項一覧             | `outputs/phase-11/discovered-issues.md`                      | Blocker / Note / Info                              |
| 引き継ぎチェックリスト   | `outputs/phase-11/handoff-checklist.md`                      | follow-up と spec sync handoff                     |
| screenshot plan          | `outputs/phase-11/screenshot-plan.json`                      | TC-ID と撮影対象                                   |
| visual review            | `outputs/phase-11/ui-sanity-visual-review.md`                | Apple UI/UX 観点レビュー                           |
| command transcript       | `outputs/phase-11/command-transcript.md`                     | 失敗した direct capture と fallback capture の記録 |
| screenshot metadata      | `outputs/phase-11/screenshots/phase11-capture-metadata.json` | capture mode / source evidence / generated png     |

## 完了条件

- [x] current build capture の成否が記録されている
- [x] TC-11-01〜04 に `.png` 証跡が紐付いている
- [x] `manual-test-checklist.md` と `screenshot-plan.json` が current workflow 配下に存在する
- [x] `validate-phase11-screenshot-coverage.js` を通過している
- [x] `ui-sanity-visual-review.md` に visual sanity 所見が記録されている
- [x] Blocker 0件、未解消事項は Phase 12 で formalize 済み
- [x] `artifacts.json` / `outputs/artifacts.json` に Phase 11 成果物が反映されている

## 次のPhase

- [Phase 12（ドキュメント）](./phase-12-documentation.md) に進む
