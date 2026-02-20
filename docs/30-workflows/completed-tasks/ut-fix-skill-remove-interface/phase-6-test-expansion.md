# Phase 6: テスト拡充 — skill:remove IPCハンドラ・Preloadインターフェース不整合修正

## メタ情報

| 項目        | 値                                     |
| ----------- | -------------------------------------- |
| タスクID    | UT-FIX-SKILL-REMOVE-INTERFACE-001      |
| Phase       | 6（テスト拡充）                        |
| 前Phase依存 | Phase 5 実装完了（`outputs/phase-5/`） |
| 担当        | Claude Code                            |
| 作成日      | 2026-02-20                             |

## 目的

Phase 5 で実装した skill:remove ハンドラの修正に対して、セキュリティ検証・エッジケース・統合テストを追加し、カバレッジ基準（Line 90%、Branch 70%、Function 90%）の達成を目指す。

## 実行タスク

- 参照仕様確認: aiworkflow-requirements と既存実装差分を確認する
- 実装/検証手順定義: 本Phaseで実施する作業を具体化する
- 成果物反映: outputs 配下に結果を記録する

1. セキュリティ関連テストケースの追加（`validateIpcSender` 呼び出し検証）
2. エッジケーステストの追加（長大文字列、特殊文字、パストラバーサル文字列）
3. `skillService.removeSkill` エラー伝播テストの追加
4. カバレッジ確認

## 参照資料

> 依存Phase成果物参照: Phase 5

| 資料                                                        | 用途                                            |
| ----------------------------------------------------------- | ----------------------------------------------- |
| `04-electron-security.md`                                   | IPC セキュリティ原則（送信元検証）              |
| `06-known-pitfalls.md#P41`                                  | v8 カバレッジプロバイダのインライン関数カウント |
| `06-known-pitfalls.md#P42`                                  | `.trim()` 3段バリデーション                     |
| `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts` | 追加先テストファイル                            |

## 実行手順

### Step 1: 追加テストケース設計

修正対象ファイル: `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts`

skill:remove の `describe` ブロック末尾に以下のテストケースを追加する。

#### 追加テストケース一覧

| ID       | 種別         | テスト内容                                                     | 引数                                        | 期待結果                                                                                        |
| -------- | ------------ | -------------------------------------------------------------- | ------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| SH-RM-07 | セキュリティ | `validateIpcSender` が正しいチャンネルとオプションで呼ばれる   | `"valid-skill"`                             | `validateIpcSender` が `IPC_CHANNELS.SKILL_REMOVE` と `{ getAllowedWindows }` で呼ばれる        |
| SH-RM-08 | セキュリティ | `validateIpcSender` が invalid 返却時にエラースロー            | `"valid-skill"`（sender検証を FAIL に設定） | `toIPCValidationError` の結果がスローされる                                                     |
| SH-RM-09 | エッジケース | パストラバーサル文字列が `skillService.removeSkill` に渡される | `"../../../etc/passwd"`                     | バリデーション通過し `removeSkill` に文字列が渡される（パストラバーサル対策はサービス層の責務） |
| SH-RM-10 | エッジケース | タブ・改行のみの文字列が VALIDATION_ERROR                      | `"\t\n"`                                    | `{ code: "VALIDATION_ERROR" }` がスローされる                                                   |
| SH-RM-11 | エラー伝播   | `skillService.removeSkill` がエラーをスローした場合に伝播      | `"error-skill"`                             | サービスのエラーがそのまま上位にスローされる                                                    |

### Step 2: テストコード追加

#### SH-RM-07: validateIpcSender 呼び出し検証

```typescript
it("SH-RM-07: should call validateIpcSender with correct channel and options", async () => {
  mockSkillService.removeSkill.mockResolvedValue({
    success: true,
    removed: true,
  });

  const handler = handlers.get(SKILL_CHANNELS.REMOVE);
  if (!handler) {
    throw new Error("skill:remove handler not registered");
  }

  await handler({}, "valid-skill");

  // Then: validateIpcSender が正しい引数で呼ばれている
  expect(mockValidateIpcSender).toHaveBeenCalledWith(
    {},
    SKILL_CHANNELS.REMOVE,
    expect.objectContaining({
      getAllowedWindows: expect.any(Function),
    }),
  );

  // P41準拠: getAllowedWindows コールバックの戻り値を明示的に検証
  const callArgs = mockValidateIpcSender.mock.calls.find(
    (call) => call[1] === SKILL_CHANNELS.REMOVE,
  );
  if (callArgs && callArgs[2]?.getAllowedWindows) {
    const windows = callArgs[2].getAllowedWindows();
    expect(windows).toContain(mockMainWindow);
  }
});
```

#### SH-RM-08: validateIpcSender 失敗時のエラースロー

```typescript
it("SH-RM-08: should throw when validateIpcSender returns invalid", async () => {
  mockValidateIpcSender.mockReturnValueOnce({
    valid: false,
    error: "Unauthorized sender",
  });

  const handler = handlers.get(SKILL_CHANNELS.REMOVE);
  if (!handler) {
    throw new Error("skill:remove handler not registered");
  }

  try {
    await handler({}, "valid-skill");
    throw new Error("Expected validation error");
  } catch (error) {
    // Then: toIPCValidationError の結果がスローされる
    expect(mockToIPCValidationError).toHaveBeenCalledWith({
      valid: false,
      error: "Unauthorized sender",
    });
  }
});
```

