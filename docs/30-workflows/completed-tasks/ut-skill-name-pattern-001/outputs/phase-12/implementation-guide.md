# Implementation Guide: UT-SKILL-NAME-PATTERN-001

## タスク概要

**タスクID**: UT-SKILL-NAME-PATTERN-001  
**タスク名**: SKILL_NAME_PATTERN の shared 定数化と現行整合確認  
**結果**: **no-op** — current state は既に完全整合済み

---

## Part 1: 中学生レベルの説明

### 何をしたか

スキル（機能のパッケージ）の名前ルールを決める定数が、プロジェクト全体で同じ場所から読み込まれているかを確認しました。

### なぜ重要か

「スキル名は小文字とハイフンだけ使える、最大64文字」というルールが複数の場所にバラバラに書かれていると、片方を直したときに片方が古いままになってしまいます（これを「drift」と呼びます）。

### 確認した結果

全ての場所が `packages/shared/src/constants/skillName.ts` という1つのファイルからルールを読み込んでいたので、変更は不要でした。

---

## Part 2: 技術詳細

### 正本定義

**ファイル**: `packages/shared/src/constants/skillName.ts`

```typescript
export const SKILL_NAME_PATTERN: RegExp = /^[a-z0-9]+(-[a-z0-9]+)*$/;
export const MAX_SKILL_NAME_LENGTH = 64;
```

### Export 経路

**ファイル**: `packages/shared/src/constants/index.ts`

```typescript
export { SKILL_NAME_PATTERN, MAX_SKILL_NAME_LENGTH } from "./skillName";
```

`packages/shared/src/index.ts`（root barrel）は使用しない。

### Consumer の参照方法

| Consumer                                             | 参照                                                                                 |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `apps/desktop/src/main/claude-cli/SkillScanner.ts`   | `import { MAX_SKILL_NAME_LENGTH, SKILL_NAME_PATTERN } from "@repo/shared/constants"` |
| `.claude/skills/skill-creator/scripts/init_skill.js` | `const packageSpecifier = "@repo/shared/constants"` (with dist fallback)             |
| `.agents/skills/skill-creator/scripts/init_skill.js` | 同上（mirror）                                                                       |

### テスト構成

| ファイル                                                           | カバー内容                               | 結果    |
| ------------------------------------------------------------------ | ---------------------------------------- | ------- |
| `packages/shared/src/constants/skillName.test.ts`                  | PATTERN source・MAX値・有効/無効パターン | 11 PASS |
| `packages/shared/src/constants/__tests__/manual-import.test.ts`    | barrel export からのインポート           | 14 PASS |
| `apps/desktop/src/main/claude-cli/__tests__/skill-scanner.test.ts` | validateSkillName 64/65 境界値           | 35 PASS |

**合計 60 tests ALL PASS**

### 禁止事項

- `packages/shared/src/index.ts` からのインポートは使用禁止
- `SKILL_NAME_MAX_LENGTH` という旧名は使用禁止（正式名: `MAX_SKILL_NAME_LENGTH`）
- 新規 `__tests__/skillName.test.ts` は作成禁止（既存 `skillName.test.ts` を使用）

---

## 変更ファイル

**なし** — no-op タスク

---

## 受入基準達成状況

| AC   | 内容                                                                    | 結果 |
| ---- | ----------------------------------------------------------------------- | ---- |
| AC-1 | `skillName.ts` に定数定義あり                                           | ✅   |
| AC-2 | `constants/index.ts` から export あり                                   | ✅   |
| AC-3 | `SkillScanner.ts` と `init_skill.js` が `@repo/shared/constants` を参照 | ✅   |
| AC-4 | テストが current-state と整合                                           | ✅   |
| AC-5 | 用語統一（`MAX_SKILL_NAME_LENGTH`・`@repo/shared/constants`）           | ✅   |
