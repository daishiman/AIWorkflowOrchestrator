# UIコンポーネントパターン（Desktop Renderer） / core specification

> 親仕様書: [arch-ui-components.md](arch-ui-components.md)
> 役割: core specification

## Monaco Diff Editor統合パターン

### 概要

Monaco Diff Editorは`@monaco-editor/react`を使用してサイドバイサイドの差分表示を提供する。React Lazy Loadingによる遅延読み込みとアクセシビリティ対応を実装。

**実装場所**: `apps/desktop/src/renderer/features/workspace-chat-edit/components/DiffEditor.tsx`

### コンポーネント構成

| 階層  | コンポーネント    | 分類      | 説明                               |
| ----- | ----------------- | --------- | ---------------------------------- |
| 1     | DiffPreview       | organisms | モーダルコンテナ                   |
| 1-1   | DiffEditor        | molecules | Monaco Diff表示                    |
| 1-1-1 | DiffEditor (外部) | -         | @monaco-editor/reactからインポート |
| 1-2   | ApplyControls     | molecules | 操作ボタン群                       |
| 1-2-1 | ApplyButton       | atoms     | 適用ボタン                         |
| 1-2-2 | RejectButton      | atoms     | 却下ボタン                         |

### 実装パターン

#### Lazy Loading（バンドルサイズ最適化）

**実装ファイル**: DiffEditor.tsx

**インポート**: `lazy`, `Suspense` を `react` からインポート

**遅延読み込み定義**:

- `MonacoDiffEditor` を `lazy()` で定義
- `@monaco-editor/react` から動的インポートし、`mod.DiffEditor` を default としてエクスポート

**DiffEditorコンポーネント仕様**:

| 要素               | 説明                                             |
| ------------------ | ------------------------------------------------ |
| コンポーネント型   | `React.FC<Props>`                                |
| ラッパー           | `Suspense` でラップ、fallbackに `LoadingSpinner` |
| 内部コンポーネント | `MonacoDiffEditor`                               |

**MonacoDiffEditorへ渡すProps**:

| Prop     | 値                                     |
| -------- | -------------------------------------- |
| original | Props.original                         |
| modified | Props.modified                         |
| language | Props.language（未指定時 "plaintext"） |
| height   | Props.height（未指定時 "400px"）       |
| theme    | "vs-dark"                              |
| options  | EDITOR_OPTIONS定数                     |

#### Editor Options（推奨設定）

**定数名**: `EDITOR_OPTIONS`

**型**: `monaco.editor.IDiffEditorOptions`

| オプション           | 値     | 説明                       |
| -------------------- | ------ | -------------------------- |
| readOnly             | true   | 読み取り専用モード         |
| renderSideBySide     | true   | サイドバイサイド表示       |
| minimap.enabled      | false  | ミニマップ非表示           |
| scrollBeyondLastLine | false  | 最終行以降のスクロール無効 |
| wordWrap             | "on"   | 自動折り返し有効           |
| lineNumbers          | "on"   | 行番号表示                 |
| folding              | false  | コード折りたたみ無効       |
| automaticLayout      | true   | 自動レイアウト調整         |
| scrollbar.vertical   | "auto" | 縦スクロールバー自動表示   |
| scrollbar.horizontal | "auto" | 横スクロールバー自動表示   |

### Props定義

| Prop       | 型                    | 必須 | 説明                    |
| ---------- | --------------------- | ---- | ----------------------- |
| `original` | `string`              | ✅   | 変更前コード            |
| `modified` | `string`              | ✅   | 変更後コード            |
| `language` | `string \| undefined` |      | 言語（自動検出）        |
| `height`   | `string \| number`    |      | 高さ（デフォルト400px） |

### 言語自動検出パターン

**関数名**: `detectLanguage`

**シグネチャ**: `(fileName: string) => string`

**処理フロー**:

1. ファイル名を `.` で分割し、最後の要素（拡張子）を取得
2. 拡張子を小文字に変換
3. 言語マッピングテーブルから対応するMonaco言語IDを返却
4. マッチしない場合は "plaintext" を返却

**言語マッピングテーブル**:

