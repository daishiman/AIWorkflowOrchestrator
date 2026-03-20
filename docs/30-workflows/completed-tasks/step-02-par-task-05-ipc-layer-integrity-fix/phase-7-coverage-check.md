# Phase 7: カバレッジ確認

## メタ情報

| 項目     | 値                                                 |
| -------- | -------------------------------------------------- |
| Phase    | 7                                                  |
| タスクID | TASK-IMP-IPC-LAYER-INTEGRITY-FIX-001               |
| 機能名   | skill-lifecycle-routing / ipc-layer-integrity-fix  |
| 作成日   | 2026-03-17                                         |
| 前Phase  | [Phase 6: テスト拡充](./phase-6-test-expansion.md) |

## 目的

Phase 5 の実装に対してカバレッジ基準が達成されているかを測定し、未達の場合は Phase 6 へ戻ってテストを追加する。

## カバレッジ基準

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

## P41 対策: v8 カバレッジプロバイダの注意事項

Vitest の v8 カバレッジプロバイダは、インライン arrow function（例: `getAllowedWindows: () => [mainWindow]`）を独立した関数としてカウントする。

SKILL_UPDATE ハンドラ内の `validateIpcSender` 呼び出し:

```typescript
const validation = validateIpcSender(event, IPC_CHANNELS.SKILL_UPDATE, {
  getAllowedWindows: () => [mainWindow], // ← v8 はこれを独立した関数としてカウント
});
```

このコールバックが実行されないと Function Coverage が大幅に低下する可能性がある。

**対策**: セキュリティテストで `getAllowedWindows` コールバックの呼び出しを明示的に確認する:

```typescript
it("validateIpcSender の getAllowedWindows コールバックが呼ばれる（P41対策）", async () => {
  // validateIpcSender のモックをコールバックまで実行するように設定
  mockValidateIpcSender.mockImplementation(
    (_event, _channel, opts: { getAllowedWindows: () => unknown[] }) => {
      const windows = opts.getAllowedWindows(); // コールバックを実行
      return { valid: true };
    },
  );
  await handler(event, "my-skill", {});
  // getAllowedWindows が呼ばれた確認はモック実装内で行う
});
```

## 参照資料

| 参照資料                                 | パス                                                                              | 用途                             |
| ---------------------------------------- | --------------------------------------------------------------------------------- | -------------------------------- |
| Phase 5 実装報告                         | `outputs/phase-5/implementation-report.md`                                        | カバレッジ測定対象の実装内容確認 |
| Phase 6 テスト拡充                       | `phase-6-test-expansion.md`                                                       | 追加済みテスト観点の確認         |
| IPC契約チェックリスト                    | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`     | IPC 回帰時の確認観点             |
| aiworkflow-requirements: セキュリティIPC | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-core.md` | sender検証/エラー処理契約の確認  |

## 実行タスク

- カバレッジ測定コマンド実行: skillHandlers.ts と skill-api.ts のカバレッジを測定する
- カバレッジ結果の評価: Line/Branch/Function の各指標を基準値と比較する
- 未達箇所の特定とフィードバック: カバレッジ未達箇所を特定し Phase 6 へのフィードバックを作成する
- 判定: カバレッジ基準を満たしているか判定し結果を記録する

### タスク 1: カバレッジ測定コマンド実行

```bash
# skillHandlers.ts の SKILL_UPDATE ハンドラ追加部分のカバレッジ測定
cd apps/desktop && pnpm vitest run \
  src/main/ipc/__tests__/skillHandlers.update.test.ts \
  --coverage \
  --coverage.include="src/main/ipc/skillHandlers.ts" \
  --reporter=verbose 2>&1 | tee outputs/phase-7/coverage-skillHandlers.txt

# skill-api.ts の getDetail/update 追加部分のカバレッジ測定
cd apps/desktop && pnpm vitest run \
  src/preload/__tests__/skill-api.getDetail-update.test.ts \
  --coverage \
  --coverage.include="src/preload/skill-api.ts" \
  --reporter=verbose 2>&1 | tee outputs/phase-7/coverage-skill-api.txt
```

### タスク 2: カバレッジ結果の評価

測定結果を以下の表に記録する:

#### skillHandlers.ts (SKILL_UPDATE 追加部分)

