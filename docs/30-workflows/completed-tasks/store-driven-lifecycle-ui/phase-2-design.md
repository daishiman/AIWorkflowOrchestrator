# Phase 2: 設計

## メタ情報

| 項目   | 値                                               |
| ------ | ------------------------------------------------ |
| Phase  | 2                                                |
| 機能名 | TASK-10A-F スキルライフサイクルUIのStore駆動統合 |
| 作成日 | 2026-03-08                                       |
| 状態   | 未着手                                           |

## 目的

Phase 1 で定義された機能要件 FR-1〜FR-6 と非機能要件 NFR-1〜NFR-5 に基づき、SkillCreateWizard と useSkillAnalysis フックの Store 駆動統合設計を行い、状態遷移表と P31 再発防止条件を確定する。

## 実行タスク

- CreateWizard Store 経由設計: `useCreateSkill` 経由のスキル作成フローを設計する。
- AnalysisView Store 経由設計: `useSkillAnalysis` フック内の analyze/improve 経路を store action 経由に統一する設計を行う。
- 状態遷移表: 各 action の成功/失敗/再試行時の状態遷移を定義する。
- P31 再発防止条件: 個別 selector と安定参照のルールを設計に組み込む。
- 回帰観点統合: TASK-10A-G へ渡す回帰テスト観点を設計に反映する。

## 参照資料

| 資料名                   | パス                                                                                        |
| ------------------------ | ------------------------------------------------------------------------------------------- |
| Phase 1 要件定義         | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/phase-1-requirements.md`       |
| SkillCreateWizard 実装   | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                          |
| useSkillAnalysis フック  | `apps/desktop/src/renderer/components/skill/hooks/useSkillAnalysis.ts`                      |
| SkillManagementPanel     | `apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx`                       |
| agentSlice 定義          | `apps/desktop/src/renderer/store/slices/agentSlice.ts`                                      |
| Store index（セレクタ）  | `apps/desktop/src/renderer/store/index.ts`                                                  |
| 状態管理仕様             | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                |
| 実装パターン             | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` |
| Skill インターフェース   | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           |
| IPC API 仕様             | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        |
| IPC セキュリティ         | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                |
| エラー仕様               | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       |
| UI 設計原則              | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`              |
| 品質要件                 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 |
| P31 対策ルール           | `.claude/rules/06-known-pitfalls.md#P31`                                                    |
| P42 バリデーションルール | `.claude/rules/06-known-pitfalls.md#P42`                                                    |
| P48 useShallow ルール    | `.claude/rules/06-known-pitfalls.md#P48`                                                    |
| 状態管理ルール           | `.claude/rules/03-state-management.md`                                                      |

## 設計方針

### 採用する設計

1. **Store Action 一元化方式**: コンポーネント/フックから `window.electronAPI` を直接呼び出さず、agentSlice の store action 内部でのみ Preload API を呼び出す
2. **個別セレクタ方式**: store 状態と action の取得には `useAppStore((state) => state.xxx)` パターンの個別セレクタを使用する（P31 対策）
3. **ローカル/Store 状態分離方式**: ビジネスロジックに関わる状態（分析結果、処理中フラグ、エラー）は Store に、UI 操作に関わる状態（提案選択、改善結果表示）はローカル `useState` に配置する
4. **改善後自動再分析方式**: `applySkillImprovements` / `autoImproveSkill` の action 内部で改善適用後に `analyzeSkill` を自動呼び出しする

### 判断根拠

1. **Store Action 一元化**: `window.electronAPI` 呼び出しを store action に集約することで、IPC 通信の呼び出し元が一箇所に固定される。テスト時のモック対象が明確になり、エラーハンドリングの一貫性が保証される
2. **個別セレクタ**: P31（Zustand 無限ループ）対策として、合成 Hook ではなく個別セレクタを使用する。Zustand の action 参照は安定しているため、`useEffect` の依存配列に含めても無限ループが発生しない
3. **ローカル/Store 分離**: `selectedSuggestions`（提案選択）は SkillAnalysisView 固有の UI 状態であり、他のコンポーネントから参照されない。状態管理ルール（03-state-management.md）の「コンポーネント固有 UI → useState」に該当する
4. **改善後自動再分析**: コンポーネント側で `useEffect` を使って「改善完了 → 再分析」の連鎖を実装すると、P31 の影響を受けやすい。action 内部で逐次実行することで、コンポーネントの依存配列を増やさずに済む

