# Phase 6: テスト拡充 — skill:import IPCハンドラ・Preloadインターフェース不整合修正

## メタ情報

| 項目     | 値                                   |
| -------- | ------------------------------------ |
| Phase    | 6（テスト拡充）                      |
| 機能名   | skill:import IPCインターフェース修正 |
| タスクID | UT-FIX-SKILL-IMPORT-INTERFACE-001    |
| 作成日   | 2026-02-21                           |

## 目的

Phase 5で作成したテストのカバレッジ不足箇所を特定し、追加テストケースを作成する。境界値テスト・異常系テスト・エラーサニタイズテストを網羅的に追加し、skill:importハンドラの堅牢性を検証する。

## 実行タスク

- カバレッジ分析: Phase 5の結果から未カバー箇所を特定する
- 追加テスト作成: SH-IMP-08〜SH-IMP-13、境界値、エラーサニタイズを追加する
- 回帰確認: 追加テストを含む関連テストを実行し、PASSを確認する

## 参照資料

| 資料                                     | パス                                                                            | 用途                           |
| ---------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------ |
| Phase 4 テスト設計                       | `docs/30-workflows/ut-fix-skill-import-interface-001/phase-4-test-creation.md`  | テストケース設計の基盤         |
| Phase 5 実装                             | `docs/30-workflows/ut-fix-skill-import-interface-001/phase-5-implementation.md` | 実装コードの確認               |
| P42: .trim()バリデーション漏れ           | `.claude/rules/06-known-pitfalls.md#P42`                                        | 3段バリデーションの検証基準    |
| P41: v8カバレッジプロバイダ              | `.claude/rules/06-known-pitfalls.md#P41`                                        | インライン関数カウントの注意点 |
| P44: import/removeインターフェース不整合 | `.claude/rules/06-known-pitfalls.md#P44`                                        | 修正パターンの検証基準         |
| skill:remove修正済みテスト               | `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts`（remove部分）       | テストパターンの参考           |

### システム仕様（aiworkflow-requirements）

| 参照資料         | パス                                                                              | 内容                     |
| ---------------- | --------------------------------------------------------------------------------- | ------------------------ |
| テスト品質       | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | カバレッジ・品質基準     |
| テスト実装       | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | テストパターン基準       |
| インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | Skill API挙動整合        |
| セキュリティ     | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`         | バリデーション観点       |
| IPC契約チェック  | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`     | P23/P32/P42/P44 統合確認 |

## 実行手順

### Step 1: カバレッジ不足箇所の特定

Phase 5のテストを実行し、カバレッジレポートを生成する:

```bash
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers --coverage
```

カバレッジレポートから以下を確認する:

- Line Coverage が90%未満のファイル・行
- Branch Coverage が70%未満の分岐
- Function Coverage が90%未満の関数

### Step 2: 追加テストケースの作成

以下のテストケースを `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts` に追加する:

#### SH-IMP-08: 数値型引数に対するバリデーション

```typescript
it("SH-IMP-08: 数値型引数に対してVALIDATION_ERRORを返す", async () => {
  // typeof 123 !== "string" でバリデーション失敗
  const result = await handler(mockEvent, 123 as unknown as string);
  expect(result).toEqual({
    success: false,
    error: {
      code: "VALIDATION_ERROR",
      message: "skillName must be a non-empty string",
    },
  });
});
```

#### SH-IMP-09: null引数に対するバリデーション

```typescript
it("SH-IMP-09: null引数に対してVALIDATION_ERRORを返す", async () => {
  const result = await handler(mockEvent, null as unknown as string);
  expect(result).toEqual({
    success: false,
    error: {
      code: "VALIDATION_ERROR",
      message: "skillName must be a non-empty string",
    },
  });
});
```

#### SH-IMP-10: undefined引数に対するバリデーション

```typescript
it("SH-IMP-10: undefined引数に対してVALIDATION_ERRORを返す", async () => {
  const result = await handler(mockEvent, undefined as unknown as string);
  expect(result).toEqual({
    success: false,
    error: {
      code: "VALIDATION_ERROR",
      message: "skillName must be a non-empty string",
    },
  });
});
```

#### SH-IMP-11: オブジェクト引数に対するバリデーション（旧形式）

