# Phase 2: 設計ドキュメント

## skillName.ts 設計

```typescript
/**
 * スキル名バリデーション定数
 *
 * スキル名は kebab-case（英小文字・数字・ハイフン区切り）でなければならない。
 * 例: my-skill, skill-001, hello-world
 *
 * @module constants/skillName
 */

/**
 * スキル名として有効な文字列パターン。
 * - 先頭は英小文字または数字
 * - ハイフン区切りのセグメントで構成
 * - 末尾はハイフン以外
 */
export const SKILL_NAME_PATTERN: RegExp = /^[a-z0-9]+(-[a-z0-9]+)*$/;
```

`security.ts` の既存パターンを参考に:

- JSDoc付き
- `export const` 形式
- 型注釈 `RegExp` を明示

## index.ts 追記内容

```typescript
export { SKILL_NAME_PATTERN } from "./skillName";
```

既存の `security.ts` からのエクスポートと競合なし（名前が異なる）。

## SkillScanner.ts 変更方針

インポート追加:

```typescript
import { SKILL_NAME_PATTERN } from "@repo/shared/constants";
```

`validateSkillName()` JSDocコメントのリテラル参照を `SKILL_NAME_PATTERN` 定数参照に更新。

## init_skill.js 変更方針

インポート追加（ESM）:

```javascript
import { SKILL_NAME_PATTERN } from "@repo/shared/constants";
```

`validateSkillName()` 内のインラインリテラル:

```javascript
if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)) {
```

を以下に置き換え:

```javascript
if (!SKILL_NAME_PATTERN.test(name)) {
```

## claude-cli/constants.ts 変更方針

`packages/shared/src/claude-cli/constants.ts` では、`CLAUDE_CLI_DEFAULTS.MAX_SKILL_NAME_LENGTH` を `skillName.ts` の単一信頼源から取得する。

```typescript
import {
  MAX_SKILL_NAME_LENGTH,
  SKILL_NAME_PATTERN,
} from "../constants/skillName";

export const CLAUDE_CLI_DEFAULTS = {
  MAX_SKILL_NAME_LENGTH,
  // ...
} as const;
```

この設計により、desktop 側・skill-creator 側・claude-cli 定数層の上限値が一致し、将来の変更漏れを避けられる。
