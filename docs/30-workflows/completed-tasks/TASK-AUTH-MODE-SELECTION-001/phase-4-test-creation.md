# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 4                            |
| Phase名    | テスト作成                   |
| タスクID   | TASK-AUTH-MODE-SELECTION-001 |
| Issue      | #750                         |
| 前提Phase  | Phase 3 (設計レビューゲート) |
| 後続Phase  | Phase 5 (実装)               |
| ステータス | 未実施                       |
| 作成日     | 2026-02-08                   |
| 機能名     | auth-mode-selection          |

---

## 目的

TDD原則に従い、テストを先に作成する（Red状態）。期待される動作を検証するテストを実装より先に作成し、実装の期待動作を明確化する。

## 背景

Phase 3で承認された設計に基づき、失敗するテスト（Red状態）を作成する。認証方式選択機能は正常系・異常系の両方で重要なテストケースが多い。

---

## 実行タスク

### タスク1: テストケース設計

受入基準（AC-1〜AC-7）に基づいてテストケースを設計する。

**テストケース一覧**:

#### 正常系テスト

| TC-ID | テストケース名                         | 受入基準 | テスト内容                                                    |
| ----- | -------------------------------------- | -------- | ------------------------------------------------------------- |
| TC01  | サブスクリプション認証でスキル実行成功 | AC-1     | 認証方式=subscription, ログイン済み状態でスキル実行が成功する |
| TC02  | APIキー認証でスキル実行成功            | AC-3     | 認証方式=api-key, APIキー設定済み状態でスキル実行が成功する   |
| TC03  | 認証方式の切り替えが反映される         | AC-5     | 認証方式を切り替えると即座にModeが変更され、永続化される      |

#### 異常系テスト

| TC-ID | テストケース名               | 受入基準 | テスト内容                                                 |
| ----- | ---------------------------- | -------- | ---------------------------------------------------------- |
| TC04  | サブスク未ログイン時のエラー | AC-2     | 認証方式=subscription, 未ログイン状態でNOT_LOGGED_INエラー |
| TC05  | APIキー未設定時のエラー      | AC-4     | 認証方式=api-key, APIキー未設定でAPI_KEY_NOT_SETエラー     |
| TC06  | トークン期限切れ時のエラー   | AC-7     | トークンが期限切れの場合にTOKEN_EXPIREDエラー              |

#### 境界値テスト

| TC-ID | テストケース名                | 受入基準 | テスト内容                                          |
| ----- | ----------------------------- | -------- | --------------------------------------------------- |
| TC07  | 認証方式設定直後のAPI呼び出し | -        | setMode直後にvalidate()を呼び出しても正しく動作する |

#### E2Eテスト

| TC-ID | テストケース名                   | 受入基準 | テスト内容                                               |
| ----- | -------------------------------- | -------- | -------------------------------------------------------- |
| TC08  | 設定画面→認証方式変更→スキル実行 | AC-5,6   | UIから認証方式を変更し、その後スキル実行が正しく動作する |

---

### タスク2: ユニットテスト作成

**テストファイル配置**:

| テスト対象               | テストファイルパス                                                                         |
| ------------------------ | ------------------------------------------------------------------------------------------ |
| AuthModeService          | `apps/desktop/src/main/services/auth/__tests__/AuthModeService.test.ts`                    |
| SubscriptionAuthProvider | `apps/desktop/src/main/services/auth/__tests__/SubscriptionAuthProvider.test.ts`           |
| authModeHandlers (IPC)   | `apps/desktop/src/main/ipc/__tests__/authModeHandlers.test.ts`                             |
| authModeSlice (状態管理) | `apps/desktop/src/renderer/store/slices/__tests__/authModeSlice.test.ts`                   |
| AuthModeSelector (UI)    | `apps/desktop/src/renderer/components/molecules/AuthModeSelector/__tests__/index.test.tsx` |

**テストコード構造**:

