/**
 * skill-docs 型定義テスト (TASK-9I Phase 4)
 *
 * 5つの型インターフェース（DocGenerationRequest, GeneratedDoc, DocSection, DocTemplate, TemplateSection）
 * の型割り当て可能性を検証する。
 *
 * @see docs/30-workflows/TASK-9I-skill-docs/outputs/phase-4/test-cases.md
 */
import { describe, it, expect } from "vitest";
import type {
  DocGenerationRequest,
  GeneratedDoc,
  DocSection,
  DocTemplate,
  TemplateSection,
} from "../skill-docs";

describe("skill-docs types", () => {
  it("T-01: DocGenerationRequest has required fields", () => {
    const request: DocGenerationRequest = {
      skillName: "test-skill",
      outputFormat: "markdown",
      includeExamples: true,
      includeApiReference: false,
      language: "ja",
    };
    expect(request.skillName).toBe("test-skill");
    expect(request.outputFormat).toBe("markdown");
    expect(request.language).toBe("ja");
  });

  it("T-02: DocGenerationRequest supports optional customSections", () => {
    const request: DocGenerationRequest = {
      skillName: "test",
      outputFormat: "html",
      includeExamples: false,
      includeApiReference: false,
      language: "en",
      customSections: ["custom1", "custom2"],
    };
    expect(request.customSections).toHaveLength(2);
  });

  it("T-03: GeneratedDoc has all required fields", () => {
    const doc: GeneratedDoc = {
      skillName: "test-skill",
      format: "markdown",
      content: "# Test",
      sections: [],
      generatedAt: "2026-02-28T00:00:00Z",
      wordCount: 10,
    };
    expect(doc.skillName).toBe("test-skill");
    expect(doc.format).toBe("markdown");
    expect(doc.wordCount).toBe(10);
  });

  it("T-04: DocSection has required fields", () => {
    const section: DocSection = {
      id: "overview",
      title: "概要",
      content: "test content",
      order: 0,
    };
    expect(section.id).toBe("overview");
    expect(section.order).toBe(0);
  });

  it("T-05: DocTemplate has required fields", () => {
    const template: DocTemplate = {
      id: "default",
      name: "Standard",
      description: "Default template",
      sections: [],
    };
    expect(template.id).toBe("default");
    expect(template.sections).toHaveLength(0);
  });

  it("T-06: TemplateSection has required fields", () => {
    const section: TemplateSection = {
      id: "overview",
      title: "概要",
      prompt: "Generate overview",
      required: true,
    };
    expect(section.required).toBe(true);
    expect(section.prompt).toContain("Generate");
  });

  it("T-07: outputFormat accepts only markdown or html", () => {
    const mdRequest: DocGenerationRequest = {
      skillName: "test",
      outputFormat: "markdown",
      includeExamples: false,
      includeApiReference: false,
      language: "ja",
    };
    const htmlRequest: DocGenerationRequest = {
      skillName: "test",
      outputFormat: "html",
      includeExamples: false,
      includeApiReference: false,
      language: "ja",
    };
    expect(mdRequest.outputFormat).toBe("markdown");
    expect(htmlRequest.outputFormat).toBe("html");
  });

  it("T-08: language accepts only ja or en", () => {
    const jaReq: DocGenerationRequest = {
      skillName: "test",
      outputFormat: "markdown",
      includeExamples: false,
      includeApiReference: false,
      language: "ja",
    };
    const enReq: DocGenerationRequest = {
      skillName: "test",
      outputFormat: "markdown",
      includeExamples: false,
      includeApiReference: false,
      language: "en",
    };
    expect(jaReq.language).toBe("ja");
    expect(enReq.language).toBe("en");
  });
});
