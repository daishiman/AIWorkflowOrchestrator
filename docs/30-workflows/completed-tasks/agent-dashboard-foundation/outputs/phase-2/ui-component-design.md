# UIコンポーネント設計書 - エージェントダッシュボード基盤

## 概要情報

| 項目     | 内容                       |
| -------- | -------------------------- |
| タスクID | AGENT-001                  |
| 機能名   | agent-dashboard-foundation |
| Phase    | 2                          |
| 作成日   | 2026-01-10                 |

---

## デザインシステム準拠

### 使用するブレークポイント

| ブレークポイント | 値     | 対象                 |
| ---------------- | ------ | -------------------- |
| sm               | 640px  | 大型スマートフォン   |
| md               | 768px  | タブレット（縦向き） |
| lg               | 1024px | タブレット（横向き） |
| xl               | 1280px | デスクトップ         |
| 2xl              | 1536px | 大型デスクトップ     |

### スペーシング（8pxグリッド）

| クラス | サイズ | 使用箇所           |
| ------ | ------ | ------------------ |
| gap-4  | 16px   | コンポーネント間隔 |
| gap-6  | 24px   | セクション間隔     |
| p-6    | 24px   | コンテナパディング |
| mt-1   | 4px    | 小さい余白         |
| mb-4   | 16px   | 見出し下余白       |

---

## AgentViewコンポーネント設計

### コンポーネント構造

```tsx
// AgentView/index.tsx

export interface AgentViewProps {
  className?: string;
}

export const AgentView: React.FC<AgentViewProps> = ({ className }) => {
  // Store hooks
  const isLoading = useAppStore((state) => state.agentLoading);
  const error = useAppStore((state) => state.agentError);

  // Error state
  if (error) {
    return <ErrorDisplay error={error} className={className} />;
  }

  return (
    <div
      className={clsx(
        "flex flex-col gap-6 p-6 h-full overflow-auto",
        className,
      )}
    >
      {/* Header Section */}
      <header>
        <h1 className="text-2xl font-bold text-white">Agent</h1>
        <p className="text-gray-400 mt-1">エージェント機能の管理と実行</p>
      </header>

      {/* Main Content Section */}
      <section className="flex-1">
        <GlassPanel className="h-full flex items-center justify-center">
          {isLoading ? (
            <LoadingIndicator />
          ) : (
            <Placeholder message="エージェント機能は準備中です" />
          )}
        </GlassPanel>
      </section>
    </div>
  );
};

AgentView.displayName = "AgentView";
```

### レイアウト設計

```
┌─────────────────────────────────────────────────┐
│  AgentView                                       │
│  ┌─────────────────────────────────────────────┐│
│  │  Header                                      ││
│  │  ┌─────────────────────────────────────────┐││
│  │  │  h1: "Agent"                            │││
│  │  │  p: "エージェント機能の管理と実行"      │││
│  │  └─────────────────────────────────────────┘││
│  └─────────────────────────────────────────────┘│
│                                                  │
│  ┌─────────────────────────────────────────────┐│
│  │  Main Content (GlassPanel)                   ││
│  │  ┌─────────────────────────────────────────┐││
│  │  │                                          │││
│  │  │      "エージェント機能は準備中です"     │││
│  │  │         (Placeholder)                    │││
│  │  │                                          │││
│  │  └─────────────────────────────────────────┘││
│  └─────────────────────────────────────────────┘│
└─────────────────────────────────────────────────┘
```

---

## AppDockナビゲーション更新

### navItems配列への追加

```tsx
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
  // 新規追加
  { id: "agent", icon: "bot", label: "Agent", shortcut: "Cmd+5" },
  { id: "settings", icon: "user", label: "Settings", shortcut: "Cmd+," },
];
```

### ViewType更新

```tsx
// AppDock/index.tsx
export type ViewType =
  | "dashboard"
  | "editor"
  | "chat"
  | "graph"
  | "settings"
  | "agent";
```

### アイコン選定理由

| アイコン | 選定理由                              |
| -------- | ------------------------------------- |
| bot      | AIエージェント機能を直感的に表現      |
| 代替案   | cpu（技術的すぎる）、sparkles（曖昧） |

---

## スタイリングガイドライン

### カラーパレット

| 要素             | クラス               | 説明               |
| ---------------- | -------------------- | ------------------ |
| ヘッダーテキスト | text-white           | メインテキスト     |
| サブテキスト     | text-gray-400        | 説明文             |
| エラーテキスト   | text-red-400         | エラーメッセージ   |
| 背景             | bg-[var(--bg-glass)] | グラスモーフィズム |

### タイポグラフィ

| 要素             | クラス                | サイズ |
| ---------------- | --------------------- | ------ |
| ページタイトル   | text-2xl font-bold    | 24px   |
| 説明文           | text-base             | 16px   |
| セクション見出し | text-lg font-semibold | 18px   |

---

## レスポンシブ対応

### デスクトップモード（lg以上）

```
┌──────────┬─────────────────────────────────────┐
│  AppDock │          AgentView                  │
│  (縦)    │                                     │
│          │                                     │
│   [D]    │                                     │
│   [E]    │                                     │
│   [C]    │                                     │
│   [G]    │                                     │
│   [A] ◄──│────── Active                        │
│   [S]    │                                     │
│          │                                     │
└──────────┴─────────────────────────────────────┘
```

### モバイルモード（lg未満）

```
┌─────────────────────────────────────────────────┐
│                  AgentView                       │
│                                                  │
│                                                  │
│                                                  │
│                                                  │
├─────────────────────────────────────────────────┤
│  [D]    [E]    [C]    [G]    [A]    [S]         │
│                               ▲                  │
│                          Active                  │
└─────────────────────────────────────────────────┘
```

---

## アクセシビリティ対応

### ARIA属性

| 要素                   | 属性                     |
| ---------------------- | ------------------------ |
| AgentView container    | data-testid="agent-view" |
| ヘッダー               | role="banner" (implicit) |
| メインコンテンツ       | role="main" (implicit)   |
| ナビゲーションアイコン | aria-label="Agent"       |

### キーボードナビゲーション

| キー操作     | 動作            |
| ------------ | --------------- |
| Cmd/Ctrl + 5 | AgentViewに遷移 |
| Tab          | フォーカス移動  |
| Enter/Space  | 選択実行        |

### フォーカス管理

```tsx
// フォーカス可能な要素にフォーカスリングを表示
className =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";
```

---

## 使用する既存コンポーネント

| コンポーネント | パス                              | 用途           |
| -------------- | --------------------------------- | -------------- |
| GlassPanel     | `components/organisms/GlassPanel` | メインコンテナ |
| Icon           | `components/atoms/Icon`           | アイコン表示   |
| NavIcon        | `components/molecules/NavIcon`    | ナビゲーション |

---

## テスト対象

### ユニットテスト

| テスト項目                 | 期待結果                     |
| -------------------------- | ---------------------------- |
| コンポーネントレンダリング | エラーなく表示される         |
| ヘッダー表示               | "Agent"タイトルが表示される  |
| プレースホルダー表示       | メッセージが表示される       |
| エラー状態表示             | エラーメッセージが表示される |

### 統合テスト

| テスト項目         | 期待結果                       |
| ------------------ | ------------------------------ |
| ナビゲーション遷移 | AppDockクリックでAgentView表示 |
| 状態更新           | currentViewが"agent"に更新     |
