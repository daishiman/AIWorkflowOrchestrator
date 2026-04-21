# Phase 4: テスト作成

## メタ情報

| 項目     | 値                                                     |
| -------- | ------------------------------------------------------ |
| Phase    | 4                                                      |
| タスクID | TASK-SC-08-FUP-02-PAYLOAD-TRACKING-ID                  |
| 前Phase  | [phase-3-design-review.md](phase-3-design-review.md)   |
| 次Phase  | [phase-5-implementation.md](phase-5-implementation.md) |

## 目的

AC-4 〜 AC-7 を満たす `useStreamingProgress` フィルタロジックの
targeted test シナリオと、型・送信シグネチャ差分を確認する grep コマンド期待値を定義する。

## テストシナリオ

| TC    | 観点                                                      | AC   | 期待挙動                                                            |
| ----- | --------------------------------------------------------- | ---- | ------------------------------------------------------------------- |
| TC-01 | filter match: `options.planId` と `progress.planId` 一致  | AC-4 | `updateProgress` が呼ばれ Zustand ストアに反映される                |
| TC-02 | filter miss: `options.planId` と `progress.planId` 不一致 | AC-5 | コールバックは早期 return し、`updateProgress` は呼ばれない         |
| TC-03 | legacy payload: `progress.planId` が undefined            | AC-6 | `options.planId` 指定有無に関わらず受け入れ、後方互換で書き込まれる |
| TC-04 | no options: `options.planId` が未指定（undefined）        | AC-7 | 全 progress を無条件に受け入れる                                    |

## 差分確認コマンド期待値

```bash
# Main 送信関数が呼ばれている全箇所を特定
grep -rn "sendSkillCreatorProgress" apps/desktop/src/main/

# SkillCreatorProgress 型参照点を全捕捉
grep -rn "SkillCreatorProgress" apps/desktop/src/
```

| コマンド                        | 期待                                                             |
| ------------------------------- | ---------------------------------------------------------------- |
| `grep sendSkillCreatorProgress` | Main ipc / Runtime Facade / SkillCreatorService の経路がヒット   |
| `grep SkillCreatorProgress`     | preload 型定義 / Main 送信型 / Renderer Hook の3点が揃って見える |

## 依存関係整合チェック【必須】

```bash
pnpm install --frozen-lockfile
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/desktop test -- --run useStreamingProgress
```

## 実行タスク

- AC-4 から AC-7 に対応する targeted test シナリオを固定する
- 差分確認コマンドの期待結果を定義する
- 既存テスト維持と依存関係整合チェックの前提を明文化する

## 成果物

| 成果物               | パス                                      |
| -------------------- | ----------------------------------------- |
| test scenarios       | `outputs/phase-4/test-scenarios.md`       |
| command expectations | `outputs/phase-4/command-expectations.md` |

## 参照資料

- [phase-1-requirements.md](phase-1-requirements.md) AC-4 / AC-5 / AC-6 / AC-7
- [phase-2-design.md](phase-2-design.md) Hook filter 擬似コード
- `apps/desktop/src/renderer/hooks/__tests__/useStreamingProgress.test.ts`

## 統合テスト連携

- Phase 4 では test design を確定する
- Phase 6 で境界値と並行ケースへ拡張し、Phase 7 で coverage に接続、Phase 9 で targeted test 実行結果と突合する

## 完了条件

- [ ] TC-01 〜 TC-04 が AC-4 〜 AC-7 に対応付けられている
- [ ] grep コマンド期待値が明記されている
- [ ] 既存テスト PASS 維持方針が明記されている（AC-8）
- [ ] 依存関係整合チェックが含まれている
