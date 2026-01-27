# 設計レビューチェックリスト

## 1. コンポーネント設計レビュー

| チェック項目                | 基準                                 | 判定 | 備考                                      |
| --------------------------- | ------------------------------------ | ---- | ----------------------------------------- |
| Propsインターフェース完全性 | 全Propに型・説明・デフォルト値が定義 | PASS | 両コンポーネントで完全に定義済み          |
| コンポーネント階層の妥当性  | Atomic Design原則に準拠              | PASS | molecules/organisms の分類が適切          |
| 既存コンポーネント再利用    | FileContextBadge等を適切に再利用     | PASS | FileContextListがFileContextBadgeを再利用 |
| 状態管理連携設計            | chatEditSliceとの連携フローが明確    | PASS | useFileContext経由の連携が設計済み        |

### 詳細レビュー

#### FileAttachmentButton

- Props: `onFilesSelected`, `multiple`, `accept`, `maxFiles`, `disabled`, `className` - 全て型とデフォルト値定義済み
- 階層: molecules として適切（Button + Icon の組み合わせ）
- 状態管理: `useFileContext.attachFile()` 経由で連携

#### FileContextList

- Props: `contexts`, `onRemove`, `onSelect`, `selectedId`, `emptyMessage`, `maxHeight`, `className` - 全て型とデフォルト値定義済み
- 階層: organisms として適切（FileContextBadge[] を含むコンテナ）
- 状態管理: `useFileContext.removeFileContext()`, `setActiveContext()` 経由で連携

## 2. IPC設計レビュー

| チェック項目                    | 基準                              | 判定 | 備考                                 |
| ------------------------------- | --------------------------------- | ---- | ------------------------------------ |
| チャンネル名の一貫性            | 既存 `chat-edit:*` パターンに準拠 | PASS | `electronAPI.fileSelection` API使用  |
| リクエスト/レスポンス型の整合性 | llm-workspace-chat-edit.md と一致 | PASS | 既存のfileSelectionHandlers.tsに準拠 |
| エラーハンドリング設計          | 全エラーコードに対応策が定義      | PASS | useFileContextのerror状態で処理      |

### 詳細レビュー

- ファイル選択: `electronAPI.fileSelection.openDialog()` - 既存API活用
- ファイル読み込み: `useFileContext.attachFile()` → `chat-edit:read-file` IPC
- エラーコード: `MAX_CONTEXTS_EXCEEDED`, `DUPLICATE_FILE`, `READ_ERROR`, `TOO_LARGE` 全て対応

## 3. アクセシビリティ設計レビュー

| チェック項目                   | 基準                             | 判定 | 備考                                  |
| ------------------------------ | -------------------------------- | ---- | ------------------------------------- |
| キーボードナビゲーション網羅性 | 全操作がキーボードで可能         | PASS | Tab/Enter/Space/Delete/Escape対応     |
| ARIA属性の適切性               | WAI-ARIA 1.2仕様に準拠           | PASS | role, aria-label, aria-selected定義済 |
| フォーカス管理設計             | フォーカストラップ・可視化が定義 | PASS | focus:ring-2クラスで可視化            |
| スクリーンリーダー対応         | 全要素にaria-labelまたはテキスト | PASS | aria-live通知設計済み                 |

### 詳細レビュー

- FileAttachmentButton: `aria-label="ファイルを添付"`, `aria-disabled` 対応
- FileContextList: `role="list"`, `aria-label="添付ファイル一覧"`
- FileContextBadge: `role="listitem"`, `aria-selected`
- ライブリージョン: ファイル追加/削除時の通知設計済み

## 4. Storybook設計レビュー

| チェック項目               | 基準                                 | 判定 | 備考                               |
| -------------------------- | ------------------------------------ | ---- | ---------------------------------- |
| 全コンポーネントカバレッジ | 8コンポーネント全てにStory定義       | PASS | 8コンポーネント全てのStory設計済み |
| 状態バリエーション網羅性   | 主要状態（default/disabled/error等） | PASS | Default/Disabled/WithFiles等定義   |
| インタラクション定義       | ユーザー操作シナリオが定義           | PASS | play関数によるインタラクション設計 |

### 詳細レビュー

- FileAttachmentButton: Default, Disabled, WithMaxReached, Loading, WithCallback
- FileContextList: Empty, WithFiles, WithManyFiles, WithSelected, CustomEmpty
- アクセシビリティアドオン: @storybook/addon-a11y 統合設計済み

## 5. 総合判定

| カテゴリ           | 判定 |
| ------------------ | ---- |
| コンポーネント設計 | PASS |
| IPC設計            | PASS |
| アクセシビリティ   | PASS |
| Storybook          | PASS |

**ゲート判定: PASS**

全レビュー項目がPASSであり、Phase 4（テスト作成）に進行可能。
