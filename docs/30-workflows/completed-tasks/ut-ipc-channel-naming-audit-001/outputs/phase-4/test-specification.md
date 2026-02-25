# Phase 4 テスト仕様書

## テストケース

| TC-ID | 観点                     | コマンド対象                | 期待値                 |
| ----- | ------------------------ | --------------------------- | ---------------------- |
| TC-01 | チャネル抽出件数         | `preload/channels.ts`       | 1件以上（実測203）     |
| TC-02 | 値重複検出               | `preload/channels.ts`       | 0件                    |
| TC-03 | `skill:`抽出             | `preload/channels.ts`       | 1件以上（実測26）      |
| TC-04 | `FromSource`利用         | `preload/channels.ts`       | 0件以上（現状0）       |
| TC-05 | `Source`利用             | `preload/channels.ts`       | 0件以上（現状0）       |
| TC-06 | `ipcMain.handle`登録監査 | `apps/desktop/src/main`     | 重複登録候補を可視化   |
| TC-07 | preload参照整合          | `apps/desktop/src/preload`  | 参照漏れ0件            |
| TC-08 | renderer参照整合         | `apps/desktop/src/renderer` | 設計外直接文字列を把握 |

## 判定ポリシー

- TC-01/02/03は数値判定。
- TC-04/05は将来拡張用の存在判定（0でも失敗にしない）。
- TC-06/07/08は差分検出テスト（結果をPhase 5で解釈）。

## Phase 4 実行記録

### 実行タスク

- テストケース定義: 完了
- コマンド定義: 完了
- 期待値定義: 完了
- レポート雛形作成: 完了

### 次Phaseへの引き継ぎ事項

- TC-01〜TC-08を実行し、全結果を監査レポートへ記録する。
