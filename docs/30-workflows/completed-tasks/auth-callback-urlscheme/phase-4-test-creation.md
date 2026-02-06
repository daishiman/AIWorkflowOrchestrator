# Phase 4: テスト作成（TDD: Red）

## メタ情報

| 項目     | 内容                    |
| -------- | ----------------------- |
| Phase    | 4                       |
| 機能名   | auth-callback-urlscheme |
| 作成日   | 2026-02-05              |
| タスクID | TASK-AUTH-CALLBACK-001  |

---

## 目的

Phase 3で承認された設計に基づき、TDD Redフェーズとして失敗するテストを実装より先に作成する。PKCE生成・ローカルHTTPサーバー・認証フローオーケストレーター・IPC統合の各レイヤーで期待される動作をテストとして明確化する。

---

## 実行タスク

- Task 1: PKCE生成テスト作成 - `pkce.test.ts` の作成
- Task 2: ローカルHTTPサーバーテスト作成 - `authCallbackServer.test.ts` の作成
- Task 3: 認証フローオーケストレーターテスト作成 - `authFlowOrchestrator.test.ts` の作成
- Task 4: IPC統合テスト作成 - `auth-ipc-integration.test.ts` の作成

---

## 参照資料

| 参照資料                 | パス                                                                              | 内容                    |
| ------------------------ | --------------------------------------------------------------------------------- | ----------------------- |
| Phase 1要件定義書        | `outputs/phase-1/requirements-definition.md`                                      | 機能・非機能要件        |
| Phase 2 API仕様          | `outputs/phase-2/api-specification.md`                                            | IPC・内部API設計        |
| Phase 2データフロー      | `outputs/phase-2/data-flow-design.md`                                             | 認証フロー全体の設計    |
| Phase 3レビュー結果      | `outputs/phase-3/design-review-result.md`                                         | 承認済み設計            |
| Electron IPCセキュリティ | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`      | IPC通信セキュリティ原則 |
| 認証セキュリティ仕様     | `.claude/skills/aiworkflow-requirements/references/architecture-auth-security.md` | 認証基盤設計            |
| 既存認証テスト           | `apps/desktop/src/main/auth/__tests__/`                                           | 既存テストパターン参照  |

---

## 実行手順

### Task 1: PKCE生成テスト作成

**ファイル**: `apps/desktop/src/main/auth/__tests__/pkce.test.ts`

以下のテストケースを作成する:

| テストID | テストケース                                              | 検証内容                                               |
| -------- | --------------------------------------------------------- | ------------------------------------------------------ |
| PKCE-01  | code_verifierの長さが43-128文字の範囲内                   | デフォルト長さ（64文字）で生成されること               |
| PKCE-02  | code_verifierがBase64URL文字種のみで構成                  | `[A-Za-z0-9\-._~]`のみで構成されていること             |
| PKCE-03  | code_challengeがSHA-256ハッシュのBase64URL文字列          | 既知の入力に対して期待されるハッシュ値が算出されること |
| PKCE-04  | generatePKCEPair()がcodeVerifierとcodeChallengeのペア返却 | 両方のフィールドが存在し適切な形式であること           |
| PKCE-05  | カスタム長さ指定でcode_verifierを生成                     | length=43, length=128で正しい長さが生成されること      |
| PKCE-06  | 連続呼び出しで異なるcode_verifierが生成される             | 2回の呼び出し結果が一致しないこと（ランダム性の検証）  |
| PKCE-07  | code_challengeにパディング文字（=）が含まれない           | Base64URLエンコードでパディングが除去されていること    |

```typescript
// テストコード概要
import { describe, it, expect } from "vitest";
import {
  generatePKCEPair,
  generateCodeVerifier,
  calculateCodeChallenge,
} from "../pkce";