| 拡張子   | Monaco言語ID |
| -------- | ------------ |
| ts       | typescript   |
| tsx      | typescript   |
| js       | javascript   |
| jsx      | javascript   |
| json     | json         |
| md       | markdown     |
| css      | css          |
| html     | html         |
| py       | python       |
| rs       | rust         |
| go       | go           |
| (その他) | plaintext    |

### アクセシビリティ対応

| 要件               | 実装                                       |
| ------------------ | ------------------------------------------ |
| キーボード操作     | Monaco内蔵（Ctrl+G ジャンプ、Ctrl+F 検索） |
| フォーカス管理     | モーダル開閉時にフォーカストラップ         |
| スクリーンリーダー | aria-label="差分エディタ"                  |
| 色コントラスト     | vs-darkテーマ（WCAG 2.1 AA準拠）           |

### モーダル統合パターン（DiffPreview）

**実装ファイル**: DiffPreview.tsx

**インポート**: `useEffect`, `useRef` を `react` からインポート

**コンポーネント型**: `React.FC<Props>`

**Props一覧**:

| Prop      | 用途                 |
| --------- | -------------------- |
| original  | 変更前コード         |
| modified  | 変更後コード         |
| fileName  | 表示ファイル名       |
| language  | 言語指定             |
| resultId  | 結果識別子           |
| onClose   | 閉じるコールバック   |
| onApplied | 適用完了コールバック |

**内部状態**:

- `dialogRef`: `useRef<HTMLDivElement>(null)` でダイアログ要素を参照

**フォーカストラップ（useEffect）**:

- Escapeキー押下時: `onClose()` を実行
- Tabキー押下時: フォーカストラップ処理
- クリーンアップ: イベントリスナー解除
- 依存配列: `[onClose]`

**レンダリング構造**:

| 要素          | 属性/Props                                                                                                                                                         |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ルートdiv     | `ref={dialogRef}`, `role="dialog"`, `aria-modal="true"`, `aria-labelledby="diff-preview-title"`, `className="fixed inset-0 z-50 flex items-center justify-center"` |
| コンテナdiv   | `className="bg-background rounded-lg shadow-lg w-full max-w-4xl"`                                                                                                  |
| h2            | `id="diff-preview-title"`, 内容: fileName                                                                                                                          |
| 閉じるボタン  | `onClick={onClose}`, `aria-label="閉じる"`, 内容: ×                                                                                                                |
| DiffEditor    | `original`, `modified`, `language`, `height="60vh"`                                                                                                                |
| ApplyControls | `resultId`, `onApplied`, `onRejected={onClose}`                                                                                                                    |

### テストパターン

**実装ファイル**: DiffEditor.test.tsx

**インポート**: `render`, `screen` を `@testing-library/react` からインポート

**モック設定**:

- `vi.mock("@monaco-editor/react")` でMonaco Editorをモック化
- モックコンポーネントは `data-testid` 属性付きのdiv要素を返却

**モックコンポーネント構造**:

| data-testid      | 内容           |
| ---------------- | -------------- |
| mock-diff-editor | ルートコンテナ |
| original         | Props.original |
| modified         | Props.modified |
| language         | Props.language |

**テストケース**:

| describe   | it                                         | 検証内容                                                                             |
| ---------- | ------------------------------------------ | ------------------------------------------------------------------------------------ |
| DiffEditor | renders with original and modified content | `original="before"`, `modified="after"` でレンダリングし、各要素のテキスト内容を検証 |

**検証方法**:

- `render()` でコンポーネントをレンダリング
- `screen.getByTestId()` で要素取得
- `toHaveTextContent()` でテキスト内容を検証

### 品質メトリクス

- 329テストケース全PASS（workspace-chat-edit-ui全体）
- WCAG 2.1 AA準拠
- Lazy Loading によるバンドルサイズ最適化

### 関連タスク

- **Issue #468**: workspace-chat-edit-ui（2026-01-25完了）

---

## SkillCreateWizard LLM / template 併用パターン（TASK-SC-07 current facts）

### 概要

