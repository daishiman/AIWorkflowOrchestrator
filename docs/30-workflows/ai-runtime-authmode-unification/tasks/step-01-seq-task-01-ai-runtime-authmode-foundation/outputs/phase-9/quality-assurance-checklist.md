# Phase 9 品質検証チェックリスト

## メタ情報

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| タスクID   | TASK-IMP-AI-RUNTIME-AUTHMODE-UNIFICATION-001 |
| Phase      | 9                                            |
| 成果物種別 | 品質検証チェックリスト                       |
| 作成日     | 2026-03-13                                   |
| 前提       | Phase 8 リファクタリング計画                 |
| 後続       | Phase 10 最終レビュー                        |

---

## 1. Lint チェックリスト

本タスク（Task01）は仕様書・設計成果物の確定のみを行い、プロダクションコードの実装は行わない（制約 C7）。以下のチェック項目は後続タスク（Task02-10）での実装時に適用する基準として定義する。

### 1.1 ESLint

| #    | チェック項目                                                                     | 対象                    | 判定基準                 | 状態 |
| ---- | -------------------------------------------------------------------------------- | ----------------------- | ------------------------ | ---- |
| L-01 | `pnpm lint` が全 PASS であること                                                 | プロジェクト全体        | エラー 0 件              | [ ]  |
| L-02 | 新規ファイル（types.ts, credential-provider.ts 等）に ESLint エラーがないこと    | packages/shared/src/ai/ | エラー 0 件              | [ ]  |
| L-03 | 変更ファイル（LLMAdapterFactory.ts, aiHandlers.ts 等）に ESLint エラーがないこと | apps/desktop/src/main/  | エラー 0 件              | [ ]  |
| L-04 | 未使用 import が残存していないこと                                               | 全変更ファイル          | `no-unused-imports` PASS | [ ]  |
| L-05 | `console.log` / `console.warn` がテスト外のコードに残存していないこと            | 全変更ファイル（P20）   | `no-console` ルール準拠  | [ ]  |

### 1.2 Prettier

| #    | チェック項目                                             | 対象             | 判定基準               | 状態 |
| ---- | -------------------------------------------------------- | ---------------- | ---------------------- | ---- |
| P-01 | `pnpm format:check` が全 PASS であること                 | プロジェクト全体 | フォーマット差分 0 件  | [ ]  |
| P-02 | 新規 Markdown 成果物のフォーマットが Prettier 準拠である | outputs/ 配下    | テーブル整列、改行統一 | [ ]  |

---

## 2. TypeScript 型チェックリスト

### 2.1 型チェック

| #    | チェック項目                                                               | 対象                               | 判定基準                           | 状態 |
| ---- | -------------------------------------------------------------------------- | ---------------------------------- | ---------------------------------- | ---- |
| T-01 | `pnpm typecheck` が全 PASS であること                                      | プロジェクト全体                   | エラー 0 件                        | [ ]  |
| T-02 | `packages/shared` のビルドが成功すること                                   | `pnpm --filter @repo/shared build` | ビルドエラー 0 件                  | [ ]  |
| T-03 | `AIAccessCapability` 型が全レイヤで正しく参照されること                    | packages/shared -> apps/desktop    | import 解決成功                    | [ ]  |
| T-04 | `ICredentialProvider` インターフェースが Main Process で実装可能であること | packages/shared -> apps/desktop    | implements 準拠                    | [ ]  |
| T-05 | `FailFastError` 型が Phase 2 設計の 4 フィールドを持つこと                 | packages/shared/src/ai/types.ts    | error, reason, guidance, retryable | [ ]  |

### 2.2 any / as 使用箇所の確認

| #    | チェック項目                                                                   | 対象           | 判定基準                                           | 状態 |
| ---- | ------------------------------------------------------------------------------ | -------------- | -------------------------------------------------- | ---- |
| T-06 | 新規ファイルに `any` 型が使用されていないこと                                  | 新規全ファイル | `grep -rn 'any' <file>` で 0 件                    | [ ]  |
| T-07 | 新規ファイルに `as` 型アサーションが使用されていないこと（P19/P49 準拠）       | 新規全ファイル | `grep -rn ' as ' <file>` で 0 件（import as 除外） | [ ]  |
| T-08 | 変更ファイルで `@ts-expect-error` / `@ts-ignore` が増加していないこと          | 変更全ファイル | 変更前後の diff で増加 0 件                        | [ ]  |
| T-09 | AgentExecutor の既存 `@ts-expect-error` が Phase 5 Step 6 で除去対象として記録 | AgentExecutor  | 除去方針が仕様に明記されている                     | [ ]  |
| T-10 | non-null assertion (`!`) が新規コードに使用されていないこと（P48 準拠）        | 新規全ファイル | `grep -rn '!\.' <file>` で 0 件                    | [ ]  |

