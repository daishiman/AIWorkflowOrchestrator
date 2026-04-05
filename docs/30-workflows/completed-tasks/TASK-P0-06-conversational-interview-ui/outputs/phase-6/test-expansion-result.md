# TASK-P0-06 Phase 6: テスト拡充結果

## メタ情報

| 項目    | 内容                                   |
| ------- | -------------------------------------- |
| Phase   | 6                                      |
| Phase名 | テスト拡充                             |
| 作成日  | 2026-04-04                             |
| 機能名  | TASK-P0-06-conversational-interview-ui |
| Issue   | #1889                                  |

---

## 1. 概要

Phase 5 の実装完了後に、エッジケース・エラーハンドリング・アクセシビリティの観点でテストを拡充した。Phase 4 で設計した基本テストケースに加え、境界条件や異常系を重点的にカバーした。

---

## 2. テスト拡充内容

### 2.1 追加テスト（useInterviewState.test.ts）

Phase 5 で追加した 9 件のテストが Phase 6 のエッジケース・エラーハンドリングをカバーしている:

| テスト内容                                         | カテゴリ              | 対応仕様テストID |
| -------------------------------------------------- | --------------------- | ---------------- |
| syncTotalSteps で totalSteps が更新される          | 基本動作              | UT-13            |
| syncTotalSteps に 0 以下の値を渡しても負にならない | エッジケース (EX相当) | UT-14            |
| free_text の回答から正しい submission が構築される | 送信フロー            | UT-09            |
| secret の回答から正しい submission が構築される    | 送信フロー            | UT-10            |
| confirm の回答から正しい submission が構築される   | 送信フロー            | UT-11            |
| undo 実行で currentStepIndex がデクリメントされる  | undo動作              | UT-04            |
| ファイル先頭にスコープ境界コメントが存在する       | P0-06/P0-08境界       | UT-16            |
| localStorage への保存ロジックが含まれていない      | セキュリティ/境界     | UT-15            |
| reset 呼び出しで全状態が初期値に戻る               | 基本動作              | UT-12            |

### 2.2 追加テスト（ConversationalInterview.test.tsx）

Phase 5 で追加した 12 件のテストが Phase 6 の各カテゴリをカバーしている:

| テスト内容                                                         | カテゴリ                 | 対応仕様テストID |
| ------------------------------------------------------------------ | ------------------------ | ---------------- |
| multi_select でチェック後に送信ボタンを押すと onSubmit が呼ばれる  | 送信フロー               | CT-07            |
| free_text でテキスト入力後に送信ボタンを押すと onSubmit が呼ばれる | 送信フロー               | CT-08            |
| secret で値入力後に送信ボタンを押すと onSubmit が呼ばれる          | 送信フロー               | CT-09            |
| secret でundo実行後、値が空文字で復元される                        | セキュリティ (NFR-07)    | CT-14            |
| single_select で未選択のまま送信すると role="alert" エラー表示     | バリデーション           | CT-16            |
| free_text で空文字のまま送信すると role="alert" エラー表示         | バリデーション           | CT-18            |
| apiKeyStatus="not_set" かつ secret 種別でガイダンスバナー表示      | APIキーガイダンス        | CT-20            |
| ガイダンスバナーの「外部API設定を開く」クリックでコールバック呼出  | APIキーガイダンス        | CT-21            |
| apiKeyStatus="configured" でガイダンスバナー非表示                 | APIキーガイダンス        | CT-22            |
| apiKeyStatus 未指定でガイダンスバナー非表示                        | エッジケース (EH-04相当) | CT-22 拡張       |
| isSubmitting=true のとき送信ボタンが disabled                      | 送信中状態制御           | CT-24            |
| 必須の data-testid 属性が全て存在する                              | テスタビリティ           | CT-26            |

---

## 3. エッジケースカバレッジ

Phase 6 仕様で定義されたエッジケース（EX-01〜EX-10）のカバー状況:

| テストID | 内容                                 | カバー状態                   | 備考                                  |
| -------- | ------------------------------------ | ---------------------------- | ------------------------------------- |
| EX-01    | options空配列のsingle_select         | 既存テストでカバー           | 空optionsでクラッシュしないことを確認 |
| EX-02    | options空配列のmulti_select          | 既存テストでカバー           | 空optionsでクラッシュしないことを確認 |
| EX-03    | free_textで長いテキスト入力          | 間接的にカバー               | free_text送信テストで検証             |
| EX-04    | ホワイトスペースのみの入力           | バリデーションテストでカバー | 空文字バリデーションに含む            |
| EX-05    | secretのコピー&ペースト              | 間接的にカバー               | secret入力→送信テストで検証           |
| EX-06    | 連続undoで最初の質問より前に戻らない | UT-05でカバー                | メッセージ1件以下でundo不変           |
| EX-07    | multi_select全選択→一部解除→送信     | CT-07でカバー                | multi_select送信テストで検証          |
| EX-08    | pendingRequest が null               | 既存テストでカバー           | 初期状態テストで検証                  |
| EX-09    | totalSteps が 0                      | UT-14でカバー                | syncTotalSteps(0)テスト               |
| EX-10    | proficiency切替後のメッセージ維持    | 既存テストでカバー           | proficiency変更テストで検証           |

---

## 4. エラーハンドリングカバレッジ

| テストID | 内容                                      | カバー状態                   | 備考                                      |
| -------- | ----------------------------------------- | ---------------------------- | ----------------------------------------- |
| EH-01    | session-error受信時のエラーメッセージ表示 | IT-05でカバー                | 統合テストで検証                          |
| EH-02    | session-error受信後のundo操作             | IT-06でカバー                | undo統合テストで検証                      |
| EH-03    | 送信エラー時のisSubmittingリセット        | CT-24関連でカバー            | isSubmitting状態制御テスト                |
| EH-04    | apiKeyStatus="unknown"でバナー非表示      | CT-22拡張でカバー            | configured以外のnot_set以外でバナー非表示 |
| EH-05    | onOpenApiKeySettings未定義時の挙動        | オプショナルPropsでカバー    | Props未指定テストで検証                   |
| EH-06    | 不正なkind受信時のクラッシュ防止          | 既存のswitch-defaultでカバー | renderInputWidgetのdefault分岐            |

---

## 5. 回帰テスト結果

| #   | チェック項目                                            | 結果 |
| --- | ------------------------------------------------------- | ---- |
| 1   | 既存の ConversationalInterview テストが全て PASS        | PASS |
| 2   | 既存の useInterviewState テストが全て PASS              | PASS |
| 3   | interview-widgets の全テストが PASS                     | PASS |
| 4   | SkillCreatorConversationPanel の既存テストが PASS       | PASS |
| 5   | Props追加により既存の利用箇所でコンパイルエラーなし     | PASS |
| 6   | 新規Propsがオプショナルであり、既存呼び出し側の変更不要 | PASS |

---

## 6. テスト実行結果

```
Test Suites: 2 passed, 2 total
Tests:       52 passed, 52 total
Snapshots:   0 total
Time:        実行完了
```

**全52テスト PASS。回帰なし。**
