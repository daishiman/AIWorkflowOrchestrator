# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                                                                        |
| ---------- | --------------------------------------------------------------------------- |
| Phase      | 6                                                                           |
| 機能名     | TASK-SC-08-ON-PROGRESS-REALTIME-UPDATE                                      |
| タスク名   | onProgressコールバック接続・useStreamingProgressモード別phaseマッピング拡張 |
| 前提Phase  | Phase 5                                                                     |
| 後続Phase  | Phase 7                                                                     |
| 作成日     | 2026-04-19                                                                  |
| ステータス | pending                                                                     |

## 目的

フェイルパス・回帰ガード・補助コマンドを追加し、onProgress接続とphaseマッピング拡張の品質境界を強化する。

## 背景

Phase 5 の実装で `onProgress` IPC接続と `useStreamingProgress.ts` のモード別 `PHASE_TO_STAGE` 拡張が完了した。
しかし P5 問題（リスナー二重登録）対策の動作確認、アンマウント後の状態汚染防止、
全モード（create/collaborative/update/orchestrate/improve-prompt）での退行確認など、
Phase 4/5 では網羅しきれなかった境界ケースが残存している。
本 Phase ではこれらのフェイルパスと回帰ガードを追加テストとして設計・実行する。

## SubAgentチーム編成

| SubAgent   | 関心ごと        | 主担当                             |
| ---------- | --------------- | ---------------------------------- |
| SubAgent-A | Main/IPC責務    | onProgress IPC配線・ライフサイクル |
| SubAgent-B | Preload/API契約 | SkillCreatorAPI型契約・公開境界    |
| SubAgent-C | Renderer/UX契約 | phaseマッピング・表示整合          |
| SubAgent-D | 統合監査        | 矛盾・漏れ・整合・依存判定         |

## 実行タスク

- フェイルパス追加: onProgressリスナー二重登録防止（P5対策）の動作確認ケースを追加する
- 境界ケース追加: アンマウント後の状態汚染防止を検証するケースを追加する
- 回帰ガード追加: create以外の全モードで退行が発生しないことを確認する回帰ケースを追加する
- Store整合追加: `percentage` と `message` がSliceに正しく反映されることを検証するケースを追加する
- エラー系追加: error状態のフォールバック動作を検証するケースを追加する

## 追加テストケース

### TC-07: onProgressリスナー二重登録防止（P5対策）の確認

| 項目     | 内容                                                                                                                             |
| -------- | -------------------------------------------------------------------------------------------------------------------------------- |
| ID       | TC-07                                                                                                                            |
| 区分     | ユニット                                                                                                                         |
| 対象     | `SkillLifecyclePanel.tsx` または `useSkillLLMGeneration.ts`                                                                      |
| 前提条件 | `isGenerating` が `true` → `false` → `true` と遷移する                                                                           |
| 手順     | 1. `isGenerating=true` でリスナーを登録する / 2. `isGenerating=false` でリスナーを解除する / 3. `isGenerating=true` で再登録する |
| 期待値   | `onProgress` コールバックが1回しか登録されていないこと。リスナーカウントが2以上にならないこと                                    |
| 理由     | useEffect cleanup によるリスナー解除が正しく動作しないと、二重登録により dispatch が2回呼ばれる                                  |

### TC-08: コンポーネントアンマウント後にonProgressが来ても状態が汚染されないこと

| 項目     | 内容                                                                                                                              |
| -------- | --------------------------------------------------------------------------------------------------------------------------------- |
| ID       | TC-08                                                                                                                             |
| 区分     | ユニット/コンポーネント                                                                                                           |
| 対象     | `SkillLifecyclePanel.tsx` または `useSkillLLMGeneration.ts`                                                                       |
| 前提条件 | `isGenerating=true` でリスナー登録後、コンポーネントがアンマウントされる                                                          |
| 手順     | 1. コンポーネントをマウントし `isGenerating=true` にする / 2. コンポーネントをアンマウントする / 3. onProgress イベントを送出する |
| 期待値   | `dispatch(setGenerationProgress(...))` が呼ばれないこと。Storeの `generationProgress` が汚染されないこと                          |
| 理由     | アンマウント後の非同期コールバックによるメモリリークおよび状態不整合の防止                                                        |