## コンポーネント設計

### 1. SkillCreateWizard の Store 駆動設計

#### 現在の実装状態

SkillCreateWizard は TASK-10A-D で既に `useCreateSkill()` 個別セレクタ経由で store action を使用している:

```tsx
// SkillCreateWizard.tsx（現在の実装）
import { useCreateSkill } from "../../store";

const createSkill = useCreateSkill();

const handleGenerate = async () => {
  goToStep(2);
  setIsGenerating(true);
  setError(null);
  try {
    const path = await createSkill(description, options);
    if (path) {
      setSkillPath(path);
      goToStep(3);
    } else {
      setError(new Error("スキル生成に失敗しました"));
    }
  } catch (err) {
    setError(
      err instanceof Error ? err : new Error("スキル生成に失敗しました"),
    );
  } finally {
    setIsGenerating(false);
  }
};
```

#### 設計ポイント

- SkillCreateWizard は `window.electronAPI` を直接呼び出していない（FR-1 充足）
- `createSkill` action 内部で Preload API を呼び出し、成功時に `fetchSkills()` で一覧同期する（FR-1、AC-6 充足）
- `isGenerating` と `error` はローカル `useState` で管理する（FR-6 充足）。store の `skillError` とは独立して動作する
- `skillPath` はウィザード完了ステップで使用するローカル状態（FR-6 充足）

#### 変更不要の確認

SkillCreateWizard は TASK-10A-D で store 駆動統合が完了しているため、本タスクでの変更は不要である。テストのみ追加/拡充する。

### 2. useSkillAnalysis フックの Store 駆動設計

#### 現在の実装状態

useSkillAnalysis フックは TASK-10A-F Phase 5 で既に store action 経由に統一されている:

```tsx
// useSkillAnalysis.ts（現在の実装）
import {
  useCurrentAnalysis,
  useIsAnalyzingSkill,
  useIsImprovingSkill,
  useSkillError,
  useAnalyzeSkill,
  useApplySkillImprovements,
  useAutoImproveSkill,
} from "../../../store";

export const useSkillAnalysis = (skillName: string): UseSkillAnalysisReturn => {
  // Store state (P31対策: 個別セレクタで取得)
  const analysis = useCurrentAnalysis();
  const isAnalyzing = useIsAnalyzingSkill();
  const isImproving = useIsImprovingSkill();
  const error = useSkillError();

  // Store actions (P31対策: 個別セレクタで取得)
  const analyzeSkill = useAnalyzeSkill();
  const applySkillImprovements = useApplySkillImprovements();
  const autoImproveSkill = useAutoImproveSkill();

  // Local state (UI状態は引き続きuseState)
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<number>>(new Set());
  const [improvementResult, setImprovementResult] = useState<ImprovementResult | null>(null);

  // ...ハンドラ定義...

  useEffect(() => {
    handleAnalyze();
  }, [handleAnalyze]);

  return { analysis, isAnalyzing, isImproving, selectedSuggestions, error, improvementResult, ... };
};
```

#### 設計ポイント

- `window.electronAPI.skill` への直接呼び出しは排除済み（FR-2、FR-3 充足）
- 全 store 状態/action は個別セレクタで取得（NFR-1 P31 対策充足）
- `handleAnalyze` は `useCallback` でメモ化され、依存配列は `[analyzeSkill, skillName]`。`analyzeSkill` は Zustand action 参照で安定しているため無限ループリスクなし
- `handleApplySelected` は `useCallback` で依存配列 `[analysis, selectedSuggestions, skillName, applySkillImprovements]`。`applySkillImprovements` は安定参照
- `handleAutoImprove` は `useCallback` で依存配列 `[skillName, autoImproveSkill]`。`autoImproveSkill` は安定参照
- `useEffect(() => { handleAnalyze(); }, [handleAnalyze])` でマウント時に自動分析実行。`handleAnalyze` が安定参照であるため、`skillName` 変更時のみ再実行される

