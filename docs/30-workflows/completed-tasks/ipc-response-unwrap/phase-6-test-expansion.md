# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目         | 内容                           |
| ------------ | ------------------------------ |
| Phase        | 6                              |
| Phase名      | テスト拡充                     |
| タスクID     | UT-FIX-IPC-RESPONSE-UNWRAP-001 |
| GitHub Issue | #816                           |
| 前提Phase    | Phase 5（実装）                |
| 後続Phase    | Phase 7（カバレッジ確認）      |
| ステータス   | 未実施                         |
| 作成日       | 2026-02-14                     |
| 機能名       | ipc-response-unwrap            |
| 種別         | バグ修正 (fix)                 |

---

## 目的

Phase 5（実装）完了後、`safeInvokeUnwrap<T>()` 関数と修正済み4メソッドのカバレッジ不足箇所を補完するテストを追加する。エッジケース、境界値、不正応答形式への耐性を検証し、既存テストとの整合性を確認する。

---

## 実行タスク

| Task | 内容                     | 対象ファイル                                                  |
| ---- | ------------------------ | ------------------------------------------------------------- |
| 1    | エッジケーステスト追加   | `apps/desktop/src/preload/__tests__/skill-api.unwrap.test.ts` |
| 2    | 境界値テスト追加         | 同上                                                          |
| 3    | 既存テストとの整合性確認 | 既存3テストファイル + agentSlice テスト                       |
| 4    | テスト実行               | テストコマンド実行                                            |

---

## 参照資料

| 種別               | パス                                                                  | 内容                      |
| ------------------ | --------------------------------------------------------------------- | ------------------------- |
| Phase 4 テスト     | `apps/desktop/src/preload/__tests__/skill-api.unwrap.test.ts`         | ラッパー展開テスト        |
| Phase 5 成果物     | `outputs/phase-5/implementation-result.md`                            | 実装結果の確認            |
| 実装ファイル       | `apps/desktop/src/preload/skill-api.ts`                               | safeInvokeUnwrap 実装済み |
| 既存テスト(1)      | `apps/desktop/src/preload/__tests__/skill-api.test.ts`                | 統一 SkillAPI テスト      |
| 既存テスト(2)      | `apps/desktop/src/preload/__tests__/skill-api.unification.test.ts`    | API 統一テスト            |
| 既存テスト(3)      | `apps/desktop/src/preload/__tests__/skill-api.permission.test.ts`     | 権限 API テスト           |
| agentSlice テスト  | `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.test.ts` | fetchSkills テスト        |
| IPC ハンドラ       | `apps/desktop/src/main/ipc/skillHandlers.ts`                          | Main 側応答形式の確認用   |
| テスト戦略         | `aiworkflow-requirements/references/testing-component-patterns.md`    | テスト設計パターン        |
| エラーハンドリング | `aiworkflow-requirements/references/error-handling.md`                | エラー処理パターン        |

---

## 実行手順

### Task 1: エッジケーステスト追加

**テストファイル**: `apps/desktop/src/preload/__tests__/skill-api.unwrap.test.ts`（Phase 4 で作成済み）に追加

#### テストケース一覧

| #   | テストケース                                                              | 期待結果                                                   |
| --- | ------------------------------------------------------------------------- | ---------------------------------------------------------- |
| 1   | `safeInvokeUnwrap` に `data` フィールドが存在しない応答が返された場合     | `result.data`（= `undefined`）が返る                       |
| 2   | `safeInvokeUnwrap` に `success` フィールドが存在しない応答が返された場合  | `!result.success` が `true` と評価され、Error をスローする |
| 3   | `safeInvokeUnwrap` に `null` が返された場合                               | `Cannot read properties of null` エラーがスローされる      |
| 4   | `safeInvokeUnwrap` に `undefined` が返された場合                          | `Cannot read properties of undefined` エラーがスローされる |
| 5   | `ipcRenderer.invoke` が reject した場合（ネットワークエラー等）           | reject されたエラーがそのまま伝播する                      |
| 6   | `safeInvokeUnwrap` に `{ success: true, data: null }` が返された場合      | `null` が返る                                              |
| 7   | `safeInvokeUnwrap` に `{ success: true, data: undefined }` が返された場合 | `undefined` が返る                                         |

#### テストコード概要

