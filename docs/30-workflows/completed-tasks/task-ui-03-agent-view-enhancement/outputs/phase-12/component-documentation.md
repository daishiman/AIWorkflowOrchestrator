# コンポーネントドキュメント

## メタ情報

| 項目     | 値                                |
| -------- | --------------------------------- |
| タスクID | TASK-UI-03-AGENT-VIEW-ENHANCEMENT |
| Phase    | 12                                |
| 作成日   | 2026-03-07                        |

---

## 1. SkillChip

### 責務

ツール（スキル）を視覚的に表現し、ユーザーのタップで選択状態を切り替える。`role="radio"` でアクセシブルなラジオボタンとして機能する。

### Props API

| Prop          | 型           | 必須 | デフォルト  | 説明                                    |
| ------------- | ------------ | ---- | ----------- | --------------------------------------- |
| `skillName`   | `string`     | Yes  | -           | スキルの内部名称                        |
| `displayName` | `string`     | Yes  | -           | 表示用の名称                            |
| `icon`        | `string`     | No   | `undefined` | アイコン文字（未指定時は Zap アイコン） |
| `isSelected`  | `boolean`    | Yes  | -           | 選択状態                                |
| `onSelect`    | `() => void` | Yes  | -           | 選択時コールバック                      |
| `isDisabled`  | `boolean`    | No   | `false`     | 無効化フラグ                            |

### 使用例

```tsx
<SkillChip
  skillName="search"
  displayName="検索"
  isSelected={selectedSkillName === "search"}
  onSelect={() => selectSkill("search")}
/>
```

### アクセシビリティ要件

- `role="radio"` + `aria-checked` で選択状態を通知
- `aria-label` に `displayName` を設定
- `aria-disabled` で無効状態を通知
- `tabIndex={0}` でキーボードフォーカス可能（無効時は `-1`）
- Enter / Space キーで選択可能

### ファイルパス

`apps/desktop/src/renderer/components/organisms/AgentView/SkillChip.tsx`

---

## 2. ExecuteButton

### 責務

選択中のスキルを実行するプライマリアクションボタン。未選択時は無効化、実行中は非表示（FloatingExecutionBar に切り替え）。

### Props API

| Prop                | 型               | 必須 | デフォルト | 説明                            |
| ------------------- | ---------------- | ---- | ---------- | ------------------------------- |
| `selectedSkillName` | `string \| null` | Yes  | -          | 選択中のスキル名（null=未選択） |
| `onExecute`         | `() => void`     | Yes  | -          | 実行クリック時コールバック      |
| `isExecuting`       | `boolean`        | Yes  | -          | 実行中フラグ（true で非表示）   |

### 使用例

```tsx
<ExecuteButton
  selectedSkillName={selectedSkillName}
  onExecute={handleExecute}
  isExecuting={false}
/>
```

### アクセシビリティ要件

- `disabled` 属性で無効状態を HTML 標準で通知
- ボタンテキストが「ツールを選んでください」（無効時）/ 「実行する」（有効時）で状態を視覚的に区別

### ファイルパス

`apps/desktop/src/renderer/components/organisms/AgentView/ExecuteButton.tsx`

---

## 3. FloatingExecutionBar

### 責務

スキル実行中にフローティングバーとして画面下部に表示。経過時間・進捗・停止ボタンを提供する。実行完了時は成功表示に切り替わる。

### Props API

| Prop        | 型                                                 | 必須 | デフォルト  | 説明                             |
| ----------- | -------------------------------------------------- | ---- | ----------- | -------------------------------- |
| `skillName` | `string`                                           | Yes  | -           | 実行中のスキル名                 |
| `status`    | `"executing" \| "completed" \| "failed" \| "idle"` | Yes  | -           | 実行ステータス                   |
| `startedAt` | `Date \| null`                                     | Yes  | -           | 実行開始日時                     |
| `progress`  | `number`                                           | No   | `undefined` | 進捗率 0-100                     |
| `onStop`    | `() => void`                                       | Yes  | -           | 停止ボタンクリック時コールバック |

### 使用例

```tsx
<FloatingExecutionBar
  skillName="検索ツール"
  status="executing"
  startedAt={new Date()}
  progress={45}
  onStop={handleAbort}
/>
```

