# Phase 1: 要件定義

## メタ情報

| 項目   | 値                        |
| ------ | ------------------------- |
| Phase  | 1                         |
| 機能名 | approval-request-producer |
| 作成日 | 2026-04-01                |

## 目的

`HooksFactory.createPreToolUseHook()` 内の危険コマンド検出後に `pushApprovalRequest()` を呼び出す producer を接続するために必要な要件・受入基準を確定する。

---

## 実行タスク

- P50 チェック: 対象ファイルの実装状態を確認し、既実装コードの重複作成を防止する
- 受入基準作成: AC-1〜AC-5 を検証可能な形で定義する
- 影響ファイル一覧: 変更・追加対象ファイルを確定する
- Phase 4 開始条件: Phase 3 PASS 後のみ Phase 4 へ進む gate を明記する

---

## Step 0: P50 チェック（既実装状態の確認）

### 確認コマンド

```bash
# HooksFactory.ts の最近のコミット履歴
git log --oneline -10 -- apps/desktop/src/main/services/agent/HooksFactory.ts

# pushApprovalRequest の実装確認
grep -n "pushApprovalRequest" apps/desktop/src/main/services/agent/HooksFactory.ts

# TODO(human) の確認
grep -n "TODO(human)" apps/desktop/src/main/services/agent/HooksFactory.ts

# HooksFactory コンストラクタの確認
grep -n "approvalGate\|sessionId" apps/desktop/src/main/services/agent/HooksFactory.ts
```

### 確認結果

| 確認項目                                   | 状態     | 詳細                                                                                       |
| ------------------------------------------ | -------- | ------------------------------------------------------------------------------------------ |
| `pushApprovalRequest()` 実装               | 実装済み | `approvalHandlers.ts` 行 23-37 に実装済み                                                  |
| IPC チャンネル `APPROVAL_REQUEST`          | 登録済み | `ALLOWED_ON_CHANNELS` に登録済み                                                           |
| `HooksFactory` コンストラクタ拡張          | 実装済み | `approvalGate: IApprovalGate` と `sessionId: string` をコンストラクタで受け取る構造が完成  |
| `createPreToolUseHook` の接続              | 未実装   | `TODO(human)` が行 189-200 に設置済み、`pushApprovalRequest` 呼び出しが未実装              |
| DI チェーン (AgentExecutor → HooksFactory) | 完了     | `AgentExecutor.ts` 行 60-65 で `approvalGate` と `executionId` (sessionId 兼用) が渡される |
| `registerApprovalHandlers` 登録            | 完了     | `ipc/index.ts` 行 907-910 で登録済み                                                       |

**P50 チェック結論**: 骨格実装・DI チェーンは完了済み。`createPreToolUseHook()` 内の `TODO(human)` 箇所への `pushApprovalRequest` 呼び出し実装のみが未完成。

---

## 機能要件

| ID    | 要件                                                                                                            | 優先度 |
| ----- | --------------------------------------------------------------------------------------------------------------- | ------ |
| FR-01 | 危険コマンド検出時に `pushApprovalRequest(this.mainWindow, {...})` が呼ばれること                               | must   |
| FR-02 | `operationId` は `uuidv4()` で生成されること                                                                    | must   |
| FR-03 | ペイロードに `sessionId: this.sessionId` が含まれること                                                         | must   |
| FR-04 | ペイロードに `operationType: "dangerous_bash_command"` が含まれること                                           | must   |
| FR-05 | `mainWindow` が破棄済みの場合は `pushApprovalRequest` が例外を投げずに終了すること（既存ガードを利用）          | must   |
| FR-06 | 安全なコマンドでは `pushApprovalRequest` が呼ばれないこと                                                       | must   |
| FR-07 | 複数の危険パターンに該当するコマンドでは最初のマッチのみで `pushApprovalRequest` が呼ばれること（二重送信なし） | should |

## 非機能要件

| ID     | 要件                                                                                                                         | 優先度 |
| ------ | ---------------------------------------------------------------------------------------------------------------------------- | ------ |
| NFR-01 | 主要な producer 実装は `HooksFactory.ts` に集約し、`approvalGate` / `sessionId` の伝搬は必要最小限のチェーン更新に留めること | must   |
| NFR-02 | 既存の `HooksFactory.test.ts` テストが引き続き PASS すること                                                                 | must   |
| NFR-03 | `approvalHandlers.ts` は変更しないこと（`pushApprovalRequest()` は既に正しく実装済み）                                       | must   |
| NFR-04 | `SkillCreatorHooksFactory.ts` は変更しないこと（監査専用・SRP を維持）                                                       | must   |

---

## 受入基準

| ID   | 基準                                                                                                                                                  | 確認方法                                                                                        |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| AC-1 | `HooksFactory.createPreToolUseHook()` が危険コマンド検出後に `pushApprovalRequest` を呼ぶこと                                                         | ユニットテスト `HooksFactory.producer.test.ts`                                                  |
| AC-2 | ペイロードに `sessionId`（コンストラクタ注入値）と `operationId`（非空文字列）が含まれること                                                          | ユニットテスト `HooksFactory.producer.test.ts`                                                  |
| AC-3 | `operationId` が `uuidv4()` で生成された UUID 形式であること                                                                                          | ユニットテスト `HooksFactory.producer.test.ts`                                                  |
| AC-4 | 既存 `approvalHandlers.push.test.ts` と `index.integration.test.ts` が継続 PASS し、`HooksFactory.producer.test.ts` が危険コマンド発火を検証すること  | `approvalHandlers.push.test.ts` / `index.integration.test.ts` / `HooksFactory.producer.test.ts` |
| AC-5 | `approvalGate` / `sessionId` が DI チェーン（`index.ts` → `agentHandlers` → `ExecutionManager` → `AgentExecutor` → `HooksFactory`）経由で渡されること | コードレビュー・既存テスト PASS 確認                                                            |

