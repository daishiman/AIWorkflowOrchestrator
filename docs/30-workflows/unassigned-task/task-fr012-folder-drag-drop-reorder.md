# フォルダの並べ替え機能 - タスク指示書

## メタ情報

| 項目             | 内容                                                    |
| ---------------- | ------------------------------------------------------- |
| タスクID         | TASK-WS-FR012                                           |
| タスク名         | フォルダの並べ替え機能(ドラッグ&ドロップ)               |
| 分類             | 改善                                                    |
| 対象機能         | Electronデスクトップアプリ - ワークスペースマネージャー |
| 優先度           | 低                                                      |
| 見積もり規模     | 小規模                                                  |
| ステータス       | 未実施                                                  |
| 発見元           | Phase 0 (要件定義) - FR-WS-001                          |
| 発見日           | 2025-12-11                                              |
| 発見エージェント | @req-analyst                                            |

---

## 1. なぜこのタスクが必要か(Why)

### 1.1 背景

ワークスペースマネージャーの初期実装では、フォルダの表示順序が追加順に固定されています。ユーザーが頻繁にアクセスするフォルダを上部に配置したいというニーズがあり、FR-012として「Could have」(優先度: 中)として要件定義されました。

### 1.2 問題点・課題

- フォルダを追加した順序でしか表示できない
- 重要なフォルダが下部に埋もれてしまう
- フォルダを削除して再追加する必要がある(非効率)

### 1.3 放置した場合の影響

- **ユーザビリティ**: ワークスペースに多数のフォルダを追加した際の操作性が低下
- **競合優位性**: VSCodeなどの競合製品では標準機能であり、機能差を感じさせる
- **影響度**: 低(コア機能ではないが、UX向上に貢献)

---

## 2. 何を達成するか(What)

### 2.1 目的

ワークスペース内のフォルダ表示順序をドラッグ&ドロップで変更できる機能を実装する。アクセシビリティを考慮し、キーボードでの順序変更も可能にする。

### 2.2 最終ゴール

1. ドラッグ&ドロップでフォルダの表示順序を変更可能
2. 変更された順序は永続化され、アプリ再起動後も保持
3. キーボードのみでも順序変更が可能(Cmd+Up/Down等)
4. WCAG 2.1 AA基準を満たす実装

### 2.3 スコープ

#### 含むもの

- フォルダのドラッグ&ドロップ実装
- `FolderEntry`データモデルへの`order`フィールド追加
- 永続化形式の拡張
- キーボードによる順序変更代替手段
- ドラッグ中の視覚的フィードバック(ドロップゾーン表示)

#### 含まないもの

- ファイル単位のドラッグ&ドロップ(将来検討)
- 他ワークスペースへのフォルダ移動(単一ワークスペース設計のため)
- ドラッグ&ドロップによるファイルインポート(別タスク)

### 2.4 成果物

| 成果物           | パス                                                                      | 完了時の配置先                   |
| ---------------- | ------------------------------------------------------------------------- | -------------------------------- |
| 機能要件書       | docs/30-workflows/workspace-manager-enhancements/task-step00-drag-drop.md | (完了後も同じ場所)               |
| データモデル     | packages/shared/src/types/workspace.ts                                    | (実装済み、order追加)            |
| UIコンポーネント | apps/desktop/src/renderer/components/molecules/FolderEntry/index.tsx      | (実装済み、ドラッグハンドル追加) |
| テストファイル   | apps/desktop/src/test/components/FolderEntry.test.tsx                     | (実装済み)                       |

---

## 3. どのように実行するか(How)

### 3.1 前提条件

- ワークスペースマネージャーの初期実装(TASK-WS-001)が完了していること
- Phase 6の品質ゲートをすべて通過していること
- `WorkspaceSlice`, `FolderEntry`コンポーネントが実装済み

### 3.2 依存タスク

- TASK-WS-001: ワークスペースマネージャー機能(完了必須)

### 3.3 必要な知識・スキル

- React dnd-kit ライブラリの知識
- Zustand状態管理の理解
- アクセシビリティ(WCAG 2.1)の知識
- TypeScript ブランド型の理解

