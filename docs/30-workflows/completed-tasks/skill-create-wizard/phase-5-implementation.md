# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                |
| ---------- | ------------------- |
| Phase      | 5                   |
| Phase名    | 実装                |
| 前提Phase  | Phase 4             |
| 後続Phase  | Phase 6             |
| ステータス | 未実施              |
| 作成日     | 2026-03-03          |
| 機能名     | skill-create-wizard |
| タスクID   | TASK-10A-C          |

---

## 目的

TDDのGreen段階として、Phase 4で作成したテストを全て通す最小限の実装を行う。SkillCreateWizard メインコンポーネント・5つのサブコンポーネント・IPC ハンドラー・Preload API・型定義を実装する。

## 背景

テストが作成され、期待される動作が明確になった。TDDのプラクティスに従い、テストを通す最小限の実装を行う。設計（Phase 2）に忠実に実装し、過剰なコードを追加しない。

**実装優先順位**:

1. 型定義（Preload types）
2. IPC チャネル定数の追加
3. IPC ハンドラー（skillHandlers.ts への skill:create 追加）
4. Preload API（skill-api.ts への create() 追加）
5. サブコンポーネント（atoms→organisms の順）
6. メインウィザードコンポーネント

---

## 実行タスク

- 実装タスク: 型・IPC・Preload・UIコンポーネントを実装してGreen化する。

> 以下のタスクを順番に実行してください。

### タスク1: 型定義の更新

**目的**: SkillAPI 型に `create` メソッドを追加する（P32: 2箇所同時更新必須）

**実行手順**:

1. `apps/desktop/src/preload/types.ts` を確認し `SkillAPI` インターフェースに `create` を追加する:

```typescript
// apps/desktop/src/preload/types.ts の SkillAPI に追加
export interface SkillAPI {
  // 既存メソッド...
  create: (params: {
    description: string;
    options: {
      generateTasks: boolean;
      addAgents: boolean;
      addReferences: boolean;
    };
  }) => Promise<{ path: string }>;
}
```

2. `apps/desktop/src/preload/types.ts` の型宣言（`Window` interface の `electronAPI.skill`）も同様に更新されていることを確認する

**重要**:

- P32: 型定義は `preload/types.ts` の実装と型宣言の両方を同時に更新する
- P46: `HTMLAttributes` との衝突がある場合は `Omit` で解決する

**期待される成果物**:

- `apps/desktop/src/preload/types.ts`（更新）

---

### タスク2: IPC チャネル定数の追加

**目的**: `skill:create` チャネル定数をホワイトリストに追加する（P27対策）

**実行手順**:

1. `apps/desktop/src/preload/channels.ts` を確認し、`SKILL_CREATE` 定数を追加する:

```typescript
// apps/desktop/src/preload/channels.ts に追加
export const IPC_CHANNELS = {
  // 既存チャネル...
  SKILL_CREATE: "skill:create",
} as const;
```

**重要**: ハードコード文字列ではなく定数を使用すること（P27対策）

**期待される成果物**:

- `apps/desktop/src/preload/channels.ts`（更新）

---

### タスク3: IPC ハンドラーの追加

**目的**: `skill:create` IPC ハンドラーを skillHandlers.ts に追加する

**実行手順**:

1. `apps/desktop/src/main/ipc/skillHandlers.ts` を確認する
2. `skill:create` ハンドラーを追加する:

```typescript
// apps/desktop/src/main/ipc/skillHandlers.ts に追加
ipcMain.handle(
  IPC_CHANNELS.SKILL_CREATE,
  async (
    event: IpcMainInvokeEvent,
    description: string,
    options: {
      generateTasks: boolean;
      addAgents: boolean;
      addReferences: boolean;
    },
  ) => {
    if (!validateIpcSender(event.sender)) {
      throw { code: "AUTH_ERROR", message: "Invalid IPC sender" };
    }
    // P42: 3段バリデーション
    if (typeof description !== "string" || description.trim() === "") {
      throw {
        code: "VALIDATION_ERROR",
        message: "description must be a non-empty string",
      };
    }
    // SkillCreatorService.create() を呼び出す
    return skillCreatorService.create(description, options);
  },
);
```

**重要**:

- P42: 文字列引数に `.trim() === ""` チェックを含める（3段バリデーション）
- P44/P45: IPC引数の命名とセマンティクスを一致させる

