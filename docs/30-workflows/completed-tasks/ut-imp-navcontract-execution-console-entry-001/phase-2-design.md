# Phase 2: 設計

## メタ情報

| 項目   | 値                                             |
| ------ | ---------------------------------------------- |
| Phase  | 2                                              |
| 機能名 | ut-imp-navcontract-execution-console-entry-001 |
| 作成日 | 2026-03-24                                     |

## 目的

navContract.ts への executionConsole エントリ追加の具体的な実装設計を定義する。

## 実行タスク

- Icon設計: play-circleアイコンのIconName追加とLucide PlayCircleとの紐付けを設計する
- DockViewType設計: Extract<ViewType, ...>にexecutionConsoleを追加する設計を定義する
- NAV_SECTIONS設計: subセクションへの配置とショートカットキー割当を設計する
- テスト影響分析: 既存テストファイルの変更箇所と期待値更新方針を特定する

## 参照資料

| 資料名           | パス                                                                                                                        | 説明                           |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| Phase 1 要件定義 | `phase-1-requirements-definition.md`                                                                                        | 機能要件・非機能要件・受入基準 |
| 設計サマリー     | `docs/30-workflows/completed-tasks/step-01-seq-task-01-guided-execution-shell-foundation/outputs/phase-2/design-summary.md` | executionConsoleの元設計       |
| 未タスク指示書   | `docs/30-workflows/unassigned-task/ut-imp-navcontract-execution-console-entry-001.md`                                       | 本タスクの指示書               |

## 設計概要

### 変更ファイルと変更内容

#### 1. Icon コンポーネント拡張

**ファイル**: `apps/desktop/src/renderer/components/atoms/Icon/index.tsx`

```typescript
// import 追加
import { PlayCircle } from "lucide-react";

// IconName union 追加
export type IconName =
  // ... 既存
  "play-circle";

// iconMap 追加
const iconMap: Record<IconName, LucideIcon> = {
  // ... 既存
  "play-circle": PlayCircle,
};
```

**根拠**: 設計サマリー（design-summary.md）で `icon: "play-circle"` が指定されている。Lucide React の `PlayCircle` コンポーネントと紐付ける。

#### 2. DockViewType 拡張

**ファイル**: `apps/desktop/src/renderer/navigation/navContract.ts`

```typescript
export type DockViewType = Extract<
  ViewType,
  | "dashboard"
  | "workspace"
  | "chat"
  | "agent"
  | "skillCenter"
  | "historySearch"
  | "graph"
  | "editor"
  | "settings"
  | "executionConsole" // NEW
>;
```

**根拠**: P32 準拠。`ViewType`（`store/types.ts:20`）には既に `executionConsole` が追加されている。`DockViewType` は `Extract<ViewType, ...>` なので union に追加するだけで型整合が維持される。

#### 3. NAV_SECTIONS 拡張

**配置先**: `sub` セクション（補助機能）

```typescript
{
  id: "sub",
  label: "補助機能",
  items: [
    { id: "graph", icon: "network", label: "グラフ", mobileLabel: "グラフ", shortcut: "Cmd+7" },
    { id: "editor", icon: "file-code", label: "エディタ", mobileLabel: "編集", shortcut: "Cmd+8" },
    // NEW
    {
      id: "executionConsole",
      icon: "play-circle",
      label: "実行コンソール",
      mobileLabel: "実行",
      shortcut: "Cmd+9",
    },
  ],
},
```

**配置判断の根拠**:

- 設計サマリーで `isMobilePrimary: false` が指定されている
- main セクションは「主要機能」（dashboard, workspace, chat, agent, skillCenter, historySearch）
- sub セクションは「補助機能」（graph, editor）
- 実行コンソールは初期段階では補助的な位置づけ → sub に配置

**ショートカット**: `Cmd+9`

- 既存: Cmd+1〜8（main/sub 9 項目 → main 6 + sub 2 = 8）、Cmd+,（settings）
- 次の空きスロット: `9`

#### 4. NAV_SHORTCUT_TO_VIEW 拡張

