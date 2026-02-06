# Phase 9: 品質保証

## メタ情報

| 項目     | 内容                    |
| -------- | ----------------------- |
| Phase    | 9                       |
| 機能名   | auth-callback-urlscheme |
| 作成日   | 2026-02-05              |
| タスクID | TASK-AUTH-CALLBACK-001  |

---

## 目的

Phase 8のリファクタリング完了後、定義された全品質基準（静的解析・テスト・セキュリティ・パフォーマンス）を網羅的に検証し、Phase 10の最終レビューに進む準備を整える。

---

## 実行タスク

- Task 1: 静的解析 - ESLint, Prettier, TypeScript型チェックの実行と問題修正
- Task 2: テスト全件実行 - Vitest全テスト実行と既存テスト含む全件パス確認
- Task 3: セキュリティ確認 - トークン露出防止、HTTPサーバーバインド確認、PKCE安全性確認
- Task 4: パフォーマンス確認 - HTTPサーバー起動時間とコールバック→セッション確立時間の計測

---

## 参照資料

| 参照資料                 | パス                                                                              | 内容                               |
| ------------------------ | --------------------------------------------------------------------------------- | ---------------------------------- |
| Phase 8リファクタ結果    | `outputs/phase-8/refactoring-summary.md`                                          | リファクタリング変更内容           |
| Phase 7カバレッジ        | `outputs/phase-7/coverage-report.md`                                              | テストカバレッジ基準               |
| Phase 1非機能要件        | `outputs/phase-1/requirements-definition.md`                                      | NFR-001〜NFR-008パフォーマンス基準 |
| セキュリティ実装仕様     | `.claude/skills/aiworkflow-requirements/references/security-implementation.md`    | 多層防御、データ保護戦略           |
| 認証セキュリティ仕様     | `.claude/skills/aiworkflow-requirements/references/architecture-auth-security.md` | 認証基盤設計                       |
| Electron IPCセキュリティ | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`      | IPC通信セキュリティ原則            |

---

## 実行手順

### Task 1: 静的解析

**目的**: コード品質をLint・フォーマット・型チェックの3観点で検証する。

**実行手順**:

1. **ESLint実行**

   ```bash
   pnpm --filter @repo/desktop lint
   ```

   - 全エラー・警告を修正
   - 新規ファイル（pkce.ts, authCallbackServer.ts, authFlowOrchestrator.ts）が対象に含まれていることを確認

2. **Prettier実行**

   ```bash
   pnpm --filter @repo/desktop format:check
   ```

   - フォーマット違反があれば `format:fix` で修正

3. **TypeScript型チェック**

   ```bash
   pnpm --filter @repo/desktop typecheck
   ```

   - 全ファイルで型エラーなし
   - shared packageの型定義（auth-pkce.ts）がdesktopパッケージから正しく参照されていることを確認

4. **型チェック全体（モノレポ横断）**

   ```bash
   pnpm typecheck
   ```

   - packages/shared, apps/desktop, apps/web で型エラーなし

**判定基準**:

| 項目               | 基準                  | 結果 |
| ------------------ | --------------------- | ---- |
| ESLintエラー       | 0件                   | -    |
| ESLint警告         | 0件（または既存のみ） | -    |
| Prettier違反       | 0件                   | -    |
| TypeScript型エラー | 0件                   | -    |

---

### Task 2: テスト全件実行

**目的**: 全テストを実行し、既存テストを含む全件パスを確認する。

**実行手順**:

1. **desktopパッケージ全テスト実行**

   ```bash
   pnpm --filter @repo/desktop test
   ```

   - 新規テスト（pkce, authCallbackServer, authFlowOrchestrator, auth-ipc-integration）が全パス
   - 既存テスト（oauth-error-handler, authSlice等）が全パス
   - テスト数と結果を記録

2. **全パッケージテスト実行**

   ```bash
   pnpm vitest run
   ```

   - shared, ui, desktop, web全パッケージで全テストパス

3. **テスト結果記録**

   | テストスイート               | テスト数 | パス | 失敗 | 結果 |
   | ---------------------------- | -------- | ---- | ---- | ---- |
   | pkce.test.ts                 | -        | -    | 0    | -    |
   | authCallbackServer.test.ts   | -        | -    | 0    | -    |
   | authFlowOrchestrator.test.ts | -        | -    | 0    | -    |
   | auth-ipc-integration.test.ts | -        | -    | 0    | -    |
   | oauth-error-handler.test.ts  | -        | -    | 0    | -    |
   | authSlice.test.ts            | -        | -    | 0    | -    |
   | その他既存テスト             | -        | -    | 0    | -    |
   | **合計**                     | -        | -    | 0    | -    |

   > 注: 上記の「-」は実行時に測定結果を記入する

---

### Task 3: セキュリティ確認

**目的**: セキュリティ要件が実装レベルで充足されていることをコードレビューとgrepで確認する。

**実行手順**:

1. **トークンがRenderer Processに露出していないことをgrepで確認**

   ```bash
   # Renderer Process内でaccess_token, refresh_tokenを直接参照していないか
   grep -rn "access_token\|refresh_token\|code_verifier" \
     apps/desktop/src/renderer/ \
     --include="*.ts" --include="*.tsx" \
     --exclude-dir="__tests__" --exclude-dir="__mocks__"
   ```

   - `code_verifier` がRenderer Processに露出していないこと
   - `refresh_token` がRenderer Processで直接操作されていないこと
   - `access_token` がIPC経由でのみ受け渡しされていること

2. **HTTPサーバーが127.0.0.1にバインドされていることをコードレビュー**

   ```bash
   # authCallbackServer.tsでホストアドレスを確認
   grep -n "listen\|host\|127.0.0.1\|0.0.0.0\|localhost" \
     apps/desktop/src/main/auth/authCallbackServer.ts
   ```

   - `server.listen()` の第2引数が `'127.0.0.1'` であること
   - `0.0.0.0` やホスト指定なし（全インターフェースリッスン）でないこと

3. **PKCE code_verifierがcrypto.randomBytesで生成されていることを確認**

   ```bash
   # pkce.tsでの乱数生成方法を確認
   grep -n "randomBytes\|Math.random\|uuid" \
     apps/desktop/src/main/auth/pkce.ts
   ```

   - `crypto.randomBytes()` を使用していること
   - `Math.random()` が使用されていないこと

4. **State parameterのエントロピー確認**

   ```bash
   # authFlowOrchestrator.tsでのstate生成を確認
   grep -n "state\|randomBytes" \
     apps/desktop/src/main/auth/authFlowOrchestrator.ts
   ```

   - 32バイト以上のcrypto.randomBytesで生成されていること

5. **セキュリティチェックリスト**

   | チェック項目                                          | 基準                           | 結果 |
   | ----------------------------------------------------- | ------------------------------ | ---- |
   | code_verifierがRenderer Processに露出していない       | grepで該当なし                 | -    |
   | refresh_tokenがRenderer Processで直接操作されていない | grepで該当なし                 | -    |
   | HTTPサーバーが127.0.0.1にバインドされている           | コードレビューで確認           | -    |
   | PKCE code_verifierがcrypto.randomBytesで生成          | コードレビューで確認           | -    |
   | State parameterが32バイト以上                         | コードレビューで確認           | -    |
   | code_verifierがログに出力されていない                 | grepで該当なし                 | -    |
   | HTTPサーバーがコールバック後に停止する                | テストで確認済み               | -    |
   | CSP設定との互換性                                     | Electronセキュリティ設定を確認 | -    |

   > 注: 上記の「-」は実行時に確認結果を記入する

---

### Task 4: パフォーマンス確認

**目的**: 非機能要件NFR-001/NFR-002のパフォーマンス基準を満たすことを確認する。

**実行手順**:

1. **HTTPサーバー起動時間の計測**

   ```bash
   # テストまたは計測コードで確認
   # 基準: 200ms以内（NFR-002）
   ```

   - authCallbackServer.start()の呼び出しからポート割り当て完了までの時間を計測
   - Node.js http.createServer + listen のオーバーヘッドを確認

2. **コールバック→セッション確立時間の計測**

   ```bash
   # テストまたは計測コードで確認
   # 基準: 500ms以内（NFR-001）
   ```

   - HTTPサーバーがコールバックを受信してからSupabase.auth.setSession()完了までの時間
   - ネットワーク遅延（トークン交換API）は除外し、ローカル処理時間のみ計測

3. **パフォーマンス判定結果**

   | 指標                        | 基準       | 実測値 | 判定 |
   | --------------------------- | ---------- | ------ | ---- |
   | HTTPサーバー起動時間        | 200ms以内  | -      | -    |
   | コールバック→セッション確立 | 500ms以内  | -      | -    |
   | HTTPサーバー停止時間        | 30秒以内   | -      | -    |
   | メモリ使用量増加            | 合理的範囲 | -      | -    |

   > 注: 上記の「-」は実行時に測定結果を記入する

---

## 品質ゲート

### 品質チェックリスト

#### 機能検証

- [ ] 全ユニットテスト成功
- [ ] 全統合テスト成功
- [ ] 既存テストリグレッションなし

#### コード品質

- [ ] ESLintエラーなし
- [ ] TypeScript型エラーなし
- [ ] Prettierフォーマット適用済み

#### テスト網羅性

- [ ] Line Coverage 80%以上
- [ ] Branch Coverage 60%以上
- [ ] Function Coverage 80%以上

#### セキュリティ

- [ ] トークンがRenderer Processに露出していない
- [ ] HTTPサーバーが127.0.0.1にバインドされている
- [ ] PKCE code_verifierがcrypto.randomBytesで生成されている
- [ ] State parameterが32バイト以上のエントロピー

#### パフォーマンス

- [ ] HTTPサーバー起動時間が200ms以内
- [ ] コールバック→セッション確立が500ms以内

---

## 統合テスト連携

品質保証で統合テスト結果を確認:

| 品質項目       | 確認内容                             | 結果 | 状態 |
| -------------- | ------------------------------------ | ---- | ---- |
| 機能検証       | 全自動テスト成功                     | -    | -    |
| 統合テスト     | PKCE/HTTP/オーケストレーター統合成功 | -    | -    |
| セキュリティ   | トークン保護・PKCE・State確認        | -    | -    |
| パフォーマンス | NFR-001/002基準達成                  | -    | -    |
| リグレッション | 既存テスト全パス                     | -    | -    |

> 注: 上記の「-」は実行時に確認結果を記入する

---

## 成果物

| 成果物       | パス                                | 説明                               |
| ------------ | ----------------------------------- | ---------------------------------- |
| 品質レポート | `outputs/phase-9/quality-report.md` | 静的解析・テスト・セキュリティ結果 |

---

## 完了条件

- [ ] ESLint, Prettier, TypeScript型チェックが全てエラーなしで通過している
- [ ] `pnpm --filter @repo/desktop test` で全テストがパスしている
- [ ] 既存テスト含め全件パスが確認されている
- [ ] セキュリティチェックリスト全項目がクリアされている
- [ ] パフォーマンス基準（NFR-001: 500ms, NFR-002: 200ms）を満たしている
- [ ] 品質レポートがoutputs/phase-9/に配置されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## タスク100%実行確認

- [ ] Task 1: 静的解析（ESLint, Prettier, TypeScript型チェック） - 完了
- [ ] Task 2: テスト全件実行（Vitest全テスト + 既存テスト全パス） - 完了
- [ ] Task 3: セキュリティ確認（トークン露出・HTTPバインド・PKCE安全性） - 完了
- [ ] Task 4: パフォーマンス確認（HTTPサーバー起動・セッション確立時間） - 完了

---

## 次のPhase

[Phase 10: 最終レビューゲート](phase-10-final-review.md)
