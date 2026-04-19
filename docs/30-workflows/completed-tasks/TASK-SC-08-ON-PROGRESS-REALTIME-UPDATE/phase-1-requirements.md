# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                                                        |
| ---------- | --------------------------------------------------------------------------- |
| Phase      | 1                                                                           |
| 機能名     | TASK-SC-08-ON-PROGRESS-REALTIME-UPDATE                                      |
| タスク名   | onProgressコールバック接続・useStreamingProgressモード別phaseマッピング拡張 |
| 前提Phase  | -                                                                           |
| 後続Phase  | Phase 2                                                                     |
| 作成日     | 2026-04-19                                                                  |
| ステータス | pending                                                                     |

## 目的

`onProgress` コールバックを Renderer 側に接続し、`executePlan` 実行中に AI からのリアルタイム progress 通知を UI に反映するための要件境界を固定する。
あわせて `useStreamingProgress.ts` の phase → stage マッピングをモード別に拡張し、mode-specific phase が `planning` に吸収されない要件を確定する。

## 背景

TASK-SC-06-UI-RUNTIME-CONNECTION では `generationProgress` に静的テキスト（「計画を生成中...」「スキルを生成中...」）を設定している。
`onProgress` コールバックを接続することで AI の進捗状況をリアルタイム表示できる。

TASK-SW-STREAM-FUP-03 で `SkillCreatorService` 側の progress phase が mode-specific に拡張された。
しかし Renderer 側の `useStreamingProgress.ts` は新しい phase 名をまだ 5 段階の stage にマッピングしておらず、
未知の phase を `planning` に吸収してしまう。結果として、`collaborative` / `orchestrate` / `update` / `improve-prompt`
の進捗が見た目上は `planning` のまま残る問題がある。

現在の `PHASE_TO_STAGE` マップは `create` モード専用の 5 段階のみ定義されており、
mode-specific phase 名（`update` の `loading-skill` / `analyzing` 等）を認識できない状態である。

## SubAgentチーム編成

| SubAgent   | 関心ごと        | 主担当                             |
| ---------- | --------------- | ---------------------------------- |
| SubAgent-A | Main/IPC責務    | onProgress IPC配線・ライフサイクル |
| SubAgent-B | Preload/API契約 | SkillCreatorAPI型契約・公開境界    |
| SubAgent-C | Renderer/UX契約 | phaseマッピング・表示整合          |
| SubAgent-D | 統合監査        | 矛盾・漏れ・整合・依存判定         |

## 実行タスク

- 要件抽出: 既存仕様書（TASK-SC-08-ON-PROGRESS-REALTIME-UPDATE.md）とコード現状から機能要件/非機能要件を抽出する
- aiworkflow仕様抽出: resource-map起点でonProgress/IPC/streaming関連仕様をカテゴリ単位で抽出する
- 受け入れ基準化: 矛盾なし・漏れなし・整合あり・依存整合の判定基準を定義する

## 参照資料

### 実装・コード

