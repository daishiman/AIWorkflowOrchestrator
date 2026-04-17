# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 9                               |
| タスクID   | TASK-SC-SHARED-TYPE-PROMOTE-001 |
| 機能名     | shared-type-promote             |
| 前提Phase  | Phase 8                         |
| 後続Phase  | Phase 10                        |
| 作成日     | 2026-04-16                      |
| ステータス | skipped                         |

## 目的

型昇格の実装に対して、typecheck / lint / test の3セットで品質を最終確認する。
AC-3（ビルド成功）・AC-4（Single Source of Truth）・AC-5（全テスト PASS）の充足を証明する。

## 実行タスク

- [ ] `pnpm --filter @repo/shared exec tsc --noEmit` の実行・PASS確認
- [ ] `pnpm --filter @repo/desktop exec tsc --noEmit` の実行・PASS確認
- [ ] `pnpm --filter @repo/shared exec eslint src/` の実行・PASS確認
- [ ] `pnpm --filter @repo/desktop exec eslint src/main/services/skill/SkillCreatorService.ts` の実行・PASS確認
- [ ] `pnpm --filter @repo/shared test` の実行・全PASS確認
- [ ] `pnpm --filter @repo/desktop exec vitest run src/main/services/skill/__tests__/SkillCreatorService.test.ts` の実行・全PASS確認
- [ ] `pnpm --filter @repo/shared build` → `pnpm --filter @repo/desktop build` の順でビルド成功確認（AC-3）
- [ ] ローカル定義残存チェック: `grep -rn "interface StructurePlanJson" apps/` が0件であること（AC-4）
- [ ] `@repo/shared/types` から `StructurePlanJson` が取得できることを確認（AC-4）
- [ ] `packages/shared/index.ts` からも `StructurePlanJson` が取得できることを確認（barrel parity）
- [ ] 品質保証記録の作成

## 参照資料

| 資料名                       | パス                                                          | 用途                 |
| ---------------------------- | ------------------------------------------------------------- | -------------------- |
| Phase 8 リファクタリング記録 | `outputs/phase-8/refactoring-log.md`                          | 変更内容確認         |
| Phase 1 受け入れ基準         | `outputs/phase-1/acceptance-criteria.md`                      | AC-1〜AC-5 確認      |
| skillCreator.ts              | `packages/shared/src/types/skillCreator.ts`                   | 型定義確認           |
| SkillCreatorService.ts       | `apps/desktop/src/main/services/skill/SkillCreatorService.ts` | ローカル定義削除確認 |

### システム仕様（aiworkflow-requirements）

| 参照資料 | パス                                                 | 内容       |
| -------- | ---------------------------------------------------- | ---------- |
| 品質基準 | `.claude/skills/aiworkflow-requirements/references/` | QA基準確認 |

## 実行手順

### 1. TypeScript 型チェック

```bash
# @repo/shared 型チェック
pnpm --filter @repo/shared exec tsc --noEmit
echo "Exit code: $?"

# @repo/desktop 型チェック
pnpm --filter @repo/desktop exec tsc --noEmit
echo "Exit code: $?"
```

### 2. Lint チェック

```bash
# @repo/shared lint
pnpm --filter @repo/shared exec eslint src/
echo "Exit code: $?"

# @repo/desktop lint（対象ファイルのみ）
pnpm --filter @repo/desktop exec eslint src/main/services/skill/SkillCreatorService.ts
echo "Exit code: $?"
```

### 3. テスト実行

```bash
# @repo/shared テスト
pnpm --filter @repo/shared test
echo "Exit code: $?"

# @repo/desktop SkillCreatorService テスト
pnpm --filter @repo/desktop exec vitest run \
  src/main/services/skill/__tests__/SkillCreatorService.test.ts
echo "Exit code: $?"
```

### 4. ビルド確認（AC-3）

```bash
# @repo/shared ビルド（先）
pnpm --filter @repo/shared build
echo "Exit code: $?"

# @repo/desktop ビルド（後）
pnpm --filter @repo/desktop build
echo "Exit code: $?"
```

### 5. Single Source of Truth 確認（AC-4）

```bash
# ローカル定義残存チェック（0件であること）
grep -rn "interface StructurePlanJson" apps/
grep -rn "StructurePlanJson" packages/shared/src/types/index.ts
# 期待: shared types barrel に re-export が存在すること
grep -rn "interface StructurePlanJson" packages/shared/src/types/skillCreator.ts
# 期待: packages/shared/src/types/skillCreator.ts に1件のみ存在

# root barrel も同じ型を公開していること
grep -rn "StructurePlanJson" packages/shared/index.ts

# shared からの import が存在すること
grep -rn "from.*@repo/shared/types" apps/desktop/src/main/services/skill/SkillCreatorService.ts
```

## 統合テスト連携

| 観点      | 内容                                                                  |
| --------- | --------------------------------------------------------------------- |
| AC-3 充足 | ビルドが `@repo/shared` → `@repo/desktop` の順で成功すること          |
| AC-4 充足 | `@repo/shared/types` 経由で公開され、ローカル定義が削除されていること |
| AC-5 充足 | 全テストが PASS していること                                          |

## 多角的チェック観点（AIが判断）

- **ビルドキャッシュの影響**: クリーンビルドで確認する場合は `pnpm --filter @repo/shared exec tsc --noEmit --build` を使用する
- **モノレポ全体への影響**: `packages/shared` の変更が他のパッケージに影響を与えていないか確認する

## サブタスク管理

| サブタスクID | 名称                                               | ステータス |
| ------------ | -------------------------------------------------- | ---------- |
| T-09-1       | typecheck PASS確認（@repo/shared + @repo/desktop） | skipped    |
| T-09-2       | lint PASS確認                                      | skipped    |
| T-09-3       | テスト全PASS確認                                   | skipped    |
| T-09-4       | ビルド確認（AC-3）                                 | skipped    |
| T-09-5       | Single Source of Truth確認（AC-4）                 | skipped    |
| T-09-6       | 品質保証記録作成                                   | skipped    |

## 成果物

| 成果物名                                | パス                            | 種別         |
| --------------------------------------- | ------------------------------- | ------------ |
| 品質保証記録（typecheck/lint/test結果） | `outputs/phase-9/qa-results.md` | ドキュメント |

## 完了条件

- [ ] typecheck が `@repo/shared` / `@repo/desktop` 両方で PASS していること（AC-3の前提）
- [ ] lint が PASS していること
- [ ] 全テストが PASS していること（AC-5）
- [ ] `@repo/shared` → `@repo/desktop` ビルドが成功していること（AC-3）
- [ ] ローカル定義が削除されていること（AC-4）
- [ ] `outputs/phase-9/qa-results.md` が作成されていること

## タスク100%実行確認【必須】

- [ ] typecheck PASS確認完了
- [ ] lint PASS確認完了
- [ ] テスト全PASS確認完了
- [ ] ビルド成功確認完了
- [ ] Single Source of Truth確認完了
- [ ] 品質保証記録作成完了

## 次Phase

[Phase 10: 最終レビューゲート](phase-10-final-review.md)
