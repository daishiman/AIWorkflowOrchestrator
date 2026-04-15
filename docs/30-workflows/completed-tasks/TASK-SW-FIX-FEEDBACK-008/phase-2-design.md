# Phase 2: 設計

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| Phase      | 2                                             |
| タスクID   | TASK-SW-FIX-FEEDBACK-008                      |
| 機能名     | `fetchSkills()` 非ブロッキング化（follow-up） |
| 前提Phase  | Phase 1                                       |
| 後続Phase  | Phase 3                                       |
| 作成日     | 2026-04-15                                    |
| ステータス | pending                                       |

## 目的

2 箇所の `fetchSkills` 呼び出しを同じ非ブロッキングパターンへ揃える。

## 設計方針

| 論点         | 方針                                                                               |
| ------------ | ---------------------------------------------------------------------------------- |
| 失敗時の制御 | `fetchSkills` の失敗を局所 `catch` で吸収し、後続の `selectSkillByName` を継続する |
| ログ方針     | `console.warn("[SkillLifecyclePanel] fetchSkills failed:", error)` に統一する      |
| 実装形       | `void fetchSkills().catch(...)` を共通 helper に切り出し、後続処理を止めない       |
| 適用範囲     | `processWorkflowOutcome` と `handleExecutePlan` の 2 箇所に限定する                |

## Before / After

### Before

```typescript
try {
  await fetchSkills();
} catch (error) {
  setGenerationError(
    error instanceof Error ? error.message : "スキル一覧の取得に失敗しました。",
  );
  return true;
}
if (executeResult.skillName) {
  selectSkillByName(executeResult.skillName);
}
```

### After

```typescript
void fetchSkills().catch((error) => {
  console.warn("[SkillLifecyclePanel] fetchSkills failed:", error);
});
if (executeResult.skillName) {
  selectSkillByName(executeResult.skillName);
}
```

## 依存関係

| 依存元                   | 使用箇所       | 目的                               |
| ------------------------ | -------------- | ---------------------------------- |
| Phase 1                  | AC-1 から AC-5 | 受入条件に沿った実装方針へ固定する |
| TASK-SW-FIX-FEEDBACK-001 | NOTE-001       | 2 箇所修正の根拠とする             |

## 実行タスク

- [ ] `processWorkflowOutcome` の非ブロッキング化パターンを確定する
- [ ] `handleExecutePlan` の非ブロッキング化パターンを確定する
- [ ] ログメッセージを 2 箇所で統一する
- [ ] 失敗時に `generationError` を触らない設計であることを記録する
- [ ] Phase 3 で確認すべき lint / outer catch 観点を列挙する

## 統合テスト連携

| 接続点       | 確認内容                                                       | 検証Phase        |
| ------------ | -------------------------------------------------------------- | ---------------- |
| Unit         | 失敗時継続と成功時回帰の両方を確認する                         | Phase 4, Phase 6 |
| Quality gate | typecheck / lint で promise 取り扱いに問題がないことを確認する | Phase 9          |
| Final gate   | 実装方針とテスト結果が矛盾しないことを確認する                 | Phase 10         |

## 完了条件

- [ ] 2 箇所の修正方針が同一パターンで定義されている
- [ ] ログ方針が明記されている
- [ ] `generationError` を更新しない理由が明記されている
- [ ] Phase 3 のレビュー観点が列挙されている

## 成果物

- `outputs/phase-2/design-document.md`

## 参照資料

| 資料名                 | パス                                                                               |
| ---------------------- | ---------------------------------------------------------------------------------- |
| Phase 1 成果物         | `outputs/phase-1/requirements-definition.md`                                       |
| 親 workflow の調査根拠 | `docs/30-workflows/TASK-SW-FIX-FEEDBACK-001/outputs/phase-11/discovered-issues.md` |
| 修正対象ファイル       | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`               |
