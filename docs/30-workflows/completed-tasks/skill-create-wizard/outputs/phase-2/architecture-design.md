# TASK-10A-C: アーキテクチャ設計

## コンポーネントツリー

```
SkillCreateWizard (organisms)
├── StepIndicator (molecules)
├── DescribeStep (organisms)
├── ConfigureStep (organisms)
├── GenerateStep (organisms)
└── CompleteStep (organisms)
```

## 状態管理設計

ウィザードの状態は**コンポーネントローカル（useState）**で管理する。
理由: ウィザード状態はアプリ全体で共有する必要がなく、ウィザードのライフサイクルに閉じる。

| 状態         | 型             | 初期値                                                          | 管理方法 |
| ------------ | -------------- | --------------------------------------------------------------- | -------- |
| currentStep  | number         | 0                                                               | useState |
| description  | string         | ""                                                              | useState |
| options      | WizardOptions  | { generateTasks: true, addAgents: false, addReferences: false } | useState |
| isGenerating | boolean        | false                                                           | useState |
| error        | Error \| null  | null                                                            | useState |
| skillPath    | string \| null | null                                                            | useState |

## データフロー

```
User Input → DescribeStep → setDescription → state
User Input → ConfigureStep → setOptions → state
"スキルを生成" → handleGenerate() → window.electronAPI.skill.create() → IPC → Main Process
                                    → SkillCreatorService.create()
Success → setSkillPath() → setCurrentStep(3) → CompleteStep
Failure → setError() → GenerateStep (error表示)
```

## IPC 契約

### Request

- Channel: `skill:create` (IPC_CHANNELS.SKILL_CREATE)
- Args: description: string, options: { generateTasks: boolean, addAgents: boolean, addReferences: boolean }

### Response

- Success: { path: string }
- Failure: Error (サニタイズ済み)

### セキュリティ

- validateIpcSender: 送信元検証
- P42: 3段バリデーション（type → empty → trimmed empty）
- P27: IPC_CHANNELS 定数経由

## Atomic Design 分類

| コンポーネント    | 分類     | 根拠                                                |
| ----------------- | -------- | --------------------------------------------------- |
| StepIndicator     | molecule | 表示のみ、ステップ番号とスタイルを合成              |
| DescribeStep      | organism | textarea + button + ラベル + バリデーションロジック |
| ConfigureStep     | organism | 複数チェックボックス + 2ボタン + handleChange       |
| GenerateStep      | organism | ローディング + エラー表示 + aria-live               |
| CompleteStep      | organism | メッセージ + パス表示 + ボタン                      |
| SkillCreateWizard | organism | 全サブコンポーネント統合 + 状態管理                 |

## スタイリング戦略

- CSS変数デザイントークン（`var(--status-primary)` 等）
- Tailwind arbitrary values（`bg-[var(--status-primary)]`）
- P47: stepStateStyles を Record定数で export しテストから import
- clsx でクラス合成
