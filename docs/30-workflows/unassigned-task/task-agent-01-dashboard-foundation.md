# エージェントダッシュボード基盤 - タスク指示書

## メタ情報

| 項目         | 内容                           |
| ------------ | ------------------------------ |
| タスクID     | AGENT-001                      |
| タスク名     | エージェントダッシュボード基盤 |
| 分類         | 要件                           |
| 対象機能     | エージェント機能               |
| 優先度       | 高                             |
| 見積もり規模 | 中規模                         |
| ステータス   | 未実施                         |
| 発見元       | ユーザー要求                   |
| 発見日       | 2026-01-09                     |

---

## 依存関係と並行実行

### 依存関係マップ

```
task-agent-01-dashboard-foundation.md (AGENT-001/本タスク) ← 起点
    │
    ├──► task-agent-02-skill-management-ui.md (AGENT-002)
    │
    └──► task-agent-03-skill-management-backend.md (AGENT-003) ※02と並行可能
              │
              └──► task-agent-04-execution-ui.md (AGENT-004)
                        │
                        └──► ...
```

### 本タスクの位置づけ

| 項目                     | 内容                                                           |
| ------------------------ | -------------------------------------------------------------- |
| 直接依存                 | なし（起点タスク）                                             |
| 並行実行可能             | なし                                                           |
| 本タスク完了後に開始可能 | AGENT-002（スキル管理UI）, AGENT-003（スキル管理バックエンド） |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

Claude CodeのClaude Agent SDKを使用したエージェント機能をアプリケーションに統合するため、専用のダッシュボード画面が必要。現状はダッシュボード、エディタ、チャット、グラフ、設定の5つのビューのみ存在し、エージェント管理機能がない。

### 1.2 問題点・課題

- エージェント（スキル）を管理・実行するUIが存在しない
- AppDockにエージェント用のナビゲーション項目がない
- エージェント状態を管理するZustand sliceがない
- エージェント関連のIPCチャネルが定義されていない

### 1.3 放置した場合の影響

- エージェント機能の統合が不可能
- ユーザーがスキルベースのエージェントを活用できない
- アプリケーションの拡張性が制限される

---

## 2. 何を達成するか（What）

### 2.1 目的

エージェント機能のためのフロントエンド基盤を構築し、ユーザーがエージェント画面にアクセスできるようにする。

### 2.2 最終ゴール

- サイドバー（AppDock）に「Agent」メニュー項目が表示される
- 「Agent」をクリックするとAgentViewが表示される
- agentSliceでエージェント状態が管理される
- エージェント関連のIPCチャネルが定義されている

### 2.3 スコープ

#### 含むもの

- ViewType定義への「agent」追加
- AppDockへのエージェントメニュー項目追加
- AgentView基本コンポーネントの実装
- agentSlice（Zustand）の実装
- IPC_CHANNELS定義の追加
- ルーティング設定の更新

#### 含まないもの

- スキル一覧表示機能（別タスク: AGENT-002）
- エージェント実行機能（別タスク: AGENT-003）
- カスタム実行環境（別タスク: AGENT-004）
- バックエンド実装（別タスク: AGENT-005〜008）

### 2.4 成果物

| 成果物       | パス                                                               |
| ------------ | ------------------------------------------------------------------ |
| ViewType更新 | `apps/desktop/src/renderer/store/slices/navigationSlice.ts`        |
| AgentView    | `apps/desktop/src/renderer/views/AgentView/index.tsx`              |
| agentSlice   | `apps/desktop/src/renderer/store/slices/agentSlice.ts`             |
| AppDock更新  | `apps/desktop/src/renderer/components/organisms/AppDock/index.tsx` |
| IPCチャネル  | `apps/desktop/src/preload/channels.ts`                             |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- 既存のZustand store構造を理解している
- 既存のViewパターンを理解している
- IPC通信パターンを理解している

### 3.2 依存タスク

なし（最初に実行するタスク）

### 3.3 必要な知識・スキル

- React/TypeScript
- Zustand状態管理
- Electron IPC通信
- Atomic Design

### 3.4 推奨アプローチ

1. ViewType定義を拡張
2. agentSliceを作成
3. AgentViewの基本骨格を実装
4. AppDockにナビゲーション項目を追加
5. IPCチャネルを定義
6. App.tsxのルーティングを更新

