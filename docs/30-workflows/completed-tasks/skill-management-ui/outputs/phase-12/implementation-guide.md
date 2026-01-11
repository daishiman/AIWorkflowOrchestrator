# スキル管理UI 実装ガイド

## 概要

このドキュメントは、スキル管理UI（AGENT-002）の実装・保守・拡張のためのガイドです。

---

## 1. アーキテクチャ

```
┌─────────────────────────────────────────────────────────────────┐
│                       Renderer Process                           │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                         Views                                ││
│  │  ┌─────────────────────────────────────────────────────┐    ││
│  │  │                    AgentView                         │    ││
│  │  │  ┌────────────┐ ┌──────────┐ ┌─────────────────┐    │    ││
│  │  │  │SkillSearch │ │SkillList │ │SkillDetailPanel │    │    ││
│  │  │  │   Bar      │ │          │ │                 │    │    ││
│  │  │  └────────────┘ └──────────┘ └─────────────────┘    │    ││
│  │  │  ┌────────────────────────────────────────────────┐ │    ││
│  │  │  │              SkillImportDialog                  │ │    ││
│  │  │  └────────────────────────────────────────────────┘ │    ││
│  │  └─────────────────────────────────────────────────────┘    ││
│  └─────────────────────────────────────────────────────────────┘│
│                              ↕                                   │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                      Zustand Store                           ││
│  │  ┌─────────────────────────────────────────────────────┐    ││
│  │  │                    agentSlice                        │    ││
│  │  │  skills, selectedSkill, skillFilter, skillCategory  │    ││
│  │  └─────────────────────────────────────────────────────┘    ││
│  └─────────────────────────────────────────────────────────────┘│
│                              ↕                                   │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                      Preload API                             ││
│  │  window.api.invoke("skill:list")                             ││
│  │  window.api.invoke("skill:import", { skillIds })             ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                              ↕ IPC
┌─────────────────────────────────────────────────────────────────┐
│                        Main Process                              │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                     IPC Handlers                             ││
│  │  skill:list → skillService.listSkills()                      ││
│  │  skill:import → skillService.importSkills()                  ││
│  └─────────────────────────────────────────────────────────────┘│
│                              ↕                                   │
│  ┌──────────────────┐  ┌───────────────────────────────────────┐│
│  │   SkillService   │  │           electron-store              ││
│  │  • parseFiles()  │  │  • importedSkillIds                   ││
│  │  • validate()    │  │  • lastUpdated                        ││
│  └──────────────────┘  └───────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. ディレクトリ構成

```
apps/desktop/src/renderer/
├── components/
│   ├── molecules/
│   │   ├── SkillCard/
│   │   │   ├── index.tsx
│   │   │   └── __tests__/
│   │   │       └── SkillCard.test.tsx
│   │   ├── SkillSearchBar/
│   │   │   ├── index.tsx
│   │   │   └── __tests__/
│   │   │       └── SkillSearchBar.test.tsx
│   │   └── SkillCategoryFilter/
│   │       ├── index.tsx
│   │       └── __tests__/
│   │           └── SkillCategoryFilter.test.tsx
│   └── organisms/
│       ├── SkillList/
│       │   ├── index.tsx
│       │   └── __tests__/
│       │       └── SkillList.test.tsx
│       ├── SkillDetailPanel/
│       │   ├── index.tsx
│       │   └── __tests__/
│       │       └── SkillDetailPanel.test.tsx
│       └── SkillImportDialog/
│           ├── index.tsx
│           └── __tests__/
│               └── SkillImportDialog.test.tsx
├── store/
│   └── slices/
│       ├── agentSlice.ts
│       └── __tests__/
│           └── agentSlice.test.ts
└── views/
    └── AgentView/
        └── index.tsx

packages/shared/src/
└── types/
    └── skill.ts
