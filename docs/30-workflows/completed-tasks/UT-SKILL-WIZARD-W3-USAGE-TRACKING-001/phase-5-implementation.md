# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| Phase      | 5                                                    |
| 前提 Phase | 4（TDD Red：テスト作成）                             |
| 後続 Phase | 6（テスト拡充）                                      |
| タスクID   | UT-SKILL-WIZARD-W3-USAGE-TRACKING-001                |
| タスク分類 | NON_VISUAL（Renderer 内部の計装のみ / 視覚差分なし） |
| 担当 AC    | AC-1 / AC-2 / AC-3 / AC-4 / AC-5 / AC-6              |

---

## 目的

`trackEvent.ts` に `skill_wizard_open` / `skill_wizard_step_complete` /
`skill_wizard_next_action` / `skill_wizard_abandon` の 4 イベント型を追加し、
`SkillCreateWizard.tsx` の 5 計装ポイントおよび `CompleteStep.tsx` の
ネクストアクション選択コールバックに計装コードを挿入する。

本 Phase は NON_VISUAL タスクであるため、UI の見た目・レイアウトへの変更は一切行わない。
修正対象はすべて内部ロジック（型定義・イベント発火）に限定する。

---

## 実行タスク

### タスク 1: `trackEvent.ts` への `skill_wizard_*` 型定義追加（AC-1〜AC-4）

**対象ファイル**: `apps/desktop/src/renderer/utils/trackEvent.ts`

#### 手順 1-1: 既存のスタブ化パターンを確認する

現在の `SkillWizardEvents` 型は以下のイベントを持つ：

```
skill_wizard_started         : Record<string, never>
skill_wizard_step1_completed : { method: "complete" | "skip"; skippedAtQuestion: number | null }
skill_wizard_generation_completed : { method: ...; category: ...; hasExternalIntegration: ... }
skill_skeleton_quality_feedback   : { satisfied: boolean; generationMethod: ... }
skill_wizard_next_action          : { action: "execute" | "open_editor" | "create_another" }
```

新規追加する 4 イベントは**既存イベントを削除・変更しない**。
`SkillWizardEvents` 型にキーを追加する形で拡張する。

#### 手順 1-2: `skill_wizard_open` イベント型を追加する（AC-1）

`SkillWizardEvents` に以下のキーを追加する：

```typescript
skill_wizard_open: {
  source: "lifecycle_panel" | "direct";
}
```

- `source` の値は `SkillCreateWizard.tsx` を呼び出す側から prop で渡す。
  渡されない場合はデフォルト値 `'direct'` を使用する（後述タスク 2-1 で実装）。
- `string` や `unknown` を使わず、`'lifecycle_panel' | 'direct'` のユニオン型で定義する。

#### 手順 1-3: `skill_wizard_step_complete` イベント型を追加する（AC-2）

```typescript
skill_wizard_step_complete: {
  step: number;
  stepName: string;
}
```

- `step` は 0 始まりの整数（Step 0 = スキル情報入力、Step 1 = 詳細設定、Step 2 = 生成）。
- `stepName` は `STEPS` 配列の対応する文字列（例: `"スキル情報入力"`）。
- 既存の `skill_wizard_step1_completed` とは**別のイベント**として追加する（削除しない）。

#### 手順 1-4: `skill_wizard_next_action` イベント型を更新する（AC-3）

現在の型は `action: "execute" | "open_editor" | "create_another"` だが、
タスク要件では `action: 'edit' | 'execute' | 'close'` に変更する。

変更前後を以下に示す：

| Before                                                   | After                                    |
| -------------------------------------------------------- | ---------------------------------------- |
| `action: "execute" \| "open_editor" \| "create_another"` | `action: 'edit' \| 'execute' \| 'close'` |

**注意**: この変更は既存の `handleExecuteNow` / `handleOpenInEditor` /
`handleCreateAnother` の呼び出し箇所にも影響する。タスク 2-3 で合わせて修正する。

#### 手順 1-5: `skill_wizard_abandon` イベント型を追加する（AC-4）

