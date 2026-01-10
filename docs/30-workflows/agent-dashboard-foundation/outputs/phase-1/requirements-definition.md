# 要件定義書 - エージェントダッシュボード基盤

## 概要情報

| 項目       | 内容                       |
| ---------- | -------------------------- |
| タスクID   | AGENT-001                  |
| 機能名     | agent-dashboard-foundation |
| バージョン | 1.0                        |
| 作成日     | 2026-01-10                 |
| ステータス | 作成完了                   |

---

## ユーザーストーリー

```
アプリケーションユーザーとして、
エージェント管理画面にアクセスしたい。
なぜなら、Claude Agent SDKを使用したスキルベースのエージェント機能を活用するためだから。
```

---

## 機能要件（FR: Functional Requirements）

### FR-001: ViewType拡張

| 属性     | 内容                                                                               |
| -------- | ---------------------------------------------------------------------------------- |
| 要件ID   | FR-001                                                                             |
| 説明     | ViewType型に「agent」を追加する                                                    |
| 優先度   | Must                                                                               |
| 対象箇所 | `apps/desktop/src/renderer/store/types.ts`                                         |
| 変更内容 | `ViewType = "dashboard" \| "editor" \| "chat" \| "graph" \| "settings" \| "agent"` |

### FR-002: AppDockナビゲーション項目追加

| 属性     | 内容                                                                                |
| -------- | ----------------------------------------------------------------------------------- |
| 要件ID   | FR-002                                                                              |
| 説明     | AppDockに「Agent」メニュー項目を追加する                                            |
| 優先度   | Must                                                                                |
| 対象箇所 | `apps/desktop/src/renderer/components/organisms/AppDock/index.tsx`                  |
| 変更内容 | navItemsに `{ id: "agent", icon: "bot", label: "Agent", shortcut: "Cmd+5" }` を追加 |

### FR-003: AgentViewコンポーネント

| 属性     | 内容                                                       |
| -------- | ---------------------------------------------------------- |
| 要件ID   | FR-003                                                     |
| 説明     | エージェント画面の基本コンポーネントを作成する             |
| 優先度   | Must                                                       |
| 対象箇所 | `apps/desktop/src/renderer/views/AgentView/index.tsx`      |
| 変更内容 | 基本レイアウト、ヘッダー、プレースホルダーコンテンツを含む |

### FR-004: agentSlice（Zustand）

| 属性       | 内容                                                             |
| ---------- | ---------------------------------------------------------------- |
| 要件ID     | FR-004                                                           |
| 説明       | エージェント状態を管理するZustand sliceを作成する                |
| 優先度     | Must                                                             |
| 対象箇所   | `apps/desktop/src/renderer/store/slices/agentSlice.ts`           |
| 状態       | `agents: Agent[]`, `isLoading: boolean`, `error: string \| null` |
| アクション | `setAgents`, `setLoading`, `setError`, `resetAgentState`         |

### FR-005: IPCチャネル定義

| 属性     | 内容                                                                   |
| -------- | ---------------------------------------------------------------------- |
| 要件ID   | FR-005                                                                 |
| 説明     | エージェント関連のIPCチャネルを定義する                                |
| 優先度   | Must                                                                   |
| 対象箇所 | `apps/desktop/src/preload/channels.ts`                                 |
| チャネル | `agent:get-skills`, `agent:execute`, `agent:abort`, `agent:get-status` |

### FR-006: ルーティング設定更新

| 属性     | 内容                                                  |
| -------- | ----------------------------------------------------- |
| 要件ID   | FR-006                                                |
| 説明     | AgentViewをルーティングに追加する                     |
| 優先度   | Must                                                  |
| 対象箇所 | `apps/desktop/src/renderer/App.tsx`（または該当箇所） |
| 変更内容 | currentView === "agent" 時にAgentViewを表示           |

---

## 非機能要件（NFR: Non-Functional Requirements）

### NFR-001: パフォーマンス

| 属性     | 内容                                    |
| -------- | --------------------------------------- |
| 要件ID   | NFR-001                                 |
| 説明     | ビュー切り替えは100ms以内で完了すること |
| 測定方法 | React DevToolsでのレンダリング時間測定  |

### NFR-002: アクセシビリティ

| 属性     | 内容                                         |
| -------- | -------------------------------------------- |
| 要件ID   | NFR-002                                      |
| 説明     | WCAG 2.1 Level AA準拠                        |
| 具体要件 | aria-label設定、キーボードナビゲーション対応 |

### NFR-003: レスポンシブデザイン

| 属性   | 内容                                    |
| ------ | --------------------------------------- |
| 要件ID | NFR-003                                 |
| 説明   | デスクトップ/モバイル両モードで正常表示 |
| 対応幅 | 375px〜1920px                           |

### NFR-004: 一貫性

| 属性   | 内容                                  |
| ------ | ------------------------------------- |
| 要件ID | NFR-004                               |
| 説明   | 既存UI/UXパターンとの一貫性を維持     |
| 参照   | DashboardView, ChatViewの実装パターン |

---

## 接続要件（統合テスト連携）

### IPC接続要件

| チャネル               | 方向            | 説明               |
| ---------------------- | --------------- | ------------------ |
| `agent:get-skills`     | Renderer → Main | スキル一覧取得     |
| `agent:execute`        | Renderer → Main | エージェント実行   |
| `agent:abort`          | Renderer → Main | 実行中断           |
| `agent:get-status`     | Renderer → Main | ステータス取得     |
| `agent:status-changed` | Main → Renderer | ステータス変更通知 |

### 状態管理接続要件

| スライス        | 連携内容                                    |
| --------------- | ------------------------------------------- |
| navigationSlice | currentView: "agent"への遷移                |
| agentSlice      | エージェント状態の管理                      |
| uiSlice         | responsiveMode取得（デスクトップ/モバイル） |

### ナビゲーション接続要件

| 接続ポイント | 内容                                   |
| ------------ | -------------------------------------- |
| AppDock      | Agentアイコンクリックでビュー遷移      |
| キーボード   | Cmd+5（Mac）/Ctrl+5（Win/Linux）で遷移 |
| 履歴         | viewHistoryへの追加                    |

---

## 制約事項

1. **スコープ制限**: 本タスクはUI基盤のみ。スキル一覧表示、実行機能は別タスク
2. **依存関係**: 起点タスクのため外部依存なし
3. **既存パターン遵守**: DashboardView, ChatViewの実装パターンに厳密に従う
4. **Store永続化**: agentSliceはpartializeで適切にフィルタリング

---

## 関連ドキュメント

| ドキュメント              | パス                                                                         |
| ------------------------- | ---------------------------------------------------------------------------- |
| UI/UXナビゲーション       | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`      |
| Agent SDKインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md`  |
| アーキテクチャパターン    | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` |
