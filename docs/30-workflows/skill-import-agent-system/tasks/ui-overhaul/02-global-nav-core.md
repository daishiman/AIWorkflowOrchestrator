# TASK-UI-02-GLOBAL-NAV-CORE: グローバルナビゲーション基盤 ─ NavStrip・ルーティング・AppDock移行

## 1. メタ情報

| 項目             | 値                                                                        |
| ---------------- | ------------------------------------------------------------------------- |
| タスクID         | TASK-UI-02-GLOBAL-NAV-CORE                                                |
| タスク名         | グローバルナビゲーション基盤（NavStrip・ルーティング・AppDock段階的移行） |
| 優先度           | critical（全画面の前提条件、03〜09が依存）                                |
| 複雑度           | large                                                                     |
| 依存タスク       | TASK-UI-00（デザイン基盤）, TASK-UI-01（Store/IPC/ViewType拡張）          |
| ブロック対象     | TASK-UI-03〜09（全画面がGlobalNavStripに依存）                            |
| 推定影響ファイル | 8〜12ファイル（新規6、修正2〜4、テスト3）                                 |

## 2. 目的と背景

### 2.1 目的

現行の `AppDock` コンポーネント（80px幅、6項目フラット構造）を、3グループ構造の **GlobalNavStrip**（collapsed: 56px / expanded: 200px）に段階的に移行する。新規3ビュー（`workspace`, `skillCenter`, `historySearch`）への導線を確保しつつ、既存6ビューのルーティングを完全に維持する。移行は3ステップで実施し、各ステップでロールバック可能な設計とする。

### 2.2 背景と課題

#### 現行 AppDock の構造（`apps/desktop/src/renderer/components/organisms/AppDock/index.tsx`）

```typescript
// 現行の6項目フラット構造
const navItems: NavItem[] = [
  {
    id: "dashboard",
    icon: "layout-grid",
    label: "Dashboard",
    shortcut: "Cmd+1",
  },
  { id: "editor", icon: "folder-tree", label: "Editor", shortcut: "Cmd+2" },
  { id: "chat", icon: "message-circle", label: "Chat", shortcut: "Cmd+3" },
  { id: "graph", icon: "network", label: "Graph", shortcut: "Cmd+4" },
  { id: "agent", icon: "bot", label: "Agent", shortcut: "Cmd+5" },
  { id: "settings", icon: "user", label: "Settings", shortcut: "Cmd+," },
];
```

#### 課題

1. **スケーラビリティ不足**: 6項目がフラット配置。9項目に拡張すると、モバイル下部タブバー（h-[70px]）に収まらず、アイコンが密集して操作ミスが増加する
2. **論理グルーピング不在**: Dashboard/Editor/Chat/Graph/Agent/Settings が全て同列で表示され、機能的なグループ分け（メイン操作 vs ツール vs システム設定）がない
3. **幅の非効率**: 現行 `w-20`（80px）はアイコン（24px）+ パディング（24px×2）で余白が過剰。collapsed: 56pxで十分
4. **collapsed/expanded切替なし**: デスクトップの広い画面でもアイコンのみ表示で、ラベル表示への切替ができない
5. **セマンティクス不足**: `aria-pressed` を使用しているが、ナビゲーション項目には `aria-current="page"` が適切（WAI-ARIA Navigation Landmark パターン準拠）

### 2.3 移行後の利点

- **3グループ構造**: メイン（6項目）/ サブ（2項目）/ フッター（1項目）の論理分離で9項目を整理
- **collapsed/expanded切替**: ユーザーの画面幅・好みに応じてアイコンのみ/アイコン+ラベル表示を切替可能
- **段階的移行**: フィーチャーフラグを用いたビッグバン置換回避。既存テスト20件を段階的に移行
- **ViewType拡張との連携**: TASK-UI-01 で定義される新ViewType（`workspace`, `skillCenter`, `historySearch`）をNavItemとして即座に配置可能
- **Apple HIG準拠**: Clarity（一目で機能が分かるグループ分け）、Deference（コンテンツ領域を最大化する控えめなナビ）、Depth（アクティブ状態の視覚的レイヤリング）

## 3. AppDock → GlobalNavStrip 段階的移行戦略

### 原則: ビッグバン置換を避け、3ステップで安全に移行する

各ステップは独立したコミット/PRとして管理可能。ステップ間で必ずテストが全PASSすることを確認する。

### Step 1: 並行稼働（GlobalNavStrip作成 + AppDock維持）

**目標**: GlobalNavStrip を新規作成し、AppDock と同じインターフェースで動作確認する

**作業内容**:

1. `GlobalNavStrip` を `organisms/GlobalNavStrip/` に新規作成（Task 1 の全内容）
2. Props を AppDock と互換にする（`currentView: ViewType`, `onViewChange: (view: ViewType) => void`, `mode: "desktop" | "mobile"`）
3. `App.tsx` でフィーチャーフラグ `USE_GLOBAL_NAV_STRIP` を環境変数（`import.meta.env.VITE_USE_GLOBAL_NAV_STRIP`）で切替可能にする

```typescript
// App.tsx（Step 1 時点）
const USE_GLOBAL_NAV_STRIP =
  import.meta.env.VITE_USE_GLOBAL_NAV_STRIP === "true";

const NavComponent = USE_GLOBAL_NAV_STRIP ? GlobalNavStrip : AppDock;

return (
  <div className="h-screen w-screen overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)] flex">
    {isDesktop ? (
      <NavComponent
        currentView={currentView}
        onViewChange={handleViewChange}
        mode="desktop"
      />
    ) : null}
    {/* ... ContentArea ... */}
    {!isDesktop ? (
      USE_GLOBAL_NAV_STRIP ? (
        <MobileNavBar
          currentView={currentView}
          onViewChange={handleViewChange}
        />
      ) : (
        <div className="fixed bottom-0 left-0 right-0">
          <AppDock
            currentView={currentView}
            onViewChange={handleViewChange}
            mode="mobile"
          />
        </div>
      )
    ) : null}
  </div>
);
```

**テスト確認項目**:

- [ ] GlobalNavStrip の単体テストが全PASS
- [ ] フィーチャーフラグ OFF 時に AppDock が従来通り動作
- [ ] フィーチャーフラグ ON 時に GlobalNavStrip が9項目を3グループで表示
- [ ] 両モードで全6（既存）ViewType への遷移が正常動作

**完了基準**: GlobalNavStrip の全テストが PASS し、手動確認で AppDock と同等の操作が可能

**ロールバック手順**: `VITE_USE_GLOBAL_NAV_STRIP` を削除または `"false"` に設定。App.tsx の分岐コードは残存するが動作に影響しない。

### Step 2: AppLayout抽出 + ナビゲーション統合

**目標**: レイアウトロジックを AppLayout に抽出し、GlobalNavStrip をデフォルトにする

**作業内容**:

1. `AppLayout` コンポーネントを作成（Task 2）
2. `App.tsx` のレイアウト部分（`<div className="h-screen w-screen ...">` 以下）を `AppLayout` に移行
3. フィーチャーフラグのデフォルト値を `true` に変更
4. `navigationSlice` の ViewType を拡張（TASK-UI-01 の成果物を適用）
5. `renderView()` に新ViewType のプレースホルダーを追加（`<ComingSoonView />`）
6. キーボードショートカットのグローバル登録（Task 5）

