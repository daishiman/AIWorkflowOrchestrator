# Implementation Guide: SkillFileWriter (TASK-SC-04-OUTPUT-PERSISTENCE)

## Part 1: Concept (for beginners)

### What does SkillFileWriter do?

Think of it like organizing documents into a filing cabinet. When an AI creates a new "skill" (a set of instructions), SkillFileWriter takes those instructions and saves them into the right folders on your computer.

**The filing cabinet analogy:**

- The cabinet = `.claude/skills/` directory
- Each drawer = a skill folder (e.g., `my-skill/`)
- The main document = `SKILL.md` (the skill definition)
- Supporting documents = `agents/`, `scripts/`, `references/` folders

### Atomic Writing: "All or Nothing"

When you press "Save" on a document, you expect everything to be saved. If the save fails halfway, you don't want a half-written file. SkillFileWriter works the same way:

- If all files are written successfully: Everything is saved
- If any file fails (e.g., disk full): All previously written files are deleted (rollback)
- You never end up with a partial skill

### Path Traversal Prevention: "Is this location safe?"

Before saving any file, SkillFileWriter checks: "Am I saving to the right place?" If someone tries to trick it into saving files outside the `.claude/skills/` folder (e.g., using `../` to go up directories), it refuses immediately.

---

## Part 2: Technical Details

### SkillFileWriter Class

**Location**: `apps/desktop/src/main/services/skill/SkillFileWriter.ts`

**Key Methods:**

1. `persist(skillName, content, options?)` - Main entry point
   - Validates skill name (P42-compliant 3-step validation + path traversal check)
   - Checks for existing skill (overwrite guard)
   - Creates directory structure
   - Writes files atomically (with rollback on failure)

2. `validateSkillName(skillName)` - 6-layer validation:
   - Layer 1: typeof check
   - Layer 2: empty string check
   - Layer 3: whitespace-only check (P42)
   - Layer 4: dangerous characters (`..`, `/`, `\`)
   - Layer 5: `path.resolve()` + basePath prefix verification

3. `rollback(writtenFiles, skillPath)` - Cleanup on failure:
   - Deletes written files in reverse order
   - Removes empty subdirectories
   - Removes empty skill directory

### SkillGeneratedContent Type

**Location**: `packages/shared/src/types/skillCreator.ts`

```typescript
interface SkillGeneratedContent {
  skillMd: string; // SKILL.md content
  agents: Array<{ name: string; content: string }>; // agents/*.md
  scripts: Array<{ name: string; content: string }>; // scripts/*
  references: Array<{ name: string; content: string }>; // references/*.md
}
```

### DI Integration

SkillFileWriter is injected into `RuntimeSkillCreatorFacade` via `RuntimeSkillCreatorFacadeDeps.skillFileWriter?` (optional). When not injected, file persistence is skipped (graceful degradation).

### execute() Flow

```
RuntimeSkillCreatorFacade.execute()
  -> SkillExecutor.execute() (LLM call)
  -> extractGeneratedContent() (map plan to SkillGeneratedContent)
  -> SkillFileWriter.persist() (atomic file write)
  -> Return RuntimeSkillCreatorExecuteResult
```
