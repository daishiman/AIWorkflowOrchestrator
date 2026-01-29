# 状態管理パターン（Desktop Renderer）

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/
>
> **親ドキュメント**: [architecture-patterns.md](./architecture-patterns.md)

## 変更履歴

| バージョン | 日付       | 変更内容                                          |
| ---------- | ---------- | ------------------------------------------------- |
| v1.3.0     | 2026-01-30 | TASK-7A完了: SkillSelectorステータス更新          |
| v1.2.0     | 2026-01-28 | TASK-6-1完了: skillSliceセクション追加            |
| v1.1.0     | 2026-01-26 | spec-guidelines準拠: コードブロックを表形式に変換 |
| v1.0.0     | 2026-01-23 | 初版作成                                          |

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

| Slice名      | 責務                     | 実装ファイル                 | タスク    |
| ------------ | ------------------------ | ---------------------------- | --------- |
| `uiSlice`    | UI状態（currentView等）  | `store/slices/uiSlice.ts`    | -         |
| `authSlice`  | 認証状態                 | `store/slices/authSlice.ts`  | -         |
| `chatSlice`  | チャット状態             | `store/slices/chatSlice.ts`  | -         |
| `agentSlice` | エージェント・スキル管理 | `store/slices/agentSlice.ts` | AGENT-002 |
| `skillSlice` | スキル実行状態管理       | `store/slices/skillSlice.ts` | TASK-6-1  |

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

| インポート対象        | インポート元                              |
| --------------------- | ----------------------------------------- |
| `createChatEditSlice` | `@/renderer/features/workspace-chat-edit` |
| `ChatEditSlice`       | `@/renderer/features/workspace-chat-edit` |

**Store統合手順**:

1. `AppStore`インターフェースに`ChatEditSlice`をextends追加
2. `create`関数内でスプレッド構文により`createChatEditSlice(set, get)`を展開
3. 他のSliceと同様のパターンで統合

**統合パターン**:

| 要素               | 説明                                         |
| ------------------ | -------------------------------------------- |
| `AppStore`         | 全Sliceを統合したストア型定義                |
| `create<AppStore>` | Zustandのcreate関数で型付きストア生成        |
| `set, get`         | StateCreator関数に渡すコールバック           |
| スプレッド展開     | 各Sliceを`...createXxxSlice(set, get)`で統合 |

### 品質メトリクス

- テストカバレッジ: Line 69.23%, Branch 89.74%, Function 95%
- 全122件の自動テスト成功

### 関連タスク

- workspace-chat-edit（2026-01-23完了：コアロジック）

---

## skillSlice（スキル実行状態管理）

### 概要

スキル機能の状態管理Slice。スキルのスキャン・インポート・選択・実行・権限確認の状態を一元管理する。IPCイベントを介してMain Processと連携し、ストリーミング応答や権限リクエストを処理する。

**実装ファイル**:

| ファイル                 | パス                                                     | 行数 | 説明                         |
| ------------------------ | -------------------------------------------------------- | ---- | ---------------------------- |
| `skillSlice.ts`          | `apps/desktop/src/renderer/store/slices/skillSlice.ts`   | 347  | Slice定義（状態+アクション） |
| `setupSkillListeners.ts` | `apps/desktop/src/renderer/store/setupSkillListeners.ts` | 49   | IPCイベントリスナー設定      |

**テストファイル**:

| ファイル                              | テスト数 | カテゴリ     |
| ------------------------------------- | -------- | ------------ |
| `skillSlice.test.ts`                  | 59       | 基本機能     |
| `skillSlice.edge-cases.test.ts`       | 16       | エッジケース |
| `skillSlice.state-transition.test.ts` | 17       | 状態遷移     |
| `skillSlice.ipc.test.ts`              | 14       | IPC連携      |
| `skillSlice.integration.test.ts`      | 7        | 統合テスト   |

### 状態定義（14プロパティ）

| プロパティ           | 型                               | 初期値  | 説明                     |
| -------------------- | -------------------------------- | ------- | ------------------------ |
| `availableSkills`    | `SkillMetadata[]`                | `[]`    | 利用可能なスキル一覧     |
| `importedSkills`     | `ImportedSkill[]`                | `[]`    | インポート済みスキル一覧 |
| `selectedSkillName`  | `string \| null`                 | `null`  | 選択中のスキル名         |
| `isExecuting`        | `boolean`                        | `false` | 実行中フラグ             |
| `executionId`        | `string \| null`                 | `null`  | 現在の実行ID             |
| `executionStatus`    | `SkillExecutionStatus \| null`   | `null`  | 実行ステータス           |
| `streamingMessages`  | `SkillStreamMessage[]`           | `[]`    | ストリーミングメッセージ |
| `pendingPermission`  | `SkillPermissionRequest \| null` | `null`  | 保留中の権限リクエスト   |
| `skillError`         | `string \| null`                 | `null`  | エラー情報               |
| `isLoadingSkills`    | `boolean`                        | `false` | スキル一覧読み込み中     |
| `isScanning`         | `boolean`                        | `false` | スキルスキャン中         |
| `isImporting`        | `boolean`                        | `false` | スキルインポート中       |
| `importingSkillName` | `string \| null`                 | `null`  | インポート中のスキル名   |

