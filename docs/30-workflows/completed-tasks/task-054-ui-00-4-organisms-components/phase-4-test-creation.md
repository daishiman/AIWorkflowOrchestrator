# Phase 4: テスト作成

## メタ情報

| 項目      | 値                                    |
| --------- | ------------------------------------- |
| Phase     | 4                                     |
| Phase名   | テスト作成                            |
| 機能名    | task-054-ui-00-4-organisms-components |
| タスクID  | TASK-UI-00-ORGANISMS                  |
| 作成日    | 2026-03-04                            |
| 前提Phase | Phase 3                               |
| 後続Phase | Phase 5                               |

## 目的

実装前に Red テストを作成し、仕様の期待挙動を自動検証できる状態にする。

## ⚠️ 既知Pitfall（事前適用）

| ID  | 内容                            | 回避策                                                           |
| --- | ------------------------------- | ---------------------------------------------------------------- |
| P31 | Zustand Store Hooks 無限ループ  | Store直参照を避け、props駆動 + useState/useMemo で局所管理する。 |
| P39 | happy-dom と userEvent の非互換 | コンポーネントテストは fireEvent を標準にする。                  |
| P40 | テスト実行ディレクトリ依存      | テストは必ず cd apps/desktop && pnpm vitest run で実行する。     |

## 実行タスク

- CardGrid Red作成: 描画、空状態、ローディング、キーボード操作の失敗テストを作成する。
- MasterDetailLayout Red作成: レイアウト切替、overlay、ARIA の失敗テストを作成する。
- SearchFilterList Red作成: 検索、AND条件、ソート、aria-live の失敗テストを作成する。
- テスト基盤整備: matchMedia モックとテーマ横断ヘルパーを整備する。

## 参照資料

| 参照資料                 | パス                                         | 内容            |
| ------------------------ | -------------------------------------------- | --------------- |
| Phase 1 受け入れ基準     | outputs/phase-1/acceptance-criteria.md       | 依存成果物      |
| Phase 2 テスト設計マップ | outputs/phase-2/test-design-map.md           | 依存成果物      |
| Phase 3 レビュー結果     | outputs/phase-3/design-review-report.md      | 依存成果物      |
| 既知の落とし穴           | .claude/rules/06-known-pitfalls.md           | P31/P39/P40確認 |
| 要件定義書               | `outputs/phase-1/requirements-definition.md` | Phase 1 成果物  |
| スコープ定義             | `outputs/phase-1/scope-definition.md`        | Phase 1 成果物  |
| コンポーネント設計書     | `outputs/phase-2/component-design.md`        | Phase 2 成果物  |
| 型定義仕様               | `outputs/phase-2/interface-contracts.md`     | Phase 2 成果物  |
| 状態管理設計             | `outputs/phase-2/state-design.md`            | Phase 2 成果物  |
| レビューゲート判定       | `outputs/phase-3/review-gate-decision.md`    | Phase 3 成果物  |

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

1. Phase 2 のテスト設計マップからテストケースを作成する。
2. fireEvent を標準にして userEvent を使わない。
3. 失敗結果を Red レポートへ記録する。

## 統合テスト連携

- Red 失敗結果を `cd apps/desktop && pnpm vitest run` で確認する。
- 失敗一覧を `outputs/phase-4/red-test-report.md` に保存する。

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

| SubAgent               | 関心ごと               | 担当成果物                                |
| ---------------------- | ---------------------- | ----------------------------------------- |
| SubAgent-TEST-CardGrid | CardGrid Red           | outputs/phase-4/cardgrid-red-tests.md     |
| SubAgent-TEST-Layout   | MasterDetailLayout Red | outputs/phase-4/masterdetail-red-tests.md |
| SubAgent-TEST-Search   | SearchFilterList Red   | outputs/phase-4/searchfilter-red-tests.md |
| SubAgent-TEST-Infra    | テスト基盤             | outputs/phase-4/test-infra-notes.md       |

## 成果物

| 成果物         | パス                                | 内容           |
| -------------- | ----------------------------------- | -------------- |
| Redテスト計画  | outputs/phase-4/red-test-plan.md    | Red ケース定義 |
| Redテスト結果  | outputs/phase-4/red-test-report.md  | 失敗証跡       |
| テスト基盤メモ | outputs/phase-4/test-infra-notes.md | モック方針     |

## 完了条件

- [ ] 3コンポーネントの Red テストが定義されている。
- [ ] a11y と responsive を含む Red ケースが作成されている。
- [ ] P39/P40対策の実行条件が記録されている。
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

- 前提: Phase 3
- 後続: Phase 5

### 依存Phase成果物

- Phase 1: `outputs/phase-1/`
- Phase 2: `outputs/phase-2/`
- Phase 3: `outputs/phase-3/`

## TDD検証（Phase 4, 5, 8 の場合）

- TDD状態: Red
- テスト実行コマンド: `cd apps/desktop && pnpm vitest run`
- 変更単位でテストを実行し、最後に全体回帰を実行する。

## Phase実行記録（全Phase共通）

- 実行タスクごとの完了結果
- 発見事項と対応方針
- 次Phaseへの引き継ぎ事項

## 次のPhase

- Phase 5: 実装
