# TASK-7D: ChatPanel 統合 - タスク仕様書

## メタ情報

| 項目       | 内容                                |
| ---------- | ----------------------------------- |
| タスクID   | TASK-7D                             |
| タスク名   | ChatPanel 統合                      |
| タスク種別 | feat                                |
| Phase      | 7                                   |
| 依存タスク | TASK-7A, TASK-7B, TASK-7C           |
| ブロック   | TASK-8A, TASK-8B, TASK-8C           |
| 優先度     | high                                |
| 複雑度     | medium                              |
| タグ       | frontend, renderer, ui, integration |

## 概要

既存の ChatPanel に TASK-7A（SkillSelector）、TASK-7B（SkillImportDialog）、TASK-7C（PermissionDialog）を統合し、スキル実行結果のストリーミング表示（SkillStreamingView）を実装する。

## スコープ

### 含む

- ChatPanel コンポーネントへの SkillSelector 配置（ModelSelector の隣）
- SkillStreamingView コンポーネントの新規作成
- SkillImportDialog の ChatPanel からの表示制御
- PermissionDialog の ChatPanel からの表示制御
- スキル実行中のストリーミング表示（assistant/tool_use/tool_result/error）
- ツール実行履歴の折りたたみ表示
- 実行中止ボタンの実装
- ステータスバッジ表示
- skill/index.ts のエクスポート更新

### 含まない

- SkillSelector コンポーネント自体の修正（TASK-7A で完了）
- SkillImportDialog コンポーネント自体の修正（TASK-7B で完了）
- PermissionDialog コンポーネント自体の修正（TASK-7C で完了）
- skillSlice（ストア）の修正（TASK-6-1 で完了）
- バックエンド（Main プロセス）の変更
- IPC チャネルの変更

## 前提条件

| 条件                                   | ステータス |
| -------------------------------------- | ---------- |
| TASK-7A（SkillSelector）完了           | 完了       |
| TASK-7B（SkillImportDialog）完了       | 完了       |
| TASK-7C（PermissionDialog）完了        | 完了       |
| TASK-6-1（skillSlice）完了             | 完了       |
| Zustand ストアに skillSlice が統合済み | 完了       |
| 共有型定義が packages/shared に存在    | 完了       |

## 受け入れ基準

| ID    | 基準                                                                     | 検証方法             |
| ----- | ------------------------------------------------------------------------ | -------------------- |
| AC-1  | SkillSelector が ChatPanel ヘッダーに ModelSelector の隣に配置されている | コンポーネントテスト |
| AC-2  | スキル選択時にスキル名がヘッダーに表示される                             | コンポーネントテスト |
| AC-3  | スキル実行中にストリーミング表示が動作する                               | コンポーネントテスト |
| AC-4  | assistant メッセージがリアルタイム表示される                             | コンポーネントテスト |
| AC-5  | tool_use/tool_result が適切に表示される                                  | コンポーネントテスト |
| AC-6  | 「停止する」ボタンが abortExecution を呼び出す                           | コンポーネントテスト |
| AC-7  | 権限確認ダイアログが pendingPermission 存在時に表示される                | コンポーネントテスト |
| AC-8  | インポートダイアログが importDialogSkill 設定時に表示される              | コンポーネントテスト |
| AC-9  | 既存のチャット機能（通常チャット、ストリーミング）に影響がない           | 手動テスト           |
| AC-10 | コンポーネントテストが全て通過する                                       | 自動テスト           |

## Phase 一覧

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
| 作成 | `apps/desktop/src/renderer/components/chat/__tests__/ChatPanel.test.tsx`           |

## 参考資料

| 資料                                | パス                                                                                              |
| ----------------------------------- | ------------------------------------------------------------------------------------------------- |
| タスク定義書                        | `docs/30-workflows/skill-import-agent-system/tasks/task-7d-chat-panel-integration.md`             |
| 機能仕様書 4.1 スキルセレクター統合 | `docs/30-workflows/skill-import-agent-system/specification.md`                                    |
| 機能仕様書 4.4.1 ストリーミング表示 | `docs/30-workflows/skill-import-agent-system/specification.md`                                    |
| 機能仕様書 4.7 ツール実行UIフロー   | `docs/30-workflows/skill-import-agent-system/specification.md`                                    |
| 機能仕様書 5.5 Zustand Store設計    | `docs/30-workflows/skill-import-agent-system/specification.md`                                    |
| UI/UX SkillStreamDisplay仕様        | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-skill-stream.md`                 |
| UI/UXエージェント実行仕様           | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md`                      |
| インターフェース仕様                | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`                 |
| 状態管理アーキテクチャ              | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                      |
| TASK-7A SkillSelector 完了仕様      | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-7a-skill-selector.md`      |
| TASK-7B SkillImportDialog 完了仕様  | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-7b-skill-import-dialog.md` |
| TASK-7C PermissionDialog 完了仕様   | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-7c-permission-dialog.md`   |
