# Phase 2: テストと検証計画

## テスト設計方針

| 方針            | 内容                                                                     |
| --------------- | ------------------------------------------------------------------------ |
| public first    | `createSkill()` を通るキャンセル契約を主証跡にする                       |
| private minimal | private workflow の direct test は入口確認に限定する（TC-03/TC-04の2本） |
| vitest only     | `jest.spyOn` は禁止し `vi.spyOn` または public flow を使う               |

## テストケース一覧

| ID    | 対象    | 内容                                                                 | ファイル        |
| ----- | ------- | -------------------------------------------------------------------- | --------------- |
| TC-01 | public  | `cancelCurrentOperation()` 後に `createSkill()` が AbortError を返す | cancel.test.ts  |
| TC-02 | public  | create / orchestrate / collaborative の正常系が非回帰である          | service.test.ts |
| TC-03 | private | `runOrchestrateWorkflow()` が abort 済み signal で即時失敗する       | cancel.test.ts  |
| TC-04 | private | `runCreateWorkflow()` が abort 済み signal で即時失敗する            | cancel.test.ts  |
| EX-01 | private | `signal` なしでも private workflow が正常終了する                    | cancel.test.ts  |
| EX-02 | cleanup | 新規作成ディレクトリのみ cleanup 対象になる                          | service.test.ts |
| EX-03 | normal  | abort なしの create / orchestrate が非回帰である                     | service.test.ts |

## 実行コマンド

```bash
pnpm --filter @repo/desktop test:run -- \
  apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts \
  apps/desktop/src/main/services/skill/__tests__/SkillCreatorService-cancel.test.ts
```

## 既存テスト再利用方針

- `SkillCreatorService-cancel.test.ts`: TC-01〜TC-05 は変更せず、TC-03/TC-04 を追記
- `SkillCreatorService.test.ts`: 既存 SC-001〜SC-031 は変更せず、回帰確認に使用
