# Test Matrix - Session Dock Artifact Bridge

## 1. State Machine テスト

### 1.1 State 遷移テスト

| ID    | テスト名                          | 初期 state | Event                | 期待 state    | ガード条件                              |
| ----- | --------------------------------- | ---------- | -------------------- | ------------- | --------------------------------------- |
| SM-01 | guidance 受信で ready に遷移      | collapsed  | GUIDANCE_RECEIVED    | ready         | handoffGuidance != null && cliAvailable |
| SM-02 | ユーザーが dock を折りたたむ      | ready      | USER_COLLAPSE        | collapsed     | なし                                    |
| SM-03 | 実行開始で handoff に遷移         | ready      | USER_EXECUTE         | handoff       | handoffGuidance != null                 |
| SM-04 | CLI session 開始で running に遷移 | handoff    | CLI_SESSION_START    | running       | sessionId != null                       |
| SM-05 | 正常完了で done に遷移            | running    | CLI_SESSION_COMPLETE | done          | exitCode === 0                          |
| SM-06 | ユーザー中止で aborted に遷移     | running    | CLI_SESSION_ABORT    | aborted       | userAbort                               |
| SM-07 | エラー終了で aborted に遷移       | running    | CLI_SESSION_ABORT    | aborted       | exitCode !== 0                          |
| SM-08 | CLI 未利用で unavailable に遷移   | collapsed  | CLI_UNAVAILABLE      | unavailable   | !cliInstalled                           |
| SM-09 | guidance-only で遷移              | collapsed  | GUIDANCE_ONLY        | guidance-only | !requiresExecution                      |
| SM-10 | handoff キャンセルで ready に戻る | handoff    | USER_CANCEL_HANDOFF  | ready         | なし                                    |
| SM-11 | done から新 session で ready      | done       | USER_NEW_SESSION     | ready         | なし                                    |
| SM-12 | aborted から retry で ready       | aborted    | USER_NEW_SESSION     | ready         | なし                                    |

### 1.2 CTA テスト

| ID     | State         | 期待される Primary CTA | 期待される Secondary CTA |
| ------ | ------------- | ---------------------- | ------------------------ |
| CTA-01 | collapsed     | 「開く」               | -                        |
| CTA-02 | ready         | 「実行する」           | 「閉じる」               |
| CTA-03 | handoff       | 「キャンセル」         | -                        |
| CTA-04 | running       | 「中止する」           | -                        |
| CTA-05 | done          | 「成果物を見る」       | 「共有する」             |
| CTA-06 | aborted       | 「やり直す」           | 「ガイダンスに戻る」     |
| CTA-07 | unavailable   | 「インストールする」   | 「閉じる」               |
| CTA-08 | guidance-only | 「閉じる」             | -                        |

### 1.3 不正遷移テスト（Negative Case）

| ID     | テスト名                        | 初期 state | Event             | 期待             | 理由                       |
| ------ | ------------------------------- | ---------- | ----------------- | ---------------- | -------------------------- |
| NEG-01 | running から直接 collapsed 不可 | running    | USER_COLLAPSE     | running のまま   | 実行中の強制折りたたみ禁止 |
| NEG-02 | collapsed から直接 running 不可 | collapsed  | CLI_SESSION_START | collapsed のまま | handoff を経由する必要あり |
| NEG-03 | done から直接 running 不可      | done       | CLI_SESSION_START | done のまま      | 新 session 開始が必要      |

## 2. Persistence / Restore テスト

| ID     | テスト名                       | 前提                       | 操作            | 期待結果                                              |
| ------ | ------------------------------ | -------------------------- | --------------- | ----------------------------------------------------- |
| PER-01 | session ID が採番される        | ready state                | USER_EXECUTE    | session ID が `session-{UUID v4}` 形式で生成（MN-03） |
| PER-02 | dock close で session 保持     | done state                 | USER_COLLAPSE   | session データが store に残る                         |
| PER-03 | dock reopen で transcript 復元 | collapsed (session あり)   | openDock        | 前回の transcript entries が復元                      |
| PER-04 | dock reopen で artifact 復元   | collapsed (session あり)   | openDock        | 前回の artifact summary が復元                        |
| PER-05 | restore 失敗時のフォールバック | collapsed (壊れた session) | openDock        | ready state + エラー通知                              |
| PER-06 | 保持件数超過で最古削除         | 10 sessions 保持中         | 新 session 開始 | 最古の session が削除                                 |
| PER-07 | 保持期間超過で cleanup         | 24h 超過 session あり      | cleanup 実行    | 超過 session が削除                                   |

## 3. Manual Share テスト

| ID    | テスト名                  | 前提                         | 操作                      | 期待結果                              |
| ----- | ------------------------- | ---------------------------- | ------------------------- | ------------------------------------- |
| SH-01 | 選択範囲を送る            | done state + テキスト選択中  | 「選択範囲を送る」click   | SharePayload(type:"selection") が生成 |
| SH-02 | 直近出力を添付            | done state + transcript あり | 「直近出力を添付」click   | SharePayload(type:"latest") が生成    |
| SH-03 | セッションを貼る          | done state                   | 「セッションを貼る」click | SharePayload(type:"session") が生成   |
| SH-04 | provenance chip 付与      | share 完了後                 | chat message 確認         | source/sharedAt/inspect が付与        |
| SH-05 | running 中は share 不可   | running state                | Share Rail 確認           | Share Rail が非表示                   |
| SH-06 | collapsed では share 不可 | collapsed state              | Share Rail 確認           | Share Rail が非表示                   |

## 4. Artifact Summary テスト

| ID     | テスト名                            | 前提                        | 期待結果                                                  |
| ------ | ----------------------------------- | --------------------------- | --------------------------------------------------------- |
| ART-01 | done state で Artifact Summary 表示 | done state + artifacts あり | Artifact Summary が primary surface                       |
| ART-02 | aborted state で Error Summary 表示 | aborted state               | Error Summary が primary + partial artifacts が secondary |
| ART-03 | empty artifact 表示                 | done state + artifacts 空   | 「成果物はありません」+ transcript リンク                 |
| ART-04 | transcript は折りたたみ配置         | done state                  | transcript が [3] 位置に折りたたみ表示                    |
| ART-05 | error summary に中止理由がある      | aborted state               | abortReason + exitCode + stderr                           |
| ART-06 | warning 一覧が折りたたみ可          | done state + warnings あり  | warning 一覧が折りたたみ可能                              |

## 5. 統合テスト（3層横断）

| ID     | テスト名                   | 対象層                     | シナリオ                                                       |
| ------ | -------------------------- | -------------------------- | -------------------------------------------------------------- |
| INT-01 | store → renderer 表示      | store + renderer           | dockState 変更 → UI の CTA が切り替わる                        |
| INT-02 | preload → store → renderer | preload + store + renderer | claudeCliAPI.onSessionOutput → transcript entry 追加 → UI 更新 |
| INT-03 | share → chat message       | renderer + store           | Share Rail click → chat message に provenance chip 付与        |