---

## 影響ファイル一覧

| ファイル                                                                       | 変更種別     | 理由                                                  |
| ------------------------------------------------------------------------------ | ------------ | ----------------------------------------------------- |
| `apps/desktop/src/main/services/agent/HooksFactory.ts`                         | 修正（主要） | `createPreToolUseHook()` 内の producer 接続           |
| `apps/desktop/src/main/services/agent/AgentExecutor.ts`                        | 修正         | `approvalGate` / `sessionId` を `HooksFactory` へ伝搬 |
| `apps/desktop/src/main/services/agent/ExecutionManager.ts`                     | 修正         | `approvalGate` を `AgentExecutor` へ伝搬              |
| `apps/desktop/src/main/ipc/agentHandlers.ts`                                   | 修正         | `approvalGate` を `ExecutionManager` へ伝搬           |
| `apps/desktop/src/main/ipc/index.ts`                                           | 修正         | `DefaultApprovalGate` の生成と共有                    |
| `apps/desktop/src/main/services/agent/__tests__/HooksFactory.producer.test.ts` | 新規         | `HooksFactory` の producer 単体テスト                 |
| `apps/desktop/src/main/services/agent/__tests__/HooksFactory.test.ts`          | 修正         | 新コンストラクタ引数の後方互換確認                    |
| `apps/desktop/src/main/services/agent/__tests__/AgentExecutor.test.ts`         | 修正         | 新コンストラクタ引数の後方互換確認                    |
| `apps/desktop/src/main/services/agent/__tests__/ExecutionManager.test.ts`      | 修正         | `approvalGate` 引数の後方互換確認                     |
| `apps/desktop/src/main/services/agent/__tests__/integration.test.ts`           | 修正         | `registerAgentExecutionHandlers` の引数変更追従       |
| `apps/desktop/src/main/ipc/__tests__/agentHandlers.test.ts`                    | 修正         | `approvalGate` 注入の追従                             |
| `apps/desktop/src/main/ipc/__tests__/agentHandlers.runtime.test.ts`            | 修正         | `approvalGate` 注入の追従                             |

**変更しないファイル:**

| ファイル                                                           | 理由                                                 |
| ------------------------------------------------------------------ | ---------------------------------------------------- |
| `apps/desktop/src/main/ipc/approvalHandlers.ts`                    | `pushApprovalRequest()` は既存実装をそのまま利用する |
| `apps/desktop/src/main/services/agent/SkillCreatorHooksFactory.ts` | 監査専用・SRP 維持のため変更しない                   |

---

## 参照資料

| 資料名              | パス                                                                                      | 説明                                 |
| ------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------ |
| HooksFactory.ts     | `apps/desktop/src/main/services/agent/HooksFactory.ts`                                    | 主要修正対象（TODO(human) 設置済み） |
| approvalHandlers.ts | `apps/desktop/src/main/ipc/approvalHandlers.ts`                                           | `pushApprovalRequest()` 実装済み     |
| AgentExecutor.ts    | `apps/desktop/src/main/services/agent/AgentExecutor.ts`                                   | HooksFactory 呼び出し元              |
| 既存設計書          | `docs/30-workflows/unassigned-task/UT-IMP-SAFETY-GOV-PUSH-REQUEST-PRODUCER-001-design.md` | 詳細設計・判断根拠                   |

---

## 統合テスト連携【必須】

IPC 接続要件（`APPROVAL_REQUEST` チャンネル・DI フロー）を要件として明記する:

| 判定項目                      | 基準 | 結果           |
| ----------------------------- | ---- | -------------- |
| ユニットテスト Line           | 80%+ | Phase 7 で確認 |
| ユニットテスト Branch         | 60%+ | Phase 7 で確認 |
| ユニットテスト Function       | 80%+ | Phase 7 で確認 |
| IPC 経路テスト（統合）        | 100% | Phase 7 で確認 |
| 正常系シナリオ                | 100% | Phase 7 で確認 |
| 異常系シナリオ（破棄 Window） | 80%+ | Phase 7 で確認 |

---

## 成果物

| 成果物   | パス                      | 説明       |
| -------- | ------------------------- | ---------- |
| 要件定義 | `phase-1-requirements.md` | 本ファイル |

---

## 完了条件

- [x] P50 チェックを実施し、既実装状態が確認されている
- [x] 機能要件（FR-01〜FR-07）が明記されている
- [x] 非機能要件（NFR-01〜NFR-04）が明記されている
- [x] 受入基準（AC-1〜AC-5）が検証可能な形で定義されている
- [x] 影響ファイル一覧が確定されている
- [x] Phase 4 は Phase 3 PASS 後のみ開始する gate が明記されている
- [x] **本 Phase 内の全タスクを 100% 実行完了**

---

## Phase 4 開始条件

**Phase 4 への進行は Phase 3（設計レビューゲート）が PASS 判定を得た後のみ許可される。**

Phase 3 で MAJOR 指摘が発生した場合:

- MAJOR: 設計変更 → Phase 2 へ戻る
- MAJOR: 要件変更 → 本 Phase 1 へ戻る

## 次の Phase

Phase 2: 設計 → [phase-2-design.md](phase-2-design.md)
