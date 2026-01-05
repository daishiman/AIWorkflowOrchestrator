# 命名規則ガイド

## ファイル命名パターン

### パターン1: トピック別

**形式**: `[topic]-[subtopic].md`

**例**:

- `schema-design.md`
- `.claude/skills/query-optimization/SKILL.md.md`
- `error-handling.md`

### パターン2: フェーズ別

**形式**: `[framework]-[phase].md`

**例**:

- `seci-socialization.md`
- `seci-externalization.md`

### パターン3: レベル別

**形式**: `[number]-[level]-[topic].md`

**例**:

- `01-basics.md`
- `02-intermediate.md`
- `03-advanced.md`

## ディレクトリ命名

**形式**: `kebab-case`

**例**:

- `.claude/skills/knowledge-management/SKILL.md`
- `.claude/skills/progressive-disclosure/SKILL.md`
- `.claude/skills/documentation-architecture/SKILL.md`

## 一貫性の確保

**原則**:

- 同じスキル内で同じパターンを使用
- 英語で統一
- 省略語は避ける

**判断基準**:

- [ ] 命名から内容が推測できるか？
- [ ] 他のファイルと区別できるか？
- [ ] アルファベット順で論理的か？
