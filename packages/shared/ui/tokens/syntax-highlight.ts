/**
 * Kanagawa Dragon シンタックスハイライト定義
 *
 * Kanagawa テーマのシンタックスハイライト用カラー定義。
 * ドキュメント（Markdown, JSON, YAML, CSV等）の表示で使用。
 */

/**
 * Kanagawa Dragon シンタックスハイライトカラー
 */
export const kanagawaSyntax = {
  // 基本カラー（CSS変数に対応）
  keyword: "#8992a7", // dragonViolet - キーワード
  function: "#8ba4b0", // dragonBlue - 関数名・リンク
  string: "#87a987", // dragonGreen - 文字列・値
  number: "#a292a3", // dragonPink - 数値
  constant: "#b6927b", // dragonOrange - 定数 (true, false, null)
  type: "#8ea4a2", // dragonAqua - 型・見出し
  comment: "#625e5a", // dragonGray - コメント・メタ情報
  variable: "#c4b28a", // dragonYellow - 変数・キー
  operator: "#c4746e", // dragonRed - 演算子・強調
  punctuation: "#9e9b93", // 句読点・区切り文字

  // CSS変数名
  cssVarNames: {
    keyword: "--syntax-keyword",
    function: "--syntax-function",
    string: "--syntax-string",
    number: "--syntax-number",
    constant: "--syntax-constant",
    type: "--syntax-type",
    comment: "--syntax-comment",
    variable: "--syntax-variable",
    operator: "--syntax-operator",
    punctuation: "--syntax-punctuation",
  } as const,

  // TextMate/VSCode トークン → カラーマッピング（コード向け）
  tokenMapping: {
    // キーワード
    keyword: "#8992a7",
    "keyword.control": "#8992a7",
    "keyword.operator": "#c4746e",
    "keyword.other": "#8992a7",

    // 文字列
    string: "#87a987",
    "string.quoted": "#87a987",
    "string.quoted.single": "#87a987",
    "string.quoted.double": "#87a987",
    "string.template": "#87a987",

    // 数値・定数
    "constant.numeric": "#a292a3",
    "constant.language": "#b6927b",
    "constant.other": "#b6927b",

    // 関数・メソッド
    "entity.name.function": "#8ba4b0",
    "entity.name.method": "#8ba4b0",
    "support.function": "#8ba4b0",

    // 型・クラス
    "entity.name.type": "#8ea4a2",
    "entity.name.class": "#8ea4a2",
    "support.type": "#8ea4a2",
    "support.class": "#8ea4a2",

    // 変数
    variable: "#c4b28a",
    "variable.other": "#c4b28a",
    "variable.parameter": "#c4b28a",
    "variable.language": "#c4746e",

    // コメント
    comment: "#625e5a",
    "comment.line": "#625e5a",
    "comment.block": "#625e5a",
    "comment.documentation": "#625e5a",

    // その他
    "storage.type": "#8992a7",
    "storage.modifier": "#8992a7",
    "punctuation.definition": "#9e9b93",
    "punctuation.separator": "#9e9b93",
    "meta.brace": "#9e9b93",
  } as const,

  /**
   * ドキュメント向けトークンマッピング
   * Markdown, JSON, YAML, CSV等のドキュメントフォーマット用
   */
  documentTokenMapping: {
    // Markdown
    "markup.heading": "#8ea4a2", // dragonAqua - 見出し
    "markup.heading.1": "#8ea4a2",
    "markup.heading.2": "#8ea4a2",
    "markup.heading.3": "#8ea4a2",
    "markup.heading.4": "#8ea4a2",
    "markup.heading.5": "#8ea4a2",
    "markup.heading.6": "#8ea4a2",
    "markup.bold": "#c4746e", // dragonRed - 太字
    "markup.italic": "#a292a3", // dragonPink - 斜体
    "markup.underline": "#8ba4b0", // dragonBlue - 下線
    "markup.strikethrough": "#625e5a", // dragonGray - 打ち消し線
    "markup.link": "#8ba4b0", // dragonBlue - リンク
    "markup.link.url": "#87a987", // dragonGreen - URL
    "markup.list": "#c4b28a", // dragonYellow - リストマーカー
    "markup.list.numbered": "#c4b28a",
    "markup.list.unnumbered": "#c4b28a",
    "markup.quote": "#625e5a", // dragonGray - 引用
    "markup.raw": "#87a987", // dragonGreen - コードブロック
    "markup.inline.raw": "#87a987", // インラインコード
    "markup.fenced_code": "#87a987", // フェンスコードブロック

    // JSON
    "support.type.property-name.json": "#c4b28a", // dragonYellow - JSONキー
    "string.json": "#87a987", // dragonGreen - JSON文字列値
    "constant.numeric.json": "#a292a3", // dragonPink - JSON数値
    "constant.language.json": "#b6927b", // dragonOrange - true/false/null

    // YAML
    "entity.name.tag.yaml": "#c4b28a", // dragonYellow - YAMLキー
    "string.unquoted.yaml": "#87a987", // dragonGreen - YAML値
    "string.quoted.yaml": "#87a987",
    "constant.numeric.yaml": "#a292a3", // dragonPink - YAML数値
    "constant.language.yaml": "#b6927b", // dragonOrange - true/false/null
    "punctuation.definition.anchor.yaml": "#8992a7", // dragonViolet - アンカー
    "entity.name.type.anchor.yaml": "#8992a7",
    "punctuation.definition.alias.yaml": "#8ba4b0", // dragonBlue - エイリアス
    "variable.other.alias.yaml": "#8ba4b0",

    // CSV/TSV
    "meta.structure.csv": "#c5c9c5", // dragonWhite - CSV構造
    "string.csv": "#87a987", // dragonGreen - CSV値
    "punctuation.separator.csv": "#9e9b93", // 区切り文字

    // XML/HTML（ドキュメント向け）
    "entity.name.tag": "#8992a7", // dragonViolet - タグ名
    "entity.other.attribute-name": "#c4b28a", // dragonYellow - 属性名
    "string.quoted.double.html": "#87a987", // dragonGreen - 属性値
    "punctuation.definition.tag": "#9e9b93", // タグ区切り

    // TOML
    "entity.name.section.toml": "#8ea4a2", // dragonAqua - セクション
    "support.type.property-name.toml": "#c4b28a", // dragonYellow - キー
    "string.toml": "#87a987", // dragonGreen - 値
  } as const,

  /**
   * CSS変数宣言を生成
   * @returns CSS変数宣言文字列
   */
  toCSSVariables(): string {
    return `
--syntax-keyword: ${this.keyword};
--syntax-function: ${this.function};
--syntax-string: ${this.string};
--syntax-number: ${this.number};
--syntax-constant: ${this.constant};
--syntax-type: ${this.type};
--syntax-comment: ${this.comment};
--syntax-variable: ${this.variable};
--syntax-operator: ${this.operator};
--syntax-punctuation: ${this.punctuation};
`.trim();
  },

  /**
   * Prism.js テーマスタイルを生成
   * @returns CSS文字列
   */
  toPrismTheme(): string {
    return `
/* Kanagawa Dragon Prism Theme */
code[class*="language-"],
pre[class*="language-"] {
  color: #c5c9c5;
  background: #12120f;
}

.token.comment,
.token.prolog,
.token.doctype,
.token.cdata {
  color: ${this.comment};
}

.token.punctuation {
  color: ${this.punctuation};
}

.token.property,
.token.tag,
.token.boolean,
.token.number,
.token.constant,
.token.symbol,
.token.deleted {
  color: ${this.number};
}

.token.selector,
.token.attr-name,
.token.string,
.token.char,
.token.builtin,
.token.inserted {
  color: ${this.string};
}

.token.operator,
.token.entity,
.token.url,
.language-css .token.string,
.style .token.string {
  color: ${this.operator};
}

.token.atrule,
.token.attr-value,
.token.keyword {
  color: ${this.keyword};
}

.token.function,
.token.class-name {
  color: ${this.function};
}

.token.regex,
.token.important,
.token.variable {
  color: ${this.variable};
}
`.trim();
  },

  /**
   * Markdown用テーマスタイルを生成
   * @returns CSS文字列
   */
  toMarkdownTheme(): string {
    return `
/* Kanagawa Dragon Markdown Theme */
.markdown-body {
  color: #c5c9c5;
  background: #12120f;
}

/* 見出し */
.markdown-body h1,
.markdown-body h2,
.markdown-body h3,
.markdown-body h4,
.markdown-body h5,
.markdown-body h6 {
  color: ${this.type};
}

/* 太字・斜体 */
.markdown-body strong {
  color: ${this.operator};
}

.markdown-body em {
  color: ${this.number};
}

/* リンク */
.markdown-body a {
  color: ${this.function};
}

/* コードブロック */
.markdown-body code,
.markdown-body pre {
  color: ${this.string};
  background: rgba(18, 18, 15, 0.8);
}

/* 引用 */
.markdown-body blockquote {
  color: ${this.comment};
  border-left-color: ${this.comment};
}

/* リスト */
.markdown-body ul,
.markdown-body ol {
  color: #c5c9c5;
}

.markdown-body li::marker {
  color: ${this.variable};
}

/* テーブル */
.markdown-body table {
  border-color: ${this.punctuation};
}

.markdown-body th {
  color: ${this.type};
  background: rgba(142, 164, 162, 0.1);
}

.markdown-body td {
  border-color: ${this.punctuation};
}
`.trim();
  },

  /**
   * JSON用テーマスタイルを生成
   * @returns CSS文字列
   */
  toJSONTheme(): string {
    return `
/* Kanagawa Dragon JSON Theme */
.json-viewer {
  color: #c5c9c5;
  background: #12120f;
}

.json-key {
  color: ${this.variable};
}

.json-string {
  color: ${this.string};
}

.json-number {
  color: ${this.number};
}

.json-boolean,
.json-null {
  color: ${this.constant};
}

.json-brace,
.json-bracket {
  color: ${this.punctuation};
}
`.trim();
  },

  /**
   * YAML用テーマスタイルを生成
   * @returns CSS文字列
   */
  toYAMLTheme(): string {
    return `
/* Kanagawa Dragon YAML Theme */
.yaml-viewer {
  color: #c5c9c5;
  background: #12120f;
}

.yaml-key {
  color: ${this.variable};
}

.yaml-string {
  color: ${this.string};
}

.yaml-number {
  color: ${this.number};
}

.yaml-boolean,
.yaml-null {
  color: ${this.constant};
}

.yaml-anchor {
  color: ${this.keyword};
}

.yaml-alias {
  color: ${this.function};
}
`.trim();
  },
};

