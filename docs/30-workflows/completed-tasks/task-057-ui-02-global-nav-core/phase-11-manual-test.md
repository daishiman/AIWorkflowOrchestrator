# Phase 11: 手動テスト検証

## メタ情報

| 項目         | 内容                           |
| ------------ | ------------------------------ |
| Phase        | 11                             |
| Phase名      | 手動テスト検証                 |
| 前提Phase    | Phase 10                       |
| 後続Phase    | Phase 12                       |
| ステータス   | completed                      |
| 作成日       | 2026-03-06                     |
| 機能名       | task-057-ui-02-global-nav-core |
| 担当SubAgent | SubAgent-D（手動検証・証跡）   |

## 目的

desktop / tablet / mobile の 3 モードで、Global Navigation の表示、操作、アクセシビリティ、ロールバック導線を手動で確認し、証跡を残す。

## 背景

自動テストだけでは、More メニューの積層、表示密度、操作の迷いにくさ、スクリーンショット証跡の妥当性までは担保できない。Phase 11 ではユーザー体験に直結する観点を 3 モード横断で検証し、Phase 12 の正本同期に渡す証跡を揃える。

## 実行タスク

- シナリオ実行: 9ナビ項目、More メニュー、戻る操作、トグル操作、フィーチャーフラグ切替を手動確認する。
- スクリーンショット取得: 表示モードごとに TC-ID と 1 対 1 の画像を取得する。
- 発見事項記録: 不一致、崩れ、誤発火、操作不能箇所を記録する。
- preflight 記録: 手動検証前のポート使用状況と実行環境を記録する。

## 参照資料

| 参照資料                 | パス                                                | 内容               |
| ------------------------ | --------------------------------------------------- | ------------------ |
| Phase 2仕様              | `phase-2-design.md`                                 | 設計基準           |
| Phase 5仕様              | `phase-5-implementation.md`                         | 実装基準           |
| Phase 6仕様              | `phase-6-test-expansion.md`                         | 回帰観点           |
| Phase 7仕様              | `phase-7-coverage-check.md`                         | カバレッジ観点     |
| Phase 8仕様              | `phase-8-refactoring.md`                            | 改善内容           |
| Phase 4仕様              | `phase-4-test-creation.md`                          | 手動検証計画       |
| Phase 10仕様             | `phase-10-final-review.md`                          | Gate 判定          |
| レスポンシブ設計         | `outputs/phase-2/responsive-layout-design.md`       | 表示条件           |
| 実装サマリー             | `outputs/phase-5/implementation-summary.md`         | 実装済み対象       |
| テスト拡充レポート       | `outputs/phase-6/test-expansion-report.md`          | 追加観点           |
| カバレッジレポート       | `outputs/phase-7/coverage-report.md`                | カバレッジ結果     |
| 削除準備チェックリスト   | `outputs/phase-8/appdock-removal-readiness.md`      | Step 3 条件        |
| 手動検証準備表           | `outputs/phase-4/manual-checkpoint-matrix.md`       | TC-ID と証跡の対応 |
| レスポンシブ監査         | `outputs/phase-9/responsive-accessibility-audit.md` | 重点確認項目       |
| 最終レビュー結果         | `outputs/phase-10/final-review-result.md`           | 検証条件           |
| リリース判定             | `outputs/phase-10/release-decision.md`              | Phase 10 成果物    |
| ロールバック準備レビュー | `outputs/phase-10/rollback-readiness-review.md`     | Phase 10 成果物    |

## システム仕様（aiworkflow-requirements）

| 参照資料               | パス                                                                           | 内容                                    |
| ---------------------- | ------------------------------------------------------------------------------ | --------------------------------------- |
| UIコンポーネント仕様   | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`        | Organisms と証跡対象の切り分け          |
| デザインシステム       | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`     | ブレークポイント、コントラスト、spacing |
| UI設計原則             | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md` | 視認性と操作導線                        |
| テストアクセシビリティ | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`   | キーボードとスクリーンリーダーの観点    |
| ナビゲーション仕様     | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`        | 導線期待値                              |
| UIポータル仕様         | `.claude/skills/aiworkflow-requirements/references/ui-ux-portal-patterns.md`   | More メニューのフォーカスと積層順       |
| 状態管理仕様           | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`   | `viewHistory` の観点                    |

