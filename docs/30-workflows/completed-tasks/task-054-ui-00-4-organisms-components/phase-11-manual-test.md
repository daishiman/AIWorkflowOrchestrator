# Phase 11: 手動テスト検証

## メタ情報

| 項目      | 値                                    |
| --------- | ------------------------------------- |
| Phase     | 11                                    |
| Phase名   | 手動テスト検証                        |
| 機能名    | task-054-ui-00-4-organisms-components |
| タスクID  | TASK-UI-00-ORGANISMS                  |
| 作成日    | 2026-03-04                            |
| 前提Phase | Phase 10                              |
| 後続Phase | Phase 12                              |

## 目的

実機操作で UI / a11y / responsive の挙動を確認し、文書化へ渡す証跡を整備する。

## ⚠️ 既知Pitfall（事前適用）

| ID  | 内容                            | 回避策                                                           |
| --- | ------------------------------- | ---------------------------------------------------------------- |
| P31 | Zustand Store Hooks 無限ループ  | Store直参照を避け、props駆動 + useState/useMemo で局所管理する。 |
| P39 | happy-dom と userEvent の非互換 | コンポーネントテストは fireEvent を標準にする。                  |
| P40 | テスト実行ディレクトリ依存      | テストは必ず cd apps/desktop && pnpm vitest run で実行する。     |

## 実行タスク

- 手動テスト実施: CardGrid / MasterDetailLayout / SearchFilterList のケースを実行する。
- 証跡取得: 主要ケースのスクリーンショットを取得する。
- 課題記録: 再現手順、期待値、実測値を記録する。
- 合否判定: ケース単位で PASS / FAIL を確定する。

## テストケース

| TC-ID | 対象               | 検証観点                            |
| ----- | ------------------ | ----------------------------------- |
| TC-01 | Organisms Showcase | dark desktop の通常表示（全体）     |
| TC-02 | SearchFilterList   | 検索 + フィルタ適用時の絞り込み結果 |
| TC-03 | CardGrid           | loading 状態（Skeleton）            |
| TC-04 | CardGrid           | empty 状態（Light Theme）           |
| TC-05 | MasterDetailLayout | mobile overlay 表示                 |
| TC-06 | SearchFilterList   | mobile grid 表示                    |

## 画面カバレッジマトリクス

| テストケース | デバイス           | テーマ | 状態                   | 証跡                                                                       |
| ------------ | ------------------ | ------ | ---------------------- | -------------------------------------------------------------------------- |
| TC-01        | desktop (1440x900) | dark   | default                | `outputs/phase-11/screenshots/TC-01-organisms-default-dark-desktop.png`    |
| TC-02        | desktop (1440x900) | dark   | search + filter active | `outputs/phase-11/screenshots/TC-02-search-filter-active-dark-desktop.png` |
| TC-03        | desktop (1440x900) | dark   | loading                | `outputs/phase-11/screenshots/TC-03-cardgrid-loading-dark-desktop.png`     |
| TC-04        | desktop (1440x900) | light  | empty                  | `outputs/phase-11/screenshots/TC-04-cardgrid-empty-light-desktop.png`      |
| TC-05        | mobile (390x844)   | dark   | detail overlay         | `outputs/phase-11/screenshots/TC-05-master-detail-mobile-dialog-dark.png`  |
| TC-06        | mobile (390x844)   | dark   | grid list              | `outputs/phase-11/screenshots/TC-06-search-grid-mobile-dark.png`           |

## 参照資料

| 参照資料                   | パス                                       | 内容            |
| -------------------------- | ------------------------------------------ | --------------- |
| Phase 1 受け入れ基準       | outputs/phase-1/acceptance-criteria.md     | 依存成果物      |
| Phase 2 コンポーネント設計 | outputs/phase-2/component-design.md        | 依存成果物      |
| Phase 5 Greenテスト結果    | outputs/phase-5/green-test-report.md       | 依存成果物      |
| Phase 6 拡充テスト結果     | outputs/phase-6/test-expansion-report.md   | 依存成果物      |
| Phase 7 カバレッジ結果     | outputs/phase-7/coverage-report.md         | 依存成果物      |
| Phase 8 回帰検証記録       | outputs/phase-8/refactor-validation.md     | 依存成果物      |
| Phase 9 品質保証レポート   | outputs/phase-9/qa-report.md               | 依存成果物      |
| Phase 10 最終レビュー結果  | outputs/phase-10/final-review-report.md    | 依存成果物      |
| レビューゲート判定         | `outputs/phase-10/review-gate-decision.md` | Phase 10 成果物 |

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

1. 実行環境とデータセットを固定する。
2. desktop / tablet / mobile で同一ケースを実行する。
3. 課題を testcase ID 付きで記録する。

## 統合テスト連携

- 手動テスト結果と自動テスト結果の差分を記録する。
- Phase 12 の `spec-update-summary.md` へ転記する入力を作成する。

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

| SubAgent              | 関心ごと       | 担当成果物                             |
| --------------------- | -------------- | -------------------------------------- |
| SubAgent-MT-Execution | 手動テスト実行 | outputs/phase-11/manual-test-result.md |
| SubAgent-MT-Evidence  | 証跡整理       | outputs/phase-11/screenshots-index.md  |
| SubAgent-MT-Issues    | 課題記録       | outputs/phase-11/discovered-issues.md  |

## 成果物

| 成果物                 | パス                                   | 内容       |
| ---------------------- | -------------------------------------- | ---------- |
| 手動テスト結果         | outputs/phase-11/manual-test-result.md | ケース合否 |
| 発見課題一覧           | outputs/phase-11/discovered-issues.md  | 課題詳細   |
| スクリーンショット台帳 | outputs/phase-11/screenshots-index.md  | 証跡一覧   |

## 完了条件

- [ ] 主要ケースの手動テスト結果が記録されている。
- [ ] 課題が再現手順付きで記録されている。
- [ ] 証跡台帳が作成されている。
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

- 前提: Phase 10
- 後続: Phase 12

### 依存Phase成果物

- Phase 1: `outputs/phase-1/`
- Phase 2: `outputs/phase-2/`
- Phase 5: `outputs/phase-5/`
- Phase 6: `outputs/phase-6/`
- Phase 7: `outputs/phase-7/`
- Phase 8: `outputs/phase-8/`
- Phase 9: `outputs/phase-9/`
- Phase 10: `outputs/phase-10/`

## Phase実行記録（全Phase共通）

- 実行タスクごとの完了結果
- 発見事項と対応方針
- 次Phaseへの引き継ぎ事項

## 次のPhase

- Phase 12: ドキュメント更新