### アクセシビリティ要件

- プログレスバーに `role="progressbar"` + `aria-valuenow` / `aria-valuemin` / `aria-valuemax`
- 停止ボタンに `aria-label="停止"`

### ファイルパス

`apps/desktop/src/renderer/components/organisms/AgentView/FloatingExecutionBar.tsx`

---

## 4. AdvancedSettingsPanel

### 責務

AIモデル選択・許可モード設定・記憶リセットなどの詳細設定を提供するサイドパネル。`isOpen` で表示/非表示を制御し、ESCキーで閉じる。

### Props API

| Prop                 | 型                                              | 必須 | デフォルト | 説明                   |
| -------------------- | ----------------------------------------------- | ---- | ---------- | ---------------------- |
| `isOpen`             | `boolean`                                       | Yes  | -          | 表示フラグ             |
| `onClose`            | `() => void`                                    | Yes  | -          | 閉じるコールバック     |
| `models`             | `ModelCardItem[]`                               | Yes  | -          | モデル一覧             |
| `selectedProviderId` | `string \| null`                                | Yes  | -          | 選択プロバイダID       |
| `selectedModelId`    | `string \| null`                                | Yes  | -          | 選択モデルID           |
| `onSelectModel`      | `(providerId: string, modelId: string) => void` | Yes  | -          | モデル選択コールバック |
| `permissionMode`     | `string`                                        | Yes  | -          | 許可モード             |
| `onModeChange`       | `(mode: string) => void`                        | Yes  | -          | モード変更コールバック |
| `rememberedCount`    | `number`                                        | Yes  | -          | 記憶された許可件数     |
| `onResetRemembered`  | `() => void`                                    | Yes  | -          | リセットコールバック   |

### 使用例

```tsx
<AdvancedSettingsPanel
  isOpen={isAdvancedSettingsOpen}
  onClose={() => setAdvancedSettingsOpen(false)}
  models={modelList}
  selectedProviderId={providerId}
  selectedModelId={modelId}
  onSelectModel={handleSelectModel}
  permissionMode="default"
  onModeChange={handleModeChange}
  rememberedCount={3}
  onResetRemembered={handleReset}
/>
```

### アクセシビリティ要件

- ESCキーで `onClose` が発火
- 閉じるボタンに `aria-label="閉じる"`
- モデルカードに `role="radio"` + `aria-checked`

### ファイルパス

`apps/desktop/src/renderer/components/organisms/AgentView/AdvancedSettingsPanel.tsx`

---

## 5. RecentExecutionList

### 責務

直近の実行履歴を最大3件表示し、各項目のステータスアイコン・スキル名・相対時間を表示する。0件時はEmptyStateメッセージを表示。

### Props API

| Prop                | 型                              | 必須 | デフォルト | 説明               |
| ------------------- | ------------------------------- | ---- | ---------- | ------------------ |
| `executions`        | `ExecutionSummary[]`            | Yes  | -          | 実行履歴リスト     |
| `onSelectExecution` | `(executionId: string) => void` | Yes  | -          | 選択時コールバック |
| `maxItems`          | `number`                        | No   | `3`        | 最大表示件数       |

### 使用例

```tsx
<RecentExecutionList
  executions={recentExecutions}
  onSelectExecution={handleSelectExecution}
  maxItems={3}
/>
```

### アクセシビリティ要件

- 各項目に `role="button"` + `tabIndex={0}` でキーボード操作可能
- Enter / Space キーで選択可能
- ステータスアイコンに `data-testid` でテスト識別可能

### ファイルパス

`apps/desktop/src/renderer/components/organisms/AgentView/RecentExecutionList.tsx`

---

## 共有定数ファイル

### animations.ts

アニメーショントランジション定数をTailwindクラス文字列で管理。

**ファイルパス**: `apps/desktop/src/renderer/components/organisms/AgentView/animations.ts`

### styles.ts

8pxグリッドスペーシング、コンテナレイアウト、インタラクティブ要素の共通スタイルを定数化。

**ファイルパス**: `apps/desktop/src/renderer/components/organisms/AgentView/styles.ts`
