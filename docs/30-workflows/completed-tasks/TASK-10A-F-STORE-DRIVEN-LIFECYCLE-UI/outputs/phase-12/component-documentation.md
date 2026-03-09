# TASK-10A-F コンポーネントドキュメント

## メタ情報

| 項目     | 値                       |
| -------- | ------------------------ |
| タスクID | TASK-10A-F               |
| Phase    | 12（コンポーネント文書） |
| 作成日   | 2026-03-09               |

---

## 1. useSkillAnalysis Hook

### 概要

スキル分析のビジネスロジックを管理するカスタムフック。Store action 経由で IPC 通信を行い、ローカル state でUI固有の状態を管理する。

### ファイルパス

`apps/desktop/src/renderer/components/skill/hooks/useSkillAnalysis.ts`

### API

```typescript
function useSkillAnalysis(skillName: string): UseSkillAnalysisReturn;
```

### 引数

| 名前        | 型       | 説明               |
| ----------- | -------- | ------------------ |
| `skillName` | `string` | 分析対象のスキル名 |

### 返却値: UseSkillAnalysisReturn

| プロパティ                | 型                          | 説明                                   |
| ------------------------- | --------------------------- | -------------------------------------- |
| `analysis`                | `SkillAnalysis \| null`     | 最新の分析結果（Store state）          |
| `isAnalyzing`             | `boolean`                   | 分析処理中フラグ（Store state）        |
| `isImproving`             | `boolean`                   | 改善適用処理中フラグ（Store state）    |
| `error`                   | `string \| null`            | スキルエラー情報（Store state）        |
| `selectedSuggestions`     | `Set<number>`               | 選択された提案インデックス（ローカル） |
| `improvementResult`       | `ImprovementResult \| null` | 改善適用結果（ローカル）               |
| `handleAnalyze`           | `() => Promise<void>`       | スキル分析を実行                       |
| `handleToggleSuggestion`  | `(index: number) => void`   | 提案の選択/解除をトグル                |
| `handleSelectAutoFixable` | `() => void`                | auto-fixable な提案のみを選択          |
| `handleApplySelected`     | `() => Promise<void>`       | 選択された提案を適用                   |
| `handleAutoImprove`       | `() => Promise<void>`       | 全自動改善を実行（確認ダイアログあり） |

### 依存する Store セレクタ

| セレクタ                      | 種別   |
| ----------------------------- | ------ |
| `useCurrentAnalysis()`        | state  |
| `useIsAnalyzingSkill()`       | state  |
| `useIsImprovingSkill()`       | state  |
| `useSkillError()`             | state  |
| `useAnalyzeSkill()`           | action |
| `useApplySkillImprovements()` | action |
| `useAutoImproveSkill()`       | action |

### 初期化動作

マウント時に `handleAnalyze` を自動実行し、分析結果を取得する。

---

## 2. SkillAnalysisView コンポーネント

### 概要

スキル分析結果を表示する View コンポーネント。ビジネスロジックは `useSkillAnalysis` に完全委譲し、レイアウト責務のみを持つ。

### ファイルパス

`apps/desktop/src/renderer/components/skill/SkillAnalysisView.tsx`

### API

```typescript
interface SkillAnalysisViewProps {
  /** 分析対象のスキル名 */
  skillName: string;
  /** 閉じるボタンのコールバック */
  onClose: () => void;
}

function SkillAnalysisView(props: SkillAnalysisViewProps): JSX.Element;
```

### Props

| 名前        | 型           | 必須 | 説明                     |
| ----------- | ------------ | ---- | ------------------------ |
| `skillName` | `string`     | YES  | 分析対象のスキル名       |
| `onClose`   | `() => void` | YES  | 閉じるボタン押下時の処理 |

### 表示状態の切り替え

| 条件                       | 表示内容                                   |
| -------------------------- | ------------------------------------------ |
| `isAnalyzing && !analysis` | スピナー（ローディング表示）               |
| `error`                    | エラーパネル（role="alert"）+ 再試行ボタン |
| `analysis`                 | ScoreDisplay + SuggestionList + RiskPanel  |

### サブコンポーネント

| コンポーネント   | 責務                 |
| ---------------- | -------------------- |
| `ScoreDisplay`   | 分析スコアの表示     |
| `SuggestionList` | 改善提案リストの表示 |
| `RiskPanel`      | リスク情報の表示     |

### アクセシビリティ

- 閉じるボタン: `aria-label="閉じる"`
- エラー表示: `role="alert"`
- アイコン: `aria-hidden="true"`

---

## 3. SkillCreateWizard コンポーネント

### 概要

スキル作成のウィザードフローを提供するコンポーネント。4 ステップの入力フローを管理し、Store action 経由でスキル生成を実行する。

### ファイルパス

`apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`

### API

```typescript
interface SkillCreateWizardProps {
  /** ウィザード完了/キャンセル時のコールバック */
  onClose: () => void;
}

function SkillCreateWizard(props: SkillCreateWizardProps): JSX.Element;
```

### Props

| 名前      | 型           | 必須 | 説明                                 |
| --------- | ------------ | ---- | ------------------------------------ |
| `onClose` | `() => void` | YES  | 完了またはキャンセル時のコールバック |

### ウィザードステップ

| ステップ | コンポーネント  | 説明                                |
| -------- | --------------- | ----------------------------------- |
| 1        | `DescribeStep`  | スキル説明の入力                    |
| 2        | `ConfigureStep` | オプション設定                      |
| 3        | `GenerateStep`  | スキル生成（Store action 呼び出し） |
| 4        | `CompleteStep`  | 完了表示                            |

### ローカル State

| State          | 型               | 説明                   |
| -------------- | ---------------- | ---------------------- |
| `description`  | `string`         | スキル説明入力値       |
| `options`      | `WizardOptions`  | ウィザード設定値       |
| `isGenerating` | `boolean`        | 生成処理中フラグ       |
| `error`        | `Error \| null`  | ウィザード固有エラー   |
| `skillPath`    | `string \| null` | 生成されたスキルのパス |

### 依存する Store セレクタ

| セレクタ           | 種別   |
| ------------------ | ------ |
| `useCreateSkill()` | action |

### エラーハンドリング

- `Error` インスタンス: `error.message` を表示
- 非 `Error` オブジェクト: フォールバックメッセージ「スキル生成に失敗しました」を表示
- `null` / `undefined` / 空文字列: フォールバックメッセージを表示
