# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                       |
| ---------- | -------------------------- |
| Phase      | 2                          |
| Phase名    | 設計                       |
| 前提Phase  | Phase 1                    |
| 後続Phase  | Phase 3                    |
| ステータス | 未実施                     |
| 作成日     | 2026-01-10                 |
| 機能名     | agent-dashboard-foundation |

---

## 目的

要件を実現可能な構造に落とし込み、アーキテクチャ・型定義・コンポーネント構造を設計する。

## 背景

Phase 1で定義した要件を元に、具体的な実装設計を行う。既存のView/Sliceパターンに従い、拡張性の高い設計を行う。

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。
> 各スキルは `.claude/skills/{{スキル名}}/SKILL.md` を参照してください。

### スキル1: responsive-design

**パス**: `.claude/skills/responsive-design/SKILL.md`

**選定理由**: プロジェクト固有のTailwind CSS設計システム、8pxグリッド、Electron対応を含むUIコンポーネント設計のため

**Trigger条件**:
レスポンシブレイアウトの実装、ブレークポイント設計、モバイルファーストスタイル作成、画像最適化を行う場合に使用

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. AgentViewのUIコンポーネント構造を設計

**期待される成果物**:

- `outputs/phase-2/ui-component-design.md` - UIコンポーネント設計

---

### スキル2: electron-ipc-patterns

**パス**: `.claude/skills/electron-ipc-patterns/SKILL.md`

**選定理由**: Electron IPC通信パターンに従ったチャネル設計とpreload APIの設計のため

**Trigger条件**:
Electron IPC通信の設計・実装、preload scriptの設計を行う場合に使用

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. IPCチャネル定義を設計

**期待される成果物**:

- `outputs/phase-2/ipc-channel-design.md` - IPCチャネル設計

---

## 参照資料

| 参照資料            | パス                                                                         | 内容               |
| ------------------- | ---------------------------------------------------------------------------- | ------------------ |
| 要件定義書          | `outputs/phase-1/requirements-definition.md`                                 | Phase 1成果物      |
| 受け入れ基準        | `outputs/phase-1/acceptance-criteria.md`                                     | Phase 1成果物      |
| スコープ定義        | `outputs/phase-1/scope-definition.md`                                        | Phase 1成果物      |
| UI/UXナビゲーション | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`      | ナビゲーション仕様 |
| UI/UXコンポーネント | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`      | コンポーネント原則 |
| Agent SDK           | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md`  | Agent SDK型定義    |
| アーキテクチャ      | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` | 機能追加パターン   |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料     | パス                                                                        | 内容                             |
| ------------ | --------------------------------------------------------------------------- | -------------------------------- |
| Agent SDK    | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md` | Agent SDK型定義・Preload API仕様 |
| Electron IPC | `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`        | Electron IPC API設計             |

---

## 設計内容

### 1. ViewType拡張

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

### 2. agentSlice構造

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

### 3. IPCチャネル定義

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

### 4. AppDock更新

```typescript
// AppDock/index.tsx navItemsに追加
{ id: "agent", icon: "bot", label: "Agent", shortcut: "Cmd+5" },
```

---

## 成果物

| 成果物             | パス                                     | 内容             |
| ------------------ | ---------------------------------------- | ---------------- |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md` | システム構造     |
| UIコンポーネント   | `outputs/phase-2/ui-component-design.md` | UI設計           |
| IPCチャネル設計    | `outputs/phase-2/ipc-channel-design.md`  | IPC設計          |
| 型定義設計         | `outputs/phase-2/type-definitions.md`    | TypeScript型定義 |

---

## 統合テスト連携【必須】

統合ポイント/契約（Zustand・IPC）を設計に反映する:

| 統合ポイント       | 契約定義                                     |
| ------------------ | -------------------------------------------- |
| AppDock→agentSlice | currentView: "agent" で状態更新              |
| AgentView→IPC      | agent:get-skills でスキル一覧取得            |
| Store永続化        | partializeでagentSliceの必要な部分のみ永続化 |

---

## 完了条件

- [ ] アーキテクチャが定義されている
- [ ] 型定義が完成している
- [ ] UIコンポーネント構造が設計されている
- [ ] IPCチャネルが設計されている
- [ ] 要件との整合性が確認されている
- [ ] 統合ポイント/契約が設計に反映されている
- [ ] **本Phase内の全スキルを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] スキルフィードバックが記録されている

---

## 依存関係

- **前提**: Phase 1（要件定義）が完了していること
- **後続**: Phase 3（設計レビューゲート）へ進む

---

## スキルフィードバック記録（Phase完了後に記入）

Phase完了後、以下を記録してください:

```markdown
## Phase 2 実行記録

### 使用スキル

- responsive-design: {{result}}
- electron-ipc-patterns: {{result}}

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/agent-dashboard-foundation/phase-3-design-review.md`
