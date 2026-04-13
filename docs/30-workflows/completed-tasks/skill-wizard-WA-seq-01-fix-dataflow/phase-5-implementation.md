# Phase 5: 実装

## メタ情報

| 項目       | 内容                                                        |
| ---------- | ----------------------------------------------------------- |
| Phase      | 5                                                           |
| タスクID   | TASK-SW-FIX-DATAFLOW-001                                    |
| 機能名     | Step 1回答→スキル生成連携（Q1〜Q6コンテキストブリッジ実装） |
| タスク種別 | implementation                                              |
| 前提Phase  | Phase 4（テスト作成完了・Red 確認済み）                     |
| 後続Phase  | Phase 6                                                     |
| 作成日     | 2026-04-12                                                  |
| ステータス | pending                                                     |

## 目的

Phase 2 の設計に基づき、`SkillCreationContext` 型追加・`buildSkillContext()` 実装・`createSkill` シグネチャ拡張・IPC ハンドラ拡張を実施し、TC-01〜TC-10 を Green にする。

## 実装タスク一覧

| タスク | 対象ファイル                                | 変更内容                                       | 依存タスク   |
| ------ | ------------------------------------------- | ---------------------------------------------- | ------------ |
| T-1    | `packages/shared/src/types/skillCreator.ts` | `SkillCreationContext` インターフェース追加    | なし（先行） |
| T-2    | `SkillCreateWizard.tsx`                     | `buildSkillContext()` 関数追加                 | T-1 完了後   |
| T-3    | `SkillCreateWizard.tsx`                     | `handleGenerate` の `createSkill` 呼び出し修正 | T-2 完了後   |
| T-4    | `agentSlice.ts`                             | `createSkill` Thunk シグネチャ拡張             | T-1 完了後   |
| T-5    | `skillHandler.ts`                           | `buildSkillGenerationPrompt()` 追加            | T-1 完了後   |
| T-6    | `skillHandler.ts`                           | IPC ハンドラを `context` 受け取り対応に修正    | T-5 完了後   |

## 変更ファイルと変更内容の詳細

### T-1: packages/shared/src/types/skillCreator.ts

**変更内容**: `SkillCreationContext` インターフェースを追加する。

```typescript
/**
 * SkillCreateWizard Step 1 で収集された情報をスキル生成に渡すコンテキスト型。
 * 全フィールドを optional とし、既存の createSkill 呼び出しとの後方互換を維持する。
 */
export interface SkillCreationContext {
  /** スキルの表示名（formData.skillName） */
  skillName?: string;
  /** スキルのカテゴリ（formData.category） */
  category?: string;
  /** スキルの目的記述（formData.purpose） */
  purpose?: string;
  /** Q1: スキルの主な目的・用途 */
  q1Purpose?: string;
  /** Q2: 対象ユーザーまたは使用シーン */
  q2Target?: string;
  /** Q3: 使用するツール・サービス */
  q3Tools?: string;
  /** Q4: 実行タイミング・頻度 */
  q4Timing?: string;
  /** Q5: 期待するアウトプット・成果物 */
  q5Output?: string;
  /** Q6: 制約事項・禁止事項 */
  q6Constraints?: string;
}
```

### T-2: apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx — buildSkillContext 追加

**変更内容**: `buildSkillContext()` pure function を追加する。

```typescript
import type { SkillCreationContext } from "@repo/shared/types/skillCreator";

/**
 * ウィザードのフォームデータとQ1〜Q6回答を SkillCreationContext に変換する。
 * pure function。副作用なし。空文字は undefined に正規化する。
 */
export function buildSkillContext(
  formData: SkillFormData,
  answers: WizardAnswers,
): SkillCreationContext {
  return {
    skillName: formData.skillName || undefined,
    category: formData.category || undefined,
    purpose: formData.purpose || undefined,
    q1Purpose: answers.q1 || undefined,
    q2Target: answers.q2 || undefined,
    q3Tools: answers.q3 || undefined,
    q4Timing: answers.q4 || undefined,
    q5Output: answers.q5 || undefined,
    q6Constraints: answers.q6 || undefined,
  };
}
```

### T-3: apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx — handleGenerate 修正

**変更前（L553 付近）:**

```typescript
const handleGenerate = async () => {
  await dispatch(createSkill(formData.purpose, SKILL_GENERATION_OPTIONS));
};
```

**変更後:**

```typescript
const handleGenerate = async () => {
  const context = buildSkillContext(formData, answers);
  await dispatch(createSkill({ context, options: SKILL_GENERATION_OPTIONS }));
};
```

### T-4: apps/desktop/src/renderer/store/slices/agentSlice.ts — createSkill シグネチャ拡張

