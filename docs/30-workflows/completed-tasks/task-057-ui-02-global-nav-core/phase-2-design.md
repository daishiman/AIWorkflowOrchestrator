# Phase 2: 設計

## メタ情報

| 項目         | 内容                           |
| ------------ | ------------------------------ |
| Phase        | 2                              |
| Phase名      | 設計                           |
| 前提Phase    | Phase 1                        |
| 後続Phase    | Phase 3                        |
| ステータス   | completed                      |
| 作成日       | 2026-03-06                     |
| 機能名       | task-057-ui-02-global-nav-core |
| 担当SubAgent | SubAgent-B（UI設計・移行設計） |

## 目的

Phase 1 の要件を `GlobalNavStrip`、`MobileNavBar`、`AppLayout`、`ComingSoonView`、`useNavShortcuts`、`uiSlice` 拡張へ分解し、段階移行が崩れない設計書へ落とし込む。

## 背景

本タスクは新規ナビ UI の追加ではなく、全画面の入口を差し替える基盤変更である。設計段階でコンポーネント責務、状態境界、移行順序、ロールバック条件を同時に固定しないと、後続 Phase で SoC と安全な段階移行が崩れる。

## 実行タスク

- コンポーネント設計: `GlobalNavStrip` とその子コンポーネントの責務、Props、レンダリング構造を設計する。
- レスポンシブ設計: expanded / collapsed / compact の表示条件と `MobileNavBar` More メニューを設計する。
- 状態管理設計: `uiSlice` の `isNavExpanded` と関連セレクタ、`navigationSlice` の既存責務維持方針を設計する。
- 移行設計: Step 1 並行稼働、Step 2 AppLayout 抽出、Step 3 AppDock 削除の順序とロールバック条件を設計する。
- 正本仕様抽出: aiworkflow 正本仕様から設計へ反映する項目をマトリクス化する。

## 参照資料

| 参照資料           | パス                                                                       | 内容                      |
| ------------------ | -------------------------------------------------------------------------- | ------------------------- |
| Phase 1仕様        | `phase-1-requirements.md`                                                  | 要件入力                  |
| 要件成果物         | `outputs/phase-1/requirements-definition.md`                               | 要件一覧                  |
| 受け入れ基準       | `outputs/phase-1/acceptance-criteria.md`                                   | 判定条件                  |
| 現行ナビ契約       | `apps/desktop/src/renderer/navigation/navContract.ts`                      | 9項目とショートカット契約 |
| 現行 AppDock       | `apps/desktop/src/renderer/components/organisms/AppDock/index.tsx`         | 既存実装の制約            |
| 現行 App           | `apps/desktop/src/renderer/App.tsx`                                        | レイアウト抽出対象        |
| UI Slice           | `apps/desktop/src/renderer/store/slices/uiSlice.ts`                        | 拡張対象 state と action  |
| Navigation Slice   | `apps/desktop/src/renderer/store/slices/navigationSlice.ts`                | currentView / viewHistory |
| ディレクトリ構成   | `.claude/skills/aiworkflow-requirements/references/directory-structure.md` | 配置規約                  |
| スコープ定義       | `outputs/phase-1/scope-definition.md`                                      | Phase 1 成果物            |
| 移行境界マトリクス | `outputs/phase-1/migration-boundary-matrix.md`                             | Phase 1 成果物            |
| SubAgent分担表     | `outputs/phase-1/subagent-boundary-map.md`                                 | Phase 1 成果物            |

## システム仕様（aiworkflow-requirements）