**テスト確認項目**:

- [ ] AppLayout 経由で全9 ViewType が正常にルーティング
- [ ] 新ViewType（workspace, skillCenter, historySearch）で ComingSoonView が表示
- [ ] キーボードショートカット（Cmd+1〜8, Cmd+,）で全ビュー切替可能
- [ ] レスポンシブ切替（desktop/mobile）が正常動作

**完了基準**: AppLayout 経由で全ビューが正常に動作し、GlobalNavStrip がデフォルトで使用される

**ロールバック手順**: フィーチャーフラグを `false` に戻す。AppLayout の使用を App.tsx のインラインレイアウトに切り戻す。

### Step 3: AppDock 削除

**目標**: 旧 AppDock コンポーネントを完全に削除する

**作業内容**:

1. フィーチャーフラグ `USE_GLOBAL_NAV_STRIP` とフラグ分岐コードを削除
2. `organisms/AppDock/` ディレクトリを削除（`index.tsx` + `AppDock.test.tsx`）
3. `App.tsx` から AppDock の import 参照を削除
4. `App.tsx` の ViewType 型参照元を AppDock から `store/types.ts` に変更（現行: `import type { ViewType } from "./components/organisms/AppDock"`）

**テスト確認項目**:

- [ ] `grep -rn "AppDock" apps/desktop/src/` の結果が0件であること
- [ ] `grep -rn "USE_GLOBAL_NAV_STRIP" apps/desktop/src/` の結果が0件であること
- [ ] TypeScript型チェック（`pnpm --filter @repo/desktop typecheck`）が通ること
- [ ] 全テストがPASS

**完了基準**: AppDock への参照が完全に0件であること

**ロールバック手順**: Git で `organisms/AppDock/` ディレクトリを復元（`git checkout HEAD -- apps/desktop/src/renderer/components/organisms/AppDock/`）

### 移行マトリクス: AppDock → GlobalNavStrip

| AppDock の機能                 | GlobalNavStrip での対応                          | 変更点                                   |
| ------------------------------ | ------------------------------------------------ | ---------------------------------------- |
| 幅 `w-20` (80px)               | collapsed: `w-14` (56px) / expanded: `w-[200px]` | collapsed時16px縮小、expanded時120px拡大 |
| 高さ `h-[70px]` (mobile)       | MobileNavBar `h-14` (56px)                       | 14px縮小、別コンポーネント分離           |
| 6 NavItem フラット             | 9 NavItem × 3セクション                          | セクション分離 + 3項目追加               |
| `aperture` ロゴ (32px)         | `aperture` ロゴ (24px)                           | サイズ縮小、ダッシュボードへの遷移追加   |
| NavIcon molecules 使用         | NavItem molecules 新規作成                       | Badge/Tooltip統合、expanded対応          |
| Tooltip 表示                   | Tooltip 再利用                                   | ラベル+ショートカット表示                |
| `aria-pressed` 属性            | `aria-current="page"` に変更                     | WAI-ARIAセマンティクス改善               |
| `bg-[var(--bg-glass)]`         | `bg-[var(--bg-glass)]` 維持                      | 変更なし                                 |
| ショートカット表示のみ         | ショートカット表示 + グローバル登録              | 機能追加                                 |
| レスポンシブ: mode prop で切替 | desktop: GlobalNavStrip / mobile: MobileNavBar   | コンポーネント分離                       |

## 4. GlobalNavStrip コンポーネント設計

### 4.1 レイアウト

| モード    | 条件          | レイアウト                                     | 幅/高さ  |
| --------- | ------------- | ---------------------------------------------- | -------- |
| expanded  | > 1024px      | 左サイドバー、アイコン+ラベル表示              | 200px    |
| collapsed | 768px〜1024px | 左サイドバー、アイコンのみ表示                 | 56px     |
| compact   | < 768px       | 下部タブバー（MobileNavBar、別コンポーネント） | 高さ56px |

collapsed/expanded はユーザーが手動でトグル可能（NavCollapseToggle ボタン）。トグル状態は `UISlice` に保存し、リロード後も維持する。

### 4.2 ナビゲーションアイテム定義（9つ、3セクション）

| セクション   | ViewType        | ラベル         | アイコン（lucide-react） | ショートカット | 優先表示（mobile） |
| ------------ | --------------- | -------------- | ------------------------ | -------------- | ------------------ |
| **メイン**   | `dashboard`     | ダッシュボード | `LayoutGrid`             | `Cmd+1`        | 表示               |
| **メイン**   | `workspace`     | ワークスペース | `FolderTree`             | `Cmd+2`        | 表示               |
| **メイン**   | `chat`          | チャット       | `MessageCircle`          | `Cmd+3`        | 表示               |
| **メイン**   | `agent`         | エージェント   | `Bot`                    | `Cmd+4`        | 表示               |
| **メイン**   | `skillCenter`   | スキルセンター | `Puzzle`                 | `Cmd+5`        | 表示               |
| **メイン**   | `historySearch` | 履歴検索       | `Search`                 | `Cmd+6`        | More内             |
| **サブ**     | `graph`         | グラフ         | `Network`                | `Cmd+7`        | More内             |
| **サブ**     | `editor`        | エディタ       | `FileCode`               | `Cmd+8`        | More内             |
| **フッター** | `settings`      | 設定           | `Settings`               | `Cmd+,`        | More内             |

**セクション分割のルール**:

- **メイン**: ユーザーが最も頻繁にアクセスする主要機能（6項目）
- **サブ**: 補助的な開発ツール（2項目）
- **フッター**: システム設定（1項目、サイドバー最下部に固定配置）

セクション間は `<hr className="my-2 border-[var(--border-subtle)]" />` で視覚的に分離する。

### 4.3 コンポーネント Props と型定義

