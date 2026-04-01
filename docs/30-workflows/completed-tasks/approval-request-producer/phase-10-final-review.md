# Phase 10: 最終レビューゲート

## メタ情報

| 項目   | 値                        |
| ------ | ------------------------- |
| Phase  | 10                        |
| 機能名 | approval-request-producer |
| 作成日 | 2026-04-01                |

## 目的

Phase 1〜9 の全成果物を対象に最終レビューを実施し、Phase 11（手動テスト）への進行可否を判定する。受入基準 AC-1〜AC-5 の全件達成、セキュリティ要件の維持、変更ファイルの最終確認を行う。

---

## 実行タスク

- 受入基準 AC-1〜AC-5 の全件確認
- セキュリティチェック（P42 準拠バリデーション維持確認）
- 変更ファイルの最終確認
- 総合判定（PASS / MINOR / MAJOR）の決定
- Phase 11 開始条件の確認

---

## Step 1: 受入基準 AC-1〜AC-5 の全件確認

| AC ID | 基準                                                                                                                                                  | 確認方法                                                      | 判定   |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ------ |
| AC-1  | `HooksFactory.createPreToolUseHook()` が危険コマンド検出後に `pushApprovalRequest` を呼ぶこと                                                         | ユニットテスト `HooksFactory.producer.test.ts`                | 要確認 |
| AC-2  | ペイロードに `sessionId`（コンストラクタ注入値）と `operationId`（非空文字列）が含まれること                                                          | ユニットテスト `HooksFactory.producer.test.ts`                | 要確認 |
| AC-3  | `operationId` が `uuidv4()` で生成された UUID 形式であること                                                                                          | ユニットテスト `HooksFactory.producer.test.ts`                | 要確認 |
| AC-4  | Main → Preload → Renderer の実発火テスト（`approvalHandlers.push.test.ts`）と `index.integration.test.ts` が継続 PASS すること                        | `approvalHandlers.push.test.ts` / `index.integration.test.ts` | 要確認 |
| AC-5  | `approvalGate` / `sessionId` が DI チェーン（`index.ts` → `agentHandlers` → `ExecutionManager` → `AgentExecutor` → `HooksFactory`）経由で渡されること | コードレビュー・既存テスト PASS 確認                          | 要確認 |

---

## Step 2: セキュリティチェック（P42 準拠バリデーション維持確認）

P42 はプロジェクトのセキュリティ基準（危険コマンドバリデーション）を定義している。本実装が P42 基準を維持していることを確認する。

### 確認観点

| 観点                                             | 確認内容                                                                                                                            | 判定   |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 危険コマンド検出ロジックの維持                   | `DANGEROUS_PATTERNS.BASH_COMMANDS` のチェックが変更されていない                                                                     | 要確認 |
| `return { proceed: false }` の維持               | 危険コマンド検出後に `return { proceed: false }` が呼ばれ続けている（`pushApprovalRequest` 追加前後で `return` が削除されていない） | 要確認 |
| `pushApprovalRequest` の例外ガード               | `mainWindow` 破棄済み時に `pushApprovalRequest` が例外を投げないこと（`approvalHandlers.ts` の既存ガードが維持されている）          | 要確認 |
| `operationType: "dangerous_bash_command"` の明示 | ペイロードに危険コマンド専用の `operationType` が設定されている                                                                     | 要確認 |

### 確認コマンド

```bash
# return { proceed: false } が維持されていることを確認
grep -n "proceed: false" apps/desktop/src/main/services/agent/HooksFactory.ts

# DANGEROUS_PATTERNS が変更されていないことを確認
git diff HEAD -- apps/desktop/src/main/services/agent/HooksFactory.ts | grep "DANGEROUS_PATTERNS"
```

---

## Step 3: 変更ファイルの最終確認リスト

### 変更されたファイル（期待値）

| ファイル                                                                       | 変更種別     | 変更内容                                                         |
| ------------------------------------------------------------------------------ | ------------ | ---------------------------------------------------------------- |
| `apps/desktop/src/main/services/agent/HooksFactory.ts`                         | 修正（主要） | `createPreToolUseHook()` 内に `pushApprovalRequest` 呼び出し追加 |
| `apps/desktop/src/main/services/agent/AgentExecutor.ts`                        | 修正         | `approvalGate` と `sessionId` を HooksFactory へ伝搬             |
| `apps/desktop/src/main/services/agent/ExecutionManager.ts`                     | 修正         | `approvalGate` を AgentExecutor へ伝搬                           |
| `apps/desktop/src/main/ipc/agentHandlers.ts`                                   | 修正         | `approvalGate` を startExecution へ伝搬                          |
| `apps/desktop/src/main/ipc/index.ts`                                           | 修正         | `DefaultApprovalGate` の生成位置と共有を整理                     |
| `apps/desktop/src/main/services/agent/__tests__/HooksFactory.producer.test.ts` | 新規         | `HooksFactory` の producer 単体テスト                            |
| `apps/desktop/src/main/services/agent/__tests__/HooksFactory.test.ts`          | 更新         | 新コンストラクタ引数への追従                                     |
| `apps/desktop/src/main/services/agent/__tests__/AgentExecutor.test.ts`         | 更新         | 新コンストラクタ引数への追従                                     |
| `apps/desktop/src/main/services/agent/__tests__/ExecutionManager.test.ts`      | 更新         | 新コンストラクタ引数への追従                                     |
| `apps/desktop/src/main/services/agent/__tests__/integration.test.ts`           | 更新         | `approvalGate` 注入追従                                          |
| `apps/desktop/src/main/ipc/__tests__/agentHandlers.test.ts`                    | 更新         | `approvalGate` 注入追従                                          |
| `apps/desktop/src/main/ipc/__tests__/agentHandlers.runtime.test.ts`            | 更新         | `approvalGate` 注入追従                                          |

