# Phase 5: 実装

## メタ情報

| 項目         | 内容                                     |
| ------------ | ---------------------------------------- |
| Phase        | 5                                        |
| タスクID     | TASK-SKILL-CREATOR-BEFORE-QUIT-GUARD-001 |
| ステータス   | 未実施                                   |
| 担当         | 実装者                                   |
| 見積もり時間 | 0.5h                                     |

## 目的

Phase 4 のテストを全て Green にする。既存実装が正しければ変更不要。AC-4・AC-5 に対するテスト（TC-F）が Green になることを確認する。

## 実行タスク

1. Phase 4 のテスト結果を確認する
2. TC-F が Red の場合のみ `RuntimeSkillCreatorFacade.ts` を修正する
3. 全テスト（TC-B-01〜TC-B-03、TC-F-04〜TC-F-08）が Green になることを確認する

## 参照資料

| 参照資料           | パス                                                                                                        | 用途             |
| ------------------ | ----------------------------------------------------------------------------------------------------------- | ---------------- |
| Phase 4 テスト作成 | `phase-4-test-creation.md`                                                                                  | 追加テストの確認 |
| 既存テスト記録     | `docs/30-workflows/completed-tasks/skill-creator-before-quit-guard/outputs/phase-4/test-creation-report.md` | Green 状態の確認 |
| Facade 実装        | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                                       | 変更要否の確認   |
| before-quit 実装   | `apps/desktop/src/main/ipc/beforeQuitGuard.ts`                                                              | 関連動作の確認   |

## 既存実装の確認ポイント

### beforeQuitGuard.ts（変更不要）

```typescript
// AC-1〜AC-3 を満たす実装が完了済み
export const registerBeforeQuitGuard = ({ app, dialog, facade }) => {
  const handler = (event) => {
    if (!facade.hasRunningExecution()) return;   // AC-2
    event.preventDefault();                       // AC-1
    dialog.showMessageBox({ ... })
      .then(({ response }) => {
        if (response === 0) app.exit(0);          // AC-6（Phase 6 で検証）
      })
      .catch((error) => console.warn(...));       // AC-7（Phase 6 で検証）
  };
  app.on("before-quit", handler);
  return () => app.removeListener("before-quit", handler);  // AC-3
};
```

### RuntimeSkillCreatorFacade.ts（変更不要の場合）

```typescript
// AC-4・AC-5 を満たす実装が完了済み（要確認）
private activeExecutionCount: number = 0;

hasRunningExecution(): boolean {
  return this.activeExecutionCount > 0;
}

async execute(planResult, authMode, apiKey) {
  this.activeExecutionCount += 1;          // AC-4: 開始時に true
  try {
    // ... LLM 処理 ...
  } finally {
    this.activeExecutionCount = Math.max(0, this.activeExecutionCount - 1);
    // AC-4: 完了/失敗時に false に戻る
    // AC-5: 並行実行時は全件完了まで true を維持
  }
}
```

## 修正が必要な場合の対処

TC-F が Red の場合は以下を確認する:

```bash
# activeExecutionCount の実装を確認
rg -n "activeExecutionCount|hasRunningExecution" \
  apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts
```

修正箇所が `finally` ブロックの欠落の場合:

```typescript
// 修正前（finally なし）
async execute(planResult, authMode, apiKey) {
  this.activeExecutionCount += 1;
  await this.runInternal(planResult, authMode, apiKey);  // 例外で activeExecutionCount が戻らない
}

// 修正後（finally で確実に減算）
async execute(planResult, authMode, apiKey) {
  this.activeExecutionCount += 1;
  try {
    await this.runInternal(planResult, authMode, apiKey);
  } finally {
    this.activeExecutionCount = Math.max(0, this.activeExecutionCount - 1);
  }
}
```

## 統合テスト連携

Phase 5 はユニットテストの Green 確認のみ。統合テストは Phase 11。

## 成果物

| 成果物                | パス                                       | 説明           |
| --------------------- | ------------------------------------------ | -------------- |
| implementation-record | `outputs/phase-5/implementation-record.md` | 実装確認の記録 |

## 完了条件

- [ ] TC-B-01〜TC-B-03 が全て Green
- [ ] TC-F-04〜TC-F-08 が全て Green
- [ ] 変更した場合は TypeScript 型チェック PASS

## タスク 100% 実行確認【必須】

- [ ] 全テストが Green であることを確認した
- [ ] 変更した場合は変更内容を記録した

## 次 Phase

Phase 5 完了後、Phase 6（テスト拡充）に進む。
