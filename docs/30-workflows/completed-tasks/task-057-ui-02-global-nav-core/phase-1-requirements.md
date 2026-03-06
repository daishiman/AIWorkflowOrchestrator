# Phase 1: 要件定義

## メタ情報

| 項目         | 内容                             |
| ------------ | -------------------------------- |
| Phase        | 1                                |
| Phase名      | 要件定義                         |
| 前提Phase    | なし                             |
| 後続Phase    | Phase 2                          |
| ステータス   | completed                        |
| 作成日       | 2026-03-06                       |
| 機能名       | task-057-ui-02-global-nav-core   |
| 担当SubAgent | SubAgent-A（要件定義・仕様同期） |

## 目的

`AppDock` から `GlobalNavStrip` へ移行する要件を固定し、Phase 2 以降で UI 導線、レイアウト、アクセシビリティ、ロールバック条件の解釈差分を出さない状態を作る。

## 背景

親タスクは `AppDock` の段階的廃止と 9 項目ナビゲーションへの拡張を同時に要求している。要件段階で `task-056` との責務境界、3 ステップ移行、ロールバック条件を固定しないと、設計・テスト・文書更新で解釈が分岐する。

## 実行タスク

- 要件抽出: 親タスク仕様から機能要件、非機能要件、移行要件、依存要件を抽出する。
- 受け入れ基準定義: 9ナビ項目、3セクション、3表示モード、キーボード操作、ロールバック条件の判定基準を定義する。
- スコープ境界定義: `task-056-ui-01-store-ipc-architecture` が担う ViewType 拡張範囲と、本タスクが担う Global Navigation 範囲を分離する。
- 関心ごと分離定義: SubAgent-A〜D が扱う成果物境界を文書化する。

## 参照資料

