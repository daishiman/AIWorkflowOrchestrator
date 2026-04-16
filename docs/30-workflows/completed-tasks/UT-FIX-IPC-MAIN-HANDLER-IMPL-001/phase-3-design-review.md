# Phase 3 — 設計レビュー

## メタ情報

| 項目           | 値                                    |
| -------------- | ------------------------------------- |
| ドキュメントID | UT-FIX-IPC-MAIN-HANDLER-IMPL-001-PH03 |
| フェーズ       | Phase 3（設計レビュー）               |
| ステータス     | completed                             |
| 前フェーズ     | Phase 2（設計）                       |
| 次フェーズ     | Phase 4（テスト作成）                 |

---

## 1. Phase 1・2 完成確認チェックリスト

### 1.1 Phase 1（要件定義）完成確認

| #   | 確認項目                                            | 確認結果 |
| --- | --------------------------------------------------- | -------- |
| 1   | タスクIDとタスク名が正しく記載されている            | [x]      |
| 2   | 問題の背景（Rule-2違反・8チャネル）が明記されている | [x]      |
| 3   | 未実装チャネル8件が表形式で列挙されている           | [x]      |
| 4   | スコープ（IN/OUT）が明確に定義されている            | [x]      |
| 5   | 受け入れ条件が測定可能な形式で記載されている        | [x]      |
| 6   | 変更対象ファイルが列挙されている                    | [x]      |
| 7   | 依存関係・並列実行可能性が記載されている            | [x]      |
| 8   | 優先度・リスクが記載されている                      | [x]      |

### 1.2 Phase 2（設計）完成確認

| #   | 確認項目                                                                      | 確認結果 |
| --- | ----------------------------------------------------------------------------- | -------- |
| 1   | 設計アプローチ（基本方針・セキュリティ原則）が記載されている                  | [x]      |
| 2   | 8チャネル全ての設計詳細（追加ファイル・委譲先・引数・戻り値）が記載されている | [x]      |
| 3   | 各ハンドラのTypeScriptコードスニペットが記載されている                        | [x]      |
| 4   | 事前確認コマンドが記載されている                                              | [x]      |
| 5   | リスク一覧と対策が記載されている                                              | [x]      |
| 6   | `auth:test-callback` の本番環境ガードが設計に明示されている                   | [x]      |
| 7   | 重複ハンドラ確認の方法が記載されている                                        | [x]      |

---

## 2. ゲートチェック

### 2.1 セキュリティバリデーション計画の妥当性

| チェック項目                                                                      | 判定 | 備考                   |
| --------------------------------------------------------------------------------- | ---- | ---------------------- |
| 全8ハンドラで `validateIpcSender` / `withValidation` を使用する計画になっているか | [ ]  | Phase 2 §2.1〜2.8 参照 |
| `auth:test-callback` の本番環境ガードが**最初のチェック**として設計されているか   | [ ]  | Phase 2 §4.2 参照      |
| `any` 型を使わない方針が明示されているか                                          | [ ]  | Phase 2 §1.2 参照      |
| 入力値バリデーション（型・長さ・形式チェック）が各ハンドラに含まれているか        | [ ]  | Phase 2 §4.x 参照      |

### 2.2 本番ガード設計の妥当性

`auth:test-callback` の本番環境ガードについて以下を確認する。

| チェック項目                                                           | 判定 | 備考                                       |
| ---------------------------------------------------------------------- | ---- | ------------------------------------------ |
| `process.env.NODE_ENV === 'production'` によるガードが設計されているか | [ ]  | Phase 2 §2.2, §4.2 参照                    |
| ガードが IPC Sender Validation より**先**に実行される設計か            | [ ]  | 本番でIPC送信元検証前にFORBIDDENを返すべき |
| ガードのエラーコードが `FORBIDDEN` であることが明示されているか        | [ ]  | Phase 2 §4.2 参照                          |
| ガードをバイパスする経路が設計上存在しないか                           | [ ]  | コードスニペット上で確認                   |

### 2.3 依存サービス存在確認計画

| 依存サービス               | 確認方法                                                                                     | 不在時のフォールバック                    |
| -------------------------- | -------------------------------------------------------------------------------------------- | ----------------------------------------- |
| `AuthFlowOrchestrator`     | `apps/desktop/src/main/auth/authFlowOrchestrator.ts` の `startOAuthFlow` メソッド確認        | N/A（必須、未存在ならビルドエラー）       |
| `settings` 集約方針        | `storeHandlers.ts` へ集約する設計になっているか                                              | 新規 settingsHandlers.ts を作らない       |
| `ExecutionManager`         | `apps/desktop/src/main/services/agent/` 以下を確認                                           | N/A（既存ハンドラが使用中のため確認済み） |
| `ApprovalGate`             | `apps/desktop/src/main/services/runtime/ApprovalGate.ts` の `resolvePermission` メソッド確認 | メソッド名を調査して修正                  |
| `getSkillExecutorInstance` | `apps/desktop/src/main/ipc/skillHandlers.ts` の export確認                                   | N/A（既存exportのため確認済み）           |

