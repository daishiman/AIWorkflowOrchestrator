# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                                            |
| ---------- | ----------------------------------------------- |
| Phase      | 6                                               |
| タスクID   | TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001      |
| 機能名     | runCreateWorkflow-to-generateSkillMd-connection |
| 前提Phase  | Phase 5（実装完了・全テスト Green 確認済み）    |
| 後続Phase  | Phase 7                                         |
| 作成日     | 2026-04-16                                      |
| ステータス | pending                                         |

## 目的

Phase 4 で作成したテストに加え、エッジケース・異常系・冪等性のテストを追加して
`SkillCreatorService.ts` の新規追加コードのカバレッジを向上させる。
Line Coverage 80% 以上（推奨 90%）を目標とする。

## 実行タスク

### タスク1: カバレッジ計測

```bash
# SkillCreatorService.ts を対象にカバレッジ計測
pnpm --filter @repo/desktop test -- --run \
  --coverage \
  --coverage.include="src/main/services/skill/SkillCreatorService.ts" \
  src/main/services/skill/SkillCreatorService.test.ts

# 計測結果を確認（新規追加コードのカバレッジを確認）
# 期待: TC-1〜TC-4・IT-1〜IT-2 実施後の初期カバレッジを記録する
```

確認項目:

- `generateSkillMd` メソッドの Line / Branch / Function カバレッジ
- `if (structurePlan)` ブロックの Branch カバレッジ
- fallback（`ensureSkillMdExists`）の Branch カバレッジ
- `finally` クリーンアップブロックのカバレッジ

### タスク2: エッジケーステスト追加

**テストファイルパス**: `apps/desktop/src/main/services/skill/SkillCreatorService.test.ts`

#### エッジケーステストマトリクス

| TC番号 | テスト名                                                       | 対象                                   | 期待値                                                                                                                    |
| ------ | -------------------------------------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| TC-5   | `generateSkillMd 内でスクリプト実行が失敗した場合のエラー処理` | `generateSkillMd`（スクリプト失敗）    | `logger.error` が呼ばれ、`ensureSkillMdExists(skillDir, structurePlan.skillName, structurePlan.description)` が実行される |
| TC-6   | `tmpPlanPath の JSON 書き込み失敗ケース`                       | `generateSkillMd`（fs.writeFile 失敗） | エラーログが出力され、fallback が動作する                                                                                 |
| TC-7   | `skillMdPath が既に存在する場合の動作`                         | `generateSkillMd`（上書きケース）      | 既存ファイルを上書きしてスクリプトが正常実行される                                                                        |
| TC-8   | `複数回 create が実行された場合の冪等性`                       | `create` の繰り返し呼び出し            | 2回目も正常に `generateSkillMd` が呼ばれる                                                                                |

#### エッジケーステストコード

