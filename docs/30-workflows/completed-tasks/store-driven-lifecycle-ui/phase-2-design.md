# Phase 2: 設計

## メタ情報

| 項目   | 値                                       |
| ------ | ---------------------------------------- |
| Phase  | 2                                        |
| 機能名 | TASK-10A-F Store駆動ライフサイクルUI統合 |
| 作成日 | 2026-03-07                               |
| 状態   | 未着手                                   |

## 目的

Phase 1 で定義された機能要件 FR-1〜FR-6 と非機能要件 NFR-1〜NFR-5 に基づき、直接 IPC 呼び出しを store action 経由に置換するための具体的な設計を行う。useSkillAnalysis フックと SkillCreateWizard コンポーネントの修正方針、テストのモック戦略を決定する。

## 実行タスク

- useSkillAnalysis フックのリファクタリング設計: 案A/案Bの比較評価と最終方針決定
- SkillCreateWizard のリファクタリング設計: store action 注入の具体的なコード設計
- 状態遷移設計: store action 経由の状態遷移フロー
- テストモック戦略設計: store action モック方式の決定
- P31/P48 対策設計: 個別セレクタ使用の具体的な実装パターン

## 参照資料

| 資料名                  | パス                                                                   |
| ----------------------- | ---------------------------------------------------------------------- |
| Phase 1 要件定義        | `docs/30-workflows/store-driven-lifecycle-ui/phase-1-requirements.md`  |
| SkillCreateWizard 実装  | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`     |
| useSkillAnalysis フック | `apps/desktop/src/renderer/components/skill/hooks/useSkillAnalysis.ts` |
| agentSlice 定義         | `apps/desktop/src/renderer/store/slices/agentSlice.ts`                 |
| Store index（セレクタ） | `apps/desktop/src/renderer/store/index.ts`                             |
| P31 対策ルール          | `.claude/rules/06-known-pitfalls.md#P31`                               |
| P48 対策ルール          | `.claude/rules/06-known-pitfalls.md#P48`                               |
| 状態管理ルール          | `.claude/rules/03-state-management.md`                                 |

## 設計方針

### 採用する設計

1. **案B（内部セレクタ方式）**: useSkillAnalysis 内部で `useAnalyzeSkill()` 等の個別セレクタを直接呼び出す
2. **SkillCreateWizard 直接セレクタ方式**: コンポーネント内で `useCreateSkill()` を直接呼び出す
3. **store action + ローカルステート共存方式**: store action の結果をローカルステートに反映する
4. **store action モック方式**: テストで store セレクタをモック化する

### 判断根拠

#### 案A vs 案B の比較

| 観点                 | 案A（Props注入方式）                                          | 案B（内部セレクタ方式）                                        |
| -------------------- | ------------------------------------------------------------- | -------------------------------------------------------------- |
| 変更範囲             | useSkillAnalysis の引数変更 + 呼び出し元の修正が必要          | useSkillAnalysis 内部のみの変更で完結                          |
| テスト容易性         | DI でモック注入可能（テストしやすい）                         | store セレクタのモックが必要（vi.mock で対応可能）             |
| P31 対策             | 個別セレクタを呼び出し元で使用 → useEffect 依存配列に渡す必要 | useSkillAnalysis 内部で個別セレクタを使用 → 内部で完結         |
| 後方互換性           | `UseSkillAnalysisReturn` は維持できるが、フック引数が変わる   | フック引数もインターフェースも変更不要                         |
| 既存パターンとの整合 | 既存コードに Props 注入パターンは少ない                       | SkillImportDialog 等と同じ「内部セレクタ」パターンに統一される |

**結論**: 案B を採用する。理由は以下の3点:

1. **変更範囲の最小化**: useSkillAnalysis の呼び出し元（SkillAnalysisView）の修正が不要
2. **既存パターンとの統一**: SkillImportDialog が `useAppStore((state) => state.importSkill)` を内部で使用しているパターンと一致する
3. **後方互換性の完全維持**: フック引数の型を変更しないため、TypeScript コンパイルエラーが発生しない

## コンポーネント設計

### 1. useSkillAnalysis フックのリファクタリング設計

#### 変更前のデータフロー

```
useSkillAnalysis(skillName)
  └── handleAnalyze()
        └── window.electronAPI.skill.analyze(skillName)  ← 直接IPC
  └── handleApplySelected()
        └── window.electronAPI.skill.applyImprovements(skillName, selected)  ← 直接IPC
  └── handleAutoImprove()
        └── window.electronAPI.skill.autoImprove(skillName)  ← 直接IPC
```

