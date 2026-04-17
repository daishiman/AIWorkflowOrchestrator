# Phase 1: StructurePlanJson 参照箇所棚卸し結果

## 実行コマンド

```bash
grep -rn "StructurePlanJson" apps/ packages/
```

## 棚卸し結果

### 実装コード参照箇所（apps/ / packages/ のみ）

| ファイル                                                      | 行番号 | 用途                                                  |
| ------------------------------------------------------------- | ------ | ----------------------------------------------------- |
| `apps/desktop/src/main/services/skill/SkillCreatorService.ts` | L36    | `interface StructurePlanJson` 定義                    |
| `apps/desktop/src/main/services/skill/SkillCreatorService.ts` | L112   | `let structurePlan: StructurePlanJson \| null` 使用   |
| `apps/desktop/src/main/services/skill/SkillCreatorService.ts` | L617   | `Promise<StructurePlanJson \| null>` 戻り値型         |
| `apps/desktop/src/main/services/skill/SkillCreatorService.ts` | L619   | `const structurePlan: StructurePlanJson = {...}` 使用 |
| `apps/desktop/src/main/services/skill/SkillCreatorService.ts` | L640   | `structurePlan: StructurePlanJson` 引数型             |

> **注**: 上記 5 行はすべて同一ファイル (`SkillCreatorService.ts`) 内の参照。テストファイル・ドキュメントには参照なし。

### docs/ / .claude/ 内の言及（カウント対象外）

調査対象外のため記録しない。

---

## 判断結果

| 項目           | 内容                                                                                    |
| -------------- | --------------------------------------------------------------------------------------- |
| 参照ファイル数 | **1 ファイル** (`SkillCreatorService.ts`)                                               |
| 昇格判断       | **ローカル定義維持・即クローズ**                                                        |
| 理由           | 参照箇所が 1 ファイルに限定されており、共有の必要性がない。昇格コストがメリットを上回る |
| 後続 Phase     | Phase 2 以降は実施しない                                                                |

---

## StructurePlanJson 現行定義（参照）

```typescript
// apps/desktop/src/main/services/skill/SkillCreatorService.ts L36
/**
 * create モードで生成するスキル構造計画 JSON
 * TASK-SC-IMP-CREATE-WORKFLOW-001: generate_skill_md.js --plan 引数に渡す
 */
interface StructurePlanJson {
  skillName: string;
  description: string;
  purpose: string;
  features: string[];
  agents: string[];
  triggers?: string[];
  anchors?: Anchor[];
}
```

---

## packages/shared/src/types/skillCreator.ts 状況

`StructurePlanJson` は **存在しない**（昇格先候補ファイルへの追加は不要）。

---

_生成日: 2026-04-16_
_タスク: TASK-SC-SHARED-TYPE-PROMOTE-001_
