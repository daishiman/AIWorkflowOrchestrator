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

### Molecules コンポーネント実装状況

| コンポーネント | タスクID | ステータス | 実装パス |
|---|---|---|---|
| SearchBar | TASK-UI-00-MOLECULES | completed（実装・テスト完了） | `apps/desktop/src/renderer/components/molecules/SearchBar/` |
| CodeViewer | TASK-UI-00-MOLECULES | completed（実装・テスト完了） | `apps/desktop/src/renderer/components/molecules/CodeViewer/` |
| TabSwitcher | TASK-UI-00-MOLECULES | completed（実装・テスト完了） | `apps/desktop/src/renderer/components/molecules/TabSwitcher/` |
| SlideInPanel | TASK-UI-00-MOLECULES | completed（実装・テスト完了） | `apps/desktop/src/renderer/components/molecules/SlideInPanel/` |
| ConfirmDialog | TASK-UI-00-MOLECULES | completed（実装・テスト完了） | `apps/desktop/src/renderer/components/molecules/ConfirmDialog/` |

### Organisms コンポーネント実装状況

| コンポーネント | タスクID | ステータス | 実装パス |
|---|---|---|---|
| CardGrid | TASK-UI-00-ORGANISMS | completed（実装・テスト完了） | `apps/desktop/src/renderer/components/organisms/CardGrid/` |
| MasterDetailLayout | TASK-UI-00-ORGANISMS | completed（実装・テスト完了） | `apps/desktop/src/renderer/components/organisms/MasterDetailLayout/` |
| SearchFilterList | TASK-UI-00-ORGANISMS | completed（実装・テスト完了） | `apps/desktop/src/renderer/components/organisms/SearchFilterList/` |
| AppLayout | TASK-UI-02 | completed（実装・テスト完了） | `apps/desktop/src/renderer/components/organisms/AppLayout/` |
| GlobalNavStrip | TASK-UI-02 | completed（実装・テスト完了） | `apps/desktop/src/renderer/components/organisms/GlobalNavStrip/` |
| MobileNavBar | TASK-UI-02 | completed（実装・テスト完了） | `apps/desktop/src/renderer/components/organisms/MobileNavBar/` |
| NotificationCenter | TASK-UI-08 | completed（実装・テスト・画面検証完了） | `apps/desktop/src/renderer/components/organisms/NotificationCenter/` |
| SkillChip | TASK-UI-03 | completed（実装・テスト完了） | `apps/desktop/src/renderer/components/organisms/AgentView/SkillChip.tsx` |
| ExecuteButton | TASK-UI-03 | completed（実装・テスト完了） | `apps/desktop/src/renderer/components/organisms/AgentView/ExecuteButton.tsx` |
| FloatingExecutionBar | TASK-UI-03 | completed（実装・テスト完了） | `apps/desktop/src/renderer/components/organisms/AgentView/FloatingExecutionBar.tsx` |
| AdvancedSettingsPanel | TASK-UI-03 | completed（実装・テスト完了） | `apps/desktop/src/renderer/components/organisms/AgentView/AdvancedSettingsPanel.tsx` |
| RecentExecutionList | TASK-UI-03 | completed（実装・テスト完了） | `apps/desktop/src/renderer/components/organisms/AgentView/RecentExecutionList.tsx` |

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
| AppLayout | TASK-UI-02 | グローバルナビと header/main を統合するテンプレート |
| GlobalNavStrip | TASK-UI-02 | desktop/tablet の global navigation |
| MobileNavBar | TASK-UI-02 | mobile の下部 global navigation |
| NotificationCenter | TASK-UI-08 | Bell から開く通知 utility popover / overlay |
| ComingSoonView | TASK-UI-02 | 未実装ビュー導線の退避表示 |
| CardGrid / MasterDetailLayout / SearchFilterList | TASK-UI-00-ORGANISMS | 再利用可能な汎用Organisms（カード表示・マスター詳細・検索フィルタ） |
| SkillChip | TASK-UI-03 | AIツール選択用丸型チップ（role="radio"、80x80px） |
| ExecuteButton | TASK-UI-03 | 選択ツール実行ボタン（未選択時disabled） |
| FloatingExecutionBar | TASK-UI-03 | 実行中フローティングステータスバー（z-index: 50） |
| AdvancedSettingsPanel | TASK-UI-03 | 右スライドイン詳細設定パネル（z-index: 40、ESC閉じ） |
| RecentExecutionList | TASK-UI-03 | 最近の実行履歴表示（最大3件、相対時間・ステータスアイコン） |

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
| SkillChip              | AIツール選択用丸型チップ（80x80px、role="radio"） |
| ExecuteButton          | 選択ツール実行ボタン             |
| FloatingExecutionBar   | 実行中フローティングステータスバー |
| AdvancedSettingsPanel  | 右スライドイン詳細設定パネル     |
| RecentExecutionList    | 最近の実行履歴表示（最大3件）    |

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
| TASK-UI-03 | AgentView Enhancement（SkillChip / ExecuteButton / FloatingExecutionBar / AdvancedSettingsPanel / RecentExecutionList、136テスト） | 2026-03-10 |
| TASK-UI-08 | NotificationCenter（Bell utility action / Portal / relative time / delete reveal / screenshot 7件） | 2026-03-11 |

