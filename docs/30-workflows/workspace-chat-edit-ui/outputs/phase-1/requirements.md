# Phase 1: 要件定義

## メタ情報

| 項目       | 内容   |
| ---------- | ------ |
| Phase      | 1      |
| カテゴリ   | 要件   |
| 前提Phase  | なし   |
| ステータス | 未実施 |

---

## 1. 目的

新規UIコンポーネント（FileAttachmentButton、FileContextList）の機能要件とアクセシビリティ要件を明確化する。

---

## 2. タスク一覧

### Task 1: FileAttachmentButton 要件定義

#### 概要

ファイル選択ダイアログを開くボタンコンポーネントの要件を定義する。

#### 手順

1. 既存のFileContextDropZoneの仕様を確認
2. Electron `dialog.showOpenDialog` API仕様を確認
3. 以下の機能要件を文書化:
   - ボタンクリックでファイル選択ダイアログを開く
   - 複数ファイル選択対応
   - 選択されたファイルをchatEditSliceに追加
   - `chat-edit:read-file` IPCを呼び出し
   - 最大ファイル数（10件）制限

#### 成果物

- `requirements-file-attachment-button.md`

---

### Task 2: FileContextList 要件定義

#### 概要

添付されたファイルコンテキストの一覧を表示するコンテナコンポーネントの要件を定義する。

#### 手順

1. 既存のFileContextBadgeの仕様を確認
2. chatEditSliceの状態構造を確認
3. 以下の機能要件を文書化:
   - 添付ファイル一覧の表示
   - 各ファイルの削除機能
   - 空状態の表示
   - スクロール対応（10件超時）

#### 成果物

- `requirements-file-context-list.md`

---

### Task 3: アクセシビリティ要件定義

#### 概要

WCAG 2.1 AA準拠のアクセシビリティ要件を定義する。

#### 手順

1. 既存コンポーネントのアクセシビリティ実装を確認
2. WCAG 2.1 AAガイドラインを参照
3. 以下の要件を文書化:
   - キーボードナビゲーション（Tab、Enter、Space、Escape）
   - フォーカス管理（フォーカストラップ、フォーカス可視化）
   - スクリーンリーダー対応（aria-label、aria-live、role）
   - 色コントラスト（4.5:1以上）

#### 成果物

- `requirements-accessibility.md`

---

### Task 4: Storybook要件定義

#### 概要

全コンポーネントのStorybook Stories要件を定義する。

#### 手順

1. 既存プロジェクトのStorybook設定を確認
2. 対象コンポーネントを一覧化:
   - FileAttachmentButton（新規）
   - FileContextList（新規）
   - FileContextBadge（既存）
   - FileContextDropZone（既存）
   - ApplyControls（既存）
   - DiffEditor（既存）
   - DiffPreview（既存）
   - EditCommandInput（既存）
3. 各コンポーネントのストーリーバリエーションを定義

#### 成果物

- `requirements-storybook.md`

---

## 3. 完了条件

- [ ] FileAttachmentButtonの機能要件が文書化されている
- [ ] FileContextListの機能要件が文書化されている
- [ ] アクセシビリティ要件がWCAG 2.1 AA基準で文書化されている
- [ ] Storybook要件が全対象コンポーネントに対して定義されている

---

## 4. 参照情報

### システム仕様

| 仕様                     | パス                                                                           |
| ------------------------ | ------------------------------------------------------------------------------ |
| workspace-chat-edit仕様  | `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md` |
| UIコンポーネントパターン | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`      |

### Electron観点チェック

| 層       | 確認項目                              |
| -------- | ------------------------------------- |
| Renderer | Reactコンポーネント仕様、状態管理連携 |
| IPC      | `chat-edit:read-file` リクエスト形式  |
| Preload  | `dialog.showOpenDialog` API公開有無   |

---

## 5. 統合テスト連携【必須】

接続要件（API/認証/データフロー）を要件に明記する:

| 接続要件カテゴリ | 記載内容                                                   |
| ---------------- | ---------------------------------------------------------- |
| IPC接続          | `chat-edit:read-file` チャンネルによるファイル読み込み     |
| 状態管理         | chatEditSlice への fileContexts 追加/削除フロー            |
| データフロー     | Renderer → IPC → Main → FileSystem → Main → IPC → Renderer |

---

## 6. 多角的チェック観点

タスクの性質に応じて、以下の観点を確認する:

| 観点               | 適用判断            | 仕様参照先                                       |
| ------------------ | ------------------- | ------------------------------------------------ |
| セキュリティ       | ファイルアクセス    | `aiworkflow-requirements: security-*.md`         |
| UI/UX              | ✅ UIコンポーネント | `aiworkflow-requirements: arch-ui-components.md` |
| アクセシビリティ   | ✅ UI実装           | `aiworkflow-requirements: arch-ui-components.md` |
| エラーハンドリング | ファイル読込エラー  | `aiworkflow-requirements: error-handling.md`     |

**Electronデスクトップアプリ観点**:

| 層                         | 確認観点                          | 仕様参照先                                            |
| -------------------------- | --------------------------------- | ----------------------------------------------------- |
| フロントエンド（Renderer） | ✅ UI要件、状態管理要件、UX要件   | `aiworkflow-requirements: arch-ui-components.md`      |
| バックエンド（Main）       | ファイルシステムアクセス要件      | `aiworkflow-requirements: llm-workspace-chat-edit.md` |
| IPC通信                    | ✅ Main-Renderer間の通信要件      | `aiworkflow-requirements: llm-workspace-chat-edit.md` |
| Preload                    | dialog.showOpenDialog API公開要件 | `aiworkflow-requirements: security-api-electron.md`   |
| ローカルストレージ         | N/A（本タスクでは対象外）         | -                                                     |

---

## 7. サブタスク管理

Phase実行開始時に、以下のサブタスクを作成・管理すること:

1. Task 1: FileAttachmentButton 要件定義
2. Task 2: FileContextList 要件定義
3. Task 3: アクセシビリティ要件定義
4. Task 4: Storybook要件定義
5. 成果物の作成・配置
6. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに完了に更新すること。

---

## 8. タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスク（Task 1-4）を100%実行完了
- [ ] 各タスクの成果物（requirements-\*.md）が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

---

## 9. 次のPhase

Phase 2: 設計
