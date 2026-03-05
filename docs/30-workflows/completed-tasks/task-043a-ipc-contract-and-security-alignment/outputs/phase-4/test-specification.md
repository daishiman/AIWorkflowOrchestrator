# Phase 4 テスト仕様書

## テスト方針

- 契約テスト: 引数/レスポンス/エラーコードの整合を固定
- セキュリティテスト: sender と P42 検証順序を固定
- 境界テスト: import 導線が share 導線へ誤接続しないことを固定
- 回帰テスト: 既存 API 互換を壊さないことを固定

## テストレイヤー

| レイヤー         | 対象                          | 目的                               |
| ---------------- | ----------------------------- | ---------------------------------- |
| Main IPC Unit    | `skillHandlers.share.test.ts` | 検証順序・エラー分類の確認         |
| Preload Contract | `skill-api.contract.test.ts`  | チャネル境界と errorCode透過の確認 |
| Manual Evidence  | Phase11 screenshots           | UI表示・導線境界の実証             |

## 成功条件

- Main 34 tests PASS
- Preload 60 tests PASS
- 主要観点（契約/セキュリティ/境界）を全カバー
