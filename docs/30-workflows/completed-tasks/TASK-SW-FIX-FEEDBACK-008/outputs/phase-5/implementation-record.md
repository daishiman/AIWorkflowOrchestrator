# Phase 5 成果物: 実装記録

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| タスクID   | TASK-SW-FIX-FEEDBACK-008 |
| 作成日     | 2026-04-15               |
| ステータス | completed                |

## 修正ファイル

`apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`

## 実装内容

### 1. refreshSkillsInBackground helper の追加

Phase 2 設計に基づき、非ブロッキングパターンを共通 helper として切り出した。

```typescript
const refreshSkillsInBackground = useCallback(() => {
  void fetchSkills().catch((error) => {
    console.warn("[SkillLifecyclePanel] fetchSkills failed:", error);
  });
}, [fetchSkills]);
```

### 2. processWorkflowOutcome の修正

**変更箇所**: `selectSkillByName` 後に `refreshSkillsInBackground()` を呼ぶ形に変更。`fetchSkills` 失敗が `selectSkillByName` の実行を阻害しない。

```typescript
// 修正後（抜粋）
if (executeResult.skillName) {
  selectSkillByName(executeResult.skillName);
}
refreshSkillsInBackground();
setLocalPlanResult(null);
clearGenerationState();
return true;
```

### 3. handleExecutePlan の修正

**変更箇所**: 同様に `selectSkillByName` 後に `refreshSkillsInBackground()` を呼ぶ形に変更。

```typescript
// 修正後（抜粋）
if (executeResponse.skillName) {
  selectSkillByName(executeResponse.skillName);
}
await loadVerifyDetail(planId);
refreshSkillsInBackground();
setLocalPlanResult(null);
clearGenerationState();
```

## テスト遷移

| テストID  | Phase 4 (before)                         | Phase 5 (after)  |
| --------- | ---------------------------------------- | ---------------- |
| U-NEW-1   | red（実装前は selectSkillByName 未到達） | green            |
| U-NEW-2   | red                                      | green            |
| U-NEW-3   | red                                      | green            |
| U-8 (1st) | PASS（既存）                             | PASS（回帰なし） |
| U-8 (2nd) | PASS（既存）                             | PASS（回帰なし） |
| U-13      | PASS（既存）                             | PASS（回帰なし） |

## generationError 非更新の確認

修正後の 2 箇所において `setGenerationError` の呼び出しは `fetchSkills` 失敗ケースから完全に除去されており、AC-3 を満たす。