#### 変更不要の確認

useSkillAnalysis フックは store 駆動統合が完了しているため、本タスクでの変更は不要である。テストのみ追加/拡充する。

### 3. SkillManagementPanel の統合コンテキスト

#### 現在の実装状態

SkillManagementPanel は TASK-10A-D で SkillAnalysisView と SkillCreateWizard のビュー統合が完了している:

```tsx
// SkillManagementPanel.tsx（関連箇所）
if (currentView === "editor" && selectedSkill) {
  return <SkillEditor skill={selectedSkill} onClose={handleBackToList} />;
}
if (currentView === "analysis" && selectedSkill) {
  return (
    <SkillAnalysisView
      skillName={String(selectedSkill.name)}
      onClose={handleBackToList}
    />
  );
}
if (currentView === "create") {
  return <SkillCreateWizard onClose={handleBackToList} />;
}
```

#### 設計ポイント

- SkillManagementPanel 自体は store 個別セレクタ経由で状態を取得している（`useImportedSkills`, `useFetchSkills`, `useRemoveSkill` 等）
- SkillAnalysisView / SkillCreateWizard への遷移は SkillManagementPanel のローカル `currentView` 状態で制御される
- SkillAnalysisView / SkillCreateWizard 内部の IPC 通信は store action 経由で実行される

## 状態遷移表

### analyzeSkill action

| 現在の状態                              | トリガー                         | 遷移後の状態                                                 |
| --------------------------------------- | -------------------------------- | ------------------------------------------------------------ |
| `isAnalyzing: false, skillError: null`  | `analyzeSkill(skillName)` 呼出   | `isAnalyzing: true, skillError: null, currentAnalysis: null` |
| `isAnalyzing: true`                     | Preload API 成功                 | `isAnalyzing: false, currentAnalysis: {結果}`                |
| `isAnalyzing: true`                     | Preload API 失敗                 | `isAnalyzing: false, skillError: "スキル分析に失敗..."`      |
| `isAnalyzing: false, skillError: "..."` | `analyzeSkill(skillName)` 再呼出 | `isAnalyzing: true, skillError: null, currentAnalysis: null` |

### applySkillImprovements action

| 現在の状態                             | トリガー                                         | 遷移後の状態                                          |
| -------------------------------------- | ------------------------------------------------ | ----------------------------------------------------- |
| `isImproving: false, skillError: null` | `applySkillImprovements(skillName, suggestions)` | `isImproving: true, skillError: null`                 |
| `isImproving: true`                    | Preload API 成功 + 再分析成功                    | `isImproving: false, currentAnalysis: {更新結果}`     |
| `isImproving: true`                    | Preload API 失敗                                 | `isImproving: false, skillError: "改善適用に失敗..."` |

### autoImproveSkill action

| 現在の状態                             | トリガー                      | 遷移後の状態                                            |
| -------------------------------------- | ----------------------------- | ------------------------------------------------------- |
| `isImproving: false, skillError: null` | `autoImproveSkill(skillName)` | `isImproving: true, skillError: null`                   |
| `isImproving: true`                    | Preload API 成功 + 再分析成功 | `isImproving: false, currentAnalysis: {更新結果}`       |
| `isImproving: true`                    | Preload API 失敗              | `isImproving: false, skillError: "全自動改善に失敗..."` |

### createSkill action