| 指標              | 測定値 | 基準達成  |
| ----------------- | ------ | --------- |
| Line Coverage     | ?%     | PASS/FAIL |
| Branch Coverage   | ?%     | PASS/FAIL |
| Function Coverage | ?%     | PASS/FAIL |

**注意**: `skillHandlers.ts` はファイル全体のカバレッジが測定される。既存コードのカバレッジも含むため、SKILL_UPDATE 追加部分（新規コード）のカバレッジを個別評価する。

```bash
# 新規追加行のカバレッジを確認（grep で追加部分を特定）
grep -n "SKILL_UPDATE\|skill:update\|updateSkill" \
  apps/desktop/src/main/ipc/skillHandlers.ts
```

#### skill-api.ts (getDetail/update 追加部分)

| 指標              | 測定値 | 基準達成  |
| ----------------- | ------ | --------- |
| Line Coverage     | ?%     | PASS/FAIL |
| Branch Coverage   | ?%     | PASS/FAIL |
| Function Coverage | ?%     | PASS/FAIL |

### タスク 3: 未達箇所の特定とフィードバック

カバレッジが基準未達の場合、以下の観点で未テスト箇所を特定する:

#### 未達が発生しやすいブランチ

| ブランチ                                                | テスト状態 | 対応           |
| ------------------------------------------------------- | ---------- | -------------- |
| `typeof skillName !== "string"` が true の branch       |            | Phase 6 に戻る |
| `skillName === ""` が true の branch                    |            | Phase 6 に戻る |
| `skillName.trim() === ""` が true の branch             |            | Phase 6 に戻る |
| `updates === null` が true の branch                    |            | Phase 6 に戻る |
| `Array.isArray(updates)` が true の branch              |            | Phase 6 に戻る |
| `validation.valid` が false の branch（sender検証失敗） |            | Phase 6 に戻る |
| `try-catch` の catch ブランチ                           |            | Phase 6 に戻る |
| Preload: `skillId === ""` が true の branch             |            | Phase 6 に戻る |
| Preload: `skillId.trim() === ""` が true の branch      |            | Phase 6 に戻る |
| Preload: `updates === null` が true の branch           |            | Phase 6 に戻る |

### タスク 4: 判定

| 判定 | 条件                                           | 対応           |
| ---- | ---------------------------------------------- | -------------- |
| PASS | Line 80%+, Branch 60%+, Function 80%+ を全達成 | Phase 8 へ進む |
| 未達 | いずれかの基準を達成していない                 | Phase 6 へ戻る |

## 統合テスト連携

- 本Phaseの変更点が受入基準（AC）と追跡可能であることを確認する
- 前Phase成果物と本Phaseテスト（単体・統合・手動）の対応関係を記録する
- 未達・差分がある場合は戻り先Phaseと再実行条件を明記する

## 成果物

| 成果物                 | パス                                         | 説明                        |
| ---------------------- | -------------------------------------------- | --------------------------- |
| カバレッジ測定結果     | `outputs/phase-7/coverage-skillHandlers.txt` | skillHandlers.ts の測定結果 |
| カバレッジ測定結果     | `outputs/phase-7/coverage-skill-api.txt`     | skill-api.ts の測定結果     |
| カバレッジ評価レポート | `outputs/phase-7/coverage-report.md`         | 基準達成状況と判定          |

## 完了条件

- [ ] `skillHandlers.ts` の新規追加コードについて Line 80%+、Branch 60%+、Function 80%+ を達成
- [ ] `skill-api.ts` の新規追加コードについて Line 80%+、Branch 60%+、Function 80%+ を達成
- [ ] P41 対策: `getAllowedWindows` コールバックのテストが含まれている（Function Coverage 確認）
- [ ] カバレッジ測定結果が `outputs/phase-7/` に記録されている
- [ ] `outputs/phase-7/coverage-report.md` に判定（PASS/未達）を記録した
- [ ] 未達の場合は Phase 6 へ戻り、テストを追加した
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/skill-lifecycle-routing/tasks/step-02-par-task-05-ipc-layer-integrity-fix \
  --phase 7
```

## 次Phase

- PASS の場合: Phase 8: リファクタリング（[phase-8-refactoring.md](./phase-8-refactoring.md)）
- 未達の場合: Phase 6: テスト拡充に戻る
