# Phase 3 設計レビュー — IPC 4層整合性修正

## メタ情報

| 項目           | 値                                           |
| -------------- | -------------------------------------------- |
| ドキュメントID | UT-IMP-IPC-4LAYER-ALIGNMENT-CI-001-PH3       |
| 作成日         | 2026-04-15                                   |
| ステータス     | Draft                                        |
| 担当フェーズ   | Phase 3（設計レビュー）                      |
| 前提フェーズ   | Phase 1（要件定義）・Phase 2（設計）完了済み |
| 後続フェーズ   | Phase 4（実装）                              |

---

## 1. Phase 1-2 完成確認

### 1.1 Phase 1 要件定義書（phase-1-requirements.md）

| 確認項目                                                                     | 状態 | 備考                                                                       |
| ---------------------------------------------------------------------------- | ---- | -------------------------------------------------------------------------- |
| タスクID・目的・背景が明記されている                                         | 完了 | `UT-FIX-IPC-PRELOAD-CHANNEL-SYNC-001` / `UT-FIX-IPC-MAIN-HANDLER-IMPL-001` |
| Rule-1 違反 12チャネルの具体的リストが記載されている                         | 完了 | グループ別に表形式で整理済み                                               |
| Rule-2 違反 8チャネルの具体的リストが記載されている                          | 完了 | Auth/Settings/Agent に分類済み                                             |
| スコープ（含む/含まない）が明確に定義されている                              | 完了 | Rule-3 修正・新機能追加をスコープ外と明示                                  |
| 受け入れ条件に `node scripts/verify-ipc-4layer.cjs` の PASS が明記されている | 完了 | 主要・副次の両条件を記載                                                   |
| 依存関係（なし）が記載されている                                             | 完了 | TASK-1/TASK-2 の独立性も記載                                               |
| 優先度・緊急度が記載されている                                               | 完了 | High/High                                                                  |

### 1.2 Phase 2 設計書（phase-2-design.md）

| 確認項目                                                  | 状態 | 備考                                                                            |
| --------------------------------------------------------- | ---- | ------------------------------------------------------------------------------- |
| TASK-1/TASK-2 の並列実行可否が明記されている              | 完了 | 「完全に独立しており、並列実行可能」と明記                                      |
| TASK-1 の変更対象ファイルが1ファイルに限定されている      | 完了 | `apps/desktop/src/preload/channels.ts` のみ                                     |
| TASK-2 の各チャネルに対して追加先ファイルが指定されている | 完了 | 全8チャネルについて追加先と実装パターンを記載                                   |
| チャネルの invoke/on 方向性が根拠とともに記載されている   | 完了 | shared 定数コメントの「Renderer → Main」「Main → Renderer」を根拠とする旨を記載 |
| リスク・制約事項が記載されている                          | 完了 | 5件のリスクと制約事項を記載                                                     |
| 検証手順が記載されている                                  | 完了 | TASK-1完了後・TASK-2完了後・両完了後の3段階                                     |

---

## 2. ゲートチェックリスト

### 2.1 受け入れ条件の妥当性

| チェック項目                                                                   | 判定           | 所見                                                                                                                                                                                |
| ------------------------------------------------------------------------------ | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `node scripts/verify-ipc-4layer.cjs` の Rule-1 PASS は TASK-1 完了で達成可能か | OK             | ALLOWED_ON_CHANNELS / ALLOWED_INVOKE_CHANNELS への追加で検証スクリプトの Rule-1 判定が PASS になる。スクリプトの `parsePreloadWhitelist` は spread と IPC_CHANNELS 参照を解決できる |
| `node scripts/verify-ipc-4layer.cjs` の Rule-2 PASS は TASK-2 完了で達成可能か | OK             | `parseMainHandlers` は `ipcMain.handle(IPC_CHANNELS.KEY, ...)` パターンを認識する。TASK-2 の実装パターンに従えば検出される                                                          |
| TypeScript 型チェック・lint・既存テストの通過は現実的か                        | OK（条件付き） | settings は storeHandlers.ts に集約するため追加サービス前提は不要。Phase 2 の「リスク」欄で過剰分割回避を記載済み                                                                   |
| 受け入れ条件が単体テストで独立検証可能か                                       | OK             | `verify-ipc-4layer.cjs` 自体が単体実行可能なスクリプトであり、CI 依存なしに手元で検証できる                                                                                         |

