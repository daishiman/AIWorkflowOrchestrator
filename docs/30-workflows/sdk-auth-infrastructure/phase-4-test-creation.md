# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                     |
| ---------- | ---------------------------------------- |
| タスクID   | TASK-FIX-16-1-SDK-AUTH-INFRASTRUCTURE    |
| Phase      | 4                                        |
| Phase名    | テスト作成                               |
| 前提Phase  | Phase 3 (設計レビューゲート)             |
| 後続Phase  | Phase 5 (実装)                           |
| ステータス | 未実施                                   |
| 作成日     | 2026-02-07                               |
| 機能名     | Claude Agent SDK用認証キー管理基盤の構築 |

---

## 目的

TDD Red フェーズ：期待される動作を検証するテストを実装より先に作成する。

Anthropic 認証キーをセキュアに管理し、SDK `query()` 呼び出し時に渡す基盤のテストを作成する。

## 背景

Phase 3で承認された設計に基づき、失敗するテスト（Red状態）を作成する。
テストファーストにより、以下の実装の期待動作を明確化する：

1. **AuthKeyService** - Anthropic APIキーの暗号化保存・復号・検証
2. **SkillExecutor修正** - 認証キーを `query()` に渡す
3. **IPC ハンドラー** - 認証キーの設定・検証・削除
4. **Preload API 拡張** - 認証キー操作用ブリッジ

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。
> 各スキルは `.claude/skills/{{スキル名}}/SKILL.md` を参照してください。

### スキル1: tdd-red-green-refactor

**パス**: `.claude/skills/tdd-red-green-refactor/SKILL.md`

**Trigger条件**:

- TDDサイクルのRedフェーズを実行する場合

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行（Redフェーズのみ）
3. 成果物を下記のパスに出力

**期待される成果物**:

- `apps/desktop/src/main/services/auth/__tests__/AuthKeyService.test.ts`（コード成果物）
- `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.auth.test.ts`（コード成果物）
- `apps/desktop/src/main/ipc/__tests__/authKeyHandlers.test.ts`（コード成果物）
- `outputs/phase-4/test-specification.md`（ドキュメント成果物）

---

### スキル2: test-doubles

**パス**: `.claude/skills/test-doubles/SKILL.md`

**Trigger条件**:

- モック・スタブの設計が必要な場合

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- `outputs/phase-4/test-cases.md`（モック・スタブ設計含む）

---

## 参照資料

| 参照資料          | パス                                                    | 内容                       |
| ----------------- | ------------------------------------------------------- | -------------------------- |
| 既存SecureStorage | `apps/desktop/src/main/services/secureStorage.ts`       | 暗号化パターン参照         |
| SkillExecutor     | `apps/desktop/src/main/services/skill/SkillExecutor.ts` | SDK query()呼び出し元      |
| StoreHandlers     | `apps/desktop/src/main/ipc/storeHandlers.ts`            | IPC ハンドラーパターン参照 |
| Preload Index     | `apps/desktop/src/preload/index.ts`                     | Preload API パターン参照   |
| Channels          | `apps/desktop/src/preload/channels.ts`                  | IPC チャンネル定義         |

### システム仕様（プロジェクトルール）

> 実装前に必ず以下のプロジェクトルールを確認してください。

| 参照資料         | パス                                    | 内容                 |
| ---------------- | --------------------------------------- | -------------------- |
| セキュリティ原則 | `.claude/rules/04-electron-security.md` | 認証セキュリティ原則 |
| コード品質       | `.claude/rules/02-code-quality.md`      | TDD原則、テスト設計  |

### システム仕様（aiworkflow-requirements）

> 以下のシステム仕様書から既存テストパターンを抽出し、テスト設計に反映してください。