`SkillCreateWizard` は、template と LLM の 2 経路を併存させるウィザードとして扱う。  
Step 0 は `generationMode` によって分岐し、template 側は `SkillInfoStep`、LLM 側は説明文 textarea を表示する。  
Step 1 以降は `ConversationRoundStep` → `GenerateStep` → `CompleteStep` の共通導線を使う。

### コンポーネント構成

| 階層 | コンポーネント | 分類 | 説明 |
| --- | --- | --- | --- |
| 1 | `SkillCreateWizard` | organisms | Step 0〜3 の orchestration、本タスクの current facts の正本 |
| 1-1 | `StepIndicator` | atoms | current step の進行表示 |
| 1-2 | `SkillInfoStep` | molecules | template 側の Step 0。スキル名・目的・カテゴリを入力 |
| 1-3 | `ConversationRoundStep` | molecules | Step 1。6問インタビューと smartDefaults の適用 |
| 1-4 | `GenerateStep` | molecules | Step 2。進捗、planResult、execute / cancel、terminal handoff guidance を表示 |
| 1-5 | `CompleteStep` | molecules | Step 3。`skillPath`、外部連携チェック、次の行動カードを表示 |

### Step 0 の分岐

| モード | UI | 目的 |
| --- | --- | --- |
| `template` | `SkillInfoStep` | 既存のテンプレート導線を維持する |
| `llm` | textarea + `次へ` | `planSkill` に渡す説明文を入力する |

### `GenerateStep` の current facts

| props | 役割 |
| --- | --- |
| `generationProgress` | 進捗メッセージを表示 |
| `planResult` | `integrated_api` / `terminal_handoff` の計画結果を表示 |
| `onExecutePlan` | `integrated_api` のときだけ実行ボタンで使用 |
| `onCancelPlan` | LLM 計画を破棄して Step 0 に戻す |

### `CompleteStep` の current facts

| props | 役割 |
| --- | --- |
| `skillPath` | 生成先パスを表示 |
| `hasExternalIntegration` | 外部連携チェックリストの有無を決める |
| `externalToolName` | Slack / GitHub / Notion などのツール名を表示 |
| `onRetry` | 失敗/不一致時に Step 0 へ戻す |
| `onCreateAnother` | 別スキル作成へ戻す |

### 実装ルール

- `DescribeStep.tsx` は deprecated で、current facts の正本ではない。
- `SkillInfoStep` を template 側の唯一の Step 0 として扱う。
- `planResult.type === "terminal_handoff"` の場合、`GenerateStep` では guidance を表示し、`実行する` を出さない。
- `phase-11` の既存スクリーンショットは Step 0 / Step 1 / Step 3 の visual evidence として参照する。

### 関連タスク

| タスクID | 内容 | ステータス |
| --- | --- | --- |
| TASK-SC-07 | SkillCreateWizard LLM / template 併用フロー | **完了**（2026-04-09） |
| TASK-SC-06-UI-RUNTIME-CONNECTION | SkillLifecyclePanel plan/execute 接続 | **完了** |

## SkillCreateWizard LLM 連携フロー（TASK-SC-07）

> 完了日: 2026-04-09（W2-seq-03a 対応込み）

### コンポーネント構成（current topology）

| Step   | コンポーネント                                                 | 役割                                                                                       |
| ------ | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Step 0 | `SkillInfoStep`（template モード）/ LLM 説明入力（llm モード） | スキル名・目的・カテゴリ入力 or LLM 説明テキスト入力。`generationMode` ラジオボタンで切替  |
| Step 1 | `ConversationRoundStep`                                        | 会話形式 6 問（Q1〜Q6）。`smartDefaults` を初期値として提供                                |
| Step 2 | `GenerateStep`                                                 | 生成中プログレス表示。template / LLM モード共通                                            |
| Step 3 | `CompleteStep`                                                 | 生成完了後のアクションカード（即実行 / エディタで開く / 別スキル作成）と品質フィードバック |

> `DescribeStep.tsx` は W2-seq-03b で `SkillInfoStep` に置き換えられた。`DescribeStep.tsx` は deprecation コメントのみが残る旧ファイル。

### コンポーネント階層