**期待される成果物**:

- `apps/desktop/src/main/ipc/skillHandlers.ts`（更新）

---

### タスク4: Preload API の追加

**目的**: `skill.create()` メソッドを preload/skill-api.ts に追加する

**実行手順**:

1. `apps/desktop/src/preload/skill-api.ts` を確認する
2. `create()` メソッドを追加する:

```typescript
// apps/desktop/src/preload/skill-api.ts に追加
create: (params: {
  description: string;
  options: {
    generateTasks: boolean;
    addAgents: boolean;
    addReferences: boolean;
  };
}): Promise<{ path: string }> => {
  return safeInvoke(
    IPC_CHANNELS.SKILL_CREATE,
    params.description,
    params.options,
  );
},
```

**重要**: `safeInvoke` と `IPC_CHANNELS` 定数を使用すること（P26/P27対策）

**期待される成果物**:

- `apps/desktop/src/preload/skill-api.ts`（更新）

---

### タスク5: StepIndicator の実装

**目的**: ウィザードのステップ進捗表示コンポーネントを実装する

**実行手順**:

1. ファイルを作成する:
   - `apps/desktop/src/renderer/components/skill/wizard/StepIndicator.tsx`

```typescript
// apps/desktop/src/renderer/components/skill/wizard/StepIndicator.tsx
import React from "react";
import clsx from "clsx";

// P47: Record定数でバリアントスタイルを管理しexportする
export const stepStateStyles = {
  active: "bg-[var(--status-primary)] text-[var(--text-inverse)]",
  completed: "bg-[var(--status-success)] text-[var(--text-inverse)]",
  pending: "bg-[var(--bg-tertiary)] text-[var(--text-secondary)]",
} as const;

export type StepState = keyof typeof stepStateStyles;

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
}

export const StepIndicator = React.forwardRef<
  HTMLElement,
  StepIndicatorProps
>(({ steps, currentStep }, ref) => {
  return (
    <nav ref={ref} aria-label="ウィザードの進捗" className="flex items-center gap-2">
      {steps.map((label, index) => {
        const state: StepState =
          index === currentStep
            ? "active"
            : index < currentStep
              ? "completed"
              : "pending";

        return (
          <div
            key={index}
            aria-current={index === currentStep ? "step" : undefined}
            className={clsx(
              "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium",
              stepStateStyles[state],
            )}
          >
            <span className="sr-only">ステップ {index + 1}: </span>
            {index + 1}
          </div>
        );
      })}
    </nav>
  );
});

StepIndicator.displayName = "StepIndicator";
```

2. テストを実行して確認する:

```bash
cd apps/desktop
pnpm vitest run src/renderer/components/skill/wizard/__tests__/StepIndicator.test.tsx
```

**期待される成果物**:

- `apps/desktop/src/renderer/components/skill/wizard/StepIndicator.tsx`

---

### タスク6: DescribeStep の実装

**目的**: スキル説明入力ステップコンポーネントを実装する

**実行手順**:

1. ファイルを作成する:
   - `apps/desktop/src/renderer/components/skill/wizard/DescribeStep.tsx`

```typescript
// apps/desktop/src/renderer/components/skill/wizard/DescribeStep.tsx
import React from "react";

interface DescribeStepProps {
  description: string;
  onDescriptionChange: (value: string) => void;
  onNext: () => void;
}

export const DescribeStep = React.forwardRef<HTMLDivElement, DescribeStepProps>(
  ({ description, onDescriptionChange, onNext }, ref) => {
    const isValid = description.trim().length > 0;

    return (
      <div ref={ref} className="flex flex-col gap-4">
        <label htmlFor="skill-description" className="text-sm font-medium text-[var(--text-primary)]">
          スキルの説明
        </label>
        <textarea
          id="skill-description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="このスキルが何をするか自然言語で説明してください..."
          rows={6}
          className="w-full p-3 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] text-[var(--text-primary)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--status-primary)]"
        />
        <div className="flex justify-end">
          <button
            onClick={onNext}
            disabled={!isValid}
            className="px-4 py-2 rounded-lg bg-[var(--status-primary)] text-[var(--text-inverse)] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            次へ
          </button>
        </div>
      </div>
    );
  },
);

DescribeStep.displayName = "DescribeStep";
```

