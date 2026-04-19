# Phase 5: 実装

## メタ情報

| 項目       | 内容                                                                        |
| ---------- | --------------------------------------------------------------------------- |
| Phase      | 5                                                                           |
| 機能名     | TASK-SC-08-ON-PROGRESS-REALTIME-UPDATE                                      |
| タスク名   | onProgressコールバック接続・useStreamingProgressモード別phaseマッピング拡張 |
| 前提Phase  | Phase 4                                                                     |
| 後続Phase  | Phase 6                                                                     |
| 作成日     | 2026-04-19                                                                  |
| ステータス | pending                                                                     |

## 目的

Phase 4のテスト（TDD Red）をGreenにする最小実装を行う。

`PHASE_TO_STAGE` マップにupdate/collaborative/orchestrate/improve-promptのphase名を追加し、
onProgressコールバックをSkillLifecyclePanelまたはuseSkillLLMGenerationに接続することで、
リアルタイム進捗更新とUIへの動的テキスト表示を実現する。

## 背景

`useStreamingProgress.ts` の `PHASE_TO_STAGE` は `create` モード専用の5段階のみ。
未知phaseの `planning` フォールバックにより、mode別phaseがUIに正しく反映されない。
また、onProgressコールバックがSkillLifecyclePanelに未接続のため、AC-1〜AC-3が未達成。

## SubAgentチーム編成

| SubAgent   | 関心ごと                     | 主担当                                              |
| ---------- | ---------------------------- | --------------------------------------------------- |
| SubAgent-A | useStreamingProgress修正     | PHASE_TO_STAGEマップ拡張・フォールバック維持        |
| SubAgent-B | SkillLifecyclePanel接続      | onProgressコールバック接続・useEffectクリーンアップ |
| SubAgent-C | GenerateStep動的テキスト表示 | generationProgress.messageの動的表示対応            |
| SubAgent-D | 統合監査                     | 矛盾・漏れ・整合・依存判定・typecheck確認           |

## 実行タスク

- `useStreamingProgress.ts` で `loading-skill` / `analyzing` / `engine-selection` / `improving` を既存stageへ写像する
- onProgress を単一責務で接続し、cleanup と stale listener 防止を実装する
- GenerateStep の表示を stage 固定文言から progress message 優先表示へ切り替える

## 新規作成 / 修正ファイルパス一覧

| 区別     | ファイルパス                                                         | 変更内容概要                            |
| -------- | -------------------------------------------------------------------- | --------------------------------------- |
| 修正     | `apps/desktop/src/renderer/hooks/useStreamingProgress.ts`            | PHASE_TO_STAGEマップにモード別phase追加 |
| 修正     | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` | onProgressコールバック接続              |
| 修正     | `apps/desktop/src/renderer/components/skill/wizard/GenerateStep.tsx` | generationProgress.messageの動的表示    |
| 確認のみ | `apps/desktop/src/renderer/store/slices/generationProgressSlice.ts`  | stage型拡張が必要か確認                 |
| 確認のみ | `apps/desktop/src/preload/skill-creator-api.ts`                      | onProgress型確認（変更不要の見込み）    |

## 実装計画テーブル

| ファイル                     | 変更種別 | 変更概要                                                                                                                                                                  |
| ---------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `useStreamingProgress.ts`    | 修正     | `PHASE_TO_STAGE` マップに `loading-skill` / `analyzing` / `engine-selection` / `improving` を追加し、既存stageへ写像する                                                  |
| `SkillLifecyclePanel.tsx`    | 修正     | `useEffect` 内で `skillCreatorAPI.onProgress` に接続し、返却されるクリーンアップ関数を `return` で解除する（P5対策）。`isGenerating` フラグと連動させ生成中のみ受信する。 |
| `GenerateStep.tsx`           | 修正     | `generationProgress` propまたはストアから取得した `streamingMessage` を用いて、ステージ固定ラベルではなくリアルタイムメッセージを動的表示する。                           |
| `generationProgressSlice.ts` | 確認     | `StreamingGenerationStage` 型にupdate/collaborative専用stageが必要か確認する。現状の型で十分であれば変更なし。                                                            |
| `skill-creator-api.ts`       | 確認     | `SkillCreatorProgress.phase: string` の型定義が既存のまま使用可能か確認する。変更不要の見込み。                                                                           |

## 実装手順

### 手順1: useStreamingProgress.ts — PHASE_TO_STAGEマップ拡張

`PHASE_TO_STAGE` に以下のエントリを追加する：

```typescript
"loading-skill": "planning",
"analyzing": "planning",
"engine-selection": "planning",
"improving": "generating-skill",
```

フォールバック動作（未知phase → `"planning"`）は維持する。

### 手順2: SkillLifecyclePanel.tsx — onProgressコールバック接続

`skillCreatorAPI` の `onProgress` を `useEffect` 内で接続する：

```typescript
useEffect(() => {
  const api = (window as Window & { skillCreatorAPI?: StreamingProgressApi })
    .skillCreatorAPI;
  if (!api?.onProgress) return;

  // P5対策: クリーンアップ関数を保持して返却
  const cleanup = api.onProgress((progress) => {
    // generationProgressスライスへ反映
    updateStreamingProgress({
      stage: mapPhaseToStage(progress.phase),
      percent: progress.percentage,
      message: progress.message,
    });
  });

  return () => {
    cleanup();
  };
}, [updateStreamingProgress]);
```

重複接続を防ぐため、`useStreamingProgress` Hook との役割分担を確認する。
`useStreamingProgress` 側で既に接続している場合は、SkillLifecyclePanel への追加接続を省略する。

### 手順3: GenerateStep.tsx — 動的テキスト表示

現在の固定ラベル (`STAGE_LABELS`) に加え、`message` propが存在する場合はそちらを優先表示する：

```typescript
// 既存の固定ラベルよりmessage propを優先
const currentMessage =
  message || generationProgress || STAGE_LABELS[stage] || "";
