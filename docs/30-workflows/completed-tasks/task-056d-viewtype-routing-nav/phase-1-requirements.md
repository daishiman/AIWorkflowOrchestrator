# Phase 1: 要件定義

## メタ情報

| 項目         | 内容                           |
| ------------ | ------------------------------ |
| Phase        | 1                              |
| Phase名      | 要件定義                       |
| 前提Phase    | なし                           |
| 後続Phase    | Phase 2                        |
| ステータス   | completed                      |
| 作成日       | 2026-03-05                     |
| 機能名       | task-056d-viewtype-routing-nav |
| 担当SubAgent | SubAgent-A                     |

## 目的

ViewType 拡張、`renderView()` 分岐、AppDock ナビ導線、`TASK-UI-02` 側 `NAV_SECTIONS` の整合条件を検証可能な要件として固定する。

## 実行タスク

- 要件抽出: ViewTypeに追加する値と画面遷移要件を列挙する。
- 受け入れ基準定義: 分岐網羅、ショートカット整合、重複型削除の判定条件を定義する。
- スコープ定義: 本タスク対象と `TASK-UI-02` 以降へ委譲する対象を切り分ける。

## 参照資料

| 参照資料           | パス                                                                                        | 内容                          |
| ------------------ | ------------------------------------------------------------------------------------------- | ----------------------------- |
| 親タスク仕様       | `../task-056d-viewtype-routing-nav.md`                                                      | 依存関係と成果物定義          |
| A基準仕様          | `../task-056-ui-01-store-ipc-architecture.md`                                               | ViewType拡張の前提            |
| 状態管理正本       | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | ViewType責務とP31境界         |
| ナビ正本           | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                     | AppDock 9項目とショートカット |
| アーキテクチャ正本 | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                | Renderer責務、SoC             |
| 実装パターン正本   | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 網羅性と型契約運用            |

## システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                         | 内容                          |
| ------------------ | ---------------------------------------------------------------------------- | ----------------------------- |
| 状態管理           | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` | ViewType拡張は型同期で運用    |
| UIナビゲーション   | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`      | AppDockの項目とショートカット |
| エラーハンドリング | `.claude/skills/aiworkflow-requirements/references/error-handling.md`        | 失敗契約と分類                |
| セキュリティ       | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` | ナビトリガー連携時の境界      |

## 実行手順

### ステップ1: 要件分類

機能要件と非機能要件を分離し、各要件にIDを付与する。

### ステップ2: 受け入れ基準定義

各要件に対して観測可能な判定条件を設定する。

### ステップ3: スコープ確定

実装範囲、次タスクへ委譲する範囲、対象外範囲を明示する。

## 統合テスト連携

| 観点         | 内容                                                      |
| ------------ | --------------------------------------------------------- |
| API/状態接続 | `store/types.ts` と `App.tsx` の契約接続を定義            |
| UI接続       | AppDockのナビ操作とビュー遷移を対応付ける                 |
| 依存接続     | `TASK-UI-02` の `NAV_SECTIONS` を後続受け入れ先として固定 |

## 成果物

| 成果物       | パス                                         | 内容         |
| ------------ | -------------------------------------------- | ------------ |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | FR/NFR定義   |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | AC一覧       |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 対象範囲定義 |

## 完了条件

- [x] ViewType追加対象が要件ID付きで定義されている
- [x] 分岐網羅の受け入れ基準が数値で定義されている
- [x] ナビ整合の判定条件が `TASK-UI-02` 参照で定義されている
- [x] スコープ外項目が明示されている
- [x] 本Phase内の全タスクを100%実行完了

## 次のPhase

Phase 2: 設計

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                       | 仕様参照先                                   |
| ------------------ | ------------------------------ | -------------------------------------------- |
| セキュリティ       | ナビ連携境界を定義するため適用 | `aiworkflow-requirements: security-*.md`     |
| UI/UX              | AppDock導線を扱うため適用      | `aiworkflow-requirements: ui-ux-*.md`        |
| アーキテクチャ     | Renderer責務を固定するため適用 | `aiworkflow-requirements: architecture-*.md` |
| エラーハンドリング | 失敗時契約を定義するため適用   | `aiworkflow-requirements: error-handling.md` |

## サブタスク管理

1. 参照資料の確認
2. 要件抽出
3. 受け入れ基準定義
4. スコープ定義
5. 完了条件の確認

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 成果物を指定パスに出力
- [x] 完了条件のチェックを更新
