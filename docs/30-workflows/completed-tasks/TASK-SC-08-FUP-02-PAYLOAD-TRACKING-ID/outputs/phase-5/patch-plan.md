# Phase 5 成果物: patch-plan.md

## メタ情報

| 項目     | 値                                                                                               |
| -------- | ------------------------------------------------------------------------------------------------ |
| Phase    | 5                                                                                                |
| タスクID | TASK-SC-08-FUP-02-PAYLOAD-TRACKING-ID                                                            |
| Lane     | Lane B                                                                                           |
| 目的     | 各ファイルへのパッチ順序・検証コマンド・コミット粒度案・Runtime ルート planId 貫通手順を確定する |
| 原則     | **spec-only**（コミット / push は発行しない。本書は実装タスク側への参考情報）                    |

## パッチ適用順序（AC 追跡付き）

| 順序 | パッチ          | 対象ファイル                                                             | AC      | 備考                                                |
| ---- | --------------- | ------------------------------------------------------------------------ | ------- | --------------------------------------------------- |
| P1   | 型拡張          | `apps/desktop/src/preload/skill-creator-api.ts`                          | AC-1    | `planId?` / `requestId?` をオプショナル追加         |
| P2   | Main 送信型追従 | `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`                      | AC-2    | `sendSkillCreatorProgress` 引数型を拡張型に差し替え |
| P3   | Runtime emit    | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`    | AC-2    | onProgressCallback で planId を closure から注入    |
| P4   | Renderer filter | `apps/desktop/src/renderer/hooks/useStreamingProgress.ts`                | AC-3〜7 | `options?: { planId? }` と early return ロジック    |
| P5   | テスト追加      | `apps/desktop/src/renderer/hooks/__tests__/useStreamingProgress.test.ts` | AC-4〜8 | TC-01〜TC-04 / TC-E1〜TC-E6 を段階的に追加          |
| P6   | 整合性確認      | —                                                                        | AC-9    | `typecheck` / `lint` / targeted test を一括で回す   |

順序の根拠:

- P1→P2→P3 は型の参照方向（preload → main → runtime）に一致させ、typecheck エラーを 1 ステップずつ潰せるようにする
- P4 は Renderer 側型（StreamingProgressApi）を P1 の型に合わせるため、P1 後であればどこでも適用可能
- P5 は P1〜P4 すべて完了後に固定（Arrange で新 options を使うため）

## 検証コマンド（各パッチ後）

| 段階    | コマンド                                                                                               | 期待                  |
| ------- | ------------------------------------------------------------------------------------------------------ | --------------------- |
| P1 後   | `pnpm --filter @repo/desktop typecheck`                                                                | exit 0                |
| P2 後   | `pnpm --filter @repo/desktop typecheck` / `grep -rn "sendSkillCreatorProgress" apps/desktop/src/main/` | exit 0 / 2 ヒット以上 |
| P3 後   | `pnpm --filter @repo/desktop typecheck` / Runtime 呼び出し箇所の grep 監査                             | exit 0                |
| P4 後   | `pnpm --filter @repo/desktop typecheck` / `pnpm --filter @repo/desktop lint`                           | exit 0                |
| P5 後   | `pnpm --filter @repo/desktop test -- --run useStreamingProgress`                                       | exit 0 / TC 全 PASS   |
| P6 最終 | `pnpm --filter @repo/desktop test -- --run skill-creator` / `pnpm --filter @repo/desktop lint`         | exit 0                |

## コミット粒度案（spec-only / 参考情報）

本タスクは spec-only のためコミットは発行しないが、将来の実装タスクが参照できるよう下記粒度を推奨する。

| コミット# | 粒度                                                                 | 含まれるパッチ  | 理由                                                             |
| --------- | -------------------------------------------------------------------- | --------------- | ---------------------------------------------------------------- |
| C1        | feat(preload): add optional planId/requestId to SkillCreatorProgress | P1              | 型拡張のみ。独立 revert 可能                                     |
| C2        | feat(main-ipc): forward planId on sendSkillCreatorProgress           | P2 + P3         | Main 送信型と Runtime closure 注入を同時に入れて送信経路を閉じる |
| C3        | feat(renderer): add planId filter to useStreamingProgress            | P4              | Hook filter を単独コミット化してテスト追加と分離                 |
| C4        | test(renderer): add planId filter scenarios (TC-01〜TC-04)           | P5（TC-01〜04） | 新 filter の targeted test                                       |
| C5        | test(renderer): add edge cases (TC-E1〜TC-E6)                        | P5（TC-E1〜E6） | 境界値・並行・session-restore 拡充（Phase 6 連動）               |

どのコミットも `--no-verify` を使わない（CLAUDE.md Git 操作の禁止事項準拠）。

## Runtime ルート emit 経路に planId を貫通する具体手順

### 現状の掌握（grep 根拠）

```
RuntimeSkillCreatorFacade.ts:1292: this.workflowEngine.triggerPhaseTransition(planId, "executing", 0);
RuntimeSkillCreatorFacade.ts:1305: this.workflowEngine.triggerPhaseTransition(planId, "complete", 100);
RuntimeSkillCreatorFacade.ts:1308: this.workflowEngine.triggerPhaseTransition(planId, "error", 0);
RuntimeSkillCreatorFacade.ts:1321: this.workflowEngine.triggerPhaseTransition(planId, "error", 0);
```

`executeAsync(planId, ...)` のスコープ内で planId は既に保持されている。これを progress emit 経路（`sendSkillCreatorProgress`）に貫通させる。

### 手順 1: onProgressCallback シグネチャ拡張

executeAsync 内で構築される progress callback を次のようにラップする（spec 擬似コード）。

```ts
// apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts
async executeAsync(planId: string, /* ... */): Promise<void> {
  // ...
  const onProgress: SkillCreatorProgressCallback = (progress) => {
    sendSkillCreatorProgress(this.mainWindow, {
      phase: progress.phase,
      percentage: progress.percentage,
      message: progress.message,
      planId, // closure capture
      // requestId は emit 単位で発行する場合ここで注入
    });
  };
  // ...
}
```

### 手順 2: `workflowEngine.triggerPhaseTransition` 経由のパススルー

- `triggerPhaseTransition(planId, phase, percentage)` は既に planId を受けている
- workflow snapshot の push と progress broadcast は別チャンネルだが、どちらも同じ planId を原点とする
- 下流の `onWorkflowStateSnapshot` で UI へ届く snapshot にも planId は既に含まれているため、progress 側だけ追加対応すれば並行 plan の識別が可能になる

### 手順 3: 既存 `skillCreatorHandlers.ts` `createSkill` 経路（従来ルート）

- 従来の `skillCreatorService.createSkill(validatedArgs, (progress) => { sendSkillCreatorProgress(mainWindow, progress); })`（L278-283）では planId が未定義
- 本タスクではここに planId を強制注入しない（従来ルートは planId を持たないため `undefined` で OK → AC-6 legacy payload で Renderer 側後方互換）
- 将来 createSkill ルートにも planId を導入する場合は別 Follow-up として切り出す

### 手順 4: Runtime emit 経路の静的裏取り

```bash
# Runtime 経由で sendSkillCreatorProgress が呼ばれていることを確認
grep -rn "sendSkillCreatorProgress" apps/desktop/src/main/services/

# triggerPhaseTransition の planId 貫通箇所
grep -rn "triggerPhaseTransition" apps/desktop/src/main/services/runtime/
```

期待:

- `sendSkillCreatorProgress` が Runtime Facade 内から呼ばれている、あるいは Runtime から Main handler を経由して呼ばれている呼び出しチェーンが grep で可視
- `triggerPhaseTransition` に渡される planId が `executeAsync` の第 1 引数 planId と同一であることを静的 review で確認

## 成果物スコープ（再掲）

| 項目       | 本 spec 内での扱い                                                                       |
| ---------- | ---------------------------------------------------------------------------------------- |
| 実装コード | 変更しない（outputs/ 配下のみ書き込み）                                                  |
| コミット   | 発行しない                                                                               |
| push / PR  | 実施しない（Issue #2300 は closed のまま）                                               |
| 参考情報   | 上記コミット粒度案とパッチ順序は実装タスク側が参照するためのガイドラインとして位置付ける |

## 参照

- phase-2-design.md SubAgent lane plan / 検証導線
- phase-5-implementation.md 実装順序 / 検証コマンド / spec-only 宣言
- phase-4-test-creation.md TC-01〜TC-04
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`