| 参照資料             | パス                                                                           | 内容                                           |
| -------------------- | ------------------------------------------------------------------------------ | ---------------------------------------------- |
| ナビゲーション仕様   | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`        | 9項目の導線正本、ショートカット条件            |
| UIコンポーネント仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`        | Organisms / Molecules の責務分離               |
| デザインシステム     | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`     | spacing、glass、ブレークポイント、コントラスト |
| UI設計原則           | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md` | HIG、WCAG、視覚階層                            |
| UIポータル仕様       | `.claude/skills/aiworkflow-requirements/references/ui-ux-portal-patterns.md`   | More メニュー、Tooltip、積層順序               |
| 状態管理仕様         | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`   | 個別セレクタ、P31 対策                         |
| アーキテクチャ概要   | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`   | Renderer 内の責務境界                          |
| 実装パターン         | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md`   | Hook / Slice / Component 分割                  |
| ディレクトリ構成     | `.claude/skills/aiworkflow-requirements/references/directory-structure.md`     | Organisms / hooks / store の配置規約           |
| エラーハンドリング   | `.claude/skills/aiworkflow-requirements/references/error-handling.md`          | プレースホルダー表示、想定外 ViewType の扱い   |

## 実行手順

### ステップ1: コンポーネント責務定義

`GlobalNavStrip`、`NavSection`、`NavItem`、`NavCollapseToggle`、`NavLogo`、`MobileNavBar`、`MoreMenu`、`AppLayout` の責務を 1 行で定義する。

### ステップ2: 状態と契約の設計

`currentView`、`viewHistory`、`responsiveMode`、`isNavExpanded`、`badgeCounts` の入出力と依存方向を図示する。

### ステップ3: 段階移行設計

Step 1〜3 の切替条件、ロールバック条件、削除対象を表にする。

### ステップ4: 正本仕様抽出

aiworkflow 正本仕様のどの節を設計へ反映するかをマトリクスにまとめる。

## 統合テスト連携

| 観点     | 内容                                                                    |
| -------- | ----------------------------------------------------------------------- |
| UI接続   | `AppLayout` が desktop / tablet / mobile を切り替える条件を固定する     |
| 状態接続 | `uiSlice` / `navigationSlice` / `navContract` の接続点を Phase 4 へ渡す |
| 操作接続 | `Cmd+1`〜`Cmd+8` / `Cmd+,` / `Cmd+[` とフォーカス移動の設計を固定する   |
| 移行接続 | フィーチャーフラグ OFF / ON / 削除後の 3 状態をテスト軸へ渡す           |

## 成果物

| 成果物                 | パス                                                           | 内容                             |
| ---------------------- | -------------------------------------------------------------- | -------------------------------- |
| アーキテクチャ設計     | `outputs/phase-2/architecture-design.md`                       | レイアウトと責務分離             |
| ナビ契約設計           | `outputs/phase-2/nav-contract-design.md`                       | セクション、項目、ショートカット |
| レスポンシブ設計       | `outputs/phase-2/responsive-layout-design.md`                  | 3モードの表示条件                |
| アクセシビリティ仕様   | `outputs/phase-2/accessibility-specification.md`               | aria、フォーカス、キーボード操作 |
| 正本仕様抽出マトリクス | `outputs/phase-2/aiworkflow-requirements-extraction-matrix.md` | 正本仕様と設計要素の対応         |
| 移行手順設計           | `outputs/phase-2/migration-sequence-design.md`                 | Step 1〜3 の切替とロールバック   |

## 依存関係

| 区分         | 内容                                                                                                                   |
| ------------ | ---------------------------------------------------------------------------------------------------------------------- |
| 入力依存     | Phase 1 の要件 ID、受け入れ基準、境界定義を設計の唯一入力とする                                                        |
| 並列調整     | SubAgent-B が UI/状態/移行設計を担当し、SubAgent-A は Gate 観点、SubAgent-C はテスト化観点をレビュー入力として受け取る |
| 後続引き渡し | Phase 3 は本Phaseの設計成果物を Gate 判定の正本として扱い、Phase 4 はここで固定した責務境界を TC 化する                |

## 完了条件

- [x] `GlobalNavStrip` と `MobileNavBar` の責務差分が設計書で明示されている
- [x] `uiSlice` と `navigationSlice` の責務境界が P31 対策込みで記録されている
- [x] フィーチャーフラグ移行と AppDock 削除条件が表形式で記録されている
- [x] aiworkflow 正本仕様との対応表が完成している
- [x] 本Phase内の全タスクを100%実行完了

## Phase末端アクション【必須】

- `outputs/phase-2/` 配下の設計成果物と要件 ID のトレーサビリティを確認する
- `artifacts.json` に Phase 2 の成果物登録内容を反映する
- More メニューとレスポンシブ切替の未確定事項は Phase 3 へ持ち越さず設計判断として固定する
- Phase 4 が直接 TC 化できる粒度で設計責務を `Phase実行記録` に要約する

## 多角的チェック観点（AIが判断）

| 観点             | 適用判断                                 | 仕様参照先                                          |
| ---------------- | ---------------------------------------- | --------------------------------------------------- |
| UI/UX            | グローバルナビ設計を扱うため適用         | `aiworkflow-requirements: ui-ux-*.md`               |
| アーキテクチャ   | AppLayout と Slice 境界を扱うため適用    | `aiworkflow-requirements: architecture-*.md`        |
| アクセシビリティ | aria とキーボード移動を扱うため適用      | `aiworkflow-requirements: testing-accessibility.md` |
| テスタビリティ   | 後続 Phase の TDD 入力を固定するため適用 | `aiworkflow-requirements: quality-requirements.md`  |

## サブタスク管理

1. 参照資料の確認
2. コンポーネント設計
3. 状態管理設計
4. 段階移行設計
5. 正本仕様抽出

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 成果物を指定パスへ出力
- [x] 完了条件のチェックを更新

## Phase実行記録

### 実行タスク結果

| タスク             | 結果      | 備考                    |
| ------------------ | --------- | ----------------------- |
| コンポーネント設計 | completed | outputs/phase-2/ を参照 |
| レスポンシブ設計   | completed | outputs/phase-2/ を参照 |
| 状態管理設計       | completed | outputs/phase-2/ を参照 |
| 移行設計           | completed | outputs/phase-2/ を参照 |
| 正本仕様抽出       | completed | outputs/phase-2/ を参照 |

### 発見事項

- 良かった点: GlobalNavStrip / MobileNavBar / AppLayout / uiSlice 拡張の責務境界を設計成果物へ落とし込めた。
- 問題点: 本文仕様書の pending 残置により、設計完了が workflow 本文からは読み取りにくかった。
- 次Phaseへの引き継ぎ: Phase 3 は outputs/phase-2/ の設計成果物を Gate 判定の正本として扱う。

## 次のPhase

Phase 3: 設計レビューゲート