```

`message` propには `streamingMessage`（ストア値）を渡すよう呼び出し元を確認・修正する。

### 手順4: generationProgressSlice.ts — 型確認

`StreamingGenerationStage` 型にupdate/collaborative専用のstageが必要か検討する。
現状の型（`idle | planning | generating-skill | generating-agents | validating | done | error | cancelled`）で
全モードのフェーズをカバーできる場合は変更不要。
追加stageが必要と判断した場合のみ型を拡張し、AC-6（typecheck PASS）を維持する。

### 手順5: 実装後の確認

実装完了後、以下を順番に実行して全検証をPASSさせる：

```bash
# TypeScript型チェック（AC-6）
pnpm --filter @repo/desktop typecheck

# 関連テスト実行（TC-01〜TC-09がGreenになること）
pnpm --filter @repo/desktop test -- --run useStreamingProgress
pnpm --filter @repo/desktop test -- --run SkillLifecyclePanel

# 全テスト実行（リグレッションなし確認）
pnpm --filter @repo/desktop test -- --run
```

## P5対策（useEffect cleanupでsafeOnリスナー解除の方針）

- `onProgress` の戻り値（クリーンアップ関数）を `useEffect` の `return` で必ず呼び出す。
- コンポーネントアンマウント時またはdependency変更時に自動的にリスナーが解除されることを保証する。
- `useStreamingProgress` Hook に既に実装済みのP5対策コードを参考にする。
- SkillLifecyclePanelで独自に接続する場合は同様のパターンを踏襲する。

```typescript
// P5対策パターン（参考: useStreamingProgress.ts 現実装）
useEffect(
  () => {
    const api = getSkillCreatorApi();
    if (!api?.onProgress) return;

    const cleanup = api.onProgress((progress) => {
      /* ... */
    });

    return () => {
      cleanup(); // リスナー解除
      resetProgress(); // ストアリセット（必要な場合）
    };
  },
  [
    /* 依存配列 */
  ],
);
```

## 実装後の確認コマンド

```bash
# 型チェック（AC-6: pnpm typecheck PASSが必須）
pnpm --filter @repo/desktop typecheck

# useStreamingProgress テスト（TC-01〜TC-06 Green確認）
pnpm --filter @repo/desktop test -- --run useStreamingProgress

# SkillLifecyclePanel テスト（TC-07〜TC-08 Green確認）
pnpm --filter @repo/desktop test -- --run SkillLifecyclePanel

