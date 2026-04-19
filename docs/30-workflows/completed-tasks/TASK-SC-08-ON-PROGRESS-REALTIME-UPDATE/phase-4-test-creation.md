# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                                                                        |
| ---------- | --------------------------------------------------------------------------- |
| Phase      | 4                                                                           |
| 機能名     | TASK-SC-08-ON-PROGRESS-REALTIME-UPDATE                                      |
| タスク名   | onProgressコールバック接続・useStreamingProgressモード別phaseマッピング拡張 |
| 前提Phase  | Phase 3                                                                     |
| 後続Phase  | Phase 5                                                                     |
| 作成日     | 2026-04-19                                                                  |
| ステータス | pending                                                                     |

## 目的

TDD Redフェーズ: テストを先に書いてFAILさせる。

`PHASE_TO_STAGE` マップにupdate/collaborative/orchestrate/improve-promptのphase名が存在しないことで、
mode別phaseが `planning` に吸収される問題を、失敗テストとして先行定義する。

## 背景

`useStreamingProgress.ts` の `PHASE_TO_STAGE` は `create` モード専用の5段階のみを定義している。
未知のphaseは `planning` にフォールバックするため、update/collaborative/orchestrateモード固有の
フェーズ名がUIに正しく反映されない。

## SubAgentチーム編成

| SubAgent   | 関心ごと                          | 主担当                                       |
| ---------- | --------------------------------- | -------------------------------------------- |
| SubAgent-A | useStreamingProgress テスト       | PHASE_TO_STAGEマッピング・フォールバック動作 |
| SubAgent-B | SkillLifecyclePanel/フック テスト | onProgressコールバック接続・アンマウント解除 |
| SubAgent-C | 統合テスト                        | モード別進捗表示・リアルタイム更新整合       |
| SubAgent-D | 統合監査                          | 矛盾・漏れ・整合・依存判定                   |

## 実行タスク

- `useStreamingProgress` の phase → stage 変換を characterization test で固定する
- onProgress 接続と cleanup を hook / component テストで固定する
- create / update / collaborative / orchestrate / improve-prompt の表示退行を統合観点で失敗テスト化する

## テスト対象ファイル

| ファイル                                                                            | 種別 | 備考                            |
| ----------------------------------------------------------------------------------- | ---- | ------------------------------- |
| `apps/desktop/src/renderer/hooks/__tests__/useStreamingProgress.test.ts`            | 既存 | モード別phaseテストケースを追加 |
| `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.test.tsx` | 新規 | onProgress接続テストを作成      |

## テストケース一覧

### SubAgent-A: useStreamingProgress マッピングテスト

#### TC-01: updateモードのphase名がplanningに吸収されないことを確認

```
テスト対象: useStreamingProgress.ts の mapPhaseToStage
入力: phase = "analyzing" (updateモード固有フェーズ)
期待値: stage = "planning" ではなく、将来定義されるupdate専用stageにマッピングされること
         または "planning" ではない何らかのstageに対応すること
RED条件: 現在は PHASE_TO_STAGE に該当エントリがなく "planning" にフォールバックするためFAIL
```

#### TC-02: collaborativeモードのphase名が正しくstageにマッピングされること

```
テスト対象: useStreamingProgress.ts の mapPhaseToStage
入力: phase = "planning" (collaborativeモードの入口フェーズ)
期待値: stage = "planning" としてマッピングされ、isGenerating = true になること
         (collaborativeモードはplanningに対応するため)
RED条件: PHASE_TO_STAGE にエントリがなく "planning" にフォールバックするため、
         意図的なマッピングかフォールバックかが区別できない → テスト仕様でFAIL
```

#### TC-03: 未知のphaseはplanningにフォールバックすること

```
テスト対象: useStreamingProgress.ts の mapPhaseToStage
入力: phase = "completely-unknown-phase"
期待値: stage = "planning" にフォールバックされること
RED条件: 現テストに明示的な「意図的フォールバック」検証がないためFAIL
```

