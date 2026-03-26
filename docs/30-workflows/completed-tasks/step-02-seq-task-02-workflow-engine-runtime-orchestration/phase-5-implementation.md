# Phase 5: 実装

## メタ情報

| 項目   | 値                                    |
| ------ | ------------------------------------- |
| Phase  | 5                                     |
| 機能名 | workflow-engine-runtime-orchestration |
| 作成日 | 2026-03-26                            |

## 目的

workflow engine の state machine と facade 統一入口の実装対象を確定し、`execute()` を engine 経由へ移せる中間段階を明示する。

## 実行タスク

- `SkillCreatorWorkflowEngine` の新設対象を定義する
- `RuntimeSkillCreatorFacade` に残す public responsibility を定義する
- `creatorHandlers.ts` / `skill-creator-api.ts` / shared types の更新点を定義する
- implementation drift を防ぐ migration step を定義する

## 参照資料

| 資料名             | パス                             | 説明                               |
| ------------------ | -------------------------------- | ---------------------------------- |
| Phase 4 テスト作成 | `phase-4-test-creation.md`       | 実装後に通す test focus            |
| test matrix        | `outputs/phase-4/test-matrix.md` | regression case の一覧             |
| Phase 2 設計       | `phase-2-design.md`              | ownership matrix と migration path |

### システム仕様（aiworkflow-requirements）

| 参照資料                   | パス                                                                                        | 内容                          |
| -------------------------- | ------------------------------------------------------------------------------------------- | ----------------------------- |
| Runtime public IPC 契約    | `.agents/skills/aiworkflow-requirements/references/api-ipc-system-core.md`                  | public surface を壊さない条件 |
| RuntimePolicyResolver 契約 | `.agents/skills/aiworkflow-requirements/references/arch-electron-services-details-part2.md` | route snapshot の扱い         |

### 想定変更ポイント

| ファイル                                                               | 変更内容                                                     |
| ---------------------------------------------------------------------- | ------------------------------------------------------------ |
| `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts` | 新規。phase 遷移、artifact ownership、resume envelope を保持 |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`  | auth / handoff / public response / engine 委譲へ責務を整理   |
| `apps/desktop/src/main/ipc/creatorHandlers.ts`                         | shared union response を public invoke handler に反映        |
| `apps/desktop/src/preload/skill-creator-api.ts`                        | public method の戻り値型と handoff union を同期              |
| `packages/shared/src/types/skillCreator.ts`                            | public contract と engine 入出力境界を明文化                 |

## 実行手順

### ステップ1: engine を新設する

- engine は workflow state の source of truth とする。
- phase transition、artifact append、`awaitingUserInput`、`verifyResult`、`resumeTokenEnvelope` を engine に集約する。

### ステップ2: facade を薄くする

- facade は `RuntimePolicyResolver` を用いた route 決定、handoff guidance / bundle 形成、public response 形成、executor / improver の委譲だけを担当する。
- workflow state を facade のプロパティへ置かない。

### ステップ3: migration step を固定する

- 現行の `execute()` 直呼び出しは engine 経由へ移す。
- public IPC 名と preload method 名は維持する。
- verify surface の追加は Task06 に送り、Task02 では owner と hook point だけを残す。

## 統合テスト連携

- Phase 4 の suite をすべて通す前提で実装構造を設計する。
- `RuntimeSkillCreatorFacade.execute()` の handoff branch と shared union return は regression target として保持する。
- `creatorHandlers.ts` / `skill-creator-api.ts` / `skillCreator.ts` の parity は単体テストと type-level test の両方で確認する。

## 成果物

| 成果物   | パス                        | 説明                             |
| -------- | --------------------------- | -------------------------------- |
| 実装計画 | `phase-5-implementation.md` | 変更対象と migration step の定義 |

## 完了条件

- [ ] `execute()` の workflow engine 経由化対象が定義されている
- [ ] facade に残す責務と engine へ移す責務が分離されている
- [ ] shared contract の更新点が明記されている
- [ ] 非対象が Task03 / Task04 / Task06 / Task08 へ分離されている
- [ ] **本Phase内の全タスクを100%実行完了**