| 資料名                  | パス                                                                 | 用途                                    |
| ----------------------- | -------------------------------------------------------------------- | --------------------------------------- |
| useStreamingProgress    | `apps/desktop/src/renderer/hooks/useStreamingProgress.ts`            | phase→stageマッピング現状確認           |
| generationProgressSlice | `apps/desktop/src/renderer/store/slices/generationProgressSlice.ts`  | StreamingGenerationStage型確認          |
| skill-creator-api       | `apps/desktop/src/preload/skill-creator-api.ts`                      | onProgress API契約確認                  |
| SkillCreateWizard       | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`   | `useStreamingProgress()` の既存利用箇所 |
| GenerateStep            | `apps/desktop/src/renderer/components/skill/wizard/GenerateStep.tsx` | 既存の動的メッセージ表示確認先          |
| useStreamingProgress    | `apps/desktop/src/renderer/hooks/useStreamingProgress.ts`            | onProgress購読と phase→stage変換        |

### システム仕様（aiworkflow-requirements）

| 資料名                | パス                                                                                        | 用途                        |
| --------------------- | ------------------------------------------------------------------------------------------- | --------------------------- |
| IPC契約チェックリスト | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | IPC契約監査基準             |
| システムIPC仕様       | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                       | onProgressチャネル仕様      |
| Agent IPC仕様         | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | executePlanとprogress境界   |
| 状態管理仕様          | `.claude/skills/aiworkflow-requirements/references/state-management.md`                     | generationProgressSlice契約 |
| UIコンポーネント仕様  | `.claude/skills/aiworkflow-requirements/references/ui-components.md`                        | GenerateStep表示仕様        |
| Preloadセキュリティ   | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                | 公開境界・safeOnパターン    |
| 実装パターン          | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | onProgressライフサイクル    |
| エラーハンドリング    | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | 失敗契約                    |
| 品質要件              | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | 品質ゲート                  |
| タスク運用            | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | 台帳同期ルール              |
| 教訓                  | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | 再発防止知見                |
| リソースマップ        | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                            | 抽出漏れ防止                |
| 検索スクリプト        | `.claude/skills/aiworkflow-requirements/scripts/search-spec.js`                             | 仕様抽出コマンド            |

## 実行手順

1. resource-map.md を起点に対象カテゴリ（IPC/Renderer/State/Preload/UI）を確定する。
2. search-spec.js でキーワード（TASK-SC-08, onProgress, useStreamingProgress, SKILL_CREATOR_PROGRESS, streaming, phase, stage）を検索する。
3. 抽出した仕様を API/Interface/State/UI/Security/Architecture/Error/Quality/Workflow に分類する。
4. 要件と受け入れ基準を矛盾なし・漏れなしの状態で固定する。

## 統合テスト連携

- SubAgent-A/B/C の検証ケースを並列で設計する。
- SubAgent-D が統合順序を直列で確定する。
- onProgress IPC経路（SKILL_CREATOR_PROGRESSチャンネル）を統合対象に固定する。
- phase名→stage変換・Store更新・UI表示の3層を統合対象とする。
- モード別（create/update/collaborative/orchestrate/improve-prompt）で進捗が正しく表示されることを確認する。
- 統合ログは `outputs/phase-1/` に保存する。

## 多角的チェック観点（30思考法クラスタ適用）

| 思考法             | 確認内容                                                        |
| ------------------ | --------------------------------------------------------------- |
| 水平思考           | onProgress以外の進捗通知手段の候補を列挙して盲点を減らす        |
| 逆説思考           | 逆の仮定（onProgressを接続しない）から破綻条件を洗い出す        |
| システム思考       | Main/Preload/Rendererの相互作用（onProgress流れ）を確認する     |
| 垂直思考           | 静的テキストから根因（IPC未接続・マッピング未対応）へ掘り下げる |
| 類推思考           | TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001のIPC修正と構造比較   |
| if思考             | onProgressが届かない・マッピング失敗・Store更新失敗の条件列挙   |
| 素人思考           | 初見ユーザーが「生成中」のまま固まっていると感じるポイント確認  |
| トレードオン思考   | リアルタイム更新の粒度とパフォーマンス負荷のバランスを選ぶ      |
| プラスサム思考     | mode-specific表示によるUX向上とコード保守性が両立する設計選択   |
| 2軸思考            | 影響度×発生頻度でmode別マッピング漏れの優先順位を決める         |
| 価値提案思考       | ユーザーへの「今何をしているか」伝達価値の寄与順で施策並べる    |
| why思考            | なぜプログレスが静的なのか五段階で分解する                      |
| 改善思考           | 再発防止のためのマッピングテスト追加まで設計する                |
| 戦略的思考         | 短期（create/update対応）と中期（全モード対応）を分離する       |
| ダブル・ループ思考 | 手順（IPC接続）と判断基準（マッピング方針）の両方を改善する     |
| 抽象化思考         | 個別モードのphase名を抽象化し一般的なマッピング問題へ変換する   |
| プロセス思考       | 分析→設計→検証の流れを固定する                                  |
| 仮説思考           | 「マッピング不足が原因」の競合仮説を作り反証順を決める          |
| 論点思考           | 論点（IPC未接続・マッピング不足・UI静的表示）を排他的に分解     |
| 因果関係ループ     | onProgress修正が新たなリスナー二重登録問題を生む循環を検査する  |

## 成果物

| 成果物               | パス                                                         | 説明                     |
| -------------------- | ------------------------------------------------------------ | ------------------------ |
| 要件定義書           | `outputs/phase-1/requirements-definition.md`                 | 機能要件と非機能要件     |
| 受け入れ基準         | `outputs/phase-1/acceptance-criteria.md`                     | 検証可能なAC一覧         |
| 仕様抽出結果         | `outputs/phase-1/aiworkflow-requirements-extraction.md`      | aiworkflow仕様抽出結果   |
| 差分カバレッジ       | `outputs/phase-1/branch-diff-coverage.md`                    | 変更対象ファイル反映確認 |
| トレーサビリティ行列 | `outputs/phase-1/implementation-spec-traceability-matrix.md` | 要件と仕様の対応表       |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 整合性が取れていることを確認
- [ ] 依存関係が取れていることを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. SubAgent-A/B/C の並列作業
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

Phase 2: 設計