#### 変更後のデータフロー

```
useSkillAnalysis(skillName)
  ├── useAnalyzeSkill()  ← 個別セレクタ
  ├── useApplySkillImprovements()  ← 個別セレクタ
  ├── useAutoImproveSkill()  ← 個別セレクタ
  ├── useCurrentAnalysis()  ← 個別セレクタ（store の分析結果を参照）
  ├── useIsAnalyzingSkill()  ← 個別セレクタ
  └── useIsImprovingSkill()  ← 個別セレクタ
  │
  └── handleAnalyze()
        └── analyzeSkill(skillName)  ← store action 経由
  └── handleApplySelected()
        └── applySkillImprovements(skillName, selected)  ← store action 経由
  └── handleAutoImprove()
        └── autoImproveSkill(skillName)  ← store action 経由
```

#### 状態管理方針: store 状態とローカル状態の統合

useSkillAnalysis はローカル `useState` で `analysis`, `isAnalyzing`, `isImproving` を管理している。store にも同名の状態がある。以下の方針で統合する:

| 状態                  | 変更前（ローカル useState）   | 変更後（store 参照）                          |
| --------------------- | ----------------------------- | --------------------------------------------- |
| `analysis`            | `useState<SkillAnalysis>`     | `useCurrentAnalysis()` セレクタで store 参照  |
| `isAnalyzing`         | `useState<boolean>`           | `useIsAnalyzingSkill()` セレクタで store 参照 |
| `isImproving`         | `useState<boolean>`           | `useIsImprovingSkill()` セレクタで store 参照 |
| `selectedSuggestions` | `useState<Set<number>>`       | ローカル `useState` を維持（UIのみの状態）    |
| `error`               | `useState<string>`            | `useSkillError()` セレクタで store 参照       |
| `improvementResult`   | `useState<ImprovementResult>` | ローカル `useState` を維持（一時的なUI状態）  |

#### useSkillAnalysis 変更後のコード設計

```typescript
import {
  useAnalyzeSkill,
  useApplySkillImprovements,
  useAutoImproveSkill,
  useCurrentAnalysis,
  useIsAnalyzingSkill,
  useIsImprovingSkill,
  useSkillError,
} from "../../../store";

export const useSkillAnalysis = (skillName: string): UseSkillAnalysisReturn => {
  // ---- Store Selectors (P31対策: 個別セレクタ使用) ----
  const analyzeSkill = useAnalyzeSkill();
  const applySkillImprovements = useApplySkillImprovements();
  const autoImproveSkill = useAutoImproveSkill();
  const currentAnalysis = useCurrentAnalysis();
  const isAnalyzing = useIsAnalyzingSkill();
  const isImproving = useIsImprovingSkill();
  const skillError = useSkillError();

  // ---- Local State (UIのみの状態) ----
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<number>>(
    new Set(),
  );
  const [improvementResult, setImprovementResult] =
    useState<ImprovementResult | null>(null);
  const isMountedRef = useRef(true);

  // ---- Handlers ----

  const handleAnalyze = useCallback(async () => {
    if (!isMountedRef.current) return;
    await analyzeSkill(skillName);
    if (isMountedRef.current) {
      setSelectedSuggestions(new Set());
    }
  }, [analyzeSkill, skillName]);

  const handleToggleSuggestion = useCallback((index: number) => {
    setSelectedSuggestions((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }, []);

  const handleSelectAutoFixable = useCallback(() => {
    if (!currentAnalysis) return;
    setSelectedSuggestions(
      buildAutoFixableSelection(currentAnalysis.suggestions),
    );
  }, [currentAnalysis]);

  const handleApplySelected = useCallback(async () => {
    if (!currentAnalysis || selectedSuggestions.size === 0) return;

    const selected: Suggestion[] = [];
    for (const index of selectedSuggestions) {
      if (currentAnalysis.suggestions[index]) {
        selected.push(currentAnalysis.suggestions[index]);
      }
    }

    await applySkillImprovements(skillName, selected);
    if (!isMountedRef.current) return;

    // 改善適用結果のプレビュー表示
    // NOTE: improvementResult は store action 内で管理されないため、
    // Preload API 戻り値を直接取得する必要がある。
    // store action は void を返すため、結果のプレビュー表示は
    // store の currentAnalysis 更新を検知して判定する。
    setImprovementResult(null);
    setSelectedSuggestions(new Set());
  }, [currentAnalysis, selectedSuggestions, skillName, applySkillImprovements]);

  const handleAutoImprove = useCallback(async () => {
    const isConfirmed = window.confirm("全自動改善を実行しますか？");
    if (!isConfirmed) return;

    await autoImproveSkill(skillName);
    if (isMountedRef.current) {
      setImprovementResult(null);
    }
  }, [skillName, autoImproveSkill]);

  // ---- Effects ----

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    handleAnalyze();
  }, [handleAnalyze]);

  return {
    analysis: currentAnalysis,
    isAnalyzing,
    isImproving,
    selectedSuggestions,
    error: skillError,
    improvementResult,
    handleAnalyze,
    handleToggleSuggestion,
    handleSelectAutoFixable,
    handleApplySelected,
    handleAutoImprove,
  };
};
```

