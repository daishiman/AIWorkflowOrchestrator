# [#494] "[UT-WCE-UI-001] Workspace Chat Edit UI Components Implementation"

## メタ情報

```yaml
task_id: UT-WCE-UI-001
task_name: Workspace Chat Edit UI Components Implementation
category: 改善
target_feature: workspace-chat-edit（Renderer Process）
priority: 高
scale: 中規模
status: 未実施
source_phase: Phase 12（workspace-chat-edit-main-process完了時）
created_date: 2026-01-25
dependencies: []
spec_path: docs/30-workflows/unassigned-task/task-workspace-chat-edit-ui.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 高     |
| 規模       | 中規模 |
| ステータス | 未実施 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

workspace-chat-edit機能のMain Process側（FileService、ContextBuilder、ChatEditService、IPCハンドラ）が完成し、Renderer側からMain Processを呼び出すIPC通信基盤が整った。現在、Renderer側にはchatEditSlice（Zustand）、useFileContext、useDiffApplyフックが実装済みだが、これらを活用するUIコンポーネントが未実装。

### 1.2 問題点・課題

- ユーザーがファイルをコンテキストに追加するUIがない
- ドラッグ&ドロップでのファイル追加ができない
- AIが生成した差分を視覚的に確認・承認/却下する手段がない
- アクセシビリティ対応（キーボード操作、スクリーンリーダー）が未実装

### 1.3 放置した場合の影響

- workspace-chat-edit機能が実質使用不能のまま
- ユーザーがAIによるコード編集支援の恩恵を受けられない
- Main Process実装が活用されずリソースの無駄

---

## 2. 何を達成するか（What）

### 2.1 目的

Renderer ProcessにUIコンポーネントを実装し、ユーザーがAIによるコード編集支援機能を直感的に利用できるようにする。

### 2.2 最終ゴール

- ファイル添付UI（ファイル選択ダイアログ）が動作する
- ドラッグ&ドロップでファイルをコンテキストに追加できる
- Monaco Diff Editorで差分がハイライト表示される
- 承認/却下ボタンで変更を適用・破棄できる
- 全操作がキーボードのみで完結できる
- スクリーンリーダーで操作内容が読み上げられる

### 2.3 スコープ

#### 含むもの

- RP-01: ファイル添付UIの実装
- RP-02: ドラッグ&ドロップ機能の実装
- RP-03: Monaco Diff Editorによる差分表示
- RP-04: 承認/却下フローの実装
- RP-05: キーボードナビゲーション対応
- RP-06: スクリーンリーダー対応
- RP-07: chatEditSlice（Zustand）のUI連携

#### 含まないもの

- Main Process側の変更（完了済み）
- 新規LLMプロバイダー追加
- 高度な言語検出（AST解析）
- リアルタイムコラボレーション機能

### 2.4 成果物

| 成果物                   | 配置先                                                               |
| ------------------------ | -------------------------------------------------------------------- |
| FileAttachmentButton.tsx | `apps/desktop/src/renderer/features/workspace-chat-edit/components/` |
| DragDropZone.tsx         | `apps/desktop/src/renderer/features/workspace-chat-edit/components/` |
| DiffViewer.tsx           | `apps/desktop/src/renderer/features/workspace-chat-edit/components/` |
| ApprovalControls.tsx     | `apps/desktop/src/renderer/features/workspace-chat-edit/components/` |
| FileContextList.tsx      | `apps/desktop/src/renderer/features/workspace-chat-edit/components/` |
| コンポーネントテスト     | `apps/desktop/src/renderer/features/workspace-chat-edit/__tests__/`  |
| Storybook Stories        | `apps/desktop/src/renderer/features/workspace-chat-edit/stories/`    |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- workspace-chat-edit-main-process タスク完了（✅ 2026-01-25完了）
- Node.js 20.x / pnpm 9.x 環境
- Monaco Editor依存関係がインストール済み

### 3.2 依存タスク

| タスク                           | ステータス | 備考                   |
| -------------------------------- | ---------- | ---------------------- |
| workspace-chat-edit-main-process | ✅ 完了    | Main Process + IPC基盤 |
| workspace-chat-edit（コア）      | ✅ 完了    | Slice、Hooks実装済み   |

### 3.3 必要な知識

- React 18（Hooks、Context）
- Zustand状態管理
- Monaco Editor API（特にDiff Editor）
- Electron IPC通信パターン
- WCAG 2.1アクセシビリティガイドライン
- Vitest / React Testing Library

### 3.4 推奨アプローチ

1. コンポーネント設計 → 2. 単体実装（TDD）→ 3. 統合テスト → 4. アクセシビリティ検証

---

## 4. 実行手順

### Phase構成

| Phase | 名称               | 概要                                      |
| ----- | ------------------ | ----------------------------------------- |
| 1     | 要件定義           | コンポーネント仕様・アクセシビリティ要件  |
| 2     | 設計               | コンポーネント設計・Propsインターフェース |
| 3     | 設計レビューゲート | 設計の妥当性検証                          |
| 4     | テスト作成         | TDD Red（失敗テスト作成）                 |
| 5     | 実装               | TDD Green（テストを通す実装）             |
| 6     | テスト拡充         | カバレッジ目標達成                        |
| 7     | カバレッジ確認     | 統合テスト実行                            |
| 8     | リファクタリング   | コード品質改善                            |
| 9     | 品質保証           | アクセシビリティ監査                      |
| 10    | 最終レビュー       | 全体品質検証                              |
| 11    | 手動テスト         | UX・実環境動作確認                        |
| 12    | ドキュメント更新   | 仕様書・実装ガイド                        |
| 13    | PR作成             | コミット・PR・CI確認                      |

### Phase 5: 実装

#### 目的

各UIコンポーネントをTDD方式で実装する。

#### 手順

1. FileAttachmentButton.tsx を実装
   - ファイル選択ダイアログを開くボタン
   - 選択されたファイルをchatEditSliceに追加
   - `chat-edit:read-file` IPCを呼び出し

2. DragDropZone.tsx を実装
   - ドラッグ&ドロップ領域
   - ファイルホバー時のビジュアルフィードバック
   - 複数ファイル対応（最大10件制限）

3. FileContextList.tsx を実装
   - 追加されたファイルコンテキスト一覧表示
   - 各ファイルの削除ボタン
   - ファイル言語アイコン表示

4. DiffViewer.tsx を実装
   - Monaco Diff Editor統合
   - 変更前/変更後のインライン表示
   - 行番号・ハイライト表示

5. ApprovalControls.tsx を実装
   - 承認/却下ボタン
   - 部分承認（将来拡張用フック）
   - キーボードショートカット対応

#### 成果物

- 上記5コンポーネント + テストファイル

#### 完了条件

- 全コンポーネントがテストに合格
- IPCハンドラとの連携が動作確認済み

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] ファイル選択ダイアログでファイルを追加できる
- [ ] ドラッグ&ドロップでファイルを追加できる
- [ ] 追加されたファイル一覧が表示される
- [ ] ファイルを一覧から削除できる
- [ ] AIが生成した差分がMonaco Diff Editorで表示される
- [ ] 承認ボタンで変更がファイルに適用される
- [ ] 却下ボタンで変更が破棄される

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

### ドキュメント要件

- [ ] 実装ガイドが作成されている
- [ ] Storybook Storiesが作成されている
- [ ] システム仕様書（api-endpoints.md）が更新されている

---

## 6. 検証方法

### テストケース

| TC-ID     | 機能               | 期待結果                              |
| --------- | ------------------ | ------------------------------------- |
| TC-UI-001 | ファイル選択       | ダイアログでファイルを選択→一覧に追加 |
| TC-UI-002 | ドラッグ&ドロップ  | ファイルをドロップ→一覧に追加         |
| TC-UI-003 | ファイル削除       | 削除ボタンクリック→一覧から除去       |
| TC-UI-004 | 差分表示           | AI応答後→Monaco Diff Editorで差分表示 |
| TC-UI-005 | 変更承認           | 承認ボタン→ファイルに変更適用         |
| TC-UI-006 | 変更却下           | 却下ボタン→差分表示クローズ           |
| TC-UI-007 | キーボード操作     | Tab→フォーカス移動、Enter→ボタン操作  |
| TC-UI-008 | スクリーンリーダー | 操作内容がaria-labelで読み上げられる  |

### 検証手順

1. `pnpm --filter @repo/desktop test` でユニットテスト実行
2. `pnpm --filter @repo/desktop dev` でUIを手動確認
3. axe DevToolsでアクセシビリティ監査

---

## 7. リスクと対策

| リスク                          | 影響度 | 発生確率 | 対策                                 |
| ------------------------------- | ------ | -------- | ------------------------------------ |
| Monaco Editor統合の複雑さ       | 中     | 中       | 公式ドキュメント参照、既存実装確認   |
| ドラッグ&ドロップのブラウザ差異 | 低     | 低       | react-dropzone等のライブラリ活用検討 |
| アクセシビリティ検証の工数      | 中     | 中       | 早期からaxeツールで継続チェック      |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント           | パス                                                                                          |
| ---------------------- | --------------------------------------------------------------------------------------------- |
| Main Process実装ガイド | `docs/30-workflows/workspace-chat-edit-main-process/outputs/phase-12/implementation-guide.md` |
| Renderer実装ガイド     | `docs/30-workflows/workspace-chat-edit/outputs/phase-12/implementation-guide.md`              |
| 設計書                 | `docs/30-workflows/workspace-chat-edit/outputs/phase-2/`                                      |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                | パス                                                                         | 内容                                        |
| ----------------------- | ---------------------------------------------------------------------------- | ------------------------------------------- |
| APIエンドポイント       | `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`         | chat-edit IPC チャネル仕様                  |
| インターフェース（LLM） | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`        | FileContext、EditCommand、GeneratedResult型 |
| アーキテクチャパターン  | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` | chatEditSliceパターン                       |
| UI/UXガイドライン       | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`      | コンポーネント設計基準                      |
| 品質要件                | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`  | テストカバレッジ目標                        |

### 参考資料

- Monaco Editor Diff: https://microsoft.github.io/monaco-editor/docs.html#interfaces/editor.IDiffEditor.html
- react-dropzone: https://react-dropzone.js.org/
- WCAG 2.1: https://www.w3.org/WAI/WCAG21/quickref/

---

## 9. 備考

### Phase 12検出時の記録

```
Renderer Process 向けタスク（別タスクとして管理）

| ID    | 内容                             | 関連FR           |
| ----- | -------------------------------- | ---------------- |
| RP-01 | ファイル添付UIの実装             | FR-001, FR-012   |
| RP-02 | ドラッグ&ドロップ機能の実装      | FR-012           |
| RP-03 | Monaco Diff Editorによる差分表示 | FR-008, FR-009   |
| RP-04 | 承認/却下フローの実装            | FR-010, FR-011   |
| RP-05 | キーボードナビゲーション対応     | NFR-004, NFR-005 |
| RP-06 | スクリーンリーダー対応           | NFR-004          |
| RP-07 | chatEditSlice（Zustand）の実装   | NFR-007          |
```

### 補足事項

- Main Process実装（TASK-WCE-MAIN-001）が2026-01-25に完了しており、IPC通信基盤は整備済み
- chatEditSlice、useFileContext、useDiffApplyフックは既存実装を活用
- Monaco Editorは既にプロジェクトに導入済み（SlideEditorで使用）
