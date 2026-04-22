# Phase 2: 設計書

## createSkill 契約設計

### 変更後シグネチャ

```typescript
// 型定義（agentSlice.ts L369付近）
createSkill: (
  description: string,
  options: {
    generateTasks: boolean;
    addAgents: boolean;
    addReferences: boolean;
  },
  context?: SkillCreationContext,
  signal?: AbortSignal, // ← 追加
) => Promise<string>;

// 実装（agentSlice.ts L1200付近）
createSkill: async (
  description: string,
  options: {
    generateTasks: boolean;
    addAgents: boolean;
    addReferences: boolean;
  },
  context?: SkillCreationContext,
  signal?: AbortSignal, // ← 追加
) => {
  if (typeof description !== "string" || description.trim() === "") {
    set({ skillError: "スキルの説明が無効です" });
    return "";
  }
  if (signal?.aborted) return ""; // ← IPC 呼び出し前の early return guard
  // 以降は既存処理を維持
  const result = await window.electronAPI.skill.create({
    description: description.trim(),
    options,
    context, // ← signal は IPC に含めない
  });
  // ...
};
```

### 設計方針

1. `signal` は Renderer 内の制御値としてのみ扱う
2. `signal?.aborted === true` の場合は IPC 呼び出し前に `""` を返す
3. `window.electronAPI.skill.create()` の引数 shape は変更しない（`{ description, options, context }`）

## SkillCreateWizard 受け渡し設計

```typescript
// SkillCreateWizard.tsx handleGenerate L467付近
// Before:
startGeneration(); // 戻り値を捨てていた

// After:
const signal = startGeneration(); // AbortSignal を受け取る

// createSkill 呼び出し L487付近
// Before:
const path = await createSkill(
  formData.purpose,
  SKILL_GENERATION_OPTIONS,
  skillContext,
);

// After:
const path = await createSkill(
  formData.purpose,
  SKILL_GENERATION_OPTIONS,
  skillContext,
  signal,
);
```

## 代替案比較

| 案  | 内容                             | 判定                                                                                  |
| --- | -------------------------------- | ------------------------------------------------------------------------------------- |
| A   | IPC に `signal` を含める         | **不採用**（AbortSignal はシリアライズ不可。structuredClone 非対応）                  |
| B   | Renderer guard + 既存 cancel IPC | **採用**（Renderer 側で aborted チェック、Main 側は既存 cancelGeneration IPC が担当） |
| C   | token/correlation-id 新設        | **今回は未採用**（将来の拡張候補。IPC 跨ぎのキャンセル追跡が必要になったとき）        |

## validation matrix

| 検証項目            | コマンド                                                         | 合格基準     |
| ------------------- | ---------------------------------------------------------------- | ------------ |
| typecheck           | `pnpm --filter @repo/desktop typecheck`                          | エラーゼロ   |
| lint                | `pnpm --filter @repo/desktop lint`                               | エラーゼロ   |
| focused test        | `pnpm --filter @repo/desktop test agentSlice.createSkill.signal` | PASS         |
| regression          | `pnpm --filter @repo/desktop test`                               | 全 PASS      |
| Phase 11 NON_VISUAL | テスト実行ログ + 型定義確認                                      | 証跡記録あり |
