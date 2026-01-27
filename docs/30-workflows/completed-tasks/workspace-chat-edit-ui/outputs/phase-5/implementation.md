# Phase 5: 実装（TDD Green）

## メタ情報

| 項目       | 内容                  |
| ---------- | --------------------- |
| Phase      | 5                     |
| カテゴリ   | TDD-Green             |
| 前提Phase  | Phase 4（テスト作成） |
| ステータス | 未実施                |

---

## 1. 目的

Phase 4で作成したテストを全てパスさせる最小限の実装を行う。

---

## 2. タスク一覧

### Task 1: FileAttachmentButton 実装

#### 概要

ファイル選択ダイアログを開くボタンコンポーネントを実装する。

#### 実装ファイル

`apps/desktop/src/renderer/features/workspace-chat-edit/components/FileAttachmentButton.tsx`

#### 実装手順

1. コンポーネントファイルを作成
2. Propsインターフェースを定義
3. ボタンUIを実装
4. クリックハンドラを実装
   - preload経由でdialog.showOpenDialog呼び出し
   - 選択されたファイルパスを取得
5. useFileContextフックと連携
   - attachFileメソッドでファイル追加
6. キーボードイベントを実装
7. ARIA属性を設定

#### 実装パターン（Electron層別）

| 層       | 実装内容                                     |
| -------- | -------------------------------------------- |
| Renderer | Reactコンポーネント、イベントハンドラ        |
| Hooks    | useFileContext連携（attachFile呼び出し）     |
| IPC      | `chat-edit:read-file` 経由でファイル読み込み |
| Preload  | dialog.showOpenDialog API呼び出し            |

#### 成果物

- `FileAttachmentButton.tsx`

---

### Task 2: FileContextList 実装

#### 概要

添付ファイル一覧を表示するコンテナコンポーネントを実装する。

#### 実装ファイル

`apps/desktop/src/renderer/features/workspace-chat-edit/components/FileContextList.tsx`

#### 実装手順

1. コンポーネントファイルを作成
2. Propsインターフェースを定義
3. 空状態UIを実装
4. ファイル一覧UIを実装
   - FileContextBadgeを再利用
   - スクロールコンテナ設定
5. 削除・選択コールバックを実装
6. キーボードナビゲーションを実装
7. ARIA属性を設定

#### コンポーネント構成

```
FileContextList
├── Empty state (contexts.length === 0)
│   └── Empty message with icon
└── File list (contexts.length > 0)
    └── FileContextBadge[] (map)
```

#### 成果物

- `FileContextList.tsx`

---

### Task 3: コンポーネントエクスポート追加

#### 概要

新規コンポーネントをindex.tsにエクスポートする。

#### 対象ファイル

`apps/desktop/src/renderer/features/workspace-chat-edit/components/index.ts`

#### 追加内容

```typescript
export { FileAttachmentButton } from "./FileAttachmentButton";
export type { FileAttachmentButtonProps } from "./FileAttachmentButton";

export { FileContextList } from "./FileContextList";
export type { FileContextListProps } from "./FileContextList";
```

#### 成果物

- 更新された `index.ts`

---

### Task 4: Preload API確認・追加（必要な場合）

#### 概要

dialog.showOpenDialog APIがpreloadで公開されているか確認し、必要に応じて追加する。

#### 確認ファイル

`apps/desktop/src/preload/index.ts`

#### 確認・実装手順

1. 既存のpreload APIを確認
2. dialog関連APIが公開されていない場合は追加
3. contextBridge経由で安全に公開

#### 成果物

- 必要に応じて更新された `preload/index.ts`

---

### Task 5: テスト実行・パス確認

#### 概要

実装が完了したら、Phase 4で作成したテストを実行し全てパスすることを確認する。

#### 検証コマンド

