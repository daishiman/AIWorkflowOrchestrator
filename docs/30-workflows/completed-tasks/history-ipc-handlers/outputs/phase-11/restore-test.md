# Phase 11 タスク4: バージョン復元テスト

## 実行日時

2026-01-12

---

## テスト対象

`history:restoreVersion` IPCチャンネル

---

## 自動テスト結果

| テストID | テスト名                   | 結果 | 備考           |
| -------- | -------------------------- | ---- | -------------- |
| HH-RV-01 | 正常系: 復元結果を返す     | PASS | SuccessResult  |
| HH-RV-02 | 異常系: サービスエラー     | PASS | ErrorResult    |
| HH-RV-03 | 異常系: fileId空文字       | PASS | バリデーション |
| HH-RV-04 | 異常系: conversionId空文字 | PASS | バリデーション |

---

## 仕様書テストケース対応

| ケース | 操作                 | 期待結果                                 | 自動テスト |
| ------ | -------------------- | ---------------------------------------- | ---------- |
| TC-06  | 復元ボタンをクリック | 確認ダイアログが表示される               | UI依存     |
| TC-07  | 復元を確認           | 復元が成功し、完了メッセージが表示される | HH-RV-01   |
| TC-08  | キャンセル           | ダイアログが閉じ、復元されない           | UI依存     |

---

## IPC動作確認

### 正常系

```typescript
const result = await historyAPI.restoreVersion("file-123", "conv-456");
// → { success: true, data: VersionHistoryItem } // 復元後の新バージョン
```

### 異常系（fileId空）

```typescript
const result = await historyAPI.restoreVersion("", "conv-456");
// → { success: false, error: Error("fileId is required") }
```

### 異常系（conversionId空）

```typescript
const result = await historyAPI.restoreVersion("file-123", "");
// → { success: false, error: Error("conversionId is required") }
```

---

## 備考

- 確認ダイアログ（TC-06, TC-08）はUIコンポーネント側の責務
- IPCハンドラーは復元リクエストを受けて処理を実行
- UI手動テストはHistoryUIコンポーネント実装後に実施
- 実際の復元処理はHistoryService本実装後に動作確認

---

## タスク4結果

**PASS** - IPCレベルでのバージョン復元は自動テストで確認済み
