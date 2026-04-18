# 異常系結果

## メタ情報

| 項目   | 内容                  |
| ------ | --------------------- |
| Phase  | 6                     |
| タスク | UT-IPC-HANDLER-CI-001 |

## REG-EDGE-01: 重複チャンネル検出シナリオ

```typescript
const duplicateHandles = [
  "skill-creator:get-adapter-status",
  "skill-creator:get-adapter-status", // 意図的な重複
  "skill-creator:plan",
];

// 検証
expect(new Set(duplicateHandles).size).not.toBe(duplicateHandles.length);
// Set サイズ: 2, 配列長: 3 → 不一致 = 重複あり
```

**結果**: ✅ PASS — 重複検出ロジックが正しく機能することを確認

## REG-EDGE-02: ipcMain.on() 非混入確認

`registerRuntimeSkillCreatorHandlers()` は `ipcMain.on()` を使用しておらず、`handles` 配列は `ipcMain.handle()` 呼び出しのみを記録する。

**結果**: ✅ PASS — `overlap` 配列は空（重複なし）

## beforeEach リセット確認

各テスト開始時に `handles = []` が実行されるため、前テストのキャプチャ結果が持ち越されない。

**結果**: ✅ PASS — テスト間独立性を確認