#### SH-RM-09: パストラバーサル文字列

```typescript
it("SH-RM-09: should pass path traversal string to skillService (service-level concern)", async () => {
  mockSkillService.removeSkill.mockResolvedValue({
    success: true,
    removed: false,
  });

  const handler = handlers.get(SKILL_CHANNELS.REMOVE);
  if (!handler) {
    throw new Error("skill:remove handler not registered");
  }

  // When: パストラバーサル文字列を渡す（IPCハンドラはバリデーション通過、サービス層で防御）
  await handler({}, "../../../etc/passwd");

  // Then: 文字列としてサービスに渡される
  expect(mockSkillService.removeSkill).toHaveBeenCalledWith(
    "../../../etc/passwd",
  );
});
```

#### SH-RM-10: タブ・改行のみの文字列

```typescript
it("SH-RM-10: should reject tab/newline-only skillName", async () => {
  const handler = handlers.get(SKILL_CHANNELS.REMOVE);
  if (!handler) {
    throw new Error("skill:remove handler not registered");
  }

  // When: タブ・改行のみの文字列を渡す
  try {
    await handler({}, "\t\n");
    throw new Error("Expected validation error");
  } catch (error) {
    // Then: .trim() が空文字列を返すためバリデーションエラー
    expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
    expect((error as { message: string }).message).toBe(
      "skillName must be a non-empty string",
    );
  }
});
```

#### SH-RM-11: サービスエラー伝播

```typescript
it("SH-RM-11: should propagate skillService.removeSkill error", async () => {
  const serviceError = new Error("File system error");
  mockSkillService.removeSkill.mockRejectedValue(serviceError);

  const handler = handlers.get(SKILL_CHANNELS.REMOVE);
  if (!handler) {
    throw new Error("skill:remove handler not registered");
  }

  // When: サービスがエラーをスローする
  try {
    await handler({}, "error-skill");
    throw new Error("Expected service error");
  } catch (error) {
    // Then: サービスのエラーがそのまま伝播する
    expect(error).toBe(serviceError);
    expect((error as Error).message).toBe("File system error");
  }
});
```

### Step 3: テスト実行

```bash
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers.test.ts
```

期待結果: SH-RM-01〜SH-RM-11 の全11テストケースが PASS。

### Step 4: カバレッジ計測

```bash
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers.test.ts --coverage
```

skill:remove ハンドラ部分（`skillHandlers.ts` 行140-155）の目標:

- Line Coverage: 90%以上
- Branch Coverage: 70%以上
- Function Coverage: 90%以上

## 統合テスト連携

| 連携観点             | 本Phaseでの確認内容                                                          |
| -------------------- | ---------------------------------------------------------------------------- |
| Preload→Main IPC契約 | `skill-api.ts` の引数形式と `skillHandlers.ts` の受け口を照合する            |
| バリデーション連携   | sender検証・入力バリデーション・エラーコードの整合を確認する                 |
| テスト連携           | `skillHandlers.test.ts` / `skill-api.test.ts` の期待値と実装契約を一致させる |

## 多角的チェック観点（aiworkflow-requirements）

| 観点               | 参照仕様                                                                                    | 本タスクでの確認ポイント                   |
| ------------------ | ------------------------------------------------------------------------------------------- | ------------------------------------------ |
| API設計            | `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`                        | `skill:import/remove` チャンネル定義の整合 |
| インターフェース   | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | Skill管理API契約（引数・戻り値）整合       |
| アーキテクチャ     | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`               | Main/Preload間の責務境界と引数契約         |
| セキュリティ       | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                   | `validateIpcSender` と入力検証の必須要件   |
| Electron IPC       | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | `safeInvoke` とホワイトリスト制約          |
| 実装パターン       | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | P23/P42に基づく実装整合                    |
| エラーハンドリング | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | `VALIDATION_ERROR` 等の扱い統一            |

## 成果物

| 成果物                 | パス                                                                       |
| ---------------------- | -------------------------------------------------------------------------- |
| テスト拡充済みファイル | `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts`                |
| カバレッジレポート     | `outputs/phase-6/coverage-report.md`（カバレッジ数値と未カバー箇所の記録） |

## 完了条件

- [ ] SH-RM-07〜SH-RM-11 の5テストケースが追加されている
- [ ] SH-RM-07 で `validateIpcSender` の呼び出しと `getAllowedWindows` コールバックを検証している（P41準拠）
- [ ] SH-RM-08 で sender 検証失敗時のエラースローを検証している
- [ ] SH-RM-09 でパストラバーサル文字列がサービス層に渡ることを検証している
- [ ] SH-RM-10 でタブ・改行のみの文字列が拒否されることを検証している
- [ ] SH-RM-11 でサービスエラーの伝播を検証している
- [ ] SH-RM-01〜SH-RM-11 の全11テストが PASS
- [ ] skill:remove 以外のテストにリグレッションがない

## 次Phase

Phase 7（カバレッジ確認）へ進む。カバレッジ基準の充足を確認し、未達の場合は本 Phase に戻る。