| 現在の状態         | トリガー                                 | 遷移後の状態                                           |
| ------------------ | ---------------------------------------- | ------------------------------------------------------ |
| `skillError: null` | `createSkill(description, options)` 呼出 | `skillError: null`（ローカル `isGenerating` は別管理） |
| 処理中             | Preload API 成功                         | `skillError: null` + `fetchSkills()` 呼出 + パス返却   |
| 処理中             | Preload API 失敗                         | `skillError: "スキル作成に失敗..."` + 空文字列返却     |

### バリデーション失敗時

| 現在の状態 | トリガー                                                        | 遷移後の状態                                         |
| ---------- | --------------------------------------------------------------- | ---------------------------------------------------- |
| 任意       | `typeof skillName !== "string"`                                 | `skillError: "スキル名が無効です"` + 早期 return     |
| 任意       | `skillName === ""`                                              | `skillError: "スキル名が無効です"` + 早期 return     |
| 任意       | `skillName.trim() === ""`                                       | `skillError: "スキル名が無効です"` + 早期 return     |
| 任意       | `typeof description !== "string"` / `description.trim() === ""` | `skillError: "スキルの説明が無効です"` + 早期 return |

## P31 再発防止条件

### ルール 1: 個別セレクタパターンの強制

全ての store 状態と action は個別セレクタで取得する:

```typescript
// P31対策準拠パターン
const analysis = useCurrentAnalysis(); // state
const isAnalyzing = useIsAnalyzingSkill(); // state
const analyzeSkill = useAnalyzeSkill(); // action

// 禁止パターン（合成Hook）
const { analysis, isAnalyzing, analyzeSkill } = useAnalysisStore(); // 禁止
```

### ルール 2: action 参照の安定性保証

Zustand の action 参照は Store 作成時に固定されるため、`useEffect` の依存配列に含めても安全:

```typescript
// 安全: analyzeSkill は安定参照
const handleAnalyze = useCallback(async () => {
  await analyzeSkill(skillName);
}, [analyzeSkill, skillName]);

useEffect(() => {
  handleAnalyze();
}, [handleAnalyze]); // skillName 変更時のみ再実行
```

### ルール 3: 派生セレクタの useShallow 適用基準

本タスクの個別セレクタはプリミティブ値（`boolean`, `string | null`）またはオブジェクト参照（`SkillAnalysis | null`）を返すため、`useShallow` は不要:

| セレクタ                    | 戻り値型                | useShallow |
| --------------------------- | ----------------------- | ---------- |
| `useCurrentAnalysis`        | `SkillAnalysis \| null` | 不要       |
| `useIsAnalyzingSkill`       | `boolean`               | 不要       |
| `useIsImprovingSkill`       | `boolean`               | 不要       |
| `useSkillError`             | `string \| null`        | 不要       |
| `useAnalyzeSkill`           | `Function`              | 不要       |
| `useApplySkillImprovements` | `Function`              | 不要       |
| `useAutoImproveSkill`       | `Function`              | 不要       |
| `useCreateSkill`            | `Function`              | 不要       |

### ルール 4: ローカル状態と Store 状態の境界

| 状態                  | 配置先 | 理由                                                             |
| --------------------- | ------ | ---------------------------------------------------------------- |
| `currentAnalysis`     | Store  | 分析結果は改善 action と連携するためアプリ全体で共有             |
| `isAnalyzing`         | Store  | 複数コンポーネントが分析中状態を参照する可能性がある             |
| `isImproving`         | Store  | 同上                                                             |
| `skillError`          | Store  | エラー表示が複数コンポーネントで共有される                       |
| `selectedSuggestions` | Local  | SkillAnalysisView 固有の UI 操作状態                             |
| `improvementResult`   | Local  | SkillAnalysisView 固有の UI 表示状態                             |
| `description`         | Local  | SkillCreateWizard 固有のフォーム入力状態                         |
| `options`             | Local  | SkillCreateWizard 固有の設定状態                                 |
| `isGenerating`        | Local  | SkillCreateWizard 固有の生成中表示（store の action 完了と独立） |
| `error`               | Local  | SkillCreateWizard 固有のエラー表示                               |
| `skillPath`           | Local  | SkillCreateWizard 固有の完了ステップ表示                         |

