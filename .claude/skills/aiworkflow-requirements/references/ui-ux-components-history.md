# コンポーネント UI/UX ガイドライン / history bundle

> 親仕様書: [ui-ux-components.md](ui-ux-components.md)
> 役割: history bundle

## 完了タスク

| Issue # | 機能名 | 完了日 |
| ------- | ------ | ------ |
| AGENT-004 | Agent Execution UI | 2026-01-24 |
| AGENT-006 | Custom Execution Environment | 2026-01-25 |
| CONV-08-05 | Community Visualization | 2026-01-25 |
| TASK-3-2 | SkillStreamDisplay | 2026-01-25 |
| #468 | workspace-chat-edit-ui | 2026-01-25 |
| TASK-7A | SkillSelector コンポーネント実装 | 2026-01-30 |
| TASK-7B | SkillImportDialog | 2026-01-30 |
| TASK-7C | PermissionDialog実装 | 2026-01-30 |
| #585 | PermissionDialog人間可読UI改善 | 2026-01-30 |
| TASK-7D | ChatPanel統合（SkillStreamingView実装） | 2026-01-30 |
| #606 | PermissionDialogリスクレベル・セキュリティメタデータ表示 | 2026-01-31 |
| task-imp-permission-date-filter | 期間別フィルタリング（PermissionHistoryFilter拡張） | 2026-02-02 |
| TASK-8B | コンポーネントテスト（全4コンポーネント、280テスト） | 2026-02-02 |
| TASK-9A | SkillEditor UI（SkillEditor / SkillCodeEditor / ファイルCRUD / バックアップ復元） | 2026-02-26 |
| UT-FIX-SKILL-IMPORT-ID-MISMATCH-001 | SkillImportDialog skill.id→skill.name修正（`onImport`にハッシュではなくスキル名を渡すよう修正、P44 Renderer側バリエーション） | 2026-02-22 |
| TASK-UI-00-ATOMS | Atoms共通コンポーネント実装（StatusIndicator・FilterChip・SkeletonCard・SuggestionBubble・RelativeTime新規、Badge・EmptyState拡張） | 2026-02-23 |
| TASK-UI-00-MOLECULES | Molecules共通コンポーネント実装（SearchBar / CodeViewer / TabSwitcher / SlideInPanel / ConfirmDialog + 5テストファイル） | 2026-03-04 |
| TASK-UI-00-ORGANISMS | Organisms共通コンポーネント実装（CardGrid / MasterDetailLayout / SearchFilterList + 41テスト） | 2026-03-04 |
| TASK-UI-00-FOUNDATION-REFLECTION-AUDIT | UI基盤反映監査（正本導線・UX語彙具体例・Task5B境界の監査是正 + 検証スクリプト/テスト追加 + Phase11再検証 + Phase12再確認） | 2026-03-05 |
| TASK-UI-02 | Global Navigation Core（GlobalNavStrip / MobileNavBar / AppLayout + feature flag 移行） | 2026-03-06 |
| TASK-UI-04C | Workspace Preview / Quick Search（PreviewPanel / SourceView / QuickFileSearch + screenshot 11件） | 2026-03-11 |
| TASK-UI-07 | DashboardView ホーム画面リデザイン（GreetingHeader / DashboardSuggestionSection / RecentTimeline + screenshot harness） | 2026-03-11 |
| TASK-UI-05 | SkillCenterView（ツールを探す）実装（7コンポーネント + 2フック + 9テストファイル） | 2026-03-01 |
| TASK-10A-B | SkillAnalysisView（ScoreDisplay / SuggestionList / RiskPanel + useSkillAnalysis）実装 | 2026-03-02 |
| TASK-10A-C | SkillCreateWizard（4ステップUI + `useWizardStep` + `skill:create` 連携）実装 | 2026-03-02 |
| TASK-UI-05B | SkillAdvancedViews（SkillChainBuilder / ScheduleManager / DebugPanel / AnalyticsDashboard）実装（4ビュー + 共通IPC Hooks + テスト） | 2026-03-02 |
| TASK-10A-D | SkillManagementPanel ビュー統合（SkillAnalysisView/SkillCreateWizard統合 + ChatPanel導線） | 2026-03-03 |
| TASK-SKILL-CENTER-LIFECYCLE-NAV-001 | SkillCenterView secondary CTA / SkillManagementPanel 戻り導線接続 | 2026-04-04 |
| TASK-UI-03 | AgentView Enhancement（SkillChip / ExecuteButton / FloatingExecutionBar / AdvancedSettingsPanel / RecentExecutionList、136テスト） | 2026-03-10 |
| TASK-UI-08 | NotificationCenter（Bell utility action / Portal / relative time / delete reveal / screenshot 7件） | 2026-03-11 |

