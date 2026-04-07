# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                                                                     |
| ---------- | ------------------------------------------------------------------------ |
| Phase      | 5                                                                        |
| Phase名    | 実装                                                                     |
| 前提Phase  | Phase 4                                                                  |
| 後続Phase  | Phase 6                                                                  |
| ステータス | pending                                                                  |
| 作成日     | 2026-04-06                                                               |
| 機能名     | UT-SDK-07-SHARED-IPC-CHANNEL-CONTRACT-001                                |
| タスクID   | UT-SDK-07-SHARED-IPC-CHANNEL-CONTRACT-001                                |
| Issue      | [#1682](https://github.com/daishiman/AIWorkflowOrchestrator/issues/1682) |

---

## 目的

TDD Green フェーズ。Phase 4 で作成した cross-layer parity テストおよびユニットテストをすべて PASS させる最小限の実装を行う。

`packages/shared/src/ipc/channels.ts` に `SKILL_CREATOR_RUNTIME_CHANNELS` を追加し、`apps/desktop/src/preload/channels.ts` の直書き 3 チャンネルを shared import に切り替えることで、IPC channel の single source of truth を実現する。

## 背景

Phase 4 で TDD Red フェーズが完了し、以下のテストが FAIL 状態にある。本 Phase では設計（Phase 2）に基づいて実装を行い、テストを Green にする。

- `SKILL_CREATOR_PROGRESS`（`"skill-creator:progress"`）
- `SKILL_CREATOR_WORKFLOW_STATE_CHANGED`（`"skill-creator:workflow-state-changed"`）
- `SKILL_CREATOR_ADAPTER_STATUS_CHANGED`（`"skill-creator:adapter-status-changed"`）

上記 3 チャンネルが現在 `apps/desktop/src/preload/channels.ts` の line 331 / 342 / 345 付近に直書きされており、shared 側に正本が存在しない。既存の `APPROVAL_CHANNELS` / `EXECUTION_CHANNELS` 移行パターン（#1696）を踏襲して修正する。

---

## 実装計画：新規作成・修正ファイルパス一覧

> Feedback RT-03 対応: 実装で変更するファイルを事前に明示する。

| 種別 | ファイルパス                            | 変更内容                                                                                  |
| ---- | --------------------------------------- | ----------------------------------------------------------------------------------------- |
| 修正 | `packages/shared/src/ipc/channels.ts`   | `SKILL_CREATOR_RUNTIME_CHANNELS` オブジェクト追加・`IPC_CHANNELS` スプレッドに追加        |
| 修正 | `apps/desktop/src/preload/channels.ts`  | `SKILL_CREATOR_RUNTIME_CHANNELS` を import・直書き 3 チャンネルを削除してスプレッドに変更 |
| 修正 | `packages/shared/vitest.config.ts`      | `src/ipc/channels.ts` の coverage 除外を解除                                              |
| 新規 | `outputs/phase-5/build-result.md`       | ビルド成功確認ログ                                                                        |
| 新規 | `outputs/phase-5/green-phase-result.md` | テスト PASS 確認ログ                                                                      |

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: shared channels.ts への SKILL_CREATOR_RUNTIME_CHANNELS 追加

**目的**: `packages/shared/src/ipc/channels.ts` に Skill Creator runtime 系チャンネルの shared 正本を追加する

**対象ファイル**: `packages/shared/src/ipc/channels.ts`

**追加内容**:

既存の `SKILL_CREATOR_SESSION_CHANNELS` や `APPROVAL_CHANNELS` の直後に以下を追加する。

```typescript
/**
 * Skill Creator runtime 系 IPC チャンネル定義
 * preload の直書きを廃止し、shared を正本とする。
 * @see apps/desktop/src/preload/channels.ts
 */
export const SKILL_CREATOR_RUNTIME_CHANNELS = {
  SKILL_CREATOR_PROGRESS: "skill-creator:progress",
  SKILL_CREATOR_WORKFLOW_STATE_CHANGED: "skill-creator:workflow-state-changed",
  SKILL_CREATOR_ADAPTER_STATUS_CHANGED: "skill-creator:adapter-status-changed",
} as const;
```

さらに `IPC_CHANNELS` オブジェクトのスプレッドに追加する。

```typescript
export const IPC_CHANNELS = {
  // ... 既存スプレッド ...
  ...SKILL_CREATOR_RUNTIME_CHANNELS,
} as const;
```

**注意事項**:

- 既存の `SKILL_CREATOR_SESSION_CHANNELS` や他の `*_CHANNELS` と命名規則（`SCREAMING_SNAKE_CASE` + `_CHANNELS` サフィックス）を統一する
- `as const` assertion を必ず付与する
- named export として公開する
- 既存定義の順序・インデントを変更しない

**期待される成果物**:

- 更新された `packages/shared/src/ipc/channels.ts`

---

### タスク2: preload channels.ts の import 切り替え

**目的**: `apps/desktop/src/preload/channels.ts` の 3 チャンネル直書きを shared import に切り替える

**対象ファイル**: `apps/desktop/src/preload/channels.ts`

**変更内容**:

```typescript
// import 行に追加
import {
  SKILL_CREATOR_RUNTIME_CHANNELS,
  // ... 既存 import ...
} from "@repo/shared/src/ipc/channels";

// IPC_CHANNELS 内の直書き 3 チャンネルを削除し、スプレッドに変更
// BEFORE（直書き定義）:
//   SKILL_CREATOR_PROGRESS: "skill-creator:progress",           // line ~331
//   SKILL_CREATOR_ADAPTER_STATUS_CHANGED: "skill-creator:adapter-status-changed",  // line ~342
//   SKILL_CREATOR_WORKFLOW_STATE_CHANGED: "skill-creator:workflow-state-changed",  // line ~345
//
// AFTER（スプレッド）:
//   ...SKILL_CREATOR_RUNTIME_CHANNELS,
```

**ALLOWED_ON_CHANNELS の確認**:

以下の参照が引き続き機能することを確認する（変更不要）。

```typescript
// ALLOWED_ON_CHANNELS は IPC_CHANNELS.SKILL_CREATOR_* を参照しているため
// スプレッド変更後も同一の文字列値が保持されていることを確認する
IPC_CHANNELS.SKILL_CREATOR_PROGRESS,
IPC_CHANNELS.SKILL_CREATOR_WORKFLOW_STATE_CHANGED,
IPC_CHANNELS.SKILL_CREATOR_ADAPTER_STATUS_CHANGED,
```

**注意事項**:

- `IPC_CHANNELS` オブジェクトの他のプロパティには一切変更を加えない
- import パスが `@repo/shared/src/ipc/channels` であることを確認する
- 既存の `ALLOWED_ON_CHANNELS` / `ALLOWED_INVOKE_CHANNELS` は修正不要

**期待される成果物**:

- 更新された `apps/desktop/src/preload/channels.ts`

---

### タスク3: shared パッケージの export 確認

**目的**: `SKILL_CREATOR_RUNTIME_CHANNELS` が shared package の公開 subpath から参照可能であることを確認する

**確認内容**:

- `packages/shared/package.json` の `exports` に `./src/ipc/channels` が含まれていることを確認する
- root barrel への追加 re-export は行わず、`@repo/shared/src/ipc/channels` を正として扱う

---

### タスク4: ビルド確認

**目的**: shared → desktop の import パスが Electron バンドルで正しく解決されることを確認する

**実行コマンド**:

```bash
pnpm --filter @repo/shared build
pnpm --filter @repo/desktop build
```

ビルドに時間がかかる場合は型チェックで代替する。

```bash
pnpm --filter @repo/shared typecheck
pnpm --filter @repo/desktop typecheck
```

**期待結果**: ビルド（または型チェック）エラーなしで完了する。

**補足**:

- `packages/shared/src/ipc/channels.ts` を coverage 対象に含めるため、`packages/shared/vitest.config.ts` で `src/ipc/channels.ts` を除外している場合はこの段階で解除する

---

### タスク5: テスト実行（Green フェーズ確認）

**目的**: Phase 4 で作成した全テストが PASS することを確認する

**実行コマンド**:

```bash
# shared channel 定義値テスト
pnpm --filter @repo/shared test:run -- src/ipc/__tests__/channels.test.ts

# preload allowlist テスト
pnpm --filter @repo/desktop test:run -- src/preload/channels.test.ts

# cross-layer parity テスト
pnpm --filter @repo/desktop test:run -- src/main/services/runtime/__tests__/governance-bundle.test.ts
```

**期待結果**: 全テストが PASS する（TDD Green フェーズ完了）。

---

## 参照資料

| 参照資料         | パス                                                                                   | 内容                                |
| ---------------- | -------------------------------------------------------------------------------------- | ----------------------------------- |
| Phase 2 設計     | `phase-2-design.md`                                                                    | 同期方式・import 戦略               |
| Phase 4 テスト   | `phase-4-test-creation.md`                                                             | テスト仕様・Red フェーズ            |
| shared channels  | `packages/shared/src/ipc/channels.ts`                                                  | 既存チャンネル定義（変更対象）      |
| preload channels | `apps/desktop/src/preload/channels.ts`                                                 | 現在の直書き定義（変更対象）        |
| 前タスク Phase 5 | `completed-tasks/step-ut-sdk-07-shared-ipc-channel-contract/phase-5-implementation.md` | APPROVAL/EXECUTION 移行パターン参照 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料            | パス                                                                         | 内容                       |
| ------------------- | ---------------------------------------------------------------------------- | -------------------------- |
| IPC通信セキュリティ | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md` | ホワイトリスト実装パターン |

---

## 成果物

| 成果物                 | パス                                    | 内容                                  |
| ---------------------- | --------------------------------------- | ------------------------------------- |
| shared channels 更新   | `packages/shared/src/ipc/channels.ts`   | `SKILL_CREATOR_RUNTIME_CHANNELS` 追加 |
| preload channels 更新  | `apps/desktop/src/preload/channels.ts`  | 直書き → shared import 切り替え       |
| ビルド確認ログ         | `outputs/phase-5/build-result.md`       | ビルド成功確認                        |
| Green フェーズ確認ログ | `outputs/phase-5/green-phase-result.md` | テスト PASS 結果                      |

---

## 統合テスト連携（Phase 1〜11は必須）

- `@repo/shared` → `@repo/desktop` の package boundary を超えた import が Electron バンドラーで解決されることをビルド通過で検証する
- cross-layer parity テスト PASS により、shared ↔ preload 間の契約（文字列値一致）が成立していることを確認する
- `ALLOWED_ON_CHANNELS` 参照が `IPC_CHANNELS.SKILL_CREATOR_*` 経由で引き続き動作することを確認する

---

## 完了条件

- [ ] `packages/shared/src/ipc/channels.ts` に `SKILL_CREATOR_RUNTIME_CHANNELS` が追加されている
- [ ] `SKILL_CREATOR_RUNTIME_CHANNELS` が `IPC_CHANNELS` のスプレッドに含まれている
- [ ] `apps/desktop/src/preload/channels.ts` が `SKILL_CREATOR_RUNTIME_CHANNELS` を shared から import している
- [ ] `apps/desktop/src/preload/channels.ts` の 3 チャンネル直書き定義が削除されている
- [ ] `ALLOWED_ON_CHANNELS` の参照が引き続き機能している
- [ ] `pnpm --filter @repo/shared build`（または `tsc --noEmit`）がエラーなしで完了する
- [ ] `pnpm --filter @repo/desktop build`（または `tsc --noEmit`）がエラーなしで完了する
- [ ] TDD Green: Phase 4 テストが全て PASS している

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] `outputs/phase-5/build-result.md` に実際のビルド結果を記録済み
- [ ] `outputs/phase-5/green-phase-result.md` にテスト PASS 結果を記録済み

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/ut-sdk-07-shared-ipc-channel-contract-001 --phase 5

node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/ut-sdk-07-shared-ipc-channel-contract-001 \
  --phase 5 --artifacts "build-result.md,green-phase-result.md"
```

---

## 依存関係

- **前提**: Phase 4（テスト作成・TDD Red）が完了していること
- **後続**: Phase 6（テスト拡充）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/ut-sdk-07-shared-ipc-channel-contract-001/phase-6-test-expansion.md`