| 参照資料                     | パス                                                                              | 内容                                     |
| ---------------------------- | --------------------------------------------------------------------------------- | ---------------------------------------- |
| テスト規約                   | `.claude/skills/aiworkflow-requirements/references/testing.md`                    | テスト設計ガイドライン                   |
| コンポーネントテストパターン | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | モック設計、フィクスチャ                 |
| セキュリティテスト           | `.claude/skills/aiworkflow-requirements/references/security-principles.md`        | 暗号化テスト観点、ログ漏洩テスト         |
| IPCセキュリティテスト        | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`      | IPC sender検証テスト                     |
| 認証インターフェース         | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`            | AuthSession型モック設計                  |
| エラーハンドリング規約       | `.claude/skills/aiworkflow-requirements/references/error-handling.md`             | Result型テストパターン、エラーコード検証 |

### テスト対象の既存実装パターン参照

> 以下の既存テストを参考に、テスト構造・モック設計を統一してください。

| 既存テスト             | パス                                                         | 確認項目                        |
| ---------------------- | ------------------------------------------------------------ | ------------------------------- |
| secureStorage.test.ts  | `apps/desktop/src/main/infrastructure/secureStorage.test.ts` | safeStorageモック、暗号化テスト |
| apiKeyHandlers.test.ts | `apps/desktop/src/main/ipc/apiKeyHandlers.test.ts`           | IPCハンドラーテストパターン     |
| storeHandlers.test.ts  | `apps/desktop/src/main/ipc/storeHandlers.test.ts`            | ハンドラー登録テスト            |

---

## 成果物

| 成果物                  | パス                                                                        | 内容                             |
| ----------------------- | --------------------------------------------------------------------------- | -------------------------------- |
| AuthKeyServiceテスト    | `apps/desktop/src/main/services/auth/__tests__/AuthKeyService.test.ts`      | 暗号化・復号・検証テスト         |
| SkillExecutor認証テスト | `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.auth.test.ts` | 認証キー連携テスト               |
| IPC ハンドラーテスト    | `apps/desktop/src/main/ipc/__tests__/authKeyHandlers.test.ts`               | 設定・検証・削除ハンドラーテスト |
| テスト仕様書            | `outputs/phase-4/test-specification.md`                                     | テスト設計・観点                 |
| テストケース            | `outputs/phase-4/test-cases.md`                                             | モック・スタブ設計               |

---

## テストケース設計

### 1. AuthKeyService テスト

```typescript
describe("AuthKeyService", () => {
  describe("setApiKey", () => {
    it("Anthropic APIキーを暗号化して保存できる", async () => {});
    it("safeStorageが利用不可の場合は警告を出して保存する", async () => {});
    it("空文字のキーはバリデーションエラーを返す", async () => {});
    it("無効なキー形式はバリデーションエラーを返す", async () => {});
  });

  describe("getApiKey", () => {
    it("保存済みのAPIキーを復号して取得できる", async () => {});
    it("キーが未設定の場合はnullを返す", async () => {});
    it("復号に失敗した場合はフォールバックでプレーンテキストを返す", async () => {});
  });

  describe("deleteApiKey", () => {
    it("保存済みのAPIキーを削除できる", async () => {});
    it("存在しないキーの削除は何もしない", async () => {});
  });

  describe("validateApiKey", () => {
    it("有効なAPIキー形式を検証できる", async () => {});
    it("Anthropic APIエンドポイントへの接続を検証できる", async () => {});
    it("無効なキーの場合はエラーを返す", async () => {});
    it("ネットワークエラー時はリトライ可能なエラーを返す", async () => {});
  });

  describe("hasApiKey", () => {
    it("キーが設定されている場合はtrueを返す", async () => {});
    it("キーが未設定の場合はfalseを返す", async () => {});
  });
});
```

### 2. SkillExecutor 認証連携テスト

```typescript
describe("SkillExecutor - Auth Integration", () => {
  describe("execute with authentication", () => {
    it("AuthKeyServiceからAPIキーを取得してquery()に渡す", async () => {});
    it("キー未設定時はAUTHENTICATION_ERRORを返す", async () => {});
    it("キー検証失敗時はAUTHENTICATION_ERRORを返す", async () => {});
    it("query()呼び出し時にapiKeyオプションが設定される", async () => {});
  });

  describe("error handling", () => {
    it("認証エラーはリトライ不可として扱う", async () => {});
    it("401/403エラーはAUTHENTICATION_ERRORとして分類される", async () => {});
  });
});
```

