# Phase 4: テスト作成（TDD Red） - タスク仕様書

## メタ情報

| 項目         | 内容                           |
| ------------ | ------------------------------ |
| Phase        | 4                              |
| Phase名      | テスト作成（TDD Red）          |
| タスクID     | UT-FIX-IPC-RESPONSE-UNWRAP-001 |
| GitHub Issue | #816                           |
| 前提Phase    | Phase 3（設計レビュー）        |
| 後続Phase    | Phase 5（実装）                |
| ステータス   | 未実施                         |
| 作成日       | 2026-02-14                     |
| 機能名       | ipc-response-unwrap            |
| 種別         | バグ修正 (fix)                 |

---

## 目的

TDD Red フェーズとして、`safeInvokeUnwrap<T>()` 関数および修正後の4メソッド（`list`, `getImported`, `import`, `rescan`）の期待動作を検証する失敗テストを作成する。テストファーストにより、IPC レスポンスラッパー `{ success: true, data: T }` を展開して `T` を直接返す動作仕様を明確化する。

---

## 実行タスク

| Task | 内容                                      | 対象ファイル                                                          |
| ---- | ----------------------------------------- | --------------------------------------------------------------------- |
| 1    | safeInvokeUnwrap 関数のユニットテスト設計 | `apps/desktop/src/preload/__tests__/skill-api.unwrap.test.ts`（新規） |
| 2    | skill-api 4メソッドの展開テスト           | 同上                                                                  |
| 3    | agentSlice.fetchSkills() 統合テスト確認   | `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.test.ts` |

---

## 参照資料

| 種別               | パス                                                                              | 内容                           |
| ------------------ | --------------------------------------------------------------------------------- | ------------------------------ |
| 元タスク仕様書     | `docs/30-workflows/completed-tasks/task-ut-fix-ipc-response-unwrap-001.md`        | タスク指示書                   |
| Phase 1 成果物     | `docs/30-workflows/ipc-response-unwrap/outputs/`                                  | 要件定義成果物                 |
| Phase 2 成果物     | `docs/30-workflows/ipc-response-unwrap/outputs/`                                  | 設計成果物                     |
| Phase 3 成果物     | `docs/30-workflows/ipc-response-unwrap/outputs/`                                  | 設計レビュー結果               |
| 既存テスト         | `apps/desktop/src/preload/__tests__/skill-api.test.ts`                            | 統一SkillAPIテスト（65テスト） |
| 既存テスト         | `apps/desktop/src/preload/__tests__/skill-api.unification.test.ts`                | API統一テスト                  |
| 既存テスト         | `apps/desktop/src/preload/__tests__/skill-api.permission.test.ts`                 | 権限APIテスト                  |
| agentSlice テスト  | `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.test.ts`             | fetchSkillsテスト              |
| Preload ソース     | `apps/desktop/src/preload/skill-api.ts`                                           | 修正対象ファイル               |
| IPC ハンドラ       | `apps/desktop/src/main/ipc/skillHandlers.ts`                                      | Main側応答形式の確認用         |
| セキュリティ仕様   | `aiworkflow-requirements/references/security-api-electron.md`                     | IPC セキュリティ設計           |
| IPC 設計仕様       | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | Skill IPC 設計仕様             |
| インターフェース   | `aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`                | Skill API 型定義               |
| エラーハンドリング | `aiworkflow-requirements/references/error-handling.md`                            | エラー処理パターン             |
| テスト戦略         | `aiworkflow-requirements/references/testing-component-patterns.md`                | テスト設計パターン             |

---

## 実行手順

### Task 1: safeInvokeUnwrap 関数のユニットテスト設計

**テストファイル**: `apps/desktop/src/preload/__tests__/skill-api.unwrap.test.ts`（新規作成）

既存の `skill-api.test.ts` は65テストが存在し十分に大きいため、レスポンスラッパー展開に関するテストは独立ファイルとして作成する。

