# Phase 6: テスト拡充

## メタ情報

| 項目     | 内容                    |
| -------- | ----------------------- |
| Phase    | 6                       |
| 機能名   | auth-callback-urlscheme |
| 作成日   | 2026-02-05              |
| タスクID | TASK-AUTH-CALLBACK-001  |

---

## 目的

Phase 5の実装に対してエッジケース・プラットフォーム固有・セキュリティ・リグレッションのテストを拡充し、Phase 7のカバレッジ基準（Line 80%+, Branch 60%+, Function 80%+）の達成を目指す。

---

## 実行タスク

- Task 1: エッジケーステスト追加 - ポート競合、暗号化不可環境、同時認証リクエスト
- Task 2: プラットフォーム固有テスト追加 - macOS open-url / Windows second-instance分岐
- Task 3: セキュリティテスト追加 - State不一致拒否、PKCE不正code_verifier拒否、不正リダイレクトURI検出
- Task 4: 既存テストとのリグレッションテスト - oauth-error-handler.test.ts, authSlice.test.tsの維持確認
- Task 5: 追加リグレッション・統合テスト - LinkedProvider、DEBT-SEC-003 URL検証、resetAuthListenerFlag()、calculateRefreshTokenExpiry()

---

## 参照資料

| 参照資料              | パス                                                                              | 内容               |
| --------------------- | --------------------------------------------------------------------------------- | ------------------ |
| Phase 4テスト仕様書   | `outputs/phase-4/test-specification.md`                                           | 基本テスト設計     |
| Phase 5実装           | `apps/desktop/src/main/auth/`                                                     | 実装済みモジュール |
| Phase 1非機能要件     | `outputs/phase-1/requirements-definition.md`                                      | NFR-003〜NFR-008   |
| 認証セキュリティ仕様  | `.claude/skills/aiworkflow-requirements/references/architecture-auth-security.md` | セキュリティ要件   |
| 既存OAuthエラーテスト | `apps/desktop/src/main/auth/__tests__/oauth-error-handler.test.ts`                | 既存テストパターン |
| 既存authSliceテスト   | `apps/desktop/src/renderer/store/slices/__tests__/authSlice.test.ts`              | 認証状態管理テスト |

---

## 実行手順

### Task 1: エッジケーステスト追加

**対象ファイル**: `apps/desktop/src/main/auth/__tests__/authCallbackServer.test.ts`（追記）、`apps/desktop/src/main/auth/__tests__/authFlowOrchestrator.test.ts`（追記）

| テストID | テストケース                                   | 検証内容                                                                                                                             |
| -------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| EDGE-01  | ポート競合時のリトライ動作                     | 使用中ポートでサーバー起動を試みた際のフォールバック動作                                                                             |
| EDGE-02  | safeStorageが利用不可の環境での認証            | 暗号化不可時に警告を出しつつ認証が継続されること（NFR-008）                                                                          |
| EDGE-03  | 同時認証リクエストが発生した場合               | 既存フローがキャンセルされるか排他制御されること                                                                                     |
| EDGE-04  | HTTPサーバー起動直後のコールバック             | レースコンディションなく処理されること                                                                                               |
| EDGE-05  | 非常に長いauthorization_codeの処理             | バッファオーバーフローなく処理されること                                                                                             |
| EDGE-06  | コールバックURLにerrorパラメータが含まれる場合 | `parseOAuthError()`でエラーを検出し、`mapOAuthErrorToMessage()`でマッピングされたエラーメッセージがIPC経由でRendererに通知されること |

```typescript
describe("エッジケース", () => {
  it("EDGE-01: ポート競合時にリトライする", async () => {
    // ポートを先に占有してからサーバー起動を試みる
  });

  it("EDGE-02: safeStorage不可時に警告付きで認証継続", async () => {
    // safeStorage.isEncryptionAvailable()がfalseを返す場合
  });

  it("EDGE-03: 同時認証リクエスト時に既存フローをキャンセル", async () => {
    // 2つのstartOAuthFlow()を連続呼び出し
  });

  it("EDGE-04: 起動直後のコールバックが正常処理される", async () => {
    // start()直後にコールバックを送信
  });

  it("EDGE-05: 長いauthorization_codeを処理する", async () => {
    // 1000文字のcodeを送信
  });

  it("EDGE-06: errorパラメータを含むコールバックの処理", async () => {
    // ?error=access_denied&error_description=...
  });
});
```

### Task 2: プラットフォーム固有テスト追加

**対象ファイル**: `apps/desktop/src/main/auth/__tests__/authFlowOrchestrator.test.ts`（追記）、`apps/desktop/src/main/protocol/__tests__/customProtocol.test.ts`（新規または追記）

