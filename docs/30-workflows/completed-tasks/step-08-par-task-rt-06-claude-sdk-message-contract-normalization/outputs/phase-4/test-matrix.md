# Phase 4: テストマトリクス — sdkMessageNormalizer

## テストファイル

`apps/desktop/src/main/services/runtime/__tests__/sdkMessageNormalizer.test.ts`

## テストケース一覧

### normalizeSdkMessage

| #   | カテゴリ          | テストケース          | 検証項目                                                |
| --- | ----------------- | --------------------- | ------------------------------------------------------- |
| 1   | system/init       | init イベントに正規化 | eventType="init", sessionId, sourceProvenance           |
| 2   | system/init       | sessionId 保持        | sessionId が正しく抽出される                            |
| 3   | assistant         | text 正規化           | eventType="assistant", text 抽出                        |
| 4   | assistant         | 空 text               | 空文字列が保持される                                    |
| 5   | assistant         | content 空配列        | text が undefined                                       |
| 6   | result            | success subtype       | eventType="result", resultSubtype="success", stopReason |
| 7   | result            | error subtype         | resultSubtype="error", error text 抽出                  |
| 8   | permission denial | denial 記録           | permissionDenials 配列に記録                            |
| 9   | error             | tool error            | eventType="error", error text                           |
| 10  | error             | 未知メッセージ        | eventType="error"                                       |
| 11  | session_id 欠損   | init で欠損           | sessionId が undefined                                  |
| 12  | session_id 欠損   | result で欠損         | sessionId が undefined                                  |
| 13  | sourceProvenance  | 全イベントに付与      | 3種類のイベントで検証                                   |
| 14  | sourceProvenance  | context なし          | sourceProvenance が undefined                           |
| 15  | invalid           | null 入力             | eventType="error"                                       |
| 16  | invalid           | undefined 入力        | eventType="error"                                       |
| 17  | invalid           | 空オブジェクト        | eventType="error"                                       |

### normalizeSdkStream

| #   | カテゴリ | テストケース                | 検証項目                          |
| --- | -------- | --------------------------- | --------------------------------- |
| 18  | stream   | 全体正規化 + sessionId 伝播 | init の sessionId が後続に伝播    |
| 19  | stream   | system/init 不在            | assistant/result のみでも正規化可 |
| 20  | stream   | 空ストリーム                | 空配列を返す                      |
| 21  | stream   | permission denial 蓄積      | 複数 denial が各イベントに記録    |

## TDD 状態

- **Red**: テストファイル作成済み、実装モジュール未作成のため失敗
- テスト数: 21 ケース
- 次フェーズ: Phase 5 で実装し Green にする
