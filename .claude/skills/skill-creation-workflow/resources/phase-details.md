# Phase Details

## Phase 1: Knowledge Collection and Analysis

### Purpose
Identify and collect knowledge that should be formalized into a skill.

### Key Steps

1. **Understand Skill Creation Request**
   - Analyze user requirements
   - Clarify skill purpose and scope
   - Identify target users (agents, developers, both)

2. **Identify and Collect Knowledge Sources**
   - Collect existing documentation
   - Extract code patterns
   - Identify best practices
   - Interview subject matter experts
   - Reference official documentation

3. **Determine Knowledge Granularity and Scope**
   - Narrow to single topic
   - Define skill boundaries
   - Check for overlap with existing skills
   - Map dependencies with related skills

### Success Criteria
- [ ] Knowledge scope clearly defined
- [ ] Knowledge sources identified
- [ ] No overlap confirmed
- [ ] Reliability assessed
- [ ] Appropriate knowledge volume (fits within 500 lines)

---

## Phase 2: Skill Structure Design

### Purpose
Design YAML Frontmatter and SKILL.md body structure.

### Key Steps

1. **Design name, description, version**
   - name: kebab-case, descriptive, unique
   - description: 1-2 line summary, usage timing (3-5 scenarios)
   - version: Semantic versioning (start with 1.0.0)

2. **Determine SKILL.md Body Section Structure**
   - Required: Overview, Key Concepts, Examples, Related Skills
   - Recommended: Best Practices, Troubleshooting, Version History

3. **Assess Resource Splitting Need (500-line rule)**
   - If >500 lines → split into resources
   - Topic-based split (recommended)
   - Level-based split (beginner/intermediate/advanced)

### Success Criteria
- [ ] Description contains 3+ specific trigger conditions
- [ ] SKILL.md body fits within 500 lines
- [ ] Resource split plan is appropriate
- [ ] Section structure is logical
- [ ] Metadata is complete

---

## Phase 3: File Generation and Organization

### Purpose
Create SKILL.md and resources based on design.

### Key Steps

1. **Create Directory Structure**
2. **Write SKILL.md (all required sections)**
3. **Create Resource Files (each <500 lines)**
4. **Create Scripts/Templates (as needed)**

### Success Criteria
- [ ] All files within 500 lines
- [ ] Resource references clear
- [ ] Scripts executable
- [ ] Directory structure compliant
- [ ] All required sections written

---

## Phase 4: Quality Assurance and Optimization

### Purpose
Verify skill quality and optimize activation reliability.

### Key Steps

1. **Progressive Disclosure Verification**
2. **Token Usage Estimation (<20K recommended)**
3. **Activation Trigger Optimization**
4. **Agent Integration Testing**

### Success Criteria
- [ ] 3-layer structure functional
- [ ] Token usage within recommended range (<20K)
- [ ] Auto-activation working properly
- [ ] Resource loading normal
- [ ] Scripts execute successfully

---

## Phase 5: Integration and Maintenance Planning

### Purpose
Integrate skill into ecosystem and plan continuous quality maintenance.

### Key Steps

1. **Register in .claude/skills/skill_list.md**
2. **Register in .claude/agents/agent_list.md**
3. **Add full paths to "Related Skills" in SKILL.md**
4. **Define Update Triggers and Review Cycle**
5. **Establish Versioning Strategy**

### Success Criteria
- [ ] skill_list.md registration complete
- [ ] agent_list.md registration complete
- [ ] Maintenance plan defined
- [ ] Versioning strategy established
