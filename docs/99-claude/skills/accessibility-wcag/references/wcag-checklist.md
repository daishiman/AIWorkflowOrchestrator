# WCAG 2.1 チェックリスト

## 概要

このチェックリストは、WCAG 2.1 Level AAに準拠するための
主要な要件をまとめたものです。

---

## 1. 知覚可能（Perceivable）

### 1.1 代替テキスト

- [ ] すべての画像に適切なalt属性がある
- [ ] 装飾的な画像は`alt=""`または`aria-hidden="true"`
- [ ] 複雑な画像には詳細な説明がある
- [ ] アイコンボタンにはaria-labelがある

```tsx
// 情報を伝える画像
<img src="chart.png" alt="2024年の売上グラフ：1月100万、12月200万" />

// 装飾的な画像
<img src="decorative.png" alt="" aria-hidden="true" />

// アイコンボタン
<button aria-label="検索">
  <SearchIcon aria-hidden="true" />
</button>
```

### 1.2 時間ベースのメディア

- [ ] 動画にキャプションがある
- [ ] 音声にテキスト代替がある
- [ ] 自動再生するメディアに停止手段がある

### 1.3 適応可能

- [ ] セマンティックなHTMLマークアップを使用
- [ ] 見出しレベルが論理的（h1→h2→h3）
- [ ] フォームにラベルが関連付けられている
- [ ] テーブルにヘッダーがある

```tsx
// 見出しの階層
<h1>ページタイトル</h1>
  <h2>セクション1</h2>
    <h3>サブセクション1.1</h3>
  <h2>セクション2</h2>

// フォームラベル
<label htmlFor="email">メールアドレス</label>
<input id="email" type="email" />

// テーブルヘッダー
<table>
  <thead>
    <tr>
      <th scope="col">名前</th>
      <th scope="col">年齢</th>
    </tr>
  </thead>
</table>
```

### 1.4 識別可能

- [ ] テキストと背景のコントラスト比が4.5:1以上
- [ ] 大きなテキストは3:1以上
- [ ] テキストを200%までズーム可能
- [ ] テキストの間隔を調整可能
- [ ] 色だけで情報を伝えていない
- [ ] 非テキストコンテンツのコントラストが3:1以上

```css
/* コントラスト確保 */
.text-primary {
  color: #1a1a1a; /* 黒に近い */
  background-color: #ffffff;
  /* コントラスト比: 17.4:1 */
}

/* 色以外の識別手段 */
.error-field {
  border-color: red;
  border-left: 4px solid red; /* 色以外の視覚的手がかり */
}
.error-field::before {
  content: "⚠"; /* アイコンも追加 */
}
```

---

## 2. 操作可能（Operable）

### 2.1 キーボードアクセシブル

- [ ] すべての機能がキーボードで操作可能
- [ ] キーボードトラップがない
- [ ] ショートカットキーは無効化/再マップ可能

```tsx
// キーボード操作可能なカード
function Card({ onClick }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
    >
      内容
    </div>
  );
}
```

### 2.2 十分な時間

- [ ] 時間制限は延長/無効化可能
- [ ] 自動更新は一時停止可能
- [ ] セッションタイムアウトは警告あり

### 2.3 発作と身体的反応

- [ ] 1秒に3回以上点滅するコンテンツがない
- [ ] モーションは無効化可能

```css
/* 動きを減らす設定を尊重 */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 2.4 ナビゲーション可能

- [ ] スキップリンクがある
- [ ] ページにタイトルがある
- [ ] フォーカス順序が論理的
- [ ] リンクの目的が明確
- [ ] 複数のナビゲーション手段がある
- [ ] 見出しとラベルが説明的
- [ ] フォーカスが視覚的に明確

```tsx
// スキップリンク
<a href="#main-content" className="sr-only focus:not-sr-only">
  メインコンテンツへスキップ
</a>

// 明確なリンクテキスト
// ❌ Bad
<a href="/details">詳細はこちら</a>

// ✅ Good
<a href="/details">製品Aの詳細を見る</a>
```

### 2.5 入力方式

- [ ] タッチターゲットが44x44px以上
- [ ] ジェスチャに代替手段がある
- [ ] デバイスの向きに制限がない

```css
/* タッチターゲットサイズ */
.touch-target {
  min-width: 44px;
  min-height: 44px;
  padding: 12px;
}
```

---

## 3. 理解可能（Understandable）

### 3.1 読みやすさ

- [ ] ページの言語が指定されている
- [ ] 略語の意味がわかる
- [ ] 専門用語に説明がある

```html
<html lang="ja">
  <abbr title="World Wide Web Consortium">W3C</abbr>
</html>
```

### 3.2 予測可能

- [ ] フォーカス時に予期しない変更がない
- [ ] 入力時に予期しない変更がない
- [ ] ナビゲーションが一貫している
- [ ] コンポーネントが一貫している

### 3.3 入力支援

- [ ] エラーが特定されている
- [ ] ラベル/指示がある
- [ ] エラーの修正提案がある
- [ ] 重要な操作の確認がある

```tsx
// エラーメッセージ
function FormField({ error, ...props }) {
  return (
    <div>
      <input
        aria-invalid={!!error}
        aria-describedby={error ? "error-message" : undefined}
        {...props}
      />
      {error && (
        <p id="error-message" role="alert" className="text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

// 確認ダイアログ
function DeleteButton({ onDelete }) {
  const handleClick = () => {
    if (confirm("本当に削除しますか？この操作は取り消せません。")) {
      onDelete();
    }
  };

  return <button onClick={handleClick}>削除</button>;
}
```

---

## 4. 堅牢（Robust）

### 4.1 互換性

- [ ] HTMLが有効（パースエラーなし）
- [ ] 名前、役割、値が適切
- [ ] ステータスメッセージが通知される

```tsx
// 適切な名前と役割
<button aria-label="メニューを開く">
  <MenuIcon aria-hidden="true" />
</button>

// ステータス通知
<div role="status" aria-live="polite">
  保存しました
</div>

<div role="alert" aria-live="assertive">
  エラーが発生しました
</div>
```

---

## クイックチェック

### 必須確認項目

| 項目           | 確認方法                         |
| -------------- | -------------------------------- |
| キーボード操作 | Tabキーで全要素にアクセス可能か  |
| フォーカス表示 | フォーカスが視覚的に確認できるか |
| 代替テキスト   | 画像にalt属性があるか            |
| コントラスト   | テキストが読みやすいか           |
| エラー表示     | エラーメッセージが明確か         |
| ラベル         | フォームにラベルがあるか         |
| 見出し構造     | 見出しが論理的か                 |
| ズーム         | 200%でも使えるか                 |

### ツールによるチェック

| ツール                  | 用途                       |
| ----------------------- | -------------------------- |
| axe DevTools            | 自動アクセシビリティテスト |
| Lighthouse              | パフォーマンス＋A11yスコア |
| Wave                    | 視覚的なA11y問題検出       |
| Color Contrast Analyzer | コントラスト比チェック     |

---

## 優先度別対応

### 高優先度（必須）

1. キーボードアクセシビリティ
2. 適切な見出し構造
3. フォームラベル
4. 代替テキスト
5. カラーコントラスト
6. フォーカス表示

### 中優先度（推奨）

1. スキップリンク
2. エラーメッセージの改善
3. 動的コンテンツの通知
4. タッチターゲットサイズ

### 低優先度（理想）

1. 複数のナビゲーション手段
2. 省略形の展開
3. 読み上げ速度の調整
