# 状態管理パターン（Desktop Renderer）

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/
>
> **親ドキュメント**: [architecture-patterns.md](./architecture-patterns.md)

## 変更履歴

| バージョン | 日付       | 変更内容                                           |
| ---------- | ---------- | -------------------------------------------------- |
| v1.0.0     | 2026-01-23 | 初版作成                                           |
| v1.1.0     | 2026-01-26 | spec-guidelines準拠: コードブロックを表形式に変換 |

---

## Zustand Sliceパターン

### 概要

デスクトップアプリ（Electron）では、Zustandを使用した状態管理を採用。
機能単位でSliceを分離し、型安全性と保守性を確保する。

**実装場所**: `apps/desktop/src/renderer/store/slices/`

### Sliceの基本構造

各SliceはStateCreator型を使用して定義し、状態とアクションを分離する。

**必須ファイル構成**:

| ファイル                        | 役割                         |
| ------------------------------- | ---------------------------- |
| `{name}Slice.ts`                | Slice定義（状態+アクション） |
| `__tests__/{name}Slice.test.ts` | ユニットテスト               |

**Slice定義パターン**:

| 要素                 | 説明                         |
| -------------------- | ---------------------------- |
| `{Name}State`        | 状態のインターフェース       |
| `{Name}Actions`      | アクションのインターフェース |
| `{Name}Slice`        | State + Actions の統合型     |
| `initial{Name}State` | 初期状態オブジェクト         |
| `create{Name}Slice`  | StateCreator関数             |

### 既存Slice一覧

| Slice名      | 責務                     | 実装ファイル                 |
| ------------ | ------------------------ | ---------------------------- |
| `uiSlice`    | UI状態（currentView等）  | `store/slices/uiSlice.ts`    |
| `authSlice`  | 認証状態                 | `store/slices/authSlice.ts`  |
| `chatSlice`  | チャット状態             | `store/slices/chatSlice.ts`  |
| `agentSlice` | エージェント・スキル管理 | `store/slices/agentSlice.ts` |

### agentSlice詳細

**状態定義**:

| プロパティ           | 型                     | 説明               |
| -------------------- | ---------------------- | ------------------ |
| `skills`             | `Skill[]`              | スキル一覧         |
| `selectedSkill`      | `Skill \| null`        | 選択中のスキル     |
| `skillFilter`        | `string`               | フィルター文字列   |
| `skillCategory`      | `string \| null`       | カテゴリフィルター |
| `executionStatus`    | `AgentExecutionStatus` | 実行状態           |
| `currentExecutionId` | `string \| null`       | 実行ID             |
| `executionOutput`    | `string[]`             | 実行出力           |
| `isLoading`          | `boolean`              | ローディング状態   |
| `error`              | `string \| null`       | エラーメッセージ   |

**アクション定義**:

| アクション           | 引数                           | 説明           |
| -------------------- | ------------------------------ | -------------- |
| `setSkills`          | `skills: Skill[]`              | スキル一覧設定 |
| `selectSkill`        | `skill: Skill \| null`         | スキル選択     |
| `setSkillFilter`     | `filter: string`               | フィルター設定 |
| `setSkillCategory`   | `category: string \| null`     | カテゴリ設定   |
| `setExecutionStatus` | `status: AgentExecutionStatus` | 実行状態設定   |
| `appendOutput`       | `output: string`               | 出力追加       |
| `clearExecution`     | -                              | 実行クリア     |
| `resetAgentState`    | -                              | 状態リセット   |

### 新規Slice追加手順

**ステップ1: Slice定義**

- `store/slices/{name}Slice.ts` を作成
- State、Actions、Slice インターフェースを定義
- initialStateとcreateSlice関数を実装

**ステップ2: Store統合**

- `store/index.ts` でSliceをimport
- createStoreのcombine関数にSliceを追加

**ステップ3: View追加（必要な場合）**

- `views/{Name}View/index.tsx` を作成
- `App.tsx` のrenderView関数にcaseを追加
- `components/AppDock/index.tsx` のnavItemsに追加

**ステップ4: テスト作成**

- `store/slices/__tests__/{name}Slice.test.ts` を作成
- 全アクションのテストを実装

---

## chatEditSlice（Workspace Chat Edit状態管理）

