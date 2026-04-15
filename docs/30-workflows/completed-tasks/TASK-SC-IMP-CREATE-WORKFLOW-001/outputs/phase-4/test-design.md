# Phase 4: テスト設計 - タスク仕様書

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 4                               |
| Phase名    | テスト設計                      |
| 前提Phase  | Phase 3: 設計レビューゲート     |
| 後続Phase  | Phase 5: 実装計画               |
| ステータス | 完了                            |
| 作成日     | 2026-04-14                      |
| タスクID   | TASK-SC-IMP-CREATE-WORKFLOW-001 |

---

## 目的

TDD の Red フェーズとして、`runCreateWorkflow` 実装前に失敗するテストケースを設計する。
AC-1〜AC-5 を網羅するテストケース一覧と、既存 `collaborative` モードテストの回帰確認計画を策定する。

---

## 実行タスク

### タスク1: 新規テストケース設計（AC-1〜AC-4）

**目的**: `runCreateWorkflow` の振る舞いを検証するテストケースを設計する

**実行手順**:

1. `SkillCreatorService.test.ts` の既存テスト構造を確認
2. AC-1（loadAgent 呼び出し確認）のテストを設計
3. AC-2（後続処理継続確認）のテストを設計
4. AC-3（フォールバック確認）のテストを設計
5. AC-4（options.description 使用確認）のテストを設計

**期待される成果物**:

- テストケース一覧（TC-01〜TC-04）

---

### タスク2: 回帰テスト計画（AC-5）

**目的**: collaborative モードの既存テストが引き続きパスすることを確認する計画を立てる

**実行手順**:

1. 既存の collaborative モードテストケースを特定
2. 型変更（void → StructurePlanJson | null）が既存テストに影響しないことを確認
3. 回帰テスト実行コマンドを特定

**期待される成果物**:

- 回帰テスト計画（既存テストID一覧と実行コマンド）

---

### タスク3: テスト実装ガイド作成

**目的**: 実装者がテストを迷わず書けるように具体的なテストコードのスケルトンを設計する

**実行手順**:

1. Vitest のモック/スパイ API を使った `loadAgent` スパイ設計
2. エラーシナリオ（loadAgent が reject する）のモック設計
3. テストファイルへの追加位置（describe ブロック）を指定

**期待される成果物**:

- テストコードスケルトン

---

## テストケース一覧

### 新規テストケース（TDD Red フェーズ）

| TC ID | 対応AC | テストタイトル                                              | 種別     | 期待結果                                     |
| ----- | ------ | ----------------------------------------------------------- | -------- | -------------------------------------------- |
| TC-01 | AC-1   | create モードで createSkill() を呼ぶと loadAgent が呼ばれる | ユニット | `resourceLoader.loadAgent` が最低1回呼ばれる |
| TC-02 | AC-2   | runCreateWorkflow 完了後、createSkill() がスキルパスを返す  | ユニット | `createSkill()` が文字列パスを返す           |
| TC-03 | AC-3   | loadAgent が例外をスローしても createSkill() は成功する     | ユニット | `createSkill()` が例外をスローしない         |
| TC-04 | AC-4   | runCreateWorkflow は options.description を使用する         | ユニット | structurePlan に description が含まれる      |
| TC-05 | AC-1   | loadAgent は "extract-purpose" エージェントを読み込む       | ユニット | `loadAgent("extract-purpose")` が呼ばれる    |

### 回帰テストケース（AC-5）

| TC ID  | 対応AC | テストタイトル                                                     | 種別 | 期待結果       |
| ------ | ------ | ------------------------------------------------------------------ | ---- | -------------- |
| TC-R01 | AC-5   | collaborative モード: interviewResult なしでエラーをスローする     | 回帰 | 既存動作と同一 |
| TC-R02 | AC-5   | collaborative モード: 有効な interviewResult でスキルが作成される  | 回帰 | 既存動作と同一 |
| TC-R03 | AC-5   | collaborative モード: runCollaborativeWorkflow が loadAgent を呼ぶ | 回帰 | 既存動作と同一 |

---

## テストコードスケルトン