| 参照資料         | パス                                                                                                                          | 内容                                    |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| 親タスク仕様     | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-057-ui-02-global-nav-core.md` | 正本要件                                |
| 依存タスク仕様   | `docs/30-workflows/completed-tasks/task-056-ui-01-store-ipc-architecture/index.md`                                            | ViewType と navContract の前提          |
| 現行ナビ実装     | `apps/desktop/src/renderer/components/organisms/AppDock/index.tsx`                                                            | 現状 UI 契約                            |
| ナビ契約正本     | `apps/desktop/src/renderer/navigation/navContract.ts`                                                                         | 9項目、ショートカット、編集要素除外条件 |
| 現行レイアウト   | `apps/desktop/src/renderer/App.tsx`                                                                                           | AppDock 直結レイアウト                  |
| UI状態 Slice     | `apps/desktop/src/renderer/store/slices/uiSlice.ts`                                                                           | responsiveMode と UI 状態               |
| Navigation Slice | `apps/desktop/src/renderer/store/slices/navigationSlice.ts`                                                                   | currentView と viewHistory              |

## システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                           | 内容                                           |
| ------------------ | ------------------------------------------------------------------------------ | ---------------------------------------------- |
| ナビゲーション仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`        | 9項目ナビ、ショートカット、契約正本ルール      |
| デザインシステム   | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`     | 幅、間隔、コントラスト、ブレークポイント       |
| UI設計原則         | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md` | Apple HIG、WCAG、視認性、操作導線              |
| 状態管理仕様       | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`   | P31 対策、個別セレクタ、Slice 境界             |
| アーキテクチャ仕様 | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md`   | Renderer の責務分離、Hook とコンポーネント境界 |
| ディレクトリ構成   | `.claude/skills/aiworkflow-requirements/references/directory-structure.md`     | 配置パターンと責務境界                         |
| エラーハンドリング | `.claude/skills/aiworkflow-requirements/references/error-handling.md`          | 無効入力時の安全動作、フォールバック           |
| テスト品質         | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`    | カバレッジ基準、TDD 前提                       |

## 実行手順

### ステップ1: 要件分類

親タスク仕様を「UI 表示」「レイアウト」「状態管理」「キーボード」「移行」「検証」の 6 区分へ整理する。

### ステップ2: 受け入れ基準定義

各要件に対して観測可能な完了条件を割り当て、UI 動作・テスト・コマンド結果のどれで判定するかを明記する。

### ステップ3: 境界確定

本タスクで実施する変更、後続タスクへ委譲する変更、対象外の変更を 3 列で定義する。

### ステップ4: SubAgent 分担固定

SubAgent-A〜D の担当成果物と依存順序を表にして、Phase 2 以降の担当境界を固定する。

## 統合テスト連携

| 観点     | 内容                                                                                  |
| -------- | ------------------------------------------------------------------------------------- |
| UI接続   | `GlobalNavStrip` / `MobileNavBar` / `AppLayout` の接続面を明文化する                  |
| 状態接続 | `currentView` / `viewHistory` / `responsiveMode` / `isNavExpanded` を統合観点に含める |
| 入力接続 | `Cmd+1`〜`Cmd+8` / `Cmd+,` / `Cmd+[` のトリガー条件を固定する                         |
| 依存接続 | TASK-UI-03〜09 が本タスクの導線完成を前提にする点を記録する                           |

## 成果物

| 成果物             | パス                                           | 内容                           |
| ------------------ | ---------------------------------------------- | ------------------------------ |
| 要件定義書         | `outputs/phase-1/requirements-definition.md`   | FR/NFR 一覧                    |
| 受け入れ基準       | `outputs/phase-1/acceptance-criteria.md`       | 検証可能な判定条件             |
| スコープ定義       | `outputs/phase-1/scope-definition.md`          | 実施範囲、委譲範囲、対象外範囲 |
| 移行境界マトリクス | `outputs/phase-1/migration-boundary-matrix.md` | Step 1〜3 と依存タスクの境界   |
| SubAgent 分担表    | `outputs/phase-1/subagent-boundary-map.md`     | Concern ごとの責務分離         |

## 依存関係

| 区分         | 内容                                                                                                   |
| ------------ | ------------------------------------------------------------------------------------------------------ |
| 入力依存     | 親タスク仕様、`task-056` の完了仕様、現行 `AppDock` / `navContract` / store 実装を前提に要件を定義する |
| 並列調整     | SubAgent-A が要件と正本仕様対応を固定し、SubAgent-B〜D はこの境界を破らない                            |
| 後続引き渡し | Phase 2 は本Phaseの要件 ID、受け入れ基準、境界定義を唯一の入力として設計を作成する                     |

## 完了条件

- [x] 9ナビ項目、3セクション、3表示モードの要件が ID 付きで記録されている
- [x] ロールバック条件とフィーチャーフラグ条件が分離して記録されている
- [x] `task-056` 側の責務と `task-057` 側の責務が衝突なく定義されている
- [x] SubAgent-A〜D の成果物境界が表形式で記録されている
- [x] 本Phase内の全タスクを100%実行完了

## Phase末端アクション【必須】

- `outputs/phase-1/` 配下の必須成果物名と要件 ID の対応を確認する
- `artifacts.json` に Phase 1 の成果物登録内容を反映する
- 境界未確定事項がある場合は Phase 2 へ渡さず、要件として確定するか対象外へ振り分ける
- 次Phaseへ渡す入力を `Phase実行記録` に明記する

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                                 | 仕様参照先                                   |
| ------------------ | ---------------------------------------- | -------------------------------------------- |
| UI/UX              | ナビゲーション基盤を扱うため適用         | `aiworkflow-requirements: ui-ux-*.md`        |
| アーキテクチャ     | レイアウト分離と Hook 境界を扱うため適用 | `aiworkflow-requirements: architecture-*.md` |
| アクセシビリティ   | キーボード導線と aria 属性を扱うため適用 | `aiworkflow-requirements: ui-ux-*.md`        |
| エラーハンドリング | 無効 ViewType と入力条件を扱うため適用   | `aiworkflow-requirements: error-handling.md` |

## サブタスク管理

1. 参照資料の確認
2. 要件抽出
3. 受け入れ基準定義
4. スコープ境界定義
5. SubAgent 分担固定

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 成果物を指定パスへ出力
- [x] 完了条件のチェックを更新

## Phase実行記録

### 実行タスク結果

| タスク           | 結果      | 備考                    |
| ---------------- | --------- | ----------------------- |
| 要件抽出         | completed | outputs/phase-1/ を参照 |
| 受け入れ基準定義 | completed | outputs/phase-1/ を参照 |
| スコープ境界定義 | completed | outputs/phase-1/ を参照 |
| 関心ごと分離定義 | completed | outputs/phase-1/ を参照 |

### 発見事項

- 良かった点: 要件ID、受け入れ基準、SubAgent 境界を outputs/phase-1/ に固定できた。
- 問題点: 初回完了時に本文仕様書の completed 同期が漏れ、artifacts/index と表示がずれていた。
- 次Phaseへの引き継ぎ: Phase 2 は outputs/phase-1/ の要件定義と境界表を唯一入力として設計を進める。

## 次のPhase

Phase 2: 設計
