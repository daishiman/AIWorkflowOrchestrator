---
name: .claude/skills/localization-i18n/SKILL.md
description: |
  多言語対応ドキュメントの設計・翻訳準備スキル。
  国際化（i18n）と地域化（l10n）のベストプラクティスを提供。

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/localization-i18n/resources/translation-ready-writing.md`: 翻訳しやすい文章の原則、文化依存表現の回避、プレースホルダー設計、品質チェック項目
  - `.claude/skills/localization-i18n/scripts/check-translation-ready.mjs`: i18n対応度の自動チェック（文化依存表現検出、プレースホルダー検証）
  - `.claude/skills/localization-i18n/templates/multilingual-doc-template.md`: 多言語ドキュメント構造テンプレート（言語別ディレクトリ、共通リソース）

  使用タイミング:
  - 多言語ドキュメントを設計する時
  - 翻訳しやすい原文を作成する時
  - ローカライゼーションワークフローを構築する時
  - 文化的適応を考慮する時

  トリガーキーワード:
  - 「多言語」「翻訳」「国際化」「i18n」「l10n」
  - 「ローカライゼーション」「地域化」「言語対応」

version: 1.0.0
---

# Localization & i18n スキル

## 概要

このスキルは、ドキュメントの国際化（i18n）と
地域化（l10n）のベストプラクティスを提供します。
翻訳しやすい原文作成から、多言語ワークフロー構築まで対応。

## 基本概念

### i18n vs l10n

| 用語     | 正式名称             | 説明                         |
| -------- | -------------------- | ---------------------------- |
| **i18n** | Internationalization | 多言語対応の設計・準備       |
| **l10n** | Localization         | 特定地域への適応・翻訳       |
| **g11n** | Globalization        | i18n + l10n の包括的プロセス |

### ローカライゼーションの 5 層

```
1. テキスト翻訳      ← 文字列の翻訳
2. フォーマット適応   ← 日付・数値・通貨
3. 文化的適応       ← 例・比喩・画像
4. 機能的適応       ← 入力方式・レイアウト
5. 法的適応        ← プライバシー・規制
```

## 翻訳しやすい原文設計

### 文章構造の原則

**シンプルな文構造**:

```markdown
❌ 避ける:
「設定ファイルを編集後、変更を保存してからアプリを再起動すると、
新しい設定が反映されます。」

✅ 推奨:
「1. 設定ファイルを編集します。 2. 変更を保存します。 3. アプリを再起動します。
これで新しい設定が反映されます。」
```

**能動態を使用**:

```markdown
❌ 受動態: 「設定はシステムによって読み込まれます」
✅ 能動態: 「システムが設定を読み込みます」
```

### 避けるべき表現

| 避ける表現   | 理由       | 改善例       |
| ------------ | ---------- | ------------ |
| 慣用句・比喩 | 文化依存   | 直接的な表現 |
| ユーモア     | 翻訳困難   | 明確な説明   |
| 省略形       | 誤解の原因 | 完全な表記   |
| 曖昧な代名詞 | 参照不明確 | 具体的な名詞 |
| 動詞の名詞化 | 翻訳困難   | 動詞を使用   |

### 具体例

```markdown
❌ 「これをクリックすると、あれが開きます」
✅ 「[保存]ボタンをクリックすると、確認ダイアログが開きます」

❌ 「一石二鳥のソリューション」
✅ 「2 つの問題を同時に解決するソリューション」

❌ 「アプリの起動」（名詞化）
✅ 「アプリを起動する」（動詞）
```

## 変数と文字列結合

### 問題のあるパターン

```javascript
// ❌ 語順依存の文字列結合
message = "You have " + count + " new messages";
// 日本語: "新しいメッセージが" + count + "件あります"
// 語順が異なり、単純な置換では対応不可

// ✅ プレースホルダー使用
message = t("new_messages", { count: count });
// en: "You have {count} new messages"
// ja: "新しいメッセージが{count}件あります"
```

### 複数形の処理

```yaml
# ❌ 単純な条件分岐
message_one: "{count} file selected"
message_other: "{count} files selected"

# ✅ ICU MessageFormat
message: "{count, plural,
  =0 {No files selected}
  =1 {1 file selected}
  other {{count} files selected}
}"

# 日本語版（複数形なし）
message: "{count}個のファイルを選択しました"
```

## コンテンツ構造

### ディレクトリ構造

```
docs/
├── ja/                     ← 日本語（ソース言語）
│   ├── getting-started/
│   │   ├── quickstart.md
│   │   └── installation.md
│   └── guides/
│       └── configuration.md
│
├── en/                     ← 英語
│   └── [同じ構造]
│
├── zh-Hans/                ← 簡体字中国語
│   └── [同じ構造]
│
└── _shared/                ← 言語共通リソース
    ├── images/
    ├── diagrams/
    └── code-samples/