```typescript
describe("safeInvokeUnwrap - エッジケース", () => {
  it("data フィールドが存在しない応答では undefined が返る", async () => {
    mockInvoke.mockResolvedValue({ success: true });

    const result = await skillAPI.list();

    expect(result).toBeUndefined();
  });

  it("success フィールドが存在しない応答では Error をスローする", async () => {
    mockInvoke.mockResolvedValue({ data: [] });

    // !undefined は true と評価されるため、Error がスローされる
    await expect(skillAPI.list()).rejects.toThrow("IPC call failed");
  });

  it("null 応答では TypeError がスローされる", async () => {
    mockInvoke.mockResolvedValue(null);

    await expect(skillAPI.list()).rejects.toThrow();
  });

  it("undefined 応答では TypeError がスローされる", async () => {
    mockInvoke.mockResolvedValue(undefined);

    await expect(skillAPI.list()).rejects.toThrow();
  });

  it("ipcRenderer.invoke が reject した場合はエラーがそのまま伝播する", async () => {
    mockInvoke.mockRejectedValue(new Error("Network disconnected"));

    await expect(skillAPI.list()).rejects.toThrow("Network disconnected");
  });

  it("{ success: true, data: null } では null が返る", async () => {
    mockInvoke.mockResolvedValue({ success: true, data: null });

    const result = await skillAPI.list();

    expect(result).toBeNull();
  });

  it("{ success: true, data: undefined } では undefined が返る", async () => {
    mockInvoke.mockResolvedValue({ success: true, data: undefined });

    const result = await skillAPI.list();

    expect(result).toBeUndefined();
  });
});
```

### Task 2: 境界値テスト追加

**テストファイル**: Task 1 と同一ファイル

#### テストケース一覧

| #   | テストケース                                                          | 期待結果                                    |
| --- | --------------------------------------------------------------------- | ------------------------------------------- |
| 1   | 空配列 `{ success: true, data: [] }` の展開                           | 空配列 `[]` が返る                          |
| 2   | 大量データ `{ success: true, data: [100件の SkillMetadata] }` の展開  | 100件の配列が返る                           |
| 3   | 単一要素配列 `{ success: true, data: [1件] }` の展開                  | 1件の配列が返る                             |
| 4   | ネストされたオブジェクト `{ success: true, data: { nested: {...} } }` | ネストされたオブジェクトがそのまま返る      |
| 5   | 空文字列エラー `{ success: false, error: "" }` の場合                 | 空文字列のメッセージで Error がスローされる |
| 6   | 長いエラーメッセージ `{ success: false, error: "..." }` の場合        | 長いメッセージで Error がスローされる       |

#### テストコード概要

```typescript
describe("safeInvokeUnwrap - 境界値テスト", () => {
  it("空配列を正しく展開する", async () => {
    mockInvoke.mockResolvedValue({ success: true, data: [] });

    const result = await skillAPI.list();

    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(0);
  });

  it("100件の SkillMetadata を正しく展開する", async () => {
    const largeData = Array.from({ length: 100 }, (_, i) =>
      createMockSkillMetadata({ name: `skill-${i}` }),
    );
    mockInvoke.mockResolvedValue({ success: true, data: largeData });

    const result = await skillAPI.list();

    expect(result).toHaveLength(100);
    expect(result[0].name).toBe("skill-0");
    expect(result[99].name).toBe("skill-99");
  });

  it("単一要素配列を正しく展開する", async () => {
    const singleItem = [createMockSkillMetadata({ name: "only-one" })];
    mockInvoke.mockResolvedValue({ success: true, data: singleItem });

    const result = await skillAPI.list();

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("only-one");
  });

  it("空文字列エラーメッセージで Error をスローする", async () => {
    mockInvoke.mockResolvedValue({ success: false, error: "" });

    await expect(skillAPI.list()).rejects.toThrow("");
  });

  it("長いエラーメッセージで Error をスローする", async () => {
    const longError = "エラー: ".repeat(100);
    mockInvoke.mockResolvedValue({ success: false, error: longError });

    await expect(skillAPI.list()).rejects.toThrow(longError);
  });
});
```

### Task 3: 既存テストとの整合性確認

以下の既存テストファイルが Phase 5 の修正後も引き続き PASS することを確認する。

#### 確認対象ファイルと確認方法

| #   | テストファイル                                                        | 確認方法                                                                                    | 期待結果         |
| --- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ---------------- |
| 1   | `apps/desktop/src/preload/__tests__/skill-api.test.ts`                | `cd apps/desktop && pnpm vitest run src/preload/__tests__/skill-api.test.ts`                | 全テスト PASS    |
| 2   | `apps/desktop/src/preload/__tests__/skill-api.unification.test.ts`    | `cd apps/desktop && pnpm vitest run src/preload/__tests__/skill-api.unification.test.ts`    | 全テスト PASS    |
| 3   | `apps/desktop/src/preload/__tests__/skill-api.permission.test.ts`     | `cd apps/desktop && pnpm vitest run src/preload/__tests__/skill-api.permission.test.ts`     | 全テスト PASS    |
| 4   | `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.test.ts` | `cd apps/desktop && pnpm vitest run src/renderer/store/slices/__tests__/agentSlice.test.ts` | fetchSkills PASS |

#### 特記事項

