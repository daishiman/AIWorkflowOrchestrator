# TASK-10A-D 実装ガイド: スキルライフサイクルUI統合

## Part 1: 概念的説明（中学生レベル）

### このタスクは何をしたの？

**テーマパークの案内所**を想像してください。

チャット画面（メインゲート）からスキル管理（案内所）に行けるようになりました。案内所では次のことができます:

- **チケット一覧（listビュー）**: 持っているチケット（スキル）を一覧で見る
- **チケットの健康診断（analysisビュー）**: チケットの品質をスコア（0-100点）で表示して、改善ポイントを教えてくれる
- **新しいチケットを発行（createビュー）**: 4ステップで新しいスキルを作る

### スキル分析ってなに？

スキルの**健康診断**です。お医者さんが体の状態をスコアで教えてくれるように、スキルの品質をスコア（0-100点）で表示して、改善ポイントを教えてくれます。

### 改善提案の適用ってなに？

お医者さんが出した**処方箋を実行するボタン**です。ワンクリックでスキルの品質が改善されます。

### 作成ウィザードってなに？

**料理のレシピを4ステップで作る**イメージです:

1. **Describe**: 何を作るか決める
2. **Configure**: 材料と調味料を選ぶ
3. **Generate**: 調理する
4. **Complete**: 完成！

### ビュー切替ってなに？

案内所の中にある**3つの窓口**です:

- **一覧窓口（list）**: スキル一覧を見る
- **分析窓口（analysis）**: スキルの健康診断をする
- **作成窓口（create）**: 新しいスキルを作る

窓口間を自由に行き来できます。

---

## Part 2: 開発者向け技術詳細

### 1. コンポーネント統合構成

#### SkillManagementPanel のビュー切替ロジック

```
View = "list" | "editor" | "analysis" | "create"

[ChatPanel] --toggle--> [SkillManagementPanel]
                              |
                              ├── list (default)
                              │     ├── SkillCard × N
                              │     ├── 検索フィルター
                              │     └── 新規作成ボタン → create
                              │
                              ├── analysis (selectedSkill required)
                              │     └── SkillAnalysisView
                              │           ├── skillName prop
                              │           └── onClose → list
                              │
                              ├── create
                              │     └── SkillCreateWizard
                              │           └── onClose → list
                              │
                              └── editor (既存)
                                    └── SkillEditor
```

**ポイント**: `analysis` ビューは `selectedSkill !== null` の条件が必須。`create` ビューは条件なし。

#### 変更ファイルマップ

| ファイル                   | 変更内容                                                                 |
| -------------------------- | ------------------------------------------------------------------------ |
| `SkillManagementPanel.tsx` | SkillAnalysisView / SkillCreateWizard のインポートとプレースホルダー差替 |
| `ChatPanel.tsx`            | SkillManagementPanel インポート、トグルボタン追加、条件付きレンダリング  |
| `agentSlice.ts`            | 5アクション + 3状態フィールド追加                                        |
| `store/index.ts`           | 8個の個別セレクタ追加                                                    |

### 2. agentSlice 拡張

#### 追加した状態フィールド

```typescript
// AgentState に追加
currentAnalysis: SkillAnalysis | null; // 分析結果
isAnalyzing: boolean; // 分析中フラグ
isImproving: boolean; // 改善中フラグ
```

#### 追加したアクション

| アクション               | 引数                                           | 戻り値          | 説明                  |
| ------------------------ | ---------------------------------------------- | --------------- | --------------------- |
| `analyzeSkill`           | `skillName: string`                            | `void`          | スキル分析実行        |
| `applySkillImprovements` | `skillName: string, suggestions: Suggestion[]` | `void`          | 改善提案適用 + 再分析 |
| `autoImproveSkill`       | `skillName: string`                            | `void`          | 全自動改善 + 再分析   |
| `createSkill`            | `description: string, options: CreateOptions`  | `string` (path) | スキル作成 + 一覧更新 |
| `clearAnalysis`          | なし                                           | `void`          | 分析結果クリア        |

#### P42準拠3段バリデーションパターン

全アクションに適用:

```typescript
// 1. 型チェック
if (
  typeof skillName !== "string" ||
  // 2. 空文字列チェック（暗黙的に含まれる）
  // 3. トリム空文字列チェック
  skillName.trim() === ""
) {
  set({ skillError: "スキル名が無効です" });
  return;
}
```

#### 改善適用後の再分析パターン

`applySkillImprovements` と `autoImproveSkill` は改善適用後に `analyze` を再実行して最新の分析結果を取得:

```typescript
await window.electronAPI.skill.applyImprovements(skillName.trim(), suggestions);
// 改善適用後に再分析して最新状態を取得
const result = await window.electronAPI.skill.analyze(skillName.trim());
set({ currentAnalysis: result, isImproving: false });
```

### 3. 個別セレクタ設計（P31対策）

```typescript
// State selectors
export const useCurrentAnalysis = () =>
  useAppStore((state) => state.currentAnalysis);
export const useIsAnalyzingSkill = () =>
  useAppStore((state) => state.isAnalyzing);
export const useIsImprovingSkill = () =>
  useAppStore((state) => state.isImproving);

// Action selectors
export const useAnalyzeSkill = () => useAppStore((state) => state.analyzeSkill);
export const useApplySkillImprovements = () =>
  useAppStore((state) => state.applySkillImprovements);
export const useAutoImproveSkill = () =>
  useAppStore((state) => state.autoImproveSkill);
export const useCreateSkill = () => useAppStore((state) => state.createSkill);
export const useClearAnalysis = () =>
  useAppStore((state) => state.clearAnalysis);
```

**重要**: Zustand のアクション参照は安定しているため、`useEffect` の依存配列に含めても無限ループは発生しない。

### 4. ChatPanel 統合

```typescript
// Local state（Zustand不要 — コンポーネント固有のUI状態）
const [showSkillManagement, setShowSkillManagement] = useState(false);

// トグルボタン
<button
  onClick={() => setShowSkillManagement((prev) => !prev)}
  aria-label={showSkillManagement ? "スキル管理パネルを閉じる" : "スキル管理パネルを開く"}
  aria-expanded={showSkillManagement}
  disabled={isExecuting}
  data-testid="skill-management-toggle"
>
  スキル管理
</button>

// 条件付きレンダリング
{showSkillManagement ? <SkillManagementPanel /> : <>{/* 通常のチャット表示 */}</>}
```

### 5. テスト設計

| テストファイル                               | テスト数 | パターン                                         |
| -------------------------------------------- | -------- | ------------------------------------------------ |
| agentSlice.skill-lifecycle.test.ts           | 50       | createTestStore() で実コード実行、P42全パターン  |
| SkillManagementPanel.test.tsx                | 38       | モックコンポーネント使用、ビュー遷移テスト       |
| agentSlice.skill-lifecycle-selectors.test.ts | 25       | セレクタ存在確認、P31参照安定性テスト            |
| ChatPanel.skill-management.test.tsx          | 12       | fireEvent使用（P39対策）、トグル/disabled テスト |
| SkillManagementPanel.integration.test.tsx    | 7        | ビュー遷移全パス、onClose コールバック           |
| **合計**                                     | **132**  | -                                                |

**テスト実行時の注意（P40対策）**: 必ず `cd apps/desktop` してから実行すること。