**変更内容**: Thunk の引数型を `{ context: SkillCreationContext; options?: SkillGenerationOptions }` に拡張する。

```typescript
import type { SkillCreationContext } from "@repo/shared/types/skillCreator";

export const createSkill = createAsyncThunk(
  "agent/createSkill",
  async ({
    context,
    options,
  }: {
    context: SkillCreationContext;
    options?: SkillGenerationOptions;
  }) => {
    return await window.api.skill.create(context, options);
  },
);
```

### T-5 & T-6: apps/desktop/src/main/ipc/handlers/skillHandler.ts — プロンプト組み込み

**変更内容**: `buildSkillGenerationPrompt()` を追加し、IPC ハンドラで呼び出す。

```typescript
import type { SkillCreationContext } from "@repo/shared/types/skillCreator";

/**
 * SkillCreationContext の各フィールドをスキル生成プロンプト文字列に変換する。
 * undefined フィールドはプロンプトに含まない。
 */
function buildSkillGenerationPrompt(context: SkillCreationContext): string {
  const parts: string[] = [];

  if (context.skillName) {
    parts.push(`スキル名: ${context.skillName}`);
  }
  if (context.category) {
    parts.push(`カテゴリ: ${context.category}`);
  }
  if (context.q1Purpose || context.purpose) {
    parts.push(`目的・用途: ${context.q1Purpose ?? context.purpose}`);
  }
  if (context.q2Target) {
    parts.push(`対象ユーザー・使用シーン: ${context.q2Target}`);
  }
  if (context.q3Tools) {
    parts.push(`使用ツール・サービス: ${context.q3Tools}`);
  }
  if (context.q4Timing) {
    parts.push(`実行タイミング・頻度: ${context.q4Timing}`);
  }
  if (context.q5Output) {
    parts.push(`期待するアウトプット: ${context.q5Output}`);
  }
  if (context.q6Constraints) {
    parts.push(`制約・禁止事項: ${context.q6Constraints}`);
  }

  return parts.join("\n");
}

// IPC ハンドラ修正
ipcMain.handle(
  "skill:create",
  async (
    _event,
    context: SkillCreationContext,
    options?: SkillGenerationOptions,
  ) => {
    const prompt = buildSkillGenerationPrompt(context);
    // ... 既存の LLM API 呼び出しに prompt を渡す
  },
);
```

## 実装順序（依存関係）

```
T-1（型追加）
  ├─→ T-2（buildSkillContext 追加）
  │     └─→ T-3（handleGenerate 修正）
  ├─→ T-4（createSkill シグネチャ拡張）
  └─→ T-5（buildSkillGenerationPrompt 追加）
        └─→ T-6（IPC ハンドラ修正）
```

**推奨実装順**: T-1 → T-2 → T-3 → T-4 → T-5 → T-6

T-1 完了後に `pnpm --filter @repo/shared build` を実行し、型が他パッケージから参照可能なことを確認してから後続タスクに進む。

## 実装完了チェックリスト

- [ ] T-1: `SkillCreationContext` 型が `packages/shared` に追加されていること
- [ ] T-2: `buildSkillContext()` が pure function として実装されていること
- [ ] T-3: `handleGenerate` が `buildSkillContext()` を呼び context を渡していること
- [ ] T-4: `createSkill` Thunk が `SkillCreationContext` を受け取るシグネチャになっていること
- [ ] T-5・T-6: IPC ハンドラが context をプロンプトに組み込んでいること
- [ ] TC-01〜TC-10 が全件 Green（PASS）であること
- [ ] 既存テストへの回帰影響がゼロであること

## 参照資料

| 資料名               | パス                                      | 用途             |
| -------------------- | ----------------------------------------- | ---------------- |
| Phase 4 テストケース | `outputs/phase-4/test-cases.md`           | 実装後の検証対象 |
| Phase 2 設計書       | `outputs/phase-2/design-spec.md`          | 実装の設計根拠   |
| Phase 3 レビュー結果 | `outputs/phase-3/design-review-report.md` | 設計確定内容確認 |

## 成果物

| 成果物       | パス                                       | 説明                        |
| ------------ | ------------------------------------------ | --------------------------- |
| 実装記録書   | `outputs/phase-5/implementation-record.md` | 変更内容・Before/After 記録 |
| 変更ファイル | `outputs/phase-5/changed-files.md`         | 差分サマリ・影響範囲        |

## 完了条件

- [ ] 変更ファイル一覧（T-1〜T-6）が全件変更完了していること
- [ ] TC-01〜TC-10 が Green（PASS）であること
- [ ] 既存テストへの回帰影響がゼロであること
- [ ] 実装記録書（Before/After）が作成されていること
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 6: テスト拡充
