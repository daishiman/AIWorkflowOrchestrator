# Phase 4: テスト計画

## テストケース一覧

| ID      | テスト名                                                                        | 対象          | 種別   |
| ------- | ------------------------------------------------------------------------------- | ------------- | ------ |
| RED-01  | window.electronAPI が undefined の場合、クラッシュせずエラー表示                | loadProviders | 異常系 |
| RED-01b | window.electronAPI.apiKey が undefined の場合、クラッシュせずエラー表示         | loadProviders | 異常系 |
| RED-02  | apiKey.list() が undefined を返した場合、エラーメッセージにフォールバック       | loadProviders | 異常系 |
| RED-02b | apiKey.list() が null を返した場合、エラーメッセージにフォールバック            | loadProviders | 異常系 |
| RED-03  | result.data.providers が配列でない場合、空のプロバイダー一覧にフォールバック    | loadProviders | 異常系 |
| RED-03b | result.data.providers が undefined の場合、空のプロバイダー一覧にフォールバック | loadProviders | 異常系 |

## テストファイル

- `apps/desktop/src/renderer/components/organisms/ApiKeysSection/__tests__/ApiKeysSection.test.tsx`
  - 「Preload Sandbox Guard（防御的レンダリング）」describe ブロックに 6 テストケースを追加

## テスト戦略

- **防御レイヤー1**: `window.electronAPI` / `window.electronAPI.apiKey` の存在確認
- **防御レイヤー2**: `result` shape の正規化（success/data/providers の各段階）
- **防御レイヤー3**: `Array.isArray()` による iterable ガード

## 実行結果

- 全 39 テスト PASS（既存 33 + 新規 6）
- 新規テストの console.warn 出力を確認（想定どおりの防御ログ）
