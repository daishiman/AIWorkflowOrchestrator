# アーキテクチャ設計書 - エージェントダッシュボード基盤

## 概要情報

| 項目     | 内容                       |
| -------- | -------------------------- |
| タスクID | AGENT-001                  |
| 機能名   | agent-dashboard-foundation |
| Phase    | 2                          |
| 作成日   | 2026-01-10                 |

---

## システムアーキテクチャ

### 全体構成図

```
┌─────────────────────────────────────────────────────────┐
│                   Renderer Process                       │
│  ┌─────────────────────────────────────────────────────┐│
│  │                     React App                        ││
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ ││
│  │  │   AppDock   │  │  AgentView  │  │  OtherViews │ ││
│  │  └──────┬──────┘  └──────┬──────┘  └─────────────┘ ││
│  │         │                │                          ││
│  │  ┌──────▼────────────────▼──────────────────────┐  ││
│  │  │              Zustand Store                    │  ││
│  │  │  ┌───────────────┐  ┌────────────────────┐   │  ││
│  │  │  │navigationSlice│  │    agentSlice      │   │  ││
│  │  │  └───────────────┘  └────────────────────┘   │  ││
│  │  └──────────────────────┬───────────────────────┘  ││
│  └─────────────────────────┼──────────────────────────┘│
└────────────────────────────┼────────────────────────────┘
                             │ contextBridge (IPC)
┌────────────────────────────┼────────────────────────────┐
│                   Preload Script                         │
│  ┌─────────────────────────▼──────────────────────────┐ │
│  │              window.agentAPI                        │ │
│  │  getSkills(), execute(), abort(), getStatus()      │ │
│  └─────────────────────────┬──────────────────────────┘ │
└────────────────────────────┼────────────────────────────┘
                             │ ipcRenderer
┌────────────────────────────┼────────────────────────────┐
│                   Main Process                           │
│  ┌─────────────────────────▼──────────────────────────┐ │
│  │              IPC Handlers                           │ │
│  │  agent:get-skills, agent:execute, agent:abort      │ │
│  └─────────────────────────┬──────────────────────────┘ │
│                            │                             │
│  ┌─────────────────────────▼──────────────────────────┐ │
│  │           Agent Service (将来実装)                  │ │
│  └────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

---

## コンポーネントアーキテクチャ

### ディレクトリ構成

```
apps/desktop/src/
├── renderer/
│   ├── views/
│   │   ├── AgentView/
│   │   │   ├── index.tsx           # メインコンポーネント
│   │   │   ├── AgentView.test.tsx  # テストファイル
│   │   │   └── components/         # 将来のサブコンポーネント用
│   │   └── ...
│   ├── store/
│   │   ├── slices/
│   │   │   ├── agentSlice.ts       # Agent状態管理
│   │   │   ├── agentSlice.test.ts  # テストファイル
│   │   │   └── ...
│   │   ├── types.ts                # ViewType更新
│   │   └── index.ts                # Store統合
│   └── components/
│       └── organisms/
│           └── AppDock/
│               └── index.tsx       # ナビゲーション更新
└── preload/
    └── channels.ts                 # IPCチャネル定義
```

---

## データフロー

### ナビゲーションフロー

```
User Click (AppDock "Agent")
        │
        ▼
AppDock.onViewChange("agent")
        │
        ▼
navigationSlice.setCurrentView("agent")
        │
        ├─► currentView = "agent"
        └─► viewHistory = [...history, "agent"]
              │
              ▼
    App.tsx renderView()
              │
              ▼
    AgentView component render
```

### 状態更新フロー（将来のスキル取得）

```
AgentView mounted
        │
        ▼
useEffect(() => fetchSkills())
        │
        ▼
window.agentAPI.getSkills()
        │
        ▼
ipcRenderer.invoke("agent:get-skills")
        │
        ▼
Main Process: handler returns skills
        │
        ▼
agentSlice.setSkills(skills)
        │
        ▼
AgentView re-renders with skills
```

---

## Store設計

### agentSliceの位置付け

```typescript
// store/index.ts での統合
export const useAppStore = create<AppStore>()(
  persist(
    (...args) => ({
      ...createNavigationSlice(...args),
      ...createUISlice(...args),
      ...createAgentSlice(...args), // 新規追加
      // ... 他のslice
    }),
    {
      name: "knowledge-studio-store",
      partialize: (state) => ({
        // agentSliceは永続化しない（sessionベースのデータ）
        theme: state.theme,
        // ...
      }),
    },
  ),
);
```

---

## エラーハンドリング戦略

### レイヤー別責務

| レイヤー      | 責務                                     |
| ------------- | ---------------------------------------- |
| AgentView     | UI表示エラー、ユーザーへのフィードバック |
| agentSlice    | エラー状態の管理                         |
| IPC Handler   | 通信エラーのキャッチ、エラー型変換       |
| Agent Service | ビジネスロジックエラー                   |

### エラー状態の管理

```typescript
// agentSlice内
error: string | null;

// エラー発生時
agentSlice.setError("スキルの取得に失敗しました");

// エラークリア
agentSlice.setError(null);
```

---

## 拡張性の考慮

### 将来の機能追加ポイント

| 機能             | 追加ポイント       | 影響範囲         |
| ---------------- | ------------------ | ---------------- |
| スキル一覧表示   | AgentView内        | agentSlice拡張   |
| スキル実行       | IPCハンドラー追加  | Main Process実装 |
| 実行履歴         | agentSlice状態追加 | UI追加           |
| カスタム環境設定 | 設定画面連携       | SettingsView拡張 |

### インターフェース境界

```typescript
// 明確なインターフェース定義で疎結合を維持
interface AgentViewProps {
  className?: string;
}

// Storeへの依存はhooks経由
const skills = useAppStore((state) => state.skills);
```

---

## パフォーマンス考慮事項

### レンダリング最適化

| 最適化手法         | 適用箇所                 |
| ------------------ | ------------------------ |
| メモ化（useMemo）  | 重い計算処理             |
| セレクタの最適化   | Store購読                |
| コンポーネント分割 | 再レンダリング範囲の限定 |
| Lazy Loading       | 将来のサブビュー         |

### 初期表示パフォーマンス

- AgentView初期表示: プレースホルダーのみで高速表示
- データフェッチ: マウント後に非同期で実行
- ローディング状態: isLoadingフラグで適切にUI表示

---

## セキュリティ考慮事項

### IPCセキュリティ

1. **チャネルホワイトリスト**: ALLOWED_INVOKE_CHANNELSで許可チャネルを明示
2. **入力バリデーション**: Main Process側で全入力を検証
3. **contextIsolation**: true（デフォルト）で維持
4. **nodeIntegration**: false（デフォルト）で維持

### 状態管理セキュリティ

1. **センシティブデータ**: agentSliceには機密情報を保存しない
2. **永続化除外**: partializeでagentSlice全体を永続化対象外
