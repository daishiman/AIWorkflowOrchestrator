# Phase 6 成果物: チャネル命名規則ガイドライン（AC-5）

## 概要

`apps/desktop/src/preload/channels.ts` の分析に基づく IPC チャネル命名規則。

---

## 現行パターン分析

### `skill-creator:*` プレフィックス

現在使用されているチャネルは全て `skill-creator:` プレフィックスで統一されている。

```
skill-creator:detect-mode
skill-creator:create-skill
skill-creator:execute-tasks
skill-creator:validate-skill
skill-creator:validate-schema
skill-creator:plan-runtime
skill-creator:improve-runtime
skill-creator:apply-improvement    ← applyRuntimeImprovement のチャネル
skill-creator:get-governance-state ← getGovernanceState のチャネル
...
```

---

## 命名規則

### 基本フォーマット

```
{domain}:{action}
```

| 要素     | ルール                           | 例                                          |
| -------- | -------------------------------- | ------------------------------------------- |
| `domain` | ケバブケース、機能ドメインを表す | `skill-creator`                             |
| `action` | ケバブケース、動詞+名詞          | `apply-improvement`, `get-governance-state` |

### session系 vs runtime系の命名区別

| 分類      | プレフィックス/サフィックス           | 説明                             |
| --------- | ------------------------------------- | -------------------------------- |
| Session系 | `skill-creator-session:*`（廃止済み） | 会話フロー（TASK-UI-02で廃止）   |
| Runtime系 | `skill-creator:*`                     | ワークフロー状態管理・スキル操作 |

**注意**: `skillCreatorSessionAPI` は全メソッドno-op化済み（TASK-UI-02完了）。
新規チャネルは `skill-creator:` プレフィックスを使用すること。

---

## 新規チャネル追加時のガイドライン

### 1. チャネル定義（channels.ts）

```typescript
// channels.ts
export const SKILL_CREATOR_CHANNELS = {
  // 既存
  APPLY_IMPROVEMENT: "skill-creator:apply-improvement",
  GET_GOVERNANCE_STATE: "skill-creator:get-governance-state",

  // 新規追加例（ケバブケースで action を命名）
  NEW_ACTION: "skill-creator:new-action",
} as const;
```

### 2. チャネル選択基準

| 用途                   | 使用するプレフィックス                      |
| ---------------------- | ------------------------------------------- |
| スキル作成・実行・検証 | `skill-creator:`                            |
| ガバナンス・権限管理   | `skill-creator:`                            |
| 会話フロー（将来実装） | `skill-creator:` の session系メソッドを活用 |

### 3. renderer での呼び出し規則

```typescript
// ✅ 正しい: window.skillCreatorAPI 経由
await window.skillCreatorAPI.newAction();

// ❌ 禁止: window.electronAPI.skillCreator 経由
await window.electronAPI.skillCreator.newAction(); // 新規使用禁止
```

---

## 完了確認

- [x] 現状の `skill-creator:*` プレフィックスの一貫性確認
- [x] 新規チャネル追加時の命名方針の文書化
- [x] session系 vs runtime系の命名区別ガイド
