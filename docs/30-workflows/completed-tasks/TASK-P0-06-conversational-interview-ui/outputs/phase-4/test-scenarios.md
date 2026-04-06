# TASK-P0-06 Phase 4: テストシナリオ一覧

## メタ情報

| 項目    | 内容                                   |
| ------- | -------------------------------------- |
| Phase   | 4                                      |
| Phase名 | テスト作成（TDD: Red）                 |
| 作成日  | 2026-04-04                             |
| 機能名  | TASK-P0-06-conversational-interview-ui |
| Issue   | #1889                                  |

---

## 1. コンポーネントテスト（CT: ConversationalInterview.test.tsx）

### 1.1 各InputKindのレンダリング（CT-01〜CT-05）

| テストID | describe                  | it                                                                             | 対応FR | 対応AC | 結果 |
| -------- | ------------------------- | ------------------------------------------------------------------------------ | ------ | ------ | ---- |
| CT-01    | 各InputKindのレンダリング | `single_select` の質問が表示されたとき、SingleSelectChipsがレンダリングされる  | FR-01  | AC-1   | PASS |
| CT-02    | 各InputKindのレンダリング | `multi_select` の質問が表示されたとき、MultiSelectCheckboxがレンダリングされる | FR-01  | AC-1   | PASS |
| CT-03    | 各InputKindのレンダリング | `free_text` の質問が表示されたとき、FreeTextInputがレンダリングされる          | FR-01  | AC-1   | PASS |
| CT-04    | 各InputKindのレンダリング | `secret` の質問が表示されたとき、SecretInputがレンダリングされる               | FR-01  | AC-1   | PASS |
| CT-05    | 各InputKindのレンダリング | `confirm` の質問が表示されたとき、ConfirmButtonsがレンダリングされる           | FR-01  | AC-1   | PASS |

### 1.2 送信フロー（CT-06〜CT-10）

| テストID | describe   | it                                                                   | 対応FR | 対応AC | 結果 |
| -------- | ---------- | -------------------------------------------------------------------- | ------ | ------ | ---- |
| CT-06    | 送信フロー | `single_select` で選択後に送信ボタンを押すと onSubmit が呼ばれる     | FR-01  | AC-1   | PASS |
| CT-07    | 送信フロー | `multi_select` でチェック後に送信ボタンを押すと onSubmit が呼ばれる  | FR-01  | AC-1   | PASS |
| CT-08    | 送信フロー | `free_text` でテキスト入力後に送信ボタンを押すと onSubmit が呼ばれる | FR-01  | AC-1   | PASS |
| CT-09    | 送信フロー | `secret` で値入力後に送信ボタンを押すと onSubmit が呼ばれる          | FR-01  | AC-1   | PASS |
| CT-10    | 送信フロー | `confirm` でボタンを押すと即時に onSubmit が呼ばれる                 | FR-01  | AC-1   | PASS |

### 1.3 undo操作（CT-11〜CT-15）

| テストID | describe | it                                                                   | 対応FR | 対応AC | 結果 |
| -------- | -------- | -------------------------------------------------------------------- | ------ | ------ | ---- |
| CT-11    | undo操作 | `single_select` でundo実行後、以前の選択状態が復元される             | FR-06  | AC-6   | PASS |
| CT-12    | undo操作 | `multi_select` でundo実行後、以前の選択状態が復元される              | FR-06  | AC-6   | PASS |
| CT-13    | undo操作 | `free_text` でundo実行後、以前のテキスト内容が復元される             | FR-06  | AC-6   | PASS |
| CT-14    | undo操作 | `secret` でundo実行後、値が空文字で復元される（セキュリティ NFR-07） | FR-06  | AC-6   | PASS |
| CT-15    | undo操作 | `confirm` でundo実行後、以前の選択状態が復元される                   | FR-06  | AC-6   | PASS |

### 1.4 バリデーション（CT-16〜CT-19）

