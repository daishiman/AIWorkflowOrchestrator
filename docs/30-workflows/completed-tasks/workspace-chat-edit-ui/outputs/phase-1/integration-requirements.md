# 統合要件定義書

## メタ情報

| 項目   | 内容                   |
| ------ | ---------------------- |
| Phase  | 1                      |
| タスク | 統合要件の定義         |
| 作成日 | 2026-01-24             |
| 機能名 | workspace-chat-edit-ui |

---

## 1. データフロー図

### 1.1 全体アーキテクチャ

```
┌─────────────────────────────────────────────────────────────────┐
│                        UI Components                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐    ┌──────────────────┐                   │
│  │FileContextDropZone│    │ EditCommandInput │                   │
│  └────────┬─────────┘    └────────┬─────────┘                   │
│           │                       │                              │
│           ▼                       ▼                              │
│  ┌──────────────────┐    ┌──────────────────┐                   │
│  │FileContextBadge  │    │    DiffPreview   │                   │
│  │     (複数)       │    │  ┌────────────┐  │                   │
│  └────────┬─────────┘    │  │ DiffEditor │  │                   │
│           │               │  └────────────┘  │                   │
│           │               │  ┌────────────┐  │                   │
│           │               │  │ApplyControls│  │                   │
│           │               │  └────────────┘  │                   │
│           │               └────────┬─────────┘                   │
│           │                        │                              │
└───────────┼────────────────────────┼────────────────────────────┘
            │                        │
            ▼                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                          Hooks Layer                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐    ┌──────────────────┐                   │
│  │  useFileContext  │    │   useDiffApply   │                   │
│  │                  │    │                  │                   │
│  │  - fileContexts  │    │  - currentResult │                   │
│  │  - isDragging    │    │  - isLoading     │                   │
│  │  - error         │    │  - calculateDiff │                   │
│  │  - attachFile    │    │  - applyResult   │                   │
│  │  - removeFile... │    │  - rejectResult  │                   │
│  └────────┬─────────┘    └────────┬─────────┘                   │
│           │                        │                              │
└───────────┼────────────────────────┼────────────────────────────┘
            │                        │
            ▼                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Zustand Store                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    chatEditSlice                          │   │
│  │  - fileContexts: FileContext[]                            │   │
│  │  - generatedResults: GeneratedResult[]                    │   │
│  │  - currentResultId: string | null                         │   │
│  │  - isLoading: boolean                                     │   │
│  │  - isDiffPreviewOpen: boolean                             │   │
│  │  - error: string | null                                   │   │
│  │  - isDragging: boolean                                    │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. useFileContext 連携

### 2.1 提供される状態

| 状態             | 型             | 説明                       | 使用コンポーネント         |
| ---------------- | -------------- | -------------------------- | -------------------------- |
| fileContexts     | FileContext[]  | 添付ファイル一覧           | FileContextBadge, DropZone |
| activeContextId  | string \| null | アクティブなコンテキストID | FileContextBadge           |
| isDragging       | boolean        | ドラッグ中フラグ           | FileContextDropZone        |
| error            | string \| null | エラーメッセージ           | FileContextDropZone        |
| warning          | string \| null | 警告メッセージ             | FileContextDropZone        |
| canAddContext    | boolean        | 追加可能か                 | FileContextDropZone        |
| totalContextSize | number         | 合計サイズ                 | FileContextDropZone        |

### 2.2 提供されるアクション

| アクション        | シグネチャ                                                     | 使用コンポーネント  |
| ----------------- | -------------------------------------------------------------- | ------------------- |
| attachFile        | (filePath: string, selection?: TextSelection) => Promise<void> | FileContextDropZone |
| addFileContext    | (context: Omit<FileContext, 'id' \| 'addedAt'>) => void        | FileContextDropZone |
| removeFileContext | (id: string) => void                                           | FileContextBadge    |
| clearAllContexts  | () => void                                                     | （外部）            |
| setActiveContext  | (id: string \| null) => void                                   | FileContextBadge    |
| setDragging       | (dragging: boolean) => void                                    | FileContextDropZone |
| clearError        | () => void                                                     | FileContextDropZone |

### 2.3 データフロー: FileContextDropZone → useFileContext

```
1. ユーザーがファイルをドラッグ開始
   ↓
2. FileContextDropZone: onDragEnter → setDragging(true)
   ↓
3. useFileContext: isDragging = true
   ↓
4. FileContextDropZone: ビジュアルフィードバック表示
   ↓
5. ユーザーがファイルをドロップ
   ↓
6. FileContextDropZone: バリデーション実行
   ├── ファイルサイズ > 10MB → エラー表示
   └── ファイル数 > 10 → エラー表示
   ↓
7. FileContextDropZone: onFilesDropped → attachFile(filePath)
   ↓
8. useFileContext: addFileContext(context)
   ↓
9. chatEditSlice: fileContexts.push(context)
   ↓
