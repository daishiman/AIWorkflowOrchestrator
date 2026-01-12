/**
 * Skill mock factory for tests
 */
import { Skill, Anchor } from "@repo/shared";

/**
 * Create a mock Anchor object with all required properties
 */
export function createMockAnchor(overrides: Partial<Anchor> = {}): Anchor {
  return {
    source: "Test Source",
    application: "Test application",
    purpose: "Test purpose",
    ...overrides,
  };
}

/**
 * Create a mock Skill object with all required properties
 */
export function createMockSkill(overrides: Partial<Skill> = {}): Skill {
  return {
    id: "test-skill-id",
    name: "Test Skill",
    slug: "test-skill",
    description: "Test description",
    path: "/test/path/SKILL.md",
    triggers: ["test"],
    anchors: [],
    lastModified: new Date("2024-01-01"),
    ...overrides,
  };
}
