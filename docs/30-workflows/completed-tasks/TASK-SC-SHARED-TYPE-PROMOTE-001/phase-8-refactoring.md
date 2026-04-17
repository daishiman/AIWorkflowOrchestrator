# Phase 8: リファクタリング

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 8                               |
| タスクID   | TASK-SC-SHARED-TYPE-PROMOTE-001 |
| 機能名     | shared-type-promote             |
| 前提Phase  | Phase 7                         |
| 後続Phase  | Phase 9                         |
| 作成日     | 2026-04-16                      |
| ステータス | skipped                         |

## 目的

型昇格の実装を整理し、コードの保守性を高める。
特に import パスの整合性、型定義の完全性、不要なコメントの削除を行う。

## 実行タスク

- [ ] `packages/shared/src/types/skillCreator.ts` のコードレビュー・整理
- [ ] `packages/shared/src/types/index.ts` の re-export パスの整合確認
- [ ] `SkillCreatorService.ts` の import コメント整理（不要なコメント削除）
- [ ] 全ファイルの import パス一貫性確認（`@repo/shared/types` に統一）
- [ ] リファクタリング記録の作成

## 参照資料

| 資料名                     | パス                                        | 用途                 |
| -------------------------- | ------------------------------------------- | -------------------- |
| Phase 5 実装ファイル       | `packages/shared/src/types/skillCreator.ts` | リファクタリング対象 |
| Phase 7 カバレッジレポート | `outputs/phase-7/coverage-report.md`        | テスト状態確認       |

### システム仕様（aiworkflow-requirements）

| 参照資料         | パス                                                 | 内容               |
| ---------------- | ---------------------------------------------------- | ------------------ |
| コーディング標準 | `.claude/skills/aiworkflow-requirements/references/` | コード品質基準確認 |

## 実行手順

### 1. 型定義ファイルの整理

```bash
# 型定義の確認
cat packages/shared/src/types/skillCreator.ts

# import の一貫性確認
grep -rn "StructurePlanJson" apps/ packages/
```

### 2. リファクタリングチェックリスト

| チェック項目 | 内容                                                                     | 確認 |
| ------------ | ------------------------------------------------------------------------ | ---- |
| R-1          | ローカル定義が完全に削除されているか                                     | -    |
| R-2          | import パスが一貫しているか（`@repo/shared/types` または相対パスで統一） | -    |
| R-3          | 不要なコメントが残存していないか                                         | -    |
| R-4          | 型定義のフィールドが現行コードと一致しているか                           | -    |
| R-5          | re-export の公開先が `@repo/shared/types` と一致しているか               | -    |

### 3. リファクタリング後の確認

```bash
# 型チェック
pnpm --filter @repo/shared exec tsc --noEmit
pnpm --filter @repo/desktop exec tsc --noEmit

# テスト確認
pnpm --filter @repo/shared test
pnpm --filter @repo/desktop exec vitest run src/main/services/skill/__tests__/SkillCreatorService.test.ts
```

## 統合テスト連携

| 観点                         | 内容                             |
| ---------------------------- | -------------------------------- |
| リファクタリング後の回帰なし | 全テストが引き続き PASS すること |

## 多角的チェック観点（AIが判断）

- **最小変更原則**: 型定義の移動以外の変更は最小限にとどめる
- **IPC契約ドリフト**: 型の移動が IPC ハンドラやプロセス間通信に影響しないか確認する

## サブタスク管理

| サブタスクID | 名称                           | ステータス |
| ------------ | ------------------------------ | ---------- |
| T-08-1       | 型定義ファイルのレビュー・整理 | skipped    |
| T-08-2       | import パス一貫性確認          | skipped    |
| T-08-3       | リファクタリング後テスト確認   | skipped    |
| T-08-4       | リファクタリング記録作成       | skipped    |

## 成果物

| 成果物名             | パス                                 | 種別         |
| -------------------- | ------------------------------------ | ------------ |
| リファクタリング記録 | `outputs/phase-8/refactoring-log.md` | ドキュメント |

## 完了条件

- [ ] リファクタリングチェックリスト R-1〜R-5 が全て合格していること
- [ ] リファクタリング後に全テストが PASS していること
- [ ] `outputs/phase-8/refactoring-log.md` が作成されていること

## タスク100%実行確認【必須】

- [ ] 型定義ファイルのレビュー・整理完了
- [ ] import パス一貫性確認完了
- [ ] リファクタリング後テスト PASS 確認完了
- [ ] リファクタリング記録作成完了

## 次Phase

[Phase 9: 品質保証](phase-9-quality-assurance.md)
