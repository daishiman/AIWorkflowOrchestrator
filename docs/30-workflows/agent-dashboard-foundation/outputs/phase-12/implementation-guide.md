# エージェントダッシュボード基盤 実装ガイド

## 概要情報

| 項目     | 内容                       |
| -------- | -------------------------- |
| タスクID | AGENT-001                  |
| 機能名   | agent-dashboard-foundation |
| 作成日   | 2026-01-10                 |

---

# Part 1: 概念的な説明

## エージェント機能とは何か？（中学生向け説明）

### 比喩：レストランの厨房

エージェント機能を「レストラン」に例えてみましょう。

```
┌─────────────────────────────────────────────────────────┐
│                    レストラン                            │
│                                                         │
│  ┌──────────┐     ┌──────────┐     ┌──────────┐        │
│  │  お客様  │ →   │ウェイター│ →   │  厨房    │        │
│  │ (あなた) │     │ (画面)   │     │(処理実行)│        │
│  └──────────┘     └──────────┘     └──────────┘        │
│                                                         │
│  「パスタください」      注文を伝える      料理を作る    │
└─────────────────────────────────────────────────────────┘
```

- **お客様（あなた）**: アプリを使う人
- **ウェイター（画面）**: AgentView - あなたの指示を受け付ける画面
- **厨房（処理実行）**: バックエンド - 実際にタスクを処理する場所

### 今回作ったのは「ウェイター」の部分

今回の「エージェントダッシュボード基盤」は、この比喩でいう**ウェイターの準備**です。

- ウェイターが立つ場所を用意した（AgentView画面）
- メニュー表を用意した（スキル一覧表示機能）
- 注文を記録するメモ帳を用意した（agentSlice状態管理）

まだ厨房（実際の処理）は作っていませんが、注文を受け付ける準備は完了しました！

---

## なぜこの機能が必要なのか？

### Before（以前）

```
ユーザー: 「このタスクを自動化したい...」
        → 毎回手動でコマンドを打つ
        → 何ができるか覚えていない
        → 効率が悪い
```

### After（今後）

```
ユーザー: 「Agent画面を開く」
        → 利用可能なスキル一覧が見える
        → クリックで実行できる
        → 何ができるか一目瞭然！
```

---

## 全体アーキテクチャ図

```
┌─────────────────────────────────────────────────────────────────┐
│                        AIWorkflowOrchestrator                    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                     Renderer Process                        │ │
│  │                                                             │ │
│  │   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐   │ │
│  │   │Dashboard│   │ Editor  │   │  Chat   │   │ Agent   │   │ │
│  │   │  View   │   │  View   │   │  View   │   │  View ★│   │ │
│  │   └────┬────┘   └────┬────┘   └────┬────┘   └────┬────┘   │ │
│  │        │             │             │             │         │ │
│  │        └─────────────┴──────┬──────┴─────────────┘         │ │
│  │                             │                               │ │
│  │                    ┌────────▼────────┐                     │ │
│  │                    │   Zustand Store │                     │ │
│  │                    │  ┌────────────┐ │                     │ │
│  │                    │  │ agentSlice★│ │                     │ │
│  │                    │  │ uiSlice    │ │                     │ │
│  │                    │  │ authSlice  │ │                     │ │
│  │                    │  └────────────┘ │                     │ │
│  │                    └────────┬────────┘                     │ │
│  └─────────────────────────────┼───────────────────────────────┘ │
│                                │ IPC                             │
│  ┌─────────────────────────────▼───────────────────────────────┐ │
│  │                      Main Process                           │ │
│  │   ┌─────────────────────────────────────────────────────┐   │ │
│  │   │              IPC Handlers (future)                   │   │ │
│  │   │   agent:list-skills ★                               │   │ │
│  │   │   agent:execute-skill ★                             │   │ │
│  │   │   agent:get-status ★                                │   │ │
│  │   └─────────────────────────────────────────────────────┘   │ │
│  └──────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘

★ = 今回実装した部分
```

---

## 用語集

| 用語             | 読み方               | 意味                                 | コンテキスト     |
| ---------------- | -------------------- | ------------------------------------ | ---------------- |
| AgentView        | エージェントビュー   | エージェント機能の画面               | UIコンポーネント |
| agentSlice       | エージェントスライス | エージェント状態を管理するストア     | Zustand状態管理  |
| Skill            | スキル               | エージェントが実行できる個別機能     | ドメインモデル   |
| AppDock          | アップドック         | 画面左側/下部のナビゲーションバー    | UIコンポーネント |
| Zustand          | ズースタンド         | React用の軽量状態管理ライブラリ      | 状態管理         |
| IPC              | アイピーシー         | プロセス間通信（Inter-Process Comm.) | Electron         |
| Renderer Process | レンダラープロセス   | 画面描画を担当するプロセス           | Electron         |
| Main Process     | メインプロセス       | システム処理を担当するプロセス       | Electron         |

