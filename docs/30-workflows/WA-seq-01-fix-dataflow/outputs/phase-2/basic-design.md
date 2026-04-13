# フェーズ2 基本設計書

## SkillCreationContext 型定義

```typescript
/** Step 1 で収集したコンテキスト情報。全フィールド optional（後方互換維持）。 */
export interface SkillCreationContext {
  skillName?: string;
  category?: string;
  purpose?: string;
  q1Purpose?: string; // Q1: 利用者
  q2Target?: string; // Q2: 入力データ
  q3Tools?: string; // Q3: 実行タイミング
  q4Timing?: string; // Q4: 出力先
  q5Output?: string; // Q5: 外部ツール連携
  q6Constraints?: string; // Q6: 出力フォーマット
}
```

## buildSkillContext 設計

- **配置**: `packages/shared/src/types/skillCreator.ts`
- **特性**: pure function、副作用なし
- **変換規則**: `freeText` 優先 → `selectedOptions.join(", ")` → `undefined`
- **空文字正規化**: `"".trim() === ""` → `undefined`

```typescript
export function buildSkillContext(
  formData: SkillInfoFormData,
  answers: ConversationAnswers,
): SkillCreationContext;
```

## buildSkillGenerationPrompt 設計

- **配置**: `packages/shared/src/types/skillCreator.ts`
- **特性**: pure function、副作用なし
- **動作**: context の defined フィールドのみをプロンプト文字列に組み込む
- **undefined フィールド**: 出力に含めない

```typescript
export function buildSkillGenerationPrompt(
  context: SkillCreationContext,
): string;
```

## データフロー

```
[Step 1 入力]
SkillInfoFormData + ConversationAnswers(Q1〜Q6)
        ↓
buildSkillContext() [Renderer側]
        ↓
SkillCreationContext
        ↓
createSkill(purpose, options, context) [agentSlice]
        ↓
window.electronAPI.skill.create({ description, options, context }) [preload]
        ↓
IPC: skill:create (description, options, context) [Main]
        ↓
buildSkillGenerationPrompt(context) → enrichedDescription
        ↓
skillService.createSkillFromWizard(enrichedDescription, options) [SkillService]
        ↓
LLM生成
```

## 変更ファイル一覧

| ファイル                                                           | 変更内容                                                                  |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| `packages/shared/src/types/skillCreator.ts`                        | SkillCreationContext型・buildSkillContext・buildSkillGenerationPrompt追加 |
| `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx` | handleGenerate修正                                                        |
| `apps/desktop/src/renderer/store/slices/agentSlice.ts`             | createSkill型+実装拡張                                                    |
| `apps/desktop/src/preload/skill-api.ts`                            | create拡張                                                                |
| `apps/desktop/src/main/ipc/skillHandlers.ts`                       | IPCハンドラ拡張                                                           |

## 設計判断トレードオフ

| 判断                            | 採用       | 理由                                          |
| ------------------------------- | ---------- | --------------------------------------------- |
| buildSkillContext配置           | shared     | Renderer/Mainどちらからも参照可能・テスト容易 |
| 全フィールドoptional            | 採用       | 後方互換性維持のため                          |
| buildSkillGenerationPrompt配置  | shared     | pure functionのためsharedで十分               |
| createSkillFromWizardシグネチャ | 変更しない | IPC境界でenrichを行うため不要                 |
