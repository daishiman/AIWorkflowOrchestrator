# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                                            |
| ---------- | ----------------------------------------------- |
| Phase      | 4                                               |
| タスクID   | TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001      |
| 機能名     | runCreateWorkflow-to-generateSkillMd-connection |
| 前提Phase  | Phase 3（設計レビューゲート PASS または MINOR） |
| 後続Phase  | Phase 5                                         |
| 作成日     | 2026-04-16                                      |
| ステータス | pending                                         |

## 目的

Phase 2 の設計に基づき、実装前にテストを作成する（TDD Red フェーズ）。
`runCreateWorkflow` が返す `StructurePlanJson` を `generateSkillMd(skillDir, structurePlan)` の
引数として接続する際の正常系・異常系・エッジケースをテスト化し、期待値を明確化する。
実装前なのでテストが失敗（Red）することを確認する。

## 実行タスク

### タスク1: 既存テスト確認

```bash
# テストファイルの存在確認
ls apps/desktop/src/main/services/skill/

# SkillCreatorService のテストファイルを探す
find apps/desktop/src/main/services/skill/ -name "*.test.ts" -o -name "*.spec.ts"

# 既存の runCreateWorkflow テストを確認
grep -n "runCreateWorkflow\|generateSkillMd" apps/desktop/src/main/services/skill/SkillCreatorService.test.ts 2>/dev/null || echo "テストファイルなし"

# structurePlan 関連テストの確認
grep -rn "structurePlan\|StructurePlanJson" apps/desktop/src/main/services/skill/ 2>/dev/null
```

確認項目:

- `SkillCreatorService.test.ts` の存在確認
- 既存の `runCreateWorkflow` テスト有無
- 既存の `generateSkillMd` テスト有無
- `StructurePlanJson` 型の使用箇所

### タスク2: ユニットテスト作成

**テストファイルパス**: `apps/desktop/src/main/services/skill/SkillCreatorService.test.ts`

#### テストマトリクス

| TC番号 | テスト名                                                                                                                        | 対象メソッド                        | 期待値                                                                           |
| ------ | ------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- | -------------------------------------------------------------------------------- |
| TC-1   | `createSkill() で create モード時に runCreateWorkflow の結果から generateSkillMd が呼ばれること`                                | `createSkill` フロー全体            | `generateSkillMd` が1回呼ばれる                                                  |
| TC-2   | `structurePlan が null の場合 createSkill() が ensureSkillMdExists にフォールバックすること`                                    | `createSkill` フロー（null ケース） | `generateSkillMd` が呼ばれず、`logger.error` と `ensureSkillMdExists` が呼ばれる |
| TC-3   | `generateSkillMd が generate_skill_md.js --plan <path> --output <path> を正しい引数で呼ぶこと`                                  | `generateSkillMd`                   | `scriptExecutor.execute` が正しい引数で呼ばれる                                  |
| TC-4   | `スクリプト実行失敗時に ensureSkillMdExists(skillDir, structurePlan.skillName, structurePlan.description) へ fallback すること` | `generateSkillMd`（エラーケース）   | `ensureSkillMdExists` が呼ばれる                                                 |

#### テストコードスケルトン