---

## SkillCenterView 関連未タスク

| 未タスクID | 概要 | 参照 |
| --- | --- | --- |
| UT-UI-05-001 | CategoryId / SkillCategory 型統一 | `docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/unassigned-task/task-ui-05-categoryid-skillcategory-type-unification.md` |
| UT-UI-05-002 | SkillDetailPanel 内部 Molecule 分離 | `docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/unassigned-task/task-ui-05-skill-detail-panel-molecule-split.md` |
| UT-UI-05-003 | ローディングスケルトン実装 | `docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/unassigned-task/task-ui-05-loading-skeleton-implementation.md` |
| UT-UI-05-004 | モバイルスワイプ閉じ実装 | `docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/unassigned-task/task-ui-05-mobile-swipe-close-detail-panel.md` |
| UT-UI-05-005 | SKILL.md 全文 Markdown レンダリング | `docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/unassigned-task/task-ui-05-skill-markdown-full-rendering.md` |
| UT-UI-05-006 | useFeaturedSkills 選定アルゴリズム改善 | `docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/unassigned-task/task-ui-05-featured-skills-algorithm-improvement.md` |
| UT-UI-05-007 | Phase 12 UI仕様同期プロファイル適用ガード | `docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/unassigned-task/task-ui-05-phase12-ui-spec-sync-guard.md` |

---

## 変更履歴

