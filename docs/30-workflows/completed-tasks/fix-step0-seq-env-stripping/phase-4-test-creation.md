# Phase 4: テスト作成

## メタ情報

| 項目   | 値                                               |
| ------ | ------------------------------------------------ |
| Phase  | 4                                                |
| 機能名 | SkillExecutor env オプション全環境変数上書き修正 |
| 作成日 | 2026-04-01                                       |

## 目的

`SkillExecutor.callSDKQuery()` の `env` オプション修正を検証するユニットテストを定義・作成する（TDD Red 段階）。

## テスト対象

- `apps/desktop/src/main/services/skill/SkillExecutor.ts` の `callSDKQuery` メソッド（L858-868）

## テストファイル

- `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.auth.test.ts`（既存ファイルを拡張）
- `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.sdk-types.test.ts`（変更なし、型 baseline）

## TDD Red 段階のテストケース定義（最小セット）

### TC-01: env に PATH が含まれること（AC-1）

```typescript
it("callSDKQuery が query() に渡す env に PATH を保持すること", async () => {
  // Arrange
  const testPath = process.env.PATH ?? "/usr/local/bin:/usr/bin:/bin";
  vi.stubEnv("PATH", testPath);

  // Act
  await executor.execute(mockRequest, mockSkill);

  // Assert
  const callArgs = mockQuery.mock.calls[0][0];
  expect(callArgs.options.env.PATH).toBe(testPath);
  expect(callArgs.options.env.ANTHROPIC_API_KEY).toBe(validApiKey);
});
```

**Red フェーズでの動作**: 修正前は `PATH` が欠落するため失敗する。

### TC-02: env に ANTHROPIC_API_KEY が含まれること（AC-2）

```typescript
it("callSDKQuery が query() に渡す env に ANTHROPIC_API_KEY が含まれること", async () => {
  // Arrange
  const apiKey = validApiKey;

  // Act
  await executor.execute(mockRequest, mockSkill);

  // Assert
  const callArgs = mockQuery.mock.calls[0][0];
  expect(callArgs.options.env.ANTHROPIC_API_KEY).toBe(apiKey);
});
```

**目的**: `env` の必須キーが保持されることを明示する回帰テスト。

### TC-03: process.env.ANTHROPIC_API_KEY より引数 apiKey が優先されること（FR-03）

```typescript
it("callSDKQuery が process.env.ANTHROPIC_API_KEY より AuthKeyService の apiKey を優先すること", async () => {
  // Arrange
  vi.stubEnv("ANTHROPIC_API_KEY", "process-env-key");
  const apiKey = validApiKey;

  // Act
  await executor.execute(mockRequest, mockSkill);

  // Assert
  const callArgs = mockQuery.mock.calls[0][0];
  expect(callArgs.options.env.ANTHROPIC_API_KEY).toBe(apiKey);
  expect(callArgs.options.env.PATH).toBeDefined();
});
```

**目的**: `process.env` 側の値より引数が優先されることを固定する。

## テストセットアップ方針

既存 `SkillExecutor.auth.test.ts` の auth suite に追記し、新規テストファイルは作成しない。

## Red フェーズ確認コマンド

```bash
# Red フェーズ: 修正前のコードで auth suite の PATH アサーションが失敗することを確認
pnpm --filter @repo/desktop exec vitest run \
  src/main/services/skill/__tests__/SkillExecutor.auth.test.ts
```

期待される Red フェーズの失敗:

- TC-01: `PATH` が `env` に存在しないため失敗

## テスト統合観点

| テストID | 確認観点                                     | 対応 AC     | 期待結果（Green 後）                        |
| -------- | -------------------------------------------- | ----------- | ------------------------------------------- |
| TC-01    | `env` に `PATH` が含まれるか                 | AC-1        | `PATH` が `process.env.PATH` の値で含まれる |
| TC-02    | `env` に `ANTHROPIC_API_KEY` が含まれるか    | AC-2        | `ANTHROPIC_API_KEY` が引数の値で含まれる    |
| TC-03    | `apiKey` 引数が `process.env` を上書きするか | AC-2, FR-03 | 引数の `apiKey` が優先される                |

## 参照資料

| 資料名           | パス                                                    | 説明                         |
| ---------------- | ------------------------------------------------------- | ---------------------------- |
| 設計書           | `./phase-2-design.md`                                   | env オプション修正設計       |
| 設計レビュー     | `./phase-3-design-review.md`                            | AC 充足確認                  |
| SkillExecutor.ts | `apps/desktop/src/main/services/skill/SkillExecutor.ts` | テスト対象（L858-868, L861） |

## 成果物

| 成果物         | パス                                                                        | 説明            |
| -------------- | --------------------------------------------------------------------------- | --------------- |
| テスト仕様     | `phase-4-test-creation.md`                                                  | 本ファイル      |
| テスト拡張対象 | `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.auth.test.ts` | 既存 auth suite |

## 完了条件

- [ ] TC-01 〜 TC-03 のテストケースが定義されている
- [ ] `env` に `PATH` が含まれるかを検証するテスト（TC-01）がある
- [ ] `env` に `ANTHROPIC_API_KEY` が含まれるかを検証するテスト（TC-02）がある
- [ ] `apiKey` 引数が `process.env` を上書きすることを検証するテスト（TC-03）がある
- [ ] Red フェーズで修正前コードが TC-01 で失敗することが確認されている
- [ ] **本Phase内の全タスクを100%実行完了**