---

## 3. 移行判定

### 3.1 判定結果: **GO**

**理由**:

1. **要件定義（Phase 1）が完成している**: 問題の背景・未実装チャネル・受け入れ条件・スコープが明確に定義されており、実装に着手できる十分な情報が揃っている
2. **設計（Phase 2）が完成している**: 8チャネル全てについて追加ファイル・委譲先・引数・戻り値・TypeScriptシグネチャが設計されており、コーディングの指針として機能する
3. **セキュリティ設計が適切**: IPC Sender Validation の全ハンドラ適用と、`auth:test-callback` の本番環境ガードが設計に明示されている
4. **リスクが特定されている**: 重複ハンドラ・settings責務分散・any型・本番ガードの4大リスクに対策が記載されている
5. **依存関係がない**: TASK-1（UT-FIX-IPC-PRELOAD-CHANNEL-SYNC-001）と並列実行可能であり、ブロッカーが存在しない

---

## 4. Phase 4以降実施前の前提確認事項

Phase 4（テスト作成）またはPhase 5（実装）を開始する前に、以下を必ず実行・確認すること。

### 4.1 `authHandlers.ts` の `registerAuthHandlers` 構造確認

```bash
grep -n "registerAuthHandlers\|export function" \
  apps/desktop/src/main/ipc/authHandlers.ts
```

確認ポイント:

- `registerAuthHandlers` 関数が存在するか
- 引数に `mainWindow: BrowserWindow` が含まれているか
- `authFlowOrchestrator` インスタンスを引数で受け取っているか、または内部で生成しているか
- 追加するハンドラが既存 `registerAuthHandlers` 関数の**内部**に収まるか、または別のexport関数として追加すべきか

### 4.2 `agentHandlers.ts` の `registerAgentExecutionHandlers` 構造確認

```bash
grep -n "registerAgentExecutionHandlers\|export function\|ipcMain.handle" \
  apps/desktop/src/main/ipc/agentHandlers.ts | head -30
```

確認ポイント:

- `registerAgentExecutionHandlers` の引数シグネチャ（`mainWindow`, `approvalGate`, `customRules`, `runtimePolicyResolver`, `authModeService`）
- `executionManager` の初期化タイミング
- 既存ハンドラ（`agent:start` 等）との関係
- `agent:execute` と `agent:start` の役割差分

### 4.3 settings 集約方針の確認

```bash
grep -rn "settings:get\|settings:update" \
  apps/desktop/src/main/ipc/storeHandlers.ts
```

確認ポイント:

- `settings:get` / `settings:update` が `storeHandlers.ts` に集約されているか
- `settingsHandlers.ts` を新規作成しない方針になっているか
- `index.ts` の追加登録が不要であることが明記されているか

### 4.4 重複ハンドラの grep 確認

```bash
# 8チャネル全ての重複登録確認（結果が空であれば重複なし）
grep -rn \
  "auth:start-oauth-flow\|auth:test-callback\|settings:get\|settings:update\|agent:get-skills\|agent:get-skill-detail\|agent:execute\|agent:permission-respond" \
  apps/desktop/src/main/ \
  --include="*.ts" \
  | grep "ipcMain.handle"
```

確認ポイント:

- 出力が空であれば安全に実装できる
- 出力がある場合は、既存実装を確認してから方針を決定する（上書き不可、二重登録不可）

### 4.5 `ApprovalGate` のインターフェース確認

```bash
grep -n "resolvePermission\|respond\|approve\|reject" \
  apps/desktop/src/main/services/runtime/ApprovalGate.ts 2>/dev/null \
  || grep -rn "IApprovalGate\|ApprovalGate" \
     apps/desktop/src/main/ --include="*.ts" | head -10
```

確認ポイント:

- `resolvePermission` メソッドが `IApprovalGate` インターフェースに存在するか
- メソッドシグネチャ（引数型: `PermissionResponse` など）
- 存在しない場合はメソッド名を調査して Phase 2 §4.8 のコードスニペットを修正する

---

## 5. レビュー完了後のアクション

Phase 3 のレビューが完了し、上記チェックリストおよびゲートチェックが全て [ ] → [x] に更新されたら、Phase 4（テスト作成）に進む。

前提確認事項（§4.1〜§4.5）で想定外の結果が得られた場合は、Phase 2（設計書）を修正してから再度 Phase 3 レビューを実施する。
