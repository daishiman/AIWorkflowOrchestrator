# Phase 5: 実装順序

## 変更順序

1. **`ApiKeysSection/index.tsx` — `loadProviders` 関数**
   - 防御レイヤー1: `window.electronAPI?.apiKey` optional chaining 導入
   - 防御レイヤー1: `apiKeyApi?.list` 存在チェック → 不在時は早期リターン + warn ログ
   - 防御レイヤー2: `result?.success` / `result?.data` null-safe アクセス
   - 防御レイヤー2: `Array.isArray(result.data.providers)` iterable ガード
   - 防御レイヤー2: `result?.error?.message` null-safe エラーメッセージ取得

## 変更ファイル

| ファイル                                                                                          | 変更目的                         |
| ------------------------------------------------------------------------------------------------- | -------------------------------- |
| `apps/desktop/src/renderer/components/organisms/ApiKeysSection/index.tsx`                         | loadProviders に防御ガードを導入 |
| `apps/desktop/src/renderer/components/organisms/ApiKeysSection/__tests__/ApiKeysSection.test.tsx` | 6 異常系テストケースを追加       |

## 担当境界

| 担当                    | 責務                                        |
| ----------------------- | ------------------------------------------- |
| SubAgent-Renderer-Guard | ApiKeysSection の loadProviders 防御実装    |
| SubAgent-Test-Fallback  | RED-01〜RED-03b テストケース実装            |
| SubAgent-Lead-Sync      | Phase 4 テスト結果と Phase 5 実装の整合確認 |

## commit / PR 非実行ポリシー

本 Phase ではローカル変更とテスト結果のみで完了条件を満たす。commit / PR は行わない。