---

## 4. 実行手順

### Phase構成

Phase 1-13の標準フローに従って実装する。

### Phase 1: 要件定義

#### 使用スキル

| スキル名                    | パス                                                  | 選定理由                                |
| --------------------------- | ----------------------------------------------------- | --------------------------------------- |
| acceptance-criteria-writing | `.claude/skills/acceptance-criteria-writing/SKILL.md` | Given-When-Then形式で受け入れ基準を定義 |

**実行方法**: 各スキルのSKILL.mdを読み込み、スキルを参照して実行

#### 受け入れ基準（Given-When-Then）

```gherkin
Feature: エージェントダッシュボード基盤

Scenario: AppDockにエージェントメニューが表示される
  Given ユーザーがアプリケーションにログインしている
  When メインダッシュボード画面を表示する
  Then AppDockに「Agent」アイコンが表示される
  And アイコンにホバーすると「Agent」ラベルが表示される

Scenario: エージェント画面に遷移できる
  Given ユーザーがメインダッシュボード画面を表示している
  When AppDockの「Agent」アイコンをクリックする
  Then AgentViewが表示される
  And currentViewが「agent」に更新される

Scenario: キーボードショートカットでエージェント画面に遷移できる
  Given ユーザーがアプリケーションを操作している
  When Cmd+5（Mac）またはCtrl+5（Win/Linux）を押下する
  Then AgentViewが表示される
```

#### 成果物

- `outputs/phase-1/requirements.md`

#### 完了条件

- [ ] 受け入れ基準がGiven-When-Then形式で定義されている
- [ ] スコープが明確に定義されている

---

### Phase 2: 設計

#### 使用スキル

| スキル名          | パス                                        | 選定理由             |
| ----------------- | ------------------------------------------- | -------------------- |
| responsive-design | `.claude/skills/responsive-design/SKILL.md` | UIコンポーネント設計 |

#### 設計内容

**1. ViewType拡張**

```typescript
// navigationSlice.ts
export type ViewType =
  | "dashboard"
  | "editor"
  | "chat"
  | "graph"
  | "settings"
  | "agent";
```

**2. agentSlice構造**

```typescript
// agentSlice.ts
export interface AgentSlice {
  // スキル一覧
  skills: Skill[];
  selectedSkill: Skill | null;

  // 実行状態
  isExecuting: boolean;
  executionOutput: string[];
  executionError: string | null;

  // フィルタリング
  skillFilter: string;
  skillCategory: string | null;

  // アクション
  setSkills: (skills: Skill[]) => void;
  selectSkill: (skill: Skill | null) => void;
  setExecuting: (isExecuting: boolean) => void;
  appendOutput: (output: string) => void;
  setError: (error: string | null) => void;
  clearExecution: () => void;
  setSkillFilter: (filter: string) => void;
  setSkillCategory: (category: string | null) => void;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  path: string;
  triggers: string[];
  anchors: Anchor[];
  category?: string;
}

export interface Anchor {
  source: string;
  application: string;
  purpose: string;
}
```

**3. IPCチャネル定義**

```typescript
// channels.ts に追加
// Agent関連
AGENT_GET_SKILLS: "agent:get-skills",
AGENT_GET_SKILL_DETAIL: "agent:get-skill-detail",
AGENT_EXECUTE: "agent:execute",
AGENT_STOP: "agent:stop",
AGENT_STREAM_CHUNK: "agent:stream-chunk",
AGENT_STREAM_END: "agent:stream-end",
AGENT_STREAM_ERROR: "agent:stream-error",
```

**4. AppDock更新**

```typescript
// AppDock/index.tsx navItemsに追加
{ id: "agent", icon: "bot", label: "Agent", shortcut: "Cmd+5" },
```

#### 成果物

- `outputs/phase-2/design.md`

#### 完了条件

- [ ] 型定義が完成している
- [ ] コンポーネント構造が設計されている
- [ ] IPCチャネルが設計されている

---

### Phase 3: 設計レビューゲート

#### 使用スキル

| スキル名             | パス                                           | 選定理由         |
| -------------------- | ---------------------------------------------- | ---------------- |
| code-smell-detection | `.claude/skills/code-smell-detection/SKILL.md` | 設計品質チェック |

#### 完了条件