### 概要

AIによるコード編集機能の状態管理Slice。ファイルコンテキスト、LLM生成結果、差分プレビューのUI状態を管理する。

**実装場所**: `apps/desktop/src/renderer/features/workspace-chat-edit/store/`

### 状態定義

| プロパティ          | 型                  | 説明                       |
| ------------------- | ------------------- | -------------------------- |
| `fileContexts`      | `FileContext[]`     | 添付ファイル一覧           |
| `activeContextId`   | `string \| null`    | アクティブなコンテキストID |
| `generatedResults`  | `GeneratedResult[]` | 生成結果一覧               |
| `currentResultId`   | `string \| null`    | 現在表示中の結果ID         |
| `isLoading`         | `boolean`           | ローディング中             |
| `isDiffPreviewOpen` | `boolean`           | 差分プレビュー表示中       |
| `error`             | `string \| null`    | エラーメッセージ           |
| `isDragging`        | `boolean`           | ドラッグ中                 |

### アクション定義

| アクション           | 引数                                 | 説明                     |
| -------------------- | ------------------------------------ | ------------------------ |
| `addFileContext`     | `Omit<FileContext, 'id'\|'addedAt'>` | ファイルコンテキスト追加 |
| `removeFileContext`  | `id: string`                         | コンテキスト削除         |
| `clearAllContexts`   | -                                    | 全クリア                 |
| `setActiveContext`   | `id: string \| null`                 | アクティブ設定           |
| `setGeneratedResult` | `result: GeneratedResult`            | 生成結果設定             |
| `approveResult`      | `resultId: string`                   | 適用                     |
| `rejectResult`       | `resultId: string`                   | 却下                     |
| `clearResults`       | -                                    | 結果クリア               |
| `openDiffPreview`    | `resultId: string`                   | プレビュー表示           |
| `closeDiffPreview`   | -                                    | プレビュー非表示         |
| `setLoading`         | `loading: boolean`                   | ローディング設定         |
| `setError`           | `error: string \| null`              | エラー設定               |
| `setDragging`        | `dragging: boolean`                  | ドラッグ状態設定         |
| `reset`              | -                                    | 状態リセット             |

### 関連Hooks

| Hook名           | 責務                     |
| ---------------- | ------------------------ |
| `useFileContext` | ファイルコンテキスト管理 |
| `useDiffApply`   | 差分計算・適用ロジック   |

### 実装パターン

- **Helper関数分離**: 複雑なロジックをSlice外部に分離（`computeLCS`, `generateDiffHunks`等）
- **バリデーション内蔵**: `addFileContext`で`MAX_FILE_CONTEXTS`, `MAX_FILE_SIZE`チェック
- **Optional Chainingによる安全性**: `state.chatEdit?.fileContexts ?? []`パターン

### Store統合（予定）

**統合先ファイル**: `apps/desktop/src/renderer/store/index.ts`

**必要なimport**:

| インポート対象        | インポート元                               |
| --------------------- | ------------------------------------------ |
| `createChatEditSlice` | `@/renderer/features/workspace-chat-edit`  |
| `ChatEditSlice`       | `@/renderer/features/workspace-chat-edit`  |

**Store統合手順**:

1. `AppStore`インターフェースに`ChatEditSlice`をextends追加
2. `create`関数内でスプレッド構文により`createChatEditSlice(set, get)`を展開
3. 他のSliceと同様のパターンで統合

**統合パターン**:

| 要素              | 説明                                     |
| ----------------- | ---------------------------------------- |
| `AppStore`        | 全Sliceを統合したストア型定義            |
| `create<AppStore>`| Zustandのcreate関数で型付きストア生成    |
| `set, get`        | StateCreator関数に渡すコールバック       |
| スプレッド展開    | 各Sliceを`...createXxxSlice(set, get)`で統合 |

### 品質メトリクス

- テストカバレッジ: Line 69.23%, Branch 89.74%, Function 95%
- 全122件の自動テスト成功

### 関連タスク

- workspace-chat-edit（2026-01-23完了：コアロジック）

---

## 関連ドキュメント

- [アーキテクチャパターン概要](./architecture-patterns.md)
- [UIコンポーネントパターン](./arch-ui-components.md)
