# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 2                                         |
| Phase名    | 設計                                      |
| 前提Phase  | Phase 1（要件定義）                       |
| 後続Phase  | Phase 3                                   |
| ステータス | 未実施                                    |
| 作成日     | 2026-04-06                                |
| 機能名     | ut-sdk-07-shared-ipc-channel-contract-001 |

## 目的

SKILL_CREATOR_RUNTIME_CHANNELS の設計を行う。shared への追加方法および preload import 変更設計を確定し、Phase 4（テスト作成）・Phase 5（実装）で迷いなく進められる設計ドキュメントを生成する。

## 背景

Phase 1 で確認した 3 チャンネルの drift（preload 直書き）を解消するため、以下の設計を決定する必要がある:

1. `packages/shared/src/ipc/channels.ts` への SKILL_CREATOR_RUNTIME_CHANNELS オブジェクト追加設計
2. `IPC_CHANNELS` スプレッドへの組み込み設計
3. `apps/desktop/src/preload/channels.ts` における import 切り替え設計
4. parity テストの設計

## 実行タスク

### タスク1: shared チャンネル定義設計

**目的**: `packages/shared/src/ipc/channels.ts` に追加する SKILL_CREATOR_RUNTIME_CHANNELS オブジェクトの設計を確定する

**実行手順**:

1. `packages/shared/src/ipc/channels.ts` の現行構造（既存の APPROVAL_CHANNELS / EXECUTION_CHANNELS の定義パターン）を読み込み、追加する定数オブジェクトの形式を決定する
2. 以下の設計を design.md に記録する:
   - SKILL_CREATOR_RUNTIME_CHANNELS オブジェクト定義の型・値
   - 各キーの SCREAMING_SNAKE_CASE 名称と "skill-creator:xxx" 文字列値の対応表
   - `IPC_CHANNELS` スプレッドへの追加箇所（末尾 or 既存 SKILL_CREATOR 系チャンネルの直後）
3. 既存の SKILL_CREATOR 系チャンネル（非 runtime 系）との命名衝突がないことを確認する
4. export 方針（named export のみ。root barrel への re-export はしない）を決定する

**設計対象チャンネル**:

| 定数名                               | 文字列値                               |
| ------------------------------------ | -------------------------------------- |
| SKILL_CREATOR_PROGRESS               | "skill-creator:progress"               |
| SKILL_CREATOR_WORKFLOW_STATE_CHANGED | "skill-creator:workflow-state-changed" |
| SKILL_CREATOR_ADAPTER_STATUS_CHANGED | "skill-creator:adapter-status-changed" |

**期待される成果物**:

- `outputs/phase-2/design.md`（shared channels.ts 追加設計を含む）

---

### タスク2: preload import 変更設計

**目的**: `apps/desktop/src/preload/channels.ts` の 3 チャンネル定義を shared import に切り替える変更設計を確定する

**実行手順**:

1. `apps/desktop/src/preload/channels.ts` の現行 import 文と 3 チャンネルの直書き定義箇所（行番号付き）を design.md に記録する
2. 変更後の import 文（`import { SKILL_CREATOR_RUNTIME_CHANNELS } from "@repo/shared/src/ipc/channels"` 相当）の形式を設計する
3. `ALLOWED_ON_CHANNELS` が 3 チャンネルを参照している箇所を確認し、import 変更後も参照が壊れないことを設計で保証する
4. `IPC_CHANNELS` スプレッドへの組み込み設計（既存の `...APPROVAL_CHANNELS` 等と同形式）を確定する
5. 変更差分の最小化方針（既存コード行数への影響）を design.md に記録する

**期待される成果物**:

- `outputs/phase-2/design.md`（preload 変更設計を含む）

---

### タスク3: テスト設計

**目的**: Phase 4 で作成するテストケースの設計を確定し、validation-matrix.md に記録する

**実行手順**:

1. 以下のテストファイルの追加・修正対象を決定する:
   - `packages/shared/src/ipc/__tests__/channels.test.ts`: SKILL_CREATOR_RUNTIME_CHANNELS の値・型テスト
   - `apps/desktop/src/main/services/runtime/__tests__/governance-bundle.test.ts`: cross-layer parity テスト
2. TC-01〜TC-09 の各テストケースについて、テスト実装の疑似コードを validation-matrix.md に記録する
3. テストが「実装前は失敗（Red）、実装後は成功（Green）」となることを設計で保証する
4. テスト間の依存関係（shared test が pass しないと parity test が無意味になること等）を記録する
5. Phase 6 で追加する `apps/desktop/src/preload/channels.test.ts` の allowlist 回帰テストとの依存関係を記録する
6. topology-diagram.md にチャンネル定義の依存トポロジー（shared → preload → IPC handler）を記録する

