# FileSelector ドラッグ&ドロップ機能 - タスク指示書

## メタ情報

| 項目             | 内容                               |
| ---------------- | ---------------------------------- |
| タスクID         | TASK-DND-001                       |
| タスク名         | FileSelector ドラッグ&ドロップ対応 |
| 分類             | 新機能                             |
| 対象機能         | WorkspaceFileSelector              |
| 優先度           | 低                                 |
| 見積もり規模     | 中規模                             |
| ステータス       | 未実施                             |
| 発見元           | Phase 8 手動テスト検証             |
| 発見日           | 2024-12-17                         |
| 発見エージェント | N/A（スコープ外として識別）        |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

WorkspaceFileSelectorコンポーネントの実装が完了したが、ドラッグ&ドロップによるファイル選択機能は今回のスコープに含まれていなかった。ユーザビリティ向上のため、将来的にD&D機能の追加が望まれる。

### 1.2 問題点・課題

- 現在はクリックのみでファイル選択可能
- 複数ファイルを素早く選択したい場合に操作が煩雑
- 選択パネルへの直接ドロップができない

### 1.3 放置した場合の影響

- 致命的な影響はない（クリック選択で機能する）
- ユーザビリティの観点で改善の余地がある
- 競合ツールと比較した場合の機能差

---

## 2. 何を達成するか（What）

### 2.1 目的

ファイルツリーから選択パネルへのドラッグ&ドロップによるファイル選択を可能にする。

### 2.2 最終ゴール

- ファイルツリーのアイテムをドラッグして選択パネルにドロップできる
- 複数ファイルの一括ドラッグ&ドロップが可能
- ドラッグ中の視覚的フィードバックがある
- アクセシブルな代替操作（キーボード）も維持

### 2.3 スコープ

#### 含むもの

- ファイルアイテムのドラッグ開始処理
- 選択パネルのドロップターゲット化
- ドラッグ中の視覚的フィードバック（ゴースト要素、ドロップゾーンハイライト）
- ドロップ時のファイル追加処理
- 複数選択状態でのドラッグ対応

#### 含まないもの

- 外部ファイルシステムからのドロップ（OS D&D）
- ツリー内でのファイル/フォルダ移動
- ソート順のドラッグ変更

### 2.4 成果物

| 種別   | 成果物                          | 配置先                                                                           |
| ------ | ------------------------------- | -------------------------------------------------------------------------------- |
| コード | useDragAndDrop.ts               | apps/desktop/src/renderer/components/organisms/WorkspaceFileSelector/hooks/      |
| コード | DraggableFileTreeItem.tsx       | apps/desktop/src/renderer/components/organisms/WorkspaceFileSelector/            |
| コード | DroppableSelectedFilesPanel.tsx | apps/desktop/src/renderer/components/organisms/WorkspaceFileSelector/            |
| テスト | ドラッグ&ドロップテスト         | apps/desktop/src/renderer/components/organisms/WorkspaceFileSelector/\*.test.tsx |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- WorkspaceFileSelectorコンポーネントが実装済み
- 選択機能（useWorkspaceFileSelection）が動作している
- React DnDまたは同等のライブラリ選定

### 3.2 依存タスク

- なし（独立して実行可能）

### 3.3 必要な知識・スキル

- React DnD（react-beautiful-dnd または @dnd-kit）
- HTML5 Drag and Drop API
- アクセシビリティ（キーボード代替操作）
- Reactパフォーマンス最適化

### 3.4 推奨アプローチ

1. **ライブラリ選定**: @dnd-kit推奨（react-beautiful-dndはメンテナンス停止）
2. **段階的実装**: 単一ファイル → 複数ファイル → 視覚的フィードバック
3. **TDD**: テストを先に作成してから実装

---

## 4. 実行手順

### Phase構成

```
Phase 1: 設計
  → T-01-1: D&Dライブラリ選定・設計
Phase 3: テスト作成 (TDD: Red)
  → T-03-1: D&Dテスト作成
Phase 4: 実装 (TDD: Green)
  → T-04-1: useDragAndDropフック実装
  → T-04-2: DraggableFileTreeItem実装
  → T-04-3: DroppableSelectedFilesPanel実装
Phase 5: リファクタリング
  → T-05-1: コード品質改善
Phase 6: 品質保証
  → T-06-1: テスト実行・検証
```

### T-01-1: D&Dライブラリ選定・設計

#### 目的

