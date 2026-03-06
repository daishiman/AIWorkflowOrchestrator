# Phase 3: 設計レビューゲート

## メタ情報

| 項目         | 内容                             |
| ------------ | -------------------------------- |
| Phase        | 3                                |
| Phase名      | 設計レビューゲート               |
| 前提Phase    | Phase 1, Phase 2                 |
| 後続Phase    | Phase 4                          |
| ステータス   | completed                        |
| 作成日       | 2026-03-06                       |
| 機能名       | task-057-ui-02-global-nav-core   |
| 担当SubAgent | SubAgent-A（レビュー・境界監査） |

## 目的

Phase 2 の設計が SoC、アクセシビリティ、移行安全性、正本仕様整合の観点で実装可能な粒度になっているかを判定する。

## 背景

Global Navigation は後続の UI タスク群すべての入口になるため、設計の曖昧さを残したまま実装へ進むと手戻りコストが大きい。Phase 3 では要件・設計・SubAgent 境界の三者を同時に監査し、戻り先まで明文化して実装着手条件を固定する。

## 実行タスク

- 設計レビュー実施: コンポーネント責務、Slice 境界、Hook 責務、移行手順の一貫性をレビューする。
- リスク登録: More メニュー、キーボード競合、legacy ViewType、AppDock 削除漏れのリスクを登録する。
- トレーサビリティ確認: Phase 1 要件から Phase 2 設計への対応漏れを監査する。
- SubAgent 境界監査: SubAgent-A〜D の成果物重複と責務漏れを監査する。

## 参照資料

| 参照資料               | パス                                                           | 内容                     |
| ---------------------- | -------------------------------------------------------------- | ------------------------ |
| Phase 1仕様            | `phase-1-requirements.md`                                      | 要件の正本               |
| Phase 2仕様            | `phase-2-design.md`                                            | 設計の正本               |
| 要件成果物             | `outputs/phase-1/requirements-definition.md`                   | 要件一覧                 |
| 設計成果物             | `outputs/phase-2/architecture-design.md`                       | アーキテクチャ設計       |
| レスポンシブ設計       | `outputs/phase-2/responsive-layout-design.md`                  | 3モード設計              |
| アクセシビリティ仕様   | `outputs/phase-2/accessibility-specification.md`               | aria とキーボード仕様    |
| 移行手順設計           | `outputs/phase-2/migration-sequence-design.md`                 | Step 1〜3 とロールバック |
| ナビ契約設計           | `outputs/phase-2/nav-contract-design.md`                       | Phase 2 成果物           |
| 正本仕様抽出マトリクス | `outputs/phase-2/aiworkflow-requirements-extraction-matrix.md` | Phase 2 成果物           |
| 受け入れ基準           | `outputs/phase-1/acceptance-criteria.md`                       | Phase 1 成果物           |
| スコープ定義           | `outputs/phase-1/scope-definition.md`                          | Phase 1 成果物           |
| 移行境界マトリクス     | `outputs/phase-1/migration-boundary-matrix.md`                 | Phase 1 成果物           |
| SubAgent分担表         | `outputs/phase-1/subagent-boundary-map.md`                     | Phase 1 成果物           |

## システム仕様（aiworkflow-requirements）

