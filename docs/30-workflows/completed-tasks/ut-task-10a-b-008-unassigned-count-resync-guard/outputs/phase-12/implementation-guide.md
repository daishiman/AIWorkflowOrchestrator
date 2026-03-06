# Phase 12 実装ガイド

## Part 1: 中学生向け説明

### なぜこの変更が必要だったか

教室の名簿で「今日来ている人」と「もう卒業した人」を同じ列で数えると、人数がずれます。  
そのまま掲示板に人数を書くと、見る人が毎回まちがった人数を信じてしまいます。

今回必要だったのは、まず「今数えるべき人」と「もう別にしておく人」を分けてから、  
教室の名簿、先生の記録、みんな向けの掲示板を同じ人数にそろえることでした。

### 日常生活での例え

たとえば図書室の本棚を想像してください。  
「本棚にある本」と「もう貸し出し中の本」を同じ列で数えると、在庫表がずれます。

そこで、

- 本棚に今ある本の表
- 貸し出し中の本の表
- 入口に貼る案内

を毎回同じルールで見直す必要があります。  
今回の変更は、この見直しをタスク台帳で自動的にやるイメージです。

### 何をしたか

- 今も残っている未タスクだけを active として数えるようにした
- もう終わったタスクは completed に分けて、active から外した
- 3つの台帳が同じ内容かを、目で見るだけでなく機械でも確認できるようにした
- 画面確認のついでに見つかった UI の止まり方も直した

### これで何が良くなるか

- 「未タスクは 6 件、完了済みは 3 件」という数が毎回ぶれない
- 完了したタスクが未タスク置き場に残りにくくなる
- 後から同じ種類の修正をするとき、どこを見ればよいかすぐ分かる

## Part 2: 開発者向け詳細

### 1. 変更対象と責務

| 区分             | 対象                                            | 役割                                          |
| ---------------- | ----------------------------------------------- | --------------------------------------------- |
| canonical ledger | `task-workflow.md`                              | active/completed 集合の正本                   |
| derived ledger   | `ui-ux-feature-components.md`                   | UI仕様側の派生台帳                            |
| derived evidence | `outputs/phase-12/unassigned-task-detection.md` | workflow 側の派生検出レポート                 |
| runtime fix      | `useSkillAnalysis.ts`                           | StrictMode 再マウント時のローディング固着解消 |
| validator        | `validate-task10ab-ledger-sync.js`              | 3台帳同期の機械検証                           |
| validator        | `validate-phase12-implementation-guide.js`      | Phase 12 Task 1 内容要件の機械検証            |

### 2. インターフェース / 型定義（TypeScript）

```ts
interface LedgerSyncPayload {
  ok: boolean;
  activeIds: string[];
  completedIds: string[];
  missingPaths: string[];
  errors: string[];
}

interface Phase12GuideCheck {
  id: string;
  label: string;
  ok: boolean;
}

interface Phase12GuideValidationResult {
  ok: boolean;
  guidePath: string;
  checks: Phase12GuideCheck[];
  errors: string[];
}

export interface UseSkillAnalysisReturn {
  analysis: SkillAnalysis | null;
  isAnalyzing: boolean;
  isImproving: boolean;
  selectedSuggestions: Set<number>;
  error: string | null;
  improvementResult: ImprovementResult | null;
  handleAnalyze: () => Promise<void>;
  handleToggleSuggestion: (index: number) => void;
  handleSelectAutoFixable: () => void;
  handleApplySelected: () => Promise<void>;
  handleAutoImprove: () => Promise<void>;
}
```

### 3. API / CLI シグネチャ

```ts
export const useSkillAnalysis = (skillName: string): UseSkillAnalysisReturn => {
  /* ... */
};

export function validatePhase12ImplementationGuide(
  workflowDir: string,
): Phase12GuideValidationResult;
```

```bash
node .claude/skills/task-specification-creator/scripts/validate-task10ab-ledger-sync.js --json
node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js \
  --workflow docs/30-workflows/completed-tasks/ut-task-10a-b-008-unassigned-count-resync-guard \
  --json
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
```

### 4. 使用例

#### 4.1 Phase 12 ドキュメント要件の検証

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js \
  --workflow docs/30-workflows/completed-tasks/ut-task-10a-b-008-unassigned-count-resync-guard \
  --json
```

期待値:

- Part 1 が「なぜ必要か」先行
- Part 1 に日常例えがある
- Part 2 に TypeScript 型、API/CLI シグネチャ、使用例、エラー処理、エッジケース、設定/定数一覧がある

#### 4.2 UI Hook の利用

```tsx
const { analysis, isAnalyzing, handleAnalyze, handleApplySelected } =
  useSkillAnalysis(skillName);

if (isAnalyzing) {
  return <LoadingState />;
}

return (
  <SkillAnalysisView
    analysis={analysis}
    onRefresh={handleAnalyze}
    onApplySelected={handleApplySelected}
  />
);
```

### 5. エラーハンドリング

| 対象                             | 対処                                                                                      |
| -------------------------------- | ----------------------------------------------------------------------------------------- |
| `implementation-guide.md` が無い | `validate-phase12-implementation-guide` は `ok=false` と `guidePath` を返して終了コード 1 |
| 3台帳の ID 集合がずれる          | `validate-task10ab-ledger-sync` が `errors[]` に mismatch を返す                          |
| `useSkillAnalysis` の IPC 失敗   | Hook 側で `error` を設定し、分析結果を `null` に戻す                                      |
| 改善適用後に再分析できない       | `isMountedRef.current` を見て state 更新を中止し、アンマウント後の setState を防ぐ        |

### 6. エッジケース

- completed 集合だけが増えた場合でも、active は固定レンジではなく正本台帳から再計算する
- `physical-only anomaly` は監視対象に残すが、active set へ自動採用しない
- `baselineViolations.total` は repo 既存負債なので、今回差分の PASS/FAIL には使わない
- React StrictMode の mount -> cleanup -> remount で `isMountedRef=false` が残ると perpetual loading になるため、mount 時に `true` を再設定する

### 7. 設定可能なパラメータと定数

| 種別 | 名前                            | 値 / 例                                                                                               | 用途                           |
| ---- | ------------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------ |
| CLI  | `--workflow`                    | `docs/30-workflows/completed-tasks/ut-task-10a-b-008-unassigned-count-resync-guard`                   | 対象 workflow の指定           |
| CLI  | `--json`                        | `true`                                                                                                | validator 結果を機械可読で出力 |
| CLI  | `--task-workflow`               | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                  | canonical ledger の差し替え    |
| CLI  | `--ui-spec`                     | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                       | derived ledger の差し替え      |
| CLI  | `--detection`                   | `docs/30-workflows/completed-tasks/skill-analysis-view/outputs/phase-12/unassigned-task-detection.md` | detection ledger の差し替え    |
| 定数 | `IMPROVEMENT_RESULT_PREVIEW_MS` | `250`                                                                                                 | 改善結果プレビューの待機時間   |

### 8. 推奨実行順

1. `validate-phase12-implementation-guide.js` で Task 1 の内容要件を確認する
2. `validate-task10ab-ledger-sync.js` で active/completed 集合を確認する
3. `validate-phase11-screenshot-coverage.js` で UI 証跡 8/8 を確認する
4. `verify-unassigned-links.js` と `audit-unassigned-tasks.js --json --diff-from HEAD` を順に実行する
5. `verify-all-specs.js --workflow ... --json` と schema validate で workflow 全体を閉じる
