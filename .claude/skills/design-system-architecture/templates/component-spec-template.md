# {{ComponentName}} コンポーネント仕様書

## 概要

### 目的
{{コンポーネントの目的を記述}}

### 分類
- **階層**: {{Primitives | Patterns | Features | Templates}}
- **カテゴリ**: {{Button | Input | Layout | ...}}

---

## API仕様

### Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'outline'` | `'primary'` | No | ボタンのスタイルバリアント |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | No | ボタンのサイズ |
| `isDisabled` | `boolean` | `false` | No | 無効状態 |
| `isLoading` | `boolean` | `false` | No | ローディング状態 |
| `onClick` | `() => void` | - | No | クリックハンドラ |
| `children` | `ReactNode` | - | Yes | ボタンの内容 |

### 型定義

```typescript
interface {{ComponentName}}Props {
  variant?: '{{variant1}}' | '{{variant2}}' | '{{variant3}}';
  size?: 'sm' | 'md' | 'lg';
  isDisabled?: boolean;
  isLoading?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}
```

---

## デザイン仕様

### デザイントークン

| Property | Token | Value |
|----------|-------|-------|
| Background (primary) | `color.semantic.primary` | `#3B82F6` |
| Background (hover) | `color.semantic.primary-hover` | `#2563EB` |
| Text | `color.text.inverse` | `#FFFFFF` |
| Border Radius | `border.radius.md` | `0.375rem` |
| Padding X | `spacing.4` | `1rem` |
| Padding Y | `spacing.2` | `0.5rem` |

### サイズバリエーション

| Size | Height | Padding X | Padding Y | Font Size |
|------|--------|-----------|-----------|-----------|
| `sm` | 32px | 12px | 6px | 14px |
| `md` | 40px | 16px | 8px | 16px |
| `lg` | 48px | 20px | 12px | 18px |

### 状態

| State | Description | Visual Changes |
|-------|-------------|----------------|
| Default | 通常状態 | 標準スタイル |
| Hover | ホバー時 | 背景色が暗くなる |
| Active | クリック中 | さらに暗く、scale 0.98 |
| Focus | フォーカス時 | フォーカスリング表示 |
| Disabled | 無効時 | 半透明、カーソル無効 |
| Loading | ローディング中 | スピナー表示、操作無効 |

---

## アクセシビリティ

### ARIA属性

| Attribute | Value | When |
|-----------|-------|------|
| `aria-disabled` | `true` | `isDisabled` が true の時 |
| `aria-busy` | `true` | `isLoading` が true の時 |
| `role` | `button` | ネイティブ button でない場合 |

### キーボード操作

| Key | Action |
|-----|--------|
| `Enter` | クリックアクション実行 |
| `Space` | クリックアクション実行 |
| `Tab` | 次の要素へフォーカス移動 |

### カラーコントラスト

| Foreground | Background | Ratio | WCAG AA |
|------------|------------|-------|---------|
| #FFFFFF | #3B82F6 | 4.5:1 | ✅ Pass |
| #FFFFFF | #2563EB | 5.2:1 | ✅ Pass |

---

## 使用例

### 基本使用

```tsx
import { {{ComponentName}} } from '@/components/primitives';

// Primary（デフォルト）
<{{ComponentName}}>ボタン</{{ComponentName}}>

// Secondary
<{{ComponentName}} variant="secondary">キャンセル</{{ComponentName}}>

// Outline
<{{ComponentName}} variant="outline">詳細を見る</{{ComponentName}}>
```

### サイズ

```tsx
<{{ComponentName}} size="sm">小</{{ComponentName}}>
<{{ComponentName}} size="md">中</{{ComponentName}}>
<{{ComponentName}} size="lg">大</{{ComponentName}}>
```

### 状態

```tsx
// 無効状態
<{{ComponentName}} isDisabled>送信できません</{{ComponentName}}>

// ローディング
<{{ComponentName}} isLoading>送信中...</{{ComponentName}}>
```

### イベント処理

```tsx
<{{ComponentName}} onClick={() => console.log('clicked')}>
  クリック
</{{ComponentName}}>
```

---

## 依存関係

### 内部依存

- なし（Primitivesの場合）
- `Icon` コンポーネント（アイコンを含む場合）

### 外部依存

- `class-variance-authority` - Variant管理
- `clsx` / `tailwind-merge` - クラス名結合

---

## テスト要件

### ユニットテスト

- [ ] デフォルトpropsでレンダリング
- [ ] 各variantでレンダリング
- [ ] 各sizeでレンダリング
- [ ] disabled状態でクリック無効
- [ ] loading状態でクリック無効
- [ ] onClickハンドラの呼び出し

### アクセシビリティテスト

- [ ] axeによる自動テスト
- [ ] キーボードナビゲーション
- [ ] スクリーンリーダー対応

### ビジュアルリグレッション

- [ ] 全variant × 全size のスナップショット
- [ ] 各状態（hover, focus, disabled）のスナップショット

---

## 変更履歴

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | {{date}} | 初版作成 |

---

## 関連コンポーネント

- `IconButton` - アイコン付きボタン
- `ButtonGroup` - ボタングループ
- `Link` - リンクスタイルのボタン