| 参照資料               | パス                                                                           | 内容                                   |
| ---------------------- | ------------------------------------------------------------------------------ | -------------------------------------- |
| ナビゲーション仕様     | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`        | navContract と UI 導線の整合           |
| デザインシステム       | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`     | 寸法、間隔、コントラスト基準           |
| 状態管理仕様           | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`   | Slice 境界と個別セレクタ               |
| UI設計原則             | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md` | HIG と WCAG の観点                     |
| テストアクセシビリティ | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`   | キーボード操作とスクリーンリーダー検証 |
| アーキテクチャ概要     | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`   | Renderer 全体との接続妥当性            |
| アーキテクチャ仕様     | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md`   | Hook / Component / Store 分離          |

## レビューゲート

### 判定基準

| 判定     | 条件                                   | 次のアクション                |
| -------- | -------------------------------------- | ----------------------------- |
| PASS     | 要件・設計・移行計画に重大な欠落がない | Phase 4 へ進行                |
| MINOR    | 軽微な追記で解消できる                 | 指摘対応後に Phase 4 へ進行   |
| MAJOR    | 設計または要件の再整理が必要           | 影響に応じて Phase 1/2 へ戻る |
| CRITICAL | 前提要件が崩れており実装着手が危険     | Phase 1 へ戻り再定義する      |

### 戻り先決定基準

| 問題の種類 | 戻り先              |
| ---------- | ------------------- |
| 要件の問題 | Phase 1（要件定義） |
| 設計の問題 | Phase 2（設計）     |
| 両方の問題 | Phase 1（要件定義） |

## 実行手順

### ステップ1: 要件対設計レビュー

Phase 1 の要件 ID ごとに、Phase 2 の設計要素が 1 つ以上紐付いているかを確認する。

### ステップ2: リスクレビュー

実装リスクと運用リスクを「発生条件」「影響」「回避策」「戻り先」の 4 列で整理する。

### ステップ3: Gate 判定

PASS / MINOR / MAJOR / CRITICAL の条件を明記し、指摘ごとに戻り先 Phase を決める。

## 統合テスト連携

| 観点     | 内容                                                                |
| -------- | ------------------------------------------------------------------- |
| 導線接続 | `navContract` と `GlobalNavStrip` / `MobileNavBar` の一致を確認する |
| 状態接続 | `isNavExpanded` と `responsiveMode` の結合条件を確認する            |
| 移行接続 | フィーチャーフラグの ON/OFF と AppDock 残存リスクを確認する         |
| 検証接続 | Phase 4 でテスト化する論点へレビュー指摘を引き渡す                  |

## 成果物

| 成果物                       | パス                                         | 内容                                 |
| ---------------------------- | -------------------------------------------- | ------------------------------------ |
| 設計レビュー結果             | `outputs/phase-3/design-review-result.md`    | PASS / MINOR / MAJOR / CRITICAL 判定 |
| リスク登録簿                 | `outputs/phase-3/risk-register.md`           | リスク一覧                           |
| 要件設計トレーサビリティ監査 | `outputs/phase-3/traceability-check.md`      | 対応漏れ監査                         |
| SubAgent 境界監査            | `outputs/phase-3/subagent-boundary-audit.md` | 成果物重複と漏れの確認               |

## 依存関係

| 区分         | 内容                                                                                    |
| ------------ | --------------------------------------------------------------------------------------- |
| 入力依存     | Phase 1 の要件成果物と Phase 2 の設計成果物が Gate 判定の根拠になる                     |
| 並列調整     | SubAgent-A が Gate 判定を主担当し、SubAgent-B/C/D の観点をレビュー論点として回収する    |
| 後続引き渡し | Phase 4 は PASS/MINOR の指摘事項を TC に変換し、MAJOR/CRITICAL はここで戻り先を確定する |

## 完了条件

- [x] 設計レビュー結果に Gate 判定が記録されている
- [x] 主要リスクに戻り先 Phase が設定されている
- [x] 要件と設計の未接続項目が 0 件である
- [x] SubAgent 境界監査で重複責務が 0 件である
- [x] 本Phase内の全タスクを100%実行完了

## Phase末端アクション【必須】

- Gate 判定と戻り先 Phase を成果物へ明記する
- `artifacts.json` に Phase 3 の成果物登録内容を反映する
- MINOR/MAJOR/CRITICAL の指摘は未分類のまま残さず、修正責務を明示する
- Phase 4 に渡すレビュー論点と差し戻し理由を `Phase実行記録` に残す

## 多角的チェック観点（AIが判断）

| 観点             | 適用判断                             | 仕様参照先                                          |
| ---------------- | ------------------------------------ | --------------------------------------------------- |
| アーキテクチャ   | Gate の主対象のため適用              | `aiworkflow-requirements: architecture-*.md`        |
| UI/UX            | ナビ導線レビューを含むため適用       | `aiworkflow-requirements: ui-ux-*.md`               |
| アクセシビリティ | キーボード導線レビューを含むため適用 | `aiworkflow-requirements: testing-accessibility.md` |
| テスタビリティ   | Phase 4 へ渡す観点を固定するため適用 | `aiworkflow-requirements: quality-requirements.md`  |

## サブタスク管理

1. 参照資料の確認
2. 設計レビュー実施
3. リスク登録
4. トレーサビリティ確認
5. Gate 判定

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 成果物を指定パスへ出力
- [x] 完了条件のチェックを更新

## Phase実行記録

### 実行タスク結果

| タスク               | 結果      | 備考                    |
| -------------------- | --------- | ----------------------- |
| 設計レビュー実施     | completed | outputs/phase-3/ を参照 |
| リスク登録           | completed | outputs/phase-3/ を参照 |
| トレーサビリティ確認 | completed | outputs/phase-3/ を参照 |
| SubAgent 境界監査    | completed | outputs/phase-3/ を参照 |

### 発見事項

- 良かった点: 設計レビュー、リスク、トレーサビリティ、SubAgent 境界監査の根拠を outputs/phase-3/ に集約できた。
- 問題点: Gate 結果は出力済みでも本文仕様書が pending のまま残っていた。
- 次Phaseへの引き継ぎ: Phase 4 は outputs/phase-3/ の Gate 結果とリスク登録簿を前提にテストを設計する。

## 次のPhase

Phase 4: テスト作成
