# 実装ガイド（TASK-UI-00-DESIGN-FOUNDATION）

## Part 1: 中学生向けの説明

### なぜ必要か

学校の文化祭で、クラスごとにバラバラの案内板を作ると、見た目も使い方も違って迷いやすくなります。
UI も同じで、画面ごとに部品の見た目や動きが違うと、使う人が迷います。

### 何をしたか

今回、みんなの画面で使える「共通の部品セット」を増やしました。

- 探すための部品: `SearchBar`
- コードを見る部品: `CodeViewer`
- タブを切り替える部品: `TabSwitcher`
- 横から出てくる詳細パネル: `SlideInPanel`
- 本当に実行してよいか確認する部品: `ConfirmDialog`
- 一覧表示の部品: `CardGrid`
- 左右2ペインの部品: `MasterDetailLayout`
- 検索+フィルタ+一覧をまとめた部品: `SearchFilterList`

### 結果

- UI部品 8個を追加
- テスト 47件すべて成功
- 画面確認用スクリーンショット 5枚を取得（Dark/Light/Mobile/Panel/Dialog）

---

## Part 2: 技術者向け

### 1. 追加コンポーネントと主要型

| 層        | コンポーネント       | 主要Props/型                                                                                                                                    |
| --------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| molecules | `SearchBar`          | `SearchBarProps { value, onChange, onDebouncedChange?, debounceMs?, placeholder?, shortcutHint?, autoFocus? }`                                  |
| molecules | `CodeViewer`         | `CodeViewerProps { code, language?, showLineNumbers?, maxHeight?, filePath?, showCopyButton? }`                                                 |
| molecules | `TabSwitcher`        | `TabSwitcherProps { tabs: Tab[], activeTab, onTabChange, variant? }`                                                                            |
| molecules | `SlideInPanel`       | `SlideInPanelProps { isOpen, onClose, side, width?, title?, children, showOverlay? }`                                                           |
| molecules | `ConfirmDialog`      | `ConfirmDialogProps { isOpen, onClose, onConfirm, title, description, confirmLabel?, cancelLabel?, isDestructive?, isLoading? }`                |
| organisms | `CardGrid`           | `CardGridProps<T> { items, renderCard, minCardWidth?, gap?, emptyMessage?, emptyIcon?, isLoading?, skeletonCount? }`                            |
| organisms | `MasterDetailLayout` | `MasterDetailLayoutProps { master, detail, isDetailOpen, masterWidth?, overlayOnMobile?, onCloseDetail? }`                                      |
| organisms | `SearchFilterList`   | `SearchFilterListProps<T> { items, filters, searchPredicate, renderItem?, renderCard?, viewMode?, searchPlaceholder?, emptyMessage?, sortFn? }` |

### 2. APIシグネチャと利用例

```tsx
// SearchBar
<SearchBar
  value={query}
  onChange={setQuery}
  onDebouncedChange={handleSearch}
  debounceMs={300}
  placeholder="スキルを検索"
/>

// TabSwitcher
<TabSwitcher
  tabs={[{ id: 'all', label: 'All' }, { id: 'imported', label: 'Imported', badge: 3 }]}
  activeTab={activeTab}
  onTabChange={setActiveTab}
  variant="underline"
/>

// SearchFilterList（grid表示）
<SearchFilterList
  items={skills}
  filters={filters}
  searchPredicate={(item, q) => item.name.toLowerCase().includes(q.toLowerCase())}
  viewMode="grid"
  renderCard={(item) => <SkillCard skill={item} />}
/>
```

### 3. エラーハンドリングとエッジケース

- `CodeViewer`: `navigator.clipboard.writeText` 失敗時は UIクラッシュさせず `copied=false` へ復帰
- `SlideInPanel` / `ConfirmDialog`: `Escape` キーで閉じる
- `ConfirmDialog`: `Tab` / `Shift+Tab` のフォーカストラップでキーボード操作を維持
- `SearchFilterList`: 該当0件時は `EmptyState` を表示
- `CardGrid`: `isLoading=true` 時は `SkeletonCard` を表示
- `MasterDetailLayout`: 画面幅 `<1024` でモバイル表示へ切替

### 4. 設定可能パラメータ・定数

- `SearchBar.debounceMs`（既定: `300`）
- `CodeViewer.maxHeight`（既定: `"360px"`）
- `SlideInPanel.width`（既定: `"400px"`）
- `CardGrid.minCardWidth`（既定: `280`）
- `CardGrid.skeletonCount`（既定: `6`）
- `MasterDetailLayout.masterWidth`（既定: `"380px"`）
- `CodeViewer` コピー状態復帰定数: `resetDelayMs = 1200`

### 5. 品質結果

- テスト: `8 files / 47 tests` PASS
- 型チェック: `pnpm --filter @repo/desktop typecheck` PASS
- カバレッジ（対象8実装）: `lines 94.17 / branches 88.67 / functions 80.95 / statements 94.17`
