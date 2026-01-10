# Localization & i18n 基礎知識

> **相対パス**: `references/basics.md`
> **読込条件**: 初回使用時

---

## 用語定義

| 用語        | 説明                                           |
| ----------- | ---------------------------------------------- |
| i18n        | Internationalization（国際化）- 多言語対応設計 |
| l10n        | Localization（地域化）- 特定地域向け適応       |
| Locale      | 言語+地域の組み合わせ（例: ja-JP, en-US）      |
| Message Key | 翻訳文字列の識別子                             |
| Fallback    | 翻訳欠損時の代替言語                           |
| Placeholder | 動的に置換される変数（例: {user_name}）        |
| Glossary    | 統一用語集                                     |

---

## i18nフレームワーク比較

### Next.js

| ライブラリ   | 特徴                   |
| ------------ | ---------------------- |
| next-intl    | App Router対応、型安全 |
| next-i18next | Pages Router向け、成熟 |

### React

| ライブラリ    | 特徴                   |
| ------------- | ---------------------- |
| react-i18next | 最も普及、豊富な機能   |
| react-intl    | ICU Message Format準拠 |

---

## メッセージファイル構造

### 推奨構造

```
messages/
├── en.json       # 英語（デフォルト）
├── ja.json       # 日本語
├── zh-CN.json    # 簡体字中国語
└── zh-TW.json    # 繁体字中国語
```

### JSONフォーマット

```json
{
  "namespace": {
    "key": "翻訳テキスト",
    "withPlaceholder": "{user_name}さん、ようこそ"
  }
}
```

---

## キー命名規則

| パターン          | 例                | 用途             |
| ----------------- | ----------------- | ---------------- |
| namespace.feature | `common.logout`   | 機能別グループ化 |
| page.section.item | `home.hero.title` | ページ構造反映   |
| component.element | `button.submit`   | コンポーネント別 |

### 命名のベストプラクティス

| すべきこと     | 避けるべきこと     |
| -------------- | ------------------ |
| 意味のある名前 | 連番（msg1, msg2） |
| 階層構造       | フラットな構造     |
| 英語で命名     | 日本語での命名     |
| キャメルケース | スネークケース混在 |

---

## プレースホルダー設計

### 良い例

```json
{
  "welcome": "ようこそ、{user_name}さん",
  "items": "{count}件のアイテムがあります",
  "date": "{date, date, medium}に更新"
}
```

### 悪い例

```json
{
  "welcome": "ようこそ、{0}さん",
  "items": "{1}件のアイテム"
}
```

---

## 文化的配慮事項

### 避けるべき表現

| カテゴリ       | 例                           | 問題点     |
| -------------- | ---------------------------- | ---------- |
| 慣用句         | "It's raining cats and dogs" | 直訳不可   |
| 地域特有の例示 | "Super Bowl", "甲子園"       | 地域限定   |
| 色の意味       | "赤=危険"                    | 文化依存   |
| 日付形式       | "MM/DD/YYYY"                 | 地域差あり |

### 推奨アプローチ

| アプローチ       | 説明                     |
| ---------------- | ------------------------ |
| シンプルな表現   | 慣用句を避け直接的に表現 |
| グローバルな例示 | 地域を超えて理解可能な例 |
| 中立的な色使い   | 文化的意味を持たない色   |
| ISO日付形式      | システム内部はISO 8601   |

---

## 関連リソース

- **翻訳準備ガイド**: See [translation-ready-writing.md](translation-ready-writing.md)
