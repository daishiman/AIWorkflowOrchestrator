# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| Phase      | 2                                                    |
| Phase名    | 設計                                                 |
| 前提Phase  | Phase 1                                              |
| 後続Phase  | Phase 3                                              |
| ステータス | 未実施                                               |
| 作成日     | 2026-01-13                                           |
| 機能名     | FileSelector アクセシビリティ改善（WCAG 2.1 AA準拠） |

---

## 目的

Phase 1で定義した要件に基づき、FileSelectorコンポーネント群のアクセシビリティ改善のための詳細設計を行う。

## 背景

Phase 1で以下の機能要件が定義された:

- フォーカストラップ（useFocusTrapカスタムフック）
- aria属性の追加（Trigger, Modal, FileList）
- aria-live通知の実装

これらを実装するための具体的な設計を行う。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: useFocusTrap カスタムフック設計

**目的**: フォーカストラップの再利用可能なカスタムフックを設計する

**実行手順**:

1. フック仕様を定義:

```typescript
/**
 * フォーカストラップカスタムフック
 * @param containerRef - フォーカスを閉じ込めるコンテナのRef
 * @param isActive - フォーカストラップが有効かどうか
 * @param options - オプション設定
 */
interface UseFocusTrapOptions {
  /** フォーカストラップ有効時に最初にフォーカスする要素のセレクタ */
  initialFocusSelector?: string;
  /** フォーカストラップ終了時にフォーカスを戻す要素 */
  returnFocusOnDeactivate?: boolean;
  /** Escapeキーでdeactivateするか */
  escapeDeactivates?: boolean;
}

interface UseFocusTrapReturn {
  /** フォーカストラップをアクティブ化 */
  activate: () => void;
  /** フォーカストラップを非アクティブ化 */
  deactivate: () => void;
  /** 現在アクティブかどうか */
  isActive: boolean;
}

function useFocusTrap(
  containerRef: RefObject<HTMLElement>,
  isActive: boolean,
  options?: UseFocusTrapOptions,
): UseFocusTrapReturn;
```

2. 内部ロジックを設計:
   - フォーカス可能な要素の検出（button, input, select, textarea, a[href], [tabindex]）
   - Tabキーでの循環処理
   - Shift+Tabでの逆順循環
   - 前回のアクティブ要素の保存と復元

3. 配置場所を決定:
   - `apps/desktop/src/renderer/hooks/useFocusTrap.ts`

**期待される成果物**:

- useFocusTrap設計書（outputs/phase-2/use-focus-trap-design.md）

---

### タスク2: FileSelectorModal aria属性設計

**目的**: FileSelectorModalに追加するaria属性を設計する

**実行手順**:

1. モーダルコンテナの属性設計:

```tsx
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="file-selector-modal-title"
  aria-describedby="file-selector-modal-description"
>
  <h2 id="file-selector-modal-title">ファイルを選択</h2>
  <p id="file-selector-modal-description" className="sr-only">
    上下矢印キーでファイルを選択し、Enterキーで決定します。Escapeキーで閉じます。
  </p>
  {/* モーダルコンテンツ */}
</div>
```

2. useFocusTrapの統合設計:

```tsx
const modalRef = useRef<HTMLDivElement>(null);
const { activate, deactivate } = useFocusTrap(modalRef, isOpen, {
  initialFocusSelector: "[data-autofocus]",
  returnFocusOnDeactivate: true,
  escapeDeactivates: true,
});

useEffect(() => {
  if (isOpen) {
    activate();
  } else {
    deactivate();
  }
}, [isOpen, activate, deactivate]);
```

3. 既存仕様との整合性確認:
   - ui-ux-file-selector.md のアクセシビリティ対応セクション参照

**期待される成果物**:

- FileSelectorModal設計書（outputs/phase-2/file-selector-modal-design.md）

---

### タスク3: FileSelectorTrigger aria属性設計

**目的**: FileSelectorTriggerに追加するaria属性を設計する

**実行手順**:

1. トリガーボタンの属性設計:

```tsx
<button
  ref={triggerRef}
  aria-expanded={isOpen}
  aria-haspopup="dialog"
  aria-label={
    selectedFileName
      ? `選択中: ${selectedFileName}。クリックしてファイルを変更`
      : "ファイルを選択"
  }
  aria-controls="file-selector-modal"
  onClick={handleClick}
>
  {/* ボタンコンテンツ */}
</button>
```

2. 状態同期ロジック設計:
   - `isOpen` 状態と `aria-expanded` の同期
   - `selectedFileName` と `aria-label` の動的更新

**期待される成果物**:

- FileSelectorTrigger設計書（outputs/phase-2/file-selector-trigger-design.md）

---

### タスク4: FileSelectorFileList aria属性設計

**目的**: FileSelectorFileListに追加するaria属性を設計する