```typescript
// organisms/GlobalNavStrip/types.ts

import type { ViewType } from "../../../store/types";
import type { IconName } from "../../atoms/Icon";

/** ナビゲーションセクションID */
export type NavSectionId = "main" | "sub" | "footer";

/** 個別ナビゲーションアイテムの設定 */
export interface NavItemConfig {
  /** 遷移先のViewType */
  id: ViewType;
  /** lucide-react アイコン名 */
  icon: IconName;
  /** 表示ラベル（expanded時およびTooltip） */
  label: string;
  /** キーボードショートカット表記（例: "Cmd+1"） */
  shortcut?: string;
  /** モバイルの主要5項目に含めるか（true=タブバーに直接表示） */
  isMobilePrimary?: boolean;
}

/** ナビゲーションセクション（グループ）の設定 */
export interface NavSectionConfig {
  /** セクションID */
  id: NavSectionId;
  /** アクセシビリティ用グループラベル */
  label: string;
  /** セクション内のナビゲーションアイテム */
  items: NavItemConfig[];
}

/** GlobalNavStrip の Props */
export interface GlobalNavStripProps {
  /** 現在アクティブなViewType */
  currentView: ViewType;
  /** ビュー切替コールバック */
  onViewChange: (view: ViewType) => void;
  /** 表示モード */
  mode: "desktop" | "mobile";
}

/** NavItem コンポーネントの Props */
export interface NavItemProps {
  /** アイテム設定 */
  config: NavItemConfig;
  /** アクティブ状態 */
  isActive: boolean;
  /** collapsed（アイコンのみ）/ expanded（アイコン+ラベル） */
  isExpanded: boolean;
  /** クリック時のコールバック */
  onClick: () => void;
  /** 通知バッジカウント（0以下は非表示） */
  badgeCount?: number;
}

/** NavSection コンポーネントの Props */
export interface NavSectionProps {
  /** セクション設定 */
  config: NavSectionConfig;
  /** 現在アクティブなViewType */
  currentView: ViewType;
  /** collapsed/expanded */
  isExpanded: boolean;
  /** ビュー切替コールバック */
  onViewChange: (view: ViewType) => void;
  /** 各アイテムのバッジカウントマップ */
  badgeCounts?: Partial<Record<ViewType, number>>;
}

/** NavCollapseToggle の Props */
export interface NavCollapseToggleProps {
  /** 現在 expanded かどうか */
  isExpanded: boolean;
  /** トグルコールバック */
  onToggle: () => void;
}
```

### 4.4 定数定義

```typescript
// organisms/GlobalNavStrip/constants.ts

import type { NavSectionConfig } from "./types";

/** ナビゲーションセクション定義 */
export const NAV_SECTIONS: NavSectionConfig[] = [
  {
    id: "main",
    label: "メイン機能",
    items: [
      {
        id: "dashboard",
        icon: "layout-grid",
        label: "ダッシュボード",
        shortcut: "Cmd+1",
        isMobilePrimary: true,
      },
      {
        id: "workspace",
        icon: "folder-tree",
        label: "ワークスペース",
        shortcut: "Cmd+2",
        isMobilePrimary: true,
      },
      {
        id: "chat",
        icon: "message-circle",
        label: "チャット",
        shortcut: "Cmd+3",
        isMobilePrimary: true,
      },
      {
        id: "agent",
        icon: "bot",
        label: "エージェント",
        shortcut: "Cmd+4",
        isMobilePrimary: true,
      },
      {
        id: "skillCenter",
        icon: "puzzle",
        label: "スキルセンター",
        shortcut: "Cmd+5",
        isMobilePrimary: true,
      },
      {
        id: "historySearch",
        icon: "search",
        label: "履歴検索",
        shortcut: "Cmd+6",
        isMobilePrimary: false,
      },
    ],
  },
  {
    id: "sub",
    label: "ツール",
    items: [
      {
        id: "graph",
        icon: "network",
        label: "グラフ",
        shortcut: "Cmd+7",
        isMobilePrimary: false,
      },
      {
        id: "editor",
        icon: "file-code",
        label: "エディタ",
        shortcut: "Cmd+8",
        isMobilePrimary: false,
      },
    ],
  },
  {
    id: "footer",
    label: "システム",
    items: [
      {
        id: "settings",
        icon: "settings",
        label: "設定",
        shortcut: "Cmd+,",
        isMobilePrimary: false,
      },
    ],
  },
];

/** GlobalNavStrip の寸法定数 */
export const NAV_DIMENSIONS = {
  /** collapsed 時の幅（px） */
  COLLAPSED_WIDTH: 56,
  /** expanded 時の幅（px） */
  EXPANDED_WIDTH: 200,
  /** モバイルナビバーの高さ（px） */
  MOBILE_HEIGHT: 56,
  /** 各 NavItem の高さ（px） */
  ITEM_HEIGHT: 48,
  /** ロゴエリアの高さ（px） */
  LOGO_HEIGHT: 56,
  /** collapsed/expanded 切替のブレークポイント（px） */
  EXPAND_BREAKPOINT: 1024,
  /** モバイル切替のブレークポイント（px）— 00-design-foundation 準拠 */
  MOBILE_BREAKPOINT: 768,
} as const;

/** モバイルで直接表示する最大アイテム数 */
export const MOBILE_PRIMARY_MAX = 5;

/** キーボードショートカット → ViewType のマッピング */
export const SHORTCUT_MAP: Record<string, ViewType> = {
  "1": "dashboard",
  "2": "workspace",
  "3": "chat",
  "4": "agent",
  "5": "skillCenter",
  "6": "historySearch",
  "7": "graph",
  "8": "editor",
  ",": "settings",
} as const;
```

### 4.5 アクティブ状態・ホバー状態・フォーカス状態

| 状態       | collapsed 時                                                                 | expanded 時                                                                                   |
| ---------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| デフォルト | `bg-transparent`                                                             | `bg-transparent`                                                                              |
| ホバー     | `bg-[var(--bg-hover)]` (opacity: 0.05 の白)                                  | `bg-[var(--bg-hover)]`                                                                        |
| アクティブ | 左ボーダー `border-l-[4px] border-[var(--accent)]` + `bg-[var(--accent)]/10` | 左ボーダー `border-l-[4px] border-[var(--accent)]` + `bg-[var(--accent)]/10` + ラベルを太字に |
| フォーカス | `ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--bg-primary)]`  | 同左                                                                                          |
| 無効       | `opacity-40 cursor-not-allowed`                                              | 同左                                                                                          |

アクティブアイテムには `aria-current="page"` を設定し、`aria-pressed` は使用しない（ナビゲーションランドマークパターン準拠）。

### 4.6 collapsed/expanded トランジション

```css
/* expanded ↔ collapsed のトランジション */
.global-nav-strip {
  transition: width 200ms ease-out;
}

/* ラベルの表示/非表示 */
.nav-item-label {
  transition:
    opacity 150ms ease-out,
    max-width 200ms ease-out;
  overflow: hidden;
  white-space: nowrap;
}

/* collapsed 時 */
.nav-item-label--collapsed {
  opacity: 0;
  max-width: 0;
}

/* expanded 時 */
.nav-item-label--expanded {
  opacity: 1;
  max-width: 160px;
}
```

Tailwind CSS で実装する場合:

```typescript
// NavItem コンポーネント内
<span
  className={clsx(
    "ml-3 text-sm font-medium text-[var(--text-primary)] truncate",
    "transition-all duration-200 ease-out overflow-hidden whitespace-nowrap",
    isExpanded ? "opacity-100 max-w-[160px]" : "opacity-0 max-w-0",
  )}
>
  {config.label}
</span>
```

## 5. コンポーネント階層

### 5.1 Atomic Design 配置

```
organisms/GlobalNavStrip/
├── index.tsx                 # GlobalNavStrip 本体（organisms）
├── types.ts                  # 型定義
├── constants.ts              # NAV_SECTIONS, NAV_DIMENSIONS, SHORTCUT_MAP
├── GlobalNavStrip.test.tsx   # テスト
│
├── components/
│   ├── NavSection.tsx        # セクション単位のグルーピング（molecules）
│   ├── NavItem.tsx           # 個別ナビアイテム（molecules）
│   ├── NavCollapseToggle.tsx # collapsed/expanded 切替ボタン（atoms）
│   └── NavLogo.tsx           # 上部ロゴ表示（atoms）

organisms/MobileNavBar/
├── index.tsx                 # モバイル底部ナビバー（organisms）
├── MobileNavBar.test.tsx     # テスト
├── components/
│   └── MoreMenu.tsx          # 「More」ボタン → ボトムシート（molecules）

organisms/AppLayout/
├── index.tsx                 # レイアウトラッパー（organisms）
├── AppLayout.test.tsx        # テスト

atoms/ComingSoonView/
├── index.tsx                 # 未実装ビューのプレースホルダー（atoms）
```

