# Phase 7: カバレッジ確認

## メタ情報

| 項目   | 値                                      |
| ------ | --------------------------------------- |
| Phase  | 7                                       |
| 機能名 | Playwright E2E 動的テストフレームワーク |
| 作成日 | 2026-03-31                              |

## 目的

Layer 2 の初回 baseline 画像を生成するとともに、Layer 1 / Layer 2 のテストカバレッジ（concern / dependency edge）を確認し、SEM/VIS テストが対象画面を十分にカバーしていることを可視化する。

## 実行タスク

- アプリをビルドする
- `--update-snapshots` で baseline を初回生成する
- `apps/desktop/e2e/ui-ux/layer2-visual.spec.ts-snapshots/` の PNG を確認する
- PNG の binary 指定を確認する
- SEM-001〜007 が `TEST_TARGETS` の全 Layer 1 対象をカバーしているか確認する
- VIS-001〜007 が `TEST_TARGETS` の全 Layer 2 対象をカバーしているか確認する
- カバレッジ不足の画面・コンポーネントがあれば `discovered-gaps.md` に記録する

## 参照資料

| 資料名       | パス                                             | 説明              |
| ------------ | ------------------------------------------------ | ----------------- |
| Phase 6 実装 | [phase-6-impl-layer2.md](phase-6-impl-layer2.md) | baseline 比較対象 |
| Phase 2 設計 | [phase-2-design.md](phase-2-design.md)           | threshold 方針    |

## 実行手順

1. `pnpm --filter @repo/desktop build` でアプリをビルドする。
2. `pnpm --filter @repo/desktop test:e2e -- --update-snapshots --project=ui-ux-layer2` を実行する。
3. 生成された PNG とファイル名を確認する。
4. `.gitattributes` の設定を確認する。

## 統合テスト連携

- Phase 6 の成果物が必要
- Phase 9 の比較テストはこの baseline を前提にする

## 多角的チェック観点（AIが判断）

| 観点       | 確認内容                                                 |
| ---------- | -------------------------------------------------------- |
| システム   | baseline が差分比較の正本として機能するか                |
| 戦略・価値 | 初回生成と継続比較の責務が混ざっていないか               |
| 問題解決   | 初回だけ成功しても将来壊れない構成か                     |
| カバレッジ | SEM/VIS テストが TEST_TARGETS の全対象をカバーしているか |

## サブタスク管理

1. build
2. baseline 生成
3. PNG 確認
4. binary 設定確認

## 成果物

| 成果物             | パス                                                           | 説明                            |
| ------------------ | -------------------------------------------------------------- | ------------------------------- |
| baseline 画像      | `apps/desktop/e2e/ui-ux/layer2-visual.spec.ts-snapshots/*.png` | 初回生成物                      |
| 実行サマリー       | `outputs/phase-7/baseline-summary.md`                          | 生成結果の記録                  |
| カバレッジレポート | `outputs/phase-7/coverage-report.md`                           | concern/edge カバレッジの可視化 |

## 完了条件

- [ ] 7 枚の baseline PNG が生成されている
- [ ] `--update-snapshots` ありの初回生成が完了している
- [ ] `.gitattributes` で PNG の binary 指定が確認できる
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] 生成 PNG の枚数と名前が対象定義と一致している
- [ ] Phase 9 の比較テストにそのまま渡せる状態である
- [ ] commit を目的にせず baseline 初回確立だけを行っている

## 次のPhase

Phase 8: リファクタリング
