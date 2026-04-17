# テストカバレッジレポート

## 対象ファイル

`apps/desktop/src/main/ipc/storeHandlers.ts`

## カバレッジ概算

| 指標     | 判定基準 | 達成状況                                                                                                |
| -------- | -------- | ------------------------------------------------------------------------------------------------------- |
| Line     | 80%+     | PASS（deepMerge / validation / security helper / ハンドラの主要行をカバー）                             |
| Branch   | 60%+     | PASS（null/undefined/配列/オブジェクト/非 plain object/危険キー除外を全てカバー）                       |
| Function | 80%+     | PASS（deepMerge・isPlainObject・cloneSafePlainObject・registerUserSettingsHandlers・getStore をカバー） |

## deepMerge 関数のブランチカバレッジ

| 分岐                       | テストケース               |
| -------------------------- | -------------------------- |
| `undefined` 省略           | TC-09                      |
| プレーンオブジェクト再帰   | TC-01, TC-05, TC-06, TC-08 |
| 配列上書き                 | TC-03                      |
| null 上書き                | TC-04                      |
| プリミティブ上書き         | TC-02                      |
| 空オブジェクト（変化なし） | TC-07, TC-08               |
| 非 plain object 拒否       | TC-11                      |
| 危険キー除外               | TC-12                      |

## 判定: 基準達成
