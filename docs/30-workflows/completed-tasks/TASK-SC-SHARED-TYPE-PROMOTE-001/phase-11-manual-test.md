# Phase 11: 手動テスト

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 11                              |
| タスクID   | TASK-SC-SHARED-TYPE-PROMOTE-001 |
| 機能名     | shared-type-promote             |
| 前提Phase  | Phase 10                        |
| 後続Phase  | Phase 12                        |
| 作成日     | 2026-04-16                      |
| ステータス | skipped                         |

## タスク種別判定

| 項目               | 判定                                   |
| ------------------ | -------------------------------------- |
| タスク種別         | NON_VISUAL（バックエンド型定義タスク） |
| UI操作確認         | N/A（UIへの影響なし）                  |
| スクリーンショット | N/A                                    |
| 手動確認内容       | 型チェック・ビルド・import確認         |

## 目的

型昇格の実装を手動で確認する。
NON_VISUALタスクのため、UIテストはなく、型チェック・ビルド・import パスの最終確認を行う。

## 実行タスク

- [ ] クリーンな環境でのビルド確認（キャッシュなし）
- [ ] `SkillCreatorService.ts` の import が `@repo/shared/types` から行われていることの最終目視確認
- [ ] `packages/shared/src/types/skillCreator.ts` に型定義が存在することの最終目視確認
- [ ] ローカル定義（`interface StructurePlanJson`）が `SkillCreatorService.ts` に残存していないことの目視確認
- [ ] `packages/shared/src/types/index.ts` に re-export が追加されていることの目視確認
- [ ] `packages/shared/index.ts` に root barrel の re-export が追加されていることの目視確認
- [ ] 手動テスト結果の記録

## 参照資料

| 資料名                             | パス                                                          | 用途         |
| ---------------------------------- | ------------------------------------------------------------- | ------------ |
| Phase 10 最終レビュー              | `outputs/phase-10/final-review.md`                            | PASS確認     |
| skillCreator.ts                    | `packages/shared/src/types/skillCreator.ts`                   | 目視確認対象 |
| SkillCreatorService.ts             | `apps/desktop/src/main/services/skill/SkillCreatorService.ts` | 目視確認対象 |
| packages/shared/src/types/index.ts | `packages/shared/src/types/index.ts`                          | 目視確認対象 |
| packages/shared/index.ts           | `packages/shared/index.ts`                                    | 目視確認対象 |

## 実行手順

### 1. 目視確認チェックリスト

```bash
# skillCreator.ts の型定義確認
cat packages/shared/src/types/skillCreator.ts

# SkillCreatorService.ts の import 確認
grep -n "StructurePlanJson\|@repo/shared/types" \
  apps/desktop/src/main/services/skill/SkillCreatorService.ts

# shared types barrel の re-export 確認
grep -n "StructurePlanJson" packages/shared/src/types/index.ts

# root barrel の re-export 確認
grep -n "StructurePlanJson" packages/shared/index.ts

# ローカル定義残存チェック（0件であること）
grep -rn "interface StructurePlanJson" apps/
```

### 2. クリーンビルド確認

```bash
# @repo/shared のクリーンビルド
pnpm --filter @repo/shared build

# @repo/desktop のクリーンビルド
pnpm --filter @repo/desktop build
```

### 3. 手動確認結果テーブル

| 確認項目                      | 期待結果                                                                              | 実際の結果 | 判定 |
| ----------------------------- | ------------------------------------------------------------------------------------- | ---------- | ---- |
| skillCreator.ts 存在          | ファイルが存在し `StructurePlanJson` が定義されている                                 | -          | -    |
| ローカル定義残存なし          | `grep` 結果が0件                                                                      | -          | -    |
| @repo/shared/types import     | `SkillCreatorService.ts` が `@repo/shared/types` からインポート                       | -          | -    |
| shared/types barrel re-export | `StructurePlanJson` が `packages/shared/src/types/index.ts` から re-export されている | -          | -    |
| root barrel re-export         | `StructurePlanJson` が `packages/shared/index.ts` から re-export されている           | -          | -    |
| ビルド成功                    | 両パッケージがエラーなくビルドされる                                                  | -          | -    |

## 統合テスト連携

NON_VISUALタスクのため、UIテストはN/Aです。
型チェック・ビルドと `@repo/shared/types` の barrel / import 整合が手動確認の主要対象です。

## 多角的チェック観点（AIが判断）

- **NON_VISUAL の判断理由**: 本タスクは `StructurePlanJson` の型定義移動のみであり、UI コンポーネントへの変更はない。型エラーが発生しない限り、アプリケーションの動作に変化なし。
- **影響範囲の最終確認**: Phase 1 棚卸し結果に記載の全ファイルで import が正しく切り替わっていることを目視確認する。

## サブタスク管理

| サブタスクID | 名称                       | ステータス |
| ------------ | -------------------------- | ---------- |
| T-11-1       | 目視確認チェックリスト実施 | skipped    |
| T-11-2       | クリーンビルド確認         | skipped    |
| T-11-3       | 手動テスト結果記録         | skipped    |

## 成果物

| 成果物名           | パス                                     | 種別         |
| ------------------ | ---------------------------------------- | ------------ |
| 手動テスト結果記録 | `outputs/phase-11/manual-test-result.md` | ドキュメント |

## 完了条件

- [ ] 全ての目視確認項目が「OK」であること
- [ ] クリーンビルドが成功していること
- [ ] `outputs/phase-11/manual-test-result.md` が作成されていること
- [ ] NON_VISUAL の判断理由が記録されていること

## タスク100%実行確認【必須】

- [ ] 目視確認チェックリスト全項目完了
- [ ] クリーンビルド確認完了
- [ ] 手動テスト結果記録作成完了

## 次Phase

[Phase 12: ドキュメント更新](phase-12-documentation.md)