### 3.4 推奨アプローチ

**技術選定**: dnd-kit

- 理由: react-beautiful-dndより軽量、TypeScript完全対応、アクセシビリティ考慮済み

**実装戦略**:

1. データモデルに`order`フィールドを追加
2. dnd-kitでドラッグ&ドロップを実装
3. キーボード操作による順序変更を実装(Cmd+↑/↓)
4. 永続化ロジックを拡張

---

## 4. 実行手順

### Phase構成

```
Phase 0: 要件定義
Phase 1: 設計(データモデル・UI設計)
Phase 2: 設計レビューゲート
Phase 3: テスト作成 (TDD: Red)
Phase 4: 実装 (TDD: Green)
Phase 5: リファクタリング (TDD: Refactor)
Phase 6: 品質保証
Phase 7: 最終レビューゲート
Phase 8: 手動テスト検証
Phase 9: ドキュメント更新・未完了タスク記録
```

---

### Phase 0: 要件定義

#### 目的

フォルダ並べ替え機能の要件を明確化する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:gather-requirements workspace-folder-drag-drop
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: @req-analyst
- **選定理由**: UI/UX要件の詳細化が可能
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名                    | 活用方法                                |
| --------------------------- | --------------------------------------- |
| acceptance-criteria-writing | Given-When-Then形式での受け入れ基準定義 |
| accessibility-wcag          | アクセシビリティ要件の定義              |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

| 成果物     | パス                                                                      | 内容         |
| ---------- | ------------------------------------------------------------------------- | ------------ |
| 機能要件書 | docs/30-workflows/workspace-manager-enhancements/task-step00-drag-drop.md | 機能要件一覧 |

#### 完了条件

- [ ] ドラッグ&ドロップの詳細要件が定義されている
- [ ] キーボード代替操作の要件が定義されている
- [ ] アクセシビリティ要件が明確化されている
- [ ] 受け入れ基準がGiven-When-Then形式で記載されている

---

### Phase 1: 設計

#### T-01-1: データモデル設計(order追加)

##### 目的

`FolderEntry`に並び順を管理する`order`フィールドを追加する。

##### Claude Code スラッシュコマンド

```
/ai:design-domain-model folder-order
```

##### 使用エージェント

- **エージェント**: @domain-modeler

##### 成果物

| 成果物             | パス                                                                         |
| ------------------ | ---------------------------------------------------------------------------- |
| データモデル更新版 | docs/30-workflows/workspace-manager-enhancements/task-step01-1-data-model.md |

##### 完了条件

- [ ] `FolderEntry`に`order: number`フィールドが追加されている
- [ ] `PersistedFolderEntry`にも`order`が追加されている
- [ ] 並び順のソートロジックが定義されている

---

#### T-01-2: UI設計(ドラッグハンドル)

##### 目的

ドラッグ&ドロップUIとドラッグハンドルを設計する。

##### Claude Code スラッシュコマンド

```
/ai:create-component FolderDragHandle atom
```

##### 使用エージェント

- **エージェント**: @ui-designer

##### 活用スキル

| スキル名              | 活用方法                     |
| --------------------- | ---------------------------- |
| accessibility-wcag    | aria-grabbed等のARIA属性設計 |
| tailwind-css-patterns | ドラッグ状態のスタイリング   |

##### 成果物

| 成果物   | パス                                                                 |
| -------- | -------------------------------------------------------------------- |
| UI設計書 | docs/30-workflows/workspace-manager-enhancements/task-step01-2-ui.md |

##### 完了条件

- [ ] ドラッグハンドルのUI設計が完了している
- [ ] ドロップゾーンの視覚的フィードバックが定義されている
- [ ] キーボード操作のUI設計が完了している

---

### Phase 2: 設計レビューゲート

#### 目的

実装開始前に設計の妥当性を検証する。

#### レビュー参加エージェント

| エージェント | レビュー観点         | 選定理由                       |
| ------------ | -------------------- | ------------------------------ |
| @arch-police | アーキテクチャ整合性 | データモデル変更の影響範囲確認 |
| @ui-designer | UI/UX設計            | アクセシビリティとUX確認       |

