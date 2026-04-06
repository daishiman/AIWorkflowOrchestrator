# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                                                   |
| ---------- | ------------------------------------------------------ |
| Phase      | 4                                                      |
| Phase 名   | テスト作成（TDD Red フェーズ）                         |
| 前提 Phase | Phase 3（設計レビューゲート）完了・PASS 判定済み       |
| 後続 Phase | Phase 5（実装）                                        |
| ステータス | 未実施                                                 |
| 作成日     | 2026-04-06                                             |
| 機能名     | task-ut-rt-01-execute-async-snapshot-error-message-001 |

---

## 目的

Phase 3 PASS 判定を受けて、TDD Red フェーズとして失敗する本体テスト（T-01〜T-04）を設計し、Phase 5 実装の検証基準を確定する。Phase 6 の branch/regression テストと責務を分離することで、最小の複雑性で bug を直接捕捉できる状態を作る。

---

## 事前確認: Phase 1 命名規則 inventory との整合

Phase 1 で確定した命名規則（camelCase）との整合を Phase 4 テスト設計時に確認する。

| カテゴリ               | 命名パターン | Phase 4 での適用例                                                          |
| ---------------------- | ------------ | --------------------------------------------------------------------------- |
| メソッド名             | camelCase    | `executeAsync`, `onWorkflowStateSnapshot`, `createFacade`                   |
| 変数名                 | camelCase    | `planId`, `snapshotSpy`, `executeMock`, `workflowEngine`                    |
| 型名                   | PascalCase   | `RuntimeSkillCreatorExecuteErrorResponse`, `SkillCreatorWorkflowUiSnapshot` |
| テストケース ID        | 大文字英数字 | `T-01`, `T-02`, `T-03`, `T-04`                                              |
| describe / it ブロック | 日本語       | 既存テストファイルのスタイルに合わせる                                      |

**整合確認**: Phase 1 inventory と整合済み。Phase 4 で追加するテストケースは T-01〜T-04 に限定する。

---

## 事前確認: 既存テストファイルの確認

### テストファイルの配置

対象ファイル（既存）:
`apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.test.ts`

このファイルはすでに存在し、以下のテストケースが定義済みである:

| 既存テスト ID | 内容                                                               | ステータス     |
| ------------- | ------------------------------------------------------------------ | -------------- |
| TC-T4-01      | executeAsync の成功時に snapshot callback を通知する               | 既存           |
| TC-T4-02      | executeAsync の失敗時（例外）に throw せず failure callback を通知 | 既存           |
| TC-T4-03      | adapter guard で execute が失敗した場合も snapshot callback を通知 | 既存           |
| TC-T4-04      | execute() が structured error を返した場合に error.message を伝搬  | 既存（部分的） |

### 既存テスト TC-T4-04 の現状分析

TC-T4-04 は `execute()` が structured error を返した場合に `snapshotSpy` が呼ばれることを検証しているが、以下の観点が不足している:

- `getWorkflowState()` の返値を制御するモックが含まれていない
- snapshot が null の場合と null 以外の場合の両ケースを分離して検証していない
- `snapshot ?? null` という修正後の動作（snapshot が存在する場合も渡す）を直接検証できていない

Phase 4 では、**T-01〜T-04 の設計仕様**を確定し、Phase 5 で core bug を直接捕捉できるようにする。

---

## 事前確認: IPC レスポンス形式

本タスクで対象とする `onWorkflowStateSnapshot` コールバックのシグネチャ:

```typescript
onWorkflowStateSnapshot?: (
  planId: string,
  snapshot: SkillCreatorWorkflowUiSnapshot | null,
  error?: string, // 第3引数は optional
) => void;
```

テストの期待値はこのシグネチャと一致させる:

- 正常系: 第3引数なし（`undefined`）
- エラー系: 第3引数に `error.message` 文字列

---

## 事前確認: import 副作用チェック

`RuntimeSkillCreatorFacade` のインポートに伴う副作用確認:

- 既存テストファイル（`RuntimeSkillCreatorFacade.executeAsync.test.ts`）が正常にインポートできることは確認済み
- `vi.mock` による `RuntimePolicyResolver.prototype.resolve` のモック化は既存テストで実績あり
- `SkillCreatorWorkflowEngine` の `getWorkflowState` メソッドは `vi.spyOn` でモック可能

---

## テストケース仕様

### T-01: structured error パス - snapshot が存在する場合の error.message 伝搬確認

**対応する AC**: AC-1

**テストの目的**: `execute()` が structured error を返し、`workflowEngine.getWorkflowState()` が snapshot を返した場合でも、`onWorkflowStateSnapshot` が snapshot と `error.message` の両方を受け取ることを検証する。`if (!snapshot)` 条件の削除を直接検証する本体テストである。

**セットアップ**:

- `createFacade()` ヘルパーを使用
- `RuntimePolicyResolver.prototype.resolve` を `vi.spyOn` でモック化し `{ type: "integrated_api", apiKey: "sk-test", permissionMode: "default" }` を返す
- `executeMock.mockResolvedValue` で `{ success: false, error: { code: "llm_adapter_unavailable", message: "APIキーを設定してください" } }` を返す
- `workflowEngine.getWorkflowState` を `vi.spyOn` でモック化し `mockSnapshot` を返す