### TC-09: create/collaborative/update/orchestrate/improve-promptの全モードで退行しないこと（回帰）

| 項目     | 内容                                                                                                                                                                                                                                                    |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ID       | TC-09                                                                                                                                                                                                                                                   |
| 区分     | ユニット（回帰）                                                                                                                                                                                                                                        |
| 対象     | `useStreamingProgress.ts`（PHASE_TO_STAGEマップ）                                                                                                                                                                                                       |
| 前提条件 | Phase 5 実装後の `PHASE_TO_STAGE` マップが存在する                                                                                                                                                                                                      |
| 手順     | 各モードの代表 phase 名を入力し、返却される stage を確認する（create: `"planning"` → `"planning"` / update: `"analyzing"` → `"planning"` / orchestrate: `"engine-selection"` → `"planning"` / improve-prompt: `"improving"` → `"generating-skill"` 等） |
| 期待値   | create モードの5段階マッピングが変更されていないこと。update/collaborative の phase が "planning" 以外の適切な stage にもマッピングされること                                                                                                           |
| 理由     | PHASE_TO_STAGE 拡張により create モードの既存動作が破壊されていないことを確認する                                                                                                                                                                       |

### TC-10: `percentage`と`message`が正しくSliceに反映されること

| 項目     | 内容                                                                                                                                                      |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ID       | TC-10                                                                                                                                                     |
| 区分     | ユニット                                                                                                                                                  |
| 対象     | `generationProgressSlice.ts` / `SkillLifecyclePanel.tsx` または `useSkillLLMGeneration.ts`                                                                |
| 前提条件 | onProgress コールバックが接続済みである                                                                                                                   |
| 手順     | 1. `{ phase: "generating-skill", percentage: 50, message: "SKILL.mdを更新中..." }` を onProgress で送出する / 2. Store の `generationProgress` を参照する |
| 期待値   | `generationProgress.phase === "generating-skill"` / `generationProgress.percentage === 50` / `generationProgress.message === "SKILL.mdを更新中..."`       |
| 理由     | `SkillCreatorProgress` の3フィールドがすべて Store に正しく転写されることを確認する                                                                       |

### TC-11: error状態のフォールバック動作

| 項目     | 内容                                                                                       |
| -------- | ------------------------------------------------------------------------------------------ |
| ID       | TC-11                                                                                      |
| 区分     | ユニット                                                                                   |
| 対象     | `useStreamingProgress.ts`（PHASE_TO_STAGEマップ・フォールバック）                          |
| 前提条件 | PHASE_TO_STAGE マップに登録されていない phase 名が到達する                                 |
| 手順     | 1. `phase = "未知のフェーズXYZ"` を PHASE_TO_STAGE に渡す / 2. 返却される stage を確認する |
| 期待値   | `"planning"` にフォールバックすること。例外やエラーが throw されないこと                   |
| 理由     | 将来追加されるモードのphase名が未登録の場合でも、UIが壊れずに動作し続けることを保証する    |

## 回帰ガードテスト方針

| 観点                                | 方針                                                                                  |
| ----------------------------------- | ------------------------------------------------------------------------------------- |
| create モード非破壊                 | TC-09 でcreateの5段階マッピングが変更されていないことを確認する                       |
| update/collaborative 新規マッピング | TC-09 でupdate3段階・collaborative1段階が正しいstageに変換されることを確認する        |
| orchestrate/improve-prompt          | PHASE_TO_STAGEに未登録のため TC-11 のフォールバック動作で "planning" が返ることを確認 |
| Store整合                           | TC-10 で3フィールド（phase/percentage/message）のすべてが正しく反映されることを確認   |
| リスナーライフサイクル              | TC-07/TC-08 で二重登録・アンマウント後汚染がないことを確認する                        |

