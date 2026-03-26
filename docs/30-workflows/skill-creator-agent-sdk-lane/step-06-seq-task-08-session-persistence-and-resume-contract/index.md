# TASK-SDK-08: session-persistence-and-resume-contract

## 概要

`SkillCreatorWorkflowEngine` が保持する workflow state を、既存の session persistence 基盤へどう載せるかを定義する contract-first task 仕様書である。

Task08 の主題は「保存すること」だけではない。`resumeTokenEnvelope`、`sourceProvenance`、`routeSnapshot`、phase artifacts が、いつ resume 可能で、どの差分で invalidation され、どこまで checkpoint を許すかを明文化し、silent resume を防ぐことにある。

## メタ情報

| 項目       | 内容                                                                         |
| ---------- | ---------------------------------------------------------------------------- |
| タスクID   | TASK-SDK-08                                                                  |
| タスク種別 | 設計                                                                         |
| 優先度     | 高                                                                           |
| ステータス | spec_created                                                                 |
| 上流ゲート | `root-workflow-pack/phase-1-requirements.md` から `phase-3-design-review.md` |
| 依存タスク | TASK-SDK-02, TASK-SDK-07                                                     |
| 後続タスク | lane close-out, 実装 wave, Phase 12 spec sync                                |
| 作成日     | 2026-03-26                                                                   |
| 更新日     | 2026-03-26                                                                   |

## 受入基準

| ID   | 基準                                                                                                                                          |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-1 | workflow session の保存対象が `currentPhase` / `awaitingUserInput` / `verifyResult` / `phaseArtifacts` / `resumeTokenEnvelope` まで定義される |
| AC-2 | 既存 `SessionPersistenceService` / `SessionStorage` を再利用しつつ、chat history 全面再設計や silent fallback を持ち込まない                  |
| AC-3 | version 差分、source provenance drift、manifest/resource drift、route drift に対して allow / invalidate / restore-as-readonly が定義される    |
| AC-4 | checkpoint は phase boundary 単位に限定し、mid-stream の任意地点 resume を初回 scope に含めない                                               |
| AC-5 | 並行 resume や stale write を検出する revision / lease / owner rule が定義される                                                              |

## スコープ

**含む**:

- `SkillCreatorWorkflowEngine` state の保存対象定義
- `SessionPersistenceService` / `SessionStorage` 上への mapping 方針
- checkpoint topology と restore boundary
- compatibility / invalidation / stale session 判定
- source provenance / route snapshot / manifest drift を使う resume 可否判定
- concurrency lock と revision rule

**含まない**:

- create / verify UI の主設計
- `skill-creator` manifest 契約そのものの変更
- approval / disclosure / governance rule
- chat history domain model の全面再設計
- rewind / fork / time-travel debugging

## 依存関係

| 種別        | 参照先                                                                       | 役割                                                        |
| ----------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------- |
| predecessor | `../step-02-seq-task-02-workflow-engine-runtime-orchestration/index.md`      | workflow state owner、`resumeTokenEnvelope` の current fact |
| predecessor | `../step-05-seq-task-07-execution-governance-and-handoff-alignment/index.md` | route snapshot / handoff boundary / manual lane 前提        |
| upstream    | `../requirements-draft.md`                                                   | session persistence を contract-first に留める背景          |
| upstream    | `../root-workflow-pack/index.md`                                             | Task08 の責務境界と dependency matrix                       |
| downstream  | 実装 wave                                                                    | shared types / storage / IPC wiring / tests                 |

## 現行コードアンカー

| ファイル                                                                     | 現状の役割                                                                       | Task08 での扱い                                                                 |
| ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`       | workflow state owner。`resumeTokenEnvelope` / `phaseArtifacts` をメモリ保持      | 永続化対象の正本 source とし、保存境界をここから定義する                        |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`        | plan / execute / improve の public bridge                                        | save / restore の authority にはせず、engine と repository の呼び出し側に留める |
| `apps/desktop/src/main/services/session/SessionPersistenceService.ts`        | generic session/message 永続化、LRU cleanup、統計取得                            | workflow session repository の土台として再利用する                              |
| `apps/desktop/src/main/services/session/SessionStorage.ts`                   | `electron-store` wrapper。`sessions` / `messages` / `metadata` を保持            | schema extension または wrapper store の設計対象                                |
| `apps/desktop/src/main/ipc/session-persistence-handler.ts`                   | generic CRUD handler は存在するが app wiring は未接続                            | workflow 専用公開面を増やすか、internal repository に留めるかを設計で確定する   |
| `apps/desktop/src/main/ipc/index.ts`                                         | session persistence handler を現状登録していない                                 | wiring point。public expose の是非をここで判断する                              |
| `apps/desktop/src/preload/index.ts` / `apps/desktop/src/preload/channels.ts` | `agent:resumeSession` はあるが skill creator workflow 用 API はない              | Agent SDK session と混同しない境界を固定する                                    |
| `packages/shared/src/types/skillCreator.ts`                                  | runtime workflow 型、`resumeTokenEnvelope` source                                | workflow-specific persisted contract の配置先候補                               |
| `packages/shared/src/types/agent.ts`                                         | generic `PersistedSession` / `SessionStorageSchema` / `SessionPersistenceConfig` | generic storage contract の配置先。workflow 専用型と責務分離を要検討            |

## Current Canonical Facts From Branch

