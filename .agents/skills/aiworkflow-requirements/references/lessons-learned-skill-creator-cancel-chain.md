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

## L-CANCEL-005: verify_existing モードで Phase を再構成する際は冒頭に宣言する

| 項目       | 内容                                                                                                                                                                              |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | 旧テンプレートが「未実装前提」で固定化されているため、既実装のコードに対して Phase 4/5 を「RED 作成」「新規実装」として読み替える必要が生じた                                    |
| 解決策     | task spec の冒頭メタ情報に `implementation_mode: "verify_existing"` を宣言し、Phase 4/5 を「差分確認・既実装テスト追加」フェーズとして先に定義する                              |
| 標準ルール | 既実装コードを対象とするタスクは、workflow 開始時に `implementation_mode = verify_existing` を明示してから Phase に入る                                                          |
| 関連タスク | TASK-SW-CANCEL-004                                                                                                                                                               |

## L-CANCEL-006: IPC failure swallow は try/catch + stage先行更新の 2 点セット

| 項目       | 内容                                                                                                                                                                              |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `cancelGeneration()` 内で IPC が reject した場合に、エラーが伝播すると `stage` が `cancelled` に更新されず UI が不整合になる                                                     |
| 解決策     | `setStage('cancelled')` を IPC 呼び出しの前に行い、その後 try/catch でエラーを握りつぶす。cancelled は IPC 成否に関わらず確定させる                                             |
| 標準ルール | cancel 系 IPC は「stage 先行更新 → IPC 呼び出し → catch swallow」の順序で実装する。IPC reject によって cancelled 状態が取り消されてはならない                                   |
| 関連タスク | TASK-SW-CANCEL-004                                                                                                                                                               |

## L-CANCEL-007: optional chain 2 段チェーン（`?.method?.()）は API/method 両方の Undefined guard

| 項目       | 内容                                                                                                                                                                              |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `window.skillCreatorAPI` が undefined の場合と `cancelGeneration` が未定義の場合の 2 パターンで呼び出しが silent fail する必要があるが、テストとして明示されていなかった         |
| 解決策     | `window.skillCreatorAPI?.cancelGeneration?.()` の 2 段チェーンを正本 contract とし、両パターンをそれぞれ独立したテストケース（TC-A: API未定義 / TC-B: IPC reject）として検証した |
| 標準ルール | preload API への呼び出しは `namespace?.method?.()` の 2 段チェーンで書き、namespace 未定義と method 未定義を独立テストケースで覆う                                              |
| 関連タスク | TASK-SW-CANCEL-004                                                                                                                                                               |

## L-CANCEL-008: NON_VISUAL Phase 11 証跡は checklist / result / discovered-issues の 3 点セット

| 項目       | 内容                                                                                                                                                                              |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | Phase 11 がスクリーンショット要件しか持っていない旧テンプレートでは、NON_VISUAL タスクの証跡構造が不明確になる                                                                   |
| 解決策     | Phase 11 の成果物を `manual-test-checklist.md` / `manual-test-result.md` / `discovered-issues.md`（または相当セクション）の 3 点セットとして統一する                            |
| 標準ルール | NON_VISUAL タスクの Phase 11 は「チェックリスト・結果・発見した未タスク」の 3 点セットを成果物として定義し、screenshot N/A の根拠もこの 3 点に含める                             |
| 関連タスク | TASK-SW-CANCEL-004                                                                                                                                                               |

---

## 変更履歴

| 日付       | 変更内容                                                                                              |
| ---------- | ----------------------------------------------------------------------------------------------------- |
| 2026-04-20 | L-CANCEL-005〜008 追加（TASK-SW-CANCEL-004 verify_existing / IPC swallow / optional chain / NON_VISUAL 3点セット） |
| 2026-04-16 | 初版作成: L-CANCEL-001〜004（TASK-SW-CANCEL-001〜004 cancel chain の苦戦箇所4件を記録） |
