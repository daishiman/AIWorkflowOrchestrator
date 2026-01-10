# スコープ定義書 - エージェントダッシュボード基盤

## 概要情報

| 項目       | 内容                       |
| ---------- | -------------------------- |
| タスクID   | AGENT-001                  |
| 機能名     | agent-dashboard-foundation |
| バージョン | 1.0                        |
| 作成日     | 2026-01-10                 |

---

## スコープ範囲

### 含むもの（In Scope）

#### 1. ViewType定義の更新

| 項目         | 詳細                                       |
| ------------ | ------------------------------------------ |
| 対象ファイル | `apps/desktop/src/renderer/store/types.ts` |
| 変更内容     | ViewType型に「agent」を追加                |
| 影響範囲     | navigationSlice、AppDock、ルーティング     |

#### 2. AppDockナビゲーション項目追加

| 項目           | 詳細                                                               |
| -------------- | ------------------------------------------------------------------ |
| 対象ファイル   | `apps/desktop/src/renderer/components/organisms/AppDock/index.tsx` |
| 変更内容       | navItemsに「Agent」項目を追加                                      |
| アイコン       | `bot`（Lucide Icons）                                              |
| ショートカット | `Cmd+5`（Mac）/ `Ctrl+5`（Win/Linux）                              |
| 配置順序       | settings の前（5番目）                                             |

#### 3. AgentViewコンポーネント作成

| 項目           | 詳細                                                  |
| -------------- | ----------------------------------------------------- |
| 対象ファイル   | `apps/desktop/src/renderer/views/AgentView/index.tsx` |
| コンポーネント | 基本レイアウト（ヘッダー、コンテンツエリア）          |
| Props          | なし（初期実装）                                      |
| スタイル       | 既存Viewコンポーネントと同じパターン                  |

#### 4. agentSlice（Zustand Store）

| 項目         | 詳細                                                     |
| ------------ | -------------------------------------------------------- |
| 対象ファイル | `apps/desktop/src/renderer/store/slices/agentSlice.ts`   |
| 状態         | `agents`, `isLoading`, `error`                           |
| アクション   | `setAgents`, `setLoading`, `setError`, `resetAgentState` |
| 永続化       | partializeで適切にフィルタリング                         |

#### 5. IPCチャネル定義

| 項目           | 詳細                                                                                 |
| -------------- | ------------------------------------------------------------------------------------ |
| 対象ファイル   | `apps/desktop/src/preload/channels.ts`                                               |
| 追加チャネル   | agent:get-skills, agent:execute, agent:abort, agent:get-status, agent:status-changed |
| ホワイトリスト | ALLOWED_INVOKE_CHANNELS、ALLOWED_ON_CHANNELSへの追加                                 |

#### 6. ルーティング設定更新

| 項目     | 詳細                                        |
| -------- | ------------------------------------------- |
| 対象箇所 | View切り替えロジック                        |
| 変更内容 | currentView === "agent" 時にAgentViewを表示 |

---

### 含まないもの（Out of Scope）

| 項目                   | 別タスクID | 理由                   |
| ---------------------- | ---------- | ---------------------- |
| スキル一覧表示機能     | AGENT-002  | UIの複雑性を分離       |
| エージェント実行機能   | AGENT-003  | バックエンド連携が必要 |
| カスタム実行環境       | AGENT-004  | 高度な機能             |
| IPCハンドラー実装      | AGENT-005  | Main Process側の実装   |
| Agent SDK連携          | AGENT-006  | 外部サービス連携       |
| セッション管理         | AGENT-007  | 状態の複雑性           |
| エラーハンドリング詳細 | AGENT-008  | 本タスクは基盤のみ     |

---

## 成果物一覧

### ソースコード