- `SkillCreatorWorkflowEngine` は `currentPhase` / `awaitingUserInput` / `verifyResult` / `phaseArtifacts` / `resumeTokenEnvelope` を owner として保持する。
- `resumeTokenEnvelope.version` は `task-sdk-02-v1` で、current fact として `planId` / `currentPhase` / `artifactCount` / `routeSnapshot` / `sourceProvenance` / `updatedAt` を持つ。
- `sourceProvenance` は現時点で `resolvedSkillCreatorRoot` を確実に保持し、interface 上は `resourceDescriptorHash` / `manifestPath` / `manifestCacheKey` を収める余地がある。
- `SessionPersistenceService` は generic `PersistedSession` と `PersistedMessage` を `agent-sessions` store に保存し、cleanup / stats / validation を既に持つ。
- `PersistedSession` は `id` / `createdAt` / `lastAccessedAt` / `isActive` / `messageCount` / `title` だけで、workflow-specific snapshot をそのまま表現できない。
- `session-persistence-handler.ts` は isolation test 前提で存在するが、`ipc/index.ts` には未接続であり、public app surface では current canonical になっていない。
- `agent:resumeSession` は Agent SDK session 用 public channel であり、Skill Creator workflow resume と同一契約ではない。

## 要件レビュー一次結論

| 観点                 | 結論                                                                                                                                               |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| 真の論点             | resume を「できるかもしれない」にせず、保存対象と invalidation 条件を明文化して silent resume を防ぐこと                                           |
| 依存関係・責務境界   | Task02 が workflow state owner、Task07 が route / handoff boundary を固定したので、Task08 は persistence / compatibility / checkpoint だけを閉じる |
| 価値とコストの不均衡 | session 基盤再利用は高価値だが、UI・governance・chat history redesign まで抱えると責務が崩れる                                                     |
| 改善優先順位         | 1. save target 2. compatibility matrix 3. checkpoint boundary 4. stale write rule 5. public exposure 判断                                          |
| 4条件評価            | 価値性・実現性・整合性・運用性を満たすため、phase boundary resume と explicit invalidation を初回 scope に固定する                                 |

## ディレクトリ構成

```text
step-06-seq-task-08-session-persistence-and-resume-contract/
├── index.md
├── artifacts.json
├── phase-1-requirements.md
├── phase-2-design.md
├── phase-3-design-review.md
├── phase-4-test-creation.md
├── phase-5-implementation.md
├── phase-6-test-expansion.md
├── phase-7-coverage-check.md
├── phase-8-refactoring.md
├── phase-9-quality-assurance.md
├── phase-10-final-review.md
├── phase-11-manual-test.md
├── phase-12-documentation.md
├── phase-13-pr-creation.md
└── outputs/
    ├── artifacts.json
    ├── verification-report.md
    ├── phase-1/spec-extraction-map.md
    ├── phase-2/persistence-compatibility-matrix.md
    ├── phase-2/checkpoint-topology.md
    ├── phase-3/design-review-gate.md
    ├── phase-3/skill-compliance-and-elegance-review.md
    ├── phase-4/test-matrix.md
    ├── phase-11/manual-test-checklist.md
    ├── phase-11/manual-test-result.md
    ├── phase-11/manual-test-report.md
    ├── phase-11/discovered-issues.md
    ├── phase-11/screenshot-plan.json
    ├── phase-12/
    │   ├── implementation-guide.md
    │   ├── system-spec-update-summary.md
    │   ├── documentation-changelog.md
    │   ├── unassigned-task-detection.md
    │   ├── skill-feedback-report.md
    │   └── phase12-task-spec-compliance-check.md
    └── phase-13/
        ├── local-check-result.md
        └── change-summary.md
```

## 実装者向けクイックガイド

### 着手条件

- Task02 の `SkillCreatorWorkflowEngine` 契約を読了している
- Task07 の route / handoff / manual boundary を読了している
- 初回 scope は phase boundary checkpoint と compatibility contract に限定することへ合意している

### 想定変更ポイント

- `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`
- `apps/desktop/src/main/services/session/SessionPersistenceService.ts`
- `apps/desktop/src/main/services/session/SessionStorage.ts`
- `apps/desktop/src/main/ipc/session-persistence-handler.ts`
- `apps/desktop/src/main/ipc/index.ts`
- `packages/shared/src/types/skillCreator.ts`
- `packages/shared/src/types/agent.ts`

### 非対象

- create / verify UI
- governance / approval rule
- manifest 契約の再設計
- chat history domain model の全面再設計
- rewind / fork

### 完了イメージ

- 何を保存するかと、何が変わると resume 不可になるかを 1 枚で説明できる
- `PersistedSession` と workflow-specific snapshot の責務境界を説明できる
- handoff / integrated の route 差分が resume 判定にどう影響するかを説明できる
- source root / manifest / resource hash drift が allow / invalidate のどちらかを説明できる
- stale write と concurrent resume を検出する rule がある

### 並列実行メモ

- Task08 は Task07 後段の seq task として扱う
- shared type を広く触るため、同 wave の session / IPC 改修と同時に大きく衝突させない
- Agent SDK session と Skill Creator workflow session を同名 API へ寄せない

## Phase 一覧

- [phase-1-requirements.md](./phase-1-requirements.md)
- [phase-2-design.md](./phase-2-design.md)
- [phase-3-design-review.md](./phase-3-design-review.md)
- [phase-4-test-creation.md](./phase-4-test-creation.md)
- [phase-5-implementation.md](./phase-5-implementation.md)
- [phase-6-test-expansion.md](./phase-6-test-expansion.md)
- [phase-7-coverage-check.md](./phase-7-coverage-check.md)
- [phase-8-refactoring.md](./phase-8-refactoring.md)
- [phase-9-quality-assurance.md](./phase-9-quality-assurance.md)
- [phase-10-final-review.md](./phase-10-final-review.md)
- [phase-11-manual-test.md](./phase-11-manual-test.md)
- [phase-12-documentation.md](./phase-12-documentation.md)
- [phase-13-pr-creation.md](./phase-13-pr-creation.md)
