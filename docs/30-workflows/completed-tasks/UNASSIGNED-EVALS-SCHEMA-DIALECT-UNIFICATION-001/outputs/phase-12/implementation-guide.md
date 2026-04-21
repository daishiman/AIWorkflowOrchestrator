# Phase 12: 実装ガイド

## Part 1: まず何が問題か

同じ意味のラベルが場所ごとに違うと、倉庫の箱に別の名前シールが貼られているのと同じで、中身を取り出す人が迷います。今回の EVALS では `currentLevel` と `current_level` のように同じ意味の名前が二つあり、書く側と読む側がずれると集計が壊れます。

だから先に「どの名前を正とするか」をそろえ、そのあとでそれを読むテストまで一緒に直します。順番を守らないと、片側だけ直って動かなくなります。

## Part 2: 技術ガイド

### 対象フィールド

```ts
type CamelDialect = {
  currentLevel: number;
  metrics: {
    totalUsageCount: number;
    lastEvaluated: string | null;
  };
};

type SnakeDialect = {
  current_level: number;
  metrics: {
    total_usage_count: number;
    last_evaluated: string | null;
  };
};
```

### 変更順

1. `.claude/skills` の writer / initializer / fixture を更新
2. `.claude/skills` の reader / schema を更新
3. `apps/desktop` fixture / test の期待値を確認
4. `.agents/skills` に mirror 同期
5. 対象限定 grep / diff / fixture test を実行

### 主要 consumer

- `skill-creator/assets/evals-template.json`
- `skill-creator/scripts/init_skill.js`
- `skill-creator/scripts/collect_feedback.js`
- `task-specification-creator/scripts/log-usage.js`
- `apps/desktop/src/__tests__/fixtures/skill-creator.fixture.test.ts`
- `apps/desktop/src/main/services/skill/SkillScanner.ts`

### エッジケース

- `automation-30` は camelCase 残存だが本タスク対象外
- `skill-creator` は同一スキル内混在があるため、template / init / feedback / log_usage を同一 wave で直す
- validator は本タスクで導入せず `UNASSIGNED-EVALS-VALIDATOR-GUARD-001` へ委譲

## 視覚証跡

UI/UX変更なしのため Phase 11 スクリーンショット不要。
代替証跡: `outputs/phase-10/final-review-result.md` と `outputs/phase-11/manual-test-result.md`
