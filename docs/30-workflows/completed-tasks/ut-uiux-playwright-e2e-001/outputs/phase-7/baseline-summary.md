# Phase 7: baseline 生成サマリー

## 実行結果

| コマンド                                                              | 結果         |
| --------------------------------------------------------------------- | ------------ |
| `pnpm exec playwright test --update-snapshots --project=ui-ux-layer2` | 10/10 PASSED |

## 生成された baseline 画像

保存先: `apps/desktop/e2e/ui-ux/layer2-visual.spec.ts-snapshots/`

| ファイル名                                            | 対応テスト           | 状態     |
| ----------------------------------------------------- | -------------------- | -------- |
| `chat-main-baseline-ui-ux-layer2-darwin.png`          | VIS-001 チャット画面 | 生成済み |
| `skill-list-baseline-ui-ux-layer2-darwin.png`         | VIS-002 スキル一覧   | 生成済み |
| `settings-general-baseline-ui-ux-layer2-darwin.png`   | VIS-003 設定画面     | 生成済み |
| `sidebar-navigation-baseline-ui-ux-layer2-darwin.png` | VIS-004 サイドバー   | 生成済み |
| `error-display-baseline-ui-ux-layer2-darwin.png`      | VIS-005 エラー表示   | 生成済み |
| `loading-state-baseline-ui-ux-layer2-darwin.png`      | VIS-006 ローディング | 生成済み |
| `dark-mode-baseline-ui-ux-layer2-darwin.png`          | VIS-007 ダークモード | 生成済み |

## 修正事項

初回実行時に 2 件が失敗したため、`helpers.ts` を以下の通り修正した:

1. **`dismissOverlayIfPresent()`** 関数を追加: アプリ起動直後に表示されるモーダル/オーバーレイを `Escape` で閉じる
2. **`navigateToSkills()`** を修正: 複数セレクタを順に試みるフォールバックロジックを追加
3. **`navigateToSettings()`** を修正: クリック失敗時に `force: true` でリトライする

修正後は全 10/10 が PASS し、7 枚の baseline 画像が正常に生成された。

## .gitattributes の更新

Playwright のデフォルト保存先（`*.spec.ts-snapshots/`）に合わせてパターンを更新:

```
apps/desktop/e2e/ui-ux/*.spec.ts-snapshots/*.png binary
```

## 完了条件確認

- [x] 7 枚の baseline PNG が生成されている
- [x] `--update-snapshots` ありの初回生成が完了している
- [x] `.gitattributes` で PNG の binary 指定が確認できる
- [x] Phase 9 の比較テストにそのまま渡せる状態である
