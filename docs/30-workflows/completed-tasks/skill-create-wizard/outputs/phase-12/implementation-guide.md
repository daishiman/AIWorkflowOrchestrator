# SkillCreateWizard 実装ガイド

## メタ情報

| 項目     | 値                  |
| -------- | ------------------- |
| タスクID | TASK-10A-C          |
| 機能名   | skill-create-wizard |
| 作成日   | 2026-03-03          |
| Phase    | 12                  |

---

## Part 1: 中学生レベル概念説明

### ウィザードとは「料理のレシピ本」

ウィザードとは、難しい作業を一歩ずつ進められる仕組みです。料理のレシピ本と同じで、一度に全部やるのは大変でも、一ページずつ順番に進めば誰でも完成させられます。

**ステップ1（describe）: 「何を作りたいか書く」**

レストランで注文するとき、「カレーが食べたい」と伝えるのと同じ。AIに「こんなスキルが欲しい」と自然言語で説明します。

**ステップ2（configure）: 「オプションを選ぶ」**

カレーを注文するとき「辛さは？トッピングは？」と聞かれるのと同じ。タスクの自動生成やエージェントの追加など、オプションを選びます。

**ステップ3（generate）: 「料理を待つ」**

注文した後、厨房で料理が作られるのを待つのと同じ。AIがスキルを自動生成するのをスピナー（ぐるぐるマーク）を見ながら待ちます。

**ステップ4（complete）: 「料理が届く」**

完成した料理がテーブルに届くのと同じ。生成されたスキルの保存先が表示されます。

### データの流れ（中学校の文化祭に例えると）

```
[ユーザー] → [画面（Renderer）] → [受付窓口（Preload）] → [裏方（Main Process）]

文化祭の模擬店で例えると:
- お客さん（ユーザー）が注文票に書く
- 接客係（Renderer）が注文を受け取る
- 受付窓口（Preload）が注文票を厨房に渡す
- 調理係（Main Process）が実際に料理する
```

これが Electron の「3プロセスモデル」です。セキュリティのために、お客さんが直接厨房に入ることはできません。必ず受付窓口を通します。

---

## Part 2: 開発者向け実装詳細

### ファイル構成

```
apps/desktop/src/renderer/components/skill/
├── SkillCreateWizard.tsx          # 統合コンポーネント（88行）
├── hooks/
│   └── useWizardStep.ts           # ステップ管理カスタムフック（46行）
├── wizard/
│   ├── index.ts                   # バレルエクスポート
│   ├── StepIndicator.tsx          # 進捗インジケーター（61行）
│   ├── DescribeStep.tsx           # 説明入力ステップ（47行）
│   ├── ConfigureStep.tsx          # 設定ステップ（80行）
│   ├── GenerateStep.tsx           # 生成中ステップ（36行）
│   └── CompleteStep.tsx           # 完了ステップ（36行）
├── __tests__/
│   ├── SkillCreateWizard.test.tsx # 統合テスト（19テスト）
│   └── useWizardStep.test.ts      # フックテスト（7テスト）
└── wizard/__tests__/
    ├── StepIndicator.test.tsx     # 11テスト
    ├── DescribeStep.test.tsx      # 16テスト
    ├── ConfigureStep.test.tsx     # 11テスト
    ├── GenerateStep.test.tsx      # 9テスト
    └── CompleteStep.test.tsx      # 8テスト
```

### アーキテクチャ

#### コンポーネント階層

```
SkillCreateWizard（統合 organism）
├── useWizardStep（ステップ管理フック）
├── StepIndicator（進捗表示 molecule）
├── DescribeStep（Step 0: 説明入力 molecule）
├── ConfigureStep（Step 1: 設定 molecule）
├── GenerateStep（Step 2: 生成中 molecule）
└── CompleteStep（Step 3: 完了 molecule）
```

#### 状態管理

| 状態           | 型               | 管理場所            | 用途                   |
| -------------- | ---------------- | ------------------- | ---------------------- |
| `currentStep`  | `number`         | `useWizardStep`     | 現在のステップ番号     |
| `description`  | `string`         | `SkillCreateWizard` | ユーザーのスキル説明   |
| `options`      | `WizardOptions`  | `SkillCreateWizard` | 生成オプション         |
| `isGenerating` | `boolean`        | `SkillCreateWizard` | IPC呼び出し中フラグ    |
| `error`        | `Error \| null`  | `SkillCreateWizard` | エラー状態             |
| `skillPath`    | `string \| null` | `SkillCreateWizard` | 生成されたスキルのパス |

