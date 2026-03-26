# Phase 4: テスト作成

## メタ情報

| 項目   | 値                                    |
| ------ | ------------------------------------- |
| Phase  | 4                                     |
| 機能名 | workflow-engine-runtime-orchestration |
| 作成日 | 2026-03-26                            |

## 目的

engine と facade の境界、phase 遷移、成果物受け渡し、public contract parity の検証観点を定義する。

## 実行タスク

- engine state machine の unit test 観点を作る
- facade / IPC / preload / shared types の parity test 観点を作る
- `terminal_handoff` と `integrated_api` の route regression 観点を作る
- downstream task が参照する ownership assertion を test matrix 化する

## 参照資料

| 資料名           | パス                       | 説明                            |
| ---------------- | -------------------------- | ------------------------------- |
| Phase 1 要件     | `phase-1-requirements.md`  | owner inventory                 |
| Phase 2 設計     | `phase-2-design.md`        | state machine と migration path |
| Phase 3 レビュー | `phase-3-design-review.md` | gate で確定した test focus      |

### システム仕様（aiworkflow-requirements）

| 参照資料                   | パス                                                                                        | 内容                                |
| -------------------------- | ------------------------------------------------------------------------------------------- | ----------------------------------- |
| Runtime public IPC 契約    | `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`                  | handler / preload / shared 型の照合 |
| RuntimePolicyResolver 契約 | `.claude/skills/aiworkflow-requirements/references/arch-electron-services-details-part2.md` | route branch の期待動作             |

## 実行手順

### ステップ1: unit test suite を定義する

- `SkillCreatorWorkflowEngine` の phase transition、artifact append、resume envelope 生成を unit test に切る。
- `RuntimeSkillCreatorFacade` の route 決定と engine 委譲を unit test に切る。

### ステップ2: contract parity test を定義する

- `creatorHandlers.ts` の invoke response が shared union 型に合うことを検証する。
- `skill-creator-api.ts` の戻り値型と shared contract の parity を検証する。

### ステップ3: regression matrix を出力する

- `execute()` の handoff early return、graceful degradation、artifact persistence failure を regression case として固定する。

## 統合テスト連携

- 想定コマンドは `pnpm vitest apps/desktop/src/main/services/runtime`, `pnpm vitest apps/desktop/src/main/ipc`, `pnpm vitest apps/desktop/src/preload`, `pnpm vitest packages/shared/src/types` とする。
- Phase 6 で pause / resume / verify fail を追加し、Phase 7 で ownership coverage を再計測する。

## 成果物

| 成果物         | パス                             | 説明                             |
| -------------- | -------------------------------- | -------------------------------- |
| テスト作成仕様 | `phase-4-test-creation.md`       | test focus の本文                |
| test matrix    | `outputs/phase-4/test-matrix.md` | suite / assertion / owner の一覧 |

## 完了条件

- [ ] engine / facade の境界テスト観点がある
- [ ] public IPC / preload / shared type の parity 観点がある
- [ ] `terminal_handoff` / `integrated_api` regression 観点がある
- [ ] **本Phase内の全タスクを100%実行完了**