- `skill-api.test.ts` の既存テストは `mockInvoke.mockResolvedValue(配列)` でモックしているため、`safeInvokeUnwrap` 導入後の動作確認が必要
  - `safeInvokeUnwrap` は `result.success` を確認するため、配列を直接返すモックでは `!undefined` が `true` と評価され、Error がスローされる可能性がある
  - 既存テストのモック戻り値を `{ success: true, data: 配列 }` 形式に修正する必要があるかを確認する
  - 修正が必要な場合は本 Task 内で対応する

### Task 4: テスト実行

#### 実行コマンド

```bash
# Phase 6 追加テストの実行
cd apps/desktop && pnpm vitest run src/preload/__tests__/skill-api.unwrap.test.ts

# 既存 Preload テストの実行
cd apps/desktop && pnpm vitest run src/preload/__tests__/skill-api.test.ts
cd apps/desktop && pnpm vitest run src/preload/__tests__/skill-api.unification.test.ts
cd apps/desktop && pnpm vitest run src/preload/__tests__/skill-api.permission.test.ts

# 全 Preload テストの一括実行
cd apps/desktop && pnpm vitest run src/preload/__tests__/

# agentSlice テストの実行
cd apps/desktop && pnpm vitest run src/renderer/store/slices/__tests__/agentSlice.test.ts
```

#### 確認項目

- [ ] `skill-api.unwrap.test.ts` の全テスト（Phase 4 + Phase 6 追加分）が PASS する
- [ ] `skill-api.test.ts` の全テストが PASS する
- [ ] `skill-api.unification.test.ts` の全テストが PASS する
- [ ] `skill-api.permission.test.ts` の全テストが PASS する
- [ ] `agentSlice.test.ts` の fetchSkills テストが PASS する

---

## テスト環境の注意事項

### P39: happy-dom 環境での制約

- テスト環境は `happy-dom` を使用している
- `@testing-library/user-event` の `userEvent.setup()` は使用禁止
- 本タスクは Preload 層のユニットテストのため、DOM 操作は発生しない

### P40: テスト実行ディレクトリ

- テスト実行は必ず `apps/desktop` ディレクトリから行う
- コマンド: `cd apps/desktop && pnpm vitest run <テストパス>`
- プロジェクトルートからの実行は `vitest.config.ts` の設定が読み込まれないため禁止

### P9: テスト間の状態リーク防止

- `beforeEach` で `vi.clearAllMocks()` を実行し、モック状態をリセットする
- 各テストケースは独立して実行可能であること
- テスト間でモジュールスコープの変数を共有しない

---

## 統合テスト連携

### Phase 6 での必須アクション

- [ ] エッジケーステスト（7ケース）が追加されている
- [ ] 境界値テスト（6ケース）が追加されている
- [ ] 既存テスト（4ファイル）が全て PASS している
- [ ] 既存テストのモック戻り値が `safeInvokeUnwrap` 導入後の動作と整合している

---

## ユニットテストカバレッジ基準

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

---

## 多角的チェック観点

| 観点               | 確認内容                                                                     |
| ------------------ | ---------------------------------------------------------------------------- |
| エッジケース網羅   | null, undefined, フィールド欠損、ネットワークエラーの全パターンをテスト済み  |
| 境界値網羅         | 空配列、単一要素、大量データ（100件）の展開がテスト済み                      |
| エラーメッセージ   | 空文字列、長い文字列、デフォルトメッセージの3パターンをテスト済み            |
| 既存テスト影響     | 4テストファイルが全て PASS している                                          |
| ipcRenderer.invoke | reject 時のエラー伝播がテスト済み                                            |
| 型安全（P19）      | 実行時の応答形式チェックが正しく動作している（型キャストだけに頼っていない） |

---

## 成果物

| 成果物           | パス                                                          | 内容                       |
| ---------------- | ------------------------------------------------------------- | -------------------------- |
| テストコード追加 | `apps/desktop/src/preload/__tests__/skill-api.unwrap.test.ts` | エッジケース・境界値テスト |

---

## 完了条件

- [ ] エッジケーステスト（7ケース）が `skill-api.unwrap.test.ts` に追加されている
- [ ] 境界値テスト（6ケース）が `skill-api.unwrap.test.ts` に追加されている
- [ ] `skill-api.unwrap.test.ts` の全テストが PASS している
- [ ] `skill-api.test.ts` の全テストが PASS している
- [ ] `skill-api.unification.test.ts` の全テストが PASS している
- [ ] `skill-api.permission.test.ts` の全テストが PASS している
- [ ] `agentSlice.test.ts` の fetchSkills テストが PASS している
- [ ] 既存テストのモック戻り値の整合性が確認されている
- [ ] テスト間で状態がリークしていないこと

---

## 依存関係

- **前提**: Phase 5（実装）が完了していること
- **後続**: Phase 7（カバレッジ確認）へ進む

---

## 次の Phase

完了後、以下のファイルを実行してください:

`docs/30-workflows/ipc-response-unwrap/phase-7-coverage-verification.md`
