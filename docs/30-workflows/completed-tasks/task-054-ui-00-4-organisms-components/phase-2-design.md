# Phase 2: 設計

## メタ情報

| 項目      | 値                                    |
| --------- | ------------------------------------- |
| Phase     | 2                                     |
| Phase名   | 設計                                  |
| 機能名    | task-054-ui-00-4-organisms-components |
| タスクID  | TASK-UI-00-ORGANISMS                  |
| 作成日    | 2026-03-04                            |
| 前提Phase | Phase 1                               |
| 後続Phase | Phase 3                               |

## 目的

Phase 1 の要件を型定義、責務境界、レスポンシブ仕様、a11y仕様へ変換し、実装可能な設計仕様を確定する。

## ⚠️ 既知Pitfall（事前適用）

| ID  | 内容                            | 回避策                                                           |
| --- | ------------------------------- | ---------------------------------------------------------------- |
| P31 | Zustand Store Hooks 無限ループ  | Store直参照を避け、props駆動 + useState/useMemo で局所管理する。 |
| P39 | happy-dom と userEvent の非互換 | コンポーネントテストは fireEvent を標準にする。                  |
| P40 | テスト実行ディレクトリ依存      | テストは必ず cd apps/desktop && pnpm vitest run で実行する。     |

## 実行タスク

- コンポーネント設計: CardGrid / MasterDetailLayout / SearchFilterList の責務を分離する。
- 型契約設計: props の必須項目、任意項目、デフォルト値を定義する。
- 状態管理設計: P31対策を満たす props駆動 と局所状態方針を定義する。
- テスト対応設計: Phase 4 で Red テストを作るための観点を設計に紐付ける。
- SubAgent分割: 実装単位と検証単位を分けて担当境界を固定する。

## 参照資料

| 参照資料             | パス                                                                    | 内容     |
| -------------------- | ----------------------------------------------------------------------- | -------- |
| Phase 1 要件定義     | outputs/phase-1/requirements-definition.md                              | 要件入力 |
| Phase 1 受け入れ基準 | outputs/phase-1/acceptance-criteria.md                                  | 検証条件 |
| Phase 1 スコープ定義 | outputs/phase-1/scope-definition.md                                     | 範囲定義 |
| 設計テンプレート     | .claude/skills/task-specification-creator/references/phase-templates.md | 必須構造 |

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

1. インターフェース定義を3コンポーネント分作成する。
2. レスポンシブ仕様を desktop / tablet / mobile で確定する。
3. a11y と keyboard 操作を要件IDに紐付ける。

## 統合テスト連携

- Phase 4 のテストIDと設計要素を 1:1 で対応付ける。
- matchMedia モック前提を設計書へ記載する。

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

| SubAgent                 | 関心ごと               | 担当成果物                          |
| ------------------------ | ---------------------- | ----------------------------------- |
| SubAgent-DESIGN-CardGrid | CardGrid設計           | outputs/phase-2/component-design.md |
| SubAgent-DESIGN-Layout   | MasterDetailLayout設計 | outputs/phase-2/component-design.md |
| SubAgent-DESIGN-Search   | SearchFilterList設計   | outputs/phase-2/component-design.md |
| SubAgent-DESIGN-State    | 状態管理設計           | outputs/phase-2/state-design.md     |

## 成果物

| 成果物               | パス                                   | 内容             |
| -------------------- | -------------------------------------- | ---------------- |
| コンポーネント設計書 | outputs/phase-2/component-design.md    | 責務と依存       |
| 型定義仕様           | outputs/phase-2/interface-contracts.md | props契約        |
| 状態管理設計         | outputs/phase-2/state-design.md        | P31対策          |
| テスト設計マップ     | outputs/phase-2/test-design-map.md     | 設計とテスト対応 |

## 完了条件

- [ ] 3コンポーネントのインターフェースが確定している。
- [ ] レスポンシブ仕様が3ブレークポイントで定義されている。
- [ ] a11y要件が設計へ反映されている。
- [ ] P31対策が設計へ反映されている。
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

- 前提: Phase 1
- 後続: Phase 3

### 依存Phase成果物

- Phase 1: `outputs/phase-1/`

## Phase実行記録（全Phase共通）

- 実行タスクごとの完了結果
- 発見事項と対応方針
- 次Phaseへの引き継ぎ事項

## 次のPhase

- Phase 3: 設計レビューゲート
