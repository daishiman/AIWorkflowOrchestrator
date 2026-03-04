# Phase 7: テストカバレッジ確認

## メタ情報

| 項目      | 値                                    |
| --------- | ------------------------------------- |
| Phase     | 7                                     |
| Phase名   | テストカバレッジ確認                  |
| 機能名    | task-054-ui-00-4-organisms-components |
| タスクID  | TASK-UI-00-ORGANISMS                  |
| 作成日    | 2026-03-04                            |
| 前提Phase | Phase 6                               |
| 後続Phase | Phase 8                               |

## 目的

カバレッジを測定し、未達分岐を分析して Phase 8 の改善対象を明確化する。

## ⚠️ 既知Pitfall（事前適用）

| ID  | 内容                            | 回避策                                                           |
| --- | ------------------------------- | ---------------------------------------------------------------- |
| P31 | Zustand Store Hooks 無限ループ  | Store直参照を避け、props駆動 + useState/useMemo で局所管理する。 |
| P39 | happy-dom と userEvent の非互換 | コンポーネントテストは fireEvent を標準にする。                  |
| P40 | テスト実行ディレクトリ依存      | テストは必ず cd apps/desktop && pnpm vitest run で実行する。     |

## 実行タスク

- カバレッジ測定: 対象3コンポーネントの line / branch / function を測定する。
- 閾値判定: 品質要件の閾値を満たすか判定する。
- 未達分析: 未到達分岐の原因を分類する。
- 改善計画作成: Phase 8 への改善バックログを作成する。

## 参照資料

| 参照資料                | パス                                                                      | 内容           |
| ----------------------- | ------------------------------------------------------------------------- | -------------- |
| Phase 5 Greenテスト結果 | outputs/phase-5/green-test-report.md                                      | 依存成果物     |
| Phase 6 拡充テスト結果  | outputs/phase-6/test-expansion-report.md                                  | 依存成果物     |
| 品質要件                | .claude/skills/aiworkflow-requirements/references/quality-requirements.md | 閾値基準       |
| 拡充テスト計画          | `outputs/phase-6/test-expansion-plan.md`                                  | Phase 6 成果物 |
| 回帰マトリクス          | `outputs/phase-6/regression-matrix.md`                                    | Phase 6 成果物 |

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

1. coverage レポートを取得する。
2. 未達分岐を削除候補と追加テスト候補に分離する。
3. 改善優先度を決めて Phase 8 へ引き継ぐ。

## 統合テスト連携

- カバレッジ実行コマンドと測定条件を成果物へ固定する。
- 未達分岐一覧を Phase 8 に引き継ぐ。

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

| SubAgent             | 関心ごと | 担当成果物                               |
| -------------------- | -------- | ---------------------------------------- |
| SubAgent-COV-Metrics | 測定     | outputs/phase-7/coverage-report.md       |
| SubAgent-COV-Gap     | 未達分析 | outputs/phase-7/coverage-gap-analysis.md |

## 成果物

| 成果物         | パス                                            | 内容         |
| -------------- | ----------------------------------------------- | ------------ |
| カバレッジ結果 | outputs/phase-7/coverage-report.md              | 測定結果     |
| 未達分析       | outputs/phase-7/coverage-gap-analysis.md        | 未達原因     |
| 改善バックログ | outputs/phase-7/coverage-improvement-backlog.md | 引き継ぎ項目 |

## 完了条件

- [ ] 対象3コンポーネントのカバレッジ結果が記録されている。
- [ ] 未達分岐の原因分析が完了している。
- [ ] 改善バックログが作成されている。
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

- 前提: Phase 6
- 後続: Phase 8

### 依存Phase成果物

- Phase 5: `outputs/phase-5/`
- Phase 6: `outputs/phase-6/`

## Phase実行記録（全Phase共通）

- 実行タスクごとの完了結果
- 発見事項と対応方針
- 次Phaseへの引き継ぎ事項

## 次のPhase

- Phase 8: リファクタリング