#### テストケース一覧

| #   | テストケース                                                                 | 期待結果                                                              |
| --- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| 1   | `safeInvokeUnwrap` が `{ success: true, data: [...] }` を受け取った場合      | `data` フィールドの配列を直接返す                                     |
| 2   | `safeInvokeUnwrap` が `{ success: true, data: { ... } }` を受け取った場合    | `data` フィールドのオブジェクトを直接返す                             |
| 3   | `safeInvokeUnwrap` が `{ success: false, error: "エラーメッセージ" }` の場合 | `Error("エラーメッセージ")` をスローする                              |
| 4   | `safeInvokeUnwrap` が `{ success: false }` の場合（error フィールドなし）    | デフォルトエラーメッセージ `IPC call failed: ${channel}` をスローする |
| 5   | 許可されていないチャンネルで呼び出した場合                                   | `Promise.reject` で `Channel ${channel} is not allowed` エラー        |

#### テストコード概要

```typescript
describe("safeInvokeUnwrap - レスポンスラッパー展開", () => {
  it("{ success: true, data: [...] } から配列を展開して返す", async () => {
    const mockData = [{ name: "skill-1" }, { name: "skill-2" }];
    mockInvoke.mockResolvedValue({ success: true, data: mockData });

    const result = await skillAPI.list();

    expect(Array.isArray(result)).toBe(true);
    expect(result).toEqual(mockData);
    expect(result).toHaveLength(2);
    // ラッパーオブジェクトではなく配列が直接返ることを検証
    expect(
      (result as unknown as Record<string, unknown>).success,
    ).toBeUndefined();
  });

  it("{ success: false, error: 'msg' } で Error をスローする", async () => {
    mockInvoke.mockResolvedValue({
      success: false,
      error: "スキャンに失敗しました",
    });

    await expect(skillAPI.list()).rejects.toThrow("スキャンに失敗しました");
  });

  it("{ success: false } でデフォルトエラーメッセージをスローする", async () => {
    mockInvoke.mockResolvedValue({ success: false });

    await expect(skillAPI.list()).rejects.toThrow("IPC call failed");
  });

  it("許可されていないチャンネルで Promise.reject を返す", async () => {
    // safeInvoke の既存動作を維持（safeInvokeUnwrap も内部で safeInvoke を使用するため）
    // ALLOWED_INVOKE_CHANNELS に含まれないチャンネルは拒否される
    expect(ALLOWED_INVOKE_CHANNELS).not.toContain("invalid:channel");
  });
});
```

### Task 2: skill-api メソッド展開テスト

**テストファイル**: Task 1 と同一ファイル（`skill-api.unwrap.test.ts`）

#### テストケース一覧

| #   | テストケース                                                               | 期待結果                                                     |
| --- | -------------------------------------------------------------------------- | ------------------------------------------------------------ |
| 1   | `skill.list()` が `{ success: true, data: SkillMetadata[] }` を展開        | `SkillMetadata[]` を直接返す（ラッパーオブジェクトではない） |
| 2   | `skill.getImported()` が `{ success: true, data: ImportedSkill[] }` を展開 | `ImportedSkill[]` を直接返す                                 |
| 3   | `skill.rescan()` が `{ success: true, data: SkillMetadata[] }` を展開      | `SkillMetadata[]` を直接返す                                 |
| 4   | `skill.import(skillName)` が適切な形式で結果を返す                         | `ImportedSkill` を直接返す                                   |
| 5   | `skill.list()` エラーレスポンス時に例外スロー                              | `Error` をスローする                                         |
| 6   | `skill.getImported()` エラーレスポンス時に例外スロー                       | `Error` をスローする                                         |
| 7   | `skill.rescan()` エラーレスポンス時に例外スロー                            | `Error` をスローする                                         |
| 8   | `skill.import(skillName)` エラー時に例外スロー                             | `Error` をスローする                                         |

