# Phase 4: テスト作成

## メタ情報

| 項目   | 値                                    |
| ------ | ------------------------------------- |
| Phase  | 4                                     |
| 機能名 | TASK-SC-ABORT-SIGNAL-CREATE-SKILL-001 |
| 作成日 | 2026-04-19                            |

## 目的

Vitest 既存資産を再利用しつつ、public 契約と private 入口確認の差分だけを Red にする。

## 実行タスク

1. 既存 test file への追記位置を決める
2. public flow テストと private minimal テストを分離する
3. Red 期待値を明示する

## 参照資料

| 資料            | パス                                                                                | 用途                |
| --------------- | ----------------------------------------------------------------------------------- | ------------------- |
| cancel test     | `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService-cancel.test.ts` | public 契約         |
| service test    | `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts`        | mode 回帰           |
| desktop scripts | `apps/desktop/package.json`                                                         | Vitest コマンド確認 |

## 実行手順

### Step 1: テストケース

| ID    | 対象    | 内容                                                                       |
| ----- | ------- | -------------------------------------------------------------------------- |
| TC-01 | public  | `cancelCurrentOperation()` 後に `createSkill()` が abort-like error を返す |
| TC-02 | public  | create / orchestrate / collaborative の正常系が非回帰である                |
| TC-03 | private | `runOrchestrateWorkflow()` が abort 済み signal で即時失敗する             |
| TC-04 | private | `runCreateWorkflow()` が abort 済み signal で即時失敗する                  |

### Step 2: コマンド

```bash
pnpm --filter @repo/desktop test:run -- \
  apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts \
  apps/desktop/src/main/services/skill/__tests__/SkillCreatorService-cancel.test.ts
```

## 統合テスト連携

- Phase 5 は TC-01〜TC-04 が Red になる前提で着手する
- Phase 7 はこの 4 ケースを traceability の起点にする

## 成果物

- `outputs/phase-4/test-scenarios.md`
- `outputs/phase-4/command-expectations.md`
- `outputs/phase-4/red-test-result.md`

## 完了条件

- [ ] Vitest 前提へ統一した
- [ ] private direct test を 2 本に限定した
- [ ] 既存 test file 再利用方針を固定した
