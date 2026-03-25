# Phase 5: 実装

## メタ情報

| 項目   | 値                                             |
| ------ | ---------------------------------------------- |
| Phase  | 5                                              |
| 機能名 | ut-imp-navcontract-execution-console-entry-001 |
| 作成日 | 2026-03-24                                     |

## 目的

Phase 2 設計に従い、executionConsole エントリを navContract.ts および関連ファイルに実装する。

## 実行タスク

1. Icon 拡張実装 — `PlayCircle` import + `"play-circle"` IconName + iconMap 追加
2. DockViewType 拡張 — `"executionConsole"` を Extract union に追加
3. NAV_SECTIONS 拡張 — sub セクションに executionConsole エントリを追加
4. NAV_SHORTCUT_TO_VIEW 拡張 — `"9": "executionConsole"` を追加
5. テスト期待値更新 — navContract.test.ts / types.test.ts の期待値を新エントリに合わせて更新
6. 検証実行 — 型チェック + テスト実行で全 PASS を確認

## 参照資料

| 資料名       | パス                                                        |
| ------------ | ----------------------------------------------------------- |
| Phase 2 設計 | `phase-2-design.md`                                         |
| Phase 4 TC   | `phase-4-test-cases.md`                                     |
| Icon         | `apps/desktop/src/renderer/components/atoms/Icon/index.tsx` |
| navContract  | `apps/desktop/src/renderer/navigation/navContract.ts`       |

## 実行手順

### ステップ 1: Icon コンポーネント拡張（FR-04）

**ファイル**: `apps/desktop/src/renderer/components/atoms/Icon/index.tsx`

1. lucide-react から `PlayCircle` を import に追加する
2. `IconName` type に `"play-circle"` を追加する
3. `iconMap` に `"play-circle": PlayCircle` を追加する

```typescript
// L30 付近: import に PlayCircle を追加
import {
  // ... 既存
  PlayCircle,
} from "lucide-react";

// L65-123: IconName に追加
export type IconName =
  // ... 既存
  "play-circle";

// L133-192: iconMap に追加
const iconMap: Record<IconName, LucideIcon> = {
  // ... 既存
  "play-circle": PlayCircle,
};
```

### ステップ 2: DockViewType 拡張（FR-01）

**ファイル**: `apps/desktop/src/renderer/navigation/navContract.ts`

`DockViewType` の `Extract` union に `"executionConsole"` を追加する。

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

### ステップ 3: NAV_SECTIONS 拡張（FR-02）

`sub` セクションに executionConsole エントリを追加する。

```typescript
{
  id: "sub",
  label: "補助機能",
  items: [
    // ... 既存 (graph, editor)
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

### ステップ 4: NAV_SHORTCUT_TO_VIEW 拡張（FR-03）

```typescript
export const NAV_SHORTCUT_TO_VIEW: Readonly<Record<string, DockViewType>> = {
  "1": "dashboard",
  "2": "workspace",
  "3": "chat",
  "4": "agent",
  "5": "skillCenter",
  "6": "historySearch",
  "7": "graph",
  "8": "editor",
  "9": "executionConsole", // NEW
  ",": "settings",
};
```

### ステップ 5: テスト期待値更新（FR-05）

**ファイル**: `apps/desktop/src/renderer/navigation/navContract.test.ts`

TC-01〜TC-06 に従い以下を更新:

- L43: items count `[6, 2, 1]` → `[6, 3, 1]`
- L49-59: APP_DOCK_NAV_ITEMS に `"executionConsole"` 追加
- L60-70: shortcut に `"Cmd+9"` 追加
- L81-86: MOBILE_SECONDARY に `"executionConsole"` 追加
- L209: length/size `9` → `10`
- ショートカット解決テストに `Cmd+9` → `executionConsole` を追加

**ファイル**: `apps/desktop/src/renderer/store/types.test.ts`

TC-07〜TC-08 に従い以下を更新:

- L61-78: `existingViewTypes` に `"executionConsole"` 追加、length `15` → `16`
- L82-101: `allViewTypes` に `"executionConsole"` 追加、length `17` → `18`

### ステップ 6: 検証

```bash
# 型チェック
pnpm --filter @repo/desktop typecheck

# テスト実行
cd apps/desktop && pnpm vitest run src/renderer/navigation/navContract.test.ts src/renderer/store/types.test.ts
```

## 多角的チェック観点

| 観点     | 確認事項                                                          |
| -------- | ----------------------------------------------------------------- |
| P32 準拠 | `ViewType`（既追加）と `DockViewType`（本ステップ）が同期している |
| P40 準拠 | テストは `apps/desktop/` ディレクトリから実行する                 |
| 型安全   | `as const satisfies` により NAV_SECTIONS の型が推論される         |

## 統合テスト連携

navContract 変更は GlobalNavStrip の表示に直接影響する。以下の観点で統合テストとの連携を確認すること:

| 観点                       | 確認事項                                                                      |
| -------------------------- | ----------------------------------------------------------------------------- |
| GlobalNavStrip 表示        | NAV_SECTIONS に追加した executionConsole エントリが正しくレンダリングされるか |
| ショートカットキー         | Cmd+9 で executionConsole ビューに遷移するか                                  |
| モバイルナビ               | MOBILE_SECONDARY に executionConsole が含まれるか                             |
| 既存ナビゲーション回帰確認 | 既存の Cmd+1〜8 および Cmd+, のショートカットが影響を受けていないか           |

## 成果物

| 成果物              | パス                                                        | 備考                                   |
| ------------------- | ----------------------------------------------------------- | -------------------------------------- |
| Icon コンポーネント | `apps/desktop/src/renderer/components/atoms/Icon/index.tsx` | `PlayCircle` 追加                      |
| navContract         | `apps/desktop/src/renderer/navigation/navContract.ts`       | DockViewType / NAV_SECTIONS / SHORTCUT |
| navContract テスト  | `apps/desktop/src/renderer/navigation/navContract.test.ts`  | 期待値更新                             |
| types テスト        | `apps/desktop/src/renderer/store/types.test.ts`             | ViewType member count 更新             |

> コード成果物はソースツリー上で直接編集する。`outputs/` ディレクトリには配置しない。

## 完了条件

- [ ] Icon/index.tsx に `PlayCircle` import + `"play-circle"` IconName + iconMap 追加
- [ ] navContract.ts の DockViewType に `"executionConsole"` 追加
- [ ] navContract.ts の NAV_SECTIONS sub セクションに executionConsole エントリ追加
- [ ] navContract.ts の NAV_SHORTCUT_TO_VIEW に `"9": "executionConsole"` 追加
- [ ] navContract.test.ts の全期待値が更新されている
- [ ] types.test.ts の ViewType member count が更新されている
- [ ] `pnpm --filter @repo/desktop typecheck` PASS
- [ ] 全テスト PASS

## サブタスク管理

Phase 実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

## タスク100%実行確認【必須】

Phase 完了前に以下を確認:

- [ ] 本 Phase 内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている

## 次の Phase

Phase 6: テスト拡充