# 統合テスト（TC-09 Green確認）
pnpm --filter @repo/desktop test -- --run

# Lintチェック
pnpm --filter @repo/desktop lint
```

## 統合テスト連携

- 実装変更は `useStreamingProgress.ts` とそのテストへ限定し、`SkillCreateWizard` / `GenerateStep` は既存接続の確認対象として扱う
- `useStreamingProgress.test.ts` の実測値を Phase 6〜10 の品質ゲートへ引き継ぐ
- UI コンポーネントの見た目変更は行わないため、Phase 11 では NON_VISUAL 判定の根拠としてこの実装境界を参照する

## 参照資料

| 参照資料                 | パス                                                                                                | 説明           |
| ------------------------ | --------------------------------------------------------------------------------------------------- | -------------- |
| テスト仕様書             | `docs/30-workflows/TASK-SC-08-ON-PROGRESS-REALTIME-UPDATE/outputs/phase-4/test-specification.md`    | Phase 4 成果物 |
| Red結果                  | `docs/30-workflows/TASK-SC-08-ON-PROGRESS-REALTIME-UPDATE/outputs/phase-4/red-test-result.md`       | Phase 4 成果物 |
| 統合テスト計画           | `docs/30-workflows/TASK-SC-08-ON-PROGRESS-REALTIME-UPDATE/outputs/phase-4/integration-test-plan.md` | Phase 4 成果物 |
| useStreamingProgress実装 | `apps/desktop/src/renderer/hooks/useStreamingProgress.ts`                                           | 変更対象       |
| 既存テストファイル       | `apps/desktop/src/renderer/hooks/__tests__/useStreamingProgress.test.ts`                            | テスト参照     |
| SkillLifecyclePanel      | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                                | 変更対象       |
| GenerateStep             | `apps/desktop/src/renderer/components/skill/wizard/GenerateStep.tsx`                                | 変更対象       |
| generationProgressSlice  | `apps/desktop/src/renderer/store/slices/generationProgressSlice.ts`                                 | 型確認         |
| skill-creator-api.ts     | `apps/desktop/src/preload/skill-creator-api.ts`                                                     | 型確認         |

## 多角的チェック観点

| 観点     | 確認内容                                                              |
| -------- | --------------------------------------------------------------------- |
| 矛盾     | PHASE_TO_STAGEマップと受け入れ基準の矛盾がないか確認する              |
| 漏れ     | AC-1〜AC-6の全受け入れ基準が実装に反映されているか確認する            |
| 整合性   | useStreamingProgress / SkillLifecyclePanel の二重接続がないか確認する |
| 依存関係 | Phase 4テスト仕様との入力出力が整合しているか確認する                 |

## 成果物

| 成果物           | パス                                        | 説明                             |
| ---------------- | ------------------------------------------- | -------------------------------- |
| 実装サマリー     | `outputs/phase-5/implementation-summary.md` | 実装計画と差分要約               |
| 変更ファイル一覧 | `outputs/phase-5/changed-files.md`          | 変更対象ファイルと差分概要       |
| 契約差分         | `outputs/phase-5/contract-diff.md`          | PHASE_TO_STAGE変更前後の差分記録 |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] `pnpm --filter @repo/desktop typecheck` がPASS（AC-6）
- [ ] Phase 4の全テストケース（TC-01〜TC-09）がGreenになること
- [ ] `pnpm --filter @repo/desktop test -- --run` でリグレッションなし
- [ ] AC-1〜AC-6の全受け入れ基準を満たしていること
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 整合性が取れていることを確認
- [ ] 依存関係が取れていることを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認（Phase 4成果物）
2. SubAgent-A: useStreamingProgress.ts PHASE_TO_STAGEマップ拡張
3. SubAgent-B: SkillLifecyclePanel.tsx onProgressコールバック接続
4. SubAgent-C: GenerateStep.tsx 動的テキスト表示対応
5. SubAgent-D: 型確認（generationProgressSlice.ts, skill-creator-api.ts）
6. SubAgent-D の統合判定・typecheckとテスト実行確認
7. 成果物出力

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-SC-08-ON-PROGRESS-REALTIME-UPDATE
```

## 次のPhase

Phase 6: テスト拡充
