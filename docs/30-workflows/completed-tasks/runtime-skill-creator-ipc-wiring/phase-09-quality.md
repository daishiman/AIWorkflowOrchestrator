# Phase 9: 品質保証 - Skill Creator Public IPC Wiring 統合

## メタ情報

| 項目      | 値                                          |
| --------- | ------------------------------------------- |
| タスクID  | UT-IMP-RUNTIME-SKILL-CREATOR-IPC-WIRING-001 |
| Phase     | 9 - 品質保証                                |
| 前提Phase | Phase 8（リファクタリング）                 |
| 関連Issue | #1434                                       |

## 目的

コード・workflow・system spec の 3 面で、runtime skill creator wiring の矛盾をなくす。

## 実行タスク

- TypeScript 型整合を確認する
- runtime handler / preload / facade テストの実行可否を確認する
- workflow validator を通す
- aiworkflow 正本更新後に index を再生成する

## 参照資料

| 資料名                   | パス                                                                                 | 説明          |
| ------------------------ | ------------------------------------------------------------------------------------ | ------------- |
| Phase 5 実装             | `docs/30-workflows/runtime-skill-creator-ipc-wiring/phase-05-implementation.md`      | 実装対象      |
| Phase 8 リファクタリング | `docs/30-workflows/runtime-skill-creator-ipc-wiring/phase-08-refactoring.md`         | cleanup 結果  |
| Shared contract          | `packages/shared/src/types/skillCreator.ts`                                          | 型整合        |
| aiworkflow core spec     | `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`           | IPC 正本      |
| aiworkflow security spec | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-details.md` | security 正本 |

## 実行手順

### Step 1: 型検証を実行する

```bash
pnpm --filter @repo/desktop typecheck
```

### Step 2: テストを実行する

対象:

- `creatorHandlers.test.ts`
- `skillCreatorHandlers.runtime.test.ts`
- `RuntimeSkillCreatorFacade.test.ts`
- `skill-creator-api.runtime.test.ts`

### Step 3: skill 準拠を検証する

```bash
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js \
  --workflow docs/30-workflows/runtime-skill-creator-ipc-wiring
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
```

## 統合テスト連携

- テスト実行が環境要因で不能な場合は、型検証結果と失敗理由を記録する
- `verify-all-specs` は PASS を維持する

## 成果物

| 成果物              | パス                                                                                   | 説明                    |
| ------------------- | -------------------------------------------------------------------------------------- | ----------------------- |
| quality note        | `docs/30-workflows/runtime-skill-creator-ipc-wiring/outputs/phase-9/quality-report.md` | 実行結果記録            |
| verification report | `docs/30-workflows/runtime-skill-creator-ipc-wiring/outputs/verification-report.md`    | workflow validator 出力 |

## 完了条件

- [ ] `pnpm --filter @repo/desktop typecheck` が通る
- [ ] runtime handler / preload / facade の検証結果が記録されている
- [ ] `verify-all-specs` が PASS する
- [ ] aiworkflow 正本 index を再生成している
- [ ] **本Phase内の全タスクを100%実行完了**