最適なD&Dライブラリを選定し、実装設計を行う。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:design-architecture dnd-file-selector
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: .claude/agents/ui-designer.md
- **選定理由**: D&D UIパターンの専門家
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名               | 活用方法            |
| ---------------------- | ------------------- |
| .claude/skills/architectural-patterns/SKILL.md | D&D設計パターン選定 |
| .claude/skills/type-safety-patterns/SKILL.md   | 型定義設計          |

- **参照**: `.claude/skills/skill_list.md`

#### ライブラリ候補

| ライブラリ          | メリット                   | デメリット             |
| ------------------- | -------------------------- | ---------------------- |
| @dnd-kit            | 軽量、モダン、アクセシブル | 学習コストあり         |
| react-beautiful-dnd | 実績豊富、ドキュメント充実 | メンテナンス停止       |
| react-dnd           | 高機能、カスタマイズ性高い | 複雑、バンドルサイズ大 |
| Native HTML5 D&D    | 依存なし                   | ブラウザ差異、実装複雑 |

**推奨**: @dnd-kit（アクセシビリティ対応が優秀、軽量）

#### 完了条件

- [ ] ライブラリ選定完了
- [ ] データフロー設計完了
- [ ] コンポーネント構成設計完了

---

### T-03-1: D&Dテスト作成

#### 目的

ドラッグ&ドロップ機能のテストを作成する。

#### Claude Code スラッシュコマンド

```
/ai:generate-unit-tests apps/desktop/src/renderer/components/organisms/WorkspaceFileSelector/
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: .claude/agents/unit-tester.md
- **選定理由**: テスト設計の専門家
- **参照**: `.claude/agents/agent_list.md`

#### テストケース

```typescript
describe("WorkspaceFileSelector D&D", () => {
  describe("ドラッグ開始", () => {
    it("ファイルアイテムをドラッグ開始できる", () => {});
    it("フォルダはドラッグできない", () => {});
    it("ドラッグ中にゴースト要素が表示される", () => {});
  });

  describe("ドロップ", () => {
    it("選択パネルにドロップするとファイルが追加される", () => {});
    it("既に選択済みのファイルは追加されない", () => {});
    it("最大選択数を超える場合は追加されない", () => {});
  });

  describe("複数選択ドラッグ", () => {
    it("選択済みファイルをまとめてドラッグできる", () => {});
  });

  describe("アクセシビリティ", () => {
    it("キーボードでドラッグ操作ができる", () => {});
    it("スクリーンリーダーにドラッグ状態が通知される", () => {});
  });
});
```

#### 完了条件

- [ ] ドラッグ開始テスト作成
- [ ] ドロップテスト作成
- [ ] 複数選択ドラッグテスト作成
- [ ] アクセシビリティテスト作成
- [ ] テストがRed状態で失敗

---

### T-04-1: useDragAndDropフック実装

#### 目的

D&Dロジックをカスタムフックとして実装する。

#### Claude Code スラッシュコマンド

```
/ai:create-custom-hook useDragAndDrop
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: .claude/agents/ui-designer.md
- **選定理由**: React hooks実装の専門家
- **参照**: `.claude/agents/agent_list.md`

#### 実装概要

```typescript
// useDragAndDrop.ts
export interface UseDragAndDropOptions {
  onDrop: (files: WorkspaceSelectedFile[]) => void;
  selectedFiles: WorkspaceSelectedFile[];
  maxSelection?: number;
}

export interface UseDragAndDropReturn {
  isDragging: boolean;
  draggedFiles: WorkspaceSelectedFile[];
  sensors: SensorDescriptor<any>[];
  handleDragStart: (event: DragStartEvent) => void;
  handleDragEnd: (event: DragEndEvent) => void;
}

export function useDragAndDrop(
  options: UseDragAndDropOptions,
): UseDragAndDropReturn {
  // @dnd-kit を使用した実装
}
```

#### 完了条件

- [ ] useDragAndDropフック実装
- [ ] ドラッグ状態管理
- [ ] ドロップ処理
- [ ] テストがGreen状態で成功

---

### T-04-2: DraggableFileTreeItem実装

#### 目的

ドラッグ可能なファイルツリーアイテムを実装する。

#### Claude Code スラッシュコマンド

