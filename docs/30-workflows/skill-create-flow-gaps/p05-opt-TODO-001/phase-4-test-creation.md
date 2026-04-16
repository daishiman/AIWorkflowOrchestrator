# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| Phase      | 4                                    |
| タスクID   | TASK-SW-TODO-001                     |
| 機能名     | conversation-round-step-todo-cleanup |
| 前提Phase  | Phase 3（PASS または MINOR）         |
| 後続Phase  | Phase 5                              |
| 作成日     | 2026-04-15                           |
| ステータス | 未実施                               |

## 目的

TODOコメント整理の検証方法を確立する。本タスクはコメント変更のみのため、TDD Red 段階は静的検証（grep / 型チェック）で代替する。変更前の現状を記録し、変更後の検証手順を定義する。

## 実行タスク

- 現状確認: 変更前の TODOコメント存在を記録
- 検証手順の定義: grep コマンドによる確認手順
- 型チェック・lint の検証手順定義
- 既存テストへの影響確認
- テスト仕様書の作成

## 参照資料

| 資料名                    | パス                                                                                         | 用途               |
| ------------------------- | -------------------------------------------------------------------------------------------- | ------------------ |
| Phase 2 設計書            | `outputs/phase-2/design.md`                                                                  | 採用パターン参照   |
| Phase 3 レビュー結果      | `outputs/phase-3/gate-decision.md`                                                           | MINOR 指摘確認     |
| ConversationRoundStep.tsx | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`                | 変更対象確認       |
| 既存テスト                | `apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx` | 既存回帰テスト確認 |

## 実行手順

### 0. 事前確認: 変更前の現状記録【必須】

```bash
# TODOコメントが現状存在することを確認（変更前の baseline）
grep -n "UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001" \
  apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx

# MAIN_TOOL_BADGE_ENABLED の存在確認
grep -n "MAIN_TOOL_BADGE_ENABLED\|shouldShowMainToolBadge" \
  apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx

# 既存テストの存在確認
ls apps/desktop/src/renderer/components/skill/wizard/__tests__/
```

### 1. 本タスクにおけるテスト方針の明記【必須】

本タスクの変更はコードロジックの変更を含まず、**コメントの削除または更新のみ**である。そのため：

- ユニットテストの新規作成は不要
- 検証は以下の静的手段で行う：
  1. **grep コマンド**: TODOコメントの削除（パターンA）または更新内容（パターンB）を確認
  2. **TypeScript 型チェック**: コメント変更後も型エラーが生じないことを確認
  3. **ESLint**: コメント変更後も lint エラーが生じないことを確認
  4. **既存テストの回帰確認**: `shouldShowMainToolBadge` の動作変化がないことを既存テストで確認

### 2. 検証ケース定義

**パターンA（TODOコメント削除）の検証ケース**

| 検証ケース | 検証コマンド                                                                                                                     | 期待結果                  |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| VC-A-01    | `grep -n "UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001" apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` | 0件（コメント削除済み）   |
| VC-A-02    | `grep -n "MAIN_TOOL_BADGE_ENABLED" apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`                  | パターンA設計に応じた結果 |
| VC-A-03    | `pnpm --filter @repo/desktop typecheck`                                                                                          | PASS（型エラーなし）      |
| VC-A-04    | `pnpm --filter @repo/desktop lint`                                                                                               | 0 error                   |
| VC-A-05    | `pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx`      | 全テスト PASS             |

**パターンB（TODOコメント更新）の検証ケース**

| 検証ケース | 検証コマンド                                                                                                                             | 期待結果                       |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| VC-B-01    | `grep -n "UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001" apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`         | 0件（旧 TODO は削除済み）      |
| VC-B-02    | `grep -n "resolveExternalIntegration\|selectedOptions\[0\]" apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` | 更新後コメントに言及があること |
| VC-B-03    | `pnpm --filter @repo/desktop typecheck`                                                                                                  | PASS（型エラーなし）           |
| VC-B-04    | `pnpm --filter @repo/desktop lint`                                                                                                       | 0 error                        |
| VC-B-05    | `pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx`              | 全テスト PASS                  |

### 3. 既存テストの影響確認

```bash
# 既存テストに shouldShowMainToolBadge の直接テストが含まれているか確認
grep -n "shouldShowMainToolBadge\|isMainTool\|MAIN_TOOL_BADGE" \
  apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx

# 既存テストを変更前に全件実行してbaselineを記録
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx
```

コメント変更はロジックに影響しないため、既存テストへの修正は不要。

### 4. 「Red 確認」相当の事前状態記録

本タスクは TDD の Red 段階に相当するユニットテストがないため、変更前の状態を記録することで代替する：

- 変更前: `grep -n "UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001" ConversationRoundStep.tsx` が1件ヒット
- 変更後（パターンA）: 同 grep が0件
- 変更後（パターンB）: 同 grep が0件かつ新コメントが存在

## 統合テスト連携【必須】

| 判定項目            | 基準 | 結果 |
| ------------------- | ---- | ---- |
| 変更前baseline 記録 | 完了 | -    |
| 既存テスト影響確認  | なし | -    |

## 多角的チェック観点

| 観点             | チェック内容                                                            |
| ---------------- | ----------------------------------------------------------------------- |
| 検証網羅性       | パターンA・B それぞれの検証ケースが AC に対応しているか                 |
| 既存テスト保護   | `shouldShowMainToolBadge` の動作を検証する既存テストが保護されているか  |
| 静的検証の十分性 | grep / 型チェック / lint の組み合わせが変更の正確性を十分に担保できるか |

## 成果物

| 成果物           | パス                           | 説明                          |
| ---------------- | ------------------------------ | ----------------------------- |
| テスト検証仕様書 | `outputs/phase-4/test-spec.md` | 検証ケース定義・baseline 記録 |

## 完了条件

- [ ] 変更前の baseline（TODOコメント存在確認）が記録済み
- [ ] テスト方針（静的検証）が明記されている
- [ ] パターンA の検証ケース（VC-A-01〜05）が定義済み
- [ ] パターンB の検証ケース（VC-B-01〜05）が定義済み
- [ ] 既存テストへの影響確認が完了している
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 事前確認（TODOコメント存在・MAIN_TOOL_BADGE_ENABLED 存在・既存テスト確認）
2. テスト方針の明記（静的検証による代替）
3. 検証ケース定義（パターンA: VC-A-01〜05）
4. 検証ケース定義（パターンB: VC-B-01〜05）
5. 既存テストへの影響確認
6. baseline 記録
7. 成果物の出力

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次Phase

Phase 5: 実装
