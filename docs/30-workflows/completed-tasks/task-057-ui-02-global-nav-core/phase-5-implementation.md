# Phase 5: 実装

## メタ情報

| 項目         | 内容                           |
| ------------ | ------------------------------ |
| Phase        | 5                              |
| Phase名      | 実装                           |
| 前提Phase    | Phase 4                        |
| 後続Phase    | Phase 6                        |
| ステータス   | completed                      |
| 作成日       | 2026-03-06                     |
| 機能名       | task-057-ui-02-global-nav-core |
| 担当SubAgent | SubAgent-B（UI実装・移行実装） |

## 目的

Phase 4 の Red テストを Green 化しつつ、`GlobalNavStrip` 基盤、`AppLayout` 抽出、`uiSlice` 拡張、段階移行フラグを実装する。

## 背景

Phase 5 は単一コンポーネントの実装ではなく、ナビゲーション契約、レイアウト、状態管理、移行フラグをまたぐ横断変更である。Green 化だけを優先すると責務混在が起きやすいため、設計どおりの境界と段階移行の安全性を同時に守る必要がある。

## 実行タスク

- コンポーネント実装: `GlobalNavStrip`、`MobileNavBar`、`AppLayout`、`ComingSoonView`、`useNavShortcuts` を実装する。
- App 統合: `App.tsx` にフィーチャーフラグ分岐、`renderView()` 拡張、`AppLayout` 導入を反映する。
- 状態管理実装: `uiSlice` に `isNavExpanded` と関連 action / selector を追加する。
- 移行実装: Step 1 の並行稼働に必要な分岐を作成し、Step 2 と Step 3 の実施条件をコード内コメントで固定する。
- テスト Green 化: Phase 4 の TC-ID に対応するテストを全件通過させる。

## 参照資料

| 参照資料                   | パス                                          | 内容            |
| -------------------------- | --------------------------------------------- | --------------- |
| Phase 2仕様                | `phase-2-design.md`                           | 設計の正本      |
| Phase 4仕様                | `phase-4-test-creation.md`                    | テストの正本    |
| アーキテクチャ設計         | `outputs/phase-2/architecture-design.md`      | レイアウト責務  |
| ナビ契約設計               | `outputs/phase-2/nav-contract-design.md`      | 9項目契約       |
| レスポンシブ設計           | `outputs/phase-2/responsive-layout-design.md` | 3モード表示条件 |
| テストケース一覧           | `outputs/phase-4/test-cases.md`               | Green 化対象    |
| 統合テストマトリクス       | `outputs/phase-4/integration-test-matrix.md`  | 接続観測点      |
| テスト仕様書               | `outputs/phase-4/test-specification.md`       | Phase 4 成果物  |
| アクセシビリティテスト計画 | `outputs/phase-4/accessibility-test-plan.md`  | Phase 4 成果物  |
| 手動検証準備表             | `outputs/phase-4/manual-checkpoint-matrix.md` | Phase 4 成果物  |

## システム仕様（aiworkflow-requirements）

