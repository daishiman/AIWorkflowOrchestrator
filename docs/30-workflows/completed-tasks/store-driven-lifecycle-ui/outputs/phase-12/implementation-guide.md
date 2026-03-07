# TASK-10A-F 実装ガイド: Store駆動ライフサイクルUI統合

## メタ情報

| 項目     | 値         |
| -------- | ---------- |
| タスクID | TASK-10A-F |
| Phase    | 12         |
| 作成日   | 2026-03-07 |

---

## Part 1: 概念説明（中学生レベル）

### お店の注文システムで例えると

**変更前（直接呼び出し）**:

お客さん（画面）が注文係（Store）を通さずに、直接厨房（electronAPI）に行って「カレー作って！」と言っていました。このやり方だと、他の店員（他の画面）はお客さんが何を注文したか分かりません。注文が被ったり、在庫の確認ができなかったりします。

**変更後（Store経由）**:

お客さん（画面）が注文係（Store）に「カレーお願いします」と伝えます。注文係が厨房（electronAPI）に伝達し、注文票（Store状態）に全注文を記録します。これで全店員が「今カレーを作ってます」「分析中です」という状況を把握できるようになりました。

### なぜ必要か

1つの画面でスキルを作成したら、他の画面（スキル一覧）にも自動で反映されるようにするためです。Store（注文係）が一元管理することで、全画面で同じ情報を共有できます。

### 何をしたか

2つの画面で、厨房（electronAPI）に直接行くのをやめて、全部注文係（Store）を通すように変更しました:

1. **スキル作成画面（SkillCreateWizard）**: スキルを新規作成するとき
2. **スキル分析画面（SkillAnalysisView）**: スキルを分析・改善するとき（3つの操作）

---

## Part 2: 技術者向け実装詳細

### 排除した直接IPC呼び出し（4箇所）

| #   | ファイル              | 旧コード                                          | 新コード                                     |
| --- | --------------------- | ------------------------------------------------- | -------------------------------------------- |
| 1   | SkillCreateWizard.tsx | `window.electronAPI.skill.create({...})`          | `useCreateSkill()` → Store action            |
| 2   | useSkillAnalysis.ts   | `window.electronAPI.skill.analyze(skillName)`     | `useAnalyzeSkill()` → Store action           |
| 3   | useSkillAnalysis.ts   | `window.electronAPI.skill.applyImprovements(...)` | `useApplySkillImprovements()` → Store action |
| 4   | useSkillAnalysis.ts   | `window.electronAPI.skill.autoImprove(skillName)` | `useAutoImproveSkill()` → Store action       |

### Store アクション型シグネチャ

```typescript
// agentSlice.ts に定義済み
interface CreateSkillOptions {
  generateTasks: boolean;
  addAgents: boolean;
  addReferences: boolean;
}

interface Suggestion {
  type: "security" | "structure" | "documentation";
  priority: "high" | "medium" | "low";
  description: string;
  autoFixable: boolean;
}

analyzeSkill: (skillName: string) => Promise<void>;
applySkillImprovements: (skillName: string, suggestions: Suggestion[]) =>
  Promise<void>;
autoImproveSkill: (skillName: string) => Promise<void>;
createSkill: (description: string, options: CreateSkillOptions) =>
  Promise<string>;
```

### 個別セレクタ一覧

```typescript
// store/index.ts に定義済み
// State セレクタ
useCurrentAnalysis(); // SkillAnalysis | null
useIsAnalyzingSkill(); // boolean
useIsImprovingSkill(); // boolean
useSkillError(); // string | null

// Action セレクタ
useAnalyzeSkill(); // (skillName: string) => Promise<void>
useApplySkillImprovements(); // (skillName, suggestions) => Promise<void>
useAutoImproveSkill(); // (skillName: string) => Promise<void>
useCreateSkill(); // (description, options) => Promise<string>
```

### Before / After コード比較

#### SkillCreateWizard.tsx

```typescript
// Before (TASK-10A-C)
const result = await window.electronAPI.skill.create({ description, options });
setSkillPath(result.path);

// After (TASK-10A-F)
import { useCreateSkill } from "../../store";
const createSkill = useCreateSkill();
const path = await createSkill(description, options);
if (path) {
  setSkillPath(path);
  goToStep(3);
}
```

#### useSkillAnalysis.ts

```typescript
// Before (TASK-10A-B)
const [analysis, setAnalysis] = useState<SkillAnalysis | null>(null);
const [isAnalyzing, setIsAnalyzing] = useState(false);
const result = await window.electronAPI.skill.analyze(skillName);
setAnalysis(result);

// After (TASK-10A-F)
import {
  useCurrentAnalysis,
  useIsAnalyzingSkill,
  useAnalyzeSkill,
} from "../../../store";
const analysis = useCurrentAnalysis();
const isAnalyzing = useIsAnalyzingSkill();
const analyzeSkill = useAnalyzeSkill();
await analyzeSkill(skillName);
// Store が自動的に currentAnalysis と isAnalyzingSkill を更新
```

### エラーハンドリング

Store アクション内部でエラーを catch し、`skillError` state に設定する:

```typescript
// agentSlice.ts のパターン
analyzeSkill: async (skillName) => {
  set({ isAnalyzing: true, skillError: null, currentAnalysis: null });
  try {
    const result = await window.electronAPI.skill.analyze(skillName.trim());
    set({ currentAnalysis: result, isAnalyzing: false });
  } catch (error) {
    set({
      skillError: formatErrorMessage("スキル分析に失敗", error),
      isAnalyzing: false,
    });
  }
};
```

Hook側では try/catch でUIクラッシュを防止:

```typescript
// useSkillAnalysis.ts
const handleAnalyze = useCallback(async () => {
  try {
    await analyzeSkill(skillName);
    setSelectedSuggestions(new Set());
  } catch {
    // Store側でskillErrorに設定済み。UIクラッシュ防止
  }
}, [analyzeSkill, skillName]);
```

### P31/P48 準拠ポイント

- **P31**: 全て個別セレクタで取得。合成Hook（useAgentStore()等）は使用禁止
- **P48**: 今回のセレクタはスカラー値のみ返すため、useShallow は不要
- **P42**: Store action 内部で3段バリデーション実施（型チェック→空文字列→トリム空文字列）

### 使用例

```typescript
const createSkill = useCreateSkill();
const analyzeSkill = useAnalyzeSkill();

await createSkill("テスト用スキル説明", {
  generateTasks: true,
  addAgents: false,
  addReferences: true,
});
await analyzeSkill("test-skill");
```

### エッジケース

- `skillName` が空文字/空白のみの場合: Store action で reject し `skillError` を設定する。
- analyze 後に apply/autoImprove が失敗した場合: UIはクラッシュさせず前回分析結果を維持する。
- 連打による多重実行: `isAnalyzingSkill` / `isImprovingSkill` フラグでボタンをdisableし二重送信を防ぐ。

### 設定可能なパラメータ一覧

| パラメータ      | 型        | 用途                                     |
| --------------- | --------- | ---------------------------------------- |
| `description`   | `string`  | createSkill の入力説明文                 |
| `generateTasks` | `boolean` | 生成時に tasks セクションを作るか        |
| `addAgents`     | `boolean` | 生成時に agents を追加するか             |
| `addReferences` | `boolean` | 生成時に references を追加するか         |
| `skillName`     | `string`  | analyze/apply/autoImprove の対象スキル名 |
