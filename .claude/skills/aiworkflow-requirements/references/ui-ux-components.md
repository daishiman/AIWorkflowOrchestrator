# コンポーネント UI/UX ガイドライン

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/

---

## 概要

本ドキュメントはAIWorkflowOrchestratorプロジェクトのUI/UXコンポーネントガイドラインのインデックスです。
各カテゴリは以下の分割ドキュメントで詳細を定義しています。

---

## ドキュメント構成

| カテゴリ               | ファイル                                                     | 説明                                        |
| ---------------------- | ------------------------------------------------------------ | ------------------------------------------- |
| デザイン原則           | [ui-ux-design-principles.md](./ui-ux-design-principles.md)   | Atomic Design、Apple HIG、アクセシビリティ  |
| Agent Execution UI     | [ui-ux-agent-execution.md](./ui-ux-agent-execution.md)       | チャットIF、ストリーミング、権限ダイアログ  |
| 機能別コンポーネント   | [ui-ux-feature-components.md](./ui-ux-feature-components.md) | Community Viz、Environment、ChatEdit、Stream |

---

## コンポーネント設計概要

### Atomic Design 階層

| 階層      | 説明                              | 配置場所                        |
| --------- | --------------------------------- | ------------------------------- |
| Atoms     | Button, Input, Label, Icon等      | `packages/shared/ui/atoms/`     |
| Molecules | FormField, SearchBar, Tooltip等   | `packages/shared/ui/molecules/` |
| Organisms | Header, Sidebar, Modal, Card等    | `packages/shared/ui/organisms/` |
| Templates | ページのレイアウト構造            | 各アプリ `components/templates/`|
| Pages     | 具体的なコンテンツを持つ画面      | 各アプリの `app/` or `pages/`   |

📖 詳細: [ui-ux-design-principles.md](./ui-ux-design-principles.md)

### Atoms コンポーネント実装状況

| コンポーネント | タスクID | ステータス | 実装パス |
|---|---|---|---|
| StatusIndicator | TASK-UI-00-ATOMS | 完了 | `apps/desktop/src/renderer/components/atoms/StatusIndicator/` |
| FilterChip | TASK-UI-00-ATOMS | 完了 | `apps/desktop/src/renderer/components/atoms/FilterChip/` |
| Badge | TASK-UI-00-ATOMS | 完了（拡張） | `apps/desktop/src/renderer/components/atoms/Badge/` |
| SkeletonCard | TASK-UI-00-ATOMS | 完了 | `apps/desktop/src/renderer/components/atoms/SkeletonCard/` |
| SuggestionBubble | TASK-UI-00-ATOMS | 完了 | `apps/desktop/src/renderer/components/atoms/SuggestionBubble/` |
| EmptyState | TASK-UI-00-ATOMS | 完了（拡張） | `apps/desktop/src/renderer/components/atoms/EmptyState/` |
| RelativeTime | TASK-UI-00-ATOMS | 完了 | `apps/desktop/src/renderer/components/atoms/RelativeTime/` |

### 主要UIコンポーネント一覧

| コンポーネント | タスクID | 責務 |
| -------------- | -------- | ---- |
| AgentExecutionView | AGENT-004 | エージェント実行メインビュー |
| PermissionDialog | AGENT-004 | 権限確認モーダル |
| CommunityVisualization | CONV-08-05 | コミュニティグラフ表示 |
| SplitLayout | AGENT-006 | 左右分割レイアウト |
| DiffPreview | Issue #468 | 差分プレビューモーダル |
| SkillStreamDisplay | TASK-3-2 | スキル実行ストリーム表示 |
| SkillImportDialog | TASK-7B | スキルインポート確認ダイアログ |
| SkillEditor | TASK-9A | スキルファイル編集UI（実装完了） |
| SkillCenterView | TASK-UI-05 | ツール探索・追加・詳細表示ビュー |
| SkillEditorView | TASK-UI-05A | ツール編集専用ビュー（仕様書作成済み・実装ファイル実在、統合未完了） |
| SkillAnalysisView | TASK-10A-B | スキル分析ビュー（スコア・改善提案・リスク表示） |
| SkillCreateWizard | TASK-10A-C | スキル作成ウィザード（説明入力→設定→生成→完了） |
| SkillAdvancedViews（3A-3D） | TASK-UI-05B | ツール高度管理ビュー群（実装完了） |

📖 詳細: [ui-ux-agent-execution.md](./ui-ux-agent-execution.md), [ui-ux-feature-components.md](./ui-ux-feature-components.md)

---

## デザイン原則サマリー

### Apple HIG 準拠（Electron向け）

