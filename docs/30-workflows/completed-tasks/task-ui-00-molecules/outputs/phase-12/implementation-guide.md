# 実装ガイド: TASK-UI-00-MOLECULES

## メタ情報

| 項目     | 内容                              |
| -------- | --------------------------------- |
| タスクID | TASK-UI-00-MOLECULES              |
| 作成日   | 2026-03-04                        |
| Phase    | 12                                |
| 状態     | completed（Phase 1〜12 実行済み） |

## Part 1: 概要（中学生向け）

### なぜ必要か

画面の部品がバラバラな作りだと、見た目や使い方が少しずつ違ってしまい、使う人が迷いやすくなる。  
今回の作業は、よく使う UI 部品を共通化して「どの画面でも同じ操作感」にそろえるために必要だった。

### 何をしたか

学校の教室で「みんなが同じラベルの引き出しを使う」ように整理するイメージで、次の 5 つを共通部品として作成した。

- SearchBar（検索入力）
- CodeViewer（コード表示）
- TabSwitcher（タブ切替）
- SlideInPanel（右側から出るパネル）
- ConfirmDialog（確認ダイアログ）

そのうえで、テスト（69件）と画面キャプチャ（TC-01〜TC-04）をそろえ、仕様書にも反映して再利用できる状態にした。

## Part 2: 実装詳細

### 1. インターフェース/型定義（TypeScript）

```ts
export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (value: string) => void;
  onDebouncedChange?: (value: string) => void;
  debounceMs?: number;
  placeholder?: string;
  shortcutHint?: string;
  autoFocus?: boolean;
  className?: string;
}
```

### 2. APIシグネチャと使用例

```tsx
<SearchBar
  value={query}
  onChange={setQuery}
  onSubmit={(value) => executeSearch(value)}
  onDebouncedChange={(value) => warmupSearchIndex(value)}
  debounceMs={300}
  placeholder="ツールを検索..."
  shortcutHint="⌘K"
/>
```

### 3. 実装済みファイル

- `apps/desktop/src/renderer/components/molecules/SearchBar/index.tsx`
- `apps/desktop/src/renderer/components/molecules/CodeViewer/index.tsx`
- `apps/desktop/src/renderer/components/molecules/TabSwitcher/index.tsx`
- `apps/desktop/src/renderer/components/molecules/SlideInPanel/index.tsx`
- `apps/desktop/src/renderer/components/molecules/ConfirmDialog/index.tsx`
- `apps/desktop/src/renderer/components/molecules/index.ts`

### 4. テストファイル

- `SearchBar/__tests__/SearchBar.test.tsx`（14 tests, Enter時 `onSubmit` 検証を追加）
- `CodeViewer/__tests__/CodeViewer.test.tsx`（12 tests）
- `TabSwitcher/__tests__/TabSwitcher.test.tsx`（14 tests）
- `SlideInPanel/__tests__/SlideInPanel.test.tsx`（12 tests）
- `ConfirmDialog/__tests__/ConfirmDialog.test.tsx`（17 tests）

合計: 69 tests PASS

### 5. エラーハンドリング/エッジケース

- `SearchBar`: `Escape` 押下時に入力をクリアしフォーカスを外す。`Enter` は `onSubmit` 指定時のみ発火。
- `CodeViewer`: language/lineNumbers/wrapLines 未指定時のデフォルト表示を維持。
- `SlideInPanel`: `isOpen=false` 時に DOM を表示しない（不要描画防止）。
- `ConfirmDialog`: `isDanger` の有無でボタンスタイルを安全側/警告側に切替。

### 6. 設定可能パラメータ（代表）

| コンポーネント | パラメータ     | 既定値         |
| -------------- | -------------- | -------------- |
| SearchBar      | `debounceMs`   | `300`          |
| SearchBar      | `placeholder`  | `"検索..."`    |
| CodeViewer     | `language`     | `"plaintext"`  |
| CodeViewer     | `lineNumbers`  | `true`         |
| CodeViewer     | `wrapLines`    | `false`        |
| SlideInPanel   | `size`         | `"md"`         |
| ConfirmDialog  | `confirmLabel` | `"確認"`       |
| ConfirmDialog  | `cancelLabel`  | `"キャンセル"` |

### 7. 画面証跡（Phase 11）

- `outputs/phase-11/screenshots/TC-01-skill-center-default-dark.png`
- `outputs/phase-11/screenshots/TC-02-skill-center-search-dark.png`
- `outputs/phase-11/screenshots/TC-03-skill-center-default-light.png`
- `outputs/phase-11/screenshots/TC-04-skill-center-default-mobile-dark.png`

### 8. 実行コマンド（再現用）

```bash
cd apps/desktop
pnpm vitest run \
  src/renderer/components/molecules/SearchBar/__tests__/SearchBar.test.tsx \
  src/renderer/components/molecules/CodeViewer/__tests__/CodeViewer.test.tsx \
  src/renderer/components/molecules/TabSwitcher/__tests__/TabSwitcher.test.tsx \
  src/renderer/components/molecules/SlideInPanel/__tests__/SlideInPanel.test.tsx \
  src/renderer/components/molecules/ConfirmDialog/__tests__/ConfirmDialog.test.tsx

pnpm --filter @repo/desktop typecheck

# スクリーンショット再取得
node scripts/capture-task-ui-00-molecules-screenshots.mjs
```