**期待値**:

- `snapshotSpy` が呼び出された回数: 1回
- 呼び出し引数:
  - 第1引数: `"plan-T01"`
  - 第2引数: `mockSnapshot`
  - 第3引数: `"APIキーを設定してください"`

**TDD Red の根拠**: 修正前の `if (!snapshot)` 条件では、`getWorkflowState` が snapshot を返すケースで `onWorkflowStateSnapshot` が呼ばれないため、このテストは修正前に FAIL し、修正後に PASS する。

---

### T-02: catch パス - snapshot が存在する場合の error.message 伝搬確認

**対応する AC**: AC-2

**テストの目的**: `execute()` が例外をスローし、`workflowEngine.getWorkflowState()` が snapshot を返した場合でも、`onWorkflowStateSnapshot` が snapshot と `errorMessage` の両方を受け取ることを検証する。`if (!snapshot)` 条件の削除を直接検証する本体テストである。

**セットアップ**:

- `createFacade()` ヘルパーを使用
- `RuntimePolicyResolver.prototype.resolve` が `new Error("resolve failed")` をスロー
- `executeMock.mockRejectedValue(new Error("execution failed unexpectedly"))`
- `workflowEngine.getWorkflowState` を `vi.spyOn` でモック化し `mockSnapshot` を返す

**期待値**:

- `phaseSpy` が `"error"` フェーズで呼ばれた
- `snapshotSpy` が呼び出された
- 呼び出し引数:
  - 第1引数: `planId`
  - 第2引数: `mockSnapshot`
  - 第3引数: `"execution failed unexpectedly"`（または `"resolve failed"`）

**TDD Red の根拠**: 修正前の `if (!snapshot)` 条件では、`getWorkflowState` が snapshot を返すケースで `onWorkflowStateSnapshot` が呼ばれないため、このテストは修正前に FAIL し、修正後に PASS する。

---

### T-03: terminal_handoff パス - error 引数なし確認

**対応する AC**: 正常系の回帰確認

**テストの目的**: `execute()` が `{ type: "terminal_handoff", bundle: ... }` を返した場合、`onWorkflowStateSnapshot` の第3引数は `undefined` であり、フェーズが `complete` に遷移することを検証する。

**セットアップ**:

- `createFacade()` ヘルパーを使用
- `RuntimePolicyResolver.prototype.resolve` を `vi.spyOn` でモック化
- `executeMock.mockResolvedValue` で terminal_handoff レスポンスを返す

**期待値**:

- `phaseSpy` が `"complete"` フェーズで呼ばれた
- `snapshotSpy` が呼び出された
- `snapshotSpy` の第3引数: `undefined`

**TDD Red の根拠**: 正常系パスは修正対象外であるため、このテストは修正前後で PASS する（回帰検証）。

---

### T-04: 成功パス - error 引数なし確認

**対応する AC**: 正常系の回帰確認

**テストの目的**: `execute()` が `{ success: true, ... }` などの正常結果を返した場合、`onWorkflowStateSnapshot` の第3引数は `undefined` であり、フェーズが `complete` に遷移することを検証する。

**セットアップ**:

- `createFacade()` ヘルパーを使用
- `executeMock.mockResolvedValue` で `{ executionId: "exec-T04", success: true }` を返す

**期待値**:

- `phaseSpy` が `"complete"` フェーズで呼ばれた
- `snapshotSpy` の第3引数: `undefined`

**TDD Red の根拠**: 正常系パスは修正対象外であるため、このテストは修正前後で PASS する（回帰検証）。

---

## テストのアプローチまとめ

| テスト ID | アプローチ                       | `getWorkflowState` 返値 | 修正前の動作                      | 修正後の動作                  |
| --------- | -------------------------------- | ----------------------- | --------------------------------- | ----------------------------- |
| T-01      | structured error / snapshot あり | non-null snapshot       | snapshotSpy 呼ばれない（**RED**） | snapshotSpy 呼ばれる（GREEN） |
| T-02      | catch / snapshot あり            | non-null snapshot       | snapshotSpy 呼ばれない（**RED**） | snapshotSpy 呼ばれる（GREEN） |
| T-03      | terminal_handoff / normal        | 実際の値                | PASS（回帰）                      | PASS（回帰）                  |
| T-04      | success / normal                 | 実際の値                | PASS（回帰）                      | PASS（回帰）                  |

**中心 Red テスト**: T-01 と T-02 が Phase 5 実装の核心を検証する。T-03〜T-04 は回帰防止テストとして位置づける。Phase 6 では `snapshot ?? null` の null 分岐を補強する追加テストを扱う。

---

## テストファイルの配置

| 種別                           | ファイルパス                                                                                      | アクション                                  |
| ------------------------------ | ------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| 既存テストファイル（追記対象） | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.test.ts` | T-01〜T-04 を既存 `describe` ブロックに追記 |

**方針**: 新規ファイルを作成せず、既存テストファイルに T-01〜T-04 を追記する。`createFacade()` ヘルパーは既存のものを流用し、各テストで `vi.spyOn(workflowEngine, "getWorkflowState")` を追加する。Phase 6 で branch/regression テストを追記する。