2. テストを実行して確認する:

```bash
cd apps/desktop
pnpm vitest run src/renderer/components/skill/wizard/__tests__/DescribeStep.test.tsx
```

**期待される成果物**:

- `apps/desktop/src/renderer/components/skill/wizard/DescribeStep.tsx`

---

### タスク7: ConfigureStep の実装

**目的**: スキル生成オプション設定ステップを実装する

**実行手順**:

1. ファイルを作成する:
   - `apps/desktop/src/renderer/components/skill/wizard/ConfigureStep.tsx`

```typescript
// apps/desktop/src/renderer/components/skill/wizard/ConfigureStep.tsx
import React from "react";

export interface WizardOptions {
  generateTasks: boolean;
  addAgents: boolean;
  addReferences: boolean;
}

interface ConfigureStepProps {
  options: WizardOptions;
  onOptionsChange: (options: WizardOptions) => void;
  onBack: () => void;
  onGenerate: () => void;
}

export const ConfigureStep = React.forwardRef<HTMLDivElement, ConfigureStepProps>(
  ({ options, onOptionsChange, onBack, onGenerate }, ref) => {
    const handleChange = (key: keyof WizardOptions) => (e: React.ChangeEvent<HTMLInputElement>) => {
      onOptionsChange({ ...options, [key]: e.target.checked });
    };

    return (
      <div ref={ref} className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={options.generateTasks}
              onChange={handleChange("generateTasks")}
              className="w-4 h-4"
            />
            <span className="text-sm text-[var(--text-primary)]">タスク生成</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={options.addAgents}
              onChange={handleChange("addAgents")}
              className="w-4 h-4"
            />
            <span className="text-sm text-[var(--text-primary)]">エージェント追加</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={options.addReferences}
              onChange={handleChange("addReferences")}
              className="w-4 h-4"
            />
            <span className="text-sm text-[var(--text-primary)]">参照追加</span>
          </label>
        </div>
        <div className="flex justify-between">
          <button
            onClick={onBack}
            className="px-4 py-2 rounded-lg border border-[var(--border-primary)] text-[var(--text-primary)]"
          >
            戻る
          </button>
          <button
            onClick={onGenerate}
            className="px-4 py-2 rounded-lg bg-[var(--status-primary)] text-[var(--text-inverse)]"
          >
            スキルを生成
          </button>
        </div>
      </div>
    );
  },
);

ConfigureStep.displayName = "ConfigureStep";
```

2. テストを実行して確認する:

```bash
cd apps/desktop
pnpm vitest run src/renderer/components/skill/wizard/__tests__/ConfigureStep.test.tsx
```

**期待される成果物**:

- `apps/desktop/src/renderer/components/skill/wizard/ConfigureStep.tsx`

---

### タスク8: GenerateStep の実装

**目的**: スキル生成中状態表示コンポーネントを実装する

**実行手順**:

1. ファイルを作成する:
   - `apps/desktop/src/renderer/components/skill/wizard/GenerateStep.tsx`

```typescript
// apps/desktop/src/renderer/components/skill/wizard/GenerateStep.tsx
import React from "react";

interface GenerateStepProps {
  isGenerating: boolean;
  error: Error | null;
}

export const GenerateStep = React.forwardRef<HTMLDivElement, GenerateStepProps>(
  ({ isGenerating, error }, ref) => {
    return (
      <div ref={ref} className="flex flex-col items-center gap-4 py-8">
        {isGenerating && (
          <div aria-live="polite" className="flex flex-col items-center gap-3">
            <div
              className="w-10 h-10 rounded-full border-4 border-[var(--status-primary)] border-t-transparent animate-spin"
              role="status"
            />
            <p className="text-sm text-[var(--text-secondary)]">生成中...</p>
          </div>
        )}
        {error && (
          <div className="text-[var(--status-error)] text-sm">
            {error.message || "スキル生成に失敗しました"}
          </div>
        )}
      </div>
    );
  },
);

GenerateStep.displayName = "GenerateStep";
```

2. テストを実行して確認する:

```bash
cd apps/desktop
pnpm vitest run src/renderer/components/skill/wizard/__tests__/GenerateStep.test.tsx
```

**期待される成果物**:

- `apps/desktop/src/renderer/components/skill/wizard/GenerateStep.tsx`

---

### タスク9: CompleteStep の実装

**目的**: スキル生成完了ステップコンポーネントを実装する

**実行手順**:

1. ファイルを作成する:
   - `apps/desktop/src/renderer/components/skill/wizard/CompleteStep.tsx`

```typescript
// apps/desktop/src/renderer/components/skill/wizard/CompleteStep.tsx
import React from "react";

interface CompleteStepProps {
  skillPath: string | null;
  onClose: () => void;
}

export const CompleteStep = React.forwardRef<HTMLDivElement, CompleteStepProps>(
  ({ skillPath, onClose }, ref) => {
    return (
      <div ref={ref} className="flex flex-col items-center gap-6 py-8">
        <p className="text-lg font-medium text-[var(--text-primary)]">
          スキルが作成されました
        </p>
        {skillPath && (
          <p className="text-sm text-[var(--text-secondary)] font-mono break-all">
            {skillPath}
          </p>
        )}
        <button
          onClick={onClose}
          className="px-6 py-2 rounded-lg bg-[var(--status-primary)] text-[var(--text-inverse)]"
        >
          閉じる
        </button>
      </div>
    );
  },
);

CompleteStep.displayName = "CompleteStep";
```

2. テストを実行して確認する:

```bash
cd apps/desktop
pnpm vitest run src/renderer/components/skill/wizard/__tests__/CompleteStep.test.tsx
```

**期待される成果物**:

- `apps/desktop/src/renderer/components/skill/wizard/CompleteStep.tsx`

---

### タスク10: wizard/index.ts の作成

**目的**: ウィザードサブコンポーネントのまとめexportを作成する

**実行手順**:

1. ファイルを作成する:
   - `apps/desktop/src/renderer/components/skill/wizard/index.ts`

```typescript
// apps/desktop/src/renderer/components/skill/wizard/index.ts
export { StepIndicator, stepStateStyles } from "./StepIndicator";
export { DescribeStep } from "./DescribeStep";
export { ConfigureStep } from "./ConfigureStep";
export type { WizardOptions } from "./ConfigureStep";
export { GenerateStep } from "./GenerateStep";
export { CompleteStep } from "./CompleteStep";
```

**期待される成果物**:

- `apps/desktop/src/renderer/components/skill/wizard/index.ts`

---

### タスク11: SkillCreateWizard メインコンポーネントの実装

**目的**: 4ステップウィザードのメインコンポーネントを実装する

**実行手順**:

1. ファイルを作成する:
   - `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`

```typescript
// apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx
import React, { useState } from "react";
import {
  StepIndicator,
  DescribeStep,
  ConfigureStep,
  GenerateStep,
  CompleteStep,
} from "./wizard";
import type { WizardOptions } from "./wizard";

const STEPS = ["説明入力", "設定", "生成", "完了"];

const DEFAULT_OPTIONS: WizardOptions = {
  generateTasks: true,
  addAgents: false,
  addReferences: false,
};

interface SkillCreateWizardProps {
  onClose: () => void;
}

export const SkillCreateWizard = React.forwardRef<
  HTMLDivElement,
  SkillCreateWizardProps
>(({ onClose }, ref) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState<WizardOptions>(DEFAULT_OPTIONS);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [skillPath, setSkillPath] = useState<string | null>(null);

  const handleGenerate = async () => {
    setCurrentStep(2);
    setIsGenerating(true);
    setError(null);
    try {
      const result = await window.electronAPI.skill.create({
        description,
        options,
      });
      setSkillPath(result.path);
      setCurrentStep(3);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("スキル生成に失敗しました"));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div ref={ref} className="flex flex-col gap-6 p-6">
      <StepIndicator steps={STEPS} currentStep={currentStep} />
      {currentStep === 0 && (
        <DescribeStep
          description={description}
          onDescriptionChange={setDescription}
          onNext={() => setCurrentStep(1)}
        />
      )}
      {currentStep === 1 && (
        <ConfigureStep
          options={options}
          onOptionsChange={setOptions}
          onBack={() => setCurrentStep(0)}
          onGenerate={handleGenerate}
        />
      )}
      {currentStep === 2 && (
        <GenerateStep isGenerating={isGenerating} error={error} />
      )}
      {currentStep === 3 && (
        <CompleteStep skillPath={skillPath} onClose={onClose} />
      )}
    </div>
  );
});

SkillCreateWizard.displayName = "SkillCreateWizard";
```