## TASK-10A-G 回帰テスト観点

### 回帰テストマトリクス

| ID    | 観点                   | 前提条件                                     | 操作                                  | 期待結果                                                              | 関連 FR |
| ----- | ---------------------- | -------------------------------------------- | ------------------------------------- | --------------------------------------------------------------------- | ------- |
| RT-01 | 作成後一覧同期         | スキル一覧にスキルが0件                      | SkillCreateWizard でスキルを作成する  | 一覧に作成したスキルが表示される                                      | FR-1    |
| RT-02 | 改善後再分析           | 分析結果にスコア 60 が表示されている         | 提案を選択して改善を適用する          | 再分析が実行され、更新されたスコアが表示される                        | FR-3    |
| RT-03 | 全自動改善後再分析     | 分析結果が表示されている                     | 全自動改善を実行する                  | 再分析が実行され、更新された分析結果が表示される                      | FR-3    |
| RT-04 | エラー回復             | 分析でネットワークエラーが発生した           | 再度分析を実行する                    | エラーがクリアされ、正常に分析が完了する                              | FR-5    |
| RT-05 | 状態初期化             | SkillAnalysisView で分析結果が表示されている | ビューを閉じて別のスキルで再度開く    | 前回の分析結果がクリアされ、新しいスキルの分析が実行される            | FR-2    |
| RT-06 | 分析→改善→再分析フロー | SkillAnalysisView が表示されている           | 分析 → 提案選択 → 改善適用 → 結果確認 | 全フローが store action 経由で実行され、状態遷移が正常に完了する      | FR-2, 3 |
| RT-07 | 並行操作防止           | 分析が実行中（`isAnalyzing: true`）          | 改善適用を試みる                      | `isAnalyzing` 中は改善ボタンが無効化されている（UI レベルの排他制御） | FR-4    |

## テスト戦略

### テストファイル構成

| テストファイル                             | テスト対象                                                       | テスト数（推定） |
| ------------------------------------------ | ---------------------------------------------------------------- | ---------------- |
| `SkillCreateWizard.test.tsx`（既存拡充）   | `useCreateSkill` 経由のスキル作成、エラーハンドリング            | 8                |
| `SkillAnalysisView.test.tsx`（既存拡充）   | store action 経由の分析/改善、状態遷移                           | 12               |
| `useSkillAnalysis.test.ts`（新規）         | フック単体テスト、P31 対策検証、状態遷移検証                     | 15               |
| `agentSlice.lifecycle.test.ts`（既存拡充） | analyzeSkill/applySkillImprovements/autoImproveSkill/createSkill | 16               |

### モック方針

- `window.electronAPI.skill` は `vi.fn()` で各メソッドをモック化する
- agentSlice テストでは `useAppStore.getState()` / `useAppStore.setState()` で直接状態を検証する
- コンポーネントテストでは `@testing-library/react` の `renderHook` / `render` + `fireEvent` を使用する
- happy-dom 環境で実行する（P39 対策: userEvent 不使用）

## アーキテクチャ層別設計

### Renderer 層の変更一覧

| ファイル                                           | 変更種別 | 変更内容                                                 |
| -------------------------------------------------- | -------- | -------------------------------------------------------- |
| `SkillCreateWizard.tsx`                            | 変更なし | 既に `useCreateSkill` 経由。テストのみ拡充               |
| `hooks/useSkillAnalysis.ts`                        | 変更なし | 既に store action 経由。テストのみ拡充                   |
| `SkillManagementPanel.tsx`                         | 変更なし | 既に SkillAnalysisView/SkillCreateWizard 統合済み        |
| `__tests__/SkillCreateWizard.test.tsx`             | 修正     | store action 経由の検証テスト追加（約8テスト）           |
| `__tests__/SkillAnalysisView.test.tsx`             | 修正     | store action 経由の分析/改善検証テスト追加（約12テスト） |
| `hooks/__tests__/useSkillAnalysis.test.ts`（新規） | 新規     | フック単体テスト、P31 対策検証（約15テスト）             |

