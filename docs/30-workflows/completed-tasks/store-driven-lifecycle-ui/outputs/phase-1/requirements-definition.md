# TASK-10A-F 要件定義書

## メタ情報

| 項目       | 値                                                      |
| ---------- | ------------------------------------------------------- |
| タスクID   | TASK-10A-F                                              |
| 機能名     | Store駆動ライフサイクルUI統合                           |
| Phase      | 1 - 要件定義                                            |
| 作成日     | 2026-03-07                                              |
| 状態       | 完了                                                    |
| 依存タスク | TASK-10A-B (完了), TASK-10A-C (完了), TASK-10A-D (完了) |

## 目的

SkillCreateWizard と useSkillAnalysis の直接 `window.electronAPI` 呼び出し4箇所を排除し、agentSlice store action 経由に統一する。TASK-10A-D で agentSlice に追加済みの `analyzeSkill`, `applySkillImprovements`, `autoImproveSkill`, `createSkill` アクションと個別セレクタ（`useAnalyzeSkill`, `useCreateSkill` 等）を、コンポーネント/フック側で使用するように書き換える。

## 排除対象テーブル（4箇所）

| #   | ファイル                    | 行  | 現在の直接IPC呼び出し                                             | 置換先 store action                           |
| --- | --------------------------- | --- | ----------------------------------------------------------------- | --------------------------------------------- |
| 1   | `SkillCreateWizard.tsx`     | 46  | `window.electronAPI.skill.create({ description, options })`       | `createSkill(description, options)`           |
| 2   | `hooks/useSkillAnalysis.ts` | 94  | `window.electronAPI.skill.analyze(skillName)`                     | `analyzeSkill(skillName)`                     |
| 3   | `hooks/useSkillAnalysis.ts` | 140 | `window.electronAPI.skill.applyImprovements(skillName, selected)` | `applySkillImprovements(skillName, selected)` |
| 4   | `hooks/useSkillAnalysis.ts` | 171 | `window.electronAPI.skill.autoImprove(skillName)`                 | `autoImproveSkill(skillName)`                 |

## store action 要件

agentSlice に既に実装済みの以下のアクションを使用する（新規追加は不要）:

| アクション名             | セレクタ名                  | 定義箇所（store/index.ts） | シグネチャ                                                        |
| ------------------------ | --------------------------- | -------------------------- | ----------------------------------------------------------------- |
| `analyzeSkill`           | `useAnalyzeSkill`           | L638                       | `(skillName: string) => Promise<void>`                            |
| `applySkillImprovements` | `useApplySkillImprovements` | L640-641                   | `(skillName: string, suggestions: Suggestion[]) => Promise<void>` |
| `autoImproveSkill`       | `useAutoImproveSkill`       | L643-644                   | `(skillName: string) => Promise<void>`                            |
| `createSkill`            | `useCreateSkill`            | L646                       | `(description: string, options: {...}) => Promise<string>`        |

状態参照セレクタ（既に実装済み）:

| セレクタ名            | 定義箇所（store/index.ts） | 返却型                  |
| --------------------- | -------------------------- | ----------------------- |
| `useCurrentAnalysis`  | L627-628                   | `SkillAnalysis \| null` |
| `useIsAnalyzingSkill` | L630-631                   | `boolean`               |
| `useIsImprovingSkill` | L633-634                   | `boolean`               |
| `useSkillError`       | L579                       | `string \| null`        |

## 機能要件

### FR-1: SkillCreateWizard の直接IPC呼び出し排除

`SkillCreateWizard.tsx` の `handleGenerate` 関数（行46）で `window.electronAPI.skill.create()` を呼び出している箇所を、`useCreateSkill()` セレクタから取得した `createSkill` 関数に置換する。置換後、`SkillCreateWizard.tsx` 内に `window.electronAPI` への参照が0箇所であることを `grep` で検証する。

### FR-2: useSkillAnalysis の分析呼び出し排除

`useSkillAnalysis.ts` の `handleAnalyze` 関数（行94）で `window.electronAPI.skill.analyze()` を呼び出している箇所を、store action の `analyzeSkill` に置換する。store action 呼び出し後、`useCurrentAnalysis()` セレクタから分析結果を取得して `analysis` プロパティに反映する。

### FR-3: useSkillAnalysis の改善適用呼び出し排除

`useSkillAnalysis.ts` の `handleApplySelected` 関数（行140）で `window.electronAPI.skill.applyImprovements()` を呼び出している箇所を、store action の `applySkillImprovements` に置換する。改善適用後の再分析は store action 内で自動実行されるため、明示的な再分析呼び出しは不要。