## 実行手順

### ステップ1: preflight 記録

ポート、ビルド、実行環境を確認し、ログへ記録する。

### ステップ2: シナリオ実行

desktop、tablet、mobile の順で TC-ID を実行し、結果を記録する。

### ステップ3: 証跡整理

スクリーンショット名、TC-ID、確認結果、発見事項を対応付ける。

## テストケース

| TC-ID    | モード     | 観点                     | 期待結果                                                          |
| -------- | ---------- | ------------------------ | ----------------------------------------------------------------- |
| TC-11-01 | desktop    | expanded ナビ描画        | 9項目、3セクション、ラベル表示が一致する                          |
| TC-11-02 | tablet     | collapsed ナビ描画       | アイコンのみ、幅56px、フォーカス移動が動作する                    |
| TC-11-03 | mobile     | MobileNavBar + More      | 主要5項目と More 展開4項目が一致する                              |
| TC-11-04 | desktop    | キーボードショートカット | `Cmd/Ctrl+1..8`, `Cmd/Ctrl+,`, `Cmd/Ctrl+[` が期待どおりに動く    |
| TC-11-05 | desktop    | 編集要素除外             | input / textarea / contenteditable 上でショートカットが発火しない |
| TC-11-06 | desktop    | 戻る導線                 | `viewHistory` に基づき前画面へ戻る                                |
| TC-11-07 | cross-mode | フィーチャーフラグ切替   | OFF / ON / 削除後の期待状態が識別できる                           |

## 画面カバレッジマトリクス

| テストケース | 対象                             | 優先度 | 証跡                                                                                                    | 備考                                      |
| ------------ | -------------------------------- | ------ | ------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| TC-11-01     | GlobalNavStrip expanded active   | A      | `screenshots/TC-11-01-desktop-expanded-dashboard.png`                                                   | desktop の標準状態                        |
| TC-11-02     | GlobalNavStrip collapsed focus   | A      | `screenshots/TC-11-02-tablet-collapsed-focus.png`                                                       | tablet のキーボード導線                   |
| TC-11-03     | MobileNavBar default             | A      | `screenshots/TC-11-03-mobile-default.png`                                                               | mobile の標準状態                         |
| TC-11-04     | MoreMenu / shortcut 到達後       | A      | `screenshots/TC-11-03-mobile-more-menu.png`, `screenshots/TC-11-04-desktop-history-search-shortcut.png` | More 展開と shortcut 遷移後               |
| TC-11-05     | useNavShortcuts editable guard   | B      | `screenshots/TC-11-04-desktop-history-search-shortcut.png`                                              | 実判定は NON_VISUAL、代表画面参照のみ添付 |
| TC-11-06     | navigationSlice viewHistory 戻り | B      | `screenshots/TC-11-04-desktop-history-search-shortcut.png`                                              | 実判定は NON_VISUAL、代表画面参照のみ添付 |
| TC-11-07     | feature flag rollback path       | B      | `screenshots/TC-11-01-desktop-expanded-dashboard.png`, `screenshots/TC-11-03-mobile-default.png`        | OFF/ON/readiness の代表画面               |

## 実行環境 preflight

| 項目          | 確認内容                                                                                                                            |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| preview build | `pnpm --filter @repo/desktop preview` が成功すること                                                                                |
| 疎通確認      | `curl -I http://127.0.0.1:4173/advanced/skill-center?skipAuth=true` が成功すること                                                  |
| ポート確認    | `lsof -nP -iTCP:4173 -sTCP:LISTEN` を必ず記録し、再撮影で Vite preview を使う場合のみ `lsof -nP -iTCP:5174 -sTCP:LISTEN` も記録する |
| cleanup       | 撮影後に残留 `vite` / capture プロセスがないことを確認する                                                                          |

## 統合テスト連携

