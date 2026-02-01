# 統合要件定義書

## 機能要件

| ID   | 要件                                                     | 対応コンポーネント        |
| ---- | -------------------------------------------------------- | ------------------------- |
| FR-1 | SkillSelectorをChatPanelヘッダーに配置する               | ChatPanel + SkillSelector |
| FR-2 | SkillStreamingViewで実行結果をリアルタイム表示する       | SkillStreamingView        |
| FR-3 | StatusBadgeでステータスを表示する（6種類の色分け）       | StatusBadge               |
| FR-4 | ToolExecutionHistoryでツール実行履歴を折りたたみ表示する | ToolExecutionHistory      |
| FR-5 | SkillImportDialogをインポート要求時に表示する            | SkillImportDialog         |
| FR-6 | PermissionDialogを権限確認時にオーバーレイ表示する       | PermissionDialog          |
| FR-7 | 実行中止ボタンでabortExecutionを呼び出す                 | SkillStreamingView        |
| FR-8 | 実行完了後に通常チャットモードに復帰する                 | ChatPanel                 |

## 非機能要件

| ID    | 要件                                     | 検証方法                        |
| ----- | ---------------------------------------- | ------------------------------- |
| NFR-1 | 既存チャット機能に影響を与えない         | 既存テスト57件が全てPASS        |
| NFR-2 | WCAG 2.1 AAアクセシビリティ準拠          | aria-live, role, フォーカス管理 |
| NFR-3 | TypeScript strict型安全性の維持          | tsc --noEmit エラーゼロ         |
| NFR-4 | Line Coverage 95%+, Branch Coverage 85%+ | vitest --coverage               |
| NFR-5 | 既存テスト57件が全てPASS                 | pnpm test                       |

## 受け入れ基準マッピング

| AC    | 要件                                           | FR/NFR | 検証方法             |
| ----- | ---------------------------------------------- | ------ | -------------------- |
| AC-1  | SkillSelectorがChatPanelヘッダーに配置         | FR-1   | コンポーネントテスト |
| AC-2  | スキル名がヘッダーに表示                       | FR-1   | コンポーネントテスト |
| AC-3  | ストリーミング表示が動作                       | FR-2   | コンポーネントテスト |
| AC-4  | assistantメッセージがリアルタイム表示          | FR-2   | コンポーネントテスト |
| AC-5  | tool_use/tool_resultが適切に表示               | FR-2   | コンポーネントテスト |
| AC-6  | 停止ボタンがabortExecutionを呼び出す           | FR-7   | コンポーネントテスト |
| AC-7  | PermissionDialogがpendingPermission時に表示    | FR-6   | コンポーネントテスト |
| AC-8  | SkillImportDialogがimportDialogSkill設定時表示 | FR-5   | コンポーネントテスト |
| AC-9  | 既存チャット機能に影響なし                     | NFR-1  | 手動テスト           |
| AC-10 | キャンセル→cancelled遷移→UIリセット            | FR-7   | コンポーネントテスト |
| AC-11 | エラー状態が適切に表示                         | FR-2   | コンポーネントテスト |
| AC-12 | 完了後に通常チャットモード復帰                 | FR-8   | コンポーネントテスト |
| AC-13 | WCAG 2.1 AA準拠                                | NFR-2  | a11yテスト           |

## 統合テスト観点

| カテゴリ           | テスト観点                                                    |
| ------------------ | ------------------------------------------------------------- |
| データフロー       | SkillSlice → ChatPanel → SkillStreamingViewのデータフロー     |
| 状態同期           | skillExecutionStatus/isExecutingの状態変更がUIに反映されるか  |
| コンポーネント連携 | SkillSelectorのonImportRequestがSkillImportDialogを表示するか |
| 権限フロー         | pendingPermission発生時にPermissionDialogが表示されるか       |
| エラーハンドリング | skillError発生時にエラーメッセージが表示されるか              |

## ファイル変更一覧

| 操作 | パス                                                                               |
| ---- | ---------------------------------------------------------------------------------- |
| 修正 | `apps/desktop/src/renderer/components/chat/ChatPanel.tsx`                          |
| 作成 | `apps/desktop/src/renderer/components/skill/SkillStreamingView.tsx`                |
| 修正 | `apps/desktop/src/renderer/components/skill/index.ts`                              |
| 作成 | `apps/desktop/src/renderer/components/skill/__tests__/SkillStreamingView.test.tsx` |
| 修正 | `apps/desktop/src/renderer/components/chat/__tests__/ChatPanel.test.tsx`           |