### 5.2 レンダリングツリー

```
GlobalNavStrip (organisms)
├── NavLogo (atoms)
│   └── Icon (atoms) — aperture, 24px
│
├── NavSection "メイン機能" (molecules)
│   ├── NavItem "ダッシュボード" (molecules)
│   │   ├── Icon (atoms) — LayoutGrid
│   │   ├── span.label — "ダッシュボード"（expanded時のみ表示）
│   │   ├── Badge (atoms) — 通知カウント（00-foundationから）
│   │   └── Tooltip (molecules) — "ダッシュボード (Cmd+1)"
│   ├── NavItem "ワークスペース" (molecules) — 同構造
│   ├── NavItem "チャット" (molecules) — 同構造
│   ├── NavItem "エージェント" (molecules) — 同構造
│   ├── NavItem "スキルセンター" (molecules) — 同構造
│   └── NavItem "履歴検索" (molecules) — 同構造
│
├── Divider (hr) — セクション区切り
│
├── NavSection "ツール" (molecules)
│   ├── NavItem "グラフ" (molecules)
│   └── NavItem "エディタ" (molecules)
│
├── Divider (hr) — セクション区切り
│
├── NavSection "システム" (molecules) — flex-grow で最下部に固定
│   └── NavItem "設定" (molecules)
│
└── NavCollapseToggle (atoms) — collapsed/expanded切替
    └── Icon (atoms) — ChevronsLeft / ChevronsRight
```

## 6. ルーティングシステム

### 6.1 renderView() の拡張

TASK-UI-01 で ViewType が拡張される前提で、`App.tsx` の `renderView()` を以下のように更新する。

```typescript
// App.tsx — renderView() 拡張後
import { lazy, Suspense } from "react";

// 既存ビュー（即時ロード）
import { DashboardView } from "./views/DashboardView";
import { AgentView } from "./views/AgentView";

// 新規ビュー（遅延ロード）
const WorkspaceView = lazy(() => import("./views/WorkspaceView"));
const SkillCenterView = lazy(() => import("./views/SkillCenterView"));
const HistorySearchView = lazy(() => import("./views/HistorySearchView"));

// プレースホルダー（未実装ビュー用）
import { ComingSoonView } from "./components/atoms/ComingSoonView";

const renderView = () => {
  const viewComponent = (() => {
    switch (currentView) {
      case "dashboard":     return <DashboardView />;
      case "editor":        return <EditorView />;
      case "chat":          return <ChatView />;
      case "graph":         return <GraphView />;
      case "agent":         return <AgentView />;
      case "settings":      return <SettingsView />;
      // 新規ビュー: 実装完了後に遅延ロードコンポーネントに差し替え
      case "workspace":     return <ComingSoonView name="ワークスペース" />;
      case "skillCenter":   return <ComingSoonView name="スキルセンター" />;
      case "historySearch": return <ComingSoonView name="履歴検索" />;
      default:              return <DashboardView />;
    }
  })();

  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--accent)] border-t-transparent" />
        </div>
      }
    >
      {viewComponent}
    </Suspense>
  );
};
```

### 6.2 ComingSoonView コンポーネント

```typescript
// atoms/ComingSoonView/index.tsx

import React from "react";
import { Construction } from "lucide-react";

export interface ComingSoonViewProps {
  /** ビュー名（表示用） */
  name: string;
}

export const ComingSoonView: React.FC<ComingSoonViewProps> = ({ name }) => (
  <div
    className="flex h-full flex-col items-center justify-center gap-4"
    role="status"
    aria-label={`${name}は準備中です`}
  >
    <Construction
      className="h-16 w-16 text-[var(--text-secondary)]"
      aria-hidden="true"
    />
    <h2 className="text-xl font-semibold text-[var(--text-primary)]">
      {name}
    </h2>
    <p className="text-sm text-[var(--text-secondary)]">
      このビューは現在開発中です
    </p>
  </div>
);

ComingSoonView.displayName = "ComingSoonView";
```

### 6.3 NavigationSlice.setCurrentView() の利用

ルーティングは `NavigationSlice.setCurrentView()` を使用する。React Router の `useNavigate()` は URL ベースのルーティング（`/agent`, `/chat/history/:sessionId` 等）にのみ使用し、ViewType ベースのナビゲーションとは分離する。

```typescript
// 正しいパターン: NavigationSlice 経由
const setCurrentView = useAppStore((state) => state.setCurrentView);
setCurrentView("workspace");

// 誤ったパターン: React Router 直接使用（ViewType ナビゲーション）
// const navigate = useNavigate();
// navigate("/workspace");  // ← ViewType ナビゲーションには使用しない
```

### 6.4 viewHistory スタック活用

`NavigationSlice.goBack()` を AppLayout のヘッダー「戻る」ボタンや `Cmd+[` ショートカットに紐付ける。

```typescript
// 戻るボタンの実装例
const canGoBack = useAppStore((state) => state.canGoBack());
const goBack = useAppStore((state) => state.goBack);

<button
  onClick={goBack}
  disabled={!canGoBack}
  aria-label="前のビューに戻る"
  className={clsx(
    "p-2 rounded-lg transition-colors",
    canGoBack
      ? "text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
      : "text-[var(--text-tertiary)] cursor-not-allowed",
  )}
>
  <ChevronLeft className="h-5 w-5" />
</button>
```

## 7. キーボードナビゲーション

### 7.1 グローバルショートカット

| キー    | 動作                 | 条件                             |
| ------- | -------------------- | -------------------------------- |
| `Cmd+1` | ダッシュボードに切替 | フォーカスがテキスト入力外の場合 |
| `Cmd+2` | ワークスペースに切替 | 同上                             |
| `Cmd+3` | チャットに切替       | 同上                             |
| `Cmd+4` | エージェントに切替   | 同上                             |
| `Cmd+5` | スキルセンターに切替 | 同上                             |
| `Cmd+6` | 履歴検索に切替       | 同上                             |
| `Cmd+7` | グラフに切替         | 同上                             |
| `Cmd+8` | エディタに切替       | 同上                             |
| `Cmd+,` | 設定に切替           | 同上                             |
| `Cmd+[` | 前のビューに戻る     | viewHistory.length > 1 の場合    |

### 7.2 NavStrip 内フォーカス移動

| キー         | 動作                                         |
| ------------ | -------------------------------------------- |
| `Arrow Up`   | 前のNavItemにフォーカス移動                  |
| `Arrow Down` | 次のNavItemにフォーカス移動                  |
| `Enter`      | フォーカス中のNavItemを選択                  |
| `Space`      | フォーカス中のNavItemを選択                  |
| `Tab`        | NavStripからメインコンテンツにフォーカス移動 |
| `Home`       | 最初のNavItemにフォーカス移動                |
| `End`        | 最後のNavItemにフォーカス移動                |