```typescript
import { describe, expect, it, vi, beforeEach } from "vitest";
import { SkillCreatorService } from "./SkillCreatorService";
import type { CreateSkillOptions } from "@repo/shared/types";

const mockLogger = {
  info: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  debug: vi.fn(),
};

const mockScriptExecutor = {
  execute: vi.fn(),
};

const mockResourceLoader = {
  loadAgent: vi.fn(),
};

describe("SkillCreatorService - create モード", () => {
  let service: SkillCreatorService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new SkillCreatorService();
  });

  const createOptions = (): CreateSkillOptions => ({
    name: "test-skill",
    description: "テスト用スキル",
    mode: "create",
  });

  describe("TC-1: structurePlan が返された場合", () => {
    it("createSkill() で generateSkillMd が呼ばれること", async () => {
      mockResourceLoader.loadAgent.mockResolvedValue("mock-agent-content");
      mockScriptExecutor.execute.mockResolvedValue({
        success: true,
        stdout: "/test/skills/test-skill",
        stderr: "",
        exitCode: 0,
      });
      const generateSkillMdSpy = vi
        .spyOn(
          service as unknown as {
            generateSkillMd: (...args: unknown[]) => unknown;
          },
          "generateSkillMd",
        )
        .mockResolvedValue(undefined);

      await service.createSkill(createOptions());

      expect(generateSkillMdSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe("TC-2: structurePlan が null の場合", () => {
    it("ensureSkillMdExists にフォールバックすること", async () => {
      mockResourceLoader.loadAgent.mockRejectedValue(
        new Error("Agent file not found"),
      );
      mockScriptExecutor.execute.mockResolvedValue({
        success: true,
        stdout: "/test/skills/test-skill",
        stderr: "",
        exitCode: 0,
      });
      const generateSkillMdSpy = vi
        .spyOn(
          service as unknown as {
            generateSkillMd: (...args: unknown[]) => unknown;
          },
          "generateSkillMd",
        )
        .mockResolvedValue(undefined);
      const ensureSkillMdExistsSpy = vi
        .spyOn(
          service as unknown as {
            ensureSkillMdExists: (...args: unknown[]) => unknown;
          },
          "ensureSkillMdExists",
        )
        .mockResolvedValue(undefined);

      await service.createSkill(createOptions());

      expect(generateSkillMdSpy).not.toHaveBeenCalled();
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining("structurePlan is null"),
      );
      expect(ensureSkillMdExistsSpy).toHaveBeenCalledWith(
        expect.any(String),
        "test-skill",
        "テスト用スキル",
      );
    });
  });

  describe("TC-3: generateSkillMd のスクリプト引数確認", () => {
    it("generate_skill_md.js を --plan / --output の引数で呼ぶこと", async () => {
      mockScriptExecutor.execute.mockResolvedValue({
        success: true,
        stdout: "",
        stderr: "",
        exitCode: 0,
      });

      await (
        service as unknown as {
          generateSkillMd: (skillDir: string, plan: unknown) => Promise<void>;
        }
      ).generateSkillMd("/path/to/skillDir", {
        skillName: "test-skill",
        description: "テスト用スキル",
        purpose: "mock-agent-content",
        features: [],
        agents: ["mock-agent-content", "mock-agent-content"],
      });

      expect(mockScriptExecutor.execute).toHaveBeenCalledWith(
        "generate_skill_md.js",
        expect.arrayContaining(["--plan", "--output"]),
      );
    });
  });

  describe("TC-4: スクリプト実行失敗時の fallback 動作", () => {
    it("ensureSkillMdExists(skillDir, structurePlan.skillName, structurePlan.description) へ fallback すること", async () => {
      const ensureSkillMdExistsSpy = vi
        .spyOn(
          service as unknown as {
            ensureSkillMdExists: (...args: unknown[]) => unknown;
          },
          "ensureSkillMdExists",
        )
        .mockResolvedValue(undefined);

      mockScriptExecutor.execute.mockRejectedValue(new Error("script failed"));

      await (
        service as unknown as {
          generateSkillMd: (skillDir: string, plan: unknown) => Promise<void>;
        }
      ).generateSkillMd("/path/to/skillDir", {
        skillName: "test-skill",
        description: "テスト用スキル",
        purpose: "mock-agent-content",
        features: [],
        agents: ["mock-agent-content", "mock-agent-content"],
      });

      expect(ensureSkillMdExistsSpy).toHaveBeenCalledWith(
        "/path/to/skillDir",
        "test-skill",
        "テスト用スキル",
      );
    });
  });
});
```

### タスク3: 統合テスト作成

