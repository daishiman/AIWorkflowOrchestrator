# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                       |
| ---------- | -------------------------- |
| Phase      | 5                          |
| Phase名    | 実装                       |
| 前提Phase  | Phase 4                    |
| 後続Phase  | Phase 6                    |
| ステータス | 未実施                     |
| 作成日     | 2026-01-10                 |
| 機能名     | agent-dashboard-foundation |

---

## 目的

Phase 4で作成したテストを通過する最小限の実装を行う（TDD: Green状態）。

## 背景

TDDの原則に従い、失敗しているテストを通過させる最小限のコードを実装する。過度な実装は避け、テストが通ることだけに集中する。

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。
> 各スキルは `.claude/skills/{{スキル名}}/SKILL.md` を参照してください。

### スキル1: clean-code-practices

**パス**: `.claude/skills/clean-code-practices/SKILL.md`

**選定理由**: 読みやすく保守性の高いコードを実装するため

**Trigger条件**:
コードの可読性向上、命名規則の適用、関数設計の改善を行う場合に使用

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 設計に基づいて実装を行う

**期待される成果物**:

- 実装コード（下記実装ファイル一覧参照）

---

### スキル2: electron-ipc-patterns

**パス**: `.claude/skills/electron-ipc-patterns/SKILL.md`

**選定理由**: Electron IPC通信の実装パターンに従うため

**Trigger条件**:
Electron IPC通信の設計・実装、preload scriptの設計を行う場合に使用

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. IPCチャネルとハンドラーを実装

**期待される成果物**:

- IPCチャネル定義追加
- Preload API拡張

---

## 参照資料

| 参照資料         | パス                                     | 内容          |
| ---------------- | ---------------------------------------- | ------------- |
| アーキテクチャ   | `outputs/phase-2/architecture-design.md` | Phase 2成果物 |
| 型定義設計       | `outputs/phase-2/type-definitions.md`    | Phase 2成果物 |
| UIコンポーネント | `outputs/phase-2/ui-component-design.md` | Phase 2成果物 |
| IPCチャネル      | `outputs/phase-2/ipc-channel-design.md`  | Phase 2成果物 |
| テスト仕様       | `outputs/phase-4/test-specification.md`  | Phase 4成果物 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料               | パス                                                                         | 内容                   |
| ---------------------- | ---------------------------------------------------------------------------- | ---------------------- |
| アーキテクチャパターン | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` | 機能追加パターン       |
| UI/UXコンポーネント    | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`      | コンポーネント設計原則 |
| Agent SDK              | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md`  | Agent SDK型定義        |
| Electron IPC           | `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`         | IPC API設計            |

---

## 実装内容

### 1. ViewType拡張

```typescript
// apps/desktop/src/renderer/store/slices/navigationSlice.ts
export type ViewType =
  | "dashboard"
  | "editor"
  | "chat"
  | "graph"
  | "settings"
  | "agent";
```

### 2. agentSlice実装

```typescript
// apps/desktop/src/renderer/store/slices/agentSlice.ts
import { StateCreator } from "zustand";
import { Skill, Anchor } from "@repo/shared/types/agent";

export interface AgentSlice {
  skills: Skill[];
  selectedSkill: Skill | null;
  isExecuting: boolean;
  executionOutput: string[];
  executionError: string | null;
  skillFilter: string;
  skillCategory: string | null;

  setSkills: (skills: Skill[]) => void;
  selectSkill: (skill: Skill | null) => void;
  setExecuting: (isExecuting: boolean) => void;
  appendOutput: (output: string) => void;
  setError: (error: string | null) => void;
  clearExecution: () => void;
  setSkillFilter: (filter: string) => void;
  setSkillCategory: (category: string | null) => void;
}