#### 設計上の注意点

1. **`analysis` プロパティ**: ローカル useState を削除し、`useCurrentAnalysis()` の値を直接返す。store action (`analyzeSkill`) が `currentAnalysis` を更新するため、フック利用側では自動的に最新の分析結果を受け取れる

2. **`isAnalyzing` / `isImproving`**: ローカル useState を削除し、store セレクタの値を直接返す。store action が `isAnalyzing` / `isImproving` の true/false を管理するため、フック側での制御は不要

3. **`error` プロパティ**: ローカル `error` useState を削除し、`useSkillError()` の値を直接返す。store action のエラーハンドリングで `skillError` に格納されるため

4. **`improvementResult`**: store action は改善結果を直接返さず void を返す。改善結果のプレビュー表示は簡略化し、store の `currentAnalysis` 更新に基づいて判定する。`improvementResult` はローカル useState で維持するが、Preload API の直接戻り値は取得できないため、改善成功時は `null` として扱う

5. **`selectedSuggestions`**: UI のみの状態であるため、ローカル useState を維持する

### 2. SkillCreateWizard のリファクタリング設計

#### 変更前のコード（handleGenerate 関数）

```typescript
const handleGenerate = async () => {
  goToStep(2);
  setIsGenerating(true);
  setError(null);
  try {
    const result = await window.electronAPI.skill.create({
      description,
      options,
    });
    setSkillPath(result.path);
    goToStep(3);
  } catch (err) {
    setError(
      err instanceof Error ? err : new Error("スキル生成に失敗しました"),
    );
  } finally {
    setIsGenerating(false);
  }
};
```

#### 変更後のコード設計

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
```

#### 設計ポイント

1. **`useCreateSkill()` から取得した `createSkill` 関数**: agentSlice の `createSkill` アクションは `Promise<string>` を返す（成功時はスキルパス、失敗時は空文字列 `""`）
2. **戻り値の判定**: `resultPath` が truthy（空文字列でない）の場合に `setSkillPath` と `goToStep(3)` を実行。falsy の場合はエラー扱い
3. **`isGenerating` ローカルステート維持**: ウィザードのステップ遷移制御に使用するため、store の状態には移動しない
4. **`error` ローカルステート維持**: SkillCreateWizard 固有のエラー表示に使用。store の `skillError` とは独立して管理する

#### インポート変更

```diff
+ import { useCreateSkill } from "../../../store";
```

## 状態遷移設計

### useSkillAnalysis の状態遷移

```
[初期状態]
  analysis=null, isAnalyzing=false, isImproving=false, error=null
    │
    ├─ マウント時 useEffect → handleAnalyze()
    │    │
    │    └─ analyzeSkill(skillName) 呼び出し
    │         │
    │         ├─ store: isAnalyzing=true, currentAnalysis=null
    │         │
    │         ├─ 成功: store: currentAnalysis=結果, isAnalyzing=false
    │         │    └─ フック: selectedSuggestions=new Set()
    │         │
    │         └─ 失敗: store: skillError=メッセージ, isAnalyzing=false
    │
    ├─ 「選択改善適用」
    │    └─ applySkillImprovements(skillName, selected) 呼び出し
    │         │
    │         ├─ store: isImproving=true
    │         ├─ 成功: store: currentAnalysis=再分析結果, isImproving=false
    │         │    └─ フック: improvementResult=null, selectedSuggestions=new Set()
    │         └─ 失敗: store: skillError=メッセージ, isImproving=false
    │
    └─ 「全自動改善」
         └─ autoImproveSkill(skillName) 呼び出し
              │
              ├─ store: isImproving=true
              ├─ 成功: store: currentAnalysis=再分析結果, isImproving=false
              │    └─ フック: improvementResult=null
              └─ 失敗: store: skillError=メッセージ, isImproving=false