```typescript
skill_wizard_abandon: {
  lastStep: number;
}
```

- `lastStep` は 0 始まりのステップ番号（アンマウント直前の `currentStep` 値）。
- ウィザードが最終ステップ（Step 3: 完了）に到達していた場合は発火しない（後述タスク 2-2）。

#### 手順 1-6: 既存イベントへの Breaking Change がないことを確認する

```bash
pnpm --filter @repo/desktop typecheck
```

エラーが 0 件であることを確認する。エラーが出た場合はエラーメッセージを読み、
型定義の追加・変更箇所を修正してから再実行する。

---

### タスク 2: `SkillCreateWizard.tsx` への計装挿入（AC-5）

**対象ファイル**: `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`

#### 手順 2-1: マウント時に `skill_wizard_open` を発火する（計装ポイント 1）

現在、マウント時の `useEffect` では `skill_wizard_started` が発火している：

```typescript
// W3-seq-04 計装 1: ウィザード起動イベント（AC-01）
useEffect(() => {
  trackEvent("skill_wizard_started", {});
}, []);
```

この `useEffect` に `skill_wizard_open` の発火を追加する。
`source` prop を `SkillCreateWizardProps` に追加し、呼び出し元から受け取る：

```typescript
export interface SkillCreateWizardProps {
  onClose: () => void;
  source?: "lifecycle_panel" | "direct"; // 追加
}
```

`source` が渡されない場合のデフォルト値は `'direct'` とする。
`useEffect` の変更後のイメージ：

```typescript
useEffect(() => {
  trackEvent("skill_wizard_started", {});
  trackEvent("skill_wizard_open", { source: source ?? "direct" });
}, []);
```

`source` は `useEffect` の依存配列に**追加しない**（マウント時の 1 回のみ発火させるため）。

#### 手順 2-2: アンマウント時に `skill_wizard_abandon` を発火する（計装ポイント 5）

ウィザードが未完了のままアンマウントされた場合のみ `skill_wizard_abandon` を発火する。

- 「未完了」の定義: ステップ 3（完了画面）に到達していない状態でアンマウントされること。
- `useRef` でステップ到達フラグを保持する：

```typescript
const wizardCompletedRef = useRef(false);
```

Step 3 に遷移するすべての箇所（`handleGenerate` の `goToStep(3)` 呼び出し、
および `handleExecutePlan` の `goToStep(3)` 呼び出し）で
`wizardCompletedRef.current = true` をセットする。

既存のアンマウント用 `useEffect`（`llmGenerationRequestIdRef.current += 1` のみ行っているもの）
のクリーンアップ関数に `skill_wizard_abandon` の発火を追加する：

```typescript
useEffect(() => {
  return () => {
    llmGenerationRequestIdRef.current += 1;
    if (!wizardCompletedRef.current) {
      trackEvent("skill_wizard_abandon", { lastStep: currentStep });
    }
  };
}, []);
```

`currentStep` は `useEffect` のクロージャで最新値が取れないため、
`useRef` で現在ステップを追跡する `currentStepRef` を追加する：

```typescript
const currentStepRef = useRef(currentStep);
useEffect(() => {
  currentStepRef.current = currentStep;
}, [currentStep]);
```

アンマウント時クリーンアップでは `currentStepRef.current` を参照する：

```typescript
if (!wizardCompletedRef.current) {
  trackEvent("skill_wizard_abandon", { lastStep: currentStepRef.current });
}
```

#### 手順 2-3: 各ステップ完了ハンドラーで `skill_wizard_step_complete` を発火する（計装ポイント 2〜4）

各ステップの「次へ」処理に対応するハンドラーの先頭に `trackEvent` を挿入する。

**計装ポイント 2: Step 0 完了（スキル情報入力）**

- 対象ハンドラー: `handleStep0Next`（テンプレートモード）
- 発火タイミング: `goNext()` 呼び出し前
- ペイロード: `{ step: 0, stepName: "スキル情報入力" }`

`handleStep0NextFromLlm` にも同様に追加する（LLM モードからテンプレートモード切替後の遷移）：