```typescript
// AuthModeService.test.ts
describe("AuthModeService", () => {
  describe("getMode", () => {
    it("デフォルトではsubscriptionモードを返す", async () => {});
    it("設定されたモードを正しく返す", async () => {});
  });

  describe("setMode", () => {
    it("認証方式をsubscriptionに設定できる", async () => {});
    it("認証方式をapi-keyに設定できる", async () => {});
    it("設定が永続化される", async () => {});
  });

  describe("getStatus", () => {
    it("subscription選択時、ログイン状態を含むステータスを返す", async () => {});
    it("api-key選択時、APIキー設定状態を含むステータスを返す", async () => {});
  });

  describe("validate", () => {
    it("subscription選択時、ログイン済みなら有効", async () => {});
    it("subscription選択時、未ログインならNOT_LOGGED_INエラー", async () => {});
    it("api-key選択時、キー設定済みなら有効", async () => {});
    it("api-key選択時、キー未設定ならAPI_KEY_NOT_SETエラー", async () => {});
    it("api-key選択時、キー無効ならAPI_KEY_INVALIDエラー", async () => {});
  });
});
```

```typescript
// SubscriptionAuthProvider.test.ts
describe("SubscriptionAuthProvider", () => {
  describe("getAccessToken", () => {
    it("ログイン済みならアクセストークンを返す", async () => {});
    it("未ログインならNotLoggedInErrorをthrowする", async () => {});
    it("サブスクリプション期限切れならSubscriptionExpiredErrorをthrowする", async () => {});
  });

  describe("isAuthenticated", () => {
    it("ログイン済みならtrueを返す", async () => {});
    it("未ログインならfalseを返す", async () => {});
  });

  describe("getPlan", () => {
    it("ユーザーのプランを正しく返す", async () => {});
  });

  describe("refreshToken", () => {
    it("トークンをリフレッシュできる", async () => {});
    it("リフレッシュ失敗時はエラーをthrowする", async () => {});
  });
});
```

```typescript
// authModeHandlers.test.ts
describe("authModeHandlers", () => {
  describe("auth-mode:get", () => {
    it("現在の認証方式を返す", async () => {});
  });

  describe("auth-mode:set", () => {
    it("認証方式を設定できる", async () => {});
    it("無効なモードは拒否する", async () => {});
  });

  describe("auth-mode:get-status", () => {
    it("認証状態を返す", async () => {});
  });

  describe("auth-mode:validate", () => {
    it("認証検証結果を返す", async () => {});
  });
});
```

```typescript
// authModeSlice.test.ts
describe("authModeSlice", () => {
  describe("fetchMode", () => {
    it("IPCから認証方式を取得してstateを更新する", async () => {});
    it("エラー時はerrorをセットする", async () => {});
  });

  describe("setMode", () => {
    it("IPCで認証方式を設定してstateを更新する", async () => {});
    it("エラー時はerrorをセットする", async () => {});
  });

  describe("auth-mode:changed listener", () => {
    it("イベント受信時にstateを更新する", async () => {});
    it("リスナーは一度だけ登録される", async () => {});
  });
});
```

```typescript
// AuthModeSelector.test.tsx
describe("AuthModeSelector", () => {
  it("2つのセグメント（subscription/api-key）を表示する", () => {});
  it("currentModeに応じて正しいセグメントがアクティブになる", () => {});
  it("セグメントクリックでonModeChangeが呼ばれる", () => {});
  it("disabled=trueの時はクリックできない", () => {});
  it("各セグメントに認証状態アイコンが表示される", () => {});
  it("キーボード操作（Arrow Left/Right）で選択を変更できる", () => {});
  it('role="radiogroup"が設定されている', () => {});
});
```

---

### タスク3: 統合テスト作成

**統合テストシナリオ**:

| シナリオカテゴリ   | テストファイル                        | 検証内容                                   |
| ------------------ | ------------------------------------- | ------------------------------------------ |
| データフローテスト | `AuthModeService.integration.test.ts` | Renderer→IPC→Main→AuthModeService→Supabase |
| エラーハンドリング | `AuthModeService.error.test.ts`       | 認証失敗時のエラー伝播                     |
| 認証連携テスト     | `AuthModeService.auth.test.ts`        | AuthKeyService/Supabase Authとの連携       |

