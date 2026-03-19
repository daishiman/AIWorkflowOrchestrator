# コンポーネント UI/UX ガイドライン / core specification

> 親仕様書: [ui-ux-components.md](ui-ux-components.md)
> 役割: core specification

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
| 画面検証 | Phase 11 で screenshot 11件を current build static serve から取得し、Apple UI/UX 観点で `PASS` と判定した |
| 苦戦箇所1 | fuzzy search は一致判定と順位補正を混在させると false positive を生みやすい |
| 苦戦箇所2 | file read hang を Main 契約変更で解決しようとすると影響範囲が広いため、Renderer timeout / retry で閉じる方が安全だった |
| 苦戦箇所3 | JSON/YAML parse error を fatal error にすると preview UX が途切れるため、recoverable fallback に切り分ける必要があった |
| 仕様同期 | `ui-ux-components` / `ui-ux-feature-components` / `ui-ux-navigation` / `arch-state-management` / `api-ipc-system` / `security-electron-ipc` / `task-workflow` / `lessons-learned` を同一ターンで同期する |
| 詳細参照 | `ui-ux-feature-components.md` / `task-workflow.md` / `lessons-learned.md` の TASK-UI-04C 節 |

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
| 残課題 | current active set 6 件（UT-TASK-10A-B-002 / 004 / 005 / 006 / 007 / 009）を `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/` に維持し、完了済み 3 件（001 / 003 / 008）は `completed-tasks` へ移管 |
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