| テストID | テストケース                                           | 検証内容                                                    |
| -------- | ------------------------------------------------------ | ----------------------------------------------------------- |
| PLAT-01  | macOS: open-urlイベントでカスタムURLスキームを受信する | `aiworkflow://auth/done` がアプリに正しくルーティングされる |
| PLAT-02  | Windows: second-instanceイベントでDeep Linkを受信する  | コマンドライン引数からURLが正しく抽出される                 |
| PLAT-03  | Linux: HTTPサーバーフォールバックのみで動作する        | カスタムURLスキーム未登録環境でHTTPサーバーが確実に動作     |
| PLAT-04  | 開発ビルド時にHTTPサーバー方式が使用される             | パッケージ化不要で認証が完結すること                        |

```typescript
describe("プラットフォーム固有テスト", () => {
  describe("macOS", () => {
    it("PLAT-01: open-urlイベントでURLスキームを受信する", () => {
      // app.on('open-url') のイベントハンドリング検証
    });
  });

  describe("Windows", () => {
    it("PLAT-02: second-instanceイベントでDeep Linkを受信する", () => {
      // app.on('second-instance') のコマンドライン引数解析検証
    });
  });

  describe("Linux / 開発ビルド", () => {
    it("PLAT-03: HTTPサーバーフォールバックで動作する", async () => {
      // カスタムスキーム非対応環境での動作検証
    });

    it("PLAT-04: 開発ビルドでHTTPサーバー方式が使用される", async () => {
      // app.isPackaged === false の場合の動作検証
    });
  });
});
```

### Task 3: セキュリティテスト追加

**対象ファイル**: `apps/desktop/src/main/auth/__tests__/authFlowOrchestrator.test.ts`（追記）

| テストID | テストケース                                | 検証内容                                                  |
| -------- | ------------------------------------------- | --------------------------------------------------------- |
| SEC-01   | State不一致時に認証が明確に拒否される       | 異なるstateでコールバックした場合のエラーレスポンス       |
| SEC-02   | 不正なcode_verifierでトークン交換が失敗する | 改ざんされたcode_verifierでの交換拒否                     |
| SEC-03   | 不正なリダイレクトURIが検出される           | 127.0.0.1以外のリダイレクトURIが拒否されること            |
| SEC-04   | 使用済みstateの再利用が拒否される           | リプレイ攻撃防止の検証                                    |
| SEC-05   | HTTPサーバーが127.0.0.1以外でリッスンしない | 外部ネットワークからアクセス不可であること                |
| SEC-06   | トークンがRenderer Processに送信されない    | IPC経由でAccess/Refresh Tokenが送信されていないことの確認 |
| SEC-07   | code_verifierが43文字未満で拒否される       | RFC 7636 Section 4.1の最小長の検証                        |

```typescript
describe("セキュリティテスト", () => {
  it("SEC-01: State不一致で認証を拒否する", async () => {
    // 不正stateでコールバック → エラー確認
  });

  it("SEC-02: 不正code_verifierでトークン交換が失敗する", async () => {
    // 改ざんされたcode_verifierでの交換試行
  });

  it("SEC-03: 不正リダイレクトURIが拒否される", async () => {
    // 127.0.0.1以外のホストでのリダイレクト検証
  });

  it("SEC-04: 使用済みstateの再利用が拒否される", async () => {
    // 同一stateでの2回目のコールバック
  });

  it("SEC-05: HTTPサーバーが127.0.0.1のみでリッスン", async () => {
    // 外部アドレスからのアクセス試行
  });

  it("SEC-06: トークンがRendererに送信されない", async () => {
    // IPC送信内容にトークンが含まれないことを検証
  });

  it("SEC-07: 短いcode_verifierが拒否される", () => {
    // 42文字のcode_verifier生成試行
  });
});
```

### Task 4: 既存テストとのリグレッションテスト

**確認対象ファイル**:

| テストファイル                                                       | 確認内容                                          |
| -------------------------------------------------------------------- | ------------------------------------------------- |
| `apps/desktop/src/main/auth/__tests__/oauth-error-handler.test.ts`   | OAuthエラー検出・マッピングが引き続きパスすること |
| `apps/desktop/src/renderer/store/slices/__tests__/authSlice.test.ts` | 認証状態管理の既存テストが引き続きパスすること    |

```bash
# リグレッションテスト実行
pnpm --filter @repo/desktop test -- --run src/main/auth/__tests__/oauth-error-handler.test.ts
pnpm --filter @repo/desktop test -- --run src/renderer/store/slices/__tests__/authSlice.test.ts

# 全テスト実行（完全リグレッション確認）
pnpm --filter @repo/desktop test -- --run
```

**確認事項**:

- [ ] oauth-error-handler.test.ts の全テストケースがパスする
- [ ] authSlice.test.ts の全テストケースがパスする
- [ ] 既存テストの変更が不要であること（破壊的変更がないこと）

### Task 5: 追加リグレッション・統合テスト