2. 統合テストを実行して確認する:

```bash
cd apps/desktop
pnpm vitest run src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx
```

**期待される成果物**:

- `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`

---

### タスク12: テスト実行確認（Green 状態）

**目的**: 全テストが成功状態（Green）であることを確認する

**実行手順**:

1. 全テストを実行する:

```bash
cd apps/desktop
pnpm vitest run src/renderer/components/skill/
```

2. 全テストが成功することを確認する

3. Green 状態確認レポートを作成する:
   - `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-5/implementation-summary.md`

4. 実装サマリーに以下を記載する:

```markdown
## Phase 5 実装サマリー

### 作成ファイル一覧

| ファイル                 | 内容             |
| ------------------------ | ---------------- |
| SkillCreateWizard.tsx    | メインウィザード |
| wizard/StepIndicator.tsx | ステップ進捗表示 |
| wizard/DescribeStep.tsx  | 説明入力ステップ |
| wizard/ConfigureStep.tsx | 設定ステップ     |
| wizard/GenerateStep.tsx  | 生成中表示       |
| wizard/CompleteStep.tsx  | 完了表示         |
| wizard/index.ts          | まとめexport     |

### 更新ファイル一覧

| ファイル                  | 変更内容           |
| ------------------------- | ------------------ |
| preload/types.ts          | SkillAPI に create |
| preload/channels.ts       | SKILL_CREATE 追加  |
| preload/skill-api.ts      | create() 追加      |
| main/ipc/skillHandlers.ts | skill:create 追加  |

### テスト結果

- テスト数: XX
- 成功: XX
- 失敗: 0
```

**期待される成果物**:

- `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-5/implementation-summary.md`

---

## 実行手順

1. Phase 2 の設計成果物と Phase 4 のテストファイルを確認する
2. 型定義を更新する: `apps/desktop/src/preload/types.ts` に SkillAPI.create 追加（P32: 2箇所同時更新）
3. IPC チャネル定数を追加する: `IPC_CHANNELS.SKILL_CREATE`（P27対策）
4. IPC ハンドラーを追加する: `apps/desktop/src/main/ipc/skillHandlers.ts` に `skill:create`（P42: 3段バリデーション）
5. Preload API を追加する: `apps/desktop/src/preload/skill-api.ts` に `create()` メソッド
6. サブコンポーネントを作成する: StepIndicator → DescribeStep → ConfigureStep → GenerateStep → CompleteStep
7. メインコンポーネント `SkillCreateWizard.tsx` を作成する
8. Phase 4 のテストを実行し、全件 PASS（Green）を確認する: `cd apps/desktop && pnpm vitest run src/renderer/components/skill/`
9. 実装サマリー（`outputs/phase-5/implementation-summary.md`）を作成する

---

## 参照資料

| 参照資料                 | パス                                                                                           | 内容                   |
| ------------------------ | ---------------------------------------------------------------------------------------------- | ---------------------- |
| Phase 2 設計             | `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-2/architecture-design.md` | 実装対象の設計         |
| Phase 2 API仕様          | `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-2/api-specification.md`   | IPC/Preload 契約仕様   |
| Phase 4 テスト           | `docs/30-workflows/completed-tasks/skill-create-wizard/phase-4-test-creation.md`               | テストファイルパス一覧 |
| Electron セキュリティ    | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                   | IPC セキュリティ       |
| 実装パターン集           | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`    | コンポーネントパターン |
| Agent SDK スキル仕様     | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`              | Skill API / 型定義契約 |
| IPC API 仕様             | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                           | `skill:create` 契約    |
| Preload セキュリティ仕様 | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                   | exposeInMainWorld 制約 |
| アーキテクチャ概要       | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                   | レイヤー責務の整合性   |
| 既存 Skill API           | `apps/desktop/src/preload/skill-api.ts`                                                        | 既存 API 実装          |
| 既存 skillHandlers       | `apps/desktop/src/main/ipc/skillHandlers.ts`                                                   | 既存ハンドラー実装     |
| SkillAnalysisView 参考   | `apps/desktop/src/renderer/components/skill/SkillAnalysisView.tsx`                             | コンポーネント参考実装 |