- ネイティブな見た目：角丸、シャドウ、半透明背景
- アニメーション：300ms前後、ease-out
- キーボードショートカット：OS標準に準拠
- メニューバー：macOS標準構成

### アクセシビリティ（WCAG 2.1 AA）

| 要件 | 基準 |
| ---- | ---- |
| キーボードナビゲーション | 全機能にキーボードアクセス |
| スクリーンリーダー | 適切なaria属性、セマンティックHTML |
| 色コントラスト | 4.5:1以上 |
| フォーカス管理 | モーダル開閉時の適切な移動 |

📖 詳細: [ui-ux-design-principles.md](./ui-ux-design-principles.md)

---

## コンポーネント階層図

Desktop Renderer配下のコンポーネント構造を以下に示す。

### views/

| コンポーネント名       | 説明                           |
| ---------------------- | ------------------------------ |
| AgentExecutionView     | エージェント実行画面           |
| ChatView               | チャット画面                   |
| SkillCenterView        | ツール探索・追加・詳細表示画面 |
| SkillEditorView        | ツール編集専用画面（spec_created / 実装ファイル実在） |
| SkillAdvancedViews | 高度管理4ビュー（Chain/Schedule/Debug/Analytics） |

### components/organisms/

| コンポーネント名       | 説明                           |
| ---------------------- | ------------------------------ |
| AgentChatInterface     | エージェントチャットIF         |
| PermissionDialog       | 権限確認ダイアログ             |
| CommunityGraph         | コミュニティグラフ表示         |
| SplitLayout            | 左右分割レイアウト             |
| DiffPreview            | 差分プレビューモーダル         |
| SkillImportDialog      | スキルインポート確認ダイアログ |
| SkillAnalysisView      | スキル分析結果表示（ScoreDisplay / SuggestionList / RiskPanel） |
| SkillCreateWizard      | スキル作成ウィザード（4ステップ） |

### components/molecules/

| コンポーネント名       | 説明                           |
| ---------------------- | ------------------------------ |
| AgentMessageInput      | メッセージ入力フィールド       |
| AgentOutputStream      | 出力ストリーム表示             |
| FileContextBadge       | ファイルコンテキストバッジ     |
| EnvironmentSelector    | 環境選択セレクター             |

### features/

| パス                               | 説明                           |
| ---------------------------------- | ------------------------------ |
| workspace-chat-edit/components/    | ワークスペースチャット編集機能 |

---

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
| TASK-UI-05 | SkillCenterView（ツールを探す）実装（7コンポーネント + 2フック + 9テストファイル） | 2026-03-01 |
| TASK-10A-B | SkillAnalysisView（ScoreDisplay / SuggestionList / RiskPanel + useSkillAnalysis）実装 | 2026-03-02 |
| TASK-10A-C | SkillCreateWizard（4ステップUI + `useWizardStep` + `skill:create` 連携）実装 | 2026-03-02 |
| TASK-UI-05B | SkillAdvancedViews（SkillChainBuilder / ScheduleManager / DebugPanel / AnalyticsDashboard）実装（4ビュー + 共通IPC Hooks + テスト） | 2026-03-02 |

---

## TASK-UI-05B 実装完了記録

| タスクID | 機能名 | 状態 | 参照 |
| --- | --- | --- | --- |
| TASK-UI-05B-SKILL-ADVANCED-VIEWS | ツール高度管理ビュー群（3A SkillChainBuilder / 3B ScheduleManager / 3C DebugPanel / 3D AnalyticsDashboard） | completed（実装・テスト・画面検証完了） | `docs/30-workflows/completed-tasks/TASK-UI-05B-SKILL-ADVANCED-VIEWS/` |

### TASK-UI-05B 実装内容と苦戦箇所サマリー

| 観点 | 内容 |
| --- | --- |
| 実装内容 | 4ビュー導線（`ViewType`/`AppDock`/`App.tsx`）を追加し、Preload API（chain/schedule/debug/analytics）と統合 |
| 苦戦箇所1 | `verify-all-specs` warning ドリフト（依存Phase成果物参照不足） |
| 苦戦箇所2 | 画面証跡の鮮度不足（既存画像の存在確認で止まりやすい） |
| 苦戦箇所3 | 未タスク監査の `current/baseline` 誤読 |
| 詳細参照 | `ui-ux-feature-components.md` / `task-workflow.md` / `lessons-learned.md` の TASK-UI-05B 節 |

---

## TASK-10A-B 実装完了記録

| タスクID | 機能名 | 状態 | 参照 |
| --- | --- | --- | --- |
| TASK-10A-B | SkillAnalysisView（ScoreDisplay / SuggestionList / RiskPanel） | completed（実装・テスト・画面検証完了） | `docs/30-workflows/completed-tasks/skill-analysis-view/` |