```
/ai:create-component DraggableFileTreeItem organism
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: .claude/agents/ui-designer.md
- **選定理由**: UIコンポーネント実装の専門家
- **参照**: `.claude/agents/agent_list.md`

#### 実装概要

```tsx
// DraggableFileTreeItem.tsx
export const DraggableFileTreeItem: React.FC<DraggableFileTreeItemProps> = ({
  node,
  ...props
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: node.path,
      data: { node },
    });

  return (
    <SelectableFileTreeItem
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform) }}
      className={clsx(isDragging && "opacity-50")}
      {...attributes}
      {...listeners}
      {...props}
    />
  );
};
```

#### 完了条件

- [ ] DraggableFileTreeItem実装
- [ ] ドラッグ時の視覚的フィードバック
- [ ] 既存SelectableFileTreeItemとの統合
- [ ] テストがGreen状態で成功

---

### T-04-3: DroppableSelectedFilesPanel実装

#### 目的

ドロップターゲットとなる選択パネルを実装する。

#### Claude Code スラッシュコマンド

```
/ai:refactor apps/desktop/src/renderer/components/organisms/WorkspaceFileSelector/SelectedFilesPanel.tsx
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: .claude/agents/ui-designer.md
- **選定理由**: UIコンポーネント実装の専門家
- **参照**: `.claude/agents/agent_list.md`

#### 実装概要

```tsx
// DroppableSelectedFilesPanel.tsx
export const DroppableSelectedFilesPanel: React.FC<
  DroppableSelectedFilesPanelProps
> = ({ ...props }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: "selected-files-panel",
  });

  return (
    <div
      ref={setNodeRef}
      className={clsx(isOver && "ring-2 ring-blue-500 bg-blue-500/10")}
    >
      <SelectedFilesPanel {...props} />
    </div>
  );
};
```

#### 完了条件

- [ ] DroppableSelectedFilesPanel実装
- [ ] ドロップゾーンのハイライト表示
- [ ] 既存SelectedFilesPanelとの統合
- [ ] テストがGreen状態で成功

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] ファイルをドラッグして選択パネルにドロップできる
- [ ] 複数ファイルの一括ドラッグ&ドロップができる
- [ ] ドラッグ中の視覚的フィードバックがある
- [ ] ドロップゾーンのハイライト表示がある

### 品質要件

- [ ] 全テストがパス
- [ ] カバレッジ80%以上
- [ ] Lintエラーなし
- [ ] 型エラーなし

### アクセシビリティ要件

- [ ] キーボードでの代替操作が可能
- [ ] スクリーンリーダーに状態が通知される

### ドキュメント要件

- [ ] コンポーネントドキュメント更新
- [ ] 使用方法のサンプルコード

---

## 6. 検証方法

### テストケース

1. **単一ファイルD&D**: ファイルをドラッグして選択パネルにドロップ
2. **複数ファイルD&D**: 複数選択状態でドラッグ&ドロップ
3. **制限テスト**: 最大選択数に達している状態でのドロップ
4. **キーボード操作**: キーボードのみでD&D操作

### 検証手順

1. `pnpm --filter @repo/desktop test:run` でユニットテスト実行
2. `pnpm --filter @repo/desktop dev` でアプリ起動
3. ファイルセレクターモーダルを開く
4. 手動でD&D操作を確認

---

## 7. リスクと対策

| リスク                     | 影響度 | 発生確率 | 対策                                   |
| -------------------------- | ------ | -------- | -------------------------------------- |
| ライブラリのバンドルサイズ | 低     | 中       | @dnd-kit使用（軽量）、tree-shaking活用 |
| パフォーマンス影響         | 中     | 低       | 仮想化との組み合わせを検討             |
| 既存機能への影響           | 中     | 低       | 既存コンポーネントをラップする形で実装 |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/00-requirements/16-ui-ux-guidelines.md`
- `apps/desktop/src/renderer/components/organisms/WorkspaceFileSelector/`

### 参考資料

- [@dnd-kit Documentation](https://docs.dndkit.com/)
- [WAI-ARIA Drag and Drop](https://www.w3.org/WAI/ARIA/apg/patterns/drag-and-drop/)

---

## 9. 備考

### 発見経緯

手動テスト（Phase 8）において、テストケースNo.5「D&D選択」がスコープ外として識別された。
機能自体は存在せず、将来的な機能追加として本タスクを作成。

### 補足事項

- 優先度「低」のため、他の重要タスク完了後に実施を検討
- 外部ファイルドロップ（OS D&D）は別タスクとして管理する可能性あり
