# Phase 8: 型キャストレビュー

## タスクID: UT-FIX-SKILL-IMPORT-ID-MISMATCH-001

## 実行日: 2026-02-22

## 結果: 見送り（スコープ外）

## 分析対象

### AgentView 247行目

```typescript
const skills = importedSkills as unknown as Skill[];
```

### AgentView 250行目

```typescript
const availableSkills = availableSkillsMetadata as unknown as Skill[];
```

## 型差異の原因

| 変数                      | 実際の型                     | キャスト先                  | 差異の原因                            |
| ------------------------- | ---------------------------- | --------------------------- | ------------------------------------- |
| `importedSkills`          | `ImportedSkill[]`（Store型） | `Skill[]`（@repo/shared型） | Store内型定義が@repo/shared型と不一致 |
| `availableSkillsMetadata` | `SkillMetadata[]`（Store型） | `Skill[]`（@repo/shared型） | メタデータ型がフル型と不一致          |

## 見送り理由

型キャストの解消には以下の変更が必要：

1. `packages/shared/src/agent/types.ts` — 共有型定義の統一
2. `apps/desktop/src/preload/types.ts` — Preload層型定義の統一
3. `apps/desktop/src/renderer/store/slices/agentSlice.ts` — Store型定義の変更

これはP32（型定義の二箇所同時更新必須）に該当し、本タスク（SkillImportDialog id→name変換修正）のスコープを超える。

## 既存の未タスク参照

この型キャスト解消は既に未タスク UT-FIX-5-1-001（AgentView型アサーション解消）として登録済み。本タスクでの対応は不要。

## 判断基準の適用

| 判断基準 | 条件                             | 結果          |
| -------- | -------------------------------- | ------------- |
| 解消する | 変更影響が本タスクスコープ内     | ❌ スコープ外 |
| 見送る   | 型定義変更が@repo/shared等に波及 | ✅ 該当       |
