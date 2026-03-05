# Phase 1: 要件定義

## メタ情報

| 項目      | 値                                    |
| --------- | ------------------------------------- |
| Phase     | 1                                     |
| Phase名   | 要件定義                              |
| 機能名    | task-054-ui-00-4-organisms-components |
| タスクID  | TASK-UI-00-ORGANISMS                  |
| 作成日    | 2026-03-04                            |
| 前提Phase | なし                                  |
| 後続Phase | Phase 2                               |

## 目的

TASK-UI-00-ORGANISMS の対象範囲を固定し、CardGrid / MasterDetailLayout / SearchFilterList の要件と受け入れ基準を定義する。

## ⚠️ 既知Pitfall（事前適用）

| ID  | 内容                            | 回避策                                                           |
| --- | ------------------------------- | ---------------------------------------------------------------- |
| P31 | Zustand Store Hooks 無限ループ  | Store直参照を避け、props駆動 + useState/useMemo で局所管理する。 |
| P39 | happy-dom と userEvent の非互換 | コンポーネントテストは fireEvent を標準にする。                  |
| P40 | テスト実行ディレクトリ依存      | テストは必ず cd apps/desktop && pnpm vitest run で実行する。     |

## 実行タスク

- 要件抽出: タスク原本の Task 1 から Task 5 を機能要件と非機能要件へ分解する。
- 受け入れ基準定義: 検証可能な AC をコンポーネント単位で定義する。
- 依存整理: Atoms と Molecules の依存契約を確定する。
- SubAgent分割: 関心ごとの分離に基づき Atent Team 分担を確定する。

## 参照資料

| 参照資料          | パス                                                                                                                               | 内容            |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| タスク原本        | docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-054-ui-00-4-organisms-components.md | 正本仕様        |
| Design Foundation | docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-050-ui-00-ui-design-foundation.md   | UI基盤          |
| Atoms仕様         | docs/30-workflows/skill-import-agent-system/tasks/completed-task/00-2-atoms-components.md                                          | 依存先Atoms     |
| Molecules仕様     | docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-053-ui-00-3-molecules-components.md                          | 依存先Molecules |

## システム仕様（aiworkflow-requirements）

| 参照資料               | パス                                                                                      | このPhaseでの適用観点      |
| ---------------------- | ----------------------------------------------------------------------------------------- | -------------------------- |
| UIコンポーネント仕様   | .claude/skills/aiworkflow-requirements/references/ui-ux-components.md                     | Organisms責務の確認        |
| UI設計原則             | .claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md              | Apple HIG / WCAG基準       |
| デザインシステム       | .claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md                  | トークンとブレークポイント |
| UIアーキテクチャ       | .claude/skills/aiworkflow-requirements/references/arch-ui-components.md                   | Atomic Design境界          |
| 機能別UI仕様           | .claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md             | 機能横断の整合             |
| 状態管理仕様           | .claude/skills/aiworkflow-requirements/references/arch-state-management.md                | P31対策とprops駆動         |
| 実装パターン           | .claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md | P39/P40を含む実装基準      |
| コンポーネントテスト   | .claude/skills/aiworkflow-requirements/references/testing-component-patterns.md           | happy-dom + fireEvent方針  |
| テストフィクスチャ     | .claude/skills/aiworkflow-requirements/references/testing-fixtures.md                     | テストデータ再利用         |
| アクセシビリティテスト | .claude/skills/aiworkflow-requirements/references/testing-accessibility.md                | role/aria/keyboard検証     |
| 品質要件               | .claude/skills/aiworkflow-requirements/references/quality-requirements.md                 | TDDと品質ゲート            |

## 実行手順

1. タスク原本を読み、実装対象を3コンポーネントと共通仕様へ分割する。
2. ACを UI / a11y / responsive / theme / test の軸で定義する。
3. Phase 2 へ引き継ぐ依存契約と非対象範囲を明記する。

## 統合テスト連携

- Phase 4 で実装する Red テストの判定軸を要件定義へ反映する。
- 統合テスト実行コマンドを `cd apps/desktop && pnpm vitest run` に固定する。