### 2.2 設計の一貫性

| チェック項目                                                                | 判定 | 所見                                                                                                   |
| --------------------------------------------------------------------------- | ---- | ------------------------------------------------------------------------------------------------------ |
| TASK-1 の追加チャネルと Rule-1 違反リスト（Phase 1）が一致しているか        | OK   | 12チャネルのうち `skill-creator:configure-api`（既登録済み）を除外した正確な対象を設計書に記載している |
| TASK-2 の追加ハンドラと Rule-2 違反リスト（Phase 1）が一致しているか        | OK   | 8チャネルすべてに追加先ファイルと実装パターンを対応付けている                                          |
| TASK-1 と TASK-2 が同一ファイルに触れないことが保証されているか             | OK   | TASK-1 は preload、TASK-2 は main/ipc のみを対象としており、ファイルの競合は発生しない                 |
| shared の channels.ts を変更しないという制約が守られているか                | OK   | Phase 1 スコープ外として明示。Phase 2 設計書でも変更対象ファイルに含めていない                         |
| セキュリティ要件（`auth:test-callback` の本番制限）が設計に反映されているか | OK   | Phase 2 の 3.3.2 節で `process.env.NODE_ENV !== 'production'` ガードを必須と明記                       |

### 2.3 リスク対応

| リスク                                                | Phase 2 での対策                                        | 対応充足度 |
| ----------------------------------------------------- | ------------------------------------------------------- | ---------- |
| `agent:get-skills` と `skill:list` の重複メンテナンス | 内部委譲パターンを推奨と記載                            | 充足       |
| settings を新規ファイルへ分割する                     | storeHandlers.ts に集約し、追加ファイルを作らないと記載 | 充足       |
| `auth:start-oauth-flow` と `auth:login` の責務競合    | authHandlers.ts の既存実装参照を推奨と記載              | 充足       |
| verify スクリプトでのキー解決失敗                     | ローカル実行での確認を検証手順に明記                    | 充足       |
| `auth:test-callback` の本番セキュリティリスク         | 環境変数ガードを必須として設計に明記                    | 充足       |

### 2.4 実装可能性

| チェック項目                                             | 判定 | 所見                                                                                         |
| -------------------------------------------------------- | ---- | -------------------------------------------------------------------------------------------- |
| 実装者が単独でタスクを実行できる粒度か                   | OK   | 各ハンドラに実装パターン（TypeScript スニペット）と引数・戻り値の型方針を明記                |
| 外部サービスや環境への依存が設計書内で把握されているか   | OK   | Electron ipcMain、BrowserWindow、SupabaseClient、ExecutionManager など既存の依存を示している |
| `--no-verify` 禁止などプロジェクト制約との整合性があるか | OK   | Phase 2 制約事項に明記                                                                       |

---

## 3. Phase 4 以降への移行判定

### 3.1 判定結果

```
GO
```

### 3.2 判定根拠

- Phase 1 の要件定義書は、修正すべき違反チャネルを具体的なグループ・チャネル文字列・方向性まで特定している
- Phase 2 の設計書は、変更対象ファイル・追加位置・実装パターンを単独実行可能な粒度で記述している
- TASK-1 と TASK-2 が独立しており、並列実行によって実装期間を短縮できる
- リスクはすべて設計時点で識別済みであり、対策も設計書内に反映されている
- 既存の `verify-ipc-4layer.cjs` がブラックボックステストとして機能するため、実装完了の客観的判定基準が明確である