| Version | Date       | Changes                                                                              |
| ------- | ---------- | ------------------------------------------------------------------------------------ |
| 2.16.6  | 2026-03-11 | TASK-UI-04C 完了反映: `TASK-UI-04C 実装完了記録` を追加し、`PreviewPanel` / `QuickFileSearch` / renderer timeout+retry / current build screenshot 11件 / Apple UI/UX review を UI カタログ正本へ同期 |
| 2.16.7  | 2026-04-04 | TASK-SKILL-CENTER-LIFECYCLE-NAV-001 完了反映: `SkillCenterView` secondary CTA / `SkillManagementPanel` 戻り導線 / `SkillLifecyclePanel` 到達証跡 8件を current facts へ同期 |
| 2.16.5  | 2026-03-11 | TASK-UI-07 追補: `TASK-UI-07 実装内容と苦戦箇所サマリー` を追加し、ホーム画面リデザインの実装内容、画面証跡、内部契約境界、dual-root mirror sync を UI カタログ正本へ固定 |
| 2.16.4  | 2026-03-11 | TASK-UI-07 完了反映: `DashboardView` をホーム画面として完了タスクへ追加し、GreetingHeader / DashboardSuggestionSection / RecentTimeline と Phase 11 screenshot harness を実装済み構成として記録 |
| 2.16.3  | 2026-03-11 | TASK-UI-08 再監査反映: Organisms / 主要UI / 完了タスクへ `NotificationCenter` を追加し、Bell utility action・Portal・delete reveal・Phase 11 screenshot 7件を TASK-UI-08 完了記録として同期 |
| 2.16.2  | 2026-03-10 | TASK-UI-03 実装/苦戦サマリー追補: AgentView Enhancement の完成記録を独立節として追加し、adapter helper・dedicated harness・token scope 切り分けを「実装内容 + 苦戦箇所 + 簡潔解決」の形式で正本化 |
| 2.16.0  | 2026-03-07 | TASK-UI-03 完了反映: Organisms実装状況へ SkillChip / ExecuteButton / FloatingExecutionBar / AdvancedSettingsPanel / RecentExecutionList を追加。主要UI一覧・organisms階層図・完了タスクへ AgentView Enhancement 5コンポーネント（58テスト）を同期 |
| 2.16.1  | 2026-03-10 | TASK-UI-03 current workflow 同期: 完了タスク行のテスト件数を 136 tests へ更新し、Phase 11/12 再検証後の実測に合わせた |
| 2.15.3  | 2026-03-06 | TASK-UI-02 移管反映: workflow 参照を `docs/30-workflows/completed-tasks/task-057-ui-02-global-nav-core/` へ更新し、Phase 12 完了後の正本導線を completed-tasks 基準へ統一 |
| 2.15.2  | 2026-03-06 | TASK-UI-02 追補: workflow 本文 `phase-1..11` stale と UI仕様同期セット（`ui-ux-components` / `ui-ux-feature-components` / `ui-ux-navigation` / `arch-state-management` / `task-workflow` / `lessons-learned`）を TASK-UI-02 サマリーへ追記し、簡潔解決導線を明文化 |
| 2.15.1  | 2026-03-06 | TASK-UI-02 再監査追補: `mobileLabel` による mobile 可読性改善と、`phase-12-documentation.md` / `artifacts.json` / `outputs/artifacts.json` / `index.md` の四点同期ルールを TASK-UI-02 サマリーへ追加 |
| 2.14.11 | 2026-03-05 | TASK-UI-00-FOUNDATION-REFLECTION-AUDIT の最終追補（12:21 JST）を反映。追加再検証値（`validate-phase-output` 28項目、`verify-all-specs` 13/13、`validate-phase11-screenshot-coverage` TC 6/6、`verify-unassigned-links` 92/92、`currentViolations=0`）を同期し、同種課題の5分解決カード導線を `ui-ux-feature-components.md` と整合 |
| 2.15.1  | 2026-03-06 | UT-TASK-10A-B-008 再監査追補を反映。SkillAnalysisView の Phase 11 画面証跡を 8 ケースへ拡張し、`useSkillAnalysis` の StrictMode ローディング固着修正を実装完了記録へ追記 |
| 2.15.0  | 2026-03-06 | TASK-UI-02 完了反映: Organisms 実装状況へ `AppLayout` / `GlobalNavStrip` / `MobileNavBar` を追加し、主要UI一覧・完了タスク・実装完了記録へ global navigation core を同期 |
| 2.14.10 | 2026-03-05 | TASK-UI-00-FOUNDATION-REFLECTION-AUDIT の最終再確認を反映。Phase 11 画面証跡の最終時刻を 11:51 JST へ同期し、Phase 12 再確認（13/13, 28項目, 92/92, `currentViolations=0`）を追記 |
| 2.14.9  | 2026-03-05 | TASK-UI-00-FOUNDATION-REFLECTION-AUDIT の再監査追補を反映。Phase 11 で TC-055-301〜306 を再撮影（11:43 JST）し、`validate-phase11-screenshot-coverage` の警告を0件化した状態を同期 |
| 2.14.8  | 2026-03-05 | TASK-UI-00-FOUNDATION-REFLECTION-AUDIT を追補: `00-1-design-tokens.md` 正本導線の自己参照を是正し、Task 5D 具体例と Task 5B 適用境界を仕様へ反映。検証スクリプト `validate-foundation-findings.mjs` とテスト追加を完了タスクに同期 |
| 2.14.7  | 2026-03-04 | TASK-UI-00-ORGANISMS 再確認反映: Phase 11証跡を 23:24 JST 再撮影へ更新し、`manual-test-result.md` と時刻同期。Phase 12準拠再確認（Task 1〜5 + Step 1-A〜1-E）の監査導線を追記 |
| 2.14.6  | 2026-03-04 | TASK-UI-00-ORGANISMS 実装完了反映: Organisms実装状況テーブル（CardGrid/MasterDetailLayout/SearchFilterList）を追加。主要UI一覧・完了タスクへ TASK-UI-00-ORGANISMS を追記し、Phase 11 画面証跡（TC-01〜TC-06）と手動検証導線を同期 |
| 2.14.5  | 2026-03-04 | TASK-UI-00-MOLECULES 再確認最適化: Phase 11 スクリーンショットの再撮影時刻を 18:04 JST へ同期し、証跡テーブルと手動検証ドキュメントの整合を固定 |
| 2.14.4  | 2026-03-04 | TASK-UI-00-MOLECULES Phase 12準拠追補: 実装ガイドの Task 1 要件（Part 1 理由先行+日常例え / Part 2 型・API・エッジケース・設定項目）を再同期し、再利用可能な品質基準へ更新 |
| 2.14.3  | 2026-03-04 | TASK-UI-00-MOLECULES 再検証追補: SearchBar に Enter確定 `onSubmit` を追加した実装差分を反映。Molecules対象テスト実測値を 69 tests に同期し、Phase 11 画面証跡を再取得（17:09 JST）して検証時刻を更新 |
| 2.14.2  | 2026-03-04 | TASK-UI-00-MOLECULES 実装完了反映: Molecules実装状況を `completed` へ更新。完了タスクへ TASK-UI-00-MOLECULES を追加し、`仕様書作成済みタスク` から同タスクを除外。Phase 11 画面証跡導線は維持したまま台帳状態を実体へ同期 |
| 2.14.1  | 2026-03-04 | TASK-UI-00-MOLECULES 再監査反映: Molecules実装状況テーブル（SearchBar/CodeViewer/TabSwitcher/SlideInPanel/ConfirmDialog）を追加し、全件を `spec_created（未実装）` として同期。`仕様書作成済みタスク` に TASK-UI-00-MOLECULES を追加し、Phase 11 画面証跡（TC-01〜TC-04）と手動検証結果への導線を追記 |
| 2.14.0  | 2026-03-03 | TASK-10A-D 完了反映: 完了タスクへ SkillManagementPanel ビュー統合を追加し、実装完了記録（SkillAnalysisView/SkillCreateWizard統合、ChatPanel導線、agentSlice拡張、苦戦箇所3件）を同期 |
| 2.13.9  | 2026-03-02 | TASK-10A-C 完了反映: 主要UI一覧/organisms一覧/完了タスクへ SkillCreateWizard を追加し、実装完了記録（4ステップUI、`skill:create` 契約、Phase 11 画面証跡 TC-01〜08、未タスク0件）を同期 |
| 2.13.8  | 2026-03-02 | TASK-10A-B 完了反映: 主要UI一覧/organisms一覧/完了タスクへ SkillAnalysisView を追加し、実装完了記録（画面証跡・a11y修正・未タスク5件）を同期 |
| 2.13.6  | 2026-03-02 | TASK-UI-05A 再監査反映: 状態を「実装ファイル実在・統合未完了」へ更新し、再取得した画面証跡（UI05A-03/04）を追加。未タスク正本を `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/` 配下へ統一 |
| 2.13.5  | 2026-03-01 | TASK-UI-05A spec_created 反映: `SkillEditorView` を主要UI一覧/viewsへ追加（実装未着手明記）。仕様書作成済みタスク表と画面検証証跡（Dashboard/Editorスクリーンショット、manual-test-result、discovered-issues）を追加 |
| 2.13.7  | 2026-03-02 | TASK-UI-05B 追補: 実装内容と苦戦箇所サマリーを追加し、再利用参照を feature/workflow/lessons へ統一 |
| 2.13.6  | 2026-03-02 | TASK-UI-05B 実装完了同期: 主要UI一覧・views階層・完了タスクを `completed` 状態へ更新し、`spec_created` 台帳を実装完了記録へ置換 |
| 2.13.5  | 2026-03-01 | TASK-UI-05B spec_created を反映: 主要UI一覧と views 階層に SkillAdvancedViews（3A-3D）を追加。`仕様書作成済みタスク` セクションを新設し、`docs/30-workflows/completed-tasks/TASK-UI-05B-SKILL-ADVANCED-VIEWS/` 参照を登録 |
| 2.13.4  | 2026-03-01 | TASK-UI-05 completed-tasks 移管: ワークフロー参照を `docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/` へ更新し、関連未タスク7件の参照先を同ディレクトリ配下 `unassigned-task/` へ同期 |
| 2.13.3  | 2026-03-01 | TASK-UI-05追補: Phase 12 UI仕様同期ガード（UT-UI-05-007）を追加し、SkillCenterView 関連未タスクを7件へ拡張 |
| 2.13.2  | 2026-03-01 | TASK-UI-05追補: SkillCenterView 関連未タスクテーブルを UT-UI-05-001〜006 の6件へ拡張し、task-workflow/feature仕様との参照整合を統一 |
| 2.13.1  | 2026-03-01 | TASK-UI-05追補: SkillCenterView 関連未タスク（UT-UI-05-001〜003）への参照テーブルを追加 |
| 2.13.0  | 2026-03-01 | TASK-UI-05完了反映: 主要UI一覧と views 階層に SkillCenterView を追加。完了タスクに TASK-UI-05 を登録し、関連ドキュメント参照を同期 |
| 2.12.1  | 2026-02-26 | TASK-9A成果物移管を反映。関連ドキュメント参照を `docs/30-workflows/completed-tasks/TASK-9A-skill-editor/` へ更新 |
| 2.12.0  | 2026-02-26 | TASK-9A完了反映: SkillEditorを `TASK-9A-C spec_created` から `TASK-9A completed` へ更新。主要UI一覧・完了タスク表・関連ドキュメント参照を `docs/30-workflows/TASK-9A-skill-editor/` 正本へ同期 |
| 2.11.0  | 2026-02-23 | TASK-UI-00-ATOMS完了: 新規5コンポーネント（StatusIndicator/FilterChip/SkeletonCard/SuggestionBubble/RelativeTime）+ 既存2拡張（Badge/EmptyState）、156テスト全PASS、Atoms実装状況テーブル追加 |
| 2.10.0  | 2026-02-22 | UT-FIX-SKILL-IMPORT-ID-MISMATCH-001完了タスク追加（SkillImportDialog `onImport`がskill.id→skill.nameを渡すよう修正、P44 Renderer側バリエーション） |
| 2.9.1   | 2026-02-19 | TASK-9A-C: Phase 12準拠監査レポートへの参照を追加（監査済み状態を明確化） |
| 2.9.0   | 2026-02-19 | TASK-9A-C反映: SkillEditorを主要UIコンポーネント一覧・完了タスク表に追加（仕様書作成済み状態を明記） |
| 2.8.0   | 2026-02-02 | 両ブランチ統合: task-imp-permission-date-filter完了+TASK-8B完了 |
| 2.7.0   | 2026-02-02 | task-imp-permission-date-filter完了（期間フィルタ拡張）、TASK-8B完了（280テスト） |
| 2.6.0   | 2026-01-31 | task-imp-permission-tool-metadata-001完了タスク追加（PermissionDialogリスクレベル・セキュリティメタデータ表示、toolMetadata統合） |
| 2.5.0   | 2026-01-30 | TASK-7D完了タスク追加（ChatPanel統合・SkillStreamingView） |
| 2.4.0   | 2026-01-30 | task-imp-permission-readable-ui-001完了タスク追加（PermissionDialog人間可読UI改善、permissionDescriptions統合） |
| 2.3.0   | 2026-01-30 | TASK-7C完了タスク追加（PermissionDialog実装）                                       |
| 2.2.0   | 2026-01-30 | TASK-7B完了タスク追加（SkillImportDialogコンポーネント）                             |
| 2.1.0   | 2026-01-30 | TASK-7A完了タスク追加（SkillSelector コンポーネント）                                |
| 2.0.0   | 2026-01-26 | 4ファイルに分割（964行→インデックス+詳細ファイル）                                   |
| 1.1.0   | 2026-01-26 | コードブロックを表形式に変換（spec-guidelines準拠）                                  |
| 1.0.0   | 2026-01-25 | 初版作成                                                                             |