### Store 層（変更なし）

agentSlice の `analyzeSkill`, `applySkillImprovements`, `autoImproveSkill`, `createSkill` action と対応する個別セレクタは TASK-10A-D で実装済み。

### IPC 通信層（変更なし）

IPC ハンドラおよび Preload API の変更は不要。以下の既存 API を使用する:

| Preload API                                       | IPC チャンネル                         | 用途           |
| ------------------------------------------------- | -------------------------------------- | -------------- |
| `skill.analyze(skillName)`                        | `skill:analyze`                        | スキル分析     |
| `skill.applyImprovements(skillName, suggestions)` | `skill:improve`                        | 選択改善適用   |
| `skill.autoImprove(skillName)`                    | `skill:improve` (options.autoFix=true) | 全自動改善     |
| `skill.create({ description, options })`          | `skill:create`                         | スキル新規作成 |

## 統合テスト連携

### テスト対象の store action 連携

| テストシナリオ   | store action 呼出順序                             | 検証ポイント                                    |
| ---------------- | ------------------------------------------------- | ----------------------------------------------- |
| スキル作成フロー | `createSkill` → `fetchSkills`                     | 一覧にスキルが追加される                        |
| 分析フロー       | `analyzeSkill`                                    | `currentAnalysis` に結果が格納される            |
| 選択改善フロー   | `applySkillImprovements` → `analyzeSkill`（自動） | `currentAnalysis` が更新結果で上書きされる      |
| 全自動改善フロー | `autoImproveSkill` → `analyzeSkill`（自動）       | `currentAnalysis` が更新結果で上書きされる      |
| エラー回復フロー | `analyzeSkill`（失敗） → `analyzeSkill`（成功）   | `skillError` がクリアされ、正常結果が格納される |

### TASK-10A-G への引き渡し情報

Phase 2 で定義した回帰テストマトリクス（RT-01〜RT-07）を TASK-10A-G の統合テスト仕様に引き渡す。各 RT 項目は以下の形式で TASK-10A-G テストケースに対応付ける:

| RT-ID | TASK-10A-G テストケース名（推定）               |
| ----- | ----------------------------------------------- |
| RT-01 | `IT-CREATE-SYNC: 作成後一覧同期`                |
| RT-02 | `IT-IMPROVE-REANALYZE: 選択改善後再分析`        |
| RT-03 | `IT-AUTO-IMPROVE-REANALYZE: 全自動改善後再分析` |
| RT-04 | `IT-ERROR-RECOVERY: エラー後リトライ`           |
| RT-05 | `IT-STATE-RESET: ビュー再開時状態初期化`        |
| RT-06 | `IT-FULL-FLOW: 分析→改善→再分析フルフロー`      |
| RT-07 | `IT-CONCURRENT-GUARD: 並行操作排他制御`         |

## 成果物

| 成果物 | パス                | 説明           |
| ------ | ------------------- | -------------- |
| 設計書 | `phase-2-design.md` | 本ドキュメント |

## 完了条件

- [ ] SkillCreateWizard の store 駆動設計が、現在の実装との差分分析を含めて記載されている
- [ ] useSkillAnalysis フックの store 駆動設計が、現在の実装との差分分析を含めて記載されている
- [ ] 状態遷移表が全 action（analyzeSkill, applySkillImprovements, autoImproveSkill, createSkill）の成功/失敗/再試行/バリデーション失敗を網羅している
- [ ] P31 再発防止条件（ルール 1〜4）が明文化されている
- [ ] ローカル/Store 状態の境界が全状態変数について定義されている
- [ ] TASK-10A-G 回帰テストマトリクス（RT-01〜RT-07）が定義されている
- [ ] テスト戦略（ファイル構成・テスト数推定・モック方針）が記載されている
- [ ] アーキテクチャ層別の変更一覧が全ファイルについて記載されている

## 次のPhase

Phase 3: 設計レビュー → `phase-3-design-review.md`
