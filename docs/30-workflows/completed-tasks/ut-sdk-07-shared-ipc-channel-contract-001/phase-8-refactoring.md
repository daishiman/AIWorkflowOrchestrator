# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                                                                     |
| ---------- | ------------------------------------------------------------------------ |
| Phase      | 8                                                                        |
| Phase名    | リファクタリング                                                         |
| 前提Phase  | Phase 7                                                                  |
| 後続Phase  | Phase 9                                                                  |
| ステータス | pending                                                                  |
| 作成日     | 2026-04-06                                                               |
| 機能名     | UT-SDK-07-SHARED-IPC-CHANNEL-CONTRACT-001                                |
| タスクID   | UT-SDK-07-SHARED-IPC-CHANNEL-CONTRACT-001                                |
| Issue      | [#1682](https://github.com/daishiman/AIWorkflowOrchestrator/issues/1682) |

---

## 目的

duplicate と navigation drift を削る。

TDD Refactor フェーズとして、Phase 4〜7 で追加した実装・テストコードの重複定義排除・コメント整合・命名一貫性の確認を行い、保守性を向上させる。

## 背景

Phase 5（実装）と Phase 7（カバレッジ確認）を経て機能は動作している。本 Phase では以下のリファクタリングを実施する。

- preload `channels.ts` に 3 チャンネルの直書き定義が残っていないかを確認・整理する
- shared `channels.ts` に重複エクスポートがないかを確認する
- `SKILL_CREATOR_RUNTIME_CHANNELS` に JSDoc コメントを追加して意図を明示する
- preload `channels.ts` の import 行に参照元コメントを追加する

---

## 変更内容テーブル

> Feedback RT-03 対応: 対象・Before・After・理由をテーブル形式で記録する。

| 対象                                                                          | Before                                                                                | After                                                                                 | 理由                                                         |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `packages/shared/src/ipc/channels.ts` — `SKILL_CREATOR_RUNTIME_CHANNELS` 定義 | JSDoc コメントなし                                                                    | `/** Skill Creator runtime 系 IPC チャンネル正本。preload は import 参照。 */` を付与 | 正本であることを明示し、他の `*_CHANNELS` との役割を区別する |
| `apps/desktop/src/preload/channels.ts` — import 行                            | `import { SKILL_CREATOR_RUNTIME_CHANNELS } from "@repo/shared/src/ipc/channels"` のみ | `// Skill Creator runtime 系は shared 正本を参照` コメントを import 行の直前に追加    | 参照元を明示し、直書きへの回帰を防止する                     |
| `apps/desktop/src/preload/channels.ts` — 直書き 3 チャンネル定義              | `SKILL_CREATOR_PROGRESS: "skill-creator:progress"` 等が直書き                         | 削除済み（Phase 5 で実施）→ 残存がないことを最終確認                                  | 重複定義ゼロを担保する                                       |
| `packages/shared/src/ipc/channels.ts` — `IPC_CHANNELS` スプレッド             | `...SKILL_CREATOR_RUNTIME_CHANNELS` 追加済み                                          | 重複スプレッドがないことを確認                                                        | 二重エクスポートによる型衝突を防止する                       |

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 重複定義の確認と整理

**目的**: preload `channels.ts` に 3 チャンネルの直書き定義が残っていないことを最終確認する

**実行手順**:

1. `apps/desktop/src/preload/channels.ts` を読み込み、以下のリテラル文字列が直書きされていないことを確認する

```
"skill-creator:progress"
"skill-creator:workflow-state-changed"
"skill-creator:adapter-status-changed"
```

2. `packages/shared/src/ipc/channels.ts` を読み込み、`SKILL_CREATOR_RUNTIME_CHANNELS` が重複してエクスポートされていないことを確認する（`IPC_CHANNELS` へのスプレッドが 1 箇所のみであること）

3. 残存・重複が見つかった場合は即座に除去する

**完了基準**:

- 直書きリテラル文字列がコードベース内に存在しないこと（テストの期待値を除く）
- `SKILL_CREATOR_RUNTIME_CHANNELS` のエクスポートが 1 箇所のみであること

---

### タスク2: コメント・ドキュメントの整合

**目的**: shared `channels.ts` と preload `channels.ts` のコメントを整合させ、正本参照関係を明示する

**実行手順**:

1. `packages/shared/src/ipc/channels.ts` の `SKILL_CREATOR_RUNTIME_CHANNELS` 定義に JSDoc コメントを追加する

```typescript
/**
 * Skill Creator runtime 系 IPC チャンネル正本。
 * preload は直書きせず本オブジェクトを import して参照すること。
 * @see apps/desktop/src/preload/channels.ts
 */
export const SKILL_CREATOR_RUNTIME_CHANNELS = {
  SKILL_CREATOR_PROGRESS: "skill-creator:progress",
  SKILL_CREATOR_WORKFLOW_STATE_CHANGED: "skill-creator:workflow-state-changed",
  SKILL_CREATOR_ADAPTER_STATUS_CHANGED: "skill-creator:adapter-status-changed",
} as const;
```

2. `apps/desktop/src/preload/channels.ts` の import 行の直前に参照元コメントを追加する

```typescript
// Skill Creator runtime 系チャンネルは shared 正本を参照（直書き禁止）
import { SKILL_CREATOR_RUNTIME_CHANNELS } from "@repo/shared/src/ipc/channels";
```

**注意事項**:

- 既存のコメントスタイル・インデントに合わせる
- 他のチャンネルグループの JSDoc が存在する場合は同形式に統一する

---

### タスク3: 命名一貫性の確認

**目的**: `SKILL_CREATOR_RUNTIME_CHANNELS` が既存の `*_CHANNELS` 命名パターンと整合していることを最終確認する

**確認内容**:

| 観点         | 確認項目                                          | 期待値                                |
| ------------ | ------------------------------------------------- | ------------------------------------- |
| 命名規則     | `SCREAMING_SNAKE_CASE` + `_CHANNELS` サフィックス | `SKILL_CREATOR_RUNTIME_CHANNELS` — OK |
| キー命名     | `SCREAMING_SNAKE_CASE`                            | `SKILL_CREATOR_PROGRESS` 等 — OK      |
| 文字列値形式 | `namespace:action`（kebab-case + コロン区切り）   | `"skill-creator:progress"` 等 — OK    |
| export 方式  | `named export` + `IPC_CHANNELS` スプレッド        | Phase 5 で実装済み — 確認             |
| `as const`   | 付与されていること                                | Phase 5 で実装済み — 確認             |

不一致が見つかった場合は既存の `APPROVAL_CHANNELS` / `EXECUTION_CHANNELS` パターンに合わせて修正する。

---

### タスク4: リファクタリング後のテスト確認

**目的**: リファクタリングによるリグレッションがないことを確認する

**実行コマンド**:

```bash
# shared パッケージの全テスト実行
pnpm --filter @repo/shared test:run

# desktop パッケージの全テスト実行
pnpm --filter @repo/desktop test:run
```

**期待結果**: リファクタリング後も全テストが PASS する。

---

## 参照資料

| 参照資料               | パス                                                                                | 内容                           |
| ---------------------- | ----------------------------------------------------------------------------------- | ------------------------------ |
| shared channels        | `packages/shared/src/ipc/channels.ts`                                               | shared 側チャンネル定義        |
| preload channels       | `apps/desktop/src/preload/channels.ts`                                              | preload 側 import 切り替え済み |
| Phase 5 実装結果       | `phase-5-implementation.md`                                                         | 実装内容                       |
| Phase 7 カバレッジ結果 | `phase-7-coverage-check.md`                                                         | カバレッジ結果                 |
| 前タスク Phase 8       | `completed-tasks/step-ut-sdk-07-shared-ipc-channel-contract/phase-8-refactoring.md` | リファクタリングパターン参照   |

---

## 統合テスト連携（Phase 1〜11は必須）

- リファクタ後の統合テスト継続成功を確認する
- Phase 7 で実施した cross-layer parity テストがリファクタ後も PASS であることを確認する
- import コメント追加・JSDoc 追加が TypeScript コンパイルに影響しないことを確認する

---

## 成果物

| 成果物               | パス                                             | 内容                             |
| -------------------- | ------------------------------------------------ | -------------------------------- |
| リファクタリング概要 | `outputs/phase-8/refactoring-summary.md`         | 対象/Before/After/理由テーブル   |
| テスト実行結果       | `outputs/phase-8/test-results-after-refactor.md` | リファクタ後の全テスト PASS 確認 |

---

## 完了条件

- [ ] preload `channels.ts` に 3 チャンネルの直書き定義が残っていないことを確認済み（重複定義ゼロ）
- [ ] shared `channels.ts` に重複エクスポートがないことを確認済み
- [ ] shared `channels.ts` の `SKILL_CREATOR_RUNTIME_CHANNELS` に JSDoc コメントが追加されている
- [ ] preload `channels.ts` の import 行に参照元コメントが追加されている
- [ ] 命名一貫性が既存の `*_CHANNELS` パターンと整合している
- [ ] リファクタ後も全テスト（shared + desktop）が PASS している
- [ ] `outputs/phase-8/refactoring-summary.md` に変更内容が記録されている
- [ ] `outputs/phase-8/test-results-after-refactor.md` にテスト結果が記録されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] `outputs/phase-8/refactoring-summary.md` に実際の変更内容を記録済み
- [ ] `outputs/phase-8/test-results-after-refactor.md` に実際のテスト結果を記録済み

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/ut-sdk-07-shared-ipc-channel-contract-001 --phase 8

node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/ut-sdk-07-shared-ipc-channel-contract-001 \
  --phase 8 --artifacts "refactoring-summary.md,test-results-after-refactor.md"
```

---

## 依存関係

- **前提**: Phase 7（カバレッジ確認）が完了していること
- **後続**: Phase 9（品質保証）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/ut-sdk-07-shared-ipc-channel-contract-001/phase-9-quality-assurance.md`
