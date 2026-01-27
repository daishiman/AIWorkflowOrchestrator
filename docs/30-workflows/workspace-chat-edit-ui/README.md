# Workspace Chat Edit UI - タスク仕様書

## メタ情報

```yaml
task_id: TASK-WCE-UI-001
issue_number: 494
title: Workspace Chat Edit UI Components Implementation
category: 改善
target: workspace-chat-edit（Renderer Process）
priority: 高
estimate: 中規模
status: 未実施
created_date: 2026-01-27
branch: feat/workspace-chat-edit-ui-494
```

---

## 1. 概要

### 1.1 背景

workspace-chat-edit機能のMain Process側（FileService、ContextBuilder、ChatEditService、IPCハンドラ）が完成し、Renderer側からMain Processを呼び出すIPC通信基盤が整備済み。Renderer側にはchatEditSlice（Zustand）、useFileContext、useDiffApplyフックが実装済みだが、一部のUIコンポーネントが未実装。

### 1.2 既存実装状況

| コンポーネント           | 状態      | 備考                   |
| ------------------------ | --------- | ---------------------- |
| FileContextDropZone      | ✅ 実装済 | ドラッグ&ドロップ対応  |
| FileContextBadge         | ✅ 実装済 | 個別ファイルバッジ     |
| ApplyControls            | ✅ 実装済 | 適用/却下ボタン        |
| DiffEditor               | ✅ 実装済 | Monaco Diff Editor     |
| DiffPreview              | ✅ 実装済 | モーダルコンテナ       |
| EditCommandInput         | ✅ 実装済 | コマンド入力           |
| **FileAttachmentButton** | ❌ 未実装 | ファイル選択ダイアログ |
| **FileContextList**      | ❌ 未実装 | ファイル一覧コンテナ   |
| **Storybook Stories**    | ❌ 未実装 | 全コンポーネント対応   |

### 1.3 目的

1. 不足しているUIコンポーネント（FileAttachmentButton、FileContextList）を実装
2. 全コンポーネントのStorybook Stories作成
3. アクセシビリティ（キーボードナビゲーション、スクリーンリーダー）の検証・強化

---

## 2. スコープ

### 2.1 含むもの

| ID    | 内容                                            | 関連FR           |
| ----- | ----------------------------------------------- | ---------------- |
| RP-01 | ファイル添付UI（FileAttachmentButton）実装      | FR-001, FR-012   |
| RP-02 | ファイルコンテキスト一覧（FileContextList）実装 | FR-001           |
| RP-03 | 既存コンポーネントのStorybook作成               | NFR-001          |
| RP-04 | アクセシビリティ検証・強化                      | NFR-004, NFR-005 |
| RP-05 | 統合テスト追加                                  | NFR-002          |

### 2.2 含まないもの

- Main Process側の変更（完了済み）
- 新規LLMプロバイダー追加
- 高度な言語検出（AST解析）
- リアルタイムコラボレーション機能

---

## 3. 成果物

| 成果物                   | 配置先                                                               |
| ------------------------ | -------------------------------------------------------------------- |
| FileAttachmentButton.tsx | `apps/desktop/src/renderer/features/workspace-chat-edit/components/` |
| FileContextList.tsx      | `apps/desktop/src/renderer/features/workspace-chat-edit/components/` |
| \*.stories.tsx           | `apps/desktop/src/renderer/features/workspace-chat-edit/stories/`    |
| コンポーネントテスト     | `apps/desktop/src/renderer/features/workspace-chat-edit/__tests__/`  |

---

## 4. Phase構成

| Phase | 名称               | 概要                                         | ステータス |
| ----- | ------------------ | -------------------------------------------- | ---------- |
| 1     | 要件定義           | コンポーネント仕様・アクセシビリティ要件定義 | 未実施     |
| 2     | 設計               | コンポーネント設計・Propsインターフェース    | 未実施     |
| 3     | 設計レビューゲート | 設計の妥当性検証                             | 未実施     |
| 4     | テスト作成         | TDD Red（失敗テスト作成）                    | 未実施     |
| 5     | 実装               | TDD Green（テストを通す実装）                | 未実施     |
| 6     | テスト拡充         | カバレッジ目標達成                           | 未実施     |
| 7     | カバレッジ確認     | 統合テスト実行                               | 未実施     |
| 8     | リファクタリング   | コード品質改善                               | 未実施     |
| 9     | 品質保証           | アクセシビリティ監査                         | 未実施     |
| 10    | 最終レビュー       | 全体品質検証                                 | 未実施     |
| 11    | 手動テスト         | UX・実環境動作確認                           | 未実施     |
| 12    | ドキュメント更新   | 仕様書・実装ガイド                           | 未実施     |
| 13    | PR作成             | コミット・PR・CI確認                         | 未実施     |

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] FileAttachmentButtonでファイル選択ダイアログを開ける
- [ ] FileContextListで添付ファイル一覧が表示される
- [ ] ファイルを一覧から削除できる
- [ ] 全コンポーネントがStorybook上で確認できる

### 品質要件

- [ ] Line Coverage ≥ 80%
- [ ] Branch Coverage ≥ 60%
- [ ] 型エラー 0件
- [ ] Lintエラー 0件
- [ ] 全テストパス

### アクセシビリティ要件

- [ ] 全操作がキーボードのみで可能
- [ ] Tabキーでフォーカス移動可能
- [ ] Enter/Spaceでボタン操作可能
- [ ] スクリーンリーダーで操作内容が読み上げられる
- [ ] WCAG 2.1 AA準拠

---

## 6. 依存関係

### 前提条件

| タスク                           | ステータス | 備考                   |
| -------------------------------- | ---------- | ---------------------- |
| workspace-chat-edit-main-process | ✅ 完了    | Main Process + IPC基盤 |
| workspace-chat-edit（コア）      | ✅ 完了    | Slice、Hooks実装済み   |
| Issue #468 UI基盤                | ✅ 完了    | 既存コンポーネント群   |

### 技術要件

- React 18（Hooks、Context）
- Zustand状態管理
- Monaco Editor API
- Electron IPC通信パターン
- WCAG 2.1アクセシビリティガイドライン
- Vitest / React Testing Library
- Storybook

---

## 7. リスクと対策

| リスク                      | 影響度 | 発生確率 | 対策                            |
| --------------------------- | ------ | -------- | ------------------------------- |
| Electron showOpenDialog統合 | 中     | 低       | preload経由でのIPC呼び出し      |
| アクセシビリティ検証の工数  | 中     | 中       | 早期からaxeツールで継続チェック |
| Storybookビルド設定         | 低     | 中       | 既存設定の確認・再利用          |

---

## 8. 参照情報

### システム仕様（aiworkflow-requirements）

| 参照資料                 | パス                                                                           |
| ------------------------ | ------------------------------------------------------------------------------ |
| workspace-chat-edit仕様  | `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md` |
| UIコンポーネントパターン | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`      |
| 状態管理パターン         | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`   |
| 品質要件                 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`    |

### 関連ドキュメント

| ドキュメント           | パス                                                                                          |
| ---------------------- | --------------------------------------------------------------------------------------------- |
| Main Process実装ガイド | `docs/30-workflows/workspace-chat-edit-main-process/outputs/phase-12/implementation-guide.md` |
| タスク指示書           | `docs/30-workflows/unassigned-task/task-workspace-chat-edit-ui.md`                            |

---

## 変更履歴

| 日付       | バージョン | 変更内容 |
| ---------- | ---------- | -------- |
| 2026-01-27 | 1.0.0      | 初版作成 |