```typescript
describe("エッジケース", () => {
  describe("TC-5: generateSkillMd スクリプト実行失敗時のエラー処理", () => {
    it("スクリプト実行失敗時に logger.error が呼ばれ ensureSkillMdExists が実行されること", async () => {
      // Arrange
      const mockStructurePlan = {
        skillName: "test-skill",
        description: "テスト用スキル",
        purpose: "mock-agent-content",
        features: [],
        agents: ["mock-agent-content", "mock-agent-content"],
      };
      mockScriptExecutor.execute.mockRejectedValue(
        new Error("generate_skill_md.js execution failed"),
      );
      const ensureSkillMdExistsSpy = vi
        .spyOn(
          service as unknown as {
            ensureSkillMdExists: (...args: unknown[]) => unknown;
          },
          "ensureSkillMdExists",
        )
        .mockResolvedValue(undefined);

      // Act
      await (
        service as unknown as {
          generateSkillMd: (skillDir: string, plan: unknown) => Promise<void>;
        }
      ).generateSkillMd("/path/to/skillDir", mockStructurePlan);

      // Assert
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining("script execution failed"),
        expect.any(Error),
      );
      expect(ensureSkillMdExistsSpy).toHaveBeenCalledTimes(1);
      expect(ensureSkillMdExistsSpy).toHaveBeenCalledWith(
        "/path/to/skillDir",
        "test-skill",
        "テスト用スキル",
      );
    });
  });

  describe("TC-6: tmpPlanPath への JSON 書き込み失敗ケース", () => {
    it("fs.writeFile が失敗した場合にエラーログが出力され fallback が動作すること", async () => {
      // Arrange
      const mockStructurePlan = {
        skillName: "test-skill",
        description: "テスト用スキル",
        purpose: "mock-agent-content",
        features: [],
        agents: ["mock-agent-content", "mock-agent-content"],
      };
      vi.spyOn(require("node:fs/promises"), "writeFile").mockRejectedValue(
        new Error("EACCES: permission denied"),
      );
      const ensureSkillMdExistsSpy = vi
        .spyOn(
          service as unknown as {
            ensureSkillMdExists: (...args: unknown[]) => unknown;
          },
          "ensureSkillMdExists",
        )
        .mockResolvedValue(undefined);

      // Act
      await (
        service as unknown as {
          generateSkillMd: (skillDir: string, plan: unknown) => Promise<void>;
        }
      ).generateSkillMd("/path/to/skillDir", mockStructurePlan);

      // Assert
      expect(mockLogger.error).toHaveBeenCalled();
      expect(ensureSkillMdExistsSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe("TC-7: skillMdPath が既に存在する場合の動作", () => {
    it("既存の SKILL.md が存在する場合も上書きしてスクリプトが正常実行されること", async () => {
      // Arrange
      const mockStructurePlan = {
        skillName: "test-skill",
        description: "テスト用スキル",
        purpose: "mock-agent-content",
        features: [],
        agents: ["mock-agent-content", "mock-agent-content"],
      };
      mockScriptExecutor.execute.mockResolvedValue({
        success: true,
        stdout: "",
        stderr: "",
        exitCode: 0,
      });
      // 既存ファイルのモック（上書き前提）
      vi.spyOn(require("node:fs/promises"), "writeFile").mockResolvedValue(
        undefined,
      );

      // Act
      await (
        service as unknown as {
          generateSkillMd: (skillDir: string, plan: unknown) => Promise<void>;
        }
      ).generateSkillMd("/path/to/skillDir", mockStructurePlan);

      // Assert
      expect(mockScriptExecutor.execute).toHaveBeenCalledTimes(1);
      expect(mockLogger.error).not.toHaveBeenCalled();
    });
  });

  describe("TC-8: 複数回 create が実行された場合の冪等性", () => {
    it("複数回 create を実行しても毎回 generateSkillMd が正常に呼ばれること", async () => {
      // Arrange
      const mockStructurePlan = {
        skillName: "test-skill",
        description: "テスト用スキル",
        purpose: "mock-agent-content",
        features: [],
        agents: ["mock-agent-content", "mock-agent-content"],
      };
      mockScriptExecutor.execute.mockResolvedValue({
        success: true,
        stdout: "",
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

      // Act: 2回実行
      await service.createSkill({
        name: "test-skill",
        description: "テスト用スキル",
        mode: "create",
      });
      await service.createSkill({
        name: "test-skill",
        description: "テスト用スキル",
        mode: "create",
      });

      // Assert: 2回とも generateSkillMd が呼ばれていること
      expect(generateSkillMdSpy).toHaveBeenCalledTimes(2);
    });
  });
});
```

### タスク3: 異常系テスト強化

#### 異常系統合テストマトリクス

| IT番号 | テスト名                                                | 対象                                | 期待値                                                |
| ------ | ------------------------------------------------------- | ----------------------------------- | ----------------------------------------------------- |
| IT-3   | `generate_skill_md.js が利用不可の場合の fallback 動作` | `generateSkillMd`（スクリプト不在） | `ensureSkillMdExists` が呼ばれ SKILL.md が生成される  |
| IT-4   | `ネットワーク/ファイルシステムエラー時の動作`           | `generateSkillMd`（fs エラー）      | エラーログが出力され、fallback が動作し処理が継続する |

