# Phase 5: 実装記録

## 変更対象ファイル

| ファイル                                                                                           | 変更種別                            |
| -------------------------------------------------------------------------------------------------- | ----------------------------------- |
| `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                               | state追加 + 参照先変更 + cancel追加 |
| `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx` | U-8b drift防止テスト追加            |

## 実装差分

### M-1: approvedSkillSpec state 追加 (SkillLifecyclePanel.tsx L287-289)

```typescript
const [approvedSkillSpec, setApprovedSkillSpec] = useState<string | null>(null);
```

**判断**: `request` とは別の独立した state で approved payload を管理。型は `string | null` で plan 未実行時は `null`。

### M-2: handlePrepare - plan 成功時にスナップショット固定 (L658)

```typescript
setApprovedSkillSpec(trimmedRequest);
```

**判断**: `planSkill` 成功レスポンス受信直後に `trimmedRequest` を固定。以降 textarea が変更されても `approvedSkillSpec` は影響を受けない。

### M-3: handleExecutePlan - canonical binding 修正 (L701-703)

```typescript
// Before: request.trim()
// After:
const result = await skillCreatorApi.executePlan(
  planId,
  approvedSkillSpec ?? undefined,
);
```

**判断**: `request.trim()` → `approvedSkillSpec ?? undefined`。`null` 時は `undefined` に変換し API 互換維持。

### M-4: handleCancelPlan - 対称クリア追加 (L747)

```typescript
setApprovedSkillSpec(null);
```

**判断**: `localPlanResult` と `approvedSkillSpec` を対称的にクリア。片消しを防ぐ。

## テスト追加

### U-8b: canonical binding drift prevention

```
plan作成("承認済みの依頼") → textarea変更("改ざんされた依頼") → execute
→ executePlan("plan-001", "承認済みの依頼") で呼ばれることを検証
```

## 実装判断

- patch 修正で十分。`PlanResult` 型拡張は不要
- `approvedSkillSpec` は component-local state で管理（store 昇格不要）
- API shape `executePlan(planId, skillSpec?, authMode?, apiKey?)` は変更なし