```

### 言語コード規約

| 形式             | 例                   | 用途         |
| ---------------- | -------------------- | ------------ |
| ISO 639-1        | `ja`, `en`           | 言語のみ     |
| ISO 639-1 + 地域 | `en-US`, `zh-CN`     | 言語+地域    |
| BCP 47           | `zh-Hans`, `zh-Hant` | 文字体系区別 |

## 日付・数値・通貨

### フォーマット比較

| 項目 | 日本       | 米国       | ドイツ     |
| ---- | ---------- | ---------- | ---------- |
| 日付 | 2024/01/15 | 01/15/2024 | 15.01.2024 |
| 時刻 | 14:30      | 2:30 PM    | 14:30      |
| 数値 | 1,234.56   | 1,234.56   | 1.234,56   |
| 通貨 | ¥1,234     | $1,234     | 1.234 €    |

### 実装パターン

```javascript
// ❌ ハードコーディング
const date = year + "/" + month + "/" + day;

// ✅ Intl API使用
const date = new Intl.DateTimeFormat(locale).format(dateObj);

// ❌ 通貨記号のハードコーディング
const price = "¥" + amount;

// ✅ Intl API使用
const price = new Intl.NumberFormat(locale, {
  style: "currency",
  currency: currencyCode,
}).format(amount);
```

## 翻訳メモリとスタイルガイド

### 用語集（Glossary）

```yaml
# terms.yaml
terms:
  - source: "設定"
    translations:
      en: "Settings"
      zh-Hans: "设置"
    context: "UI要素として使用する場合"
    notes: "Configurationとは区別する"

  - source: "保存"
    translations:
      en: "Save"
      zh-Hans: "保存"
    context: "データの永続化"
    notes: "ファイル出力はExportを使用"
```

### スタイルガイド項目

```markdown
## 翻訳スタイルガイド

### 敬語レベル

- UI: です・ます調
- エラーメッセージ: 丁寧語
- 技術文書: である調も可

### 用語の一貫性

- 同一概念には同一訳語を使用
- 用語集を必ず参照

### 文体

- 簡潔で明確な表現
- 1 文は 40 文字以内を目安
```

## UI テキストの i18n

### レイアウト考慮

```
英語: "Save"     (4文字)
日本語: "保存"    (2文字)
ドイツ語: "Speichern" (9文字)
アラビア語: "حفظ"     (3文字、RTL)
```

**対策**:

- ボタン幅を可変に設計
- テキストが長くなることを想定（英語の 1.5 倍）
- RTL 言語を考慮したレイアウト

### エスケープと特殊文字

```yaml
# 特殊文字の処理
messages:
  # ❌ HTMLタグ埋め込み
  highlight: "Click <strong>here</strong>"

  # ✅ プレースホルダー使用
  highlight: "Click {start_bold}here{end_bold}"

  # ❌ 改行のハードコーディング
  multiline: "Line 1\nLine 2"

  # ✅ 配列または専用フォーマット
  multiline:
    - "Line 1"
    - "Line 2"
```

## 翻訳ワークフロー

### 標準プロセス

```
1. 原文作成
   ├── i18n対応チェック
   └── 翻訳準備確認
       ↓
2. 翻訳依頼
   ├── コンテキスト提供
   ├── 用語集共有
   └── スタイルガイド共有
       ↓
3. 翻訳実施
   ├── CAT（翻訳支援）ツール使用
   └── 翻訳メモリ活用
       ↓
4. レビュー
   ├── 技術レビュー
   ├── 言語レビュー
   └── 文化的適切性確認
       ↓
5. 統合
   ├── ファイル統合
   ├── ビルド確認
   └── 表示テスト
```

### 翻訳優先度

| 優先度 | コンテンツタイプ   | 理由               |
| ------ | ------------------ | ------------------ |
| 高     | UI テキスト        | ユーザー体験に直結 |
| 高     | エラーメッセージ   | 問題解決に必須     |
| 中     | ヘルプドキュメント | サポート負荷軽減   |
| 中     | チュートリアル     | オンボーディング   |
| 低     | 詳細リファレンス   | 上級者向け         |

## 品質チェックリスト

### 原文チェック

- [ ] 文が短く、シンプルか？
- [ ] 能動態を使用しているか？
- [ ] 慣用句・比喩を避けているか？
- [ ] 代名詞の参照が明確か？
- [ ] 文化依存の例を避けているか？
- [ ] 変数はプレースホルダーを使用しているか？
- [ ] 複数形は適切に処理されているか？

### 翻訳品質チェック

- [ ] 用語の一貫性が保たれているか？
- [ ] 文脈に適した訳になっているか？
- [ ] 敬語レベルは適切か？
- [ ] 技術用語は正確か？
- [ ] 文化的に適切な表現か？
- [ ] UI 要素は正しく表示されるか？

## リソース参照

| リソース               | パス                                                                      | 内容                   |
| ---------------------- | ------------------------------------------------------------------------- | ---------------------- |
| **翻訳準備ガイド**     | `.claude/skills/localization-i18n/resources/translation-ready-writing.md` | 翻訳しやすい文章作成   |
| **多言語テンプレート** | `.claude/skills/localization-i18n/templates/multilingual-doc-template.md` | 多言語ドキュメント構造 |
| **翻訳準備チェッカー** | `.claude/skills/localization-i18n/scripts/check-translation-ready.mjs`    | i18n 対応度の確認      |

## 関連スキル

- `.claude/skills/user-centric-writing/SKILL.md`: ユーザー中心ライティング
- `.claude/skills/information-architecture/SKILL.md`: 情報アーキテクチャ
