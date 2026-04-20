# Lessons Learned 2026-04 — Cancel Chain（Skill Creator Cancel）

> 親ファイル: [lessons-learned-current-2026-04.md](lessons-learned-current-2026-04.md)
> 分割日: 2026-04-20
> 目的: TASK-SW-CANCEL-003〜004 の cancel chain 実装教訓を cancel 専用ファイルに切り出し、親ファイルの行数超過を緩和する
> 関連: [lessons-learned-skill-creator-cancel-chain.md](lessons-learned-skill-creator-cancel-chain.md)（L-CANCEL-001〜008 の正本台帳）

---

## TASK-SW-CANCEL-003 skill-creator-cancel-main-handler 教訓（2026-04-19）

### L-CANCEL-003-001: task 作成前に `implementation_mode` を明確化して既実装との混線を防ぐ

| 項目       | 内容                                                                                                                                                                       |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | 「新規実装」テンプレートで生成された workflow で実際には既実装が存在していた。Phase 4/5 の「RED 作成」「新規実装」記述を「差分確認」に読み替える必要が生じた               |
| 原因       | task 作成時に `implementation_mode: "new"` vs `"verify_existing"` を明示しておらず、workflow 生成テンプレートが無条件に新規実装フローを採用した                            |
| 解決策     | task spec の冒頭メタ情報に `implementation_mode: "new" \| "verify_existing"` フィールドを追加し、既実装の場合は Phase 4/5 を「verify（差分確認）」フェーズとして生成する   |
| 設計原則   | task 着手前の implementation_mode 宣言は「新規 vs 既実装確認」の混線を防ぐための最小コスト防衛策である                                                                     |
| 適用条件   | IPC handler / preload API など、chain task の一部として既に実装されている可能性がある task 全般                                                                            |
| 関連タスク | TASK-SW-CANCEL-003                                                                                                                                                         |

### L-CANCEL-003-002: chain task では各 task の scope に「chain における位置と完了定義」を明記する

| 項目       | 内容                                                                                                                                                                         |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | CANCEL-001〜004 が連携する chain 構成で、CANCEL-003 単体では「E2E 完了にならない」ことの明示が不足しており、完了判定基準が曖昧だった                                         |
| 原因       | 各 task の scope 説明に chain 全体の文脈が含まれておらず、単体タスクとして読んだときに何をもって完了とするかが不明確だった                                                   |
| 解決策     | chain task の scope 欄に「chain 位置: CANCEL-001→002→**003**→004」「本 task 単体の完了定義: Main ハンドラー登録のみ。E2E 疎通は CANCEL-004 完了後」のように明記する           |
| 設計原則   | chain task の完了定義は「chain における自分の責務範囲」と「chain 全体完了との関係」を MECE に記述する                                                                       |
| 適用条件   | 複数 task にまたがる IPC chain / preload-main-renderer 三層実装など、単体では E2E 完結しない task 全般                                                                      |
| 関連タスク | TASK-SW-CANCEL-001 / TASK-SW-CANCEL-002 / TASK-SW-CANCEL-003 / TASK-SW-CANCEL-004                                                                                           |

### L-CANCEL-003-003: NON_VISUAL task の証跡は `{TASK-ID}-manual-test-report.md` に統一する

| 項目       | 内容                                                                                                                                                |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | UI なしの task で Phase 11 の primary evidence をどのファイルに記録するかが task ごとにバラバラになりやすかった                                      |
| 原因       | NON_VISUAL task の証跡方針が未定義のため、スクリーンショット代替として複数のファイル形式が混在した                                                  |
| 解決策     | Phase 11 の primary evidence を `outputs/phase-11/{TASK-ID}-manual-test-report.md` に統一し、vitest 実行ログ・typecheck 結果・確認コマンド出力を記載 |
| 設計原則   | NON_VISUAL task の証跡は「実行コマンド + 結果（PASS/FAIL）+ 判定理由」の三点セットを manual-test-report に記録し、Phase 12 審査の一貫性を保つ       |
| 適用条件   | IPC handler / preload API / ユーティリティ関数など、UI レンダリングを伴わない NON_VISUAL task 全般                                                  |
| 関連タスク | TASK-SW-CANCEL-003                                                                                                                                  |

---

## TASK-SW-CANCEL-004 useCancelGeneration renderer hook 正規化 教訓（2026-04-20）

### L-CANCEL-004-001: verify_existing モードは仕様書冒頭で宣言してフェーズを再定義する

| 項目       | 内容                                                                                                                                                                                |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | 旧テンプレートが「未実装前提」で固定化されているため、既実装コードに対して Phase 4/5 を「RED 作成」「新規実装」として読み替える必要が生じた                                         |
| 原因       | task 作成時に `implementation_mode` を明示しておらず、workflow 生成テンプレートが無条件に新規実装フローを採用した                                                                   |
| 解決策     | task spec の冒頭メタ情報に `implementation_mode: "verify_existing"` を宣言し、Phase 4/5 を「差分確認・既実装テスト追加」フェーズとして先に定義する                                 |
| 設計原則   | 既実装コードを対象とするタスクは、workflow 開始時に `implementation_mode = verify_existing` を宣言してからフェーズに入る                                                           |
| 適用条件   | IPC handler / preload API / renderer hook など、chain task の一部として既に実装されている可能性がある task 全般                                                                    |
| 関連タスク | TASK-SW-CANCEL-004                                                                                                                                                                 |

