# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                                                        |
| ---------- | ----------------------------------------------------------- |
| Phase      | 6                                                           |
| タスクID   | TASK-SW-FIX-DATAFLOW-001                                    |
| 機能名     | Step 1回答→スキル生成連携（Q1〜Q6コンテキストブリッジ実装） |
| タスク種別 | implementation                                              |
| 前提Phase  | Phase 5（実装完了・TC-01〜TC-10 Green）                     |
| 後続Phase  | Phase 7                                                     |
| 作成日     | 2026-04-12                                                  |
| ステータス | completed                                                   |

## 目的

Phase 4 で定義した TC-01〜TC-10 に加え、フェイルパス・エッジケース・後方互換回帰ガードを追加し、データフロー全体の堅牢性を高めるテストスイートを完成させる。

## 追加テストケース

### フェイルパス（異常系）

#### TC-11: buildSkillContext — formData が undefined フィールドを持つ場合

```typescript
it("TC-11: formDataにundefinedフィールドがあってもエラーにならない", () => {
  const formData = {
    skillName: undefined,
    category: undefined,
    purpose: undefined,
  };
  const answers = {
    q1: "Q1のみ",
    q2: undefined,
    q3: undefined,
    q4: undefined,
    q5: undefined,
    q6: undefined,
  };

  expect(() => buildSkillContext(formData, answers)).not.toThrow();
  const result = buildSkillContext(formData, answers);
  expect(result.q1Purpose).toBe("Q1のみ");
  expect(result.skillName).toBeUndefined();
});
```

#### TC-12: buildSkillGenerationPrompt — 全フィールド undefined でも空文字を返す（エラーなし）

```typescript
it("TC-12: 全フィールドundefinedでも空文字プロンプトが返る", () => {
  const context: SkillCreationContext = {};
  const prompt = buildSkillGenerationPrompt(context);
  expect(prompt).toBe("");
  expect(() => buildSkillGenerationPrompt(context)).not.toThrow();
});
```

#### TC-13: createSkill Thunk — IPC 呼び出しが失敗した場合に rejected アクションが発火する

```typescript
it("TC-13: IPC呼び出し失敗時にrejectedアクションが発火する", async () => {
  vi.spyOn(window.api.skill, "create").mockRejectedValueOnce(
    new Error("IPC Error"),
  );
  const dispatch = vi.fn();
  const thunk = createSkill({ context: { purpose: "test" } });
  await thunk(dispatch, () => ({}), undefined);
  const rejectedCall = dispatch.mock.calls.find(([action]) =>
    action.type?.includes("rejected"),
  );
  expect(rejectedCall).toBeDefined();
});
```

### エッジケース

#### TC-14: buildSkillContext — 空白のみの文字列が undefined に正規化される

```typescript
it("TC-14: 空白のみの文字列はundefinedに正規化される", () => {
  const formData = { skillName: "   ", category: "\t", purpose: "\n" };
  const answers = { q1: "  ", q2: "", q3: "", q4: "", q5: "", q6: "" };

  const result = buildSkillContext(formData, answers);

  // trim() 後に空文字 → undefined
  expect(result.skillName).toBeUndefined();
  expect(result.category).toBeUndefined();
  expect(result.purpose).toBeUndefined();
  expect(result.q1Purpose).toBeUndefined();
});
```

#### TC-15: buildSkillGenerationPrompt — q1Purpose と purpose が両方ある場合 q1Purpose が優先される

```typescript
it("TC-15: q1Purposeとpurposeがともにあるときはq1Purposeが優先される", () => {
  const context: SkillCreationContext = {
    purpose: "formDataのpurpose",
    q1Purpose: "Q1の詳細な回答",
  };
  const prompt = buildSkillGenerationPrompt(context);
  expect(prompt).toContain("Q1の詳細な回答");
  // purpose は q1Purpose で上書きされるため含まれないか、重複しない
});
```

#### TC-16: SkillCreationContext — 長大な入力値が切り捨てられずに保持される

```typescript
it("TC-16: 長大な入力値が切り捨てられずにContextに保持される", () => {
  const longText = "あ".repeat(1000);
  const formData = { skillName: longText, category: "", purpose: "" };
  const answers = { q1: longText, q2: "", q3: "", q4: "", q5: "", q6: "" };

  const result = buildSkillContext(formData, answers);

  expect(result.skillName).toHaveLength(1000);
  expect(result.q1Purpose).toHaveLength(1000);
});
```

### 後方互換回帰ガード

#### TC-17: 既存の createSkill 呼び出しパターン（purpose のみ）が回帰していないこと

```typescript
it("TC-17: [回帰] purpose のみの context で既存動作が維持される", async () => {
  const context: SkillCreationContext = { purpose: "既存の目的" };
  const mockCreate = vi
    .spyOn(window.api.skill, "create")
    .mockResolvedValueOnce({ id: "skill-1" });

  const dispatch = createMockDispatch();
  await dispatch(createSkill({ context }));

  expect(mockCreate).toHaveBeenCalledWith(
    expect.objectContaining({ purpose: "既存の目的" }),
    undefined,
  );
});
```

#### TC-18: Q1〜Q6 がプロンプトに反映されることを E2E レベルで確認

```typescript
it("TC-18: [E2E相当] Q1〜Q6の全回答がLLMプロンプトに含まれる", () => {
  const context: SkillCreationContext = {
    q1Purpose: "PRレビューを自動化する",
    q2Target: "フロントエンド開発チーム",
    q3Tools: "GitHub Actions",
    q4Timing: "PR作成時",
    q5Output: "レビューコメントJSON",
    q6Constraints: "本番ブランチへの直push禁止",
  };

  const prompt = buildSkillGenerationPrompt(context);

  expect(prompt).toContain("PRレビューを自動化する");
  expect(prompt).toContain("フロントエンド開発チーム");
  expect(prompt).toContain("GitHub Actions");
  expect(prompt).toContain("PR作成時");
  expect(prompt).toContain("レビューコメントJSON");
  expect(prompt).toContain("本番ブランチへの直push禁止");
});
```

## 回帰影響確認コマンド

```bash
# 拡充テスト（TC-11〜TC-18）実行
pnpm vitest run --reporter=verbose --grep "TC-1[1-9]"

# 全テストスイート実行（回帰なし確認）
pnpm vitest run --reporter=verbose

# 型チェック（SkillCreationContext 型の整合確認）
pnpm typecheck
```

## 参照資料

| 資料名               | パス                                       | 用途                   |
| -------------------- | ------------------------------------------ | ---------------------- |
| Phase 4 テストケース | `outputs/phase-4/test-cases.md`            | 拡充対象のベーステスト |
| Phase 5 実装記録     | `outputs/phase-5/implementation-record.md` | 実装内容の確認         |

## 成果物

| 成果物             | パス                                     | 説明                  |
| ------------------ | ---------------------------------------- | --------------------- |
| 拡充テストケース書 | `outputs/phase-6/expanded-test-cases.md` | TC-11〜TC-18 詳細定義 |

## 完了条件

- [ ] TC-11〜TC-18 が追加されていること
- [ ] 全テストケース（TC-01〜TC-18）が Green（PASS）であること
- [ ] 既存テストへの回帰影響がゼロであること
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 7: カバレッジ確認