### TASK-10A-B 実装内容と苦戦箇所サマリー

| 観点 | 内容 |
| --- | --- |
| 実装内容 | `SkillAnalysisView`・`ScoreDisplay`・`SuggestionList`・`RiskPanel`・`useSkillAnalysis` を実装し、分析/改善フローをUIへ統合 |
| 画面検証 | `outputs/phase-11/screenshots/TC-01`〜`TC-04` を 2026-03-02 に再取得して表示崩れ/状態遷移を確認 |
| a11y対応 | `SuggestionList` / `RiskPanel` の `role=\"list\"` に `aria-label` を追加 |
| デザイン整合 | `text-white` を `text-[var(--text-inverse)]` に統一 |
| 残課題 | Phase 10 MINOR 起点の未タスク 5 件（UT-TASK-10A-B-001〜005）を `docs/30-workflows/unassigned-task/` に登録 |
| 詳細参照 | `ui-ux-feature-components.md` / `task-workflow.md` の TASK-10A-B 節 |

---

## TASK-10A-C 実装完了記録

| タスクID | 機能名 | 状態 | 参照 |
| --- | --- | --- | --- |
| TASK-10A-C | SkillCreateWizard（Describe / Configure / Generate / Complete） | completed（実装・テスト・画面検証完了） | `docs/30-workflows/completed-tasks/skill-create-wizard/` |

### TASK-10A-C 実装内容と苦戦箇所サマリー

| 観点 | 内容 |
| --- | --- |
| 実装内容 | `SkillCreateWizard`、`useWizardStep`、`wizard/*`（StepIndicator/Describe/Configure/Generate/Complete）を実装し、`window.electronAPI.skill.create` へ連携 |
| 画面検証 | `outputs/phase-11/screenshots/TC-01`〜`TC-08` を 2026-03-02 に取得し、Dark/Light/Mobile + 生成中/完了/エラー状態を確認 |
| 契約整合 | `skill:create` を channels/whitelist/handler/preload の4層で同期 |
| テスト | `SkillCreateWizard.test.tsx` / `useWizardStep.test.ts` / `StepIndicator.test.tsx` と IPC関連テストで回帰確認 |
| 残課題 | Phase 10/11/12起点の未タスク検出は 0件（`unassigned-task-detection.md`） |
| 詳細参照 | `ui-ux-feature-components.md` / `task-workflow.md` の TASK-10A-C 節 |

---

## 仕様書作成済みタスク（spec_created）

| Task ID | 機能名 | 状態 | 仕様書 |
| --- | --- | --- | --- |
| TASK-UI-05A-SKILL-EDITOR-VIEW | SkillEditorView（ツールエディター） | spec_created（実装ファイル実在、統合未完了） | `docs/30-workflows/skill-editor-view/` |

### 画面検証証跡（TASK-UI-05A）

| 証跡 | ファイル |
| --- | --- |
| 現行 Dashboard 画面 | `docs/30-workflows/skill-editor-view/outputs/phase-11/screenshots/UI05A-01-current-dashboard.png` |
| 現行 Editor 画面 | `docs/30-workflows/skill-editor-view/outputs/phase-11/screenshots/UI05A-02-current-editor-view.png` |
| 再監査 Dashboard 画面（2026-03-02） | `docs/30-workflows/skill-editor-view/outputs/phase-11/screenshots/UI05A-03-current-dashboard-20260302.png` |
| 再監査 Editor 画面（2026-03-02） | `docs/30-workflows/skill-editor-view/outputs/phase-11/screenshots/UI05A-04-current-editor-20260302.png` |
| 手動検証結果 | `docs/30-workflows/skill-editor-view/outputs/phase-11/manual-test-result.md` |
| 発見課題 | `docs/30-workflows/skill-editor-view/outputs/phase-11/discovered-issues.md` |

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
| 2.13.9  | 2026-03-02 | TASK-10A-C 完了反映: 主要UI一覧/organisms一覧/完了タスクへ SkillCreateWizard を追加し、実装完了記録（4ステップUI、`skill:create` 契約、Phase 11 画面証跡 TC-01〜08、未タスク0件）を同期 |
| 2.13.8  | 2026-03-02 | TASK-10A-B 完了反映: 主要UI一覧/organisms一覧/完了タスクへ SkillAnalysisView を追加し、実装完了記録（画面証跡・a11y修正・未タスク5件）を同期 |
| 2.13.6  | 2026-03-02 | TASK-UI-05A 再監査反映: 状態を「実装ファイル実在・統合未完了」へ更新し、再取得した画面証跡（UI05A-03/04）を追加。未タスク正本を `docs/30-workflows/unassigned-task/` 配下へ統一 |
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
