# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| Phase      | 6                                              |
| タスクID   | TASK-LLM-MOD-06                                |
| 機能名     | openai-compatible-adapter                      |
| タスク名   | OpenAICompatibleAdapter 統一アーキテクチャ実装 |
| 前提Phase  | Phase 5                                        |
| 後続Phase  | Phase 7                                        |
| 作成日     | 2026-03-23                                     |
| ステータス | completed                                      |

## 目的

Phase 4 で設計した基本テストに加え、エッジケースと回帰テストを追加してカバレッジを拡充する。

## 実行タスク

- baseUrl 上書きテスト: ユーザーがカスタム baseUrl を指定した場合にデフォルト値が上書きされることを検証する
- extraHeaders 空マップテスト: extraHeaders が空オブジェクトまたは undefined の場合にヘッダー注入が発生しないことを検証する
- ストリーミング中断テスト: AbortSignal による streamChat の中断が正しく処理されることを検証する
- レート制限リトライテスト: 429 レスポンス時のリトライヘッダー解析を検証する
- messages フォーマット回帰テスト: 複数ターンの会話履歴が正しくフォーマットされることを検証する

## 参照資料

| 参照資料                | パス                                                            | 説明           |
| ----------------------- | --------------------------------------------------------------- | -------------- |
| OpenAICompatibleAdapter | `apps/desktop/src/main/adapters/llm/OpenAICompatibleAdapter.ts` | Phase 5 成果物 |
| Phase 4 テスト          | `OpenAICompatibleAdapter.test.ts`                               | Phase 4 成果物 |

## 追加テストケース一覧

| ID    | カテゴリ     | テストケース                                        | 期待結果                                |
| ----- | ------------ | --------------------------------------------------- | --------------------------------------- |
| TC-12 | baseUrl      | カスタム baseUrl 指定時にデフォルト値が上書きされる | リクエスト先がカスタム URL になる       |
| TC-13 | extraHeaders | extraHeaders が undefined の場合                    | Authorization ヘッダーのみが送信される  |
| TC-14 | extraHeaders | extraHeaders が空オブジェクトの場合                 | Authorization ヘッダーのみが送信される  |
| TC-15 | streamChat   | AbortSignal で中断した場合                          | ストリーミングが即座に停止する          |
| TC-16 | レート制限   | 429 レスポンスの Retry-After ヘッダー解析           | リトライ待機時間が正しく取得される      |
| TC-17 | messages     | 5ターンの会話履歴フォーマット                       | user/assistant が交互に正しく配置される |
| TC-18 | ファクトリ   | 未登録プロバイダー名でのアダプター生成              | 適切なエラーが返される                  |

## 成果物

| 成果物           | パス                                        | 説明               |
| ---------------- | ------------------------------------------- | ------------------ |
| 拡張テストケース | `outputs/phase-6/expanded-test-cases.md`    | 追加テスト仕様     |
| 回帰テスト結果   | `outputs/phase-6/regression-test-result.md` | 回帰テスト実行結果 |

## 完了条件

- [x] baseUrl 上書きテストが追加済み
- [x] extraHeaders 空マップテストが追加済み
- [x] AbortSignal によるストリーミング中断テストが追加済み
- [x] レート制限リトライテストが追加済み
- [x] 複数ターン messages フォーマット回帰テストが追加済み
- [x] 全テストが PASS

## 次のPhase

Phase 7: カバレッジ確認
