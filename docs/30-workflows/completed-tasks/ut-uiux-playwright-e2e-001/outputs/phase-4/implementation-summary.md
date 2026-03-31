# Phase 4: 実装サマリー

## 実施内容

| ステップ | タスク                                           | 変更ファイル                                    | 結果 |
| -------- | ------------------------------------------------ | ----------------------------------------------- | ---- |
| 4-1      | playwright.config.ts に ui-ux-layer1/layer2 追加 | `apps/desktop/playwright.config.ts`             | 完了 |
| 4-2      | e2e/ui-ux/ ディレクトリ作成                      | ディレクトリ作成                                | 完了 |
| 4-3      | test-targets.config.ts 実装（7画面）             | `apps/desktop/e2e/ui-ux/test-targets.config.ts` | 完了 |
| 4-4      | helpers.ts 実装                                  | `apps/desktop/e2e/ui-ux/helpers.ts`             | 完了 |
| 4-5      | global-setup.ts に ANTHROPIC_API_KEY ダミー設定  | `apps/desktop/e2e/global-setup.ts`              | 完了 |
| 追加     | .gitattributes に PNG binary 指定                | `.gitattributes`                                | 完了 |
| 追加     | snapshots/.gitkeep 作成                          | `apps/desktop/e2e/ui-ux/snapshots/.gitkeep`     | 完了 |

## 初期対象 7 画面（FR-004 対応）

| ID                 | 説明                             | layer1 | layer2 | maxDiffPixels |
| ------------------ | -------------------------------- | ------ | ------ | ------------- |
| chat-main          | メインチャット画面               | ✓      | ✓      | 50            |
| skill-list         | スキル一覧画面                   | ✓      | ✓      | 50            |
| settings-general   | 設定画面（一般タブ）             | ✓      | ✓      | 50            |
| sidebar-navigation | サイドバーナビゲーション         | ✓      | ✓      | 30            |
| error-display      | エラー表示コンポーネント         | ✓      | ✓      | 20            |
| loading-state      | ローディング状態                 | ✗      | ✓      | 20            |
| dark-mode          | ダークモード（テーマ切り替え後） | ✗      | ✓      | 50            |

## 型チェック

- `test-targets.config.ts`: `satisfies TestTarget[]` で型安全に定義済み
- `helpers.ts`: 全関数に戻り値型注釈あり

## 完了条件確認

- [x] ui-ux-layer1 / ui-ux-layer2 が Playwright 設定に追加されている
- [x] test-targets.config.ts の初期対象 7 画面と semanticTargets が定義されている
- [x] helpers.ts と global-setup.ts が型チェック対応
- [x] Phase 5 / 6 で参照できる共通契約が固定されている