- [ ] 設計が既存パターンと整合している
- [ ] 重大な設計問題がない

---

### Phase 4: テスト作成

#### 使用スキル

| スキル名       | パス                                     | 選定理由        |
| -------------- | ---------------------------------------- | --------------- |
| tdd-principles | `.claude/skills/tdd-principles/SKILL.md` | TDDでテスト先行 |

#### テストケース

```typescript
// agentSlice.test.ts
describe("agentSlice", () => {
  it("should set skills", () => {});
  it("should select skill", () => {});
  it("should set executing state", () => {});
  it("should append output", () => {});
  it("should clear execution", () => {});
});

// AgentView.test.tsx
describe("AgentView", () => {
  it("should render without crashing", () => {});
  it("should display loading state when skills are loading", () => {});
  it("should display empty state when no skills", () => {});
});
```

#### 完了条件

- [ ] agentSliceのユニットテストがある
- [ ] AgentViewのコンポーネントテストがある
- [ ] すべてのテストが失敗状態（Red）

---

### Phase 5: 実装

#### 使用スキル

| スキル名        | パス                                      | 選定理由           |
| --------------- | ----------------------------------------- | ------------------ |
| domain-modeling | `.claude/skills/domain-modeling/SKILL.md` | ドメインモデル設計 |

#### 実装ファイル

1. `apps/desktop/src/renderer/store/slices/agentSlice.ts`
2. `apps/desktop/src/renderer/views/AgentView/index.tsx`
3. `apps/desktop/src/renderer/components/organisms/AppDock/index.tsx`（更新）
4. `apps/desktop/src/renderer/store/slices/navigationSlice.ts`（更新）
5. `apps/desktop/src/preload/channels.ts`（更新）
6. `apps/desktop/src/renderer/App.tsx`（更新）

#### 完了条件

- [ ] agentSliceが実装されている
- [ ] AgentViewが表示される
- [ ] AppDockにAgentアイコンが表示される
- [ ] ナビゲーションが動作する
- [ ] テストがすべて通過（Green）

---

### Phase 6-13: 標準フロー

標準のPhase 6-13フローに従って実装を完了する。

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] AppDockに「Agent」メニュー項目が表示される
- [ ] 「Agent」クリックでAgentViewに遷移する
- [ ] Cmd+5/Ctrl+5でAgentViewに遷移する
- [ ] agentSliceで状態管理ができる

### 品質要件

- [ ] テストカバレッジ: Line 80%以上
- [ ] TypeScript型エラーなし
- [ ] ESLint/Prettierエラーなし

### ドキュメント要件

- [ ] コンポーネントにJSDocコメントがある
- [ ] 実装ガイドが作成されている

---

## 6. 検証方法

### テストケース

```bash
# ユニットテスト
pnpm --filter @repo/desktop test src/renderer/store/slices/agentSlice.test.ts

# コンポーネントテスト
pnpm --filter @repo/desktop test src/renderer/views/AgentView/
```

### 検証手順

1. アプリを起動
2. AppDockに「Agent」アイコンが表示されることを確認
3. アイコンをクリックしてAgentViewに遷移することを確認
4. Cmd+5でAgentViewに遷移することを確認

---

## 7. リスクと対策

| リスク                     | 影響度 | 発生確率 | 対策                             |
| -------------------------- | ------ | -------- | -------------------------------- |
| 既存ナビゲーションとの競合 | 中     | 低       | 既存パターンに厳密に従う         |
| Store永続化の問題          | 中     | 低       | partializeで適切にフィルタリング |

---

## 8. 参照情報

### 関連ドキュメント

- `apps/desktop/src/renderer/store/index.ts` - Store構造
- `apps/desktop/src/renderer/views/DashboardView/index.tsx` - View実装例
- `apps/desktop/src/renderer/components/organisms/AppDock/index.tsx` - AppDock実装
- `apps/desktop/src/preload/channels.ts` - IPCチャネル定義

### 参考資料

- [Zustand Documentation](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [Electron IPC](https://www.electronjs.org/docs/latest/tutorial/ipc)

---

## 9. 備考

### 補足事項

- 本タスクはエージェント機能シリーズの最初のタスク
- 後続タスク（AGENT-002〜008）の基盤となる
- アイコンは`bot`（Lucide Icons）を使用
