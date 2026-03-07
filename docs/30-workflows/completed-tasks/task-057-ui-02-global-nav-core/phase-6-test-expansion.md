# Phase 6: テスト拡充

## メタ情報

| 項目         | 内容                                 |
| ------------ | ------------------------------------ |
| Phase        | 6                                    |
| Phase名      | テスト拡充                           |
| 前提Phase    | Phase 5                              |
| 後続Phase    | Phase 7                              |
| ステータス   | completed                            |
| 作成日       | 2026-03-06                           |
| 機能名       | task-057-ui-02-global-nav-core       |
| 担当SubAgent | SubAgent-C（回帰・アクセシビリティ） |

## 目的

Phase 5 の Green 状態を基に、レスポンシブ、アクセシビリティ、移行経路、回帰経路のテストを拡充して将来の UI 追加で壊れにくい状態を作る。

## 背景

Global Navigation は後続タスクで項目追加やプレースホルダー差し替えが連続する前提であり、初回 Green だけでは回帰耐性が不足する。Phase 6 では表示モード、導線、移行状態の組み合わせを増やし、壊れ方を先回りして固定する。

## 実行タスク

- 回帰マトリクス拡充: desktop / tablet / mobile の表示差分と More メニュー操作を追加する。
- アクセシビリティ試験拡充: フォーカス移動、aria、キーボード操作、コントラスト確認の試験を追加する。
- 移行試験拡充: フィーチャーフラグ OFF / ON / 削除後の 3 系列を追加する。
- レガシー導線試験: `skill-center` 互換導線、`viewHistory` 戻り動作、AppDock 残存導線を追加する。

## 参照資料

| 参照資料                   | パス                                                 | 内容           |
| -------------------------- | ---------------------------------------------------- | -------------- |
| Phase 4仕様                | `phase-4-test-creation.md`                           | テスト設計     |
| Phase 5仕様                | `phase-5-implementation.md`                          | 実装入力       |
| テスト仕様書               | `outputs/phase-4/test-specification.md`              | 初期テスト方針 |
| テストケース一覧           | `outputs/phase-4/test-cases.md`                      | 追加対象       |
| 実装サマリー               | `outputs/phase-5/implementation-summary.md`          | 実装済み論点   |
| ロールバック手順確認       | `outputs/phase-5/rollback-checklist.md`              | 移行試験の前提 |
| 統合テストマトリクス       | `outputs/phase-4/integration-test-matrix.md`         | Phase 4 成果物 |
| アクセシビリティテスト計画 | `outputs/phase-4/accessibility-test-plan.md`         | Phase 4 成果物 |
| 手動検証準備表             | `outputs/phase-4/manual-checkpoint-matrix.md`        | Phase 4 成果物 |
| 変更ファイル一覧           | `outputs/phase-5/changed-files-list.md`              | Phase 5 成果物 |
| ブランチ変更反映マトリクス | `outputs/phase-5/branch-change-reflection-matrix.md` | Phase 5 成果物 |

## システム仕様（aiworkflow-requirements）

| 参照資料               | パス                                                                         | 内容                                |
| ---------------------- | ---------------------------------------------------------------------------- | ----------------------------------- |
| 品質要件               | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`  | 回帰試験とカバレッジ基準            |
| テストアクセシビリティ | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md` | フォーカス、aria、キーボード試験    |
| ナビゲーション仕様     | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`      | legacy 導線とショートカット期待値   |
| UIポータル仕様         | `.claude/skills/aiworkflow-requirements/references/ui-ux-portal-patterns.md` | More メニューの開閉とフォーカス回帰 |
| 状態管理仕様           | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` | `viewHistory` と selector 境界      |

## 実行手順

### ステップ1: 回帰軸追加

既存 TC-ID へ「表示モード」「移行状態」「アクセシビリティ」の軸を追加してマトリクス化する。

### ステップ2: テスト追加

Phase 4 で未作成だった More メニュー、戻る操作、legacy ViewType、コントラスト確認のテストを追加する。

### ステップ3: 実行結果記録

追加テストの対象ファイル、結果、残課題をレポートへ記録する。

## 統合テスト連携