### FR-4: useSkillAnalysis の全自動改善呼び出し排除

`useSkillAnalysis.ts` の `handleAutoImprove` 関数（行171）で `window.electronAPI.skill.autoImprove()` を呼び出している箇所を、store action の `autoImproveSkill` に置換する。全自動改善後の再分析は store action 内で自動実行されるため、明示的な再分析呼び出しは不要。

### FR-5: テストファイルのモック対象変更

- `SkillCreateWizard.test.tsx` のモック対象を `window.electronAPI.skill.create` から store action の `createSkill` に変更する
- `SkillAnalysisView.test.tsx` のモック対象を `window.electronAPI.skill.analyze` / `applyImprovements` / `autoImprove` から store action の対応アクションに変更する
- テストで store action をモック化する際は `vi.fn()` で個別にモックし、`vi.mock` でセレクタモジュールをモック化する

### FR-6: 直接IPC呼び出しゼロの検証

修正完了後、以下のコマンドで直接IPC呼び出しが0件であることを検証する:

```bash
grep -rn "window\.electronAPI" apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx
grep -rn "window\.electronAPI" apps/desktop/src/renderer/components/skill/hooks/useSkillAnalysis.ts
```

両方のコマンドの出力が0行であること。

## 非機能要件

### NFR-1: P31（Zustand無限ループ）対策

- useSkillAnalysis 内で store action を取得する際、個別セレクタパターン（`useAnalyzeSkill()`, `useApplySkillImprovements()` 等）を使用する
- 合成 Store Hook（オブジェクトを返す形式）は使用しない
- `useEffect` の依存配列には個別セレクタから取得した関数参照のみを含める
- Zustand のアクション参照は安定しているため、依存配列に含めても無限ループは発生しない

### NFR-2: P48（useShallow）対策

- useSkillAnalysis 内で `.filter()` / `.map()` によって新しい配列参照を返す派生セレクタを使用する場合、`useShallow` を適用する
- 現時点では P48 適用対象のセレクタは存在しない（`selectedSuggestions` は `Set<number>` 型であり配列ではない）

### NFR-3: 後方互換性

- `UseSkillAnalysisReturn` インターフェースの全プロパティ型を変更しない
- `SkillCreateWizardProps` インターフェースを変更しない
- `SkillAnalysisView` の Props インターフェース（`skillName: string, onClose: () => void`）を変更しない
- 既存の SkillManagementPanel からの呼び出しコードは変更しない

### NFR-4: エラーハンドリング

- store action 内のエラーは `skillError` 状態に格納される（既存実装を維持）
- useSkillAnalysis のローカル `error` ステートは、store の `useSkillError()` を参照する形に変更する
- SkillCreateWizard のローカル `error` ステートは維持し、store action のエラーをキャッチして設定する

### NFR-5: テスト品質

- 修正後のテストが全て PASS すること
- テスト内で `window.electronAPI` への直接モックが残らないこと（store action モックに統一）
- happy-dom 環境で実行すること（P39 対策）
- テスト実行は `apps/desktop/` ディレクトリから行うこと（P40 対策）

## TASK-10A-G 回帰テスト基盤への引き渡し要件

| データフロー                                          | 検証内容                                                                   |
| ----------------------------------------------------- | -------------------------------------------------------------------------- |
| `useAnalyzeSkill()` → `agentSlice.analyzeSkill` → IPC | store action 経由で IPC が呼び出され、`currentAnalysis` に結果が格納される |
| `useCreateSkill()` → `agentSlice.createSkill` → IPC   | store action 経由で IPC が呼び出され、スキルパスが返される                 |
| `useApplySkillImprovements()` → `agentSlice` → IPC    | store action 経由で改善が適用され、再分析が自動実行される                  |
| `useAutoImproveSkill()` → `agentSlice` → IPC          | store action 経由で全自動改善が実行され、再分析が自動実行される            |

## 参照資料

| 資料名                  | パス                                                                   |
| ----------------------- | ---------------------------------------------------------------------- |
| SkillCreateWizard 実装  | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`     |
| useSkillAnalysis フック | `apps/desktop/src/renderer/components/skill/hooks/useSkillAnalysis.ts` |
| agentSlice 定義         | `apps/desktop/src/renderer/store/slices/agentSlice.ts`                 |
| Store index（セレクタ） | `apps/desktop/src/renderer/store/index.ts`                             |
| P31 対策ルール          | `.claude/rules/06-known-pitfalls.md#P31`                               |
| P48 対策ルール          | `.claude/rules/06-known-pitfalls.md#P48`                               |
| 状態管理ルール          | `.claude/rules/03-state-management.md`                                 |