```

### SkillCreateWizard の状態遷移

```
[Step 0: 説明入力]
  │
  └─ 「生成」ボタン → handleGenerate()
       │
       ├─ ローカル: goToStep(2), isGenerating=true, error=null
       │
       ├─ createSkill(description, options) 呼び出し
       │    │
       │    ├─ 成功（resultPath が truthy）:
       │    │    ├─ ローカル: setSkillPath(resultPath), goToStep(3)
       │    │    └─ store: fetchSkills() 再取得
       │    │
       │    └─ 失敗（resultPath が falsy または例外）:
       │         └─ ローカル: setError(Error)
       │
       └─ ローカル: isGenerating=false
```

## テストモック戦略設計

### モック方針

store セレクタをモジュールレベルでモック化し、各テストケースで戻り値を制御する:

```typescript
// SkillCreateWizard.test.tsx
import { vi } from "vitest";

const mockCreateSkill = vi.fn();

vi.mock("../../../store", () => ({
  useCreateSkill: () => mockCreateSkill,
}));

beforeEach(() => {
  mockCreateSkill.mockReset();
});
```

```typescript
// SkillAnalysisView.test.tsx
import { vi } from "vitest";

const mockAnalyzeSkill = vi.fn();
const mockApplySkillImprovements = vi.fn();
const mockAutoImproveSkill = vi.fn();
const mockCurrentAnalysis = {
  /* テスト用分析結果 */
};