### 変更されていないファイル（確認必須）

```bash
# 変更されていないことを確認（空の diff が期待値）
git diff HEAD -- apps/desktop/src/main/ipc/approvalHandlers.ts
git diff HEAD -- apps/desktop/src/main/services/agent/SkillCreatorHooksFactory.ts
git diff HEAD -- apps/desktop/src/main/ipc/__tests__/approvalHandlers.push.test.ts
git diff HEAD -- apps/desktop/src/main/ipc/__tests__/index.integration.test.ts
```

| ファイル                                                            | 期待状態 | 判定   |
| ------------------------------------------------------------------- | -------- | ------ |
| `apps/desktop/src/main/ipc/approvalHandlers.ts`                     | 変更なし | 要確認 |
| `apps/desktop/src/main/services/agent/SkillCreatorHooksFactory.ts`  | 変更なし | 要確認 |
| `apps/desktop/src/main/ipc/__tests__/approvalHandlers.push.test.ts` | 変更なし | 要確認 |
| `apps/desktop/src/main/ipc/__tests__/index.integration.test.ts`     | 変更なし | 要確認 |

---

## Step 4: 総合判定

### レビュー観点別判定

| 観点                     | 判定   | 根拠                                             |
| ------------------------ | ------ | ------------------------------------------------ |
| 受入基準 AC-1〜AC-5      | 要確認 | Phase 4〜7 の実装・テスト完了で確認              |
| セキュリティ（P42 準拠） | 要確認 | `return { proceed: false }` 維持・例外ガード維持 |
| 変更スコープ             | 要確認 | producer 本体 + DI チェーン + 回帰テスト群       |
| 品質保証（Phase 9）      | 要確認 | 型チェック・lint・全テスト PASS 確認済み         |
| 回帰リスク               | 要確認 | 既存テスト PASS 確認済み                         |

### 総合判定

**要確認** — Phase 4〜9 の実施後に PASS / MINOR / MAJOR を記入する。

---

## ブロック条件（MAJOR 指摘時の戻り先）

MAJOR 指摘が発生した場合は以下の戻り先に従う:

| MAJOR 指摘種別                                                               | 戻り先                      |
| ---------------------------------------------------------------------------- | --------------------------- |
| 受入基準 AC-1〜AC-3 未達（`pushApprovalRequest` 未呼び出し・ペイロード不正） | Phase 5（実装）             |
| 受入基準 AC-4 未達（IPC 発火テスト失敗）                                     | Phase 4（テスト作成）       |
| 受入基準 AC-5 未達（DI チェーン未接続）                                      | Phase 2（設計）             |
| セキュリティ基準 P42 違反（`return { proceed: false }` 削除等）              | Phase 5（実装）             |
| 型エラー・lint エラーが残存                                                  | Phase 8（リファクタリング） |
| 設計の根本的問題                                                             | Phase 2（設計）             |
| 要件の根本的問題                                                             | Phase 1（要件定義）         |

---

## MINOR 追跡テーブル

Phase 10 実施時に記入する。

| MINOR ID | 指摘内容 | 解決予定 Phase | 解決確認 Phase | 備考 |
| -------- | -------- | -------------- | -------------- | ---- |
| -        | -        | -              | -              | -    |

---

## Phase 11 開始条件確認

| 条件                                 | 状態   |
| ------------------------------------ | ------ |
| Phase 9（品質保証）の全 Step が PASS | 要確認 |
| AC-1〜AC-5 が全件 PASS               | 要確認 |
| セキュリティチェックが PASS          | 要確認 |
| 変更ファイルが期待リストと一致       | 要確認 |
| MAJOR 指摘が 0 件                    | 要確認 |

**Phase 11 への進行は上記全条件が PASS 判定を得た後のみ許可される。**

---

## 参照資料

| 資料名                       | パス                             | 説明                     |
| ---------------------------- | -------------------------------- | ------------------------ |
| phase-1-requirements.md      | `./phase-1-requirements.md`      | 受入基準 AC-1〜AC-5 定義 |
| phase-9-quality-assurance.md | `./phase-9-quality-assurance.md` | 品質保証結果             |

---

## 成果物

| 成果物           | パス                       | 説明       |
| ---------------- | -------------------------- | ---------- |
| 最終レビュー結果 | `phase-10-final-review.md` | 本ファイル |

---

## 完了条件

- [ ] 受入基準 AC-1〜AC-5 が全件確認されている
- [ ] セキュリティチェック（P42 準拠バリデーション維持確認）が実施されている
- [ ] 変更ファイルの最終確認リストが全件チェックされている
- [ ] 総合判定（PASS / MINOR / MAJOR）が記録されている
- [ ] MAJOR 指摘がある場合は戻り先 Phase が指定されている
- [ ] MINOR 追跡テーブルが記載されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

---

## 次の Phase

Phase 11: 手動テスト → [phase-11-manual-test.md](phase-11-manual-test.md)

## 統合テスト連携

- Phase 11 の手動テストで current facts が再現できることを確認する
- Phase 12 の documentation 更新へ引き継ぐ情報を固定する
