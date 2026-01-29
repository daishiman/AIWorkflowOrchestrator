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

### components/organisms/

| コンポーネント名       | 説明                           |
| ---------------------- | ------------------------------ |
| AgentChatInterface     | エージェントチャットIF         |
| PermissionDialog       | 権限確認ダイアログ             |
| CommunityGraph         | コミュニティグラフ表示         |
| SplitLayout            | 左右分割レイアウト             |
| DiffPreview            | 差分プレビューモーダル         |
| SkillImportDialog      | スキルインポート確認ダイアログ |

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

---

## 変更履歴

| Version | Date       | Changes                                                                              |
| ------- | ---------- | ------------------------------------------------------------------------------------ |
| 2.2.0   | 2026-01-30 | TASK-7B完了タスク追加（SkillImportDialogコンポーネント）                             |
| 2.1.0   | 2026-01-30 | TASK-7A完了タスク追加（SkillSelector コンポーネント）                                |
| 2.0.0   | 2026-01-26 | 4ファイルに分割（964行→インデックス+詳細ファイル）                                   |
| 1.1.0   | 2026-01-26 | コードブロックを表形式に変換（spec-guidelines準拠）                                  |
| 1.0.0   | 2026-01-25 | 初版作成                                                                             |

---

## 関連ドキュメント

- [アーキテクチャパターン](./architecture-patterns.md)
- [History Panel UI仕様](./ui-ux-history-panel.md)
- [TASK-7B 実装ガイド](../../../../docs/30-workflows/TASK-7B-skill-import-dialog/outputs/phase-12/implementation-guide.md)
