# Phase 4: Red テスト結果

## 実行コマンド

```bash
npx vitest run apps/desktop/src/renderer/utils/__tests__/cronConverter.test.ts
```

## 結果サマリー

- **Test Files**: 1 failed (1)
- **Tests**: 5 failed | 7 passed (12)

## 失敗テスト（Red）

| テスト名                                            | エラー内容                                              |
| --------------------------------------------------- | ------------------------------------------------------- |
| InvalidConfigError - message が正しく設定されること | `TypeError: InvalidConfigError is not a constructor`    |
| InvalidConfigError - name が 'InvalidConfigError'   | `TypeError: InvalidConfigError is not a constructor`    |
| InvalidConfigError - Error のインスタンスであること | `TypeError: InvalidConfigError is not a constructor`    |
| AC-01: weekdays=[] → InvalidConfigError スロー      | `AssertionError: expected [Function] to throw an error` |
| AC-05: 適切なエラーメッセージ                       | `AssertionError: expected [Function] to throw an error` |

## 通過テスト（Green - 既存動作確認）

- AC-02: weekdays=[0] → "0 9 \* \* 0"
- AC-03: weekdays=[1,2,3,4,5] → "0 9 \* \* 1,2,3,4,5"
- AC-04: weekdays=[0,1,2,3,4,5,6] → "0 9 \* \* 0,1,2,3,4,5,6"
- 回帰: daily, every-minute, every-hour, monthly

## Red 状態確認

✅ TDD Red フェーズ完了。Phase 5（実装）へ進行可能。
