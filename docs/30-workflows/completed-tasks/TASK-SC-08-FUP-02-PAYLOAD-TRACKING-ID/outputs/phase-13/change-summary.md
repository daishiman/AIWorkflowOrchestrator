# Phase 13: change summary（**draft / 実コード未導入**）

## メタ情報

| 項目       | 値                                                         |
| ---------- | ---------------------------------------------------------- |
| Phase      | 13                                                         |
| タスクID   | TASK-SC-08-FUP-02-PAYLOAD-TRACKING-ID                      |
| タスク種別 | NON_VISUAL code task                                       |
| Task       | 13-2                                                       |
| ステータス | **draft**（spec レベル要約。実コード導入時に実差分で更新） |

## 変更対象 4 ファイル（spec レベル差分要約）

### 1. `apps/desktop/src/preload/skill-creator-api.ts`

| 観点     | 内容                                                                                                |
| -------- | --------------------------------------------------------------------------------------------------- |
| 種別     | 型定義拡張                                                                                          |
| 差分要旨 | `SkillCreatorProgress` interface に `planId?: string` / `requestId?: string` を optional として追加 |
| 関連 AC  | AC-1                                                                                                |
| 後方互換 | optional のため既存呼び出し元は無変更                                                               |
| 想定行数 | +2 行（コメント含め +4 行程度）                                                                     |

### 2. `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`

| 観点     | 内容                                                                                                                                                                 |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 種別     | 送信関数シグネチャ拡張 + 呼び出し元経路の planId 貫通                                                                                                                |
| 差分要旨 | `sendSkillCreatorProgress(mainWindow, progress)` の `progress` 型に `planId?` / `requestId?` を受け入れ、`createSkill` progress コールバック経由で planId を貫通する |
| 関連 AC  | AC-2                                                                                                                                                                 |
| 後方互換 | progress 型の変更は optional フィールドのみ。既存 `webContents.send` の payload に planId を追加しても、listener 側が無視すれば破壊されない                          |
| 想定行数 | +3〜5 行（型のみなら +2 行、呼び出し元の planId 伝播込みで +3〜5 行）                                                                                                |

### 3. `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`

| 観点     | 内容                                                                                                                                                                                                                  |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 種別     | Runtime 経路の progress emit に planId 付与（該当 emit 経路が存在する場合）                                                                                                                                           |
| 差分要旨 | NV-03 で洗い出した emit 経路で `sendSkillCreatorProgress` に planId を渡す。現状 `RuntimeSkillCreatorFacade.ts` は workflow state snapshot 経由が主で直接 emit は限定的。必要に応じて planId を emit context に載せる |
| 関連 AC  | AC-2                                                                                                                                                                                                                  |
| 後方互換 | optional のため既存スナップショット consumer に影響なし                                                                                                                                                               |
| 想定行数 | 0〜数行（直接 emit 経路が無ければ実質変更なし。NV-03 結果次第）                                                                                                                                                       |

### 4. `apps/desktop/src/renderer/hooks/useStreamingProgress.ts`

| 観点     | 内容                                                                                                                                                                                              |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 種別     | Hook シグネチャ拡張 + 受信 filter 実装                                                                                                                                                            |
| 差分要旨 | `UseStreamingProgressOptions { planId?: string }` を新設し、`useStreamingProgress(options?)` として受け取る。`onProgress` コールバック内で `options.planId` と `progress.planId` の一致判定を追加 |
| 関連 AC  | AC-3 / AC-4 / AC-5 / AC-6 / AC-7                                                                                                                                                                  |
| 後方互換 | `options` 未指定時は全通知を受け入れ既存挙動維持。useEffect 依存配列に `options?.planId` を追加し planId 変更時に再購読                                                                           |
| 想定行数 | +8〜12 行（filter 条件 + 型 + 依存配列 + JSDoc）                                                                                                                                                  |

## 新規テストシナリオ 4 件（追加先: `apps/desktop/src/renderer/hooks/__tests__/useStreamingProgress.test.ts`）

| #   | シナリオ   | 入力                                                                   | 期待結果                        | 関連 AC |
| --- | ---------- | ---------------------------------------------------------------------- | ------------------------------- | ------- |
| 1   | match      | `options={ planId: "P1" }` / progress={ planId: "P1", ... }            | Zustand store 更新 / stage 反映 | AC-4    |
| 2   | miss       | `options={ planId: "P1" }` / progress={ planId: "P2", ... }            | store 未更新 / skip             | AC-5    |
| 3   | legacy     | `options={ planId: "P1" }` / progress={ ... /_ planId 未設定 _/ }      | 後方互換で store 更新           | AC-6    |
| 4   | no-options | `options` 未指定 / progress={ planId: "P1", ... } および planId 未設定 | 全通知を store 更新             | AC-7    |

既存テストは全て維持し AC-8（既存全 PASS）を担保する。

## AC-1〜AC-9 充足計画

| AC   | 充足方法                                                              | 参照 artifact                                                                                  |
| ---- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| AC-1 | 型定義に `planId?` / `requestId?` 追加                                | `outputs/phase-5/implementation-diff-plan.md` / `outputs/phase-5/patch-plan.md`（Lane B 予定） |
| AC-2 | `sendSkillCreatorProgress` 送信経路に planId 付与                     | 同上 + `outputs/phase-11/manual-test-result.md` NV-02 / NV-03                                  |
| AC-3 | `useStreamingProgress` に `options.planId` フィルタ実装               | 同上                                                                                           |
| AC-4 | vitest match シナリオ                                                 | `outputs/phase-4/test-scenarios.md` / `outputs/phase-7/coverage-report.md`                     |
| AC-5 | vitest miss シナリオ                                                  | 同上                                                                                           |
| AC-6 | vitest legacy シナリオ                                                | 同上                                                                                           |
| AC-7 | vitest no-options シナリオ                                            | 同上                                                                                           |
| AC-8 | 既存 `useStreamingProgress` テスト維持                                | `outputs/phase-11/manual-test-result.md` NV-05                                                 |
| AC-9 | `pnpm --filter @repo/desktop typecheck` / `lint` / targeted test PASS | `outputs/phase-13/local-check-result.md`（承認後に実行結果記入）                               |

## コミット粒度（Phase 5 設計と整合）

spec-only task の範囲外だが、実コード導入時は以下粒度を想定:

1. 型定義追加（preload）
2. Main 送信経路の planId 貫通（ipc + runtime facade）
3. Hook filter 実装 + テスト追加

各コミットで関連 AC を明示する。

## 参照

- `phase-13-pr-creation.md` Task 13-2
- `phase-1-requirements.md` AC-1〜AC-9
- `outputs/phase-12/implementation-guide.md`
- `outputs/phase-11/manual-test-result.md`
