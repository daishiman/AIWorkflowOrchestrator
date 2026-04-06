# Phase 6: テスト拡充

## メタ情報

| 項目   | 値                                      |
| ------ | --------------------------------------- |
| Phase  | 6                                       |
| 機能名 | Playwright E2E 動的テストフレームワーク |
| 作成日 | 2026-03-31                              |

## 目的

Layer 2 Visual regression テスト（VIS-001〜007）を実装し、fail path・regression guard を追加することでテストスイートを拡充する。baseline 画像比較が安定して動作する状態を確立する。

## 実行タスク

- `layer2-visual.spec.ts` のスケルトンを作成する
- VIS-001〜007 のスクリーンショット比較ロジックを実装する
- `snapshots/` ディレクトリと `.gitkeep` を作成する
- PNG を binary として扱う設定を追加する
- fail path テストを追加する（存在しないセレクタ・閾値超え画面で FAIL が正しく返るか）
- regression guard を追加する（既存テストが新しい Layer 1/2 テスト追加で壊れないか確認）
- `ANTHROPIC_API_KEY` 未設定時に全テストが完走することを確認するテストケースを追加する

## 参照資料

| 資料名                   | パス                                                                   | 説明                  |
| ------------------------ | ---------------------------------------------------------------------- | --------------------- |
| Phase 4 共通基盤         | [phase-4-impl-config.md](phase-4-impl-config.md)                       | 基盤契約              |
| Phase 2 設計             | [phase-2-design.md](phase-2-design.md)                                 | baseline 管理方針     |
| 既存スクリーンショット例 | `apps/desktop/e2e/settings-integration-regression-screenshots.spec.ts` | snapshot パターン参照 |

## 実行手順

1. `TEST_TARGETS` を走査して Layer 2 の対象を確定する。
2. `page.toHaveScreenshot()` で差分比較を実装する。
3. baseline 用の `snapshots/` を Git 管理対象にする。
4. Phase 7 の初回生成に向けた準備を整える。

## 統合テスト連携

- Phase 5 と並列実行可能
- Phase 7 の baseline 初回生成の前提となる

## 多角的チェック観点（AIが判断）

| 観点       | 確認内容                                             |
| ---------- | ---------------------------------------------------- |
| UI/UX      | 画面ごとの threshold が妥当か                        |
| システム   | baseline と差分の責務が分離されているか              |
| 発想・拡張 | 将来対象を `test-targets.config.ts` に追加しやすいか |
| 問題解決   | フレークしやすい状態を過剰に固定していないか         |
| テスト拡充 | fail path が正しく FAIL を返すか                     |
| テスト拡充 | regression guard が既存テストへの波及を防いでいるか  |

## サブタスク管理

1. スケルトン作成
2. VIS-001〜003
3. VIS-004〜005
4. VIS-006〜007
5. snapshots / binary 設定

## 成果物

| 成果物                | パス                                           | 説明           |
| --------------------- | ---------------------------------------------- | -------------- |
| Visual テスト         | `apps/desktop/e2e/ui-ux/layer2-visual.spec.ts` | Layer 2 実装   |
| baseline ディレクトリ | `apps/desktop/e2e/ui-ux/snapshots/`            | 画像保存先     |
| 実装サマリー          | `outputs/phase-6/visual-summary.md`            | 実装内容の記録 |

## 完了条件

- [ ] VIS-001〜007 が実装されている
- [ ] `snapshots/` ディレクトリが作成されている
- [ ] PNG の扱いが binary 前提になっている
- [ ] baseline 初回生成の準備が整っている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] Layer 2 の全テストケースが実装されている
- [ ] baseline 比較の責務が実装と分離されている
- [ ] Phase 7 の初回生成へそのまま進める状態になっている

## 次のPhase

Phase 7: カバレッジ確認