| テストID | describe       | it                                                                            | 対応FR | 対応AC | 結果 |
| -------- | -------------- | ----------------------------------------------------------------------------- | ------ | ------ | ---- |
| CT-16    | バリデーション | `single_select` で未選択のまま送信すると `role="alert"` エラーが表示される    | FR-07  | AC-7   | PASS |
| CT-17    | バリデーション | `multi_select` で未チェックのまま送信すると `role="alert"` エラーが表示される | FR-07  | AC-7   | PASS |
| CT-18    | バリデーション | `free_text` で空文字のまま送信すると `role="alert"` エラーが表示される        | FR-07  | AC-7   | PASS |
| CT-19    | バリデーション | `secret` で空文字のまま送信すると `role="alert"` エラーが表示される           | FR-07  | AC-7   | PASS |

### 1.5 APIキーガイダンス（CT-20〜CT-22）

| テストID | describe          | it                                                                                | 対応FR | 対応AC | 結果 |
| -------- | ----------------- | --------------------------------------------------------------------------------- | ------ | ------ | ---- |
| CT-20    | APIキーガイダンス | `apiKeyStatus="not_set"` かつ `secret` 種別のとき、ガイダンスバナーが表示される   | FR-05  | AC-5   | PASS |
| CT-21    | APIキーガイダンス | ガイダンスバナーの「外部API設定を開く」クリックで onOpenApiKeySettings が呼ばれる | FR-05  | AC-5   | PASS |
| CT-22    | APIキーガイダンス | `apiKeyStatus="configured"` のとき、ガイダンスバナーが表示されない                | FR-05  | AC-5   | PASS |

### 1.6 その他（CT-23〜CT-26）

| テストID | describe       | it                                                             | 対応FR/NFR | 対応AC | 結果 |
| -------- | -------------- | -------------------------------------------------------------- | ---------- | ------ | ---- |
| CT-23    | 進捗バー       | `InterviewProgressBar` に current/total が正しく渡される       | FR-04      | AC-4   | PASS |
| CT-24    | 送信中状態制御 | `isSubmitting=true` のとき送信ボタンが disabled になる         | FR-08      | AC-8   | PASS |
| CT-25    | 自動スクロール | 新しいメッセージ追加後にチャットエリアが最下部にスクロールする | FR-09      | AC-9   | PASS |
| CT-26    | data-testid    | 必須の data-testid 属性が全て存在する                          | NFR-06     | -      | PASS |

**CT合計: 26件 / 全PASS**

---

## 2. ユニットテスト（UT: useInterviewState.test.ts）

| テストID | describe                | it                                                                            | 対応FR | 対応AC | 結果 |
| -------- | ----------------------- | ----------------------------------------------------------------------------- | ------ | ------ | ---- |
| UT-01    | addAssistantMessage     | 同一questionIdの質問が重複追加されない                                        | FR-02  | AC-2   | PASS |
| UT-02    | addAssistantMessage     | 新しい質問が追加されると currentStepIndex がインクリメントされる              | FR-04  | AC-4   | PASS |
| UT-03    | undo                    | undo実行で最後のuser/assistantメッセージペアが削除される                      | FR-06  | AC-6   | PASS |
| UT-04    | undo                    | undo実行で currentStepIndex がデクリメントされる                              | FR-06  | AC-6   | PASS |
| UT-05    | undo                    | メッセージが1件以下のときundo実行しても状態が変化しない                       | FR-06  | AC-6   | PASS |
| UT-06    | rollbackLastUserMessage | 最後のuserメッセージが削除される                                              | FR-06  | AC-6   | PASS |
| UT-07    | buildSubmission         | `single_select` の回答から正しい SkillCreatorUserInputSubmission が構築される | FR-01  | AC-1   | PASS |
| UT-08    | buildSubmission         | `multi_select` の回答から正しい SkillCreatorUserInputSubmission が構築される  | FR-01  | AC-1   | PASS |
| UT-09    | buildSubmission         | `free_text` の回答から正しい SkillCreatorUserInputSubmission が構築される     | FR-01  | AC-1   | PASS |
| UT-10    | buildSubmission         | `secret` の回答から正しい SkillCreatorUserInputSubmission が構築される        | FR-01  | AC-1   | PASS |
| UT-11    | buildSubmission         | `confirm` の回答から正しい SkillCreatorUserInputSubmission が構築される       | FR-01  | AC-1   | PASS |
| UT-12    | reset                   | reset呼び出しで全状態が初期値に戻る                                           | FR-03  | AC-3   | PASS |
| UT-13    | syncTotalSteps          | syncTotalSteps呼び出しで totalSteps が更新される                              | FR-04  | AC-4   | PASS |
| UT-14    | syncTotalSteps          | syncTotalSteps に0以下の値を渡しても totalSteps が負にならない                | FR-04  | AC-4   | PASS |
| UT-15    | P0-06/P0-08境界         | useInterviewState に localStorage への保存ロジックが含まれていない            | FR-03  | AC-3   | PASS |
| UT-16    | P0-06/P0-08境界         | ファイル先頭にスコープ境界コメントが存在する                                  | FR-03  | AC-3   | PASS |