---

## 3. テストチェックリスト

### 3.1 全テスト PASS

| #     | チェック項目                                                                    | 対象                     | 判定基準                 | 状態 |
| ----- | ------------------------------------------------------------------------------- | ------------------------ | ------------------------ | ---- |
| TS-01 | `cd apps/desktop && pnpm vitest run` が全 PASS であること（P40 準拠）           | apps/desktop 全テスト    | 失敗 0 件                | [ ]  |
| TS-02 | `cd packages/shared && pnpm vitest run` が全 PASS であること                    | packages/shared 全テスト | 失敗 0 件                | [ ]  |
| TS-03 | Phase 4 テストマトリクスの 38 テストケースが全て実装されていること              | Phase 4 C1-C4            | 38/38 実装済み           | [ ]  |
| TS-04 | Phase 6 回帰計画の 43 テストケースが全て実装されていること                      | Phase 6 MR/CI/GD/TA      | 43/43 実装済み           | [ ]  |
| TS-05 | テスト間で状態共有がないこと（P9 準拠）                                         | 全テストファイル         | `beforeEach` でリセット  | [ ]  |
| TS-06 | happy-dom 環境のテストで `userEvent` が使用されていないこと（P39 準拠）         | Renderer テスト          | `fireEvent` のみ使用     | [ ]  |
| TS-07 | タイマーテストで `runAllTimers` でなく `advanceTimersByTime` を使用（P13 準拠） | タイマー関連テスト       | `runAllTimers` 使用 0 件 | [ ]  |

### 3.2 カバレッジ基準充足

| #     | チェック項目                                                             | 対象               | 判定基準                                 | 状態 |
| ----- | ------------------------------------------------------------------------ | ------------------ | ---------------------------------------- | ---- |
| CV-01 | 新規ファイルが Line 90% / Branch 70% / Function 90% を達成               | Phase 7 2.1 の対象 | `pnpm vitest run --coverage` で確認      | [ ]  |
| CV-02 | 変更ファイルが Line 80% / Branch 60% / Function 80% を達成               | Phase 7 2.2 の対象 | `pnpm vitest run --coverage` で確認      | [ ]  |
| CV-03 | P41 対策: IPC ハンドラのインラインコールバックが明示的に呼び出されている | aiHandlers テスト  | `validateIpcSender` コールバック検証あり | [ ]  |
| CV-04 | Branch Coverage 不足リスク箇所（Phase 7 3.1）が対策済み                  | 4 ファイル         | Phase 7 で定義した対策が実装されている   | [ ]  |

---

## 4. セキュリティチェックリスト

### 4.1 API key / credential の保護

| #    | チェック項目                                                     | 対象                      | 判定基準                                             | 状態 |
| ---- | ---------------------------------------------------------------- | ------------------------- | ---------------------------------------------------- | ---- |
| S-01 | API key の直接参照が CredentialProvider 経由に統一されていること | Main Process 全ファイル   | `SecureStorage.getApiKey` の直接呼び出しが 0 件      | [ ]  |
| S-02 | credential が Renderer に送信されていないこと                    | IPC 全チャンネル          | credential 文字列を含む IPC レスポンスが 0 件        | [ ]  |
| S-03 | `auth-key:exists` が boolean のみ返し、key 値を含まないこと      | auth-key IPC ハンドラ     | レスポンス型が `boolean` のみ                        | [ ]  |
| S-04 | fail-fast error が内部スタックトレースを含まないこと             | 全 FailFastError 返却箇所 | `stack` / ファイルパス / 行番号を含まない            | [ ]  |
| S-05 | ログ出力に credential / API key / PII が含まれていないこと       | 全変更ファイル            | `grep -rn 'apiKey\|credential\|token' <file>` で確認 | [ ]  |

### 4.2 sender 検証

| #    | チェック項目                                                               | 対象                                                           | 判定基準                           | 状態 |
| ---- | -------------------------------------------------------------------------- | -------------------------------------------------------------- | ---------------------------------- | ---- |
| S-06 | 全新規 IPC ハンドラに `validateIpcSender` が適用されていること             | ai:get-capability, ai:resolve-runtime, ai:get-all-capabilities | ハンドラ冒頭で sender 検証呼び出し | [ ]  |
| S-07 | 既存 IPC ハンドラ（aiHandlers）に sender 検証が追加されていること          | AI_CHAT, AI_CHECK_CONNECTION, AI_INDEX                         | Phase 1 5.1 で差分として記録済み   | [ ]  |
| S-08 | sender 検証のテストが Phase 4 IPC セキュリティテスト観点に含まれていること | Phase 4 テストマトリクス                                       | sender 検証テストケースが存在する  | [ ]  |

