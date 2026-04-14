# 実装ガイド: TASK-SW-FIX-DATAFLOW-001

## Part 1: 初学者向け説明（中学生レベル）

### このバグは何だったの？

想像してください。あなたがアンケートに回答して「好きな食べ物はラーメン、食べるタイミングは昼食、辛さは中辛」と書いたのに、
スタッフがシェフに「料理を作って」とだけ伝えていた状態です。
あなたの回答が全く届いていませんでした。

**修正後**: スタッフが「この人はラーメン、昼食、中辛と言っていますよ」とちゃんと伝えるようになりました。

### 何を追加したの？

1. **SkillCreationContext（コンテキスト）**: アンケートの回答をまとめる「封筒」
2. **buildSkillContext()**: アンケート用紙 → 封筒に入れる変換機
3. **buildSkillGenerationPrompt()**: 封筒の内容をシェフが読める「指示書」に変換する機能

## Part 2: 技術者向け説明

### 変更の概要

`SkillCreateWizard.tsx:553` でQ1〜Q6の回答がスキル生成に渡されていなかったバグを修正。
`buildSkillContext()` でUIデータをドメインモデルへ変換し、IPC経由でMainプロセスへ伝播する。

このタスクは UI の見た目変更を伴わないため、Phase 11 は `NON_VISUAL` として扱う。スクリーンショットではなく、単体テストと差分確認を代替証跡にする。

### インターフェース定義

```typescript
// packages/shared/src/types/skillCreator.ts

interface SkillCreationContext {
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

function buildSkillContext(
  formData: SkillInfoFormData,
  answers: ConversationAnswers,
): SkillCreationContext;

function buildSkillGenerationPrompt(context: SkillCreationContext): string;
```

### データフロー

```
[SkillCreateWizard.tsx:553]
  buildSkillContext(formData, answers)
          ↓
  createSkill(purpose, options, context)  [agentSlice.ts]
          ↓
  skill.create(description, options, context)      [preload/skill-api.ts]
          ↓
  IPC: skill:create (description, options, context)  [skillHandlers.ts]
          ↓
  buildSkillGenerationPrompt(context) → enrichedDescription
          ↓
  createSkillFromWizard(enrichedDescription, options)  [SkillService.ts]
          ↓
  LLM スキル生成
```

### 変更ファイル一覧

| ファイル                                                           | 変更種別                       |
| ------------------------------------------------------------------ | ------------------------------ |
| `packages/shared/src/types/skillCreator.ts`                        | 型+関数追加（+80行）           |
| `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx` | handleGenerate修正（+2行）     |
| `apps/desktop/src/renderer/store/slices/agentSlice.ts`             | createSkill型+実装拡張（+4行） |
| `apps/desktop/src/preload/skill-api.ts`                            | create型+実装拡張（+5行）      |
| `apps/desktop/src/main/ipc/skillHandlers.ts`                       | IPCハンドラ拡張（+14行）       |

### テスト追加

| ファイル                                 | 件数     |
| ---------------------------------------- | -------- |
| `buildSkillContext.test.ts`              | 12件     |
| `buildSkillContext.edge.test.ts`         | 14件     |
| `agentSlice.createSkill.context.test.ts` | 5件      |
| `skillHandlers.create.context.test.ts`   | 3件      |
| **合計**                                 | **34件** |

## Phase 11 証跡参照

今回の修正は Q1〜Q6 回答の受け渡し経路追加であり、UI の見た目自体は変更していない。
そのため Phase 11 は `NON_VISUAL` とし、スクリーンショットではなく単体テストと差分確認を代替証跡にする。

### 参照する証跡

- `outputs/phase-11/manual-test-checklist.md`
- `outputs/phase-11/manual-test-result.md`
- `outputs/phase-11/discovered-issues.md`

### 補足

- `outputs/phase-11/screenshots/` は対象外であり、新規取得は不要
- Phase 11 の判定は「代替テスト済み」であり、Q1〜Q6 の反映自体はテストとコード差分確認で担保する
- `phase-11-manual-test.md` の `TC-11-NONVISUAL-01` から `TC-11-NONVISUAL-03` が Phase 11 の確認単位になる