**テストケース設計一覧**:

| TC ID | テスト対象ファイル                                                           | テスト内容                                               |
| ----- | ---------------------------------------------------------------------------- | -------------------------------------------------------- |
| TC-01 | `packages/shared/src/ipc/__tests__/channels.test.ts`                         | SKILL_CREATOR_PROGRESS の文字列値検証                    |
| TC-02 | `packages/shared/src/ipc/__tests__/channels.test.ts`                         | SKILL_CREATOR_WORKFLOW_STATE_CHANGED の文字列値検証      |
| TC-03 | `packages/shared/src/ipc/__tests__/channels.test.ts`                         | SKILL_CREATOR_ADAPTER_STATUS_CHANGED の文字列値検証      |
| TC-04 | `packages/shared/src/ipc/__tests__/channels.test.ts`                         | IPC_CHANNELS.SKILL_CREATOR_PROGRESS の shared 値との一致 |
| TC-05 | `packages/shared/src/ipc/__tests__/channels.test.ts`                         | IPC_CHANNELS.SKILL_CREATOR_WORKFLOW_STATE_CHANGED の一致 |
| TC-06 | `packages/shared/src/ipc/__tests__/channels.test.ts`                         | IPC_CHANNELS.SKILL_CREATOR_ADAPTER_STATUS_CHANGED の一致 |
| TC-07 | `apps/desktop/src/main/services/runtime/__tests__/governance-bundle.test.ts` | preload SKILL_CREATOR_PROGRESS の parity 検証            |
| TC-08 | `apps/desktop/src/main/services/runtime/__tests__/governance-bundle.test.ts` | preload SKILL_CREATOR_WORKFLOW_STATE_CHANGED の parity   |
| TC-09 | `apps/desktop/src/main/services/runtime/__tests__/governance-bundle.test.ts` | preload SKILL_CREATOR_ADAPTER_STATUS_CHANGED の parity   |

**期待される成果物**:

- `outputs/phase-2/validation-matrix.md`
- `outputs/phase-2/topology-diagram.md`

---

## 参照資料

| 参照資料                   | パス                                                                                    | 内容                           |
| -------------------------- | --------------------------------------------------------------------------------------- | ------------------------------ |
| shared channels.ts         | `packages/shared/src/ipc/channels.ts`                                                   | 設計対象の current code        |
| preload channels.ts        | `apps/desktop/src/preload/channels.ts`                                                  | 設計対象の current code        |
| Phase 1 成果物             | `outputs/phase-1/requirements-summary.md`                                               | drift チャンネル一覧・文字列値 |
| Phase 1 受入基準           | `outputs/phase-1/acceptance-criteria.md`                                                | AC-1〜AC-7                     |
| 先行タスク仕様書           | `docs/30-workflows/completed-tasks/step-ut-sdk-07-shared-ipc-channel-contract/index.md` | 移行パターンの参考             |
| task-specification-creator | `.claude/skills/task-specification-creator/SKILL.md`                                    | Phase テンプレート             |

## 成果物

| 成果物            | パス                                   | 内容                                                    |
| ----------------- | -------------------------------------- | ------------------------------------------------------- |
| design            | `outputs/phase-2/design.md`            | shared 追加設計・preload 変更設計・テスト設計           |
| validation-matrix | `outputs/phase-2/validation-matrix.md` | TC-01〜TC-09 テストケース疑似コード・判定基準           |
| topology-diagram  | `outputs/phase-2/topology-diagram.md`  | チャンネル定義の依存トポロジー（shared → preload 方向） |

## 統合テスト連携

- TC-01〜TC-09 のテスト設計が Phase 4 の Red フェーズで直接利用される
- cross-layer parity テストの設計により、AC-5 の達成可否を Phase 4 で検証できるようにする
- topology-diagram により Phase 5 実装者が変更範囲を把握できるようにする

## 完了条件

- [ ] SKILL_CREATOR_RUNTIME_CHANNELS の型定義が設計されている
- [ ] IPC_CHANNELS スプレッドへの追加方法が設計されている
- [ ] preload import 変更設計が design.md に記録されている
- [ ] ALLOWED_ON_CHANNELS への影響がないことが設計で確認されている
- [ ] parity テスト設計（TC-01〜TC-09）が validation-matrix.md に記録されている
- [ ] topology-diagram.md が生成されている
- [ ] 全成果物が outputs/phase-2/ に生成されている

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

## 依存関係

- **前提**: Phase 1（要件定義）完了
- **後続**: Phase 3（設計レビューゲート）へ進む

## 次のPhase

完了後、以下のファイルを実行してください:
`docs/30-workflows/ut-sdk-07-shared-ipc-channel-contract-001/phase-3-design-review.md`
