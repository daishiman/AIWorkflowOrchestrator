# Phase 6: fixture 計画

## テスト fixture 一覧

### electronAPI Mock Fixtures

| Fixture 名                        | 用途             | 値                                                                                |
| --------------------------------- | ---------------- | --------------------------------------------------------------------------------- |
| mockElectronAPI_normal            | 正常系           | `{ apiKey: { list: () => ({ success: true, data: { providers: [...] } }) } }`     |
| mockElectronAPI_undefined         | preload 未初期化 | `undefined`                                                                       |
| mockElectronAPI_noApiKey          | apiKey 欠損      | `{ file: {...}, store: {...} }`                                                   |
| mockElectronAPI_listFails         | list() 例外      | `{ apiKey: { list: () => { throw new Error() } } }`                               |
| mockElectronAPI_nonArrayProviders | providers 非配列 | `{ apiKey: { list: () => ({ success: true, data: { providers: "invalid" } }) } }` |
| mockElectronAPI_nullData          | data null        | `{ apiKey: { list: () => ({ success: true, data: null }) } }`                     |

## 再利用戦略

- fixture は describe ブロック内の beforeEach で設定
- window.electronAPI のモックは vi.stubGlobal で管理
- afterEach で vi.restoreAllMocks() でクリーンアップ