**UT合計: 16件 / 全PASS**

---

## 3. 統合テストシナリオ（IT）

| シナリオID | シナリオ名                     | 概要                                                                                            | 対応FR       | 結果 |
| ---------- | ------------------------------ | ----------------------------------------------------------------------------------------------- | ------------ | ---- |
| IT-01      | 基本フロー: 質問→回答→次の質問 | `question-received` → ユーザー回答 → `answer` 送信 → 次の `question-received` のサイクルを検証  | FR-01, FR-02 | PASS |
| IT-02      | 全InputKind順次テスト          | 5種類のInputKindを順番に受信し、それぞれ回答・送信するフルフロー                                | FR-01        | PASS |
| IT-03      | APIキー設定要求フロー          | `external-api-config-required` 受信 → ガイダンス表示 → 設定画面遷移 → `api-configured` のフロー | FR-05        | PASS |
| IT-04      | セッション完了フロー           | 最終質問の回答後に `session-complete` を受信し、UIが完了状態に遷移する                          | FR-02        | PASS |
| IT-05      | エラーハンドリングフロー       | `session-error` を受信したときのUIの挙動を検証                                                  | FR-02        | PASS |
| IT-06      | undoフロー（InputKind横断）    | 複数質問に回答後、undoで前の質問に戻り再回答する                                                | FR-06        | PASS |

**IT合計: 6件 / 全PASS**

---

## 4. テスト実行結果サマリー

| カテゴリ             | テスト数 | PASS   | FAIL  | スキップ |
| -------------------- | -------- | ------ | ----- | -------- |
| CT（コンポーネント） | 26       | 26     | 0     | 0        |
| UT（ユニット）       | 16       | 16     | 0     | 0        |
| IT（統合）           | 6        | 6      | 0     | 0        |
| **合計**             | **48**   | **48** | **0** | **0**    |

実際の実装では、useInterviewState.test.ts に21テスト（既存12 + 追加9）、ConversationalInterview.test.tsx に31テスト（既存19 + 追加12）が存在し、合計52テストが全てPASSしている。

---

## 5. トレーサビリティマトリクス

| FR-ID | AC-ID | テストID（CT/UT/IT）              | カバー状態 |
| ----- | ----- | --------------------------------- | ---------- |
| FR-01 | AC-1  | CT-01〜CT-10, UT-07〜UT-11        | カバー済み |
| FR-02 | AC-2  | UT-01, UT-02, IT-01, IT-04, IT-05 | カバー済み |
| FR-03 | AC-3  | UT-12, UT-15, UT-16               | カバー済み |
| FR-04 | AC-4  | CT-23, UT-02, UT-13, UT-14        | カバー済み |
| FR-05 | AC-5  | CT-20, CT-21, CT-22, IT-03        | カバー済み |
| FR-06 | AC-6  | CT-11〜CT-15, UT-03〜UT-06, IT-06 | カバー済み |
| FR-07 | AC-7  | CT-16〜CT-19                      | カバー済み |
| FR-08 | AC-8  | CT-24                             | カバー済み |
| FR-09 | AC-9  | CT-25                             | カバー済み |

**全FR/AC（9/9）がテストでカバーされていることを確認。**
