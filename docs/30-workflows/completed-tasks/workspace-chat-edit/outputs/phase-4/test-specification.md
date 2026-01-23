# テスト仕様書 - workspace-chat-edit

## メタ情報

| 項目     | 内容                  |
| -------- | --------------------- |
| タスクID | TASK-WS-CHAT-EDIT-001 |
| Phase    | 4                     |
| 作成日   | 2026-01-23            |

---

## テスト方針

### TDD Red-Green-Refactor サイクル

本フェーズでは TDD の「Red」フェーズを実施する。実装が存在しない状態でテストを先に作成し、全テストが失敗することを確認する。

### テストピラミッド

| レベル      | 割合 | 目標カバレッジ | 実行頻度     |
| ----------- | ---- | -------------- | ------------ |
| Unit        | 80%  | 80%            | 毎回コミット |
| Integration | 15%  | 60%            | 毎回push     |
| E2E         | 5%   | 主要フロー     | CI/CD        |

### テスト対象範囲

| 対象             | テスト種別  | 優先度 |
| ---------------- | ----------- | ------ |
| useFileContext   | Unit        | 必須   |
| chatEditSlice    | Unit        | 必須   |
| useDiffApply     | Unit        | 必須   |
| IPCハンドラー    | Integration | 必須   |
| UIコンポーネント | Unit (RTL)  | 重要   |
| データフロー     | Integration | 重要   |

---

## ユニットテスト設計

### 1. useFileContext Hook

**ファイル**: `apps/desktop/src/renderer/features/workspace-chat-edit/hooks/__tests__/useFileContext.test.ts`

| テストID   | シナリオ                 | 入力                     | 期待結果                 |
| ---------- | ------------------------ | ------------------------ | ------------------------ |
| UT-001     | ファイルコンテキスト追加 | FileContext オブジェクト | fileContexts に追加      |
| UT-002     | 選択範囲付きコンテキスト | selection 付き           | selection 情報が含まれる |
| UT-003     | コンテキスト削除         | コンテキスト ID          | 配列から削除             |
| UT-004     | 全コンテキストクリア     | なし                     | 空配列                   |
| UT-BND-001 | 最大10件制限             | 11件追加                 | エラーまたは警告         |
| UT-BND-002 | 重複ファイル追加         | 同一パス                 | エラーまたは上書き       |

**Arrange-Act-Assert パターン**:

```typescript
// Arrange: テストデータの準備
const fileContext = {
  filePath: "/path/to/file.ts",
  fileName: "file.ts",
  content: "const x = 1;",
  language: "typescript",
  fileSize: 1024,
};

// Act: 操作の実行
act(() => {
  result.current.addFileContext(fileContext);
});

// Assert: 結果の検証
expect(result.current.fileContexts).toHaveLength(1);
```

### 2. chatEditSlice Store

**ファイル**: `apps/desktop/src/renderer/store/slices/__tests__/chatEditSlice.test.ts`

| テストID | シナリオ         | 入力            | 期待結果           |
| -------- | ---------------- | --------------- | ------------------ |
| UT-005   | 生成結果の設定   | GeneratedResult | state が更新       |
| UT-006   | 結果承認         | resultId        | status が approved |
| UT-007   | 結果却下         | resultId        | status が rejected |
| UT-008   | ローディング状態 | boolean         | isLoading が更新   |
| UT-009   | エラー状態設定   | error message   | error が設定       |
| UT-010   | 状態リセット     | なし            | 初期状態に戻る     |

**状態遷移テスト**:

```
初期状態 → addFileContext → fileContexts: [context]
初期状態 → setGeneratedResult → generatedResults: [result], currentResultId: id
pending → approveResult → approved
pending → rejectResult → rejected
```

### 3. useDiffApply Hook

**ファイル**: `apps/desktop/src/renderer/features/workspace-chat-edit/hooks/__tests__/useDiffApply.test.ts`

| テストID | シナリオ     | 入力                | 期待結果               |
| -------- | ------------ | ------------------- | ---------------------- |
| UT-011   | 差分計算     | original, generated | DiffHunk[] が生成      |
| UT-012   | ファイル適用 | resultId            | writeFile IPC 呼び出し |
| UT-013   | 適用成功     | 正常レスポンス      | success: true          |
| UT-014   | 適用失敗     | エラーレスポンス    | error 情報設定         |

