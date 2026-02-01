# TASK-7D: ChatPanel + Agent Execution統合 - タスク仕様書

## メタ情報

| 項目       | 内容                                                                   |
| ---------- | ---------------------------------------------------------------------- |
| タスクID   | TASK-7D                                                                |
| タスク名   | ChatPanel + Agent Execution統合                                        |
| Issue      | [#593](https://github.com/daishiman/AIWorkflowOrchestrator/issues/593) |
| タスク種別 | feat                                                                   |
| 分類       | 改善                                                                   |
| 対象機能   | Agent Execution UI / ChatPanel                                         |
| 依存タスク | TASK-7A, TASK-7B, TASK-7C, TASK-6-1, TASK-5-1                          |
| 優先度     | 高                                                                     |
| 複雑度     | 中規模                                                                 |
| タグ       | frontend, renderer, ui, integration, zustand                           |
| 作成日     | 2026-01-31                                                             |

## 概要

既存のChatPanelにTASK-7A（SkillSelector）、TASK-7B（SkillImportDialog）、TASK-7C（PermissionDialog）を統合し、スキル実行結果のストリーミング表示（SkillStreamingView）を実装する。ユーザーがChatPanel上からスキルの選択・実行・対話・権限確認を一貫して行えるエンドツーエンドのフローを構築する。

## スコープ

### 含む

- ChatPanelコンポーネントへのAgent Execution機能統合
- AgentExecutionView → ChatPanel間の状態連携
- skillSlice/agentSliceの統合利用
- SkillSelector表示トリガーの実装（ツールバーボタン）
- SkillStreamingViewコンポーネントの新規作成
- ストリーミング出力のChatPanel内リアルタイム表示
- PermissionDialogのChatPanel内モーダル表示
- SkillImportDialogのChatPanelからの表示制御
- ステータスバッジ表示（idle/running/permission_pending/completed/cancelled/error）
- ツール実行履歴の折りたたみ表示
- 実行中止ボタンの実装
- skill/index.tsのエクスポート更新
- 統合テスト（E2Eレベル）の作成

### 含まない

- SkillSelector、PermissionDialog、SkillStreamDisplay等の個別コンポーネント修正（既存機能の変更は最小限）
- Main Process側のSkillExecutor修正
- IPC通信プロトコルの変更
- 新しいPreload APIの追加（既存のwindow.skillAPI/window.agentAPIを使用）
- バックエンド（Mainプロセス）の変更
- IPCチャネルの変更

## 前提条件

| 条件                                                 | ステータス |
| ---------------------------------------------------- | ---------- |
| TASK-7A（SkillSelector）完了                         | 完了       |
| TASK-7B（SkillImportDialog）完了                     | 完了       |
| TASK-7C（PermissionDialog）完了                      | 完了       |
| TASK-IMP-permission-tool-icons（ツールアイコン）完了 | 完了       |
| TASK-6-1（SkillSlice Zustand）完了                   | 完了       |
| TASK-5-1（SkillAPI Preload）完了                     | 完了       |
| Zustandストアにskillsliceが統合済み                  | 完了       |
| 共有型定義がpackages/sharedに存在                    | 完了       |

## 受け入れ基準

| ID    | 基準                                                                         | 検証方法               |
| ----- | ---------------------------------------------------------------------------- | ---------------------- |
| AC-1  | SkillSelectorがChatPanelヘッダーに配置されている                             | コンポーネントテスト   |
| AC-2  | スキル選択時にスキル名がヘッダーに表示される                                 | コンポーネントテスト   |
| AC-3  | スキル実行中にストリーミング表示が動作する                                   | コンポーネントテスト   |
| AC-4  | assistantメッセージがリアルタイム表示される                                  | コンポーネントテスト   |
| AC-5  | tool_use/tool_resultが適切に表示される                                       | コンポーネントテスト   |
| AC-6  | 「停止する」ボタンがabortExecutionを呼び出す                                 | コンポーネントテスト   |
| AC-7  | 権限確認ダイアログがpendingPermission存在時に表示される                      | コンポーネントテスト   |
| AC-8  | インポートダイアログがimportDialogSkill設定時に表示される                    | コンポーネントテスト   |
| AC-9  | 既存のチャット機能（通常チャット、ストリーミング）に影響がない               | 手動テスト             |
| AC-10 | 実行キャンセルが正常に動作し、状態がcancelledに遷移してUIがリセットされる    | コンポーネントテスト   |
| AC-11 | エラー状態が適切に表示される                                                 | コンポーネントテスト   |
| AC-12 | 実行完了後に通常チャットモードに戻れる                                       | コンポーネントテスト   |
| AC-13 | WCAG 2.1 AAアクセシビリティ準拠（aria-live、フォーカス管理、キーボードナビ） | アクセシビリティテスト |

## Phase一覧

| Phase | 名称                 | カテゴリ     | 仕様書                                                     |
| ----- | -------------------- | ------------ | ---------------------------------------------------------- |
| 1     | 要件定義             | 要件         | [phase-1-requirements.md](phase-1-requirements.md)         |
| 2     | 設計                 | 設計         | [phase-2-design.md](phase-2-design.md)                     |
| 3     | 設計レビューゲート   | ゲート       | [phase-3-review-gate.md](phase-3-review-gate.md)           |
| 4     | テスト作成           | TDD-Red      | [phase-4-test-creation.md](phase-4-test-creation.md)       |
| 5     | 実装                 | TDD-Green    | [phase-5-implementation.md](phase-5-implementation.md)     |
| 6     | テスト拡充           | 品質         | [phase-6-test-enhancement.md](phase-6-test-enhancement.md) |
| 7     | テストカバレッジ確認 | 品質         | [phase-7-coverage.md](phase-7-coverage.md)                 |
| 8     | リファクタリング     | TDD-Refactor | [phase-8-refactoring.md](phase-8-refactoring.md)           |
| 9     | 品質保証             | 品質         | [phase-9-quality.md](phase-9-quality.md)                   |
| 10    | 最終レビューゲート   | ゲート       | [phase-10-final-review.md](phase-10-final-review.md)       |
| 11    | 手動テスト検証       | 検証         | [phase-11-manual-test.md](phase-11-manual-test.md)         |
| 12    | ドキュメント更新     | 文書化       | [phase-12-documentation.md](phase-12-documentation.md)     |
| 13    | PR作成               | 完了         | [phase-13-pr-creation.md](phase-13-pr-creation.md)         |

## ファイル一覧

| 操作 | パス                                                                               |
| ---- | ---------------------------------------------------------------------------------- |
| 修正 | `apps/desktop/src/renderer/components/chat/ChatPanel.tsx`                          |
| 作成 | `apps/desktop/src/renderer/components/skill/SkillStreamingView.tsx`                |
| 修正 | `apps/desktop/src/renderer/components/skill/index.ts`                              |
| 作成 | `apps/desktop/src/renderer/components/skill/__tests__/SkillStreamingView.test.tsx` |
| 修正 | `apps/desktop/src/renderer/components/chat/__tests__/ChatPanel.test.tsx`           |

## 参考資料

| 資料                              | パス                                                                                        |
| --------------------------------- | ------------------------------------------------------------------------------------------- |
| 状態管理アーキテクチャ            | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                |
| Agent SDK UI仕様                  | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-ui.md`              |
| Agent SDK履歴                     | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-history.md`         |
| Agent Execution UI仕様            | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md`                |
| SkillSlice実装                    | `apps/desktop/src/renderer/store/slices/skillSlice.ts`                                      |
| agentSlice実装                    | `apps/desktop/src/renderer/store/slices/agentSlice.ts`                                      |
| PermissionDialog実装              | `apps/desktop/src/renderer/components/skill/PermissionDialog.tsx`                           |
| SkillSelector実装                 | `apps/desktop/src/renderer/components/skill/SkillSelector.tsx`                              |
| TASK-7C実装ガイド                 | `docs/30-workflows/TASK-7C-permission-dialog/outputs/phase-12/implementation-guide.md`      |
| TASK-IMP ツールアイコン実装ガイド | `docs/30-workflows/TASK-IMP-permission-tool-icons/outputs/phase-12/implementation-guide.md` |