#### TC-04: onProgressコールバックが呼ばれた時にgenerationProgressが更新されること

```
テスト対象: useStreamingProgress.ts (useEffect内のonProgress登録)
前提: skillCreatorAPI.onProgress が存在する
操作: onProgressコールバックを呼び出す
期待値:
  - updateStreamingProgress が呼ばれること
  - generationProgress.stage, percent, message が正しく更新されること
RED条件: onProgress接続の単体テストが未整備のためFAIL
```

#### TC-05: isGenerating=falseの間にonProgressが来ても無視されること

```
テスト対象: useStreamingProgress.ts
前提: stage = "idle" または "done"
操作: stage = "idle" の状態でonProgressコールバックを呼び出す
期待値: 進捗更新は実行されるが、isGenerating = false のまま
         （アンマウント後はリスナー解除済みのため到達しない）
RED条件: isGenerating状態での防御ロジックのテストが未整備のためFAIL
```

#### TC-06: コンポーネントアンマウント時にリスナーが解除されること

```
テスト対象: useStreamingProgress.ts の useEffect cleanup
操作: renderHook → unmount
期待値:
  - onProgress に渡されたクリーンアップ関数が呼ばれること
  - resetStreamingProgress が呼ばれること
RED条件: TC-06は既存テストに存在するが、mode別phase追加後の動作確認として再検証
```

### SubAgent-B: SkillLifecyclePanel / onProgress接続テスト

#### TC-07: executePlan実行中にonProgressコールバックが呼ばれること（AC-1検証）

```
テスト対象: SkillLifecyclePanel.tsx または useSkillLLMGeneration.ts の onProgress接続
前提: skillCreatorAPI.onProgress が存在する
操作: executePlan を呼び出す
期待値: onProgress に登録されたコールバックが実行される
RED条件: onProgress接続コードが未実装のためFAIL
```

#### TC-08: generationProgressがリアルタイム更新されること（AC-2検証）

```
テスト対象: generationProgressSlice + onProgress連携
操作: onProgressコールバックで { phase: "planning", percentage: 20, message: "..." } を発火
期待値: useAppStore.getState().streamingPercent === 20
RED条件: SkillLifecyclePanelとonProgress接続が未実装のためFAIL
```

### SubAgent-C: 統合テスト

#### TC-09: collaborative/orchestrate/update/improve-promptでprogress表示がcreate前提に退行しないこと（AC-5検証）

```
テスト対象: 各モードのphaseマッピング結合
入力:
  - update: "loading-skill", "analyzing", "validating"
  - collaborative: "planning"
  - orchestrate: "engine-selection"
  - improve-prompt: "improving"
期待値: 各phaseが対応するstageに正しくマッピングされ、"planning"への不正吸収がないこと
RED条件: PHASE_TO_STAGE にモード別エントリが未追加のためFAIL
```

## 実行コマンド

```bash
# useStreamingProgress テスト単体実行
pnpm --filter @repo/desktop test -- --run useStreamingProgress

# SkillLifecyclePanel テスト単体実行（ファイル作成後）
pnpm --filter @repo/desktop test -- --run SkillLifecyclePanel

# 全テスト実行
pnpm --filter @repo/desktop test -- --run
```

## 参照資料

| 参照資料                 | パス                                                                        | 説明           |
| ------------------------ | --------------------------------------------------------------------------- | -------------- |
| 要件定義書               | `docs/30-workflows/TASK-SC-08-ON-PROGRESS-REALTIME-UPDATE/outputs/phase-1/` | Phase 1 成果物 |
| アーキテクチャ設計       | `docs/30-workflows/TASK-SC-08-ON-PROGRESS-REALTIME-UPDATE/outputs/phase-2/` | Phase 2 成果物 |
| 設計レビュー結果         | `docs/30-workflows/TASK-SC-08-ON-PROGRESS-REALTIME-UPDATE/outputs/phase-3/` | Phase 3 成果物 |
| 既存テストファイル       | `apps/desktop/src/renderer/hooks/__tests__/useStreamingProgress.test.ts`    | 既存テスト     |
| useStreamingProgress実装 | `apps/desktop/src/renderer/hooks/useStreamingProgress.ts`                   | 変更対象       |
| generationProgressSlice  | `apps/desktop/src/renderer/store/slices/generationProgressSlice.ts`         | 型定義参照     |
| skill-creator-api.ts     | `apps/desktop/src/preload/skill-creator-api.ts`                             | onProgress型   |