```
SkillCreateWizard
├── StepIndicator
├── [Step 0] SkillInfoStep | LLM description textarea
├── [Step 1] ConversationRoundStep
├── [Step 2] GenerateStep
│   └── generate-step/ErrorCards（atoms: API_KEY_NOT_SET / LLM_ERROR / NETWORK_ERROR）
└── [Step 3] CompleteStep
```

### generationMode 切替フロー

```
Step 0（template モード）
  → SkillInfoStep に formData / onFormDataChange / onNext を渡す
  → 「次へ」で handleStep0Next() → inferSmartDefaults → Step 1
  → Step 1 の「生成」で handleGenerate(method) → createSkill() → Step 2 → Step 3

Step 0（llm モード）
  → LLM 説明入力 textarea に llmDescription を渡す
  → 「次へ」で handleLlmGenerate() → planSkill(description) → Step 2
  → Step 2 で planResult 表示 → 「実行する」で handleExecutePlan()
  → executePlan(planId, skillSpec) → getWorkflowState(planId) → Step 3
```

### GenerateStep Props（current）

| Prop                 | 型                        | 説明                                                                                           |
| -------------------- | ------------------------- | ---------------------------------------------------------------------------------------------- |
| `stage`              | `GenerationStage`         | idle / planning / generating-skill / generating-agents / validating / done / error / cancelled |
| `percent`            | `number`                  | プログレスバー表示（0-100）                                                                    |
| `message`            | `string`                  | 現在の進捗メッセージ                                                                           |
| `previewContent`     | `string \| null`          | プレビューパネル表示内容                                                                       |
| `error`              | `GenerationError \| null` | エラー種別（code: API_KEY_NOT_SET / LLM_ERROR / NETWORK_ERROR）                                |
| `isGenerating`       | `boolean`                 | ボタン disabled 制御                                                                           |
| `generationProgress` | `string \| null`          | Store 由来の進捗メッセージ（legacy）                                                           |
| `planResult`         | `PlanResult \| null`      | LLM モード: 計画結果表示（integrated_api / terminal_handoff）                                  |
| `onExecutePlan`      | `() => void`              | LLM モード: 「実行する」ボタン                                                                 |
| `onCancelPlan`       | `() => void`              | LLM モード: 「キャンセル」ボタン                                                               |
| `onCancel`           | `() => void`              | template モード: キャンセルボタン                                                              |
| `onRetry`            | `() => void`              | template モード: リトライボタン                                                                |

### LLM API アクセスパターン（SkillCreatorRuntimeApi）

```typescript
// SkillCreateWizard.tsx ローカル型（window 経由で取得）
type SkillCreatorRuntimeApi = {
  planSkill?: (prompt: string, authMode?: string, apiKey?: string) => Promise<...>;
  executePlan?: (planId: string, skillSpec: string, ...) => Promise<...>;  // skillSpec 必須（C-1）
  getWorkflowState?: (planId: string) => Promise<...>;
};
```

`window.skillCreatorAPI` → `window.electronAPI.skillCreator` の順にフォールバック。

### snapshot 再読込パターン

`executePlan()` 成功後に `getWorkflowState(planId)` を呼び出し、以下の情報を snapshot から取得する：

- `snapshot.handoffBundle` → terminal_handoff PlanResult に変換して表示
- `snapshot.verifyResult.status === "fail"` → エラーメッセージを UI に表示
- `snapshot.persistResult.skillPath` → `CompleteStep` に `skillPath` として渡す

### StepIndicator ステップ名称（current）

```typescript
export const STEPS = ["スキル情報入力", "詳細設定", "生成", "完了"];
```

### 関連タスク

| タスクID   | 内容                                                      | ステータス             |
| ---------- | --------------------------------------------------------- | ---------------------- |
| TASK-SC-07 | SkillCreateWizard LLM 生成フロー接続                      | **完了**（2026-04-09） |
| TASK-SC-08 | onProgress コールバックによるリアルタイムプログレス更新   | 未着手                 |
| TASK-SC-10 | agentSlice LLM Generation state を generationSlice に分割 | 未着手（LOW）          |
| TASK-SC-12 | Hybrid State Pattern ガイドドキュメント化                 | 未着手（LOW）          |

---