- ペイロード: `{ step: 0, stepName: "スキル情報入力" }`

**計装ポイント 3: Step 1 完了（詳細設定）**

- 対象ハンドラー: `handleGenerate`（既存の `skill_wizard_step1_completed` 発火行の直後）
- 発火タイミング: 既存の `trackEvent("skill_wizard_step1_completed", {...})` の直後
- ペイロード: `{ step: 1, stepName: "詳細設定" }`

**計装ポイント 4: Step 2 完了（生成）**

- 対象ハンドラー: `handleGenerate`（成功時の `goToStep(3)` 呼び出し直前）
- 発火タイミング: `goToStep(3)` 呼び出し前かつ `wizardCompletedRef.current = true` の後
- ペイロード: `{ step: 2, stepName: "生成" }`

LLM モードでも同様に `handleExecutePlan` の `goToStep(3)` 呼び出し直前に追加する：

- ペイロード: `{ step: 2, stepName: "生成" }`

**`skill_wizard_next_action` アクション値の更新（手順 1-4 の対応）**

タスク 1-4 で `skill_wizard_next_action` の `action` 型を変更したため、
以下の 3 ハンドラーの `trackEvent` 呼び出し引数を変更する：

| ハンドラー            | Before                     | After             |
| --------------------- | -------------------------- | ----------------- |
| `handleExecuteNow`    | `action: "execute"`        | 変更なし          |
| `handleOpenInEditor`  | `action: "open_editor"`    | `action: "edit"`  |
| `handleCreateAnother` | `action: "create_another"` | `action: "close"` |

> 注: `handleCreateAnother` は「別のスキルを作る」アクションだが、
> タスク要件の `action: 'close'` に対応する。このマッピングが要件と合っているか
> Phase 3（設計レビューゲート）の成果物を参照して確認すること。

---

### タスク 3: `CompleteStep.tsx` への計装挿入（AC-6）

**対象ファイル**: `apps/desktop/src/renderer/components/skill/wizard/CompleteStep.tsx`

#### 手順 3-1: `trackEvent` のインポートを追加する

ファイル先頭に以下のインポートを追加する：

```typescript
import { trackEvent } from "../../../utils/trackEvent";
```

既存の `import React, { useState, useCallback } from "react";` の次の行に追加する。

#### 手順 3-2: ネクストアクション選択コールバックに計装を追加する

現在の `nextActions` 配列では各アクションの `handler` プロパティに
`onExecuteNow` / `onOpenInEditor` / `onCreateAnother` を直接格納している。

各ボタンの `onClick` ハンドラーで `trackEvent` を発火させるため、
`nextActions` 配列の定義を変更する。

変更前:

```typescript
const nextActions = [
  {
    ...
    handler: onExecuteNow,
  },
  {
    ...
    handler: onOpenInEditor,
  },
  {
    ...
    handler: onCreateAnother,
  },
] as const;
```

変更後（`action` プロパティを追加し、クリック時に `trackEvent` を発火）:

`nextActions` 配列に `action` プロパティを追加し、
JSX の `onClick` で `trackEvent` を呼び出してから `handler` を実行する：

```typescript
const nextActions = [
  {
    testId: "complete-step-action-execute",
    label: "今すぐ実行する",
    icon: "▶",
    ariaLabel: "今すぐ実行する",
    action: "execute" as const,
    handler: onExecuteNow,
  },
  {
    testId: "complete-step-action-open-editor",
    label: "エディタで開く",
    icon: "✏",
    ariaLabel: "エディタで開く",
    action: "edit" as const,
    handler: onOpenInEditor,
  },
  {
    testId: "complete-step-action-create-another",
    label: "別のスキルを作る",
    icon: "＋",
    ariaLabel: "別のスキルを作る",
    action: "close" as const,
    handler: onCreateAnother,
  },
];
```

JSX 側の `onClick` を以下に変更する：

```tsx
onClick={() => {
  trackEvent("skill_wizard_next_action", { action: action.action });
  action.handler?.();
}}
```

