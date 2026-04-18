# 回帰テスト結果

## メタ情報

| 項目   | 内容                  |
| ------ | --------------------- |
| Phase  | 6                     |
| タスク | UT-IPC-HANDLER-CI-001 |

## 実行結果

```
Test Files: 1 passed (1)
Tests: 6 passed (6)
  ✓ REG-SNAP-01: 登録チャンネル一覧がスナップショットと一致する
  ✓ REG-DEDUP-01: 重複チャンネルが存在しない
  ✓ REG-COUNT-01: 登録チャンネル総数が 19
  ✓ REG-EDGE-01: 重複チャンネルが存在する場合に検出できる
  ✓ REG-EDGE-02: ipcMain.on() は handle spy に含まれない
  ✓ REG-EDGE-03: 各テストで handles が独立している
Duration: 3.31s
```

**全テストグリーン ✅**

## 既存テスト回帰確認

`ipcHandlerRegistrationSnapshot.test.ts` の既存テスト（TC-01〜TC-05）への影響なし。
新規テストファイルは独立したスナップショットファイルを使用するため干渉なし。
