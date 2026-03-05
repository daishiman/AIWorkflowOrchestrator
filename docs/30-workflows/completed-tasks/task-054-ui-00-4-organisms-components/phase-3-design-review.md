# Phase 3: 設計レビューゲート

## メタ情報

| 項目      | 値                                    |
| --------- | ------------------------------------- |
| Phase     | 3                                     |
| Phase名   | 設計レビューゲート                    |
| 機能名    | task-054-ui-00-4-organisms-components |
| タスクID  | TASK-UI-00-ORGANISMS                  |
| 作成日    | 2026-03-04                            |
| 前提Phase | Phase 2                               |
| 後続Phase | Phase 4                               |

## 目的

設計内容をレビューし、実装前のリスクを除去した状態で Phase 4 に進行する。

## ⚠️ 既知Pitfall（事前適用）

| ID  | 内容                            | 回避策                                                           |
| --- | ------------------------------- | ---------------------------------------------------------------- |
| P31 | Zustand Store Hooks 無限ループ  | Store直参照を避け、props駆動 + useState/useMemo で局所管理する。 |
| P39 | happy-dom と userEvent の非互換 | コンポーネントテストは fireEvent を標準にする。                  |
| P40 | テスト実行ディレクトリ依存      | テストは必ず cd apps/desktop && pnpm vitest run で実行する。     |

## 実行タスク

- 設計整合レビュー: 要件IDと設計要素の整合を確認する。
- a11yレビュー: role / aria / keyboard の要件反映を確認する。
- テスト可能性レビュー: Red テストが先に書ける設計か判定する。
- ゲート判定: PASS / MINOR / MAJOR / CRITICAL を決定する。

## 参照資料

| 参照資料                   | パス                                       | 内容           |
| -------------------------- | ------------------------------------------ | -------------- |
| Phase 1 要件定義           | outputs/phase-1/requirements-definition.md | 依存成果物     |
| Phase 2 コンポーネント設計 | outputs/phase-2/component-design.md        | レビュー対象   |
| Phase 2 型定義仕様         | outputs/phase-2/interface-contracts.md     | レビュー対象   |
| Phase 2 状態管理設計       | outputs/phase-2/state-design.md            | レビュー対象   |
| 受け入れ基準               | `outputs/phase-1/acceptance-criteria.md`   | Phase 1 成果物 |
| スコープ定義               | `outputs/phase-1/scope-definition.md`      | Phase 1 成果物 |
| テスト設計マップ           | `outputs/phase-2/test-design-map.md`       | Phase 2 成果物 |

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

1. Phase 1 と Phase 2 の成果物を突合する。
2. SubAgentごとの指摘を統合してレビュー報告書へ反映する。
3. 判定結果と差し戻し先を記録する。

## 統合テスト連携

- Phase 4 の Red テスト対象一覧をレビュー成果物へ添付する。
- 差し戻し時は Phase 2 を修正し再レビューを行う。

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

| SubAgent               | 関心ごと                    | 担当成果物                              |
| ---------------------- | --------------------------- | --------------------------------------- |
| SubAgent-REVIEW-Design | 設計整合レビュー            | outputs/phase-3/design-review-report.md |
| SubAgent-REVIEW-A11Y   | a11y / テスト可能性レビュー | outputs/phase-3/review-gate-decision.md |

## 成果物

| 成果物             | パス                                    | 内容         |
| ------------------ | --------------------------------------- | ------------ |
| 設計レビュー結果   | outputs/phase-3/design-review-report.md | 指摘と判定   |
| レビューゲート判定 | outputs/phase-3/review-gate-decision.md | 戻り先と条件 |

## 完了条件

- [ ] レビュー観点ごとの判定が記録されている。
- [ ] 差し戻し条件と戻り先が明記されている。
- [ ] Phase 4 の開始条件が明記されている。
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

- 前提: Phase 2
- 後続: Phase 4

### 依存Phase成果物

- Phase 1: `outputs/phase-1/`
- Phase 2: `outputs/phase-2/`

## レビューゲート（Phase 3, 10 の場合）

| 判定     | 条件                         | 次アクション                      |
| -------- | ---------------------------- | --------------------------------- |
| PASS     | ブロッカーなし               | 次Phaseへ進行                     |
| MINOR    | 軽微な課題あり               | 修正後に次Phaseへ進行             |
| MAJOR    | 主要課題あり                 | 影響範囲の前Phaseへ差し戻し       |
| CRITICAL | 要件または設計の再定義が必要 | Phase 1 または Phase 2 へ差し戻し |

## Phase実行記録（全Phase共通）

- 実行タスクごとの完了結果
- 発見事項と対応方針
- 次Phaseへの引き継ぎ事項

## 次のPhase

- Phase 4: テスト作成