### 7.3 ショートカットフック実装

```typescript
// hooks/useNavShortcuts.ts

import { useEffect } from "react";
import { SHORTCUT_MAP } from "../components/organisms/GlobalNavStrip/constants";
import type { ViewType } from "../store/types";

/**
 * グローバルナビゲーションショートカットを登録する
 * P5対策: クリーンアップ関数でリスナーを確実に解除
 */
export function useNavShortcuts(
  onViewChange: (view: ViewType) => void,
  onGoBack: () => void,
): void {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // テキスト入力中はショートカットを無効化
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      // metaKey (Cmd on macOS) が押されている場合のみ処理
      if (!event.metaKey) return;

      // Cmd+[ で戻る
      if (event.key === "[") {
        event.preventDefault();
        onGoBack();
        return;
      }

      // Cmd+数字 または Cmd+, でビュー切替
      const viewType = SHORTCUT_MAP[event.key];
      if (viewType) {
        event.preventDefault();
        onViewChange(viewType);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onViewChange, onGoBack]);
}
```

**P5 対策**: `useEffect` のクリーンアップ関数で `removeEventListener` を実行し、StrictMode での二重実行によるリスナー累積を防止する。

## 8. 通知バッジ連携

### 8.1 バッジの表示条件

| ViewType      | バッジソース                                  | 表示条件             |
| ------------- | --------------------------------------------- | -------------------- |
| `chat`        | 未読メッセージ数（ChatSlice.unreadCount）     | unreadCount > 0      |
| `agent`       | 実行中タスク数（AgentSlice.runningTaskCount） | runningTaskCount > 0 |
| `skillCenter` | 更新可能スキル数（SkillSlice.updatableCount） | updatableCount > 0   |
| その他        | なし                                          | 常に非表示           |

### 8.2 バッジコンポーネント

00-design-foundation.md で定義される `Badge` atoms コンポーネントを使用する。

```typescript
// NavItem 内でのバッジ表示
{badgeCount > 0 && (
  <Badge
    count={badgeCount}
    max={99}
    className="absolute -top-1 -right-1"
    aria-label={`${config.label}に${badgeCount}件の通知`}
  />
)}
```

バッジアニメーション: カウント増加時に `scale(1.2)` → `scale(1.0)` のバウンス（200ms ease-out）。

## 9. レスポンシブ対応

### 9.1 ブレークポイントと表示モード

| モード    | 画面幅          | ナビゲーション表示                                    |
| --------- | --------------- | ----------------------------------------------------- |
| compact   | < 768px         | MobileNavBar（下部、主要5アイテム + Moreメニュー）    |
| collapsed | 768px 〜 1024px | GlobalNavStrip 左サイドバー（アイコンのみ、56px）     |
| expanded  | > 1024px        | GlobalNavStrip 左サイドバー（アイコン+ラベル、200px） |

### 9.2 MobileNavBar 設計

モバイル（compact モード）では `MobileNavBar` を画面下部に固定表示する。

```
┌──────────────────────────────────────┐
│ ┌──────────────────────────────────┐ │
│ │ DashboardViewなどのコンテンツ    │ │
│ │                                  │ │
│ │                                  │ │
│ └──────────────────────────────────┘ │
│ ┌──────────────────────────────────┐ │
│ │ MobileNavBar (h-14, fixed)       │ │
│ │ [Dash][Work][Chat][Agnt][More…]  │ │
│ └──────────────────────────────────┘ │
└──────────────────────────────────────┘
```

**表示アイテム（5+1）**:

- 主要5項目: `isMobilePrimary: true` のアイテム（Dashboard, Workspace, Chat, Agent, SkillCenter）
- More ボタン: 残り4項目（HistorySearch, Graph, Editor, Settings）をボトムシートで展開

**More メニュー（BottomSheet）**:

```typescript
// More ボタン押下時に表示されるボトムシート
<div
  className={clsx(
    "fixed inset-x-0 bottom-14 z-50",
    "bg-[var(--bg-primary)] border-t border-[var(--border-subtle)]",
    "rounded-t-2xl shadow-lg",
    "transition-transform duration-300 ease-out",
    isMoreOpen ? "translate-y-0" : "translate-y-full",
  )}
  role="menu"
  aria-label="追加のナビゲーション"
>
  <div className="grid grid-cols-4 gap-2 p-4">
    {nonPrimaryItems.map((item) => (
      <button key={item.id} onClick={() => onViewChange(item.id)} ...>
        <Icon name={item.icon} size={24} />
        <span className="text-xs mt-1">{item.label}</span>
      </button>
    ))}
  </div>
</div>

{/* オーバーレイ */}
{isMoreOpen && (
  <div
    className="fixed inset-0 z-40 bg-black/30"
    onClick={() => setIsMoreOpen(false)}
    aria-hidden="true"
  />
)}
```

### 9.3 レスポンシブ判定

```typescript
// 既存の useResponsiveMode() セレクタを使用（P31対策）
const responsiveMode = useResponsiveMode();
const isDesktop = responsiveMode === "desktop";

// UISlice に追加するナビ状態
const isNavExpanded = useIsNavExpanded(); // 個別セレクタ
const toggleNavExpanded = useToggleNavExpanded(); // 個別セレクタ
```

## 10. AppLayout ラッパーコンポーネント

### 10.1 設計

```typescript
// organisms/AppLayout/index.tsx

import React from "react";
import { GlobalNavStrip } from "../GlobalNavStrip";
import { MobileNavBar } from "../MobileNavBar";
import { DynamicIsland } from "../../molecules/DynamicIsland";
import { useCurrentView, useResponsiveMode, useIsNavExpanded } from "../../../store";
import { useNavShortcuts } from "../../../hooks/useNavShortcuts";
import type { ViewType } from "../../../store/types";

export interface AppLayoutProps {
  /** メインコンテンツ */
  children: React.ReactNode;
  /** ビュー切替コールバック */
  onViewChange: (view: ViewType) => void;
  /** 戻るコールバック */
  onGoBack: () => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  onViewChange,
  onGoBack,
}) => {
  const currentView = useCurrentView();
  const responsiveMode = useResponsiveMode();
  const isDesktop = responsiveMode === "desktop";
  const dynamicIsland = useAppStore((state) => state.dynamicIsland);

  // グローバルショートカット登録
  useNavShortcuts(onViewChange, onGoBack);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* デスクトップ: 左サイドバー */}
      {isDesktop && (
        <GlobalNavStrip
          currentView={currentView}
          onViewChange={onViewChange}
          mode="desktop"
        />
      )}

      {/* コンテンツエリア */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Dynamic Island */}
        <div className="flex justify-center pt-4 pb-2">
          <DynamicIsland
            status={dynamicIsland.status}
            message={dynamicIsland.message}
            visible={dynamicIsland.visible}
          />
        </div>

        {/* メインコンテンツ */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      {/* モバイル: 底部ナビバー */}
      {!isDesktop && (
        <MobileNavBar
          currentView={currentView}
          onViewChange={onViewChange}
        />
      )}
    </div>
  );
};

AppLayout.displayName = "AppLayout";
```

