# TASK-10A-C: API仕様

## IPC チャネル仕様

### skill:create

| 項目       | 値                        |
| ---------- | ------------------------- |
| チャネル名 | skill:create              |
| 定数名     | IPC_CHANNELS.SKILL_CREATE |
| 方向       | Renderer → Main           |
| 認証       | validateIpcSender         |

### Request 引数

Preload の safeInvoke 経由で2引数を送信:

```typescript
safeInvoke(IPC_CHANNELS.SKILL_CREATE, description, options);
```

| 引数        | 型                                                                     | 必須 | バリデーション                         |
| ----------- | ---------------------------------------------------------------------- | ---- | -------------------------------------- |
| description | string                                                                 | Yes  | P42: typeof check → empty → trim empty |
| options     | { generateTasks: boolean; addAgents: boolean; addReferences: boolean } | Yes  | オブジェクト型チェック                 |

### Response

```typescript
{
  path: string;
} // 生成されたスキルのパス
```

### エラーレスポンス

| コード           | メッセージ                             | 条件                    |
| ---------------- | -------------------------------------- | ----------------------- |
| AUTH_ERROR       | Invalid IPC sender                     | 送信元検証失敗          |
| VALIDATION_ERROR | description must be a non-empty string | 空文字列 / スペースのみ |

## Preload API 仕様

### SkillAPI.create

```typescript
create: (params: {
  description: string;
  options: {
    generateTasks: boolean;
    addAgents: boolean;
    addReferences: boolean;
  };
}) => Promise<{ path: string }>;
```

## コンポーネント Props 仕様

### StepIndicatorProps

```typescript
{ steps: string[]; currentStep: number }
```

### DescribeStepProps

```typescript
{ description: string; onDescriptionChange: (value: string) => void; onNext: () => void }
```

### ConfigureStepProps

```typescript
{ options: WizardOptions; onOptionsChange: (options: WizardOptions) => void; onBack: () => void; onGenerate: () => void }
```

### GenerateStepProps

```typescript
{
  isGenerating: boolean;
  error: Error | null;
}
```

### CompleteStepProps

```typescript
{ skillPath: string | null; onClose: () => void }
```

### SkillCreateWizardProps

```typescript
{ onClose: () => void }
```
