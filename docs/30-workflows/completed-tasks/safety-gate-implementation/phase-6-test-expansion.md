# Phase 6: テスト拡充

## メタ情報

| 項目   | 値                         |
| ------ | -------------------------- |
| Phase  | 6                          |
| 機能名 | safety-gate-implementation |
| 作成日 | 2026-03-16                 |

## 目的

Phase 4 で作成した基本テストに加え、境界値・異常系・エッジケースのテストケースを追加し、カバレッジ基準（Line 80%+, Branch 60%+, Function 80%+）の達成を目指す。

## 実行タスク

- タスク1: ツール0件・保護パス空のエッジケーステスト追加
- タスク2: blocked + warned 混在パターンのテスト追加
- タスク3: 保護パスマッチングの境界値テスト追加
- タスク4: SkillMetadataProvider のエラーケーステスト追加
- タスク5: テスト間状態リーク検証（P9 対策）

## 参照資料

| 資料名                | パス                                                            | 説明                   |
| --------------------- | --------------------------------------------------------------- | ---------------------- |
| Phase 4 テスト        | `apps/desktop/src/main/permissions/default-safety-gate.test.ts` | 基本テスト             |
| Phase 4 テスト（IPC） | `apps/desktop/src/main/ipc/handlers/safety-gate.test.ts`        | IPC ハンドラ基本テスト |
| Phase 5 実装          | `apps/desktop/src/main/permissions/default-safety-gate.ts`      | 実装コード             |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料             | パス                                                                                        | 内容                                        |
| -------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------- |
| 品質要件             | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | カバレッジ基準                              |
| コンポーネントテスト | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`           | テスト設計パターン                          |
| エラーハンドリング   | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | エラー分類                                  |
| 実装パターン         | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | DI パターン                                 |
| セキュリティ原則     | `.claude/skills/aiworkflow-requirements/references/architecture-auth-security.md`           | IPC バリデーション拡充テスト（P42準拠）確認 |

## 実行手順

### ステップ1: ツール0件・保護パス空のエッジケーステスト（タスク1）

**テストファイル**: `apps/desktop/src/main/permissions/default-safety-gate.test.ts`（既存ファイルに追加）

| #   | テストケース                                           | 期待結果                                                        |
| --- | ------------------------------------------------------ | --------------------------------------------------------------- |
| E-1 | `getRequiredTools` が空配列を返す場合（ツール0件）     | `overallGrade: "SAFE"`, 全チェックが `status: "passed"`         |
| E-2 | `getAccessPaths` が空配列を返す場合（アクセスパス0件） | PROTECTED_PATH_ACCESS が `status: "passed"`                     |
| E-3 | `protectedPaths` が空配列（`[]`）の場合                | PROTECTED_PATH_ACCESS が `status: "passed"`（保護対象なし）     |
| E-4 | ツール0件かつ保護パス0件の場合                         | `overallGrade: "SAFE"`, `details.length === 5`                  |
| E-5 | `getRequiredTools` が `critical` ツールのみ1件返す場合 | CRITICAL_TOOL_REQUIRED が `blocked`, overallGrade が `"UNSAFE"` |

### ステップ2: blocked + warned 混在パターンのテスト（タスク2）

| #   | テストケース                                                                 | 期待結果                                                     |
| --- | ---------------------------------------------------------------------------- | ------------------------------------------------------------ |
| M-1 | CRITICAL_TOOL_REQUIRED（blocked）と HIGH_TOOL_REQUIRED（warned）が同時発生   | `overallGrade: "UNSAFE"`（blocked 優先）                     |
| M-2 | PROTECTED_PATH_ACCESS（blocked）と NO_PERMANENT_APPROVAL（warned）が同時発生 | `overallGrade: "UNSAFE"`（blocked 優先）                     |
| M-3 | HIGH_TOOL_REQUIRED（warned）と NO_PERMANENT_APPROVAL（warned）が同時発生     | `overallGrade: "SAFE_WITH_WARNINGS"`（複数 warned）          |
| M-4 | 全5チェックが blocked の場合（理論上不可だが防御的に確認）                   | `overallGrade: "UNSAFE"`, `details` の全 status が "blocked" |

### ステップ3: 保護パスマッチングの境界値テスト（タスク3）

保護パス `/etc` を基準として、前方一致ロジックの境界値を検証する。

| #   | テストケース                                                          | 期待結果                                                           |
| --- | --------------------------------------------------------------------- | ------------------------------------------------------------------ |
| B-1 | アクセスパスが保護パスと完全一致する場合（`/etc`）                    | PROTECTED_PATH_ACCESS が `status: "blocked"`                       |
| B-2 | アクセスパスが保護パス配下の場合（`/etc/passwd`）                     | PROTECTED_PATH_ACCESS が `status: "blocked"`                       |
| B-3 | アクセスパスが保護パスのプレフィックスに一致するが別パス（`/etcfoo`） | PROTECTED_PATH_ACCESS が `status: "passed"`（前方一致の境界）      |
| B-4 | アクセスパスに末尾スラッシュがある場合（`/etc/`）                     | PROTECTED_PATH_ACCESS が `status: "blocked"`（正規化後に一致）     |
| B-5 | 保護パスに末尾スラッシュがある場合（`/etc/` を保護対象として設定）    | `/etc/passwd` へのアクセスが `status: "blocked"`（正規化後に一致） |
| B-6 | アクセスパスが保護パスと全く異なる場合（`/home/user/project`）        | PROTECTED_PATH_ACCESS が `status: "passed"`                        |

### ステップ4: SkillMetadataProvider のエラーケーステスト（タスク4）

| #    | テストケース                                                          | 期待結果                                                           |
| ---- | --------------------------------------------------------------------- | ------------------------------------------------------------------ |
| ER-3 | `getRequiredTools` が SKILL_NOT_FOUND エラーを throw する場合         | `evaluate()` が `{ code: "SKILL_NOT_FOUND" }` で reject される     |
| ER-4 | `getAccessPaths` が HISTORY_UNAVAILABLE エラーを throw する場合       | `evaluate()` が `{ code: "HISTORY_UNAVAILABLE" }` で reject される |
| ER-5 | `getRequiredTools` が Network エラーを throw する場合（想定外エラー） | `evaluate()` が何らかのエラーで reject される（正常終了しない）    |

### ステップ5: テスト間状態リーク検証（タスク5）

**P9 対策の確認**: `beforeEach` でモックが正しくリセットされていることを検証する。

```typescript
describe("テスト間の独立性確認", () => {
  it("テストA: isToolAllowed が true を返す", async () => {
    mockPermissionStore.isToolAllowed.mockReturnValue(true);
    // ... テスト実行
  });

  it("テストB: isToolAllowed のモックがリセットされている", () => {
    // テストA の影響が残っていないことを確認
    expect(mockPermissionStore.isToolAllowed).not.toHaveBeenCalled();
  });
});
```

### ステップ6: v8 カバレッジのインライン関数確認（P41 対策）

`isToolAllowed` を引数として受け取るコールバック処理が Function Coverage に計上される場合、明示的にそのパスを実行するテストを追加する:

```typescript
it("isToolAllowed コールバックが全ツールで呼ばれる（P41対策）", async () => {
  mockSkillMetadataProvider.getRequiredTools.mockResolvedValue([
    { name: "ReadFile", riskLevel: "low" },
    { name: "WriteFile", riskLevel: "low" },
  ]);
  mockPermissionStore.isToolAllowed.mockReturnValue(false);

  await gate.evaluate("test-skill");

  // isToolAllowed が2回呼ばれていることを確認（各ツールに対して）
  expect(mockPermissionStore.isToolAllowed).toHaveBeenCalledTimes(2);
  expect(mockPermissionStore.isToolAllowed).toHaveBeenCalledWith(
    "ReadFile",
    "test-skill",
  );
  expect(mockPermissionStore.isToolAllowed).toHaveBeenCalledWith(
    "WriteFile",
    "test-skill",
  );
});
```

### ステップ7: リグレッション確認（regression check）

拡充テスト追加後、既存テストが破壊されていないことを確認する（phase-template-execution.md 要件）:

```bash
# permissions ディレクトリ全体の既存テストが PASS することを確認
cd apps/desktop && pnpm vitest run src/main/permissions/