```typescript
// AuthModeService.integration.test.ts
describe("AuthModeService Integration", () => {
  describe("Subscription Auth Flow", () => {
    it("ログイン済みユーザーがスキルを実行できる", async () => {});
    it("未ログインユーザーはエラーになる", async () => {});
    it("セッション期限切れ時は自動リフレッシュを試みる", async () => {});
  });

  describe("API Key Auth Flow", () => {
    it("APIキー設定済みユーザーがスキルを実行できる", async () => {});
    it("APIキー未設定ユーザーはエラーになる", async () => {});
    it("APIキー無効時はエラーになる", async () => {});
  });

  describe("Mode Switch", () => {
    it("subscription→api-keyに切り替えてスキル実行", async () => {});
    it("api-key→subscriptionに切り替えてスキル実行", async () => {});
    it("切り替え後もアプリ再起動で維持される", async () => {});
  });
});
```

---

### タスク4: モック・スタブ設計

**モックオブジェクト一覧**:

| モック対象         | ファイルパス                                 | 用途                  |
| ------------------ | -------------------------------------------- | --------------------- |
| mockAuthKeyService | `__mocks__/services/auth/AuthKeyService.ts`  | APIキー認証のモック   |
| mockSupabaseClient | `__mocks__/infrastructure/supabaseClient.ts` | Supabase認証のモック  |
| mockElectronStore  | `__mocks__/electron-store.ts`                | 永続化のモック        |
| mockIpcMain        | `__mocks__/electron.ts`                      | IPCハンドラーのモック |
| mockWindow         | `__mocks__/electron.ts`                      | BrowserWindowのモック |

**モック設計例**:

```typescript
// mockAuthModeService.ts
export const mockAuthModeService = {
  getMode: vi.fn().mockResolvedValue("subscription"),
  setMode: vi.fn().mockResolvedValue(undefined),
  getStatus: vi.fn().mockResolvedValue({
    mode: "subscription",
    isValid: true,
    details: {
      subscription: {
        isLoggedIn: true,
        plan: "pro",
        expiresAt: Date.now() + 86400000,
      },
    },
  }),
  validate: vi.fn().mockResolvedValue({
    isValid: true,
    errors: [],
  }),
};

// mockSubscriptionAuthProvider.ts
export const mockSubscriptionAuthProvider = {
  getAccessToken: vi.fn().mockResolvedValue("mock-access-token"),
  isAuthenticated: vi.fn().mockResolvedValue(true),
  getPlan: vi.fn().mockResolvedValue("pro"),
  refreshToken: vi.fn().mockResolvedValue(undefined),
};
```

---

## 参照資料

| 参照資料                 | パス                                                                   | 内容                     |
| ------------------------ | ---------------------------------------------------------------------- | ------------------------ |
| 受入基準                 | `outputs/phase-1/acceptance-criteria.md`                               | テスト可能な受け入れ条件 |
| 要件定義書               | `outputs/phase-1/requirements-definition.md`                           | 機能・非機能要件         |
| IPC仕様                  | `outputs/phase-2/ipc-specification.md`                                 | IPCチャンネル詳細設計    |
| 型定義                   | `outputs/phase-2/type-definitions.ts`                                  | TypeScript型定義         |
| 設計レビュー結果         | `outputs/phase-3/design-review-result.md`                              | 承認済み設計             |
| 既存AuthKeyServiceテスト | `apps/desktop/src/main/services/auth/__tests__/AuthKeyService.test.ts` | 既存テスト参考           |

---

## 統合テスト連携【必須】

### Phase 4での必須アクション

- [ ] 統合テストシナリオを作成（データフロー/エラーハンドリング）
- [ ] AuthKeyService/Supabase Authのモック設計
- [ ] Result型エラーハンドリングのテスト設計

**統合テストシナリオ一覧**:

