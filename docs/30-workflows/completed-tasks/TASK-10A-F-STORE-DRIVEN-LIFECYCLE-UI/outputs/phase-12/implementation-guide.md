# TASK-10A-F 実装ガイド: Store駆動ライフサイクルUI

## メタ情報

| 項目     | 値                                                             |
| -------- | -------------------------------------------------------------- |
| タスクID | TASK-10A-F                                                     |
| Phase    | 12（実装ガイド）                                               |
| 作成日   | 2026-03-09                                                     |
| 対象     | `useSkillAnalysis` / `SkillAnalysisView` / `SkillCreateWizard` |

## Part 1: 中学生レベル概念説明

### なぜ必要か

前の仕組みでは、画面のボタンが裏側の処理へ直接電話していました。これだと、今なにが進んでいるのか、失敗したのか、誰が同じ情報を見ているのかが分かりにくくなります。

たとえば教室で、みんなが先生に直接ばらばらに話しかけると、今どの相談が進行中なのか追いづらくなります。そこで、まず受付の名簿に書いてから先生が順番に対応するようにすると、進み具合と失敗が全員に見えるようになります。

### 何をするか

TASK-10A-F では、この「受付の名簿」を Store に統一しました。

- `useSkillAnalysis` は受付係として、分析や改善の依頼を Store に渡す
- `SkillAnalysisView` は掲示板として、Store に入っている状態だけを表示する
- `SkillCreateWizard` は作成の流れを持つが、実際の作成処理は Store action に任せる

### たとえ話で見る役割分担

| たとえ | 実体                | 役割                                   |
| ------ | ------------------- | -------------------------------------- |
| 受付係 | `useSkillAnalysis`  | ボタン操作を受けて名簿へ記入する       |
| 名簿   | `agentSlice`        | 進行中、成功、失敗、最新結果を共有する |
| 掲示板 | `SkillAnalysisView` | 名簿の内容を見やすく表示する           |
| 作業室 | Main Process        | 実際の IPC 処理を行う                  |

### どこまで共有し、どこを手元管理にするか

- `currentAnalysis` / `isAnalyzing` / `isImproving` / `skillError` はみんなで見る情報なので Store に置く
- `selectedSuggestions` はその画面だけのチェック状態なので手元メモとして local state に置く
- `improvementResult` も一時的な表示情報なので local state に残す

## Part 2: 技術的詳細

### TypeScript の型定義

```ts
import type {
  ImprovementResult,
  Suggestion,
} from "@repo/shared/types/skill-improver";

type AnalyzeSkillAction = (skillName: string) => Promise<void>;
type ApplySkillImprovementsAction = (
  skillName: string,
  suggestions: Suggestion[],
) => Promise<void>;
type AutoImproveSkillAction = (skillName: string) => Promise<void>;

interface SkillCreateOptions {
  generateTasks: boolean;
  addAgents: boolean;
  addReferences: boolean;
}
```

### APIシグネチャ

```ts
useCurrentAnalysis(): SkillAnalysis | null
useIsAnalyzingSkill(): boolean
useIsImprovingSkill(): boolean
useSkillError(): string | null

useAnalyzeSkill(): (skillName: string) => Promise<void>
useApplySkillImprovements(): (
  skillName: string,
  suggestions: Suggestion[],
) => Promise<void>
useAutoImproveSkill(): (skillName: string) => Promise<void>
useCreateSkill(): (
  description: string,
  options: SkillCreateOptions,
) => Promise<string>
```

### 使用例

```ts
const analyzeSkill = useAnalyzeSkill();
const createSkill = useCreateSkill();

await analyzeSkill(skillName);

const skillPath = await createSkill(description, {
  generateTasks: true,
  addAgents: false,
  addReferences: false,
});
```

```bash
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/components/skill/__tests__/SkillAnalysisView.store-integration.test.tsx \
  src/renderer/components/skill/__tests__/SkillCreateWizard.store-integration.test.tsx
```

### Store selector / action 一覧

| 区分   | 名前                          | 用途               |
| ------ | ----------------------------- | ------------------ |
| State  | `useCurrentAnalysis()`        | 最新の分析結果取得 |
| State  | `useIsAnalyzingSkill()`       | 分析中フラグ       |
| State  | `useIsImprovingSkill()`       | 改善中フラグ       |
| State  | `useSkillError()`             | 失敗メッセージ取得 |
| Action | `useAnalyzeSkill()`           | 分析実行           |
| Action | `useApplySkillImprovements()` | 選択提案の適用     |
| Action | `useAutoImproveSkill()`       | 全自動改善         |
| Action | `useCreateSkill()`            | スキル作成         |

### エラーハンドリング

- `agentSlice` の action が `try/catch` を持ち、失敗時は `skillError` に格納する
- `useSkillAnalysis` 側の `catch` は UI クラッシュ防止に限定し、エラー処理の責務を重複させない
- `SkillAnalysisView` は `useSkillError()` の結果を `role="alert"` で表示する
- `SkillCreateWizard` は `createSkill()` の空文字返却や例外を `error` state に詰めて GenerateStep へ渡す

### エッジケース

| エッジケース                         | 現在の扱い                                           |
| ------------------------------------ | ---------------------------------------------------- |
| `skillName` が空文字                 | Store action 側で弾き、`skillError` を設定する       |
| `selectedSuggestions` が空           | `handleApplySelected()` は何も実行しない             |
| `createSkill()` が `null` 相当を返す | `SkillCreateWizard` がフォールバックエラーへ変換する |
| `window.confirm()` をキャンセル      | `handleAutoImprove()` は早期 return する             |

### 設定項目と定数一覧

| 設定項目                        | 位置                    | 意味                          |
| ------------------------------- | ----------------------- | ----------------------------- |
| `DEFAULT_OPTIONS.generateTasks` | `SkillCreateWizard.tsx` | タスク仕様書を生成する        |
| `DEFAULT_OPTIONS.addAgents`     | `SkillCreateWizard.tsx` | agents/ を同時作成する        |
| `DEFAULT_OPTIONS.addReferences` | `SkillCreateWizard.tsx` | references/ を同時作成する    |
| `STEPS`                         | `SkillCreateWizard.tsx` | ウィザードの 4 ステップ見出し |

### なぜ local state を残すか

| state                 | Store に上げない理由                                         |
| --------------------- | ------------------------------------------------------------ |
| `selectedSuggestions` | その画面の一時的なチェック状態で、他ビュー共有が不要         |
| `improvementResult`   | 閉じたら捨てるべき一時表示情報で、グローバル共有の価値が低い |

Store に上げると、画面を閉じた後も古い選択状態や一時結果が残り、責務が不必要に広がる。