```bash
# 新規コンポーネントのテスト
pnpm --filter @repo/desktop test -- --run apps/desktop/src/renderer/features/workspace-chat-edit/components/__tests__/FileAttachmentButton.test.tsx
pnpm --filter @repo/desktop test -- --run apps/desktop/src/renderer/features/workspace-chat-edit/components/__tests__/FileContextList.test.tsx

# 統合テスト
pnpm --filter @repo/desktop test -- --run apps/desktop/src/renderer/features/workspace-chat-edit/components/__tests__/integration-ui.test.tsx

# アクセシビリティテスト
pnpm --filter @repo/desktop test -- --run apps/desktop/src/renderer/features/workspace-chat-edit/components/__tests__/accessibility.test.tsx
```

#### 成果物

- 全テストパスのログ

---

## 3. 完了条件

- [ ] FileAttachmentButton.tsx が実装されている
- [ ] FileContextList.tsx が実装されている
- [ ] コンポーネントがindex.tsからエクスポートされている
- [ ] Phase 4の全テストがパスしている
- [ ] 型エラーが0件
- [ ] Lintエラーが0件

---

## 4. 参照情報

### システム仕様

| 仕様                     | パス                                                                           |
| ------------------------ | ------------------------------------------------------------------------------ |
| UIコンポーネントパターン | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`      |
| IPC仕様                  | `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md` |

### 既存実装参照

| コンポーネント      | パス                                                                                        |
| ------------------- | ------------------------------------------------------------------------------------------- |
| FileContextDropZone | `apps/desktop/src/renderer/features/workspace-chat-edit/components/FileContextDropZone.tsx` |
| FileContextBadge    | `apps/desktop/src/renderer/features/workspace-chat-edit/components/FileContextBadge.tsx`    |

---

## 5. 統合テスト連携【必須】

フロント/バック接続の実装とテスト支援コード整備:

| 実装項目           | 内容                                          |
| ------------------ | --------------------------------------------- |
| IPC接続            | `chat-edit:read-file` 呼び出し実装            |
| エラーハンドリング | ファイル読込失敗時のエラー状態設定            |
| 状態同期           | chatEditSlice への fileContexts 追加/削除処理 |

---

## 6. 多角的チェック観点

タスクの性質に応じて、以下の観点を確認する:

| 観点               | 適用判断            | 仕様参照先                                       |
| ------------------ | ------------------- | ------------------------------------------------ |
| UI/UX              | ✅ UIコンポーネント | `aiworkflow-requirements: arch-ui-components.md` |
| アクセシビリティ   | ✅ WCAG準拠実装     | `aiworkflow-requirements: arch-ui-components.md` |
| エラーハンドリング | ✅ エラー状態管理   | `aiworkflow-requirements: error-handling.md`     |
| 型安全性           | ✅ TypeScript厳密   | -                                                |

**Electronデスクトップアプリ観点（アーキテクチャ層別実装）**:

| 層                         | 実装観点                             | 実装ファイル配置                                          |
| -------------------------- | ------------------------------------ | --------------------------------------------------------- |
| フロントエンド（Renderer） | ✅ UIコンポーネント、状態管理、Hooks | `apps/desktop/src/renderer/features/workspace-chat-edit/` |
| バックエンド（Main）       | サービス（本タスクでは既存利用）     | `apps/desktop/src/main/`                                  |
| IPC通信                    | ✅ チャンネルハンドラー呼び出し      | preload経由                                               |
| Preload                    | ✅ dialog.showOpenDialog API利用確認 | `apps/desktop/src/preload/`                               |

---

## 7. サブタスク管理

Phase実行開始時に、以下のサブタスクを作成・管理すること:

1. Task 1: FileAttachmentButton 実装
2. Task 2: FileContextList 実装
3. Task 3: コンポーネントエクスポート追加
4. Task 4: Preload API確認・追加
5. Task 5: テスト実行・パス確認
6. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに完了に更新すること。

---

## 8. タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスク（Task 1-5）を100%実行完了
- [ ] 各タスクの成果物（\*.tsx）が生成されている
- [ ] Phase 4の全テストがパスしている（Green状態）
- [ ] 型エラー0件、Lintエラー0件
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

---

## 9. 次のPhase

Phase 6: テスト拡充