### アクション定義（10メソッド）

| アクション               | シグネチャ                                        | 説明                           |
| ------------------------ | ------------------------------------------------- | ------------------------------ |
| `fetchSkills`            | `() => Promise<void>`                             | スキル一覧取得                 |
| `rescanSkills`           | `() => Promise<void>`                             | スキル再スキャン               |
| `importSkill`            | `(skillName: string) => Promise<void>`            | スキルインポート               |
| `removeSkill`            | `(skillName: string) => Promise<void>`            | スキル削除                     |
| `selectSkill`            | `(skillName: string \| null) => void`             | スキル選択                     |
| `executeSkill`           | `(prompt: string) => Promise<void>`               | スキル実行                     |
| `abortExecution`         | `() => void`                                      | 実行中断                       |
| `respondToPermission`    | `(approved: boolean, remember?: boolean) => void` | 権限リクエスト応答             |
| `clearError`             | `() => void`                                      | エラークリア                   |
| `clearStreamingMessages` | `() => void`                                      | ストリーミングメッセージクリア |

### 内部ハンドラー（4メソッド）

IPCイベントを受信して状態を更新する内部ハンドラー。`setupSkillListeners.ts`から呼び出される。

| ハンドラー                 | シグネチャ                                     | トリガーIPC                |
| -------------------------- | ---------------------------------------------- | -------------------------- |
| `_handleStreamMessage`     | `(msg: SkillStreamMessage) => void`            | `skill:stream`             |
| `_handleComplete`          | `(executionId: string) => void`                | `skill:complete`           |
| `_handleError`             | `(executionId: string, error: string) => void` | `skill:error`              |
| `_handlePermissionRequest` | `(req: SkillPermissionRequest) => void`        | `skill:permission-request` |

### IPCリスナー設定パターン

`setupSkillListeners.ts`はアプリ初期化時に一度だけ呼び出し、クリーンアップ関数を返す。

**設定タイミング**: App.tsxの`useEffect`内

**クリーンアップ**: アンマウント時にリスナーを解除

| リスナー              | IPCチャネル                | 対応ハンドラー             |
| --------------------- | -------------------------- | -------------------------- |
| `onStream`            | `skill:stream`             | `_handleStreamMessage`     |
| `onComplete`          | `skill:complete`           | `_handleComplete`          |
| `onError`             | `skill:error`              | `_handleError`             |
| `onPermissionRequest` | `skill:permission-request` | `_handlePermissionRequest` |

### Store統合

**統合先ファイル**: `apps/desktop/src/renderer/store/index.ts`

**セレクター**: `useSkillStore`

| インポート対象     | インポート元          |
| ------------------ | --------------------- |
| `createSkillSlice` | `./slices/skillSlice` |
| `SkillSlice`       | `./slices/skillSlice` |

**統合パターン**:

| 要素               | 説明                                            |
| ------------------ | ----------------------------------------------- |
| `AppStore`         | 全Sliceを統合したストア型定義にSkillSliceを追加 |
| `create<AppStore>` | Zustandのcreate関数でskillSliceを展開           |
| `useSkillStore`    | skillSlice専用セレクター（shallow比較）         |

### 品質メトリクス

| 指標              | 値     |
| ----------------- | ------ |
| テスト数          | 113    |
| Line Coverage     | 100%   |
| Branch Coverage   | 98.21% |
| Function Coverage | 100%   |
| TypeScript strict | PASS   |
| ESLint            | PASS   |

### 関連タスク

| タスクID | 内容                      | ステータス |
| -------- | ------------------------- | ---------- |
| TASK-6-1 | SkillSlice実装（Zustand） | **完了**   |
| TASK-7A  | SkillSelector             | **完了**   |
| TASK-7B  | SkillImportDialog         | 未着手     |
| TASK-7C  | PermissionDialog          | 未着手     |
| TASK-7D  | ChatPanel統合             | 未着手     |

---

## 関連ドキュメント

- [アーキテクチャパターン概要](./architecture-patterns.md)
- [UIコンポーネントパターン](./arch-ui-components.md)
- [スキル関連インターフェース](./interfaces-agent-sdk-skill.md)