10. FileContextBadge: 新しいバッジが表示
```

---

## 3. useDiffApply 連携

### 3.1 提供される状態

| 状態              | 型                      | 説明             | 使用コンポーネント |
| ----------------- | ----------------------- | ---------------- | ------------------ |
| currentResult     | GeneratedResult \| null | 現在の生成結果   | DiffPreview        |
| isDiffPreviewOpen | boolean                 | プレビュー表示中 | DiffPreview        |
| isLoading         | boolean                 | ローディング中   | ApplyControls      |
| error             | string \| null          | エラーメッセージ | ApplyControls      |

### 3.2 提供されるアクション

| アクション       | シグネチャ                                          | 使用コンポーネント |
| ---------------- | --------------------------------------------------- | ------------------ |
| calculateDiff    | (original: string, generated: string) => DiffHunk[] | DiffEditor         |
| applyResult      | (resultId: string) => Promise<ApplyResult>          | ApplyControls      |
| rejectResult     | (resultId: string) => void                          | ApplyControls      |
| openDiffPreview  | (resultId: string) => void                          | （外部）           |
| closeDiffPreview | () => void                                          | DiffPreview        |

### 3.3 データフロー: DiffPreview → useDiffApply

```
1. LLM生成結果が受信される
   ↓
2. chatEditSlice: generatedResults.push(result)
   ↓
3. 外部コンポーネント: openDiffPreview(resultId)
   ↓
4. useDiffApply: isDiffPreviewOpen = true, currentResultId = resultId
   ↓
5. DiffPreview: 表示される
   ↓
6. DiffEditor: result.originalContent / result.generatedContent を表示
   ↓
7. ユーザーが適用ボタンをクリック
   ↓
8. ApplyControls: handleApply → applyResult(resultId)
   ↓
9. useDiffApply: approveResultAction(resultId)
   ↓
10. chatEditSlice: ファイルに書き込み、result.status = 'approved'
    ↓
11. ApplyControls: onApplied(result) コールバック
    ↓
12. DiffPreview: closeDiffPreview() → 閉じる
```

---

## 4. コンポーネント連携マトリクス

| コンポーネント      | useFileContext | useDiffApply  | 直接連携                  |
| ------------------- | -------------- | ------------- | ------------------------- |
| FileContextBadge    | ✅ 参照・更新  | -             | -                         |
| ApplyControls       | -              | ✅ 参照・更新 | -                         |
| FileContextDropZone | ✅ 参照・更新  | -             | -                         |
| DiffPreview         | -              | ✅ 参照       | ApplyControls, DiffEditor |
| DiffEditor          | -              | ✅ 参照       | -                         |
| EditCommandInput    | -              | -             | Props経由のみ             |

---

## 5. エラーハンドリングフロー

### 5.1 ファイル添付エラー

```
FileContextDropZone
       │
       ▼
┌──────────────────────────────────────┐
│ バリデーションエラー                  │
│ - TOO_LARGE: ファイルサイズ超過       │
│ - MAX_CONTEXTS_EXCEEDED: ファイル数超過│
│ - DUPLICATE_FILE: 重複ファイル        │
└────────────────┬─────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────┐
│ useFileContext.setError(errorCode)   │
└────────────────┬─────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────┐
│ FileContextDropZone: エラー表示      │
│ - Toast または インラインメッセージ   │
└──────────────────────────────────────┘
```

### 5.2 適用エラー

```
ApplyControls: applyResult(resultId)
       │
       ▼
┌──────────────────────────────────────┐
│ useDiffApply.applyResult()           │
│       │                              │
│       ▼                              │
│ ┌────────────────────────────────┐   │
│ │ IPC: writeFile                 │   │
│ └────────────────────────────────┘   │
└────────────────┬─────────────────────┘
                 │
        ┌────────┴────────┐
        ▼                 ▼
   成功                 失敗
        │                 │
        ▼                 ▼
┌─────────────────┐ ┌──────────────────────┐
│ onApplied()     │ │ error: WRITE_ERROR   │
│ closeDiffPreview│ │ エラーメッセージ表示  │
└─────────────────┘ └──────────────────────┘
```

---

## 6. 状態同期要件

### 6.1 同期が必要なケース

| ケース            | 同期元              | 同期先           | 同期内容         |
| ----------------- | ------------------- | ---------------- | ---------------- |
| ファイル追加      | FileContextDropZone | FileContextBadge | 新しいバッジ表示 |
| ファイル削除      | FileContextBadge    | 他のBadge        | フォーカス移動   |
| 適用成功          | ApplyControls       | DiffPreview      | プレビュー閉じる |
| ドラッグ開始/終了 | FileContextDropZone | ビジュアル更新   | スタイル変更     |

### 6.2 楽観的更新

| 操作         | 楽観的更新 | ロールバック条件 |
| ------------ | ---------- | ---------------- |
| ファイル追加 | ✅         | 読み込み失敗時   |
| ファイル削除 | ✅         | なし（即時反映） |
| 適用         | ❌         | 書き込み失敗時   |
| 却下         | ✅         | なし（即時反映） |

---

## 7. テスト可能性要件

### 7.1 モック戦略

| 依存先         | モック方法                       |
| -------------- | -------------------------------- |
| useFileContext | vi.mock でフック全体をモック     |
| useDiffApply   | vi.mock でフック全体をモック     |
| chatEditSlice  | createStore でテスト用ストア作成 |
| Monaco Editor  | vi.mock('@monaco-editor/react')  |
| IPC API        | window.chatEditAPI をモック      |

### 7.2 テスト分離

| テストレベル | 対象                                   |
| ------------ | -------------------------------------- |
| ユニット     | 個別コンポーネント（Hooks モック）     |
| 統合         | コンポーネント + Hooks（ストアモック） |
| E2E          | 全コンポーネント + 実ストア            |

---

## 作成日時

- 作成: 2026-01-24
- 作成者: Claude Code