| シナリオカテゴリ   | 検証内容                                    | テストファイル          |
| ------------------ | ------------------------------------------- | ----------------------- |
| API接続テスト      | auth-mode:\* チャンネル疎通・レスポンス形式 | `*.integration.test.ts` |
| データフローテスト | Renderer→IPC→Main→AuthProvider往復          | `*.flow.test.ts`        |
| エラーハンドリング | 認証失敗時のフロントエンド表示・リトライ    | `*.error.test.ts`       |
| 認証連携テスト     | AuthKeyService/Supabase Auth連携            | `*.auth.test.ts`        |
| 状態同期テスト     | auth-mode:changedイベントによるUI更新       | `*.sync.test.ts`        |

---

## アーキテクチャ層別テスト

| 層               | テスト観点                                | テストファイル配置                              |
| ---------------- | ----------------------------------------- | ----------------------------------------------- |
| Renderer Process | AuthModeSelector, authModeSlice, Hooks    | `apps/desktop/src/renderer/**/*.test.ts(x)`     |
| Main Process     | AuthModeService, SubscriptionAuthProvider | `apps/desktop/src/main/**/*.test.ts`            |
| IPC通信          | authModeHandlers, チャンネル動作          | `apps/desktop/src/main/ipc/__tests__/*.test.ts` |
| Shared           | AuthMode型、バリデーション関数            | `packages/shared/**/*.test.ts`                  |

---

## 成果物

| 成果物             | パス                                                                                       | 内容                   |
| ------------------ | ------------------------------------------------------------------------------------------ | ---------------------- |
| テスト仕様書       | `outputs/phase-4/test-specification.md`                                                    | テスト設計・観点       |
| テストケース       | `outputs/phase-4/test-cases.md`                                                            | ケース一覧（8件以上）  |
| 統合テストシナリオ | `outputs/phase-4/integration-test-design.md`                                               | 統合テスト設計         |
| テストファイル     | `apps/desktop/src/main/services/auth/__tests__/AuthModeService.test.ts`                    | ユニットテスト         |
| テストファイル     | `apps/desktop/src/main/services/auth/__tests__/SubscriptionAuthProvider.test.ts`           | ユニットテスト         |
| テストファイル     | `apps/desktop/src/main/ipc/__tests__/authModeHandlers.test.ts`                             | IPCハンドラーテスト    |
| テストファイル     | `apps/desktop/src/renderer/store/slices/__tests__/authModeSlice.test.ts`                   | 状態管理テスト         |
| テストファイル     | `apps/desktop/src/renderer/components/molecules/AuthModeSelector/__tests__/index.test.tsx` | UIコンポーネントテスト |

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test -- AuthModeService
pnpm --filter @repo/desktop test -- SubscriptionAuthProvider
pnpm --filter @repo/desktop test -- authModeHandlers
pnpm --filter @repo/desktop test -- authModeSlice
pnpm --filter @repo/desktop test -- AuthModeSelector
```

**確認項目**:

- [ ] テストが失敗することを確認（Red状態）
- [ ] テスト失敗理由が「実装が存在しない」であること
- [ ] テストケース数が8件以上であること

---

## テストカバレッジ目標

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

---

## 完了条件

- [ ] 受入基準ごとにユニットテストがある（8件以上）
- [ ] 正常系テストケースが作成されている（TC01, TC02, TC03）
- [ ] 異常系テストケースが作成されている（TC04, TC05, TC06）
- [ ] 境界値テストケースが作成されている（TC07）
- [ ] E2Eテストケースが作成されている（TC08）
- [ ] 統合テストシナリオが定義されている
- [ ] すべてのテストが失敗状態（Red）
- [ ] テストカバレッジ目標が設定されている
- [ ] モック・スタブ設計が完了している
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] スキルフィードバックが記録されている

---

## 依存関係

- **前提**: Phase 1, 2, 3 が完了していること
- **後続**: Phase 5 へ進む

---

## スキルフィードバック記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 4 実行記録

### 使用スキル

- tdd-red-green-refactor: {{result}}
- test-doubles: {{result}}

### TDD状態

- Red状態確認: {{Yes/No}}
- 失敗テスト数: {{数}}

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-AUTH-MODE-SELECTION-001/phase-5-implementation.md`