### 4.3 P42 準拠 3 段バリデーション

| #    | チェック項目                                                                  | 対象                            | 判定基準                                                    | 状態 |
| ---- | ----------------------------------------------------------------------------- | ------------------------------- | ----------------------------------------------------------- | ---- |
| S-09 | 全文字列引数に 3 段バリデーション（型チェック -> 空文字列 -> トリム空文字列） | ai:get-capability (surfaceId)   | `typeof === 'string'` + `=== ''` + `.trim() === ''` の 3 段 | [ ]  |
| S-10 | 全文字列引数に 3 段バリデーション                                             | ai:resolve-runtime (providerId) | 同上                                                        | [ ]  |
| S-11 | Phase 4 テストマトリクスに P42 バリデーションテストが含まれていること         | Phase 4 IPC セキュリティ        | テストケースが存在する                                      | [ ]  |

### 4.4 CSP / Navigation

| #    | チェック項目                                                                | 対象             | 判定基準                                | 状態 |
| ---- | --------------------------------------------------------------------------- | ---------------- | --------------------------------------- | ---- |
| S-12 | 新規 IPC チャンネルが `IPC_CHANNELS` 定数でホワイトリスト管理されていること | channels.ts      | ハードコード文字列 0 件（P27 準拠）     | [ ]  |
| S-13 | contextBridge の新規 API が safeInvoke/safeOn 経由で公開されていること      | preload/index.ts | 直接 `ipcRenderer.invoke` 呼び出し 0 件 | [ ]  |

---

## 5. アーキテクチャチェックリスト

### 5.1 レイヤー依存方向の確認

| #    | チェック項目                                               | 対象                   | 判定基準                                           | 状態 |
| ---- | ---------------------------------------------------------- | ---------------------- | -------------------------------------------------- | ---- |
| A-01 | Renderer -> Preload -> Main の一方向依存が守られていること | 全変更ファイル         | Renderer から Main への直接 import が 0 件         | [ ]  |
| A-02 | packages/shared が apps/ に依存していないこと              | packages/shared        | apps/ への import が 0 件                          | [ ]  |
| A-03 | apps/ 間で直接 import していないこと                       | apps/desktop, apps/web | `@repo/desktop` -> `@repo/web` 等の import が 0 件 | [ ]  |
| A-04 | 幽霊依存がないこと（P8 準拠）                              | 新規 import 全件       | import 先が自身の package.json に宣言されている    | [ ]  |

### 5.2 resolver 経由以外の credential 取得がないこと

| #    | チェック項目                                                                         | 対象                    | 判定基準                                                                                         | 状態 |
| ---- | ------------------------------------------------------------------------------------ | ----------------------- | ------------------------------------------------------------------------------------------------ | ---- |
| A-05 | `SecureStorage.getApiKey()` の直接呼び出しが CredentialProvider 以外に存在しないこと | Main Process 全ファイル | `grep -rn 'SecureStorage.getApiKey\|secureStorage.getApiKey'` で CredentialProvider.ts 以外 0 件 | [ ]  |
| A-06 | `AuthKeyService` の直接呼び出しが resolver 経由に置換されていること                  | SkillExecutor           | `AuthKeyService` の import が存在しない                                                          | [ ]  |
| A-07 | Claude Agent SDK の直接 `query()` 呼び出しが resolver 経由に置換されていること       | AgentExecutor           | SDK 直接呼び出しが resolver ラップ内のみ                                                         | [ ]  |

### 5.3 capability / fail-fast 設計の遵守

| #    | チェック項目                                            | 対象                | 判定基準                                                               | 状態 |
| ---- | ------------------------------------------------------- | ------------------- | ---------------------------------------------------------------------- | ---- |
| A-08 | Silent Stub Fallback が存在しないこと                   | 全 AI 実行経路      | credential 不足時に stub provider で成功を返す箇所が 0 件              | [ ]  |
| A-09 | Silent Terminal Fallback が存在しないこと               | 全 AI 実行経路      | integrated runtime 失敗時に自動で terminal へ切り替える箇所が 0 件     | [ ]  |
| A-10 | Renderer が独自 capability 判定を行っていないこと       | Renderer 全ファイル | capability 算出ロジックが Renderer に存在しない（Main authority のみ） | [ ]  |
| A-11 | fail-fast error が FailFastError 型に統一されていること | 全エラー返却箇所    | `error`, `reason`, `guidance`, `retryable` の 4 フィールド完備         | [ ]  |