describe("PKCE生成モジュール", () => {
  describe("generateCodeVerifier", () => {
    it("PKCE-01: デフォルト長さ（64文字）のcode_verifierを生成する", () => {
      const verifier = generateCodeVerifier();
      expect(verifier.length).toBe(64);
    });

    it("PKCE-02: Base64URL文字種のみで構成される", () => {
      const verifier = generateCodeVerifier();
      expect(verifier).toMatch(/^[A-Za-z0-9\-._~]+$/);
    });

    it("PKCE-05: カスタム長さ指定で生成される", () => {
      expect(generateCodeVerifier(43).length).toBe(43);
      expect(generateCodeVerifier(128).length).toBe(128);
    });

    it("PKCE-06: 連続呼び出しで異なる値が生成される", () => {
      const v1 = generateCodeVerifier();
      const v2 = generateCodeVerifier();
      expect(v1).not.toBe(v2);
    });
  });

  describe("calculateCodeChallenge", () => {
    it("PKCE-03: SHA-256ハッシュのBase64URL文字列を返す", () => {
      // RFC 7636 Appendix Bの検証ベクトル
      const verifier = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk";
      const expectedChallenge = "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM";
      expect(calculateCodeChallenge(verifier)).toBe(expectedChallenge);
    });

    it("PKCE-07: パディング文字（=）が含まれない", () => {
      const verifier = generateCodeVerifier();
      const challenge = calculateCodeChallenge(verifier);
      expect(challenge).not.toContain("=");
    });
  });

  describe("generatePKCEPair", () => {
    it("PKCE-04: codeVerifierとcodeChallengeのペアを返す", () => {
      const pair = generatePKCEPair();
      expect(pair).toHaveProperty("codeVerifier");
      expect(pair).toHaveProperty("codeChallenge");
      expect(pair.codeVerifier.length).toBeGreaterThanOrEqual(43);
      expect(pair.codeChallenge.length).toBeGreaterThan(0);
    });
  });
});
```

### Task 2: ローカルHTTPサーバーテスト作成

**ファイル**: `apps/desktop/src/main/auth/__tests__/authCallbackServer.test.ts`

以下のテストケースを作成する:

| テストID | テストケース                                         | 検証内容                                              |
| -------- | ---------------------------------------------------- | ----------------------------------------------------- |
| SRV-01   | サーバーが起動しポート番号を返す                     | start()がport番号を含むオブジェクトを返すこと         |
| SRV-02   | サーバーが127.0.0.1でバインドされている              | ホストアドレスが127.0.0.1であること                   |
| SRV-03   | コールバックURLでauthorization_codeとstateを受信する | /auth/callback?code=xxx&state=yyyのパースが正しいこと |
| SRV-04   | コールバック受信後に「認証完了」HTMLを返却する       | HTTPレスポンスに認証完了メッセージが含まれること      |
| SRV-05   | stop()でサーバーが停止しポートが解放される           | stop()後にポートが再利用可能であること                |
| SRV-06   | タイムアウト時にサーバーが自動停止する               | 指定時間経過後にタイムアウトエラーが発生すること      |
| SRV-07   | code/stateパラメータ欠如時にエラーレスポンスを返す   | 不正なコールバックURLに対してエラーが返されること     |

```typescript
import { describe, it, expect, afterEach } from "vitest";
import { createAuthCallbackServer } from "../authCallbackServer";