**対象ファイル**: `apps/desktop/src/main/auth/__tests__/authFlowOrchestrator.test.ts`（追記）、`apps/desktop/src/main/protocol/__tests__/customProtocol.test.ts`（追記）

| テストID | テストケース                                                      | 検証内容                                                                               |
| -------- | ----------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| REG-01   | LinkedProviderがPKCEフロー後も正常に機能する                      | interfaces-auth.mdのLinkedProvider型の既存参照が壊れていないこと                       |
| REG-02   | DEBT-SEC-003: 不正なURLパスが拒否される                           | `aiworkflow://auth/unknown` のような許可リスト外のパスがカスタムプロトコルで拒否される |
| REG-03   | resetAuthListenerFlag()がテスト間で正常に動作する                 | TASK-FIX-GOOGLE-LOGIN-001で追加されたフラグリセット関数がPKCEフロー後も維持される      |
| REG-04   | calculateRefreshTokenExpiry()がPKCEフロー後のトークンでも動作する | TASK-FIX-GOOGLE-LOGIN-001の成果物がPKCE方式でも正常に計算されること                    |

```typescript
describe("追加リグレッション・統合テスト", () => {
  it("REG-01: LinkedProviderがPKCEフロー後も正常に機能する", async () => {
    // LinkedProvider型の参照が壊れていないことを確認
  });

  it("REG-02: 不正なURLパスがカスタムプロトコルで拒否される", () => {
    // aiworkflow://auth/unknown → 拒否されること
  });

  it("REG-03: resetAuthListenerFlag()がPKCEフロー後も動作する", () => {
    // テスト間のフラグリセットが正常に機能すること
  });

  it("REG-04: calculateRefreshTokenExpiry()がPKCEトークンで動作する", () => {
    // PKCE方式で取得したトークンでの期限計算
  });
});
```

---

## テスト追加サマリー

| テストカテゴリ       | 追加テストケース数 | 対象ファイル                                             |
| -------------------- | ------------------ | -------------------------------------------------------- |
| エッジケース         | 6                  | authCallbackServer.test.ts, authFlowOrchestrator.test.ts |
| プラットフォーム固有 | 4                  | authFlowOrchestrator.test.ts, customProtocol.test.ts     |
| セキュリティ         | 7                  | authFlowOrchestrator.test.ts                             |
| リグレッション       | 既存テスト確認     | oauth-error-handler.test.ts, authSlice.test.ts           |
| 追加リグレッション   | 4                  | authFlowOrchestrator.test.ts, customProtocol.test.ts     |
| **合計追加**         | **21**             |                                                          |

---

## 統合テスト連携

| テストカテゴリ       | 検証項目                                        | 目標カバレッジ |
| -------------------- | ----------------------------------------------- | -------------- |
| エッジケース         | ポート競合/暗号化不可/同時リクエスト/レース条件 | Branch向上     |
| プラットフォーム固有 | macOS/Windows/Linux分岐パスの網羅               | Branch向上     |
| セキュリティ         | 不正入力の拒否・攻撃ベクトルの検証              | Branch向上     |
| リグレッション       | 既存テストの維持確認                            | 変更なし確認   |

---

## 成果物

| 成果物                 | パス                                                                        | 説明                         |
| ---------------------- | --------------------------------------------------------------------------- | ---------------------------- |
| エッジケーステスト     | `apps/desktop/src/main/auth/__tests__/authCallbackServer.test.ts`（追記）   | ポート競合・同時リクエスト等 |
| プラットフォームテスト | `apps/desktop/src/main/auth/__tests__/authFlowOrchestrator.test.ts`（追記） | OS固有分岐テスト             |
| セキュリティテスト     | `apps/desktop/src/main/auth/__tests__/authFlowOrchestrator.test.ts`（追記） | 攻撃ベクトル検証テスト       |
| テスト拡充レポート     | `outputs/phase-6/test-expansion-report.md`                                  | 追加テストの一覧と理由       |

---

## 完了条件

- [ ] Task 1〜3の全テストケース（17件）およびTask 5の追加リグレッションテスト（4件）が作成・実行されている
- [ ] Task 4のリグレッションテストが全てパスすることを確認している
- [ ] 全テスト（Phase 4基本テスト + Phase 6拡充テスト）がGreen状態である
- [ ] テスト拡充レポートがoutputs/phase-6/に配置されている
- [ ] **本Phase内の全タスクを100%実行完了している**

---

## タスク100%実行確認

- [ ] Task 1: エッジケーステスト追加（6件） - 完了
- [ ] Task 2: プラットフォーム固有テスト追加（4件） - 完了
- [ ] Task 3: セキュリティテスト追加（7件） - 完了
- [ ] Task 4: 既存テストとのリグレッションテスト確認 - 完了
- [ ] Task 5: 追加リグレッション・統合テスト（4件） - 完了

---

## 次のPhase

[Phase 7: テストカバレッジ確認](phase-7-coverage-check.md)