#### レビューチェックリスト

- [ ] `order`フィールド追加の影響範囲が明確か
- [ ] アクセシビリティ(キーボード操作)が設計されているか
- [ ] 既存の並び順(追加順)との互換性が保たれているか

---

### Phase 3: テスト作成 (TDD: Red)

#### 目的

期待される動作を検証するテストを作成する。

#### Claude Code スラッシュコマンド

```
/ai:generate-unit-tests drag-drop-reorder
```

#### 使用エージェント

- **エージェント**: @unit-tester

#### 成果物

| 成果物         | パス                                                     |
| -------------- | -------------------------------------------------------- |
| テストファイル | apps/desktop/src/test/store/workspaceSlice-order.test.ts |

#### TDD検証: Red状態確認

```bash
pnpm --filter @repo/desktop test:run -- workspaceSlice-order
```

- [ ] テストが失敗することを確認(Red状態)

---

### Phase 4: 実装 (TDD: Green)

#### T-04-1: 依存追加

##### Claude Code スラッシュコマンド

```
/ai:add-dependency @dnd-kit/core
/ai:add-dependency @dnd-kit/sortable
/ai:add-dependency @dnd-kit/utilities
```

---

#### T-04-2: データモデル実装

##### 目的

`order`フィールドを追加し、ソートロジックを実装する。

##### Claude Code スラッシュコマンド

```
/ai:refactor packages/shared/src/types/workspace.ts order-field
```

##### 実装内容(概要)

```typescript
export interface FolderEntry {
  readonly id: FolderId;
  readonly path: FolderPath;
  readonly displayName: string;
  isExpanded: boolean;
  expandedPaths: Set<string>;
  readonly addedAt: Date;
  order: number; // 追加
}

export interface PersistedFolderEntry {
  id: string;
  path: string;
  displayName: string;
  isExpanded: boolean;
  expandedPaths: string[];
  addedAt: string;
  order: number; // 追加
}
```

---

#### T-04-3: WorkspaceSlice実装

##### 目的

フォルダ順序変更のアクションを実装する。

##### Claude Code スラッシュコマンド

```
/ai:refactor apps/desktop/src/renderer/store/slices/workspaceSlice.ts reorder-action
```

##### 実装内容(概要)

```typescript
export interface WorkspaceSlice {
  // ... existing
  reorderFolder: (folderId: FolderId, newOrder: number) => void;
}

// 実装
reorderFolder: (folderId: FolderId, newOrder: number) => {
  const { workspace } = get();
  const newFolders = [...workspace.folders];
  const folderIndex = newFolders.findIndex((f) => f.id === folderId);
  if (folderIndex === -1) return;

  // 並び順を再計算
  const [movedFolder] = newFolders.splice(folderIndex, 1);
  newFolders.splice(newOrder, 0, movedFolder);

  // orderを振り直し
  const reordered = newFolders.map((f, idx) => ({ ...f, order: idx }));

  set({ workspace: { ...workspace, folders: reordered } });
  get().saveWorkspace();
};
```

---

#### T-04-4: FolderEntry UI実装

##### 目的

dnd-kitを使用したドラッグ&ドロップUIを実装する。

##### Claude Code スラッシュコマンド

```
/ai:refactor apps/desktop/src/renderer/components/molecules/FolderEntry/index.tsx drag-drop
```

##### 使用エージェント

- **エージェント**: @ui-designer

##### 活用スキル

| スキル名                       | 活用方法                   |
| ------------------------------ | -------------------------- |
| component-composition-patterns | Compound Componentパターン |
| accessibility-wcag             | ARIA属性の適用             |

---

### Phase 5: リファクタリング (TDD: Refactor)

#### 目的

コード品質を改善する。

#### Claude Code スラッシュコマンド

```
/ai:analyze-code-quality apps/desktop/src/renderer/components/molecules/FolderEntry
```

#### 完了条件

- [ ] 重複コードが排除されている
- [ ] ドラッグハンドルが再利用可能なコンポーネントとして分離されている
- [ ] テストが継続して成功している