```typescript
export const NAV_SHORTCUT_TO_VIEW: Readonly<Record<string, DockViewType>> = {
  // ... 既存 (1-8, ,)
  "9": "executionConsole", // NEW
};
```

#### 5. APP_DOCK_NAV_ITEMS への影響

`APP_DOCK_NAV_ITEMS` は `NAV_SECTIONS` の全アイテムを展開するだけなので、追加コード変更は不要。自動的に `executionConsole` が含まれる。

### テスト影響分析

| テストファイル            | 変更箇所                                                       | 影響度 |
| ------------------------- | -------------------------------------------------------------- | ------ |
| `navContract.test.ts:43`  | `items.length` 期待値: `[6, 2, 1]` → `[6, 3, 1]`               | 必須   |
| `navContract.test.ts:49`  | `APP_DOCK_NAV_ITEMS` id 配列に追加                             | 必須   |
| `navContract.test.ts:60`  | shortcut 配列に `"Cmd+9"` 追加                                 | 必須   |
| `navContract.test.ts:81`  | `MOBILE_SECONDARY_NAV_ITEMS` に追加                            | 必須   |
| `navContract.test.ts:209` | `NAV_SHORTCUT_TO_VIEW` length: `9` → `10`                      | 必須   |
| `types.test.ts:78`        | existingViewTypes length: `15` → `16`（executionConsole 追加） | 必須   |
| `types.test.ts:101`       | allViewTypes length: `17` → `18`                               | 必須   |

### 依存関係

```
Icon/index.tsx (play-circle 追加)
      ↓
navContract.ts (DockViewType + NAV_SECTIONS + shortcut)
      ↓
navContract.test.ts + types.test.ts (期待値更新)
```

Icon への `play-circle` 追加が先行条件。navContract.ts の変更は Icon 更新後に実施。

## 多角的チェック観点

| 観点             | 適用 | 確認事項                                                         |
| ---------------- | ---- | ---------------------------------------------------------------- |
| 型安全           | 適用 | `DockViewType` が `Extract<ViewType, ...>` の部分型を維持        |
| UI/UX            | 適用 | nav item の配置順序とショートカットが直感的であること            |
| アクセシビリティ | 適用 | Icon の `aria-hidden="true"` が維持されること                    |
| P32 準拠         | 適用 | `ViewType` と `DockViewType` の同時更新（ViewType は既追加済み） |

## 統合テスト連携

navContract変更がGlobalNavStrip表示に与える影響を以下の観点で確認する:

| テスト項目               | 確認内容                                           | 期待結果                                       |
| ------------------------ | -------------------------------------------------- | ---------------------------------------------- |
| NAV_SECTIONS整合性       | subセクションのitems数が正しいか                   | [6, 3, 1]の配列構成になる                      |
| APP_DOCK_NAV_ITEMS展開   | 全アイテムが正しく展開されるか                     | 10項目（executionConsole含む）が展開される     |
| ショートカットマッピング | NAV_SHORTCUT_TO_VIEWに正しく登録されるか           | "9" → "executionConsole"のマッピングが存在する |
| モバイルナビ分類         | isMobilePrimary未設定のためsecondaryに分類されるか | MOBILE_SECONDARY_NAV_ITEMSに含まれる           |

## 成果物

| 成果物       | パス                                | 説明                                                   |
| ------------ | ----------------------------------- | ------------------------------------------------------ |
| 設計サマリー | `outputs/phase-2/design-summary.md` | 変更ファイル・テスト影響分析・依存関係を定義した設計書 |

## 完了条件

- [x] 全変更ファイルの具体的な変更内容が設計されている
- [x] テスト影響分析が完了している
- [x] 依存関係が明確に定義されている
- [x] ショートカットキーの割当が決定している
- [x] NAV_SECTIONS 内の配置セクションが決定している
- [x] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（Icon設計、DockViewType設計、NAV_SECTIONS設計、テスト影響分析）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている

## 次の Phase

Phase 3: 設計レビュー
