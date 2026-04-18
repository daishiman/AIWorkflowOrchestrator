# TASK-SW-STREAM-FUP-03: モード別 onProgress 進捗フロー詳細化

## Part 1: 中学生レベルの説明

この変更が必要なのは、どの作業でも同じ案内を出すと、いま何をしているのかが分かりにくくなるからです。たとえば、駅の放送が普通電車と快速電車で変わるように、作業の種類ごとに最初の案内と次の案内を変えると、見る人が迷いません。

この機能でできることは、mode ごとに進捗の見せ方を変えて、実際の作業内容に合った案内を出すことです。

この機能でやっていることは次の 3 つです。

- 作業の種類ごとに、最初に出す案内を変える
- その後の案内も、その種類に合わせて変える
- 案内が必要ないときでも、止まらずに進める

`SkillCreatorService` は、`create` / `collaborative` / `orchestrate` / `update` / `improve-prompt` の 5 種類に合わせて、進み方を変えます。これで、見ている人は「今どの作業か」をすぐ判断できます。

### 今回作ったもの

- mode ごとの progress flow をまとめる `PROGRESS_FLOWS`
- `createSkill()` から progress を安全に送る `emitProgress`
- `onProgress` が `undefined` のときでも止まらない実装
- mode ごとの progress を確かめるテスト

## Part 2: 技術者向け説明

### TypeScript 型定義

```ts
type SkillCreatorProgressData = {
  phase: string;
  percentage: number;
  message: string;
};

type SkillCreatorProgressCallback = (
  progress: SkillCreatorProgressData,
) => void;
```

- `CreateSkillOptions` の `onProgress?: SkillCreatorProgressCallback` で progress を受け取る
- `SkillCreatorMode` ごとの progress flow は `PROGRESS_FLOWS` に集約する
- progress の正本は `SkillCreatorService.ts` 内に閉じる

### APIシグネチャ

```ts
async createSkill(
  options: CreateSkillOptions,
  onProgress?: SkillCreatorProgressCallback,
): Promise<ExecutionReport> {
  // ...
}
```

### mode 別 progress flow

| mode             | flow                                                                                                      |
| ---------------- | --------------------------------------------------------------------------------------------------------- |
| `create`         | planning(10) → generating-skill(40) → generating-agents(70) → validating(90) → done(100)                  |
| `collaborative`  | interview(10) → consensus(35) → generating-skill(60) → generating-agents(80) → validating(90) → done(100) |
| `orchestrate`    | engine-selection(15) → generating-skill(45) → generating-agents(75) → validating(90) → done(100)          |
| `update`         | loading-skill(10) → analyzing(30) → generating-skill(60) → validating(90) → done(100)                     |
| `improve-prompt` | loading-skill(10) → analyzing(30) → improving(65) → validating(90) → done(100)                            |

### orchestration point

`createSkill()` が progress emission の順序を所有する。private workflow methods は progress literal を持たず、業務ロジックに集中する。`PROGRESS_FLOWS` を参照するだけで、mode ごとの開始点と中間点が決まる。

```ts
const flow = PROGRESS_FLOWS[options.mode];
const emitProgress = (phase: string): void => {
  const step = flow.find((candidate) => candidate.phase === phase);
  if (step) onProgress?.({ ...step });
};
```

この共通 helper は、phase 名から step を引いて、見つかったときだけ callback を呼ぶ。`emitProgressStep` 相当の役割を持ち、progress 以外の責務は持たない。

### 使用例

```ts
const report = await service.createSkill(
  { mode: "collaborative", skillName: "demo-skill" },
  (progress) => {
    console.log(progress.phase, progress.percentage, progress.message);
  },
);
```

### エラーハンドリング

- `onProgress` が `undefined` のときは optional chaining により no-op になる
- `flow.find(...)` が見つからない phase はそのまま無視される
- callback に渡す progress はスプレッドで複製するため、呼び出し側の変更が共有定数へ波及しない

### エッジケース

- `generating-agents` は `update` / `improve-prompt` の flow に含まれないため、その mode では no-op になる
- `percentage` は全 mode で 0〜100 に収まり、単調増加を維持する
- `done` は各 mode の最後に 1 回だけ通知される

### 設定項目と定数一覧

- `PROGRESS_FLOWS`
- `SkillCreatorMode`
- `SkillCreatorProgressData`
- `SkillCreatorProgressCallback`
- `CreateSkillOptions.onProgress`

### テスト構成

- `SkillCreatorService.progress.test.ts` の mode 別 progress sequence
- `onProgress` 未指定時の安全動作
- `percentage` 単調増加の確認
- `done` の最終通知確認

### 視覚証跡

- UI/UX変更なしのため Phase 11 スクリーンショット不要
- Phase 11 の実ファイル参照: `outputs/phase-11/TASK-SW-STREAM-FUP-03-manual-test-report.md`
- 代替証跡は自動テスト結果で、`SkillCreatorService.progress.test.ts` が根拠になる