export const createAgentSlice: StateCreator<AgentSlice> = (set) => ({
  skills: [],
  selectedSkill: null,
  isExecuting: false,
  executionOutput: [],
  executionError: null,
  skillFilter: "",
  skillCategory: null,

  setSkills: (skills) => set({ skills }),
  selectSkill: (skill) => set({ selectedSkill: skill }),
  setExecuting: (isExecuting) => set({ isExecuting }),
  appendOutput: (output) =>
    set((state) => ({ executionOutput: [...state.executionOutput, output] })),
  setError: (error) => set({ executionError: error }),
  clearExecution: () =>
    set({ executionOutput: [], executionError: null, isExecuting: false }),
  setSkillFilter: (filter) => set({ skillFilter: filter }),
  setSkillCategory: (category) => set({ skillCategory: category }),
});
```

### 3. AgentView実装

```typescript
// apps/desktop/src/renderer/views/AgentView/index.tsx
import React from "react";
import { useStore } from "@/store";

export const AgentView: React.FC = () => {
  const { skills, selectedSkill, isExecuting, skillFilter } = useStore(
    (state) => state.agent
  );

  if (isExecuting) {
    return <div>Loading...</div>;
  }

  if (skills.length === 0) {
    return <div>No skills available</div>;
  }

  return (
    <div className="agent-view">
      <div className="skill-list">{/* Skill list implementation */}</div>
    </div>
  );
};
```

### 4. AppDock更新

```typescript
// apps/desktop/src/renderer/components/AppDock/index.tsx
// navItemsに追加
{ id: "agent", icon: "bot", label: "Agent", shortcut: "Cmd+5" },
```

### 5. IPCチャネル追加

```typescript
// apps/desktop/src/shared/constants/channels.ts に追加
AGENT_GET_SKILLS: "agent:get-skills",
AGENT_GET_SKILL_DETAIL: "agent:get-skill-detail",
AGENT_EXECUTE: "agent:execute",
AGENT_STOP: "agent:stop",
AGENT_STREAM_CHUNK: "agent:stream-chunk",
AGENT_STREAM_END: "agent:stream-end",
AGENT_STREAM_ERROR: "agent:stream-error",
```

---

## 実装ファイル一覧

| ファイル        | パス                                                        | 内容                      |
| --------------- | ----------------------------------------------------------- | ------------------------- |
| navigationSlice | `apps/desktop/src/renderer/store/slices/navigationSlice.ts` | ViewType拡張              |
| agentSlice      | `apps/desktop/src/renderer/store/slices/agentSlice.ts`      | Agent状態管理             |
| AgentView       | `apps/desktop/src/renderer/views/AgentView/index.tsx`       | Agentビューコンポーネント |
| AppDock         | `apps/desktop/src/renderer/components/AppDock/index.tsx`    | ナビゲーション更新        |
| channels        | `apps/desktop/src/shared/constants/channels.ts`             | IPCチャネル追加           |
| store/index     | `apps/desktop/src/renderer/store/index.ts`                  | Store統合                 |

---

## 統合テスト連携【必須】

統合ポイントの実装を確認する:

| 統合ポイント       | 実装内容                                     | 検証方法       |
| ------------------ | -------------------------------------------- | -------------- |
| AppDock→agentSlice | currentView: "agent" で状態更新              | ユニットテスト |
| AgentView→IPC      | agent:get-skills でスキル一覧取得            | 統合テスト     |
| Store永続化        | partializeでagentSliceの必要な部分のみ永続化 | 永続化テスト   |

---

## 完了条件

- [ ] Phase 4のテストがすべてパスする（Green状態）
- [ ] 型エラーがない
- [ ] リントエラーがない
- [ ] 統合ポイントが正しく実装されている
- [ ] **本Phase内の全スキルを100%実行完了**

---

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test

# 確認項目
# - [ ] すべてのテストがパスすることを確認（Green状態）
```

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] スキルフィードバックが記録されている

---

## 依存関係

- **前提**: Phase 4（テスト作成）が完了していること
- **後続**: Phase 6（テスト拡充）へ進む

---

## スキルフィードバック記録（Phase完了後に記入）

Phase完了後、以下を記録してください:

```markdown
## Phase 5 実行記録

### 使用スキル

- clean-code-practices: {{result}}
- electron-ipc-patterns: {{result}}

### TDD状態確認

- [ ] すべてのテストがGreen状態

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

`docs/30-workflows/agent-dashboard-foundation/phase-6-test-expansion.md`
