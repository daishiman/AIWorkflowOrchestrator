# Phase 7: テストカバレッジ確認

## メタ情報

| 項目         | 内容                           |
| ------------ | ------------------------------ |
| Phase        | 7                              |
| Phase名      | テストカバレッジ確認           |
| 前提Phase    | Phase 6                        |
| 後続Phase    | Phase 8                        |
| ステータス   | completed                      |
| 作成日       | 2026-03-06                     |
| 機能名       | task-057-ui-02-global-nav-core |
| 担当SubAgent | SubAgent-C（カバレッジ監査）   |

## 目的

`GlobalNavStrip` 系のユニットテスト、統合テスト、アクセシビリティ試験の網羅率を確認し、残存ギャップを明文化する。

## 背景

本タスクは UI 基盤の置換であり、導線が通るだけでは不十分である。どのファイル、どの状態、どの分岐が未検証かを数値と理由で切り分けないと、Phase 8 で場当たり的な修正が起きる。

## 実行タスク

- カバレッジ測定: 対象ファイルの Line / Branch / Function カバレッジを取得する。
- ギャップ分析: More メニュー、戻る操作、フィーチャーフラグ、legacy ViewType、Step 3 削除条件の未検証箇所を洗い出す。
- 契約一致確認: `navContract`、`GlobalNavStrip`、`MobileNavBar`、`AppLayout` の観測点が揃っているかを確認する。
- 引き継ぎ整理: Phase 8 へ持ち込む改善項目を優先度付きで整理する。

## 参照資料

| 参照資料                 | パス                                               | 内容                 |
| ------------------------ | -------------------------------------------------- | -------------------- |
| Phase 4仕様              | `phase-4-test-creation.md`                         | 元のテスト観点       |
| Phase 5仕様              | `phase-5-implementation.md`                        | 実装基準             |
| Phase 6仕様              | `phase-6-test-expansion.md`                        | 拡充後の観点         |
| テストケース一覧         | `outputs/phase-4/test-cases.md`                    | TC-ID                |
| 実装サマリー             | `outputs/phase-5/implementation-summary.md`        | 実装済み対象         |
| テスト拡充レポート       | `outputs/phase-6/test-expansion-report.md`         | 追加テスト一覧       |
| 回帰マトリクス           | `outputs/phase-6/regression-matrix.md`             | 回帰軸               |
| 移行状態検証表           | `outputs/phase-6/migration-state-matrix.md`        | 移行状態別の確認項目 |
| アクセシビリティ回帰計画 | `outputs/phase-6/accessibility-regression-plan.md` | Phase 6 成果物       |

## システム仕様（aiworkflow-requirements）

| 参照資料               | パス                                                                         | 内容                             |
| ---------------------- | ---------------------------------------------------------------------------- | -------------------------------- |
| 品質要件               | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`  | 必須カバレッジ基準               |
| テストアクセシビリティ | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md` | 手動・自動のアクセシビリティ観点 |
| ナビゲーション仕様     | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`      | 契約一致の正本                   |
| 状態管理仕様           | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` | selector と Slice の観測点       |

## 実行手順

### ステップ1: カバレッジ取得

対象テストを実行し、Line / Branch / Function の数値を記録する。

### ステップ2: ギャップ分類

未達項目を「仕様漏れ」「実装漏れ」「テスト漏れ」の 3 区分で分類する。

### ステップ3: 改善優先度付け

Phase 8 で解消する項目を優先度順に並べ、理由を 1 行で付ける。

## カバレッジ基準

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

**記録ルール**:

- 実測値のみを記録する
- 実行コマンドを成果物へ明記する
- 実行日時を成果物へ明記する

## 統合テスト連携

