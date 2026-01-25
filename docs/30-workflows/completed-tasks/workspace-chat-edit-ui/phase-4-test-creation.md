# Phase 4: テスト作成（TDD Red） - タスク仕様書

## メタ情報

| 項目       | 内容                    |
| ---------- | ----------------------- |
| Phase      | 4                       |
| Phase名    | テスト作成（TDD Red）   |
| 前提Phase  | Phase 3（設計レビュー） |
| 後続Phase  | Phase 5（実装）         |
| ステータス | 未実施                  |
| 作成日     | 2026-01-24              |
| 機能名     | workspace-chat-edit-ui  |

---

## 目的

TDDのRedフェーズとして、6種類のUIコンポーネントに対する失敗するテストを作成する。

## 背景

設計レビューが完了し、実装に進む前にテストを作成する。
テストファーストの原則に従い、期待する振る舞いをテストとして定義する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: FileContextBadge テスト作成

**目的**: FileContextBadgeコンポーネントのテストを作成する

**実行手順**:

1. テストファイル `FileContextBadge.test.tsx` を作成
2. 以下のテストケースを実装:
   - ファイル名が正しく表示されること
   - 削除ボタンをクリックするとonRemoveが呼ばれること
   - aria-label属性が正しく設定されていること
   - ホバー時にツールチップが表示されること
3. テストが失敗することを確認（Red状態）

**テストケース例**:

```typescript
describe('FileContextBadge', () => {
  it('ファイル名を表示する', () => {
    render(<FileContextBadge context={mockContext} />);
    expect(screen.getByText('test.ts')).toBeInTheDocument();
  });

  it('削除ボタンクリックでonRemoveが呼ばれる', () => {
    const onRemove = vi.fn();
    render(<FileContextBadge context={mockContext} onRemove={onRemove} />);
    fireEvent.click(screen.getByRole('button', { name: /削除/ }));
    expect(onRemove).toHaveBeenCalled();
  });

  it('削除ボタンにaria-labelが設定されている', () => {
    render(<FileContextBadge context={mockContext} />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'test.tsを削除');
  });
});
```

**期待される成果物**:

- `apps/desktop/src/renderer/features/workspace-chat-edit/components/__tests__/FileContextBadge.test.tsx`

---

### タスク2: ApplyControls テスト作成

**目的**: ApplyControlsコンポーネントのテストを作成する

**実行手順**:

1. テストファイル `ApplyControls.test.tsx` を作成
2. 以下のテストケースを実装:
   - 適用ボタンが表示されること
   - 却下ボタンが表示されること
   - 適用ボタンクリックでapproveResultが呼ばれること
   - 却下ボタンクリックでrejectResultが呼ばれること
   - ローディング中はボタンが無効化されること
3. テストが失敗することを確認（Red状態）

**期待される成果物**:

- `apps/desktop/src/renderer/features/workspace-chat-edit/components/__tests__/ApplyControls.test.tsx`

---

### タスク3: FileContextDropZone テスト作成

**目的**: FileContextDropZoneコンポーネントのテストを作成する

**実行手順**:

1. テストファイル `FileContextDropZone.test.tsx` を作成
2. 以下のテストケースを実装:
   - ドラッグ中にビジュアルフィードバックが表示されること
   - ファイルドロップでonFilesDroppedが呼ばれること
   - サイズ超過ファイルでエラーが表示されること
   - 最大ファイル数超過でエラーが表示されること
3. テストが失敗することを確認（Red状態）

**期待される成果物**:

- `apps/desktop/src/renderer/features/workspace-chat-edit/components/__tests__/FileContextDropZone.test.tsx`

---

### タスク4: DiffPreview テスト作成

**目的**: DiffPreviewコンポーネントのテストを作成する

**実行手順**:

1. テストファイル `DiffPreview.test.tsx` を作成
2. 以下のテストケースを実装:
   - ファイル名がヘッダーに表示されること
   - DiffEditorが表示されること
   - ApplyControlsが表示されること
   - 閉じるボタンでonCloseが呼ばれること
3. テストが失敗することを確認（Red状態）

**期待される成果物**:

- `apps/desktop/src/renderer/features/workspace-chat-edit/components/__tests__/DiffPreview.test.tsx`

---

### タスク5: DiffEditor テスト作成