---

### Phase 6: 品質保証

#### Claude Code スラッシュコマンド

```
/ai:run-all-tests --coverage
```

#### 品質ゲートチェックリスト

- [ ] 全ユニットテスト成功
- [ ] Lintエラーなし
- [ ] 型エラーなし
- [ ] カバレッジ80%以上

---

### Phase 7: 最終レビューゲート

#### レビュー参加エージェント

| エージェント     | レビュー観点     | 選定理由                         |
| ---------------- | ---------------- | -------------------------------- |
| @code-quality    | コード品質       | リファクタリング品質確認         |
| @frontend-tester | テスト品質       | E2Eテスト網羅性確認              |
| @ui-designer     | アクセシビリティ | WCAG準拠確認、キーボード操作確認 |

---

### Phase 8: 手動テスト検証

#### 手動テストケース

| No  | カテゴリ         | テスト項目                     | 前提条件                | 操作手順                                        | 期待結果                           |
| --- | ---------------- | ------------------------------ | ----------------------- | ----------------------------------------------- | ---------------------------------- |
| 1   | 機能             | ドラッグ&ドロップ              | 3つのフォルダが追加済み | 1.フォルダBをドラッグ 2.フォルダAの上にドロップ | 順序がB→A→Cに変更される            |
| 2   | 機能             | キーボード順序変更             | 3つのフォルダが追加済み | 1.フォルダBを選択 2.Cmd+↑を押す                 | フォルダBが1つ上に移動             |
| 3   | 機能             | 順序の永続化                   | フォルダ順序を変更済み  | 1.アプリを終了 2.アプリを再起動                 | 変更された順序が保持されている     |
| 4   | UI/UX            | ドラッグ中の視覚フィードバック | フォルダをドラッグ中    | 1.フォルダをドラッグして他フォルダの上に移動    | ドロップゾーンが視覚的に表示される |
| 5   | アクセシビリティ | スクリーンリーダー対応         | スクリーンリーダー有効  | 1.キーボードでフォルダを選択 2.Cmd+↑/↓で移動    | 移動操作が音声で通知される         |
| 6   | 異常系           | 無効なドロップ位置             | フォルダをドラッグ中    | 1.フォルダを無効な位置(サイドバー外)にドロップ  | 元の位置に戻る、エラー通知なし     |

#### Claude Code スラッシュコマンド

```
/ai:generate-e2e-tests drag-drop-user-flow
```

---

### Phase 9: ドキュメント更新・未完了タスク記録

#### サブタスク 9.1: システムドキュメント更新

##### 更新対象ドキュメント

- `docs/00-requirements/06-core-interfaces.md` - FolderEntry型の更新
- `docs/00-requirements/16-ui-ux-guidelines.md` - ドラッグ&ドロップパターンの追加

##### Claude Code スラッシュコマンド

```
/ai:update-all-docs
```

---

#### サブタスク 9.2: 未完了タスク・追加タスク記録

##### 出力先

`docs/30-workflows/unassigned-task/`

##### 記録対象(該当する場合のみ)

- ファイル単位のドラッグ&ドロップ拡張
- グループ化機能(複数フォルダを1つのグループに)

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] ドラッグ&ドロップでフォルダ順序を変更できる
- [ ] キーボード(Cmd+↑/↓)で順序を変更できる
- [ ] 変更された順序が永続化される
- [ ] アプリ再起動後も順序が保持される

### 品質要件

- [ ] ユニットテストカバレッジ80%以上
- [ ] E2Eテストでドラッグ&ドロップシナリオをカバー
- [ ] WCAG 2.1 AA基準を満たす
- [ ] Lintエラー、型エラーなし

### ドキュメント要件

- [ ] 要件定義書が作成されている
- [ ] システムドキュメント(`docs/00-requirements/`)が更新されている
- [ ] このタスクドキュメントが完了後に適切な場所に配置されている

---

## 6. 検証方法

### テストケース

#### ユニットテスト

