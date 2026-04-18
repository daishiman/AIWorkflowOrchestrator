# リファクタリング後の再テスト結果

## メタ情報

| 項目   | 内容                  |
| ------ | --------------------- |
| Phase  | 8                     |
| タスク | UT-IPC-HANDLER-CI-001 |

## 実行コマンド

```bash
npx vitest run "src/main/ipc/__tests__/creatorHandlers.registrationSnapshot.test.ts" --reporter=verbose
```

## 実行結果

```
✓ REG-SNAP-01: 登録チャンネル一覧がスナップショットと一致する   344ms
✓ REG-DEDUP-01: 重複チャンネルが存在しない
✓ REG-COUNT-01: 登録チャンネル総数が 19（public runtime 17 + auxiliary 2）
✓ REG-EDGE-01: 重複チャンネルが存在する場合に検出できる
✓ REG-EDGE-02: ipcMain.on() は handle spy に含まれない
✓ REG-EDGE-03: 各テストで handles が独立している（beforeEach リセット確認）

Test Files: 1 passed (1)
Tests: 6 passed (6)
Duration: 4.53s
```

**全テストグリーン ✅**
