# Phase 1: 要件定義

## メタ情報

| 項目       | 値                                                                              |
| ---------- | ------------------------------------------------------------------------------- |
| Phase      | 1                                                                               |
| タスクID   | TASK-SC-08-FUP-02-PAYLOAD-TRACKING-ID                                           |
| タスク種別 | NON_VISUAL code task                                                            |
| 目的       | progress payload 混線問題の要件と受入基準を Phase 1-13 実行可能粒度で再固定する |

## 目的

progress payload の tracking ID 欠落という真の論点を確定し、後続 Phase が同じ受入基準と責務境界を参照できる状態にする。

## Phase 1 で固定する一次結論

| 観点               | 結論                                                                                             |
| ------------------ | ------------------------------------------------------------------------------------------------ |
| 真の論点           | 単一 IPC ブロードキャスト `skill-creator:progress` に発生元識別子が欠落している                  |
| 依存関係・責務境界 | 型責務は preload、送信責務は Main ipc、受信フィルタ責務は Renderer Hook                          |
| 価値とコスト       | 複数スキル並行生成時の UI 混線リスクを低コスト（オプショナルフィールド追加）で除去できる         |
| 改善優先順位       | 型追加 → Main 送信側修正 → Runtime ルート emit 経路調査 → Renderer フィルタ → テスト             |
| 4条件評価          | 初期は 2 条件 FAIL（漏れなし / 整合性）。Phase 1 で artifacts registry と Runtime 経路方針を固定 |

## P50 チェック

### 実コード確認

- `apps/desktop/src/preload/skill-creator-api.ts`
  - `SkillCreatorProgress` は `{ phase, percentage, message }` のみ
  - `planId` / `requestId` フィールド不在
- `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`
  - `sendSkillCreatorProgress(mainWindow, progress)` が `webContents.send` で broadcast
  - payload を拡張してもシグネチャ互換性は維持可能
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`
  - `executeAsync` 内で progress を emit しているかは実装時に追加調査が必要
  - `workflowEngine.triggerPhaseTransition(planId, phase, percentage)` 経由で snapshot を push している
- `apps/desktop/src/renderer/hooks/useStreamingProgress.ts`
  - `api.onProgress` で全通知を無条件受信し Zustand ストアに反映

### 判断

- 本 task は 4 ファイル軽量修正。破壊的変更ではなく後方互換オプショナルフィールドで対応
- Runtime ルートの emit 経路は Phase 2 設計で明確化する

## task classification【必須】

| 項目                 | 判定   | 理由                                                         |
| -------------------- | ------ | ------------------------------------------------------------ |
| UI task              | いいえ | Renderer は Hook のみ変更。視覚要素変更なし                  |
| docs-only            | いいえ | 型・関数・Hook のコード behavior を変更する                  |
| NON_VISUAL code task | はい   | Main Process + Renderer Hook + preload 型の計 4 ファイル変更 |

## 受入基準

| ID   | 基準                                                                                   | 検証方法                 |
| ---- | -------------------------------------------------------------------------------------- | ------------------------ |
| AC-1 | `SkillCreatorProgress` 型に `planId?: string` と `requestId?: string` が追加されている | 型定義 review / tsc      |
| AC-2 | `sendSkillCreatorProgress` が `planId` / `requestId` を payload に含めて送信できる     | コードレビュー           |
| AC-3 | `useStreamingProgress` に `options.planId` フィルタリングロジックが実装されている      | コードレビュー           |
| AC-4 | `planId` 一致時のみ Zustand ストアに書き込まれる                                       | vitest（filter match）   |
| AC-5 | `planId` 不一致の progress 通知はスキップされる                                        | vitest（filter miss）    |
| AC-6 | `progress.planId` 未設定時は後方互換で受け入れられる                                   | vitest（legacy payload） |
| AC-7 | `options.planId` 未指定時は全通知が受け入れられる                                      | vitest（no options）     |
| AC-8 | 既存 `useStreamingProgress` テストが全て PASS する                                     | vitest run               |
| AC-9 | `pnpm --filter @repo/desktop typecheck` / `lint` / targeted test が PASS する          | 品質コマンド群           |

## 実行タスク

- 現行実装を読んで `SkillCreatorProgress` / Main 送信 / Runtime 経路 / Renderer Hook の責務境界を固定する
- AC-1 から AC-9 を要件として明文化する
- task classification と canonical artifacts を確定する
- Phase 2 へ渡す Runtime 経路の追加調査ポイントを記録する

## Canonical Artifacts【必須】

| 成果物        | パス                                              |
| ------------- | ------------------------------------------------- |
| 要件定義      | `outputs/phase-1/requirements-definition.md`      |
| 実装監査      | `outputs/phase-1/current-implementation-audit.md` |
| artifact 一覧 | `outputs/phase-1/artifact-canonical-list.md`      |

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料           | パス                                                                                                | 内容                                                   |
| ------------------ | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| IPC 契約           | `.claude/skills/aiworkflow-requirements/references/api-ipc-system-skill-creator.md`                 | `skill-creator:progress` を含む Skill Creator IPC 契約 |
| skill-creator 設計 | `.claude/skills/aiworkflow-requirements/references/arch-state-management-skill-creator.md`          | Skill Creator の状態管理と Hook 責務境界               |
| progress 通知方針  | `.claude/skills/aiworkflow-requirements/references/lessons-learned-stream-001-progress-callback.md` | progress callback の流し方と後方互換の知見             |

### 実装ファイル

- `apps/desktop/src/preload/skill-creator-api.ts`
- `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`
- `apps/desktop/src/renderer/hooks/useStreamingProgress.ts`
- `apps/desktop/src/renderer/hooks/__tests__/useStreamingProgress.test.ts`

### 既存 unassigned spec

- `docs/30-workflows/unassigned-task/TASK-SC-08-FUP-02-PAYLOAD-TRACKING-ID.md`

## 成果物/実行手順

- 要件定義書を正本として `outputs/phase-1/requirements-definition.md` を作成する
- 実装監査結果を `outputs/phase-1/current-implementation-audit.md` に記録する
- artifacts registry の正本パス一覧を `outputs/phase-1/artifact-canonical-list.md` に固定する

## 統合テスト連携

- Phase 1 では統合テストは実行しない
- Phase 2 で検証導線を設計し、Phase 4/6/7/9 で unit test / coverage / quality gate へ接続する
- Runtime 経路の未確定点は Phase 2 と Phase 5 の設計・実装計画へ連携する

## 完了条件

- [ ] P50 チェック結果を記録した
- [ ] task classification を確定した
- [ ] AC-1 から AC-9 を確定した
- [ ] artifact canonical 一覧を固定した
- [ ] Runtime ルートの emit 経路調査を Phase 2 の入力として定義した
- [ ] `outputs/phase-1/` 配下 3 成果物を作成する準備が整った