---

# Part 2: 技術的な詳細

## 1. 状態管理層（agentSlice）

### なぜZustand sliceパターンを採用したか

**悪い例：単一の巨大ストア**

```typescript
// ❌ 悪い例：全状態が1ファイルに集中
const store = create({
  // UIの状態
  currentView: "dashboard",
  theme: "dark",
  // 認証の状態
  isAuthenticated: false,
  user: null,
  // エージェントの状態
  skills: [],
  isLoading: false,
  // ... 100行以上続く
});
```

**良い例：スライスパターンで分離**

```typescript
// ✅ 良い例：責務ごとに分離
// agentSlice.ts - エージェント専用
export const createAgentSlice: StateCreator<AgentSlice> = (set, get) => ({
  // エージェント状態のみ
  skills: [],
  isLoading: false,
  error: null,
  // エージェントアクションのみ
  setSkills: (skills) => set({ skills }),
});
```

### コード詳細（agentSlice.ts）

```typescript
import type { StateCreator } from "zustand";

/**
 * スキル（Skill）の型定義
 * エージェントが実行可能な個別機能を表す
 */
export interface Skill {
  id: string; // 一意識別子（例："commit"）
  name: string; // 表示名（例："コミット作成"）
  description: string; // 説明文
  path: string; // スキルファイルのパス
  triggers: string[]; // トリガーキーワード
  category?: string; // カテゴリ（任意）
}

/**
 * エージェント実行状態
 * スキル実行中の状態を追跡
 */
export type AgentExecutionStatus =
  | "idle" // 待機中
  | "running" // 実行中
  | "completed" // 完了
  | "error"; // エラー

/**
 * 状態（State）の型定義
 * UIに表示するデータを保持
 */
export interface AgentState {
  skills: Skill[]; // スキル一覧
  selectedSkillId: string | null; // 選択中のスキルID
  skillFilter: string; // フィルター文字列
  executionStatus: AgentExecutionStatus;
  executionResult: string | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * アクション（Actions）の型定義
 * 状態を変更するメソッド
 */
export interface AgentActions {
  setSkills: (skills: Skill[]) => void;
  selectSkill: (skillId: string | null) => void;
  setSkillFilter: (filter: string) => void;
  setExecutionStatus: (status: AgentExecutionStatus) => void;
  setExecutionResult: (result: string | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  resetAgentState: () => void;
}

// スライス = 状態 + アクション
export type AgentSlice = AgentState & AgentActions;

// 初期状態（リセット時にも使用）
const initialState: AgentState = {
  skills: [],
  selectedSkillId: null,
  skillFilter: "",
  executionStatus: "idle",
  executionResult: null,
  isLoading: false,
  error: null,
};

/**
 * createAgentSlice
 * Zustand storeに統合されるエージェント機能スライス
 *
 * @param set - 状態更新関数
 * @param get - 状態取得関数（未使用だが型定義で必要）
 */
export const createAgentSlice: StateCreator<AgentSlice> = (set) => ({
  // 初期状態を展開
  ...initialState,

  // アクション実装
  setSkills: (skills) => set({ skills }),

  selectSkill: (skillId) => set({ selectedSkillId: skillId }),

  setSkillFilter: (filter) => set({ skillFilter: filter }),

  setExecutionStatus: (status) => set({ executionStatus: status }),

  setExecutionResult: (result) => set({ executionResult: result }),

  setIsLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  // 全状態を初期値にリセット
  resetAgentState: () => set(initialState),
});
```

---

## 2. UIコンポーネント層（AgentView）

### コンポーネント構成

```
AgentView/
├── index.tsx          # メインコンポーネント
└── __tests__/
    └── AgentView.test.tsx  # テスト
```

### なぜコンポーネントを分割したか

**悪い例：単一の巨大コンポーネント**

```tsx
// ❌ 悪い例：1ファイルに全てのロジック
export const AgentView = () => {
  // ヘッダー描画
  <header>...</header>
  // エラー表示
  {error && <div>...</div>}
  // ローディング表示
  {isLoading && <div>...</div>}
  // スキル一覧
  {skills.map(...)}
  // ... 200行以上続く
};
```

**良い例：責務ごとに分割**

