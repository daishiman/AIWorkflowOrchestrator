# Phase 4 Red テスト結果

## 実行日時

2026-04-20

## Red 状態の確認

`xenova-transformer-encoder.ts` 作成前の時点でテストを実行した場合、以下のエラーで FAIL することを確認。

```
Cannot find module '../../late-chunking/xenova-transformer-encoder'
```

## テストID と AC マッピング

| テストID         | AC   | 区分   |
| ---------------- | ---- | ------ |
| XENC-NORMAL-01   | AC-2 | 正常系 |
| XENC-NORMAL-02   | AC-2 | 正常系 |
| XENC-NORMAL-03   | AC-5 | 正常系 |
| XENC-NORMAL-04   | AC-5 | 正常系 |
| XENC-NORMAL-05   | 設計 | 正常系 |
| XENC-NORMAL-06   | AC-1 | 正常系 |
| XENC-ERROR-01    | AC-3 | 異常系 |
| XENC-ERROR-02    | AC-3 | 異常系 |
| XENC-ERROR-03    | AC-4 | 異常系 |
| XENC-ERROR-04    | AC-4 | 異常系 |
| XENC-ERROR-05    | AC-3 | 異常系 |
| XENC-ERROR-06    | AC-3 | 異常系 |
| XENC-ERROR-07    | 設計 | 異常系 |
| XENC-ERROR-08    | 設計 | 異常系 |
| XENC-BOUNDARY-01 | 設計 | 境界系 |
| XENC-BOUNDARY-02 | 設計 | 境界系 |
| XENC-BOUNDARY-03 | AC-2 | 境界系 |
| XENC-BOUNDARY-04 | 設計 | 境界系 |

## 合計: 18 件（Red 確認済み）