- `action.action` の型は `'edit' | 'execute' | 'close'` に推論されるため、型エラーにならない。
- `handler` が `undefined` の場合でも `trackEvent` は発火する（ボタンは `disabled` 状態）。
  `disabled` 状態のボタンは `onClick` が呼ばれないため、実際には発火しない。

---

## 実装計画（新規作成・修正ファイル一覧）

| 種別 | ファイルパス                                                         | 変更内容                                                                              |
| ---- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| 修正 | `apps/desktop/src/renderer/utils/trackEvent.ts`                      | `SkillWizardEvents` に 4 イベント型追加・`skill_wizard_next_action` 型更新            |
| 修正 | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`   | `source` prop 追加・5 計装ポイントに `trackEvent` 挿入・`wizardCompletedRef` 追加     |
| 修正 | `apps/desktop/src/renderer/components/skill/wizard/CompleteStep.tsx` | `trackEvent` インポート追加・`nextActions` に `action` プロパティ追加・`onClick` 変更 |

新規ファイルの作成は本 Phase では行わない。

---

## 参照資料

- `apps/desktop/src/renderer/utils/trackEvent.ts`（既存実装・スタブパターン確認）
- `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`（Wave 2 成果物・計装挿入箇所）
- `apps/desktop/src/renderer/components/skill/wizard/CompleteStep.tsx`（ネクストアクション定義）
- `docs/30-workflows/UT-SKILL-WIZARD-W3-USAGE-TRACKING-001/outputs/phase-4/`（TDD Red テスト）
- `docs/30-workflows/UT-SKILL-WIZARD-W3-USAGE-TRACKING-001/outputs/phase-2/`（設計ドキュメント）
- `docs/30-workflows/UT-SKILL-WIZARD-W3-USAGE-TRACKING-001/outputs/phase-3/`（設計レビューゲート成果物）

---

## 成果物

- `apps/desktop/src/renderer/utils/trackEvent.ts`（修正済み）
- `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`（修正済み）
- `apps/desktop/src/renderer/components/skill/wizard/CompleteStep.tsx`（修正済み）

---

## 完了条件

- [ ] `trackEvent.ts` の `SkillWizardEvents` に `skill_wizard_open` が追加されている（AC-1）
- [ ] `trackEvent.ts` の `SkillWizardEvents` に `skill_wizard_step_complete` が追加されている（AC-2）
- [ ] `trackEvent.ts` の `SkillWizardEvents` の `skill_wizard_next_action.action` が `'edit' | 'execute' | 'close'` に更新されている（AC-3）
- [ ] `trackEvent.ts` の `SkillWizardEvents` に `skill_wizard_abandon` が追加されている（AC-4）
- [ ] `SkillCreateWizard.tsx` のマウント時に `skill_wizard_open` が発火する（計装ポイント 1）
- [ ] `SkillCreateWizard.tsx` の Step 0 完了ハンドラーで `skill_wizard_step_complete` が発火する（計装ポイント 2）
- [ ] `SkillCreateWizard.tsx` の Step 1 完了ハンドラーで `skill_wizard_step_complete` が発火する（計装ポイント 3）
- [ ] `SkillCreateWizard.tsx` の Step 2 完了時（生成成功時）に `skill_wizard_step_complete` が発火する（計装ポイント 4）
- [ ] `SkillCreateWizard.tsx` のアンマウント時（未完了の場合）に `skill_wizard_abandon` が発火する（計装ポイント 5）
- [ ] `CompleteStep.tsx` の「今すぐ実行する」クリック時に `skill_wizard_next_action` `{ action: 'execute' }` が発火する（AC-6）
- [ ] `CompleteStep.tsx` の「エディタで開く」クリック時に `skill_wizard_next_action` `{ action: 'edit' }` が発火する（AC-6）
- [ ] `CompleteStep.tsx` の「別のスキルを作る」クリック時に `skill_wizard_next_action` `{ action: 'close' }` が発火する（AC-6）
- [ ] 既存テストが全 PASS（回帰なし）: `pnpm --filter @repo/desktop test:run`
- [ ] TypeScript 型チェックが PASS: `pnpm --filter @repo/desktop typecheck`