## 11. 画面構成図（ASCII）

### デスクトップ（expanded、> 1024px）

```
┌─────────────────────────────────────────────────────────────────┐
│ AppLayout (h-screen w-screen flex)                               │
│                                                                   │
│ ┌──────────────────┐ ┌──────────────────────────────────────────┐ │
│ │ GlobalNavStrip   │ │ ContentArea (flex-1 flex flex-col)       │ │
│ │ (w-[200px])      │ │                                          │ │
│ │                  │ │ ┌──────────────────────────────────────┐ │ │
│ │ ┌──────────────┐ │ │ │ DynamicIsland (pt-4 pb-2)           │ │ │
│ │ │ ◎ AIWorkflow │ │ │ └──────────────────────────────────────┘ │ │
│ │ └──────────────┘ │ │                                          │ │
│ │                  │ │ ┌──────────────────────────────────────┐ │ │
│ │ ─── メイン ───── │ │ │ <main> (flex-1 overflow-auto)        │ │ │
│ │ │▌ □ ダッシュ.. │ │ │ │                                    │ │ │
│ │ │  □ ワークス.. │ │ │ │   {renderView()}                   │ │ │
│ │ │  □ チャット   │ │ │ │                                    │ │ │
│ │ │  □ エージェ.. │ │ │ │   ViewType に応じたコンポーネント   │ │ │
│ │ │  □ スキルセ.. │ │ │ │                                    │ │ │
│ │ │  □ 履歴検索   │ │ │ └──────────────────────────────────────┘ │ │
│ │ ─── ツール ───── │ │                                          │ │
│ │ │  □ グラフ     │ │                                          │ │
│ │ │  □ エディタ   │ │                                          │ │
│ │ ─── システム ─── │ │                                          │ │
│ │ │  □ 設定       │ │                                          │ │
│ │ └──────────────┘ │ │                                          │ │
│ │ [◀ 折りたたむ]   │ │                                          │ │
│ └──────────────────┘ └──────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### デスクトップ（collapsed、768px 〜 1024px）

```
┌───────────────────────────────────────────────────────────────┐
│ AppLayout                                                      │
│                                                                 │
│ ┌────────┐ ┌──────────────────────────────────────────────────┐ │
│ │NavStrip│ │ ContentArea                                      │ │
│ │(56px)  │ │                                                  │ │
│ │        │ │ ┌──────────────────────────────────────────────┐ │ │
│ │ [◎]    │ │ │ DynamicIsland                                │ │ │
│ │        │ │ └──────────────────────────────────────────────┘ │ │
│ │ [□]    │ │                                                  │ │
│ │ [□]    │ │ ┌──────────────────────────────────────────────┐ │ │
│ │ [□]    │ │ │ <main>                                       │ │ │
│ │ [□]    │ │ │   {renderView()}                             │ │ │
│ │ [□]    │ │ └──────────────────────────────────────────────┘ │ │
│ │ [□]    │ │                                                  │ │
│ │ ──── │ │                                                  │ │
│ │ [□]    │ │                                                  │ │
│ │ [□]    │ │                                                  │ │
│ │ ──── │ │                                                  │ │
│ │ [□]    │ │                                                  │ │
│ │ [▶]    │ │                                                  │ │
│ └────────┘ └──────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────┘
```

### モバイル（compact、< 768px）

```
┌──────────────────────────────────────┐
│ ContentArea (flex-1)                 │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ DynamicIsland                    │ │
│ └──────────────────────────────────┘ │
│ ┌──────────────────────────────────┐ │
│ │ <main>                           │ │
│ │   {renderView()}                 │ │
│ │                                  │ │
│ └──────────────────────────────────┘ │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ MobileNavBar (h-14, fixed)       │ │
│ │ [Dash][Work][Chat][Agnt][More…]  │ │
│ └──────────────────────────────────┘ │
└──────────────────────────────────────┘
```

## 12. UISlice 拡張

### 12.1 追加 state

```typescript
// 既存の UISlice に追加するフィールド
interface UISliceNavExtension {
  /** NavStrip が expanded（ラベル表示）かどうか */
  isNavExpanded: boolean;
  /** モバイル More メニューが開いているか */
  isMobileMoreOpen: boolean;
}
```

### 12.2 追加 actions

```typescript
interface UISliceNavActions {
  /** NavStrip の collapsed/expanded をトグル */
  toggleNavExpanded: () => void;
  /** NavStrip を明示的に expanded/collapsed に設定 */
  setNavExpanded: (isExpanded: boolean) => void;
  /** モバイル More メニューの開閉をトグル */
  toggleMobileMore: () => void;
  /** モバイル More メニューを閉じる */
  closeMobileMore: () => void;
}
```

### 12.3 個別セレクタ（P31 対策）

```typescript
// 新規個別セレクタ
export const useIsNavExpanded = () =>
  useAppStore((state) => state.isNavExpanded);
export const useToggleNavExpanded = () =>
  useAppStore((state) => state.toggleNavExpanded);
export const useSetNavExpanded = () =>
  useAppStore((state) => state.setNavExpanded);
export const useIsMobileMoreOpen = () =>
  useAppStore((state) => state.isMobileMoreOpen);
export const useToggleMobileMore = () =>
  useAppStore((state) => state.toggleMobileMore);
export const useCloseMobileMore = () =>
  useAppStore((state) => state.closeMobileMore);
