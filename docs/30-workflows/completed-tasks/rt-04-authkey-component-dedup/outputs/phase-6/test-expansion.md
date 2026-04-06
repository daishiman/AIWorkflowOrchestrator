# Phase 6: テスト拡充記録

## 追加テストケース (TC-19〜TC-28)

| TC    | describe ブロック                   | テスト名                                                             | 結果 |
| ----- | ----------------------------------- | -------------------------------------------------------------------- | ---- |
| TC-19 | TC-19〜TC-21: IPC 失敗パス          | should set status to error when authKey.set fails                    | PASS |
| TC-20 | TC-19〜TC-21: IPC 失敗パス          | should set apiError when authKey.delete fails                        | PASS |
| TC-21 | TC-19〜TC-21: IPC 失敗パス          | should set status to check-failed when authKey.exists throws on init | PASS |
| TC-22 | TC-22: exists() throw after delete  | should set apiError when authKey.exists throws after delete          | PASS |
| TC-23 | TC-23: アンマウント後の状態更新防止 | should not update state after component unmount                      | PASS |
| TC-24 | TC-24: 連続保存の競合防止           | should prevent duplicate save while isSubmitting is true             | PASS |
| TC-25 | TC-25〜TC-27: バリデーション境界値  | should set validationError when inputValue is empty                  | PASS |
| TC-26 | TC-25〜TC-27: バリデーション境界値  | should set validationError when key length exceeds 200 chars         | PASS |
| TC-27 | TC-25〜TC-27: バリデーション境界値  | should set validationError when key does not start with sk-          | PASS |
| TC-28 | TC-28: env-fallback 初期化          | should initialize with configured status and env-fallback keySource  | PASS |

## 実装変更

### useAuthKeyManagement.ts

- `isSubmittingRef` (useRef) を追加: TC-24 の競合防止のため、stale closure を避けた排他制御
- `refresh()` の戻り値を `Promise<boolean>` に変更: TC-22 対応
- `handleDelete()` で refresh の戻り値を確認し失敗時に `apiError` を設定

## テスト総数

| ファイル                     | 追加前 | 追加後 |
| ---------------------------- | ------ | ------ |
| useAuthKeyManagement.test.ts | 14     | 21     |
| AuthKeySection.test.tsx      | 17     | 17     |
| ApiKeySettingsPanel.test.tsx | 7      | 7      |
| **合計**                     | **38** | **45** |
