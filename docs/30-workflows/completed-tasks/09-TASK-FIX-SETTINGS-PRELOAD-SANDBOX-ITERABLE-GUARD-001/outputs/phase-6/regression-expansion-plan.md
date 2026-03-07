# Phase 6: 回帰拡張計画

## 追加回帰観点

### Unit Tests

| ID     | テスト名                                                                 | 観点               | ファイル                |
| ------ | ------------------------------------------------------------------------ | ------------------ | ----------------------- |
| REG-01 | apiKey.list() が undefined を返す                                        | 戻り値欠損         | ApiKeysSection.test.tsx |
| REG-02 | apiKey.list() が null を返す                                             | null safety        | ApiKeysSection.test.tsx |
| REG-03 | apiKey.list() が { success: true, data: null } を返す                    | data 欠損          | ApiKeysSection.test.tsx |
| REG-04 | apiKey.list() が { success: true, data: { providers: {} } } を返す       | providers 非配列   | ApiKeysSection.test.tsx |
| REG-05 | apiKey.list() が { success: true, data: { providers: "string" } } を返す | providers 型不正   | ApiKeysSection.test.tsx |
| REG-06 | window.electronAPI が undefined                                          | preload 初期化失敗 | ApiKeysSection.test.tsx |
| REG-07 | window.electronAPI.apiKey が undefined                                   | 部分 shape 欠損    | ApiKeysSection.test.tsx |
| REG-08 | 正常系: apiKey.list() が正しい配列を返す                                 | 回帰確認           | ApiKeysSection.test.tsx |

### Component Tests

| ID      | テスト名                                                      | 観点          | ファイル              |
| ------- | ------------------------------------------------------------- | ------------- | --------------------- |
| COMP-01 | SettingsView で ApiKeysSection がクラッシュしても画面継続表示 | ErrorBoundary | SettingsView.test.tsx |

### 異常系フロー

- apiKey.list() 失敗 → error state → エラーメッセージ表示 → リトライボタンで再取得

## fixture 昇格

- Phase 4 の failure fixture → Green regression fixture へ昇格
- 正規化後の空配列 providers を期待値とする fixture 追加