```typescript
describe("異常系統合テスト", () => {
  describe("IT-3: generate_skill_md.js が利用不可の場合", () => {
    it("スクリプトが利用不可の場合 ensureSkillMdExists が呼ばれ SKILL.md が生成されること", async () => {
      // Arrange
      const mockStructurePlan = {
        skillName: "test-skill",
        description: "テスト用スキル",
        purpose: "mock-agent-content",
        features: [],
        agents: ["mock-agent-content", "mock-agent-content"],
      };
      mockScriptExecutor.execute.mockRejectedValue(
        new Error("ENOENT: no such file or directory, generate_skill_md.js"),
      );
      const ensureSkillMdExistsSpy = vi
        .spyOn(
          service as unknown as {
            ensureSkillMdExists: (...args: unknown[]) => unknown;
          },
          "ensureSkillMdExists",
        )
        .mockResolvedValue(undefined);

      // Act
      await (
        service as unknown as {
          generateSkillMd: (skillDir: string, plan: unknown) => Promise<void>;
        }
      ).generateSkillMd("/path/to/skillDir", mockStructurePlan);

      // Assert
      expect(ensureSkillMdExistsSpy).toHaveBeenCalledWith(
        "/path/to/skillDir",
        "test-skill",
        "テスト用スキル",
      );
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe("IT-4: ファイルシステムエラー時の動作", () => {
    it("ファイルシステムエラー時にエラーログが出力され fallback が動作し処理が継続すること", async () => {
      // Arrange
      const mockStructurePlan = {
        skillName: "test-skill",
        description: "テスト用スキル",
        purpose: "mock-agent-content",
        features: [],
        agents: ["mock-agent-content", "mock-agent-content"],
      };
      vi.spyOn(require("node:fs/promises"), "writeFile").mockRejectedValue(
        new Error("ENOSPC: no space left on device"),
      );
      const ensureSkillMdExistsSpy = vi
        .spyOn(
          service as unknown as {
            ensureSkillMdExists: (...args: unknown[]) => unknown;
          },
          "ensureSkillMdExists",
        )
        .mockResolvedValue(undefined);

      // Act: エラーが throw されないこと（呼び出し元に伝播しないこと）
      await expect(
        (
          service as unknown as {
            generateSkillMd: (skillDir: string, plan: unknown) => Promise<void>;
          }
        ).generateSkillMd("/path/to/skillDir", mockStructurePlan),
      ).resolves.not.toThrow();

      // Assert
      expect(ensureSkillMdExistsSpy).toHaveBeenCalledTimes(1);
    });
  });
});
```

### タスク4: 全テスト実行確認

```bash
# 拡充後の全テスト実行
pnpm --filter @repo/desktop test -- --run --reporter=verbose \
  src/main/services/skill/SkillCreatorService.test.ts

# 期待: TC-1〜TC-8・IT-1〜IT-4 全 PASS

# カバレッジ再計測
pnpm --filter @repo/desktop test -- --run \
  --coverage \
  --coverage.include="src/main/services/skill/SkillCreatorService.ts" \
  src/main/services/skill/SkillCreatorService.test.ts

# 型チェック
pnpm --filter @repo/desktop typecheck
```

## 参照資料

