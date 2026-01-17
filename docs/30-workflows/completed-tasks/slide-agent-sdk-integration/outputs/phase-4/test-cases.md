# テストケース一覧 - slide-agent-sdk-integration

## メタ情報

| 項目       | 内容                                     |
| ---------- | ---------------------------------------- |
| タスクID   | task-imp-slide-agent-sdk-integration-001 |
| Phase      | 4                                        |
| 作成日     | 2026-01-17                               |
| ステータス | 完了                                     |

---

## SkillExecutor テストケース

### 基本動作テスト

| テストID | テストケース                           | 期待結果                          | 状態  |
| -------- | -------------------------------------- | --------------------------------- | ----- |
| SE-B01   | createSkillExecutor: isExecuting false | 初期状態でisExecutingがfalse      | Ready |
| SE-B02   | execute hearing phase                  | hearing phaseが正常に実行される   | Ready |
| SE-B03   | execute structure phase                | structure phaseが正常に実行される | Ready |
| SE-B04   | execute html phase                     | html phaseが正常に実行される      | Ready |
| SE-B05   | execute modifier phase                 | modifier phaseが正常に実行される  | Ready |
| SE-B06   | isExecuting true during execution      | 実行中はisExecutingがtrue         | Ready |
| SE-B07   | prevent concurrent executions          | 同時実行が排他制御される          | Ready |
| SE-B08   | cancel execution in progress           | 実行中のキャンセルが正常に動作    | Ready |

### SDK統合テスト

| テストID     | テストケース                             | 期待結果                            | 状態  |
| ------------ | ---------------------------------------- | ----------------------------------- | ----- |
| SDK-SE-01-h  | SDK call with 'hearing' skill name       | hearing-facilitatorで呼び出される   | Ready |
| SDK-SE-01-s  | SDK call with 'structure' skill name     | structure-designerで呼び出される    | Ready |
| SDK-SE-01-ht | SDK call with 'html' skill name          | html-generatorで呼び出される        | Ready |
| SDK-SE-01-m  | SDK call with 'modifier' skill name      | slide-modifierで呼び出される        | Ready |
| SDK-SE-02    | pass projectPath as context              | projectPathがコンテキストに含まれる | Ready |
| SDK-SE-03    | return SkillExecutionResult on success   | 成功時の正しい結果形式              | Ready |
| SDK-SE-04    | return error result when SDK call fails  | 失敗時のエラー結果                  | Ready |
| SDK-SE-05    | handle SDK timeout error (30s)           | 30秒タイムアウトの処理              | Red   |
| SDK-SE-06    | emit progress callbacks during execution | 進捗コールバックが発火              | Ready |
| SDK-SE-07    | emit progress in ascending order         | 進捗値が昇順                        | Ready |
| SDK-SE-08    | AbortController.abort when cancel        | キャンセル時にabortが呼ばれる       | Ready |
| SDK-SE-09    | cancelled error in execution result      | キャンセル結果の形式                | Ready |
| SDK-SE-10    | isExecuting true during execution        | 実行中の状態                        | Ready |
| SDK-SE-11    | isExecuting false after completion       | 完了後の状態                        | Ready |
| SDK-SE-12    | prevent concurrent SDK calls             | SDK呼び出しの排他制御               | Ready |
| SDK-SE-13    | handle API key not found error           | APIキー未設定エラー                 | Red   |
| SDK-SE-14    | handle SDK call failed error             | SDK呼び出し失敗エラー               | Red   |

### Modifier Skill テスト

| テストID | テストケース                     | 期待結果                     | 状態  |
| -------- | -------------------------------- | ---------------------------- | ----- |
| SE-01    | execute modifier skill           | modifierスキルが実行される   | Ready |
| SE-02    | pass correct context to modifier | コンテキストが正しく渡される | Ready |
| SE-03    | handle modifier skill timeout    | タイムアウト処理             | Red   |
| SE-04    | retry on modifier skill failure  | 失敗時のリトライ             | Red   |
| SE-05    | report progress during modifier  | 進捗報告                     | Ready |
| SE-06    | handle abort during modifier     | 中断処理                     | Ready |

