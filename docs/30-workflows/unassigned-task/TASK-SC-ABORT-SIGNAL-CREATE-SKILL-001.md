# TASK-SC-ABORT-SIGNAL-CREATE-SKILL-001: AbortSignal を createSkill() に直接接続してキャンセル即時反映を実現する

## メタ情報

- **タスクID**: TASK-SC-ABORT-SIGNAL-CREATE-SKILL-001
- **タイトル**: AbortSignal を createSkill() に直接接続してキャンセル即時反映を実現する
- **優先度**: Medium
- **種別**: 機能改善
- **ステータス**: 未着手
- **検出元**: TASK-SW-CANCEL-004 Phase 12 未タスク検出
- **関連タスク**:
  - TASK-SW-CANCEL-001〜004（キャンセル機能実装シリーズ）
  - TASK-SC-11-ABORT-CONTROLLER-PLAN-CANCEL（planSkill/executePlan IPCキャンセル）
- **関連ファイル**:
  - `apps/desktop/src/main/services/skill/SkillCreatorService.ts`
  - `apps/desktop/src/main/services/skill/ScriptExecutor.ts`
  - `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts`
  - `apps/desktop/src/main/services/skill/__tests__/ScriptExecutor.test.ts`

## 目的

`cancelCurrentOperation()` の `AbortController.abort()` が `createSkill()` 内部の各処理ステップに即座に伝播するよう実装し、キャンセル遅延を排除する。

現状は `ScriptExecutor.execute()` に `AbortSignal` を渡せる仕組みが整っており、`createSkill()` 内の主要ステップには `throwIfAborted()` チェックが配置されている。しかし、モード別ワークフロー関数（`runCollaborativeWorkflow`・`runOrchestrateWorkflow`・`runCreateWorkflow`）へ `AbortSignal` が伝播していないため、これらの内部で重い処理が発生した場合にキャンセルが遅れる可能性がある。本タスクでは、これら未接続箇所を特定・修正し、キャンセルボタン押下から 500ms 以内に `createSkill()` が中断されることを保証する。

## 背景

TASK-SW-CANCEL-003 により `SkillCreatorService` に `currentAbortController` が導入され、`cancelCurrentOperation()` から `abort()` を呼び出す仕組みが実装された。また `ScriptExecutor.execute()` には `options.signal` が既に対応済みであり、SIGTERMでプロセスを中断できる。

しかし以下の問題が残存している:

1. **モード別ワークフロー関数への AbortSignal 未伝播**: `runCollaborativeWorkflow`・`runOrchestrateWorkflow`・`runCreateWorkflow` はいずれも `AbortSignal` を引数に取らない。将来これらの関数内で I/O やスクリプト実行が追加された場合、キャンセルが機能しない。

2. **ステップ間チェックポイントの不足箇所**: 現在 `createSkill()` 内には複数の `throwIfAborted()` 呼び出しがあるが、`switch` ブロック内（モード分岐後・ワークフロー関数内）には伝播がない。

3. **`runCreateWorkflow` 内の将来リスク**: 現状は同期的な処理のみだが、LLM 統合（別タスク予定）が追加された際に AbortSignal が未接続のままになる可能性がある。

### 既存タスクとの違い

| タスク                                  | 対象                                                                                 |
| --------------------------------------- | ------------------------------------------------------------------------------------ |
| TASK-SC-11-ABORT-CONTROLLER-PLAN-CANCEL | `planSkill` / `executePlan` の IPC 呼び出しキャンセル（Renderer → Main の IPC 層）   |
| 本タスク                                | `createSkill()` 内部でのメインプロセス処理への AbortSignal 伝播（Main Process 内部） |

## 実行タスク

### Phase 1: 現状調査・問題箇所の特定

- [ ] `createSkill()` の全ステップをトレースし、AbortSignal が届いていない処理を一覧化する
- [ ] `runCollaborativeWorkflow`・`runOrchestrateWorkflow`・`runCreateWorkflow` の各シグネチャを確認する
- [ ] `ScriptExecutor.execute()` および `executeJson()` における AbortSignal 対応状況を再確認する
- [ ] 既存テスト（`SkillCreatorService.test.ts`）のキャンセル関連テストケースを把握する

### Phase 2: シグネチャ変更設計

- [ ] `runCollaborativeWorkflow(options, signal?)` — `AbortSignal` を省略可能引数として追加する設計を策定する
- [ ] `runOrchestrateWorkflow(options, signal?)` — 同上
- [ ] `runCreateWorkflow(options, signal?)` — 同上（将来の LLM 統合を見据えた設計）
- [ ] 下位互換性を維持しつつシグネチャ変更する方針を決定する（省略可能引数として追加）

