# Phase 9: 品質保証

## メタ情報

| 項目   | 値                                    |
| ------ | ------------------------------------- |
| Phase  | 9                                     |
| 機能名 | workflow-engine-runtime-orchestration |
| 作成日 | 2026-03-26                            |

## 目的

実行状態 owner、phase 決定権、成果物 owner、public contract の整合が曖昧でないことを確認する。

## 実行タスク

- facade / engine / renderer state の owner を再点検する
- phase 遷移と route 分岐の authority を確認する
- verify / improve / resume の責務交差を確認する
- public IPC / preload / shared types の parity を確認する

## 参照資料

| 資料名             | パス                                  | 説明           |
| ------------------ | ------------------------------------- | -------------- |
| Phase 5 実装計画   | `phase-5-implementation.md`           | 実装対象       |
| Phase 7 カバレッジ | `phase-7-coverage-check.md`           | coverage 観点  |
| ownership matrix   | `outputs/phase-2/ownership-matrix.md` | owner 判定基準 |

### システム仕様（aiworkflow-requirements）

| 参照資料                   | パス                                                                                                            | 内容                     |
| -------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------ |
| Runtime public IPC 契約    | `.agents/skills/aiworkflow-requirements/references/api-ipc-system-core.md`                                      | public surface の正本    |
| RuntimePolicyResolver 契約 | `.agents/skills/aiworkflow-requirements/references/arch-electron-services-details-part2.md`                     | route / handoff baseline |
| lesson                     | `.agents/skills/aiworkflow-requirements/references/lessons-learned-auth-ipc-skill-creator-sync-auth-timeout.md` | IPC drift 防止の教訓     |

## 実行手順

### ステップ1: owner ambiguity を洗う

- `currentPhase` / `awaitingUserInput` / `resumeTokenEnvelope` / `verifyResult` の owner が複数書かれていないかを確認する。

### ステップ2: public contract parity を洗う

- `creatorHandlers.ts` / `skill-creator-api.ts` / `skillCreator.ts` の response shape が一致しているかを確認する。
- graceful degradation が `No handler registered` へ落ちないかを確認する。

### ステップ3: governance と session 前提の境界を洗う

- route baseline は Task02 で固定し、governance hardening は Task07 へ、compatibility semantics は Task08 へ渡せているかを確認する。

## 統合テスト連携

- Phase 4 と Phase 6 の suite を再実行し、owner / route / contract の regressions がないことを確認する。
- `validate-phase-output` と `verify-all-specs` を実行し、phase 間参照と構造整合を確認する。

## 成果物

| 成果物   | パス                           | 説明          |
| -------- | ------------------------------ | ------------- |
| 品質保証 | `phase-9-quality-assurance.md` | QA 観点の本文 |

## 完了条件

- [ ] owner ambiguity がない
- [ ] facade / engine / renderer の責務境界が明確である
- [ ] public IPC / preload / shared types の parity が明記されている
- [ ] SDK 権限制御 / session 前提とのズレがない
- [ ] **本Phase内の全タスクを100%実行完了**