```typescript
describe("WorkspaceSlice - reorderFolder", () => {
  it("should reorder folder correctly", () => {
    // Given: 3つのフォルダが追加されている
    const workspace = createWorkspaceWithFolders([
      { id: "a", path: "/path/a", order: 0 },
      { id: "b", path: "/path/b", order: 1 },
      { id: "c", path: "/path/c", order: 2 },
    ]);

    // When: フォルダBを先頭に移動
    const result = reorderFolder(workspace, "b", 0);

    // Then: 順序がB→A→Cになる
    expect(result.folders.map((f) => f.id)).toEqual(["b", "a", "c"]);
    expect(result.folders.map((f) => f.order)).toEqual([0, 1, 2]);
  });
});
```

#### E2Eテスト(Playwright)

```typescript
test("drag and drop folder to reorder", async ({ page }) => {
  // Given
  await addFolderToWorkspace(page, "/path/a");
  await addFolderToWorkspace(page, "/path/b");
  await addFolderToWorkspace(page, "/path/c");

  // When
  await page.dragAndDrop('[data-folder-id="b"]', '[data-folder-id="a"]', {
    targetPosition: { y: -10 },
  });

  // Then
  const order = await getFolderOrder(page);
  expect(order).toEqual(["b", "a", "c"]);
});
```

### 検証手順

1. ユニットテストを実行し、すべて成功することを確認
2. E2Eテストを実行し、実際のドラッグ&ドロップが動作することを確認
3. 手動テストケースをすべて実行
4. アクセシビリティ監査(axe-core)を実行し、100%を達成

---

## 7. リスクと対策

| リスク                                  | 影響度 | 発生確率 | 対策                                    |
| --------------------------------------- | ------ | -------- | --------------------------------------- |
| ドラッグ&ドロップのアクセシビリティ問題 | 中     | 中       | キーボード操作の代替手段を必ず実装      |
| 既存の並び順(追加順)の破壊              | 低     | 低       | マイグレーション時に現在の順序をorder化 |
| dnd-kitのバンドルサイズ増加             | 低     | 低       | Tree-shakingで未使用機能を除外          |
| タッチデバイス対応の複雑化              | 低     | 低       | macOS優先、タッチは将来対応             |

---

## 8. 参照情報

### 関連ドキュメント

- [FR-WS-001: 機能要件定義書](../workspace-manager/task-step00-1-functional-requirements.md) - FR-012
- [DM-WS-001: データモデル設計書](../workspace-manager/task-step01-1-data-model.md) - FolderEntry型
- [UI-WS-001: UI設計書](../workspace-manager/task-step01-3-ui-design.md) - FolderEntryコンポーネント

### 参考資料

- dnd-kit: https://dndkit.com/
- WCAG 2.1 - Dragging Movements: https://www.w3.org/WAI/WCAG21/Understanding/dragging-movements.html
- VSCode Drag and Drop: https://code.visualstudio.com/api/ux-guidelines/views#drag-and-drop

---

## 9. 備考

### レビュー指摘の原文(該当する場合)

設計レビュー(DR-WS-001)のMinor指摘:

```
FR-012 ドラッグ&ドロップの詳細設計が不足
→ Could have のため実装時に詳細化
```

### 補足事項

**実装時の注意**:

- `order`フィールドの初期値は配列のインデックス(0, 1, 2, ...)
- 既存のワークスペース状態に`order`がない場合は、マイグレーション処理で自動付与
- ドラッグ中は他のフォルダ操作(削除等)を無効化

**マイグレーション戦略**:

```typescript
function migrateToV2(
  v1State: PersistedWorkspaceStateV1,
): PersistedWorkspaceStateV2 {
  return {
    ...v1State,
    version: 2,
    folders: v1State.folders.map((f, idx) => ({
      ...f,
      order: idx, // 現在の順序をorderとして設定
    })),
  };
}
```

---

## 変更履歴

| バージョン | 日付       | 変更者       | 変更内容                   |
| ---------- | ---------- | ------------ | -------------------------- |
| 1.0.0      | 2025-12-11 | @req-analyst | 初版作成(FR-012単一タスク) |