## 多角的チェック観点（AIが判断）

| 観点               | 適用基準                               | 仕様参照先                                  |
| ------------------ | -------------------------------------- | ------------------------------------------- |
| セキュリティ       | 認証・認可・入力検証が関係する場合     | aiworkflow-requirements: security-\*.md     |
| UI/UX              | フロントエンド表示・操作が関係する場合 | aiworkflow-requirements: ui-ux-\*.md        |
| アーキテクチャ     | 責務分離や依存方向が関係する場合       | aiworkflow-requirements: architecture-\*.md |
| API設計            | IPC/API契約変更が関係する場合          | aiworkflow-requirements: api-\*.md          |
| データ整合性       | 永続化や状態同期が関係する場合         | aiworkflow-requirements: database-\*.md     |
| エラーハンドリング | 例外系設計が関係する場合               | aiworkflow-requirements: error-handling.md  |
| パフォーマンス     | 性能要件が関係する場合                 | aiworkflow-requirements: architecture-\*.md |
| アクセシビリティ   | キーボード/ARIA/WCAGが関係する場合     | aiworkflow-requirements: ui-ux-\*.md        |

## Electronデスクトップアプリ観点（本プロジェクト固有）

| 層                         | 適用判断                        | 仕様参照先                                         |
| -------------------------- | ------------------------------- | -------------------------------------------------- |
| フロントエンド（Renderer） | React UI実装を含む場合          | aiworkflow-requirements: ui-ux-\*.md               |
| バックエンド（Main）       | サービス/ロジック実装を含む場合 | aiworkflow-requirements: architecture-\*.md        |
| IPC通信                    | Main-Renderer連携を含む場合     | aiworkflow-requirements: api-_.md, interfaces-_.md |
| Preload/セキュリティ       | API公開境界を含む場合           | aiworkflow-requirements: security-api-electron.md  |
| ローカルストレージ         | 永続化変更を含む場合            | aiworkflow-requirements: database-\*.md            |

## Atent Team分担

| SubAgent          | 関心ごと       | 担当成果物                                 |
| ----------------- | -------------- | ------------------------------------------ |
| SubAgent-REQ-UI   | UI要件分解     | outputs/phase-1/requirements-definition.md |
| SubAgent-REQ-A11Y | a11y要件定義   | outputs/phase-1/acceptance-criteria.md     |
| SubAgent-REQ-TEST | テスト要件定義 | outputs/phase-1/scope-definition.md        |

## 成果物

| 成果物       | パス                                       | 内容         |
| ------------ | ------------------------------------------ | ------------ |
| 要件定義書   | outputs/phase-1/requirements-definition.md | FR/NFR一覧   |
| 受け入れ基準 | outputs/phase-1/acceptance-criteria.md     | AC一覧       |
| スコープ定義 | outputs/phase-1/scope-definition.md        | 対象と非対象 |

## 完了条件

- [ ] 3コンポーネントの要件IDが定義されている。
- [ ] 受け入れ基準が検証可能な記述で定義されている。
- [ ] 依存するAtoms/Molecules契約が記録されている。
- [ ] Atent Team の分担表が作成されている。
- [ ] 本Phase内の全タスクを100%実行完了。

## サブタスク管理

1. 参照資料確認を完了してから実行を開始する。
2. SubAgent分担に沿って並列作業と直列作業を分離する。
3. 統合テスト連携の結果を成果物へ反映する。
4. 成果物パスの存在確認を行う。
5. 完了条件を全項目確認する。

## タスク100%実行確認【必須】

- [ ] 実行タスクの全項目を完了した。
- [ ] 完了条件の全チェック項目を確認した。
- [ ] 次Phaseの引き継ぎ事項を記録した。

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了。
- [ ] 成果物テーブルの全パスを確認。
- [ ] 依存Phaseとの整合を確認。

## 依存関係

- 前提: なし
- 後続: Phase 2

### 依存Phase成果物

- Phase依存なし

## Phase実行記録（全Phase共通）

- 実行タスクごとの完了結果
- 発見事項と対応方針
- 次Phaseへの引き継ぎ事項

## 次のPhase

- Phase 2: 設計