### L-CANCEL-004-002: IPC failure swallow は setStage 先行 → IPC 呼出し → catch の順序で実装する

| 項目       | 内容                                                                                                                                                                            |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | `cancelGeneration()` 内で IPC が reject した場合に、エラーが伝播すると `stage` が `cancelled` に更新されず UI が不整合になる                                                   |
| 原因       | IPC の成否に stage 更新を依存させると、IPC failure が UI state の不整合を生む                                                                                                   |
| 解決策     | `setStage('cancelled')` を IPC 呼び出しの前に実行し、その後 try/catch でエラーを握りつぶす。cancelled は IPC 成否に関わらず確定させる                                          |
| 設計原則   | cancel 系 IPC は「stage 先行更新 → IPC 呼び出し → catch swallow」の順序で実装する。IPC reject によって cancelled 状態が取り消されてはならない                                 |
| 適用条件   | cancel / abort 系の renderer hook 全般。stage/status が UI 状態を持つ場合に適用                                                                                                |
| 関連タスク | TASK-SW-CANCEL-004                                                                                                                                                             |

### L-CANCEL-004-003: optional chain 2 段チェーン（`?.method?.()` ）で namespace / method 両方の Undefined を guard する

| 項目       | 内容                                                                                                                                                                               |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | `window.skillCreatorAPI` が undefined の場合と `cancelGeneration` が未定義の場合の 2 パターンで呼び出しが silent fail する必要があるが、テストとして明示されていなかった          |
| 原因       | preload API の optional chain が 1 段しかなく、method レベルの undefined guard が未考慮だった                                                                                      |
| 解決策     | `window.skillCreatorAPI?.cancelGeneration?.()` の 2 段チェーンを正本 contract とし、TC-A（API 未定義）/ TC-B（IPC reject）を独立テストケースとして検証する                       |
| 設計原則   | preload API への呼び出しは `namespace?.method?.()` の 2 段チェーンで書き、namespace 未定義と method 未定義を独立テストケースで覆う                                              |
| 適用条件   | `window.electronAPI` / `window.skillCreatorAPI` 等の preload namespace への呼び出し全般                                                                                           |
| 関連タスク | TASK-SW-CANCEL-004                                                                                                                                                             |

### L-CANCEL-004-004: NON_VISUAL Phase 11 証跡は checklist / result / discovered-issues の 3 点セットで統一する

| 項目       | 内容                                                                                                                                                                                  |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | Phase 11 がスクリーンショット要件しか持っていない旧テンプレートでは、NON_VISUAL タスクの証跡構造が不明確になる                                                                       |
| 原因       | NON_VISUAL 証跡の成果物構造が task ごとに異なり、Phase 12 審査時に何を確認すればよいかが不明確だった                                                                                 |
| 解決策     | Phase 11 の成果物を `manual-test-checklist.md` / `manual-test-result.md` / `discovered-issues.md`（または discovered-issues セクション）の 3 点セットとして標準化する              |
| 設計原則   | NON_VISUAL タスクの Phase 11 は「チェックリスト・結果・発見した未タスク」の 3 点セットを成果物として定義し、screenshot N/A の根拠もこの 3 点に含める                               |
| 適用条件   | IPC handler / preload API / renderer hook / ユーティリティ関数など、UI レンダリングを伴わない NON_VISUAL task 全般                                                                   |
| 関連タスク | TASK-SW-CANCEL-004                                                                                                                                                             |

### L-CANCEL-004-005: 旧仕様が現実と矛盾した場合は superseded と明宣言して削除せず残す

| 項目       | 内容                                                                                                                                                                                      |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | 旧タスク仕様書のフェーズ記述が実装済みコードと矛盾していたが、単純に削除すると経緯が失われる                                                                                              |
| 原因       | 旧仕様が更新されないまま放置されると、後続の担当者が「なぜこの仕様が現実と違うのか」を判断できなくなる                                                                                   |
| 解決策     | 矛盾した旧仕様セクションに `> ⚠️ superseded by TASK-SW-CANCEL-004 (2026-04-20): 既実装確認済み。この記述は参照のみ。` のような注記を入れて残す                                           |
| 設計原則   | 旧仕様の矛盾は削除ではなく `superseded` 宣言で履歴として保持する。削除すると検索性が失われる                                                                                              |
| 適用条件   | verify_existing モードで既実装が判明した場合の旧仕様書全般                                                                                                                                |
| 関連タスク | TASK-SW-CANCEL-004                                                                                                                                                             |

---

## 変更履歴

| 日付       | 変更内容                                                                                                                    |
| ---------- | --------------------------------------------------------------------------------------------------------------------------- |
| 2026-04-20 | 新規作成: lessons-learned-current-2026-04.md の CANCEL-003/004 セクションを分割移動。L-CANCEL-003-001〜003 / L-CANCEL-004-001〜005 を収録 |
