# SkillCreateWizard コンポーネントドキュメント

## メタ情報

| 項目     | 値                  |
| -------- | ------------------- |
| タスクID | TASK-10A-C          |
| 機能名   | skill-create-wizard |
| 作成日   | 2026-03-03          |
| Phase    | 12                  |

---

## コンポーネント一覧

### SkillCreateWizard（organism）

| 項目   | 値                                                                 |
| ------ | ------------------------------------------------------------------ |
| パス   | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx` |
| 行数   | 88                                                                 |
| 責務   | 4ステップウィザードの統合管理                                      |
| Props  | `SkillCreateWizardProps { onClose: () => void }`                   |
| 状態   | description, options, isGenerating, error, skillPath               |
| IPC    | `window.electronAPI.skill.create()`                                |
| テスト | 19テスト、100%カバレッジ                                           |

### StepIndicator（molecule）

| 項目         | 値                                                                    |
| ------------ | --------------------------------------------------------------------- |
| パス         | `apps/desktop/src/renderer/components/skill/wizard/StepIndicator.tsx` |
| 行数         | 61                                                                    |
| 責務         | ウィザード進捗の視覚的表示                                            |
| Props        | `StepIndicatorProps { steps: string[]; currentStep: number }`         |
| エクスポート | `stepStateStyles` Record（P47準拠）、`StepState` 型                   |
| ARIA         | `role="navigation"`, `aria-label`, `aria-current="step"`, `sr-only`   |
| テスト       | 11テスト、100%カバレッジ                                              |

### DescribeStep（molecule）

| 項目           | 値                                                                   |
| -------------- | -------------------------------------------------------------------- |
| パス           | `apps/desktop/src/renderer/components/skill/wizard/DescribeStep.tsx` |
| 行数           | 47                                                                   |
| 責務           | スキル説明のテキスト入力                                             |
| Props          | `DescribeStepProps { description, onDescriptionChange, onNext }`     |
| バリデーション | `description.trim().length > 0` で「次へ」ボタンの有効/無効を制御    |
| ARIA           | `htmlFor="skill-description"` + `id` 関連付け                        |
| テスト         | 16テスト、100%カバレッジ                                             |

### ConfigureStep（molecule）

| 項目         | 値                                                                    |
| ------------ | --------------------------------------------------------------------- |
| パス         | `apps/desktop/src/renderer/components/skill/wizard/ConfigureStep.tsx` |
| 行数         | 80                                                                    |
| 責務         | 生成オプションの設定                                                  |
| Props        | `ConfigureStepProps { options, onOptionsChange, onBack, onGenerate }` |
| エクスポート | `WizardOptions` 型                                                    |
| テスト       | 11テスト、100%カバレッジ                                              |

**WizardOptions:**

```typescript
interface WizardOptions {
  generateTasks: boolean; // タスク生成（デフォルト: true）
  addAgents: boolean; // エージェント追加（デフォルト: false）
  addReferences: boolean; // 参照追加（デフォルト: false）
}
```

### GenerateStep（molecule）

| 項目   | 値                                                                   |
| ------ | -------------------------------------------------------------------- |
| パス   | `apps/desktop/src/renderer/components/skill/wizard/GenerateStep.tsx` |
| 行数   | 36                                                                   |
| 責務   | 生成中のローディング表示とエラー表示                                 |
| Props  | `GenerateStepProps { isGenerating: boolean; error: Error \| null }`  |
| ARIA   | `role="status"`, `aria-live="polite"`                                |
| テスト | 9テスト、100%カバレッジ                                              |

### CompleteStep（molecule）

| 項目   | 値                                                                     |
| ------ | ---------------------------------------------------------------------- |
| パス   | `apps/desktop/src/renderer/components/skill/wizard/CompleteStep.tsx`   |
| 行数   | 36                                                                     |
| 責務   | 生成完了の結果表示と閉じる操作                                         |
| Props  | `CompleteStepProps { skillPath: string \| null; onClose: () => void }` |
| テスト | 8テスト、100%カバレッジ                                                |

### useWizardStep（カスタムフック）

| 項目   | 値                                                                                       |
| ------ | ---------------------------------------------------------------------------------------- |
| パス   | `apps/desktop/src/renderer/components/skill/hooks/useWizardStep.ts`                      |
| 行数   | 46                                                                                       |
| 責務   | ステップ番号の管理（進む/戻る/ジャンプ）                                                 |
| 引数   | `totalSteps: number`                                                                     |
| 戻り値 | `UseWizardStepReturn { currentStep, isFirstStep, isLastStep, goNext, goBack, goToStep }` |
| テスト | 7テスト、100%カバレッジ                                                                  |

---

## IPC ドキュメント

### skill:create チャンネル

| 項目         | 値                                            |
| ------------ | --------------------------------------------- |
| チャンネル名 | `skill:create`                                |
| 定数         | `IPC_CHANNELS.SKILL_CREATE`                   |
| 方向         | Renderer → Main（invoke/handle）              |
| ハンドラ     | `skillHandlers.ts` 内 `registerSkillHandlers` |

**引数:**

| 引数          | 型              | 必須 | バリデーション                            |
| ------------- | --------------- | ---- | ----------------------------------------- |
| `description` | `string`        | Yes  | P42 3段: typeof → === "" → .trim() === "" |
| `options`     | `WizardOptions` | No   | オブジェクトの各プロパティは boolean      |

**戻り値:**

```typescript
{
  path: string;
} // 生成されたスキルのファイルパス
```

**エラー:**

```typescript
{
  code: string;
  message: string;
} // sanitizeErrorMessage() 経由
```

---

## テストサマリ

| 指標                 | 値                              |
| -------------------- | ------------------------------- |
| 総テスト数           | 81                              |
| PASS                 | 81                              |
| FAIL                 | 0                               |
| カバレッジ           | 100%                            |
| テストフレームワーク | Vitest + @testing-library/react |
| DOM 環境             | happy-dom                       |
| イベント手法         | fireEvent（P39準拠）            |