## 実行手順

1. Phase 5 の実装成果物（`outputs/phase-5/`）を確認する。
2. SubAgent-A/B/C を並列実行し、TC-07〜TC-11 を各担当で実装する。
3. SubAgent-D が全ケースの整合性を統合判定する。
4. テストを実行し結果を `outputs/phase-6/` に保存する。
5. 完了条件で矛盾・漏れ・整合・依存を判定する。

## 統合テスト連携

- SubAgent-A/B/C の拡張テストケースを並列で設計する。
- SubAgent-D が統合順序を直列で確定する。
- onProgress IPC経路（SKILL_CREATOR_PROGRESSチャンネル）を統合対象に固定する。
- phase変換・Store更新・UI表示の3層を回帰ガード対象とする。
- create/collaborative/update/orchestrate/improve-prompt の全モードで退行が発生しないことを確認する。
- 統合ログは `outputs/phase-6/` に保存する。

## 多角的チェック観点

| 観点     | 確認内容                                                            |
| -------- | ------------------------------------------------------------------- |
| 矛盾     | 追加テストケースと既存テストケースに矛盾がないか確認する            |
| 漏れ     | AC-1〜AC-6 のフェイルパスが網羅されているか確認する                 |
| 整合性   | Hook/Slice/Component の各層でリスナーライフサイクルが一致しているか |
| 依存関係 | Phase 4/5 の成果物を参照してテストケースが正しく設計されているか    |

## 実行コマンド

```bash
# 対象ファイルのテストを実行する
pnpm --filter @repo/desktop test -- --run

# 特定テストファイルを指定して実行する
pnpm --filter @repo/desktop test -- --run src/renderer/hooks/__tests__/useStreamingProgress.test.ts
pnpm --filter @repo/desktop test -- --run src/renderer/components/skill/__tests__/SkillLifecyclePanel.test.tsx
```

## 成果物

| 成果物           | パス                                        | 説明                         |
| ---------------- | ------------------------------------------- | ---------------------------- |
| 拡張テストケース | `outputs/phase-6/expanded-test-cases.md`    | TC-07〜TC-11の追加テスト一覧 |
| 回帰テスト結果   | `outputs/phase-6/regression-test-result.md` | 全モード回帰確認結果         |
| 異常系結果       | `outputs/phase-6/edge-case-result.md`       | フェイルパス・異常系検証結果 |

## 参照資料

| 参照資料           | パス                                         | 説明           |
| ------------------ | -------------------------------------------- | -------------- |
| 要件定義書         | `outputs/phase-1/requirements-definition.md` | Phase 1 成果物 |
| 受け入れ基準       | `outputs/phase-1/acceptance-criteria.md`     | Phase 1 成果物 |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md`     | Phase 2 成果物 |
| IPC契約設計        | `outputs/phase-2/ipc-contract-design.md`     | Phase 2 成果物 |
| テスト戦略         | `outputs/phase-2/test-strategy.md`           | Phase 2 成果物 |
| テスト仕様書       | `outputs/phase-4/test-specification.md`      | Phase 4 成果物 |
| Red結果            | `outputs/phase-4/red-test-result.md`         | Phase 4 成果物 |
| 統合テスト計画     | `outputs/phase-4/integration-test-plan.md`   | Phase 4 成果物 |
| 実装サマリー       | `outputs/phase-5/implementation-summary.md`  | Phase 5 成果物 |
| 変更ファイル一覧   | `outputs/phase-5/changed-files.md`           | Phase 5 成果物 |
| 契約差分           | `outputs/phase-5/contract-diff.md`           | Phase 5 成果物 |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 整合性が取れていることを確認
- [ ] 依存関係が取れていることを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. SubAgent-A/B/C の並列作業（TC-07〜TC-11の実装）
3. SubAgent-D の統合判定
4. 成果物出力
5. 完了条件判定

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-SC-08-ON-PROGRESS-REALTIME-UPDATE
```

## 次のPhase

Phase 7: テストカバレッジ確認
