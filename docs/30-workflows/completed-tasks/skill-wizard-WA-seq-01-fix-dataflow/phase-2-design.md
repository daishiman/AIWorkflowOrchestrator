# Phase 2: 設計

## メタ情報

| 項目       | 内容                                                        |
| ---------- | ----------------------------------------------------------- |
| Phase      | 2                                                           |
| タスクID   | TASK-SW-FIX-DATAFLOW-001                                    |
| 機能名     | Step 1回答→スキル生成連携（Q1〜Q6コンテキストブリッジ実装） |
| タスク種別 | implementation                                              |
| 前提Phase  | Phase 1（要件定義完了）                                     |
| 後続Phase  | Phase 3                                                     |
| 作成日     | 2026-04-12                                                  |
| ステータス | pending                                                     |

## 設計概要

`buildSkillContext()` 変換関数を中心に、ウィザードのフォームデータ（`formData`）とQ1〜Q6回答（`answers`）を `SkillCreationContext` 型へブリッジするアーキテクチャを設計する。また、IPC 経路全体を通じて `context` が伝播する設計を確立する。

## コンポーネント設計（変更前後の比較）

### SkillCreateWizard.tsx — handleGenerate の変更

**変更前（問題のある実装）:**

```typescript
// L553 付近（現状）
const handleGenerate = async () => {
  await dispatch(createSkill(formData.purpose, SKILL_GENERATION_OPTIONS));
};
// answers（Q1〜Q6）・formData.skillName・formData.category が渡されない
```

**変更後（修正後）:**

```typescript
const handleGenerate = async () => {
  const context = buildSkillContext(formData, answers);
  await dispatch(createSkill(context, SKILL_GENERATION_OPTIONS));
};
```

### agentSlice.ts — createSkill シグネチャ拡張

**変更前:**

```typescript
export const createSkill = createAsyncThunk(
  "agent/createSkill",
  async (purpose: string, options: SkillGenerationOptions) => {
    return await window.api.skill.create(purpose, options);
  },
);
```

**変更後:**

```typescript
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

> **後方互換ポイント**: `context` の各フィールドは optional とし、`purpose` のみを渡す既存呼び出しをラップするアダプタを提供する。

## SkillCreationContext 型定義（TypeScript）

```typescript
// packages/shared/src/types/skillCreator.ts に追加

/**
 * SkillCreateWizard Step 1 で収集された情報をスキル生成に渡すコンテキスト型。
 * context フィールドは全て optional とし、既存の createSkill 呼び出しとの
 * 後方互換を維持する。
 */