# IPC handlers ディレクトリ全体の既存テストが PASS することを確認
cd apps/desktop && pnpm vitest run src/main/ipc/handlers/
```

全テストが GREEN であることを確認してからステップ8へ進む。

### ステップ8: カバレッジ確認

```bash
cd apps/desktop && pnpm vitest run --coverage src/main/permissions/default-safety-gate.test.ts
cd apps/desktop && pnpm vitest run --coverage src/main/ipc/handlers/safety-gate.test.ts
```

## 統合テスト連携【必須】

Phase 6 では境界値・異常系・エッジケースのテストを追加し、統合ポイントのカバレッジを補完する。

| 統合テストシナリオ         | テストケース                                                 | 検証ポイント                                      |
| -------------------------- | ------------------------------------------------------------ | ------------------------------------------------- |
| ツール0件の統合            | SkillMetadataProvider が空配列を返す場合の全チェック動作     | 全5チェックが passed になること                   |
| 複合 blocked 統合          | CRITICAL + PROTECTED_PATH 両方が blocked な場合の Grade 集約 | overallGrade が UNSAFE になること（blocked 優先） |
| パスマッチング正規化の統合 | 末尾スラッシュ有無の組み合わせでの保護パス一致動作           | 正規化後に正しく前方一致すること                  |
| エラー伝搬の統合           | メタデータ取得エラーが IPC 層まで正しく伝搬する動作          | IPC ハンドラが適切なエラーを返すこと              |

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                                          | 仕様参照先                                         |
| ------------------ | ------------------------------------------------- | -------------------------------------------------- |
| テスト設計         | P9/P40/P41 準拠の境界値・エッジケーステストが必要 | `.claude/rules/06-known-pitfalls.md`               |
| エラーハンドリング | SkillMetadataProvider のエラー伝搬テストが必要    | `aiworkflow-requirements: error-handling.md`       |
| カバレッジ         | インライン関数（P41）のカバレッジ確認が必要       | `aiworkflow-requirements: quality-requirements.md` |

**Electronデスクトップアプリ観点**:

| 層                   | 適用判断                                         | 仕様参照先                                         |
| -------------------- | ------------------------------------------------ | -------------------------------------------------- |
| バックエンド（Main） | 境界値・エッジケース・エラー伝搬テスト（Main側） | `aiworkflow-requirements: quality-requirements.md` |
| IPC通信              | IPC 層でのエラー処理テスト                       | `aiworkflow-requirements: error-handling.md`       |

**テスト環境の注意事項**:

| Pitfall | 内容                                  | 対策                                                            |
| ------- | ------------------------------------- | --------------------------------------------------------------- |
| P9      | テスト間の状態リーク                  | `beforeEach` で `vi.resetAllMocks()` を呼び出してリセット       |
| P40     | テスト実行ディレクトリ依存            | `cd apps/desktop` してから実行                                  |
| P41     | v8 カバレッジのインライン関数カウント | `isToolAllowed` / `every` / `find` のコールバックを明示的に実行 |

## 成果物

| 成果物             | パス                                                            | 説明                 |
| ------------------ | --------------------------------------------------------------- | -------------------- |
| 拡充テスト         | `apps/desktop/src/main/permissions/default-safety-gate.test.ts` | 追加テストケース     |
| 拡充テスト（IPC）  | `apps/desktop/src/main/ipc/handlers/safety-gate.test.ts`        | IPC 追加テストケース |
| カバレッジレポート | `outputs/phase-6/coverage-report.md`                            | カバレッジ計測結果   |

## 完了条件

- [ ] ツール0件・保護パス空のエッジケーステスト（E-1〜E-5）が追加されている
- [ ] blocked + warned 混在パターンのテスト（M-1〜M-4）が追加されている
- [ ] 保護パスマッチング境界値テスト（B-1〜B-6）が追加されている
- [ ] SkillMetadataProvider エラーケーステスト（ER-3〜ER-5）が追加されている
- [ ] P41 対策: `isToolAllowed` 等のコールバックが明示的に実行されている
- [ ] 全テストが GREEN（PASS）である
- [ ] テスト間で状態を共有していない（P9 準拠: `beforeEach` で `vi.resetAllMocks()`）
- [ ] リグレッション確認済み: `permissions/` および `ipc/handlers/` ディレクトリの既存テストが全て PASS している
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認（Phase 4/5 成果物）
2. ツール0件・保護パス空エッジケーステスト追加（タスク1）
3. blocked + warned 混在パターンテスト追加（タスク2）
4. 保護パスマッチング境界値テスト追加（タスク3）
5. SkillMetadataProvider エラーケーステスト追加（タスク4）
6. テスト間状態リーク検証（タスク5）
7. v8 カバレッジのインライン関数確認（P41 対策）
8. リグレッション確認（既存テスト全 PASS）
9. カバレッジ確認
10. 成果物の作成・配置
11. 完了条件の検証

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/safety-gate-implementation --phase 6
```

## 次のPhase

Phase 7: カバレッジ確認 - Line 80%+, Branch 60%+, Function 80%+ の達成を確認する。未達の場合は Phase 6 へ戻る。