```

---

## 3. コンポーネント一覧

### Molecules（小さな再利用可能なコンポーネント）

| コンポーネント      | 説明               | ファイル                                |
| ------------------- | ------------------ | --------------------------------------- |
| SkillCard           | スキルカード表示   | molecules/SkillCard/index.tsx           |
| SkillSearchBar      | 検索バー           | molecules/SkillSearchBar/index.tsx      |
| SkillCategoryFilter | カテゴリフィルター | molecules/SkillCategoryFilter/index.tsx |

### Organisms（複合コンポーネント）

| コンポーネント    | 説明                 | ファイル                              |
| ----------------- | -------------------- | ------------------------------------- |
| SkillList         | スキル一覧グリッド   | organisms/SkillList/index.tsx         |
| SkillDetailPanel  | スキル詳細パネル     | organisms/SkillDetailPanel/index.tsx  |
| SkillImportDialog | インポートダイアログ | organisms/SkillImportDialog/index.tsx |

---

## 4. 状態管理

### Zustand Store構成

```typescript
// store/slices/agentSlice.ts
export const createAgentSlice: StateCreator<AgentSlice> = (set, get) => ({
  // State
  skills: [],
  selectedSkill: null,
  skillFilter: "",
  skillCategory: null,
  // ...

  // Actions
  fetchSkills: async () => {
    /* ... */
  },
  selectSkill: (skill) => set({ selectedSkill: skill }),
  setSkillFilter: (filter) => set({ skillFilter: filter }),
  // ...
});
```

### 使用方法

```typescript
import { useAppStore } from "@/store";

const { skills, fetchSkills, selectSkill } = useAppStore();
```

---

## 5. IPC通信

### 利用可能なチャンネル

| チャンネル      | 説明           |
| --------------- | -------------- |
| skill:list      | スキル一覧取得 |
| skill:available | 利用可能取得   |
| skill:import    | インポート     |
| skill:remove    | 削除           |
| skill:search    | 検索           |
| config:get      | 設定取得       |
| config:set      | 設定保存       |

### 呼び出し方法

```typescript
const skills = await window.api.invoke("skill:list");
await window.api.invoke("skill:import", { skillIds: ["id1", "id2"] });
```

---

## 6. テスト戦略

### ユニットテスト

```bash
# 実行
pnpm --filter @repo/desktop test

# カバレッジ
pnpm --filter @repo/desktop test:coverage
```

### カバレッジ目標

| 指標     | 最低 | 推奨 | 達成   |
| -------- | ---- | ---- | ------ |
| Line     | 80%  | 90%  | 97.87% |
| Branch   | 60%  | 70%  | 91.45% |
| Function | 80%  | 90%  | 100%   |

---

## 7. 拡張ポイント

### 新しいスキルカテゴリの追加

1. `packages/shared/src/types/skill.ts` にカテゴリを追加
2. `SKILL_CATEGORIES` にラベルと色を定義
3. テストを更新

```typescript
// packages/shared/src/types/skill.ts
export type SkillCategory =
  | "development"
  | "testing"
  | "new_category"  // 追加
  | ...;

export const SKILL_CATEGORIES: Record<SkillCategory, { label: string; color: string }> = {
  new_category: { label: "新カテゴリ", color: "purple" },
  // ...
};
```

### カスタムフィルターの追加

1. `agentSlice.ts` に状態を追加
2. フィルターUIコンポーネントを作成
3. `SkillList` のフィルタリングロジックを拡張

### スキル詳細表示項目の拡張

1. `Skill` 型にプロパティを追加
2. `SkillDetailPanel` に表示セクションを追加
3. テストを更新

---

## 8. トラブルシューティング

### スキルが表示されない

1. コンソールでエラーを確認
2. `skill:list` IPCが正常に動作しているか確認
3. スキルディレクトリのパスを確認

### フィルターが動作しない

1. `skillFilter` 状態が更新されているか確認
2. `useMemo` の依存配列を確認
3. デバウンス設定を確認（200ms）

### インポートに失敗する

1. `skill:import` IPCのエラーを確認
2. 永続化設定の権限を確認
3. スキルIDの存在を確認

---

## 9. 確認チェックリスト

| セクション             | 確認    |
| ---------------------- | ------- |
| 概要                   | ✅ 完了 |
| アーキテクチャ         | ✅ 完了 |
| ディレクトリ構成       | ✅ 完了 |
| コンポーネント一覧     | ✅ 完了 |
| 状態管理               | ✅ 完了 |
| IPC通信                | ✅ 完了 |
| テスト戦略             | ✅ 完了 |
| 拡張ポイント           | ✅ 完了 |
| トラブルシューティング | ✅ 完了 |
