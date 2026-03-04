# Phase 11 スクリーンショット索引

## 取得済みスクリーンショット

| TC-ID | ファイル                                                        | 検証目的                                      |
| ----- | --------------------------------------------------------------- | --------------------------------------------- |
| TC-01 | `outputs/phase-11/screenshots/TC-01-initial-imported-state.png` | 初期状態で追加済み/未追加の表示分離を確認     |
| TC-02 | `outputs/phase-11/screenshots/TC-02-new-skill-processing.png`   | 追加中ステータス（`追加中...`）の可視化を確認 |
| TC-03 | `outputs/phase-11/screenshots/TC-03-post-import-state.png`      | 追加完了後の一覧整合（対象カード除外）を確認  |
| TC-04 | `outputs/phase-11/screenshots/TC-04-imported-detail-panel.png`  | 詳細パネルの `追加済み` バッジ表示を確認      |

## 補助証跡

| ファイル                                                    | 内容                                           |
| ----------------------------------------------------------- | ---------------------------------------------- |
| `outputs/phase-11/screenshots/import-call-diagnostics.json` | import呼び出し回数の診断ログ（`new-skill: 1`） |

## 監査メモ

- Phase 11 の画面カバレッジは TC-01〜TC-04 の4件で充足。
- `validate-phase11-screenshot-coverage` の証跡参照要件（TC行 + PNG実体）を満たす構成に更新済み。