---

## 統合テスト連携

**Phase 5 での必須アクション**:

- [ ] IPC ハンドラーが正常に登録されることを確認
- [ ] Preload の `channels.ts` に `SKILL_CREATE` が追加されていることを確認
- [ ] 型定義が `preload/types.ts` に追加されていることを確認（P32）
- [ ] `safeInvoke` と `IPC_CHANNELS` 定数を使用していることを確認（P26/P27）

---

## 多角的チェック観点

- **P42**: `skillHandlers.ts` のバリデーションに `.trim() === ""` が含まれているか
- **P44/P45**: IPC 引数の命名と渡す値のセマンティクスが一致しているか
- **P32**: `types.ts` の型定義が実装と型宣言の両方で更新されているか
- **P27**: チャネル名がハードコード文字列でなく `IPC_CHANNELS` 定数経由か
- **P39**: テスト内で `fireEvent` を使用し `userEvent` を使っていないか
- **forwardRef + displayName**: 全コンポーネントに `displayName` が設定されているか
- **clsx**: クラス合成に `clsx` を使用しているか

---

## 成果物

| 成果物                   | パス                                                                                              | 内容              |
| ------------------------ | ------------------------------------------------------------------------------------------------- | ----------------- |
| SkillCreateWizard        | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                                | メインウィザード  |
| StepIndicator            | `apps/desktop/src/renderer/components/skill/wizard/StepIndicator.tsx`                             | ステップ進捗表示  |
| DescribeStep             | `apps/desktop/src/renderer/components/skill/wizard/DescribeStep.tsx`                              | 説明入力ステップ  |
| ConfigureStep            | `apps/desktop/src/renderer/components/skill/wizard/ConfigureStep.tsx`                             | 設定ステップ      |
| GenerateStep             | `apps/desktop/src/renderer/components/skill/wizard/GenerateStep.tsx`                              | 生成中表示        |
| CompleteStep             | `apps/desktop/src/renderer/components/skill/wizard/CompleteStep.tsx`                              | 完了表示          |
| wizard/index.ts          | `apps/desktop/src/renderer/components/skill/wizard/index.ts`                                      | まとめexport      |
| types.ts（更新）         | `apps/desktop/src/preload/types.ts`                                                               | SkillAPI 型拡張   |
| channels.ts（更新）      | `apps/desktop/src/preload/channels.ts`                                                            | SKILL_CREATE 追加 |
| skill-api.ts（更新）     | `apps/desktop/src/preload/skill-api.ts`                                                           | create() 追加     |
| skillHandlers.ts（更新） | `apps/desktop/src/main/ipc/skillHandlers.ts`                                                      | skill:create 追加 |
| 実装サマリー             | `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-5/implementation-summary.md` | Green 状態確認    |

---

## 完了条件

- [ ] 型定義が更新されている（`preload/types.ts`）
- [ ] IPC チャネル定数が追加されている（`preload/channels.ts`）
- [ ] IPC ハンドラーが実装されている（P42 バリデーション含む）
- [ ] Preload API が実装されている（P26/P27 対策済み）
- [ ] StepIndicator が実装されている
- [ ] DescribeStep が実装されている
- [ ] ConfigureStep が実装されている
- [ ] GenerateStep が実装されている
- [ ] CompleteStep が実装されている
- [ ] wizard/index.ts が作成されている
- [ ] SkillCreateWizard メインコンポーネントが実装されている
- [ ] 全テストが成功状態（Green）になっている

---

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスク（タスク1〜12）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物（コンポーネント7本 + 更新4本 + サマリー）が全て生成されていることを確認
- [ ] `pnpm typecheck` が通ることを確認
- [ ] artifacts.json の Phase 5 ステータスを更新

---

## サブタスク管理

Phase 5 完了後に以下を確認:

- `cd apps/desktop && pnpm vitest run src/renderer/components/skill` で全テストが PASS
- `pnpm typecheck` で型エラーがない
- `git diff --stat` で変更ファイルが成果物一覧と一致している

---

## 依存関係

- **前提**: Phase 4（テスト作成）が完了していること
- **後続**: Phase 6（テスト拡充）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/completed-tasks/skill-create-wizard/phase-6-test-expansion.md`