### 4. UIコンポーネント

**FileContextBadge**:
**ファイル**: `apps/desktop/src/renderer/components/ChatPanel/__tests__/FileContextBadge.test.tsx`

| テストID | シナリオ     | 入力        | 期待結果          |
| -------- | ------------ | ----------- | ----------------- |
| UT-015   | バッジ表示   | FileContext | ファイル名表示    |
| UT-016   | 削除ボタン   | クリック    | onRemove 呼び出し |
| UT-017   | ツールチップ | ホバー      | フルパス表示      |

**DiffPreview**:
**ファイル**: `apps/desktop/src/renderer/components/DiffPreview/__tests__/DiffPreview.test.tsx`

| テストID | シナリオ         | 入力            | 期待結果         |
| -------- | ---------------- | --------------- | ---------------- |
| UT-018   | 差分エディタ表示 | GeneratedResult | Monaco Diff 表示 |
| UT-019   | 追加行ハイライト | add diff        | 緑色ハイライト   |
| UT-020   | 削除行ハイライト | remove diff     | 赤色ハイライト   |

**ApplyControls**:
**ファイル**: `apps/desktop/src/renderer/components/DiffPreview/__tests__/ApplyControls.test.tsx`

| テストID | シナリオ       | 入力           | 期待結果          |
| -------- | -------------- | -------------- | ----------------- |
| UT-021   | 適用ボタン     | クリック       | onApply 呼び出し  |
| UT-022   | 却下ボタン     | クリック       | onReject 呼び出し |
| UT-023   | ローディング中 | isLoading=true | ボタン無効化      |

---

## 統合テスト設計

### IPC接続テスト

**ファイル**: `apps/desktop/src/renderer/features/workspace-chat-edit/__tests__/integration/ipc.test.ts`

| テストID | シナリオ                 | 入力          | 期待結果               |
| -------- | ------------------------ | ------------- | ---------------------- |
| IT-001   | ファイル読み取り IPC     | filePath      | content, language 返却 |
| IT-002   | ファイル書き込み IPC     | path, content | success: true          |
| IT-003   | 選択範囲取得 IPC         | なし          | TextSelection 返却     |
| IT-004   | コンテキスト付き送信 IPC | request       | GeneratedResult 返却   |

### データフローテスト

**ファイル**: `apps/desktop/src/renderer/features/workspace-chat-edit/__tests__/integration/dataflow.test.ts`

| テストID | シナリオ             | フロー                          |
| -------- | -------------------- | ------------------------------- |
| IT-005   | 添付→LLM→差分表示    | Renderer→Main→LLM→Main→Renderer |
| IT-006   | 複数コンテキスト追加 | 状態同期の検証                  |
| IT-007   | ストリーミング出力   | stream-output イベント受信      |

### エラーハンドリングテスト

**ファイル**: `apps/desktop/src/renderer/features/workspace-chat-edit/__tests__/integration/error.test.ts`

| テストID | シナリオ           | 入力            | 期待結果              |
| -------- | ------------------ | --------------- | --------------------- |
| IT-008   | 存在しないファイル | invalid path    | FILE_NOT_FOUND エラー |
| IT-009   | 権限なしファイル   | restricted path | PERMISSION_DENIED     |
| IT-010   | サイズ超過         | >10MB file      | TOO_LARGE エラー      |
| IT-011   | LLM エラー         | API error       | LLM_ERROR 表示        |
| IT-012   | タイムアウト       | timeout         | TIMEOUT エラー        |

### 状態同期テスト

**ファイル**: `apps/desktop/src/renderer/features/workspace-chat-edit/__tests__/integration/state-sync.test.ts`

| テストID | シナリオ            | 検証内容                   |
| -------- | ------------------- | -------------------------- |
| IT-013   | chatEditSlice 同期  | fileContexts 状態一貫性    |
| IT-014   | workspaceSlice 連携 | 開いているファイル情報参照 |
| IT-015   | chatSlice 連携      | メッセージ履歴への統合     |

