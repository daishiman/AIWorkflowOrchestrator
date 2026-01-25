# Phase 5: 実装（TDD Green） - タスク仕様書

## メタ情報

| 項目       | 内容                   |
| ---------- | ---------------------- |
| Phase      | 5                      |
| Phase名    | 実装（TDD Green）      |
| 前提Phase  | Phase 4（テスト作成）  |
| 後続Phase  | Phase 6（テスト拡充）  |
| ステータス | 未実施                 |
| 作成日     | 2026-01-24             |
| 機能名     | workspace-chat-edit-ui |

---

## 目的

TDDのGreenフェーズとして、Phase 4で作成したテストを通過させる最小限の実装を行う。

## 背景

失敗するテストが作成されており、これらを成功させる実装を行う。
「動くこと」を最優先し、コードの品質改善はPhase 8で行う。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: FileContextBadge 実装

**目的**: FileContextBadgeコンポーネントを実装しテストを通過させる

**実行手順**:

1. `FileContextBadge.tsx` を作成
2. Propsインターフェースを実装
3. ファイル名表示、削除ボタン、aria-labelを実装
4. テストを実行し成功を確認

**実装例**:

```typescript
import { type FC } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { FileContext } from '../types';

interface FileContextBadgeProps {
  context: FileContext;
  onRemove?: () => void;
}

export const FileContextBadge: FC<FileContextBadgeProps> = ({ context, onRemove }) => {
  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
      <span className="text-sm truncate max-w-[200px]">{context.fileName}</span>
      {onRemove && (
        <button
          type="button"
          aria-label={`${context.fileName}を削除`}
          onClick={onRemove}
          className="p-0.5 hover:bg-gray-200 rounded"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
```

**期待される成果物**:

- `apps/desktop/src/renderer/features/workspace-chat-edit/components/FileContextBadge.tsx`

---

### タスク2: ApplyControls 実装

**目的**: ApplyControlsコンポーネントを実装しテストを通過させる

**実行手順**:

1. `ApplyControls.tsx` を作成
2. useDiffApply hookと連携
3. 適用/却下ボタン、ローディング状態を実装
4. テストを実行し成功を確認

**実装例**:

```typescript
import { type FC } from 'react';
import { useDiffApply } from '../hooks';

interface ApplyControlsProps {
  resultId: string;
  onApplied?: () => void;
  onRejected?: () => void;
}

export const ApplyControls: FC<ApplyControlsProps> = ({ resultId, onApplied, onRejected }) => {
  const { applyResult, rejectResult, isLoading } = useDiffApply();

  const handleApply = async () => {
    const result = await applyResult(resultId);
    if (result.success) onApplied?.();
  };

  const handleReject = () => {
    rejectResult(resultId);
    onRejected?.();
  };

  return (
    <div className="flex gap-2">
      <button
        type="button"
        disabled={isLoading}
        onClick={handleApply}
        aria-label="変更を適用"
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
      >
        適用
      </button>
      <button
        type="button"
        disabled={isLoading}
        onClick={handleReject}
        aria-label="変更を却下"
        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
      >
        却下
      </button>
    </div>
  );
};
```

**期待される成果物**:

- `apps/desktop/src/renderer/features/workspace-chat-edit/components/ApplyControls.tsx`

---

### タスク3: FileContextDropZone 実装

**目的**: FileContextDropZoneコンポーネントを実装しテストを通過させる

**実行手順**:

1. `FileContextDropZone.tsx` を作成
2. HTML5 Drag and Drop APIを使用
3. ドラッグ状態、ファイルバリデーションを実装
4. テストを実行し成功を確認

**期待される成果物**:

- `apps/desktop/src/renderer/features/workspace-chat-edit/components/FileContextDropZone.tsx`

---

### タスク4: DiffPreview 実装

**目的**: DiffPreviewコンポーネントを実装しテストを通過させる

**実行手順**:

1. `DiffPreview.tsx` を作成
2. DiffEditor、ApplyControlsを統合
3. ヘッダー、閉じるボタンを実装
4. テストを実行し成功を確認

**期待される成果物**:

- `apps/desktop/src/renderer/features/workspace-chat-edit/components/DiffPreview.tsx`

---

### タスク5: DiffEditor 実装

**目的**: DiffEditorコンポーネントを実装しテストを通過させる

**実行手順**:

1. `DiffEditor.tsx` を作成
2. @monaco-editor/react のDiffEditorを統合
3. 言語別シンタックスハイライト設定を実装
4. テストを実行し成功を確認