**実行手順**:

1. リストコンテナの属性設計:

```tsx
<ul
  role="listbox"
  aria-label="ファイル一覧"
  aria-multiselectable={multiple}
  tabIndex={0}
>
  {files.map((file, index) => (
    <li
      key={file.path}
      role="option"
      aria-selected={isSelected(file)}
      tabIndex={isSelected(file) ? 0 : -1}
      onClick={() => handleSelect(file)}
      onKeyDown={(e) => handleKeyDown(e, file, index)}
    >
      {/* ファイル項目コンテンツ */}
    </li>
  ))}
</ul>
```

2. キーボードナビゲーション設計:
   - ↑/↓: リスト内移動
   - Enter/Space: 選択/選択解除
   - Home: 先頭に移動
   - End: 末尾に移動

3. aria-live通知設計:

```tsx
const [announcement, setAnnouncement] = useState("");

const handleSelect = (file: FileItem) => {
  const message = isSelected(file)
    ? `${file.name}の選択を解除しました`
    : `${file.name}を選択しました`;
  setAnnouncement(message);
  onSelectFile(file);
};

return (
  <>
    <div aria-live="polite" aria-atomic="true" className="sr-only">
      {announcement}
    </div>
    <ul role="listbox">{/* リストコンテンツ */}</ul>
  </>
);
```

**期待される成果物**:

- FileSelectorFileList設計書（outputs/phase-2/file-selector-file-list-design.md）

---

### タスク5: コンポーネント間連携設計

**目的**: コンポーネント間のアクセシビリティ連携を設計する

**実行手順**:

1. フォーカスフロー設計:

```
[Trigger Button] --click--> [Modal Open]
                              |
                              v
                        [Focus Trap Activate]
                              |
                              v
                        [Initial Focus: Search Input or First Item]
                              |
                              v
                        [Tab循環: Search -> List -> Actions -> Search]
                              |
                              v
[Trigger Button] <--close-- [Modal Close]
                              |
                              v
                        [Focus Trap Deactivate]
                              |
                              v
                        [Return Focus to Trigger]
```

2. ID連携設計:
   - `aria-labelledby` と `id` の対応
   - `aria-controls` と `id` の対応

3. イベント伝播設計:
   - Escapeキーの処理優先順位
   - フォーカス変更イベントの通知

**期待される成果物**:

- コンポーネント連携設計書（outputs/phase-2/component-integration-design.md）

---

## 参照資料

| 参照資料                 | パス                                                                       | 内容                       |
| ------------------------ | -------------------------------------------------------------------------- | -------------------------- |
| ファイルセレクターUI設計 | `.claude/skills/aiworkflow-requirements/references/ui-ux-file-selector.md` | 既存のアクセシビリティ仕様 |
| Phase 1成果物            | `outputs/phase-1/`                                                         | 機能要件と受け入れ基準     |
| WAI-ARIA Practices       | https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/                     | モーダルダイアログパターン |
| WAI-ARIA Practices       | https://www.w3.org/WAI/ARIA/apg/patterns/listbox/                          | リストボックスパターン     |

---

## 成果物

| 成果物                     | パス                                                | 内容                     |
| -------------------------- | --------------------------------------------------- | ------------------------ |
| useFocusTrap設計書         | `outputs/phase-2/use-focus-trap-design.md`          | カスタムフックの詳細設計 |
| FileSelectorModal設計書    | `outputs/phase-2/file-selector-modal-design.md`     | モーダルのaria属性設計   |
| FileSelectorTrigger設計書  | `outputs/phase-2/file-selector-trigger-design.md`   | トリガーのaria属性設計   |
| FileSelectorFileList設計書 | `outputs/phase-2/file-selector-file-list-design.md` | リストのaria属性設計     |
| コンポーネント連携設計書   | `outputs/phase-2/component-integration-design.md`   | コンポーネント間連携設計 |

---

## 統合テスト連携（Phase 1〜11は必須）

### Phase 2での統合テスト連携アクション

- [ ] 統合ポイントの設計: useFocusTrapとFileSelectorModal間のAPI契約
- [ ] フォーカス遷移の統合シナリオ設計
- [ ] aria属性の動的更新タイミング設計

---

## 完了条件

- [ ] useFocusTrap設計書が作成されている
- [ ] FileSelectorModal設計書が作成されている
- [ ] FileSelectorTrigger設計書が作成されている
- [ ] FileSelectorFileList設計書が作成されている
- [ ] コンポーネント連携設計書が作成されている
- [ ] WAI-ARIA Practicesに準拠した設計になっている
- [ ] 既存仕様（ui-ux-file-selector.md）との整合性がある
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 1（要件定義）が完了していること
- **後続**: Phase 3（設計レビューゲート）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/file-selector-accessibility-improvements/phase-3-design-review.md`