#### テストコード概要

```typescript
describe("skill-api メソッド展開テスト", () => {
  describe("list()", () => {
    it("SkillMetadata[] を直接返す（ラッパーなし）", async () => {
      const mockSkills = [createMockSkillMetadata({ name: "skill-a" })];
      mockInvoke.mockResolvedValue({ success: true, data: mockSkills });

      const result = await skillAPI.list();

      expect(Array.isArray(result)).toBe(true);
      expect(result[0].name).toBe("skill-a");
    });

    it("エラーレスポンス時に例外をスローする", async () => {
      mockInvoke.mockResolvedValue({
        success: false,
        error: "スキャンに失敗しました",
      });

      await expect(skillAPI.list()).rejects.toThrow("スキャンに失敗しました");
    });
  });

  describe("getImported()", () => {
    it("ImportedSkill[] を直接返す", async () => {
      const mockImported = [createMockImportedSkill({ name: "imported-1" })];
      mockInvoke.mockResolvedValue({ success: true, data: mockImported });

      const result = await skillAPI.getImported();

      expect(Array.isArray(result)).toBe(true);
      expect(result[0].name).toBe("imported-1");
    });

    it("エラーレスポンス時に例外をスローする", async () => {
      mockInvoke.mockResolvedValue({
        success: false,
        error: "スキル取得に失敗しました",
      });

      await expect(skillAPI.getImported()).rejects.toThrow(
        "スキル取得に失敗しました",
      );
    });
  });

  describe("rescan()", () => {
    it("SkillMetadata[] を直接返す", async () => {
      const mockSkills = [createMockSkillMetadata({ name: "rescanned-1" })];
      mockInvoke.mockResolvedValue({ success: true, data: mockSkills });

      const result = await skillAPI.rescan();

      expect(Array.isArray(result)).toBe(true);
      expect(result[0].name).toBe("rescanned-1");
    });

    it("エラーレスポンス時に例外をスローする", async () => {
      mockInvoke.mockResolvedValue({
        success: false,
        error: "スキャンに失敗しました",
      });

      await expect(skillAPI.rescan()).rejects.toThrow("スキャンに失敗しました");
    });
  });

  describe("import(skillName)", () => {
    it("ImportedSkill を直接返す", async () => {
      // SKILL_IMPORT ハンドラは skillService.importSkills() を直接返す（ラッパーなし）
      // そのため safeInvokeUnwrap ではなく safeInvoke を使用する可能性がある
      const mockResult = createMockImportedSkill({ name: "new-skill" });
      mockInvoke.mockResolvedValue(mockResult);

      const result = await skillAPI.import("new-skill");

      expect(result.name).toBe("new-skill");
    });

    it("エラー時に例外をスローする", async () => {
      mockInvoke.mockRejectedValue(new Error("Skill not found: unknown-skill"));

      await expect(skillAPI.import("unknown-skill")).rejects.toThrow(
        "Skill not found",
      );
    });
  });
});
```

### Task 3: agentSlice.fetchSkills() 統合テスト確認

**テストファイル**: `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.test.ts`

既存テストで `fetchSkills()` が配列を正しく受け取ることを検証する。既存テストが IPC レスポンスラッパーではなく配列を直接 mockInvoke から返す設計であるため、Phase 5 実装後にテストが PASS することを確認する。

#### 確認項目

| #   | 確認項目                                         | 確認方法                                            |
| --- | ------------------------------------------------ | --------------------------------------------------- |
| 1   | fetchSkills() が配列を正しく受け取る             | `agentSlice.test.ts` の該当テスト確認               |
| 2   | `importedSkills.forEach` が正常動作する          | 配列メソッド呼び出しが成功することを検証            |
| 3   | 既存テストのモック戻り値が修正後の動作と整合する | mockInvoke の戻り値がラッパーではなく配列であること |

---

## テスト環境の注意事項

### P39: happy-dom 環境での制約

