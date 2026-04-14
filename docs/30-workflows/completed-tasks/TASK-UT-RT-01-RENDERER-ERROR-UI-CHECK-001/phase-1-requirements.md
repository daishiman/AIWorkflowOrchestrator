# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| Phase      | 1                                            |
| タスクID   | TASK-UT-RT-01-RENDERER-ERROR-UI-CHECK-001    |
| タスク名   | Renderer 側エラーメッセージ UI 表示 E2E 確認 |
| 前提Phase  | -                                            |
| 後続Phase  | Phase 2                                      |
| 作成日     | 2026-04-13                                   |
| ステータス | completed                                    |

## 目的

`SkillLifecyclePanel.tsx` において、スキル実行失敗時に IPC 経由で届いたエラーメッセージが
`data-testid="skill-lifecycle-error"` の `<div role="alert">` に正しく表示されることを
Vitest テストで検証するための要件を定義し、受け入れ基準を固定する。

## 背景

TASK-UT-RT-01-EXECUTE-ASYNC-SNAPSHOT-ERROR-MESSAGE-001 で Main 層のエラーメッセージ伝搬が整備された。
IPC ブリッジ（preload の `onWorkflowStateChanged`）も variadic 化され、
`webContents.send(channel, snapshot, errorMessage)` で送信した errorMessage が
Renderer 側コールバックの第2引数として受け取れるよう実装済みである。

しかし以下の3点が未検証のまま残っている（Phase 1 スコープ外として除外されたため）:

1. `onWorkflowStateChanged` コールバックが受け取った `errorMessage` が `setWorkflowError(errorMessage)` でストアに保存されているか
2. `workflowError` が `currentSurfaceError`（`localError ?? workflowError ?? skillError`）を通じて `data-testid="skill-lifecycle-error"` に表示されているか
3. execute ack 後の `getWorkflowState()` 再読込で failure snapshot が優先表示されているか

### タスク分類

| 分類           | 該当 |
| -------------- | ---- |
| UI task        | ✅   |
| docs-only task | ❌   |

## SubAgentチーム編成

| Lane   | 関心ごと           | 主担当                                 | 主に使う思考法                         |
| ------ | ------------------ | -------------------------------------- | -------------------------------------- |
| Lane-A | Renderer/Store責務 | currentSurfaceError・workflowError経路 | 批判的思考、演繹思考、要素分解         |
| Lane-B | IPC/Preload契約    | onWorkflowStateChanged シグネチャ確認  | システム思考、因果関係分析、因果ループ |
| Lane-C | Spec/Traceability  | 受け入れ基準・4条件・漏れ確認          | メタ思考、抽象化思考、論点思考、KJ法   |

> 3 lane 上限に合わせ、4本目の統合監査は Lane-C に吸収する。

## 実行タスク

1. **現状調査**: `SkillLifecyclePanel.tsx` のエラー表示経路を把握する
   - `currentSurfaceError` の定義（`localError ?? workflowError ?? skillError`）
   - `data-testid="skill-lifecycle-error"` の条件分岐
   - `onWorkflowStateChanged` コールバック実装
2. **仕様抽出**: aiworkflow-requirements から関連仕様をカテゴリ単位で抽出する
3. **受け入れ基準化**: 検証可能な基準を矛盾なし・漏れなし・整合あり・依存整合で定義する

## 参照資料

### 実装・コード

| 資料名                    | パス                                                                      | 用途                                        |
| ------------------------- | ------------------------------------------------------------------------- | ------------------------------------------- |
| SkillLifecyclePanel       | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`      | currentSurfaceError・data-testid 経路を確認 |
| workflowError store       | `apps/desktop/src/renderer/store/`                                        | workflowError スライスの実装確認            |
| onWorkflowStateChanged    | `apps/desktop/src/preload/index.ts`                                       | IPC ブリッジ variadic 化の実装確認          |
| skill-creator-api preload | `apps/desktop/src/preload/skill-creator-api.ts`                           | safeOn の実装確認                           |
| 既存テスト参考            | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.test.tsx` | 既存テストファイル（あれば）の確認          |

### システム仕様（aiworkflow-requirements）