describe("ローカルHTTPサーバー", () => {
  let server: ReturnType<typeof createAuthCallbackServer>;

  afterEach(async () => {
    if (server) await server.stop();
  });

  it("SRV-01: サーバーが起動しポート番号を返す", async () => {
    server = createAuthCallbackServer();
    const { port } = await server.start();
    expect(port).toBeGreaterThan(0);
    expect(port).toBeLessThanOrEqual(65535);
  });

  it("SRV-02: 127.0.0.1でバインドされている", async () => {
    server = createAuthCallbackServer({ host: "127.0.0.1" });
    const { port } = await server.start();
    // 外部アドレスからアクセス不可であることを検証
    const response = await fetch(
      `http://127.0.0.1:${port}/auth/callback?code=test&state=test`,
    );
    expect(response.ok).toBe(true);
  });

  it("SRV-03: authorization_codeとstateを受信する", async () => {
    server = createAuthCallbackServer();
    const { port } = await server.start();
    const callbackPromise = server.waitForCallback(5000);

    await fetch(
      `http://127.0.0.1:${port}/auth/callback?code=test_code&state=test_state`,
    );
    const result = await callbackPromise;

    expect(result.code).toBe("test_code");
    expect(result.state).toBe("test_state");
  });

  it("SRV-05: stop()でサーバーが停止する", async () => {
    server = createAuthCallbackServer();
    const { port } = await server.start();
    await server.stop();

    await expect(fetch(`http://127.0.0.1:${port}/`)).rejects.toThrow();
  });

  it("SRV-06: タイムアウト時にエラーが発生する", async () => {
    server = createAuthCallbackServer({ timeoutMs: 100 });
    await server.start();

    await expect(server.waitForCallback(100)).rejects.toThrow(/timeout/i);
  });
});
```

### Task 3: 認証フローオーケストレーターテスト作成

**ファイル**: `apps/desktop/src/main/auth/__tests__/authFlowOrchestrator.test.ts`

以下のテストケースを作成する:

| テストID | テストケース                                              | 検証内容                                                    |
| -------- | --------------------------------------------------------- | ----------------------------------------------------------- |
| ORC-01   | State parameterが32バイト以上のランダム文字列で生成される | 生成されたstateが十分なエントロピーを持つこと               |
| ORC-02   | 受信したstateが保存値と一致する場合にフロー続行           | state検証が成功し次のステップに進むこと                     |
| ORC-03   | 受信したstateが保存値と不一致の場合に認証拒否             | state検証が失敗しエラーが返されること                       |
| ORC-04   | PKCEペアが生成されOAuth URLに含まれる                     | code_challengeとcodeChallengeMethodがURLパラメータに存在    |
| ORC-05   | authorization_codeとcode_verifierでトークン交換する       | Supabase exchangeCodeForSession()が正しい引数で呼ばれること |
| ORC-06   | トークン交換成功後にセッションが確立される                | setSession()が呼ばれること                                  |
| ORC-07   | OAuth開始時にshell.openExternalが呼ばれる                 | ブラウザでOAuth URLが開かれること                           |
| ORC-08   | エラー発生時にクリーンアップが実行される                  | HTTPサーバーの停止・state/codeVerifierの削除が行われること  |
| ORC-09   | トークン交換失敗時にエラーが通知される                    | Renderer Processにエラー情報がIPC経由で送信されること       |

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

describe("認証フローオーケストレーター", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("State parameter", () => {
    it("ORC-01: 32バイト以上のランダム文字列が生成される", () => {
      // state生成の検証
    });

    it("ORC-02: state一致時にフローが続行される", async () => {
      // state検証成功ケース
    });

    it("ORC-03: state不一致時に認証が拒否される", async () => {
      // state検証失敗ケース
    });
  });

  describe("PKCE統合", () => {
    it("ORC-04: OAuth URLにcode_challengeが含まれる", async () => {
      // PKCEパラメータのURL検証
    });

    it("ORC-05: トークン交換が正しい引数で呼ばれる", async () => {
      // exchangeCodeForSession()のモック検証
    });
  });

  describe("フロー制御", () => {
    it("ORC-06: トークン交換成功後にセッションが確立される", async () => {
      // セッション確立の検証
    });

    it("ORC-07: shell.openExternalでOAuth URLが開かれる", async () => {
      // ブラウザ起動の検証
    });
  });

  describe("エラーハンドリング", () => {
    it("ORC-08: エラー発生時にクリーンアップが実行される", async () => {
      // サーバー停止・state削除の検証
    });

    it("ORC-09: トークン交換失敗時にエラーが通知される", async () => {
      // IPC経由のエラー通知検証
    });
  });
});
```

### Task 4: IPC統合テスト作成

**ファイル**: `apps/desktop/src/main/auth/__tests__/auth-ipc-integration.test.ts`

以下のテストケースを作成する:

| テストID | テストケース                                                   | 検証内容                                                                               |
| -------- | -------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| IPC-01   | auth:loginチャネル経由でPKCE OAuthフローが開始される           | IPCハンドラーがオーケストレーターのstartOAuthFlowを呼ぶ                                |
| IPC-02   | 認証成功時にAUTH_STATE_CHANGEDイベントが発行される             | webContents.send()でAUTH_STATE_CHANGEDが送信されること                                 |
| IPC-03   | 認証失敗時にエラー情報がRendererに通知される                   | エラー情報がIPC経由で送信されること                                                    |
| IPC-04   | auth:start-oauth-flowチャネルがPreloadホワイトリストに存在する | ALLOWED_INVOKE_CHANNELSに含まれること                                                  |
| IPC-05   | 認証中のプログレス状態がRendererに通知される                   | 認証開始→処理中→完了/失敗の状態遷移が通知されること                                    |
| IPC-06   | 新規チャネルのwithValidation()適用確認                         | `auth:start-oauth-flow`のIPCハンドラーにwithValidation()が適用されていることを確認する |

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