| 観点         | 内容                                                                   |
| ------------ | ---------------------------------------------------------------------- |
| UI接続       | `GlobalNavStrip` / `MobileNavBar` / `AppLayout` の主要導線を再確認する |
| 状態接続     | `isNavExpanded` と `viewHistory` の観測点があるかを確認する            |
| 移行接続     | フィーチャーフラグと Step 3 削除条件の試験が揃っているかを確認する     |
| 引き継ぎ接続 | 未達項目を Phase 8 の改善計画へ引き渡す                                |

## 成果物

| 成果物                 | パス                                           | 内容                           |
| ---------------------- | ---------------------------------------------- | ------------------------------ |
| カバレッジレポート     | `outputs/phase-7/coverage-report.md`           | 数値結果                       |
| カバレッジギャップ分析 | `outputs/phase-7/coverage-gap-analysis.md`     | 未達項目と原因                 |
| 契約一致チェック       | `outputs/phase-7/contract-parity-checklist.md` | `navContract` と UI 実装の照合 |

## 依存関係

| 区分         | 内容                                                                             |
| ------------ | -------------------------------------------------------------------------------- |
| 入力依存     | Phase 4〜6 のテスト設計・実装・回帰拡充結果が計測対象になる                      |
| 並列調整     | SubAgent-C が数値とギャップ分類を担当し、SubAgent-B は構造改善候補として受け取る |
| 後続引き渡し | Phase 8 は本Phaseのギャップ分類を優先度付き改善項目として扱う                    |

## 完了条件

- [x] Line / Branch / Function の数値が記録されている
- [x] ギャップが仕様漏れ、実装漏れ、テスト漏れに分類されている
- [x] `navContract` と UI 実装の契約一致チェックが完了している
- [x] Phase 8 へ引き継ぐ改善優先度が付いている
- [x] 本Phase内の全タスクを100%実行完了

## Phase末端アクション【必須】

- 実測カバレッジ値と実行コマンドを成果物へ記録する
- `artifacts.json` に Phase 7 の成果物登録内容を反映する
- ギャップを「仕様漏れ / 実装漏れ / テスト漏れ」の 3 分類で未整理のまま残さない
- Phase 8 が修正順序を決められるよう優先度と理由を `Phase実行記録` に残す

## 多角的チェック観点（AIが判断）

| 観点             | 適用判断                                   | 仕様参照先                                          |
| ---------------- | ------------------------------------------ | --------------------------------------------------- |
| テスタビリティ   | 本Phaseの主目的のため適用                  | `aiworkflow-requirements: quality-requirements.md`  |
| UI/UX            | 導線網羅を確認するため適用                 | `aiworkflow-requirements: ui-ux-*.md`               |
| アクセシビリティ | フォーカスと aria の網羅を確認するため適用 | `aiworkflow-requirements: testing-accessibility.md` |
| 状態管理         | selector 観測点の網羅を確認するため適用    | `aiworkflow-requirements: arch-state-management.md` |

## サブタスク管理

1. 参照資料の確認
2. カバレッジ測定
3. ギャップ分析
4. 契約一致確認
5. 引き継ぎ整理

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 成果物を指定パスへ出力
- [x] 完了条件のチェックを更新

## Phase実行記録

### 実行タスク結果

| タスク         | 結果      | 備考                    |
| -------------- | --------- | ----------------------- |
| カバレッジ測定 | completed | outputs/phase-7/ を参照 |
| ギャップ分析   | completed | outputs/phase-7/ を参照 |
| 契約一致確認   | completed | outputs/phase-7/ を参照 |
| 引き継ぎ整理   | completed | outputs/phase-7/ を参照 |

### 発見事項

- 良かった点: coverage 数値、ギャップ分析、契約一致チェックを outputs/phase-7/ に固定できた。
- 問題点: 本文仕様書の未同期で、Phase 8 への引き継ぎ優先度が workflow 本文上では埋もれていた。
- 次Phaseへの引き継ぎ: Phase 8 は outputs/phase-7/ のギャップ分析と契約一致結果を改善入力として利用する。

## 次のPhase

Phase 8: リファクタリング
