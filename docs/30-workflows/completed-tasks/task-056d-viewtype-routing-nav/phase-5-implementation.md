# Phase 5: 実装

## メタ情報

| 項目         | 内容                           |
| ------------ | ------------------------------ |
| Phase        | 5                              |
| Phase名      | 実装                           |
| 前提Phase    | Phase 4                        |
| 後続Phase    | Phase 6                        |
| ステータス   | completed                      |
| 作成日       | 2026-03-05                     |
| 機能名       | task-056d-viewtype-routing-nav |
| 担当SubAgent | SubAgent-B                     |

## 目的

実装時に迷いが出ないよう、ViewType拡張、`renderView` 分岐反映、AppDockナビ整合、`NAV_SECTIONS` 同期の実装順序と編集対象を固定する。

## 実行タスク

- 実装順序定義: 変更対象ファイルの適用順を定義する。
- 契約反映定義: ViewTypeとナビ契約をコードへ反映する手順を定義する。
- 成果物定義: ルーティングマップとショートカット契約文書を出力する。

## 参照資料

| 参照資料         | パス                                                                                        | 内容             |
| ---------------- | ------------------------------------------------------------------------------------------- | ---------------- |
| Phase 4仕様      | `phase-4-test-creation.md`                                                                  | テスト入力       |
| テストケース     | `outputs/phase-4/test-cases.md`                                                             | 実装要件         |
| 既存タスク定義   | `../task-056d-viewtype-routing-nav.md`                                                      | 変更対象ファイル |
| ナビ正本         | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                     | ナビ契約         |
| 状態管理正本     | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | 型境界           |
| 実装パターン正本 | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 型網羅運用       |

## システム仕様（aiworkflow-requirements）

| 参照資料         | パス                                                                                        | 内容           |
| ---------------- | ------------------------------------------------------------------------------------------- | -------------- |
| UIナビゲーション | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                     | navItems正本   |
| 状態管理         | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | ViewType責務   |
| 実装パターン     | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 分岐網羅       |
| エラー仕様       | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | 失敗時出力方針 |

## 実行手順

### ステップ1: 編集順序固定

`store/types.ts` → `App.tsx` → `AppDock/index.tsx` の順で変更する計画を固定する。

### ステップ2: 契約反映定義

型定義、分岐、ナビ項目、ショートカットの更新内容を一括表に整理する。

### ステップ3: 実装成果物定義

実装結果を記録する成果物ファイルの章構成を定義する。

## 統合テスト連携

| 観点     | 内容                                |
| -------- | ----------------------------------- |
| 実装連携 | TC-IDごとに対象ファイルを割り当てる |
| 安全連携 | 分岐漏れ検出を型検証で補強する      |
| 後続連携 | Phase 6で回帰テストへ接続する       |

## 成果物

| 成果物             | パス                                       | 内容               |
| ------------------ | ------------------------------------------ | ------------------ |
| 実装計画書         | `outputs/phase-5/implementation-plan.md`   | 編集順序           |
| ルーティングマップ | `outputs/phase-5/viewtype-routing-map.md`  | 分岐対応表         |
| ナビ契約書         | `outputs/phase-5/nav-shortcut-contract.md` | ショートカット契約 |

## 完了条件

- [x] 変更対象ファイルの編集順序が固定されている
- [x] ViewType/分岐/ナビの反映項目が表で整理されている
- [x] 成果物構成がPhase 6以降と連携できる形で定義されている
- [x] 実装対象外項目が明記されている
- [x] 本Phase内の全タスクを100%実行完了

## 次のPhase

Phase 6: テスト拡充

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                 | 仕様参照先                                         |
| ------------------ | ------------------------ | -------------------------------------------------- |
| アーキテクチャ     | 変更境界固定のため適用   | `aiworkflow-requirements: architecture-*.md`       |
| UI/UX              | ナビ導線同期のため適用   | `aiworkflow-requirements: ui-ux-*.md`              |
| テスタビリティ     | TC-ID連携のため適用      | `aiworkflow-requirements: quality-requirements.md` |
| エラーハンドリング | 失敗時挙動定義のため適用 | `aiworkflow-requirements: error-handling.md`       |

## サブタスク管理

1. 参照資料の確認
2. 編集順序定義
3. 契約反映定義
4. 成果物定義
5. 完了条件の確認

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 成果物を指定パスに出力
- [x] 完了条件のチェックを更新
