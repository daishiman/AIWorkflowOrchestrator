# Phase 4: テスト作成（TDD: Red）

## メタ情報

| 項目   | 値                                    |
| ------ | ------------------------------------- |
| Phase  | 4                                     |
| 機能名 | TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION |
| 作成日 | 2026-02-11                            |
| 状態   | **完了**                              |

## 目的

SkillService → SkillExecutor 委譲の動作を検証するテストを実装より先に作成する（Red状態）。

## 実行タスク

- TDD原則適用: テストファースト開発の実践
- ユニットテスト作成: SkillService の委譲ロジックテスト
- 統合テスト設計: SkillService ↔ SkillExecutor 連携テスト
- モック設計: SkillExecutor のモック作成

## 参照資料

| 資料名       | パス                                         | 説明          |
| ------------ | -------------------------------------------- | ------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | Phase 1成果物 |
| 設計書       | `outputs/phase-2/architecture-design.md`     | Phase 2成果物 |
| 設計レビュー | `outputs/phase-3/design-review-result.md`    | Phase 3成果物 |

## 実行手順

### 1. テストシナリオ設計

**テスト対象**: SkillService.executeSkill()

| シナリオID | シナリオ名             | 期待動作                           |
| ---------- | ---------------------- | ---------------------------------- |
| TC-1       | 正常実行               | SkillExecutor に委譲して結果を返す |
| TC-2       | SkillExecutor 未初期化 | エラーをスローする                 |
| TC-3       | スキルが存在しない     | エラーをスローする                 |
| TC-4       | 型変換の検証           | Skill → SkillMetadata 変換が正しい |
| TC-5       | SkillExecutor エラー時 | エラーを上位に伝播する             |

### 2. ユニットテスト作成

```typescript
// SkillService.test.ts
describe("SkillService.executeSkill", () => {
  let skillService: SkillService;
  let mockSkillExecutor: jest.Mocked<SkillExecutor>;

  beforeEach(() => {
    mockSkillExecutor = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<SkillExecutor>;

    skillService = new SkillService(/* dependencies */);
    skillService.setSkillExecutor(mockSkillExecutor);
  });

  it("should delegate execution to SkillExecutor", async () => {
    // TC-1: 正常実行
    const request = { skillId: "test-skill", prompt: "test" };
    mockSkillExecutor.execute.mockResolvedValue({ success: true });

    const result = await skillService.executeSkill(request);

    expect(mockSkillExecutor.execute).toHaveBeenCalled();
    expect(result.success).toBe(true);
  });

  it("should throw error when SkillExecutor is not initialized", async () => {
    // TC-2: SkillExecutor 未初期化
    const newService = new SkillService(/* dependencies */);
    // setSkillExecutor を呼ばない

    await expect(newService.executeSkill({ skillId: "test" })).rejects.toThrow(
      "SkillExecutor is not initialized",
    );
  });

  it("should throw error when skill does not exist", async () => {
    // TC-3: スキルが存在しない
    await expect(
      skillService.executeSkill({ skillId: "non-existent" }),
    ).rejects.toThrow("Skill not found");
  });
});
```

### 3. P35（既知の落とし穴）への対応

**DI 追加時のテストモック大規模修正**:

- 既存の SkillService テストファイルに mockSkillExecutor を追加
- beforeEach でモックをリセット

## 統合テスト連携【必須】

| シナリオカテゴリ | 検証内容                                | テストファイル               |
| ---------------- | --------------------------------------- | ---------------------------- |
| 委譲テスト       | SkillService → SkillExecutor の呼び出し | `SkillService.test.ts`       |
| 型変換テスト     | Skill → SkillMetadata の変換正確性      | `SkillService.test.ts`       |
| エラー伝播テスト | SkillExecutor エラーの上位伝播          | `SkillService.error.test.ts` |
| 初期化状態テスト | Setter Injection 前後の動作             | `SkillService.test.ts`       |

## アーキテクチャ層別テスト

| 層           | テスト観点                 | テストファイル配置                               |
| ------------ | -------------------------- | ------------------------------------------------ |
| Main Process | SkillService 委譲ロジック  | `apps/desktop/src/main/services/skill/*.test.ts` |
| 型定義       | Skill ↔ SkillMetadata 変換 | 同上                                             |

## 成果物

| 成果物         | パス                                                        | 説明               |
| -------------- | ----------------------------------------------------------- | ------------------ |
| テスト仕様書   | `outputs/phase-4/test-specification.md`                     | テスト設計         |
| テストケース   | `outputs/phase-4/test-cases.md`                             | ケース一覧         |
| テストファイル | `apps/desktop/src/main/services/skill/SkillService.test.ts` | 実際のテストコード |

## 完了条件

- [x] 受け入れ基準ごとにユニットテストがある
- [x] 統合テストシナリオが定義されている
- [x] すべてのテストが失敗状態（Red）（実装前）
- [x] テストカバレッジ目標が設定されている
- [x] P35 対応（mockSkillExecutor の追加）が完了している
- [x] **本Phase内の全タスクを100%実行完了**

## TDD検証

```bash
# テスト実行コマンド
pnpm test -- --grep "SkillService.executeSkill"

# 確認項目
# - [x] テストが失敗することを確認（Red状態）→ Phase 5 で Green に
```

## 次のPhase

Phase 5: 実装（TDD: Green）