---

## 境界値テスト設計

**ファイル**: `apps/desktop/src/renderer/features/workspace-chat-edit/__tests__/boundary.test.ts`

### ファイルサイズ境界

| テストID | シナリオ          | 入力サイズ | 期待結果             |
| -------- | ----------------- | ---------- | -------------------- |
| BND-001  | 空ファイル        | 0 bytes    | 正常処理             |
| BND-002  | 小さいファイル    | 1 byte     | 正常処理             |
| BND-003  | 1MB 境界          | 1MB        | 正常処理             |
| BND-004  | 10MB 境界（許容） | 10MB       | 正常処理（警告あり） |
| BND-005  | 10MB 超過         | 10MB + 1   | TOO_LARGE エラー     |

### コンテキスト数境界

| テストID | シナリオ     | 入力件数 | 期待結果         |
| -------- | ------------ | -------- | ---------------- |
| BND-006  | 0件で送信    | 0        | 送信不可         |
| BND-007  | 1件で送信    | 1        | 送信可能         |
| BND-008  | 10件（最大） | 10       | 送信可能         |
| BND-009  | 11件超過     | 11       | エラーまたは警告 |

### 選択範囲境界

| テストID | シナリオ       | 入力                | 期待結果       |
| -------- | -------------- | ------------------- | -------------- |
| BND-010  | 選択なし       | null                | 全ファイル添付 |
| BND-011  | 1文字選択      | 1 char              | 正常処理       |
| BND-012  | 全ファイル選択 | all content         | 正常処理       |
| BND-013  | 無効な範囲     | endLine < startLine | エラー         |

---

## モック戦略

### IPC モック

```typescript
// apps/desktop/src/test/mocks/chatEditMocks.ts

export const mockChatEditAPI = {
  readFile: vi.fn(),
  writeFile: vi.fn(),
  getEditorSelection: vi.fn(),
  sendWithContext: vi.fn(),
  detectLanguage: vi.fn(),
  onStreamOutput: vi.fn(),
};

vi.mock("@/preload/chatEditApi", () => ({
  chatEditAPI: mockChatEditAPI,
}));
```

### Zustand Store モック

```typescript
// テスト用初期状態
const mockInitialState: ChatEditState = {
  fileContexts: [],
  activeContextId: null,
  generatedResults: [],
  currentResultId: null,
  isLoading: false,
  isDiffPreviewOpen: false,
  error: null,
  isDragging: false,
};
```

### LLM レスポンスモック

```typescript
export const mockGeneratedResult: GeneratedResult = {
  id: "result-1",
  contextId: "context-1",
  originalContent: "const x = 1;",
  generatedContent: "const x: number = 1;",
  diffHunks: [
    {
      type: "modify",
      originalStartLine: 1,
      originalEndLine: 1,
      newStartLine: 1,
      newEndLine: 1,
      originalLines: ["const x = 1;"],
      newLines: ["const x: number = 1;"],
    },
  ],
  status: "pending",
  createdAt: new Date(),
  targetFilePath: "/path/to/file.ts",
  command: { type: "refactor", targetContextId: "context-1" },
};
```

---

## テストカバレッジ目標

| 対象             | Statements | Branches | Functions | Lines |
| ---------------- | ---------- | -------- | --------- | ----- |
| useFileContext   | 100%       | 100%     | 100%      | 100%  |
| chatEditSlice    | 100%       | 100%     | 100%      | 100%  |
| useDiffApply     | 100%       | 100%     | 100%      | 100%  |
| UIコンポーネント | 80%        | 80%      | 80%       | 80%   |
| 統合テスト       | 60%        | 60%      | 60%       | 60%   |

---

## 関連ドキュメント

- 要件定義書: `outputs/phase-1/requirements-definition.md`
- 受け入れ基準: `outputs/phase-1/acceptance-criteria.md`
- アーキテクチャ設計: `outputs/phase-2/architecture-design.md`
- ドメインモデル: `outputs/phase-2/domain-model.md`
- IPC API設計: `outputs/phase-2/ipc-api-design.md`
- 品質要件: `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`
