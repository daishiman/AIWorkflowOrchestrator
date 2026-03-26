# Implementation Guide

## Part 1: 中学生レベルの説明

### 1.1 これは何をそろえる task か

この作業は、「スキルを作りたい人が最初にどこを押せばよいか」を 1 つに決めるための設計です。

たとえば大きい駅で、改札に行く道が 3 本あって、どれがふつうの入口か分からないと迷います。
しかも 1 本は職員用通路、1 本は工事中の抜け道、1 本だけがふつうのお客さん向けだったら、
最初に正しい道を大きく示しておかないと、毎回説明が必要になります。

この設計では、
`Skill Center` をふつうの入口にし、
`SkillCreateWizard` をその先の作業場所にし、
ほかの道は「特別な確認用の道」として整理します。

### 1.2 なぜ必要か

今は create に関係する画面がいくつかあり、
読む人によって「ここから始めるのかな」が変わってしまいます。
これを放置すると、
テストの観点も説明文も増え、
verify や improve を担当する別 task と役割がぶつかります。

だから最初に、
「ふつうの人はここから始める」
「詳しい確認や比較は別の道」
を分けておく必要があります。

### 1.3 何をするか

| 決めること | 説明                     | 例                                            |
| ---------- | ------------------------ | --------------------------------------------- |
| 主導線     | ふつうの人が最初に通る道 | `Skill Center -> skillCreate`                 |
| 行き先     | 実際に作成作業をする場所 | `SkillCreateWizard`                           |
| 補助導線   | 比較や確認のために残す道 | `SkillManagementPanel`, `SkillLifecyclePanel` |
| 注意表示   | 入口で見せる短い注意     | source root の summary warning                |
| 詳細表示   | 深掘りしたい人向けの情報 | diagnostics, advanced route                   |

### 1.4 完成するとどうなるか

- create を始める場所を 1 つに説明できる
- 作る場所と確認用の場所を分けて説明できる
- ほかの作業が確認画面や運用ルールを安心して引き取れる

## Part 2: 技術者向け説明

### 2.1 固定する設計契約

```ts
export type CreateRouteKind = "primary" | "secondary" | "advanced";

export type CreateWarningTrigger =
  | "source_conflict"
  | "structure_mismatch"
  | "budget_overflow"
  | "provenance_incomplete";

export interface CreateEntryContract {
  sourceSurface: "skillCenter";
  destinationView: "skillCreate";
  routeKind: "primary";
}

export interface CreateSecondaryRouteContract {
  sourceSurface: "skillManagementPanel" | "skillLifecyclePanel";
  destinationView: "skillCreate" | "lifecycle";
  routeKind: "secondary" | "advanced";
}

export interface SourceProvenanceSummary {
  selectedRootLabel: string;
  triggers: CreateWarningTrigger[];
  blocking: boolean;
  diagnosticsRoute:
    | "/advanced/skill-management-panel"
    | "/advanced/skill-center";
}
```

### 2.2 API / 関数シグネチャ

```ts
// primary entry
const navigateToSkillCreate: () => void;

// shell route
setCurrentView(view: ViewType): void;

// canonicalization
normalizeSkillLifecycleView(
  view: ViewType,
): Exclude<ViewType, "skill-center">;

// destination surface
interface SkillCreateWizardProps {
  onClose: () => void;
}
```

### 2.3 使用例

```ts
function handleCreateCta(): void {
  setCurrentView("skillCreate");
}

function handleCloseWizard(): void {
  setCurrentView("skillCenter");
}
```

`SkillCenterView` は create 入口を持つが、
作成フロー本体は `SkillCreateWizard` が受け持つ。
`SkillLifecyclePanel` は advanced route であり、
mainline entry の代替としては使わない。

### 2.4 エラーハンドリング

| ケース                           | 期待動作                                                              |
| -------------------------------- | --------------------------------------------------------------------- |
| source root が複数候補で競合する | mainline では summary warning のみ表示し、詳細は diagnostics へ逃がす |
| structure mismatch が blocking   | create 開始前に blocking と分かる short warning を出す                |
| `skill-center` legacy alias      | shell で canonical `skillCenter` へ正規化する                         |
| advanced route を直開きした      | advanced / secondary route として扱い、primary route の説明は変えない |

### 2.5 エッジケース

- `SkillManagementPanel` の `create` view と `SkillCenter` CTA が同時に存在しても、説明上の primary route は 1 つに固定する
- `SkillLifecyclePanel` の `onOpenWizard` は advanced route 内の移動であり、normal user の入口に昇格させない
- `viewHistory` が破損していても `setCurrentView("skillCreate")` 自体の state owner は増やさない
- Task06 が improve surface を拡張しても、Task05 は create entry の責務を超えて結果面を持たない

### 2.6 設定項目と定数一覧

| 項目                    | 値                                                                                            | 置き場                                            |
| ----------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| primary entry view      | `skillCenter`                                                                                 | `skillLifecycleJourney.ts`, `ui-ux-navigation.md` |
| create destination view | `skillCreate`                                                                                 | `App.tsx`, `store/types.ts`                       |
| advanced routes         | `/advanced/skill-management-panel`, `/advanced/skill-create-wizard`, `/advanced/skill-center` | `skillLifecycleJourney.ts`, `App.tsx`             |
| warning trigger         | `source_conflict`, `structure_mismatch`, `budget_overflow`, `provenance_incomplete`           | Task03 design artifacts                           |

### 2.7 実装対象ファイル

- `apps/desktop/src/renderer/App.tsx`
- `apps/desktop/src/renderer/views/SkillCenterView/index.tsx`
- `apps/desktop/src/renderer/views/SkillCenterView/hooks/useSkillCenter.ts`
- `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`
- `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`
- `apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx`
- `apps/desktop/src/renderer/navigation/skillLifecycleJourney.ts`
