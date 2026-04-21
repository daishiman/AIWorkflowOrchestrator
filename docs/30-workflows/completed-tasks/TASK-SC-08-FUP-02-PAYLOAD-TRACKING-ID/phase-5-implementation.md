# Phase 5: 実装

## メタ情報

| 項目     | 値                                                     |
| -------- | ------------------------------------------------------ |
| Phase    | 5                                                      |
| タスクID | TASK-SC-08-FUP-02-PAYLOAD-TRACKING-ID                  |
| 前Phase  | [phase-4-test-creation.md](phase-4-test-creation.md)   |
| 次Phase  | [phase-6-test-expansion.md](phase-6-test-expansion.md) |

## 目的

Phase 2 設計と Phase 4 テストシナリオに基づき、4 ファイルの差分を順序に従って適用する実装計画を定義する。
本 task は spec-only であり、実コード変更のコミット / push は本仕様書の対象外とする。

## 対象ファイル

| 種別       | パス                                                                     |
| ---------- | ------------------------------------------------------------------------ |
| preload 型 | `apps/desktop/src/preload/skill-creator-api.ts`                          |
| Main 送信  | `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`                      |
| Runtime    | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`    |
| Renderer   | `apps/desktop/src/renderer/hooks/useStreamingProgress.ts`                |
| テスト     | `apps/desktop/src/renderer/hooks/__tests__/useStreamingProgress.test.ts` |

## 実装順序（4 ステップ）

| #   | ステップ                                       | 内容                                                                                    | AC           |
| --- | ---------------------------------------------- | --------------------------------------------------------------------------------------- | ------------ |
| 1   | 型拡張（preload）                              | `SkillCreatorProgress` に `planId?: string` / `requestId?: string` を追加               | AC-1         |
| 2   | Main `sendSkillCreatorProgress` シグネチャ     | progress 引数型を新しい `SkillCreatorProgress` に追従、`webContents.send` は現状維持    | AC-2         |
| 3   | Runtime `executeAsync` emit 経路で planId 注入 | onProgressCallback 相当の経路に planId を貫通させ、Main ipc に payload として渡す       | AC-2         |
| 4   | Renderer Hook フィルタ                         | `options?: { planId?: string }` を受け取り、受信コールバック冒頭で不一致を early return | AC-3 〜 AC-7 |

## 検証コマンド（各ステップ後に実行）

```bash
# 型確認（ステップ1/2 完了時）
pnpm --filter @repo/desktop typecheck

# 送信経路 grep（ステップ2/3 完了時）
grep -rn "sendSkillCreatorProgress" apps/desktop/src/main/

# Hook targeted test（ステップ4 完了時）
pnpm --filter @repo/desktop test -- --run useStreamingProgress

# 回帰（全ステップ完了時）
pnpm --filter @repo/desktop test -- --run skill-creator
pnpm --filter @repo/desktop lint
```

## コミット / push 方針

| 項目            | 方針                                               |
| --------------- | -------------------------------------------------- |
| コミット / push | 本 spec では発行しない（spec-only task）           |
| PR / Issue      | 実コード変更は別タスクで対応、#2300 は closed 維持 |

## 実行タスク

- 4 ステップの順序で preload / Main / Runtime / Renderer の変更を適用する
- 各ステップ後に typecheck / grep / targeted test で差分を検証する
- commit / push を行わず、差分計画とパッチ順序だけを固定する

## 成果物

| 成果物                   | パス                                          |
| ------------------------ | --------------------------------------------- |
| implementation diff plan | `outputs/phase-5/implementation-diff-plan.md` |
| patch plan               | `outputs/phase-5/patch-plan.md`               |

## 参照資料

- [phase-2-design.md](phase-2-design.md) SubAgent lane plan / 検証導線
- [phase-4-test-creation.md](phase-4-test-creation.md) TC-01 〜 TC-04
- `apps/desktop/src/preload/skill-creator-api.ts`
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`

## 統合テスト連携

- 実装後の実行系検証は Phase 6 以降で扱う
- Phase 5 は targeted test と lint/typecheck を呼び出す前提条件を整え、Phase 9 の品質ゲートに接続する

## 完了条件

- [ ] 4 ステップの順序と対象 AC が明記されている
- [ ] 各ステップに対応する検証コマンドが揃っている
- [ ] spec-only であり commit / push が発生しないことが明示されている
- [ ] Runtime ルート emit 経路に planId 貫通方針が含まれている