```typescript
it("SH-IMP-11: 旧形式オブジェクト引数 { skillIds: [] } に対してVALIDATION_ERRORを返す", async () => {
  // 旧形式の引数が来た場合、typeof object !== "string" でバリデーション失敗
  const result = await handler(mockEvent, {
    skillIds: ["test-skill"],
  } as unknown as string);
  expect(result).toEqual({
    success: false,
    error: {
      code: "VALIDATION_ERROR",
      message: "skillName must be a non-empty string",
    },
  });
});
```

#### SH-IMP-12: 特殊文字を含むスキル名の正常処理

```typescript
it("SH-IMP-12: 特殊文字を含むスキル名を正常に処理する", async () => {
  mockSkillService.importSkills.mockResolvedValue({ success: true, data: [...] });
  const result = await handler(mockEvent, "my-skill_v2.0");
  expect(mockSkillService.importSkills).toHaveBeenCalledWith(["my-skill_v2.0"]);
  expect(result.success).toBe(true);
});
```

#### SH-IMP-13: skillService.importSkills()がエラーを返した場合

```typescript
it("SH-IMP-13: skillService.importSkills()のエラーを安全にハンドリングする", async () => {
  mockSkillService.importSkills.mockRejectedValue(
    new Error("Internal database error"),
  );
  const result = await handler(mockEvent, "valid-skill");
  expect(result.success).toBe(false);
  // 内部エラーメッセージがサニタイズされていること
  expect(result.error.message).not.toContain("Internal database error");
});
```

### Step 3: 境界値テスト

```typescript
describe("境界値テスト", () => {
  it("空文字列に対してVALIDATION_ERRORを返す", async () => {
    const result = await handler(mockEvent, "");
    expect(result.success).toBe(false);
    expect(result.error.code).toBe("VALIDATION_ERROR");
  });

  it("スペースのみの文字列に対してVALIDATION_ERRORを返す", async () => {
    const result = await handler(mockEvent, "   ");
    expect(result.success).toBe(false);
    expect(result.error.code).toBe("VALIDATION_ERROR");
  });

  it("タブのみの文字列に対してVALIDATION_ERRORを返す", async () => {
    const result = await handler(mockEvent, "\t\t");
    expect(result.success).toBe(false);
    expect(result.error.code).toBe("VALIDATION_ERROR");
  });

  it("改行のみの文字列に対してVALIDATION_ERRORを返す", async () => {
    const result = await handler(mockEvent, "\n\n");
    expect(result.success).toBe(false);
    expect(result.error.code).toBe("VALIDATION_ERROR");
  });
});
```

### Step 4: エラーサニタイズテスト

```typescript
describe("エラーサニタイズ", () => {
  it("内部エラーの詳細がレスポンスに漏洩しない", async () => {
    mockSkillService.importSkills.mockRejectedValue(
      new Error("ENOENT: no such file or directory, open '/secret/path'"),
    );
    const result = await handler(mockEvent, "valid-skill");
    expect(result.error.message).not.toContain("/secret/path");
    expect(result.error.message).not.toContain("ENOENT");
  });
});
```

### Step 5: テスト全件実行

```bash
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers
```

全テストがPASSすることを確認する。

## 統合テスト連携

- skill:removeの既存テストと共通のテストパターンを使用する
- `mockSkillService` のモック構成はskill:removeテストと一貫性を保つ
- `mockValidateIpcSender` の設定はskill:removeテストに準拠する

## 多角的チェック観点

| 観点                 | 確認内容                                                                  |
| -------------------- | ------------------------------------------------------------------------- |
| 型安全性             | 全テストケースで型アサーション（`as unknown as string`）が適切か          |
| P42準拠              | 3段バリデーション（型チェック→空文字列→トリム空文字列）が検証されているか |
| P44準拠              | 旧形式引数（オブジェクト）が拒否されるか                                  |
| エラーサニタイズ     | 内部情報がレスポンスに漏洩しないか                                        |
| skill:removeとの整合 | テストパターンがskill:removeと一貫しているか                              |

## 成果物

| 成果物                 | パス                                                        |
| ---------------------- | ----------------------------------------------------------- |
| テストコード（追加分） | `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts` |

## 完了条件

- [ ] SH-IMP-08〜SH-IMP-13の全テストケースが作成されている
- [ ] 境界値テスト（空文字列・スペースのみ・タブのみ・改行のみ）が作成されている
- [ ] エラーサニタイズテストが作成されている
- [ ] 追加テストを含む全テストがPASSする
- [ ] テストパターンがskill:removeと一貫している

## 次のPhase

Phase 7（カバレッジ確認）へ進む。