```tsx
// ✅ 良い例：サブコンポーネントに分割
const AgentHeader: React.FC = () => (
  <header role="banner">
    <h1>Agent</h1>
    <p>エージェント機能の管理と実行</p>
  </header>
);

const SkillList: React.FC<{ skills: Skill[] }> = ({ skills }) => (
  <ul>
    {skills.map((skill) => (
      <li key={skill.id}>
        <span>{skill.name}</span>
        <p>{skill.description}</p>
      </li>
    ))}
  </ul>
);

const MainContent: React.FC<{ isLoading: boolean; skills: Skill[] }> = ({
  isLoading,
  skills,
}) => {
  if (isLoading) return <p>読み込み中...</p>;
  if (skills.length > 0) return <SkillList skills={skills} />;
  return <p>エージェント機能は準備中です</p>;
};

// メインコンポーネントは組み合わせのみ
export const AgentView: React.FC = () => {
  const isLoading = useAppStore((state) => state.isLoading);
  const error = useAppStore((state) => state.error);
  const skills = useAppStore((state) => state.skills);

  if (error) {
    return (
      <div>
        <AgentHeader />
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <AgentHeader />
      <MainContent isLoading={isLoading} skills={skills} />
    </div>
  );
};
```

---

## 3. ナビゲーション統合（App.tsx）

### 追加した変更点

```tsx
// 1. インポート追加
import { AgentView } from "./views/AgentView";

// 2. renderView関数にケース追加
const renderView = () => {
  switch (currentView) {
    case "dashboard":
      return <DashboardView />;
    case "editor":
      return <EditorView />;
    case "chat":
      return <ChatView />;
    case "graph":
      return <GraphView />;
    case "agent": // ★ 追加
      return <AgentView />; // ★ 追加
    case "settings":
      return <SettingsView />;
    default:
      return <DashboardView />;
  }
};
```

### AppDock設定（既存）

```tsx
// AppDock/index.tsx - navItems配列に既に追加済み
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
  { id: "agent", icon: "bot", label: "Agent", shortcut: "Cmd+5" }, // ★
  { id: "settings", icon: "user", label: "Settings", shortcut: "Cmd+," },
];
```

---

## 4. IPCチャネル定義（将来拡張用）

### 定義済みチャネル（channels.ts）

```typescript
// preload/channels.ts
export const AGENT_CHANNELS = {
  // スキル一覧取得
  LIST_SKILLS: "agent:list-skills",
  // スキル実行
  EXECUTE_SKILL: "agent:execute-skill",
  // 実行状態取得
  GET_STATUS: "agent:get-status",
  // 実行キャンセル
  CANCEL_EXECUTION: "agent:cancel-execution",
} as const;
```

### 将来の実装イメージ

```typescript
// 将来実装予定：Renderer側
const skills = await window.api.agent.listSkills();

// 将来実装予定：Main側ハンドラー
ipcMain.handle(AGENT_CHANNELS.LIST_SKILLS, async () => {
  const skills = await skillLoader.loadAll();
  return skills;
});
```

---

## 5. テスト戦略

### テストピラミッド

```
          /\
         /  \
        / E2E\     ← Phase 11で手動テスト
       /──────\
      /        \
     / 統合テスト \   ← 24テスト（navigation, state-sync）
    /────────────\
   /              \
  /    単体テスト   \  ← 96テスト（agentSlice, AgentView）
 /──────────────────\
```

### カバレッジ達成状況

| ファイル            | Line | Branch | Function |
| ------------------- | ---- | ------ | -------- |
| agentSlice.ts       | 100% | 100%   | 100%     |
| AgentView/index.tsx | 100% | 100%   | 100%     |

---

## 6. アクセシビリティ対応

### WCAG 2.1 AA準拠ポイント

```tsx
// セマンティックHTML
<header role="banner">
  <h1>Agent</h1>
</header>

// ARIA属性
<section role="region" aria-label="メインコンテンツ">
  ...
</section>

// 見出し階層
<h1>Agent</h1>  // レベル1のみ使用
```

---

## 後続タスク（Out of Scope）

| タスクID  | 機能                 | 依存関係                   |
| --------- | -------------------- | -------------------------- |
| AGENT-002 | スキル一覧表示機能   | AGENT-001完了後            |
| AGENT-003 | エージェント実行機能 | AGENT-002完了後            |
| AGENT-005 | IPCハンドラー実装    | AGENT-002, AGENT-003完了後 |

---

## まとめ

### 今回実装したもの

1. **AgentView**: エージェント画面のUIコンポーネント
2. **agentSlice**: エージェント状態を管理するZustandスライス
3. **ナビゲーション**: AppDockにAgentメニュー追加 + App.tsx統合
4. **IPCチャネル定義**: 将来のバックエンド連携用

### 技術的な選択理由

| 選択               | 理由                             |
| ------------------ | -------------------------------- |
| Zustand slice      | 既存パターンとの整合性、型安全性 |
| コンポーネント分割 | 再利用性、テスタビリティ向上     |
| WCAG 2.1 AA        | アクセシビリティ要件への準拠     |
| TDD                | 品質担保、リグレッション防止     |

### Phase 11で発見・修正したバグ

- **BUG-001**: App.tsxへのAgentView統合漏れ → 修正済み
