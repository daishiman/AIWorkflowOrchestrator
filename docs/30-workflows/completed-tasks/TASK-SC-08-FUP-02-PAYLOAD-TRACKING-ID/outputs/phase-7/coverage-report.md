# Phase 7 成果物: coverage-report.md

## メタ情報

| 項目     | 値                                                                                            |
| -------- | --------------------------------------------------------------------------------------------- |
| Phase    | 7                                                                                             |
| タスクID | TASK-SC-08-FUP-02-PAYLOAD-TRACKING-ID                                                         |
| Lane     | Lane B                                                                                        |
| 目的     | filter 4 分岐 / Runtime emit path / Main 送信経路の coverage 期待値を固定し AC の裏取りを作る |
| 原則     | spec-only（実行結果 artifact は実装タスク側で取得）                                           |

## 1. filter 4 分岐のカバレッジ期待値

対象: `apps/desktop/src/renderer/hooks/useStreamingProgress.ts` の planId filter ブロック。

```ts
if (
  options?.planId !== undefined &&
  progress.planId !== undefined &&
  progress.planId !== options.planId
) {
  return; // miss
}
```

| 分岐 ID       | 条件                                                | AC   | covered by    | 期待行カバレッジ  |
| ------------- | --------------------------------------------------- | ---- | ------------- | ----------------- |
| B1 match      | options/progress 両方定義され値が一致               | AC-4 | TC-01 / TC-E3 | 受理パスを通過    |
| B2 miss       | options/progress 両方定義され値が不一致             | AC-5 | TC-02 / TC-E4 | early return 通過 |
| B3 legacy     | `progress.planId === undefined`（options は定義可） | AC-6 | TC-03 / TC-E5 | 受理パスを通過    |
| B4 no options | `options?.planId === undefined`                     | AC-7 | TC-04 / TC-E6 | 受理パスを通過    |

### 期待カバレッジ指標

| メトリクス | 期待値                                                                     |
| ---------- | -------------------------------------------------------------------------- |
| statements | 100%（filter ブロック 1 行と return 1 行を両方通過）                       |
| branches   | 100%（3 つの AND 条件 × 2 真偽 = 8 の組み合わせのうち 4 代表を TC で通過） |
| functions  | 100%（onProgress callback 全体を invoke）                                  |
| lines      | 100%（filter ブロック全行）                                                |

### 境界値追加観点

| 観点            | 補足                                                        |
| --------------- | ----------------------------------------------------------- |
| `""` 空文字列   | TC-E1 で `""` を undefined 扱いしないことを分岐レベルで保証 |
| planId 動的変更 | TC-E2 で useEffect 再 subscribe 経路をカバー                |

## 2. Runtime emit path / Main 送信経路の grep ベース可視化計画

本 task は Main / Runtime の coverage（branch / function）を直接取らず、grep で静的にチェーンを可視化する方針を取る（NON_VISUAL code task 代替証跡 / phase-11 方針と整合）。

### 2.1 Main 送信経路

```bash
grep -rn "sendSkillCreatorProgress" apps/desktop/src/main/
```

期待 artifact:

| ファイル                                                                      | ヒット種別          | 目的                                                                 |
| ----------------------------------------------------------------------------- | ------------------- | -------------------------------------------------------------------- |
| `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`                           | 定義 + 呼び出し     | `sendSkillCreatorProgress` の唯一の実装点と createSkill 経路呼び出し |
| `apps/desktop/src/main/ipc/__tests__/skillCreatorIpc.integration.test.ts`     | import + 呼び出し群 | integration test 経路                                                |
| `apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.validation.test.ts` | import + describe   | validation test 経路                                                 |
| `apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.progress.test.ts`   | コメント + 呼び出し | progress 専用テスト経路                                              |

判定: prod 2 ヒット未満 = 送信経路消失による後退（gate fail）。

### 2.2 Runtime emit path

```bash
grep -rn "triggerPhaseTransition" apps/desktop/src/main/services/runtime/
grep -rn "sendSkillCreatorProgress" apps/desktop/src/main/services/
```

