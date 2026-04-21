# Phase 7: カバレッジ確認

## メタ情報

| 項目     | 値                                                     |
| -------- | ------------------------------------------------------ |
| Phase    | 7                                                      |
| タスクID | TASK-SC-08-FUP-02-PAYLOAD-TRACKING-ID                  |
| 前Phase  | [phase-6-test-expansion.md](phase-6-test-expansion.md) |

## 目的

`useStreamingProgress` フィルタロジックの各分岐、および Runtime ルート emit 経路の
planId 貫通箇所を coverage で可視化し、AC-4 〜 AC-8 の達成を裏付ける。

## coverage 観点

| 観点                    | 対象                                                          | 基準                          |
| ----------------------- | ------------------------------------------------------------- | ----------------------------- |
| filter 分岐: match      | `options.planId === progress.planId`                          | TC-01 / TC-E3 で covered      |
| filter 分岐: miss       | `options.planId !== progress.planId`                          | TC-02 / TC-E4 で covered      |
| filter 分岐: legacy     | `progress.planId === undefined`                               | TC-03 / TC-E5 で covered      |
| filter 分岐: no options | `options?.planId === undefined`                               | TC-04 / TC-E6 で covered      |
| Runtime emit path       | `RuntimeSkillCreatorFacade.executeAsync` で planId を渡す箇所 | targeted test / grep で裏取り |
| Main 送信経路           | `sendSkillCreatorProgress` 全呼び出し箇所                     | `grep -rn` で静的確認         |

## 検証コマンド

```bash
# Hook 単体カバレッジ
pnpm --filter @repo/desktop test -- --coverage --run useStreamingProgress

# skill-creator 全体回帰
pnpm --filter @repo/desktop test -- --run skill-creator

# 送信経路の静的捕捉
grep -rn "sendSkillCreatorProgress" apps/desktop/src/main/
grep -rn "SkillCreatorProgress" apps/desktop/src/
```

## coverage 期待値

| 対象ファイル                   | 期待                                                    |
| ------------------------------ | ------------------------------------------------------- |
| `useStreamingProgress.ts`      | filter 4 分岐すべてがテスト実行で通過する               |
| `skillCreatorHandlers.ts`      | `sendSkillCreatorProgress` 呼び出しが grep で 100% 可視 |
| `RuntimeSkillCreatorFacade.ts` | executeAsync の emit 経路で planId が貫通している       |

## 実行タスク

- filter 4 分岐と Runtime/Main 経路の coverage 観点を整理する
- coverage 取得コマンドと静的 grep を結びつける
- AC-4 から AC-8 の裏取り方針を成果物へ落とし込む

## 成果物

| 成果物          | パス                                 |
| --------------- | ------------------------------------ |
| coverage report | `outputs/phase-7/coverage-report.md` |

## 参照資料

- [phase-1-requirements.md](phase-1-requirements.md) AC-4 〜 AC-9
- [phase-4-test-creation.md](phase-4-test-creation.md) TC-01 〜 TC-04
- [phase-6-test-expansion.md](phase-6-test-expansion.md) TC-E1 〜 TC-E6

## 統合テスト連携

- coverage は Phase 6 の追加ケースと連動させる
- Phase 7 の coverage 根拠は、Phase 9 で typecheck / lint / targeted test の総合判定へ接続する

## 完了条件

- [ ] filter 4 分岐のカバレッジが説明できる
- [ ] Runtime emit 経路の coverage 根拠が記録されている
- [ ] `pnpm --filter @repo/desktop test -- --coverage --run useStreamingProgress` が成果物に含まれている
- [ ] AC-4 〜 AC-8 の裏取りが coverage report に対応付けられている
