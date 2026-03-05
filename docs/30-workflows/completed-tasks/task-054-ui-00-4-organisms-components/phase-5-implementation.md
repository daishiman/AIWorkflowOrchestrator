# Phase 5: 実装

## メタ情報

| 項目      | 値                                    |
| --------- | ------------------------------------- |
| Phase     | 5                                     |
| Phase名   | 実装                                  |
| 機能名    | task-054-ui-00-4-organisms-components |
| タスクID  | TASK-UI-00-ORGANISMS                  |
| 作成日    | 2026-03-04                            |
| 前提Phase | Phase 4                               |
| 後続Phase | Phase 6                               |

## 目的

Red テストを満たす最小実装を行い、Organisms 3コンポーネントを Green 状態へ進める。

## ⚠️ 既知Pitfall（事前適用）

| ID  | 内容                            | 回避策                                                           |
| --- | ------------------------------- | ---------------------------------------------------------------- |
| P31 | Zustand Store Hooks 無限ループ  | Store直参照を避け、props駆動 + useState/useMemo で局所管理する。 |
| P39 | happy-dom と userEvent の非互換 | コンポーネントテストは fireEvent を標準にする。                  |
| P40 | テスト実行ディレクトリ依存      | テストは必ず cd apps/desktop && pnpm vitest run で実行する。     |

## 実行タスク

- CardGrid実装: ジェネリクス描画、空状態、スケルトン、グリッド操作を実装する。
- MasterDetailLayout実装: 分割レイアウトと overlay 切替を実装する。
- SearchFilterList実装: 検索、AND条件、ソート、viewMode切替を実装する。
- 依存統合: Atoms/Molecules 依存と export を統合する。

## 参照資料

| 参照資料                   | パス                                                                                                      | 内容           |
| -------------------------- | --------------------------------------------------------------------------------------------------------- | -------------- |
| Phase 4 Redテスト計画      | outputs/phase-4/red-test-plan.md                                                                          | 依存成果物     |
| Atoms仕様                  | docs/30-workflows/skill-import-agent-system/tasks/completed-task/00-2-atoms-components.md                 | 依存仕様       |
| Molecules仕様              | docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-053-ui-00-3-molecules-components.md | 依存仕様       |
| Redテスト結果              | `outputs/phase-4/red-test-report.md`                                                                      | Phase 4 成果物 |
| テスト基盤メモ             | `outputs/phase-4/test-infra-notes.md`                                                                     | Phase 4 成果物 |
| CardGrid Redメモ           | `outputs/phase-4/cardgrid-red-tests.md`                                                                   | Phase 4 成果物 |
| MasterDetailLayout Redメモ | `outputs/phase-4/masterdetail-red-tests.md`                                                               | Phase 4 成果物 |
| SearchFilterList Redメモ   | `outputs/phase-4/searchfilter-red-tests.md`                                                               | Phase 4 成果物 |

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

1. Phase 4 の Red テストを順番に Green へ変える。
2. コンポーネント単位で実装とテストを同時更新する。
3. 全体テストを実行して Green を確認する。

## 統合テスト連携

- Green確認はコンポーネント単位と全体回帰の2段階で実施する。
- 結果は `outputs/phase-5/green-test-report.md` に記録する。

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

| SubAgent                  | 関心ごと               | 担当成果物                                                                  |
| ------------------------- | ---------------------- | --------------------------------------------------------------------------- |
| SubAgent-IMPL-CardGrid    | CardGrid実装           | apps/desktop/src/renderer/components/organisms/CardGrid/index.tsx           |
| SubAgent-IMPL-Layout      | MasterDetailLayout実装 | apps/desktop/src/renderer/components/organisms/MasterDetailLayout/index.tsx |
| SubAgent-IMPL-Search      | SearchFilterList実装   | apps/desktop/src/renderer/components/organisms/SearchFilterList/index.tsx   |
| SubAgent-IMPL-Integration | 依存統合               | outputs/phase-5/integration-notes.md                                        |

## 成果物

| 成果物          | パス                                   | 内容         |
| --------------- | -------------------------------------- | ------------ |
| 実装計画ログ    | outputs/phase-5/implementation-plan.md | 実装順序     |
| Greenテスト結果 | outputs/phase-5/green-test-report.md   | Green証跡    |
| 統合メモ        | outputs/phase-5/integration-notes.md   | 依存統合結果 |

## 完了条件

- [ ] 3コンポーネントが Red テストを通過している。
- [ ] role / aria / keyboard の必須要件が満たされている。
- [ ] props駆動の設計が維持されている。
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

- 前提: Phase 4
- 後続: Phase 6

### 依存Phase成果物

- Phase 4: `outputs/phase-4/`

## TDD検証（Phase 4, 5, 8 の場合）

- TDD状態: Green
- テスト実行コマンド: `cd apps/desktop && pnpm vitest run`
- 変更単位でテストを実行し、最後に全体回帰を実行する。

## Phase実行記録（全Phase共通）

- 実行タスクごとの完了結果
- 発見事項と対応方針
- 次Phaseへの引き継ぎ事項

## 次のPhase

- Phase 6: テスト拡充