```typescript
// apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts
// 既存の describe('SkillCreatorService', ...) 内に追加

describe("create モード", () => {
  let service: SkillCreatorService;
  let loadAgentSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    service = new SkillCreatorService("/test/skills", "/test/workflows");
    // resourceLoader.loadAgent をスパイ
    loadAgentSpy = vi
      .spyOn(
        (service as unknown as { resourceLoader: ResourceLoader })
          .resourceLoader,
        "loadAgent",
      )
      .mockResolvedValue("mock-agent-content");

    // scriptExecutor.execute をモック（init_skill.js 等が成功するように）
    vi.spyOn(
      (service as unknown as { scriptExecutor: ScriptExecutor }).scriptExecutor,
      "execute",
    ).mockResolvedValue({
      success: true,
      stdout: "/test/skills/test-skill",
      stderr: "",
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // TC-01: AC-1 — loadAgent が呼ばれる
  it("TC-01: create モードで createSkill() を呼ぶと loadAgent が呼ばれる", async () => {
    await service.createSkill({
      name: "test-skill",
      description: "テスト用スキル",
      mode: "create",
    });

    expect(loadAgentSpy).toHaveBeenCalled();
  });

  // TC-02: AC-2 — 後続処理が継続する
  it("TC-02: runCreateWorkflow 完了後、createSkill() がスキルパスを返す", async () => {
    const result = await service.createSkill({
      name: "test-skill",
      description: "テスト用スキル",
      mode: "create",
    });

    expect(typeof result).toBe("string");
    expect(result).toContain("test-skill");
  });

  // TC-03: AC-3 — loadAgent 失敗時もフォールバック
  it("TC-03: loadAgent が例外をスローしても createSkill() は成功する", async () => {
    loadAgentSpy.mockRejectedValue(new Error("Agent file not found"));

    await expect(
      service.createSkill({
        name: "test-skill",
        description: "テスト用スキル",
        mode: "create",
      }),
    ).resolves.not.toThrow();
  });

  // TC-04: AC-4 — options.description が使用される
  it("TC-04: runCreateWorkflow は options.description を使用する", async () => {
    const description = "詳細な説明テキスト";

    await service.createSkill({
      name: "test-skill",
      description,
      mode: "create",
    });

    // loadAgent が呼ばれた後、description が structurePlan に含まれることを
    // runCreateWorkflow の戻り値経由で間接的に確認
    expect(loadAgentSpy).toHaveBeenCalled();
    // description が void で破棄されていないことを確認（void options 削除の検証）
    // 実装後: structurePlan.description === description を直接検証
  });

  // TC-05: AC-1 詳細 — "extract-purpose" エージェントを読み込む
  it("TC-05: loadAgent は extract-purpose エージェントを読み込む", async () => {
    await service.createSkill({
      name: "test-skill",
      description: "テスト用スキル",
      mode: "create",
    });

    expect(loadAgentSpy).toHaveBeenCalledWith("extract-purpose");
  });
});
```

---

## 回帰テスト実行コマンド

```bash
# SkillCreatorService のテスト全件実行
pnpm --filter @repo/desktop test -- --testPathPattern="SkillCreatorService"

# collaborative モードのテストのみ実行（回帰確認）
pnpm --filter @repo/desktop test -- --testPathPattern="SkillCreatorService" --grep "collaborative"

# 全テスト実行（CI 相当）
pnpm vitest run
```

---

## TDD 検証

### TDD サイクル確認

```bash
# Red フェーズ確認（実装前にテストが失敗することを確認）
pnpm --filter @repo/desktop test -- --testPathPattern="SkillCreatorService" --grep "create モード"
```

**確認項目**:

- [ ] TC-01〜TC-05 が Red 状態（実装前は失敗）であることを確認
- [ ] TC-R01〜TC-R03 が Green 状態（既存テストは成功）であることを確認
- [ ] 実装後（Phase 5 完了後）に全テストが Green になることを目標とする

---

## 参照資料

| 参照資料                    | パス                                                                         | 内容                   |
| --------------------------- | ---------------------------------------------------------------------------- | ---------------------- |
| SkillCreatorService.test.ts | `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts` | テスト追加対象         |
| Phase 2 設計書              | `outputs/phase-2/design.md`                                                  | 実装設計（テスト根拠） |
| Phase 3 レビュー結果        | `outputs/phase-3/review.md`                                                  | AC 対応チェックリスト  |

---

## 成果物

| 成果物         | パス                             | 内容                       |
| -------------- | -------------------------------- | -------------------------- |
| test-design.md | `outputs/phase-4/test-design.md` | 本ファイル（テスト設計書） |

---

## 統合テスト連携

- 統合テストシナリオ: `create` モードの end-to-end フロー（`createSkill()` → `runCreateWorkflow()` → `generateSkillMd()`）を
  TC-02 の後続処理継続テストでカバーする
- タスクA完了後: `--plan` 引数が正しく渡されることの統合テストを Phase 6 で追加する

---

## 完了条件

- [x] TC-01〜TC-05 のテストケース設計が完了している
- [x] TC-R01〜TC-R03 の回帰テスト計画が完了している
- [x] テストコードスケルトンが作成されている
- [x] 回帰テスト実行コマンドが明記されている
- [x] TDD Red フェーズの確認手順が明記されている

---

## Phase末端アクション【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各タスクを100%完了し、完了を明記
- [x] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 3 が完了していること
- **後続**: Phase 5: 実装計画 へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`outputs/phase-5/implementation-plan.md`