---

## TASK-UI-04C 実装完了記録

| タスクID | 機能名 | 状態 | 参照 |
| --- | --- | --- | --- |
| TASK-UI-04C-WORKSPACE-PREVIEW | Workspace PreviewPanel / QuickFileSearch | completed（実装・テスト・画面検証・Phase 12 同期完了） | `docs/30-workflows/completed-tasks/task-059b-ui-04c-workspace-preview-quicksearch/` |

### TASK-UI-04C 実装内容と苦戦箇所サマリー

| 観点 | 内容 |
| --- | --- |
| 実装内容 | `PreviewPanel` に `Source` / `Preview` 切替、structured preview、image preview、toolbar、error boundary を追加し、`QuickFileSearch` を `Cmd/Ctrl+P` dialog として実装した |
| 状態管理 | 04A の `workspaceSlice` / `fileSelectionSlice` を再利用し、preview loading/error と quick search query は local state に閉じた |
| IPC | 新規 channel は追加せず、`file:read` と `file:changed` の再利用で preview 更新を実現した |
| 画面検証 | 初回 Phase 11 で screenshot 11件を current build static serve から取得し、follow-up では screenshot 5件を `external-dev-server` から再取得して Apple UI/UX 観点で再確認した |
| 苦戦箇所1 | fuzzy search は一致判定と順位補正を混在させると false positive を生みやすい |
| 苦戦箇所2 | file read hang を Main 契約変更で解決しようとすると影響範囲が広いため、Renderer timeout / retry で閉じる方が安全だった |
| 苦戦箇所3 | JSON/YAML parse error を fatal error にすると preview UX が途切れるため、recoverable fallback に切り分ける必要があった |
| 仕様同期 | `ui-ux-components` / `ui-ux-feature-components` / `ui-ux-navigation` / `arch-state-management` / `api-ipc-system` / `security-electron-ipc` / `task-workflow` / `lessons-learned` を同一ターンで同期する |
| 詳細参照 | `ui-ux-feature-components.md` / `task-workflow.md` / `lessons-learned.md` の TASK-UI-04C 節 |

### TASK-UI-04C follow-up 実装追補（2026-03-13）

| 観点 | 内容 |
| --- | --- |
| helper 抽出 | `quickFileSearchResilience.ts` と `previewResilience.ts` を追加し、`score > 0` gate、stable sort、timeout/retry、typed taxonomy を view から分離した |
| visual polish | no-match helper text を empty state card に昇格し、timeout alert の retry action を primary emphasis に更新した |
| 追補検証 | `TC-11-02` と `TC-11-05` を含む screenshot 5件を再取得し、dark helper text の可読性と retry action の affordance を再確認した |

---

## TASK-UI-08 実装完了記録

| タスクID | 機能名 | 状態 | 参照 |
| --- | --- | --- | --- |
| TASK-UI-08-NOTIFICATION-CENTER | NotificationCenter 058e UX 再整備 | completed（実装・テスト・画面検証・Phase 12 再監査完了） | `docs/30-workflows/completed-tasks/task-058e-ui-08-notification-center/` |

### TASK-UI-08 実装内容と苦戦箇所サマリー