**実装例**:

```typescript
import { type FC } from 'react';
import { DiffEditor as MonacoDiffEditor } from '@monaco-editor/react';

interface DiffEditorProps {
  original: string;
  modified: string;
  language: string;
  readOnly?: boolean;
}

export const DiffEditor: FC<DiffEditorProps> = ({ original, modified, language, readOnly = true }) => {
  return (
    <MonacoDiffEditor
      original={original}
      modified={modified}
      language={language}
      options={{
        readOnly,
        renderSideBySide: true,
        minimap: { enabled: false },
        lineNumbers: 'on',
        scrollBeyondLastLine: false,
      }}
      height="400px"
    />
  );
};
```

**期待される成果物**:

- `apps/desktop/src/renderer/features/workspace-chat-edit/components/DiffEditor.tsx`

---

### タスク6: EditCommandInput 実装

**目的**: EditCommandInputコンポーネントを実装しテストを通過させる

**実行手順**:

1. `EditCommandInput.tsx` を作成
2. コマンドタイプセレクタ、カスタム指示入力を実装
3. 送信ハンドリングを実装
4. テストを実行し成功を確認

**期待される成果物**:

- `apps/desktop/src/renderer/features/workspace-chat-edit/components/EditCommandInput.tsx`

---

### タスク7: index.ts エクスポート作成

**目的**: コンポーネントのエクスポートファイルを作成する

**実行手順**:

1. `components/index.ts` を作成
2. 全コンポーネントをre-export

**実装例**:

```typescript
export { FileContextBadge } from "./FileContextBadge";
export { ApplyControls } from "./ApplyControls";
export { FileContextDropZone } from "./FileContextDropZone";
export { DiffPreview } from "./DiffPreview";
export { DiffEditor } from "./DiffEditor";
export { EditCommandInput } from "./EditCommandInput";
```

**期待される成果物**:

- `apps/desktop/src/renderer/features/workspace-chat-edit/components/index.ts`

---

## 参照資料

| 参照資料      | パス                                                                           | 内容               |
| ------------- | ------------------------------------------------------------------------------ | ------------------ |
| Phase 2成果物 | `outputs/phase-2/`                                                             | コンポーネント設計 |
| Phase 4成果物 | `apps/desktop/src/renderer/features/workspace-chat-edit/components/__tests__/` | テストファイル     |
| 既存Hooks     | `apps/desktop/src/renderer/features/workspace-chat-edit/hooks/`                | useFileContext等   |

---

## 成果物

| 成果物              | パス                                                                                        |
| ------------------- | ------------------------------------------------------------------------------------------- |
| FileContextBadge    | `apps/desktop/src/renderer/features/workspace-chat-edit/components/FileContextBadge.tsx`    |
| ApplyControls       | `apps/desktop/src/renderer/features/workspace-chat-edit/components/ApplyControls.tsx`       |
| FileContextDropZone | `apps/desktop/src/renderer/features/workspace-chat-edit/components/FileContextDropZone.tsx` |
| DiffPreview         | `apps/desktop/src/renderer/features/workspace-chat-edit/components/DiffPreview.tsx`         |
| DiffEditor          | `apps/desktop/src/renderer/features/workspace-chat-edit/components/DiffEditor.tsx`          |
| EditCommandInput    | `apps/desktop/src/renderer/features/workspace-chat-edit/components/EditCommandInput.tsx`    |
| index.ts            | `apps/desktop/src/renderer/features/workspace-chat-edit/components/index.ts`                |

---

## 統合テスト連携（Phase 1〜11は必須）

Hooks連携実装とテスト支援コード整備。

具体的なアクション:

- [ ] ApplyControls → useDiffApply 連携実装
- [ ] FileContextDropZone → useFileContext 連携実装
- [ ] 統合テストが成功することを確認

---

## 完了条件

- [ ] 6種類のコンポーネントが実装されている
- [ ] Phase 4のテストが全て成功する（Green状態）
- [ ] index.tsでコンポーネントがエクスポートされている
- [ ] TypeScriptエラーがないこと

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test -- --run --testPathPattern="workspace-chat-edit/components"
```

**確認項目**:

- [ ] テストが成功することを確認（Green状態）

---

## 依存関係

- **前提**: Phase 4（テスト作成）が完了していること
- **後続**: Phase 6（テスト拡充）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/workspace-chat-edit-ui/phase-6-test-expansion.md`