期待 artifact:

| ファイル                                                              | 出現                                                                                                              |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | `triggerPhaseTransition(planId, "executing", 0)` 等、planId を第一引数に取る呼び出しが複数箇所                    |
| `apps/desktop/src/main/services/runtime/`                             | Runtime から Main handler への progress 経路。`sendSkillCreatorProgress` 呼び出しがあれば planId 貫通の静的確認可 |

### 2.3 型参照マップ（3 点裏取り）

```bash
grep -rn "SkillCreatorProgress" apps/desktop/src/
```

期待: preload 型定義 1 / Main 送信 1 / Renderer Hook 1 の 3 系統でヒット。いずれか 0 ヒット = 型伝播後退。

## 3. 実行コマンド一覧

```bash
# Hook 単体カバレッジ（AC-4〜AC-8 の主戦場）
pnpm --filter @repo/desktop test -- --coverage --run useStreamingProgress

# skill-creator 全体回帰（AC-8 / 既存 PASS 維持）
pnpm --filter @repo/desktop test -- --run skill-creator

# 静的送信経路
grep -rn "sendSkillCreatorProgress" apps/desktop/src/main/
grep -rn "SkillCreatorProgress" apps/desktop/src/

# Runtime 貫通
grep -rn "triggerPhaseTransition" apps/desktop/src/main/services/runtime/
```

期待:

| コマンド                                                                    | 終了コード / 期待                                    |
| --------------------------------------------------------------------------- | ---------------------------------------------------- |
| `pnpm --filter @repo/desktop test -- --coverage --run useStreamingProgress` | 0 / `useStreamingProgress.ts` 行カバレッジ 100%      |
| `pnpm --filter @repo/desktop test -- --run skill-creator`                   | 0 / 既存テスト全 PASS                                |
| `grep -rn "sendSkillCreatorProgress" apps/desktop/src/main/`                | prod 2 ヒット以上 + テスト群                         |
| `grep -rn "SkillCreatorProgress" apps/desktop/src/`                         | preload / Main / Renderer の 3 系統すべてでヒット    |
| `grep -rn "triggerPhaseTransition" apps/desktop/src/main/services/runtime/` | 4 ヒット以上（既存 executing / complete / error x2） |

## 4. AC-4〜AC-8 との裏取り表

| AC   | 裏取り方法                                | 具体 artifact                                                                                    |
| ---- | ----------------------------------------- | ------------------------------------------------------------------------------------------------ |
| AC-4 | filter match 分岐 coverage + TC-01        | `useStreamingProgress.ts` カバレッジ report の B1 分岐                                           |
| AC-5 | filter miss 分岐 coverage + TC-02 / TC-E4 | `useStreamingProgress.ts` カバレッジ report の B2 分岐 / 並行 Hook test                          |
| AC-6 | legacy payload 受理 + TC-03 / TC-E5       | B3 分岐を通過し `updateProgress` 実行                                                            |
| AC-7 | no options 受理 + TC-04 / TC-E6           | B4 分岐を通過し全 emit が受理                                                                    |
| AC-8 | 既存テスト回帰                            | `pnpm --filter @repo/desktop test -- --run useStreamingProgress` / `--run skill-creator` 全 PASS |

## 5. spec-only 宣言

| 項目          | 扱い                                                                        |
| ------------- | --------------------------------------------------------------------------- |
| 実行 artifact | 本 spec では期待値のみ記述。実測 coverage report は実装タスク側で取得       |
| コード変更    | 本 spec では行わない                                                        |
| 失敗時の扱い  | AC-4〜AC-8 の裏取り表に一点でも gap が生じたら Phase 7 gate fail として扱う |

## 参照

- phase-7-coverage.md coverage 観点 / 期待値
- phase-1-requirements.md AC-4 〜 AC-9
- phase-4 test-scenarios.md TC-01〜TC-04
- phase-6 regression-expansion-plan.md TC-E1〜TC-E6
- `apps/desktop/src/renderer/hooks/useStreamingProgress.ts`
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`