| 観点     | 内容                                                                    |
| -------- | ----------------------------------------------------------------------- |
| UI接続   | desktop / tablet / mobile の 3 モードを同一マトリクスで確認する         |
| 状態接続 | `viewHistory`、`isNavExpanded`、More メニュー状態の組み合わせを確認する |
| 移行接続 | フィーチャーフラグ OFF / ON / 削除後の差分を確認する                    |
| 証跡接続 | Phase 11 のスクリーンショット計画へ追加ケースを引き渡す                 |

## 成果物

| 成果物                   | パス                                               | 内容                           |
| ------------------------ | -------------------------------------------------- | ------------------------------ |
| 回帰マトリクス           | `outputs/phase-6/regression-matrix.md`             | 追加した回帰軸                 |
| テスト拡充レポート       | `outputs/phase-6/test-expansion-report.md`         | 追加テスト一覧                 |
| アクセシビリティ回帰計画 | `outputs/phase-6/accessibility-regression-plan.md` | フォーカス、aria、コントラスト |
| 移行状態検証表           | `outputs/phase-6/migration-state-matrix.md`        | OFF / ON / 削除後の期待結果    |

## 依存関係

| 区分         | 内容                                                                                                   |
| ------------ | ------------------------------------------------------------------------------------------------------ |
| 入力依存     | Phase 4 の TC-ID と Phase 5 の Green 実装結果が回帰拡充の前提になる                                    |
| 並列調整     | SubAgent-C が回帰・アクセシビリティ拡充を担当し、SubAgent-D は Phase 11 証跡へ再利用する観点を受け取る |
| 後続引き渡し | Phase 7 は本Phaseで拡張した回帰軸をカバレッジ計測対象として扱う                                        |

## 完了条件

- [x] More メニュー、戻る操作、legacy ViewType の試験が追加されている
- [x] desktop / tablet / mobile の回帰マトリクスが完成している
- [x] アクセシビリティ回帰計画が記録されている
- [x] 移行状態 3 系列の期待結果がテストへ反映されている
- [x] 本Phase内の全タスクを100%実行完了

## Phase末端アクション【必須】

- 追加した回帰軸と既存 TC-ID の対応を明記する
- `artifacts.json` に Phase 6 の成果物登録内容を反映する
- 手動検証へ再利用するケースはスクリーンショット対象か否かを分類する
- Phase 7 がそのまま計測できる実行コマンドと対象ファイルを `Phase実行記録` に残す

## 多角的チェック観点（AIが判断）

| 観点             | 適用判断                                 | 仕様参照先                                          |
| ---------------- | ---------------------------------------- | --------------------------------------------------- |
| テスタビリティ   | 本Phaseの主目的のため適用                | `aiworkflow-requirements: quality-requirements.md`  |
| アクセシビリティ | 回帰試験を追加するため適用               | `aiworkflow-requirements: testing-accessibility.md` |
| UI/UX            | モード差分と More メニューを扱うため適用 | `aiworkflow-requirements: ui-ux-*.md`               |
| 状態管理         | `viewHistory` と selector を扱うため適用 | `aiworkflow-requirements: arch-state-management.md` |

## サブタスク管理

1. 参照資料の確認
2. 回帰マトリクス拡充
3. アクセシビリティ試験拡充
4. 移行試験拡充
5. 実行結果記録

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 成果物を指定パスへ出力
- [x] 完了条件のチェックを更新

## Phase実行記録

### 実行タスク結果

| タスク                   | 結果      | 備考                    |
| ------------------------ | --------- | ----------------------- |
| 回帰マトリクス拡充       | completed | outputs/phase-6/ を参照 |
| アクセシビリティ試験拡充 | completed | outputs/phase-6/ を参照 |
| 移行試験拡充             | completed | outputs/phase-6/ を参照 |
| レガシー導線試験         | completed | outputs/phase-6/ を参照 |

### 発見事項

- 良かった点: More メニュー、戻る導線、legacy ViewType、アクセシビリティ回帰の拡充内容を outputs/phase-6/ に集約できた。
- 問題点: 本文仕様書が pending のままだと回帰観点の完了が読み取りづらかった。
- 次Phaseへの引き継ぎ: Phase 7 は outputs/phase-6/ の回帰マトリクスと拡充レポートを元に coverage を判定する。

## 次のPhase

Phase 7: テストカバレッジ確認
