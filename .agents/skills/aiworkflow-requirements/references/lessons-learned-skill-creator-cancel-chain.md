# Lessons Learned: Skill Creator Cancel Chain（2026-04）

> タスクID: TASK-SW-CANCEL-001〜004
> 関連ファイル: `packages/shared/src/ipc/channels.ts`, `apps/desktop/src/preload/skill-creator-api.ts`, `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`, `apps/desktop/src/renderer/hooks/useCancelGeneration.ts`

## L-CANCEL-001: IPC cancel chain は shared→preload→main→renderer の4層縦断が最小単位

| 項目       | 内容                                                                                                                                                                                 |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 課題       | `SKILL_CREATOR_CANCEL` チャンネルを shared に追加しただけでは renderer から実際に cancel を送信できない。各層が独立して追加される必要がある                                          |
| 解決策     | 4タスクに分割して直列実装: CANCEL-001（shared定数）→ CANCEL-002（preload whitelist + API）→ CANCEL-003（main handler + cancelCurrentOperation）→ CANCEL-004（renderer hook async化） |
| 標準ルール | IPC キャンセル機能を追加する場合は「shared定数 → preload whitelist/API → main handler → renderer hook」の4層を個別タスクとして順序通りに実装する                                     |
| 関連タスク | TASK-SW-CANCEL-001〜004                                                                                                                                                              |

## L-CANCEL-002: abort-like error は UI failure として見せない

| 項目       | 内容                                                                                                                                                |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `cancelGeneration()` 呼出し後に AbortError が発生すると、`agentSlice` が failure として扱い、UI にエラーが表示されてしまう                          |
| 解決策     | `agentSlice.ts` で abort-like error を failure として記録しないよう調整し、`SkillCreateWizard.tsx` で abort-like error を握りつぶす経路を追加した   |
| 標準ルール | abort/cancel 由来のエラーは `AbortError` / `AbortError`-like な文字列を検出して通常の failure フローから除外し、UI にキャンセル失敗として表示しない |
| 関連タスク | TASK-SW-CANCEL-004                                                                                                                                  |

## L-CANCEL-003: non-visual task は Phase 11 で screenshot N/A を明記する

| 項目       | 内容                                                                                                                                     |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | UI/UX 変更のないタスクで Phase 12 close-out 時に screenshot を探す無駄な作業が発生した                                                   |
| 解決策     | Phase 11 の `manual-test.md` に `UI/UX変更なし / screenshot N/A` を先に明記することで、Phase 12 で screenshot 探索を完全にスキップできた |
| 標準ルール | UI/UX 変更のないタスク（pure TS実装・shared定数追加等）では、Phase 11 着手時点で `## 視覚証跡: N/A（UI変更なし）` を明記する             |
| 関連タスク | TASK-SW-CANCEL-001                                                                                                                       |

## L-CANCEL-004: 小粒度タスクのテスト構成は「専用ファイル + 既存ファイル修正」の2点セット

| 項目       | 内容                                                                                                                                                          |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | shared定数を1件追加した際、既存テストの件数アサーションが壊れるが、専用の回帰テストがないと「定数の値・重複・型伝播」の3観点が次回変更で壊れやすくなる        |
| 解決策     | `channels-cancel.test.ts`（専用：値・重複・型の3観点）+ `channels.test.ts`（既存：件数アサーション更新）の2ファイル構成を採用した                             |
| 標準ルール | shared定数追加タスクでは「専用テストファイル（値・重複・型）+ 既存テスト修正（件数アサーション）」の2ファイル構成を標準とし、変更履歴にも両ファイルを記録する |
| 関連タスク | TASK-SW-CANCEL-001                                                                                                                                            |

---

## 変更履歴

| 日付       | 変更内容                                                                                |
| ---------- | --------------------------------------------------------------------------------------- |
| 2026-04-16 | 初版作成: L-CANCEL-001〜004（TASK-SW-CANCEL-001〜004 cancel chain の苦戦箇所4件を記録） |