### 3. IPC ハンドラーテスト

```typescript
describe("authKeyHandlers", () => {
  describe("AUTH_KEY_SAVE", () => {
    it("APIキーを保存できる", async () => {});
    it("バリデーションエラー時は失敗レスポンスを返す", async () => {});
    it("既存キーを上書き保存できる", async () => {});
  });

  describe("AUTH_KEY_VALIDATE", () => {
    it("保存済みキーを検証できる", async () => {});
    it("キー未設定時はエラーを返す", async () => {});
    it("検証結果（有効/無効）を返す", async () => {});
  });

  describe("AUTH_KEY_DELETE", () => {
    it("保存済みキーを削除できる", async () => {});
    it("削除成功レスポンスを返す", async () => {});
  });

  describe("AUTH_KEY_HAS", () => {
    it("キー設定状態を確認できる", async () => {});
  });
});
```

### 4. 統合テストシナリオ

| シナリオカテゴリ   | 検証内容                                          |
| ------------------ | ------------------------------------------------- |
| データフローテスト | Preload → IPC → AuthKeyService → SecureStorage    |
| エラーハンドリング | 各層でのエラー伝播とRenderer への適切なレスポンス |
| セキュリティテスト | 暗号化・復号の正確性、キーのメモリ露出防止        |

---

## モック・スタブ設計

### 必要なモック

| モック対象             | 目的                   | モック方法                   |
| ---------------------- | ---------------------- | ---------------------------- |
| `electron.safeStorage` | 暗号化APIのテスト      | vi.mock('electron')          |
| `electron-store`       | ストレージ操作のテスト | vi.mock('electron-store')    |
| `@anthropic-ai/sdk`    | API検証のテスト        | vi.mock('@anthropic-ai/sdk') |
| `BrowserWindow`        | IPC送信テスト          | vi.fn() で webContents.send  |

### モックファクトリ

```typescript
// apps/desktop/src/main/services/auth/__tests__/mocks.ts
export function createMockSafeStorage(isAvailable: boolean = true) {
  return {
    isEncryptionAvailable: vi.fn().mockReturnValue(isAvailable),
    encryptString: vi
      .fn()
      .mockImplementation((str: string) => Buffer.from(`encrypted:${str}`)),
    decryptString: vi
      .fn()
      .mockImplementation((buf: Buffer) =>
        buf.toString().replace("encrypted:", ""),
      ),
  };
}

export function createMockAuthKeyStore() {
  const store = new Map<string, string>();
  return {
    get: vi.fn().mockImplementation((key: string) => store.get(key)),
    set: vi
      .fn()
      .mockImplementation((key: string, value: string) =>
        store.set(key, value),
      ),
    delete: vi.fn().mockImplementation((key: string) => store.delete(key)),
    clear: vi.fn().mockImplementation(() => store.clear()),
  };
}
```

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test -- AuthKeyService
pnpm --filter @repo/desktop test -- SkillExecutor.auth
pnpm --filter @repo/desktop test -- authKeyHandlers
```

**確認項目**:

- [ ] テストが失敗することを確認（Red状態）

---

## 完了条件

- [ ] AuthKeyService の全テストケースが作成されている
- [ ] SkillExecutor 認証連携テストが作成されている
- [ ] IPC ハンドラーテストが作成されている
- [ ] 統合テストシナリオが定義されている
- [ ] すべてのテストが失敗状態（Red）
- [ ] テストカバレッジ目標が設定されている（Line 80%, Branch 60%）
- [ ] モック・スタブ設計が完了している
- [ ] セキュリティ観点のテストが含まれている
- [ ] **本Phase内の全スキルを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全スキルを100%実行完了
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

`docs/30-workflows/sdk-auth-infrastructure/phase-5-implementation.md`