#### 統合テストマトリクス

| IT番号 | テスト名                                                                                             | 対象                         | 期待値                                   |
| ------ | ---------------------------------------------------------------------------------------------------- | ---------------------------- | ---------------------------------------- |
| IT-1   | `createモードで end-to-end で SKILL.md が生成されること（モック使用可）`                             | `create` フロー全体          | SKILL.md が生成される                    |
| IT-2   | `structurePlan の JSON シリアライズ → tmpPlanPath → generate_skill_md.js の流れが正常に動作すること` | `generateSkillMd` 内部フロー | tmpPlanPath に正しい JSON が書き込まれる |

```typescript
describe("統合テスト: create モード end-to-end", () => {
  describe("IT-1: create モードで SKILL.md が生成されること", () => {
    it("runCreateWorkflow → generateSkillMd → SKILL.md 生成の end-to-end フロー", async () => {
      // Arrange: スクリプト実行をモック
      mockScriptExecutor.execute.mockResolvedValue({
        success: true,
        stdout: "",
        stderr: "",
        exitCode: 0,
      });
      const mockStructurePlan = {
        skillName: "integration-test-skill",
        description: "統合テスト用スキル",
        purpose: "mock-agent-content",
        features: [],
        agents: ["mock-agent-content", "mock-agent-content"],
      };
      mockResourceLoader.loadAgent.mockResolvedValue("mock-agent-content");

      // Act
      await service.createSkill({
        name: "integration-test-skill",
        description: "統合テスト用スキル",
        mode: "create",
      });

      // Assert: SKILL.md 生成のためのスクリプトが呼ばれていること
      expect(mockScriptExecutor.execute).toHaveBeenCalledWith(
        "generate_skill_md.js",
        expect.any(Array),
      );
    });
  });

  describe("IT-2: JSON シリアライズ → tmpPlanPath → スクリプト実行の流れ", () => {
    it("structurePlan が tmpPlanPath に JSON として書き込まれること", async () => {
      // Arrange
      const mockStructurePlan = {
        skillName: "test",
        description: "テスト用スキル",
        purpose: "mock-agent-content",
        features: [],
        agents: ["mock-agent-content", "mock-agent-content"],
      };
      const writeSpy = vi.spyOn(
        // fs.writeFile または相当のメソッドをスパイ
        require("node:fs/promises"),
        "writeFile",
      );
      mockScriptExecutor.execute.mockResolvedValue({
        success: true,
        stdout: "",
        stderr: "",
        exitCode: 0,
      });

      // Act
      await (
        service as unknown as {
          generateSkillMd: (skillDir: string, plan: unknown) => Promise<void>;
        }
      ).generateSkillMd("/path/to/skillDir", mockStructurePlan);

      // Assert: JSON.stringify された内容が書き込まれていること
      expect(writeSpy).toHaveBeenCalledWith(
        expect.stringContaining("tmp"),
        JSON.stringify(mockStructurePlan),
        expect.anything(),
      );
    });
  });
});
```

### タスク4: テスト実行（Red確認）

```bash
# テスト実行（実装前なのでFAILを確認）
pnpm --filter @repo/desktop test -- --run --reporter=verbose \
  src/main/services/skill/SkillCreatorService.test.ts

# 期待: FAIL（TC-1〜TC-4 および IT-1〜IT-2 が失敗する）
# TC-1: void structurePlan; があるため generateSkillMd が呼ばれない → FAIL
# TC-2: エラーログ出力コードが未実装 → FAIL
# TC-3: generateSkillMd の実装が未完成 → FAIL
# TC-4: fallback 処理が未実装 → FAIL
```

**TDD Red 確認のポイント**:

- `void structurePlan;` が残っているため、TC-1 は `generateSkillMd` が呼ばれないことで FAIL
- `if (structurePlan)` ブロックが未実装なため、TC-2 は `logger.error` 呼び出しなしで FAIL
- TC-3 / TC-4 は `generateSkillMd` の実装がないため FAIL