## 実行手順

1. 参照資料（Phase 1-3成果物）を確認する。
2. SubAgent-A/B/C を並列実行し、SubAgent-D で統合判定する。
3. 既存の `useStreamingProgress.test.ts` にTC-01〜TC-06のテストケースを追加する。
4. `SkillLifecyclePanel.test.tsx` を新規作成し、TC-07〜TC-08を実装する。
5. `pnpm --filter @repo/desktop test -- --run useStreamingProgress` を実行してRED確認する。
6. 成果物を `outputs/phase-4/` に保存する。

## Red確認方法

以下のエラーパターンがテスト結果に含まれることを確認する：

```
FAIL apps/desktop/src/renderer/hooks/__tests__/useStreamingProgress.test.ts
  - TC-01: updateモードのphase名がplanningに吸収されない
    Expected: not "planning"
    Received: "planning"   ← PHASE_TO_STAGEに未登録のためフォールバック

  - TC-02: collaborativeモードのphase名が正しくstageにマッピングされる
    Expected: explicit mapping
    Received: fallback "planning"

  - TC-09: モード別phase退行なし（統合）
    Expected: mode-specific stage
    Received: "planning" (fallback)
```

## 統合テスト連携

- hook 単体テストを一次ソースとし、`SkillCreateWizard` から `GenerateStep` までの表示経路は既存実装確認で補完する
- `integration-test-plan.md` には「今回の実装変更対象は hook とテストのみ」であることを明記する
- `SkillLifecyclePanel` / `GenerateStep` は回帰確認対象として扱い、新規変更前提では扱わない

## 多角的チェック観点

| 観点     | 確認内容                                                            |
| -------- | ------------------------------------------------------------------- |
| 矛盾     | 仕様と成果物の矛盾がないか確認する                                  |
| 漏れ     | AC-1〜AC-6 の全受け入れ基準がテストケースに反映されているか確認する |
| 整合性   | PHASE_TO_STAGEマップとテストケースが一致しているか確認する          |
| 依存関係 | Phase 3設計レビューとの入力出力が整合しているか確認する             |

## 成果物

| 成果物         | パス                                       | 説明                          |
| -------------- | ------------------------------------------ | ----------------------------- |
| テスト仕様書   | `outputs/phase-4/test-specification.md`    | Redテスト仕様（TC-01〜TC-09） |
| Red結果        | `outputs/phase-4/red-test-result.md`       | 失敗結果記録                  |
| 統合テスト計画 | `outputs/phase-4/integration-test-plan.md` | モード別phase統合テスト計画   |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] TC-01〜TC-09 の全テストケースを実装
- [ ] `pnpm --filter @repo/desktop test -- --run useStreamingProgress` でRED確認
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認（AC-1〜AC-6すべてに対応するTC存在）
- [ ] 整合性が取れていることを確認
- [ ] 依存関係が取れていることを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認（Phase 1-3成果物）
2. SubAgent-A: useStreamingProgress テストケース追加（TC-01〜TC-06）
3. SubAgent-B: SkillLifecyclePanel テスト新規作成（TC-07〜TC-08）
4. SubAgent-C: 統合テスト実装（TC-09）
5. SubAgent-D の統合判定・矛盾確認
6. RED実行確認・成果物出力

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-SC-08-ON-PROGRESS-REALTIME-UPDATE
```

## 次のPhase

Phase 5: 実装
