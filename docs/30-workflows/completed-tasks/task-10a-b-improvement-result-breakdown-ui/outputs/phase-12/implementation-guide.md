# Phase 12 実装ガイド

## Part 1: 初学者向け

### なぜ必要か

改善の実行後に「何が成功して、何が失敗したか」が見えないと、次に何を直すべきか分かりません。これは、料理の手順で「どの工程で失敗したか」が分からないのと同じです。

### 何をするか

- 結果を3つに分けて表示します
  - 成功
  - スキップ
  - 失敗(理由付き)
- 画面に短時間表示してから再分析します

### 実装の流れ

1. 結果表示用コンポーネントを作る
2. Hookに結果状態を追加する
3. 適用成功後に結果をセットして表示する
4. 短時間後に再分析して結果パネルを閉じる

## Part 2: 技術者向け

### 型定義

```ts
interface ImprovementResult {
  skillName: string;
  applied: AppliedImprovement[];
  skipped: Suggestion[];
  errors: Array<{ suggestion: Suggestion; error: string }>;
  executedAt: Date;
}
```

### 実装ポイント

- 追加状態: `improvementResult: ImprovementResult | null`
- 適用処理:

```ts
const result = await window.electronAPI.skill.applyImprovements(
  skillName,
  selected,
);
setImprovementResult(result);
await wait(250);
await handleAnalyze();
setImprovementResult(null);
```

### API契約

- `applyImprovements(skillName: string, suggestions: Suggestion[]): Promise<ImprovementResult>`
- `autoImprove(skillName: string): Promise<ImprovementResult>`

### エッジケース

- `applied/skipped/errors` が全て空: 空状態メッセージ
- `executedAt` が不正: `実行時刻不明` 表示
- `errors` 長文: 改行折返しで表示
