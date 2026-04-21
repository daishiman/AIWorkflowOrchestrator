# Phase 2: 設計

## メタ情報

| 項目     | 値                                                   |
| -------- | ---------------------------------------------------- |
| Phase    | 2                                                    |
| タスクID | TASK-SC-08-FUP-02-PAYLOAD-TRACKING-ID                |
| 前Phase  | [phase-1-requirements.md](phase-1-requirements.md)   |
| 次Phase  | [phase-3-design-review.md](phase-3-design-review.md) |

## 目的

Phase 1 の AC-1 〜 AC-9 を満たす型・関数・Hook・テストの変更設計を確定し、
SubAgent lane 分割と検証導線を定義する。

## 設計方針

| 観点           | 方針                                                                                          |
| -------------- | --------------------------------------------------------------------------------------------- |
| 後方互換       | `planId` / `requestId` / `options.planId` すべてオプショナル。既存呼び出し無変更で動作する    |
| フィルタ論理   | `options.planId !== undefined && progress.planId !== undefined && 値が不一致` のみスキップ    |
| Runtime ルート | `executeAsync` で progress を emit する箇所に planId を貫通（必要なら callback 注入を設計）   |
| 破壊禁止       | progress チャンネルの多重化は行わない（payload メタデータ戦略）                               |
| テスト方針     | 既存テストは PASS を維持。新規 4 シナリオ（match / miss / legacy payload / no options）を追加 |

## 変更対象ファイル設計

| #   | ファイル                                                              | 変更内容                                                                        |
| --- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| 1   | `apps/desktop/src/preload/skill-creator-api.ts`                       | `SkillCreatorProgress` に `planId?: string` / `requestId?: string` を追加       |
| 2   | `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`                   | `sendSkillCreatorProgress` の progress 引数型に `planId?` / `requestId?` を追加 |
| 3   | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | progress emit 経路に planId 注入（onProgressCallback シグネチャ見直しを含む）   |
| 4   | `apps/desktop/src/renderer/hooks/useStreamingProgress.ts`             | `options?: { planId?: string }` を追加し、受信コールバック先頭で filter 分岐    |

## SubAgent lane plan

| Lane | 対象                                              | 出力              | 実行形態                 |
| ---- | ------------------------------------------------- | ----------------- | ------------------------ |
| A    | preload 型 + Main 送信関数シグネチャ              | 型差分提案        | 並列                     |
| B    | Runtime ルート emit 経路調査 + callback 設計      | emit path 決定書  | 直列（A の型提案に依存） |
| C    | Renderer Hook フィルタ + useEffect 依存配列最適化 | filter 擬似コード | 並列                     |
| D    | テスト追加設計（4 シナリオ + 既存 PASS 維持）     | test matrix       | 直列（A/B/C 合意後）     |

## 検証導線

1. 型変更（Lane A）→ `pnpm --filter @repo/desktop typecheck`
2. Main 送信シグネチャ（Lane A）→ `grep -rn "sendSkillCreatorProgress" apps/desktop/src/main/`
3. Runtime emit 経路（Lane B）→ `executeAsync` / `onWorkflowStateSnapshot` の呼び出し元全捕捉
4. Hook フィルタ（Lane C）→ `pnpm --filter @repo/desktop test -- --run useStreamingProgress`
5. 全体回帰（Lane D）→ `pnpm --filter @repo/desktop test -- --run skill-creator`

## 依存関係整合

| 依存           | 理由                                                         |
| -------------- | ------------------------------------------------------------ |
| Phase 1 → 2    | AC 群が Phase 2 の設計範囲決定の入力                         |
| Phase 2 → 3    | 30思考法レビューで設計妥当性と MAJOR / MINOR 差し戻しを判定  |
| Lane A → B     | 型変更が確定しないと Runtime callback シグネチャが決まらない |
| Lane A/B/C → D | test matrix は 3 lane の合意後にしか固定できない             |

## 擬似コード（設計イメージ）

### Hook filter 擬似コード

```typescript
const cleanup = api.onProgress((progress) => {
  if (
    options?.planId !== undefined &&
    progress.planId !== undefined &&
    progress.planId !== options.planId
  ) {
    return; // filter out
  }

  if (progress.phase === "error") {
    handleError(progress);
    return;
  }

  updateProgress({
    stage: mapPhaseToStage(progress.phase),
    percent: progress.percentage,
    message: progress.message,
  });
});
```

## 実行タスク

- preload / Main / Runtime / Renderer の 4 変更点を設計に落とし込む
- SubAgent lane の並列・直列境界を定義する
- Hook filter の後方互換ロジックを擬似コード化する
- Phase 4 以降の検証導線をコマンド単位で固定する

## 成果物

| 成果物             | パス                                    |
| ------------------ | --------------------------------------- |
| solution design    | `outputs/phase-2/solution-design.md`    |
| subagent lane plan | `outputs/phase-2/subagent-lane-plan.md` |
| validation path    | `outputs/phase-2/validation-path.md`    |

## 参照資料

### システム仕様（aiworkflow-requirements）

| 参照資料      | パス                                                                                       | 内容                                                |
| ------------- | ------------------------------------------------------------------------------------------ | --------------------------------------------------- |
| IPC 契約      | `.claude/skills/aiworkflow-requirements/references/api-ipc-system-skill-creator.md`        | broadcast channel payload と Skill Creator IPC 契約 |
| Hook 設計原則 | `.claude/skills/aiworkflow-requirements/references/arch-state-management-skill-creator.md` | Hook / store / progress 受信の責務境界              |

## 統合テスト連携

- Phase 2 自体では統合テストを実行しない
- ここで定義した検証導線を Phase 4 の targeted test、Phase 6 の拡張ケース、Phase 7 の coverage、Phase 9 の品質ゲートへ引き渡す

## 完了条件

- [ ] 4 ファイル変更範囲と責務境界が明記されている
- [ ] Lane A/B/C/D の並列 / 直列関係が定義されている
- [ ] Hook filter 擬似コードが記述されている
- [ ] Runtime ルート emit 経路調査の方針が記録されている
- [ ] 検証導線 5 ステップが定義されている