| 観点 | 内容 |
| --- | --- |
| 実装内容 | `NotificationCenter` を `お知らせ` 文言、relative time、Portal、responsive overlay、delete reveal、focus trap を備えた utility popover として再整備した |
| 状態管理 | `notificationSlice` の dedupe、unread count、delete 時 `expandedNotificationId` reset を整理した |
| IPC | `notification:delete` を shared / preload / main の3境界へ追加し、個別削除を persistence と接続した |
| 画面検証 | Phase 11 で desktop / tablet / mobile / empty / delete reveal を screenshot 7件で確認し、Apple UI/UX 観点で `PASS` と判定した |
| 苦戦箇所1 | utility action は feature doc だけでなく `ui-ux-components` / `ui-ux-navigation` / `ui-ux-portal-patterns` にも同期しないと探索導線が分散する |
| 苦戦箇所2 | Phase 11 validator は `証跡` 列と `画面カバレッジマトリクス` を前提にするため、文書見出しのわずかなずれでも false fail になる |
| 苦戦箇所3 | delete affordance は自動テストだけでは視覚品質が確定しないため、実画面証跡が必要だった |
| 仕様同期 | UI系は `ui-ux-components` / `ui-ux-feature-components` / `ui-ux-navigation` / `ui-ux-portal-patterns` / `arch-state-management` / `task-workflow` / `lessons-learned` を同一ターンで同期する |
| 詳細参照 | `ui-ux-feature-components.md` / `ui-ux-navigation.md` / `ui-ux-portal-patterns.md` / `task-workflow.md` / `lessons-learned.md` の TASK-UI-08 節 |

---

## TASK-UI-07 実装完了記録

| タスクID | 機能名 | 状態 | 参照 |
| --- | --- | --- | --- |
| TASK-UI-07-DASHBOARD-ENHANCEMENT | DashboardView ホーム画面リデザイン（挨拶 / サジェスチョン / タイムライン + screenshot harness） | completed（実装・テスト・画面検証・Phase 12 同期完了） | `docs/30-workflows/completed-tasks/task-058d-ui-07-dashboard-enhancement/` |

### TASK-UI-07 実装内容と苦戦箇所サマリー

| 観点 | 内容 |
| --- | --- |
| 実装内容 | `DashboardView` をホーム画面へ再設計し、`GreetingHeader` / `DashboardSuggestionSection` / `RecentTimeline` を追加した |
| 変更範囲 | `DashboardView`、view-local components、`dashboardContent.ts`、Phase 11 screenshot harness |
| テスト/証跡 | 22 tests PASS、typecheck PASS、Phase 11 screenshot TC-11-01〜05、Apple UI/UX 観点レビュー |
| 苦戦箇所1 | 表示名 `ホーム` と内部 `dashboard` 契約を分離しないと nav/store へ波及する |
| 苦戦箇所2 | completed workflow でも `index.md` / `artifacts.json` / `phase-1..12` の stale が残りやすい |
| 苦戦箇所3 | dual skill-root repository では canonical root を固定しないと mirror 側が stale になる |
| 簡潔解決 | UI copy と内部契約を分離し、workflow 三層同期と mirror sync を同一ターンで閉じる |
| 詳細参照 | `ui-ux-feature-components.md` / `task-workflow.md` / `lessons-learned.md` の TASK-UI-07 節 |

---

## TASK-UI-03 実装完了記録

| タスクID | 機能名 | 状態 | 参照 |
| --- | --- | --- | --- |
| TASK-UI-03-AGENT-VIEW-ENHANCEMENT | AgentView Enhancement（Tap & Discover リデザイン） | completed（実装・テスト・画面検証・Phase 12 再監査完了） | `docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement/` |

### TASK-UI-03 実装内容と苦戦箇所サマリー

| 観点 | 内容 |
| --- | --- |
| 実装内容 | `SkillChip` / `ExecuteButton` / `FloatingExecutionBar` / `AdvancedSettingsPanel` / `RecentExecutionList` を追加し、`AgentView` をシングルカラム・3セマンティックリージョンへ再構成した |
| 状態管理 | `agentSlice` に recent history と advanced settings state を追加し、個別 selector と回帰テストで P31 系の再レンダー不安定を抑えた |
| 型整理 | `types.ts` を新設し、`ImportedSkill` / `SkillMetadata` / view 用 `Skill` の橋渡しを adapter helper に寄せて `as unknown as Skill[]` を解消した |
| 画面検証 | Phase 11 dedicated harness と screenshot で light / dark / panel / floating / recent states を再現し、主要 UI は Apple HIG 観点で Go と判定した |
| 苦戦箇所1 | view 層で扱う `Skill` と import 元の `ImportedSkill` / `SkillMetadata` の責務がずれ、型アサーションで逃げやすかった |
| 苦戦箇所2 | App shell 経由では screenshot 用 state 再現が揺れやすく、目的状態だけを固定した harness が必要だった |
| 苦戦箇所3 | light theme の副次テキスト所見が AgentView 固有か token 基盤か混線しやすく、component scope と token scope の切り分けが必要だった |
| 仕様同期 | `ui-ux-components` / `ui-ux-feature-components` / `arch-ui-components` / `ui-ux-design-system` / `task-workflow` / `lessons-learned` を同一ターンで同期する |
| 簡潔解決 | view 型は adapter helper で閉じる → screenshot は dedicated harness で state 固定 → 所見は component/token に切り分ける → 未タスク化と system spec 同期を同時に閉じる |
| 詳細参照 | `ui-ux-feature-components.md` / `arch-ui-components.md` / `task-workflow.md` / `lessons-learned.md` の TASK-UI-03 節 |