export interface SkillCreationContext {
  /** スキルの表示名（formData.skillName） */
  skillName?: string;
  /** スキルのカテゴリ（formData.category） */
  category?: string;
  /** スキルの目的記述（formData.purpose / Q1の回答に相当） */
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

## buildSkillContext() の実装方針

```typescript
// apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx
// または apps/desktop/src/renderer/utils/skillContextBuilder.ts に配置

import type { SkillCreationContext } from "@repo/shared/types/skillCreator";
import type { SkillFormData } from "../types";
import type { WizardAnswers } from "../types";

/**
 * ウィザードのフォームデータとQ1〜Q6回答を SkillCreationContext に変換する。
 * pure function。副作用なし。
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

**設計方針:**

- 空文字・undefined は `undefined` に正規化し、プロンプトへの空行混入を防ぐ
- `formData.purpose` と `answers.q1` は概念的に重複する可能性があるため、両方を保持して IPC ハンドラ側で優先順位を決定する

## IPC API 拡張設計

### skillHandler.ts — プロンプト組み込み設計

```typescript
// apps/desktop/src/main/ipc/handlers/skillHandler.ts

ipcMain.handle(
  "skill:create",
  async (_event, context: SkillCreationContext, options) => {
    const prompt = buildSkillGenerationPrompt(context);
    // ... LLM 呼び出し
  },
);

function buildSkillGenerationPrompt(context: SkillCreationContext): string {
  const parts: string[] = [];

  if (context.skillName) {
    parts.push(`スキル名: ${context.skillName}`);
  }
  if (context.category) {
    parts.push(`カテゴリ: ${context.category}`);
  }
  if (context.purpose || context.q1Purpose) {
    parts.push(`目的: ${context.q1Purpose || context.purpose}`);
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
```

## ステップ間データフロー図

```
┌────────────────────────────────────────────────────────────────┐
│  SkillCreateWizard.tsx（Renderer）                              │
│                                                                  │
│  Step 1                                                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Q1〜Q6 回答 → answers: WizardAnswers                    │   │
│  │ スキル名入力 → formData.skillName                        │   │
│  │ カテゴリ選択 → formData.category                         │   │
│  │ 目的入力    → formData.purpose                           │   │
│  └─────────────────────────┬───────────────────────────────┘   │
│                             │                                    │
│  handleGenerate()           ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ buildSkillContext(formData, answers)                     │   │
│  │   → SkillCreationContext                                 │   │
│  └─────────────────────────┬───────────────────────────────┘   │
│                             │                                    │
│                             ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ dispatch(createSkill(context, OPTIONS))                  │   │
│  └─────────────────────────┬───────────────────────────────┘   │
└───────────────────────────-┼───────────────────────────────────┘
                              │  Redux Thunk
                              ▼
┌────────────────────────────────────────────────────────────────┐
│  agentSlice.ts（Redux）                                         │
│  createSkill Thunk: context → window.api.skill.create(context) │
└───────────────────────────-┬───────────────────────────────────┘
                              │  IPC（preload bridge）
                              ▼
┌────────────────────────────────────────────────────────────────┐
│  skillHandler.ts（Main Process）                                │
│  ipcMain.handle('skill:create', (context) => {                 │
│    buildSkillGenerationPrompt(context) → プロンプト文字列       │
│    → LLM API 呼び出し                                           │
│  })                                                             │
└────────────────────────────────────────────────────────────────┘
```

## 変更ファイル一覧

| ファイルパス                                                       | 変更種別 | 変更概要                                                               |
| ------------------------------------------------------------------ | -------- | ---------------------------------------------------------------------- |
| `packages/shared/src/types/skillCreator.ts`                        | 修正     | `SkillCreationContext` インターフェース追加                            |
| `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx` | 修正     | `buildSkillContext` 呼び出し追加・`handleGenerate` 修正                |
| `apps/desktop/src/renderer/store/slices/agentSlice.ts`             | 修正     | `createSkill` Thunk シグネチャに `context?: SkillCreationContext` 追加 |
| `apps/desktop/src/main/ipc/handlers/skillHandler.ts`               | 修正     | `buildSkillGenerationPrompt()` 追加・プロンプト組み込み                |

## 設計判断・トレードオフ

| 判断事項                                   | 採用案                               | 理由                                                             |
| ------------------------------------------ | ------------------------------------ | ---------------------------------------------------------------- |
| `buildSkillContext` の配置場所             | SkillCreateWizard.tsx 内または utils | 責務の明確化。再利用が必要になれば utils に移動可能              |
| `context` の全フィールドを optional とする | optional 採用                        | 既存呼び出しとの後方互換維持が最優先                             |
| `q1Purpose` と `purpose` の重複            | 両方を保持し IPC 側で優先順位決定    | フォームデータとウィザード回答の責務を分離するため               |
| プロンプト組み立てを Main に置く           | `buildSkillGenerationPrompt` を Main | Renderer はコンテキスト収集のみ。LLMプロンプト詳細は Main の責務 |

## 参照資料

| 資料名                 | パス                                          | 用途                 |
| ---------------------- | --------------------------------------------- | -------------------- |
| Phase 1 成果物         | `outputs/phase-1/`                            | 要件定義の参照       |
| SkillCreateWizard 実装 | `apps/desktop/src/renderer/components/skill/` | 現行実装の確認       |
| agentSlice 実装        | `apps/desktop/src/renderer/store/slices/`     | Thunk 現行実装の確認 |
| skillHandler 実装      | `apps/desktop/src/main/ipc/handlers/`         | IPC ハンドラ確認     |

## 成果物

| 成果物               | パス                                          | 説明                                  |
| -------------------- | --------------------------------------------- | ------------------------------------- |
| 設計仕様書           | `outputs/phase-2/design-spec.md`              | 変更内容・設計根拠の詳細              |
| 変更対象ファイル一覧 | `outputs/phase-2/change-target-files.md`      | 具体的な変更対象と diff 設計          |
| IPC API 拡張設計書   | `outputs/phase-2/ipc-api-extension-design.md` | `buildSkillGenerationPrompt` 詳細設計 |
| データフロー図       | `outputs/phase-2/dataflow-diagram.md`         | Step 1→生成の全データフロー図         |

## 完了条件

- [ ] `SkillCreationContext` 型の全フィールドが定義されていること
- [ ] `buildSkillContext()` の実装方針（引数・戻り値・変換ロジック）が確定していること
- [ ] `createSkill` シグネチャ変更の具体的な内容が記述されていること
- [ ] IPC ハンドラのプロンプト組み込み方針が確定していること
- [ ] データフロー図が作成されていること
- [ ] 後方互換性の担保方法が明示されていること
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 3: 設計レビュー