| 観点     | 内容                                                         |
| -------- | ------------------------------------------------------------ |
| UI接続   | 表示モード 3 系列の導線を同一シナリオ群で確認する            |
| 状態接続 | `viewHistory` と `isNavExpanded` の手動挙動を確認する        |
| 移行接続 | フィーチャーフラグ OFF / ON / 削除後に相当する状態を確認する |
| 証跡接続 | Phase 12 の仕様更新へスクリーンショットと発見事項を渡す      |

## 成果物

| 成果物                       | パス                                                | 内容               |
| ---------------------------- | --------------------------------------------------- | ------------------ |
| 手動テスト結果               | `outputs/phase-11/manual-test-result.md`            | シナリオ結果       |
| スクリーンショットカバレッジ | `outputs/phase-11/screenshot-coverage.md`           | TC-ID と画像対応   |
| 発見事項                     | `outputs/phase-11/discovered-issues.md`             | 不一致と対処方針   |
| ナビ導線ウォークスルー       | `outputs/phase-11/navigation-walkthrough-matrix.md` | モード別の導線確認 |

## 依存関係

| 区分         | 内容                                                                                    |
| ------------ | --------------------------------------------------------------------------------------- |
| 入力依存     | Phase 4 の手動検証計画、Phase 9 の QA 結果、Phase 10 の Gate 判定が手動検証の前提になる |
| 並列調整     | SubAgent-D が証跡収集を主担当し、SubAgent-C の TC-ID と 1 対 1 に対応付ける             |
| 後続引き渡し | Phase 12 は本Phaseの証跡、発見事項、preflight 記録を正本同期と未タスク検出に利用する    |

## 完了条件

- [x] desktop / tablet / mobile の 3 系列で結果が記録されている
- [x] TC-ID とスクリーンショットの対応が記録されている
- [x] 発見事項に再現手順と影響が記録されている
- [x] preflight の実行結果が記録されている
- [x] 本Phase内の全タスクを100%実行完了

## Phase末端アクション【必須】

- 各 TC-ID に対する証跡の有無を確認する
- `artifacts.json` に Phase 11 の成果物登録内容を反映する
- UI 問題は重要度と未タスク化要否を必ず記録する
- Phase 12 が正本同期できるよう証跡のリンクと要約を `Phase実行記録` に残す

## 多角的チェック観点（AIが判断）

| 観点             | 適用判断                               | 仕様参照先                                          |
| ---------------- | -------------------------------------- | --------------------------------------------------- |
| UI/UX            | 本Phaseの主目的のため適用              | `aiworkflow-requirements: ui-ux-*.md`               |
| アクセシビリティ | 手動確認の中心のため適用               | `aiworkflow-requirements: testing-accessibility.md` |
| 状態管理         | 戻る動作とトグル動作を確認するため適用 | `aiworkflow-requirements: arch-state-management.md` |
| テスタビリティ   | 証跡を Phase 12 へ引き渡すため適用     | `aiworkflow-requirements: quality-requirements.md`  |

## サブタスク管理

1. 参照資料の確認
2. シナリオ実行
3. スクリーンショット取得
4. 発見事項記録
5. preflight 記録

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 成果物を指定パスへ出力
- [x] 完了条件のチェックを更新

## Phase実行記録

### 実行タスク結果

| タスク                 | 結果      | 備考                     |
| ---------------------- | --------- | ------------------------ |
| シナリオ実行           | completed | outputs/phase-11/ を参照 |
| スクリーンショット取得 | completed | outputs/phase-11/ を参照 |
| 発見事項記録           | completed | outputs/phase-11/ を参照 |
| preflight 記録         | completed | outputs/phase-11/ を参照 |

### 発見事項

- 良かった点: スクリーンショット証跡、non-visual 判定、Apple UI/UX 観点の視覚確認まで outputs/phase-11/ に記録できた。
- 問題点: 本文仕様書が pending のままだと Phase 12 の正本同期時に依存関係が読み取りにくい。
- 次Phaseへの引き継ぎ: Phase 12 は outputs/phase-11/ の手動検証結果と visual review を正本入力として同期する。

## 次のPhase

Phase 12: ドキュメント更新