---

## AgentClient テストケース

### query テスト

| テストID | テストケース                         | 期待結果                 | 状態  |
| -------- | ------------------------------------ | ------------------------ | ----- |
| AC-01    | call SDK with prompt and options     | 正しい引数でSDK呼び出し  | Ready |
| AC-02    | handle streaming responses           | ストリーミング応答の処理 | Ready |
| AC-03    | resolve with response content        | 応答コンテンツで解決     | Ready |
| AC-04    | reject with timeout error after 30s  | 30秒タイムアウトでreject | Ready |
| AC-05    | reject with abort error when aborted | 中断時にabortエラー      | Ready |
| AC-06    | reject with SDK error when API fails | API失敗時にSDKエラー     | Red   |
| AC-07    | prevent concurrent queries           | 同時クエリの排他制御     | Ready |
| AC-08    | use default timeout 30000ms          | デフォルトタイムアウト   | Ready |

### abort テスト

| テストID | テストケース                   | 期待結果              | 状態  |
| -------- | ------------------------------ | --------------------- | ----- |
| AC-09    | trigger AbortController signal | AbortControllerが発火 | Ready |
| AC-10    | set status to idle after abort | 中断後にidle状態      | Ready |
| AC-11    | no throw when no active query  | 非アクティブ時も正常  | Ready |

### getStatus テスト

| テストID | テストケース                  | 期待結果        | 状態  |
| -------- | ----------------------------- | --------------- | ----- |
| AC-12    | return 'idle' initially       | 初期状態はidle  | Ready |
| AC-13    | return 'running' during query | 実行中はrunning | Ready |
| AC-14    | return 'error' after failed   | 失敗後はerror   | Ready |
| AC-15    | return 'idle' after success   | 成功後はidle    | Ready |

### onMessage テスト

| テストID | テストケース                    | 期待結果             | 状態  |
| -------- | ------------------------------- | -------------------- | ----- |
| AC-16    | register message listener       | リスナー登録         | Ready |
| AC-17    | unregister when unsubscribe     | 購読解除             | Ready |
| AC-18    | notify listeners on SDK message | メッセージ通知       | Ready |
| AC-19    | correct message structure       | 正しいメッセージ構造 | Ready |

### SDK統合テスト

| テストID  | テストケース                      | 期待結果                 | 状態  |
| --------- | --------------------------------- | ------------------------ | ----- |
| SDK-AC-01 | retrieve API key from safeStorage | safeStorageからキー取得  | Red   |
| SDK-AC-02 | fallback to environment variable  | 環境変数へフォールバック | Red   |
| SDK-AC-03 | throw error if API key not found  | キー未設定でエラー       | Red   |
| SDK-AC-04 | use correct model                 | 正しいモデル使用         | Red   |
| SDK-AC-05 | set max_tokens to 8192            | max_tokens設定           | Red   |
| SDK-AC-06 | pass systemPrompt to SDK          | systemPrompt渡し         | Red   |
| SDK-AC-07 | parse content from SDK response   | コンテンツ解析           | Ready |
| SDK-AC-08 | extract usage information         | 使用量情報抽出           | Ready |
| SDK-AC-09 | handle SDK 401 Unauthorized       | 401エラーハンドリング    | Red   |
| SDK-AC-10 | handle SDK 500 Internal Server    | 500エラーハンドリング    | Red   |

### 境界値テスト

| テストID | テストケース                 | 期待結果           | 状態  |
| -------- | ---------------------------- | ------------------ | ----- |
| AC-22    | handle empty prompt          | 空プロンプト処理   | Ready |
| AC-23    | handle very long prompt      | 長文プロンプト処理 | Ready |
| AC-24    | handle minimum timeout (1ms) | 最小タイムアウト   | Ready |