- テスト環境は `happy-dom` を使用している
- `@testing-library/user-event` の `userEvent.setup()` は使用禁止
- 非同期ハンドラが必要な場合は `await act(async () => { fireEvent.click(el) })` を使用する
- 本タスクは Preload 層のユニットテストのため、DOM 操作は発生しない

### P40: テスト実行ディレクトリ

- テスト実行は必ず `apps/desktop` ディレクトリから行う
- コマンド: `cd apps/desktop && pnpm vitest run src/preload/__tests__/skill-api.unwrap.test.ts`
- プロジェクトルートからの実行は `vitest.config.ts` の設定が読み込まれないため禁止

### P9: テスト間の状態リーク防止

- `beforeEach` で `vi.clearAllMocks()` を実行し、モック状態をリセットする
- モジュールスコープの変数をテスト間で共有しない
- 各テストケースは独立して実行可能であること

---

## 統合テスト連携

### Phase 4 での必須アクション

- [ ] `safeInvokeUnwrap` のユニットテスト設計（ラッパー展開の正常系・異常系）
- [ ] 4メソッド（list, getImported, rescan, import）の展開テスト設計
- [ ] agentSlice.fetchSkills() との統合テストシナリオ確認
- [ ] 既存テスト（`skill-api.test.ts`）との互換性確認

---

## 多角的チェック観点

| 観点               | 確認内容                                                                |
| ------------------ | ----------------------------------------------------------------------- |
| 受入基準網羅       | 7項目の受入基準に対応するテストケースが存在する                         |
| エラーハンドリング | `{ success: false, error: "msg" }` と `{ success: false }` の両方       |
| 型安全             | 戻り値が `SkillMetadata[]`, `ImportedSkill[]`, `ImportedSkill` 型である |
| 境界値             | 空配列 `[]` の展開が正常に動作する                                      |
| 既存テスト影響     | 既存の `skill-api.test.ts` のテストに影響を与えない                     |
| SKILL_IMPORT       | ラッパーなし応答の場合の取り扱いが正しい                                |

---

## 成果物

| 成果物               | パス                                                                 | 内容                            |
| -------------------- | -------------------------------------------------------------------- | ------------------------------- |
| テストコード（新規） | `apps/desktop/src/preload/__tests__/skill-api.unwrap.test.ts`        | safeInvokeUnwrap ユニットテスト |
| テスト確認結果       | `docs/30-workflows/ipc-response-unwrap/outputs/phase-4/test-spec.md` | テスト設計仕様書                |

---

## 完了条件

- [ ] `safeInvokeUnwrap` の正常系テスト（5ケース）が作成されている
- [ ] 4メソッドの展開テスト（8ケース）が作成されている
- [ ] agentSlice.fetchSkills() の統合テストシナリオが確認されている
- [ ] 全テストが Red 状態（失敗）であること（`safeInvokeUnwrap` 未実装のため）
- [ ] 既存テスト（`skill-api.test.ts`）に影響を与えていないこと
- [ ] テスト間で状態がリークしないこと（`beforeEach` でリセット）
- [ ] テスト実行コマンド: `cd apps/desktop && pnpm vitest run src/preload/__tests__/skill-api.unwrap.test.ts`

---

## TDD 検証

```bash
# Red 状態の確認
cd apps/desktop && pnpm vitest run src/preload/__tests__/skill-api.unwrap.test.ts
```

**確認項目**:

- [ ] テストが失敗することを確認（Red 状態）
- [ ] 失敗理由が「safeInvokeUnwrap 未実装」または「ラッパーオブジェクトが展開されていない」であること

---

## 依存関係

- **前提**: Phase 1, 2, 3 が完了していること
- **後続**: Phase 5（実装）へ進む

---

## 次の Phase

完了後、以下のファイルを実行してください:

`docs/30-workflows/ipc-response-unwrap/phase-5-implementation.md`
