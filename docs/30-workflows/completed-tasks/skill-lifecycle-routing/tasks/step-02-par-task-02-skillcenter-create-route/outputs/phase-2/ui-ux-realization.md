# Phase 2 UI/UX実現設計: SkillCenter Create Route

## 1. ヘッダーCTAレイアウト

### レイアウト構造

ヘッダーセクションを `flex justify-between items-center` で構成し、左側にタイトル・説明文、右側にPrimary CTAボタンを配置する。

```
+-------------------------------------------------------+
| スキルセンター                    [+ 新しいツールを作る] |
| AIエージェントの能力を管理・拡張する                   |
+-------------------------------------------------------+
```

モバイル（768px未満）:

```
+---------------------------------------+
| スキルセンター                     [+] |
| AIエージェントの能力を管理・拡張する   |
+---------------------------------------+
```

---

## 2. Primary CTA: 「+ 新しいツールを作る」ボタン

### スタイル仕様

| プロパティ       | 値                                                                               | 根拠                                         |
| ---------------- | -------------------------------------------------------------------------------- | -------------------------------------------- |
| 背景色           | `bg-[var(--accent)]`                                                             | systemBlue（CSS変数でテーマ自動切替）        |
| テキスト色       | `text-white`                                                                     | Apple HIG: アクセントカラー上は白テキスト    |
| 横padding        | `px-3`（12px）                                                                   | 8pxグリッド準拠（3 x 4px）                   |
| 縦padding        | `py-1.5`（6px）                                                                  | 8pxグリッド準拠（1.5 x 4px）                 |
| 角丸             | `rounded-lg`（8px）                                                              | Apple HIG: 小要素の8px角丸                   |
| フォントサイズ   | `text-sm`                                                                        | ヘッダータイトルより小さく、補助的な位置づけ |
| フォントウェイト | `font-medium`                                                                    | ボタンとして認識可能な重さ                   |
| ホバー           | `hover:opacity-90`                                                               | 10%暗化でインタラクションフィードバック      |
| アクティブ       | `active:opacity-80`                                                              | 20%暗化でプレス状態を表現                    |
| フォーカスリング | `focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2` | WCAG 2.1 AA準拠のキーボードフォーカス可視化  |
| トランジション   | `transition-opacity`                                                             | 200-300ms（Apple HIG推奨）                   |

### 完全なclassName

```
flex items-center gap-1.5 bg-[var(--accent)] text-white px-3 py-1.5 rounded-lg
text-sm font-medium hover:opacity-90 active:opacity-80
focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2
transition-opacity
```

### CSS変数バインディング

| CSS変数                 | ライトモード値       | ダークモード値          | Apple HIG名称  |
| ----------------------- | -------------------- | ----------------------- | -------------- |
| `var(--accent)`         | `#007AFF`            | `#0A84FF`               | systemBlue     |
| `var(--text-primary)`   | `#000000`            | `#FFFFFF`               | label          |
| `var(--text-secondary)` | `rgba(60,60,67,0.6)` | `rgba(235,235,245,0.6)` | secondaryLabel |

---

## 3. Secondary CTAs: JourneyPanelカードフッターのCTAボタン

### CTA一覧

| JOB_GUIDEエントリ    | ctaLabel         | 遷移先        |
| -------------------- | ---------------- | ------------- |
| スキル作成ガイド     | 「作成を始める」 | skillCreate   |
| ワークスペースガイド | 「使ってみる」   | workspace     |
| スキル改善ガイド     | 「改善する」     | skillAnalysis |

### レイアウト位置

JourneyPanelカード内のフッターに `mt-3 self-end` で配置する。

```
+----------------------------------+
| [カードコンテンツ]                |
| - Step 1                         |
| - Step 2                         |
|                     [作成を始める] |  <- self-end で右寄せ
+----------------------------------+
```

### スタイル仕様

| プロパティ       | 値                                                                               | 根拠                                      |
| ---------------- | -------------------------------------------------------------------------------- | ----------------------------------------- |
| マージン上       | `mt-3`（12px）                                                                   | 8pxグリッド準拠、コンテンツとの適切な分離 |
| 配置             | `self-end`                                                                       | カード右下への配置                        |
| テキスト色       | `text-[var(--accent)]`                                                           | テキストリンクスタイル（bg不要）          |
| フォントサイズ   | `text-sm`                                                                        | カードコンテンツと同サイズ                |
| フォントウェイト | `font-medium`                                                                    | ボタンとして認識可能                      |
| ホバー           | `hover:opacity-80`                                                               | 20%暗化（Primaryより強め）                |
| アクティブ       | `active:opacity-60`                                                              | 40%暗化でプレス状態                       |
| フォーカスリング | `focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-1` | アクセシビリティ                          |
| タッチターゲット | `min-h-[44px] min-w-[44px] flex items-center`                                    | AC-7: 44x44px以上                         |
| トランジション   | `transition-opacity`                                                             | 200-300ms                                 |

