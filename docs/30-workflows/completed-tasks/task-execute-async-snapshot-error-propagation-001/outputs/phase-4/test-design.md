# Phase 4: テスト設計

> 作成日: 2026-04-18
> タスクID: TASK-EXECUTE-ASYNC-SNAPSHOT-ERROR-PROPAGATION-001

## 概要

current facts を確認する targeted test の定義。Phase 2 の契約判断（選択肢 A）を前提とし、最小集合で契約の成否を判定する。

## テストマトリクス

| テストID | シナリオ                   | 検証項目                                          | 優先度 | 既存                 |
| -------- | -------------------------- | ------------------------------------------------- | ------ | -------------------- |
| T-EA-01  | structured error パス      | `errorMessage` が callback 第3引数へ渡る          | HIGH   | ✅ T-01              |
| T-EA-02  | catch パス                 | `snapshot ?? null` と `errorMessage` が渡る       | HIGH   | ✅ T-02              |
| T-EA-03  | success / terminal_handoff | 第3引数が `undefined` のまま                      | HIGH   | ✅ T-03, T-04        |
| T-EA-04  | snapshot 不在              | 第2引数が `null` に正規化される                   | HIGH   | ✅ T-05              |
| T-EA-05  | IPC relay                  | snapshot 不在でも `errorMessage` relay が成立する | MEDIUM | ✅ (creatorHandlers) |

## 既存テストとのマッピング

| 本タスクID | 既存テスト                               | ファイル                                         |
| ---------- | ---------------------------------------- | ------------------------------------------------ |
| T-EA-01    | T-01（structured error パス）            | `RuntimeSkillCreatorFacade.executeAsync.test.ts` |
| T-EA-02    | T-02（catch パス）                       | `RuntimeSkillCreatorFacade.executeAsync.test.ts` |
| T-EA-03    | T-03, T-04（terminal_handoff / success） | `RuntimeSkillCreatorFacade.executeAsync.test.ts` |
| T-EA-04    | T-05（snapshot undefined → null）        | `RuntimeSkillCreatorFacade.executeAsync.test.ts` |
| T-EA-05    | creatorHandlers.fire-and-forget.test.ts  | `creatorHandlers.fire-and-forget.test.ts`        |

## 追加テスト要否

**不要**。T-EA-01〜T-EA-05 の全シナリオが既存テストでカバーされている。

## 実行コマンド

```bash
pnpm --filter @repo/desktop exec vitest run \
  src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.test.ts \
  src/main/ipc/__tests__/creatorHandlers.fire-and-forget.test.ts
```

## Over-test 排除の根拠

- `errorCode` を snapshot 本体へ追加するテストは Phase 2 で型変更却下のため不要
- relay 経路の追加修正テストは実装変更がないため不要
- Phase 5 が no-op のため、新規テストを作成する必要がない

## Phase 5 への引き継ぎ

- 全 T-EA-01〜T-EA-05 が既存テストで充足済み
- Phase 5 で差分確認を行い、no-op を確認・記録する
