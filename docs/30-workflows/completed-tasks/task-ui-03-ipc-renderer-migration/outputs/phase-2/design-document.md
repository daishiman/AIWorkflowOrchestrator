# Phase 2 成果物: 設計書（IPC分離契約設計ドキュメント）

## 概要

TASK-UI-03-REMAINING の移行方針・IPC分離契約・命名規則を定義する。

---

## Task 1: コンポーネント移行設計

### ImprovementProposalPanel.tsx (line 73)

**変更前**:

```typescript
await window.electronAPI.skillCreator.applyRuntimeImprovement(
  skillName,
  selectedSuggestions,
);
```

**変更後**:

```typescript
await window.skillCreatorAPI.applyRuntimeImprovement(
  skillName,
  selectedSuggestions,
);
```

型定義の変更: **不要**（`window.skillCreatorAPI` は `SkillCreatorAPI` 型として既に公開済み）

---

### GovernanceSummaryPanel.tsx (line 18-23, 93)

**変更前**（`getGovernanceApi` ヘルパー関数）:

```typescript
function getGovernanceApi(): SkillCreatorGovernanceApi | undefined {
  return (
    window as Window & {
      electronAPI?: { skillCreator?: SkillCreatorGovernanceApi };
    }
  ).electronAPI?.skillCreator;
}
```

**変更後**:

```typescript
function getGovernanceApi(): SkillCreatorGovernanceApi | undefined {
  return (
    window as Window & {
      skillCreatorAPI?: SkillCreatorGovernanceApi;
    }
  ).skillCreatorAPI;
}
```

**エラーメッセージ（line 93）**:

- 変更前: `"window.electronAPI.skillCreator.getGovernanceState が利用できません"`
- 変更後: `"window.skillCreatorAPI.getGovernanceState が利用できません"`

型定義の変更: **不要**（`SkillCreatorGovernanceApi` ローカル型は変わらない）

---

## Task 2: IPC分離契約設計ドキュメント

### Session系チャネルの責務定義（廃止済み）

| 項目   | 内容                                |
| ------ | ----------------------------------- |
| 旧担当 | `window.skillCreatorSessionAPI`     |
| 現状   | 全メソッドno-op（TASK-UI-02で廃止） |
| 用途   | 会話フロー（廃止）                  |

### Runtime系チャネルの責務定義（現行）

| 項目              | 内容                                                                  |
| ----------------- | --------------------------------------------------------------------- |
| Canonical API     | `window.skillCreatorAPI`                                              |
| preload定義       | `apps/desktop/src/preload/skill-creator-api.ts`                       |
| mainハンドラー    | `apps/desktop/src/main/ipc/creatorHandlers.ts`                        |
| contextBridge公開 | `contextBridge.exposeInMainWorld("skillCreatorAPI", skillCreatorAPI)` |
| 用途              | ワークフロー状態管理・スキル作成・ガバナンス                          |

### 新機能開発者向けガイドライン

| ユースケース         | 使用すべきAPI                                                   |
| -------------------- | --------------------------------------------------------------- |
| 会話フロー           | `window.skillCreatorAPI` の session系メソッド                   |
| ワークフロー状態管理 | `window.skillCreatorAPI` の runtime系メソッド                   |
| **禁止**             | `window.electronAPI.skillCreator`（新規rendererからの直接参照） |

---

## Task 3: チャネル命名規則方針

`apps/desktop/src/preload/channels.ts` の分析結果:

- 現状の `skill-creator:*` プレフィックスは一貫して使用されている
- 詳細な命名規則ガイドラインは Phase 6 成果物 `channel-naming-guide.md` に記載

---

## Task 4: electronAPI.skillCreator の扱い（方針明文化）

| 項目              | 内容                                                                                                 |
| ----------------- | ---------------------------------------------------------------------------------------------------- |
| Canonical Surface | `window.skillCreatorAPI`                                                                             |
| API Owner         | `apps/desktop/src/preload/skill-creator-api.ts`                                                      |
| 互換ポリシー      | `window.electronAPI.skillCreator` は preload の互換シムとして残存                                    |
| 削除トリガー      | `grep "window.electronAPI.skillCreator" apps/desktop/src/renderer` が 0件になった後の follow-up task |
| 新規renderer制約  | `window.electronAPI.skillCreator` を参照しない（本タスクで残存2件を除去）                            |

---

## 既存テストへの影響範囲

| テストファイル                      | 変更内容                                                                                    |
| ----------------------------------- | ------------------------------------------------------------------------------------------- |
| `ImprovementProposalPanel.test.tsx` | モック設定を `window.skillCreatorAPI` に変更                                                |
| `GovernanceSummaryPanel.test.tsx`   | `setupMockApi` を `window.skillCreatorAPI` に変更、`afterEach`の cleanup変更、TC-R-11を更新 |

---

## 完了確認

- [x] 2コンポーネントの変更内容が明確に設計されている
- [x] IPC分離契約設計ドキュメントの内容が確定している
- [x] チャネル命名規則ガイドラインの方針が決定している
- [x] `electronAPI.skillCreator` の扱い（preload 互換シムとして残存）が決定している
- [x] 既存テストへの影響範囲が明記されている
