# 未タスク指示書: UT-SKILL-WIZARD-DESCRIBE-STEP-DELETION-001

## メタ情報

```yaml
issue_number: 2054
task_id: UT-SKILL-WIZARD-DESCRIBE-STEP-DELETION-001
task_name: DescribeStep.tsx 物理削除
category: リファクタリング
target_feature: skill-wizard/describe-step
priority: 低
scale: 小規模
status: 未実施
task_type: NON_VISUAL
created_date: 2026-04-08
dependencies: [UT-SKILL-WIZARD-W2-seq-03b]
```

## メタ情報

| 項目       | 内容                                                                               |
| ---------- | ---------------------------------------------------------------------------------- |
| タスクID   | UT-SKILL-WIZARD-DESCRIBE-STEP-DELETION-001                                         |
| 由来       | UT-SKILL-WIZARD-W2-seq-03b Phase 12 未タスク検出レポート（物理削除は別タスク計画） |
| ステータス | unassigned                                                                         |
| 優先度     | low                                                                                |
| 作成日     | 2026-04-08                                                                         |
| 関連仕様書 | docs/30-workflows/unassigned-task/UT-SKILL-WIZARD-W2-seq-03b.md                    |

## 目的

`apps/desktop/src/renderer/components/skill/wizard/DescribeStep.tsx` を物理削除する。  
W2-seq-03b でexportは削除済み、`@deprecated` も付与済みのため、物理ファイルを安全に削除できる。

## 背景

W2-seq-03b（wizard/index.ts 最終エクスポート整理）において以下が完了している：

- `wizard/index.ts` から `DescribeStep` のエクスポートを削除済み
- `DescribeStep.tsx` に以下のJSDocを追加済み：
  ```
  @deprecated W2-seq-03b: SkillInfoStep に置き換えられました。このファイルは将来削除される予定です。
  ```
- `GenerationMode` の import 先を `GenerateStep` に変更済み

これらの準備が整っているため、本タスクで物理ファイルの削除を行う。

### 苦戦箇所（W2-seq-03b より引き継ぎ）

- **参照残留チェック必須**: `DescribeStep.tsx` は `SkillInfoStep` への参照変更（`GenerationMode` の import 先を `GenerateStep` に変更）も実施済み。削除前に参照残留がないか最終確認が必要。
- **テスト残留**: `apps/desktop/src/renderer/components/skill/__tests__/wizard-exports.test.ts` に `DescribeStep がエクスポートされていないこと` を確認するテストが存在する。このテストは削除後も有効であるため、ファイル削除後も維持すること。

## 実行タスク

1. `DescribeStep.tsx` への参照が残っていないか全量確認する
   - `import.*DescribeStep` パターンで codebase を検索
   - `from.*DescribeStep` パターンで codebase を検索
   - `wizard/index.ts` に `DescribeStep` のエクスポートが残っていないことを確認
2. `DescribeStep.tsx` を物理削除する
3. `DescribeStep` 関連のテストファイルがあれば対応する
   - `wizard-exports.test.ts` の `DescribeStep がエクスポートされていないこと` テストは**削除しない**（削除後も有効なため）
4. `pnpm typecheck` が通過することを確認する
5. `pnpm test` が通過することを確認する

## 参照資料

| 参照資料                                | パス                                                                        |
| --------------------------------------- | --------------------------------------------------------------------------- |
| DescribeStep.tsx（削除対象）            | apps/desktop/src/renderer/components/skill/wizard/DescribeStep.tsx          |
| wizard/index.ts（エクスポート整理済み） | apps/desktop/src/renderer/components/skill/wizard/index.ts                  |
| wizard-exports テスト                   | apps/desktop/src/renderer/components/skill/**tests**/wizard-exports.test.ts |
| SkillInfoStep.tsx（置き換え先）         | apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx         |
| 依存タスク仕様書                        | docs/30-workflows/unassigned-task/UT-SKILL-WIZARD-W2-seq-03b.md             |

## 受入基準

- [ ] `DescribeStep.tsx` が存在しない
- [ ] `pnpm typecheck` がエラーなく通過する
- [ ] `DescribeStep` を import している箇所がない
- [ ] `wizard-exports.test.ts` の `DescribeStep がエクスポートされていないこと` テストが維持されており、パスする

## 注意事項

- `apps/desktop/src/renderer/components/skill/__tests__/wizard-exports.test.ts` に `DescribeStep がエクスポートされていないこと` のテストがある。このテストはファイル削除後も有効なので**削除しない**。
- 依存タスク `UT-SKILL-WIZARD-W2-seq-03b` の完了を前提とする（エクスポート削除・`@deprecated` 付与が完了していること）。
- Phase 13（PR 作成）はユーザー指示まで blocked 扱い。