全て `useState` によるコンポーネントローカル状態（03-state-management.md 準拠）。

#### IPC フロー

```
[Renderer]                  [Preload]                     [Main Process]
SkillCreateWizard           skill-api.ts                  skillHandlers.ts
     │                           │                              │
     │ window.electronAPI        │                              │
     │   .skill.create()         │                              │
     │ ────────────────────────> │                              │
     │                           │ safeInvoke(                  │
     │                           │   IPC_CHANNELS.SKILL_CREATE, │
     │                           │   description, options)      │
     │                           │ ─────────────────────────>   │
     │                           │                              │ validateIpcSender()
     │                           │                              │ P42 3段バリデーション
     │                           │                              │ skillCreatorService
     │                           │                              │   .createSkill()
     │                           │          { path: string }    │
     │                           │ <─────────────────────────   │
     │      { path: string }     │                              │
     │ <──────────────────────── │                              │
     │                           │                              │
```

### 生成オプションの反映

| オプション      | 反映先                                 | 挙動                                                     |
| --------------- | -------------------------------------- | -------------------------------------------------------- |
| `generateTasks` | `SkillCreatorService.createSkill()`    | `CreateSkillOptions.generateTasks` として委譲            |
| `addAgents`     | `SkillService.createSkillFromWizard()` | 生成後に `agents/README.md` を初期化（未作成時のみ）     |
| `addReferences` | `SkillService.createSkillFromWizard()` | 生成後に `references/README.md` を初期化（未作成時のみ） |

### 主要インターフェース

```typescript
// ウィザード本体 Props
export interface SkillCreateWizardProps {
  onClose: () => void;
}

// 生成オプション
export interface WizardOptions {
  generateTasks: boolean;
  addAgents: boolean;
  addReferences: boolean;
}

// ステップ管理フック戻り値
export interface UseWizardStepReturn {
  currentStep: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  goNext: () => void;
  goBack: () => void;
  goToStep: (step: number) => void;
}
```

### セキュリティ実装

| 項目               | 実装                                                             | 準拠ルール  |
| ------------------ | ---------------------------------------------------------------- | ----------- |
| チャンネル名       | `IPC_CHANNELS.SKILL_CREATE` 定数                                 | P27         |
| 送信元検証         | `validateIpcSender(event, logger, { ... })`                      | 04-security |
| 引数バリデーション | `typeof description !== "string" \|\| description.trim() === ""` | P42         |
| エラーサニタイズ   | `sanitizeErrorMessage(error)`                                    | 04-security |

### テスト設計

| ファイル                   | テスト数 | カバレッジ | 主要テスト内容                   |
| -------------------------- | -------- | ---------- | -------------------------------- |
| SkillCreateWizard.test.tsx | 19       | 100%       | 統合フロー、IPC、バリデーション  |
| useWizardStep.test.ts      | 7        | 100%       | goNext/goBack/goToStep 境界値    |
| StepIndicator.test.tsx     | 11       | 100%       | 状態表示、アクセシビリティ       |
| DescribeStep.test.tsx      | 16       | 100%       | バリデーション、境界値、状態保持 |
| ConfigureStep.test.tsx     | 11       | 100%       | チェックボックス組み合わせ       |
| GenerateStep.test.tsx      | 9        | 100%       | スピナー、エラー表示、aria-live  |
| CompleteStep.test.tsx      | 8        | 100%       | パス表示パターン、特殊文字       |
| **合計**                   | **81**   | **100%**   |                                  |

### アクセシビリティ

| 要素             | ARIA 属性                         | 用途                           |
| ---------------- | --------------------------------- | ------------------------------ |
| StepIndicator    | `role="navigation"`, `aria-label` | ナビゲーションランドマーク     |
| 各ステップ       | `aria-current="step"`             | 現在位置の通知                 |
| スピナー         | `role="status"`                   | 状態変化の通知                 |
| 生成中エリア     | `aria-live="polite"`              | 動的コンテンツの通知           |
| 説明ラベル       | `htmlFor` + `id`                  | ラベルとフォーム要素の関連付け |
| sr-only テキスト | `className="sr-only"`             | スクリーンリーダー向け説明     |

### 拡張ポイント

1. **TASK-10A-D**: SkillManagementPanel への統合（モーダル表示）
2. **将来**: Step 2 のオプション追加（モデル選択、テンプレート選択等）
3. **将来**: Step 3 のプログレスバー表示（ストリーミング対応）
