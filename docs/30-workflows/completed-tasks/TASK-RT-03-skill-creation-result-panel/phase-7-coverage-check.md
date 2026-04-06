# Phase 7: カバレッジ確認

## メタ情報

| 項目   | 値                                     |
| ------ | -------------------------------------- |
| Phase  | 7                                      |
| 機能名 | TASK-RT-03-skill-creation-result-panel |
| 作成日 | 2026-04-04                             |

## 目的

変更ファイル（`SkillCreationResultPanel.tsx`）の line/branch coverage を計測し、NFR-03（Line 80%+ / Branch 60%+）を満たしているか確認する。カバレッジ対象は変更ブロックに限定する。

## 実行タスク

- **カバレッジ計測**: `SkillCreationResultPanel.tsx` の coverage を実測
- **ブロック別カバレッジ確認**: `getOverallStatus` / wrapper の child panel 振り分け / null 分岐を確認
- **未達の場合**: Phase 6 へ戻り追加テストを作成

## 実行手順

### ステップ 1: カバレッジ計測

```bash
# SkillCreationResultPanel のカバレッジを計測
pnpm --filter @repo/desktop exec vitest run \
  --coverage \
  --coverage.include="src/renderer/components/skill/SkillCreationResultPanel.tsx" \
  src/renderer/components/skill/SkillCreationResultPanel.test.tsx
```

### ステップ 2: カバレッジ目標確認

**対象ファイル**: `SkillCreationResultPanel.tsx`（変更ファイルのみ）

| 対象ブロック                    | Line Coverage 目標 | Branch Coverage 目標  |
| ------------------------------- | ------------------ | --------------------- |
| `getOverallStatus()` 関数       | 100%               | 100%（6パターン全て） |
| wrapper の child panel 振り分け | 90%+               | 80%+                  |
| 全体                            | **80%+**           | **60%+**              |

**特に重要**: `getOverallStatus` の branch coverage は6パターン全て（TC-08/TC-11/TC-20/TC-21/TC-22 等）でカバーされていること。

### ステップ 3: 実測値記録

```markdown
## カバレッジ実測値（Phase 7 完了時に記録）

| ファイル                     | Line Coverage | Branch Coverage | Function Coverage |
| ---------------------------- | ------------- | --------------- | ----------------- |
| SkillCreationResultPanel.tsx | TBD%          | TBD%            | TBD%              |

### getOverallStatus() の branch カバレッジ

| パターン           | TC       | カバー済み |
| ------------------ | -------- | ---------- |
| planResult=null    | TC-21    | TBD        |
| executeResult=null | TC-20    | TBD        |
| success=false      | TC-06/07 | TBD        |
| verifyDetail=null  | TC-04/05 | TBD        |
| status="pending"   | TC-22    | TBD        |
| status="fail"      | TC-11    | TBD        |
| status="pass"      | TC-08    | TBD        |
```

### ステップ 4: 未達の場合の対処

カバレッジが目標未達の場合は Phase 6 へ戻り、未カバーのブランチに対応するテストケースを追加する。

```bash
# 未カバーブランチの確認（coverage report から特定）
pnpm --filter @repo/desktop exec vitest run --reporter=verbose \
  --coverage --coverage.reporter=text-summary \
  src/renderer/components/skill/SkillCreationResultPanel.test.tsx
```

## 統合テスト連携【必須】

| 判定項目                                        | 基準 | 結果 |
| ----------------------------------------------- | ---- | ---- |
| Line Coverage（SkillCreationResultPanel.tsx）   | 80%+ | TBD  |
| Branch Coverage（SkillCreationResultPanel.tsx） | 60%+ | TBD  |
| Function Coverage                               | 80%+ | TBD  |
| `getOverallStatus` branch 100%                  | 6/6  | TBD  |

## 成果物

| 成果物             | パス                                 | 説明                         |
| ------------------ | ------------------------------------ | ---------------------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | 実測値・ブロック別カバレッジ |

## 完了条件

- [ ] `SkillCreationResultPanel.tsx` の Line Coverage が 80%+ 達成
- [ ] `SkillCreationResultPanel.tsx` の Branch Coverage が 60%+ 達成
- [ ] `getOverallStatus` の branch coverage が 6パターン全てカバー（100%）
- [ ] カバレッジ実測値が `outputs/phase-7/coverage-report.md` に記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 8: リファクタリング