/**
 * シンタックスハイライトのトークンタイプ（コード向け）
 */
export type SyntaxToken = keyof typeof kanagawaSyntax.tokenMapping;

/**
 * ドキュメント向けトークンタイプ
 */
export type DocumentToken = keyof typeof kanagawaSyntax.documentTokenMapping;

/**
 * サポートされるドキュメントフォーマット
 */
export type DocumentFormat =
  | "markdown"
  | "json"
  | "yaml"
  | "csv"
  | "xml"
  | "toml";

/**
 * トークンタイプからカラーを取得（コード向け）
 * @param token - トークンタイプ
 * @returns カラーコード
 */
export function getSyntaxColor(token: SyntaxToken): string {
  return kanagawaSyntax.tokenMapping[token];
}

/**
 * ドキュメントトークンタイプからカラーを取得
 * @param token - ドキュメントトークンタイプ
 * @returns カラーコード
 */
export function getDocumentSyntaxColor(token: DocumentToken): string {
  return kanagawaSyntax.documentTokenMapping[token];
}

/**
 * CSS変数参照形式でカラーを取得
 * @param colorName - シンタックスカラー名
 * @returns CSS変数参照文字列
 */
export function getSyntaxCSSVar(
  colorName: keyof typeof kanagawaSyntax.cssVarNames,
): string {
  return `var(${kanagawaSyntax.cssVarNames[colorName]})`;
}

/**
 * ドキュメントフォーマットに応じたテーマCSSを取得
 * @param format - ドキュメントフォーマット
 * @returns CSS文字列
 */
export function getDocumentThemeCSS(format: DocumentFormat): string {
  switch (format) {
    case "markdown":
      return kanagawaSyntax.toMarkdownTheme();
    case "json":
      return kanagawaSyntax.toJSONTheme();
    case "yaml":
      return kanagawaSyntax.toYAMLTheme();
    default:
      // 汎用Prismテーマをフォールバック
      return kanagawaSyntax.toPrismTheme();
  }
}

/**
 * 全テーマCSSを結合して取得
 * @returns 全テーマのCSS文字列
 */
export function getAllThemeCSS(): string {
  return [
    kanagawaSyntax.toPrismTheme(),
    kanagawaSyntax.toMarkdownTheme(),
    kanagawaSyntax.toJSONTheme(),
    kanagawaSyntax.toYAMLTheme(),
  ].join("\n\n");
}