---

## TASK-UI-02 実装完了記録

| タスクID | 機能名 | 状態 | 参照 |
| --- | --- | --- | --- |
| TASK-UI-02-GLOBAL-NAV-CORE | グローバルナビゲーション基盤（GlobalNavStrip / MobileNavBar / AppLayout / rollback feature flag） | completed（Step 1/2 実装・テスト・画面検証完了。Step 3 は readiness 管理） | `docs/30-workflows/completed-tasks/task-057-ui-02-global-nav-core/` |

### TASK-UI-02 実装内容と苦戦箇所サマリー

| 観点 | 内容 |
| --- | --- |
| 実装内容 | `GlobalNavStrip` / `MobileNavBar` / `MoreMenu` / `AppLayout` / `ComingSoonView` / `useNavShortcuts` を追加し、`App.tsx` を feature flag で新旧切替可能にした。mobile 下部バーは `mobileLabel` で短縮表示する |
| 状態管理 | `uiSlice` に `isNavExpanded` / `isMobileMoreOpen` を追加し、store hooks を個別 selector で公開 |
| テスト | targeted 7ファイル 100 tests PASS、typecheck PASS、task scope coverage は全基準達成 |
| 画面検証 | Phase 11 で desktop/tablet/mobile の 5視覚状態 + 2非視覚TC を確認し、再監査で `mobileLabel` 追補後の視覚 Go を再確認 |
| 苦戦箇所1 | repo-wide coverage threshold が task scope 品質と無関係に fail して見える |
| 苦戦箇所2 | rollback safety のため `AppDock` を残しつつ SoC を維持する必要があった |
| 苦戦箇所3 | mobile More の overlay 品質は自動テストだけでは確定できず、画面証跡が必須だった |
| 苦戦箇所4 | mobile tab bar の正式ラベルは小画面で切れやすく、可視ラベルと `aria-label` の分離が必要だった |
| 苦戦箇所5 | `phase-12-documentation.md` / `artifacts.json` / `outputs/artifacts.json` / `index.md` だけでなく workflow 本文 `phase-1..11` も同一ターンで同期しないと completed 表示後に stale が残る |
| 仕様同期 | UI系は `ui-ux-components` / `ui-ux-feature-components` / `ui-ux-navigation` / `arch-state-management` / `task-workflow` / `lessons-learned` を同一ターンで更新する |
| 簡潔解決 | `navContract` 正本化 → layout/nav/shortcut/state 分離 → `mobileLabel` + screenshot 確認 → repo-wide/task-scope 分離記録 → UI仕様群 + workflow本文同期 の順で閉じる |
| 詳細参照 | `ui-ux-navigation.md` / `arch-state-management.md` / `task-workflow.md` / `lessons-learned.md` の TASK-UI-02 節 |

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
| 画面検証 | `outputs/phase-11/screenshots/TC-01`〜`TC-04` を 2026-03-02 に再取得し、2026-03-06 再監査で dark/light/mobile/error/loading を含む 8 ケースへ拡張確認 |
| a11y対応 | `SuggestionList` / `RiskPanel` の `role=\"list\"` に `aria-label` を追加 |
| デザイン整合 | `text-white` を `text-[var(--text-inverse)]` に統一 |
| 再監査追補 | `useSkillAnalysis` の mount/unmount 制御を補正し、React StrictMode でも分析完了後にローディングが解除されることを確認 |
| 残課題 | current active set 6 件（UT-TASK-10A-B-002 / 004 / 005 / 006 / 007 / 009）を `docs/30-workflows/unassigned-task/` に維持し、完了済み 3 件（001 / 003 / 008）は `completed-tasks` へ移管 |
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

## TASK-10A-D 実装完了記録

| タスクID | 機能名 | 状態 | 参照 |
| --- | --- | --- | --- |
| TASK-10A-D-SKILL-LIFECYCLE-UI-INTEGRATION | スキルライフサイクルUI統合（SkillManagementPanel ビュー統合 + ChatPanel導線追加） | completed（実装・テスト・画面検証完了） | `docs/30-workflows/completed-tasks/TASK-10A-D-SKILL-LIFECYCLE-UI-INTEGRATION/` |

### TASK-10A-D 実装内容と苦戦箇所サマリー

