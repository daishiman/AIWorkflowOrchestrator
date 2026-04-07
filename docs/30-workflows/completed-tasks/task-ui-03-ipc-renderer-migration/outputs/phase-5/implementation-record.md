# Phase 5 成果物: 実装記録

## 変更ファイル一覧

| ファイル                                                                              | 変更内容                                                                 |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `apps/desktop/src/renderer/components/skill/ImprovementProposalPanel.tsx`             | line 72-75: `window.electronAPI.skillCreator` → `window.skillCreatorAPI` |
| `apps/desktop/src/renderer/components/organisms/AgentView/GovernanceSummaryPanel.tsx` | `getGovernanceApi()` 関数 + エラーメッセージ変更                         |
| `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                    | `getSkillCreatorApi()` を `skillCreatorAPI` 優先に統一                   |
| `apps/desktop/src/renderer/hooks/useStreamingProgress.ts`                             | `window.skillCreatorAPI` 優先の `getSkillCreatorApi()` を追加            |
| `apps/desktop/src/renderer/components/skill/hooks/useLLMAdapterStatus.ts`             | `skillCreatorAPI` を `electronAPI.skillCreator` より優先するよう調整     |
| `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                  | `getSkillCreatorApi()` を `skillCreatorAPI` 優先に統一                   |

---

## 変更詳細

### ImprovementProposalPanel.tsx

**変更前**:

```typescript
const result = await window.electronAPI.skillCreator.applyRuntimeImprovement(
  skillName,
  selectedSuggestions,
);
```

**変更後**:

```typescript
const result = await window.skillCreatorAPI.applyRuntimeImprovement(
  skillName,
  selectedSuggestions,
);
```

---

### GovernanceSummaryPanel.tsx

**変更前（getGovernanceApi関数）**:

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

**変更前（エラーメッセージ）**:

```typescript
"window.electronAPI.skillCreator.getGovernanceState が利用できません";
```

**変更後**:

```typescript
"window.skillCreatorAPI.getGovernanceState が利用できません";
```

### 追加の canonical-first normalization

`SkillLifecyclePanel.tsx` と `useLLMAdapterStatus.ts` では、互換シムを残したまま canonical API を優先するように整理した。

- `window.skillCreatorAPI` が存在する場合はそれを優先
- `window.skillCreatorAPI` が未定義のときのみ `window.electronAPI.skillCreator` に fallback

### 追加の canonical-first normalization（近接コンポーネント）

`SkillCreateWizard.tsx` と `useStreamingProgress.ts` でも、同じ canonical-first の方針に揃えた。

- `window.skillCreatorAPI` が存在する場合はそれを優先
- `window.skillCreatorAPI` が未定義のときのみ `window.electronAPI.skillCreator` に fallback

---

## IPC 契約チェックリスト確認

| 確認項目                                                 | 結果        |
| -------------------------------------------------------- | ----------- |
| Main Process ハンドラーに変更なし（API参照側の変更のみ） | ✅ 変更なし |
| Preload API（`skill-creator-api.ts`）の変更なし          | ✅ 変更なし |
| 型定義の変更有無                                         | ✅ 変更なし |
| チャネルホワイトリスト（`channels.ts`）に変更なし        | ✅ 変更なし |
| 追加の canonical-first normalization                     | ✅ 対応済み |
| 近接コンポーネントの canonical-first normalization       | ✅ 対応済み |

## 旧経路参照ゼロ確認

```bash
grep -rn "window.electronAPI.skillCreator" apps/desktop/src/renderer --include="*.tsx" --include="*.ts"
# → 結果: 0件 ✅
```

## 品質確認

| 確認項目                                | 結果          |
| --------------------------------------- | ------------- |
| `pnpm --filter @repo/desktop typecheck` | ✅ エラーなし |
| 旧経路参照（renderer）                  | ✅ 0件        |

## 完了確認

- [x] `ImprovementProposalPanel.tsx` が `window.skillCreatorAPI` 経路を使用している
- [x] `GovernanceSummaryPanel.tsx` が `window.skillCreatorAPI` 経路を使用している
- [x] `SkillLifecyclePanel.tsx` / `useLLMAdapterStatus.ts` でも canonical API を優先している
- [x] `SkillCreateWizard.tsx` / `useStreamingProgress.ts` でも canonical API を優先している
- [x] `grep "window.electronAPI.skillCreator" renderer/` の結果が0件
- [x] IPC 契約チェックリストの確認が完了している
