# Phase 1: 要件定義 - SkillSlice実装

## タスク概要

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| タスクID   | TASK-6-1                             |
| タスク名   | SkillSlice 実装（Zustand）           |
| Phase      | 1 - 要件定義                         |
| 依存タスク | TASK-5-1（SkillAPI実装）             |
| 見積複雑度 | medium                               |
| 担当領域   | frontend, renderer, state-management |

## 目的

スキル機能の状態管理を行う Zustand Slice を実装し、既存の `ChatSlice`、`LLMSlice` パターンに準拠して `useAppStore` に統合する。

## 機能要件

### FR-6-1-01: 状態管理

| 要件ID     | 説明                                                   | 優先度 |
| ---------- | ------------------------------------------------------ | ------ |
| FR-6-1-01a | 利用可能なスキル一覧（`availableSkills`）を保持する    | 必須   |
| FR-6-1-01b | インポート済みスキル一覧（`importedSkills`）を保持する | 必須   |
| FR-6-1-01c | 選択中のスキル名（`selectedSkillName`）を保持する      | 必須   |
| FR-6-1-01d | 実行状態（`isExecuting`, `executionId`）を保持する     | 必須   |
| FR-6-1-01e | 実行ステータス（`executionStatus`）を保持する          | 必須   |
| FR-6-1-01f | ストリーミングメッセージ一覧を保持する                 | 必須   |
| FR-6-1-01g | 保留中の権限リクエストを保持する                       | 必須   |
| FR-6-1-01h | エラー情報（`skillError`）を保持する                   | 必須   |

### FR-6-1-02: ローディング状態管理

| 要件ID     | 説明                                                  | 優先度 |
| ---------- | ----------------------------------------------------- | ------ |
| FR-6-1-02a | スキル読み込み中フラグ（`isLoadingSkills`）を管理する | 必須   |
| FR-6-1-02b | スキャン中フラグ（`isScanning`）を管理する            | 必須   |
| FR-6-1-02c | インポート中フラグ（`isImporting`）を管理する         | 必須   |
| FR-6-1-02d | インポート中のスキル名（`importingSkillName`）を保持  | 必須   |

### FR-6-1-03: アクション

| 要件ID     | 説明                                                | 優先度 |
| ---------- | --------------------------------------------------- | ------ |
| FR-6-1-03a | `fetchSkills()`: スキル一覧を取得する               | 必須   |
| FR-6-1-03b | `rescanSkills()`: スキルを再スキャンする            | 必須   |
| FR-6-1-03c | `importSkill(skillName)`: スキルをインポート        | 必須   |
| FR-6-1-03d | `removeSkill(skillName)`: スキルを削除              | 必須   |
| FR-6-1-03e | `selectSkill(skillName)`: スキルを選択              | 必須   |
| FR-6-1-03f | `executeSkill(prompt)`: スキルを実行                | 必須   |
| FR-6-1-03g | `abortExecution()`: 実行を中断                      | 必須   |
| FR-6-1-03h | `respondToPermission(approved, remember)`: 権限応答 | 必須   |
| FR-6-1-03i | `clearError()`: エラーをクリア                      | 必須   |
| FR-6-1-03j | `clearStreamingMessages()`: メッセージをクリア      | 必須   |

### FR-6-1-04: 内部アクション（IPCイベントハンドラ用）

| 要件ID     | 説明                                               | 優先度 |
| ---------- | -------------------------------------------------- | ------ |
| FR-6-1-04a | `_handleStreamMessage()`: ストリームメッセージ処理 | 必須   |
| FR-6-1-04b | `_handleComplete()`: 実行完了処理                  | 必須   |
| FR-6-1-04c | `_handleError()`: エラー処理                       | 必須   |
| FR-6-1-04d | `_handlePermissionRequest()`: 権限リクエスト処理   | 必須   |

### FR-6-1-05: IPCイベントリスナー設定

| 要件ID     | 説明                                   | 優先度 |
| ---------- | -------------------------------------- | ------ |
| FR-6-1-05a | ストリームイベントのリスナーを設定     | 必須   |
| FR-6-1-05b | 完了イベントのリスナーを設定           | 必須   |
| FR-6-1-05c | エラーイベントのリスナーを設定         | 必須   |
| FR-6-1-05d | 権限リクエストイベントのリスナーを設定 | 必須   |
| FR-6-1-05e | リスナーのクリーンアップ関数を提供     | 必須   |

