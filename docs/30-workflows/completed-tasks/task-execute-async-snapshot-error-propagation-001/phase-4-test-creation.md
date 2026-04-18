# Phase 4: テスト作成

## メタ情報

| 項目   | 値                                                |
| ------ | ------------------------------------------------- |
| Phase  | 4                                                 |
| 機能名 | task-execute-async-snapshot-error-propagation-001 |
| 作成日 | 2026-04-18                                        |

## 目的

current facts を確認する targeted test を定義し、最小変更で契約の成否を判定できるようにする。

## 実行タスク

- Task 4-1: runtime error パスの確認テスト設計
- Task 4-2: IPC relay 確認テスト設計
- Task 4-3: over-test 排除

## 参照資料

| 資料名         | パス                                                                                              | 説明                       |
| -------------- | ------------------------------------------------------------------------------------------------- | -------------------------- |
| Phase 1 成果物 | `outputs/phase-1/code-investigation.md`                                                           | current facts の前提       |
| Phase 3 成果物 | `outputs/phase-3/design-review-result.md`                                                         | test 着手可否の確認        |
| Phase 2 成果物 | `outputs/phase-2/design-notes.md`                                                                 | 契約判断の反映             |
| runtime テスト | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.test.ts` | 既存テスト確認             |
| IPC テスト     | `apps/desktop/src/main/ipc/__tests__/creatorHandlers.fire-and-forget.test.ts`                     | fire-and-forget relay 確認 |

## テストマトリクス

| テストID | シナリオ                   | 検証項目                                          | 優先度 |
| -------- | -------------------------- | ------------------------------------------------- | ------ |
| T-EA-01  | structured error パス      | `errorMessage` が callback 第3引数へ渡る          | HIGH   |
| T-EA-02  | catch パス                 | `snapshot ?? null` と `errorMessage` が渡る       | HIGH   |
| T-EA-03  | success / terminal_handoff | 第3引数が `undefined` のまま                      | HIGH   |
| T-EA-04  | snapshot 不在              | 第2引数が `null` に正規化される                   | HIGH   |
| T-EA-05  | IPC relay                  | snapshot 不在でも `errorMessage` relay が成立する | MEDIUM |

## 実行コマンド

```bash
  pnpm --filter @repo/desktop exec vitest run \
  src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.test.ts \
  src/main/ipc/__tests__/creatorHandlers.fire-and-forget.test.ts
```

## 成果物

| 成果物     | 配置先                           |
| ---------- | -------------------------------- |
| テスト設計 | `outputs/phase-4/test-design.md` |

## 完了条件

- [ ] T-EA-01〜05 を定義した
- [ ] current facts 確認に不要な over-test を排除した
- [ ] Phase 5 の判定材料として十分な最小集合になっている

## タスク100%実行確認【必須】

- [ ] テスト設計を完全に作成した

## 次Phase

→ [Phase 5: 差分確認・最小修正](phase-5-implementation.md)