### 完全なclassName

```
mt-3 self-end text-sm font-medium text-[var(--accent)]
hover:opacity-80 active:opacity-60
focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-1
transition-opacity min-h-[44px] min-w-[44px] flex items-center
```

---

## 4. モバイル対応（md: 768px breakpoint）

### 対応方針

AC-7の要件「モバイル（<768px）: ヘッダーCTAはアイコンのみ表示、タッチターゲット44x44px以上」に対応する。

### ヘッダーCTAのレスポンシブ設計

```tsx
<button ...>
  {/* アイコン: 全画面幅で常に表示 */}
  <span aria-hidden="true">+</span>
  {/* ラベル: 768px以上でのみ表示 */}
  <span className="hidden md:inline">新しいツールを作る</span>
</button>
```

### タッチターゲットの確保

モバイルでラベル非表示時でも44x44px以上のタッチターゲットを確保する。

```tsx
{
  /* モバイル時のタッチターゲット確保 */
}
<button
  className="... min-h-[44px] min-w-[44px] flex items-center justify-center"
  aria-label="新しいツールを作る"
>
  <span aria-hidden="true">+</span>
  <span className="hidden md:inline">新しいツールを作る</span>
</button>;
```

- `min-h-[44px] min-w-[44px]`: iOS HIG推奨のタッチターゲット最小サイズ
- `aria-label`: ラベル非表示時もスクリーンリーダーが読み上げ可能

---

## 5. ダークモード対応

### CSS変数による自動切り替え

ダークモードはCSS変数（カスタムプロパティ）を使用することで、Tailwindのダークモード条件分岐なしに自動対応する。

```css
/* ライトモード（デフォルト） */
:root {
  --accent: #007aff; /* Apple systemBlue */
  --text-primary: #000000; /* Apple label */
  --text-secondary: rgba(60, 60, 67, 0.6); /* Apple secondaryLabel */
}

/* ダークモード */
@media (prefers-color-scheme: dark) {
  :root {
    --accent: #0a84ff; /* Apple systemBlue dark */
    --text-primary: #ffffff; /* Apple label dark */
    --text-secondary: rgba(235, 235, 245, 0.6); /* Apple secondaryLabel dark */
  }
}
```

### 自動切り替えの恩恵

- `bg-[var(--accent)]` は自動でライト/ダークを切り替える
- Tailwind `dark:` プレフィックスの個別指定が不要
- Apple HIGのシステムカラーに完全準拠

---

## 6. アクセシビリティ

### WCAG 2.1 AA 準拠事項

| 項目                 | 対応内容                                                                              |
| -------------------- | ------------------------------------------------------------------------------------- |
| コントラスト比       | `var(--accent)`上の`text-white`: Apple systemBlue (#007AFF) + white = 4.55:1 (AA準拠) |
| キーボードフォーカス | `focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2` で可視化                |
| スクリーンリーダー   | `aria-label="新しいツールを作る"` でボタン目的を明記                                  |
| アイコン装飾         | `aria-hidden="true"` でスクリーンリーダーのノイズを除去                               |
| タッチターゲット     | `min-h-[44px] min-w-[44px]` でiOS HIG推奨44px以上を確保                               |

### aria属性の設計

```tsx
{
  /* ヘッダーCTAボタン */
}
<button
  type="button"
  onClick={navigateToSkillCreate}
  aria-label="新しいツールを作る" // モバイルでラベル非表示時もスクリーンリーダーが認識
>
  <span aria-hidden="true">+</span> {/* 装飾アイコン: スクリーンリーダー除外 */}
  <span className="hidden md:inline">新しいツールを作る</span>
</button>;

{
  /* JourneyPanel CTAボタン */
}
<button
  type="button"
  onClick={step.onAction}
  aria-label={step.ctaLabel} // ボタン目的の明示
>
  {step.ctaLabel}
</button>;
```

### キーボード操作フロー

1. `Tab`: ヘッダーCTAへのフォーカス移動
2. `Enter` / `Space`: CTAアクション実行（setCurrentView呼び出し）
3. `Tab`: JourneyPanelの各CTAへのフォーカス移動
4. フォーカスリングが2px幅でvar(--accent)色で可視表示される
