# TASK-10A-F 設計書

## メタ情報

| 項目     | 値                            |
| -------- | ----------------------------- |
| タスクID | TASK-10A-F                    |
| 機能名   | Store駆動ライフサイクルUI統合 |
| Phase    | 2 - 設計                      |
| 作成日   | 2026-03-07                    |
| 状態     | 完了                          |

## 目的

Phase 1 で定義された FR-1〜FR-6 と NFR-1〜NFR-5 に基づき、直接 IPC 呼び出しを store action 経由に置換するための具体的な設計を行う。

## 案B（内部セレクタ方式）の採用根拠

### 案A vs 案B の比較

| 観点                 | 案A（Props注入方式）                                          | 案B（内部セレクタ方式）                                        |
| -------------------- | ------------------------------------------------------------- | -------------------------------------------------------------- |
| 変更範囲             | useSkillAnalysis の引数変更 + 呼び出し元の修正が必要          | useSkillAnalysis 内部のみの変更で完結                          |
| テスト容易性         | DI でモック注入可能（テストしやすい）                         | store セレクタのモックが必要（vi.mock で対応可能）             |
| P31 対策             | 個別セレクタを呼び出し元で使用 → useEffect 依存配列に渡す必要 | useSkillAnalysis 内部で個別セレクタを使用 → 内部で完結         |
| 後方互換性           | `UseSkillAnalysisReturn` は維持できるが、フック引数が変わる   | フック引数もインターフェースも変更不要                         |
| 既存パターンとの整合 | 既存コードに Props 注入パターンは少ない                       | SkillImportDialog 等と同じ「内部セレクタ」パターンに統一される |

### 採用結論: 案B

理由:

1. **変更範囲の最小化**: useSkillAnalysis の呼び出し元（SkillAnalysisView）の修正が不要
2. **既存パターンとの統一**: SkillImportDialog が内部で store セレクタを使用しているパターンと一致する
3. **後方互換性の完全維持**: フック引数の型を変更しないため、TypeScript コンパイルエラーが発生しない

## useSkillAnalysis 変更前/変更後のデータフロー

### 変更前

```
useSkillAnalysis(skillName)
  ├── [ローカル useState]
  │     analysis, isAnalyzing, isImproving, error, selectedSuggestions, improvementResult
  │
  ├── handleAnalyze()
  │     └── window.electronAPI.skill.analyze(skillName)  ← 直接IPC
  │           └── setAnalysis(result) / setError(message)
  │
  ├── handleApplySelected()
  │     └── window.electronAPI.skill.applyImprovements(skillName, selected)  ← 直接IPC
  │           └── setImprovementResult(result) → handleAnalyze() 再呼び出し
  │
  └── handleAutoImprove()
        └── window.electronAPI.skill.autoImprove(skillName)  ← 直接IPC
              └── setImprovementResult(result) → handleAnalyze() 再呼び出し
```

### 変更後

```
useSkillAnalysis(skillName)
  ├── [store セレクタ（P31対策: 個別セレクタ）]
  │     useAnalyzeSkill()           → analyzeSkill 関数
  │     useApplySkillImprovements() → applySkillImprovements 関数
  │     useAutoImproveSkill()       → autoImproveSkill 関数
  │     useCurrentAnalysis()        → analysis 値（store参照）
  │     useIsAnalyzingSkill()       → isAnalyzing 値（store参照）
  │     useIsImprovingSkill()       → isImproving 値（store参照）
  │     useSkillError()             → error 値（store参照）
  │
  ├── [ローカル useState（UIのみの状態）]
  │     selectedSuggestions, improvementResult
  │
  ├── handleAnalyze()
  │     └── analyzeSkill(skillName)  ← store action 経由
  │           └── store が currentAnalysis を自動更新
  │
  ├── handleApplySelected()
  │     └── applySkillImprovements(skillName, selected)  ← store action 経由
  │           └── store が再分析を自動実行、currentAnalysis を更新
  │
  └── handleAutoImprove()
        └── autoImproveSkill(skillName)  ← store action 経由
              └── store が再分析を自動実行、currentAnalysis を更新
```

## 状態管理方針: store状態とローカル状態の統合テーブル