---

## SDK統合テストケース

### API接続テスト

| テストID | テストケース                    | 期待結果            | 状態  |
| -------- | ------------------------------- | ------------------- | ----- |
| INT-01   | initialize SDK and authenticate | SDK初期化と認証成功 | Ready |
| INT-02   | fail with invalid API key       | 無効キーでエラー    | Red   |

### データフローテスト

| テストID | テストケース                  | 期待結果         | 状態  |
| -------- | ----------------------------- | ---------------- | ----- |
| INT-03   | structure.md → html-generator | 順方向同期フロー | Ready |
| INT-04   | index.html → modifier         | 逆方向同期フロー | Ready |

### エラーハンドリングテスト

| テストID | テストケース                    | 期待結果               | 状態  |
| -------- | ------------------------------- | ---------------------- | ----- |
| INT-05   | display error on SDK failure    | エラーメッセージ表示   | Ready |
| INT-06   | display timeout error after 30s | タイムアウトメッセージ | Ready |

### 状態同期テスト

| テストID | テストケース                            | 期待結果             | 状態  |
| -------- | --------------------------------------- | -------------------- | ----- |
| INT-07   | reflect progress in SyncStatusIndicator | 進捗コールバック反映 | Ready |

### キャンセルテスト

| テストID | テストケース           | 期待結果                 | 状態  |
| -------- | ---------------------- | ------------------------ | ----- |
| INT-08   | cancel executing skill | 実行中スキルのキャンセル | Ready |

### E2Eフローテスト

| テストID | テストケース                      | 期待結果               | 状態  |
| -------- | --------------------------------- | ---------------------- | ----- |
| INT-09   | complete forward sync flow        | 完全な順方向同期フロー | Ready |
| INT-10   | complete reverse sync flow        | 完全な逆方向同期フロー | Ready |
| INT-11   | multiple sequential executions    | 連続実行               | Ready |
| INT-12   | recover after cancelled execution | キャンセル後リカバリ   | Ready |

### 境界値テスト

| テストID | テストケース                   | 期待結果     | 状態  |
| -------- | ------------------------------ | ------------ | ----- |
| INT-13   | handle very long project paths | 長いパス処理 | Ready |
| INT-14   | special characters in path     | 特殊文字処理 | Ready |
| INT-15   | rapid execution attempts       | 高速連続実行 | Ready |

### SDKシナリオテスト

| テストID   | テストケース                    | 期待結果               | 状態  |
| ---------- | ------------------------------- | ---------------------- | ----- |
| SDK-INT-01 | execute with correct SDK params | 正しいパラメータ       | Ready |
| SDK-INT-02 | handle SDK streaming response   | ストリーミング処理     | Ready |
| SDK-INT-03 | propagate SDK errors to result  | エラー伝播             | Ready |
| SDK-INT-04 | track token usage from SDK      | トークン使用量追跡     | Ready |
| SDK-INT-05 | clean up resources after SDK    | リソースクリーンアップ | Ready |

---

## テストケースサマリー

| カテゴリ        | Ready  | Red    | 合計   |
| --------------- | ------ | ------ | ------ |
| SkillExecutor   | 22     | 6      | 28     |
| AgentClient     | 22     | 10     | 32     |
| SDK Integration | 17     | 3      | 20     |
| **合計**        | **61** | **19** | **80** |

---

## TDD状態説明

| 状態  | 説明                                                      |
| ----- | --------------------------------------------------------- |
| Ready | 現在のシミュレーション実装でパスするテスト                |
| Red   | SDK統合後にパスする予定のテスト（現在は失敗または未実装） |

---

## 次のステップ

Phase 5: 実装（TDD: Green）でRedテストをGreenにする

---

**作成日**: 2026-01-17
**Phase 4 テストケース一覧 完了**