### FR-6-1-06: ストア統合

| 要件ID     | 説明                                | 優先度 |
| ---------- | ----------------------------------- | ------ |
| FR-6-1-06a | `useAppStore` に SkillSlice を統合  | 必須   |
| FR-6-1-06b | AppStore 型定義に SkillSlice を追加 | 必須   |

## 非機能要件

### NFR-6-1-01: パフォーマンス

| 要件ID      | 説明                             | 基準     |
| ----------- | -------------------------------- | -------- |
| NFR-6-1-01a | 状態更新は16ms以内に完了すること | < 16ms   |
| NFR-6-1-01b | メモリリークが発生しないこと     | 検出なし |

### NFR-6-1-02: 保守性

| 要件ID      | 説明                             | 基準     |
| ----------- | -------------------------------- | -------- |
| NFR-6-1-02a | 既存Sliceパターンに準拠すること  | 100%準拠 |
| NFR-6-1-02b | TypeScript厳密モードでエラーなし | エラー0  |

### NFR-6-1-03: テスタビリティ

| 要件ID      | 説明                            | 基準  |
| ----------- | ------------------------------- | ----- |
| NFR-6-1-03a | 単体テストカバレッジ80%以上     | ≥ 80% |
| NFR-6-1-03b | IPC層のモック化が可能であること | 可能  |

## 入力

| 入力              | 説明                              | 参照先                                     |
| ----------------- | --------------------------------- | ------------------------------------------ |
| TASK-5-1 SkillAPI | Skill IPC API定義                 | preload経由のwindow.electronAPI.skill      |
| TASK-1-1 型定義   | SkillMetadata等の型               | `@repo/shared/types/skill.ts`              |
| 既存Sliceパターン | ChatSlice, LLMSliceの実装パターン | `store/slices/chatSlice.ts`, `llmSlice.ts` |
| 既存store構造     | useAppStore の構成                | `store/index.ts`                           |

## 出力

| 出力                   | パス                                                     |
| ---------------------- | -------------------------------------------------------- |
| skillSlice.ts          | `apps/desktop/src/renderer/store/slices/skillSlice.ts`   |
| setupSkillListeners.ts | `apps/desktop/src/renderer/store/setupSkillListeners.ts` |
| store/index.ts（修正） | `apps/desktop/src/renderer/store/index.ts`               |
| skillSlice.test.ts     | `store/slices/__tests__/skillSlice.test.ts`              |

## 受け入れ基準

| AC-ID    | 説明                                        | 検証方法       |
| -------- | ------------------------------------------- | -------------- |
| AC-6-1-1 | SkillSlice インターフェースが定義されている | コードレビュー |
| AC-6-1-2 | 全状態（10項目）が定義されている            | 型チェック     |
| AC-6-1-3 | 全アクション（14項目）が実装されている      | 単体テスト     |
| AC-6-1-4 | ローディング状態（4項目）が管理されている   | 単体テスト     |
| AC-6-1-5 | IPCイベントリスナーが設定されている         | 単体テスト     |
| AC-6-1-6 | useAppStoreに統合されている                 | ビルド成功     |
| AC-6-1-7 | 単体テストが全て通過する                    | CI/CD          |

## 前提条件

- TASK-5-1（SkillAPI実装）が完了していること
- `window.electronAPI.skill` が利用可能であること
- 型定義（`@repo/shared`）が最新であること

## 制約事項

- 既存の `ChatSlice`, `LLMSlice` パターンに厳密に準拠すること
- 新規依存パッケージの追加は不可（既存パッケージのみ使用）
- persist対象には含めない（セッション間で状態をリセット）

## 用語定義

| 用語                 | 説明                                               |
| -------------------- | -------------------------------------------------- |
| SkillSlice           | スキル機能の状態管理を行うZustandスライス          |
| SkillMetadata        | スキルの基本情報（名前、説明、パス等）を含む型     |
| ImportedSkill        | インポート済みスキルの情報を含む型                 |
| SkillExecutionStatus | スキル実行のステータス（idle/running/completed等） |
| SkillStreamMessage   | スキル実行中のストリーミングメッセージ             |
| PermissionRequest    | 実行時の権限確認リクエスト                         |
| IPC                  | プロセス間通信（Main-Renderer間）                  |