vi.mock("../../../store", () => ({
  useAnalyzeSkill: () => mockAnalyzeSkill,
  useApplySkillImprovements: () => mockApplySkillImprovements,
  useAutoImproveSkill: () => mockAutoImproveSkill,
  useCurrentAnalysis: () => mockCurrentAnalysis,
  useIsAnalyzingSkill: () => false,
  useIsImprovingSkill: () => false,
  useSkillError: () => null,
}));
```

### テストファイル構成

| テストファイル               | テスト対象                                                        | テスト数（推定） |
| ---------------------------- | ----------------------------------------------------------------- | ---------------- |
| `SkillCreateWizard.test.tsx` | createSkill store action 呼び出し、エラーハンドリング             | 既存テスト数維持 |
| `SkillAnalysisView.test.tsx` | analyzeSkill / applySkillImprovements / autoImproveSkill 呼び出し | 既存テスト数維持 |

### テスト設計上の注意

- `window.electronAPI` のモック設定を削除し、store セレクタモックに統一する
- テスト間で `mockReset()` を呼び出し、状態リークを防止する（P9 対策）
- happy-dom 環境では `userEvent` は使用禁止、`fireEvent` を使用する（P39 対策）
- テスト実行は `apps/desktop/` ディレクトリから行う（P40 対策）

## P31/P48 対策設計

### P31 対策: 個別セレクタの使用

useSkillAnalysis 内で使用する全ての store 参照:

| セレクタ                      | 返却型                                                            | useCallback 依存配列             |
| ----------------------------- | ----------------------------------------------------------------- | -------------------------------- |
| `useAnalyzeSkill()`           | `(skillName: string) => Promise<void>`                            | `handleAnalyze` に含める         |
| `useApplySkillImprovements()` | `(skillName: string, suggestions: Suggestion[]) => Promise<void>` | `handleApplySelected` に含める   |
| `useAutoImproveSkill()`       | `(skillName: string) => Promise<void>`                            | `handleAutoImprove` に含める     |
| `useCurrentAnalysis()`        | `SkillAnalysis \| null`                                           | `handleSelectAutoFixable` で参照 |
| `useIsAnalyzingSkill()`       | `boolean`                                                         | 戻り値に直接使用                 |
| `useIsImprovingSkill()`       | `boolean`                                                         | 戻り値に直接使用                 |
| `useSkillError()`             | `string \| null`                                                  | 戻り値に直接使用                 |

Zustand のアクション参照は安定（immutable）であるため、`useCallback` の依存配列に含めても無限ループは発生しない。これは P31 の「個別セレクタからの関数参照は安定している」という解決策に準拠する。

### P48 対策: useShallow 適用基準

useSkillAnalysis が返すプロパティのうち、`.filter()` / `.map()` で新しい配列参照を返すものはない:

| プロパティ            | 型                          | P48 該当 |
| --------------------- | --------------------------- | -------- |
| `analysis`            | `SkillAnalysis \| null`     | 非該当   |
| `isAnalyzing`         | `boolean`                   | 非該当   |
| `isImproving`         | `boolean`                   | 非該当   |
| `selectedSuggestions` | `Set<number>`               | 非該当   |
| `error`               | `string \| null`            | 非該当   |
| `improvementResult`   | `ImprovementResult \| null` | 非該当   |

**結論**: P48 対策の `useShallow` 適用は不要。

## z-index 管理テーブル

本タスクでは新規 UI 要素の追加はなく、既存コンポーネントの内部データフロー変更のみであるため、z-index の変更はない。

| 要素                 | z-index | 変更 |
| -------------------- | ------- | ---- |
| SkillAnalysisView    | 既存    | なし |
| SkillCreateWizard    | 既存    | なし |
| SkillManagementPanel | 既存    | なし |

## 統合テスト連携

### store action 経由の API 契約

| 呼び出し元        | store action             | Preload API（agentSlice 内部）                    | 検証ポイント                                             |
| ----------------- | ------------------------ | ------------------------------------------------- | -------------------------------------------------------- |
| useSkillAnalysis  | `analyzeSkill`           | `window.electronAPI.skill.analyze(skillName)`     | `currentAnalysis` に分析結果が格納される                 |
| useSkillAnalysis  | `applySkillImprovements` | `window.electronAPI.skill.applyImprovements(...)` | 改善適用後に再分析が自動実行される                       |
| useSkillAnalysis  | `autoImproveSkill`       | `window.electronAPI.skill.autoImprove(skillName)` | 全自動改善後に再分析が自動実行される                     |
| SkillCreateWizard | `createSkill`            | `window.electronAPI.skill.create({...})`          | スキルパス文字列が返され、`fetchSkills()` が再実行される |

## アーキテクチャ層別設計

### Renderer 層の変更一覧

| ファイル                               | 変更種別 | 変更内容                                                                                                                       |
| -------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `hooks/useSkillAnalysis.ts`            | 修正     | import 8行変更、ローカル useState 3個削除、store セレクタ7個追加、handleAnalyze/handleApplySelected/handleAutoImprove 書き換え |
| `SkillCreateWizard.tsx`                | 修正     | import 1行追加、`useCreateSkill()` 呼び出し1行追加、handleGenerate 内の IPC 呼び出しを store action に置換（5行変更）          |
| `__tests__/SkillCreateWizard.test.tsx` | 修正     | `window.electronAPI` モック削除、store セレクタモック追加、テストケースの assertion 調整                                       |
| `__tests__/SkillAnalysisView.test.tsx` | 修正     | `window.electronAPI` モック削除、store セレクタモック追加、テストケースの assertion 調整                                       |

### IPC 通信層（変更なし）

本タスクで IPC ハンドラおよび Preload API の変更は不要。

## 成果物

| 成果物 | パス                                                            | 説明           |
| ------ | --------------------------------------------------------------- | -------------- |
| 設計書 | `docs/30-workflows/store-driven-lifecycle-ui/phase-2-design.md` | 本ドキュメント |

## 完了条件

- [ ] useSkillAnalysis フックの書き換え方針（案B）の採用根拠が記載されている
- [ ] useSkillAnalysis の変更前・変更後のデータフローが図示されている
- [ ] 状態管理方針（store 状態とローカル状態の統合テーブル）が定義されている
- [ ] useSkillAnalysis の変更後コード設計が全メソッドを含んで記載されている
- [ ] SkillCreateWizard の変更前・変更後のコードが記載されている
- [ ] 状態遷移図が useSkillAnalysis と SkillCreateWizard の両方を網羅している
- [ ] テストモック戦略（vi.mock パターン）が具体的なコードを含めて記載されている
- [ ] P31 対策の個別セレクタ一覧テーブルが記載されている
- [ ] P48 対策の適用判定テーブルが記載されている
- [ ] z-index 管理テーブルが記載されている
- [ ] 統合テスト連携の API 契約テーブルが記載されている
- [ ] アーキテクチャ層別の変更一覧が全ファイルの変更内容を含めて記載されている
- [ ] 本Phase内の全タスクを100%実行完了

## 次のPhase

Phase 3: 設計レビュー → `phase-3-design-review.md`