### 3.3 Phase 4 実装開始の前提条件

Phase 4（実装）を開始する前に以下を確認すること：

1. **settings 配置の固定**: `settings:get` / `settings:update` は `storeHandlers.ts` に集約するため、新規サービスや新規ファイルの存在確認は不要
2. **CHAT_EXPORT_CHANNELS / FILE_SYSTEM_CHANNELS の import 確認**: `apps/desktop/src/preload/channels.ts` の import 節に両定数が含まれているか確認する
3. **既存ハンドラの重複確認**: `agent:get-skills`、`agent:execute`、`agent:permission-respond` チャネルが既存ファイルのいずれかに既登録されていないかを grep で確認する
4. **agentHandlers.ts の登録関数シグネチャ確認**: `registerAgentExecutionHandlers` の引数（BrowserWindow、approvalGate 等）を確認し、新ハンドラ追加時に必要なサービスが注入されているかを確認する

---

## 4. レビュー所見

### 4.1 設計上の良い点

- **単一責務**: TASK-1 は preload のみ、TASK-2 は main/ipc のみという明確な責務分割ができている
- **並列実行可能**: 依存関係がないため、複数の実装者が同時に作業できる
- **既存パターンの踏襲**: `withValidation` / `validateIpcSender` などの既存セキュリティパターンの使用を指示しており、一貫性が保たれる
- **段階的検証**: TASK-1完了後・TASK-2完了後・両完了後の3段階で検証ステップを設けており、問題の早期発見ができる

### 4.2 設計上の注意点（実装時に留意すること）

- **`agent:execute` の意味的曖昧さ**: preload の定数定義では `AGENT_EXECUTE: "agent:execute"` が存在し、`AGENT_EXECUTION_START: "agent:start"` も別途存在する。両者の役割の違いを `agentHandlers.ts` の既存コードを精読して確認してから実装すること
- **settings チャネルの責務**: `settings:get` / `settings:update` は `storeHandlers.ts` に集約し、専用ファイルを増やさないこと。型定義を追加する場合も既存の store helper を壊さない範囲に留めること
- **`auth:start-oauth-flow` の返却値設計**: PKCE フローではブラウザ起動とコールバック待機が非同期で行われる。`invoke` の返却値として authUrl を返すか、または fire-and-forget として `{ success: true }` を返すかを `AuthFlowOrchestrator` の実装に合わせて選択すること

### 4.3 将来の技術的負債への警告

- Rule-2 違反の根本原因は「preload のホワイトリスト追加時に対応する mainハンドラの実装が行われなかった」ことにある。今後の開発では、新チャネルを preload に追加する際に必ず mainハンドラの実装と shared への追加を同時に行うプロセスを設けることを推奨する
- `verify-ipc-4layer.cjs` の CI ジョブから `continue-on-error: true` を削除するタイミングは、本修正（TASK-1・TASK-2）の CI 通過確認後とすること

---

## 5. 参照ドキュメント

| ドキュメント           | パス                                                            |
| ---------------------- | --------------------------------------------------------------- |
| Phase 1 要件定義書     | `docs/30-workflows/ipc-4layer-fix-lane/phase-1-requirements.md` |
| Phase 2 設計書         | `docs/30-workflows/ipc-4layer-fix-lane/phase-2-design.md`       |
| shared チャネル定義    | `packages/shared/src/ipc/channels.ts`                           |
| preload ホワイトリスト | `apps/desktop/src/preload/channels.ts`                          |
| 検証スクリプト         | `scripts/verify-ipc-4layer.cjs`                                 |
| authHandlers           | `apps/desktop/src/main/ipc/authHandlers.ts`                     |
| agentHandlers          | `apps/desktop/src/main/ipc/agentHandlers.ts`                    |
| storeHandlers          | `apps/desktop/src/main/ipc/storeHandlers.ts`                    |
