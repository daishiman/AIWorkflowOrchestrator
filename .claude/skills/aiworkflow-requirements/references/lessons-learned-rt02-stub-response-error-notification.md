# Lessons Learned: TASK-RT-02 stub-response-error-notification

> 関連タスク: TASK-RT-02（2026-04-04 完了）
> カテゴリ: RuntimeSkillCreatorFacade / Degraded Path / Error Contract

---

## L-RT02-001: false-success stub を explicit error contract へ置換するパターン

| 項目       | 内容                                                                                                                                                                                              |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `plan()` / `improve()` / `execute()` の degraded path がそれぞれ stub 成功値（空の skillName や空の suggestions 配列）を返していた。renderer 側では成功として扱われ、エラー状態が通知されなかった |
| 再発条件   | Facade の degraded path を「後でエラー処理を追加」として仮実装した場合。stub 成功値は renderer の型チェックをすり抜けるため、lint / typecheck では検出不能                                        |
| 解決策     | degraded path 全体を `buildDegradedError(reason)` に統一し、`{success:false, error:{code, message}}` を返す explicit error contract へ置換。`DEGRADED_REASON_MESSAGES` で reason code を定数管理  |
| 標準ルール | Facade の degraded path は必ず `success:false` + `error` を返す。stub 成功値は実装完了前のプレースホルダーとしても使用禁止                                                                        |
| 関連タスク | TASK-RT-02                                                                                                                                                                                        |

---

## L-RT02-002: degraded path で governanceHooks.onSessionEnd() を呼ぶ audit 補修

| 項目       | 内容                                                                                                                                                                                 |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 課題       | plan / improve / execute の early return（degraded path）で `governanceHooks.onSessionEnd()` が呼ばれていなかった。セッション終了が audit ログに記録されず、追跡不能なギャップが発生 |
| 再発条件   | early return パスに終了 hook 呼び出しを追加し忘れた場合。happy path にのみ hook を配置するパターンは degraded path でリークする                                                      |
| 解決策     | `buildDegradedError()` の呼び出し直後に `governanceHooks.onSessionEnd()` を配置し、degraded path でも必ず audit を記録するよう統一                                                   |
| 標準ルール | セッション終了 hook は happy path / degraded path の両方に配置する。`buildDegradedError()` と `onSessionEnd()` は常にペアで記述する                                                  |
| 関連タスク | TASK-RT-02                                                                                                                                                                           |

---

## L-RT02-003: renderer での union response 型ガード（IPC wrapper + logical error）

| 項目       | 内容                                                                                                                                                                         |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | renderer 側は IPC wrapper（`{success, data, error}` 形式）のチェックのみで、`data.success === false` の logical error（explicit error response）を見落としていた             |
| 再発条件   | `PlanResponse = PlanResult \| PlanErrorResponse \| terminal_handoff` のような union 型で、outer wrapper の success だけをチェックして inner の error を無視した場合          |
| 解決策     | IPC wrapper チェック後に `if (!data.success)` の logical error type guard を追加し、`SkillLifecyclePanel` でのプラン表示と `SkillCreateWizard` での execute ボタン抑止を実装 |
| 標準ルール | outer IPC wrapper（transport エラー）と inner logical error（business エラー）を別レイヤーで処理する。union response 型を使う場合は renderer 側で両方のガードを実装する      |
| 関連タスク | TASK-RT-02                                                                                                                                                                   |

---

## L-RT02-004: shared types の union 拡張は同一 wave で renderer・テストと同期

| 項目       | 内容                                                                                                                                                                                                 |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `RuntimeSkillCreatorPlanResponse` に `PlanErrorResponse` を追加したとき、shared types / Facade / renderer / テストの4層が異なるタイミングで更新されると、typecheck は通るが runtime で型不一致が発生 |
| 再発条件   | shared contract を変更した後、参照箇所の更新を複数コミットに分散した場合                                                                                                                             |
| 解決策     | union 型拡張（shared types 変更）、Facade 実装、renderer type guard、テストの4点を同一コミット wave で完結させる                                                                                     |
| 標準ルール | shared types の union 変更は「types 定義 → Facade 実装 → renderer guard → テスト」を同一 PR 内で完了する                                                                                             |
| 関連タスク | TASK-RT-02, TASK-RT-05（同パターン）                                                                                                                                                                 |