| 観点 | 内容 |
| --- | --- |
| 実装内容 | SkillManagementPanelの「準備中」プレースホルダーをSkillAnalysisView/SkillCreateWizardに差替、ChatPanelにスキル管理パネルトグルボタンを追加、agentSliceに5アクション+3状態フィールド+8個別セレクタを拡張 |
| 苦戦箇所1 | `applySkillImprovements`の引数型を当初`unknown[]`で定義したが、Preload APIの型定義と不整合が発生。`@repo/shared/types/skill-improver`から`Suggestion`型を正しくインポートすることで解決 |
| 苦戦箇所2 | P40（テスト実行ディレクトリ依存）が再発。`cd apps/desktop`せずにテスト実行すると`@testing-library/jest-dom`のmatcherが読み込まれず全テスト失敗 |
| 苦戦箇所3 | PostToolUseフック（Prettier/ESLint自動修正）がファイル変更し、後続のEdit文字列マッチが失敗するP11パターンが発生 |

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

### 画面検証証跡（TASK-UI-00-MOLECULES）

| 証跡 | ファイル |
| --- | --- |
| dark 初期表示 | `docs/30-workflows/completed-tasks/task-ui-00-molecules/outputs/phase-11/screenshots/TC-01-skill-center-default-dark.png` |
| dark 検索状態 | `docs/30-workflows/completed-tasks/task-ui-00-molecules/outputs/phase-11/screenshots/TC-02-skill-center-search-dark.png` |
| light 初期表示 | `docs/30-workflows/completed-tasks/task-ui-00-molecules/outputs/phase-11/screenshots/TC-03-skill-center-default-light.png` |
| mobile 初期表示 | `docs/30-workflows/completed-tasks/task-ui-00-molecules/outputs/phase-11/screenshots/TC-04-skill-center-default-mobile-dark.png` |
| 再撮影時刻（同期済み） | `2026-03-04 18:04 JST` |
| 手動検証結果 | `docs/30-workflows/completed-tasks/task-ui-00-molecules/outputs/phase-11/manual-test-result.md` |
| 発見課題 | `docs/30-workflows/completed-tasks/task-ui-00-molecules/outputs/phase-11/discovered-issues.md` |

---

### 画面検証証跡（TASK-UI-00-ORGANISMS）

| 証跡 | ファイル |
| --- | --- |
| dark desktop（全体） | `docs/30-workflows/completed-tasks/task-054-ui-00-4-organisms-components/outputs/phase-11/screenshots/TC-01-organisms-default-dark-desktop.png` |
| dark desktop（検索 + フィルタ） | `docs/30-workflows/completed-tasks/task-054-ui-00-4-organisms-components/outputs/phase-11/screenshots/TC-02-search-filter-active-dark-desktop.png` |
| dark desktop（CardGrid loading） | `docs/30-workflows/completed-tasks/task-054-ui-00-4-organisms-components/outputs/phase-11/screenshots/TC-03-cardgrid-loading-dark-desktop.png` |
| light desktop（CardGrid empty） | `docs/30-workflows/completed-tasks/task-054-ui-00-4-organisms-components/outputs/phase-11/screenshots/TC-04-cardgrid-empty-light-desktop.png` |
| dark mobile（MasterDetail overlay） | `docs/30-workflows/completed-tasks/task-054-ui-00-4-organisms-components/outputs/phase-11/screenshots/TC-05-master-detail-mobile-dialog-dark.png` |
| dark mobile（SearchFilter grid） | `docs/30-workflows/completed-tasks/task-054-ui-00-4-organisms-components/outputs/phase-11/screenshots/TC-06-search-grid-mobile-dark.png` |
| 再撮影時刻（同期済み） | `2026-03-04 23:24 JST` |
| 手動検証結果 | `docs/30-workflows/completed-tasks/task-054-ui-00-4-organisms-components/outputs/phase-11/manual-test-result.md` |
| 発見課題 | `docs/30-workflows/completed-tasks/task-054-ui-00-4-organisms-components/outputs/phase-11/discovered-issues.md` |

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
| 2.16.7  | 2026-03-13 | UT-IMP-WORKSPACE-PREVIEW-SEARCH-RESILIENCE-GUARD-001 再監査反映: TASK-UI-04C サマリーへ helper 抽出、`external-dev-server` screenshot 5件、empty state / retry action の visual polish を追補し、一覧 spec から follow-up 実績を辿れるようにした |
| 2.16.6  | 2026-03-11 | TASK-UI-04C 完了反映: `TASK-UI-04C 実装完了記録` を追加し、`PreviewPanel` / `QuickFileSearch` / renderer timeout+retry / current build screenshot 11件 / Apple UI/UX review を UI カタログ正本へ同期 |
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