**目的**: DiffEditorコンポーネントのテストを作成する

**実行手順**:

1. テストファイル `DiffEditor.test.tsx` を作成
2. 以下のテストケースを実装:
   - Monaco Diff Editorがレンダリングされること
   - original/modified propsが正しく渡されること
   - language propsでシンタックスハイライトが設定されること
3. テストが失敗することを確認（Red状態）

**期待される成果物**:

- `apps/desktop/src/renderer/features/workspace-chat-edit/components/__tests__/DiffEditor.test.tsx`

---

### タスク6: EditCommandInput テスト作成

**目的**: EditCommandInputコンポーネントのテストを作成する

**実行手順**:

1. テストファイル `EditCommandInput.test.tsx` を作成
2. 以下のテストケースを実装:
   - コマンドタイプセレクタが表示されること
   - カスタム指示入力フィールドが表示されること（customタイプ時）
   - 送信ボタンクリックでonSubmitが呼ばれること
   - disabled時にボタンが無効化されること
3. テストが失敗することを確認（Red状態）

**期待される成果物**:

- `apps/desktop/src/renderer/features/workspace-chat-edit/components/__tests__/EditCommandInput.test.tsx`

---

### タスク7: 統合テスト作成

**目的**: Hooks連携を含む統合テストを作成する

**実行手順**:

1. テストファイル `integration.test.tsx` を作成
2. 以下のテストケースを実装:
   - FileContextDropZone → useFileContext.addFileContext 連携
   - ApplyControls → useDiffApply.applyResult 連携
   - DiffPreview + DiffEditor + ApplyControls 統合表示
3. テストが失敗することを確認（Red状態）

**期待される成果物**:

- `apps/desktop/src/renderer/features/workspace-chat-edit/components/__tests__/integration.test.tsx`

---

## 参照資料

| 参照資料           | パス                                                                        | 内容                 |
| ------------------ | --------------------------------------------------------------------------- | -------------------- |
| 品質要件           | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | テストカバレッジ目標 |
| Phase 2成果物      | `outputs/phase-2/`                                                          | コンポーネント設計   |
| 既存テストヘルパー | `apps/desktop/src/test/`                                                    | テストユーティリティ |

---

## 成果物

| 成果物                    | パス                                                                                                       |
| ------------------------- | ---------------------------------------------------------------------------------------------------------- |
| FileContextBadgeテスト    | `apps/desktop/src/renderer/features/workspace-chat-edit/components/__tests__/FileContextBadge.test.tsx`    |
| ApplyControlsテスト       | `apps/desktop/src/renderer/features/workspace-chat-edit/components/__tests__/ApplyControls.test.tsx`       |
| FileContextDropZoneテスト | `apps/desktop/src/renderer/features/workspace-chat-edit/components/__tests__/FileContextDropZone.test.tsx` |
| DiffPreviewテスト         | `apps/desktop/src/renderer/features/workspace-chat-edit/components/__tests__/DiffPreview.test.tsx`         |
| DiffEditorテスト          | `apps/desktop/src/renderer/features/workspace-chat-edit/components/__tests__/DiffEditor.test.tsx`          |
| EditCommandInputテスト    | `apps/desktop/src/renderer/features/workspace-chat-edit/components/__tests__/EditCommandInput.test.tsx`    |
| 統合テスト                | `apps/desktop/src/renderer/features/workspace-chat-edit/components/__tests__/integration.test.tsx`         |

---

## 統合テスト連携（Phase 1〜11は必須）

Hooks連携テスト、コンポーネント統合テストを作成する。

具体的なアクション:

- [ ] useFileContextモックの作成
- [ ] useDiffApplyモックの作成
- [ ] コンポーネント→Hooks連携テストケースの作成
- [ ] Monaco Editorモックの作成

---

## 完了条件

- [ ] 6種類のコンポーネントのテストが作成されている
- [ ] 統合テストが作成されている
- [ ] 全てのテストが失敗状態（Red）であること
- [ ] テストがArrange-Act-Assertパターンに従っていること
- [ ] アクセシビリティテストケースが含まれていること

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

- [ ] テストが失敗することを確認（Red状態）

---

## 依存関係

- **前提**: Phase 3（設計レビューゲート）が完了していること
- **後続**: Phase 5（実装）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/workspace-chat-edit-ui/phase-5-implementation.md`