| 資料名                | パス                                                                                         | 用途               |
| --------------------- | -------------------------------------------------------------------------------------------- | ------------------ |
| IPC契約チェックリスト | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`                | IPC契約監査基準    |
| システムIPC仕様       | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                        | IPC チャネル仕様   |
| UI/UX仕様             | `.claude/skills/aiworkflow-requirements/references/ui-ux-*.md`                               | エラー表示 UI 要件 |
| エラーハンドリング    | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                        | 失敗契約           |
| IPC教訓（L-004）      | `.claude/skills/aiworkflow-requirements/references/lessons-learned-ipc-preload-runtime-*.md` | variadic 化の教訓  |
| 品質要件              | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                  | 品質ゲート         |
| タスク運用            | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                         | 台帳同期ルール     |
| リソースマップ        | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                             | 抽出漏れ防止       |

## 実行手順

1. `SkillLifecyclePanel.tsx` の `currentSurfaceError`・`data-testid="skill-lifecycle-error"` の実装箇所を確認する
2. `onWorkflowStateChanged` の Renderer 側コールバック実装を確認する（引数 `(snapshot, errorMessage?) => void`）
3. `useWorkflowError` / `useSetWorkflowError` ストアフックの実装を確認する
4. `skillExecutionStatus === "error"` 時のフローを確認する
5. aiworkflow-requirements の resource-map 起点でキーワード（`errorMessage`, `workflowError`, `currentSurfaceError`）を検索する
6. 要件と受け入れ基準を矛盾なし・漏れなしの状態で固定する

## 検証テストケース（受け入れ基準の基礎）

| #     | シナリオ                                                                          | 期待結果                                                                        |
| ----- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| TC-01 | `onWorkflowStateChanged` に `errorMessage = "実行に失敗しました"` を渡す          | `data-testid="skill-lifecycle-error"` に "実行に失敗しました" が表示される      |
| TC-02 | `skillExecutionStatus` が `"error"` に変化し `skillError = "タイムアウト"` がある | セッションログの detail に "タイムアウト" が表示される                          |
| TC-03 | `getWorkflowState()` が failure snapshot（`currentPhase: "failed"`）を返す        | failure 状態が UI に反映される                                                  |
| TC-04 | `localError` が設定されている場合                                                 | `workflowError` より優先して `data-testid="skill-lifecycle-error"` に表示される |

## 多角的チェック観点（30思考法）

| カテゴリ     | 思考法                                                               | このタスクでの主用途                   |
| ------------ | -------------------------------------------------------------------- | -------------------------------------- |
| 論理分析系   | 批判的思考、演繹思考、帰納的思考、アブダクション、垂直思考           | 受け入れ基準と実装差分の妥当性確認     |
| 構造分解系   | 要素分解、MECE、2軸思考、プロセス思考                                | 依存関係、責務境界、Phase 分割の最適化 |
| メタ・抽象系 | メタ思考、抽象化思考、ダブル・ループ思考                             | 仕様の前提、粒度、再利用方針の見直し   |
| 発想・拡張系 | ブレインストーミング、水平思考、逆説思考、類推思考、if思考、素人思考 | 代替案とエレガントな再構成案の探索     |
| システム系   | システム思考、因果関係分析、因果ループ                               | IPC → Store → Render の波及確認        |
| 戦略・価値系 | トレードオン思考、プラスサム思考、価値提案思考、戦略的思考           | コスト最小・価値最大の選択             |
| 問題解決系   | why思考、改善思考、仮説思考、論点思考、KJ法                          | 根本原因の特定と改善仮説の整理         |

> 分析過程では上記 30 種を少なくとも 1 回は使用し、各 Lane が担当範囲に応じて適用する。

## 成果物

| 成果物               | パス                                                         | 説明                               |
| -------------------- | ------------------------------------------------------------ | ---------------------------------- |
| 要件定義書           | `outputs/phase-1/requirements-definition.md`                 | 機能要件と非機能要件               |
| 受け入れ基準         | `outputs/phase-1/acceptance-criteria.md`                     | 検証可能な AC 一覧（TC-01〜TC-04） |
| 仕様抽出結果         | `outputs/phase-1/aiworkflow-requirements-extraction.md`      | aiworkflow 仕様抽出結果            |
| 調査メモ             | `outputs/phase-1/investigation-memo.md`                      | エラー表示経路の調査記録           |
| トレーサビリティ行列 | `outputs/phase-1/implementation-spec-traceability-matrix.md` | 要件と仕様の対応表                 |

## 完了条件

- [x] `SkillLifecyclePanel.tsx` のエラー表示経路（IPC → store → render）が把握できている
- [x] TC-01〜TC-04 の受け入れ基準が固定されている
- [x] aiworkflow-requirements 仕様との整合が確認されている
- [x] 実行タスクで定義した成果物を全件作成
- [x] 矛盾がないことを確認
- [x] 漏れがないことを確認
- [x] 整合性が取れていることを確認
- [x] 依存関係が取れていることを確認
- [x] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 成果物テーブル記載のファイルを全件生成
- [x] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [x] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/TASK-UT-RT-01-RENDERER-ERROR-UI-CHECK-001
```

## 次のPhase

Phase 2: 設計