| 資料名                  | パス                                                               | 用途                         |
| ----------------------- | ------------------------------------------------------------------ | ---------------------------- |
| Phase 4 テスト仕様書    | `outputs/phase-4/test-plan.md`                                     | 既存テストケース参照         |
| Phase 5 実装ノート      | `outputs/phase-5/implementation-notes.md`                          | 実装内容・変更箇所確認       |
| 実装ファイル            | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`      | 実装確認・カバレッジ対象確認 |
| テストファイル          | `apps/desktop/src/main/services/skill/SkillCreatorService.test.ts` | テスト追加先確認             |
| aiworkflow-requirements | `.claude/skills/aiworkflow-requirements/references/`               | プロジェクト共通仕様参照     |

## 統合テスト連携【必須】

統合テストの拡充（全カテゴリのカバレッジ向上）。

| 判定項目                             | 基準    | 結果    |
| ------------------------------------ | ------- | ------- |
| TC-5〜TC-8 全 PASS                   | PASS    | pending |
| IT-3〜IT-4 全 PASS                   | PASS    | pending |
| 既存 TC（Phase 4）回帰なし           | 全 PASS | pending |
| SkillCreatorService.ts Line Coverage | 80%以上 | pending |
| 型チェック PASS                      | PASS    | pending |

## 多角的チェック観点

| 観点     | 確認内容                                                                                   |
| -------- | ------------------------------------------------------------------------------------------ |
| 矛盾     | 追加テストが Phase 5 実装の動作仕様と矛盾していないか                                      |
| 漏れ     | `finally` ブロックの tmpPlanPath クリーンアップがカバーされているか                        |
| 整合性   | TC-5（スクリプト失敗）と TC-6（fs 書き込み失敗）の両方の fallback パスがカバーされているか |
| 依存関係 | Phase 4 テストとの重複がなく、補完関係になっているか                                       |

## 成果物

| 成果物             | パス                                                               | 説明                           |
| ------------------ | ------------------------------------------------------------------ | ------------------------------ |
| テストコード拡充   | `apps/desktop/src/main/services/skill/SkillCreatorService.test.ts` | TC-5〜TC-8・IT-3〜IT-4 を追加  |
| カバレッジレポート | `outputs/phase-6/coverage-report.md`                               | 拡充後のカバレッジ計測結果記録 |

## 完了条件

- [ ] TC-5: スクリプト失敗時のエラー処理テストが追加されている
- [ ] TC-6: tmpPlanPath JSON 書き込み失敗テストが追加されている
- [ ] TC-7: skillMdPath 既存時の上書き動作テストが追加されている
- [ ] TC-8: 複数回 create 実行の冪等性テストが追加されている
- [ ] IT-3: generate_skill_md.js 利用不可時の fallback テストが追加されている
- [ ] IT-4: ファイルシステムエラー時の動作テストが追加されている
- [ ] `SkillCreatorService.ts` の新規追加コードの Line Coverage 80% 以上
- [ ] 全テスト（TC-1〜TC-8・IT-1〜IT-4）PASS
- [ ] 型チェック PASS
- [ ] 既存テストへの悪影響なし
- [ ] `outputs/phase-6/coverage-report.md` が作成されている
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## サブタスク管理

1. カバレッジ計測（Phase 4 + 5 後の初期値確認）
2. TC-5 エッジケーステスト作成（スクリプト失敗）
3. TC-6 エッジケーステスト作成（fs.writeFile 失敗）
4. TC-7 エッジケーステスト作成（既存ファイル上書き）
5. TC-8 エッジケーステスト作成（冪等性）
6. IT-3 異常系統合テスト作成（スクリプト不在）
7. IT-4 異常系統合テスト作成（ファイルシステムエラー）
8. 全テスト実行確認（TC-1〜TC-8・IT-1〜IT-4）
9. カバレッジ再計測（80% 以上確認）
10. `outputs/phase-6/coverage-report.md` 作成
11. 完了条件の判定

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## Phase末端アクション【必須】

- `outputs/phase-6/coverage-report.md` に計測結果（Line / Branch / Function カバレッジ値）を記録する
- 80% 未満の場合は未達箇所を特定し、追加テストを作成してから Phase 7 へ進む
- Phase 7 の担当者に「カバレッジ計測済み・目標値達成の有無」を引き継ぐ

## 次のPhase

Phase 7: カバレッジ確認
