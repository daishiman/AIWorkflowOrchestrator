---
id: TASK-10A-D
tier: 2
title: スキルライフサイクルUI統合
phase: 10
depends_on: [TASK-10A-A, TASK-10A-B, TASK-10A-C]
parallel_with: []
blocks: []
status: pending
priority: critical
estimated_complexity: medium
tags: [frontend, renderer, integration]
---

# スキルライフサイクルUI統合

## 概要

スキル管理パネル、分析ビュー、作成ウィザードをChatPanelに統合する。
ルーティングと状態管理の追加。

## 入力

- TASK-10A-A: SkillManagementPanel
- TASK-10A-B: SkillAnalysisView
- TASK-10A-C: SkillCreateWizard

## 出力

- Slice・IPC追加
- ChatPanel統合

## 実装詳細

### Slice追加

```typescript
// apps/desktop/src/renderer/store/slices/skillSlice.ts に追加

interface SkillAnalysis {
  overallScore: number;
  categories: { name: string; score: number }[];
  suggestions: Suggestion[];
  risks: Risk[];
}

interface Suggestion {
  type: "prompt" | "structure" | "security" | "performance" | "documentation";
  priority: "critical" | "high" | "medium" | "low";
  description: string;
  autoFixable: boolean;
}

// 追加アクション
analyze: async (skillName: string) => {
  const result = await window.electronAPI.skill.analyze(skillName);
  set({ currentAnalysis: result });
  return result;
},

applyImprovements: async (skillName: string, suggestions: Suggestion[]) => {
  await window.electronAPI.skill.applyImprovements(skillName, suggestions);
},

autoImprove: async (skillName: string) => {
  await window.electronAPI.skill.autoImprove(skillName);
},

create: async (options: CreateSkillOptions) => {
  const result = await window.electronAPI.skill.create(options);
  // リストを更新
  get().fetchSkills();
  return result;
},
```

### IPC追加

```typescript
// apps/desktop/src/main/ipc/skillHandlers.ts に追加

ipcMain.handle("skill:analyze", async (_, skillName: string) => {
  return skillImproverService.analyze(skillName);
});

ipcMain.handle(
  "skill:applyImprovements",
  async (_, skillName: string, suggestions: Suggestion[]) => {
    return skillImproverService.applyImprovements(skillName, suggestions);
  },
);

ipcMain.handle("skill:autoImprove", async (_, skillName: string) => {
  return skillImproverService.autoImprove(skillName);
});

ipcMain.handle("skill:create", async (_, options: CreateSkillOptions) => {
  return skillCreatorService.createSkill(options);
});
```

### Preload API追加

```typescript
// apps/desktop/src/preload/skillApi.ts に追加

analyze: (skillName: string) =>
  ipcRenderer.invoke("skill:analyze", skillName),

applyImprovements: (skillName: string, suggestions: Suggestion[]) =>
  ipcRenderer.invoke("skill:applyImprovements", skillName, suggestions),

autoImprove: (skillName: string) =>
  ipcRenderer.invoke("skill:autoImprove", skillName),

create: (options: CreateSkillOptions) =>
  ipcRenderer.invoke("skill:create", options),
```

### ChatPanel統合

```typescript
// apps/desktop/src/renderer/components/chat/ChatPanel.tsx に追加

import { SkillManagementPanel } from "../skill/SkillManagementPanel";

// サイドパネルまたはタブとして追加
const [showSkillManagement, setShowSkillManagement] = useState(false);

// UI追加
{showSkillManagement && (
  <div className="absolute inset-0 bg-white z-50">
    <SkillManagementPanel />
  </div>
)}
```

## ファイル

| 操作 | パス                                                      |
| ---- | --------------------------------------------------------- |
| 修正 | `apps/desktop/src/renderer/store/slices/skillSlice.ts`    |
| 修正 | `apps/desktop/src/main/ipc/skillHandlers.ts`              |
| 修正 | `apps/desktop/src/preload/skillApi.ts`                    |
| 修正 | `apps/desktop/src/renderer/components/chat/ChatPanel.tsx` |

## 完了条件

- [ ] Sliceに分析・改善・作成アクションが追加されている
- [ ] IPCハンドラーが追加されている
- [ ] Preload APIが追加されている
- [ ] ChatPanelにスキル管理パネルへのアクセスが追加されている
- [ ] 全機能が連携して動作する

## テスト要件

```typescript
describe("SkillLifecycleIntegration", () => {
  it("should navigate to skill management");
  it("should create skill through wizard");
  it("should analyze and improve skill");
  it("should edit skill files");
});
```
