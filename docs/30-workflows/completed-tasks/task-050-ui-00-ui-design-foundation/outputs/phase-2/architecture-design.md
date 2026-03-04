# Phase 2 設計仕様（統合）

## 1. トークン設計

- テーマ軸: `kanagawa-dragon` / `light` / `dark`
- `light` / `dark` はApple HIGの背景・文字・境界・ステータス色へ統一
- マイクロインタラクション拡張: `--ease-bounce`, `--scale-hover`, `--scale-active`

## 2. コンポーネント責務境界

### Atoms

- `StatusIndicator` : 状態色とARIA status表示
- `FilterChip` : フィルタートグル
- `Badge` : 件数・状態表示
- `SkeletonCard` : ローディング骨組み
- `SuggestionBubble` : 操作提案
- `EmptyState` : ゼロステート
- `RelativeTime` : 相対時刻表示

### Molecules

- `SearchBar` : 入力 + debounce + クリア
- `CodeViewer` : コード表示 + copy
- `TabSwitcher` : tablist/active切替
- `SlideInPanel` : サイドパネル開閉
- `ConfirmDialog` : 破壊操作を含む確認モーダル

### Organisms

- `CardGrid<T>` : グリッド描画 + 空状態 + skeleton
- `MasterDetailLayout` : desktop分割 + mobileオーバーレイ
- `SearchFilterList<T>` : 検索・フィルター・リスト/グリッド表示

## 3. レスポンシブ設計

- `desktop >= 1024`: 分割UI
- `tablet/mobile < 1024`: detailをパネル表示
- `mobile(390px)` で主要UIが崩れないことを手動検証対象化

## 4. A11y設計

- 必須role: `searchbox`, `tablist/tab`, `dialog`, `alertdialog`, `grid/gridcell`
- キー操作: `Escape` で閉じる、`Enter` 実行
- フォーカス: ConfirmDialogでフォーカストラップ + 復帰

## 5. テスト設計

- TC群: `TC-UI-00-101`〜`109`（自動） + `301`〜`305`（手動）
- P39対策: interactionは `fireEvent`
- P40対策: `apps/desktop` 起点でテスト
