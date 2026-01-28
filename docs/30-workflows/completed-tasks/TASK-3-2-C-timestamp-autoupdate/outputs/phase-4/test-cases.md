# テストケース一覧: TASK-3-2-C タイムスタンプ自動更新

## メタ情報

| 項目   | 値                              |
| ------ | ------------------------------- |
| タスク | TASK-3-2-C-timestamp-autoupdate |
| Phase  | 4                               |
| 作成日 | 2026-01-28                      |

---

## 1. useInterval テストケース

| ID   | テストケース                                   | 期待結果                    |
| ---- | ---------------------------------------------- | --------------------------- |
| UI-1 | 指定した間隔でコールバックが呼び出される       | 1秒ごとにcallbackが呼ばれる |
| UI-2 | delayがnullの場合はコールバックが呼ばれない    | callbackは呼ばれない        |
| UI-3 | delayが変更されると新しい間隔で実行される      | 新しい間隔に変更される      |
| UI-4 | delayがnullに変更されるとタイマーが停止        | タイマーが停止する          |
| UI-5 | アンマウント時にインターバルがクリアされる     | clearIntervalが呼ばれる     |
| UI-6 | コールバックの参照が更新されても最新が呼ばれる | 新しいcallbackが使用される  |

---

## 2. usePageVisibility テストケース

| ID   | テストケース                                         | 期待結果                      |
| ---- | ---------------------------------------------------- | ----------------------------- |
| PV-1 | 初期状態でページが可視の場合trueを返す               | isVisible = true              |
| PV-2 | 初期状態でページが非表示の場合falseを返す            | isVisible = false             |
| PV-3 | visibilitychangeイベントで状態が更新される（非表示） | isVisible = false             |
| PV-4 | visibilitychangeイベントで状態が更新される（再表示） | isVisible = true              |
| PV-5 | アンマウント時にイベントリスナーが削除される         | removeEventListenerが呼ばれる |

---

## 3. TimestampContext テストケース

| ID   | テストケース                                      | 期待結果                          |
| ---- | ------------------------------------------------- | --------------------------------- |
| TC-1 | 初期値として現在時刻を提供する                    | currentTime = Date.now()          |
| TC-2 | ページが可視の時、currentTimeが定期的に更新される | 1秒後にcurrentTimeが増加          |
| TC-3 | ページが非表示の時、更新が停止する                | 5秒後もcurrentTimeが変化しない    |
| TC-4 | タブ再表示時に即座に現在時刻が更新される          | 再表示後にcurrentTimeが更新される |

---

## 4. calculateUpdateInterval テストケース

| ID    | テストケース                                  | 期待結果       |
| ----- | --------------------------------------------- | -------------- |
| CUI-1 | 1分未満の場合は1秒（1000ms）を返す            | return 1000    |
| CUI-2 | ちょうど1分の境界で1分（60000ms）を返す       | return 60000   |
| CUI-3 | 1分以上1時間未満の場合は1分（60000ms）を返す  | return 60000   |
| CUI-4 | ちょうど1時間の境界で1時間（3600000ms）を返す | return 3600000 |
| CUI-5 | 1時間以上の場合は1時間（3600000ms）を返す     | return 3600000 |

---

## 5. calculateMinUpdateInterval テストケース

| ID     | テストケース                                 | 期待結果       |
| ------ | -------------------------------------------- | -------------- |
| CMUI-1 | 空配列の場合はデフォルト1分（60000ms）を返す | return 60000   |
| CMUI-2 | 単一要素の場合はその要素の更新間隔を返す     | 要素に応じた値 |
| CMUI-3 | 複数要素の場合は最短の更新間隔を返す         | 最小値         |
| CMUI-4 | 全て1分以上の場合は1分を返す                 | return 60000   |
| CMUI-5 | 全て1時間以上の場合は1時間を返す             | return 3600000 |

---

## 6. テストファイル配置

| テストファイル             | パス                                                                     |
| -------------------------- | ------------------------------------------------------------------------ |
| useInterval.test.ts        | `apps/desktop/src/renderer/hooks/__tests__/useInterval.test.ts`          |
| usePageVisibility.test.ts  | `apps/desktop/src/renderer/hooks/__tests__/usePageVisibility.test.ts`    |
| TimestampContext.test.tsx  | `apps/desktop/src/renderer/contexts/__tests__/TimestampContext.test.tsx` |
| formatTime.test.ts（追加） | `apps/desktop/src/renderer/utils/__tests__/formatTime.test.ts`           |

---

## 7. Phase 4 状態: Red

テスト作成完了。実装がないため全テストが失敗状態（Red）。

Phase 5でGreen状態（全テスト成功）を目指す。

---

## 変更履歴

| 日付       | 変更内容 | 担当 |
| ---------- | -------- | ---- |
| 2026-01-28 | 初版作成 | AI   |
