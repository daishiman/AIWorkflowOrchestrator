# TASK-7D 統合要件定義書

## 分析日: 2026-01-30

## 機能要件（FR）

| ID   | 要件                                                                                       | 優先度 |
| ---- | ------------------------------------------------------------------------------------------ | ------ |
| FR-1 | SkillSelector を ChatPanel ヘッダーに配置する（ModelSelector の隣）                        | 必須   |
| FR-2 | SkillStreamingView で実行結果をリアルタイム表示する                                        | 必須   |
| FR-3 | StatusBadge でステータスを表示する（running/permission_pending/completed/cancelled/error） | 必須   |
| FR-4 | ToolExecutionHistory でツール実行履歴を折りたたみ表示する                                  | 必須   |
| FR-5 | SkillImportDialog をインポート要求時に表示する                                             | 必須   |
| FR-6 | PermissionDialog を権限確認時に表示する（Store-direct）                                    | 必須   |
| FR-7 | 実行中止ボタンで abortExecution を呼び出す                                                 | 必須   |

## 非機能要件（NFR）

| ID    | 要件                                                             |
| ----- | ---------------------------------------------------------------- |
| NFR-1 | 既存チャット機能（通常チャット、ストリーミング）に影響を与えない |
| NFR-2 | アクセシビリティ（WCAG 2.1 AA）準拠: role, aria-live, aria-label |
| NFR-3 | TypeScript 型安全性の維持: any 型不使用、exhaustive check        |

## 統合テスト観点

| カテゴリ           | テスト観点                                                    |
| ------------------ | ------------------------------------------------------------- |
| データフロー       | SkillSlice → ChatPanel → SkillStreamingView のデータフロー    |
| 状態同期           | skillExecutionStatus/isExecuting の状態変更が UI に反映       |
| コンポーネント連携 | SkillSelector → setImportDialogSkill → SkillImportDialog 表示 |
| 権限フロー         | pendingPermission 発生時に PermissionDialog が表示            |

## 受け入れ基準

| ID    | 基準                                                        | 検証方法             |
| ----- | ----------------------------------------------------------- | -------------------- |
| AC-1  | SkillSelector が ChatPanel ヘッダーに配置されている         | コンポーネントテスト |
| AC-2  | スキル選択時にスキル名がヘッダーに表示される                | コンポーネントテスト |
| AC-3  | スキル実行中にストリーミング表示が動作する                  | コンポーネントテスト |
| AC-4  | assistant メッセージがリアルタイム表示される                | コンポーネントテスト |
| AC-5  | tool_use/tool_result が適切に表示される                     | コンポーネントテスト |
| AC-6  | 「停止する」ボタンが abortExecution を呼び出す              | コンポーネントテスト |
| AC-7  | 権限確認ダイアログが pendingPermission 存在時に表示される   | コンポーネントテスト |
| AC-8  | インポートダイアログが importDialogSkill 設定時に表示される | コンポーネントテスト |
| AC-9  | 既存のチャット機能に影響がない                              | 手動テスト           |
| AC-10 | コンポーネントテストが全て通過する                          | 自動テスト           |
