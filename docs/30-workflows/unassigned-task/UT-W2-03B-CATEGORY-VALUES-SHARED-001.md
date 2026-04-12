# 未タスク指示書: UT-W2-03B-CATEGORY-VALUES-SHARED-001

## メタ情報

```yaml
issue_number: 2096
task_id: UT-W2-03B-CATEGORY-VALUES-SHARED-001
task_name: CATEGORY_VALUES 共有定数化（SkillInfoStep / DescribeStep drift 解消）
category: リファクタリング
target_feature: skill-wizard/category-constants
priority: 低
scale: 小規模
status: 未実施
created_date: 2026-04-11
dependencies: [UT-SKILL-WIZARD-W2-seq-03b]
```

## メタ情報

| 項目       | 内容                                                             |
| ---------- | ---------------------------------------------------------------- |
| タスクID   | UT-W2-03B-CATEGORY-VALUES-SHARED-001                             |
| 由来       | UT-SKILL-WIZARD-W2-seq-03b Phase 12 スキルフィードバックレポート |
| ステータス | 未実施                                                           |
| 優先度     | 低                                                               |
| 作成日     | 2026-04-11                                                       |
| 関連仕様書 | `outputs/phase-12/skill-feedback-report.md`                      |

## 目的

`SkillInfoStep.tsx` と `DescribeStep.tsx` でそれぞれ保持している `CATEGORY_VALUES` 定数（カテゴリ順序定数）を1箇所に集約し、2コンポーネント間の順序 drift リスクを解消する。

## 背景

W2-seq-03b の Phase 12 スキルフィードバックにて以下の改善候補が記録された。

> UI 実装: `CATEGORY_VALUES` を 2 コンポーネントで持たず、順序定数を shared 化するとさらに drift を減らせる（優先度: 低）

現状、`SkillInfoStep.tsx` と `DescribeStep.tsx` はそれぞれ独自の `CATEGORY_VALUES` を定義しており、どちらかが変更されたとき片方が追随しないリスクがある。`SKILL_CATEGORY_LABELS` は `skillCreator.ts` に集約済みだが、順序を規定する配列定数が分散している。

### 苦戦箇所（W2-seq-03b より引き継ぎ）

- `DescribeStep.tsx` は deprecated 状態だが互換維持のために残置中。このコンポーネントが残存する間は CATEGORY_VALUES の2重管理も継続する
- `SkillInfoStep` が canonical になった後、`DescribeStep` 側の定数が更新されないまま放置されるケースが起きやすい
- shared 化の配置先（`packages/shared/` vs `apps/desktop/` 内の定数ファイル）の判断が必要

## 実行タスク

1. `SkillInfoStep.tsx` と `DescribeStep.tsx` の CATEGORY_VALUES 定義を比較し、内容の差異を確認する
2. 共有定数の配置先を決定する（候補: `packages/shared/src/constants/skillCategory.ts` または `apps/desktop/src/renderer/constants/`）
3. 共有定数ファイルを作成し、CATEGORY_VALUES を1箇所に定義する
4. `SkillInfoStep.tsx` を共有定数から import するよう変更する
5. `DescribeStep.tsx`（deprecated）を共有定数から import するよう変更する
6. 既存テストが引き続きパスすることを確認する（`pnpm --filter @repo/desktop test`）
7. `pnpm typecheck` がエラーなく通過することを確認する

## 参照資料

| 参照資料                                         | パス                                                                          |
| ------------------------------------------------ | ----------------------------------------------------------------------------- |
| Phase 12 スキルフィードバックレポート            | `outputs/phase-12/skill-feedback-report.md`                                   |
| SkillInfoStep.tsx                                | `apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx`         |
| DescribeStep.tsx（deprecated）                   | `apps/desktop/src/renderer/components/skill/wizard/DescribeStep.tsx`          |
| skillCreator.ts（SKILL_CATEGORY_LABELS集約済み） | `packages/shared/src/types/skillCreator.ts`                                   |
| wizard-exports テスト                            | `apps/desktop/src/renderer/components/skill/__tests__/wizard-exports.test.ts` |

## 受入基準

- [ ] `CATEGORY_VALUES` が1ファイルのみに定義されている
- [ ] `SkillInfoStep.tsx` と `DescribeStep.tsx` が共有定数を import している
- [ ] `pnpm --filter @repo/desktop test` がエラーなく通過する
- [ ] `pnpm typecheck` がエラーなく通過する
- [ ] 既存の UI 表示に変化がない（カテゴリ順序が維持されている）

## 注意事項

- **実施タイミング**: `DescribeStep.tsx` が deprecated のまま残存する間は本タスクの優先度は低い。deprecated 削除タスクと同時実施も検討すること
- **コミット・PR禁止**: ユーザー指示があるまで git commit / push は実施しないこと
- `DescribeStep.tsx` の最終削除は本タスクのスコープ外。削除は依存切替完了後に別タスクで実施する
