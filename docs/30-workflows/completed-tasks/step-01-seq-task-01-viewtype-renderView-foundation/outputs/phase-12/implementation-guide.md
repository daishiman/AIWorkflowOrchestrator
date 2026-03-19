# 実装ガイド: ViewType / renderView() 基盤拡張

## タスクID

TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001

## Part 1: 概念説明（中学生レベル）

### なぜ必要か

画面を増やすたびに「どの名前のときに、どの画面を出すか」がバラバラだと、あとで不具合が起きやすくなります。  
たとえば学校の教室移動で、時間割に「理科室」があるのに案内板に理科室がなかったら、みんな迷います。

### 何をするか

今回の変更は、時間割と案内板を同時に更新する作業です。

- 時間割の名前リスト（`ViewType`）に `skillAnalysis` と `skillCreate` を追加
- 案内係（`renderView()`）に2つの行き先を追加
- 既存の教室（既存 ViewType）はそのまま使える状態を維持

### イメージ

- `ViewType`: 「行き先の名簿」
- `renderView()`: 「名簿を見て教室へ案内する係」
- `onAction?: () => void`: 「ある教室だけにある追加ボタン（なくても動く）」

## Part 2: 開発者向け実装詳細

### 変更ファイル

| ファイル                                                        | 変更内容                                                               |
| --------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `apps/desktop/src/renderer/store/types.ts`                      | `ViewType` に `"skillAnalysis"` / `"skillCreate"` を追加               |
| `apps/desktop/src/renderer/App.tsx`                             | `renderView()` に `case "skillAnalysis"` / `case "skillCreate"` を追加 |
| `apps/desktop/src/renderer/navigation/skillLifecycleJourney.ts` | `SkillLifecycleJobGuide` に `onAction?: () => void` を追加             |

### TypeScript 型定義

```ts
export type ViewType =
  | "dashboard"
  | "skillCenter"
  | "skillAnalysis"
  | "skillCreate"
  | "settings";

export interface SkillLifecycleJobGuide {
  id: "create" | "use" | "improve";
  title: string;
  summary: string;
  onAction?: () => void;
}
```

### APIシグネチャ

```ts
// navigation slice
setCurrentView(view: ViewType): void;

// renderView switch case
case "skillAnalysis": JSX.Element;
case "skillCreate": JSX.Element;
```

### 使用例

```ts
setCurrentView("skillAnalysis");
setCurrentView("skillCreate");
```

```bash
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/__tests__/App.renderView.viewtype.test.tsx
```

### エラーハンドリング

- `skillAnalysis` では `currentSkillName` が `null` の場合に `"demo-skill"` へフォールバックする。
- `onAction` は optional のため、未指定でもランタイム例外を発生させない。
- `renderView()` の default case は `ComingSoonView` で未接続ビューを安全に処理する。

### エッジケース

- legacy alias `"skill-center"` が入力された場合、`normalizeSkillLifecycleView()` で `"skillCenter"` に正規化する。
- 新規 ViewType を追加した際、既存 switch case の並び・AuthGuard 包含範囲が崩れていないかを回帰テストで確認する。
- `skillCreate` の close 時に `skillCenter` へ戻る導線が失われないことを UI テストで確認する。

### 設定と定数

| 項目                               | 値 / 意味                             |
| ---------------------------------- | ------------------------------------- |
| `VITE_USE_GLOBAL_NAV_STRIP`        | `false` 以外で `AppLayout` 導線を使用 |
| `currentSkillName ?? "demo-skill"` | analysis 画面のフォールバック規約     |
| `normalizeSkillLifecycleView()`    | legacy alias の canonical 化ルール    |
