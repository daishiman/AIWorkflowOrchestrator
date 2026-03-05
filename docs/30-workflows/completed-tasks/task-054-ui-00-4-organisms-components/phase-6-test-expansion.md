# Phase 6: テスト拡充

## メタ情報

| 項目      | 値                                    |
| --------- | ------------------------------------- |
| Phase     | 6                                     |
| Phase名   | テスト拡充                            |
| 機能名    | task-054-ui-00-4-organisms-components |
| タスクID  | TASK-UI-00-ORGANISMS                  |
| 作成日    | 2026-03-04                            |
| 前提Phase | Phase 5                               |
| 後続Phase | Phase 7                               |

## 目的

境界値、a11y、レスポンシブ、テーマ横断のテストを追加して回帰耐性を上げる。

## ⚠️ 既知Pitfall（事前適用）

| ID  | 内容                            | 回避策                                                           |
| --- | ------------------------------- | ---------------------------------------------------------------- |
| P31 | Zustand Store Hooks 無限ループ  | Store直参照を避け、props駆動 + useState/useMemo で局所管理する。 |
| P39 | happy-dom と userEvent の非互換 | コンポーネントテストは fireEvent を標準にする。                  |
| P40 | テスト実行ディレクトリ依存      | テストは必ず cd apps/desktop && pnpm vitest run で実行する。     |

## 実行タスク

- 境界値テスト拡充: 空配列、1件、複数件、0件結果の検証を追加する。
- a11yテスト拡充: role、aria-live、focus移動、Escape操作を追加する。
- レスポンシブ拡充: matchMedia で3ブレークポイントを検証する。
- テーマ拡充: kanagawa-dragon / light / dark を検証する。
- 回帰統合: 3コンポーネント横断ケースを追加する。

## 参照資料

| 参照資料                   | パス                                                                            | 内容           |
| -------------------------- | ------------------------------------------------------------------------------- | -------------- |
| Phase 5 Greenテスト結果    | outputs/phase-5/green-test-report.md                                            | 依存成果物     |
| コンポーネントテスト基準   | .claude/skills/aiworkflow-requirements/references/testing-component-patterns.md | 拡充基準       |
| アクセシビリティテスト基準 | .claude/skills/aiworkflow-requirements/references/testing-accessibility.md      | 拡充基準       |
| Redテスト計画              | `outputs/phase-4/red-test-plan.md`                                              | Phase 4 成果物 |
| Redテスト結果              | `outputs/phase-4/red-test-report.md`                                            | Phase 4 成果物 |
| テスト基盤メモ             | `outputs/phase-4/test-infra-notes.md`                                           | Phase 4 成果物 |
| CardGrid Redメモ           | `outputs/phase-4/cardgrid-red-tests.md`                                         | Phase 4 成果物 |
| MasterDetailLayout Redメモ | `outputs/phase-4/masterdetail-red-tests.md`                                     | Phase 4 成果物 |
| SearchFilterList Redメモ   | `outputs/phase-4/searchfilter-red-tests.md`                                     | Phase 4 成果物 |
| 実装計画ログ               | `outputs/phase-5/implementation-plan.md`                                        | Phase 5 成果物 |
| 統合メモ                   | `outputs/phase-5/integration-notes.md`                                          | Phase 5 成果物 |

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

1. Phase 5 テスト結果から不足観点を抽出する。
2. 不足観点をコンポーネント別に追加する。
3. 全体回帰を実施して結果を記録する。

## 統合テスト連携

- 追加テストを実行し結果を `outputs/phase-6/test-expansion-report.md` に記録する。
- 次Phaseのカバレッジ測定に必要なテスト対象一覧を作成する。

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

| SubAgent                  | 関心ごと                | 担当成果物                             |
| ------------------------- | ----------------------- | -------------------------------------- |
| SubAgent-TESTX-A11Y       | a11y / keyboard 拡充    | outputs/phase-6/test-expansion-plan.md |
| SubAgent-TESTX-Responsive | responsive / theme 拡充 | outputs/phase-6/regression-matrix.md   |

## 成果物

| 成果物         | パス                                     | 内容       |
| -------------- | ---------------------------------------- | ---------- |
| 拡充テスト計画 | outputs/phase-6/test-expansion-plan.md   | 追加ケース |
| 拡充テスト結果 | outputs/phase-6/test-expansion-report.md | 実行結果   |
| 回帰マトリクス | outputs/phase-6/regression-matrix.md     | 横断観点   |

## 完了条件

- [ ] 境界値と失敗系のテストが追加されている。
- [ ] a11y と responsive の検証が追加されている。
- [ ] テーマ横断テストが追加されている。
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

- 前提: Phase 5
- 後続: Phase 7

### 依存Phase成果物

- Phase 5: `outputs/phase-5/`

## Phase実行記録（全Phase共通）

- 実行タスクごとの完了結果
- 発見事項と対応方針
- 次Phaseへの引き継ぎ事項

## 次のPhase

- Phase 7: テストカバレッジ確認