```

## 13. テスト計画

### 13.1 単体テスト: GlobalNavStrip

| テストケース                                     | 検証内容                                                                |
| ------------------------------------------------ | ----------------------------------------------------------------------- |
| 9つのNavItemを3セクションで描画する              | `getAllByRole("button")` が9個                                          |
| メインセクションに6つのアイテムが含まれる        | aria-label="メイン機能" 内に6ボタン                                     |
| サブセクションに2つのアイテムが含まれる          | aria-label="ツール" 内に2ボタン                                         |
| フッターセクションに1つのアイテムが含まれる      | aria-label="システム" 内に1ボタン                                       |
| アクティブなNavItemに aria-current="page" が設定 | `getByLabelText("ダッシュボード")` → `aria-current="page"`              |
| 非アクティブなNavItemに aria-current がない      | `getByLabelText("チャット")` → `aria-current` なし                      |
| NavItem クリックで onViewChange が呼ばれる       | `fireEvent.click` → `expect(onViewChange).toHaveBeenCalledWith("chat")` |
| navigation ロールと aria-label が設定されている  | `getByRole("navigation", { name: "Main navigation" })`                  |
| 各セクションが group ロールで囲まれている        | `getAllByRole("group")` が3個                                           |
| ロゴアイコンが表示される                         | `getByLabelText("AIWorkflow")` が存在                                   |
| collapsed 時にラベルが非表示                     | label要素が `opacity-0` / `max-w-0`                                     |
| expanded 時にラベルが表示                        | label要素が `opacity-100` / `max-w-[160px]`                             |
| セクション間に区切り線が表示される               | `<hr>` 要素が2個                                                        |

### 13.2 単体テスト: NavItem

| テストケース                              | 検証内容                                   |
| ----------------------------------------- | ------------------------------------------ |
| アイコンとラベルを表示する（expanded）    | Icon コンポーネントとラベル span が存在    |
| アイコンのみ表示する（collapsed）         | Icon 存在、ラベル span が opacity-0        |
| Tooltip にラベルとショートカットを表示    | Tooltip content = "ダッシュボード (Cmd+1)" |
| バッジカウントが0以上の場合バッジを表示   | Badge コンポーネントが存在                 |
| バッジカウントが0以下の場合バッジを非表示 | Badge コンポーネントが不存在               |

### 13.3 統合テスト: キーボードナビゲーション

| テストケース                       | 検証内容                                           |
| ---------------------------------- | -------------------------------------------------- |
| Cmd+1 でダッシュボードに切替       | `keydown` → `onViewChange("dashboard")` コール     |
| Cmd+, で設定に切替                 | `keydown` → `onViewChange("settings")` コール      |
| テキスト入力中はショートカット無効 | input にフォーカス中 → `onViewChange` が呼ばれない |
| Arrow Up/Down でフォーカス移動     | フォーカス対象の変更を検証                         |
| Enter/Space で選択                 | `onViewChange` が呼ばれる                          |

### 13.4 統合テスト: MobileNavBar

| テストケース                               | 検証内容                                   |
| ------------------------------------------ | ------------------------------------------ |
| 主要5アイテムが表示される                  | `getAllByRole("button")` が6個（5 + More） |
| More ボタンで残り4アイテムが展開表示       | ボトムシート内に4ボタン                    |
| More メニュー外タップでメニューが閉じる    | オーバーレイクリック → メニュー非表示      |
| NavItem クリックで onViewChange が呼ばれる | `fireEvent.click` → `onViewChange` コール  |

### 13.5 統合テスト: AppLayout

| テストケース                                     | 検証内容                           |
| ------------------------------------------------ | ---------------------------------- |
| デスクトップモードで GlobalNavStrip が表示される | `getByRole("navigation")` が存在   |
| モバイルモードで MobileNavBar が表示される       | 底部ナビバーが存在                 |
| DynamicIsland が表示される                       | DynamicIsland コンポーネントが存在 |
| children がメインコンテンツ領域に表示される      | main 要素内に children が存在      |

### 13.6 テスト環境の注意事項

- **P39**: happy-dom 環境では `userEvent` を使用せず、`fireEvent` を使用する。非同期ハンドラは `await act(async () => { fireEvent.click(el) })` で包む
- **P40**: テスト実行は `cd apps/desktop && pnpm vitest run src/renderer/components/organisms/GlobalNavStrip/` で実行する。プロジェクトルートからの実行は happy-dom 設定が適用されないため禁止
- **P31**: テスト内で Store を使用する場合は、個別セレクタを使用し、合成Hook（`useAppStore()` の一括分割代入）は使用しない

## 14. 成果物一覧（ファイルパス）

### プロダクションコード

| ファイル                                                                                         | 種別 | 説明                                       |
| ------------------------------------------------------------------------------------------------ | ---- | ------------------------------------------ |
| `apps/desktop/src/renderer/components/organisms/GlobalNavStrip/index.tsx`                        | 新規 | GlobalNavStrip 本体コンポーネント          |
| `apps/desktop/src/renderer/components/organisms/GlobalNavStrip/types.ts`                         | 新規 | NavItemConfig, NavSectionConfig 等の型     |
| `apps/desktop/src/renderer/components/organisms/GlobalNavStrip/constants.ts`                     | 新規 | NAV_SECTIONS, NAV_DIMENSIONS, SHORTCUT_MAP |
| `apps/desktop/src/renderer/components/organisms/GlobalNavStrip/components/NavSection.tsx`        | 新規 | セクション単位のグルーピング               |
| `apps/desktop/src/renderer/components/organisms/GlobalNavStrip/components/NavItem.tsx`           | 新規 | 個別ナビアイテム                           |
| `apps/desktop/src/renderer/components/organisms/GlobalNavStrip/components/NavCollapseToggle.tsx` | 新規 | collapsed/expanded 切替ボタン              |
| `apps/desktop/src/renderer/components/organisms/GlobalNavStrip/components/NavLogo.tsx`           | 新規 | 上部ロゴ表示                               |
| `apps/desktop/src/renderer/components/organisms/MobileNavBar/index.tsx`                          | 新規 | モバイル底部ナビバー                       |
| `apps/desktop/src/renderer/components/organisms/MobileNavBar/components/MoreMenu.tsx`            | 新規 | More ボタン → ボトムシート                 |
| `apps/desktop/src/renderer/components/organisms/AppLayout/index.tsx`                             | 新規 | レイアウトラッパー                         |
| `apps/desktop/src/renderer/components/atoms/ComingSoonView/index.tsx`                            | 新規 | 未実装ビューのプレースホルダー             |
| `apps/desktop/src/renderer/hooks/useNavShortcuts.ts`                                             | 新規 | グローバルショートカットフック             |
| `apps/desktop/src/renderer/App.tsx`                                                              | 修正 | AppLayout 適用、renderView 拡張            |
| `apps/desktop/src/renderer/store/slices/uiSlice.ts`                                              | 修正 | isNavExpanded, isMobileMoreOpen 追加       |
| `apps/desktop/src/renderer/store/slices/navigationSlice.ts`                                      | 修正 | ViewType 拡張（TASK-UI-01 と連携）         |
| `apps/desktop/src/renderer/store/index.ts`                                                       | 修正 | 新規セレクタのエクスポート追加             |

### テストファイル

| ファイル                                                                                | 種別 | 説明                                    |
| --------------------------------------------------------------------------------------- | ---- | --------------------------------------- |
| `apps/desktop/src/renderer/components/organisms/GlobalNavStrip/GlobalNavStrip.test.tsx` | 新規 | NavItem・セクション描画・ショートカット |
| `apps/desktop/src/renderer/components/organisms/MobileNavBar/MobileNavBar.test.tsx`     | 新規 | モバイルナビ表示・More展開              |
| `apps/desktop/src/renderer/components/organisms/AppLayout/AppLayout.test.tsx`           | 新規 | レスポンシブレイアウト                  |

### 削除ファイル（Step 3 完了時）

| ファイル                                                                  | 種別 | 説明             |
| ------------------------------------------------------------------------- | ---- | ---------------- |
| `apps/desktop/src/renderer/components/organisms/AppDock/index.tsx`        | 削除 | 旧ナビゲーション |
| `apps/desktop/src/renderer/components/organisms/AppDock/AppDock.test.tsx` | 削除 | 旧テスト         |

## 15. 完了条件

### 必須条件

- [ ] GlobalNavStrip が9つの NavItem を3セクション（メイン/サブ/フッター）で描画すること
- [ ] 各 NavItem クリックで `onViewChange` が正しい ViewType で呼ばれること
- [ ] アクティブな NavItem に `aria-current="page"` が設定されること
- [ ] 非アクティブな NavItem に `aria-current` 属性が存在しないこと
- [ ] 各セクションが `role="group"` + `aria-label` で囲まれていること
- [ ] navigation ランドマーク（`role="navigation"` + `aria-label="Main navigation"`）が設定されていること
- [ ] collapsed 時: 幅56px、アイコンのみ表示
- [ ] expanded 時: 幅200px、アイコン+ラベル表示
- [ ] collapsed/expanded トグルボタンが機能すること
- [ ] collapsed ↔ expanded のトランジション（200ms ease-out）が適用されていること
- [ ] モバイル（< 768px）: MobileNavBar が底部に固定表示されること
- [ ] MobileNavBar で主要5アイテムが表示され、More ボタンで残り4アイテムが展開されること
- [ ] `App.tsx` の `renderView` が9つの ViewType を処理すること（新規3つは ComingSoonView）
- [ ] キーボードショートカット（Cmd+1〜8, Cmd+,）で全ビューに切替可能なこと
- [ ] テキスト入力中（input/textarea/contentEditable）はショートカットが無効化されること
- [ ] Arrow Up/Down で NavStrip 内のフォーカスが移動すること
- [ ] AppLayout がデスクトップ/モバイルで正しくレイアウトされること
- [ ] DynamicIsland の表示が維持されていること
- [ ] Step 3 完了後: `grep -rn "AppDock" apps/desktop/src/` の結果が0件
- [ ] Step 3 完了後: `grep -rn "USE_GLOBAL_NAV_STRIP" apps/desktop/src/` の結果が0件
- [ ] 全テストが PASS すること
- [ ] `pnpm --filter @repo/desktop typecheck` が通ること
- [ ] `pnpm --filter @repo/desktop lint` が通ること
- [ ] WCAG 2.1 AA: コントラスト比 4.5:1 以上（ナビテキストと背景）
- [ ] フォーカスリング（ring-2）が全 NavItem に表示されること

### 自動検証コマンド

```bash
# 型チェック
pnpm --filter @repo/desktop typecheck