| 参照資料               | パス                                                                         | 内容                                     |
| ---------------------- | ---------------------------------------------------------------------------- | ---------------------------------------- |
| UIコンポーネント仕様   | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`      | Organisms / Molecules の責務分離         |
| ナビゲーション仕様     | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`      | navContract とショートカット条件         |
| デザインシステム       | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`   | トークン、ブレークポイント、コントラスト |
| 状態管理仕様           | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` | 個別セレクタ、P31 対策                   |
| 実装パターン           | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` | Hook / Slice / Component 分離            |
| アーキテクチャ概要     | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md` | Renderer 全体への組み込み位置            |
| ディレクトリ構成       | `.claude/skills/aiworkflow-requirements/references/directory-structure.md`   | ファイル配置規約                         |
| テストアクセシビリティ | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md` | aria とフォーカス実装の期待値            |
| エラーハンドリング     | `.claude/skills/aiworkflow-requirements/references/error-handling.md`        | 想定外 ViewType と fallback              |

## 実行手順

### ステップ1: 新規コンポーネント作成

新規ディレクトリと型定義、定数、子コンポーネント、テストファイルを Phase 2 設計どおりに作成する。

### ステップ2: App 統合

`App.tsx` に `AppLayout` とフィーチャーフラグ分岐を導入し、desktop / mobile の切替経路を接続する。

### ステップ3: 状態管理更新

`uiSlice` と store export を更新し、`useIsNavExpanded` と関連 selector を追加する。

### ステップ4: テスト Green 化

Phase 4 の TC-ID に対応するユニットテストと統合テストを通過させる。

## TDD検証

| 観点             | Green 条件                                                                        | 逸脱時の戻り先 |
| ---------------- | --------------------------------------------------------------------------------- | -------------- |
| コンポーネント   | Red テストを変更せず `GlobalNavStrip` / `MobileNavBar` / `AppLayout` を通過させる | Phase 2        |
| 状態管理         | `uiSlice` の selector と action が既存 Slice 責務を壊さず通過する                 | Phase 2        |
| 移行実装         | フィーチャーフラグ OFF / ON / 削除後の準備状態がテストで識別できる                | Phase 4        |
| アクセシビリティ | aria / キーボード導線が自動テストで通過する                                       | Phase 4        |

## 統合テスト連携

| 観点     | 内容                                                                         |
| -------- | ---------------------------------------------------------------------------- |
| UI接続   | `App.tsx` / `AppLayout` / `GlobalNavStrip` / `MobileNavBar` の接続を実装する |
| 状態接続 | `uiSlice` / `navigationSlice` / `navContract` / `useNavShortcuts` を接続する |
| 検証接続 | Phase 4 の TC-ID をテストコードへ対応付ける                                  |
| 移行接続 | OFF / ON / Step 3 完了後の 3 系列をコード上で切り替え可能にする              |

## 成果物

| 成果物                     | パス                                                 | 内容                     |
| -------------------------- | ---------------------------------------------------- | ------------------------ |
| 実装サマリー               | `outputs/phase-5/implementation-summary.md`          | 実装内容の要約           |
| 変更ファイル一覧           | `outputs/phase-5/changed-files-list.md`              | 新規・修正・削除ファイル |
| ロールバック手順確認       | `outputs/phase-5/rollback-checklist.md`              | Step 1〜3 の戻し方       |
| ブランチ変更反映マトリクス | `outputs/phase-5/branch-change-reflection-matrix.md` | 変更点とテストの対応     |

## 依存関係

| 区分         | 内容                                                                                       |
| ------------ | ------------------------------------------------------------------------------------------ |
| 入力依存     | Phase 2 の設計成果物と Phase 4 の TC-ID が実装の唯一入力になる                             |
| 並列調整     | SubAgent-B が UI 実装を主担当し、SubAgent-C は TC-ID 変更なしで Green 化できるかを確認する |
| 後続引き渡し | Phase 6 は本Phaseの実装結果を回帰軸へ広げ、Phase 8 はここで残した構造上の負債を整理する    |

## 完了条件

- [x] `GlobalNavStrip` / `MobileNavBar` / `AppLayout` / `useNavShortcuts` が実装されている
- [x] `App.tsx` がフィーチャーフラグ経由で新旧ナビを切り替えられる
- [x] `uiSlice` の `isNavExpanded` と selector が追加されている
- [x] Phase 4 のテストが Green 化されている
- [x] 本Phase内の全タスクを100%実行完了

## Phase末端アクション【必須】

- 実装対象ファイルと TC-ID の対応を `changed-files-list.md` へ反映する
- `artifacts.json` に Phase 5 の成果物登録内容を反映する
- 設計逸脱があればコードコメントで済ませず、戻り先 Phase を明記する
- Phase 6/8 が使う回帰観点と構造負債を `Phase実行記録` に残す

## 多角的チェック観点（AIが判断）

| 観点             | 適用判断                             | 仕様参照先                                          |
| ---------------- | ------------------------------------ | --------------------------------------------------- |
| UI/UX            | 実装対象の中心のため適用             | `aiworkflow-requirements: ui-ux-*.md`               |
| アーキテクチャ   | AppLayout と Hook 分離を扱うため適用 | `aiworkflow-requirements: architecture-*.md`        |
| アクセシビリティ | aria とフォーカス実装を含むため適用  | `aiworkflow-requirements: testing-accessibility.md` |
| テスタビリティ   | Green 化の完了を扱うため適用         | `aiworkflow-requirements: quality-requirements.md`  |

## サブタスク管理

1. 参照資料の確認
2. コンポーネント実装
3. App 統合
4. 状態管理更新
5. テスト Green 化

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 成果物を指定パスへ出力
- [x] 完了条件のチェックを更新

## Phase実行記録

### 実行タスク結果

| タスク             | 結果      | 備考                    |
| ------------------ | --------- | ----------------------- |
| コンポーネント実装 | completed | outputs/phase-5/ を参照 |
| App 統合           | completed | outputs/phase-5/ を参照 |
| 状態管理実装       | completed | outputs/phase-5/ を参照 |
| 移行実装           | completed | outputs/phase-5/ を参照 |
| テスト Green 化    | completed | outputs/phase-5/ を参照 |

### 発見事項

- 良かった点: Global Navigation Core の主要実装と App 統合、状態管理、rollback path を outputs/phase-5/ に整理できた。
- 問題点: コードと成果物は揃っていても本文仕様書のステータスが stale だった。
- 次Phaseへの引き継ぎ: Phase 6 は outputs/phase-5/ の実装サマリーと変更一覧を基に回帰を拡充する。

## 次のPhase

Phase 6: テスト拡充