describe("IPC統合テスト", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("IPC-01: auth:loginチャネルでPKCE OAuthフローが開始される", async () => {
    // authHandlers内のIPCハンドラー呼び出し検証
  });

  it("IPC-02: 認証成功時にAUTH_STATE_CHANGEDが発行される", async () => {
    // webContents.send('AUTH_STATE_CHANGED', ...)の検証
  });

  it("IPC-03: 認証失敗時にエラー情報が通知される", async () => {
    // エラー通知のIPC送信検証
  });

  it("IPC-04: Preloadホワイトリストにチャネルが存在する", () => {
    // ALLOWED_INVOKE_CHANNELS定数の検証
  });

  it("IPC-05: 認証プログレス状態が通知される", async () => {
    // 状態遷移の通知検証
  });
});
```

---

## テスト配置

| テストファイル               | 配置パス                                                            |
| ---------------------------- | ------------------------------------------------------------------- |
| pkce.test.ts                 | `apps/desktop/src/main/auth/__tests__/pkce.test.ts`                 |
| authCallbackServer.test.ts   | `apps/desktop/src/main/auth/__tests__/authCallbackServer.test.ts`   |
| authFlowOrchestrator.test.ts | `apps/desktop/src/main/auth/__tests__/authFlowOrchestrator.test.ts` |
| auth-ipc-integration.test.ts | `apps/desktop/src/main/auth/__tests__/auth-ipc-integration.test.ts` |

**テストフレームワーク**: Vitest

---

## TDD検証: Red状態確認

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test -- --run src/main/auth/__tests__/

# 期待結果: 全テストが失敗（Red状態）
# - pkce.test.ts: モジュール未実装のためimportエラー
# - authCallbackServer.test.ts: モジュール未実装のためimportエラー
# - authFlowOrchestrator.test.ts: モジュール未実装のためimportエラー
# - auth-ipc-integration.test.ts: ハンドラー未変更のためテスト失敗
```

---

## 統合テスト連携

| シナリオカテゴリ       | 検証内容                                         | テストファイル               |
| ---------------------- | ------------------------------------------------ | ---------------------------- |
| PKCE単体               | code_verifier/code_challenge生成・検証           | pkce.test.ts                 |
| HTTPサーバー単体       | サーバーライフサイクル・コールバックパース       | authCallbackServer.test.ts   |
| オーケストレーター統合 | State生成→PKCE→サーバー→トークン交換の統合フロー | authFlowOrchestrator.test.ts |
| IPC統合                | Renderer→Main→Rendererのデータフロー             | auth-ipc-integration.test.ts |

---

## 成果物

| 成果物                   | パス                                                                | 説明                         |
| ------------------------ | ------------------------------------------------------------------- | ---------------------------- |
| PKCEテスト               | `apps/desktop/src/main/auth/__tests__/pkce.test.ts`                 | PKCE生成モジュールのテスト   |
| HTTPサーバーテスト       | `apps/desktop/src/main/auth/__tests__/authCallbackServer.test.ts`   | ローカルHTTPサーバーのテスト |
| オーケストレーターテスト | `apps/desktop/src/main/auth/__tests__/authFlowOrchestrator.test.ts` | 認証フロー統合テスト         |
| IPC統合テスト            | `apps/desktop/src/main/auth/__tests__/auth-ipc-integration.test.ts` | IPC通信統合テスト            |
| テスト仕様書             | `outputs/phase-4/test-specification.md`                             | テスト設計・観点             |

---

## 完了条件

- [ ] Task 1〜4の全テストファイルが作成されている
- [ ] 各テストケース（PKCE-01〜07, SRV-01〜07, ORC-01〜09, IPC-01〜06）が実装されている
- [ ] 全テストがRed状態（失敗）であることを確認している
- [ ] テスト仕様書がoutputs/phase-4/に配置されている
- [ ] モック・スタブの設計がテストコードに反映されている
- [ ] 本Phase内の全タスクを100%実行完了している

---

## タスク100%実行確認

- [ ] Task 1: PKCE生成テスト作成（pkce.test.ts） - 完了
- [ ] Task 2: ローカルHTTPサーバーテスト作成（authCallbackServer.test.ts） - 完了
- [ ] Task 3: 認証フローオーケストレーターテスト作成（authFlowOrchestrator.test.ts） - 完了
- [ ] Task 4: IPC統合テスト作成（auth-ipc-integration.test.ts） - 完了

---

## 次のPhase

[Phase 5: 実装（TDD: Green）](phase-5-implementation.md)