# リント
pnpm --filter @repo/desktop lint

# テスト
cd apps/desktop && pnpm vitest run src/renderer/components/organisms/GlobalNavStrip/
cd apps/desktop && pnpm vitest run src/renderer/components/organisms/MobileNavBar/
cd apps/desktop && pnpm vitest run src/renderer/components/organisms/AppLayout/

# AppDock 残存チェック（Step 3 完了後）
grep -rn "AppDock" apps/desktop/src/
grep -rn "USE_GLOBAL_NAV_STRIP" apps/desktop/src/
```

## 16. 既知の落とし穴・教訓

### P5 関連: リスナー二重登録

- `useNavShortcuts` フックの `keydown` リスナーは `useEffect` のクリーンアップ関数で必ず解除する
- React StrictMode で `useEffect` が2回実行されるため、リスナーの二重登録を防ぐクリーンアップが必須
- MobileNavBar の More メニュー外タップリスナーも同様にクリーンアップする

### P31 関連: Zustand セレクタ

- `useCurrentView()`, `useResponsiveMode()`, `useIsNavExpanded()` は個別セレクタを使用する
- `useAppStore()` の一括分割代入（`const { currentView, setCurrentView } = useAppStore()`）は禁止
- 新規セレクタ（`useIsNavExpanded`, `useToggleNavExpanded` 等）も個別セレクタパターンで実装する

### P39 関連: テスト環境

- happy-dom 環境では `userEvent.setup()` を使用しない。`fireEvent` を使用する
- 非同期ハンドラは `await act(async () => { fireEvent.click(el) })` で包む
- キーボードイベントのテストも `fireEvent.keyDown` を使用する

### P40 関連: テスト実行ディレクトリ

- テスト実行は `cd apps/desktop && pnpm vitest run ...` で実行する
- プロジェクトルートからの `pnpm vitest run apps/desktop/...` は happy-dom 設定が適用されないため禁止

### AppDock 移行固有のリスク

| リスク                          | 影響 | 対策                                                              |
| ------------------------------- | ---- | ----------------------------------------------------------------- |
| フィーチャーフラグ残存          | 中   | Step 3 で `grep` 確認を必須チェックリストに含める                 |
| ViewType の型参照元が AppDock   | 高   | Step 3 で import 元を `store/types.ts` に変更する                 |
| NavIcon の props 不整合         | 低   | NavItem を新規作成するため、NavIcon への依存は除去                |
| モバイルレイアウト崩れ          | 中   | MobileNavBar を独立テストし、AppDock テストを移植する             |
| ショートカット競合              | 低   | 既存ショートカット一覧を事前調査し、`Cmd+6`〜`Cmd+8` の重複を確認 |
| collapsed/expanded 状態の永続化 | 低   | UISlice に `isNavExpanded` を追加し、persist ミドルウェアで保存   |

## 17. 参照資料

| 資料                           | 参照先                                                                    |
| ------------------------------ | ------------------------------------------------------------------------- |
| デザイン基盤（テーマ・カラー） | `ui-overhaul/00-ui-design-foundation.md` (TASK-UI-00)                     |
| アーキテクチャ基盤（ViewType） | `ui-overhaul/01-store-ipc-architecture.md` (TASK-UI-01)                   |
| 既存 AppDock 実装              | `apps/desktop/src/renderer/components/organisms/AppDock/index.tsx`        |
| 既存 AppDock テスト            | `apps/desktop/src/renderer/components/organisms/AppDock/AppDock.test.tsx` |
| 既存 NavIcon 実装              | `apps/desktop/src/renderer/components/molecules/NavIcon/index.tsx`        |
| 既存 App.tsx                   | `apps/desktop/src/renderer/App.tsx`                                       |
| navigationSlice                | `apps/desktop/src/renderer/store/slices/navigationSlice.ts`               |
| uiSlice                        | `apps/desktop/src/renderer/store/slices/uiSlice.ts`                       |
| Apple HIG ナビゲーション       | `.claude/rules/01-architecture.md` UI/UXデザイン哲学セクション            |
| 状態管理ルール（P31対策）      | `.claude/rules/03-state-management.md`                                    |
| 既知の落とし穴                 | `.claude/rules/06-known-pitfalls.md`                                      |
| WAI-ARIA Navigation Landmark   | https://www.w3.org/WAI/ARIA/apg/patterns/landmarks/                       |

## 18. 次のPhase

GlobalNavStrip が完成し、全9 ViewType のルーティングが機能した時点で、以下のタスクを並列実行可能:

- **TASK-UI-03**: エージェント画面強化（AgentView リデザイン）
- **TASK-UI-04**: ワークスペース画面（WorkspaceView 新規作成）
- **TASK-UI-05**: スキルセンター画面（SkillCenterView 新規作成）
- **TASK-UI-06**: 履歴検索画面（HistorySearchView 新規作成）
- **TASK-UI-07**: ダッシュボード強化（DashboardView リデザイン）
- **TASK-UI-08**: 通知センター（NotificationCenter 新規作成）
- **TASK-UI-09**: オンボーディングウィザード（OnboardingWizard 新規作成）

**注意**: TASK-UI-03〜09 は全て GlobalNavStrip の NavItem からの遷移をエントリポイントとするため、Step 1（並行稼働）が完了するまで着手しないこと。
