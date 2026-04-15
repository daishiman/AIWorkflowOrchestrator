# Phase 1: 現状監査結果

## 実施日

2026-04-14

## 監査対象とその結果

### 1. `packages/shared/src/constants/skillName.ts`

**状態: ✅ 整合済み**

```typescript
export const SKILL_NAME_PATTERN: RegExp = /^[a-z0-9]+(-[a-z0-9]+)*$/;
export const MAX_SKILL_NAME_LENGTH = 64;
```

- `SKILL_NAME_PATTERN` は正規表現 `^[a-z0-9]+(-[a-z0-9]+)*$` で定義されている
- `MAX_SKILL_NAME_LENGTH = 64` で定義されている
- `SKILL_NAME_MAX_LENGTH` という古い名前は使用されていない

### 2. `packages/shared/src/constants/index.ts`

**状態: ✅ 整合済み**

```typescript
export { SKILL_NAME_PATTERN, MAX_SKILL_NAME_LENGTH } from "./skillName";
```

- barrel export が正しく設定されている
- `packages/shared/src/index.ts` は使用されていない

### 3. `apps/desktop/src/main/claude-cli/SkillScanner.ts`

**状態: ✅ 整合済み**

```typescript
import {
  MAX_SKILL_NAME_LENGTH,
  SKILL_NAME_PATTERN,
} from "@repo/shared/constants";
```

- `@repo/shared/constants` を参照している（`packages/shared/src/index.ts` は使用なし）

### 4. `.claude/skills/skill-creator/scripts/init_skill.js`

**状態: ✅ 整合済み**

```javascript
async function loadSkillNameConstants() {
  const packageSpecifier = "@repo/shared/constants";
  // ...
  return await import(packageSpecifier);
}
const { MAX_SKILL_NAME_LENGTH, SKILL_NAME_PATTERN } =
  await loadSkillNameConstants();
```

- `@repo/shared/constants` を一次参照
- dist フォールバックあり（CJS/ESM 互換対応）
- `MAX_SKILL_NAME_LENGTH` を使用（`SKILL_NAME_MAX_LENGTH` は使用なし）

### 5. `.agents/skills/skill-creator/scripts/init_skill.js`

**状態: ✅ 整合済み**

- `.claude/skills/...` と同一実装
- mirror として正しく維持されている

## テスト確認

### `packages/shared/src/constants/skillName.test.ts`

- `MAX_SKILL_NAME_LENGTH === 64` を検証 ✅
- `SKILL_NAME_PATTERN.source === '^[a-z0-9]+(-[a-z0-9]+)*$'` を検証 ✅
- 有効/無効名のテストケースあり ✅

### `packages/shared/src/constants/__tests__/manual-import.test.ts`

- `@repo/shared/constants` からの barrel export を検証 ✅
- `MAX_SKILL_NAME_LENGTH === 64` ✅
- `SKILL_NAME_PATTERN` の source を検証 ✅

### `apps/desktop/src/main/claude-cli/__tests__/skill-scanner.test.ts`

- `validateSkillName` の 64/65 文字境界値テストあり ✅
- path traversal 防御テストあり ✅

## Task Spec の確認

`docs/30-workflows/ut-skill-name-pattern-001/` 内のファイルで
`packages/shared/src/index.ts` / `SKILL_NAME_MAX_LENGTH` の記述を検索したが、
**これらは全て「使用禁止」の文脈で記載されており、実際の drift ではない**。

## 結論

**current state は skill 定義と完全に一致している。**

コード変更は不要。証跡と docs sync のみ実施する。
