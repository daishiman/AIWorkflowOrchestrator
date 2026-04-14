# Phase 12: 実装ガイド

## Part 1: 中学生向け説明

学校で「校則」をノートにバラバラに書くと、クラスごとにルールが違ってしまいます。  
今回の変更は、`SkillScanner` と `init_skill.js` で使っていたスキル名ルールを、`packages/shared` の 1 か所にまとめた作業です。

```
1つのルール
  └─ packages/shared/src/constants/skillName.ts
       ├─ SkillScanner.ts
       └─ init_skill.js
```

この形にすると、ルールを変えるときに 1 か所だけ直せばよくなります。

## Part 2: 技術者向け説明

### 公開定数

```typescript
export const SKILL_NAME_PATTERN: RegExp = /^[a-z0-9]+(-[a-z0-9]+)*$/;
export const MAX_SKILL_NAME_LENGTH = 64;
```

### 利用箇所

- `apps/desktop/src/main/claude-cli/SkillScanner.ts`
- `.claude/skills/skill-creator/scripts/init_skill.js`
- `.agents/skills/skill-creator/scripts/init_skill.js`
- `packages/shared/src/claude-cli/constants.ts`

### runtime 注意

`init_skill.js` は `@repo/shared/constants` を優先して import し、失敗時は `packages/shared/dist/src/constants/index.js` にフォールバックする。  
これで `node .../init_skill.js --help` がワークツリー直下でも動く。

### バリデーション

- 空文字は拒否
- 64 文字以内のみ許可
- `\\` / `/` / `..` を含む経路汚染は拒否
- kebab-case 以外は拒否
