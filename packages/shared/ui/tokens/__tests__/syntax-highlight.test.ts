/**
 * @file syntax-highlight.test.ts
 * @description シンタックスハイライト用CSS変数のテスト（TDD: Green）
 */

import { describe, it, expect } from "vitest";
import {
  kanagawaSyntax,
  getSyntaxColor,
  getDocumentSyntaxColor,
  getSyntaxCSSVar,
  getDocumentThemeCSS,
  getAllThemeCSS,
  type SyntaxToken,
  type DocumentToken,
  type DocumentFormat,
} from "../syntax-highlight";

describe("Kanagawa Dragon シンタックスハイライト", () => {
  describe("カラー定義", () => {
    it("should have keyword color defined", () => {
      expect(kanagawaSyntax.keyword).toBe("#8992a7");
    });

    it("should have function color defined", () => {
      expect(kanagawaSyntax.function).toBe("#8ba4b0");
    });

    it("should have string color defined", () => {
      expect(kanagawaSyntax.string).toBe("#87a987");
    });

    it("should have number color defined", () => {
      expect(kanagawaSyntax.number).toBe("#a292a3");
    });

    it("should have constant color defined", () => {
      expect(kanagawaSyntax.constant).toBe("#b6927b");
    });

    it("should have type color defined", () => {
      expect(kanagawaSyntax.type).toBe("#8ea4a2");
    });

    it("should have comment color defined", () => {
      expect(kanagawaSyntax.comment).toBe("#625e5a");
    });

    it("should have variable color defined", () => {
      expect(kanagawaSyntax.variable).toBe("#c4b28a");
    });

    it("should have operator color defined", () => {
      expect(kanagawaSyntax.operator).toBe("#c4746e");
    });

    it("should have punctuation color defined", () => {
      expect(kanagawaSyntax.punctuation).toBe("#9e9b93");
    });
  });

  describe("CSS変数名", () => {
    it("should have correct CSS variable names", () => {
      expect(kanagawaSyntax.cssVarNames.keyword).toBe("--syntax-keyword");
      expect(kanagawaSyntax.cssVarNames.function).toBe("--syntax-function");
      expect(kanagawaSyntax.cssVarNames.string).toBe("--syntax-string");
      expect(kanagawaSyntax.cssVarNames.number).toBe("--syntax-number");
      expect(kanagawaSyntax.cssVarNames.constant).toBe("--syntax-constant");
      expect(kanagawaSyntax.cssVarNames.type).toBe("--syntax-type");
      expect(kanagawaSyntax.cssVarNames.comment).toBe("--syntax-comment");
      expect(kanagawaSyntax.cssVarNames.variable).toBe("--syntax-variable");
    });
  });

  describe("トークンマッピング", () => {
    it("should map TypeScript tokens to colors", () => {
      const mapping = kanagawaSyntax.tokenMapping;

      expect(mapping["keyword"]).toBe(kanagawaSyntax.keyword);
      expect(mapping["keyword.control"]).toBe(kanagawaSyntax.keyword);
      expect(mapping["keyword.operator"]).toBe(kanagawaSyntax.operator);

      expect(mapping["string"]).toBe(kanagawaSyntax.string);
      expect(mapping["string.quoted"]).toBe(kanagawaSyntax.string);

      expect(mapping["constant.numeric"]).toBe(kanagawaSyntax.number);
      expect(mapping["constant.language"]).toBe(kanagawaSyntax.constant);

      expect(mapping["entity.name.function"]).toBe(kanagawaSyntax.function);
      expect(mapping["entity.name.type"]).toBe(kanagawaSyntax.type);

      expect(mapping["variable"]).toBe(kanagawaSyntax.variable);
      expect(mapping["variable.other"]).toBe(kanagawaSyntax.variable);

      expect(mapping["comment"]).toBe(kanagawaSyntax.comment);
      expect(mapping["comment.line"]).toBe(kanagawaSyntax.comment);
      expect(mapping["comment.block"]).toBe(kanagawaSyntax.comment);
    });
  });

  describe("WCAGコントラスト", () => {
    it("should meet AA standard for all syntax colors on dragon background", async () => {
      const { calculateContrastRatio } = await import("../contrast");

      const background = "#12120f"; // dragonBlack1
      const colors = [
        kanagawaSyntax.keyword,
        kanagawaSyntax.function,
        kanagawaSyntax.string,
        kanagawaSyntax.number,
        kanagawaSyntax.constant,
        kanagawaSyntax.type,
        kanagawaSyntax.variable,
      ];

      for (const color of colors) {
        const ratio = calculateContrastRatio(color, background);
        expect(ratio).toBeGreaterThanOrEqual(4.5);
      }
    });

    it("should have comment color with intentionally low contrast", async () => {
      const { calculateContrastRatio } = await import("../contrast");

      const background = "#12120f"; // dragonBlack1
      const ratio = calculateContrastRatio(kanagawaSyntax.comment, background);

      // コメントは意図的に低コントラスト（読みやすさよりも目立たなさを優先）
      // Kanagawaテーマの設計意図に従い、2.5:1以上であればOK
      expect(ratio).toBeGreaterThanOrEqual(2.5);
    });
  });

  describe("CSS生成", () => {
    it("should generate valid CSS variable declarations", () => {
      const css = kanagawaSyntax.toCSSVariables();

      expect(css).toContain("--syntax-keyword: #8992a7;");
      expect(css).toContain("--syntax-function: #8ba4b0;");
      expect(css).toContain("--syntax-string: #87a987;");
      expect(css).toContain("--syntax-number: #a292a3;");
      expect(css).toContain("--syntax-constant: #b6927b;");
      expect(css).toContain("--syntax-type: #8ea4a2;");
      expect(css).toContain("--syntax-comment: #625e5a;");
      expect(css).toContain("--syntax-variable: #c4b28a;");
    });

    it("should generate valid Prism.js theme", () => {
      const css = kanagawaSyntax.toPrismTheme();

      expect(css).toContain("/* Kanagawa Dragon Prism Theme */");
      expect(css).toContain('code[class*="language-"]');
      expect(css).toContain(".token.comment");
      expect(css).toContain(".token.keyword");
      expect(css).toContain(".token.string");
      expect(css).toContain("background: #12120f");
    });
  });

  describe("ドキュメント向けトークンマッピング", () => {
    describe("Markdown", () => {
      it("should map Markdown heading tokens", () => {
        const mapping = kanagawaSyntax.documentTokenMapping;

        expect(mapping["markup.heading"]).toBe("#8ea4a2");
        expect(mapping["markup.heading.1"]).toBe("#8ea4a2");
        expect(mapping["markup.heading.6"]).toBe("#8ea4a2");
      });

      it("should map Markdown formatting tokens", () => {
        const mapping = kanagawaSyntax.documentTokenMapping;

        expect(mapping["markup.bold"]).toBe("#c4746e");
        expect(mapping["markup.italic"]).toBe("#a292a3");
        expect(mapping["markup.strikethrough"]).toBe("#625e5a");
      });

      it("should map Markdown link tokens", () => {
        const mapping = kanagawaSyntax.documentTokenMapping;

        expect(mapping["markup.link"]).toBe("#8ba4b0");
        expect(mapping["markup.link.url"]).toBe("#87a987");
      });

      it("should map Markdown list tokens", () => {
        const mapping = kanagawaSyntax.documentTokenMapping;

        expect(mapping["markup.list"]).toBe("#c4b28a");
        expect(mapping["markup.list.numbered"]).toBe("#c4b28a");
        expect(mapping["markup.list.unnumbered"]).toBe("#c4b28a");
      });

      it("should map Markdown code block tokens", () => {
        const mapping = kanagawaSyntax.documentTokenMapping;

        expect(mapping["markup.raw"]).toBe("#87a987");
        expect(mapping["markup.inline.raw"]).toBe("#87a987");
        expect(mapping["markup.fenced_code"]).toBe("#87a987");
      });
    });

    describe("JSON", () => {
      it("should map JSON key-value tokens", () => {
        const mapping = kanagawaSyntax.documentTokenMapping;

        expect(mapping["support.type.property-name.json"]).toBe("#c4b28a");
        expect(mapping["string.json"]).toBe("#87a987");
        expect(mapping["constant.numeric.json"]).toBe("#a292a3");
        expect(mapping["constant.language.json"]).toBe("#b6927b");
      });
    });

    describe("YAML", () => {
      it("should map YAML key-value tokens", () => {
        const mapping = kanagawaSyntax.documentTokenMapping;

        expect(mapping["entity.name.tag.yaml"]).toBe("#c4b28a");
        expect(mapping["string.unquoted.yaml"]).toBe("#87a987");
        expect(mapping["constant.numeric.yaml"]).toBe("#a292a3");
        expect(mapping["constant.language.yaml"]).toBe("#b6927b");
      });

      it("should map YAML anchor and alias tokens", () => {
        const mapping = kanagawaSyntax.documentTokenMapping;

        expect(mapping["punctuation.definition.anchor.yaml"]).toBe("#8992a7");
        expect(mapping["entity.name.type.anchor.yaml"]).toBe("#8992a7");
        expect(mapping["punctuation.definition.alias.yaml"]).toBe("#8ba4b0");
        expect(mapping["variable.other.alias.yaml"]).toBe("#8ba4b0");
      });
    });

    describe("CSV", () => {
      it("should map CSV tokens", () => {
        const mapping = kanagawaSyntax.documentTokenMapping;

        expect(mapping["meta.structure.csv"]).toBe("#c5c9c5");
        expect(mapping["string.csv"]).toBe("#87a987");
        expect(mapping["punctuation.separator.csv"]).toBe("#9e9b93");
      });
    });

    describe("XML/HTML", () => {
      it("should map XML/HTML tokens", () => {
        const mapping = kanagawaSyntax.documentTokenMapping;

        expect(mapping["entity.name.tag"]).toBe("#8992a7");
        expect(mapping["entity.other.attribute-name"]).toBe("#c4b28a");
        expect(mapping["string.quoted.double.html"]).toBe("#87a987");
        expect(mapping["punctuation.definition.tag"]).toBe("#9e9b93");
      });
    });

    describe("TOML", () => {
      it("should map TOML tokens", () => {
        const mapping = kanagawaSyntax.documentTokenMapping;

        expect(mapping["entity.name.section.toml"]).toBe("#8ea4a2");
        expect(mapping["support.type.property-name.toml"]).toBe("#c4b28a");
        expect(mapping["string.toml"]).toBe("#87a987");
      });
    });
  });

  describe("ドキュメント向けテーマ生成", () => {
    it("should generate Markdown theme CSS", () => {
      const css = kanagawaSyntax.toMarkdownTheme();

      expect(css).toContain("/* Kanagawa Dragon Markdown Theme */");
      expect(css).toContain(".markdown-body");
      expect(css).toContain(".markdown-body h1");
      expect(css).toContain(".markdown-body strong");
      expect(css).toContain(".markdown-body em");
      expect(css).toContain(".markdown-body a");
      expect(css).toContain(".markdown-body blockquote");
      expect(css).toContain(".markdown-body code");
    });

    it("should generate JSON theme CSS", () => {
      const css = kanagawaSyntax.toJSONTheme();

      expect(css).toContain("/* Kanagawa Dragon JSON Theme */");
      expect(css).toContain(".json-viewer");
      expect(css).toContain(".json-key");
      expect(css).toContain(".json-string");
      expect(css).toContain(".json-number");
      expect(css).toContain(".json-boolean");
    });

    it("should generate YAML theme CSS", () => {
      const css = kanagawaSyntax.toYAMLTheme();

      expect(css).toContain("/* Kanagawa Dragon YAML Theme */");
      expect(css).toContain(".yaml-viewer");
      expect(css).toContain(".yaml-key");
      expect(css).toContain(".yaml-string");
      expect(css).toContain(".yaml-anchor");
      expect(css).toContain(".yaml-alias");
    });
  });

  describe("エクスポート関数", () => {
    describe("getSyntaxColor", () => {
      it("should return correct color for code tokens", () => {
        expect(getSyntaxColor("keyword")).toBe("#8992a7");
        expect(getSyntaxColor("string")).toBe("#87a987");
        expect(getSyntaxColor("keyword.control")).toBe("#8992a7");
        expect(getSyntaxColor("entity.name.function")).toBe("#8ba4b0");
      });
    });

    describe("getDocumentSyntaxColor", () => {
      it("should return correct color for document tokens", () => {
        expect(getDocumentSyntaxColor("markup.heading")).toBe("#8ea4a2");
        expect(getDocumentSyntaxColor("markup.bold")).toBe("#c4746e");
        expect(getDocumentSyntaxColor("support.type.property-name.json")).toBe(
          "#c4b28a",
        );
        expect(getDocumentSyntaxColor("entity.name.tag.yaml")).toBe("#c4b28a");
      });
    });

    describe("getSyntaxCSSVar", () => {
      it("should return CSS variable reference", () => {
        expect(getSyntaxCSSVar("keyword")).toBe("var(--syntax-keyword)");
        expect(getSyntaxCSSVar("function")).toBe("var(--syntax-function)");
        expect(getSyntaxCSSVar("string")).toBe("var(--syntax-string)");
        expect(getSyntaxCSSVar("comment")).toBe("var(--syntax-comment)");
      });
    });

    describe("getDocumentThemeCSS", () => {
      it("should return Markdown theme for markdown format", () => {
        const css = getDocumentThemeCSS("markdown");
        expect(css).toContain("Kanagawa Dragon Markdown Theme");
        expect(css).toContain(".markdown-body");
      });

      it("should return JSON theme for json format", () => {
        const css = getDocumentThemeCSS("json");
        expect(css).toContain("Kanagawa Dragon JSON Theme");
        expect(css).toContain(".json-viewer");
      });

      it("should return YAML theme for yaml format", () => {
        const css = getDocumentThemeCSS("yaml");
        expect(css).toContain("Kanagawa Dragon YAML Theme");
        expect(css).toContain(".yaml-viewer");
      });

      it("should fallback to Prism theme for unsupported formats", () => {
        const csvCss = getDocumentThemeCSS("csv");
        expect(csvCss).toContain("Kanagawa Dragon Prism Theme");

        const xmlCss = getDocumentThemeCSS("xml");
        expect(xmlCss).toContain("Kanagawa Dragon Prism Theme");

        const tomlCss = getDocumentThemeCSS("toml");
        expect(tomlCss).toContain("Kanagawa Dragon Prism Theme");
      });
    });

    describe("getAllThemeCSS", () => {
      it("should return combined CSS of all themes", () => {
        const css = getAllThemeCSS();

        expect(css).toContain("Kanagawa Dragon Prism Theme");
        expect(css).toContain("Kanagawa Dragon Markdown Theme");
        expect(css).toContain("Kanagawa Dragon JSON Theme");
        expect(css).toContain("Kanagawa Dragon YAML Theme");
      });

      it("should separate themes with blank lines", () => {
        const css = getAllThemeCSS();
        expect(css).toContain("\n\n");
      });
    });
  });

  describe("型定義", () => {
    it("should have SyntaxToken type covering all code tokens", () => {
      // 型チェック - コンパイル時に検証
      const validTokens: SyntaxToken[] = [
        "keyword",
        "keyword.control",
        "string",
        "comment",
        "variable",
      ];
      expect(validTokens.length).toBeGreaterThan(0);
    });

    it("should have DocumentToken type covering all document tokens", () => {
      // 型チェック - コンパイル時に検証
      const validTokens: DocumentToken[] = [
        "markup.heading",
        "markup.bold",
        "support.type.property-name.json",
        "entity.name.tag.yaml",
      ];
      expect(validTokens.length).toBeGreaterThan(0);
    });

    it("should have DocumentFormat type for all supported formats", () => {
      // 型チェック - コンパイル時に検証
      const validFormats: DocumentFormat[] = [
        "markdown",
        "json",
        "yaml",
        "csv",
        "xml",
        "toml",
      ];
      expect(validFormats.length).toBe(6);
    });
  });
});
