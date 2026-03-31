# Phase 11: 手動テスト

## メタ情報

| 項目   | 値                                      |
| ------ | --------------------------------------- |
| Phase  | 11                                      |
| 機能名 | Playwright E2E 動的テストフレームワーク |
| 作成日 | 2026-03-31                              |

## 目的

Layer 1 / Layer 2 / AI UX の3層で current branch を実測し、Phase 12 が参照できる証跡を `outputs/phase-11/` 配下に閉じる。

## テストケース

| テストケース | レイヤー | 内容                                       | 主証跡                                           |
| ------------ | -------- | ------------------------------------------ | ------------------------------------------------ |
| TC-11-01     | Visual   | chat-main baseline / current 比較          | `screenshots/TC-11-01-chat-main.png`             |
| TC-11-02     | Visual   | skill-list baseline / current 比較         | `screenshots/TC-11-02-skill-list.png`            |
| TC-11-03     | Visual   | settings-general baseline / current 比較   | `screenshots/TC-11-03-settings-general.png`      |
| TC-11-04     | Visual   | sidebar-navigation baseline / current 比較 | `screenshots/TC-11-04-sidebar-navigation.png`    |
| TC-11-05     | Visual   | error-display current / diff 確認          | `screenshots/TC-11-05-error-display-current.png` |
| TC-11-06     | Visual   | loading-state current / diff 確認          | `screenshots/TC-11-06-loading-state-current.png` |
| TC-11-07     | Visual   | dark-mode current / diff 確認              | `screenshots/TC-11-07-dark-mode-current.png`     |
| NV-11-01     | Semantic | `ui-ux-layer1` 実行結果の確認              | `manual-test-result.md`                          |
| NV-11-02     | AI UX    | HTML report / fail message / 導線確認      | `ui-sanity-visual-review.md`                     |

## 画面カバレッジマトリクス

| テストケース | 画面               | 状態          | テーマ | 結果 |
| ------------ | ------------------ | ------------- | ------ | ---- |
| TC-11-01     | chat-main          | 基本表示      | light  | PASS |
| TC-11-02     | skill-list         | 基本表示      | light  | PASS |
| TC-11-03     | settings-general   | 基本表示      | light  | PASS |
| TC-11-04     | sidebar-navigation | 主要ナビ      | light  | PASS |
| TC-11-05     | error-display      | error state   | light  | FAIL |
| TC-11-06     | loading-state      | loading state | light  | FAIL |
| TC-11-07     | dark-mode          | dark mode     | dark   | FAIL |

## 実行コマンド

```bash
pnpm --filter @repo/desktop exec playwright test --project=ui-ux-layer1
pnpm --filter @repo/desktop exec playwright test --project=ui-ux-layer2
```

## 成果物

| 成果物                   | パス                                                         | 説明                            |
| ------------------------ | ------------------------------------------------------------ | ------------------------------- |
| 手動テスト結果           | `outputs/phase-11/manual-test-result.md`                     | 3層評価サマリー                 |
| 手動テスト詳細           | `outputs/phase-11/manual-test-report.md`                     | 実行コマンドと観察事項          |
| 手動テストチェックリスト | `outputs/phase-11/manual-test-checklist.md`                  | TC-ID ごとの実施状況            |
| 発見事項                 | `outputs/phase-11/discovered-issues.md`                      | HIGH / MEDIUM 問題              |
| 撮影計画                 | `outputs/phase-11/screenshot-plan.json`                      | screenshot source-of-truth      |
| 撮影カバレッジ           | `outputs/phase-11/screenshot-coverage.md`                    | TC-ID と PNG 紐付け             |
| UI/UX レビュー           | `outputs/phase-11/ui-sanity-visual-review.md`                | Apple UI/UX 観点レビュー        |
| metadata                 | `outputs/phase-11/screenshots/phase11-capture-metadata.json` | source evidence と generated-at |
| screenshot 群            | `outputs/phase-11/screenshots/*.png`                         | representative screenshots      |

## 完了条件

- [ ] `manual-test-result.md` と `manual-test-report.md` がある
- [ ] `discovered-issues.md` がある
- [ ] `screenshot-plan.json` / `screenshot-coverage.md` / metadata JSON がある
- [ ] representative screenshots が current workflow 配下にある
- [ ] HIGH 問題が formalize されている、または 0 件が明記されている

## 次のPhase

Phase 12: ドキュメント更新