---

## 関連ドキュメント

- [アーキテクチャパターン](./architecture-patterns.md)
- [History Panel UI仕様](./ui-ux-history-panel.md)
- [TASK-9A 実装ガイド](../../../../docs/30-workflows/completed-tasks/TASK-9A-skill-editor/outputs/phase-12/implementation-guide.md)
- [TASK-9A 仕様更新サマリー](../../../../docs/30-workflows/completed-tasks/TASK-9A-skill-editor/outputs/phase-12/spec-update-summary.md)
- [TASK-7B 実装ガイド](../../../../docs/30-workflows/TASK-7B-skill-import-dialog/outputs/phase-12/implementation-guide.md)
- [TASK-7D 実装ガイド](../../../../docs/30-workflows/TASK-7D-chat-panel-integration/outputs/phase-12/implementation-guide-part2.md)
- [TASK-UI-00-ATOMS 実装ガイド](../../../../docs/30-workflows/completed-tasks/task-ui-00-atoms/outputs/phase-12/implementation-guide.md)
- [TASK-UI-00-MOLECULES ワークフロー仕様（Phase 1-12実行済み）](../../../../docs/30-workflows/completed-tasks/task-ui-00-molecules/index.md)
- [TASK-UI-00-MOLECULES 手動検証結果](../../../../docs/30-workflows/completed-tasks/task-ui-00-molecules/outputs/phase-11/manual-test-result.md)
- [TASK-UI-00-ORGANISMS ワークフロー仕様（Phase 1-12）](../../../../docs/30-workflows/completed-tasks/task-054-ui-00-4-organisms-components/index.md)
- [TASK-UI-00-ORGANISMS 手動検証結果](../../../../docs/30-workflows/completed-tasks/task-054-ui-00-4-organisms-components/outputs/phase-11/manual-test-result.md)
- [TASK-UI-05 実装ガイド](../../../../docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/outputs/phase-12/implementation-guide.md)
- [TASK-UI-05 仕様更新サマリー](../../../../docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/outputs/phase-12/spec-update-summary.md)
- [TASK-UI-05A 仕様書（spec_created）](../../../../docs/30-workflows/skill-editor-view/index.md)
- [TASK-UI-05A 手動検証結果](../../../../docs/30-workflows/skill-editor-view/outputs/phase-11/manual-test-result.md)
- [TASK-UI-05B ワークフロー仕様](../../../../docs/30-workflows/completed-tasks/TASK-UI-05B-SKILL-ADVANCED-VIEWS/index.md)
- [TASK-UI-05B 画面検証スクリーンショット](../../../../docs/30-workflows/completed-tasks/TASK-UI-05B-SKILL-ADVANCED-VIEWS/outputs/phase-11/screenshots/)
- [TASK-10A-B ワークフロー仕様](../../../../docs/30-workflows/completed-tasks/skill-analysis-view/index.md)
- [TASK-10A-B 手動検証結果](../../../../docs/30-workflows/completed-tasks/skill-analysis-view/outputs/phase-11/manual-test-result.md)
- [TASK-10A-B 画面検証スクリーンショット](../../../../docs/30-workflows/completed-tasks/skill-analysis-view/outputs/phase-11/screenshots/)
- [TASK-10A-C ワークフロー仕様](../../../../docs/30-workflows/completed-tasks/skill-create-wizard/index.md)
- [TASK-10A-C 手動検証結果](../../../../docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-11/manual-test-result.md)
- [TASK-10A-C 画面検証スクリーンショット](../../../../docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-11/screenshots/)
