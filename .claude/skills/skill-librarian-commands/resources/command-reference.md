# Command Reference

## Script Execution Commands

### validate-knowledge.mjs
**Path**: `.claude/skills/knowledge-management/scripts/validate-knowledge.mjs`
**Purpose**: Validate knowledge document quality
**Usage**: 
```bash
node .claude/skills/knowledge-management/scripts/validate-knowledge.mjs <file.md>
```

### calculate-token-usage.mjs
**Path**: `.claude/skills/progressive-disclosure/scripts/calculate-token-usage.mjs`
**Purpose**: Calculate total token usage for skill directory
**Usage**:
```bash
node .claude/skills/progressive-disclosure/scripts/calculate-token-usage.mjs <skill-directory>
```

### analyze-structure.mjs
**Path**: `.claude/skills/documentation-architecture/scripts/analyze-structure.mjs`
**Purpose**: Analyze skill directory structure
**Usage**:
```bash
node .claude/skills/documentation-architecture/scripts/analyze-structure.mjs <skill-directory>
```

## Resource Access Commands

### SECIモデル詳細
```bash
cat .claude/skills/knowledge-management/resources/seci-model-details.md
```

### 3層開示モデル
```bash
cat .claude/skills/progressive-disclosure/resources/three-layer-model.md
```

### ファイル分割パターン
```bash
cat .claude/skills/documentation-architecture/resources/splitting-patterns.md
```

## Template Access Commands

### 知識文書化テンプレート
```bash
cat .claude/skills/knowledge-management/templates/knowledge-document-template.md
```

### スキルメタデータテンプレート
```bash
cat .claude/skills/progressive-disclosure/templates/skill-metadata-template.yaml
```