### 5.4 DI パターンの遵守

| #    | チェック項目                                                   | 対象                       | 判定基準                                       | 状態 |
| ---- | -------------------------------------------------------------- | -------------------------- | ---------------------------------------------- | ---- |
| A-12 | CredentialProvider が Constructor Injection であること         | CredentialProvider         | コンストラクタで SecureStorage を受け取る      | [ ]  |
| A-13 | AIAccessCapabilityResolver が Constructor Injection であること | AIAccessCapabilityResolver | コンストラクタで依存を受け取る                 | [ ]  |
| A-14 | SkillExecutor が Setter Injection であること（P34 準拠）       | SkillExecutor              | `setResolver()` メソッドで後から注入           | [ ]  |
| A-15 | AgentExecutor が Setter Injection であること（P34 準拠）       | AgentExecutor              | `setResolver()` メソッドで後から注入           | [ ]  |
| A-16 | DI 初期化順序が Phase 5 セクション 3 に準拠していること        | Main Process 初期化コード  | SecureStorage -> AuthModeService -> ... の順序 | [ ]  |

---

## 6. Phase 1-8 成果物の cross-check

### 6.1 成果物存在確認

| #    | 成果物                   | Phase | ファイルパス                                 | 存在 | 状態 |
| ---- | ------------------------ | ----- | -------------------------------------------- | ---- | ---- |
| X-01 | 要件定義                 | 1     | `outputs/phase-1/requirements-definition.md` | あり | [ ]  |
| X-02 | スコープ定義             | 1     | `outputs/phase-1/scope-definition.md`        | あり | [ ]  |
| X-03 | 設計サマリー             | 2     | `outputs/phase-2/design-summary.md`          | あり | [ ]  |
| X-04 | 契約一覧                 | 2     | `outputs/phase-2/contract-matrix.md`         | あり | [ ]  |
| X-05 | UI/UX リアライゼーション | 2     | `outputs/phase-2/ui-ux-realization.md`       | あり | [ ]  |
| X-06 | 設計レビュー報告         | 3     | `outputs/phase-3/design-review-report.md`    | あり | [ ]  |
| X-07 | テストマトリクス         | 4     | `outputs/phase-4/test-matrix.md`             | あり | [ ]  |
| X-08 | 実装計画                 | 5     | `outputs/phase-5/implementation-plan.md`     | あり | [ ]  |
| X-09 | 回帰計画                 | 6     | `outputs/phase-6/regression-plan.md`         | あり | [ ]  |
| X-10 | カバレッジ計画           | 7     | `outputs/phase-7/coverage-plan.md`           | あり | [ ]  |
| X-11 | リファクタリング計画     | 8     | `outputs/phase-8/refactor-plan.md`           | あり | [ ]  |

### 6.2 成果物間の整合性チェック

| #    | チェック項目                                                                  | 対象 Phase    | 判定基準                                                          | 状態 |
| ---- | ----------------------------------------------------------------------------- | ------------- | ----------------------------------------------------------------- | ---- |
| X-12 | Phase 1 の Capability 5 区分が Phase 2 設計に反映されていること               | Phase 1 <-> 2 | 5 区分の名称・定義が一致                                          | [ ]  |
| X-13 | Phase 1 の Surface Inventory Gap が Phase 5 の変更対象を網羅していること      | Phase 1 <-> 5 | M1-M12, R1-R9 の Gap が Step 1-8 で対応されている                 | [ ]  |
| X-14 | Phase 2 の resolver 設計が Phase 5 の実装順序と一致していること               | Phase 2 <-> 5 | AIAccessCapabilityResolver, AIRuntimeResolver, CredentialProvider | [ ]  |
| X-15 | Phase 2 の Fail-Fast ルールが Phase 4 テストで網羅されていること              | Phase 2 <-> 4 | 5 段階の fail-fast 条件が C2-1 で定義                             | [ ]  |
| X-16 | Phase 2 の Cache Clear 条件が Phase 6 回帰テストで網羅されていること          | Phase 2 <-> 6 | 4 トリガーが CI-01~CI-06 で定義                                   | [ ]  |
| X-17 | Phase 4 のテスト数（38 件）と Phase 6 の回帰テスト数（43 件）が正確であること | Phase 4, 6    | 実際のテストケース ID を逐次カウント                              | [ ]  |
| X-18 | Phase 5 の DI パターンが P34/P35 の既知の落とし穴を考慮していること           | Phase 5       | Setter Injection の適用理由が記載されている                       | [ ]  |
| X-19 | Phase 7 のカバレッジ目標がプロジェクト基準（02-code-quality.md）に準拠        | Phase 7       | Line 80%/Branch 60%/Function 80% 以上                             | [ ]  |
| X-20 | Phase 8 の rollback 戦略が Phase 5 の移行順序と対応していること               | Phase 5 <-> 8 | 8 段階の順序が rollback 単位と一致                                | [ ]  |
| X-21 | 制約 C1-C7 が全成果物で遵守されていること                                     | 全 Phase      | 特に C7（本タスクで実装しない）の遵守                             | [ ]  |

