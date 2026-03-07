# Phase 4: テスト作成

## メタ情報

| 項目         | 内容                           |
| ------------ | ------------------------------ |
| Phase        | 4                              |
| Phase名      | テスト作成                     |
| 前提Phase    | Phase 1, Phase 2, Phase 3      |
| 後続Phase    | Phase 5                        |
| ステータス   | completed                      |
| 作成日       | 2026-03-06                     |
| 機能名       | task-057-ui-02-global-nav-core |
| 担当SubAgent | SubAgent-C（テスト設計）       |

## 目的

`GlobalNavStrip` 移行の Red テストを先に定義し、UI 導線、アクセシビリティ、レスポンシブ切替、ロールバック経路の検証漏れを防ぐ。

## 背景

このタスクは段階移行を前提にしているため、通常の UI テスト設計よりも「新旧共存状態」と「削除完了後」の両方を最初から織り込む必要がある。Phase 4 で Red 条件を厳密に固定しておかないと、Phase 5 で実装都合の仕様化が起きる。

## 実行タスク

- テスト観点定義: コンポーネント、Hook、Slice、統合導線、アクセシビリティの 5 観点でテスト軸を定義する。
- テストケース作成: `GlobalNavStrip`、`MobileNavBar`、`AppLayout`、`useNavShortcuts`、`uiSlice` 追加セレクタの TC-ID を作成する。
- 手動検証準備: Phase 11 に必要なスクリーンショットと操作シナリオを先に定義する。
- フィーチャーフラグ検証設計: OFF、ON、Step 3 完了後の 3 状態の期待結果を作成する。

## 参照資料

| 参照資料               | パス                                                           | 内容                  |
| ---------------------- | -------------------------------------------------------------- | --------------------- |
| Phase 1仕様            | `phase-1-requirements.md`                                      | 要件入力              |
| Phase 2仕様            | `phase-2-design.md`                                            | 設計入力              |
| Phase 3仕様            | `phase-3-design-review.md`                                     | Gate 入力             |
| ナビ契約設計           | `outputs/phase-2/nav-contract-design.md`                       | 項目とショートカット  |
| レスポンシブ設計       | `outputs/phase-2/responsive-layout-design.md`                  | 3モード切替条件       |
| アクセシビリティ仕様   | `outputs/phase-2/accessibility-specification.md`               | aria とキーボード仕様 |
| リスク登録簿           | `outputs/phase-3/risk-register.md`                             | 高リスク項目          |
| アーキテクチャ設計     | `outputs/phase-2/architecture-design.md`                       | Phase 2 成果物        |
| 正本仕様抽出マトリクス | `outputs/phase-2/aiworkflow-requirements-extraction-matrix.md` | Phase 2 成果物        |
| 移行手順設計           | `outputs/phase-2/migration-sequence-design.md`                 | Phase 2 成果物        |
| 設計レビュー結果       | `outputs/phase-3/design-review-result.md`                      | Phase 3 成果物        |
| トレーサビリティ監査   | `outputs/phase-3/traceability-check.md`                        | Phase 3 成果物        |
| SubAgent境界監査       | `outputs/phase-3/subagent-boundary-audit.md`                   | Phase 3 成果物        |
| 要件定義書             | `outputs/phase-1/requirements-definition.md`                   | Phase 1 成果物        |
| 受け入れ基準           | `outputs/phase-1/acceptance-criteria.md`                       | Phase 1 成果物        |
| スコープ定義           | `outputs/phase-1/scope-definition.md`                          | Phase 1 成果物        |
| 移行境界マトリクス     | `outputs/phase-1/migration-boundary-matrix.md`                 | Phase 1 成果物        |
| SubAgent分担表         | `outputs/phase-1/subagent-boundary-map.md`                     | Phase 1 成果物        |

## システム仕様（aiworkflow-requirements）

| 参照資料               | パス                                                                         | 内容                                |
| ---------------------- | ---------------------------------------------------------------------------- | ----------------------------------- |
| 品質要件               | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`  | カバレッジと TDD 基準               |
| テストアクセシビリティ | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md` | キーボード、aria、フォーカスの検証  |
| ナビゲーション仕様     | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`      | 9項目導線の期待値                   |
| UIポータル仕様         | `.claude/skills/aiworkflow-requirements/references/ui-ux-portal-patterns.md` | More メニューの重なり順とフォーカス |
| 状態管理仕様           | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` | セレクタ境界、P31 対策              |
| エラーハンドリング     | `.claude/skills/aiworkflow-requirements/references/error-handling.md`        | 想定外入力時の挙動                  |

## 実行手順

### ステップ1: テスト観点定義

成功系、失敗系、回帰系、アクセシビリティ系、移行系の 5 系列でテスト観点を定義する。

### ステップ2: TC-ID 作成

各テスト観点に対して前提条件、入力、期待結果、対象ファイルを明記した TC-ID を割り当てる。

### ステップ3: 手動検証準備

Phase 11 で取得するスクリーンショット名、検証目的、対応する TC-ID を 1 対 1 で対応付ける。

## TDD検証