## 参照資料

| 資料名                  | パス                                                                | 用途                       |
| ----------------------- | ------------------------------------------------------------------- | -------------------------- |
| Phase 2 設計書          | `outputs/phase-2/design-doc.md`                                     | 設計・インターフェース参照 |
| Phase 3 レビュー結果    | `outputs/phase-3/gate-decision.md`                                  | ゲート判定結果確認         |
| 実装対象ファイル        | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`       | 修正対象コード確認         |
| generate_skill_md.js    | `apps/desktop/src/main/services/skill/scripts/generate_skill_md.js` | スクリプトシグネチャ確認   |
| aiworkflow-requirements | `.claude/skills/aiworkflow-requirements/references/`                | プロジェクト共通仕様参照   |

- 依存Phase参照: Phase 1 の要件定義・受け入れ基準は `outputs/phase-1/spec-extraction-map.md` を前提にする

## 統合テスト連携【必須】

統合テストシナリオを全カテゴリで作成する。

| 判定項目                 | 基準                              | 結果    |
| ------------------------ | --------------------------------- | ------- |
| Red 確認（TC-1〜TC-4）   | テストが FAIL すること（TDD Red） | pending |
| Red 確認（IT-1〜IT-2）   | テストが FAIL すること（TDD Red） | pending |
| 既存テストへの悪影響なし | 既存テストが PASS のまま          | pending |

## 成果物

| 成果物                 | パス                                                               | 説明                                      |
| ---------------------- | ------------------------------------------------------------------ | ----------------------------------------- |
| テストファイル（追加） | `apps/desktop/src/main/services/skill/SkillCreatorService.test.ts` | TC-1〜TC-4・IT-1〜IT-2 のテストケース追加 |
| テスト計画書           | `outputs/phase-4/test-plan.md`                                     | テストマトリクス・Red確認結果の記録       |

## 完了条件

- [ ] 既存テストファイル（`SkillCreatorService.test.ts` または同等）の存在と内容確認済み
- [ ] 既存の `runCreateWorkflow` テスト、`generateSkillMd` テストの有無確認済み
- [ ] TC-1: `generateSkillMd` 呼び出しテストが作成されている
- [ ] TC-2: `structurePlan` null 時のエラーログテストが作成されている
- [ ] TC-3: スクリプト引数確認テストが作成されている
- [ ] TC-4: fallback（`ensureSkillMdExists`）動作テストが作成されている
- [ ] IT-1: create モード end-to-end テストが作成されている
- [ ] IT-2: JSON シリアライズ → tmpPlanPath の流れテストが作成されている
- [ ] テストが Red（失敗）の状態であることが確認されている
- [ ] `outputs/phase-4/test-plan.md` が作成されている
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## サブタスク管理

1. 既存テストファイルの確認（存在・内容）
2. 既存 `runCreateWorkflow` / `generateSkillMd` テストの有無確認
3. TC-1 テスト作成（`generateSkillMd` 呼び出し確認）
4. TC-2 テスト作成（null ケース・エラーログ確認）
5. TC-3 テスト作成（スクリプト引数確認）
6. TC-4 テスト作成（fallback 動作確認）
7. IT-1 統合テスト作成（end-to-end）
8. IT-2 統合テスト作成（JSON シリアライズフロー）
9. Red 確認（テスト FAIL の確認）
10. `outputs/phase-4/test-plan.md` 作成
11. 完了条件の判定

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## Phase末端アクション【必須】

- `outputs/phase-4/test-plan.md` に Red 確認結果（失敗ログ）を記録する
- テストの FAIL 理由（`void structurePlan;` が残っている箇所など）を明記する
- Phase 5 の担当者に「Red 確認済み・テスト一覧」を引き継ぐ

## 次のPhase

Phase 5: 実装（TDD Green フェーズ）