### 6.3 既知の落とし穴（Pitfall）対応確認

| #    | Pitfall | 対応確認項目                                                               | 対応 Phase     | 状態 |
| ---- | ------- | -------------------------------------------------------------------------- | -------------- | ---- |
| X-22 | P9      | テスト間の状態共有禁止がテスト設計に反映されていること                     | Phase 4        | [ ]  |
| X-23 | P13     | タイマーテストの安全な進行方法が定義されていること                         | Phase 4        | [ ]  |
| X-24 | P19/P49 | 型アサーション禁止が仕様に明記されていること                               | Phase 5        | [ ]  |
| X-25 | P31     | 個別セレクタ使用が Renderer 設計に反映されていること                       | Phase 5 Step 8 | [ ]  |
| X-26 | P34     | Setter Injection の適用が SkillExecutor/AgentExecutor に定義されていること | Phase 5        | [ ]  |
| X-27 | P35     | DI 追加時のテストモック大規模修正リスクが Phase 7 で考慮されていること     | Phase 7        | [ ]  |
| X-28 | P39     | happy-dom 環境での fireEvent 使用が定義されていること                      | Phase 4        | [ ]  |
| X-29 | P40     | テスト実行ディレクトリの指定が定義されていること                           | Phase 4, 7     | [ ]  |
| X-30 | P41     | インラインコールバックの Function Coverage 対策が定義されていること        | Phase 7        | [ ]  |
| X-31 | P42     | 3 段バリデーションが IPC ハンドラ仕様に含まれていること                    | Phase 4        | [ ]  |
| X-32 | P48     | 派生セレクタの useShallow 適用が aiAccessSlice 設計に含まれていること      | Phase 5 Step 8 | [ ]  |

---

## 7. 品質検証実行手順

### 7.1 実行コマンド一覧（後続タスク実装後に使用）

```bash
# 1. Lint チェック
pnpm lint
pnpm format:check

# 2. 型チェック
pnpm typecheck
pnpm --filter @repo/shared build

# 3. テスト実行（P40 準拠: 対象パッケージディレクトリから実行）
cd apps/desktop && pnpm vitest run
cd packages/shared && pnpm vitest run

# 4. カバレッジ測定
cd apps/desktop && pnpm vitest run --coverage \
  src/main/services/ai/ \
  src/main/services/auth/AuthModeService.ts \
  src/main/adapters/llm/LLMAdapterFactory.ts \
  src/main/ipc/aiHandlers.ts \
  src/main/services/skill/SkillExecutor.ts \
  src/main/services/agent/AgentExecutor.ts \
  src/main/handlers/chatEditHandlers.ts \
  src/main/services/skill/SkillDocGenerator.ts \
  src/renderer/utils/skillExecutionAuthPreflight.ts \
  src/renderer/store/slices/aiAccessSlice.ts

# 5. セキュリティ確認（手動）
grep -rn 'SecureStorage.getApiKey\|secureStorage.getApiKey' apps/desktop/src/main/ | grep -v CredentialProvider
grep -rn 'any' packages/shared/src/ai/
grep -rn '@ts-ignore\|@ts-expect-error' apps/desktop/src/main/services/ai/
```

### 7.2 判定基準

| 判定     | 条件                                                            | 次の Phase     |
| -------- | --------------------------------------------------------------- | -------------- |
| PASS     | 全チェック項目が合格                                            | Phase 10 へ    |
| MINOR    | 1-3 件の軽微な不合格（テスト追加で解決可能）                    | 修正後 再検証  |
| MAJOR    | 4 件以上の不合格、またはセキュリティ項目（S-xx）の不合格が 1 件 | Phase 5 へ戻る |
| CRITICAL | アーキテクチャ項目（A-xx）の不合格が 2 件以上                   | Phase 2 へ戻る |