| 観点           | Red 条件                                                                                 | Green 着手条件                          |
| -------------- | ---------------------------------------------------------------------------------------- | --------------------------------------- |
| コンポーネント | `GlobalNavStrip` / `MobileNavBar` / `AppLayout` の期待描画が失敗するテストを先に定義する | 失敗理由が仕様に対応付いている          |
| 操作導線       | ショートカット、More メニュー、戻る操作の失敗系を先に定義する                            | 失敗系が happy path より先に存在する    |
| 移行状態       | OFF / ON / 削除後の 3 状態で期待差分が失敗として表現されている                           | 状態ごとの差分が TC-ID に分離されている |
| 手動証跡       | Phase 11 で必要な TC-ID と証跡名が先に固定されている                                     | 証跡計画が自動テストと衝突しない        |

## 統合テスト連携

| 観点     | 内容                                                                   |
| -------- | ---------------------------------------------------------------------- |
| UI接続   | `App.tsx` / `AppLayout` / `GlobalNavStrip` / `MobileNavBar` を接続する |
| 状態接続 | `uiSlice` / `navigationSlice` / `navContract` を接続する               |
| 操作接続 | キーボード、クリック、More メニュー、戻る操作を接続する                |
| 移行接続 | フィーチャーフラグ OFF / ON / 削除後の期待結果を接続する               |

## 成果物

| 成果物                     | パス                                          | 内容                           |
| -------------------------- | --------------------------------------------- | ------------------------------ |
| テスト仕様書               | `outputs/phase-4/test-specification.md`       | テスト方針                     |
| テストケース一覧           | `outputs/phase-4/test-cases.md`               | TC-ID 一覧                     |
| 統合テストマトリクス       | `outputs/phase-4/integration-test-matrix.md`  | 接続面と観測点                 |
| アクセシビリティテスト計画 | `outputs/phase-4/accessibility-test-plan.md`  | キーボード、aria、コントラスト |
| 手動検証準備表             | `outputs/phase-4/manual-checkpoint-matrix.md` | Phase 11 の証跡計画            |

## 依存関係

| 区分         | 内容                                                                                           |
| ------------ | ---------------------------------------------------------------------------------------------- |
| 入力依存     | Phase 1〜3 の要件・設計・Gate 判定が Red テスト設計の根拠になる                                |
| 並列調整     | SubAgent-C がテスト設計を主担当し、SubAgent-B の設計粒度を前提に TC-ID を作成する              |
| 後続引き渡し | Phase 5 は本Phaseの TC-ID と失敗条件を変更せず Green 化し、Phase 11 は手動証跡計画を再利用する |

## 完了条件

- [x] `GlobalNavStrip` / `MobileNavBar` / `AppLayout` / `useNavShortcuts` の TC-ID が定義されている
- [x] フィーチャーフラグ OFF / ON / 削除後の 3 状態がテストへ含まれている
- [x] スクリーンショット名と TC-ID の対応表が記録されている
- [x] happy-dom 制約と実行ディレクトリ制約がテスト仕様へ記録されている
- [x] 本Phase内の全タスクを100%実行完了

## Phase末端アクション【必須】

- `outputs/phase-4/` 配下の TC-ID と対象ファイルを照合する
- `artifacts.json` に Phase 4 の成果物登録内容を反映する
- Red 条件が未定義のまま Green 実装へ進まない
- Phase 5 がそのまま着手できる失敗条件と観測点を `Phase実行記録` に残す

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                         | 仕様参照先                                          |
| ------------------ | -------------------------------- | --------------------------------------------------- |
| テスタビリティ     | 本Phaseの主目的のため適用        | `aiworkflow-requirements: quality-requirements.md`  |
| アクセシビリティ   | キーボード導線を試験するため適用 | `aiworkflow-requirements: testing-accessibility.md` |
| UI/UX              | 導線の期待値を固定するため適用   | `aiworkflow-requirements: ui-ux-*.md`               |
| エラーハンドリング | 失敗系 TC を定義するため適用     | `aiworkflow-requirements: error-handling.md`        |

## サブタスク管理

1. 参照資料の確認
2. テスト観点定義
3. テストケース作成
4. 手動検証準備
5. 完了条件の確認

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 成果物を指定パスへ出力
- [x] 完了条件のチェックを更新

## Phase実行記録

### 実行タスク結果

| タスク                     | 結果      | 備考                    |
| -------------------------- | --------- | ----------------------- |
| テスト観点定義             | completed | outputs/phase-4/ を参照 |
| テストケース作成           | completed | outputs/phase-4/ を参照 |
| 手動検証準備               | completed | outputs/phase-4/ を参照 |
| フィーチャーフラグ検証設計 | completed | outputs/phase-4/ を参照 |

### 発見事項

- 良かった点: TC-ID、スクリーンショット対応、feature flag 3状態、happy-dom 制約をテスト仕様へ固定できた。
- 問題点: 本文仕様書の pending 残置により、Phase 5 の入力元が曖昧に見える状態だった。
- 次Phaseへの引き継ぎ: Phase 5 は outputs/phase-4/ のテスト仕様・ケース一覧・手動検証準備表を実装入力に使う。

## 次のPhase

Phase 5: 実装