| 状態                  | 変更前              | 変更後                     | 参照方法                              | 統合理由                                                    |
| --------------------- | ------------------- | -------------------------- | ------------------------------------- | ----------------------------------------------------------- |
| `analysis`            | ローカル `useState` | store 参照                 | `useCurrentAnalysis()`                | store action が結果を直接格納するため、ローカル管理不要     |
| `isAnalyzing`         | ローカル `useState` | store 参照                 | `useIsAnalyzingSkill()`               | store action が true/false を管理するため、ローカル管理不要 |
| `isImproving`         | ローカル `useState` | store 参照                 | `useIsImprovingSkill()`               | store action が true/false を管理するため、ローカル管理不要 |
| `error`               | ローカル `useState` | store 参照                 | `useSkillError()`                     | store action のエラーが skillError に格納されるため         |
| `selectedSuggestions` | ローカル `useState` | ローカル `useState` を維持 | `useState<Set<number>>`               | UIのみの状態。store に持つ必要なし                          |
| `improvementResult`   | ローカル `useState` | ローカル `useState` を維持 | `useState<ImprovementResult \| null>` | 一時的なUI状態。store action は void を返すため             |

## SkillCreateWizard の変更設計

### 変更方針

`useCreateSkill()` 個別セレクタを使用し、`handleGenerate` 内の直接IPC呼び出しを store action に置換する。

### 変更後のコード設計

```typescript
import { useCreateSkill } from "../../../store";

export const SkillCreateWizard = React.forwardRef<
  HTMLDivElement,
  SkillCreateWizardProps
>(({ onClose }, ref) => {
  const createSkill = useCreateSkill(); // P31対策: 個別セレクタ
  const { currentStep, goNext, goBack, goToStep } = useWizardStep(STEPS.length);
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState<WizardOptions>(DEFAULT_OPTIONS);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [skillPath, setSkillPath] = useState<string | null>(null);

  const handleGenerate = async () => {
    goToStep(2);
    setIsGenerating(true);
    setError(null);
    try {
      const resultPath = await createSkill(description, options);
      if (resultPath) {
        setSkillPath(resultPath);
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
  // ... 残りは変更なし
});
```

### 設計ポイント

1. **`useCreateSkill()` セレクタ**: agentSlice の `createSkill` アクションは `Promise<string>` を返す（成功時はスキルパス、失敗時は空文字列 `""`）
2. **戻り値の判定**: `resultPath` が truthy（空文字列でない）の場合に `setSkillPath` と `goToStep(3)` を実行
3. **`isGenerating` ローカルステート維持**: ウィザードのステップ遷移制御に使用するため、store の状態に移動しない
4. **`error` ローカルステート維持**: SkillCreateWizard 固有のエラー表示に使用。store の `skillError` とは独立管理

### インポート変更

```diff
+ import { useCreateSkill } from "../../../store";
```

## テストモック戦略

### SkillCreateWizard.test.tsx のモック設計

```typescript
import { vi } from "vitest";

const mockCreateSkill = vi.fn();

vi.mock("../../../store", () => ({
  useCreateSkill: () => mockCreateSkill,
}));

beforeEach(() => {
  mockCreateSkill.mockReset();
});

// テストケース例
it("生成ボタンクリックで createSkill が呼び出される", async () => {
  mockCreateSkill.mockResolvedValue("/path/to/skill");
  // ... render + fireEvent.click
  expect(mockCreateSkill).toHaveBeenCalledWith(
    "test description",
    DEFAULT_OPTIONS,
  );
});
```

### SkillAnalysisView.test.tsx のモック設計

```typescript
import { vi } from "vitest";

const mockAnalyzeSkill = vi.fn();
const mockApplySkillImprovements = vi.fn();
const mockAutoImproveSkill = vi.fn();

let mockCurrentAnalysis: SkillAnalysis | null = null;
let mockIsAnalyzing = false;
let mockIsImproving = false;
let mockSkillError: string | null = null;

vi.mock("../../../../store", () => ({
  useAnalyzeSkill: () => mockAnalyzeSkill,
  useApplySkillImprovements: () => mockApplySkillImprovements,
  useAutoImproveSkill: () => mockAutoImproveSkill,
  useCurrentAnalysis: () => mockCurrentAnalysis,
  useIsAnalyzingSkill: () => mockIsAnalyzing,
  useIsImprovingSkill: () => mockIsImproving,
  useSkillError: () => mockSkillError,
}));

beforeEach(() => {
  mockAnalyzeSkill.mockReset();
  mockApplySkillImprovements.mockReset();
  mockAutoImproveSkill.mockReset();
  mockCurrentAnalysis = null;
  mockIsAnalyzing = false;
  mockIsImproving = false;
  mockSkillError = null;
});
```

### テスト設計上の注意

- `window.electronAPI` のモック設定を完全に削除し、store セレクタモックに統一する
- テスト間で `mockReset()` を呼び出し、状態リークを防止する（P9 対策）
- happy-dom 環境では `userEvent` は使用禁止、`fireEvent` を使用する（P39 対策）
- テスト実行は `apps/desktop/` ディレクトリから行う（P40 対策）

## P31/P48 対策設計

### P31 対策: 個別セレクタの使用

useSkillAnalysis 内で使用する全ての store 参照:

| セレクタ                      | 返却型                                                            | 使用箇所                         | 安定性                             |
| ----------------------------- | ----------------------------------------------------------------- | -------------------------------- | ---------------------------------- |
| `useAnalyzeSkill()`           | `(skillName: string) => Promise<void>`                            | `handleAnalyze` 依存配列         | Zustand アクション参照（安定）     |
| `useApplySkillImprovements()` | `(skillName: string, suggestions: Suggestion[]) => Promise<void>` | `handleApplySelected` 依存配列   | Zustand アクション参照（安定）     |
| `useAutoImproveSkill()`       | `(skillName: string) => Promise<void>`                            | `handleAutoImprove` 依存配列     | Zustand アクション参照（安定）     |
| `useCurrentAnalysis()`        | `SkillAnalysis \| null`                                           | `handleSelectAutoFixable` で参照 | Zustand 状態参照（変更時のみ更新） |
| `useIsAnalyzingSkill()`       | `boolean`                                                         | 戻り値に直接使用                 | Zustand 状態参照（変更時のみ更新） |
| `useIsImprovingSkill()`       | `boolean`                                                         | 戻り値に直接使用                 | Zustand 状態参照（変更時のみ更新） |
| `useSkillError()`             | `string \| null`                                                  | 戻り値に直接使用                 | Zustand 状態参照（変更時のみ更新） |

SkillCreateWizard で使用するセレクタ:

| セレクタ           | 返却型                                                     | 使用箇所         | 安定性                         |
| ------------------ | ---------------------------------------------------------- | ---------------- | ------------------------------ |
| `useCreateSkill()` | `(description: string, options: {...}) => Promise<string>` | `handleGenerate` | Zustand アクション参照（安定） |

合計8個の個別セレクタを使用。合成 Hook（オブジェクトを返す形式）は一切使用しない。

### P48 対策: useShallow 適用判定

| プロパティ            | 型                          | `.filter()` / `.map()` 使用 | P48 該当 |
| --------------------- | --------------------------- | --------------------------- | -------- |
| `analysis`            | `SkillAnalysis \| null`     | なし                        | 非該当   |
| `isAnalyzing`         | `boolean`                   | なし                        | 非該当   |
| `isImproving`         | `boolean`                   | なし                        | 非該当   |
| `selectedSuggestions` | `Set<number>`               | なし（ローカル状態）        | 非該当   |
| `error`               | `string \| null`            | なし                        | 非該当   |
| `improvementResult`   | `ImprovementResult \| null` | なし（ローカル状態）        | 非該当   |

**結論**: P48 対策の `useShallow` 適用は不要。全セレクタがプリミティブ値またはオブジェクト参照を返し、配列生成を行うセレクタは存在しない。

## アーキテクチャ層別設計

### Renderer 層の変更一覧

| ファイル                               | 変更種別 | 変更内容                                                                                                                       |
| -------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `hooks/useSkillAnalysis.ts`            | 修正     | import 8行変更、ローカル useState 4個削除、store セレクタ7個追加、handleAnalyze/handleApplySelected/handleAutoImprove 書き換え |
| `SkillCreateWizard.tsx`                | 修正     | import 1行追加、`useCreateSkill()` 呼び出し1行追加、handleGenerate 内の IPC 呼び出しを store action に置換                     |
| `__tests__/SkillCreateWizard.test.tsx` | 修正     | `window.electronAPI` モック削除、store セレクタモック追加                                                                      |
| `__tests__/SkillAnalysisView.test.tsx` | 修正     | `window.electronAPI` モック削除、store セレクタモック追加                                                                      |

### IPC 通信層（変更なし）

本タスクで IPC ハンドラおよび Preload API の変更は不要。agentSlice 内の既存 store action が Preload API 経由で IPC を呼び出す構造を維持する。

### store action 経由の API 契約

| 呼び出し元        | store action             | Preload API（agentSlice 内部）                    | 検証ポイント                                             |
| ----------------- | ------------------------ | ------------------------------------------------- | -------------------------------------------------------- |
| useSkillAnalysis  | `analyzeSkill`           | `window.electronAPI.skill.analyze(skillName)`     | `currentAnalysis` に分析結果が格納される                 |
| useSkillAnalysis  | `applySkillImprovements` | `window.electronAPI.skill.applyImprovements(...)` | 改善適用後に再分析が自動実行される                       |
| useSkillAnalysis  | `autoImproveSkill`       | `window.electronAPI.skill.autoImprove(skillName)` | 全自動改善後に再分析が自動実行される                     |
| SkillCreateWizard | `createSkill`            | `window.electronAPI.skill.create({...})`          | スキルパス文字列が返され、`fetchSkills()` が再実行される |