### Phase 3: createSkill() 内の AbortSignal 伝播実装

- [ ] `switch (options.mode)` ブロック内の各 `case` で、ワークフロー関数に `operationSignal` を渡すよう修正する
- [ ] `runCollaborativeWorkflow` 内で `this.executeScript()` を呼ぶ箇所に `signal` を接続する（現状は `void hearingAgent` のみだが将来の実装に備える）
- [ ] `runOrchestrateWorkflow` 内で同様に `signal` を引き回す
- [ ] `runCreateWorkflow` 内で `signal` を受け取り、将来の I/O 処理に備えて `throwIfAborted(signal)` を先頭に配置する

### Phase 4: チェックポイント追加

- [ ] `switch` ブロック終了直後（既存の `this.throwIfAborted(operationSignal)` と重複しない位置）に追加が必要かレビューする
- [ ] `generateSkillMd` → `ensureSkillMdExists` のフォールバックパスで `throwIfAborted` が正しく機能しているか確認する
- [ ] `generateTaskSpecs` でのキャンセル動作を確認する

### Phase 5: テスト実装

- [ ] `createSkill()` 呼び出し直後にキャンセルしたとき AbortError がスローされることを検証するテストを追加する
- [ ] `runCreateWorkflow` 内で `signal` が aborted 状態の場合に即座に AbortError を返すユニットテストを追加する
- [ ] `runCollaborativeWorkflow` / `runOrchestrateWorkflow` に `signal` を渡したとき伝播することを検証するテストを追加する
- [ ] 各ステップ（init_skill, generate_skill_md, generate_task_specs, validate_all）実行中のキャンセルを模擬するテストを追加する
- [ ] キャンセル後の再実行が正常に動作することを確認するテストを追加する

### Phase 6: 統合検証

- [ ] `cancelCurrentOperation()` → `abort()` → `createSkill()` 中断の E2E 経路を手動で確認する
- [ ] 500ms タイムアウト基準を満たすかタイミング検証を行う
- [ ] AbortError がフロントエンドに正しく伝播し、エラーメッセージが表示されないことを確認する（ユーザー起因キャンセルは静かに終了する）

## 完了条件

- [ ] キャンセルボタン押下後 500ms 以内に `createSkill()` が中断（AbortError throw）されること
- [ ] `runCollaborativeWorkflow`・`runOrchestrateWorkflow`・`runCreateWorkflow` がいずれも `AbortSignal` を受け取るシグネチャになっていること
- [ ] `createSkill()` 内の全スクリプト実行呼び出し（`executeScript` / `executeJson` 相当）に `operationSignal` が渡されていること
- [ ] キャンセル後に AbortError がユーザー向けエラーメッセージとして表示されないこと
- [ ] キャンセル後に `createSkill()` を再度呼び出すと正常に完了できること
- [ ] TypeScript 型チェック PASS
- [ ] 関連ユニットテスト全件 PASS

## 苦戦箇所メモ

- **AbortController 二重登録の罠**: `createSkill()` が呼ばれるたびに `new AbortController()` が `currentAbortController` に上書きされる実装になっている。並列呼び出しが発生した場合、前の操作の AbortController が null にリセットされ、キャンセルできなくなる可能性がある。本タスクのスコープ外だが、将来タスクとして記録しておく。
- **省略可能引数での下位互換**: 既存の `runCreateWorkflow(options)` 呼び出し箇所が1箇所しかないため、省略可能引数 `signal?: AbortSignal` として追加するのが最小変更。ただしテストで `undefined` を渡す場合の `throwIfAborted(undefined)` が例外を投げないことを確認する（既存の `throwIfAborted` は `signal?.aborted` でガード済み）。
- **CANCEL実装でAbortControllerを導入した際の検証漏れ**: TASK-SW-CANCEL-003/004 でAbortControllerを導入した際、`createSkill()` 内の主要ステップには `throwIfAborted()` が追加されたが、モード別ワークフロー関数の内部への伝播が未実装であることが Phase 12 レビューで判明した。これは「ステップ間チェックはあるが、ステップ内部のサブ処理へは未接続」という見落としパターンである。

## 参照

- TASK-SW-CANCEL-003（AbortController 導入・`cancelCurrentOperation()` 実装）
- TASK-SW-CANCEL-004 Phase 12（本タスクの検出元）
- TASK-SC-11-ABORT-CONTROLLER-PLAN-CANCEL（IPC 層でのキャンセル、本タスクとは異なるレイヤー）
- `apps/desktop/src/main/services/skill/SkillCreatorService.ts`（`createSkill` / `runCreateWorkflow` 実装）
- `apps/desktop/src/main/services/skill/ScriptExecutor.ts`（`execute()` の AbortSignal 対応実装）
