# 実装ガイド

## Part 1: 初学者向け

なぜ必要かというと、今までの画面では「作る」「使う」「改善する」の入り口が別々に見えていて、初めて来た人がどこから始めればよいか迷いやすかったからです。たとえば駅の案内板を作り直す作業だと考えると分かりやすく、最初に見る案内板で「まずここへ進む」と分かれば、その後の乗り換えも迷いにくくなります。

何をしたかというと、今回やったことは 2 つです。1 つ目は、道順と責務の正本をコードに置いたことです。2 つ目は、Skill Center の画面にその道順と責務境界を見える形で出したことです。これで、画面を見ただけで 作る -> 使う -> 改善する の流れと、各画面が何を担当するかが分かりやすくなりました。

## Part 2: 開発者向け

### 追加した契約

- SkillLifecycleJob = create | use | improve
- normalizeSkillLifecycleView(view) で legacy alias を canonical view へ寄せる
- skillLifecycleJourney.ts に journey / responsibility / advanced policy / downstream contract を集約
- SkillCenterView は journey panel と surface ownership panel を `skillLifecycleJourney.ts` から描画する

### TypeScript 型定義

```ts
import type { ViewType } from "@/renderer/store/types";

export type SkillLifecycleJob = "create" | "use" | "improve";

export type SkillLifecycleSurfaceId =
  | "skillCenter"
  | "workspace"
  | "agent"
  | "chat"
  | "skillCreator"
  | "settings";

export interface SkillLifecycleSurfaceResponsibility {
  id: SkillLifecycleSurfaceId;
  label: string;
  primaryResponsibility: string;
  forbiddenResponsibility: string;
  handoff: string;
}

export declare function normalizeSkillLifecycleView(
  view: ViewType,
): Exclude<ViewType, "skill-center">;

export declare function getSkillLifecycleSurfaceResponsibility(
  surface: SkillLifecycleSurfaceId | ViewType,
): SkillLifecycleSurfaceResponsibility | undefined;
```

### APIシグネチャ / CLIシグネチャ

- APIシグネチャ: `normalizeSkillLifecycleView(view: ViewType): Exclude<ViewType, "skill-center">`
- APIシグネチャ: `getSkillLifecycleSurfaceResponsibility(surface: SkillLifecycleSurfaceId | ViewType): SkillLifecycleSurfaceResponsibility | undefined`
- APIシグネチャ: `isSupportingAdvancedLifecycleRoute(path: string): boolean`
- CLIシグネチャ: `node apps/desktop/scripts/capture-task-skill-lifecycle-01-phase11.mjs`

### 適用箇所

- apps/desktop/src/renderer/navigation/skillLifecycleJourney.ts
- apps/desktop/src/renderer/App.tsx
- apps/desktop/src/renderer/views/SkillCenterView/index.tsx
- apps/desktop/scripts/capture-task-skill-lifecycle-01-phase11.mjs

### 使用例

```ts
import { normalizeSkillLifecycleView } from "@/renderer/navigation/skillLifecycleJourney";

const rawCurrentView = useCurrentView();
const currentView = normalizeSkillLifecycleView(rawCurrentView);

if (currentView === "skillCenter") {
  return <SkillCenterView />;
}
```

```bash
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/navigation/skillLifecycleJourney.test.ts \
  src/renderer/views/SkillCenterView/__tests__/SkillCenterView.test.tsx
node apps/desktop/scripts/capture-task-skill-lifecycle-01-phase11.mjs
```

### エラーハンドリング

- legacy alias の吸収は例外を投げず、`normalizeSkillLifecycleView()` が canonical 値へ寄せることで分岐漏れを防ぐ。
- screenshot script は `data-testid="skill-lifecycle-surface-ownership"` を待って要素 capture し、Phase 11 の責務証跡欠落を早期検知する。
- `settings` 公開 shell は lifecycle 本線に混ぜず、例外契約として `shouldResetUnauthenticatedView` 側で分離する。

### エッジケース

- skill-center は store / legacy button から入り得るため shell で吸収する。
- settings は public shell 例外だが、journey contract には混ぜない。
- /advanced/\* は削除せず supporting route として扱う。

### 設定項目と定数一覧

| 項目                    | 値                           | 役割                                   |
| ----------------------- | ---------------------------- | -------------------------------------- |
| canonical view          | `skillCenter`                | 画面責務・テスト・仕様書の正本 view 名 |
| legacy alias            | `skill-center`               | shell 入口でのみ受け付ける互換値       |
| jobs                    | `create` / `use` / `improve` | Skill Center に表示する主要導線        |
| public shell exception  | `settings`                   | lifecycle とは別管理する公開ビュー例外 |
| supporting route prefix | `/advanced/*`                | 主導線の代替ではなく補助導線として残す |