| 成果物          | ファイルパス                                                       | 種別 |
| --------------- | ------------------------------------------------------------------ | ---- |
| ViewType更新    | `apps/desktop/src/renderer/store/types.ts`                         | 更新 |
| AppDock更新     | `apps/desktop/src/renderer/components/organisms/AppDock/index.tsx` | 更新 |
| AgentView       | `apps/desktop/src/renderer/views/AgentView/index.tsx`              | 新規 |
| agentSlice      | `apps/desktop/src/renderer/store/slices/agentSlice.ts`             | 新規 |
| IPCチャネル更新 | `apps/desktop/src/preload/channels.ts`                             | 更新 |
| Store index更新 | `apps/desktop/src/renderer/store/index.ts`                         | 更新 |

### テストコード

| 成果物            | ファイルパス                                                              |
| ----------------- | ------------------------------------------------------------------------- |
| AgentViewテスト   | `apps/desktop/src/renderer/views/AgentView/AgentView.test.tsx`            |
| agentSliceテスト  | `apps/desktop/src/renderer/store/slices/agentSlice.test.ts`               |
| AppDock統合テスト | `apps/desktop/src/renderer/components/organisms/AppDock/AppDock.test.tsx` |
| IPCチャネルテスト | `apps/desktop/src/preload/channels.test.ts`                               |

### ドキュメント

| 成果物         | ファイルパス                                 |
| -------------- | -------------------------------------------- |
| 要件定義書     | `outputs/phase-1/requirements-definition.md` |
| 受け入れ基準   | `outputs/phase-1/acceptance-criteria.md`     |
| スコープ定義書 | `outputs/phase-1/scope-definition.md`        |

---

## 依存関係

### 上流依存（本タスクが依存するもの）

| 依存対象 | 説明                     |
| -------- | ------------------------ |
| なし     | 起点タスクのため依存なし |

### 下流依存（本タスクに依存するもの）

| タスクID  | タスク名               | 依存理由                    |
| --------- | ---------------------- | --------------------------- |
| AGENT-002 | スキル管理UI           | AgentView、agentSliceを使用 |
| AGENT-003 | スキル管理バックエンド | IPCチャネルを使用           |

---

## 技術的制約

### 既存パターンへの準拠

1. **Viewコンポーネントパターン**
   - DashboardView, ChatViewの実装パターンに従う
   - コンポーネント名: `AgentView`
   - ディレクトリ構造: `views/AgentView/index.tsx`

2. **Zustand sliceパターン**
   - 既存sliceの命名規則に従う: `createAgentSlice`
   - StateCreatorジェネリクスを使用
   - partializeでの永続化除外設定

3. **IPCチャネル命名規則**
   - プレフィックス: `agent:`
   - 小文字ケバブケース: `agent:get-skills`
   - 定数名: AGENT_GET_SKILLS（大文字スネークケース）

4. **アイコン選定**
   - Lucide Icons使用
   - `bot`アイコンを選定（エージェント機能を表現）

### コーディング規約

- TypeScript strict mode準拠
- ESLint/Prettier設定に従う
- any型の使用禁止
- コンポーネントにdisplayName設定

---

## リスク評価

| リスク                     | 影響度 | 発生確率 | 対策                             |
| -------------------------- | ------ | -------- | -------------------------------- |
| 既存ナビゲーションとの競合 | 中     | 低       | 既存パターンに厳密に従う         |
| Store永続化の問題          | 中     | 低       | partializeで適切にフィルタリング |
| ViewType追加による型エラー | 低     | 中       | 影響箇所の網羅的な更新           |

---

## 完了基準チェックリスト

### 機能完了

- [ ] ViewTypeに「agent」が追加されている
- [ ] AppDockに「Agent」項目が表示される
- [ ] クリックでAgentViewに遷移する
- [ ] AgentViewが正常に表示される
- [ ] agentSliceが動作する
- [ ] IPCチャネルが定義されている

### 品質基準

- [ ] 単体テストカバレッジ80%以上
- [ ] 型エラーなし
- [ ] ESLintエラーなし
- [ ] 既存テストがすべてパス
